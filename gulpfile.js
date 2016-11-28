var gulp = require('gulp');
var shell = require('gulp-shell');
var runSequence = require('gulp-run-sequence');
var clean = require('gulp-clean');
var path = require('path');
var fs = require('fs');
var util = require('./lib/util.js');

var config = JSON.parse(fs.readFileSync('config.json'));

gulp.task('clean-yml', function() {
  return gulp.src('yml', {read: false})
    .pipe(clean());
})

gulp.task('clean-html', function() {
  return gulp.src('_site', {read: false})
    .pipe(clean());
})

gulp.task('yml-package', function() {
  if (!fs.existsSync(config.jsdoc.dest)) {
    fs.mkdirSync(config.jsdoc.dest);
  }
  util.generateYamlAndCopyMd('../azure-sdk-for-node/lib/services/batch/package.json', path.join(config.jsdoc.dest, '{_packageName}'), config);
})

gulp.task('yml', shell.task(['node ' + config.jsdoc.path + ' ' + config.src + ' -r -c ' + config.jsdoc.config]));

gulp.task('docfx', shell.task([config.docfx.toolPath + ' ' + config.docfx.config]));

gulp.task('default', function(cb) {
  runSequence('clean-yml', 'clean-html', 'yml', 'docfx');
});