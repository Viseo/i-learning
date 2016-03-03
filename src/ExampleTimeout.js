/**
 * Created by qde3485 on 03/03/16.
 */

var runtimeMock = {
    images: {},
    handlers: [],
    timeout: function (handler, delay) {
        this.handlers.push(handler);
    },
    next: function () {
        var h = this.handlers.shift();
        h();
    },
    getImage: function (imgUrl, onloadHandler) {
        var image = {
            url: imgUrl,
            onload: onloadHandler
        };
        this.images[imgUrl] = image;
        return image;
    },
    imageLoaded: function (url, width, height) {
        this.images[url].width = width;
        this.images[url].height = height;
        this.images[url].onload();
    },
    imageClicked: function (url, x, y) {
        this.images[url].onclick({clientX:x, clientY:y});
    }
};


var myFunctionTimeout = function(runtime){

    var score = 0;

    var rtm = runtime || {
            timeout: function (handler, delay) {
                setTimeout(handler, delay);
            },
            getImage: function (imgUrl, onloadHandler) {
                var image = new Image();
                image.src = imgUrl;
                image.onload = onloadHandler;
                return image;
            }
        };

    var image = rtm.getImage("../resource/spectre.png", function () {
        console.log(this.width + " " + this.height);
    });
    image.onclick = function (event) {
        score++;
        console.log("Click! " + event.clientX + " " + event.clientY);
    };

    return function () {
        return score;
    }


};
