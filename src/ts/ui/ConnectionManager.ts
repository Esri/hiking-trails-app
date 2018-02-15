import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as domConstruct from "dojo/dom-construct";

export default class ConnectionManager {

  private messageContainer;

  constructor(state) {

    window.addEventListener("load", function() {

      function updateOnlineStatus(event) {
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
