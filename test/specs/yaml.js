'use strict';

describe('Yaml', function () {
  var output = {};

  beforeAll(function () {
    var child_process = require('child_process');
    var fs = require('fs');
    var fse = require('fs-extra');
    var path = require('path');
    var yaml = require('js-yaml');

    var outputFolder = 'test/testOutput';

    // clean output
    fse.removeSync(outputFolder);

    // generate Yaml
    child_process.execFileSync('node', ['node2docfx.js', 'test/node2docfx.json']);

    // load yaml from output
    fs.readdirSync(outputFolder).forEach(function (item) {
      var key = item.substring(0, item.indexOf('.yml'));
      var value = yaml.safeLoad(fs.readFileSync(path.join(outputFolder, item)));
      output[key] = value;
    });
  });

  describe('class', function () {
    it('should have description', function () {
      var classItem = output.MyClass.items.getValue('MyClass');
      expect(classItem.summary).toBe('This is a description of the MyClass class.');
    });
  });

  describe('constructor', function () {
    it('should have description', function () {
      var classItem = output.MyClass.items.getValue('MyClass.#ctor');
      expect(classItem.summary).toBe('This is a description of the MyClass constructor function.');
    });
  });

  Object.prototype.getValue = function (uid) {
    return this.find(function (item) {
      return item.uid === uid;
    });
  };
});
