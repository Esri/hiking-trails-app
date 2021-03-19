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

import * as ElevationProfile from "esri/widgets/ElevationProfile";
import * as dom from "dojo/dom";
import * as domConstruct from "dojo/dom-construct";
import config from "../config";
import "../../style/detail-panel.scss";

import "font-awesome/scss/font-awesome.scss";

import { State, Trail } from "../types";
import ElevationProfileLineGround = require("esri/widgets/ElevationProfile/ElevationProfileLineGround");
export default class SelectionPanel {

  trails: Array<Trail>;
  state: State;
  container: any;
  detailTitle: any;
  detailInfograph: any;
  detailElevationProfile: any;
  detailDescription: any;
  elevationProfile: ElevationProfile;

  constructor(trails, state: State) {
    this.state = state;
    this.trails = trails;
    this.container = dom.byId("detailPanel");
    this.detailTitle = dom.byId("detailTitle");
    this.detailInfograph = dom.byId("detailInfograph");
    this.detailDescription = dom.byId("detailDescription");
    this.detailElevationProfile = dom.byId("detailElevationProfile");

    this.emptyDetails();

    state.watch("selectedTrailId", (id) => {
      this.emptyDetails();
      if (this.elevationProfile) {
        this.elevationProfile.destroy();
        this.elevationProfile = null;
      }
      if (id) {
        const trail = this.state.selectedTrail;
        this.displayInfo(trail);
        domConstruct.empty(this.detailElevationProfile);
          const container = domConstruct.create("div", {});
          this.detailElevationProfile.append(container);

          this.elevationProfile = new ElevationProfile({
            view: this.state.view,
            input: trail,
            container,
            profiles: [ new ElevationProfileLineGround({
              title: "Trail statistics",
              color: config.colors.selectedTrail
            })],
            visibleElements: {
              selectButton: false,
              sketchButton: false
            }
          });
      }
    });

    state.watch("device", () => {
      if (!this.state.selectedTrailId) {
        this.displayAppInfo();
      }
    });
  }

  emptyDetails() {
    domConstruct.empty(this.detailTitle);
    domConstruct.empty(this.detailDescription);
    domConstruct.empty(this.detailInfograph);
    domConstruct.empty(this.detailElevationProfile);

    this.displayAppInfo();
  }

  displayAppInfo() {
    if (this.state.device === "mobilePortrait") {
      this.detailInfograph.innerHTML = "This app shows the hikes in the Swiss National Park. Select a hike on the map to find out more about it.";
    } else {
      this.detailInfograph.innerHTML = "Select a hike in the map or in the Hikes panel to see more details about it.";
    }
  }

  displayInfo(trail: Trail): void {

    this.detailTitle.innerHTML = trail.name;
    this.createInfograph(trail);
    this.detailDescription.innerHTML = `<b>Particularities: </b> ${ trail.description }`;
  }

  createInfograph(trail) {

    const status = {
      Closed: {
        icon: "fa fa-calendar-times-o",
        text: "Closed"
      },
      Open: {
        icon: "fa fa-calendar-check-o",
        text: "Open"
      }
    };

    this.detailInfograph.innerHTML = `
      ${trail.ascent ? `<span class="infograph"><span class="fa fa-line-chart" aria-hidden="true"></span> ${trail.ascent} m</span>` : ""}
      ${trail.difficulty ? `<span class="infograph"><span class="fa fa-wrench" aria-hidden="true"></span> ${trail.difficulty}</span>` : ""}
      ${trail.walktime ? `<span class="infograph"><span class="fa fa-clock-o" aria-hidden="true"></span> ${trail.walktime} hr</span>` : ""}
      ${trail.status ? `<span class="infograph"><span class="${status[trail.status].icon}" aria-hidden="true"></span> ${status[trail.status].text}</span>` : ""}
    `;

  }
}
