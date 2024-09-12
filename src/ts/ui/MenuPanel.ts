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

import DetailPanel from "./DetailPanel";
import SelectionPanel from "./SelectionPanel";
import BasemapPanel from "./BasemapPanel";
import { Panel, State } from "../types";
import WebScene from "@arcgis/core/WebScene";

import "../../style/menu-panel.scss";

export default class MenuPanel {
  state: State;
  container: HTMLElement;

  constructor(state: State) {
    const trails = state.trails;
    this.state = state;
    this.container = <HTMLElement>document.querySelector(".menuPanel");

    const selectionPanel = new SelectionPanel(trails, state);
    const detailPanel = new DetailPanel(trails, state);
    const basemapPanel = new BasemapPanel(state);

    const panels = {
      selectionPanel,
      detailPanel,
      basemapPanel,
    };

    this.initVisiblePanel(panels);

    state.watch("visiblePanel", (newPanel, oldPanel) => {
      // activate the selected panel (newPanel)
      document
        .querySelector(`[data-tab="${newPanel}"]`)
        .classList.add("active");
      panels[newPanel].container.style.display = "block";

      // deactivate the old active panel (oldPanel)
      document
        .querySelector(`[data-tab="${oldPanel}"]`)
        .classList.remove("active");
      panels[oldPanel].container.style.display = "none";
    });

    document.querySelector(".menuTabs").addEventListener("click", (evt) => {
      this.state.visiblePanel = (evt.target as HTMLElement).dataset
        .tab as Panel;
    });

    // this class also takes care of the mobile menu
    document.querySelector("#home").addEventListener("click", (evt) => {
      const view = this.state.view;
      if (view.map instanceof WebScene) {
        view.goTo(view.map.initialViewProperties.viewpoint);
        this.state.selectedTrailId = null;
      }
    });

    document.getElementById("about").addEventListener("click", function () {
      document.getElementById("credentialsPanel").style.display = "inline";
    });
    document.getElementById("close").addEventListener("click", function () {
      document.getElementById("credentialsPanel").style.display = "none";
    });

    state.watch("device", () => {
      if (this.state.device === "mobilePortrait") {
        this.state.visiblePanel = "detailPanel";

        if (!this.state.selectedTrailId) {
          this.container.style.display = "none";
        } else {
          this.container.style.display = "flex";
        }
      } else {
        if (!this.state.selectedTrailId) {
          this.state.visiblePanel = "selectionPanel";
        }
        this.container.style.display = "flex";
      }
    });

    state.watch("selectedTrailId", () => {
      if (this.state.device === "mobilePortrait") {
        if (this.state.selectedTrailId) {
          this.container.style.display = "flex";
        } else {
          this.container.style.display = "none";
        }
      }
    });

    document.querySelector("#details").addEventListener("click", (evt) => {
      const displayValue = this.container.style.display;
      console.log(displayValue);
      this.container.style.display =
        displayValue === "none" || displayValue === "" ? "flex" : "none";
    });
  }

  private initVisiblePanel(panels) {
    if (this.state.device === "mobilePortrait") {
      this.state.visiblePanel = "detailPanel";
    } else {
      this.state.visiblePanel = "selectionPanel";
    }
    panels[this.state.visiblePanel].container.style.display = "block";
  }
}
