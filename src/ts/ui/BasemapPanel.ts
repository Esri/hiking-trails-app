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
import BasemapGalleryItem from "@arcgis/core/widgets/BasemapGallery/support/BasemapGalleryItem";
import LocalBasemapsSource from "@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource";
import { ArcgisBasemapGallery } from "@arcgis/map-components/components/arcgis-basemap-gallery";

// import "../../style/basemap-panel.scss";

export default class BasemapPanel {
  constructor() {
    this.setBasemaps();
  }

  private async setBasemaps() {
    const basemapGallery = document.querySelector("arcgis-basemap-gallery") as ArcgisBasemapGallery;

    const basemaps = [
      new Basemap({
        id: "world-topo-base",
        title: "World Topo Base",
        baseLayers: [
          new TileLayer({
            url: "https://wtb.maptiles.arcgis.com/arcgis/rest/services/World_Topo_Base/MapServer",
            title: "World Topo Base",
          }),
        ],
      }),
      Basemap.fromId("satellite")!,
      Basemap.fromId("hybrid")!,
      Basemap.fromId("topo")!,
    ];

    basemapGallery.source = new LocalBasemapsSource({ basemaps });
    basemapGallery.activeBasemap = basemaps[0];
  }
}
