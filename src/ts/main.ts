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

import esriConfig = require("esri/config");
esriConfig.request.useIdentity = false;

import State from "./State";
import deviceUtils from "./ui/deviceUtils";
import ConnectionManager from "./ui/ConnectionManager";
import SceneElement from "./scene/SceneElement";
import LoadingPage from "./ui/LoadingPage";
import trailManager from "./data/trailManager";
import MenuPanel from "./ui/MenuPanel";

import * as runtime from "serviceworker-webpack-plugin/lib/runtime";

if ("serviceWorker" in navigator) {
  runtime.register();
}

const state = new State();
deviceUtils.init(state);
new ConnectionManager(state);
new LoadingPage(state);
new SceneElement(state);

trailManager.initTrails(state)
  .then(() => {
    new MenuPanel(state);
  });
