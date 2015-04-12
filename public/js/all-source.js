(function(angular) {
    'use strict';

    angular.module('app', [
        'btford.socket-io',
        'ngMessages',
        'ngMaterial',
        'ui.router',
        'js-data',
        'login',
        'blog',
        'chat',
        'common'
    ])
        .config(function ($urlRouterProvider, $locationProvider, $sceProvider, $mdThemingProvider) {

            $sceProvider.enabled(false);
            $locationProvider.html5Mode(true);
            $urlRouterProvider.otherwise('/');

            $mdThemingProvider.theme('default')
                .primaryPalette('teal')
                .accentPalette('cyan');
        })

        .run(function () {
            console.log('run !!!');
        });
})(window.angular);
(function() {
    'use strict';

    angular.module('common', [])
        .config(function(DSProvider){
            DSProvider.defaults.basePath = 'http://localhost:5011';
        })
        .factory('socket', function (socketFactory,$window) {
            return socketFactory({
                ioSocket: $window.io.connect('http://localhost:5010',{
                    query: 'token=' + $window.localStorage.getItem('token')
                })
            });
        })
        .factory('roomFactory', function (socketFactory,$window) {
            return {
                join: function(name){
                    return socketFactory({
                        ioSocket: $window.io.connect('http://localhost:5010/'+name)
                    })
                }
            };
        })

})();
(function(){
    'use strict';
    angular.module('blog',[
        'blog.creation',
        'blog.list'
    ]).config(function($stateProvider){
        //ici l'état est abstract du coup on ne pourra pas s y rendre directement mais il sert de parents pour d'autres états ( layout )
        $stateProvider.state('blog',{
            abstract: true,
            views:{
                main: {
                    templateUrl: 'blog/blog.tpl.html',
                    controller: 'BlogController',
                    controllerAs: 'ctrl'
                }
            },
            resolve: {
                connected: function($http,$state){
                    return new Promise(function(resolve,reject){
                        $http
                            .get('http://localhost:5011/api/me')
                            .success(function(){
                                resolve();
                            })
                            .error(function(){
                                $state.go('login');
                                reject();
                            });
                    });

                }
            }
        });
    }).controller('BlogController',function($mdSidenav,$log,auth,$state){
        //$mdSidenav est fourni par ngMaterial et permet d'animer les directives md-sidenav ( menu lateral )
        this.toggleSideNav = function(){
            $mdSidenav('blog').toggle()
                .then(function(){
                    $log.debug("toggle RIGHT is done");
                });
        };

        this.logout = function(){
            auth.signOut();
            $state.go('login');
        };
    });
})();
(function(angular){
    'use strict';

    angular.module('chat',[
        'common'
    ])
        .config(function($stateProvider){
            $stateProvider.state('chat',{
                url: '/chat',
                views:{
                    main: {
                        templateUrl: 'chat/chat.tpl.html',
                        controller: 'ChatController'
                    }
                },
                resolve: {
                    me: function($http,$state){
                        return new Promise(function(resolve,reject){
                            $http
                                .get('http://localhost:5011/api/me')
                                .success(function(){
                                    resolve();
                                })
                                .catch(function(){
                                    $state.go('login');
                                    reject();
                                });
                        });

                    }
                }
            });
        })
        .controller('ChatController',function($scope,socket,$window,$mdSidenav,auth,$state,$mdDialog, $mdToast){

            $scope.toggleRooms = function(){
                $mdSidenav('chatrooms').toggle()
            };

            $scope.toggleUsers = function(){
                $mdSidenav('chatusers').toggle()
            };

            $scope.logout = function(){
                socket.disconnect();
                auth.signOut();
                $state.go('login');
            };

            $scope.messages = [];

            socket.on('message',function(message,e){
                console.log(message)
                $scope.messages.push(message)
            });

            $scope.sendMessage = function(){
                socket.emit('message',$scope.message);
            };

            $scope.joinRoom=function(room){
                $mdDialog.show({
                    templateUrl: 'chat/room.tpl.html',
                    controller: function($scope,roomFactory){
                        console.log(room);
                        var roomSocket = roomFactory.join(room);
                        $scope.messages = [];

                        roomSocket.on('message',function(message,e){
                            console.log(message,e)
                            $scope.messages.push(message)
                        });

                        $scope.sendMessage = function(){
                            roomSocket.emit('message',$scope.roomMessage);
                        };

                        $scope.leave = function(){

                        }
                    }

                });
            };

            $scope.privateMessage = function(user){

                socket.emit('message::private',{
                    to: user.socketId
                });

            };

            socket.on('message::private',function(message){
                $mdToast.show(
                    $mdToast.simple()
                        .content(message.sender+ ' : pokes you')
                        .hideDelay(20000)
                )
            });

            $scope.rooms = [];
            $scope.users = [];

            socket.on('user::list',function(users){
               $scope.users = users;
            });

            socket.on('user::new',function(user){
                console.log(user)
                $scope.users.push(user);
            });

            socket.on('room::list',function(rooms){
                $scope.rooms = rooms;
                console.log('rooms',rooms)
            });

            socket.on('room::new',function(room){
                console.log(room)
                $scope.rooms.push(room);
            });

            $scope.createRoom = function(){
                socket.emit('room::create',$scope.myRoom.name);
                socket.once('room::create',function(room){
                    console.log(room)
                    $scope.rooms.push(room);
                })
            }
        })
})(window.angular);
(function() {
    'use strict';

    angular.module('login', [
        'ui.router',
        'common'
    ])
        .config(function ($stateProvider,$httpProvider) {
            $httpProvider.interceptors.push(function ($window) {
                return {
                    request: function addTokenToHeader(httpConfig) {
                        var token = $window.localStorage.getItem('token');
                        if (token) {
                            httpConfig.headers.Authorization = 'Bearer ' + token;
                        }
                        return httpConfig;
                    }
                };
            });

            $stateProvider.state('login', {
                url: '/',
                views: {
                    main: {
                        templateUrl: 'login/login.tpl.html',
                        controller: 'LoginController',
                        controllerAs: 'login'
                    }
                }
            });
        })
        .factory('auth',function($http,$window,$q){
            return {
                signIn: function(user){
                    return $q(function(resolve,reject){
                        $http
                            .post('/auth/signin',user)
                            .success(function(data){
                                $window.localStorage.setItem('token', data);
                                resolve(data);
                            })
                            .catch(function(err){
                                reject(err);
                            });
                    });
                },
                signOut: function(){
                    $window.localStorage.removeItem('token');
                },
                signUp: function(user) {
                    return $q(function (resolve, reject) {
                        $http
                            .post('/auth/signup', user)
                            .success(function (data) {
                                $window.localStorage.setItem('token', data);
                                resolve(data);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                    });
                }
            };
        })

        .controller('LoginController', function (auth,$state,$mdToast) {
            var self = this;
            this.signIn = function(){
                auth
                    .signIn(self.user)
                    .then(function(){
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Welcome')
                                .hideDelay(3000)
                        );
                        $state.go('blog.list');
                    });
            };

            this.signUp = function(){
                auth
                    .signUp(self.user)
                    .then(function(){
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Account created, Welcome')
                                .hideDelay(3000)
                        );
                        $state.go('blog.list');
                    });
            };


        });
})();
(function() {
    'use strict';

    angular.module('common')
        .factory('blog', function (DS) {
            return DS.defineResource({
                name: 'post',
                idAttribute: '_id',
                endpoint: 'posts'
            });
        });
})();
(function() {
    'use strict';

    angular.module('common')
        .factory('comment', function (DS) {
            return DS.defineResource({
                name: 'comment',
                idAttribute: '_id',
                endpoint: 'comment',
                belongsTo: {
                    post: {
                        localKey: 'post',
                        localField: 'post',
                        parent: true
                    }
                }
            });
        });
})();
(function() {
    'use strict';

    angular.module('blog.creation', [
        'common',
        'ui.router',
        'ngMaterial'
    ])
        .config(function ($stateProvider) {
            $stateProvider.state('blog.creation', {
                url: '/post',
                views: {
                    blog: {
                        controller: 'CreationController',
                        controllerAs: 'blog',
                        templateUrl: 'blog/creation/creation.tpl.html'
                    }
                }
            });
        })
        .controller('CreationController', function (blog,$mdToast) {
            var self = this;
            this.submit = function () {
                blog
                    .create(self)
                    .then(function () {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('post created')
                                .hideDelay(3000)
                        );
                    });
            };

        });
})();
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