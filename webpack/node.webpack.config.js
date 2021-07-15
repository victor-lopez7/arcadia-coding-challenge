const nodeExternals = require('webpack-node-externals')

const _output = 'dist'

module.exports = {
	target: 'node',
	mode: 'production',
	entry: {
		server: './backend/server.ts'
	},
	output: {
		filename: '[name].arcadia-coding-challenge.js',
		path: __dirname + '/../' + _output + '/backend',
	},
	// devtool: "source-map",
	resolve: {
	// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false,   // if you don't put this is, __dirname
    __filename: false,  // and __filename return blank or /
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
	module: {
		rules: [
		{
			test: /\.tsx?$/,
				loader: "ts-loader",
			},
		]
	},
	plugins: [
	]
};