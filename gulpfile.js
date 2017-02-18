/*
ESEMPIO

gulp.task('mytask', function() {
  //do stuff
});

gulp.task('dependenttask', ['mytask'], function() {
  //do stuff after 'mytask' is done.
});

*/

var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var mocha = require('gulp-mocha');
var todo = require('gulp-todo');
var webpack = require('webpack-stream');
var request = require('sync-request');
var fs = require('fs');

//task per la build di tutti i componenti. 
gulp.task('build', ['build-client', 'build-server']);



//gulp.src punta ai file che voglio usare si usa .pipe per concatenare l'output ad altri plugin.
//gulp.dest punta alla cartella dove mettere i file
gulp.task('build-client', ['move-client'], function () {
  return gulp.src(['src/client/js/app.js'])
    .pipe(uglify())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(babel({
      presets: [
        ['es2015', { 'modules': false }]
      ]
    }))
    .pipe(gulp.dest('bin/client/js/'));
});

gulp.task('move-client', function () {
  return gulp.src(['src/client/**/*.*', '!client/js/*.js'])
    .pipe(gulp.dest('./bin/client/'));
});


gulp.task('build-server', function () {
  return gulp.src(['src/server/**/*.*', 'src/server/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('bin/server/'));
});


gulp.task('run', ['build'], function () {
    nodemon({
        delay: 10,
        script: './server/server.js',
        cwd: "./bin/",
        args: ["config.json"],
        ext: 'html js css'
    })
    .on('restart', function () {
        util.log('server riavviato!');
    });
});


gulp.task('default', ['run']);