var http = require('http');

var webpackMiddleware = require("webpack-dev-middleware");
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var session = expressSession({
    secret: 'pass',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
});

var isDev = process.env.NODE_ENV !== "production";

// Get webpack configuration
var config = require('./webpack.dev.config');

// Config our server
var app = express();
app.set('port', process.env.PORT || 3000);

var router = express.Router();

// Set webpack as out compiler
var compiler = webpack(config);

var HTML_FILE = fs.readFileSync('./index.html', {
  encoding: 'utf-8'
});


var port = process.env.PORT || 3000;
var server = http.createServer(app);

var io = require('./socket/roomSocket')(server, session).io;

app.use(session);

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

app.use((err, req, res, next) => {
    console.error("Error on request %s %s", req.method, req.url);
    console.error(err.stack);
    res.status(500).send("Server error");
});

process.on('uncaughtException', evt => {
    console.log('uncaughtException ', evt);
});

server.listen(app.get('port'), (err) => {
    if (err) {
        console.error(err);
    }
    console.log('Listening on port: ' + app.get('port'));
});