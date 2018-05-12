const gulp = require('gulp');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const gulpBabel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const gulpUglify = require('gulp-uglify');
const responsive = require('gulp-responsive');
const cleanCSS = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const htmlmin = require('gulp-htmlmin');
const compress = require('compression');

const concat = require('gulp-concat');


const paths = {
  project: {
    src: 'src',
    destt: 'dist',
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/',
  },
  styles: {
    src: 'src/css/**/*.*css',
    dest: 'dist/css/',
  },
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img/',
  },
};
gulp.task('clean', () => gulp.src('dist/**/*', { read: false })
  .pipe(clean()));

gulp.task('html', () => {
  gulp.src(['src/*.html'])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));

  gulp.src(['src/sw.js', 'src/manifest.json'])
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  gulp.src('src/img/**/*')
    .pipe(responsive({
      '*.jpg': [{
        rename: { suffix: '-small' },
        width: 400,
        quality: 50,
      },
      {
        rename: { suffix: '-medium' },
        width: 600,
        quality: 50,
      },
      {
        rename: { suffix: '-large' },
        width: 800,
        quality: 100,

      }],
      '*.png': [{ quality: 100 }],
    }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', () => gulp.src(paths.styles.src)
  .pipe(concat('style.min.css'))
  .pipe(gcmq())
  .pipe(cleanCSS({ compatibility: 'ie8' }))
  .pipe(gulp.dest(paths.styles.dest)));


gulp.task('scripts-home', () =>
  gulp.src(['src/js/shared.js', 'src/js/dbhelper.js', 'src/js/main.js', 'src/js/swregister.js'])
    .pipe(sourcemaps.init())
    .pipe(gulpBabel({ presets: ['es2015'] }))
    .pipe(gulpUglify())
    .pipe(concat('home.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest)));

gulp.task('scripts-info', () =>
  gulp.src(['src/js/shared.js', 'src/js/dbhelper.js', 'src/js/restaurant_info.js', 'src/js/swregister.js'])
    .pipe(sourcemaps.init())
    .pipe(gulpBabel({ presets: ['es2015'] }))
    .pipe(gulpUglify())
    .pipe(concat('info.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest)));

gulp.task('scripts', ['scripts-home', 'scripts-info']);

gulp.task('default', ['html', 'images', 'styles', 'scripts'], () => {
  gulp.watch(paths.scripts.src, ['scripts']);
  gulp.watch(paths.styles.src, ['styles']);
  gulp.watch(['src/*.html', 'src/sw.js', 'src/manifest.json'], ['html']);

  browserSync.init({
    server: {
      baseDir: './dist',
      middleware(req, res, next) {
        const gzip = compress();
        gzip(req, res, next);
      },

    },
    open: false,
  });
  gulp.watch(['dist/**/*'], browserSync.reload);
});
