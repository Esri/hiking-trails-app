import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as domConstruct from "dojo/dom-construct";

function createMessage(message: string, online: boolean): void {

  // display message
  const messageContainer = domConstruct.create("div", {
    innerHTML: message,
    class: online ? "online connectionMessage" : "offline connectionMessage"
  }, document.body);

  // message disappears after 3 seconds
  window.setTimeout(function() {
    domConstruct.destroy(messageContainer);
  }, 3000);
}

export default class ConnectionManager {

  constructor(state) {

    window.addEventListener("load", function() {

      function updateOnlineStatus(event) {
        state.online = navigator.onLine ? true : false;
      }

      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);
    });

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
    createMessage("You seem to be offline. This application has limited functionality.", false);
  }

  createOnlineMessage() {
    createMessage("You are back online.", true);
  }

}
