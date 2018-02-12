import config from "../config";
import * as Polyline from "esri/geometry/Polyline";
import * as geometryEngine from "esri/geometry/geometryEngine";

import FlickrLayer from "../scene/FlickrLayer";

export default class Trail {

  geometry: Polyline;
  profileData: Array<any>;
  flickrLayer: FlickrLayer;

  constructor(feature) {

    this.geometry = feature.geometry;

    // add attribute data based on the mapping in the configuration file
    const attributeMap = config.data.trailAttributes;
    for (const prop in attributeMap) {
      this[prop] = feature.attributes[attributeMap[prop]];
    }

    let segments;
    [this.profileData, segments] = this.getProperties(feature.geometry);
    this.flickrLayer = new FlickrLayer(segments);
  }

  private getProperties(geometry: Polyline): Array<any> {

    const points = [];
    let totalLength = 0;
    let segmentLength = 0;
    const path = geometry.paths[0];
    const segments = [path[0]];
    let i = 0, j;

    points.push({ point: path[0], length: totalLength, value: Math.round(path[0][2]) });

    while (i < path.length) {
      for (j = i + 1; j < path.length; j++) {

        const length = this.computeLength(path.slice(i, j + 1));

        segmentLength += length;
        if (segmentLength > 2000) {
          const distance = this.computeLength([segments[segments.length - 1], path[j]]);
          if (distance > 1000) {
            segments.push(path[j]);
            segmentLength = 0;
          }
        }

        if (length > 10) {
          totalLength += length;
          points.push({ point: path[j], length: Math.round(totalLength / 100) / 10, value: Math.round(path[i][2]) });
          break;
        }
      }
      i = j;
    }
    return [points, segments];
  }

  private computeLength(path: number[][]): number {
    return geometryEngine.geodesicLength(new Polyline({
      paths: [path],
      hasZ: true,
      spatialReference: { wkid: 4326 }
    }), "meters");

  }
}
