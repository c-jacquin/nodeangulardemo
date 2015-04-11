var mongoose = require('mongoose'),
    config = require('../../config/config');


var roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});



roomSchema.path('name').validate(function(name){
    return name.length < 50;
},'name too long');

mongoose.model('Room', roomSchema);