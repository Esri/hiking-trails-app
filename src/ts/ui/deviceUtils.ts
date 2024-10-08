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

import { Device, State } from "../types";

const mqDesktop = window.matchMedia("(min-width: 601px)");

function getMedia(): Device {
  if (mqDesktop.matches) {
    return "desktop";
  }
  return "mobilePortrait";
}

export default {
  init(state: State) {
    state.device = getMedia();
    mqDesktop.addEventListener("change", () => {
      const media: Device = getMedia();
      state.device = media;
    });
  },
};
