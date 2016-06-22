/**
 * Created by ACA3502 on 13/05/2016.
 */


var svg, util;


if(typeof SVG !== "undefined") {
    if(!svg) {
        svg = new SVG();
    }
}


function setSvg(_svg) {
    svg = _svg;
    // call setSvg on modules
}
function setUtil(_util){
    util = _util;
}

var test = function(){
    var rect = new svg.Rect(50, 50).color(myColors.blue, 3, myColors.black).position(200, 200);
    mainManipulator.last.add(rect);
    var handler = function (event) {
        if(event.keyCode === 27) { // echap
            console.log("ECHAP");
            rect.color(myColors.red, 10, myColors.black);
            return true;
        }
    };
    svg.runtime.addGlobalEvent("keydown", function (event) {
        if(handler(event)) {
            event.preventDefault();
        }
    });
};
if (typeof exports !== "undefined") {
    exports.test = test;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
}