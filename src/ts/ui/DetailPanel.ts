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

import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Graphic from "@arcgis/core/Graphic";
import { State, Trail } from "../types";

import "../../style/detail-panel.scss";

export default class SelectionPanel {
  trails: Array<Trail>;
  state: State;
  container: HTMLElement;
  detailTitle: HTMLElement;
  detailInfograph: HTMLElement;
  detailElevationProfile: any;
  detailDescription: HTMLElement;

  constructor(trails, state: State) {
    this.state = state;
    this.trails = trails;
    this.container = document.getElementById("detailPanel")!;
    this.detailTitle = document.getElementById("detailTitle")!;
    this.detailInfograph = document.getElementById("detailInfograph")!;
    this.detailDescription = document.getElementById("detailDescription")!;
    this.detailElevationProfile = document.getElementById("detailElevationProfile") as any;

    this.detailElevationProfile.profiles = [
      {
        type: "input",
        title: "Trail Statistics",
      },
    ];

    this.emptyDetails();

    reactiveUtils.watch(() => state.selectedTrailId, (id) => {
      this.emptyDetails();
      if (id) {
        (document.querySelectorAll("calcite-tab-title")[1] as any).selected = true;
        const trail = this.state.selectedTrail;

        console.log("[DetailPanel] selected trail", {
          id,
          trail,
          geometry: trail?.geometry,
          geometryType: trail?.geometry?.type,
          spatialReference: trail?.geometry?.spatialReference,
          paths: trail?.geometry?.paths,
          inputBeforeAssign: this.detailElevationProfile.input,
        });

        this.displayInfo(trail);
        const trailGraphic =
          trail?.geometry
            ? new Graphic({
                geometry: trail.geometry,
              })
            : null;

        this.detailElevationProfile.input = trailGraphic;
        // this.detailElevationProfile.input = trail.geometry;
        
        console.log(
          "[DetailPanel] assigned elevation profile input",
          {
            input: this.detailElevationProfile.input,
            inputGeometry: this.detailElevationProfile.input?.geometry,
            componentGeometry:
              this.detailElevationProfile.input?.geometry?.toJSON?.() ??
              this.detailElevationProfile.input?.geometry,
          }
        );
      } else {
        console.log("[DetailPanel] clearing elevation profile input");
        this.detailElevationProfile.input = null;
      }
    });

    reactiveUtils.watch(() => state.device, () => {
      if (!this.state.selectedTrailId) {
        this.displayAppInfo();
      }
    });
  }

  emptyDetails() {
    this.detailTitle.innerHTML = "";
    this.detailDescription.innerHTML = "";
    this.detailInfograph.innerHTML = "";

    this.displayAppInfo();
  }

  displayAppInfo() {
    if (this.state.device === "mobilePortrait") {
      this.detailInfograph.innerHTML =
        "This app shows the hikes in the Swiss National Park. Select a hike on the map to find out more about it.";
    } else {
      this.detailInfograph.innerHTML =
        "Select a hike in the map or in the Hikes panel to see more details about it.";
    }
  }

  displayInfo(trail: Trail): void {
    this.detailTitle.innerHTML = trail.name;
    this.createInfograph(trail);
    this.detailDescription.innerHTML = `<b>Particularities: </b> ${trail.description}`;
  }

  createInfograph(trail) {
    const status = {
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
