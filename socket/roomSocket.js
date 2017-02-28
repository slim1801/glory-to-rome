var socketIO = require('./socket.js')();

module.exports = function (server) {
    
    this.io = require('socket.io')(server);
    io.set("origins", "*:*");

    // On someone connected
    io.on('connection', function(socket) {
        console.log('User connected');
        socket.emit('connected', { uid: socket.handshake.session.uid });
        console.log("SESSION ID: ", socket.handshake.session.uid);
        socketIO.listen(socket);
    }.bind(this));

    return this;
};