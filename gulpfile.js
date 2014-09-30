var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var es6ify = require('es6ify');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

watchify.args.debug = true;

es6ify.traceurOverrides = {};

livereload.listen();

gulp.task('clientScripts', function() {
  var bundler = watchify(browserify(watchify.args))  
  .add(es6ify.runtime)
  .require(__dirname + '/scripts/client/index.js', {entry: true})
  .transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
  .on('update', rebundle)
  .on('log', function(log){console.log('[watchify] ' + log);});

  function rebundle() {
    return bundler.bundle()
    .on('error', function(error){console.error(error.message);})
    .pipe(source('index.js'))
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
