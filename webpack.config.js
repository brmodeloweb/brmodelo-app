const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
	mode: process.env.NODE_ENV,
	context: `${__dirname}/app`,
	entry: "./react/index.tsx",
	output: {
		path: `${__dirname}/app/dist`,
		filename: isProduction ? "[name].[contenthash].js" : "[name].js",
		chunkFilename: isProduction ? "[name].[contenthash].chunk.js" : "[name].chunk.js",
		publicPath: "/",
		clean: true, // Clean dist folder before build
	},
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(__dirname, "app/react/tsconfig.json"),
			}),
		],
	},
	devtool: isProduction ? false : "eval-cheap-module-source-map",
	devServer: {
		static: path.join(__dirname, "app"),
		compress: true,
		port: 9000,
		hot: true,
		historyApiFallback: true,
		client: {
			overlay: {
				errors: true,
				warnings: false,
			},
		},
		// Experimental: lazy compilation for faster dev startup
		...(isDevelopment && {
			devMiddleware: {
				writeToDisk: false,
			},
		}),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "index.html",
			favicon: `${__dirname}/app/img/brmw-logo.svg`,
		}),
		new MiniCssExtractPlugin({
			filename: isProduction ? "[name].[contenthash].css" : "bundle.css",
			chunkFilename: isProduction ? "[name].[contenthash].chunk.css" : "[id].css",
		}),
		// Bundle analyzer - run with ANALYZE=true environment variable
		...(process.env.ANALYZE === "true"
			? [
					new BundleAnalyzerPlugin({
						analyzerMode: "static",
						openAnalyzer: true,
					}),
			  ]
			: []),
	],
	optimization: {
		moduleIds: "deterministic", // Better long-term caching
		runtimeChunk: "single", // Extract runtime code
		minimize: isProduction,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					compress: {
						drop_console: isProduction, // Remove console logs in production
					},
				},
			}),
			new CssMinimizerPlugin(),
		],
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				// Separate vendor code (node_modules)
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					priority: 10,
					reuseExistingChunk: true,
				},
				// Separate React and related libraries
				react: {
					test: /[\\/]node_modules[\\/](react|react-dom|react-i18next|i18next)[\\/]/,
					name: "react",
					priority: 20,
					reuseExistingChunk: true,
				},
				// Separate JointJS
				jointjs: {
					test: /[\\/]node_modules[\\/]@joint[\\/]/,
					name: "jointjs",
					priority: 20,
					reuseExistingChunk: true,
				},
				// Common code shared between modules
				common: {
					minChunks: 2,
					priority: 5,
					reuseExistingChunk: true,
					enforce: true,
				},
			},
		},
		// Enable module concatenation (scope hoisting) in production
		...(isProduction && { concatenateModules: true }),
	},
	// Performance budgets
	performance: {
		maxEntrypointSize: 512000, // 500kb
		maxAssetSize: 512000,
		hints: isProduction ? "warning" : false,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: "ts-loader",
					options: {
						transpileOnly: true, // Skip type checking for faster builds
						experimentalWatchApi: true, // Faster rebuilds in watch mode
					},
				},
				exclude: /node_modules/,
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						cacheDirectory: true, // Enable caching for faster rebuilds
						cacheCompression: false,
					},
				},
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
					// Use MiniCssExtractPlugin in production, style-loader in development
					isProduction ? MiniCssExtractPlugin.loader : "style-loader",
					{
						loader: "css-loader",
						options: {
							sourceMap: isDevelopment,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							sourceMap: isDevelopment,
						},
					},
					{
						loader: "sass-loader",
						options: {
							implementation: require("sass"),
							sourceMap: isDevelopment,
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
