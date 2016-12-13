describe('Yaml', function () {
  var util = require('../lib/util.js');
  var output = {};

  beforeAll(function () {
    var fs = require('fs');
    var path = require('path');
    var yaml = require('js-yaml');

    var outputFolder = 'testOutput';
    var fixtureFolder = 'spec/fixtures';
    var config = JSON.parse(fs.readFileSync('config.json'));

    // clean output
    util.deleteFolderRecursive(outputFolder);
    fs.mkdirSync(outputFolder);

    // generate Yaml
    util.generateYamlFromFolder(fixtureFolder, outputFolder, config);

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
    })
  })

  describe('constructor', function () {
    it('should have description', function () {
      var classItem = output.MyClass.items.getValue('MyClass.#ctor');
      expect(classItem.summary).toBe('This is a description of the MyClass constructor function.');
    })
  })

  Object.prototype.getValue = function (uid) {
    return this.find(function (item) {
      return item.uid === uid;
    });
  };
});
