var jwt = require('jwt-simple'),
    moment = require('moment');

var config = require('../../config/config');

module.exports.ensureAuthenticated = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }

    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, config.tokenSecret);
    if (payload.exp <= moment().unix()) {
        return res.status(401).send({ message: 'Token has expired' });
    }
    req.user = payload.sub;

    console.log('ici');

    next();
};

module.exports.isAdmin = function (req, res, next) {
    next();
};