import * as esriConfig from "esri/config";
import * as esriRequest from "esri/request";

import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as Point from "esri/geometry/Point";
import * as Graphic from "esri/Graphic";

import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as PointSymbol3D from "esri/symbols/PointSymbol3D";
import * as IconSymbol3DLayer from "esri/symbols/IconSymbol3DLayer";

import * as all from "dojo/promise/all";
import * as Deferred from "dojo/Deferred";

import config from "../config";

function setImages(layer) {
  const promises = [];
  const photos = layer.photoList;
  for (let i = 0; i < layer.photoList.length; i++) {
    const photo = photos[i];
    promises.push(esriRequest(`https://api.flickr.com/services/rest/?
      method=flickr.photos.geo.getLocation&
      api_key=${config.flickrApiKey}&
      photo_id=${photo.getAttribute("id")}`,
      { responseType: "xml" }));
  }
  return all(promises).then((results) => {
    // console.log(results);
    const src = [];
    for (let j = 0; j < results.length; j++) {

      const result = results[j];
      const photo = photos[j];
      const location = result.data.getElementsByTagName("location")[0];
      if (location) {
        const imgUrl = `https://farm${photo.getAttribute("farm")}.staticflickr.com/${photo.getAttribute("server")}/${photo.getAttribute("id")}_${photo.getAttribute("secret")}.jpg`;

        const billboard = new PointSymbol3D({
          symbolLayers: [new IconSymbol3DLayer({
            size: 50,
            resource: { href: imgUrl }
          })],
          verticalOffset: {
            screenLength: 50,
            maxWorldLength: 3000,
            minWorldLength: 20
          },
          callout: {
            type: "line",
            size: 1,
            color: "white"
          }
        });

        layer.renderer.addUniqueValueInfo({
          value: j,
          symbol: billboard
        });

        const point = new Point({
          latitude: location.getAttribute("latitude"),
          longitude: location.getAttribute("longitude")
        });

        const graphic = new Graphic({
          geometry: point,
          attributes: {
            ObjectID: j,
            image: imgUrl
          }
        });

        src.push(graphic);
      }
    }
    return src;
  })
    .then((src) => {
      layer.source = src;
    })
    .otherwise(err => console.log(err));
}

export default class FlickrLayer extends FeatureLayer {

  photoList: any[] = [];
  imagesLoaded: boolean = false;

  constructor() {
    super({
      elevationInfo: {
        mode: "relative-to-scene"
      },
      title: "Flickr",
      fields: [{
        name: "ObjectID",
        type: "oid"
      }, {
        name: "image",
        type: "string"
      }],
      geometryType: "point",
      spatialReference: { wkid: 4326 },
      objectIdField: "ObjectID",
      source: [],
      featureReduction: {
        type: "selection"
      },
      renderer: new UniqueValueRenderer({
        field: "ObjectID",
        defaultSymbol: new PointSymbol3D()
      })
    });


  }

  public loadImages(wayPoints) {
    if (this.imagesLoaded) {
      //create a fake promise
      const deferred = new Deferred();
      deferred.resolve(1);
      return deferred.promise;
    }
    else {
      this.imagesLoaded = true;
      esriConfig.request.corsEnabledServers.push("https://api.flickr.com/");

      for (let i = 1; i <= 9; i++) {
        esriConfig.request.corsEnabledServers.push(`https://farm${i}.staticflickr.com/`);
      }

      const requests = [];
      const radius = 0.5;

      wayPoints.forEach((point) => {
        const url = `https://api.flickr.com/services/rest/?
          method=flickr.photos.search&api_key=d2eeadac35a3dfc3fb64a92e7c792de0&privacy_filter=1&accuracy=16
          &has_geo=true&lon=${point[0]}&lat=${point[1]}&radius=${radius}
          &per_page=1
          &content_type=1
          &license=2,3,4,5,6,7,8,9`;
        requests.push(esriRequest(url, { responseType: "xml" }));
      });

      return all(requests).then((results) => {
        results.forEach((result) => {
          const photo = result.data.getElementsByTagName("photo");
          if (photo.length > 0) {
            this.photoList.push(photo[0]);
          }
        });
      })
      .then(() => {
        return setImages(this);
      });
    }

  }
}
