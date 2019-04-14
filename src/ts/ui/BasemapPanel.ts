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

import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as domConstruct from "dojo/dom-construct";
import { State } from "../types";
import * as GroupLayer from "esri/layers/GroupLayer";

import "../../style/basemap-panel.scss";

export default class BasemapPanel {

  container: any;
  basemapContainer: any;

  constructor(state: State) {
    this.container = dom.byId("basemapPanel");
    this.basemapContainer = document.querySelector(".basemaps");

    state.view.map.watch("loaded", (value) => {
      if (value) {
        const basemapGroup = <GroupLayer> state.view.map.layers.filter((layer) => {
          return (layer.title === "Basemap");
        }).getItemAt(0);

        basemapGroup.layers.forEach((layer) => {

          // get access to portalItem property
          const portalLayer = <GroupLayer> layer;
          portalLayer.portalItem.watch("loaded", (value) => {
            if (value) {
              const basemapItem = domConstruct.create("div", {
                class: "basemapItem",
                style: `background: url(${portalLayer.portalItem.getThumbnailUrl()}) no-repeat center`,
                "data-id": layer.id,
                innerHTML: `<div>${layer.title}</div>`
              }, this.basemapContainer);

              on(basemapItem, "click", (evt) => {
                state.currentBasemapId = evt.target.dataset.id;
              });
            }
          });

        });
      }

    });


  }
}
