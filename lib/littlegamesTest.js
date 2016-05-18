/**
 * Created by HDA3014 on 11/03/2016.
 */
var assert = require('assert');
var testutils = require('./testutils');

var targetRuntime = require('../targetRuntime').targetRuntime;
var mock = require('../runtimemock');
mock.setTarget(targetRuntime);
var svgHandler = require('../svghandler');
svgHandler.setTarget(targetRuntime);
var SVG = svgHandler.SVG;

var inspect = testutils.inspect;
var checkScenario = testutils.checkScenario;

var horses = require("../horses/horses");
var playHorses = horses.play;

var mines = require("../mines/mines");
var playMines = mines.play;

var azar = require("../azar/azar");
var playAzar = azar.play;

var runtime;
var svg;

describe('Little games', function() {

    describe('Little horses', function () {
        /*
         it("create a simple Rect", function() {
         var rect = new svg.Rect(100, 50);
         var drawing = new svg.Drawing(1000, 500);
         drawing.add(rect);
         inspect(rect.component, {tag:'rect', x:-50, y:-25, width:100, height:50});
         inspect(rect, {x:0, y: 0, width:100, height:50});
         rect.position(20, 30).dimension(150, 100);
         inspect(rect.component, {tag:'rect', x:-55, y:-20, width:150, height:100});
         inspect(rect, {x:20, y: 30, width:150, height:100});
         rect.color([50, 70, 80], 4, [100, 110, 120]);
         inspect(rect.component, {fill:'rgb(50,70,80)', "stroke-width":4, stroke:'rgb(100,110,120)'});
         assert.equal(rect.inside(-60, 0), false);
         assert.equal(rect.inside(-50, 0), true);
         assert.equal(rect.inside(90, 0), true);
         assert.equal(rect.inside(100, 0), false);
         assert.equal(rect.inside(0, -25), false);
         assert.equal(rect.inside(0, -15), true);
         assert.equal(rect.inside(0, 75), true);
         assert.equal(rect.inside(0, 85), false);
         });

         it("compares two drawings", function(done) {
         var rect = new svg.Rect(100, 50);
         fs.writeFileSync("./tests/data.json", "");
         fs.appendFileSync("./tests/data.json", runtime.json(rect)+"\n");
         fs.appendFileSync("./tests/data.json", runtime.json(rect)+"\n");

         var rs = fs.createReadStream("./tests/data.json");
         var rl = readline.createInterface({input:rs});
         rl.on('line', function(line ) {
         assert.equal(runtime.json(rect), line);
         console.log(line);
         });
         rs.on('end', done);
         });

         it("plays horses", function() {
         this.timeout(20000);
         runtime.declareAnchor('content');
         play({
         speed: 20,
         horsesCount: 2,
         players: {
         green: {type: "bot"},
         red: {type: "bot"},
         blue: {type: "bot"},
         yellow: {type: "bot"}
         }
         });
         var i=0;
         while (!runtime.finished()) {
         var snapshot = runtime.json(runtime.anchor('content'));
         console.log('\n' + snapshot.length+" "+i++);
         runtime.setRandom(Math.random());
         runtime.advance();
         }
         snapshot = runtime.json(runtime.anchor('content'));
         console.log('\n'+snapshot.length);
         //done();
         });
         */

        beforeEach(function () {
            runtime = mock.mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            horses.setSvg(svg);
        });

        it("plays a complete horse game", function (done) {
            this.timeout(100000);
            checkScenario(
                function() {
                    playHorses({
                        speed: 20,
                        horsesCount: 2,
                        players: {
                            green: {type: "bot"},
                            red: {type: "bot"},
                            blue: {type: "bot"},
                            yellow: {type: "bot"}
                        }
                    });
                },
                "./horses/completegame.json", 'content', runtime, done);
        });

        it("plays horses with humain player", function (done) {
            this.timeout(100000);
            checkScenario(
                function() {
                    playHorses({
                        speed: 20,
                        horsesCount: 2,
                        players: {
                            green: {type: "human"},
                            red: {type: "bot"},
                            blue: {type: "bot"},
                            yellow: {type: "bot"}
                        }
                    });
                },
                "./horses/startgame.json", 'content', runtime, done);
        });

    });

    describe('Mines', function () {
        beforeEach(function () {
            runtime = mock.mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            mines.setSvg(svg);
        });

        it("plays mines and loose", function (done) {
            this.timeout(100000);
            checkScenario(
                function() {
                    playMines({
                        size: 10,
                        minePercent: 10
                    });
                },
                "./mines/lostmine.json", 'content', runtime, done);
        });

        it("plays mines and win", function (done) {
            this.timeout(100000);
            checkScenario(
                function() {
                    playMines({
                        size: 10,
                        minePercent: 10
                    });
                },
                "./mines/winmine.json", 'content', runtime, done);
        });

    });

    describe('Azar', function () {
        beforeEach(function () {
            runtime = mock.mockRuntime();
            runtime.declareAnchor('content');
            svg = SVG(runtime);
            azar.setSvg(svg);
        });

        it("plays azar and get a chance", function (done) {
            this.timeout(100000);
            checkScenario(
                function() {
                    playAzar({
                        speed:20
                    });
                },
                "./azar/chance.json", 'content', runtime, done);
        });

    });

});