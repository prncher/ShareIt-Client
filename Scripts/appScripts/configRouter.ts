"use strict";
import ng = angular;
import ngr = angular.route;
export class configRouter {
    constructor() {
    };

    public configure($routeProvider: ngr.IRouteProvider, $locationProvider: ng.ILocationProvider): void {
        $routeProvider.when("/Register",
            {
                templateUrl: "PartialViews/Register.html",
                controller: "RegisterController"
            }).when("/Buddies", {
                templateUrl: "PartialViews/Buddies.html",
                controller: "BuddiesController"
            }).when("/Share", {
                templateUrl: "PartialViews/Share.html",
                controller: "ShareController"
            }).otherwise({
                redirectTo: "/"
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
}