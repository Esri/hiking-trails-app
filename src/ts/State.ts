import Accessor = require("esri/core/Accessor");
import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

@subclass()
export default class State extends declared(Accessor) {

  @property()
  displayLoading: boolean = true;

  @property()
  selectedTrailId: number = null;


}
