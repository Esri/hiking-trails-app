import { State, Device } from "../types";

const mqDesktop = window.matchMedia("(min-width: 601px)");

function getMedia(): Device  {
  if (mqDesktop.matches) {
    return "desktop";
  }
  return "mobilePortrait";
}

export default {
  init(state: State) {
    function changeState(evt) {
      const media: Device = getMedia();
      state.device = media;
    }
    mqDesktop.addListener(changeState);
    changeState(mqDesktop);
  }
};
