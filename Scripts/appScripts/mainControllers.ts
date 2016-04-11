"use strict";
import ng = angular;
import serviceModule = require("serviceHandler");
import loginCtrlModule = require("loginController");
import routerModule = require("configRouter");
import regCtrlModule = require("registerController");
import bdyCtrlModule = require("buddiesController");
import shareCtrlModule = require("shareController");

export class mainControllers {
    $parse: any;
    socket: any;
    constructor(io : any) {
        var app = angular.module("mainControllers", []);
        this.socket = io.connect(location.protocol + '//' + location.host + '/');

        var router = new routerModule.configRouter();
        app.config(router.configure);

        var serviceHandler = new serviceModule.serviceHandler();
        var serviceMod = app.factory("services", ["$http", "$cacheFactory", serviceModule.exportService]);
        app.controller('MainController', ($location, services) => new loginCtrlModule.loginController($location, services, serviceHandler));
        app.controller('RegisterController', ($scope, $location, services) => new regCtrlModule.registerController($scope, $location, serviceHandler));
        app.controller('BuddiesController', ($scope, $location, services) => new bdyCtrlModule.buddiesController($scope, $location, serviceHandler));
        app.controller('ShareController', ($scope, $location, services) => new shareCtrlModule.shareController($scope, $location, serviceHandler, this.socket));

        var self = this;
        app.directive('contenteditable', () => {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: self.linkEdit
            };
        });

        app.directive('fileModel', ['$parse', ($parse: any) => {
            var parse = $parse;
            return {
                restrict: 'A',
                link: (scope, element, attrs) => {
                    self.linkFile(scope, element, attrs, parse);
                }
            };
        }]);
    };

    private linkFile(scope: ng.IScope, element: any, attrs: any, $parse : any) : void {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', () => {
            scope.$apply(() => {
                modelSetter(scope, element[0].files[0]);
            });
        });
    }

    private linkEdit(scope: ng.IScope, element: any, attrs: any, ngModel: ng.INgModelController): void {
        if (!ngModel) return;

        ngModel.$render = function () {
            element.html(ngModel.$viewValue || '');
        };

        element.on('blur keyup change', function () {
            scope.$apply(read);
        });
        read();

        function read() {
            var html = element.html();
            if (attrs.stripBr && html == '<br>') {
                html = '';
            }
            ngModel.$setViewValue(html);
        };
    }
}