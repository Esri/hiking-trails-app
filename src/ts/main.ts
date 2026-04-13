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

import "../style/reset.scss";
import "../style/style.scss";
import "@arcgis/map-components/main.css";
import "@esri/calcite-components/main.css";

import { defineCustomElements as defineArcGISCustomElements } from "@arcgis/map-components/loader";
import { defineCustomElements as defineCalciteCustomElements } from "@esri/calcite-components/loader";

import esriConfig from "@arcgis/core/config";
esriConfig.request.useIdentity = false;

import trailManager from "./data/trailManager";
import SceneElement from "./scene/SceneElement";
import State from "./State";
import LoadingPage from "./ui/LoadingPage";
import MenuPanel from "./ui/MenuPanel";

async function bootstrap() {
  await Promise.all([
    defineCalciteCustomElements(window),
    defineArcGISCustomElements(window),
  ]);

  const state = new State();
  new LoadingPage(state);
  const sceneElement = new SceneElement(state);

  Promise.all([sceneElement.ready, trailManager.initTrails(state)]).then(() => {
    new MenuPanel(state);
  });
}

bootstrap();
