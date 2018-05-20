/* This app can be configured by changing the variables
in this file.

Webscene:
 - copy the webscene that I use: http://www.arcgis.com/home/item.html?id=d0580bb5df3840d384bda44b6ddeb54e
 - remove/add layers with additional data in the Layers group
 - remove/add basemap layers in the Basemap group

Data:
 - replace the trails service url
 - replace the attribute names to the ones in your service
 - remove attributes if they don't make sense for your data
 - filterOptions are the attributes that will be used for filtering
    they can be removed in case they are not useful

Colors:
 - change the colors for visualizing the trails
 - for CSS colors check also the variables.scss file
*/

export default {
  scene: {
    websceneItemId: "d0580bb5df3840d384bda44b6ddeb54e"
  },
  data: {
    trailsServiceUrl: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/SwissNationalParkTrails/FeatureServer/0",
    trailAttributes: {
      name: "Name",
      id: "RouteId",
      difficulty: "Difficulty",
      category: "Category",
      walktime: "Hiketime",
      status: "Status",
      ascent: "Ascent",
      description: "Description"
    },
    filterOptions: {
      singleChoice: ["difficulty", "category"],
      range: ["walktime", "ascent"]
    }
  },
  colors: {
    defaultTrail: "#db5353",
    selectedTrail: "#f9a352"
  }
};
