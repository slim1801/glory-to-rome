var socketIO = require('./socket.js')();

module.exports = function (server, session) {
    
    this.io = require('socket.io')(server);
    io.set("origins", "*:*");

    // On someone connected
    io.on('connection', function(socket) {
        session(socket.handshake, {}, err => {
            var session = socket.handshake.session;
            session.uid = Math.random().toString(36).substring(7);
            session.save(error => {
                console.log('User connected');
                console.log("Session ID: ", socket.handshake.session.uid);
                socket.emit('connected', { uid: socket.handshake.session.uid });
                socketIO.listen(socket);
            });
        });
    }.bind(this));

    return this;
};