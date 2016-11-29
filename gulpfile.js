var fs = require('fs');
var glob = require('glob');
var path = require('path');
var serializer = require('js-yaml');
var gulp = require('gulp');
var clean = require('gulp-clean');
var runSequence = require('gulp-run-sequence');
var shell = require('gulp-shell');

var util = require('./lib/util.js');

var config = JSON.parse(fs.readFileSync('config.json'));

gulp.task('clean-yml', function () {
  return gulp.src(config.jsdoc.dest, { read: false })
    .pipe(clean());
})

gulp.task('clean-html', function () {
  return gulp.src(config.docfx.dest, { read: false })
    .pipe(clean());
})

gulp.task('yml-package', function () {
  if (!fs.existsSync(config.jsdoc.dest)) {
    fs.mkdirSync(config.jsdoc.dest);
  }
  util.generateYamlFromPackageJson('../azure-sdk-for-node/lib/services/webSiteManagement2/package.json', path.join(config.jsdoc.dest, '{_packageName}'), config);
});

gulp.task('yml-js', function () {
  if (!fs.existsSync(config.jsdoc.dest)) {
    fs.mkdirSync(config.jsdoc.dest);
  }
  util.generateYamlFromJs('../azure-sdk-for-node/lib/azure.js', path.join(config.jsdoc.dest, 'azure'), config);
});

gulp.task('yml-azure', function () {
  // 1. get all package.json
  var packageJsons = glob.sync(path.join(config.src, '**/package.json'));
  // 2. generate yml and md for all packages
  if (!fs.existsSync(config.jsdoc.dest)) {
    fs.mkdirSync(config.jsdoc.dest);
  }
  packageJsons.forEach(function (p) {
    util.generateYamlFromPackageJson(p, path.join(config.jsdoc.dest, '{_packageName}'), config);
  })
  // 3. generate yml for azure.js and copy root README.md
  util.generateYamlFromJs(config.rootJs, path.join(config.jsdoc.dest, 'azure'), config);
  if (fs.existsSync(config.readme)) {
    console.log('copy from ' + config.readme + ' to ' + path.join(config.jsdoc.dest, 'index.md'));
    fs.createReadStream(config.readme).pipe(fs.createWriteStream(path.join(config.jsdoc.dest, 'index.md')));
  }
  // 4. generate root toc
  var toc = [{ name: 'azure', href: 'azure\\' }];
  packageJsons.forEach(function (p) {
    var packageName = JSON.parse(fs.readFileSync(p)).name;
    var href = path.join(config.jsdoc.dest, packageName, 'index.md');
    if (fs.existsSync(href)) {
      href = path.join(packageName, 'index.md');
    } else {
      href = packageName + '/';
    }
    toc.push({ name: packageName, href: href });
  });
  console.log('generate root toc.yml');
  fs.writeFileSync(path.join(config.jsdoc.dest, 'toc.yml'), serializer.safeDump(toc));
});

gulp.task('docfx', shell.task([config.docfx.toolPath + ' ' + config.docfx.config]));

gulp.task('clean', ['clean-yml', 'clean-html']);

gulp.task('default', function (cb) {
  runSequence('yml-azure', 'docfx');
});