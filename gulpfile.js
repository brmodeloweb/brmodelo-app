var gulp = require('gulp');
var sass = require('gulp-sass');
var server = require('gulp-express');

gulp.task('compileStyles', function() {
	gulp.src('app/sass/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./app/css/'));
	gulp.watch('app/sass/**/*.scss',['compileStyles']);
});//End task compileStyles

gulp.task('copy', function() {
	gulp.src([
		'node_modules/angular-ui-bootstrap/ui-bootstrap.js',
		'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.min.js',
		'node_modules/angular-modal-service/dst/angular-modal-service.min.js',
		'node_modules/angular/angular.min.js',
		'node_modules/angular-ui-router/build/angular-ui-router.min.js',
		'node_modules/angular-cookies/angular-cookies.min.js'
	]).pipe(gulp.dest('build/libs/'));

	gulp.src([
		'node_modules/bootstrap/dist/**/*'
	]).pipe(gulp.dest('build/bootstrap'));

	gulp.src([
		'app/css/Sweet-Feedback/css/sweetfeedback.css',
		'app/css/Sweet-Feedback/images/iconError.png',
		'app/css/Sweet-Feedback/images/iconInfo.png',
		'app/css/Sweet-Feedback/images/iconSuccess.png',
		'app/css/Sweet-Feedback/images/iconWarning.png',
		'app/css/Sweet-Feedback/images/noise.png',
		'app/css/Sweet-Feedback/images/noiseStripes.png',
	]).pipe(gulp.dest('build/sweetfeedback/'));
});//End task copy

gulp.task('server', function () {
	server.run(['server.js']);
});//End task server

gulp.task('default', ['compileStyles','copy','server']);