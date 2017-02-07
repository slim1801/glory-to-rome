var http = require('http');

var webpackMiddleware = require("webpack-dev-middleware");
var webpack = require('webpack');
var express = require('express');
var path = require('path');
var fs = require('fs');
// Get webpack configuration
var config = require('./webpack.dev.config');

// Config our server
var app = express();

var router = express.Router();

// Set webpack as out compiler
var compiler = webpack(config);

app.use(
    webpackMiddleware(compiler, {
        noInfo: true,
        publicPath: config.output.publicPath
    })
)

var index = fs.readFileSync('./index.html', {
  encoding: 'utf-8'
});

var str = index;

app.get('*', function(req, res) {
    res.status(200).send(str);
});

app.get('*', function(req, res) {
    res.status(404).send('Server.js > 404 - Page Not Found');
});

app.use((err, req, res, next) => {
    console.error("Error on request %s %s", req.method, req.url);
    console.error(err.stack);
    res.status(500).send("Server error");
});

process.on('uncaughtException', evt => {
    console.log('uncaughtException ', evt);
});

var port = process.env.PORT || '3000';
var server = http.createServer(app);

var io = require('./socket/roomSocket')(server).io;

server.listen(port, (err) => {
    if (err) {
        console.error(err);
    }
    console.log('Listening on port: ' + port);
});