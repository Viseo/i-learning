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
        console.log("mock");
        return image;
    },

    imageLoaded(id, w, h) {
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