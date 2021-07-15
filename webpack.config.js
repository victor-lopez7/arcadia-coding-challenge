const serverConfig = require('./webpack/node.webpack.config.js')
const clientConfig = require('./webpack/web.webpack.config.js')

module.exports = [ serverConfig, clientConfig ];