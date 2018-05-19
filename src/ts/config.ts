export default {
  scene: {
    websceneItemId: "d0580bb5df3840d384bda44b6ddeb54e" // global scene
    // websceneItemId: "7abaad52a4254f30ab1897079cad504a" // local scene
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
