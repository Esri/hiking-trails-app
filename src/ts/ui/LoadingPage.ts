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


