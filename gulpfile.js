// gulpfile.js
var gulp = require('gulp');
var server = require('gulp-express');

gulp.task('copy', function() {
    gulp.src(['node_modules/angular-ui-bootstrap/ui-bootstrap.js',
    'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.min.js',
    'node_modules/angular-modal-service/dst/angular-modal-service.min.js',
    'node_modules/angular/angular.min.js',
    'node_modules/angular-ui-router/release/angular-ui-router.min.js',
    'node_modules/angular-cookies/angular-cookies.min.js'
  ]).pipe(gulp.dest('build/libs/'));

    gulp.src(['node_modules/bootstrap/dist/**/*'
  ]).pipe(gulp.dest('build/css/bootstrap'));

    gulp.src(['app/css/Sweet-Feedback/css/sweetfeedback.css',
    'app/css/Sweet-Feedback/images/iconError.png',
    'app/css/Sweet-Feedback/images/iconInfo.png',
    'app/css/Sweet-Feedback/images/iconSuccess.png',
    'app/css/Sweet-Feedback/images/iconWarning.png',
    'app/css/Sweet-Feedback/images/noise.png',
    'app/css/Sweet-Feedback/images/noiseStripes.png',
  ]).pipe(gulp.dest('build/sweetfeedback/'));

});

gulp.task('server', function () {
    // Start the server at the beginning of the task
    server.run(['server.js']);
});

gulp.task('default', ['copy','server']);

//var gulp = require('gulp')
//var concat = require('gulp-concat')

// gulp.task('js', function () {
//   gulp.src(['src/**/module.js', 'src/**/*.js'])
//     .pipe(concat('app.js'))
//     .pipe(gulp.dest('.'))
// })
//
// gulp.task('watch', ['js'], function () {
//   gulp.watch('src/**/*.js', ['js'])
// })
