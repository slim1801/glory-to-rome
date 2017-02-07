'use strict'

module.exports = function (config) {
    config.set({
        autoWatch: true,
        browsers: ['Chrome'],
        files: [
            'karma.entry.js'
        ],
        frameworks: ['jasmine'],

        colors: true,
        logLevel: config.LOG_INFO,

        preprocessors: {
            'karma.entry.js': ['webpack', 'sourcemap']
        },
        reporters: ['dots'],

        webpack: require('./webpack.test.config'),
        webpackServer: {
            noInfo: true
        }
    })
}