import config from "../config";
import * as Polyline from "esri/geometry/Polyline";
import * as geometryEngine from "esri/geometry/geometryEngine";
import * as Deferred from "dojo/Deferred";
import State from "../State";

import FlickrLayer from "../scene/FlickrLayer";



export default class Trail {

  geometry: Polyline;
  elevationIsSet;
  profileData: Array<any>;
  flickrLayer: FlickrLayer;
  segments: any;
  state: State;

  constructor(feature, state) {

    this.geometry = feature.geometry;
    this.state = state;
    this.elevationIsSet = null;
    // add attribute data based on the mapping in the configuration file
    const attributeMap = config.data.trailAttributes;
    for (const prop in attributeMap) {
      this[prop] = feature.attributes[attributeMap[prop]];
    }

  }

  setElevationValuesFromService() {
    if (!this.elevationIsSet) {
      this.elevationIsSet = new Deferred();
      const elevationLayer = this.state.view.map.ground.layers.getItemAt(0);
      elevationLayer.queryElevation(this.geometry, {
        demResolution: "finest-contiguous"
      }).then((response) => {
          this.geometry = (<Polyline> response.geometry);
          [this.profileData, this.segments] = this.getProperties();
          this.elevationIsSet.resolve(1);
        });
    }
    return this.elevationIsSet.promise;
  }

  public createFlickrLayer() {
    this.flickrLayer = new FlickrLayer();
    return this.flickrLayer.loadImages(this.segments);
  }

  private getProperties(): Array<any> {

    const points = [];
    let totalLength = 0;
    let segmentLength = 0;
    const path = this.getLongestPath();
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

        if (length > 150) {
          totalLength += length;
          points.push({ point: path[j], length: Math.round(totalLength / 100) / 10, value: Math.round(path[i][2]) });
          break;
        }
      }
      i = j;
    }
    return [points, segments];
  }

  private getLongestPath(): number[][] {
    let longestPath = null;
    let maxPathLength = 0;
    for (const path of this.geometry.paths) {
      const length = this.computeLength(path);
      if (length > maxPathLength) {
        maxPathLength = length;
        longestPath = path;
      }
    }

    return longestPath;
  }

  private computeLength(path: number[][]): number {
    return geometryEngine.geodesicLength(new Polyline({
      paths: [path],
      hasZ: true,
      spatialReference: { wkid: 4326 }
    }), "meters");

  }
}
