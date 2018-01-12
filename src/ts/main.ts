/* main application */

import '../style/style.scss';


import State from './State';
import SceneElement from './scene/SceneElement';
import LoadingPage from './ui/LoadingPage';
import DataStore from './data/DataStore';
import SelectionPanel from './ui/SelectionPanel';
import DetailPanel from './ui/DetailPanel';

let state = new State();
let loadingPage = new LoadingPage(state);
let sceneElement = new SceneElement(state);
sceneElement.getZEnrichedTrails()
  .then((features) => {
    let dataStore = new DataStore(features);
    const trails = dataStore.trailFeatures;
    let selectionPanel = new SelectionPanel(trails, state);
    let detailPanel = new DetailPanel(trails, state);
  });




