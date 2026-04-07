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
import Basemap from "@arcgis/core/Basemap";
import TileLayer from "@arcgis/core/layers/TileLayer";
import LocalBasemapsSource from "@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource";

// import "../../style/basemap-panel.scss";

export default class BasemapPanel {
  // container: HTMLElement | null;
  basemapGallery: any;

  constructor() {
    // this.container = document.getElementById("basemapPanel");
    // this.basemapGallery = this.container?.querySelector("arcgis-basemap-gallery");

    // if (!this.basemapGallery) {
    //   return;
    // }

    this.setBasemaps();
  }

  private setBasemaps() {
    const customBasemaps = [
      Basemap.fromId("satellite"),
      Basemap.fromId("hybrid"),
      Basemap.fromId("topo"),
      new Basemap({
        id: "world-topo-base",
        title: "World Topo Base",
        baseLayers: [
          new TileLayer({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Base/MapServer",
            title: "World Topo Base",
          }),
        ],
      }),
      Basemap.fromId("terrain"),
    ];
    // document.querySelector("arcgis-basemap-gallery")!.source =
    // new LocalBasemapsSource({ basemaps: customBasemaps });
  }
}
