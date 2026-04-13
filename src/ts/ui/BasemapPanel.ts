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
// import "../../style/basemap-panel.scss";

export default class BasemapPanel {
  constructor() {
    this.setBasemaps();
  }

  private async setBasemaps() {
    await customElements.whenDefined("arcgis-basemap-gallery");

    const basemapGallery = document.querySelector("arcgis-basemap-gallery") as
      | (HTMLElement & { source?: unknown; componentOnReady?: () => Promise<unknown> })
      | null;

    if (!basemapGallery) {
      return;
    }

    if (typeof basemapGallery.componentOnReady === "function") {
      await basemapGallery.componentOnReady();
    }
    const arcgis = (window as any).$arcgis;
    if (!arcgis?.import) {
      throw new Error("ArcGIS components runtime ($arcgis.import) is not available");
    }

    const [Basemap, TileLayer, LocalBasemapsSource] = await arcgis.import([
      "@arcgis/core/Basemap.js",
      "@arcgis/core/layers/TileLayer.js",
      "@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource.js",
    ]);

    basemapGallery.source = new LocalBasemapsSource({
      basemaps: [
        Basemap.fromId("satellite"),
        Basemap.fromId("hybrid"),
        Basemap.fromId("topo"),
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
      ],
    });
  }
}
