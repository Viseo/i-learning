/**
 * Created by HDA3014 on 11/03/2016.
 */
var assert = require('assert');
var testUtils = require('./testutils');
var mockRuntime = require('./runtimemock').mockRuntime;
require('./enhancer').Enhance();
var SVG = require('./svghandler').SVG;
var Gui = require("./svggui.js").Gui;
var Memento = require("./memento").Memento;

var runtime;
var svg;
var gui;
var inspect = testUtils.inspect;
var retrieve = testUtils.retrieve;

describe('SVG gui', function() {

    describe('Canvas tests', function () {

        beforeEach(function () {
            runtime = mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            gui = Gui(svg, {speed: 10, step: 10});
        });

        it("checks Canvas initialization", function() {
            let canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
            inspect(canvas.component.component,
                {tag:"div", style:"left:0px;top:0px;width:1000px;height:500px;position:absolute;",
                    children:[
                        {tag:"svg", width:1000, height:500,
                            children:[
                                {tag:"g", transform:"translate(0 0)",
                                    children:[
                                    ]
                                },
                                {tag:"rect", x:0, y:0, width:1000, height:500}
                            ]
                        }
                    ]
                });
            canvas.dimension(1500, 1000);
            assert.equal(1500, canvas.width);
            assert.equal(1000, canvas.height);
            inspect(canvas.component.component, {
                style:"left:0px;top:0px;width:1500px;height:1000px;position:absolute;"
            });
            let frame = retrieve(canvas.component.component,"[frame]");
            assert.ok(frame);
            inspect(frame, {width:1500, height:1000});
            let glass = retrieve(canvas.component.component,"[glass]");
            assert.ok(glass);
            inspect(glass, {width:1500, height:1000});
        });

        it("adds and remove component(s) from canvas", function() {
            let canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
            let background = retrieve(canvas.component.component,"[background]");
            let rect = new svg.Rect(20, 20).color(svg.RED, 0, []);
            let rect2 = new svg.Rect(30, 30).color(svg.RED, 0, []);
            canvas.add(rect).add(rect2);
            inspect(background, {
                children:[
                    {tag:"rect", width:20, height:20},
                    {tag:"rect", width:30, height:30}
                ]
            });
            canvas.remove(rect);
            inspect(background, {
                children:[
                    {tag:"rect", width:30, height:30}
                ]
            });
        });

        it("checks DnD management", function() {
            let canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
            let background = retrieve(canvas.component.component,"[background]");
            let glass = retrieve(canvas.component.component,"[glass]");
            let rEvent = {};
            let handler = evtType=>{
                return event=>{
                    rEvent.x=event.pageX;rEvent.y=event.pageY;
                    rEvent.prev=rEvent.type;
                    rEvent.type=evtType;}
            };
            let rect = new svg.Rect(20, 20).color(svg.RED, 0, []);
            rect.onMouseDown(handler("mouseDown"));
            rect.onMouseMove(handler("mouseMove"));
            rect.onMouseUp(handler("mouseUp"));
            rect.onClick(handler("click"));
            rect.onMouseWheel(handler("mouseWheel"));
            // Add an object on canvas
            canvas.add(rect);
            inspect(background, {
                children:[{tag:"rect", width:20, height:20}]
            });
            // Simple DnD
            runtime.event(glass, "mousedown", {pageX:5, pageY:5});
            assert.equal(canvas.drag, rect);
            inspect(rEvent, {x:5, y:5, type:"mouseDown"});
            runtime.event(glass, "mousemove", {pageX:25, pageY:25});
            assert.equal(canvas.drag, rect);
            inspect(rEvent, {x:25, y:25, type:"mouseMove"});
            runtime.event(glass, "wheel", {pageX:45, pageY:45});
            assert.equal(canvas.drag, rect);
            inspect(rEvent, {x:45, y:45, type:"mouseWheel"});
            runtime.event(glass, "mouseup", {pageX:5, pageY:5});
            assert.equal(canvas.drag, null);
            inspect(rEvent, {x:5, y:5, prev:"mouseUp", type:"click"});
            // MouseUp and mouseDown not in same target : no click
            runtime.event(glass, "mousedown", {pageX:5, pageY:5});
            runtime.event(glass, "mouseup", {pageX:45, pageY:45});
            inspect(rEvent, {x:45, y:45, prev:"mouseDown", type:"mouseUp"});
            // Automatic mouse release when mouse out.
            runtime.event(glass, "mousedown", {pageX:5, pageY:5});
            assert.equal(canvas.drag, rect);
            inspect(rEvent, {x:5, y:5, type:"mouseDown"});
            runtime.event(glass, "mouseout", {pageX:45, pageY:45});
            assert.equal(canvas.drag, null);
            inspect(rEvent, {x:45, y:45, type:"mouseUp"});
            // Event already processed nothing is done.
            rEvent={x:0, y:0, type:"none"};
            runtime.event(glass, "mousedown", {processed:true, pageX:5, pageY:5});
            runtime.event(glass, "mousemove", {processed:true, pageX:5, pageY:5});
            runtime.event(glass, "mouseup", {processed:true, pageX:5, pageY:5});
            runtime.event(glass, "mouseout", {processed:true, pageX:5, pageY:5});
            runtime.event(glass, "click", {processed:true, pageX:5, pageY:5});
            runtime.event(glass, "wheel", {processed:true, pageX:5, pageY:5});
            inspect(rEvent, {x:0, y:0, type:"none"});
            // No target : noting is done
            rEvent={x:0, y:0, type:"none"};
            runtime.event(glass, "mousedown", {pageX:45, pageY:45});
            runtime.event(glass, "mousemove", {pageX:45, pageY:45});
            runtime.event(glass, "mouseup", {pageX:45, pageY:45});
            runtime.event(glass, "mouseout", {pageX:45, pageY:45});
            runtime.event(glass, "click", {pageX:45, pageY:45});
            runtime.event(glass, "wheel", {pageX:45, pageY:45});
            inspect(rEvent, {x:0, y:0, type:"none"});
            // Mouse down ignored if currently in drag mode
            let rect2 = new svg.Rect(20, 20).color(svg.RED, 0, []).position(40, 40);
            rect2.onMouseDown(handler("mouseDown"));
            canvas.add(rect2);
            runtime.event(glass, "mousedown", {pageX:45, pageY:45});
            runtime.event(glass, "mousedown", {pageX:5, pageY:5});
            inspect(rEvent, {x:45, y:45});
        });

        it("checks activation management", function() {
            let canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
            let glass = retrieve(canvas.component.component,"[glass]");
            let rCount = 0;
            let handler = {refresh:event=>{rCount++}};
            canvas.addActivationListener(handler);
            let rect = new svg.Rect(20, 20).color(svg.RED, 0, []);
            canvas.add(rect);
            runtime.event(glass, "mousedown", {pageX:5, pageY:5});
            runtime.event(glass, "mousemove", {pageX:5, pageY:5});
            runtime.event(glass, "mouseup", {pageX:5, pageY:5});
            runtime.event(glass, "mouseout", {pageX:5, pageY:5});
            runtime.event(glass, "wheel", {pageX:5, pageY:5});
            assert.equal(rCount, 5);
            canvas.removeActivationListener(handler);
            runtime.event(glass, "mousedown", {pageX:5, pageY:5});
            assert.equal(rCount, 5);
        });

        it("checks key management", function() {
            let canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
            let rEvent = {};
            Memento.rollback = ()=>rEvent="rollback";
            Memento.replay = ()=>rEvent="replay";
            canvas.key(88/*x*/, (key, ctrl, alt)=>{
                rEvent = {key, ctrl, alt};
            });
            runtime.globalEvent("keydown", {keyCode:88, ctrlKey:true, altKey:true});
            inspect(rEvent, {key:88, ctrl:true, alt:true});
            runtime.globalEvent("keydown", {keyCode:90, ctrlKey:true, altKey:false});
            assert.equal("rollback", rEvent);
            runtime.globalEvent("keydown", {keyCode:89, ctrlKey:true, altKey:false});
            assert.equal("replay", rEvent);
            // Special cases 1 : event already processed
            rEvent = 'none';
            runtime.globalEvent("keydown", {processed:true, keyCode:90, ctrlKey:true, altKey:false});
            assert.equal("none", rEvent);
            // Special cases 2 : key ignored
            rEvent = 'none';
            runtime.globalEvent("keydown", {keyCode:80, ctrlKey:true, altKey:false});
            assert.equal("none", rEvent);
            // Focus management
            let rect = new svg.Rect(20, 20).color(svg.RED, 0, []);
            let translation = new svg.Translation().add(rect);
            translation.focus = translation;
            translation.processKeys = (key, ctrl, alt)=>rEvent={key, ctrl, alt};
            canvas.add(translation);
            // Case one : no focus
            runtime.globalEvent("keydown", {keyCode:80, ctrlKey:true, altKey:false});
            assert.equal("none", rEvent);
            // Case two : focus
            let glass = retrieve(canvas.component.component,"[glass]");
            runtime.event(glass, "mousedown", {pageX:5, pageY:5});
            runtime.event(glass, "mouseup", {pageX:5, pageY:5});
            runtime.globalEvent("keydown", {keyCode:80, ctrlKey:true, altKey:false});
            inspect(rEvent, {key:80, ctrl:true, alt:false});
        });

        it("checks marking", function() {
            let canvas = new gui.Canvas(1000, 500).mark("canvas");
            assert.equal("canvas", canvas.component.id);
        });

        it("checks automatic dragging", function() {
            let canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
            let glass = retrieve(canvas.component.component,"[glass]");
            let rEvent = {};
            let handler = evtType=>{
                return event=>{
                    rEvent.x=event.pageX;rEvent.y=event.pageY;
                    rEvent.prev=rEvent.type;
                    rEvent.type=evtType;}
            };
            let rect = new svg.Rect(20, 20).color(svg.RED, 0, []);
            rect.onMouseMove(handler("mouseMove"));
            canvas.add(rect);
            canvas.dragFocus(rect);
            runtime.event(glass, "mousemove", {pageX:25, pageY:25});
            assert.equal(canvas.drag, rect);
            inspect(rEvent, {x:25, y:25, type:"mouseMove"});
        });

        it("searches owning canvas", function() {
            let canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
            let rect = new svg.Rect(20, 20).color(svg.RED, 0, []);
            let translation = new svg.Translation().add(rect);
            canvas.add(translation);
            assert.equal(canvas, gui.canvas(rect));
        });

    });

    describe('Handle tests', function () {

        let canvas;

        beforeEach(function () {
            runtime = mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            gui = Gui(svg, {speed: 10, step: 10});
            canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
        });

        it("builds a verical handle", function() {
            let handle = new gui.Handle([svg.LIGHT_ORANGE, 3, svg.ORANGE], ()=>{})
                .vertical(100, 0, 100)
                .dimension(100, 200)
                .position(50);
            canvas.add(handle.component);
            inspect(handle.component.component, {tag:"g", transform:"translate(100 50)",
                children:[
                    {tag:"path", d:"M -8,-17 L -8,17 C -8,33 8,33 8,17 L 8,-17 C 8,-33 -8,-33 -8,-17 ",
                    fill:"rgb(255,204,0)", "stroke-width":3, stroke:"rgb(220,100,0)"}
                ]
            });
            // value interval may be given in any order
            handle.vertical(100, 100, 0);
            inspect(handle.component.component, {tag:"g", transform:"translate(100 50)",
                children:[
                    {tag:"path", d:"M -8,-17 L -8,17 C -8,33 8,33 8,17 L 8,-17 C 8,-33 -8,-33 -8,-17 "}
                ]
            });
            // play with position
            handle.position(10);
            inspect(handle.component.component, {tag:"g", transform:"translate(100 25)"});
            handle.position(90);
            inspect(handle.component.component, {tag:"g", transform:"translate(100 75)"});
            // play with size
            handle.dimension(1, 200);
            inspect(handle.component.component, {tag:"g", transform:"translate(100 75)",
                children:[
                    {tag:"path", d:"M -8,0 C -8,16 8,16 8,0 C 8,-16 -8,-16 -8,0 "}
                ]
            });
            handle.dimension(150, 200);
            inspect(handle.component.component, {tag:"g", transform:"translate(100 62.5)"});
            handle.dimension(200, 200);
            inspect(handle.component.component, {tag:"g", transform:"translate(100 62.5)",
                children:[
                    {tag:"path", d:""}
                ]
            });
        });

        it("builds an horizontal handle", function() {
            let handle = new gui.Handle([svg.LIGHT_ORANGE, 3, svg.ORANGE], ()=>{})
                .horizontal(0, 100, 100)
                .dimension(100, 200)
                .position(50);
            canvas.add(handle.component);
            inspect(handle.component.component, {tag:"g", transform:"translate(50 100)",
                children:[
                    {tag:"path", d:"M -17,-8 L 17,-8 C 33,-8 33,8 17,8 L -17,8 C -33,8 -33,-8 -17,-8 ",
                        fill:"rgb(255,204,0)", "stroke-width":3, stroke:"rgb(220,100,0)"}
                ]
            });
            // Interval may be given in any order
            handle.horizontal(100, 0, 100);
            inspect(handle.component.component, {tag:"g", transform:"translate(50 100)",
                children:[
                    {tag:"path", d:"M -17,-8 L 17,-8 C 33,-8 33,8 17,8 L -17,8 C -33,8 -33,-8 -17,-8 "}
                ]
            });
            // Play with size
            handle.dimension(1, 200);
            inspect(handle.component.component, {tag:"g", transform:"translate(50 100)",
                children:[
                    {tag:"path", d:"M 0,-8 C 16,-8 16,8 0,8 C -16,8 -16,-8 0,-8 "}
                ]
            });
        });

        it("checks vertical handle dnd without callback", function() {
            let handle = new gui.Handle([svg.LIGHT_ORANGE, 3, svg.ORANGE])
                .vertical(100, 0, 100)
                .dimension(100, 200)
                .position(50);
            canvas.add(handle.component);
            runtime.event(handle.handle.component, "mousedown", {pageX:102, pageY:54});
            runtime.event(handle.handle.component, "mousemove", {pageX:98, pageY:64});
            runtime.event(handle.handle.component, "mouseup", {pageX:98, pageY:64});
            inspect(handle.component.component, {tag:"g", transform:"translate(100 60)"});
        });

        it("checks horizontal handle dnd with callback", function() {
            let rCalled="No";
            let handle = new gui.Handle([svg.LIGHT_ORANGE, 3, svg.ORANGE], position=>rCalled="Yes at : "+position)
                .horizontal(0, 100, 100)
                .dimension(100, 200)
                .position(50);
            canvas.add(handle.component);
            runtime.event(handle.handle.component, "mousedown", {pageX:54, pageY:102});
            runtime.event(handle.handle.component, "mousemove", {pageX:64, pageY:98});
            runtime.event(handle.handle.component, "mouseup", {pageX:64, pageY:98});
            inspect(handle.component.component, {tag:"g", transform:"translate(60 100)"});
            assert.equal(rCalled, "Yes at : 60");
        });

    });

    describe('Frame tests', function () {

        let canvas;

        beforeEach(function () {
            runtime = mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            gui = Gui(svg, {speed: 10, step: 10});
            canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
        });

        it("builds a frame", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0);
            content.width = 1000;
            content.height = 500;
            frame.set(content);
            inspect(frame.component.component,
                {
                    tag: "g", transform: "translate(0 0)",
                    children: [
                        {tag: "rect", x: -500, y: -250, width: 1000, height: 500, fill: "rgb(0,0,0)", stroke: "none"},
                        {
                            tag: "svg", x: -500, y: -250, width: 1000, height: 500,
                            children: [
                                {
                                    tag: "g", transform: "translate(0 0)",
                                    children: [
                                        {
                                            tag: "g", transform: "rotate(0)",
                                            children: [
                                                {
                                                    tag: "g", transform: "scale(1)",
                                                    children: [
                                                        {tag: "g"}
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "rect",
                            x: -500,
                            y: -250,
                            width: 1000,
                            height: 500,
                            fill: "none",
                            "stroke-width": 4,
                            stroke: "rgb(0,0,0)"
                        },
                        {
                            tag: "g", transform: "translate(0 0)",
                            children: [
                                {tag: "path", d: ""}
                            ]
                        },
                        {
                            tag: "g", transform: "translate(0 0)",
                            children: [
                                {tag: "path", d: ""}
                            ]
                        }
                    ]
                });
        });

        it("builds a frame without any content", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            inspect(frame.component.component,
                {
                    tag: "g", transform: "translate(0 0)",
                    children: [
                        {tag: "rect", x: -500, y: -250, width: 1000, height: 500, fill: "rgb(0,0,0)", stroke: "none"},
                        {
                            tag: "svg", x: -500, y: -250, width: 1000, height: 500,
                            children: [
                                {
                                    tag: "g", transform: "translate(0 0)",
                                    children: [
                                        {
                                            tag: "g", transform: "rotate(0)",
                                            children: [
                                                {
                                                    tag: "g", transform: "scale(1)",
                                                    children: []
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "rect",
                            x: -500,
                            y: -250,
                            width: 1000,
                            height: 500,
                            fill: "none",
                            "stroke-width": 4,
                            stroke: "rgb(0,0,0)"
                        },
                        {
                            tag: "g", transform: "translate(0 0)",
                            children: [
                                {tag: "path"}
                            ]
                        },
                        {
                            tag: "g", transform: "translate(0 0)",
                            children: [
                                {tag: "path"}
                            ]
                        }
                    ]
                });
            let border = retrieve(frame.component.component, '[border]');
            let background = retrieve(frame.component.component, '[background]');
            let view = retrieve(frame.component.component, '[view]');
            frame.dimension(800, 400);
            frame.dimension(500, 250);
            inspect(border, {width: 500, height: 250});
            inspect(background, {width: 500, height: 250});
            inspect(view, {width: 500, height: 250});
        });

        it("checks frame and view sizes", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame);
            let content = new svg.Translation(0, 0);
            content.width = 1000;
            content.height = 500;
            frame.set(content);
            let border = retrieve(frame.component.component, '[border]');
            let background = retrieve(frame.component.component, '[background]');
            let view = retrieve(frame.component.component, '[view]');
            let vHandle = retrieve(frame.component.component, '[vhandle]');
            let hHandle = retrieve(frame.component.component, '[hhandle]');
            frame.dimension(500, 250);
            inspect(border, {width: 500, height: 250});
            inspect(background, {width: 500, height: 250});
            inspect(view, {width: 500, height: 250});
            inspect(vHandle, {
                transform: "translate(250 -62.5)",
                children: [{d: "M -8,-54.5 L -8,54.5 C -8,70.5 8,70.5 8,54.5 L 8,-54.5 C 8,-70.5 -8,-70.5 -8,-54.5 "}]
            });
            inspect(hHandle, {
                transform: "translate(-125 125)",
                children: [{d: "M -117,-8 L 117,-8 C 133,-8 133,8 117,8 L -117,8 C -133,8 -133,-8 -117,-8 "}]
            });
        });

        it("plays with zoom", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0);
            content.width = 1000;
            content.height = 500;
            frame.set(content);
            let scale = retrieve(frame.component.component, '[scale]');
            let vHandle = retrieve(frame.component.component, '[vhandle]');
            let hHandle = retrieve(frame.component.component, '[hhandle]');
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // Zoom in
            runtime.globalEvent("keydown", {keyCode: 107, ctrlKey: true, altKey: false});
            inspect(scale, {transform: "scale(1.5)"});
            inspect(vHandle, {
                transform: "translate(500 0)",
                children: [{d: "M -8,-158.66666666666666 L -8,158.66666666666666 C -8,174.66666666666666 8,174.66666666666666 8,158.66666666666666 L 8,-158.66666666666666 C 8,-174.66666666666666 -8,-174.66666666666666 -8,-158.66666666666666 "}]
            });
            inspect(hHandle, {
                transform: "translate(0 250)",
                children: [{d: "M -325.3333333333333,-8 L 325.3333333333333,-8 C 341.3333333333333,-8 341.3333333333333,8 325.3333333333333,8 L -325.3333333333333,8 C -341.3333333333333,8 -341.3333333333333,-8 -325.3333333333333,-8 "}]
            });
            // Zoom out
            runtime.globalEvent("keydown", {keyCode: 109, ctrlKey: true, altKey: false});
            inspect(scale, {transform: "scale(1)"});
            inspect(vHandle, {
                transform: "translate(500 0)",
                children: [{d: ""}]
            });
            inspect(hHandle, {
                transform: "translate(0 250)",
                children: [{d: ""}]
            });
            // Zoom out again. Min zoom reached : no change
            runtime.globalEvent("keydown", {keyCode: 109, ctrlKey: true, altKey: false});
            inspect(scale, {transform: "scale(1)"});
        });

        it("tests minimal zoom computation", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0);
            content.width = 1200;
            content.height = 750;
            frame.set(content);
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // Eoom
            let scale = retrieve(frame.component.component, '[scale]');
            runtime.globalEvent("keydown", {keyCode: 109, ctrlKey: true, altKey: false});
            inspect(scale, {transform: "scale(0.6666666666666666)"});
            runtime.globalEvent("keydown", {keyCode: 109, ctrlKey: true, altKey: false});
            inspect(scale, {transform: "scale(0.6666666666666666)"});
            // Remove component
            content.width = 650;
            content.height = 1000;
            content.resizeHandler();
            inspect(scale, {transform: "scale(0.6666666666666666)"});
            runtime.globalEvent("keydown", {keyCode: 109, ctrlKey: true, altKey: false});
            inspect(scale, {transform: "scale(0.5)"});
        });

        it("tests minimal zoom computation when view height is greater view width", function () {
            let frame = new gui.Frame(500, 1000).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0);
            content.width = 1200;
            content.height = 750;
            frame.set(content);
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // Eoom
            let scale = retrieve(frame.component.component, '[scale]');
            runtime.globalEvent("keydown", {keyCode: 109, ctrlKey: true, altKey: false});
            inspect(scale, {transform: "scale(0.6666666666666666)"});
        });

        it("moves frame content using handles", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let vHandle = retrieve(frame.component.component, '[vhandle]');
            let hHandle = retrieve(frame.component.component, '[hhandle]');
            inspect(vHandle, {transform: "translate(500 -125)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
            // use horizontal handle
            runtime.event(hHandle.children[0], "mousedown", {pageX: 20, pageY: 500});
            runtime.event(hHandle.children[0], "mousemove", {pageX: 40, pageY: 500});
            runtime.event(hHandle.children[0], "mouseup", {pageX: 40, pageY: 500});
            inspect(content.component, {transform: "translate(-40 0)"});
            inspect(hHandle, {transform: "translate(-230 250)"});
            runtime.event(hHandle.children[0], "mousedown", {pageX: 40, pageY: 500});
            runtime.event(hHandle.children[0], "mousemove", {pageX: 0, pageY: 500});
            runtime.event(hHandle.children[0], "mouseup", {pageX: 0, pageY: 500});
            inspect(content.component, {transform: "translate(0 0)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
            // use vertical handle
            runtime.event(vHandle.children[0], "mousedown", {pageX: 1000, pageY: 20});
            runtime.event(vHandle.children[0], "mousemove", {pageX: 1000, pageY: 40});
            runtime.event(vHandle.children[0], "mouseup", {pageX: 1000, pageY: 40});
            inspect(content.component, {transform: "translate(0 -40)"});
            inspect(vHandle, {transform: "translate(500 -105)"});
        });

        it("tries to moves on over bottom/right border of frame", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let vHandle = retrieve(frame.component.component, '[vhandle]');
            let hHandle = retrieve(frame.component.component, '[hhandle]');
            // go beyond right limit
            runtime.event(hHandle.children[0], "mousedown", {pageX: 20, pageY: 500});
            runtime.event(hHandle.children[0], "mousemove", {pageX: 1500, pageY: 500});
            runtime.event(hHandle.children[0], "mouseup", {pageX: 1500, pageY: 500});
            inspect(content.component, {transform: "translate(-1000 0)"});
            inspect(hHandle, {transform: "translate(250 250)"});
            // go beyond bottom limit
            runtime.event(vHandle.children[0], "mousedown", {pageX: 1000, pageY: 20});
            runtime.event(vHandle.children[0], "mousemove", {pageX: 1000, pageY: 1000});
            runtime.event(vHandle.children[0], "mouseup", {pageX: 1000, pageY: 1000});
            inspect(content.component, {transform: "translate(-1000 -500)"});
            inspect(vHandle, {transform: "translate(500 125)"});
        });

        it("moves frame content using mouse wheel", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(500, 250).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let vHandle = retrieve(frame.component.component, '[vhandle]');
            let hHandle = retrieve(frame.component.component, '[hhandle]');
            // use horizontal wheel
            runtime.event(content.component, "wheel", {deltaX: -20, deltaY: 0});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 0)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
            runtime.event(content.component, "wheel", {deltaX: 20, deltaY: 0});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 0)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
            runtime.event(content.component, "wheel", {deltaX: 0, deltaY: -20});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 -100)"});
            inspect(vHandle, {transform: "translate(500 -75)"});
            runtime.event(content.component, "wheel", {deltaX: 0, deltaY: 20});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 0)"});
            inspect(vHandle, {transform: "translate(500 -125)"});
        });

        it("moves frame content using arrow keys", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let vHandle = retrieve(frame.component.component, '[vhandle]');
            let hHandle = retrieve(frame.component.component, '[hhandle]');
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // Move up-down
            runtime.globalEvent("keydown", {keyCode: 40, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 -100)"});
            inspect(vHandle, {transform: "translate(500 -75)"});
            runtime.globalEvent("keydown", {keyCode: 38, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 0)"});
            inspect(vHandle, {transform: "translate(500 -125)"});
            // Move left-right
            runtime.globalEvent("keydown", {keyCode: 39, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(-100 0)"});
            inspect(hHandle, {transform: "translate(-200 250)"});
            runtime.globalEvent("keydown", {keyCode: 37, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 0)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
        });

        it("moves too fast : second event is ignored", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // Move up-down
            runtime.globalEvent("keydown", {keyCode: 40, ctrlKey: false, altKey: false});
            // oops.. too fast !
            runtime.globalEvent("keydown", {keyCode: 40, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(content.component, {transform: "translate(0 -100)"});
        });

        it("does'nt prevent keyboard event when not recognized", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(500, 250).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // some key event, not recognized by frame
            let event = {keyCode: 70, ctrlKey: false, altKey: false};
            runtime.globalEvent("keydown", event);
            assert.ok(!event.prevented);
            // key event recognized by frame
            event = {keyCode: 40, ctrlKey: false, altKey: false};
            runtime.globalEvent("keydown", event);
            assert.ok(event.prevented);
        });

        it("set, set again, removes frame content", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let firstContent = new svg.Translation(0, 0).mark('firstContent');
            firstContent.width = 2000;
            firstContent.height = 1000;
            frame.set(firstContent);
            let secondContent = new svg.Translation(0, 0).mark('secondContent');
            secondContent.width = 1500;
            secondContent.height = 750;
            frame.set(secondContent);
            assert.ok(!retrieve(frame.component.component, '[firstContent]'));
            assert.ok(retrieve(frame.component.component, '[secondContent]'));
            // remove a content... not owned : ignored
            frame.remove(firstContent);
            assert.ok(retrieve(frame.component.component, '[secondContent]'));
            // remove the right content !
            frame.remove(secondContent);
            assert.ok(!retrieve(frame.component.component, '[secondContent]'));
        });

        it("drags and drop objects inside the frame", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('firstContent');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            let secondHandler = new svg.Translation(200, 200);
            content.add(firstHandler).add(secondHandler);
            let objectToDrag = new svg.Translation().add(new svg.Rect(10, 10));
            firstHandler.add(objectToDrag.move(20, 30));
            // Drag to scale
            frame.drag(objectToDrag, objectToDrag.parent, 10, 20);
            assert.equal(objectToDrag.parent, frame.scale);
            inspect(objectToDrag, {x:110, y:120});
            frame.drop(objectToDrag, frame.scale, 20, 30);
            assert.equal(objectToDrag.parent, frame.scale);
            inspect(objectToDrag, {x:20, y:30});
            // Drag from scale
            frame.drag(objectToDrag, objectToDrag.parent, 30, 40);
            assert.equal(objectToDrag.parent, frame.scale);
            inspect(objectToDrag, {x:30, y:40});
            frame.drop(objectToDrag, secondHandler, 20, 30);
            assert.equal(objectToDrag.parent, secondHandler);
            inspect(objectToDrag, {x:20, y:30});
            // Special case : immediate drop, no drag !
            frame.drop(objectToDrag, firstHandler, 30, 20);
            assert.equal(objectToDrag.parent, firstHandler);
            inspect(objectToDrag, {x:30, y:20});
            // Very special case : immediate drop on same handler !
            frame.drop(objectToDrag, firstHandler, 20, 30);
            assert.equal(objectToDrag.parent, firstHandler);
            inspect(objectToDrag, {x:20, y:30});
        });

        it ("plays a drag and drop (move) sequence without any callbacks", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            frame.installDnD(objectToDrag, {});
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            assert.equal(firstHandler, objectToDrag.component.parent);
            inspect(objectToDrag.component, {x:20, y:30});
            runtime.event(objectToDrag.component.component, "mousemove", {x:140, y:140});
            assert.equal(frame.scale, objectToDrag.component.parent);
            inspect(objectToDrag.component, {x:140, y:140});
            runtime.event(objectToDrag.component.component, "mousemove", {x:150, y:160});
            assert.equal(frame.scale, objectToDrag.component.parent);
            inspect(objectToDrag.component, {x:150, y:160});
            runtime.event(objectToDrag.component.component, "mouseup", {x:150, y:160});
            assert.equal(firstHandler, objectToDrag.component.parent);
            inspect(objectToDrag.component, {x:50, y:60});
        });

        it ("plays a drag and drop (move) sequence with all callbacks on DnD configuration object", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                dragged: ()=>{rEvents.push("dragged"); return true;},
                moved: ()=>{rEvents.push("moved"); return true;},
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {});
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mousemove", {x:140, y:140});
            runtime.event(objectToDrag.component.component, "mousemove", {x:150, y:160});
            runtime.event(objectToDrag.component.component, "mouseup", {x:150, y:160});
            assert.equal(3, rEvents.length);
            assert.equal("dragged", rEvents[0]);
            assert.equal("dragged", rEvents[1]);
            assert.equal("moved", rEvents[2]);
        });

        it ("plays a drag and drop (move) sequence with all callbacks on DnD dragged object", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(500, 250).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(0, 0);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                select: (obj, angle)=>{rEvents.push("select "+(obj===objectToDrag)+" "+angle); return true;},
                drag: (obj, x, y)=>{rEvents.push("drag "+(obj===objectToDrag)+" "+x+" "+y); return {x, y};},
                dragged: obj=>{rEvents.push("dragged "+(obj===objectToDrag)); return true;},
                drop: (obj, parent, x, y)=>{
                    rEvents.push("drop "+(obj===objectToDrag)+" "+(parent===firstHandler)+" "+x+" "+y);
                    return {parent, x, y};},
                moved: obj=>{rEvents.push("moved "+(obj===objectToDrag)); return true;},
                completed: obj=>{rEvents.push("completed "+(obj===objectToDrag)); return true;}
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mousemove", {x:140, y:140});
            runtime.event(objectToDrag.component.component, "mousemove", {x:150, y:160});
            runtime.event(objectToDrag.component.component, "mouseup", {x:150, y:160});
            assert.equal(8, rEvents.length);
            assert.equal("select true false", rEvents[0]);
            assert.equal("drag true 40 40", rEvents[1]);
            assert.equal("dragged true", rEvents[2]);
            assert.equal("drag true 50 60", rEvents[3]);
            assert.equal("dragged true", rEvents[4]);
            assert.equal("drop true true 50 60", rEvents[5]);
            assert.equal("moved true", rEvents[6]);
            assert.equal("completed true", rEvents[7]);
        });

        it ("plays a drag and drop (click) sequence without any callbacks", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(500, 250).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(0, 0);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            frame.installDnD(objectToDrag, {});
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            assert.equal(firstHandler, objectToDrag.component.parent);
            inspect(objectToDrag.component, {x:20, y:30});
            runtime.event(objectToDrag.component.component, "mouseup", {x:120, y:130});
            assert.equal(firstHandler, objectToDrag.component.parent);
            inspect(objectToDrag.component, {x:20, y:30});
        });

        it ("plays a drag and drop (click) sequence with all callbacks on DnD configuration object", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(500, 250).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(0, 0);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                select: (obj, angle)=>{rEvents.push("select "+(obj===objectToDrag)+" "+angle); return true;},
                drag: (obj, x, y)=>{rEvents.push("drag "+(obj===objectToDrag)+" "+x+" "+y); return {x, y};},
                dragged: obj=>{rEvents.push("dragged "+(obj===objectToDrag)); return true;},
                drop: (obj, parent, x, y)=>{
                    rEvents.push("drop "+(obj===objectToDrag)+" "+(parent===firstHandler)+" "+x+" "+y);
                    return {parent, x, y};},
                clicked: obj=>{rEvents.push("clicked "+(obj===objectToDrag)); return true;},
                completed: obj=>{rEvents.push("completed "+(obj===objectToDrag)); return true;}
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mouseup", {x:120, y:130});
            assert.equal(4, rEvents.length);
            assert.equal("select true false", rEvents[0]);
            assert.equal("drop true true 20 30", rEvents[1]);
            assert.equal("clicked true", rEvents[2]);
            assert.equal("completed true", rEvents[3]);
        });

        it ("plays a drag and drop (click) sequence with all callbacks on dragged object", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                clicked: ()=>{rEvents.push("clicked"); return true;},
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {});
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mouseup", {x:120, y:130});
            assert.equal(1, rEvents.length);
            assert.equal("clicked", rEvents[0]);
        });

        it ("checks that a drag and drop with at least a drag is always a move, not a click", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                select: (obj, angle)=>{rEvents.push("select "+(obj===objectToDrag)+" "+angle); return true;},
                drag: (obj, x, y)=>{rEvents.push("drag "+(obj===objectToDrag)+" "+x+" "+y); return {x, y};},
                dragged: obj=>{rEvents.push("dragged "+(obj===objectToDrag)); return true;},
                drop: (obj, parent, x, y)=>{
                    rEvents.push("drop "+(obj===objectToDrag)+" "+(parent===firstHandler)+" "+x+" "+y);
                    return {parent, x, y};},
                clicked: obj=>{rEvents.push("clicked "+(obj===objectToDrag)); return true;},
                moved: obj=>{rEvents.push("moved "+(obj===objectToDrag)); return true;},
                completed: obj=>{rEvents.push("completed "+(obj===objectToDrag)); return true;}
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mousemove", {x:140, y:140});
            runtime.event(objectToDrag.component.component, "mouseup", {x:120, y:130});
            assert.equal(6, rEvents.length);
            assert.equal("select true false", rEvents[0]);
            assert.equal("drag true 40 40", rEvents[1]);
            assert.equal("dragged true", rEvents[2]);
            assert.equal("drop true true 20 30", rEvents[3]);
            assert.equal("moved true", rEvents[4]);
            assert.equal("completed true", rEvents[5]);
        });

        it ("checks that if select return false, no DnD is done", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                select: (obj, angle)=>{rEvents.push("select "+(obj===objectToDrag)+" "+angle); return false;},
                drag: (obj, x, y)=>{rEvents.push("drag");},
                drop: (obj, parent, x, y)=>{rEvents.push("drop ");},
                completed: obj=>{rEvents.push("completed "+(obj===objectToDrag)); return true;}
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mousemove", {x:140, y:140});
            runtime.event(objectToDrag.component.component, "mouseup", {x:160, y:150});
            assert.equal(1, rEvents.length);
            assert.equal("select true false", rEvents[0]);
        });

        it ("checks if moved fails, revert is invoked", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                moved: obj=>{rEvents.push("moved "+(obj===objectToDrag)); return false;},
                revert: (obj, update)=>{rEvents.push("revert "+(obj===objectToDrag)+" "+
                    (update.parent===firstHandler)+" "+update.x+" "+update.y)},
                completed: obj=>{rEvents.push("completed "+(obj===objectToDrag)); return true;}
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mouseup", {x:140, y:140});
            assert.equal(3, rEvents.length);
            assert.equal("moved true", rEvents[0]);
            assert.equal("revert true true 20 30", rEvents[1]);
            assert.equal("completed true", rEvents[2]);
        });

        it ("checks if clicked fails, revert is invoked", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                clicked: obj=>{rEvents.push("clicked "+(obj===objectToDrag)); return false;},
                revert: (obj, update)=>{rEvents.push("revert "+(obj===objectToDrag)+" "+
                    (update.parent===firstHandler))},
                completed: obj=>{rEvents.push("completed "+(obj===objectToDrag)); return true;}
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mouseup", {x:120, y:130});
            assert.equal(3, rEvents.length);
            assert.equal("clicked true", rEvents[0]);
            assert.equal("revert true true", rEvents[1]);
            assert.equal("completed true", rEvents[2]);
        });

        it ("checks if moved fails, object position is reverted to initial value", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                }
            };
            firstHandler.add(objectToDrag.component);
            frame.installDnD(objectToDrag, {
                moved: obj=>{return false;},
                clicked: obj=>{return false;}
            });
            // moved
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mouseup", {x:140, y:140});
            inspect(objectToDrag.component, {x:20, y:30});
            // clicked
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mouseup", {x:120, y:130});
            inspect(objectToDrag.component, {x:20, y:30});
        });

        it ("plays a drag and drop (rotate) sequence without any callbacks", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 1000;
            content.height = 500;
            frame.set(content);
            let firstHandler = new svg.Translation(600, 350);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                angle:0,
                component: new svg.Translation().add(
                    new svg.Rotation(0).add(new svg.Rect(10, 10))).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                rotate:angle=>{
                    objectToDrag.angle=angle;
                    objectToDrag.component.children[0].rotate(angle);
                }
            };
            firstHandler.add(objectToDrag.component);
            frame.installDnD(objectToDrag, {
                anchor:(item, x, y)=>true
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:130, y:140});
            inspect(objectToDrag.component, {x:20, y:30, children:[{angle:0}]});
            runtime.event(objectToDrag.component.component, "mousemove", {x:120, y:150});
            inspect(objectToDrag.component, {x:20, y:30, children:[{angle:45}]});
            runtime.event(objectToDrag.component.component, "mousemove", {x:110, y:140});
            inspect(objectToDrag.component, {x:20, y:30, children:[{angle:-270}]});
            runtime.event(objectToDrag.component.component, "mouseup", {x:110, y:140});
            inspect(objectToDrag.component, {x:20, y:30, children:[{angle:-270}]});
        });

        it ("plays a drag and drop (rotate) sequence with all relevant callbacks on DnD configuration object", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 1000;
            content.height = 500;
            frame.set(content);
            let firstHandler = new svg.Translation(600, 350);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                angle:0,
                component: new svg.Translation().add(
                    new svg.Rotation(0).add(new svg.Rect(10, 10))).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                rotate:angle=>{
                    objectToDrag.angle=angle;
                    objectToDrag.component.children[0].rotate(angle);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                anchor:(item, x, y)=>true,
                turn: (obj, angle)=>{rEvents.push("turn "+(obj===objectToDrag)+" "+angle); return {angle};},
                turned: obj=>{rEvents.push("turned "+(obj===objectToDrag)); return true;},
                rotate: (obj, angle)=>{
                    rEvents.push("rotate "+(obj===objectToDrag)+" "+angle);
                    return {angle};},
                rotated: obj=>{rEvents.push("rotated "+(obj===objectToDrag)); return true;},
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:130, y:140});
            runtime.event(objectToDrag.component.component, "mousemove", {x:120, y:150});
            runtime.event(objectToDrag.component.component, "mousemove", {x:110, y:140});
            runtime.event(objectToDrag.component.component, "mouseup", {x:110, y:140});
            assert.equal(6, rEvents.length);
            assert.equal("turn true 45", rEvents[0]);
            assert.equal("turned true", rEvents[1]);
            assert.equal("turn true -270", rEvents[2]);
            assert.equal("turned true", rEvents[3]);
            assert.equal("rotate true -270", rEvents[4]);
            assert.equal("rotated true", rEvents[5]);
        });

        it ("plays a drag and drop (rotate) sequence with all relevant callbacks on DnD dragged object", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 1000;
            content.height = 500;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                angle:0,
                component: new svg.Translation().add(
                    new svg.Rotation(0).add(new svg.Rect(10, 10))).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                rotate:angle=>{
                    objectToDrag.angle=angle;
                    objectToDrag.component.children[0].rotate(angle);
                },
                turned: ()=>{rEvents.push("turned"); return true;},
                rotated: ()=>{rEvents.push("rotated"); return true;},
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                anchor:(item, x, y)=>true,
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:130, y:140});
            runtime.event(objectToDrag.component.component, "mousemove", {x:120, y:150});
            runtime.event(objectToDrag.component.component, "mousemove", {x:110, y:140});
            runtime.event(objectToDrag.component.component, "mouseup", {x:110, y:140});
            assert.equal(3, rEvents.length);
            assert.equal("turned", rEvents[0]);
            assert.equal("turned", rEvents[1]);
            assert.equal("rotated", rEvents[2]);
        });

        it ("checks that if 'rotated' fails, revert is invoked", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                angle:0,
                component: new svg.Translation().add(
                    new svg.Rotation(0).add(new svg.Rect(10, 10))).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                rotate:angle=>{
                    objectToDrag.angle=angle;
                    objectToDrag.component.children[0].rotate(angle);
                }
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {
                anchor:(item, x, y)=>true,
                rotated: obj=>{rEvents.push("rotated "+(obj===objectToDrag)); return false;},
                revert: (obj, update)=>{rEvents.push("revert "+(obj===objectToDrag)+" "+update.angle)},
                completed: obj=>{rEvents.push("completed "+(obj===objectToDrag)); return true;}
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:130, y:140});
            runtime.event(objectToDrag.component.component, "mouseup", {x:110, y:140});
            assert.equal(3, rEvents.length);
            assert.equal("rotated true", rEvents[0]);
            assert.equal("revert true 0", rEvents[1]);
            assert.equal("completed true", rEvents[2]);
        });

        it ("checks that if 'rotated' fails, object angle is defaulted to initial value", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                angle:0,
                component: new svg.Translation().add(
                    new svg.Rotation(0).add(new svg.Rect(10, 10))).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                rotate:angle=>{
                    objectToDrag.angle=angle;
                    objectToDrag.component.children[0].rotate(angle);
                }
            };
            firstHandler.add(objectToDrag.component);
            frame.installDnD(objectToDrag, {
                anchor:(item, x, y)=>true,
                rotated: obj=>{return false;},
            });
            runtime.event(objectToDrag.component.component, "mousedown", {x:130, y:140});
            runtime.event(objectToDrag.component.component, "mouseup", {x:110, y:140});
            assert.equal(0, objectToDrag.angle);
        });

        it ("checks start in drag mode", function() {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            let content = new svg.Translation(0, 0).mark('content');
            content.width = 2000;
            content.height = 1000;
            frame.set(content);
            let firstHandler = new svg.Translation(100, 100);
            content.add(firstHandler);
            let objectToDrag = {
                x: 20,
                y: 30,
                component: new svg.Translation().add(new svg.Rect(10, 10)).move(20, 30),
                addEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.addEvent(objectToDrag.component, eventName, handler);
                },
                removeEvent:(eventName, handler)=>{
                    objectToDrag[eventName] = handler;
                    svg.removeEvent(objectToDrag.component, eventName, handler);
                },
                dragged: ()=>{rEvents.push("dragged"); return true;},
            };
            firstHandler.add(objectToDrag.component);
            let rEvents = [];
            frame.installDnD(objectToDrag, {});
            runtime.event(objectToDrag.component.component, "mousemove", {x:120, y:130});
            assert.equal(0, rEvents.length);
            frame.uninstallDnD(objectToDrag);
            runtime.event(objectToDrag.component.component, "mousedown", {x:120, y:130});
            runtime.event(objectToDrag.component.component, "mousemove", {x:120, y:130});
            assert.equal(0, rEvents.length);
            frame.installDnD(objectToDrag, {startInDragMode:true});
            runtime.event(objectToDrag.component.component, "mousemove", {x:120, y:130});
            assert.equal(1, rEvents.length);
            assert.equal("dragged", rEvents[0]);
        });

        it("moves the frame", function () {
            let frame = new gui.Frame(1000, 500).backgroundColor(svg.BLACK);
            canvas.add(frame.component);
            frame.position(100, 50);
            inspect(frame.component.component, {tag: "g", transform: "translate(100 50)"});
        });

    });

    describe('Panel tests', function () {

        let canvas;

        beforeEach(function () {
            runtime = mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            gui = Gui(svg, {speed: 10, step: 10});
            canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
        });

        it("builds a panel", function () {
            let panel = new gui.Panel(1000, 500, svg.LIGHT_GREY);
            canvas.add(panel.component);
            inspect(panel.component.component,
                {tag: "g", transform: "translate(0 0)",
                    children:[
                        {tag: "svg", x:-500, y:-250, width:1000, height:500,
                        children:[
                            {tag: "g", transform: "translate(0 0)",
                                children:[
                                    {tag: "rect", x:0, y:0, width:1000, height:500, fill:"rgb(200,200,200)", stroke:"none"},
                                    {tag: "g", transform:"translate(0 0)",
                                    children:[
                                    ]}
                                ]
                            }
                        ]},
                        {tag: "rect", x:-500, y:-250, width:1000, height:500, fill:"none", stroke:"rgb(0,0,0)"},
                        {tag: "g", transform:"translate(0 0)",
                            children:[
                                {tag: "path", fill:"rgb(255,204,0)"}
                            ]
                        },
                        {tag: "g", transform:"translate(0 0)",
                            children:[
                                {tag: "path", fill:"rgb(255,204,0)"}
                            ]
                        }
                    ]
                });
        });

        it("resizes panel's content", function () {
            let panel = new gui.Panel(1000, 500, svg.LIGHT_GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 750);
            inspect(panel.component.component,
                {tag: "g", transform: "translate(0 0)",
                    children:[
                        {tag: "svg", x:-500, y:-250, width:1000, height:500,
                            children:[
                                {tag: "g", transform: "translate(0 0)",
                                    children:[
                                        {tag: "rect", x:0, y:0, width:2000, height:750, fill:"rgb(200,200,200)", stroke:"none"},
                                        {tag: "g", transform:"translate(0 0)",
                                            children:[
                                            ]}
                                    ]
                                }
                            ]},
                        {tag: "rect", x:-500, y:-250, width:1000, height:500, fill:"none", stroke:"rgb(0,0,0)"},
                        {tag: "g", transform:"translate(500 -83.33333333333334)",
                            children:[
                                {tag: "path", d:"M -8,-158.66666666666666 L -8,158.66666666666666 C -8,174.66666666666666 8,174.66666666666666 8,158.66666666666666 L 8,-158.66666666666666 C 8,-174.66666666666666 -8,-174.66666666666666 -8,-158.66666666666666 ", fill:"rgb(255,204,0)"}
                            ]
                        },
                        {tag: "g", transform:"translate(-250 250)",
                            children:[
                                {tag: "path", d:"M -242,-8 L 242,-8 C 258,-8 258,8 242,8 L -242,8 C -258,8 -258,-8 -242,-8 ", fill:"rgb(255,204,0)"}
                            ]
                        }
                    ]
                });
        });

        it("resizes the panel", function () {
            let panel = new gui.Panel(1000, 500, svg.LIGHT_GREY);
            canvas.add(panel.component);
            panel.resizeContent(1500, 500);
            // View over content
            panel.resize(2000, 750);
            inspect(panel.component.component,
                {tag: "g", transform: "translate(0 0)",
                    children:[
                        {tag: "svg", x:-1000, y:-375, width:2000, height:750,
                            children:[
                                {tag: "g", transform: "translate(0 0)",
                                    children:[
                                        {tag: "rect", x:0, y:0, width:2000, height:750, fill:"rgb(200,200,200)", stroke:"none"},
                                        {tag: "g", transform:"translate(0 0)",
                                            children:[
                                            ]}
                                    ]
                                }
                            ]},
                        {tag: "rect", x:-1000, y:-375, width:2000, height:750, fill:"none", stroke:"rgb(0,0,0)"},
                        {tag: "g",
                            children:[
                                {tag: "path", d:"", fill:"rgb(255,204,0)"}
                            ]
                        },
                        {tag: "g",
                            children:[
                                {tag: "path", d:"", fill:"rgb(255,204,0)"}
                            ]
                        }
                    ]
                });
            // View disepear
            panel.resize(0, 0);
            assert.ok(!retrieve(panel.component.component, '[vhandle]'));
            assert.ok(!retrieve(panel.component.component, '[hhandle]'));
            // Handle remains not visible, no error :)
            panel.resize(0, 0);
        });

        it("moves panel content using handles", function () {
            let panel = new gui.Panel(1000, 500, svg.GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 1000);
            let vHandle = retrieve(panel.component.component, '[vhandle]');
            let hHandle = retrieve(panel.component.component, '[hhandle]');
            inspect(vHandle, {transform: "translate(500 -125)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
            // use horizontal handle
            runtime.event(hHandle.children[0], "mousedown", {pageX: 20, pageY: 500});
            runtime.event(hHandle.children[0], "mousemove", {pageX: 40, pageY: 500});
            runtime.event(hHandle.children[0], "mouseup", {pageX: 40, pageY: 500});
            inspect(panel.content.component, {transform: "translate(-40 0)"});
            inspect(hHandle, {transform: "translate(-230 250)"});
            runtime.event(hHandle.children[0], "mousedown", {pageX: 40, pageY: 500});
            runtime.event(hHandle.children[0], "mousemove", {pageX: 0, pageY: 500});
            runtime.event(hHandle.children[0], "mouseup", {pageX: 0, pageY: 500});
            inspect(panel.content.component, {transform: "translate(0 0)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
            // use vertical handle
            runtime.event(vHandle.children[0], "mousedown", {pageX: 1000, pageY: 20});
            runtime.event(vHandle.children[0], "mousemove", {pageX: 1000, pageY: 40});
            runtime.event(vHandle.children[0], "mouseup", {pageX: 1000, pageY: 40});
            inspect(panel.content.component, {transform: "translate(0 -40)"});
            inspect(vHandle, {transform: "translate(500 -105)"});
        });

        it("moves panel content using mouse wheel", function () {
            let panel = new gui.Panel(1000, 500, svg.GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 1000);
            let vHandle = retrieve(panel.component.component, '[vhandle]');
            let hHandle = retrieve(panel.component.component, '[hhandle]');
            // use horizontal wheel
            runtime.event(panel.content.component, "wheel", {deltaX: -20, deltaY: 0});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(-100 0)"});
            inspect(hHandle, {transform: "translate(-200 250)"});
            runtime.event(panel.content.component, "wheel", {deltaX: 20, deltaY: 0});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(0 0)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
            runtime.event(panel.content.component, "wheel", {deltaX: 0, deltaY: -20});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(0 -100)"});
            inspect(vHandle, {transform: "translate(500 -75)"});
            runtime.event(panel.content.component, "wheel", {deltaX: 0, deltaY: 20});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(0 0)"});
            inspect(vHandle, {transform: "translate(500 -125)"});
        });

        it("moves panel content using arrow keys", function () {
            let panel = new gui.Panel(1000, 500, svg.GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 1000);
            let vHandle = retrieve(panel.component.component, '[vhandle]');
            let hHandle = retrieve(panel.component.component, '[hhandle]');
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // Move up-down
            runtime.globalEvent("keydown", {keyCode: 40, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(0 -100)"});
            inspect(vHandle, {transform: "translate(500 -75)"});
            runtime.globalEvent("keydown", {keyCode: 38, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(0 0)"});
            inspect(vHandle, {transform: "translate(500 -125)"});
            // Move left-right
            runtime.globalEvent("keydown", {keyCode: 39, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(-100 0)"});
            inspect(hHandle, {transform: "translate(-200 250)"});
            runtime.globalEvent("keydown", {keyCode: 37, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(0 0)"});
            inspect(hHandle, {transform: "translate(-250 250)"});
        });

        it("moves too fast : second event is ignored", function () {
            let panel = new gui.Panel(1000, 500, svg.GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 1000);
            let vHandle = retrieve(panel.component.component, '[vhandle]');
            let hHandle = retrieve(panel.component.component, '[hhandle]');
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // Move up-down
            runtime.globalEvent("keydown", {keyCode: 40, ctrlKey: false, altKey: false});
            // oops.. too fast !
            runtime.globalEvent("keydown", {keyCode: 40, ctrlKey: false, altKey: false});
            runtime.advanceAll();
            inspect(panel.content.component, {transform: "translate(0 -100)"});
        });

        it("doent prevent keyboard event when not recognized", function () {
            let panel = new gui.Panel(1000, 500, svg.GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 1000);
            let vHandle = retrieve(panel.component.component, '[vhandle]');
            let hHandle = retrieve(panel.component.component, '[hhandle]');
            // Select to give focus
            runtime.event(canvas.component.glass.component, "mouseup", {pageX: 100, pageY: 100});
            // some key event, not recognized by frame
            let event = {keyCode: 70, ctrlKey: false, altKey: false};
            runtime.globalEvent("keydown", event);
            assert.ok(!event.prevented);
            // key event recognized by frame
            event = {keyCode: 40, ctrlKey: false, altKey: false};
            runtime.globalEvent("keydown", event);
            assert.ok(event.prevented);
        });

        it("tries to moves on over bottom/right border of frame", function () {
            let panel = new gui.Panel(1000, 500, svg.GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 1000);
            let vHandle = retrieve(panel.component.component, '[vhandle]');
            let hHandle = retrieve(panel.component.component, '[hhandle]');
            // go beyond right limit
            runtime.event(hHandle.children[0], "mousedown", {pageX: 20, pageY: 500});
            runtime.event(hHandle.children[0], "mousemove", {pageX: 1500, pageY: 500});
            runtime.event(hHandle.children[0], "mouseup", {pageX: 1500, pageY: 500});
            inspect(panel.content.component, {transform: "translate(-1000 0)"});
            inspect(hHandle, {transform: "translate(250 250)"});
            // go beyond bottom limit
            runtime.event(vHandle.children[0], "mousedown", {pageX: 1000, pageY: 20});
            runtime.event(vHandle.children[0], "mousemove", {pageX: 1000, pageY: 1000});
            runtime.event(vHandle.children[0], "mouseup", {pageX: 1000, pageY: 1000});
            inspect(panel.content.component, {transform: "translate(-1000 -500)"});
            inspect(vHandle, {transform: "translate(500 125)"});
        });

        it("moves the panel", function () {
            let panel = new gui.Panel(1000, 500, svg.GREY);
            canvas.add(panel.component);
            panel.position(100, 50);
            inspect(panel.component.component, {tag: "g", transform: "translate(100 50)"});
        });

        it("adds and removes object in panel content", function () {
            let panel = new gui.Panel(1000, 500, svg.LIGHT_GREY);
            canvas.add(panel.component);
            panel.resizeContent(2000, 750);
            let firstObject = new svg.Rect(100, 50).position(30, 20);
            let secondObject = new svg.Rect(100, 50).position(100, 50);
            panel.add(firstObject).add(secondObject);
            let content = retrieve(panel.component.component, '[content]');
            inspect(content,
                {tag: "g", transform:"translate(0 0)",
                    children:[
                        {tag: "rect", x:-20, y:-5, width:100, height:50},
                        {tag: "rect", x:50, y:25, width:100, height:50}
                    ]});
            panel.remove(firstObject);
            inspect(content,
                {tag: "g", transform:"translate(0 0)",
                    children:[
                        {tag: "rect", x:50, y:25, width:100, height:50}
                    ]});
        });

        it("changes background color", function () {
            let panel = new gui.Panel(1000, 500, svg.LIGHT_GREY);
            canvas.add(panel.component);
            panel.color(svg.BLUE);
            let background = retrieve(panel.component.component, '[background]');
            inspect(background,{tag: "rect", fill:"rgb(0,0,200)"});
        });

    });

    describe('TextPanel tests', function () {

        let canvas;

        beforeEach(function () {
            runtime = mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            gui = Gui(svg, {speed: 10, step: 10});
            canvas = new gui.Canvas(1000, 500);
            canvas.show("content");
        });

        it("builds a text panel", function () {
            let textPanel = new gui.TextPanel(1000, 500, svg.LIGHT_GREY);
            canvas.add(textPanel.component);
            let content = retrieve(textPanel.component.component, '[content]');
            inspect(content,
                {tag: "g", transform:"translate(0 0)",
                    children:[
                        {tag: "text", text:"", x:20, y:20, "font-family":"arial", "font-size":12}
                    ]});
            textPanel.text("First line\nSecond line");
            inspect(content,
                {tag: "g", transform:"translate(0 0)",
                    children:[
                        {tag: "text", text:"First&nbsp;line", x:20, y:20, "font-family":"arial", "font-size":12,
                        children:[
                            {tag: "tspan", text:"Second&nbsp;line", x:20, y:44}
                        ]}
                    ]});
            textPanel.font("courier", 20, 50);
            inspect(content,
                {tag: "g", transform:"translate(0 0)",
                    children:[
                        {tag: "text", text:"First&nbsp;line", x:20, y:40, "font-family":"courier", "font-size":20,
                            children:[
                                {tag: "tspan", text:"Second&nbsp;line", x:20, y:90}
                            ]}
                    ]});
        });

        describe('Grid tests', function () {

            let canvas;

            beforeEach(function () {
                runtime = mockRuntime();
                runtime.declareAnchor('content');
                svg = SVG(runtime);
                gui = Gui(svg, {speed: 10, step: 10});
                canvas = new gui.Canvas(1000, 500);
                canvas.show("content");
            });

            it("builds a grid with two colums and one row", function () {
                let grid = new gui.Grid(1000, 500, 80);
                canvas.add(grid.component);
                inspect(grid.component.component,
                    {tag: "g", transform: "translate(0 0)",
                        children: [
                            {tag: "g", transform: "translate(0 0)",
                                children: [
                                    {tag: "svg", x: -500, y: -250, width: 1000, height: 500}
                                ]
                            }
                        ]});
                grid.textColumn(10, 200, "firstName");
                grid.textColumn(210, 250, "lastName");
                let content = retrieve(grid.component.component, '[content]');
                inspect(content,
                    {tag: "g", transform:"translate(0 0)"});
                grid.add({firstName:'John', lastName:'Doe'});
                inspect(content,
                    {tag: "g", transform:"translate(0 0)",
                        children:[
                            {tag: "g", transform:"translate(0 40)",
                                children:[
                                    {tag: "rect", x:0, y:-40, width:1000, height:80, fill:"rgb(0,0,100)", opacity:0},
                                    {tag: "g", transform:"translate(0 0)",
                                        children:[
                                            {tag: "g", transform:"translate(10 0)",
                                                children:[
                                                    {tag: "text", text:"John", x:0, y:8, "font-family":"arial", "font-size":32}
                                                ]},
                                            {tag: "g", transform:"translate(210 0)",
                                                children:[
                                                    {tag: "text", text:"Doe", x:0, y:8, "font-family":"arial", "font-size":32}
                                                ]}                   ]},
                                    {tag: "rect", x:0, y:-40, width:1000, height:80, opacity:0.005}
                                ]}
                        ]});
            });
        });

        it("moves the grid", function () {
            let grid = new gui.Grid(1000, 500, 80);
            canvas.add(grid.component);
            grid.position(100, 50);
            inspect(grid.component.component, {tag: "g", transform: "translate(100 50)"});
        });

        it("select and unselect rows in grid", function () {
            let grid = new gui.Grid(1000, 500, 80);
            canvas.add(grid.component);
            grid.textColumn(10, 200, "firstName");
            grid.textColumn(210, 250, "lastName");
            let content = retrieve(grid.component.component, '[content]');
            grid.fill([{firstName: 'John', lastName: 'Doe'}, {firstName: 'Mary', lastName: 'Poppy'}]);
            let johnRow = retrieve(grid.component.component, "[row:0]");
            let maryRow = retrieve(grid.component.component, "[row:1]");
            let backJohn = retrieve(johnRow, "[background]");
            inspect(backJohn, {opacity:0});
            let glassJohn = retrieve(johnRow, "[glass]");
            let glassMary = retrieve(maryRow, "[glass]");
            // Select
            runtime.event(glassJohn, "click", {});
            inspect(backJohn, {opacity:1});
            // Re-select : ignored
            runtime.event(glassJohn, "click", {});
            inspect(backJohn, {opacity:1});
            // Select elsewhere : unselect previous
            runtime.event(glassMary, "click", {});
            inspect(backJohn, {opacity:0});
            // handle select event
            let rItem = null;
            grid.onSelect((index, item)=>rItem = item);
            runtime.event(glassJohn, "click", {});
            assert.equal("John", rItem.firstName);
        });

        it("fills the grid", function () {
            let grid = new gui.Grid(1000, 500, 80);
            canvas.add(grid.component);
            grid.textColumn(10, 200, "firstName");
            grid.textColumn(210, 250, "lastName");
            let rItem = null;
            grid.onSelect((index, item)=>rItem = item);
            let content = retrieve(grid.component.component, '[content]');
            grid.fill([{firstName: 'John', lastName: 'Doe'}, {firstName: 'Mary', lastName: 'Poppy'}]);
            grid.fill();
            assert.ok(retrieve(grid.component.component, "[row:0]"));
            assert.ok(retrieve(grid.component.component, "[row:1]"));
            assert.ok(!retrieve(grid.component.component, "[row:2]"));
        });

        describe('Button tests', function () {

            let canvas;

            beforeEach(function () {
                runtime = mockRuntime();
                runtime.declareAnchor('content');
                svg = SVG(runtime);
                gui = Gui(svg, {speed: 10, step: 10});
                canvas = new gui.Canvas(1000, 500);
                canvas.show("content");
            });

            it("builds a Button", function () {
                let button = new gui.Button(100, 20, [svg.LIGHT_BLUE, 2, svg.DARK_BLUE], "Do It!");
                canvas.add(button.component);
                inspect(button.component.component,
                    {tag: "g", transform: "translate(0 0)",
                        children: [
                            {tag: "rect", x:-50, y:-10, width:100, height:20, fill:"rgb(50,150,200)", "stroke-width":2, stroke:"rgb(0,0,100)"}
                        ]});
                let rClicked=false;
                button.onClick(()=>rClicked=true);
                let glass = retrieve(button.component.component, "[glass]");
                runtime.event(glass, "click", {});
                assert.ok(rClicked);
                button.onClick(()=>rClicked="true");
                runtime.event(glass, "click", {});
                assert.ok(rClicked==="true");
            });

            it("changes button appearance", function () {
                let button = new gui.Button(100, 20, [svg.LIGHT_BLUE, 2, svg.DARK_BLUE], "Do It!");
                canvas.add(button.component);
                button.position(50, 50).resize(120, 25); // FIXME change to dimension
                inspect(button.component.component,
                    {tag: "g", transform: "translate(50 50)",
                        children: [
                            {tag: "rect", x:-60, y:-12.5, width:120, height:25, fill:"rgb(50,150,200)", "stroke-width":2, stroke:"rgb(0,0,100)"}
                        ]});
            });

        });

        describe('Pane and Palette tests', function () {

            let canvas;

            beforeEach(function () {
                runtime = mockRuntime();
                runtime.declareAnchor('content');
                svg = SVG(runtime);
                gui = Gui(svg, {speed: 10, step: 10});
                canvas = new gui.Canvas(1000, 500);
                canvas.show("content");
            });

            it("builds a palette", function () {
                let palette = new gui.Palette(500, 1000);
                canvas.add(palette.component);
                inspect(palette.component.component,
                    {tag: "g", transform: "translate(0 0)"});
                let pane = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "First Pane", 60);
                palette.addPane(pane);
                inspect(palette.component.component,
                    {tag: "g", transform: "translate(0 0)",
                        children: [
                            {tag: "g", transform: "translate(0 0)",
                                children: [
                                    {tag: "g", transform: "translate(0 -480)",
                                        children: [
                                            {tag: "rect", x:-250, y:-20, width:500, height:40, fill:"rgb(200,200,200)", "stroke-width":3, stroke:"rgb(128,128,128)"},
                                            {tag: "text", x:0, y:8, text:"First&nbsp;Pane", "font-family":"Arial", "font-size":24}, // FIXME Arial or arial ?
                                            {tag: "rect", x:-250, y:-20, width:500, height:40, opacity:0.001}
                                        ]},
                                    {tag: "g", transform: "translate(0 20)",
                                        children: [
                                            {tag: "svg"}
                                        ]}
                                ]}
                        ]});
            });

            it("put two panes in the palette and then moves and resize it", function () {
                let palette = new gui.Palette(500, 1000);
                canvas.add(palette.component);
                let paneOne = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "First Pane", 60);
                palette.addPane(paneOne);
                let paneTwo = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "Second Pane", 60);
                palette.addPane(paneTwo);
                palette.position(100, 100).dimension(400, 1200);
                inspect(palette.component.component,
                    {tag: "g", transform: "translate(100 100)",
                        children: [
                            {tag: "g", transform: "translate(0 -20)",
                                children: [
                                    {tag: "g", transform: "translate(0 -560)",
                                        children: [
                                            {tag: "rect", x:-200, y:-20, width:400, height:40, fill:"rgb(200,200,200)", "stroke-width":3, stroke:"rgb(128,128,128)"},
                                            {tag: "text", x:0, y:8, text:"First&nbsp;Pane", "font-family":"Arial", "font-size":24}, // FIXME Arial or arial ?
                                            {tag: "rect", x:-200, y:-20, width:400, height:40, opacity:0.001}
                                        ]},
                                    {tag: "g", transform: "translate(0 20)",
                                        children: [
                                            {tag: "svg", width:400, height:1120}
                                        ]}
                                ]},
                            {tag: "g", transform: "translate(0 580)",
                                children: [
                                    {tag: "g", transform: "translate(0 0)",
                                        children: [
                                            {tag: "rect", x:-200, y:-20, width:400, height:40, fill:"rgb(200,200,200)", "stroke-width":3, stroke:"rgb(128,128,128)"},
                                            {tag: "text", x:0, y:8, text:"Second&nbsp;Pane", "font-family":"Arial", "font-size":24}, // FIXME Arial or arial ?
                                            {tag: "rect", x:-200, y:-20, width:400, height:40, opacity:0.001}
                                        ]},
                                    {tag: "g", transform: "translate(0 20)",
                                        children: [
                                            {tag: "svg", width:400, height:0}
                                        ]}
                                ]}
                        ]});
            });

            it("open and close panes", function () {
                let palette = new gui.Palette(500, 1000);
                canvas.add(palette.component);
                let paneOne = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "First Pane", 60);
                let paneTwo = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "Second Pane", 60);
                let paneThree = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "Third Pane", 60);
                let paneFour = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "Four Pane", 60);
                palette.addPane(paneOne).addPane(paneTwo).addPane(paneThree).addPane(paneFour);
                palette.position(100, 100).dimension(400, 1200);
                let pane0 = retrieve(palette.component.component, "[pane:0]");
                let pane1 = retrieve(palette.component.component, "[pane:1]");
                let titlePane2Glass = retrieve(palette.component.component, "[pane:2].[title].[glass]");
                let pane2 = retrieve(palette.component.component, "[pane:2]");
                let pane3 = retrieve(palette.component.component, "[pane:3]");
                inspect(pane0, {tag: "g", transform: "translate(0 -60)"});
                inspect(pane1, {tag: "g", transform: "translate(0 500)"});
                inspect(pane2, {tag: "g", transform: "translate(0 540)"});
                inspect(pane3, {tag: "g", transform: "translate(0 580)"});
                runtime.event(titlePane2Glass, "click", {});
                runtime.advance();
                inspect(pane0, {tag: "g", transform: "translate(0 -65.20000000000005)"}); // Resize only
                inspect(pane1, {tag: "g", transform: "translate(0 489.5999999999999)"}); // Moves only
                inspect(pane2, {tag: "g", transform: "translate(0 534.8)"}); // Moves and resize
                inspect(pane3, {tag: "g", transform: "translate(0 579.9999999999999)"}); // Doesn't move nor resize
                runtime.advanceAll();
                inspect(pane0, {tag: "g", transform: "translate(0 -580)"});
                inspect(pane1, {tag: "g", transform: "translate(0 -540)"});
                inspect(pane2, {tag: "g", transform: "translate(0 20)"});
                inspect(pane3, {tag: "g", transform: "translate(0 580)"});
                // Try to reopen : ignored
                runtime.event(titlePane2Glass, "click", {});
                runtime.advanceAll();
                inspect(pane0, {tag: "g", transform: "translate(0 -580)"});
                inspect(pane1, {tag: "g", transform: "translate(0 -540)"});
                inspect(pane2, {tag: "g", transform: "translate(0 20)"});
                inspect(pane3, {tag: "g", transform: "translate(0 580)"});
            });

            it("handles a pane not included in a palette", function () {
                let pane = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "Title of Pane", 60);
                canvas.add(pane.component);
                let titleGlass = retrieve(pane.component.component, "[title].[glass]");
                runtime.event(titleGlass, "click", {});
                inspect(pane.component.component,
                    {tag: "g", transform: "translate(0 0)",
                        children: [
                            {tag: "g", transform: "translate(0 -30)",
                                children: [
                                    {tag: "rect", x:-50, y:-20, width:100, height:40, fill:"rgb(200,200,200)", "stroke-width":3, stroke:"rgb(128,128,128)"},
                                    {tag: "text", x:0, y:8, text:"Title&nbsp;of&nbsp;Pane", "font-family":"Arial", "font-size":24}, // FIXME Arial or arial ?
                                    {tag: "rect", x:-50, y:-20, width:100, height:40, opacity:0.001}
                                ]},
                            {tag: "g", transform: "translate(0 20)",
                                children:[
                                    {tag:"svg", x:-50, y:-30, width:100, height:60}
                                ]}
                            ]});
                // Programmatic open : still opened : ignored
                pane.open();
                inspect(pane.component.component,
                    {tag: "g", transform: "translate(0 0)",
                        children: [
                            {tag: "g", transform: "translate(0 -30)"}]});
                runtime.event(titleGlass, "click", {});
                inspect(pane.component.component,
                    {tag: "g", transform: "translate(0 0)",
                    children: [
                        {tag: "g", transform: "translate(0 20)",
                            children: [
                                {tag: "rect", x:-50, y:-20, width:100, height:40, fill:"rgb(200,200,200)", "stroke-width":3, stroke:"rgb(128,128,128)"},
                                {tag: "text", x:0, y:8, text:"Title&nbsp;of&nbsp;Pane", "font-family":"Arial", "font-size":24}, // FIXME Arial or arial ?
                                {tag: "rect", x:-50, y:-20, width:100, height:40, opacity:0.001}
                            ]},
                        {tag: "g", transform: "translate(0 20)",
                            children: [
                                {tag:"svg", x:-50, y:0, width:100, height:0}
                            ]}
                        ]}
                )
            });

            it("handles a pane not included in a palette", function () {
                let pane = new gui.Pane([svg.LIGHT_GREY, 3, svg.GREY], "Title of Pane", 50);
                canvas.add(pane.component);
                pane.open();
                let callback = ()=> {
                };
                let tool1 = new gui.Tool(new svg.Rect(50, 50)).setCallback(callback);
                pane.addTool(tool1).addTool(new gui.Tool(new svg.Rect(50, 50)));
                let panel = retrieve(pane.component.component, "[content]");
                inspect(panel,
                    {tag: "g", transform: "translate(0 90)",
                        children: [
                            {tag: "svg", x: -50, y: -30, width: 100, height: 60,
                                children:[
                                    {tag:"g", children:[
                                        {tag:"rect", width:100, height:50},
                                        {tag:"g", transform:"translate(0 0)", children:[
                                            {tag:"g", transform:"translate(25 25)", children:[
                                                {tag:"rect"}
                                            ]},
                                            {tag:"g", transform:"translate(75 25)", children:[
                                                {tag:"rect"}
                                            ]}
                                        ]}
                                    ]}
                                ]
                            }
                        ]}
                );
                pane.addTool(new gui.Tool(new svg.Rect(50, 50)));
                inspect(panel,
                    {tag: "g", transform: "translate(0 90)",
                        children: [
                            {tag: "svg", x: -50, y: -30, width: 100, height: 60,
                                children:[
                                    {tag:"g", children:[
                                        {tag:"rect", width:100, height:100}
                                    ]}
                                ]
                            }
                        ]}
                );
            });

        });

        describe('Popin tests', function () {

            let canvas;

            beforeEach(function () {
                runtime = mockRuntime();
                runtime.declareAnchor('content');
                svg = SVG(runtime);
                gui = Gui(svg, {speed: 10, step: 10});
                canvas = new gui.Canvas(1000, 500);
                canvas.show("content");
            });

            it("builds a popin", function () {
                let rCounter=0;
                let callback = ()=>rCounter++;
                runtime.addGlobalEvent("keydown", callback);
                runtime.addGlobalEvent("keyup", callback);
                runtime.addGlobalEvent("keypressed", callback);
                let popin = new gui.Popin(1000, 500);
                popin.component.mark("popin");
                assert.ok(!retrieve(canvas.component.component, "[popin]"));
                popin.show(canvas);
                runtime.globalEvent("keydown", {});
                runtime.globalEvent("keyup", {});
                runtime.globalEvent("keypressed", {});
                assert.equal(rCounter, 0);
                assert.ok(retrieve(canvas.component.component, "[popin]"));
                inspect(popin.component.component, {tag:"g", transform:"translate(500 250)",
                    children:[
                        {tag:"rect", x:-500, y:-250, width:1000, height:500, fill:"rgb(235,230,150)"},
                        {tag:"g", children:[
                        ]}
                    ]
                });
                popin.close();
                runtime.globalEvent("keydown", {});
                runtime.globalEvent("keyup", {});
                runtime.globalEvent("keypressed", {});
                assert.equal(rCounter, 3);
                assert.ok(!retrieve(canvas.component.component, "[popin]"));
            });
        });

        it("builds a popin with ok and cancel button", function () {
            let popin = new gui.Popin(1000, 500);
            popin.component.mark("popin");
            let rEvent = null;
            popin.whenOk(()=>{rEvent = "Ok"; popin.close()});
            popin.whenCancel(()=>rEvent = "Ko");
            popin.show(canvas);
            inspect(popin.component.component, {tag:"g", transform:"translate(500 250)",
                children:[
                    {tag:"rect", x:-500, y:-250, width:1000, height:500, fill:"rgb(235,230,150)"},
                    {tag:"g", children:[
                        {tag:"g", transform:"translate(-50 200)", children:[
                            {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(0,200,0)", "stroke-width":3, stroke:"rgb(0,100,0)"},
                            {tag:"polygon", points:" -25,-10 -5,10 30,-20 -5,25", fill:"rgb(255,255,255)", "stroke-width":2, stroke:"rgb(128,128,128)"},
                            {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(0,0,0)", "stroke-width":0}
                        ]},
                        {tag:"g", transform:"translate(50 200)", children:[
                            {tag:"g", transform:"rotate(45)", children:[
                                {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(250,0,0)", "stroke-width":3, stroke:"rgb(100,0,0)"},
                                {tag:"polygon", points:" -5,30 -5,5 -30,5 -30,-5 -5,-5 -5,-30 5,-30 5,-5 30,-5 30,5 5,5 5,30", fill:"rgb(255,255,255)", "stroke-width":2, stroke:"rgb(128,128,128)"},
                                {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(0,0,0)", "stroke-width":0}
                            ]},
                        ]}
                    ]}
                ]
            });
            let okGlass = retrieve(popin.component.component, "[ok].[glass]");
            let cancelGlass = retrieve(popin.component.component, "[cancel].[glass]");
            runtime.event(okGlass, "click", {});
            assert.equal(rEvent, "Ok");
            assert.ok(!retrieve(canvas.component.component, "[popin]"));
            popin.show(canvas);
            assert.ok(retrieve(canvas.component.component, "[popin]"));
            runtime.event(cancelGlass, "click", {});
            assert.equal(rEvent, "Ko");
            assert.ok(!retrieve(canvas.component.component, "[popin]"));
        });

        it("builds a popin with only ok button", function () {
            let popin = new gui.Popin(1000, 500);
            popin.component.mark("popin");
            popin.whenOk();
            popin.show(canvas);
            let okButton = retrieve(popin.component.component, "[ok]");
            inspect(okButton,{tag:"g", transform:"translate(0 200)", children:[
                    {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(0,200,0)", "stroke-width":3, stroke:"rgb(0,100,0)"},
                    {tag:"polygon", points:" -25,-10 -5,10 30,-20 -5,25", fill:"rgb(255,255,255)", "stroke-width":2, stroke:"rgb(128,128,128)"},
                    {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(0,0,0)", "stroke-width":0}
                ]});
            let okGlass = retrieve(popin.component.component, "[ok].[glass]");
            runtime.event(okGlass, "click", {});
            assert.ok(!retrieve(canvas.component.component, "[popin]"));
            popin.show(canvas);
            popin.disableOk();
            inspect(okButton,{tag:"g", transform:"translate(0 200)", children:[
                {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(200,200,200)", "stroke-width":3, stroke:"rgb(128,128,128)"},
                {tag:"polygon", points:" -25,-10 -5,10 30,-20 -5,25", fill:"rgb(255,255,255)", "stroke-width":2, stroke:"rgb(128,128,128)"},
                {tag:"circle", cx:0, cy:0, r:40, fill:"rgb(0,0,0)", "stroke-width":0}
            ]});
            runtime.event(okGlass, "click", {});
            assert.ok(retrieve(canvas.component.component, "[popin]"));
        });

        it("builds a popin with only cancel button", function () {
            let popin = new gui.Popin(1000, 500);
            popin.component.mark("popin");
            popin.whenCancel();
            popin.show(canvas);
            let cancelButton = retrieve(popin.component.component, "[cancel]");
            inspect(cancelButton,{tag:"g", transform:"translate(0 200)"});
            let cancelGlass = retrieve(popin.component.component, "[cancel].[glass]");
            runtime.event(cancelGlass, "click", {});
            assert.ok(!retrieve(canvas.component.component, "[popin]"));
        });

        it("cancels when clicking on mask a popin with only cancel button", function () {
            let popin = new gui.Popin(1000, 500);
            popin.component.mark("popin");
            let rEvent = null;
            popin.whenCancel(()=>rEvent="Ko");
            popin.show(canvas);
            let mask = retrieve(canvas.component.component, "[mask]");
            runtime.event(mask, "click", {});
            assert.ok(!retrieve(canvas.component.component, "[popin]"));
        });

        it("adds an item inside the popin", function () {
            let popin = new gui.Popin(1000, 500);
            let rEvent = "";
            popin.add({
                component:new svg.Rect(10, 20).color(svg.RED),
                open:()=>rEvent="open object",
                close:()=>rEvent="close object"
            });
            popin.whenCancel();
            popin.show(canvas);
            let mask = retrieve(canvas.component.component, "[mask]");
            assert.equal(rEvent, "open object");
            runtime.event(mask, "click", {});
            assert.equal(rEvent, "close object");
            assert.ok(!retrieve(canvas.component.component, "[popin]"));
        });

        it("removes an item from the popin", function () {
            let popin = new gui.Popin(1000, 500);
            let rEvent = "";
            let object = {
                component:new svg.Rect(10, 20).color(svg.RED),
                open:()=>rEvent="open object",
                close:()=>rEvent="close object"
            };
            popin.add(object);
            popin.show(canvas);
            let mask = retrieve(canvas.component.component, "[mask]");
            assert.equal(rEvent, "open object");
            popin.remove(object);
            assert.equal(rEvent, "close object");
        });

        it("checks that popin refuses focus", function () {
            let popin = new gui.Popin(1000, 500);
            assert.ok(!popin.focus())
        });

    });

});