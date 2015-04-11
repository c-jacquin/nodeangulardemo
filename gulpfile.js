var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    nodemon = require('gulp-nodemon');

var serverSrc = ['./index.js','./src/**/*.js'];

gulp.task('lintServer',function(){
   gulp.src(serverSrc)
       .pipe(jshint())
       .pipe(jshint.reporter('jshint-stylish'))
});


gulp.task('watchServer', function () {
    gulp.watch(serverSrc, ['lintServer']);
});


gulp.task('default',[
    'lintServer',
    'watchServer'
],function(){
    nodemon({
        script: 'index.js'
        , ext: 'js'
        , env: { 'NODE_ENV': 'development' }
    })
});



//Client angularJs (build)

var templateCache = require('gulp-angular-templatecache'),
    concat = require('gulp-concat'),
    annotate = require('gulp-ng-annotate');


var buildFolder = './public/js',
    jsSrc = './public/src/**/*.js',
    templateSrc = './public/src/**/*.html';

gulp.task('watchClient',[
    'buildJs',
    'cacheTemplates',
    'watchSource'
]);

gulp.task('buildJs', function () {
    gulp.src(jsSrc)
        .pipe(concat('all-source.js'))
        .pipe(gulp.dest(buildFolder));
});

gulp.task('cacheTemplates', function () {
    gulp.src(templateSrc)
        .pipe(templateCache({module: 'app'}))
        .pipe(gulp.dest(buildFolder))
});

gulp.task('watchSource', function () {
    gulp.watch(jsSrc, ['buildJs']);
    gulp.watch(templateSrc, ['cacheTemplates']);
});