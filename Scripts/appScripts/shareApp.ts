"use strict";
import mainCtrlsModule = require("mainControllers");

export class shareApp {
    constructor(io : any) {
        var ngApp = angular.module('shareApp', ["ngRoute", "ngSanitize", "ui.bootstrap", "mainControllers"]);
        var mainCtrls = new mainCtrlsModule.mainControllers(io);
    }
}