var auth = require('./auth.middleware'),
    User = require('mongoose').model('User');


module.exports = function (app) {

    app.get('/api/me', auth.ensureAuthenticated, function(req, res) {
        User.findOne({ _id: req.user}, function(err, user) {
            if(err){
                res.status(400).json(user);
            }else{
                res.json(user);
            }
        });
    });


    app.post('/auth/signin', function(req, res) {
        User.findOne({ email: req.body.email }, '+password', function(err, user) {
            if (!user) {
                return res.status(401).send({ message: 'Wrong email' });
            }
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (!isMatch) {
                    return res.status(401).send({ message: 'Wrong password' });
                }
                res.send( user.tokenify());
            });
        });
    });

    app.post('/auth/signup', function(req, res) {
        User.findOne({ email: req.body.email }, function(err, existingUser) {
            if (existingUser) {
                return res.status(409).send({ message: 'Email is already taken' });
            }
            var data = {
                name: {
                    first: req.body.first,
                    last: req.body.last
                },
                email:req.body.email,
                password: req.body.password
            };
            var user = new User(data);

            user.save(function (err,createdUser) {
                if(err){
                    res.status(301).json(err);
                }else{
                    res.status(200).json(createdUser.tokenify());
                }
            });
        });
    });

};