import Accessor = require("esri/core/Accessor");
import Polyline = require("esri/geometry/Polyline");
import SceneView = require("esri/views/SceneView");
import FlickrLayer from "./scene/FlickrLayer";

export type Device = ("mobilePortrait" | "desktop");

export interface State extends Accessor {
  displayLoading: boolean;
  selectedTrailId: number;
  setSelectedTrailId: (id: number) => void;
  filteredTrailIds: Array<number>;
  setFilteredTrailIds: (ids: Array<number>) => void;
  filters: any;
  setFilter: (property: string, value: string | number[]) => void;
  visiblePanel: "selectionPanel" | "detailPanel" | "basemapPanel";
  device: Device;
  currentBasemapId: string;
  view: SceneView;
  trails: Array<Trail>;
  online: boolean;
}

export interface Trail {
  geometry: Polyline;
  name: string;
  id: number;
  difficulty: string;
  category: string;
  walktime: number;
  status: number;
  ascent: number;
  description: number;
  profileData: Array<Object>;
  flickrLayer: FlickrLayer;
  hasZ: boolean;
  setZValues: (view: SceneView) => IPromise;
  createFlickrLayer: () => IPromise;
  setElevationValuesFromService: () => IPromise;
}
