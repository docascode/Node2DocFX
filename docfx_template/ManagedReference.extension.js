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
      var parameters = item.syntax.parameters;
      var groupedParameters = [];
      var cachedParameters = [];
      var prefix = '';
      while (parameters.length > 0) {
        var parameter = parameters.pop();
        parameter.properties = null;
        if (parameter.id == prefix) {
          parameter.properties = cachedParameters;
          var cachedParameters = [];
          var prefix = '';
        }
        var index = parameter.id.lastIndexOf('.');
        if (index == -1) {
          groupedParameters.unshift(parameter);
        } else {
          prefix = parameter.id.substring(0, index);
          parameter.id = parameter.id.substring(index + 1);
          cachedParameters.unshift(parameter);
        }
      }
      item.syntax.parameters = groupedParameters;
    }
  }

  function groupParameter(parameter, parameters, groupedParameters) {
  }
}

/**
 * This method will be called at the end of exports.transform in ManagedReference.html.primary.js
 */
exports.postTransform = function (model) {
  return model;
}