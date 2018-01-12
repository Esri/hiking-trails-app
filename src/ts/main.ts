/* main application */

import '../style/style.scss';
import '../style/loading-page.scss';


import SceneElement from './scene/SceneElement';
import DataStore from './data/DataStore';
import SelectionPanel from './ui/SelectionPanel';

let sceneEl = new SceneElement();
sceneEl.getZEnrichedTrails()
  .then((features) => {
    let dataStore = new DataStore(features);
    let selectionPanel = new SelectionPanel(dataStore.trailFeatures);
  });




