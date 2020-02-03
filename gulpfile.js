const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpStylelint = require('gulp-stylelint');
const prettify = require('gulp-jsbeautifier');
const crx = require('gulp-crx-pack');
// const exec = require('child_process').exec;
const jsdoc = require('gulp-jsdoc3');
const source = require("vinyl-source-stream");
// const rollup = require('rollup-stream');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const del = require('del');
const path = require('path');
const fs = require('fs');
const webExt = require('web-ext').default;

const manifest = require("./manifest.json");

const dist = './dist';
const builds = './builds';

const ExtJSFiles = manifest.background.scripts.concat(
  ...manifest.content_scripts.map((cs) => cs.js),
  [manifest.options_ui.page.replace('.html', '.js')],
  [manifest.page_action.default_popup.replace('.html', '.js')],
);

const JSFiles = ExtJSFiles.concat([
  'content/**/*.js',
  'options/**/*.js',
  'popup/**/*.js',
  'test/**/*.js',
  'background.js',
  'gulpfile.js',
  '.eslintrc.js',
]);

const watchFiles = [
  'content/**/*',
  'options/**/*',
  'popup/**/*',
  'background.js',
  '.babelrc',
  'manifest.json',
  '_locales/**/*.json',
];

const JSONFiles = [
  '.babelrc',
  'jsdoc.json',
  'manifest.json',
  'package.json',
  '.jsbeautifyrc',
  '.stylelintrc',
  'docs/tutorials/tutorials.json',
  '_locales/**/*.json',
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

const jsLint = () =>
  gulp.src(JSFiles)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());

const jsPrettify = () =>
  gulp.src(JSFiles.concat(JSONFiles))
  .pipe(prettify({
    js: {
      file_types: ['.js', '.json'].concat(JSONFiles),
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base));

const cssLint = () =>
  gulp.src(CSSFiles)
  .pipe(gulpStylelint({
    reporters: [{
      formatter: 'string',
      console: true,
    }],
  }));

const cssPrettify = () =>
  gulp.src(CSSFiles)
  .pipe(prettify({
    css: {
      file_types: ['.css', '.less', '.sass', '.scss'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base));

const htmlPrettify = () =>
  gulp.src(HTMLFiles)
  .pipe(prettify({
    html: {
      file_types: ['.html'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base));

// Copy vendor files from /node_modules into /docs/vendor
const docsCopy = (cb) => {
  gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/bootstrap.bundle.*',
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
  cb();
};

const extCopy = () => {
  gulp.src('./icons/**').pipe(gulp.dest(dist + "/icons"));
  gulp.src(['./popup/**', '!./popup/**/*.js']).pipe(gulp.dest(dist + "/popup"));
  gulp.src(['./options/**', '!./options/**/*.js']).pipe(gulp.dest(dist + "/options"));
  gulp.src('./_locales/**').pipe(gulp.dest(dist + "/_locales"));
  gulp.src('./LICENSE').pipe(gulp.dest(dist));
  return gulp.src('./manifest.json').pipe(gulp.dest(dist));
};

const docsJs = (cb) => {
  jsdoc(require('./jsdoc.json'));
  cb();
};

const extCompile = (cb) => {
  const scripts = ExtJSFiles.map((f) => {
    return {
      taskName: path.basename(f),
      entry: f,
      source: path.basename(f),
      dest: path.join(dist, path.dirname(f)),
    };
  });
  let rollupCache;
  scripts.forEach((script) =>
    gulp.src(script.entry)
    .pipe(sourcemaps.init())
    .pipe(rollup({
      // input: script.entry,
      format: 'es',
      // exports: 'none',
      // sourcemap: true,
      plugins: [
        babel({
          babelrc: true,
        }),
      ],
      // cache: rollupCache,
    }))
    // .on('unifiedcache', (unifiedCache) => rollupCache = unifiedCache)
    // .pipe(source(script.source))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(script.dest)));
  cb();
};

const extBuildChrome = () =>
  gulp.src(dist)
  .pipe(crx({
    privateKey: fs.readFileSync('./certs/chrome.pem', 'utf8'),
    filename: 'h5vew.crx',
    codebase: 'https://h5vew.tik.tn/h5vew.crx',
    updateXmlFilename: 'update.xml',
  }))
  .pipe(gulp.dest(builds));

const extBuildFirefox = (cb) =>
  webExt.cmd.build({
    overwriteDest: true,
    noInput: true,
    sourceDir: dist,
    artifactsDir: builds,
  }, {
    shouldExitProgram: false,
  }).then(() => {
    cb();
  });

/*
const extBuildFirefox = (cb) =>
  exec(`./node_modules/.bin/web-ext build -s ${dist} -a ${builds} -o`,
    function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
*/

const extSignFirefox = (cb) => {
  const apiKey = fs.readFileSync('./certs/amo-key', 'utf8').trim();
  const apiSecret = fs.readFileSync('./certs/amo-secret', 'utf8').trim();
  /*
  return exec(
    `./node_modules/.bin/web-ext sign -s ${dist} -a ${builds} --api-key=${apiKey} --api-secret=${apiSecret}`,
    function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  */
  return webExt.cmd.sign({
    sourceDir: dist,
    artifactsDir: builds,
    noInput: true,
    apiKey: apiKey,
    apiSecret: apiSecret,
  }, {
    shouldExitProgram: false,
  }).then(() => {
    cb();
  });
};

const extBuild = gulp.series(extCopy, extCompile, extBuildChrome, extBuildFirefox);

const html = gulp.series(htmlPrettify);
const css = gulp.series(cssPrettify, cssLint);
const js = gulp.series(jsPrettify, jsLint);
const build = gulp.series(extBuild);
const docs = gulp.series(docsCopy, docsJs);

exports.clean = () =>
  del([dist, builds, 'docs/api']);

exports.dev = () => {
  gulp.watch(watchFiles, ['ext:compile']);
  // exec(`./node_modules/.bin/web-ext run -s ${dist}`);
  return webExt.cmd.sign({
    sourceDir: dist,
  }, {
    shouldExitProgram: false,
  }).then(() => {
    cb();
  });
};
exports.build = build;
exports.docs = docs;
exports.extBuildFirefox = gulp.series(extCopy, extCompile, extBuildFirefox);
exports.extBuildChrome = gulp.series(extCopy, extCompile, extBuildChrome);
exports.extSignFirefox = gulp.series(extCopy, extCompile, extBuildFirefox, extSignFirefox);
exports.default = gulp.series(
  html,
  js,
  css,
  // docs,
  build,
);
