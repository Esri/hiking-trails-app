/* Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import config from "../config";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as LineSymbol3D from "esri/symbols/LineSymbol3D";
import * as LineSymbol3DLayer from "esri/symbols/LineSymbol3DLayer";
import * as LabelSymbol3D from "esri/symbols/LabelSymbol3D";
import * as LabelClass from "esri/layers/support/LabelClass";
import * as TextSymbol3DLayer from "esri/symbols/TextSymbol3DLayer";
import * as UniqueValueInfo from "esri/renderers/support/UniqueValueInfo";

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
  const size = options.selection ? 0 : 2;

  return new LineSymbol3D({
    symbolLayers: [
      new LineSymbol3DLayer({
        material: {
          color: color
        },
        size: 2
      })
    ]
  });

}

export function getUniqueValueInfos(options) {
  if (options.selection) {
    return [new UniqueValueInfo({
      value: options.selection,
      symbol: createTrailSymbol(options)
    })];
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
        screenLength: 40,
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
