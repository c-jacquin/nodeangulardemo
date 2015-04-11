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