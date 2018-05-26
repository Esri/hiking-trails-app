import config from "../config";
import { getTrailRenderer, getLabelingInfo, getUniqueValueInfos } from "./utils";

import * as domConstruct from "dojo/dom-construct";
import * as dom from "dojo/dom";
import * as on from "dojo/on";

import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as Query from "esri/tasks/support/Query";
import * as GroupLayer from "esri/layers/GroupLayer";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as NavigationToggle from "esri/widgets/NavigationToggle";
import * as Zoom from "esri/widgets/Zoom";
import * as Compass from "esri/widgets/Compass";
import * as all from "dojo/promise/all";
import * as esriConfig from "esri/config";
import * as watchUtils from "esri/core/watchUtils";

import "../../style/scene-panel.scss";

import { State } from "../types";

esriConfig.request.corsEnabledServers.push("wtb.maptiles.arcgis.com");

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
        this.unselectFeature(oldValue);
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
      this.showLoadingIcon(event);
      this.view.hitTest(event)
        .then((response) => {
          const result = response.results[0];
          // if a graphic was picked from the view
          if (result.graphic) {
            if (result.graphic.layer.title === "Flickr") {
              this.removeLoadingIcon();
              this.showImage(result.graphic, event);
            }
            else {
              this.removeLoadingIcon();
              if (result.graphic.layer.title === "Hiking trails") {
                this.state.setSelectedTrailId(result.graphic.attributes[config.data.trailAttributes.id]);
              }
            }
          }
          // otherwise check if server side there is a graphic that was draped
          else {
            const query = this.trailsLayer.createQuery();
            query.geometry = result.mapPoint;
            query.distance = 200;
            query.units = "meters";
            query.spatialRelationship = "intersects";
            this.trailsLayer.queryFeatures(query)
              .then((results) => {
                if (results.features.length > 0) {
                  this.state.setSelectedTrailId(results.features[0].attributes[config.data.trailAttributes.id]);
                } else {
                  this.state.setSelectedTrailId(null);
                }
                this.removeLoadingIcon();
              })
              .catch(err => console.log(err));
          }
      });
    }
  }

  private showLoadingIcon(event) {
    domConstruct.create("span", {
      class: "fa fa-spinner fa-spin",
      id: "loadingIcon",
      style: {
        position: "absolute",
        fontSize: "30px",
        top: `${event.screenPoint.y - 15}px`,
        left: `${event.screenPoint.x - 15}px`
      }
    }, document.body);
  }

  private removeLoadingIcon() {
    domConstruct.destroy("loadingIcon");
  }

  private showImage(graphic, event) {

    // remove previous image (if any)
    this.removeImage();

    const flickrContainer = domConstruct.create("div", {
      innerHTML: `<img id="flickrImage" src="${graphic.attributes.image}"
        style="left: ${event.screenPoint.x - 25}px; top: ${event.screenPoint.y - 25}px;">`,
      id: "flickrContainer"
    }, document.body);

    const flickrImage = dom.byId("flickrImage");

    window.setTimeout(() => {
      flickrImage.style.top = "50%";
      flickrImage.style.left = "50%";
      flickrImage.style.transform = "translate(-50%, -50%)";
    }, 0);

    window.setTimeout(() => {
      flickrImage.style.maxWidth = "90%";
    }, 200);

    on(flickrContainer, "click", () => {
      this.removeImage();
    });

  }

  private removeImage() {
    if (dom.byId("flickrContainer")) {
      domConstruct.destroy("flickrContainer");
    }
  }

  private selectFeature(featureId): void {

    const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = getUniqueValueInfos({ selection: featureId });
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: featureId });

    const selectedTrail = this.state.trails.filter((trail) => {
      return (trail.id === featureId);
    })[0];

    this.view.goTo(
      { target: selectedTrail.geometry, tilt: 60 },
      { speedFactor: 0.5 }
    );

   if (selectedTrail.flickrLayer) {
    this.view.map.add(selectedTrail.flickrLayer);
   } else {
    if (this.state.online) {
      selectedTrail.setElevationValuesFromService()
        .then(() => {
          if (config.flickrApiKey) {
            selectedTrail.createFlickrLayer()
            .then(() => {
              this.view.map.add(selectedTrail.flickrLayer);
            });
          }
        });
    }
   }

  }

  private unselectFeature(oldId): void {

    const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: null });

    const selectedTrail = this.state.trails.filter((trail) => {
      return (trail.id === oldId);
    })[0];

    if (config.flickrApiKey) {
      this.removeFlickrLayers();
    }
    this.removeImage();
  }

  private removeFlickrLayers() {
    this.view.map.layers.forEach((layer) => {
      if (layer.title === "Flickr") {
        this.view.map.remove(layer);
      }
    });
  }


}
