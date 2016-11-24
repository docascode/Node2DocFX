var gulp = require('gulp');
var shell = require('gulp-shell');
var runSequence = require('gulp-run-sequence');
var clean = require('gulp-clean');

var config = {
  src: '../azure-sdk-for-node/lib',
  jsdoc: {
    path: './node_modules/jsdoc/jsdoc',
    config: './jsdocs/jsdoc.conf.json',
  },
  docfx: {
    path: 'tools\\docfx\\docfx.exe',
    config: 'docfx.json'
  }
}

gulp.task('clean-yml', function() {
  return gulp.src('yml', {read: false})
    .pipe(clean());
})

gulp.task('clean-html', function() {
  return gulp.src('_site', {read: false})
    .pipe(clean());
})

gulp.task('yml', shell.task(['node ' + config.jsdoc.path + ' ' + config.src + ' -r -c ' + config.jsdoc.config]));

gulp.task('docfx', shell.task([config.docfx.path + ' ' + config.docfx.config]));

gulp.task('default', function(cb) {
  runSequence('clean-yml', 'clean-html', 'yml', 'docfx');
});