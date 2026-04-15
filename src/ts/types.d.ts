import Accessor from "@arcgis/core/core/Accessor";
import Polyline from "@arcgis/core/geometry/Polyline";
import SceneView from "@arcgis/core/views/SceneView";

export interface State extends Accessor {
  displayLoading: boolean;
  selectedTrailId: number | null;
  setSelectedTrail: (id: number | null) => void;
  filteredTrailIds: Array<number>;
  setFilteredTrailIds: (ids: Array<number>) => void;
  selectedTrail: Trail | null;
  filters: any;
  setFilter: (property: string, value: string | number[]) => void;
  view: SceneView | null;
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
  description: string;
  hasZ: boolean;
}
