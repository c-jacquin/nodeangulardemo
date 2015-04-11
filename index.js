require('./config/init')();

var config = require('./config/config');

var app = require('./config/express')();

var mongoose = require('mongoose');

mongoose.connect(config.db.address, {
    user: config.db.user,
    pass: config.db.pass
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connected to mongodb');

    app.listen(config.port, function(){
        require('./config/socket');
        console.log('Formation nodeJs Api api started on port ' + config.port);
    });
});


module.exports = app;