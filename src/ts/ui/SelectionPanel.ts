import * as dom from 'dojo/dom';
import * as on from 'dojo/on';
import * as domConstruct from 'dojo/dom-construct';
import * as domClass from 'dojo/dom-class';

import '../../style/selection-panel.scss';

export default class SelectionPanel {

  trailsPanel;

  constructor(trails) {
    this.trailsPanel = dom.byId('trailsPanel');

    this.generateTrailsPanel(trails);

  }

  private generateTrailsPanel(trails):void {
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
    });
  }
}
