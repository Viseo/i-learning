/**
 * Created by HDA3014 on 24/01/2016.
 */

var SVG = require("../svghandler.js").SVG;
var targetRuntime = require("../targetruntime.js").targetRuntime;
var mapEditor = require("../uscw/mapeditor.js").mapEditor;

var svg = SVG(targetRuntime());

var editor = mapEditor(svg);
editor.show("content");
