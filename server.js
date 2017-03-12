var http = require('http');

var webpackMiddleware = require("webpack-dev-middleware");
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var sessionStore = require('session-file-store')(expressSession);

// var session = expressSession({
//     store: new sessionStore({path: '/sessions'}),
//     secret: 'pass',
//     resave: true,
//     saveUninitialized: true
// });

var isDev = process.env.NODE_ENV !== "production";

// Get webpack configuration
var config = require('./webpack.dev.config');

// Config our server
var app = express();
app.set('port', process.env.PORT || 3000);
//app.use(session);

var router = express.Router();

// Set webpack as out compiler
var compiler = webpack(config);
// Setup session

var HTML_FILE = fs.readFileSync('./index.html', {
  encoding: 'utf-8'
});

if (isDev) {
    app.use(
        webpackMiddleware(compiler, {
            noInfo: true,
            publicPath: config.output.publicPath
        })
    )

    app.get('*', function(req, res) {
        res.status(200).send(HTML_FILE);
    });
}
else {
    var distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.send(path.join(distPath, "index.html")));
}

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

var port = process.env.PORT || 3000;
var server = http.createServer(app);

var io = require('./socket/roomSocket')(server).io;
// io.use(function(socket, next) {
//     session(socket.handshake, {}, next);
// });

server.listen(app.get('port'), (err) => {
    if (err) {
        console.error(err);
    }
    console.log('Listening on port: ' + app.get('port'));
});