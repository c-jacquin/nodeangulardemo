var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    config = require('../../config/config');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    socketId: {
        type: String
    }
});

userSchema.virtual('username').get(function(){
    return  this.email.split('@')[0];
});

userSchema.pre('save', function (next) {
    var user = this;
    user.password = bcrypt.hashSync(user.password,bcrypt.genSaltSync(10));
    next();

});

userSchema.methods.comparePassword = function (password, done) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

userSchema.methods.tokenify = function () {
    var self = this;
    var payload = {
        sub: self._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.tokenSecret);
};

mongoose.model('User', userSchema);