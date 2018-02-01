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
            size: 60,
            resource: { href: imgUrl }
          })],
          verticalOffset: {
            screenLength: 80,
            maxWorldLength: 3000,
            minWorldLength: 50
          },
          callout: {
            type: "line",
            size: 2,
            color: "white",
            border: {
              color: 'black'
            }
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

  constructor(extent) {
    super({
      minScale: 100000,
      maxScale: 1000,
      elevationInfo: {
        mode: 'relative-to-scene'
      },
      screenSizePerspectiveEnabled: false
    });


esriConfig.request.corsEnabledServers.push('https://api.flickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm5.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm3.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm1.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm2.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm4.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm6.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm7.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm8.staticflickr.com/');
esriConfig.request.corsEnabledServers.push('https://farm9.staticflickr.com/');

    this.setFlickrImages(extent);
  }

  private setFlickrImages(extent) {

    console.log(extent);

    let url = `https://api.flickr.com/services/rest/?
      method=flickr.photos.search&api_key=d2eeadac35a3dfc3fb64a92e7c792de0&privacy_filter=1&accuracy=16
      &has_geo=true&bbox=${extent.xmin},${extent.ymin},${extent.xmax},${extent.ymax}&radius=4&per_page=250&license=1,2,3,4,5,6,7,8,9`;

    esriRequest(url, {responseType: 'xml'})
      .then((response) => {
        let photos = response.data.getElementsByTagName('photo');
        setImage(0, photos, this);
      });

  }



}
