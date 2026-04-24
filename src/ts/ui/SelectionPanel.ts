/* Copyright 2026 Esri
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
import { State, Trail, TrailFilters } from "../types";

export default class SelectionPanel {
  trailsPanel: HTMLElement;
  filterPanel: HTMLElement;
  trails: Array<Trail>;
  state: State;
  container: HTMLElement;
  removeSelectedButton: HTMLCalciteButtonElement;

  constructor(trails: Trail[], state: State) {
    this.state = state;
    this.trails = trails;
    this.container = document.getElementById("selectionPanel")!;
    this.trailsPanel = document.getElementById("trailsPanel")!;
    this.removeSelectedButton = document.querySelector<HTMLCalciteButtonElement>(".remove-selected")!;
    this.generateTrailsPanel();

    this.removeSelectedButton.addEventListener("click", () => {
      this.state.setSelectedTrail(null);
    });

    this.filterPanel = document.getElementById("filterPanel")!;
    this.generateFilterPanel();
    this.state.setFilteredTrailIds(this.trails.map((trail) => trail.id));

    reactiveUtils.watch(() => state.selectedTrailId, (id) => {
      const previousSelectedTrail = this.trailsPanel.querySelector<HTMLCalciteChipElement>(
        ".selected"
      );

      if (previousSelectedTrail) {
        previousSelectedTrail.selected = false;
        previousSelectedTrail.classList.remove("selected");
      }

      if (id !== null) {
        const selectedTrail = this.trailsPanel.querySelector<HTMLCalciteChipElement>(
          `[data-id="${id}"]`
        );
        selectedTrail?.classList.add("selected");
        if (selectedTrail) {
          selectedTrail.selected = true;
        }
        this.removeSelectedButton.disabled = false;
      } else {
        this.removeSelectedButton.disabled = true;
      }
    });

    reactiveUtils.watch(() => state.filters, (filters: TrailFilters) => {
      const filteredTrailIds = this.getFilteredTrails(filters).map(
        (trail) => trail.id
      );
      this.state.setFilteredTrailIds(filteredTrailIds);
    });

    reactiveUtils.watch(() => state.filteredTrailIds, (ids) => {
      this.updateVisibleTrails(ids);
    });
  }

  private getFilteredTrails(filters: TrailFilters): Array<Trail> {
    const filteredTrails = this.trails.filter((trail) => {
      // we assume the trail will not be filtered out
      let keepTrail = true;

      // go through each filter criteria and verify if the trail should be filtered out
      for (const filter in filters) {
        const filterValue = filters[filter];
        const trailValue = trail[filter as keyof Trail];

        if (Array.isArray(filterValue)) {
          const numericTrailValue = Number(trailValue);
          if (
            !Number.isFinite(numericTrailValue) ||
            numericTrailValue < filterValue[0] ||
            numericTrailValue > filterValue[1]
          ) {
            keepTrail = false;
            break;
          }
        } else {
          if (filterValue !== "All") {
            if (String(trailValue) !== String(filterValue)) {
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

  private updateVisibleTrails(ids: number[]): void {
    const trailElements = document.querySelectorAll<HTMLCalciteChipElement>(".trail");
    trailElements.forEach(function (elem) {
      const trailId = Number(elem.dataset.id);
      if (!Number.isFinite(trailId) || ids.indexOf(trailId) === -1) {
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
    const filterAttributes = [
      ...config.data.filterOptions.singleChoice,
      ...config.data.filterOptions.range,
    ];
    const uniqueFilterAttributes = Array.from(new Set(filterAttributes));

    this.trails.forEach((trail) => {
      const trailElement = document.createElement("calcite-chip") as HTMLCalciteChipElement;
      trailElement.className = "trail";
      trailElement.innerText = trail.name;
      trailElement.dataset.id = String(trail.id);

      uniqueFilterAttributes.forEach((attribute) => {
        const value = trail[attribute as keyof Trail];
        if (value !== null && value !== undefined) {
          trailElement.dataset[attribute] = String(value);
        }
      });

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
      ) as HTMLCalciteSegmentedControlElement;
      segmentedControl.className = "segmented-group";
      segmentedControl.width = "full";

      this.filterPanel.appendChild(segmentedControl);

      for (let i = 0; i < uniqueValues.length; i++) {
        const option = document.createElement(
          "calcite-segmented-control-item"
        ) as HTMLCalciteSegmentedControlItemElement;
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
  private getUniqueValues(filter: string): Array<string> {
    const uniqueValues = ["All"];

    this.trails.forEach((elem) => {
      const value = elem[filter as keyof Trail];
      if (value === null || value === undefined) {
        return;
      }

      const normalizedValue = String(value);
      if (uniqueValues.indexOf(normalizedValue) === -1) {
        uniqueValues.push(normalizedValue);
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
      const configuredRangeOptions = config.data.filterOptions.rangeOptions?.[filter];
      const unit = typeof configuredRangeOptions?.unit === "string" ? configuredRangeOptions.unit : "";
      const step = Number(configuredRangeOptions?.step) > 0 ? Number(configuredRangeOptions?.step) : 1;

      const rangeSliderContainer = document.createElement("calcite-slider") as HTMLCalciteSliderElement;
      rangeSliderContainer.className = "range-slider";
      rangeSliderContainer.dataset.group = filter;
      rangeSliderContainer.min = extremes.min;
      rangeSliderContainer.max = extremes.max;
      rangeSliderContainer.minValue = extremes.min;
      rangeSliderContainer.maxValue = extremes.max;
      rangeSliderContainer.step = step;
      rangeSliderContainer.labelHandles = true;
      rangeSliderContainer.labelFormatter = (value: number) => {
        const normalizedValue = Math.round(Number(value));
        return unit ? `${normalizedValue} ${unit}` : `${normalizedValue}`;
      };

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

  private getExtremes(prop: string): Extremes {
    let min = Number.POSITIVE_INFINITY,
      max = Number.NEGATIVE_INFINITY;

    this.trails.forEach(function (elem) {
      const value = Number(elem[prop as keyof Trail]);

      if (Number.isFinite(value)) {
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: 0, max: 0 };
    }

    return {
      min,
      max,
    };
  }
}

interface Extremes {
  min: number;
  max: number;
}
