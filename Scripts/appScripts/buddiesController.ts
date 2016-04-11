"use strict";
import ng = angular;
import serviceModule = require("serviceHandler");

export class buddiesController {
    location: ng.ILocationService;
    newBuddy: any;
    serviceFactory: serviceModule.serviceHandler;
    parent: any;
    foundBuddy: boolean;
    searchName: string;

    constructor($scope: ng.IScope, $location: ng.ILocationService, services: serviceModule.serviceHandler) {
        this.serviceFactory = services;
        this.location = $location;
        this.parent = $scope.$parent;

        this.foundBuddy = false;
        this.newBuddy = {};
        this.searchName = "";
        this.parent.ctrl.validate();
    }

    public search(): void {
        var self = this;
        this.serviceFactory.validateUser(this.searchName).then(function (response) {
            if (response.status === 200) {
                self.newBuddy = response.data;
                self.foundBuddy = true;
            }
        }).catch((reason) => {
            self.parent.ctrl.message = reason.data.Message + ";" + reason.data.ExceptionMessage;
            self.foundBuddy = false;
        });
        self.searchName = "";
    };

    public addBuddy(): void {
        var self = this;
        var buddy = { "studentId": self.parent.ctrl.loggedInUser.id, "buddyId": self.newBuddy.id };
        this.serviceFactory.addBuddy(buddy).then(function (response) {
            if (response.status === 201) {
                self.parent.ctrl.message = self.newBuddy.firstName + " " + self.newBuddy.lastName + " is a buddy now";
                self.newBuddy = {};
            }
        }).catch((reason) => {
            self.parent.ctrl.message = reason.data.Message + ";" + reason.data.ExceptionMessage;
        });

        self.foundBuddy = false;
    };
}