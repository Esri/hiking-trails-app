import * as dom from 'dojo/dom';
import * as on from 'dojo/on';
import * as domConstruct from 'dojo/dom-construct';
import * as domClass from 'dojo/dom-class';

import '../../style/detail-panel.scss';

import "font-awesome/scss/font-awesome.scss";

import { State, Trail } from '../types';

export default class SelectionPanel {

  trails: Array<Trail>;
  state: State;
  container: any;

  constructor(trails, state: State) {
    this.state = state;
    this.trails = trails;
    this.container = dom.byId('detailPanel');

    state.watch('selectedTrailId', (id) => {
      if (id) {
        const selectedTrail = this.trails.filter((trail) => { return trail.id === id;})[0];
        this.displayInfo(selectedTrail);
      }
    });
  }

  displayInfo(trail: Trail):void {

    // create title
    dom.byId("detailTitle").innerHTML = trail.name;

    // create infograph
    this.createInfograph(trail);

    // create the description container
    dom.byId("detailDescription").innerHTML = trail.description;

    // create the elevation profile
    this.createChart(trail.profileData);
  }

  createInfograph(trail) {

    let infographContainer = dom.byId("detailInfograph");

    domConstruct.empty("detailInfograph");

    const status = [{
      icon: 'fa fa-calendar-times-o',
      text: 'Closed'
    }, {
      icon: 'fa fa-calendar-check-o',
      text: 'Open'
    }];

    infographContainer.innerHTML = `
      <span class='infograph'><span class='fa fa-line-chart' aria-hidden='true'></span> ${trail.ascent} m</span>
      <span class='infograph'><span class='fa fa-wrench' aria-hidden='true'></span> ${trail.difficulty}</span>
      <span class='infograph'><span class='fa fa-clock-o' aria-hidden='true'></span> ${trail.walktime} hr</span>
      <span class='infograph'><span class='${status[trail.status].icon}' aria-hidden='true'></span> ${status[trail.status].text}</span>
    `;

  }

  createChart(data) {

  }

}
