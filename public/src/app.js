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