/**
 * Created by qde3485 on 15/03/16.
 */

var EmptyElement = function () {
    var self = this;
    self.displaySet = paper.set();

    self.display = function (x, y, w, h) {
        self.bordure = paper.rect(x, y, w, h, 25);
        self.bordure.attr("stroke-dasharray", "--").attr("stroke-width", 3);
        self.displaySet.push(self.bordure);
    }
};