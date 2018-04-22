var gulp = require('gulp');
var clean = require('gulp-clean');
var browserSync = require('browser-sync').create();
var gulpBabel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const gulpUglify = require('gulp-uglify');
var responsive = require('gulp-responsive');

var paths = {
  project: {
    src: 'src',
    destt: 'dist'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/'
  },
  styles: {
    src: 'src/css/**/*.*css',
    dest: 'dist/css/'
  },
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img/'
  }
}
gulp.task('clean', function(){
  return gulp.src('dist/**/*', {read: false})
          .pipe(clean());
});

gulp.task('html', function(){
  return gulp.src(['src/*.html', 'src/sw.js', 'src/manifest.json'])
		.pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  console.log('hi');
  gulp.src('src/img/**/*')
  .pipe(responsive({
    '*.jpg': [{
          rename: { suffix: '-small' },
          width: 400,
          quality: 50
        },
        {
          rename: { suffix: '-medium' },
          width: 600,
          quality: 50
        },
        {
          rename: { suffix: '-large' },
          width: 800,
          quality: 100

        }]
  }))
  .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function(){
  return gulp.src(paths.styles.src)
		.pipe(gulp.dest(paths.styles.dest));
});

gulp.task('scripts', function(){
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
		.pipe(gulpBabel({presets: ['es2015']}))
		.pipe(gulpUglify())
    .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.scripts.dest));
});


gulp.task('default', ['html', 'images', 'styles','scripts'], function() {
  gulp.watch(paths.scripts.src, ['scripts']);
  gulp.watch(paths.styles.src, ['styles']);

  browserSync.init({
    server: {
      baseDir: './dist'
    },
    open: false
  });
  gulp.watch(['dist/**/*'], browserSync.reload);

})
