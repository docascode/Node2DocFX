(function () {
  var fs = require('fs');
  var path = require('path');
  var child_process = require('child_process');

  // generate yml files to dest folder
  function generateYamlAndCopyMd(packageJsonPath, dest, options) {
    if (!packageJsonPath || !dest) throw 'invalid parameter';

    // generate config for jsdoc plugin
    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    if (packageJson && packageJson.name) {
      dest = dest.replace('{_packageName}', packageJson.name);
    }
    var dir = path.dirname(options.jsdoc.yamlGeneratorConfig);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(options.jsdoc.yamlGeneratorConfig, JSON.stringify({dest: dest}));

    // run plugin
    dir = path.dirname(packageJsonPath);
    child_process.execFileSync('node', [options.jsdoc.toolPath, dir, '-r', '-c', options.jsdoc.config]);

    // copy README.md(src) to index.md(dest)
    var readme = path.join(dir, 'README.md');
    if (fs.existsSync(readme)) {
      fs.createReadStream(readme).pipe(fs.createWriteStream(path.join(dest, 'index.md')));
    }
  }

  module.exports = {
    generateYamlAndCopyMd: generateYamlAndCopyMd,
  }
})();