const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	context: `${__dirname}/app`,
	entry: "./angular/index.js",
	output: {
		path: `${__dirname}/app/dist`,
		filename: "bundle.js",
	},
	devtool: "inline-source-map",
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
	resolve: {
		extensions: ['.js', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ["babel-loader"],
			},
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
