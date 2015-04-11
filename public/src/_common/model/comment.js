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