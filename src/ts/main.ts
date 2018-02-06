/* main application */

import '../style/reset.scss';
import '../style/style.scss';

import esriConfig = require('esri/config');

esriConfig.request.useIdentity = false;

import State from './State';
import deviceUtils from './ui/deviceUtils';
import SceneElement from './scene/SceneElement';
import LoadingPage from './ui/LoadingPage';
import Trail from './data/Trail';
import MenuPanel from './ui/MenuPanel';

import * as runtime from "serviceworker-webpack-plugin/lib/runtime";

if ("serviceWorker" in navigator) {
  runtime.register();
}

let state = new State();
deviceUtils.init(state);
let loadingPage = new LoadingPage(state);
let sceneElement = new SceneElement(state);
sceneElement.getZEnrichedTrails()
  .then((features) => {
    state.trails = features.map((feature) => {
      return new Trail(feature);
    });
    let menuPanel = new MenuPanel(state.trails, state);
  });




