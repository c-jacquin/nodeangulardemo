var mongoose = require('mongoose'),
    Room = mongoose.model('Room'),
    User = mongoose.model('User');

function messages(socket){
    socket.on('message', function(message){
        var response = {
            sender: socket.user.username,
            content: message,
            date : Date.now()
        };
        socket.emit('message',response);
        socket.broadcast.emit('message',response);
    });
}


Room.find(function(err,rooms){
    rooms.forEach(function(room){
        Room
            .init(room.name)
            .then(function(socket){
                messages(socket);
            });
    })
});

module.exports = function(io, socket){

    Promise.all([
        Room.find({}).exec(),
        User.find({ socketId:{ $ne : null } }).exec()
    ]).then(function(data){
        socket.emit('room::list', data[0]);
        socket.emit('user::list', data[1]);
    }).catch(function(err){
        socket.emit('error',err);
    });

    messages(socket);

    socket.on('message::private',function(data){
        var response = {
            sender: socket.user.username,
            content: data.message
        };

        console.log(data.to);
        socket.broadcast.to(data.to).emit('message::private', response);
    });

    socket.on('room::create',function(roomName){
        var room = new Room({
            name : roomName,
            owner : socket.decoded_token.sub
        });
        room.save(function(err,room){
            Room
                .init(room.name)
                .then(function(roomSocket){
                    messages(roomSocket);
                    socket.broadcast.emit('room::new',room);
                    socket.emit('room::create',room);
                });
        });
    });
};