var gulp = require('gulp'),
    args = require('yargs').argv,
    useref = require('gulp-useref'),
    sass = require('gulp-sass'),
    $ = require('gulp-load-plugins')({lazy: true}),
    del = require('del'),
    browserSync = require('browser-sync'),
    connect = require('gulp-connect'),
    print = $.print.default;
var config = require('./gulp.config')();
var port = process.env.port || 7203;

function vet() {
    log('vetting code started, ' + config);
    return gulp.src(config.allJs)
        .pipe($.if(args.verbose, print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
}

function styles() {
    log('sass compilation started');
    return gulp.src(config.sass)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe($.if(args.verbose, print()))
        .pipe($.plumber())
        .pipe(sass(
            {bundleExec: false, tmpPath: './temp', outputStyle: 'expanded'}
        ))
        // .on('error', errorLogger)
        .pipe($.autoprefixer())
        .pipe(gulp.dest(config.temp));
}

function errorLogger(err) {
    log('start logging error');
    log(err);
    log('finish logging error');
    this.emit('end');
}

function log(msg) {
    if(typeof msg === 'object'){
        for(var item in msg) {
            if ( msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
gulp.task('tasks', $.taskListing);
gulp.task('default', gulp.series('tasks'));

gulp.task('vet', vet);

gulp.task('sass', async function () {
    var files = config.temp + '**/*.css';
    log('deleting old files ' + files);
    await del(files);
    styles();
});

gulp.task('css-watcher', function () {
    log('styles are being watched');
    gulp.watch(config.sass, gulp.series('sass'));
});


gulp.task('wiredep', function () {
    log('wiredep started');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client))
        .pipe(connect.reload());
});

gulp.task('inject-css', function () {
    log('inject custom css started');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

gulp.task('optimize', function () {
    log('optimize css, javascript started');
    var cssFilter = $.filter(config.css, {restore: true});

    return gulp
        .src(config.css)
        .pipe($.plumber())
        .pipe($.csso())
        .pipe(gulp.dest(config.temp + '/minified/'));
});

gulp.task('inject', gulp.series('sass', 'wiredep', 'inject-css'));

gulp.task('serve-dev', gulp.series('inject', function () {
    var isDev = true;
    var options = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'port': port,
            'NODE_ENV': isDev ? 'dev' : 'prod',
        },
        watch: [config.server]
    };
    $.nodemon(options)
        .on('restart', gulp.series('vet', function() {
            log('nodemon restart');
            setTimeout(() => {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream: false});
            }, 1000);
        }))
        .on('start', function() {
            log('nodemon start');
            startBrowserSync();
        })
        .on('crash', function() {
            log('nodemon crash');
        })
        .on('exit', function() {
            log('nodemon exit');
        });
}));

function startBrowserSync() {
    if(browserSync.active){
        return;
    }
    log('start browser sync on port ' + port);
    gulp.watch(config.sass, gulp.series('sass'));
    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: [
            config.client + '**/*.*',
            '!' + config.sass,
            config.temp + '**/*.css',
        ],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };
    browserSync(options);
}
