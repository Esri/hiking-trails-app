/* main application */

import '../style/reset.scss';
import '../style/style.scss';

import State from './State';
import SceneElement from './scene/SceneElement';
import LoadingPage from './ui/LoadingPage';
import DataStore from './data/DataStore';
import MenuPanel from './ui/MenuPanel';



let state = new State();
let loadingPage = new LoadingPage(state);
let sceneElement = new SceneElement(state);
sceneElement.getZEnrichedTrails()
  .then((features) => {
    let dataStore = new DataStore(features);
    const trails = dataStore.trailFeatures;
    let menuPanel = new MenuPanel(trails, state);
  });




