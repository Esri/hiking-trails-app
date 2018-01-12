import Trail from './Trail';

export default class DataStore {

  trailFeatures: Array<Trail>;

  constructor(features) {
    this.trailFeatures = features.map((feature) => {
      return new Trail(feature);
    });

  }

}
