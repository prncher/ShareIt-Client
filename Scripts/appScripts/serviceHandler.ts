"use strict";
import ng = angular;
interface IServiceHandler {
    assign(service: exportService): void;
    validateUser<T>(user: T): ng.IHttpPromise<T>;
    registerUser<T>(user: T): ng.IHttpPromise<T>;
    addBuddy<T>(buddy: T): ng.IHttpPromise<T>;
    getBuddies<T>(studentId: number): ng.IHttpPromise<T>;
    getResources<T>(studentId: number): ng.IHttpPromise<T>;
    getFiles<T>(studentId: number): ng.IHttpPromise<T>;
    uploadResource<T>(resource: T): ng.IHttpPromise<T>;
    uploadFile<T>(id: string, file: any): ng.IHttpPromise<T>;
}

export class exportService {
    $http: any;
    cacheFactory: ng.ICacheFactoryService;
    constructor($http: ng.IHttpService, $cacheFactory: ng.ICacheFactoryService) {
        this.cacheFactory = $cacheFactory;
        this.$http = $http;
        return this;
    }
}

export class serviceHandler implements IServiceHandler {
    service: exportService;
    cache: ng.ICacheObject;
    constructor() {
    }

    public assign(service: exportService): void {
        this.service = service;
    }

    public setToken(token: string): void {
        this.cache = this.service.cacheFactory('ShareIt');
        if (ng.isUndefined(this.cache.get('token'))) {
            this.cache.put('token', ng.isUndefined(token) ? null : token);
            this.service.$http.defaults.headers.common.Authorization = 'Bearer ' + token;
        }
    }

    public validateUser<T>(user: T): ng.IHttpPromise<T> {
        return this.service.$http({
            method: 'GET',
            url: '/api/Students?user=' + JSON.stringify(user)
        });
    };

    public registerUser<T>(user: T): ng.IHttpPromise<T> {
        return this.service.$http({
            method: 'POST',
            url: '/api/Students',
            data: user
        });
    };

    public addBuddy<T>(buddy: T): ng.IHttpPromise<T> {
        return this.service.$http({
            method: 'POST',
            url: '/api/Buddies',
            data: buddy
        });
    };

    public getBuddies<T>(studentId: number): ng.IHttpPromise<T> {
        return this.service.$http({
            method: 'GET',
            url: '/api/Buddies?studentId=' + studentId
        });
    };

    public getResources<T>(studentId: number): ng.IHttpPromise<T> {
        return this.service.$http({
            method: 'GET',
            url: '/api/Resource?studentId=' + studentId
        });
    };

    public getFiles<T>(studentId: number): ng.IHttpPromise<T> {
        return this.service.$http({
            method: 'GET',
            url: '/api/Files?studentId=' + studentId
        });
    };

    public uploadResource<T>(resource: T): ng.IHttpPromise<T> {
        return this.service.$http({
            method: 'POST',
            url: '/api/Resource',
            data: resource
        });
    };

    //public uploadFile<T>(id: string, file: any): ng.IHttpPromise<T> {
    //    var req = new XMLHttpRequest();
    //    var file2 = new Blob(['This is a test'], { type: 'text/plain' });
    //    var data = new FormData();

    //    data.append('file', file, id + '<' + file.name);

    //    req.open('POST', '/api/Files');
    //    req.send(data);
    //    return this.service.$http();
    //};


    public uploadFile<T>(id: string, file: any): ng.IHttpPromise<T> {
        var fd = new FormData();
        fd.append('file', file, id + '<' + file.name);
        return this.service.$http({
            method: 'POST',
            url: '/api/Files',
            data: fd,
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined, processData: false }
        });
    };
}