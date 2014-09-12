var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var es6ify = require('es6ify');

watchify.args.debug = true;

es6ify.traceurOverrides = {};

gulp.task('watch', function() {
  var bundler = watchify(browserify(__dirname + '/scripts/client/index.js', watchify.args))
  .transform(es6ify)
  .on('update', rebundle)
  .on('log', function(log){console.log(log);});

  function rebundle() {
    return bundler.bundle()
    .on('error', function(error){console.error(error.message);})
    .pipe(source('index.js'))
    .pipe(gulp.dest('./public'));
  }

  return rebundle();
});
