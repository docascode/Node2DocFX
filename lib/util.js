(function () {
  var child_process = require('child_process');
  var fs = require('fs');
  var path = require('path');
  var yaml = require('js-yaml');

  // generate yml files and copy README.md to dest folder from package.json
  function generateYamlFromPackageJson(packageJsonPath, dest, options) {
    if (!packageJsonPath || !dest || !options) throw 'invalid parameter';

    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    if (packageJson && packageJson.name) {
      dest = dest.replace('{_packageName}', packageJson.name);
    }
    dir = path.dirname(packageJsonPath);
    console.log('extract yml for package ' + packageJson.name);
    runYamlGenerator(dir, dest, options, packageJson.name);

    // copy README.md(src) to index.md(dest) and add it to toc.yml
    var readme = path.join(dir, 'README.md');
    if (fs.existsSync(readme)) {
      console.log('copy from ' + readme + ' to ' + path.join(dest, 'index.md'));
      fs.createReadStream(readme).pipe(fs.createWriteStream(path.join(dest, 'index.md')));
      var tocPath = path.join(dest, 'toc.yml');
      var toc = yaml.safeLoad(fs.readFileSync(tocPath));
      toc.unshift({name: 'README', href: 'index.md'});
      fs.writeFileSync(tocPath, yaml.safeDump(toc));
    }
  }

  // generate yml to dest folder from js
  function generateYamlFromJs(jsPath, dest, options) {
    if (!jsPath || !dest || !options) throw 'invalid parameter';
    console.log('extrating yml for js ' + jsPath);
    runYamlGenerator(jsPath, dest, options);
  }

  // fun yamlGeerator plugin in jsdoc
  function runYamlGenerator(src, dest, options, packageName) {

    // generate config for jsdoc plugin
    var dir = path.dirname(options.jsdoc.yamlGeneratorConfig);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(options.jsdoc.yamlGeneratorConfig, JSON.stringify({dest: dest, packageName: packageName}));

    // run plugin
    child_process.execFileSync('node', [options.jsdoc.toolPath, src, '-r', '-c', options.jsdoc.config]);
  }

  module.exports = {
    generateYamlFromPackageJson: generateYamlFromPackageJson,
    generateYamlFromJs: generateYamlFromJs,
  }
})();