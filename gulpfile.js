'use strict';

/**
 * gulp
 * npm install --save-dev gulp-util gulp-concat gulp-rename merge-stream vinyl-source-stream
    gulp-jade jadeify gulp-stylus nib
    gulp-uglify gulp-sourcemaps gulp-minify-css gulp-imagemin del gulp-watch browserify watchify
 */

var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var minifycss = require('gulp-minify-css');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');

var jsConfig = require('./resources/assets/js/config/index');

// var sass = require('gulp-sass');
// var autoprefixer = require('gulp-autoprefixer');
// var jshint = require('gulp-jshint');   // js检查
// var notify = require('gulp-notify');
// var cache = require('gulp-cache');
// var clean = require('gulp-clean');
// var browserSync = require('browser-sync');
// var reload = browserSync.reload;

var pathSrc = {
  scripts: './resources/assets/js/',
  images: './resources/images/',
  styl: './resources/style/',
  jade: './views/',
  bower: './public/bower_components/'
};

var pathDst = {
  scripts: './public/js',
  images: './public/images',
  css: './public/style',
  html: './public/views',
  bower: './public/bower_components'
};

var resourcesSrc = './resources';
var resourcesDest = './public';

// clean
gulp.task('clean', function () {
  gulp.src(pathDst.build, {read: false})
      .pipe(clean());
});

gulp.task('copy.resources', function () {
  gulp.src(resourcesSrc + '/**/*.*')
      .pipe(gulp.dest(resourcesDest));
});

gulp.task('watch.resources', function () {
  gulp.watch(resourcesSrc + '/**/*.*', ['copy.resources']);
});

gulp.task('bower', function () {
  return gulp.src(pathSrc.bower + '**/*')
      .pipe(gulp.dest(pathDst.bower))
      //.pipe(notify({ message: 'bower copy task complete' }))
      ;
});

// jade2html
gulp.task('jade', function () {
  return gulp.src(pathSrc.jade + '/**/*.jade')
  //.pipe(jade())
      .pipe(gulp.dest(pathDst.html))
      //.pipe(notify({ message: 'jade task complete' }))
      ;
});

gulp.task('html', function () {
  return gulp.src(pathSrc.jade + '/**/*.jade')
      .pipe(jade())
      .pipe(gulp.dest(pathDst.html))
      //.pipe(notify({ message: 'html task complete' }))
      ;
});

// styl2css
gulp.task('styles', function () {
  return gulp.src(pathSrc.styl + '/**/*.styl')
      .pipe(stylus({
        //compress: true,
        use: nib(),
        import: ['nib']
      }))
      .on('error', gutil.log)
      .pipe(gulp.dest(pathDst.css))
      //.pipe(reload({stream: true}))
      //.pipe(notify({ message: 'Styles task complete' }));
      .on('end', gutil.log.bind(gutil, 'styles \'' + pathDst.css + '\'.'));
});

// js browserify
gulp.task('scripts', function () {
  var tasks = fs.readdirSync(pathSrc.scripts).filter(function (fileName) {
    return fs.lstatSync(pathSrc.scripts + '/' + fileName).isFile();
  }).map(function (fileName) {
    return browserify(pathSrc.scripts + '/' + fileName, {debug: true})
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source(fileName))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(pathDst.scripts))
        .on('end', gutil.log.bind(gutil, 'browserify \'' + path.join(pathDst.scripts, fileName) + '\'.'));
  });
  return merge(tasks);
});

// gulp.task('scripts', function () {
// 	return gulp.src(pathSrc.scripts + '*.js')
// 			.pipe(jshint('.jshintrc'))
// 			.pipe(jshint.reporter('default'))
// 			.pipe(gulp.dest(pathDst.scripts))
// 			.pipe(notify({ message: 'Scripts task complete' }));
// });

// compressJS
gulp.task('compressJS', function () {
  return gulp.src('./src/main/resources/public/bower_components/jQuery-photoClip/js/jquery.photoClip.js')
  //.pipe(jshint('.jshintrc'))
  //.pipe(jshint.reporter('default'))
      .pipe(uglify())
      .pipe(gulp.dest(pathDst.scripts))
      .pipe(notify({message: 'Scripts task complete'}));
});

gulp.task('images', function () {
  return gulp.src(pathSrc.images + '**/*')
      .pipe(gulp.dest(pathDst.images));
});

gulp.task('serve', ['watch'], function () {
  browserSync({
    files: pathDst.build,
    server: {
      baseDir: "./target/classes",
      index: "/templates/index.html"
    }
  });
});

gulp.task('watch', ['builds'], function () {
  gulp.watch(pathSrc.jade + '/**/*.jade', function () {
    gulp.run('jade');
  });

  gulp.watch(pathSrc.styl + '/**/*.styl', function () {
    gulp.run('styles');
  });

  gulp.watch(pathSrc.scripts + '/**/*.js', function () {
    gulp.run('scripts');
  });

  gulp.watch(pathSrc.bower + '**/*', function () {
    gulp.run('bower');
  });

  gulp.watch(pathSrc.images + '**/*', function () {
    gulp.run('images');
  });
});

gulp.task('watch.styles', function () {
  gulp.watch(pathSrc.styl + '/**/*.styl', function () {
    gulp.run('styles');
  });
});


/**
 * task: builds & watch.dev
 */
gulp.task('builds', ['copy.resources'], function () {
  gulp.start('styles', 'scripts');
});

gulp.task('watch.dev', ['builds', 'watch.resources', 'watch.js', 'watch.styles']);


// -------------------- watch.js --------------------

var JSSrc = pathSrc.scripts;
var JSDest = pathDst.scripts;

gulp.task('clean.js', function (cb) {
  del(JSDest + '/**/*', cb);
});

gulp.task('watch.js', function () {
  function watch(fileName, dest) {
    var b = watchify(browserify(fileName, {debug: true, cache: {}, packageCache: {}, fullPaths: true}));
    var destPath = path.join(JSDest, dest);

    function bundle() {
      return b.bundle()
          .on('error', gutil.log.bind(gutil, 'Browserify Error'))
          .pipe(source(dest))
          .pipe(gulp.dest(JSDest))
          .on('end', gutil.log.bind(gutil, 'browserify \'' + destPath + '\'.'));
    }

    b.on('update', bundle);
    b.on('log', gutil.log);
    return bundle();
  }

  var tasks = fs.readdirSync(JSSrc).filter(function (fileName) {
    return fs.lstatSync(JSSrc + '/' + fileName).isFile();
  }).map(function (fileName) {
    return watch(JSSrc + '/' + fileName, fileName);
  });
  return merge(tasks);
});
