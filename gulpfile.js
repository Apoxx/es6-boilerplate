var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var to5 = require('6to5-browserify');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

watchify.args.debug = true;

livereload.listen();

gulp.task('clientScripts', function() {
  var bundler = watchify(browserify(watchify.args))
  .require(__dirname + '/scripts/client/index.js', {entry: true})
  .transform(to5)
  .on('update', rebundle)
  .on('log', function(log){console.log('[watchify] ' + log);});

  function rebundle() {
    return bundler.bundle()
    .on('error', function(error){console.error(error.message);})
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public'))
    .pipe(livereload());
  }

  return rebundle();
});

gulp.task('serverScripts', function(){
  nodemon({ script: 'app.js', watch: ['scripts/server', 'scripts/shared']})
  .on('restart', function(){
    livereload.changed();
  })
});

gulp.task('stylesheets', function(){
  gulp.watch('stylesheets/**/*', ['reload']);
});

gulp.task('views', function(){
  gulp.watch('views/**/*', ['reload']);
});

gulp.task('reload', function(){
    livereload.changed();
});

gulp.task('dev', ['clientScripts', 'serverScripts', 'stylesheets', 'views']);

gulp.task('default', ['dev']);
