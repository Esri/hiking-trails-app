/* Copyright 2026 Esri
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
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type WebScene from "@arcgis/core/WebScene";
import type { UniqueValueRendererProperties } from "@arcgis/core/renderers/UniqueValueRenderer";
import type { UniqueValueInfoProperties } from "@arcgis/core/renderers/support/UniqueValueInfo";
import type { LabelClassProperties } from "@arcgis/core/layers/support/LabelClass";
import type { LineSymbol3DProperties } from "@arcgis/core/symbols/LineSymbol3D";
import type { ClickEvent } from "@arcgis/core/views/input/types";
import config from "../config";
import { State } from "../types";

export default class SceneElement {
  state: State;
  view!: SceneView;
  trailsLayer!: FeatureLayer;
  sceneElement!: HTMLArcgisSceneElement;
  ready: Promise<SceneView>;
  private initialized = false;

  constructor(state: State) {
    this.state = state;
    this.ready = this.initScene();

    reactiveUtils.watch(() => state.selectedTrailId, (value, oldValue) => {
      if (!this.view) {
        return;
      }
      if (oldValue !== null) {
        this.unselectFeature();
      }
      if (value !== null) {
        this.selectFeature(value);
      }
    });

    reactiveUtils.watch(() => state.filteredTrailIds, (trailIds: Array<number>) => {
      if (!this.view) {
        return;
      }

      const map = this.view.map as WebScene;
      const initialViewpoint = map.initialViewProperties?.viewpoint;
      // before filtering go to the initial extent
      // to see which layers are filtered
      if (initialViewpoint) {
        this.view.goTo(initialViewpoint);
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
    const sceneElement = document.querySelector<HTMLArcgisSceneElement>("arcgis-scene#viewElement");

    if (!sceneElement) {
      return Promise.reject(new Error("Scene element #viewElement not found"));
    }

    this.sceneElement = sceneElement;

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

        const map = this.view.map;
        if (map && !map.layers.includes(this.trailsLayer)) {
          map.add(this.trailsLayer);
        }

        this.view.on("click", (event) => {
          this.onViewClick(event);
        });

        // adding view to the window only for debugging reasons
        (window as Window & { view?: SceneView }).view = this.view;
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

  private async createTrailsLayer(): Promise<FeatureLayer> {
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

  private async onViewClick(event: ClickEvent): Promise<void> {
    // check if the user is online
    const response = await this.view.hitTest(event, { include: this.trailsLayer });
    const result = response.results[0];
    // if a graphic was picked from the view
    if (result?.type === "graphic" && result.graphic) {
      this.state.setSelectedTrail(
        result.graphic.attributes[config.data.trailAttributes.id]
      );
    } else {
      this.state.setSelectedTrail(null);
    }
  }

  private async selectFeature(featureId: number): Promise<void> {
    if (!this.view || !this.trailsLayer) {
      return;
    }

    const existingRenderer = this.trailsLayer.renderer;
    if (!existingRenderer || existingRenderer.type !== "unique-value") {
      return;
    }

    const renderer = existingRenderer.clone();
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
      ? selectedGeometry.extent.expand(1.5)
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

    const existingRenderer = this.trailsLayer.renderer;
    if (!existingRenderer || existingRenderer.type !== "unique-value") {
      return;
    }

    const renderer = existingRenderer.clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = this.getLabelingInfo(null);
  }

  private getTrailRenderer(): UniqueValueRendererProperties & { type: "unique-value" } {
    return {
      type: "unique-value",
      field: config.data.trailAttributes.id,
      defaultSymbol: this.createTrailSymbol(null),
      uniqueValueInfos: [],
    };
  }

  private createTrailSymbol(selection: number | null): LineSymbol3DProperties & { type: "line-3d" } {
    const color = selection !== null
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

  private getUniqueValueInfos(selection: number | null): UniqueValueInfoProperties[] {
    if (selection === null) {
      return [];
    }

    return [
      {
        value: selection,
        symbol: this.createTrailSymbol(selection),
      },
    ];
  }

  private getLabelingInfo(selection: number | null): LabelClassProperties[] {
    if (selection !== null) {
      return [this.createLabelClass(selection), this.createLabelClass(null)];
    }

    return [this.createLabelClass(null)];
  }

  private createLabelClass(selection: number | null): LabelClassProperties {
    const color = selection !== null
      ? config.colors.selectedTrail
      : config.colors.defaultTrail;

    const labelClass: LabelClassProperties = {
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

    if (selection !== null) {
      labelClass.where = `${config.data.trailAttributes.id} = ${selection}`;
    }

    return labelClass;
  }
}
