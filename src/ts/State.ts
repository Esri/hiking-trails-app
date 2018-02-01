import Accessor = require("esri/core/Accessor");
import SceneView = require('esri/views/SceneView');
import { Filters, Device, Trail } from './types';
import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

@subclass()
export default class State extends declared(Accessor) {

  @property()
  displayLoading: boolean = true;

  @property()
  selectedTrailId: number = null;

  setSelectedTrailId(id: number) {
    this.selectedTrailId = id;
    if (this.selectedTrailId && this.visiblePanel !== 'detailPanel') {
      this.visiblePanel = 'detailPanel';
    }
  }

  @property()
  filteredTrailIds: Array<number> = [];

  setFilteredTrailIds(ids: Array<number>) {
    this.filteredTrailIds = ids;

    // check if the selected trail is in the filtered trails
    if (this.filteredTrailIds.indexOf(this.selectedTrailId) === -1) {
      this.selectedTrailId = null;
    }
  }

  @property()
  filters: Filters = {
    walktime: null,
    ascent: null,
    category: null,
    difficulty: null
  }

  setFilter(property: string, value: string | Array<number>): void {

    //create a new filters object so that the watch notifies on every property change
    this.filters = {
      ...this.filters
    };
    this.filters[property] = value;
  }

  @property()
  visiblePanel: 'selectionPanel' | 'detailPanel' | 'basemapPanel';

  @property()
  device: Device = null;

  @property()
  currentBasemapId: string = null;

  @property()
  view: SceneView = null;

  @property()
  trails: Array<Trail> = null;

}
