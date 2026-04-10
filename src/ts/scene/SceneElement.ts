/* Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import SceneView from "@arcgis/core/views/SceneView";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import config from "../config";
import { State } from "../types";
import "../../style/scene-panel.scss";

export default class SceneElement {
  state: State;
  view: SceneView;
  trailsLayer: any;
  trails: Array<any>;
  sceneElement: any;
  ready: Promise<SceneView>;
  private initialized = false;

  constructor(state: State) {
    this.state = state;
    this.ready = this.initScene();

    reactiveUtils.watch(() => state.selectedTrailId, (value, oldValue) => {
      if (!this.view) {
        return;
      }
      if (oldValue) {
        this.unselectFeature();
      }
      if (value) {
        this.selectFeature(value);
      }
    });

    reactiveUtils.watch(() => state.filteredTrailIds, (trailIds: Array<number>) => {
      if (!this.view) {
        return;
      }

      const map = this.view.map as any;
      // before filtering go to the initial extent
      // to see which layers are filtered
      if (map?.initialViewProperties?.viewpoint) {
        this.view.goTo(map.initialViewProperties.viewpoint);
      }

      const hasConfiguredFilters = Object.keys(this.state.filters).length > 0;

      // remove filters
      if (trailIds.length === 0) {
        this.trailsLayer.definitionExpression = hasConfiguredFilters
          ? "1=0"
          : "1=1";
      }
      // set definitionExpression to display only filtered buildings
      else {
        const query = trailIds.map(function (id) {
          return `${config.data.trailAttributes.id} = ${id}`;
        });
        this.trailsLayer.definitionExpression = query.join(" OR ");
      }
    });

  }

  private initScene(): Promise<SceneView> {
    this.sceneElement = document.querySelector("arcgis-scene#viewElement") as any;
    if (!this.sceneElement) {
      return Promise.reject(new Error("Scene element #viewElement not found"));
    }

    if (!this.sceneElement.getAttribute("item-id")) {
      this.sceneElement.setAttribute("item-id", config.scene.websceneItemId);
    }

    return new Promise((resolve) => {
      const onViewReady = async () => {
        this.view = this.sceneElement.view;
        this.state.view = this.view;

        if (this.initialized) {
          resolve(this.view);
          return;
        }

        this.initialized = true;

        if (!this.trailsLayer) {
          this.trailsLayer = await this.createTrailsLayer();
        }

        if (!this.view.map.layers.includes(this.trailsLayer)) {
          this.view.map.add(this.trailsLayer);
        }

        this.view.on("click", (event) => {
          this.onViewClick(event);
        });

        // adding view to the window only for debugging reasons
        (<any>window).view = this.view;
        resolve(this.view);
      };

      this.sceneElement.addEventListener("arcgisViewReadyChange", onViewReady, {
        once: true,
      });

      if (this.sceneElement.view) {
        onViewReady();
      }
    });
  }

  private async createTrailsLayer() {
    const arcgis = (window as any).$arcgis;
    if (!arcgis?.import) {
      throw new Error("ArcGIS components runtime ($arcgis.import) is not available");
    }

    const [FeatureLayer] = await arcgis.import([
      "@arcgis/core/layers/FeatureLayer.js",
    ]);

    return new FeatureLayer({
      url: config.data.trailsServiceUrl,
      title: "Hiking trails",
      outFields: ["*"],
      renderer: this.getTrailRenderer(),
      elevationInfo: {
        mode: "on-the-ground",
      },
      labelsVisible: true,
      popupEnabled: false,
      labelingInfo: this.getLabelingInfo(null),
    });
  }

  private onViewClick(event) {
    // check if the user is online
    this.view
      .hitTest(event, { include: this.trailsLayer })
      .then((response) => {
        const result = response.results[0];
        // if a graphic was picked from the view
        if (result?.type === "graphic" && result.graphic) {
          this.state.setSelectedTrail(
            result.graphic.attributes[config.data.trailAttributes.id]
          );
        } else {
          this.state.setSelectedTrail(null);
        }
      });
  }

  private async selectFeature(featureId): Promise<void> {
    if (!this.view || !this.trailsLayer) {
      return;
    }

    const renderer = this.trailsLayer.renderer.clone();
    renderer.uniqueValueInfos = this.getUniqueValueInfos(featureId);
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = this.getLabelingInfo(featureId);

    const query = this.trailsLayer.createQuery();
    query.where = `${config.data.trailAttributes.id} = ${featureId}`;
    query.returnGeometry = true;
    query.num = 1;

    const queryResult = await this.trailsLayer.queryFeatures(query);
    const selectedGeometry =
      queryResult?.features?.[0]?.geometry ?? this.state.selectedTrail?.geometry;

    if (!selectedGeometry) {
      return;
    }

    const target = selectedGeometry.extent
      ? selectedGeometry.extent.expand(2)
      : selectedGeometry;

    this.view.goTo(
      { target, tilt: 60 },
      { speedFactor: 0.5 }
    );
  }

  private unselectFeature(): void {
    if (!this.view || !this.trailsLayer) {
      return;
    }

    const renderer = this.trailsLayer.renderer.clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = this.getLabelingInfo(null);
  }

  private getTrailRenderer() {
    return {
      type: "unique-value",
      field: config.data.trailAttributes.id,
      defaultSymbol: this.createTrailSymbol(null),
      uniqueValueInfos: [],
    };
  }

  private createTrailSymbol(selection: number | null) {
    const color = selection
      ? config.colors.selectedTrail
      : config.colors.defaultTrail;

    return {
      type: "line-3d",
      symbolLayers: [
        {
          type: "line",
          material: {
            color,
          },
          size: 2,
        },
      ],
    };
  }

  private getUniqueValueInfos(selection: number) {
    if (!selection) {
      return [];
    }

    return [
      {
        value: selection,
        symbol: this.createTrailSymbol(selection),
      },
    ];
  }

  private getLabelingInfo(selection: number | null) {
    if (selection) {
      return [this.createLabelClass(selection), this.createLabelClass(null)];
    }

    return [this.createLabelClass(null)];
  }

  private createLabelClass(selection: number | null) {
    const color = selection
      ? config.colors.selectedTrail
      : config.colors.defaultTrail;

    const labelClass: any = {
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: `$feature.${config.data.trailAttributes.name}`,
      },
      symbol: {
        type: "label-3d",
        symbolLayers: [
          {
            type: "text",
            material: {
              color: "white",
            },
            halo: {
              color,
              size: 1,
            },
            font: {
              family: "Open Sans Condensed",
              weight: "bold",
            },
            size: 13,
          },
        ],
        verticalOffset: {
          screenLength: 40,
          maxWorldLength: 2000,
          minWorldLength: 500,
        },
        callout: {
          type: "line",
          size: 1,
          color: "white",
          border: {
            color,
          },
        },
      },
    };

    if (selection) {
      labelClass.where = `${config.data.trailAttributes.id} = ${selection}`;
    }

    return labelClass;
  }
}
