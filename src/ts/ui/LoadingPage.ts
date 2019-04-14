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

import * as dom from "dojo/dom";
import * as on from "dojo/on";

import "../../style/loading-page.scss";
import { State } from "../types";

export default class LoadingPage {

  container;
  state: State;

  constructor(state) {
    this.container = dom.byId("starterPage");
    this.state = state;

    state.watch("displayLoading", (value) => {
      if (!value) {
        this.container.style.display = "none";
      }
      else {
        this.container.style.display = "table";
      }
    });


    on(dom.byId("showMap"), "click", () => {
      state.displayLoading = false;
    });
  }
}


