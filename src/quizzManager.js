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

function quizzManager() {
    !util && setGlobalVariable();

    var param = {speed: 50, step: 10};
    var quizzManager = new QuizzManager();
    quizzManager.display();

}
if (typeof exports !== "undefined") {
    exports.quizzManager = quizzManager;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
    //exports.setGlobalVariable = setGlobalVariable;
}
