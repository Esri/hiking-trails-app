import Accessor = require("esri/core/Accessor");
import Polyline = require("esri/geometry/Polyline");

export interface State extends Accessor{
  displayLoading: boolean;
  selectedTrailId: number;
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
