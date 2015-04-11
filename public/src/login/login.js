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