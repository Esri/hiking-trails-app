import config from "../config";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as LineSymbol3D from "esri/symbols/LineSymbol3D";
import * as LineSymbol3DLayer from "esri/symbols/LineSymbol3DLayer";
import * as LabelSymbol3D from "esri/symbols/LabelSymbol3D";
import * as LabelClass from "esri/layers/support/LabelClass";
import * as TextSymbol3DLayer from "esri/symbols/TextSymbol3DLayer";

export function getTrailRenderer(): UniqueValueRenderer {
  return new UniqueValueRenderer({
    field: config.data.trailAttributes.id,
    defaultSymbol: createTrailSymbol({
      selection: null
    }),
    uniqueValueInfos: []
  });
}

// function for creating symbols for trails when they are selected or not
function createTrailSymbol(options) {

  const color = options.selection ? config.colors.selectedTrail : config.colors.defaultTrail;
  const size = options.selection ? 4 : 2;

  return new LineSymbol3D({
    symbolLayers: [
      new LineSymbol3DLayer({
        material: {
          color: color
        },
        size: size
      })
    ]
  });

}

export function getUniqueValueInfos(options) {
  if (options.selection) {
    return [{
      value: options.selection,
      symbol: createTrailSymbol(options)
    }];
  }
}

export function getLabelingInfo(options) {
  if (options.selection) {
    return [
      createLabelClass(options),
      createLabelClass({})
    ];
  }
  else {
    return [
      createLabelClass({})
    ];
  }
}

export function createLabelClass(options) {

  const color = (options.selection) ? config.colors.selectedTrail : config.colors.defaultTrail;

  const labelClass = new LabelClass({
    symbol: new LabelSymbol3D({
      symbolLayers: [new TextSymbol3DLayer({
        material: {
          color: "white"
        },
        halo: {
          color: color,
          size: 1
        },
        font: {
          family: "Open Sans Condensed",
          weight: "bold"
        },
        size: 13
      })],
      verticalOffset: {
        screenLength: 80,
        maxWorldLength: 2000,
        minWorldLength: 500
      },
      callout: {
        type: "line",
        size: 1,
        color: "white",
        border: {
          color: color
        }
      }
    }),
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: `$feature.${config.data.trailAttributes.name}`
    }
  });
  if (options.selection) {
    labelClass.where = `${config.data.trailAttributes.id} = ${options.selection}`;
  }

  return labelClass;
}
