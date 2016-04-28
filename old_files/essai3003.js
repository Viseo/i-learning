/**
 * Created by qde3485 on 30/03/16.
 */

if(typeof SVG != "undefined") {
    if(!svg) {
        var svg = new SVG();
    }
}

function setSvg(_svg) {
    svg = _svg;
    // call setSvg on modules
}
if(typeof exports != "undefined") {
    exports.setSvg = setSvg;
}

var drawing = new svg.Drawing(1000, 1000).show("content");

var translator = new svg.Translation(200, 200);
var rotator = new svg.Rotation(0);
var scalor = new svg.Scaling(1);
var orderedor = new svg.Ordered(15);

var rect = new svg.Rect(100, 100).position(0, 0);
var circle = new svg.Circle(25).color([100, 100, 100], 2, [255, 0, 0]);
var triangle = new svg.Triangle(30, 150, "N").color([0,0,255]);
var image = new svg.Image("../resource/pomme.jpg").dimension(150, 150);
var text = new svg.Text("Agrougrou");
var circle2 = new svg.Circle(25).color([100, 255, 100], 2, [255, 0, 0]);
var path = new svg.Path(0, 0).line(10, 10).line(-25, 25).line(0, 0).move(50, 50).line(0, 37).color([250,0,0], 2, [0, 255, 0]);
var line = new svg.Line(20, 25, 400, 2).color([], 5, [100, 100, 255]);

translator.add(rotator.add(scalor.add(orderedor.set(1, text).set(2, circle))));
drawing.add(translator);

var handlerDblClick = function () {
    console.log("Double clic !");
    orderedor.set(1, triangle);
};

var handlerClick = function () {
    translator.smoothy(1, 5).onChannel("translator").move(500, 500);
    rotator.smoothy(10, 1).onChannel("disney").rotateTo(-289);
    orderedor.set(0, image);
    svg.onChannel("translator").animate(0, function () {
        orderedor.set(3, image);
        scalor.add(text);
    })
};

svg.addEvent(rect, "dblclick", handlerDblClick);
svg.addEvent(circle, "click", handlerClick);
