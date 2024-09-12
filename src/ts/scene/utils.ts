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
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import LineSymbol3D from "@arcgis/core/symbols/LineSymbol3D";
import LineSymbol3DLayer from "@arcgis/core/symbols/LineSymbol3DLayer";
import LabelSymbol3D from "@arcgis/core/symbols/LabelSymbol3D";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import TextSymbol3DLayer from "@arcgis/core/symbols/TextSymbol3DLayer";
import UniqueValueInfo from "@arcgis/core/renderers/support/UniqueValueInfo";

export function getTrailRenderer(): UniqueValueRenderer {
  return new UniqueValueRenderer({
    field: config.data.trailAttributes.id,
    defaultSymbol: createTrailSymbol({
      selection: null,
    }),
    uniqueValueInfos: [],
  });
}

// function for creating symbols for trails when they are selected or not
function createTrailSymbol(options) {
  const color = options.selection
    ? config.colors.selectedTrail
    : config.colors.defaultTrail;
  const size = options.selection ? 0 : 2;

  return new LineSymbol3D({
    symbolLayers: [
      new LineSymbol3DLayer({
        material: {
          color: color,
        },
        size: 2,
      }),
    ],
  });
}

export function getUniqueValueInfos(options) {
  if (options.selection) {
    return [
      new UniqueValueInfo({
        value: options.selection,
        symbol: createTrailSymbol(options),
      }),
    ];
  }
}

export function getLabelingInfo(options) {
  if (options.selection) {
    return [createLabelClass(options), createLabelClass({})];
  } else {
    return [createLabelClass({})];
  }
}

export function createLabelClass(options) {
  const color = options.selection
    ? config.colors.selectedTrail
    : config.colors.defaultTrail;

  const labelClass = new LabelClass({
    symbol: new LabelSymbol3D({
      symbolLayers: [
        new TextSymbol3DLayer({
          material: {
            color: "white",
          },
          halo: {
            color: color,
            size: 1,
          },
          font: {
            family: "Open Sans Condensed",
            weight: "bold",
          },
          size: 13,
        }),
      ],
      verticalOffset: {
        screenLength: 40,
        maxWorldLength: 2000,
        minWorldLength: 500,
      },
      callout: {
        type: "line",
        size: 1,
        color: "white",
        border: {
          color: color,
        },
      },
    }),
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: `$feature.${config.data.trailAttributes.name}`,
    },
  });
  if (options.selection) {
    labelClass.where = `${config.data.trailAttributes.id} = ${options.selection}`;
  }

  return labelClass;
}
