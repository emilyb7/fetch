const gulp = require('gulp');
const runSequence = require('run-sequence');
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create();

gulp.task('sync', () => { browserSync.init({ server: { baseDir: '.', }, }); });

gulp.task('bs-reload', () => { browserSync.reload(); });

gulp.task('scripts', () =>
  gulp.src('./js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('.'))
)

gulp.task('watch', [ 'sync', ], () => {
  gulp.watch('./*', (file) => {
    if (file.type === "changed") browserSync.reload(file.path);
  });
  gulp.watch("*.html", [ 'bs-reload', ]);
});

gulp.task('default', callback => {
  runSequence([ 'scripts', 'watch', ], callback);
});
