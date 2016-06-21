/**
 * Created by TDU3482 on 13/06/2016.
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

function connexion(){
    let manager = new ConnectionManager();
    Server.checkCookie(data => {
        data = data && JSON.parse(data);
        if (data.ack === 'OK') {
            drawing.username = `${data.lastName} ${data.firstName}`;
            manager.listFormations();
        } else {
            manager.display();
        }
    });
    function resizePaper(){
        !runtime && document.activeElement.blur();
        drawing.dimension(document.body.clientWidth,document.documentElement.clientHeight);//attr("preserveAspectRatio", "xMinYMin meet") ;
        drawings.glass.dimension(drawing.width,drawing.height).position(drawing.width/2,drawing.height/2);

        switch(drawing.currentPageDisplayed){
            case "FormationsManager":
                mainManipulator.flush();
                formationsManager.clippingManipulator.last.remove(formationsManager.panel.component);
                formationsManager.header.display();
                formationsManager.display();
                break;
        }
    }
    setTimeout(function(){
        window.onresize = resizePaper;
    },200);
}

if (typeof exports !== "undefined") {
    exports.connexion = connexion;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
}