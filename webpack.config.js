const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

module.exports = {
	mode: process.env.NODE_ENV,
	context: `${__dirname}/app`,
	entry: "./angular/index.js",
	output: {
		path: `${__dirname}/app/dist`,
		filename: "[name].js",
	},
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(__dirname, "app/react/tsconfig.json"),
			}),
		],
	},
	devtool: process.env.NODE_ENV === "production" ? false : "inline-source-map",
	devServer: {
		static: path.join(__dirname, "app"),
		compress: true,
		port: 9000,
	},
	plugins: [
		new Dotenv({ systemvars: true }),
		new HtmlWebpackPlugin({
			template: "index.html",
			favicon: `${__dirname}/app/img/brmw-logo.svg`,
		}),
		new MiniCssExtractPlugin({
			filename: `bundle.css`,
		}),
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true,
			}),
		],
		splitChunks: {
			chunks: "all",
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
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
				type: "asset/resource",
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					{
						loader: "style-loader",
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
				type: "asset/resource",
			},
		],
	},
};
