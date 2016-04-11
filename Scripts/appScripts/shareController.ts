"use strict";
import ng = angular;
import serviceModule = require("serviceHandler");
const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

export class shareController {
    location: ng.ILocationService;
    serviceFactory: serviceModule.serviceHandler;
    parent: any;
    file: any;
    socket: any;
    public contents: any;
    public files: any;
    public buddies: any;
    public buddyContents: any;
    public buddyFiles: any;
    public buddiesClipsCollapsed: boolean;

    constructor($scope: ng.IScope, $location: ng.ILocationService, services: serviceModule.serviceHandler, socket : any) {
        this.parent = $scope.$parent;
        this.contents = [];
        this.files = [];
        this.buddies = [];
        this.buddyContents = [];
        this.buddyFiles = [];
        this.serviceFactory = services;
        this.location = $location;
        this.parent.ctrl.validate();
        this.file = "";
        this.buddiesClipsCollapsed = true;
        this.socket = socket;
        this.socket.on('file', this.respondFileBroadcast());
        this.socket.on('resource', this.respondResourceBroadcast());
        if (this.parent.ctrl.loggedIn) {
            this.getBuddies();
            this.getContents();
            this.getFiles();
        };
    }

    public upload(): void {
        var self = this;
        this.serviceFactory.uploadFile(self.parent.ctrl.loggedInUser.id, this.file).then((response) => {
            if (response.status === 201) {
                self.insertFile(response.data);
                self.parent.ctrl.message = "File uploaded";
            }
        }).catch(this.showErrorMessage());
    };

    public editload(ngModel: ng.INgModelController): void {
        var self = this;
        var resource = { "studentId": self.parent.ctrl.loggedInUser.id, "resource": self.convertToByteArray(ngModel.$viewValue) };
        ngModel.$viewValue = '';
        ngModel.$render();
        this.serviceFactory.uploadResource(resource).then((response) => {
            if (response.status === 201) {
                var decoded = self.convertFromByteArray(response.data.resource);
                self.contents.push(decoded);
            }
        }).catch(this.showErrorMessage());
    }

    private respondResourceBroadcast(): Function {
        var self = this;
        return (data: any) => {
            var id = data && parseInt(data.studentId);
            if (id === self.parent.ctrl.loggedInUser.id) {
                //update resources for self
                self.insertResource(data)
            }
            else {
                //update resources for buddies
                self.updateBuddyContent(id);
            }
        }
    };

    private respondFileBroadcast(): Function {
        var self = this;
        return (data: any) => {
            var id = data && parseInt(data.studentId);
            if (id === self.parent.ctrl.loggedInUser.id) {
                //update files for self
                self.insertFile(data);
            }
            else {
                //update files for buddies
                self.updateBuddyFiles(id);
            }
        }
    };

    private getBuddies(): void {
        var self = this;
        this.serviceFactory.getBuddies(this.parent.ctrl.loggedInUser.id).then((response) => {
            if (response.status === 200) {
                var buddies = response.data;
                angular.forEach(buddies, (buddy: any, key: number) => {
                    self.buddies.push(buddy);
                    var buddyContent = {
                        "buddy": buddy,
                        "contents": []
                    };

                    self.getBuddyContent(buddyContent);

                    var buddyFile = {
                        "buddy": buddy,
                        "files": []
                    };

                    self.getBuddyFiles(buddyFile);
                });
            }
        }).catch(this.showErrorMessage());
    };

    private getBuddyContent(buddyContent: any): void {
        var self = this;
        this.serviceFactory.getResources(buddyContent.buddy.id).then((response) => {
            if (response.status === 200) {
                var resources = response.data;
                for (var x in resources) {
                    var content = resources[x];
                    content.resource = self.convertFromByteArray(content.resource);
                    buddyContent.contents.push(content);
                }

                self.buddyContents.push(buddyContent);
            }
        }).catch(this.showErrorMessage());
    };

    private getBuddyFiles(buddyFile: any): void {
        var self = this;
        this.serviceFactory.getFiles(buddyFile.buddy.id).then((response) => {
            if (response.status === 200) {
                var files = response.data;
                angular.forEach(files, (fd: any, key: number) => {
                    buddyFile.files.push(fd);
                });

                self.buddyFiles.push(buddyFile);
            }
        }).catch(this.showErrorMessage());
    };

    private getContents(): void {
        var self = this;
        this.serviceFactory.getResources(this.parent.ctrl.loggedInUser.id).then((response) => {
            if (response.status === 200) {
                var resources = response.data;
                for (var x in resources) {
                    var content = resources[x];
                    content.resource = self.convertFromByteArray(content.resource);
                    self.contents.push(content);
                }
            }
        }).catch(this.showErrorMessage());
    }

    private getFiles(): void {
        var self = this;
        this.serviceFactory.getFiles(this.parent.ctrl.loggedInUser.id).then((response) => {
            if (response.status === 200) {
                var files = response.data;
                angular.forEach(files, (fd: any, key: number) => {
                    self.files.push(fd)
                });
            }
        }).catch(this.showErrorMessage());
    };

    private convertToByteArray(input: string): Array<number> {
        var result: Array<number> = [];
        for (var i = 0; i < input.length; ++i) {
            result[i] = input.charCodeAt(i);
        }
        return result;
    };

    private convertFromByteArray(input: Array<number>): string {
        var output: string = "";
        for (var i = 0; i < input.length; i++) {
            output += String.fromCharCode(input[i]);
        }

        return output;
    };

    private showErrorMessage(): any {
        var self = this;
        return (reason: any) => {
            if (reason.status !== 404) {
                self.parent.ctrl.message = reason.data.Message + ";" + reason.data.ExceptionMessage;
            }
        }
    };

    private insertFile(data : any): void {
        var notExist = true;

        this.files.forEach((file : any, index : number) => {
            if (file.name === data.name) {
                notExist = false;
            }
        });

        notExist && this.files.push(data);
    }

    private insertResource(data: any): void {
        var notExist = true;

        this.contents.forEach((content: any, index: number) => {
            if (content.resourceId === data.resourceId) {
                notExist = false;
            }
        });

        if (notExist) {
            this.contents = [];
            this.getContents();
        }
    }

    private getBuddy(id: number): any {
        this.buddies.forEach((buddy: any, index: number) => {
            if (buddy.id === id) {
                return buddy;
            }
        });
    }

    private updateBuddyContent(id : number): any {
        this.buddyContents.forEach((buddyContent: any, index: number) => {
            if (buddyContent.buddy.id === id) {
                buddyContent.contents = [];
                this.getBuddyContent(buddyContent);
            }
        });
    }

    private updateBuddyFiles(id: number): any {
        this.buddyFiles.forEach((buddyFile: any, index: number) => {
            if (buddyFile.buddy.id === id) {
                buddyFile.files = [];
                this.getBuddyFiles(buddyFile);
            }
        });
    }
}