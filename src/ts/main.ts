/* main application */

import '../style/style.scss';


import State from './State';
import SceneElement from './scene/SceneElement';
import LoadingPage from './ui/LoadingPage';
import DataStore from './data/DataStore';
import SelectionPanel from './ui/SelectionPanel';

let state = new State();
let loadingPage = new LoadingPage(state);
let sceneEl = new SceneElement(state);
sceneEl.getZEnrichedTrails()
  .then((features) => {
    let dataStore = new DataStore(features);
    let selectionPanel = new SelectionPanel(dataStore.trailFeatures, state);
  });




