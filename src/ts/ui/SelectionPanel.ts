/* Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import config from "../config";
import noUiSlider from "nouislider";
import "../../style/selection-panel.scss";
import "../../style/nouislider.scss";
import { State, Trail } from "../types";

export default class SelectionPanel {
  trailsPanel: HTMLElement;
  filterPanel: HTMLElement;
  trails: Array<Trail>;
  state: State;
  container: any;

  constructor(trails, state: State) {
    this.state = state;
    this.trails = trails;

    this.container = document.getElementById("selectionPanel");

    this.trailsPanel = document.getElementById("trailsPanel");
    this.generateTrailsPanel();

    document.querySelector(".removeSelected").addEventListener("click", () => {
      this.state.setSelectedTrail(null);
    });

    this.filterPanel = document.getElementById("filterPanel");
    this.generateFilterPanel();

    state.watch("selectedTrailId", (id) => {
      if (document.querySelector(".selected")) {
        document.querySelector(".selected").classList.remove("selected");
      }
      if (id) {
        document.querySelector(`[data-id ="${id}"]`).classList.add("selected");
        document.querySelector(".removeSelected").removeAttribute("disabled");
      } else {
        document.querySelector(".removeSelected").setAttribute("disabled", "");
      }
    });

    state.watch("filters", (filters: any) => {
      const filteredTrailIds = this.getFilteredTrails(filters).map(
        (trail) => trail.id
      );
      this.state.setFilteredTrailIds(filteredTrailIds);
    });

    state.watch("filteredTrailIds", (ids) => {
      this.updateVisibleTrails(ids);
    });
  }

  private getFilteredTrails(filters: any): Array<Trail> {
    const filteredTrails = this.trails.filter((trail) => {
      // we assume the trail will not be filtered out
      let keepTrail = true;

      // go through each filter criteria and verify if the trail should be filtered out
      for (const filter in filters) {
        if (Array.isArray(filters[filter])) {
          if (
            trail[filter] < filters[filter][0] ||
            trail[filter] > filters[filter][1]
          ) {
            keepTrail = false;
            break;
          }
        } else {
          if (filters[filter] !== "All") {
            if (trail[filter].toString() !== filters[filter]) {
              keepTrail = false;
              break;
            }
          }
        }
      }

      return keepTrail;
    });

    return filteredTrails;
  }

  private updateVisibleTrails(ids) {
    const trailElements = document.querySelectorAll(".trail");
    [].forEach.call(trailElements, function (elem) {
      if (ids.indexOf(parseInt(elem.dataset.id, 10)) === -1) {
        elem.classList.add("disabled");
      } else {
        elem.classList.remove("disabled");
      }
    });
  }

  private generateTrailsPanel(): void {
    const state = this.state;

    this.trails.forEach((trail) => {
      const trailElement = document.createElement("div");
      trailElement.className = "trail";
      trailElement.innerHTML = trail.name;
      trailElement.dataset.difficulty = trail.difficulty;
      trailElement.dataset.id = String(trail.id);
      trailElement.dataset.category = trail.category;
      trailElement.dataset.walktime = String(trail.walktime);
      trailElement.dataset.status = String(trail.status);
      trailElement.dataset.ascent = String(trail.ascent);
      this.trailsPanel.appendChild(trailElement);

      trailElement.addEventListener("click", (evt) => {
        state.setSelectedTrail(
          parseInt((evt.target as HTMLElement).dataset.id, 10)
        );
      });
    });
  }

  private generateFilterPanel(): void {
    this.generateSingleChoiceFilters();
    this.generateRangeFilters();
  }

  // create radio buttons for single choice filter criteria
  private generateSingleChoiceFilters(): void {
    const singleChoiceFilters: Array<string> =
      config.data.filterOptions.singleChoice;

    for (const filter of singleChoiceFilters) {
      // get unique values for the single choice options
      const uniqueValues = this.getUniqueValues(filter);

      // create a single choice options text so that users know what to select
      const text = filter.charAt(0).toUpperCase() + filter.slice(1);

      const filterCategory = document.createElement("div");
      filterCategory.className = "filter-category";
      filterCategory.innerHTML = text;
      this.filterPanel.appendChild(filterCategory);

      // add options as radio buttons
      const spanContainer = document.createElement("span");
      spanContainer.className = "radio-group";
      this.filterPanel.appendChild(spanContainer);

      for (let i = 0; i < uniqueValues.length; i++) {
        const checked = i === 0 ? "checked" : "";
        const id = `${filter}-${uniqueValues[i]}`;
        const radioOption = `<input type="radio" id="${id}" name=${filter} ${checked}/><label for="${id}" data-group="${filter}" data-option="${uniqueValues[i]}">${uniqueValues[i]}</label>`;
        spanContainer.innerHTML += radioOption;
      }

      // initialize state
      this.state.setFilter(filter, "All");

      spanContainer.addEventListener("click", (evt) => {
        const target = evt.target as HTMLElement;
        if (target.localName === "label") {
          this.state.setFilter(target.dataset.group, target.dataset.option);
        }
      });
    }
  }

  // function that gets unique values for a trail attribute (filter)
  private getUniqueValues(filter): Array<string> {
    const uniqueValues = ["All"];

    this.trails.forEach((elem) => {
      if (uniqueValues.indexOf(elem[filter]) === -1) {
        uniqueValues.push(elem[filter]);
      }
    });

    return uniqueValues;
  }

  // creates range sliders for interval type filter criteria
  private generateRangeFilters(): void {
    const rangeFilters: Array<string> = config.data.filterOptions.range;
    const state: State = this.state;

    for (const filter of rangeFilters) {
      const text = filter.charAt(0).toUpperCase() + filter.slice(1);

      const filterCategory = document.createElement("div");
      filterCategory.className = "filter-category";
      filterCategory.innerHTML = text;
      this.filterPanel.appendChild(filterCategory);

      // get minimum and maximum for the filter criteria
      const extremes: Extremes = this.getExtremes(filter);
      let unit: string = "",
        step: number = 1;

      switch (filter) {
        case "walktime": {
          unit = "hrs";
          step = 1;
          break;
        }
        case "ascent": {
          unit = "m";
          step = 50;
          break;
        }
      }

      const span = document.createElement("div");
      span.innerHTML = `${extremes.min} ${unit}`;
      this.filterPanel.appendChild(span);

      const rangeSliderContainer = document.createElement("div");
      rangeSliderContainer.className = "range-slider";
      rangeSliderContainer.dataset.group = filter;
      this.filterPanel.appendChild(rangeSliderContainer);

      const format = {
        to: (value: number): string | number => {
          return `${parseInt(String(value), 10)} ${unit}`;
        },
        from: (value: string): number | false => {
          return parseInt(value, 10);
        },
      };

      noUiSlider.create(rangeSliderContainer, {
        start: [extremes.min, extremes.max],
        range: {
          min: extremes.min,
          max: extremes.max,
        },
        connect: true,
        step: step,
        tooltips: [format, format],
      });

      //initialize state
      state.setFilter(filter, [extremes.min, extremes.max]);

      //add event listener on slider to change the state when slider values change
      (rangeSliderContainer as any).noUiSlider.on("end", function (values) {
        state.setFilter(this.target.dataset.group, values);
      });

      const span2 = document.createElement("div");
      span2.innerHTML = `${extremes.max} ${unit}`;
      this.filterPanel.appendChild(span2);
    }
  }

  private getExtremes(prop): Extremes {
    let min = 1000,
      max = 0;
    this.trails.forEach(function (elem) {
      if (elem[prop] !== null) {
        if (elem[prop] < min) {
          min = elem[prop];
        }
        if (elem[prop] > max) {
          max = elem[prop];
        }
      }
    });
    return {
      min: min,
      max: max,
    };
  }
}

interface Extremes {
  min: number;
  max: number;
}
