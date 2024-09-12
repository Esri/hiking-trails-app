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

import Query from "@arcgis/core/rest/support/Query";
import config from "../config";

import Trail from "./Trail";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

function queryTrails() {
  return new FeatureLayer({
    url: config.data.trailsServiceUrl,
  }).queryFeatures({
    outFields: ["*"],
    where: "1=1",
    returnGeometry: true,
    outSpatialReference: {
      wkid: 4326,
    },
  });
}

const trailManager = {
  initTrails: (state) => {
    return queryTrails()
      .then((result) => {
        state.trails = result.features.map((feature) => {
          return new Trail(feature, state);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },
};

export default trailManager;
