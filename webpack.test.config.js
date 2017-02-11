'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'inline-source-map',
    module: {
        loaders: [
            { loader: 'raw-loader', test: /\.(css|html)$/ },
            { test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/, loader: "file-loader" },
            { exclude: /node_modules/, loaders: ['awesome-typescript-loader?', 'angular2-template-loader'], test: /\.ts$/ }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts']
    }
}