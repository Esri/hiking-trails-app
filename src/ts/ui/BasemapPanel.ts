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
import { State } from "../types";
import GroupLayer from "@arcgis/core/layers/GroupLayer";

import "../../style/basemap-panel.scss";

export default class BasemapPanel {
  container: any;
  basemapContainer: any;

  constructor(state: State) {
    this.container = document.getElementById("basemapPanel");
    this.basemapContainer = document.querySelector(".basemaps");

    state.view.map.watch("loaded", (value) => {
      if (value) {
        const basemapGroup = <GroupLayer>state.view.map.layers
          .filter((layer) => {
            return layer.title === "Basemap";
          })
          .getItemAt(0);

        basemapGroup.layers.forEach((layer) => {
          // get access to portalItem property
          const portalLayer = <GroupLayer>layer;
          portalLayer.portalItem.watch("loaded", (value) => {
            if (value) {
              const basemapItem = document.createElement("div");
              basemapItem.classList.add("basemapItem");
              basemapItem.style.background = `url(${portalLayer.portalItem.getThumbnailUrl()}) no-repeat center`;
              basemapItem.dataset.id = layer.id;
              basemapItem.innerHTML = `<div>${layer.title}</div>`;
              this.basemapContainer.appendChild(basemapItem);

              basemapItem.addEventListener("click", (evt) => {
                state.currentBasemapId = (evt.target as HTMLElement).dataset.id;
              });
            }
          });
        });
      }
    });
  }
}
