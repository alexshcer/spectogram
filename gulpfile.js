// -----------------------------------------------------------
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoPrefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const copy = require('gulp-copy');
const livereload = require('gulp-livereload');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const webserver = require('gulp-webserver');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
// -----------------------------------------------------------

gulp.task('sass', function () {
  return gulp.src("src/sass/*.scss")
    .pipe(sass())
    .on('error', function (error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(autoPrefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest("build/css"));
});

gulp.task('templates', function () {
  return gulp.src('src/jade/**/*.jade')
    .pipe(pug({}))
    .on('error', function (error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(gulp.dest('./build'))
});

gulp.task('images', function () {
  return gulp.src('./src/images/**/*')
    .pipe(cache(
      imagemin(
        {
          optimizationLevel: 3,
          progressive: true,
          interlaced: true
        }
      )
    ))
    .pipe(gulp.dest('./build/img'));
});

gulp.task('browserify', function () {
  return browserify('src/javascripts/main.js', { debug: true })
    .bundle()
    .on('error', function (error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('bundle-libs', function () {
  return gulp.src('src/javascripts/o3djs/*.js')
    .pipe(concat('bundle.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('insert-bin', function () {
  return gulp.src('src/bin/**')
    .pipe(copy('build/bin', {
      prefix: 2
    }));
});

gulp.task('iconfont', function (done) {
  gulp.src(['src/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: "icons",
      path: 'src/assets/templates/_icons.scss',
      targetPath: '../../../../src/sass/fonts/_icons.scss',
      fontPath: '../bin/fonts/icons/'
    }))
    .pipe(iconfont({
      fontName: "icons",
      normalize: true
    }))
    .pipe(gulp.dest('build/bin/fonts/icons/'))
    .on('end', done);
});

gulp.task('webserver', function () {
  return gulp.src('./build')
    .pipe(webserver({
      livereload: true,
      open: true,
      fallback: 'index.html'
    }));
});

gulp.task('watch', function () {
  gulp.watch("src/icons/**/*.svg", gulp.series('iconfont'));
  gulp.watch("src/assets/**/*", gulp.series('iconfont'));
  gulp.watch("src/sass/**/*", gulp.series('sass'));
  gulp.watch('src/jade/**/*.jade', gulp.series('templates'));
  gulp.watch('src/javascripts/**', gulp.series('browserify'));
  gulp.watch('src/javascripts/lib/**', gulp.series('bundle-libs'));
  gulp.watch('src/images/**', gulp.series('images'));
  gulp.watch('src/bin/**', gulp.series('insert-bin'));
});

gulp.task('build-all', gulp.parallel('iconfont', 'sass', 'templates', 'browserify', 'bundle-libs', 'images', 'insert-bin'));
gulp.task('default', gulp.parallel('watch', 'webserver'));