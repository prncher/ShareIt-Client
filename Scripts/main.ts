/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/angularjs/angular-route.d.ts" />
requirejs.config({
    baseUrl: "Scripts/appScripts",
    paths: {
        "jquery": "../jquery-2.2.0.min",
        "bootstrap": "../bootstrap",
        "app": "./shareApp",
        "angular": "../angular",
        "ngRoute": "../angular-route",
        "ngSanitize": "../angular-sanitize",
        "mainCtrls": "./mainControllers",
        "loginCtrl": "./loginController",
        "routerCfg": "./configRouter",
        "serviceFactory": "./serviceHandler",
        "ui.bootstrap": "../angular-ui/ui-bootstrap-tpls",
        "socketio": "../socket.io"
    },
    shim: {
        "ngRoute": ['angular'],
        "ngSanitize": ['angular'],
        "ui.bootstrap": ['angular'],
        "bootstrap": ['jquery']
    }
});

requirejs(["app", "socketio", "bootstrap", "angular", "ngRoute", "ngSanitize", "ui.bootstrap"], (app, io) => {
    var shareApp = new app.shareApp(io);

    angular.element(document).ready(() => {
        angular.bootstrap(document, ['shareApp']);
    });
});