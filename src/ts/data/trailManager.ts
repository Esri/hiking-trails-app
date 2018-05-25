import config from "../config";
import * as Query from "esri/tasks/support/Query";
import * as QueryTask from "esri/tasks/QueryTask";

import Trail from "./Trail";

function queryTrails() {
  const query = new Query({
    outFields: ["*"],
    where: "1=1",
    returnGeometry: true,
    outSpatialReference: {
      wkid: 4326
    }
  });

  const queryTask = new QueryTask({
    url: config.data.trailsServiceUrl
  });

  return queryTask.execute(query);
}

const trailManager = {

  initTrails: (state) => {
    return queryTrails().then((result) => {
        state.trails = result.features.map((feature) => {
          return new Trail(feature, state);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export default trailManager;
