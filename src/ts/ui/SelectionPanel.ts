import * as dom from 'dojo/dom';
import * as on from 'dojo/on';
import * as domConstruct from 'dojo/dom-construct';
import * as domClass from 'dojo/dom-class';

import '../../style/selection-panel.scss';
import { State } from '../types';

export default class SelectionPanel {

  trailsPanel;
  state: State;

  constructor(trails, state: State) {

    this.state = state;
    this.trailsPanel = dom.byId('trailsPanel');
    this.generateTrailsPanel(trails);

    state.watch('selectedTrailId', (id) => {
      if (document.querySelector(".selected")) {
        document.querySelector(".selected").classList.remove("selected");
      }
      if (id) {
        document.querySelector("[data-id ='" + id + "']").classList.add("selected");
      }
    });

  }

  private generateTrailsPanel(trails):void {

    let state = this.state;

    trails.forEach((trail) => {
      let trailElement = domConstruct.create('div', {
        'innerHTML': trail.name,
        'data-difficulty': trail.difficulty,
        'data-id': trail.id,
        'data-category': trail.category,
        'data-walktime': trail.walktime,
        'data-status': trail.status,
        'data-ascent': trail.ascent,
        'class': 'trail semiSquare'
      }, this.trailsPanel);

      on(trailElement, 'click', (evt) => {
        state.selectedTrailId = parseInt(evt.target.dataset.id);
      });
    });
  }
}
