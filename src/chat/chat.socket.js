var Room = require('mongoose').model('Room');

module.exports = function(io, socket){

    socket.on('message', function(message){
        var response = {
            sender: socket.user.email.split('@')[0],
            content: message,
            date : Date.now()
        };
        socket.emit('message',response);
        socket.broadcast.emit('message',response);    });


    socket.on('room::create',function(roomName){
        var room = new Room({
            name : roomName,
            owner : socket.decoded_token.sub
        });
        room.save(function(err,room){
            require('./socketFactory').initRoom(room.name);
            socket.broadcast.emit('room::new',room);
            socket.emit('room::create',room);
        });
    });
};