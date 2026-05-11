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

import "../../style/loading-page.css";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { State } from "../types";

export default class LoadingPage {
  container: HTMLElement;
  state: State;
  showMapButton: HTMLButtonElement;

  constructor(state: State) {
    const container = document.getElementById("starterPage")!;
    const showMapButton = document.getElementById("showMap")! as HTMLButtonElement;

    this.container = container;
    this.showMapButton = showMapButton;
    this.state = state;

    reactiveUtils.watch(() => state.displayLoading, (value) => {
      if (!value) {
        this.container.style.display = "none";
      } else {
        this.container.style.display = "table";
      }
    });

    this.showMapButton.addEventListener("click", () => {
      state.displayLoading = false;
    });
  }
}
