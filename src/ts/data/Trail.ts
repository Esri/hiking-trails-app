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

import config from "../config";
import * as Polyline from "esri/geometry/Polyline";
import State from "../State";
export default class Trail {

  geometry: Polyline;
  state: State;

  constructor(feature, state) {

    this.geometry = feature.geometry;
    this.state = state;
    // add attribute data based on the mapping in the configuration file
    const attributeMap = config.data.trailAttributes;
    for (const prop in attributeMap) {
      this[prop] = feature.attributes[attributeMap[prop]];
    }

  }

}
