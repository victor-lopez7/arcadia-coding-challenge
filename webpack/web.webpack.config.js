const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const _output = 'dist'

module.exports = {
	mode: 'development',
	entry: "./frontend/src/index.tsx",
	output: {
		filename: '[name].arcadia-coding-challenge.js',
		path: __dirname + '/../' + _output + '/frontend',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	// Enable sourcemaps for debugging webpack's output.
	devtool: "source-map",

	resolve: {
	// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
	},

	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif|ico)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: 'images',
						},
					},
				],
			},
			{
				test: /\.svg$/,
				use: [
					'desvg-loader/react', // Add loader (use 'desvg-loader/react' for React)
					'svg-loader' // svg-loader must precede desvg-loader
				],
			},
			{
				test: /\.css$/,
				loader: [
					MiniCssExtractPlugin.loader,
					"css-loader"
				]
			},
			{
		    test: /\.scss$/,
		    loader: [
		      MiniCssExtractPlugin.loader,
		      "css-loader",
		      "sass-loader"
		    ],
		  },
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
			},
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'arcadia-coding-challenge.css'
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'frontend/public/index.html',
			templateParameters: {
				title: 'Test'
			},
			hash: true
		})
	]
};