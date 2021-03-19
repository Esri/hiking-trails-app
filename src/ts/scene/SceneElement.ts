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

import config from "../config";
import { getTrailRenderer, getLabelingInfo, getUniqueValueInfos } from "./utils";


import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as GroupLayer from "esri/layers/GroupLayer";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as NavigationToggle from "esri/widgets/NavigationToggle";
import * as Zoom from "esri/widgets/Zoom";
import * as Compass from "esri/widgets/Compass";

import "../../style/scene-panel.scss";

import { State } from "../types";

export default class SceneElement {

  state: State;
  view: SceneView;
  trailsLayer: FeatureLayer;
  trails: Array<any>;

  constructor(state: State) {

    this.state = state;
    this.view = this.initView();
    this.state.view = this.view;
    this.setViewPadding();

    this.trailsLayer = this.initTrailsLayer();
    this.view.when(() => {
      this.view.map.add(this.trailsLayer);
    });

    this.view.on("click", (event) => {
      this.onViewClick(event);
    });

    //adding view to the window only for debugging reasons
    (<any> window).view = this.view;

    state.watch("selectedTrailId", (value, oldValue) => {

      if (oldValue) {
        this.unselectFeature();
      }
      if (value) {
        this.selectFeature(value);
      }

    });

    state.watch("filteredTrailIds", (trailIds: Array<number>) => {

      // before filtering go to the initial extent
      // to see which layers are filtered
      if (this.view.map instanceof WebScene) {
        this.view.goTo(this.view.map.initialViewProperties.viewpoint);
      }

      // remove filters
      if (trailIds.length === 0) {
        this.trailsLayer.definitionExpression = "1=0";
      }
      // set definitionExpression to display only filtered buildings
      else {
        const query = trailIds.map(function(id) {
          return `${config.data.trailAttributes.id} = ${id}`;
        });
        this.trailsLayer.definitionExpression = query.join(" OR ");
      }

    });

    state.watch("device", () => {
      this.setViewPadding();
    });

    state.watch("currentBasemapId", (id) => {
      this.setCurrentBasemap(id);
    });
  }

  private initView() {

    const webscene = new WebScene({
      portalItem: {
        id: config.scene.websceneItemId
      }
    });

    const view = new SceneView({
      container: "scenePanel",
      map: webscene,
      constraints: {
        tilt: {
          max: 80,
          mode: "manual"
        }
      },
      qualityProfile: "high",
      environment: {
        lighting: {
          directShadowsEnabled: true,
          ambientOcclusionEnabled: true
        },
        atmosphereEnabled: true,
        atmosphere: {
          quality: "high"
        },
        starsEnabled: false
      },
      ui: {
        components: ["attribution"]
      },
      popup: {
        dockEnabled: false,
        collapsed: true
      }
    });

    const navigationToggle = new NavigationToggle({
      view: view
    });

    const zoom = new Zoom({
      view: view
    });

    const compass = new Compass({
      view: view
    });

    view.ui.add([zoom, navigationToggle, compass], "top-right");
    return view;

  }

  private setViewPadding() {
    console.log(this.state.device);
    if (this.state.device === "mobilePortrait") {
      this.view.padding = {
        top: 30,
        left: 0
      };
    }
    else {
      this.view.padding = {
        top: 30,
        left: 350
      };
    }
  }

  private initTrailsLayer() {
    return new FeatureLayer({
      url: config.data.trailsServiceUrl,
      title: "Hiking trails",
      outFields: ["*"],
      renderer: getTrailRenderer(),
      elevationInfo: {
        mode: "on-the-ground"
      },
      labelsVisible: true,
      popupEnabled: false,
      labelingInfo: getLabelingInfo({ selection: null })
    });
  }

  private setCurrentBasemap(id) {
    const basemapGroup = <GroupLayer> this.view.map.layers.filter((layer) => {
      return (layer.title === "Basemap");
    }).getItemAt(0);

    const activeLayer = basemapGroup.layers.filter((layer) => {
      if (layer.id === id) {
        return true;
      }
      return false;
    }).getItemAt(0);

    activeLayer.visible = true;

  }

  private onViewClick(event) {

    // check if the user is online
    if (this.state.online) {
      this.view.hitTest(event, {include: this.trailsLayer})
        .then((response) => {
          const result = response.results[0];
          // if a graphic was picked from the view
          if (result && result.graphic) {
              this.state.setSelectedTrail(result.graphic.attributes[config.data.trailAttributes.id]);
          } else {
            this.state.setSelectedTrail(null);
          }
      });
    }
  }

  private selectFeature(featureId): void {

    const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = getUniqueValueInfos({ selection: featureId });
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: featureId });

    this.view.goTo(
      { target: this.state.selectedTrail.geometry, tilt: 60 },
      { speedFactor: 0.5 }
    );

  }

  private unselectFeature(): void {

    const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: null });

  }


}
