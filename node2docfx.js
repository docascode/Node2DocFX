var fs = require('fs');
var fse = require('fs-extra');
var child_process = require('child_process');
var path = require('path');

var jsdocConfigFilename = '_jsdocConfTemp.json';
var jsdocToolPath = fs.existsSync('node_modules/jsdoc/jsdoc.js') ? 'node_modules/jsdoc/jsdoc.js' : '../jsdoc/jsdoc.js';
var jsdocPluginPath = 'jsdocs/plugins/yamlGenerator';
var jsdocOutputPath = '_yamlGeneratorOutput/';

if (process.argv.length < 3) {
  console.log('Usage: node node2docfx {conf.json}');
}
var node2docfxToolDir = path.dirname(process.argv[1]);
var node2docfxConfigDir = path.dirname(process.argv[2]);

// read node2docfx's config
var configPath = process.argv[2];
if (fs.existsSync(configPath)) {
  var config = JSON.parse(fs.readFileSync(configPath));
} else {
  console.error(`Config file ${configPath} doesn\'t exist.`);
  process.exit(1);
}

// generate jsdoc's config
var jsdocConfig = {
  source: config.source,
  destination: config.destination,
  plugins: [path.join(node2docfxToolDir, jsdocPluginPath)],
  package: config.package,
  readme: config.readme
};
var jsdocConfigPath = path.join(node2docfxConfigDir, jsdocConfigFilename);
fs.writeFileSync(jsdocConfigPath, JSON.stringify(jsdocConfig));

// run jsdoc
child_process.execFileSync('node', [path.join(node2docfxToolDir, jsdocToolPath), '-c', jsdocConfigFilename, '-r'], {cwd: node2docfxConfigDir});

// move and clear
if (config.destination) {
  fse.move(path.join(node2docfxConfigDir, jsdocOutputPath), path.join(node2docfxConfigDir, config.destination), function (err) {
    if (err) return console.error(err)
  });
}
fs.unlinkSync(jsdocConfigPath);
