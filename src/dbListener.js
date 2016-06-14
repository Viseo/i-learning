/**
 * Created by qde3485 on 02/06/16.
 */

function DbListener(isWriting, isMock) {
    var self = this;
    self.data = [1, 2];
    self.loadData = function (callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                isWriting && register(JSON.parse(xmlHttp.responseText));
                self.data = xmlHttp.responseText.split("\n");
                callback();
            }
        };
        xmlHttp.open("GET", "/getDBdata", true); // true for asynchronous
        xmlHttp.send(null);
    };

    self.runtime = HttpRequests(isWriting, isMock, this);
    self.httpGetAsync = self.runtime.httpGetRequest;
    self.httpPostAsync = self.runtime.httpPostRequest;
    self.httpPutAsync = self.runtime.httpPutRequest;
}

function HttpRequests(isWriting, isMock, listener) {
    this.parent = listener;
    function register(data) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "/data", true); // true for asynchronous
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(JSON.stringify(data));
    }

    function httpGet(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                isWriting && register(JSON.parse(xmlHttp.responseText));
                callback(xmlHttp.responseText);
            }
        };
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
        xmlHttp.send(null);
    }

    function httpPost(theUrl, body, callback, ignoredData) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open("POST", theUrl, true); // true for asynchronous
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(JSON.stringify(body, ignoredData));
    }

    function httpMockGet(theUrl, callback) {
        var obj = parent.data.shift();
        callback(obj);
    }

    function httpMockPost(theUrl, body, callback, ignoredData) {
        callback(body);
    }

    let httpGetAsync = isMock ? httpMockGet : httpGet;
    let httpPostAsync = isMock ? httpMockPost : httpPost;

    return {
        httpGetRequest:httpGetAsync,
        httpPostRequest:httpPostAsync,
        httpPutRequest:httpPutAsync
    };
}

if (typeof exports !== "undefined") {
    exports.DbListener = DbListener;
}