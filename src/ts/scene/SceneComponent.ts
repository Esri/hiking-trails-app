import config from '../config';
import { getTrailRenderer, getLabelingInfo, getUniqueValueInfos } from './utils';

import * as WebScene from 'esri/WebScene';
import * as SceneView from 'esri/views/SceneView';
import * as FeatureLayer from 'esri/layers/FeatureLayer';
import * as UniqueValueRenderer from 'esri/renderers/UniqueValueRenderer';
import * as esriConfig from 'esri/config';

import '../../style/scene-panel.scss';

export default class SceneComponent {

  view: SceneView;
  trailsLayer: FeatureLayer;

  constructor() {

    config.scene.corsServers.forEach((server) => {
      esriConfig.request.corsEnabledServers.push(server);
    });

    this.view = this.initView();

    this.trailsLayer = this.initTrailsLayer();
    this.view.map.add(this.trailsLayer);

    //adding view to the window only for debugging reasons
    (<any>window).view = this.view;

  }

  private initView() {

    let webscene = new WebScene({
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
      }
    });

  }

  private initTrailsLayer() {
    return new FeatureLayer({
      url: config.data.trailsServiceUrl,
      title: "Hiking trails",
      outFields: ["*"],
      renderer: getTrailRenderer(),
      labelsVisible: true,
      labelingInfo: getLabelingInfo({})

    });
  }

  private selectFeature(featureId):void {

    // change line symbology for the selected feature
    let renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = getUniqueValueInfos({ selection: featureId });
    this.trailsLayer.renderer = renderer;

    // change labeling for the selected feature
    this.trailsLayer.labelingInfo = getLabelingInfo({selection: featureId});
  }

  private unselectFeature():void {
    let renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;
    this.trailsLayer.labelingInfo = getLabelingInfo({selection: null});
  }

}
