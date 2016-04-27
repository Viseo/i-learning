/**
 * Created by ACA3502 on 12/04/2016.
 */

var assert = require('assert');
var testutils = require('../ext-files/testutils');

var targetRuntime = require('../ext-files/targetRuntime').targetRuntime;
var mock = require('../ext-files/runtimemock');
mock.setTarget(targetRuntime);
var svgHandler = require('../ext-files/svghandler');
svgHandler.setTarget(targetRuntime);
var SVG = svgHandler.SVG;

describe('Array', function() {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        });
    });
});

var inspect = testutils.inspect;
var checkScenario = testutils.checkScenario;

//var playScenar = globalHandler.play;
//var main = require("../src/main");


var runtime;
var svg;

describe('Quizz game', function () {
    var util = require("../src/Util");
    var gui = require("../src/GUI");
    var domain = require("../src/Domain");
    var mainModule = require("../src/main");

    //var testUtil = require("../test/Test-util");
    //var globalHandler = require("../src/SVG-global-handler");
    //var bdd = require("../src/Bdd");
    //var quizz = require("../src/Quizz");
    //var toto = require("../src/Toto");


    beforeEach(function () {
        runtime = mock.mockRuntime();
        runtime.declareAnchor('content');
        svg = SVG(runtime);
        //globalHandler.setSvg(svg);
        util.setSvg(svg);
        //util.SVGGlobalHandler();
        util.SVGUtil();
        util.Bdd();
        mainModule.setSvg(svg);
        mainModule.setUtil(util);
        var globalVariables = mainModule.setGlobalVariable();
        domain.setUtil(util);
        domain.setGlobalVariables(globalVariables);
        //domain.setDrawing(globalVariables.drawing);
        //domain.setMainManipulator(globalVariables.mainManipulator);
        domain.Domain();
        gui.setDomain(domain);
        gui.AdminGUI();
        //mainModule.setGlobalHandler(globalHandler);
        //toto.setGlobalHandler(globalHandler);
        //mainModule.setToto(toto);
        //
        //mainModule.setBdd(bdd);
        //mainModule.setQuizz(quizz);
        //svgHandler.setSvg(svg);

        //testUtil.set
    });

    it("plays a complete quizz game", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                mainModule.main();
                //playHorses({
                //    speed: 20,
                //    horsesCount: 2,
                //    players: {
                //        green: {type: "bot"},
                //        red: {type: "bot"},
                //        blue: {type: "bot"},
                //        yellow: {type: "bot"}
                //    }
                //});
            },
            "./log/data.json", 'content', runtime, done);
    });
});

