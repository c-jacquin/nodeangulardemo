var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    multer = require('multer'),
    config = require('./config'),
    path = require('path'),
    serveStatic = require('serve-static');


module.exports = function () {
    var app = express();

    app.set('view engine', 'ejs');

    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    app.use(serveStatic('public/'));

    app.use(compress());

    app.use(multer({dest: './public/upload/'}));

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    app.use(require('cors')());

    config.getGlobbedFiles('./src/**/*.model.js').forEach(function (routePath) {
        require(path.resolve(routePath));
    });

    config.getGlobbedFiles('./src/**/*.ctrl.js').forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        // Log it (or store it in a mongodb collection)
        console.error(err.stack);

        // Error management
        res.status(500).render('500');
    });

    app.all('/*',function(req,res){
        res.render('index');
    });

    return app;
};