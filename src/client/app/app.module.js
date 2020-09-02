(function() {

    'use strict';
    var i = 0;
    var o = 4/0;
    angular.module('app', [
        /* Shared modules */
        'app.core',
        'app.widgets',

        /* Feature areas */
        'app.customers',
        'app.dashboard',
        'app.layout'
    ]);
})();
