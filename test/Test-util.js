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

var onClickMock = function (obj, x, y) {
    obj.node.onclick({clientX:x, clientY:y});
};

var onDblclickMock = function(obj, x, y){
    obj.node.ondblclick({clientX:x, clientY:y});
};