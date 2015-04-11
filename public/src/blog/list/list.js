(function() {
    'use strict';

    angular.module('blog.list', [
        'common',
        'ui.router',
        'ngMaterial'
    ])
        .config(function ($stateProvider) {
            $stateProvider.state('blog.list', {
                url: '/list',
                views: {
                    blog: {
                        controller: 'ListController',
                        controllerAs: 'posts',
                        templateUrl: 'blog/list/list.tpl.html',
                        resolve: {
                            list: function (blog) {
                                return blog.findAll();
                            }
                        }
                    }
                }
            });
        })
        //on peut injecter list puisque nous l'avons specifier dans le resolve du bloc config
        //le service $mdBottomSheet permet d'animer un petit menu en bas de l'ecran
        .controller('ListController', function (blog,list, $timeout, $q, $mdDialog,$scope) {
            var self = this;
            self.list = list;

            $scope.$watch(function () {
                return blog.lastModified();
            }, function () {
                self.list = blog.getAll();
            });

            self.details = function($event,id){
                //ici on peut parametrer bcp de choses la doc est bien faite
                //comme par exemple passer des variables locales ou des promesses au controlleur de la bottomsheet
                $mdDialog.show({
                    templateUrl: 'blog/list/dialog.tpl.html',
                    resolve : {
                        post: function(blog){
                            return blog.find(id);
                        }
                    },
                    controller: function(blog, post, $mdToast){
                        var self = this;
                        self.post = angular.copy(post);
                        this.update = function(){
                            blog
                                .update(post._id,{
                                    title : self.post.title,
                                    content : self.post.content
                                })
                                .then(function(){
                                    $mdToast.show(
                                        $mdToast.simple()
                                            .content('post updated')
                                            .hideDelay(3000)
                                    );
                                    $mdDialog.hide();
                                })
                                .catch(function(err){
                                    console.log(err);
                                });
                        };

                        this.remove = function(){
                            blog
                                .destroy(post._id)
                                .then(function(){
                                    //self.list.splice($index,1);
                                    $mdToast.show(
                                        $mdToast.simple()
                                            .content('post removed')
                                            .hideDelay(3000)
                                    );
                                    $mdDialog.hide();
                                });
                        };
                    },
                    controllerAs: 'dialog',
                    targetEvent: $event
                }).then(function() {
                    //do something
                });
            };
        });
})();