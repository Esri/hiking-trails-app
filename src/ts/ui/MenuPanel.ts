
import * as on from 'dojo/on';
import DetailPanel from './DetailPanel';
import SelectionPanel from './SelectionPanel';
import BasemapPanel from './BasemapPanel';
import { State } from '../types';

import '../../style/menu-panel.scss';

export default class MenuPanel {

  state: State;

  constructor(trails, state: State) {

    this.state = state;

    let selectionPanel = new SelectionPanel(trails, state);
    let detailPanel = new DetailPanel(trails, state);
    let basemapPanel = new BasemapPanel(state);

    let panels = {
      selectionPanel,
      detailPanel,
      basemapPanel
    }

    this.initVisiblePanel(panels);

    state.watch('visiblePanel', (newPanel, oldPanel) => {

      // activate the selected panel (newPanel)
      document.querySelector(`[data-tab='${newPanel}']`).classList.add('active');
      panels[newPanel].container.style.display = 'block';

      // deactivate the old active panel (oldPanel)
      document.querySelector(`[data-tab='${oldPanel}']`).classList.remove('active');
      panels[oldPanel].container.style.display = 'none';
    });

    on(document.querySelector('.menuTabs'), 'click', (evt) => {
      this.state.visiblePanel = evt.target.dataset.tab;
    });

  }

  private initVisiblePanel(panels) {
    panels[this.state.visiblePanel].container.style.display = 'block';
  }
}