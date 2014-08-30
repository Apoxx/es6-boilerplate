var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var es6ify = require('es6ify');
var watch;

gulp.task('browserify-nowatch', function(){
  watch = false;
  browserifyShare();
});

gulp.task('browserify-watch', function(){
  watch = true;
  browserifyShare();
});

function browserifyShare(){
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: true
  });
  
  if(watch) {
    b = watchify(b);
    b.on('update', function(){
      bundleShare(b);
    })
    .on('log', function(message){
      console.log(message);
    });
  }
  
  b.transform(es6ify);
  b.add(es6ify.runtime);
  b.add(__dirname + '/scripts/client/index.js');
  bundleShare(b);
}

function bundleShare(b) {
  b.bundle().on('error', function(err){
      console.log(err.message);
      this.end();
    })
    .pipe(source('index.js'))
    .pipe(gulp.dest('./public'))
}

gulp.task('watch', ['browserify-watch'], function(){
});
