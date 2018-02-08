import * as esriConfig from 'esri/config';
import * as esriRequest from 'esri/request';

import * as FeatureLayer from 'esri/layers/FeatureLayer';
import * as Point from 'esri/geometry/Point';
import * as Graphic from 'esri/Graphic';

import * as UniqueValueRenderer from 'esri/renderers/UniqueValueRenderer';
import * as PointSymbol3D from 'esri/symbols/PointSymbol3D';
import * as IconSymbol3DLayer from 'esri/symbols/IconSymbol3DLayer';

import * as all from 'dojo/promise/all';
import * as Deferred from 'dojo/Deferred';

function setImages(layer) {
  let promises = [];
  let photos = layer.photoList;
  for (let i = 0; i < layer.photoList.length; i++) {
    let photo = photos[i];
    promises.push(esriRequest(`https://api.flickr.com/services/rest/?
      method=flickr.photos.geo.getLocation&
      api_key=d2eeadac35a3dfc3fb64a92e7c792de0&
      photo_id=${photo.getAttribute('id')}`,
      { responseType: 'xml' }));
  }
  return all(promises).then((results) => {
    console.log(results);
    let src = [];
    for (let j = 0; j < results.length; j++) {

      let result = results[j];
      let photo = photos[j];
      let location = result.data.getElementsByTagName('location')[0];
      if (location) {
        let imgUrl = `https://farm${photo.getAttribute('farm')}.staticflickr.com/${photo.getAttribute('server')}/${photo.getAttribute('id')}_${photo.getAttribute('secret')}.jpg`;

        let billboard = new PointSymbol3D({
          symbolLayers: [new IconSymbol3DLayer({
            size: 40,
            resource: { href: imgUrl },
            outline: {
              color: 'white',
              size: '5px'
            }
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
        })


        let point = new Point({
          latitude: location.getAttribute("latitude"),
          longitude: location.getAttribute("longitude")
        });

        let graphic = new Graphic({
          geometry: point,
          attributes: {
            ObjectID: j,
            image: imgUrl
          }
        });

        src.push(graphic);
      }
    }

    layer.source = src;

  })
    .otherwise(err => console.log(err));
}

export default class FlickrLayer extends FeatureLayer {

  photoList: any;
  imagesLoaded: boolean = false;

  constructor(extent) {
    super({
      elevationInfo: {
        mode: 'relative-to-scene'
      },
      title: 'Flickr',
      fields: [{
        name: 'ObjectID',
        type: 'oid'
      }, {
        name: 'image',
        type: 'string'
      }],
      geometryType: 'point',
      spatialReference: { wkid: 4326 },
      objectIdField: 'ObjectID',
      source: [],
      featureReduction: {
        type: 'selection'
      },
      renderer: new UniqueValueRenderer({
        field: 'ObjectID',
        defaultSymbol: new PointSymbol3D({
          symbolLayers: [new IconSymbol3DLayer({
            size: 40,
            resource: { primitive: 'circle' },
            outline: {
              color: 'white',
              size: '5px'
            }
          })]
        })
      })
    });

    esriConfig.request.corsEnabledServers.push('https://api.flickr.com/');

    for (let i = 1; i <= 9; i++) {
      esriConfig.request.corsEnabledServers.push(`https://farm${i}.staticflickr.com/`);
    }

    let url = `https://api.flickr.com/services/rest/?
      method=flickr.photos.search&api_key=d2eeadac35a3dfc3fb64a92e7c792de0&privacy_filter=1&accuracy=16
      &has_geo=true
      &bbox=${extent.xmin},${extent.ymin},${extent.xmax},${extent.ymax}
      &per_page=50
      &license=1,2,3,4,5,6,7,8,9`;

    esriRequest(url, { responseType: 'xml' })
      .then((response) => {
        this.photoList = response.data.getElementsByTagName('photo');
      });
  }

  public loadImages() {
    if (this.imagesLoaded) {
      //create a fake promise
      let deferred = new Deferred();
      deferred.resolve(1);
      return deferred.promise;
    }
    else {
      this.imagesLoaded = true;
      return setImages(this);
    }

  }
}
