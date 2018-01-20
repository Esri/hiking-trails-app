import Accessor = require("esri/core/Accessor");
import Polyline = require("esri/geometry/Polyline");

export type Device = ('mobilePortrait' | 'desktop');

export interface State extends Accessor{
  displayLoading: boolean;
  selectedTrailId: number;
  setSelectedTrailId: (id:number) => void;
  filteredTrailIds: Array<number>;
  setFilteredTrailIds: (ids:Array<number>) => void;
  filters: Filters;
  setFilter: (property: string, value: string | number[]) => void;
  visiblePanel: 'selectionPanel' | 'detailPanel' | 'basemapPanel';
  device: Device;
}

export interface Trail {
  geometry: Polyline;
  name: string,
  id: number,
  difficulty: string,
  category: string,
  walktime: number,
  status: number,
  ascent: number,
  description: number,
  profileData: Array<Object>
}

export interface Filters {
  walktime: Array<number>,
  ascent: Array<number>,
  category: string,
  difficulty: string
}
