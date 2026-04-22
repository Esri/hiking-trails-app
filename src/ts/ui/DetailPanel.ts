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

import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { State, Trail } from "../types";
import Graphic from "@arcgis/core/Graphic";

export default class SelectionPanel {
  trails: Array<Trail>;
  state: State;
  container: HTMLElement;
  detailTitle: HTMLElement;
  detailInfograph: HTMLElement;
  detailElevationProfile: HTMLArcgisElevationProfileElement;
  detailDescription: HTMLElement;

  constructor(trails: Trail[], state: State) {
    this.state = state;
    this.trails = trails;
    this.container = document.getElementById("detailPanel")!;
    this.detailTitle = document.getElementById("detailTitle")!;
    this.detailInfograph = document.getElementById("detailInfograph")!;
    this.detailDescription = document.getElementById("detailDescription")!;
    this.detailElevationProfile = document.getElementById("detailElevationProfile") as HTMLArcgisElevationProfileElement;

    this.emptyDetails();

    reactiveUtils.watch(() => state.selectedTrailId, (id) => {
      this.emptyDetails();
      const trail = this.state.selectedTrail;

      if (!id || !trail) {
        void this.detailElevationProfile.clear();
        this.detailElevationProfile.style.display = "none";
        return;
      }

      this.detailElevationProfile.style.display = "block";
      const detailTabTitle = document.querySelectorAll("calcite-tab-title")[1] as HTMLCalciteTabTitleElement;
      if (detailTabTitle) {
        detailTabTitle.selected = true;
      }
      this.displayInfo(trail);
      this.detailElevationProfile.feature = new Graphic({
        geometry: trail.geometry,
        attributes: {
          name: trail.name,
          id: trail.id,
        },
      });
    });

  }

  emptyDetails(): void {
    this.detailTitle.innerHTML = "";
    this.detailDescription.innerHTML = "";
    this.detailInfograph.innerHTML = "Select a hike in the map or in the Hikes panel to see more details about it.";
    this.detailElevationProfile.style.display = "none";
  }

  displayInfo(trail: Trail): void {
    this.detailTitle.innerHTML = trail.name;
    this.createInfograph(trail);
    this.detailDescription.innerHTML = `<b>Particularities: </b> ${trail.description}`;
  }

  createInfograph(trail: Trail): void {
    const status: Record<string, { icon: string; text: string }> = {
      Closed: {
        icon: "fa fa-calendar-times-o",
        text: "Closed",
      },
      Open: {
        icon: "fa fa-calendar-check-o",
        text: "Open",
      },
    };

    this.detailInfograph.innerHTML = `
      ${
        trail.ascent
          ? `<span class="infograph"><span class="fa fa-line-chart" aria-hidden="true"></span> ${trail.ascent} m</span>`
          : ""
      }
      ${
        trail.difficulty
          ? `<span class="infograph"><span class="fa fa-wrench" aria-hidden="true"></span> ${trail.difficulty}</span>`
          : ""
      }
      ${
        trail.walktime
          ? `<span class="infograph"><span class="fa fa-clock-o" aria-hidden="true"></span> ${trail.walktime} hr</span>`
          : ""
      }
      ${
        trail.status
          ? `<span class="infograph"><span class="${
              status[trail.status].icon
            }" aria-hidden="true"></span> ${status[trail.status].text}</span>`
          : ""
      }
    `;
  }
}
