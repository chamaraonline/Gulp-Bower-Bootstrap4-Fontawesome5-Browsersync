var gulp = require('gulp'),
    //sass = require('gulp-ruby-sass'),
    //mainBowerFiles = require('main-bower-files'),
    browserSync = require('browser-sync').create(),
    mainBowerFiles = require('gulp-main-bower-files'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gulpFilter = require('gulp-filter'),
	sass = require('gulp-sass'),
    notify = require("gulp-notify"),
    bower = require('gulp-bower');

var config = {
    mainjsPath:'./resources/js/*.js',
    jsPath:'./public/js',
    sassPath: './resources/sass',
    bowerDir: './bower_components'
}

// Static Server + watching scss/html files
gulp.task('serve', function() {
  
    browserSync.init({
        server: "./public"
    });

    gulp.watch("./resources/sass/**/*.scss", ['css']);
    gulp.watch("./resources/js/**/*.js", ['jsMain']);
    gulp.watch("./public/*.html").on('change', browserSync.reload);
});


gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir))
});

gulp.task('icons', function() {
    return gulp.src(config.bowerDir + '/fontawesome/web-fonts-with-css/webfonts/**.*')
        .pipe(gulp.dest('./public/webfonts'));
});

gulp.task('css', function() {
    return gulp.src(config.sassPath + '/style.scss')
        .pipe(sass({
            style: 'compressed',
            sourceComments: 'map',
            includePaths: [
                './resources/sass',
                config.bowerDir + '/bootstrap/scss',
                config.bowerDir + '/fontawesome/web-fonts-with-css/scss',
				
            ]
        })
            .on("error", notify.onError(function (error) {
                return "Error: " + error.message;
            })))
        .pipe(browserSync.stream())
        .pipe(gulp.dest('./public/css'));
});

//js task
gulp.task('jsBower', function() {
    var filterJS = gulpFilter('**/*.js', { restore: true });
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles({
            overrides: {
                bootstrap: {
                    main: [
                        './dist/js/bootstrap.js',
                    ]
                }

            }
        }))
        .pipe(filterJS)
        .pipe(concat('vendor.js'))
        //.pipe(uglify())
        .pipe(filterJS.restore)
        .pipe(browserSync.stream())
        .pipe(gulp.dest(config.jsPath));
});

gulp.task('jsMain', function() {
    return gulp.src(config.mainjsPath)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(browserSync.stream())
    .pipe(gulp.dest(config.jsPath));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(config.sassPath + '/**/*.scss' ,['css','jsBower','jsMain']);

});

gulp.task('default', ['bower', 'icons','jsBower','serve']);