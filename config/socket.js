var config = require('../config/config'),
    path = require('path'),
    socketioJwt = require('socketio-jwt'),
    mongoose = require('mongoose'),
    Room = mongoose.model('Room'),
    User = mongoose.model('User');

var io = require('../src/chat/socketFactory').io;

io.use(socketioJwt.authorize({
    secret: config.tokenSecret,
    handshake: true
}));
Room.find(function(err,rooms){
    rooms.forEach(function(room){
        require('../src/chat/socketFactory').initRoom(room.name);
    })
});

io.sockets.on('connection', function(socket){
    console.log(socket.decoded_token.sub, 'connected');

    Room.find({},function(err,rooms) {
        socket.emit('room::list', rooms);
    });


    User.findOne({ _id: socket.decoded_token.sub },function(err,user){
        //console.log(user)
        socket.user = user;
    });

    config.getGlobbedFiles('./src/**/*.socket.js').forEach(function(routePath){
        require(path.resolve(routePath))(io, socket);
    })
});