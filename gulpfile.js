'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine');

var options = {
  lintPaths: [
    '*.js',
    'test/specs/**/*.js'
  ],
  testPaths: [
    'test/specs/**/*.js'
  ]
};

gulp.task('lint', function () {
  return gulp.src(options.lintPaths)
    .pipe(eslint())
    .pipe(eslint.formatEach())
    .pipe(eslint.failOnError());
});

gulp.task('test', function () {
  return gulp.src(options.testPaths)
    .pipe(jasmine());
});
