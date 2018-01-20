import Accessor = require("esri/core/Accessor");
import { Filters } from './types';
import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

@subclass()
export default class State extends declared(Accessor) {

  @property()
  displayLoading: boolean = true;

  @property()
  selectedTrailId: number = null;

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


}
