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
}

if (typeof exports !== "undefined") {
    exports.connexion = connexion;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
}