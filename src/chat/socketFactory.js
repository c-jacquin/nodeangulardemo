var config = require('../../config/config'),
    socketioJwt = require('socketio-jwt'),
    User = require('mongoose').model('User'),
    io = require('socket.io')(config.socketPort);

module.exports.io = io;

module.exports.initRoom = function(name){
    io.of('/'+name)
        .use(socketioJwt.authorize({
            secret: config.tokenSecret,
            handshake: true
        }))
        .on('connection',function(socket){
            User.findOne({ _id: socket.decoded_token.sub },function(err,user){
                socket.user = user;
                console.log('connected room ',socket.user.email);
                socket.on('message',function(message){
                    var response = {
                        sender: socket.user.email.split('@')[0],
                        content: message,
                        date : Date.now()
                    };
                    socket.emit('message',response);
                    socket.broadcast.emit('message',response);
                });
            });
        });
};