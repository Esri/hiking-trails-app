import Accessor = require("esri/core/Accessor");
import SceneView = require("esri/views/SceneView");
import { Device, Trail } from "./types";
import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

@subclass()
export default class State extends declared(Accessor) {

  @property()
  displayLoading: boolean = true;

  @property()
  selectedTrailId: number = null;
  setSelectedTrailId(id: number) {
    this.selectedTrailId = id;
    if (this.selectedTrailId && this.visiblePanel !== "detailPanel") {
      this.visiblePanel = "detailPanel";
    }
  }

  @property()
  filteredTrailIds: Array<number> = [];
  setFilteredTrailIds(ids: Array<number>) {
    this.filteredTrailIds = ids;
    // deselect trail if it is in the filtered out trails
    if (this.filteredTrailIds.indexOf(this.selectedTrailId) === -1) {
      this.selectedTrailId = null;
    }
  }

  @property()
  filters = {};
  setFilter(property: string, value: string | Array<number>): void {
    this.filters = {
      ...this.filters
    };
    this.filters[property] = value;
  }

  @property()
  visiblePanel: "selectionPanel" | "detailPanel" | "basemapPanel";

  @property()
  device: Device = null;

  @property()
  currentBasemapId: string = null;

  @property()
  view: SceneView = null;

  @property()
  trails: Array<Trail> = null;

  @property()
  online: boolean = true;
}
