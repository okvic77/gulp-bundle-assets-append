var gulp = require('gulp'),
  bundle = require('gulp-bundle-assets'),
  assets = require('./index.js');

gulp.task('default', function() {
  return gulp.src('test-bundle.js')
    .pipe(bundle())
    .pipe(assets.addMissingAssets())
    .pipe(bundle.results())
    .pipe(gulp.dest('public'));
});
