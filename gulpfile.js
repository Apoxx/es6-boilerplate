var path = require('path');
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var babelify = require('babelify');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglifyjs');
var buffer = require('vinyl-buffer');
var stylus = require('gulp-stylus');
var nib = require('nib');
var CLIEngine = require('eslint').CLIEngine;
var mocha = require('gulp-mocha');

gulp.task('scripts-client', function() {
  watchify.args.debug = true;
  var bundler = watchify(browserify(watchify.args))
  .require(path.join(__dirname, '/scripts/client/main.js'), {entry: true})
  .transform(babelify)
  .on('log', function(log){console.log('[watchify] ' + log);});

  function rebundle() {
    return bundler.bundle()
    .on('error', function(error){console.error(error.message);})
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public'))
    .pipe(livereload());
  }
  bundler.on('update', rebundle);

  return rebundle();
});

gulp.task('scripts-client-prod', function() {
  process.env.NODE_ENV = 'production';
  return browserify({
    entries: [path.join(__dirname, '/scripts/client/main.js')],
    debug: false
  })
  .transform(babelify.configure({
    sourceMap: false
  }))
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('./public'));
});

gulp.task('scripts-server', function(){
  nodemon({ script: 'app.js', watch: ['scripts/server', 'scripts/shared']})
  .on('restart', livereload.changed);
});

gulp.task('lint', function() {
  var cli = new CLIEngine();
  var formatter = cli.getFormatter();
  gulp.watch(path.join(__dirname, '/scripts/**/*'), function(event) {
    var report = cli.executeOnFiles([event.path]);
    console.log(formatter(report.results));
  });
});

gulp.task('test', function () {
  require('babel/register');
  return gulp.src(path.join(__dirname, '/scripts/tests/index.js'))
      .pipe(mocha())
      .once('error', function () {
          process.exit(1);
      })
      .once('end', function () {
          process.exit();
      });
});

function buildStyleSheets(compress) {
  return gulp.src('stylesheets/index.styl')
  .pipe(stylus({
    use: [nib()],
    compress: compress
  }))
  .pipe(gulp.dest('./public'));
}

gulp.task('stylesheets', function(){
  buildStyleSheets(false);
  gulp.watch('stylesheets/**/*', function(){
    buildStyleSheets(false)
    .pipe(livereload());
  });
});

gulp.task('stylesheets-prod', function(){
  buildStyleSheets(true)
  .pipe(gulp.dest('./public'));
});

gulp.task('views', function(){
  gulp.watch('views/**/*', livereload.changed);
});

gulp.task('dev-client', ['lint', 'scripts-client', 'stylesheets'], function() {
  livereload.listen();
});

gulp.task('dev', ['dev-client', 'scripts-server', 'views']);

gulp.task('prod', ['scripts-client-prod', 'stylesheets-prod']);

gulp.task('default', ['dev']);
