var mongoose = require('mongoose'),
    io = require('../../config/socket'),
    socketioJwt = require('socketio-jwt'),
    config = require('../../config/config'),
    User = mongoose.model('User');

var roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        index: true
    },
    users: [{
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

roomSchema.path('name').validate(function(name){
    return name.length < 50;
},'name too long');


var Room = mongoose.model('Room', roomSchema);


Room.init = function(name){
    return new Promise(function(resolve){
        io.of('/'+name)
            .use(socketioJwt.authorize({
                secret: config.tokenSecret,
                handshake: true
            }))
            .on('connection',function(socket){
                User.findOne({ _id: socket.decoded_token.sub },function(err,user){
                    socket.user = user;
                    console.log('connected room ',socket.user);
                    resolve(socket);
                });
            });
    });

};