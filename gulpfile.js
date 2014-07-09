/*
*   gulpfile.js
*   -----------
*   This file defines tasks for:
*     - running the server w/ nodemon
*     - compiling sass
*/
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var nodemon = require('gulp-nodemon');
var colors = require('colors')

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

//define file paths used by gulpn
var paths = {
  styles: {
    src:  'public/css/src/main.scss',
    files: './public/css/src/**/*.scss',
    dest: 'public/css'
  }
};

//runs the server with nodemon
gulp.task('serve', function () {
    nodemon({
        script: './bin/www',
        ext: null
    });
});

// Compile sass files
gulp.task('sass', function () {
    gulp.src(paths.styles.src)
      .pipe(sass({
        // outputStyle: 'compressed',
        // sourceComments: 'map',
        includePaths : [paths.styles.src]
      }))
      // If there is an error, don't stop compiling but use the custom displayError function
      .on('error', function(err){
        displayError(err);
      })
      // Pass the compiled sass through the prefixer with defined 
      // .pipe(prefix(
      //   'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'
      // ))
      .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('sass-watch', ['sass'], function() { 
  // Watch the files in the paths object, and when there is a change, fun the functions in the array
  gulp.watch(paths.styles.files, ['sass'])
  // Also when there is a change, display what file was changed, only showing the path after the 'sass folder'
  .on('change', function(evt) {
    console.log(
      '[watcher] File ' + evt.path.replace(/.*(?=sass)/,'') + ' was ' + evt.type + ', compiling...'
    );
  });
});

gulp.task('default', ['serve','sass'], function() { 
  // Watch the files in the paths object, and when there is a change, fun the functions in the array
  gulp.watch(paths.styles.files, ['sass'])
  // Also when there is a change, display what file was changed, only showing the path after the 'sass folder'
  .on('change', function(evt) {
    console.log(
      '[watcher] File ' + evt.path.replace(/.*(?=sass)/,'') + ' was ' + evt.type + ', compiling...'
    );
  });
});

// A display error function, to format and make custom errors more uniform
// Could be combined with gulp-util or npm colors for nicer output
var displayError = function(error) {

  // Initial building up of the error
  var errorString = '[' + error.plugin + ']';
  errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end
    
  // If the error contains the filename or line number add it to the string
  if(error.fileName)
    errorString += ' in ' + error.fileName;

  if(error.lineNumber)
    errorString += ' on line ' + error.lineNumber;

  // This will output an error like the following:
  // [gulp-sass] error message in file_name on line 1
  console.error(errorString);
}