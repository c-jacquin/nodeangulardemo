var auth = require('../auth/auth.middleware'),
    Post = require('mongoose').model('Post');

module.exports = function (app) {

    app.route('/posts')
        .get(function(req,res){
            Post
                .find(req.query)
                .select('-content -comments')
                .exec(function(err,data){
                    if(!err){
                        res.json(data);
                    }
                });
        })
        .post(auth.ensureAuthenticated,function(req,res){
            var post = new Post(req.body);
            post.save(function(err,data){
                if(!err){
                    res.json(data);
                }else{
                    res.status(400).json(err);
                }
            });
        });


    app.route('/posts/:id')
        .get(function(req,res){
            Post
                .findOne({ _id: req.params.id })
                .populate('comments')
                .exec(function(err,data){
                    if(!err){
                        res.json(data);
                    }
                });
        })
        .put(function(req,res){
           Post
               .findOneAndUpdate({ _id: req.params.id },req.body)
               .exec(function(err,data){
                   if(!err){
                       res.json(data);
                   }
               });
        })
        .delete(function(req,res){
            Post
                .remove({ _id: req.params.id })
                .exec(function(err,data){
                    if(!err){
                        res.json(data);
                    }
                });
        });

};