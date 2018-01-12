export default {
  scene: {
    portalUrl: 'http://zrh.mapsdevext.arcgis.com',
    websceneItemId: '7abaad52a4254f30ab1897079cad504a',
    corsServers: ['wtb.maptiles.arcgis.com', 'http://wmts.kartetirol.at/']
  },
  data: {
    trailsServiceUrl: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/SwissNationalParkTrails/FeatureServer',
    trailAttributes: {
      name: 'Name',
      id: 'RouteId',
      difficulty: 'Difficulty',
      category: 'Category',
      walktime: 'Hiketime',
      status: 'Status',
      ascent: 'Ascent',
      description: 'Description'
    },
  },
  colors: {
    defaultTrail: '#db5353',
    selectedTrail: '#f9a352'
  }
}
