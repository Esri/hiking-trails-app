/* main application */

import '../style/style.scss';
import '../style/loading-page.scss';


import SceneElement from './scene/SceneElement';
import DataStore from './data/DataStore';

let sceneEl = new SceneElement();
sceneEl.getZEnrichedTrails()
  .then((features) => {
    let dataStore = new DataStore(features);

  });




