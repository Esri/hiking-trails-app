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

import * as on from "dojo/on";
import * as dom from "dojo/dom";
import DetailPanel from "./DetailPanel";
import SelectionPanel from "./SelectionPanel";
import BasemapPanel from "./BasemapPanel";
import { State } from "../types";
import * as SceneView from "esri/views/SceneView";
import * as WebScene from "esri/WebScene";

import "../../style/menu-panel.scss";

export default class MenuPanel {

  state: State;
  container: HTMLElement;

  constructor(state: State) {

    const trails = state.trails;
    this.state = state;
    this.container = <HTMLElement> document.querySelector(".menuPanel");

    const selectionPanel = new SelectionPanel(trails, state);
    const detailPanel = new DetailPanel(trails, state);
    const basemapPanel = new BasemapPanel(state);

    const panels = {
      selectionPanel,
      detailPanel,
      basemapPanel
    };

    this.initVisiblePanel(panels);

    state.watch("visiblePanel", (newPanel, oldPanel) => {

      // activate the selected panel (newPanel)
      document.querySelector(`[data-tab="${newPanel}"]`).classList.add("active");
      panels[newPanel].container.style.display = "block";

      // deactivate the old active panel (oldPanel)
      document.querySelector(`[data-tab="${oldPanel}"]`).classList.remove("active");
      panels[oldPanel].container.style.display = "none";
    });

    on(document.querySelector(".menuTabs"), "click", (evt) => {
      this.state.visiblePanel = evt.target.dataset.tab;
    });

    // this class also takes care of the mobile menu
    on(document.querySelector("#home"), "click", (evt) => {
      const view = this.state.view;
      if (view.map instanceof WebScene) {
        view.goTo(view.map.initialViewProperties.viewpoint);
        this.state.selectedTrailId = null;
      }
    });

    on(dom.byId("about"), "click", function() {
      dom.byId("credentialsPanel").style.display = "inline";
    });
    on(dom.byId("close"), "click", function() {
      dom.byId("credentialsPanel").style.display = "none";
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
        }
        else {
          this.container.style.display = "none";
        }
      }
    });

    on(document.querySelector("#details"), "click", (evt) => {
      const displayValue = this.container.style.display;
      console.log(displayValue);
      this.container.style.display = (displayValue === "none" || displayValue === "") ? "flex" : "none";
    });

  }

  private initVisiblePanel(panels) {
    if (this.state.device === "mobilePortrait") {
      this.state.visiblePanel = "detailPanel";
    }
    else {
      this.state.visiblePanel = "selectionPanel";
    }
    panels[this.state.visiblePanel].container.style.display = "block";
  }
}
