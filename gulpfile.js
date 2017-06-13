const gulp = require('gulp');
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();

gulp.task('sync', () => { browserSync.init({ server: { baseDir: '.', }, }); });

gulp.task('bs-reload', () => { browserSync.reload(); });

gulp.task('useref', () =>
  gulp.src('./*.html')
    .pipe(useref())
    .pipe(gulpIf('./*.js', uglify()))
    .pipe(gulp.dest('dist'))
);

gulp.task('watch', [ 'sync', ], () => {
  gulp.watch('./*', (file) => {
    if (file.type === "changed") browserSync.reload(file.path);
  });
  gulp.watch("*.html", [ 'bs-reload', ]);
});

gulp.task('default', callback => {
  runSequence([ 'useref', 'watch', ], callback);
});
