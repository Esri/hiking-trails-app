import * as dom from 'dojo/dom';
import * as on from 'dojo/on';

import '../../style/loading-page.scss';

export default class LoadingPage {

  container;
  state;

  constructor(state) {
    this.container = dom.byId('starterPage');
    this.state = state;

    state.watch('displayLoading', (value) => {
      console.log(value);
      if (!value) {
        this.container.style.display = 'none';
      }
      else {
        this.container.style.display = 'table';
      }
    });


    on(dom.byId('showMap'), 'click', () => {
      state.displayLoading = false;
    });
  }
}


