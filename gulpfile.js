"use strict";
const { series, parallel } = require('gulp');

const gulp = require("gulp");
const plumber = require('gulp-plumber');
const del = require("del");
const sass = require("gulp-sass");
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require("gulp-sourcemaps");
const cssnano = require('cssnano');
const gls = require("gulp-live-server");
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

// Input location variables
const scssInput = './app/sass/**/*';
const imgInput = './app/img/**/*';

// Output location variables
const cssAssets = './app/assets/css/';
const imgAssets = './app/assets/img/';

////////////////////////////////////////////////////////////////////////////////
//  Clear compiled files
////////////////////////////////////////////////////////////////////////////////
function clean() {
	return del(['./dist/', './app/assets/']);
}

////////////////////////////////////////////////////////////////////////////////
// Compile CSS task
////////////////////////////////////////////////////////////////////////////////
function scss(){
	const sassOptions = {
		errLogToConsole: true,
		outputStyle: 'expanded'
	};

	return gulp
	.src(scssInput)
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(sass(sassOptions).on('error', sass.logError))
	.pipe(postcss( [ autoprefixer(), cssnano() ] ))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(cssAssets))
}

////////////////////////////////////////////////////////////////////////////////
// Optimize images
////////////////////////////////////////////////////////////////////////////////
function imagesOptimize() {
	const imageOptimization = [
		imagemin.gifsicle({ interlaced: true }),
		imagemin.mozjpeg({ progressive: true }),
		imagemin.optipng({ optimizationLevel: 5 }),
		imagemin.svgo({
			plugins: [
				{
					removeViewBox: false,
					collapseGroups: true
				}
			]
		})
	];

	return gulp
	.src(imgInput)
	.pipe(newer(imgAssets))
	.pipe(imagemin(imageOptimization))
	.pipe(gulp.dest(imgAssets))
}

////////////////////////////////////////////////////////////////////////////////
// Copy files to libs/
////////////////////////////////////////////////////////////////////////////////
function copyToAssets() {
	const files = [
		//Jquery
		"node_modules/jquery/dist/**/*",
		// AngularJS
		"node_modules/angular/angular.min.js",
		"node_modules/angular/angular.min.js.map",
		// Angular UI Router
		"node_modules/angular-ui-router/release/angular-ui-router.min.js",
		"node_modules/angular-ui-router/release/angular-ui-router.min.js.map",
		// Angular Cookies
		"node_modules/angular-cookies/angular-cookies.min.js",
		"node_modules/angular-cookies/angular-cookies.min.js.map",
		// TextAngular
		"node_modules/textangular/dist/**/*",
		// Bootstrap + Augular UI Bootstrap
		"node_modules/bootstrap/dist/**/*",
		"node_modules/angular-ui-bootstrap/dist/**/*",
		// Font-awesome
		"node_modules/font-awesome/css/**/*",
		"node_modules/font-awesome/fonts/**/*",
		// Sweet-Feedback
		"node_modules/sweet-feedback/**/*",
		// Joint
		"node_modules/jointjs/dist/**/*",
	];

	return gulp
	.src(files, {base: '.'})
	.pipe(gulp.dest('./app/assets/'))
}

////////////////////////////////////////////////////////////////////////////////
// Local server
////////////////////////////////////////////////////////////////////////////////
function server() {
	let server = gls.new("./server.js")
	server.start()
}

////////////////////////////////////////////////////////////////////////////////
// Watch task
////////////////////////////////////////////////////////////////////////////////
function watch() {
	gulp.watch(scssInput, gulp.series(scss))
	.on('change', function(path) {
		console.log(`File ${path} was changed, running tasks...`);
	});
}

////////////////////////////////////////////////////////////////////////////////
// Export tasks
////////////////////////////////////////////////////////////////////////////////
exports.clean = clean;

exports.default = series(
	clean,
	scss,
	gulp.parallel(
		imagesOptimize,
		copyToAssets
	),
	gulp.parallel(
		watch,
		server
	)
);