var webpack = require('webpack');
var config = require("./webpack.dev.config.js");

config.devtool = "cheap-module-source-map";
config.plugins.concat([
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        mangle: { keep_fnames: true }
    }),
    new webpack.DefinePlugin({
        "process.env": {
            "NODE_ENV": JSON.stringify("production")
        }
    }),

]);

module.exports = config;