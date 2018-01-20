import * as dom from 'dojo/dom';
import * as on from 'dojo/on';
import * as domConstruct from 'dojo/dom-construct';
import config from '../config';
import noUiSlider = require('noUiSlider');
import '../../style/selection-panel.scss';
import '../../style/nouislider.scss';
import { State, Trail } from '../types';

export default class SelectionPanel {

  trailsPanel;
  filterPanel;
  trails: Array<Trail>;
  state: State;

  constructor(trails, state: State) {

    this.state = state;
    this.trails = trails;

    this.trailsPanel = dom.byId('trailsPanel');
    this.generateTrailsPanel();

    this.filterPanel = dom.byId('filterPanel');
    this.generateFilterPanel();

    state.watch('selectedTrailId', (id) => {
      if (document.querySelector(".selected")) {
        document.querySelector(".selected").classList.remove("selected");
      }
      if (id) {
        document.querySelector("[data-id ='" + id + "']").classList.add("selected");
      }
    });

  }

  private generateTrailsPanel():void {

    let state = this.state;

    this.trails.forEach((trail) => {
      let trailElement = domConstruct.create('div', {
        'innerHTML': trail.name,
        'data-difficulty': trail.difficulty,
        'data-id': trail.id,
        'data-category': trail.category,
        'data-walktime': trail.walktime,
        'data-status': trail.status,
        'data-ascent': trail.ascent,
        'class': 'trail'
      }, this.trailsPanel);

      on(trailElement, 'click', (evt) => {
        state.selectedTrailId = parseInt(evt.target.dataset.id);
        console.log(state.selectedTrailId);
      });
    });
  }

  private generateFilterPanel():void {
    this.generateSingleChoiceFilters();
    this.generateRangeFilters();
  }

  // create radio buttons for single choice filter criteria
  private generateSingleChoiceFilters():void {

    let singleChoiceFilters:Array<string> = config.data.filterOptions.singleChoice;

    for (let filter of singleChoiceFilters) {

      // get unique values for the single choice options
      let uniqueValues = this.getUniqueValues(filter);

      // create a single choice options text so that users know what to select
      let text = filter.charAt(0).toUpperCase() + filter.slice(1);
      domConstruct.create("div", {
        innerHTML: text,
        class: 'filter-category'
        }, this.filterPanel);

      // add options as radio buttons
      var spanContainer = domConstruct.create("span", {
        "class": "radio-group"
      }, this.filterPanel);

      for (let i = 0; i < uniqueValues.length; i++) {
        let checked = (i === 0) ? 'checked' : '';
        let id = `${filter}-${uniqueValues[i]}`;
        var radioOption = `<input type='radio' id='${id}' name=${filter} ${checked}/>
        <label for='${id}' data-group='${filter}' data-option='${uniqueValues[i]}'>${uniqueValues[i]}</label>`;
        spanContainer.innerHTML += radioOption;
      }
      on(spanContainer, "click", function(evt){
        if (evt.target.localName === 'label' ) {
          console.log(evt);
        }
      });
    }

  }

  // function that gets unique values for a trail attribute (filter)
  private getUniqueValues(filter):Array<string> {

    let uniqueValues = ['All'];

    this.trails.forEach((elem) => {
      if (uniqueValues.indexOf(elem[filter]) === -1)  {
        uniqueValues.push(elem[filter]);
      }
    });

    return uniqueValues;
  }

  // creates range sliders for interval type filter criteria
  private generateRangeFilters():void {
    let rangeFilters:Array<string> = config.data.filterOptions.range;

    for (let filter of rangeFilters) {

      let text = filter.charAt(0).toUpperCase() + filter.slice(1);
      domConstruct.create("div", {
        innerHTML: text,
        class: 'filter-category'
        }, this.filterPanel);

      // get minimum and maximum for the filter criteria
      let extremes:Extremes = this.getExtremes(filter);
      let unit:string = '', step:number = 1;

      switch(filter) {
        case 'walktime': {
          unit = 'hrs';
          step = 1;
          break;
        }
        case 'ascent': {
          unit = 'm';
          step = 50;
          break;
        }
      }

      domConstruct.create('span', {
        innerHTML: extremes.min + ' ' + unit
      }, this.filterPanel);


      let rangeSliderContainer = domConstruct.create('div', {
        'class': 'range-slider',
        'data-group': filter
      }, this.filterPanel);

      let format = {
        to: function ( value ) {
          return `${parseInt(value)} ${unit}`;
        },
        from: function ( value ) {
          return `${parseInt(value)} ${unit}`;
        }
      }

      noUiSlider.create(rangeSliderContainer, {
        start: [extremes.min, extremes.max],
        range: {
          min: extremes.min,
          max: extremes.max
        },
        connect: true,
        step: step,
        tooltips: [format, format]
      });

      domConstruct.create('span', {
        innerHTML: extremes.max + ' ' + unit
      }, this.filterPanel);
    }
  }

  private getExtremes(prop):Extremes {
    var min = 1000, max = 0;
    this.trails.forEach(function(elem) {
      if (elem[prop] !== null) {
        if (elem[prop] < min) {
          min = elem[prop];
        }
        if (elem[prop] > max) {
          max = elem[prop];
        }
      }
    })
    return {
      min: min,
      max: max
    };
  }


}

interface Extremes {
  min: number,
  max: number
}
