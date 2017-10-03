const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpStylelint = require('gulp-stylelint');
const prettify = require('gulp-jsbeautifier');
const manifest = require("./manifest.json");

const crx = require('gulp-crx-pack');
const exec = require('child_process').exec;
const jsdoc = require('gulp-jsdoc3');
const source = require("vinyl-source-stream");
const rollup = require('rollup-stream');
const babel = require('rollup-plugin-babel');
const del = require('del');
const path = require('path');
const fs = require('fs');

const dist = './dist';
const builds = './builds';

const ExtJSFiles = manifest.background.scripts.concat(
  ...manifest.content_scripts.map((cs) => cs.js), [manifest.options_ui.page.replace('.html', '.js')], [manifest.page_action.default_popup.replace('.html', '.js')],
);

const JSFiles = ExtJSFiles.concat([
  'content/**/*.js',
  'options/**/*.js',
  'popup/**/*.js',
  'test/**/*.js',
  'dist/**/*.js',
  'background.js',
  'gulpfile.js',
  '.eslintc.js',
]);

const JSONFiles = [
  '.babelrc',
  'jsdoc.json',
  'manifest.json',
  'package.json',
  '.jsbeautifyrc',
  '.stylelintrc',
];

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
  gulp.src(JSFiles.concat(JSONFiles))
  .pipe(prettify({
    js: {
      file_types: ['.js', '.json'].concat(JSONFiles),
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

gulp.task('ext:copy', () => {
  gulp.src('./icons/**').pipe(gulp.dest(dist + "/icons"));
  gulp.src(['./popup/**', '!./popup/**/*.js']).pipe(gulp.dest(dist + "/popup"));
  gulp.src(['./options/**', '!./options/**/*.js']).pipe(gulp.dest(dist + "/options"));
  gulp.src('./LICENSE').pipe(gulp.dest(dist));
  return gulp.src('./manifest.json').pipe(gulp.dest(dist));
});

gulp.task('docs:js', (cb) => {
  gulp.src([], {
      read: false
    })
    .pipe(jsdoc(require('./jsdoc.json'), cb));
});

gulp.task('ext:compile', ['ext:copy'], () => {
  const scripts = ExtJSFiles.map((f) => {
    return {
      taskName: path.basename(f),
      entry: f,
      source: path.basename(f),
      dest: path.join(dist, path.dirname(f)),
    };
  });
  let rollupCache;
  return scripts.forEach((script) =>
    rollup({
      input: script.entry,
      format: 'es',
      exports: 'none',
      sourcemap: true,
      plugins: [
        babel({
          babelrc: true,
        }),
      ],
      cache: rollupCache,
    })
    .on('unifiedcache', (unifiedCache) => rollupCache = unifiedCache)
    .pipe(source(script.source))
    .pipe(gulp.dest(script.dest)));
});

gulp.task('ext:build:chrome', ['ext:compile'], () =>
  gulp.src(dist)
  .pipe(crx({
    privateKey: fs.readFileSync('./certs/chrome.pem', 'utf8'),
    filename: 'h5vew.crx',
    codebase: 'https://h5vew.tik.tn/h5vew.crx',
    updateXmlFilename: 'update.xml',
  }))
  .pipe(gulp.dest(builds))
);

gulp.task('ext:build:firefox', ['ext:compile'], (cb) =>
  exec(`./node_modules/.bin/web-ext build -s ${dist} -a ${builds} -o`,
    function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    })
);

gulp.task('ext:sign:firefox', ['ext:compile'], (cb) => {
  const apiKey = fs.readFileSync('./certs/amo-key', 'utf8').trim();
  const apiSecret = fs.readFileSync('./certs/amo-secret', 'utf8').trim();
  return exec(
    `./node_modules/.bin/web-ext sign -s ${dist} -a ${builds} --api-key=${apiKey} --api-secret=${apiSecret}`,
    function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
});

gulp.task('ext:build', ['ext:build:chrome', 'ext:build:firefox']);

gulp.task('html', ['html:prettify']);
gulp.task('css', ['css:prettify', 'css:lint']);
gulp.task('js', ['js:prettify', 'js:lint']);
gulp.task('build', ['ext:build']);
gulp.task('docs', ['docs:copy', 'docs:js']);

gulp.task('clean', () =>
  del([dist, './web-ext-artifacts/']));

// Default task
gulp.task('default', [
  'html',
  'js',
  'css',
  'docs',
  'build',
]);
