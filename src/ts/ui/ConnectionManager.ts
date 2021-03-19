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

import * as domConstruct from "dojo/dom-construct";
import { State } from "../types";

export default class ConnectionManager {

  private messageContainer;

  constructor(state: State) {

    window.addEventListener("load", function() {

      function updateOnlineStatus() {
        state.online = navigator.onLine ? true : false;
      }

      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);
    });

    this.messageContainer = domConstruct.create("div", {}, document.body);

    state.watch("online", (value) => {
      console.log(value);
      if (!value) {
        this.createOfflineMessage();
      }
      else {
        this.createOnlineMessage();
      }
    });
  }

  createOfflineMessage() {
    this.setMessage("You seem to be offline. This application has limited functionality.", false);
  }

  createOnlineMessage() {
    this.setMessage("You are back online.", true);
  }

  private setMessage(message: string, online: boolean): void {

    // display message
    this.messageContainer.innerHTML = message;
    this.messageContainer.classList.add("connectionMessage");

    if (online) {

    this.messageContainer.classList.add("online");
    this.messageContainer.classList.remove("offline");

    // message disappears after 3 seconds
    window.setTimeout(() => {
      this.messageContainer.innerHTML = "";
      this.messageContainer.classList.remove("online", "connectionMessage");
    }, 3000);
    }
    else {
      this.messageContainer.classList.remove("online");
      this.messageContainer.classList.add("offline");
    }


  }

}
