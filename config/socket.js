var path = require('path'),
    config = require('./config'),
    socketioJwt = require('socketio-jwt'),
    User = require('mongoose').model('User'),
    io = require('socket.io')(config.socketPort);

io.use(socketioJwt.authorize({
    secret: config.tokenSecret,
    handshake: true
}));

io.sockets.on('connection', function(socket){
    User.findOneAndUpdate({ _id: socket.decoded_token.sub },{ socketId : socket.id },function(err,user){
        socket.user = user;
        console.log( socket.user.username,'connected');
        config.getGlobbedFiles('./src/**/*.socket.js').forEach(function(routePath){
            require(path.resolve(routePath))(io,socket);
        })
    });

    socket.on('disconnect',function(){
        console.log(socket.user, ' disconnected');
        User.findOneAndUpdate({ _id: socket.user._id },{ socketId : 'null' },function(err,user){
            console.log(err,user);
        });
    })

});


module.exports = io;
