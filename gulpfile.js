let gulp = require("gulp")
let sass = require("gulp-sass")
let sourcemaps = require("gulp-sourcemaps")
let autoprefixer = require("gulp-autoprefixer")
let gls = require("gulp-live-server")

// Sass variables
let input = "./app/sass/*.scss"
let output = "./app/css/"
let sassOptions = {
	errLogToConsole: true,
	outputStyle: "expanded"
}

gulp.task("sass", function () {
	return gulp
	.src(input)
	.pipe(sourcemaps.init())
	.pipe(sass(sassOptions).on("error", sass.logError))
	.pipe(sourcemaps.write())
	.pipe(autoprefixer())
	.pipe(gulp.dest(output))
}) // End task sass

gulp.task("watch", function() {
	return gulp
	.watch(input, ["sass"])
	.on("change", function(event) {
	console.log("File " + event.path + " was " + event.type + ", running tasks...")
	})
}) // End tast watch

gulp.task("copy", function() {
	gulp.src([
		"node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js",
		"node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
		"node_modules/angular/angular.min.js",
		"node_modules/angular/angular.min.js.map",
		"node_modules/angular-ui-router/release/angular-ui-router.min.js",
		"node_modules/angular-cookies/angular-cookies.min.js",
		"node_modules/angular-cookies/angular-cookies.min.js.map",
		"node_modules/textangular/dist/textAngular-rangy.min.js",
		"node_modules/textangular/dist/textAngular-sanitize.min.js",
		"node_modules/textangular/dist/textAngular.min.js",
		"node_modules/textangular/dist/textAngular.css"
	]).pipe(gulp.dest("build/libs/"))

	gulp.src([
		"node_modules/jquery/dist/jquery.min.js",
		"node_modules/jquery/dist/jquery.min.map"
	]).pipe(gulp.dest("build/joint/"))

	gulp.src([
		"node_modules/bootstrap/dist/**/*"
	]).pipe(gulp.dest("build/bootstrap"))

	gulp.src([
		"node_modules/jquery-nice-select/**/*"
	]).pipe(gulp.dest("build/jquery-nice-select"))

}) // End task copy

gulp.task("server", function () {
	let server = gls.new("server.js")
	server.start()
}) // End task server

gulp.task("default", ["sass","watch","copy","server"])
