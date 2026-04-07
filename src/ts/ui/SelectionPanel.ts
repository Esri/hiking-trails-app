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
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import "../../style/selection-panel.scss";
import { State, Trail } from "../types";

export default class SelectionPanel {
  trailsPanel: HTMLElement;
  filterPanel: HTMLElement;
  trails: Array<Trail>;
  state: State;
  container: any;
  removeSelectedButton: any;

  constructor(trails, state: State) {
    this.state = state;
    this.trails = trails;

    this.container = document.getElementById("selectionPanel");

    this.trailsPanel = document.getElementById("trailsPanel");
    this.removeSelectedButton = document.querySelector(".removeSelected");
    this.generateTrailsPanel();

    this.removeSelectedButton.addEventListener("click", () => {
      this.state.setSelectedTrail(null);
    });

    this.filterPanel = document.getElementById("filterPanel");
    this.generateFilterPanel();
    this.state.setFilteredTrailIds(this.trails.map((trail) => trail.id));

    reactiveUtils.watch(() => state.selectedTrailId, (id) => {
      const previousSelectedTrail = this.trailsPanel.querySelector(
        ".selected"
      ) as any;

      if (previousSelectedTrail) {
        previousSelectedTrail.selected = false;
        previousSelectedTrail.classList.remove("selected");
      }

      if (id) {
        const selectedTrail = this.trailsPanel.querySelector(
          `[data-id="${id}"]`
        ) as any;
        selectedTrail?.classList.add("selected");
        selectedTrail.selected = true;
        this.removeSelectedButton.disabled = false;
      } else {
        this.removeSelectedButton.disabled = true;
      }
    });

    reactiveUtils.watch(() => state.filters, (filters: any) => {
      const filteredTrailIds = this.getFilteredTrails(filters).map(
        (trail) => trail.id
      );
      this.state.setFilteredTrailIds(filteredTrailIds);
    });

    reactiveUtils.watch(() => state.filteredTrailIds, (ids) => {
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
        elem.disabled = true;
      } else {
        elem.classList.remove("disabled");
        elem.disabled = false;
      }
    });
  }

  private generateTrailsPanel(): void {
    const state = this.state;

    this.trails.forEach((trail) => {
      const trailElement = document.createElement("calcite-chip") as any;
      trailElement.className = "trail";
      trailElement.innerText = trail.name;
      trailElement.dataset.difficulty = trail.difficulty;
      trailElement.dataset.id = String(trail.id);
      trailElement.dataset.category = trail.category;
      trailElement.dataset.walktime = String(trail.walktime);
      trailElement.dataset.status = String(trail.status);
      trailElement.dataset.ascent = String(trail.ascent);
      trailElement.scale = "s";
      trailElement.kind = "brand";
      trailElement.value = String(trail.id);
      this.trailsPanel.appendChild(trailElement);

      trailElement.addEventListener("click", () => {
        state.setSelectedTrail(trail.id);
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

      const segmentedControl = document.createElement(
        "calcite-segmented-control"
      ) as any;
      segmentedControl.className = "segmented-group";
      segmentedControl.width = "full";

      this.filterPanel.appendChild(segmentedControl);

      for (let i = 0; i < uniqueValues.length; i++) {
        const option = document.createElement(
          "calcite-segmented-control-item"
        ) as any;
        option.innerText = uniqueValues[i];
        option.value = uniqueValues[i];
        if (i === 0) {
          option.checked = true;
        }
        segmentedControl.appendChild(option);
      }

      // initialize state
      this.state.setFilter(filter, "All");

      segmentedControl.addEventListener("calciteSegmentedControlChange", () => {
        this.state.setFilter(filter, segmentedControl.value);
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

      const rangeSliderContainer = document.createElement("calcite-slider") as any;
      rangeSliderContainer.className = "range-slider";
      rangeSliderContainer.dataset.group = filter;
      rangeSliderContainer.min = extremes.min;
      rangeSliderContainer.max = extremes.max;
      rangeSliderContainer.minValue = extremes.min;
      rangeSliderContainer.maxValue = extremes.max;
      rangeSliderContainer.step = step;
      rangeSliderContainer.labelHandles = true;
      rangeSliderContainer.labelFormatter = (value: number) => {
  return `${Math.round(Number(value))} ${unit}`;
};
      // rangeSliderContainer.labelTicks = true;
      // rangeSliderContainer.ticks = true;

      // // Use a numeric tick interval to avoid invalid tick label values.
      // rangeSliderContainer.labelFormatter = (
      //   value: number,
      //   _type: string,
      //   defaultFormatter: (value: number) => string
      // ) => {
      //   const parseSafeNumber = (raw: unknown): number => {
      //     const normalized = String(raw).replace(/[^\d.-]/g, "").trim();
      //     if (!normalized) {
      //       return NaN;
      //     }
      //     return parseFloat(normalized);
      //   };

      //   const numericValue = parseSafeNumber(value);
      //   if (Number.isFinite(numericValue)) {
      //     return `${Math.round(numericValue)} ${unit}`;
      //   }

      //   const fallback = defaultFormatter ? defaultFormatter(value) : "";
      //   const fallbackNumber = parseSafeNumber(fallback);
      //   return Number.isFinite(fallbackNumber)
      //     ? `${Math.round(fallbackNumber)} ${unit}`
      //     : "";
      // };
      this.filterPanel.appendChild(rangeSliderContainer);

      //initialize state
      state.setFilter(filter, [extremes.min, extremes.max]);

      rangeSliderContainer.addEventListener("calciteSliderChange", () => {
        state.setFilter(filter, [
          Number(rangeSliderContainer.minValue),
          Number(rangeSliderContainer.maxValue),
        ]);
      });
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
