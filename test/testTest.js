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
    var textarea = new svg.getSvgr().createDOM("textarea");
    svg.getSvgr().add(svg.getSvgr().anchor("content"), textarea);
    var textPourGetBBox = new svg.Text("Le texte");
    mainManipulator.ordonator.set(0, textPourGetBBox);
    var dim = textPourGetBBox.component.getBoundingClientRect() || textPourGetBBox.component.target.getBoundingClientRect();
    var rect = new svg.Rect(dim.width, dim.height);
    mainManipulator.ordonator.set(1, rect);
}
if (typeof exports !== "undefined") {
    exports.test = test;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
}