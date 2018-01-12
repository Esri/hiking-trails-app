import config from '../config';
import * as Polyline from 'esri/geometry/Polyline';
import * as geometryEngine from 'esri/geometry/geometryEngine';


export default class Trail{

  geometry: Polyline;
  profileData: Array<any>;

  constructor(feature) {

    this.geometry = feature.geometry;

    // add attribute data based on the mapping in the configuration file
    const attributeMap = config.data.trailAttributes;
    for (let prop in attributeMap) {
      this[prop] = feature.attributes[attributeMap[prop]];
    }

    this.profileData = this.getAltitudeProfileData(feature.geometry);
  }

  private getAltitudeProfileData(geometry:Polyline):Array<any> {
    let points = [];
    let totalLength = 0;
    const path = geometry.paths[0];
    let i = 0;

    points.push({point: path[0], length: totalLength, value: Math.round(path[0][2])});
    while (i < path.length) {
      for (var j = i+1; j < path.length; j++) {
        var tempLine = new Polyline({
          paths: [path.slice(i, j + 1)],
          hasZ: true,
          spatialReference: { wkid: 4326 }
        });
        var length = geometryEngine.geodesicLength(tempLine, "meters");
        if (length > 10) {
          totalLength += length;
          points.push({point: path[j], length: Math.round(totalLength/100) / 10, value: Math.round(path[i][2])});
          break;
        }
      }
      i = j;
    }
   return points;
  }

}
