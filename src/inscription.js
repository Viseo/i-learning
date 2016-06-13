/**
 * Created by ACA3502 on 09/06/2016.
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

function inscription() {
    var inscriptionManager = new InscriptionManager();
    inscriptionManager.display();
    function resizePaper(){
        !runtime && document.activeElement.blur();
        drawing.dimension(svg.screenSize().width,svg.screenSize().height);//attr("preserveAspectRatio", "xMinYMin meet") ;
        drawings.glass.dimension(drawing.width,drawing.height);
        inscriptionManager.display(inscriptionManager.formLabels);
    }
    setTimeout(function() {
        svg.runtime.addGlobalEvent("resize", resizePaper);
    },200);
}

if (typeof exports !== "undefined") {
    exports.inscription = inscription;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
}