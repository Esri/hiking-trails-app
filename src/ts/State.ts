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

import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import type { FilterValue, Trail, TrailFilters } from "./types";

@subclass()
export default class State extends Accessor {
  @property()
  displayLoading: boolean = true;

  @property()
  selectedTrailId: number | null = null;

  @property()
  selectedTrail: Trail | null = null;

  setSelectedTrail(id: number | null): void {
    this.selectedTrailId = id;
    this.selectedTrail = id !== null
      ? this.trails.filter((trail: Trail) => {
          return trail.id === id;
        })[0]
      : null;
  }

  @property()
  filteredTrailIds: Array<number> = [];
  setFilteredTrailIds(ids: Array<number>): void {
    this.filteredTrailIds = ids;
    // deselect trail if it is in the filtered out trails
    if (this.selectedTrailId == null || this.filteredTrailIds.indexOf(this.selectedTrailId) === -1) {
      this.selectedTrailId = null;
      this.selectedTrail = null;
    }
  }

  @property()
  filters: TrailFilters = {};
  setFilter(property: string, value: FilterValue): void {
    this.filters = {
      ...this.filters,
    };
    this.filters[property] = value;
  }

  @property()
  view: SceneView | null = null;

  @property()
  trails: Array<Trail> = [];

}
