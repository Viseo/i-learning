/**
 * Created by qde3485 on 09/03/16.
 */


var ImageRuntime = {
    images: {},
    count: 0,
    getImage: function (imgUrl, onloadHandler) {
        this.count++;
        var image = {
            url: imgUrl,
            onload: onloadHandler,
            id: "i"+ this.count
        };
        this.images[image.id] = image;
        return image;
    },

    imageLoaded: function(id, w, h) {
        this.images[id].width = w;
        this.images[id].height = h;
        this.images[id].onload();
    }
};

var ImageController = function (imageRuntime) {
    return imageRuntime || {
        getImage: function (imgUrl, onloadHandler) {
            var image = new Image();
            image.src = imgUrl;
            image.onload = onloadHandler;
            return image;
        }
    };
};

var onClickMock = function (obj, x, y) {
    obj.node.onclick({clientX:x, clientY:y});
};

var AsyncTimerRuntime = {
    timers: {},
    count: 0,
    interval: function (handler, timer) {
        var interval = {
            id:"interval"+this.count,
            next: handler,
            timer: timer
        };
        this.count++;
        this.timers[interval.id] = interval;
        return interval;
    },
    clearInterval: function (id) {
        delete this.timers[id];
    },
    timeout: function (handler, timer) {
        var timeout = {
            id:"timeout"+this.count,
            next: function () {
                handler();
                delete this;
            },
            timer:timer
        };
        this.count++;
        this.timers[timeout.id] = timeout;
        return timeout;
    }
};

var AsyncTimerController = function (asyncTimerRuntime) {
    return asyncTimerRuntime || {
        interval: function (handler, timer) {
            return setInterval(handler, timer);
        },
        clearInterval: function (id) {
            clearInterval(id);
        },
        timeout: function (handler, timer) {
            return setTimeout(handler, timer);
        }
    };
};