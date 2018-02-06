import * as esriConfig from 'esri/config';
import * as esriRequest from 'esri/request';

import * as GraphicsLayer from 'esri/layers/GraphicsLayer';
import * as Point from 'esri/geometry/Point';
import * as Graphic from 'esri/Graphic';

import * as PointSymbol3D from 'esri/symbols/PointSymbol3D';
import * as IconSymbol3DLayer from 'esri/symbols/IconSymbol3DLayer';



function setImage(index, photos, layer) {
  var photo = photos[index];
  esriRequest(`https://api.flickr.com/services/rest/?
    method=flickr.photos.geo.getLocation&
    api_key=d2eeadac35a3dfc3fb64a92e7c792de0&
    photo_id=${photo.getAttribute('id')}`,
    {responseType: 'xml'})
      .then((response) => {

        let location = response.data.getElementsByTagName('location')[0];

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

        let point = new Point({
          latitude: location.getAttribute("latitude"),
          longitude: location.getAttribute("longitude")
        });

        let graphic = new Graphic({
          geometry: point,
          symbol: billboard
        });

        layer.add(graphic);

        if (index < photos.length) {
          index++;
          setImage(index, photos, layer);
        }
      });
}

export default class FlickrLayer extends GraphicsLayer {

  photoList: any;
  imagesLoaded: boolean = false;

  constructor(extent) {
    super({
      minScale: 70000,
      maxScale: 1000,
      elevationInfo: {
        mode: 'relative-to-scene'
      },
      title: 'Flickr'
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

    esriRequest(url, {responseType: 'xml'})
      .then((response) => {
        this.photoList = response.data.getElementsByTagName('photo');
      });
    }

    public loadImages() {
      if (this.imagesLoaded) {
        return;
      }
      else {
        setImage(0, this.photoList, this);
      }
      this.imagesLoaded = true;
    }
}
