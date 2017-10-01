"use strict";

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpStylelint = require('gulp-stylelint');
const prettify = require('gulp-jsbeautifier');
const manifest = require("./manifest.json");

const source = require("vinyl-source-stream");
const rollup = require('rollup-stream');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const htmlEntry = require('rollup-plugin-html-entry');
const sourcemaps = require('rollup-plugin-sourcemaps');
const del = require('del');
const path = require('path');

const ExtJSFiles = manifest.background.scripts.concat(
  ...manifest.content_scripts.map((cs) => cs.js),
);

const JSFiles = ExtJSFiles.concat([
  'content/**/*.js',
  'options/**/*.js',
  'popup/**/*.js',
  'test/**/*.js',
  'dist/**/*.js',
  'background.js',
  'gulpfile.js',
]);

const CSSFiles = [
  'popup/**/*.css',
  'options/**/*.css',
];

const HTMLFiles = [
  'docs/**/*.html',
  '!docs/api/**/*.html',
  'test/**/*.html',
];

gulp.task('js:lint', () =>
  gulp.src(JSFiles)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('js:prettify', () =>
  gulp.src(JSFiles.concat(['.jsbeautifyrc', '.stylelintrc']))
  .pipe(prettify({
    js: {
      file_types: ['.js', '.json', '.jsbeautifyrc', '.stylelintrc'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base)));

gulp.task('css:lint', () =>
  gulp.src(CSSFiles)
  .pipe(gulpStylelint({
    reporters: [{
      formatter: 'string',
      console: true,
    }],
  })));

gulp.task('css:prettify', () =>
  gulp.src(CSSFiles)
  .pipe(prettify({
    css: {
      file_types: ['.css', '.less', '.sass', '.scss'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base)));

gulp.task('html:prettify', () =>
  gulp.src(HTMLFiles)
  .pipe(prettify({
    html: {
      file_types: ['.html'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base)));

// Copy vendor files from /node_modules into /docs/vendor
gulp.task('docs:copy', function() {
  gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map',
    ])
    .pipe(gulp.dest('docs/vendor/bootstrap'));

  gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json',
      '!node_modules/font-awesome/less/*',
      '!node_modules/font-awesome/scss/*',
    ])
    .pipe(gulp.dest('docs/vendor/font-awesome'));
});

gulp.task('html', ['html:prettify']);
gulp.task('css', ['css:prettify', 'css:lint']);
gulp.task('js', ['js:prettify', 'js:lint']);

// Default task
gulp.task('default', [
  'html',
  'js',
  'css',
  'copy',
]);


const dist = './dist';

const scripts = ExtJSFiles.map((f) => {
  return {
    taskName: path.basename(f),
    entry: f,
    source: path.basename(f),
    dest: path.join(dist, path.dirname(f)),
  };
});

gulp.task('clean', () =>
  del([`${dist}/**/*`, `${dist}/.*`, './web-ext-artifacts/']));

gulp.task('copy', () => {
  gulp.src('./icons/**').pipe(gulp.dest(dist + "/icons"));
  gulp.src('./popup/**').pipe(gulp.dest(dist + "/popup"));
  gulp.src('./options/**').pipe(gulp.dest(dist + "/options"));
  gulp.src('./LICENSE').pipe(gulp.dest(dist));
  gulp.src('./manifest.json').pipe(gulp.dest(dist));
});

let rollupCache;

scripts.forEach((script) =>
  gulp.task(script.taskName, () =>
    rollup({
      input: script.entry,
      format: 'es',
      exports: 'none',
      sourcemap: true,
      plugins: [ /* htmlEntry(), */ resolve(), commonjs(), sourcemaps()],
      cache: rollupCache,
    })
    .on('unifiedcache', (unifiedCache) => rollupCache = unifiedCache)
    .pipe(source(script.source))
    .pipe(gulp.dest(script.dest))));

gulp.task('build', ['copy'].concat(scripts.map((script) => script.taskName)));
