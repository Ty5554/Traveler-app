const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');

// パス設定
const paths = {
  scss: {
    src: 'src/scss/**/*.scss',
    dest: 'public/'
  },
  css: {
    src: 'public/styles.css',
    dest: 'public/'
  },
  html: {
    src: 'public/**/*.html'
  },
  js: {
    src: 'public/**/*.js'
  }
};

// SCSS コンパイルタスク（開発用）
function compileSCSS() {
  return gulp
    .src('src/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: ['src/scss']
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// SCSS コンパイルタスク（本番用）
function compileSCSSProd() {
  return gulp
    .src('src/scss/main.scss')
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: ['src/scss']
    }).on('error', sass.logError))
    .pipe(rename('styles.css'))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.scss.dest));
}

// CSS クリーンアップ
function cleanCSS_task() {
  return gulp.src(['public/styles.css', 'public/styles.min.css', 'public/styles.css.map'], {read: false, allowEmpty: true})
    .pipe(clean());
}

// ローカルサーバー起動
function serve() {
  browserSync.init({
    server: {
      baseDir: './public'
    },
    port: 3000,
    open: true,
    notify: false
  });
}

// ファイル監視
function watchFiles() {
  gulp.watch(paths.scss.src, compileSCSS);
  gulp.watch(paths.html.src).on('change', browserSync.reload);
  gulp.watch(paths.js.src).on('change', browserSync.reload);
}

// タスクのエクスポート
exports.clean = cleanCSS_task;
exports.scss = compileSCSS;
exports.build = gulp.series(cleanCSS_task, compileSCSSProd);
exports.serve = gulp.parallel(serve, watchFiles);
exports.dev = gulp.series(compileSCSS, gulp.parallel(serve, watchFiles));
exports.watch = gulp.series(compileSCSS, watchFiles);

// デフォルトタスク
exports.default = exports.dev;
