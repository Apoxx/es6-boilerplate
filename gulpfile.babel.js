import fs from 'fs';
import path from 'path';
import { default as gulp, dest, watch, src } from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import watchify from 'watchify';
import babelify from 'babelify';
import dev from 'node-dev';
import browserSync from 'browser-sync';
import uglify from 'gulp-uglifyjs';
import buffer from 'vinyl-buffer';
import stylus from 'gulp-stylus';
import nib from 'nib';
import { CLIEngine } from 'eslint';
import mocha from 'gulp-mocha';
import { server } from './config';

function buildStyleSheets(compress) {
  return src('stylesheets/index.styl')
  .pipe(stylus({
    use: [nib()],
    compress,
  }))
  .pipe(dest('./public'));
}

gulp.task('scripts-client', () => {
  watchify.args.debug = true;
  const bundler = watchify(browserify(watchify.args))
  .require(path.join(__dirname, '/scripts/client/index.js'), { entry: true })
  .transform(babelify)
  .on('log', (log) => console.log(`[watchify] ${log}`));

  function rebundle() {
    return bundler.bundle()
    .on('error', (error) => console.error(error.message))
    .pipe(source('bundle.js'))
    .pipe(dest('./public'))
    .pipe(browserSync.reload({ stream: true }));
  }
  bundler.on('update', rebundle);

  return rebundle();
});

gulp.task('scripts-client-prod', () => {
  process.env.NODE_ENV = 'production';
  return browserify({
    entries: [path.join(__dirname, '/scripts/client/index.js')],
    debug: false,
  })
  .transform(babelify)
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(dest('./public'));
});

gulp.task('scripts-server', () => {
  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
  }
  fs.closeSync(fs.openSync('./tmp/reload', 'w'));
  watch('tmp/reload', browserSync.reload);
  dev(['app.js']);
});

gulp.task('lint', () => {
  const cli = new CLIEngine();
  const formatter = cli.getFormatter();
  watch(path.join(__dirname, '/scripts/**/*'), (event) => {
    const report = cli.executeOnFiles([event.path]);
    console.log(formatter(report.results));
  });
});

gulp.task('test', () => {
  require('babel/register');
  return src(path.join(__dirname, '/scripts/tests/index.js'))
    .pipe(mocha())
    .once('error', (error) => {
      throw error;
    });
});

gulp.task('stylesheets', () => {
  buildStyleSheets(false);
  watch('stylesheets/**/*', () => {
    buildStyleSheets(false)
    .pipe(browserSync.reload({ stream: true }));
  });
});

gulp.task('stylesheets-prod', () => {
  buildStyleSheets(true)
  .pipe(dest('./public'));
});

gulp.task('views', () => {
  watch('views/**/*', browserSync.reload);
});

gulp.task('dev-client', ['lint', 'scripts-client', 'stylesheets'], () => {
  browserSync.init({
    logSnippet: false,
    proxy: `${server.hostname}:${server.port}`,
  });
});

gulp.task('dev', ['dev-client', 'scripts-server', 'views']);

gulp.task('prod', ['scripts-client-prod', 'stylesheets-prod']);

gulp.task('default', ['dev']);
