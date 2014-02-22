var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');
var nodemon = require('gulp-nodemon');

var files = require('./modules/files.js');

var paths = {
  scripts: ['public/js/data-record.js', 'public/js/script.js', 'public/js/throws.js'],
  dataDir: 'public/data/*'
};

//runs the server with nodemon
gulp.task('serve', function () {
    nodemon({
        script: 'server.js'
    });
});

//builds scripts with browserify to import in node module code
gulp.task('scripts', function() {
	gulp.src(paths.scripts)
    .pipe(browserify())
    .on('error', gutil.log)
    .pipe(gulp.dest('public/js/build'));
});

//creates a json file with a list of all the data files
gulp.task('file-lists', function() {
	files.makeList('public/data');
});

/*
* DEFAULT GULP TASK
*/
gulp.task('default', function(){
	//run everything once
	gulp.run('serve');
	gulp.run('scripts');
	gulp.run('file-lists');
	//watch js
	gulp.watch(paths.scripts, function() {
    gulp.run('scripts');
  })
  gulp.watch(paths.dataDir, function() {
  	gulp.run('file-lists');
  })
});