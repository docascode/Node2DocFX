// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * This method will be called at the start of exports.transform in ManagedReference.html.primary.js
 */
exports.preTransform = function (model) {
  if (model && model.children) {
    model.children.forEach(function (item) {
      handleItem(item);
    })
  }

  return model;

  function handleItem(item) {
    if (!item) return;
    if (item.syntax && item.syntax.parameters) {
      item.syntax.parameters = groupParameters(item.syntax.parameters);
    }
  }
}

function groupParameters(parameters) {
  var groupedParameters = [];
  var stack = [];
  for (var i = 0; i < parameters.length; i++) {
    var parameter = parameters[i];
    parameter.properties = null;
    var prefixLength = 0;
    while (stack.length > 0) {
      var top = stack.pop();
      var prefix = top.id + '.';
      if (parameter.id.indexOf(prefix) == 0) {
        prefixLength = prefix.length;
        if (!top.parameter.properties) {
          top.parameter.properties = [];
        }
        top.parameter.properties.push(parameter);
        stack.push(top);
        break;
      }
      if (stack.length == 0) {
        groupedParameters.push(top.parameter);
      }
    }
    stack.push({ id: parameter.id, parameter: parameter });
    parameter.id = parameter.id.substring(prefixLength);
  }
  return groupedParameters;
}

/**
 * This method will be called at the end of exports.transform in ManagedReference.html.primary.js
 */
exports.postTransform = function (model) {
  return model;
}