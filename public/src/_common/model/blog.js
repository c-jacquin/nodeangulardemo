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