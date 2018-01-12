import Accessor = require("esri/core/Accessor");

export interface State extends Accessor{
  displayLoading: boolean;
  selectedTrailId: number;
}
