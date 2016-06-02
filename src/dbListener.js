/**
 * Created by qde3485 on 02/06/16.
 */

var data;

function DbListener(isWriting, isMock) {
    var self = this;

    self.loadData = function (callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                isWriting && register(JSON.parse(xmlHttp.responseText));
                data = xmlHttp.responseText;
                console.log(data);
                callback();
            }
        };
        xmlHttp.open("GET", "/getDBdata", true); // true for asynchronous
        xmlHttp.send(null);
    };

    self.runtime = HttpRequests(isWriting, isMock);
    self.httpGetAsync = self.runtime.httpGetRequest;
    self.httpPostAsync = self.runtime.httpPostRequest;
}

function HttpRequests(isWriting, isMock) {
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
        callback(data.pop());
    }

    function httpMockPost(theUrl, body, callback, ignoredData) {
        callback(body);
    }

    let httpGetAsync = isMock ? httpMockGet : httpGet;
    let httpPostAsync = isMock ? httpMockPost : httpPost;

    return {
        httpGetRequest:httpGetAsync,
        httpPostRequest:httpPostAsync
    };

}