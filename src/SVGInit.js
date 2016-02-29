/**
 * Created by qde3485 on 25/02/16.
 */

// Init SVG
var svgNS = "http://www.w3.org/2000/svg";
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
};