/**
 * Created by HDA3014 on 11/03/2016.
 */
var assert = require('assert');
var testUtils = require('./testutils');
var targetRuntime = require('../targetRuntime').targetRuntime;
var mockRuntime = require('../runtimemock').mockRuntime;
var SVG = require('../svghandler').SVG;

var runtime;
var svg;
var inspect = testUtils.inspect;

describe('SVG Handlers', function() {

    let testResizeAnimation = component=>{
        component.smoothy(10, 5).resize(10, 20, 40, 60);
        runtime.advance();
        inspect(component.component, {width:10, height:20});
        runtime.advance();
        inspect(component.component, {width:13, height:24});
        runtime.advanceAll();
        inspect(component.component, {width:40, height:60});
        component.steppy(10, 10).resizeTo(10, 20);
        runtime.advance();
        inspect(component.component, {width:40, height:60});
        runtime.advance();
        inspect(component.component, {width:37, height:56});
        runtime.advanceAll();
        inspect(component.component, {width:10, height:20});
    };

    let testPositionAnimation = (component, delta={x:0, y:0})=>{
        component.smoothy(10, 5).move(10, 20, 40, 60);
        runtime.advance();
        inspect(component.component, {x:10-delta.x, y:20-delta.y});
        runtime.advance();
        inspect(component.component, {x:13-delta.x, y:24-delta.y});
        runtime.advanceAll();
        inspect(component.component, {x:40-delta.x, y:60-delta.y});
        component.steppy(10, 10).moveTo(10, 20);
        runtime.advance();
        inspect(component.component, {x:40-delta.x, y:60-delta.y});
        runtime.advance();
        inspect(component.component, {x:37-delta.x, y:56-delta.y});
        runtime.advanceAll();
        inspect(component.component, {x:10-delta.x, y:20-delta.y});
    };

    let testMoveAnimation = (component)=>{
        component.smoothy(10, 5).move(10, 20, 40, 60);
        runtime.advance();
        inspect(component.component, {transform:"translate(10 20)"});
        runtime.advance();
        inspect(component.component, {transform:"translate(13 24)"});
        runtime.advanceAll();
        inspect(component.component, {transform:"translate(40 60)"});
        component.steppy(10, 10).moveTo(10, 20);
        runtime.advance();
        inspect(component.component, {transform:"translate(40 60)"});
        runtime.advance();
        inspect(component.component, {transform:"translate(37 56)"});
        runtime.advanceAll();
        inspect(component.component, {transform:"translate(10 20)"});
    };

    let testRotateAnimation = (component)=>{
        component.smoothy(10, 6).rotate(0, 60);
        runtime.advance();
        inspect(component.component, {transform:"rotate(0)"});
        runtime.advance();
        inspect(component.component, {transform:"rotate(6)"});
        runtime.advanceAll();
        inspect(component.component, {transform:"rotate(60)"});
        component.steppy(10, 10).rotateTo(0);
        runtime.advance();
        inspect(component.component, {transform:"rotate(60)"});
        runtime.advance();
        inspect(component.component, {transform:"rotate(54)"});
        runtime.advanceAll();
        inspect(component.component, {transform:"rotate(0)"});
    };

    let testScalingAnimation = (component)=>{
        component.smoothy(10,0.1).scale(1.0, 2.0);
        runtime.advance();
        inspect(component.component, {transform:"scale(1)"});
        runtime.advance();
        inspect(component.component, {transform:"scale(1.1)"});
        runtime.advanceAll();
        inspect(component.component, {transform:"scale(2)"});
        component.steppy(10, 10).scaleTo(1.0);
        runtime.advance();
        inspect(component.component, {transform:"scale(2)"});
        runtime.advance();
        inspect(component.component, {transform:"scale(1.9)"});
        runtime.advanceAll();
        inspect(component.component, {transform:"scale(1)"});
    };

    let testColorAnimation = (component)=>{
        component.smoothy(10, 5).color(svg.RED, svg.BLUE, 1, 5, svg.BLUE, svg.RED);
        runtime.advance();
        inspect(component.component, {fill:"rgb(250,0,0)", "stroke-width":1, stroke:"rgb(0,0,200)"});
        runtime.advance();
        inspect(component.component, {fill:"rgb(247,0,2)", "stroke-width":1.0441708867216504, stroke:"rgb(3,0,198)"});
        runtime.advanceAll();
        inspect(component.component, {fill:"rgb(0,0,200)", "stroke-width":5, stroke:"rgb(250,0,0)"});
        component.steppy(10, 10).colorTo(svg.RED, 1, svg.BLUE);
        runtime.advance();
        inspect(component.component, {fill:"rgb(0,0,200)", "stroke-width":5, stroke:"rgb(250,0,0)"});
        runtime.advance();
        inspect(component.component, {fill:"rgb(25,0,180)", "stroke-width":4.6, stroke:"rgb(225,0,20)"});
        runtime.advanceAll();
        inspect(component.component, {fill:"rgb(250,0,0)", "stroke-width":1, stroke:"rgb(0,0,200)"});

        component.smoothy(10, 5).color(undefined, undefined, 1, 5, svg.BLUE, svg.RED);
        runtime.advanceAll();
        inspect(component.component, {fill:"none", "stroke-width":5, stroke:"rgb(250,0,0)"});
        component.smoothy(10, 5).color(svg.BLUE, svg.RED);
        runtime.advanceAll();
        inspect(component.component, {fill:"rgb(250,0,0)", "stroke-width":0, stroke:"none"});
    };

    let testOpacityAnimation = (component, delta)=>{
        component.smoothy(10, 0.1).opacity(1.0, 0.0);
        runtime.advance();
        inspect(component.component, {opacity:1.0});
        runtime.advance();
        inspect(component.component, {opacity:0.9});
        runtime.advanceAll();
        inspect(component.component, {opacity:0.0});
        component.steppy(10, 10).opacityTo(1.0);
        runtime.advance();
        inspect(component.component, {opacity:0.0});
        runtime.advance();
        inspect(component.component, {opacity:0.1});
        runtime.advanceAll();
        inspect(component.component, {opacity:1.0});
    };

    let testMoveLineAnimation = (component)=>{
        component.smoothy(10, 5).move(50, 100, 100, 50, 100, 50, 50, 100);
        runtime.advance();
        inspect(component.component, {x1:50, y1:100, x2:100, y2:50});
        runtime.advance();
        inspect(component.component, {x1:52.5, y1:97.5, x2:97.5, y2:52.5});
        runtime.advanceAll();
        inspect(component.component, {x1:100, y1:50, x2:50, y2:100});
        component.steppy(10, 10).moveTo(50, 100, 100, 50);
        runtime.advance();
        inspect(component.component, {x1:100, y1:50, x2:50, y2:100});
        runtime.advance();
        inspect(component.component, {x1:95, y1:55, x2:55, y2:95});
        runtime.advanceAll();
        inspect(component.component, {x1:50, y1:100, x2:100, y2:50});
    };

    let testStartLineAnimation = (component)=>{
        component.smoothy(10, 5).start(50, 100, 100, 50);
        runtime.advance();
        inspect(component.component, {x1:50, y1:100, x2:100, y2:50});
        runtime.advance();
        inspect(component.component, {x1:53.53553390593274, y1:96.46446609406726, x2:100, y2:50});
        runtime.advanceAll();
        inspect(component.component, {x1:100, y1:50, x2:100, y2:50});
        component.steppy(10, 10).startTo(50, 100);
        runtime.advance();
        inspect(component.component, {x1:100, y1:50, x2:100, y2:50});
        runtime.advance();
        inspect(component.component, {x1:95, y1:55, x2:100, y2:50});
        runtime.advanceAll();
        inspect(component.component, {x1:50, y1:100, x2:100, y2:50});
    };

    let testEndLineAnimation = (component)=>{
        component.smoothy(10, 5).end(50, 100, 100, 50);
        runtime.advance();
        inspect(component.component, {x1:50, y1:100, x2:50, y2:100});
        runtime.advance();
        inspect(component.component, {x1:50, y1:100, x2:53.53553390593274, y2:96.46446609406726});
        runtime.advanceAll();
        inspect(component.component, {x1:50, y1:100, x2:100, y2:50});
        component.steppy(10, 10).endTo(50, 100);
        runtime.advance();
        inspect(component.component, {x1:50, y1:100, x2:100, y2:50});
        runtime.advance();
        inspect(component.component, {x1:50, y1:100, x2:95, y2:55});
        runtime.advanceAll();
        inspect(component.component, {x1:50, y1:100, x2:50, y2:100});
    };

    let testDuplicate =obj=>{
        let clone = obj.duplicate();
        inspect(clone, obj, {
            id:true,
            handler:true,
            component:true,
            parent:true,
            moveHandler:true,
            reshapeHandler:true,
            resizeHandler:true,
            _active:true,
            setBoundingClientRect:true,
            getBoundingClientRect:true
        });
        return clone;
    };

    describe('Shapes', function () {

        beforeEach(function () {
            runtime = mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
        });

        it("computes distances between a point and a segment", function() {
           assert.equal(1, svg.distanceToSegment({x:3, y:3}, {x:2, y:3}, {x:2, y:3}));
           assert.equal(3, svg.distanceToSegment({x:3, y:3}, {x:0, y:0}, {x:0, y:10}));
           assert.equal(7.615773105863909, svg.distanceToSegment({x:3, y:3}, {x:0, y:10}, {x:0, y:20}));
        });

        it("computes distances between a point and an ellipse", function() {
            assert.equal(5.081010063355228, svg.distanceToEllipse({x:3, y:3}, {x:10, y:10}, 3, 5));
        });

        it("computes intersection between two segments", function() {
            inspect({x:3.0985915492957745, y:4.084507042253521}, svg.intersectLineLine(
                {x:3, y:4}, {x:10, y:10}, {x:2, y:5}, {x:8, y:0}));
            assert.equal(null, svg.intersectLineLine(
                {x:3, y:3}, {x:10, y:10}, {x:4, y:3}, {x:8, y:0}));
            assert.equal(null, svg.intersectLineLine(
                {x:3, y:3}, {x:10, y:10}, {x:4, y:3}, {x:11, y:10}));
            assert.equal(null, svg.intersectLineLine(
                {x:3, y:3}, {x:10, y:10}, {x:4, y:4}, {x:11, y:11}));
        });

        it("computes intersection between a segment and a polygon", function() {
            inspect([{x:5.2105263157894735, y:3.1578947368421053}, {x:3, y:0}],
                svg.intersectLinePolygon(
                {x:3, y:0}, {x:10, y:10}, [{x:0, y:0}, {x:1, y:4}, {x:5, y:4}, {x:6, y:0}]));
        });

        it("creates a simple Rect", function () {
            var rect = new svg.Rect(100, 50);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(rect);
            // Positionning and sizing
            inspect(rect.component, {tag: 'rect', x: -50, y: -25, width: 100, height: 50});
            inspect(rect, {x: 0, y: 0, width: 100, height: 50});
            rect.position(20, 30).dimension(150, 100);
            inspect(rect.component, {tag: 'rect', x: -55, y: -20, width: 150, height: 100});
            inspect(rect, {x: 20, y: 30, width: 150, height: 100});
            // Color
            rect.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(rect.component, {fill: 'rgb(50,70,80)', "stroke-width": 4, stroke: 'rgb(100,110,120)'});
            // Corners
            rect.corners(4, 4);
            inspect(rect.component, {rx: 4, ry:4});
            // Global point
            let gp = rect.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "25 40");
            // Duplicate
            testDuplicate(rect);
            // Inside
            assert.equal(rect.inside(-60, 0), false);
            assert.equal(rect.inside(-50, 0), true);
            assert.equal(rect.inside(90, 0), true);
            assert.equal(rect.inside(100, 0), false);
            assert.equal(rect.inside(0, -25), false);
            assert.equal(rect.inside(0, -15), true);
            assert.equal(rect.inside(0, 75), true);
            assert.equal(rect.inside(0, 85), false);
            // Test observers
            var rx= 0, ry= 0, rwidth= 0, rheight=0;
            rect.onMove(pos=>{rx=pos.x; ry=pos.y;});
            rect.onResize(size=>{rwidth=size.width; rheight=size.height;});
            rect.dimension(30, 35).position(5, 25);
            assert.equal("5 25 30 35", rx+" "+ry+" "+rwidth+" "+rheight);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Rect().localPoint(40, 50));
            assert.ok(!new svg.Rect().globalPoint(40, 50));
        });

        it("creates a simple Circle", function() {
            var circle = new svg.Circle(50);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(circle);
            // Positionning and sizing
            inspect(circle.component, {tag:'circle', cx:0, cy:0, r:50});
            inspect(circle, {x:0, y:0, r:50});
            circle.position(20, 30).radius(60);
            inspect(circle.component, {tag:'circle', cx:20, cy:30, r:60});
            inspect(circle, {x:20, y:30, r:60});
            // Color
            circle.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(circle.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = circle.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "25 40");
            // Duplicate
            testDuplicate(circle);
            // Inside
            assert.equal(circle.inside(-45, 30), false);
            assert.equal(circle.inside(-35, 30), true);
            assert.equal(circle.inside(75, 30), true);
            assert.equal(circle.inside(85, 30), false);
            assert.equal(circle.inside(20, -35), false);
            assert.equal(circle.inside(20, -25), true);
            assert.equal(circle.inside(20, 85),true);
            assert.equal(circle.inside(20, 95), false);
            // Test observers
            var rx= 0, ry= 0, rradius= 0;
            circle.onMove(pos=>{rx=pos.x; ry=pos.y;});
            circle.onResize(radius=>{rradius=radius;});
            circle.radius(30).position(5, 25);
            assert.equal("5 25 30", rx+" "+ry+" "+rradius);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Circle().localPoint(40, 50));
            assert.ok(!new svg.Circle().globalPoint(40, 50));
        });

        it("creates a simple ellipse", function() {
            var ellipse = new svg.Ellipse(50, 60);
            var drawing = new svg.Drawing(1000, 500);
            // Positionning and sizing
            drawing.add(ellipse);
            inspect(ellipse.component, {tag:'ellipse', cx:0, cy:0, rx:50, ry:60});
            inspect(ellipse, {x:0, y:0, rx:50, ry:60});
            ellipse.position(20, 30).radius(60, 70);
            inspect(ellipse.component, {tag:'ellipse', cx:20, cy:30, rx:60, ry:70});
            inspect(ellipse, {x:20, y:30, rx:60, ry:70});
            // Color
            ellipse.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(ellipse.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = ellipse.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "25 40");
            // Duplicate
            testDuplicate(ellipse);
            // Inside
            assert.equal(ellipse.inside(-45, 30), false);
            assert.equal(ellipse.inside(-35, 30), true);
            assert.equal(ellipse.inside(75, 30), true);
            assert.equal(ellipse.inside(85, 30), false);
            assert.equal(ellipse.inside(20, -45), false);
            assert.equal(ellipse.inside(20, -35), true);
            assert.equal(ellipse.inside(20, 95), true);
            assert.equal(ellipse.inside(20, 105), false);
            // Test observers
            var rx= 0, ry= 0, rVert= 0, rHoriz= 0;
            ellipse.onMove(pos=>{rx=pos.x; ry=pos.y;});
            ellipse.onResize(rad=>{rHoriz=rad.radiusX; rVert=rad.radiusY;});
            ellipse.radius(35, 30).position(5, 25);
            assert.equal("5 25 30 35", rx+" "+ry+" "+rVert+" "+rHoriz);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Ellipse().localPoint(40, 50));
            assert.ok(!new svg.Ellipse().globalPoint(40, 50));
        });

        it("creates a simple triangle", function() {
            var tri = new svg.Triangle(50, 60, "N");
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(tri);
            // Positionning and sizing
            inspect(tri.component, {tag:'polygon', points:'-25,30 25,30 0,-30'});
            inspect(tri, {dir:'N', width:50, height:60, points:[{x:-25,y:30}, {x:25,y:30}, {x:0,y:-30}]});
            tri.direction('S').dimension(70, 50);
            inspect(tri.component, {tag:'polygon', points:'-35,-25 35,-25 0,25'});
            inspect(tri, {dir:'S', width:70, height:50, points:[{x:-35,y:-25}, {x:35,y:-25}, {x:0,y:25}]});
            tri.direction('E');
            inspect(tri.component, {tag:'polygon', points:'-35,-25 -35,25 35,0'});
            tri.direction('W');
            inspect(tri.component, {tag:'polygon', points:'35,-25 35,25 -35,0'});
            tri.position(50, 60);
            inspect(tri.component, {tag:'polygon', points:'85,35 85,85 15,60'});
            // Color
            tri.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(tri.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = tri.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "55 70");
            // Duplicate
            testDuplicate(tri);
            // Inside
            assert.equal(tri.inside(80, 50), true);
            assert.equal(tri.inside(20, 50), false);
            // Test observers
            var rx= 0, ry= 0, rWidth= 0, rHeight= 0, rDirection="";
            tri.onMove(pos=>{rx=pos.x; ry=pos.y;});
            tri.onResize(size=>{rWidth=size.width; rHeight=size.height;});
            tri.onReorient(direction=>rDirection=direction);
            tri.dimension(35, 30).position(5, 25).direction("S");
            assert.equal("5 25 35 30 S", rx+" "+ry+" "+rWidth+" "+rHeight+" "+rDirection);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Triangle().localPoint(40, 50));
            assert.ok(!new svg.Triangle().globalPoint(40, 50));
        });

        it("creates a curved shield", function() {
            var shield = new svg.CurvedShield(50, 100, 0.3, "N");
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(shield);
            // Positionning and sizing
            inspect(shield.component, {tag:'path', d:'M -25,50 L -25,-20 C -25,-50 25,-50 25,-20 L 25,50 -25,50'});
            inspect(shield, {dir:'N', width:50, height:100, points:[
                {x:-25,y:50}, {x:-25,y:-20}, {x:-25,y:-50}, {x:25,y:-50}, {x:25,y:-20}, {x:25,y:50}, {x:-25,y:50}]});
            shield.direction('E').dimension(100, 50, 0.3);
            inspect(shield.component, {tag:'path', d:'M -50,-25 L 20,-25 C 50,-25 50,25 20,25 L -50,25 -50,-25'});
            inspect(shield, {dir:'E', width:100, height:50, points:[
                {x:-50,y:-25}, {x:20,y:-25}, {x:50,y:-25}, {x:50,y:25}, {x:20,y:25}, {x:-50,y:25}, {x:-50,y:-25}]});
            shield.direction('S').dimension(50, 100, 0.3);
            inspect(shield.component, {tag:'path', d:'M -25,-50 L -25,20 C -25,50 25,50 25,20 L 25,-50 -25,-50'});
            inspect(shield, {dir:'S', width:50, height:100, points:[
                {x:-25,y:-50}, {x:-25,y:20}, {x:-25,y:50}, {x:25,y:50}, {x:25,y:20}, {x:25,y:-50}, {x:-25,y:-50}]});
            shield.direction('W').dimension(100, 50, 0.3);
            inspect(shield.component, {tag:'path', d:'M 50,-25 L -20,-25 C -50,-25 -50,25 -20,25 L 50,25 50,-25'});
            inspect(shield, {dir:'W', width:100, height:50, points:[
                {x:50,y:-25}, {x:-20,y:-25}, {x:-50,y:-25}, {x:-50,y:25}, {x:-20,y:25}, {x:50,y:25}, {x:50,y:-25}]});
            shield.position(50, 60);
            inspect(shield.component, {tag:'path', d:'M 100,35 L 30,35 C 0,35 0,85 30,85 L 100,85 100,35'});
            // Color
            shield.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(shield.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = shield.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "55 70");
            // Duplicate
            testDuplicate(shield);
            // Inside
            assert.equal(shield.inside(80, 50), true);
            assert.equal(shield.inside(10, 10), false);
            // Test observers
            var rx= 0, ry= 0, rWidth= 0, rHeight= 0, rDirection="";
            shield.onMove(pos=>{rx=pos.x; ry=pos.y;});
            shield.onResize(size=>{rWidth=size.width; rHeight=size.height;});
            shield.onReorient(direction=>rDirection=direction);
            shield.dimension(35, 30).position(5, 25).direction("S");
            assert.equal("5 25 35 30 S", rx+" "+ry+" "+rWidth+" "+rHeight+" "+rDirection);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.CurvedShield().localPoint(40, 50));
            assert.ok(!new svg.CurvedShield().globalPoint(40, 50));
        });

        it("creates a simple polygon", function() {
            var poly = new svg.Polygon(50, 70).add(-10, 0).add(0, -10).add(10, 0).add(0, 10);
            var drawing = new svg.Drawing(1000, 500);
            // Positionning and sizing
            drawing.add(poly);
            inspect(poly.component, {tag:'polygon', points:' 40,70 50,60 60,70 50,80'});
            inspect(poly, {points:[{x:-10,y:0}, {x:0,y:-10}, {x:10,y:0}, {x:0,y:10}]});
            poly.position(50, 60);
            inspect(poly.component, {tag:'polygon', points:' 40,60 50,50 60,60 50,70'});
            // Color
            poly.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(poly.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = poly.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "55 70");
            // Duplicate
            testDuplicate(poly);
            // Inside
            assert.equal(poly.inside(45, 60), true);
            assert.equal(poly.inside(45, 50), false);
            // Test observers
            var rx= 0, ry= 0, rshape=[];
            poly.onMove(pos=>{rx=pos.x; ry=pos.y;});
            poly.onReshape(shape=>{rshape=shape;});
            poly.position(5, 25);
            assert.equal("5 25", rx+" "+ry);
            poly.clear();
            assert.equal(rshape.length, 0);
            poly.add(-15, -15).add(15, -15).add(15, 15).add(-15, 15);
            inspect(rshape, [{x:-15, y:-15}, {x:15, y:-15}, {x:15, y:15}, {x:-15, y:15}]);
            poly.remove(1);
            inspect(rshape, [{x:-15, y:-15}, {x:15, y:15}, {x:-15, y:15}]);
            poly.trace(10, -10).trace(10, 10);
            inspect(rshape, [{x:-15, y:-15}, {x:15, y:15}, {x:-15, y:15}, {x:-5, y:5}, {x:5, y:15}]);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Polygon().localPoint(40, 50));
            assert.ok(!new svg.Polygon().globalPoint(40, 50));
        });

        it("creates an arrow", function() {
            var arrow = new svg.Arrow(20, 40, 30);
            arrow.position(50, 100, 100, 50);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(arrow);
            // Positionning and sizing
            inspect(arrow.component, {tag:'polygon', points:'50,100 35.85786437626905,85.85786437626905 64.64466094067262,57.071067811865476 50.50252531694167,42.928932188134524 100,50 107.07106781186548,99.49747468305833 92.92893218813452,85.35533905932738 64.14213562373095,114.14213562373095'});
            inspect(arrow, {points:[{x:50,y:100},
                {x:35.85786437626905,y:85.85786437626905},
                {x:64.64466094067262,y:57.071067811865476},
                {x:50.50252531694167,y:42.928932188134524},
                {x:100,y:50},
                {x:107.07106781186548,y:99.49747468305833},
                {x:92.92893218813452,y:85.35533905932738},
                {x:64.14213562373095,y:114.14213562373095}]});
            // Color
            arrow.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(arrow.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = arrow.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "5 10");
            // Duplicate
            testDuplicate(arrow);
            // Inside
            assert.equal(arrow.inside(75, 75), true);
            assert.equal(arrow.inside(20, 50), false);
            // Test observers
            var rbx= 0, rby= 0, rhx= 0, rhy= 0, rBaseWidth= 0, rHeadWidth= 0, rHeadHeight=0;
            arrow.onMove(pos=>{rbx=pos.bx; rby=pos.by; rhx=pos.hx; rhy=pos.hy;});
            arrow.onReshape(shape=>{
                rBaseWidth=shape.baseWidth;
                rHeadWidth=shape.headWidth;
                rHeadHeight=shape.headHeight;});
            arrow.shape(30, 50, 40).position(50, 60, 100, 110);
            assert.equal("50 60 100 110 30 50 40", rbx+" "+rby+" "+rhx+" "+rhy+" "+rBaseWidth+" "+rHeadWidth+" "+rHeadHeight);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Arrow().localPoint(40, 50));
            assert.ok(!new svg.Arrow().globalPoint(40, 50));
        });

        it("creates a simple hexagon", function() {
            var hex = new svg.Hexagon(100, "H");
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(hex);
            // Positionning and sizing
            inspect(hex.component, {tag:'polygon', points:'-50,87 -100,0 -50,-87 50,-87 100,0 50,87'});
            inspect(hex, {dir:'H', baseWidth:100, points:[{x:-50,y:87}, {x:-100,y:0}, {x:-50,y:-87}, {x:50,y:-87}, {x:100,y:0}, {x:50,y:87}]});
            hex.direction('V').dimension(120);
            inspect(hex.component, {tag:'polygon', points:'104,-60 0,-120 -104,-60 -104,60 0,120 104,60'});
            inspect(hex, {dir:'V', baseWidth:120, points:[{x:104,y:-60}, {x:0,y:-120}, {x:-104,y:-60}, {x:-104,y:60}, {x:0,y:120}, {x:104,y:60}]});
            hex.position(50, 60);
            inspect(hex.component, {tag:'polygon', points:'104,-60 0,-120 -104,-60 -104,60 0,120 104,60'});
            // Color
            hex.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(hex.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = hex.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "55 70");
            // Duplicate
            testDuplicate(hex);
            // Inside
            assert.equal(hex.inside(50, -80), true);
            assert.equal(hex.inside(50, -100), false);
            // Test observers
            var rx= 0, ry= 0, rBaseWidth= 0, rDirection="";
            hex.onMove(pos=>{rx=pos.x; ry=pos.y;});
            hex.onResize(size=>{rBaseWidth=size;});
            hex.onReorient(dimension=>rDirection=dimension);
            hex.dimension(35).position(5, 25).direction("H");
            assert.equal("10 50 35 H", rx+" "+ry+" "+rBaseWidth+" "+rDirection);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Hexagon().localPoint(40, 50));
            assert.ok(!new svg.Hexagon().globalPoint(40, 50));
        });

        it("creates a chevron", function() {
            var chevron = new svg.Chevron(50, 100, 10, "E");
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(chevron);
            // Positionning and sizing
            inspect(chevron.component, {tag:'path', d:'M -23.535533905932738,-36.46446609406726 C -30.606601717798213,-43.53553390593274 -23.535533905932738,-50.60660171779821 -16.464466094067262,-43.53553390593274 L 23.535533905932738,-3.5355339059327378 Q 27.071067811865476,0 23.535533905932738,3.5355339059327378 L -16.464466094067262,43.53553390593274 C -23.535533905932738,50.60660171779821 -30.606601717798213,43.53553390593274 -23.535533905932738,36.46446609406726 L 9.393398282201785,3.5355339059327378 Q 12.928932188134524,0 9.393398282201785,-3.5355339059327378 L -23.535533905932738,-36.46446609406726 '});
            inspect(chevron, {dir:'E', points:[
                {x:-23.535533905932738,y:-36.46446609406726},
                {x:-30.606601717798213,y:-43.53553390593274},
                {x:-23.535533905932738,y:-50.60660171779821},
                {x:-16.464466094067262,y:-43.53553390593274},
                {x:23.535533905932738,y:-3.5355339059327378},
                {x:27.071067811865476,y:0},
                {x:23.535533905932738,y:3.5355339059327378},
                {x:-16.464466094067262,y:43.53553390593274},
                {x:-23.535533905932738,y:50.60660171779821},
                {x:-30.606601717798213,y:43.53553390593274},
                {x:-23.535533905932738,y:36.46446609406726},
                {x:9.393398282201785,y:3.5355339059327378},
                {x:12.928932188134524,y:0},
                {x:9.393398282201785,y:-3.5355339059327378},
                {x:-23.535533905932738,y:-36.46446609406726}
            ]});
            chevron.direction('W').dimension(60, 120, 15);
            inspect(chevron.component, {tag:'path', d:'M 27.803300858899107,-39.69669914110089 C 38.40990257669732,-50.30330085889911 27.803300858899107,-60.90990257669732 17.196699141100893,-50.30330085889911 L -27.803300858899107,-5.303300858899107 Q -33.10660171779821,0 -27.803300858899107,5.303300858899107 L 17.196699141100893,50.30330085889911 C 27.803300858899107,60.90990257669732 38.40990257669732,50.30330085889911 27.803300858899107,39.69669914110089 L -6.590097423302678,5.303300858899107 Q -11.893398282201787,0 -6.590097423302678,-5.303300858899107 L 27.803300858899107,-39.69669914110089 '});
            inspect(chevron, {dir:'W', points:[
                {x:27.803300858899107,y:-39.69669914110089},
                {x:38.40990257669732,y:-50.30330085889911},
                {x:27.803300858899107,y:-60.90990257669732},
                {x:17.196699141100893,y:-50.30330085889911},
                {x:-27.803300858899107,y:-5.303300858899107},
                {x:-33.10660171779821,y:0},
                {x:-27.803300858899107,y:5.303300858899107},
                {x:17.196699141100893,y:50.30330085889911},
                {x:27.803300858899107,y:60.90990257669732},
                {x:38.40990257669732,y:50.30330085889911},
                {x:27.803300858899107,y:39.69669914110089},
                {x:-6.590097423302678,y:5.303300858899107},
                {x:-11.893398282201787,y:0},
                {x:-6.590097423302678,y:-5.303300858899107},
                {x:27.803300858899107,y:-39.69669914110089}
            ]});
            chevron.direction('N').dimension(120, 60, 15);
            inspect(chevron.component, {tag:'path', d:'M -39.69669914110089,27.803300858899107 C -50.30330085889911,38.40990257669732 -60.90990257669732,27.803300858899107 -50.30330085889911,17.196699141100893 L -5.303300858899107,-27.803300858899107 Q 0,-33.10660171779821 5.303300858899107,-27.803300858899107 L 50.30330085889911,17.196699141100893 C 60.90990257669732,27.803300858899107 50.30330085889911,38.40990257669732 39.69669914110089,27.803300858899107 L 5.303300858899106,-6.590097423302678 Q 0,-11.893398282201787 -5.303300858899107,-6.590097423302678 L -39.69669914110089,27.803300858899107 '});
            inspect(chevron, {dir:'N', points:[
                {x:-39.69669914110089,y:27.803300858899107},
                {x:-50.30330085889911,y:38.40990257669732},
                {x:-60.90990257669732,y:27.803300858899107},
                {x:-50.30330085889911,y:17.196699141100893},
                {x:-5.303300858899107,y:-27.803300858899107},
                {x:0,y:-33.10660171779821},
                {x:5.303300858899107,y:-27.803300858899107},
                {x:50.30330085889911,y:17.196699141100893},
                {x:60.90990257669732,y:27.803300858899107},
                {x:50.30330085889911,y:38.40990257669732},
                {x:39.69669914110089,y:27.803300858899107},
                {x:5.303300858899106,y:-6.590097423302678},
                {x:0,y:-11.893398282201787},
                {x:-5.303300858899107,y:-6.590097423302678},
                {x:-39.69669914110089,y:27.803300858899107}
            ]});
            chevron.direction('S').dimension(120, 60, 15);
            inspect(chevron.component, {tag:'path', d:'M -39.69669914110089,-27.803300858899107 C -50.30330085889911,-38.40990257669732 -60.90990257669732,-27.803300858899107 -50.30330085889911,-17.196699141100893 L -5.303300858899107,27.803300858899107 Q 0,33.10660171779821 5.303300858899107,27.803300858899107 L 50.30330085889911,-17.196699141100893 C 60.90990257669732,-27.803300858899107 50.30330085889911,-38.40990257669732 39.69669914110089,-27.803300858899107 L 5.303300858899106,6.590097423302678 Q 0,11.893398282201787 -5.303300858899107,6.590097423302678 L -39.69669914110089,-27.803300858899107 '});
            inspect(chevron, {dir:'S', points:[
                {x:-39.69669914110089,y:-27.803300858899107},
                {x:-50.30330085889911,y:-38.40990257669732},
                {x:-60.90990257669732,y:-27.803300858899107},
                {x:-50.30330085889911,y:-17.196699141100893},
                {x:-5.303300858899107,y:27.803300858899107},
                {x:0,y:33.10660171779821},
                {x:5.303300858899107,y:27.803300858899107},
                {x:50.30330085889911,y:-17.196699141100893},
                {x:60.90990257669732,y:-27.803300858899107},
                {x:50.30330085889911,y:-38.40990257669732},
                {x:39.69669914110089,y:-27.803300858899107},
                {x:5.303300858899106,y:6.590097423302678},
                {x:0,y:11.893398282201787},
                {x:-5.303300858899107,y:6.590097423302678},
                {x:-39.69669914110089,y:-27.803300858899107}
            ]});
            chevron.position(50, 60);
            inspect(chevron.component, {tag:'path', d:'M 10.303300858899107,32.19669914110089 C -0.30330085889910663,21.59009742330268 -10.90990257669732,32.19669914110089 -0.30330085889910663,42.80330085889911 L 44.69669914110089,87.8033008588991 Q 50,93.10660171779821 55.30330085889911,87.8033008588991 L 100.3033008588991,42.80330085889911 C 110.90990257669732,32.19669914110089 100.3033008588991,21.59009742330268 89.6966991411009,32.19669914110089 L 55.30330085889911,66.59009742330268 Q 50,71.89339828220179 44.69669914110089,66.59009742330268 L 10.303300858899107,32.19669914110089 '});
            // Color
            chevron.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(chevron.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = chevron.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "55 70");
            // Duplicate
            testDuplicate(chevron);
            // Inside
            assert.equal(chevron.inside(50, 85), true);
            assert.equal(chevron.inside(50, 95), false);
            // Test observers
            var rx= 0, ry= 0, rWidth= 0, rHeight= 0, rDirection="";
            chevron.onMove(pos=>{rx=pos.x; ry=pos.y;});
            chevron.onResize(size=>{rWidth=size.width; rHeight=size.height;});
            chevron.onReorient(dimension=>rDirection=dimension);
            chevron.dimension(35, 100).position(5, 25).direction("E");
            assert.equal("5 25 35 100 E", rx+" "+ry+" "+rWidth+" "+rHeight+" "+rDirection);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Chevron().localPoint(40, 50));
            assert.ok(!new svg.Chevron().globalPoint(40, 50));
        });

        it("creates a cross", function() {
            var cross = new svg.Cross(50, 100, 10);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(cross);
            // Positionning and sizing
            inspect(cross.component, {tag:'path', d:'M -25,-5 L -5,-5 L -5,-50 L 5,-50 L 5,-5 L 25,-5 L 25,5 L 5,5 L 5,50 L -5,50 L -5,5 L -25,5 L -25,-5 '});
            inspect(cross, {points:[
                {x:-25,y:-5},
                {x:-5,y:-5},
                {x:-5,y:-50},
                {x:5,y:-50},
                {x:5,y:-5},
                {x:25,y:-5},
                {x:25,y:5},
                {x:5,y:5},
                {x:5,y:50},
                {x:-5,y:50},
                {x:-5,y:5},
                {x:-25,y:5},
                {x:-25,y:-5}
            ]});
            cross.position(50, 60);
            inspect(cross.component, {tag:'path', d:'M 25,55 L 45,55 L 45,10 L 55,10 L 55,55 L 75,55 L 75,65 L 55,65 L 55,110 L 45,110 L 45,65 L 25,65 L 25,55 '});
            // Color
            cross.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(cross.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = cross.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "55 70");
            // Duplicate
            testDuplicate(cross);
            // Inside
            assert.equal(cross.inside(50, 60), true);
            assert.equal(cross.inside(70, 80), false);
            // Test observers
            var rx= 0, ry= 0, rWidth= 0, rHeight= 0;
            cross.onMove(pos=>{rx=pos.x; ry=pos.y;});
            cross.onResize(size=>{rWidth=size.width; rHeight=size.height;});
            cross.dimension(35, 100).position(5, 25);
            assert.equal("5 25 35 100", rx+" "+ry+" "+rWidth+" "+rHeight);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Cross().localPoint(40, 50));
            assert.ok(!new svg.Cross().globalPoint(40, 50));
        });

        it("creates a text", function() {
            var text = new svg.Text("One line message");
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(text);
            // Positionning and sizing
            inspect(text.component, {tag:'text', x:'0', y:'0', "text-anchor":"middle",
                "font-family":'arial', "font-size":12, "text-decoration":'none',
                text:'One&nbsp;line&nbsp;message'
            });
            inspect(text, {x:'0', y:'0',
                anchorText:"middle", fontName:'arial', fontSize:12, lineSpacing:24,
                _decoration:"none", anchorText:"middle", vanchorText:"top",
                messageText:"One line message"
            });
            text.position(50, 60).dimension(100, 12).message("A very very very very long message");
            inspect(text.component, {tag:'text', x:'50', y:'63', "text-anchor":"middle",
                "font-family":'arial', "font-size":12, "text-decoration":'none',
                text:'A&nbsp;very...'
            });
            // Multiple lines
            text.position(50, 60).dimension(100, 48).message("A message\nwith multiple\nlines.");
            inspect(text.component, {
                tag: "text", text:'A&nbsp;message', x:'50', y:'45',
                children:[
                    {tag: "tspan", text:"with&nbsp;mul...", x:'50', y:'69'},
                    {tag: "tspan", text:"lines.", x:'50', y:'93'}
                ]
            });
            inspect(text.boundingRect(), {left:2, top:45, width:96, height:72});
            // In order to cover line removing and anchoring
            text.position(50, 60).dimension(100, 48).anchor("start").vanchor("middle")
                .message("A message\nwith two lines.");
            inspect(text.component, {
                tag: "text", text:'A&nbsp;message', x:'50', y:21, "text-anchor":"start",
                children:[
                    {tag: "tspan", text:"with&nbsp;two...", x:'50', y:45}
                ]
            });
            // Text-Decoration : none | underline | overline | line-through | blink
            text.decoration("underline");
            inspect(text.component, {"text-decoration":"underline"});
            inspect(text, {_decoration:"underline"});
            // Duplicate
            testDuplicate(text);
            // Inside and getTarget
            text.anchor("start");
            inspect(text.boundingRect(), {left:50, top:33, width:96, height:48});
            assert.equal(text.inside(55, 60), true);
            assert.equal(text.inside(45, 60), false);
            assert.equal(text.inside(135, 60), true);
            assert.equal(text.inside(150, 60), false);
            text.anchor("middle");
            inspect(text.boundingRect(), {left:2, top:33, width:96, height:48});
            assert.equal(text.inside(15, 60), true);
            assert.equal(text.inside(0, 60), false);
            assert.equal(text.inside(95, 60), true);
            assert.equal(text.inside(110, 60), false);
            text.anchor("end");
            inspect(text.boundingRect(), {left:-46, top:33, width:96, height:48});
            assert.equal(text.inside(-40, 60), true);
            assert.equal(text.inside(-50, 60), false);
            assert.equal(text.inside(45, 60), true);
            assert.equal(text.inside(55, 60), false);
            inspect(text.globalPoint(10, 15), {x:60, y:75});
            assert.equal(text.getTarget(50, 60), text);
            text.opacity(0.0);
            assert.equal(text.getTarget(50, 60), null);
            text.opacity(0.5);
            assert.equal(text.getTarget(70, 80), null);
            // Test observers
            var rx= 0, ry= 0, rWidth= 0, rHeight= 0;
            text.onMove(pos=>{rx=pos.x; ry=pos.y;});
            text.onResize(size=>{rWidth=size.width; rHeight=size.height;});
            text.dimension(100, 50).position(5, 25);
            assert.equal("5 25 100 50", rx+" "+ry+" "+rWidth+" "+rHeight);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Text().localPoint(40, 50));
            assert.ok(!new svg.Text().globalPoint(40, 50));
        });

        it("creates a line", function() {
            var line = new svg.Line(20, 20, 80, 80);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(line);
            // Positionning and sizing
            inspect(line.component, {tag:'line', x1:20, y1:20, x2:80, y2:80});
            inspect(line, {x1:20, y1:20, x2:80, y2:80});
            // Color
            line.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(line.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = line.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "5 10");
            // Duplicate
            testDuplicate(line);
            // Inside
            assert.equal(line.inside(75, 75), true);
            assert.equal(line.inside(20, 50), false);
            // Test observers
            var rx1= 0, ry1= 0, rx2= 0, ry2= 0;
            line.onReshape(shape=>{
                rx1=shape.x1;
                ry1=shape.y1;
                rx2=shape.x2;
                ry2=shape.y2;
            });
            line.start(30, 40);
            assert.equal("30 40 80 80", rx1+" "+ry1+" "+rx2+" "+ry2);
            line.end(50, 60);
            assert.equal("30 40 50 60", rx1+" "+ry1+" "+rx2+" "+ry2);
            // getTarget
            assert.equal(line.getTarget(45, 60), line);
            assert.equal(line.getTarget(45, 70), null);
            line.opacity(0.0);
            assert.equal(line.getTarget(45, 60), null);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Line().localPoint(40, 50));
            assert.ok(!new svg.Line().globalPoint(40, 50));
        });

        it("creates a path", function() {
            var path = new svg.Path(100, 100);
            path.bezier(150, 100, 100, 200).cubic(200, 200, 200, 300, 100, 300).line(0, 200).move(100, 100);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(path);
            // Positionning and sizing
            inspect(path.component, {tag:'path', d:"M 100,100 Q 150,100 100,200 C 200,200 200,300 100,300 L 0,200 M 100,100 "});
            inspect(path, {points:[
                {x:100, y:100, type:"move"}, {x:150, y:100, type:"bezier-c1"},
                {x:100, y:200, type:"bezier-end"}, {x:200, y:200, type:"cubic-c1"},
                {x:200, y:300, type:"cubic-c2"}, {x:100, y:300, type:"cubic-end"},
                {x:0, y:200, type:"line"}, {x:100, y:100, type:"move"}]});
            // Color
            path.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(path.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = path.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "5 10");
            // Duplicate
            testDuplicate(path);
            // Inside
            assert.equal(path.inside(100, 100), true);
            assert.equal(path.inside(20, 20), false);
            // Test observers
            var rPoints = [];
            path.onReshape(shape=>{
                rPoints = shape;
            });
            path.reset();
            assert.equal(path.points.length, 0);
            path.move(100, 100);
            inspect(path, {points:[{x:100, y:100, type:"move"}]});
            path.line(100, 200);
            inspect(path, {points:[{x:100, y:100, type:"move"}, {x:100, y:200, type:"line"}]});
            path.cubic(200, 200, 300, 200, 300, 100);
            inspect(path, {points:[{x:100, y:100, type:"move"}, {x:100, y:200, type:"line"},
                {x:200, y:200, type:"cubic-c1"}, {x:300, y:200, type:"cubic-c2"}, {x:300, y:100, type:"cubic-end"}]});
            path.bezier(200, 0, 100, 100);
            inspect(path, {points:[{x:100, y:100, type:"move"}, {x:100, y:200, type:"line"},
                {x:200, y:200, type:"cubic-c1"}, {x:300, y:200, type:"cubic-c2"}, {x:300, y:100, type:"cubic-end"},
                {x:200, y:0, type:"bezier-c1"}, {x:100, y:100, type:"bezier-end"}]});
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Path().localPoint(40, 50));
            assert.ok(!new svg.Path().globalPoint(40, 50));
        });

        it("creates an image", function() {
            var image = new svg.Image("/an/image.png").position(100, 100);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(image);
            // Positionning and sizing
            inspect(image.component, {tag:'image', x:100, y:100, href:"/an/image.png"});
            inspect(image, {x:100, y:100, src:"/an/image.png"});
            image.position(120, 150).url("/another/image.png");
            inspect(image, {x:120, y:150, src:"/another/image.png"});
            // Color
            image.color([50, 70, 80], 4, [100, 110, 120]);
            inspect(image.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
            // Global point
            let gp = image.globalPoint(5, 10);
            assert.equal(gp.x+" "+gp.y, "125 160");
            // Duplicate
            testDuplicate(image);
            // Inside
            assert.equal(image.inside(120, 150), true);
            assert.equal(image.inside(20, 20), false);
            assert.equal(image.getTarget(120, 150), image);
            assert.equal(image.getTarget(20, 20), null);
            image.opacity(0.0);
            assert.equal(image.getTarget(120, 150), null);
            // Test observers
            var rx= 0, ry= 0, rwidth= 0, rheight=0;
            image.onMove(pos=>{rx=pos.x; ry=pos.y;});
            image.onResize(size=>{rwidth=size.width; rheight=size.height;});
            image.dimension(30, 35).position(5, 25);
            assert.equal("5 25 30 35", rx+" "+ry+" "+rwidth+" "+rheight);
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Image().localPoint(40, 50));
            assert.ok(!new svg.Image().globalPoint(40, 50));
        });

        it("checks events processing on shapes", function() {
            let testEvent = (eventHandler, eventType)=>{
                let rEvent=null;
                rect[eventHandler](event=>{rEvent=event;});
                svg.event(rect, eventType, {type:eventType});
                assert.equal(rEvent.type, eventType);
                rEvent = null;
                rect[eventHandler](null);
                assert.ok(!rEvent);
            };
            var rect = new svg.Rect(100, 50).position(50, 25);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(rect);
            testEvent("onClick", "click");
            testEvent("onRightClick", "contextmenu");
            testEvent("onMouseDown", "mousedown");
            testEvent("onMouseMove", "mousemove");
            testEvent("onMouseUp", "mouseup");
            testEvent("onMouseEnter", "mouseenter");
            testEvent("onMouseOut", "mouseout");
            testEvent("onMouseWheel", "wheel");
        });

        it("creates a Drawing inside another Drawing", function() {
            var inside = new svg.Drawing(100, 200);
            var drawing = new svg.Drawing(1000, 500);
            // Test positionning
            drawing.add(inside.dimension(20, 25).position(10, 15));
            inspect(inside.component, {tag:'svg', "x":10, "y":15, "width":20, "height":25});
            // Test observers
            var rx= 0, ry= 0, rwidth= 0, rheight=0;
            inside.onMove(pos=>{rx=pos.x; ry=pos.y;});
            inside.onResize(size=>{rwidth=size.width; rheight=size.height;});
            inside.dimension(30, 35).position(5, 25);
            assert.equal("5 25 30 35", rx+" "+ry+" "+rwidth+" "+rheight);
            // Target
            assert.equal(inside.inside(10, 30), true);
            assert.equal(inside.inside(0, 30), false);
            assert.equal(inside.inside(10, 0), false);
            assert.equal(inside.inside(10, 70), false);
            assert.equal(inside.inside(40, 30), false);
            // Animation
            testResizeAnimation(inside);
            testPositionAnimation(inside);
        });

        it("plays with Drawing visibility", function() {
            var rect = new svg.Rect(10, 10);
            var circle = new svg.Circle(10, 10);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(rect).add(circle);
            drawing.show('content');
            inspect(runtime.anchor('content'), {
                    tag: "anchor",
                    children: [{
                        tag: 'svg'
                    }]
                }
            );
            drawing.hide();
            assert.equal(0, runtime.anchor('content').children.length);
            assert.equal(2, drawing.children.length);
            drawing.remove(circle);
            assert.equal(1, drawing.children.length);
            inspect(drawing.component, {
                    tag: "svg",
                    children:[{
                        tag:"rect"
                    }]
                }
            );
            drawing.remove(rect);
            assert.equal(0, drawing.children.length);
        });

        it("creates an Ordered handler", function() {
            var ordered = new svg.Ordered(3);
            var rect = new svg.Rect(10, 10).position(100, 100);
            var circle = new svg.Circle(10);
            var drawing = new svg.Drawing(1000, 500);
            ordered.set(0, rect);
            ordered.set(1, circle);
            drawing.add(ordered);
            // Test positionning
            inspect(ordered.component, {tag:'g', children:[
                {tag:'rect', x:95, y:95},
                {tag:'circle'},
                {tag:'rect', x:0, y:0, width:0, height:0}
            ]});
            ordered.unset(0).set(2, rect);
            inspect(ordered.component, {tag:'g', children:[
                {tag:'rect', x:0, y:0, width:0, height:0},
                {tag:'circle'},
                {tag:'rect', x:95, y:95}
            ]});
            // Duplicate
            testDuplicate(ordered);
            // Local/global point
            inspect(ordered.localPoint(120, 160), {x:120, y:160});
            inspect(ordered.globalPoint(120, 160), {x:120, y:160});
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Ordered(1).localPoint(40, 50));
            assert.ok(!new svg.Ordered(1).globalPoint(40, 50));
        });

        it("uses a handler", function() {
            var drawing = new svg.Drawing(1000, 500);
            var translation = new svg.Translation();
            drawing.add(translation).show('content');
            var rect1 = new svg.Rect(10, 10);
            var rect2 = new svg.Rect(15, 15);
            var border = new svg.Rect(20, 20);
            translation.add(rect1).add(rect2).add(border);
            inspect(translation.component, {tag:'g', children:[
                {tag:'rect', width:10},
                {tag:'rect', width:15},
                {tag:'rect', width:20}
            ]});
            translation.color(svg.RED, 1, svg.BLACK);
            inspect(translation.component, {tag:'g', children:[
                {tag:'rect', width:10, fill:"rgb(250,0,0)", "stroke-width":1, stroke:"rgb(0,0,0)"},
                {tag:'rect', width:15},
                {tag:'rect', width:20}
            ]});
            assert.equal(null, translation.getTarget(100, 100));
            rect2.position(100, 100);
            assert.equal(rect2, translation.getTarget(100, 100));
            translation.remove(rect2);
            inspect(translation.component, {tag:'g', children:[
                {tag:'rect', width:10},
                {tag:'rect', width:20}
            ]});
            translation.clear();
            assert.equal(0, translation.component.children.length);
        });

        it("creates a Translation handler", function() {
            var translation = new svg.Translation(120, 150);
            var rect = new svg.Rect(10, 10);
            var drawing = new svg.Drawing(1000, 500);
            translation.add(rect);
            drawing.add(translation);
            // Test positionning
            inspect(translation.component, {tag:'g', "transform":"translate(120 150)", children:[
                {tag:'rect'}
            ]});
            // Test observers
            var rx= 0, ry= 0;
            translation.onMove(pos=>{rx=pos.x; ry=pos.y;});
            translation.move(150, 120);
            assert.equal("150 120", rx+" "+ry);
            // Duplicate
            testDuplicate(translation);
            // Local/global point
            inspect(translation.localPoint(120, 160), {x:-30, y:40});
            inspect(translation.globalPoint(-30, 40), {x:120, y:160});
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Translation().localPoint(40, 50));
            assert.ok(!new svg.Translation().globalPoint(40, 50));
        });

        it("creates a Rotation handler", function() {
            var rotation = new svg.Rotation(30);
            var rect = new svg.Rect(10, 20);
            var drawing = new svg.Drawing(1000, 500);
            rotation.add(rect);
            drawing.add(rotation);
            // Test positionning
            inspect(rotation.component, {tag:'g', "transform":"rotate(30)", children:[
                {tag:'rect'}
            ]});
            // Test observers
            var rAngle;
            rotation.onReshape(angle=>{rAngle=angle;});
            rotation.rotate(90);
            assert.equal(90, rAngle);
            // Duplicate
            testDuplicate(rotation);
            // Local/global point
            inspect(rotation.localPoint(120, 160), {x:160, y:-119.99999999999999});
            inspect(rotation.globalPoint(160, -120), {x:120.00000000000001, y:160});
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Rotation().localPoint(40, 50));
            assert.ok(!new svg.Rotation().globalPoint(40, 50));
        });

        it("creates a Scaling handler", function() {
            var scaling = new svg.Scaling(2);
            var rect = new svg.Rect(10, 20);
            var drawing = new svg.Drawing(1000, 500);
            scaling.add(rect);
            drawing.add(scaling);
            inspect(scaling.component, {tag:'g', "transform":"scale(2)", children:[
                {tag:'rect'}
            ]});
            // Test observers
            var rScale;
            scaling.onReshape(scale=>{rScale=scale;});
            scaling.scale(1.5);
            assert.equal(1.5, rScale);
            // Duplicate
            testDuplicate(scaling);
            // Local/global point
            inspect(scaling.localPoint(120, 160), {x:80, y:106.66666666666667});
            inspect(scaling.globalPoint(80, 60), {x:120, y:90});
            // Cas particuliers (default constructor + null result for disconnected local/global point)
            assert.ok(!new svg.Scaling().localPoint(40, 50));
            assert.ok(!new svg.Scaling().globalPoint(40, 50));
        });

        it("animates shapes", function () {
            var rect = new svg.Rect(100, 50);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(rect);
            // Animation
            testResizeAnimation(rect);
            testPositionAnimation(rect, {x:5, y:10});
            testColorAnimation(rect);
            testOpacityAnimation(rect);
        });

        it("animates handlers", function () {
            var translation = new svg.Translation(100, 100);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(translation);
            // Animation
            testMoveAnimation(translation);
            testOpacityAnimation(translation);

            var rotation = new svg.Rotation(0);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(rotation);
            // Animation
            testRotateAnimation(rotation);
            testOpacityAnimation(rotation);

            var scaling = new svg.Scaling(1);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(scaling);
            // Animation
            testScalingAnimation(scaling);
            testOpacityAnimation(scaling);
        });

        it("animates lines", function () {
            var line = new svg.Line(50, 50, 100, 100);
            var drawing = new svg.Drawing(1000, 500);
            drawing.add(line);
            // Animation
            testMoveLineAnimation(line);
            testStartLineAnimation(line);
            testEndLineAnimation(line);
        });

        it("creates and displays a block", function() {
            var screen = new svg.Screen(1000, 500);
            var block = new svg.Block(500, 200);
            screen.add(block);
            inspect(screen.component, {
                tag:"div", style:"left:0px;top:0px;width:1000px;height:500px;position:absolute;",
                children:[
                    {tag:"div", style:"position:absolute;left:-250px;top:-100px;width:500px;height:200px;"}
                ]
            });
            var textItem1 = new svg.TextField(10, 10, 100, 20, "first");
            var textItem2 = new svg.TextField(10, 30, 100, 20, "second");
            block.add(textItem1).add(textItem2);
            inspect(screen.component, {
                tag:"div",
                children:[
                    {tag:"div", style:"position:absolute;left:-250px;top:-100px;width:500px;height:200px;",
                        children:[
                            {tag:"input", valueText:"first"},
                            {tag:"input", valueText:"second"}
                        ]
                    }
                ]
            });
            block.remove(textItem1);
            inspect(screen.component, {
                tag:"div",
                children:[
                    {tag:"div", style:"position:absolute;left:-250px;top:-100px;width:500px;height:200px;",
                        children:[
                            {tag:"input", valueText:"second"}
                        ]
                    }
                ]
            });
            var rx= 0, ry= 0, rwidth= 0, rheight=0;
            block.onMove(pos=>{rx=pos.x; ry=pos.y;});
            block.onResize(size=>{rwidth=size.width; rheight=size.height;});
            block.dimension(30, 35).move(5, 25);
            assert.equal("5 25 30 35", rx+" "+ry+" "+rwidth+" "+rheight);
            testDuplicate(block);
        });

        it("creates and displays a screen with a clipping section", function() {
            var screen = new svg.Screen(1000, 500);
            var drawing = new svg.Drawing(1000, 500);
            screen.add(drawing);
            var frame = new svg.Drawing(500, 400).position(100, 50);
            drawing.add(frame);
            var clip = new svg.Clip(frame);
            screen.add(clip);
            inspect(screen.component, {
                tag:"div", style:"left:0px;top:0px;width:1000px;height:500px;position:absolute;",
                children:[
                    {tag:"svg", width:1000, height:500,
                        children:[
                            {tag:"svg", x:100, y:50, width:500, height:400}
                        ]
                    },
                    {tag:"div", style:"overflow:hidden;pointer-events:none;border:none;position:absolute;left:100px;top:50px;width:500px;height:400px;"}
                ]
            });
            // FIXME : clipping must be synchronized with drawing !
        });

        it("creates and displays a screen with a textItem object", function() {
            var screen = new svg.Screen(1000, 500);
            var textItem = new svg.TextField(10, 10, 100, 20, "content message");
            screen.add(textItem);
            inspect(screen.component, {
                tag:"div",
                children:[
                    {
                        tag:"input", type:"text",
                        style:"position:absolute;left:10px;top:10px;width:100px;height:20px;text-decoration:none;text-align:center;font-family:arial;font-size:12px;background-color:transparent;border:0px solid transparent;margin:0px;outline:none;pointer-events:initial;color:rgb(0,0,0);",
                        valueText:"content message",
                        placeholder:""
                    }
                ]
            });
            textItem
                .anchor('bottom')
                .font("Helvetica", 8, 2)
                .fontColor(svg.RED)
                .decoration('overline')
                .color(svg.BLUE, 3, svg.GRAY)
                .message("My content")
                .placeHolder("Enter it here");
            inspect(screen.component, {
                tag:"div",
                children:[
                    {
                        tag:"input", type:"text",
                        style:"position:absolute;left:10px;top:10px;width:100px;height:20px;text-decoration:overline;text-align:bottom;font-family:Helvetica;font-size:8px;line-height:2px;background-color:rgb(0,0,200);border:3px solid transparent;margin:-3px;outline:none;pointer-events:initial;color:rgb(250,0,0);",
                        valueText:"My content",
                        placeholder:"Enter it here"
                    }
                ]
            });
            testDuplicate(textItem);
        });

        it("creates and displays a screen with a textArea object", function() {
            var screen = new svg.Screen(1000, 500);
            var textArea = new svg.TextArea(10, 10, 100, 20, "first line\nsecond line");
            screen.add(textArea);
            inspect(screen.component, {
                tag:"div",
                children:[
                    {
                        tag:"textarea",
                        style:"overflow:hidden;resize:none;position:absolute;left:10px;top:10px;width:100px;height:20px;text-decoration:none;text-align:center;font-family:arial;font-size:12px;background-color:transparent;border:0px solid transparent;margin:0px;outline:none;pointer-events:initial;color:rgb(0,0,0);",
                        valueText:"first line\nsecond line",
                        placeholder:""
                    }
                ]
            });
            textArea.scroll('bottom');
            inspect(screen.component, {
                tag:"div",
                children:[
                    {
                        tag:"textarea",
                        style:"overflow:bottom;resize:none;position:absolute;left:10px;top:10px;width:100px;height:20px;text-decoration:none;text-align:center;font-family:arial;font-size:12px;background-color:transparent;border:0px solid transparent;margin:0px;outline:none;pointer-events:initial;color:rgb(0,0,0);",
                        valueText:"first line\nsecond line",
                        placeholder:""
                    }
                ]
            });
            testDuplicate(textArea);
        });

    });

});