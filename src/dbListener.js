/**
 * Created by qde3485 on 02/06/16.
 */

function DbListener(isWriting, isMock) {
    this.loadData = callback => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                isWriting && register(JSON.parse(xmlHttp.responseText));
                this.data = xmlHttp.responseText.split("\n");
                callback();
            }
        };
        xmlHttp.open("GET", "/getDBdata", true); // true for asynchronous
        xmlHttp.send(null);
    };

    this.runtime = HttpRequests(isWriting, isMock, this);
    this.httpGetAsync = this.runtime.httpGetRequest;
    this.httpPostAsync = this.runtime.httpPostRequest;
    this.httpPutAsync = this.runtime.httpPutRequest;
    this.httpUpload = this.runtime.httpUpload;
}

function HttpRequests(isWriting, isMock, listener) {
    function register(data) {
        var request = new XMLHttpRequest();
        request.open("POST", "/data", true); // true for asynchronous
        request.setRequestHeader("Content-type", "application/json");
        request.send(JSON.stringify(data));
    }

    function httpGet(theUrl) {
        return new Promise((resolve) => {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    isWriting && register(JSON.parse(request.responseText));
                    resolve(request.responseText);
                }
            };
            request.open("GET", theUrl, true); // true for asynchronous
            request.send(null);
        })
    }

    function httpPost(theUrl, body, ignoredData) {
        return new Promise((resolve) => {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200){
                    isWriting && register(JSON.parse(request.responseText));
                    resolve(request.responseText);
                }
            };
            request.open('POST', theUrl, true); // true for asynchronous
            request.setRequestHeader('Content-type', 'application/json');
            let obj = ignoredData? JSON.stringify(body, ignoredData) : JSON.stringify(body) ;
            request.send(obj);
        })
    }

    function httpUpload(theUrl, file, onProgress, onAbort) {
        return new Promise((resolve) => {
            const formData = new FormData();
            formData.append('file', file);
            var request = new XMLHttpRequest();
            this.uploadRequest = request;
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200)
                    resolve(request.responseText);
            };
            if (request.upload && file.type == "video/mp4") {
                request.upload.addEventListener("progress", onProgress);
            }
            request.open('POST', theUrl, true); // true for asynchronous
            request.timeout = 60*1000;
            request.send(formData);
        })
    }

    function httpPut(theUrl, body, callback, ignoredData) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback && callback(xmlHttp.responseText);
        };
        xmlHttp.open("PUT", theUrl, true); // true for asynchronous
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(JSON.stringify(body, ignoredData));
    }

    function httpMockGet() {
        function then(callback) {
            callback(listener.data.shift());
            return {then};
        }
        return {then}
    }

    function httpMockPost(theUrl, body, ignoredData) {
        function then(callback) {
            callback(listener.data.shift());
            return {then};
        }
        return {then}
    }

    function httpMockPut(theUrl, body, callback, ignoredData) {
        callback(body);
    }

    let httpGetAsync = isMock ? httpMockGet : httpGet;
    let httpPostAsync = isMock ? httpMockPost : httpPost;
    let httpPutAsync = isMock ? httpMockPut : httpPut;

    return {
        httpGetRequest:httpGetAsync,
        httpPostRequest:httpPostAsync,
        httpPutRequest:httpPutAsync,
        httpUpload:httpUpload
    };
}

if (typeof exports !== "undefined") {
    exports.DbListener = DbListener;
}

exports.dbListener = DbListener;