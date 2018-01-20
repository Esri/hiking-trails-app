import config from '../config';
import { getTrailRenderer, getLabelingInfo, getUniqueValueInfos } from './utils';

import * as WebScene from 'esri/WebScene';
import * as SceneView from 'esri/views/SceneView';
import * as FeatureLayer from 'esri/layers/FeatureLayer';
import * as Query from 'esri/tasks/support/Query';
import * as UniqueValueRenderer from 'esri/renderers/UniqueValueRenderer';
import * as esriConfig from 'esri/config';

import * as all from 'dojo/promise/all';

import '../../style/scene-panel.scss';

import { State } from '../types';

export default class SceneElement {

  view: SceneView;
  trailsLayer: FeatureLayer;
  trails: Array<any>;
  state: State;

  constructor(state: State) {

    config.scene.corsServers.forEach((server) => {
      esriConfig.request.corsEnabledServers.push(server);
    });

    // set state on the scene element and listen to changes on the state
    this.state = state;

    this.view = this.initView();
    this.state.view = this.view;
    this.setViewPadding();

    this.trailsLayer = this.initTrailsLayer();
    this.view.map.add(this.trailsLayer);

    this.addEventListeners();

    //adding view to the window only for debugging reasons
    (<any>window).view = this.view;

    state.watch('selectedTrailId', (value) => {
      if (value) {
        this.selectFeature(value);
      }
      else {
        this.unselectFeature();
      }
    });

    state.watch('filteredTrailIds', (value) => {
      // filter trails on the map
    });

    state.watch('device', () => {
      this.setViewPadding();
    });
  }

  private addEventListeners() {
    this.view.on("click", (event) => {
      this.view.hitTest(event).then((response) => {
        var result = response.results[0];
        if (result.graphic) {
          this.state.setSelectedTrailId(result.graphic.attributes.RouteId);
        }
        else {
          this.state.setSelectedTrailId(null);
        }
      });
    });
  }

  private initView() {

    const webscene = new WebScene({
      portalItem: {
        id: config.scene.websceneItemId
      }
    });

    return new SceneView({
      container: 'scenePanel',
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
        components: ['attribution']
      },
      popup: {
        dockEnabled: false,
        collapsed: true
      }
    });

  }

  private setViewPadding() {
    if (this.state.device === 'mobilePortrait') {
      this.view.padding = {
        bottom: 200
      }
    }
    else {
      this.view.padding = {
        left: 350
      }
    }
  }

  private initTrailsLayer() {
    return new FeatureLayer({
      url: config.data.trailsServiceUrl,
      title: "Hiking trails",
      outFields: ["*"],
      renderer: getTrailRenderer(),
      elevationInfo: {
        mode: 'relative-to-ground',
        offset: 50
      },
      labelsVisible: true,
      labelingInfo: getLabelingInfo({ selection: null })
    });
  }

  private selectFeature(featureId):void {

    // change line symbology for the selected feature
    let renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = getUniqueValueInfos({ selection: featureId });
    this.trailsLayer.renderer = renderer;

    // change labeling for the selected feature
    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: featureId });

    // get trail geometry to zoom to it
    const selectedTrail = this.trails.filter((trail) => {
      return (trail.attributes[config.data.trailAttributes.id] === featureId);
    })[0];
    this.view.goTo(
      {target: selectedTrail.geometry, tilt: 60},
      {speedFactor: 0.5}
    );
  }

  private unselectFeature():void {
    let renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;
    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: null });
  }

  public queryTrails():IPromise {
    const layer:FeatureLayer = this.trailsLayer;
    const query = new Query({
      outFields: ["*"],
      where: "1=1",
      returnGeometry: true,
      outSpatialReference: {
        wkid: 4326
      }
    });
    return layer.then(() => {
      return layer.queryFeatures(query);
    });
  }

  public getZEnrichedTrails():IPromise {

    const view = this.view;

    return this.queryTrails().then((result) => {

      this.trails = result.features;

      // for each feature query the z values of the geometry
      let promises = result.features.map((feat) => {
        return view.map.ground.queryElevation(feat.geometry)
          .then((response) => {
            feat.geometry = response.geometry;
            return feat;
          });
      });

      return all(promises);
    });
  }

}
