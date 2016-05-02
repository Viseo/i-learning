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
var guiSvgModule = require("../ext-files/svggui");
var guiSvg = guiSvgModule.Gui();


describe('Mocha marche bien', function() {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        });
    });
});

var inspect = testutils.inspect;
var checkScenario = testutils.checkScenario;

var runtime;
var svg;

describe('Quizz game', function () {
    var util = require("../src/Util");
    var gui = require("../src/GUI");
    var domain = require("../src/Domain");
    var mainModule = require("../src/main");

    beforeEach(function () {
        runtime = mock.mockRuntime();
        runtime.declareAnchor('content');
        svg = SVG(runtime);
        util.setSvg(svg);
        util.SVGUtil();
        util.Bdd();
        util.setGui(guiSvg);
        mainModule.setSvg(svg);
        mainModule.setUtil(util);
        var globalVariables = mainModule.setGlobalVariable();
        domain.setUtil(util);
        domain.setGlobalVariables(globalVariables);
        domain.Domain();
        gui.setDomain(domain);
        gui.AdminGUI();
        gui.setSVG(svg);
    });

    it("plays a complete quizz game", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                mainModule.main();
            },
            "./log/scenarQuizz.json", 'content', runtime, done);
    });
    it("an admin use", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                mainModule.main();
            },
            "./log/scenarAdmin.json", 'content', runtime, done);
    });
    it('should instantiate correctly my answer', function() {
        var answerJSON={
            label:"My first answer is...",
            imageSrc: "../resource/pomme.jpg",
            correct: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117},
            fontSize:20,
            font:"Courier New"
        };
        var answer = new Answer(answerJSON);
        assert.strictEqual(answer.correct,false);
        assert.strictEqual(answer.label, "My first answer is...");
        assert.strictEqual(answer.imageSrc, "../resource/pomme.jpg");
        assert.deepEqual(answer.colorBordure,  {r: 155, g: 222, b: 17});
        assert.deepEqual(answer.bgColor, {r: 125, g: 122, b: 117});
        assert.strictEqual(answer.fontSize, 20);
        assert.strictEqual(answer.font, "Courier New");

    });
});

