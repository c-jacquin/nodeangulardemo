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