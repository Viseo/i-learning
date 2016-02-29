/**
 * Created by qde3485 on 25/02/16.
 */


var paper = Raphael("content", 1500, 1500);

// Init SVG
/*var svgNS = "http://www.w3.org/2000/svg";
var svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "1500");
svg.setAttribute("height", "1500");
document.getElementById("content").appendChild(svg);

// créer un rectangle
var createRect = function(parent, x, y, width, height, stroke, strokeWidth, fill) {
    var rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("stroke", stroke);
    rect.setAttribute("stroke-width", strokeWidth);
    rect.setAttribute("fill", fill);
    parent.appendChild(rect);
    return rect;
};*/

var question = new Question(null, null, [{label: null, imageSrc:null, bCorrect:false, rgbBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}}], {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});
question.display(200, 200, 100, 100);

question.tabAnswer[0].display(20,20,100,100);