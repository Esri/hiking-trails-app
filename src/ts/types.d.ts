import Accessor from "@arcgis/core/core/Accessor";
import Polyline from "@arcgis/core/geometry/Polyline";
import SceneView from "@arcgis/core/views/SceneView";

export type Device = "mobilePortrait" | "desktop";

export interface State extends Accessor {
  displayLoading: boolean;
  selectedTrailId: number;
  setSelectedTrail: (id: number) => void;
  filteredTrailIds: Array<number>;
  setFilteredTrailIds: (ids: Array<number>) => void;
  selectedTrail: Trail;
  filters: any;
  setFilter: (property: string, value: string | number[]) => void;
  currentBasemapId: string;
  view: SceneView;
  trails: Array<Trail>;
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
  hasZ: boolean;
}
