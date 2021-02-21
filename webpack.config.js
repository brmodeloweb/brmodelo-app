const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	context: `${__dirname}/app`,
	entry: "./angular/index.js",
	output: {
		path: `${__dirname}/app/dist`,
		filename: "bundle.js",
	},
	devServer: {
		contentBase: path.join(__dirname, "app"),
		compress: true,
		port: 9000,
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: `bundle.css`,
		}),
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				loader: "html-loader",
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				use: [
					{
						loader: "file-loader",
					},
				],
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: "css-loader",
					},
					{
						loader: "postcss-loader",
					},
					{
						loader: "sass-loader",
						options: {
							implementation: require("sass"),
						},
					},
				],
			},
			{
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "fonts/",
						},
					},
				],
			},
		],
	},
};

// module.exports = {
// 	context: `${__dirname}/app`,
// 	entry: ["./app/angular/app.js"],
// 	output: {
// 		path: path.resolve(__dirname, "dist"),
// 		filename: "js/app.min.js",
// 	},
// 	devServer: {
// 		contentBase: path.join(__dirname, "dist"),
// 		compress: true,
// 		port: 9000,
// 	},
// 	module: {
// 		rules: [
// 			{
// 				test: /\.js$/,
// 				exclude: /(node_modules)/,
// 				use: {
// 					loader: "babel-loader",
// 					options: {
// 						presets: ["@babel/preset-env"],
// 					},
// 				},
// 			},
// 			{
// 				test: /\.(png|jpg|ico|gif|eps)$/i,
// 				exclude: /node_modules/,
// 				use: [
// 					{
// 						loader: "file-loader",
// 						options: { outputPath: "img/", name: "[name].[ext]" },
// 					},
// 				],
// 			},
// 			{
// 				test: /\.s?css$/,
// 				exclude: /node_modules/,
// 				use: [
// 					{
// 						loader: "file-loader",
// 						options: { outputPath: "css/", name: "[name].min.css" },
// 					},
// 					"sass-loader",
// 				],
// 			},
// 		],
// 	},
// };
