(function(){
    'use strict';

    angular.module('dplm.settings', [])

        .config(function ($routeProvider) {
            $routeProvider.when('/settings', {
                controller: 'SettingsController',
                templateUrl: 'js/settings/settings.html'
            });
        })

        .controller('SettingsController', function ($scope, $location, $translate, ConfigurationService,WorkspaceService) {
            $scope.configuration = ConfigurationService.configuration;

            $scope.save = function () {
                ConfigurationService.save();
                ConfigurationService.reset();
                WorkspaceService.reset();
                $location.path('home');
            };

            $scope.lang = localStorage.lang || 'en';

            $scope.$watch('lang', function (newValue) {
                if (newValue) {
                    localStorage.lang = $scope.lang;
                    $translate.use(newValue);
                }
            });

        });
})();
