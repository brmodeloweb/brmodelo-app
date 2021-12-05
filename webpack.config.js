const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const CopyPlugin = require("copy-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

module.exports = {
	context: `${__dirname}/app`,
	entry: "./angular/index.js",
	output: {
		path: `${__dirname}/app/dist`,
		filename: "bundle.js",
	},
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx"],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(__dirname, "app/react/tsconfig.json"),
			}),
		],
	},
	devtool: "inline-source-map",
	devServer: {
		contentBase: path.join(__dirname, "app"),
		compress: true,
		port: 9000,
	},
	plugins: [
		new Dotenv({ systemvars: true }),
		new HtmlWebpackPlugin({
			template: "index.html",
			favicon: `${__dirname}/app/favicon.ico`,
		}),
		new MiniCssExtractPlugin({
			filename: `bundle.css`,
		}),
		new CopyPlugin({
			patterns: [
				{ from: `${__dirname}/app/img`, to: `${__dirname}/app/dist/img` },
			],
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
