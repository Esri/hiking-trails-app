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
import Basemap from "@arcgis/core/Basemap";
import TileLayer from "@arcgis/core/layers/TileLayer";
import LocalBasemapsSource from "@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource";
import { ArcgisBasemapGallery } from "@arcgis/map-components/components/arcgis-basemap-gallery";

export default class BasemapPanel {
  constructor() {
    this.setBasemaps();
  }

  private async setBasemaps() {
    const basemapGallery = document.querySelector("arcgis-basemap-gallery") as ArcgisBasemapGallery;

    const basemaps = [
      Basemap.fromId("topo")!,
      Basemap.fromId("topo-3d")!,
      new Basemap({
        portalItem: {
          id: "2e8a3ccdfd6d42a995b79812b3b0ebc6",
        },
      }),
      Basemap.fromId("satellite")!,
      Basemap.fromId("hybrid")!
    ];

    basemapGallery.source = new LocalBasemapsSource({ basemaps });
    basemapGallery.activeBasemap = basemaps[0];
  }
}
