/**
 * Created by ACA3502 on 12/04/2016.
 */

var assert = require('assert');
var testutils = require('../lib/testutils');

var targetRuntime = require('../lib/targetruntime').targetRuntime;
var mock = require('../lib/runtimemock');
mock.setTarget(targetRuntime);
var svgHandler = require('../lib/svghandler');
svgHandler.setTarget(targetRuntime);
var SVG = svgHandler.SVG;



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
    var guiSvgModule = require("../lib/svggui");
    var util = require("../src/Util");
    var gui = require("../src/GUI");
    var domain = require("../src/Domain");
    var mainModule = require("../src/main");
    var adminModule = require("../src/admin");
    //var quizzManagerModule = require("../src/quizzManager");
    var testModule = require("../test/testTest");


    beforeEach(function () {
        runtime = mock.mockRuntime();
        runtime.declareAnchor('content');
        svg = SVG(runtime);
        guiSvgModule.setSVG(svg);
        var guiSvg = guiSvgModule.Gui();
        util.setSvg(svg);
        util.SVGUtil();
        util.Bdd();
        util.setGui(guiSvg);
        util.setRuntime(runtime);
        mainModule.setSvg(svg);
        mainModule.setUtil(util);
        adminModule.setSvg(svg);
        adminModule.setUtil(util);
        testModule.setUtil(util);
        testModule.setSvg(svg);
        //quizzManagerModule.setSvg(svg);
        //quizzManagerModule.setUtil(util);
        svg.screenSize(1904,949); //Chrome
        var globalVariables = mainModule.setGlobalVariable();
        domain.setUtil(util);
        domain.setGlobalVariables(globalVariables);
        domain.Domain();
        domain.setRuntime(runtime);
        domain.setSvg(svg);
        gui.setDomain(domain);
        gui.LearningGUI();
        gui.setSVG(svg);
        gui.setGui(guiSvg);
        gui.setRuntime(runtime);
    });

    it("plays a complete quizz game with 2 Answers Right and a resize", function (done) {
        this.timeout(100000);
        checkScenario(
            function(){
                mainModule.main(myQuizzTest);
            },
            "./log/testQuizzTwoRightAnswersResize.json", 'content', runtime, done);
    });
    it("plays a complete quizz game with a lot of errors", function (done) {
        this.timeout(100000);
        checkScenario(
            function(){
                mainModule.main(myQuizzTest);
            },
            "./log/testQuizzCompletBcpFaux.json", 'content', runtime, done);
    });
    it("plays a complete quizz game with all just but one", function (done) {
        this.timeout(100000);
        checkScenario(
            function(){
                mainModule.main(myQuizzTest);
            },
            "./log/testQuizzToutesSaufUne.json", 'content', runtime, done);
    });
    it("plays a complete quizz game with all right", function (done) {
        this.timeout(100000);
        checkScenario(
            function(){
                mainModule.main(myQuizzTest);
            },
            "./log/testQuizzToutesBonnes.json", 'content', runtime, done);
    });
    it("plays a complete quizz game with only one right answer", function (done) {
        this.timeout(100000);
        checkScenario(
            function(){
                mainModule.main(myQuizzTest);
            },
            "./log/testQuizzUneSeuleJuste.json", 'content', runtime, done);
    });
    //it("an admin use", function (done) {
    //    this.timeout(100000);
    //    checkScenario(
    //        function () {
    //            adminModule.admin();
    //        },
    //        "./log/testFirefoxAdmin.json", 'content', runtime, done);
    //});

    //it("QuizzManager", function (done) {
    //    this.timeout(100000);
    //    checkScenario(
    //        function () {
    //            quizzManagerModule.quizzManager();
    //        },
    //        "./log/testQuizzManagerAccueil.json", 'content', runtime, done);
    //});

    //it("Test test", function (done) {
    //    this.timeout(100000);
    //    checkScenario(
    //        function(){
    //            //var textarea = new svg.getSvgr().createDOM("textarea");
    //            var textPourGetBBox = new svg.Text("Le texte");
    //            mainManipulator.ordonator.set(0, textPourGetBBox);
    //            var dim = textPourGetBBox.component.getBoundingClientRect() || textPourGetBBox.component.target.getBoundingClientRect();
    //            var rect = new svg.Rect(dim.width, dim.height);
    //            mainManipulator.ordonator.set(1, rect);
    //        },
    //        "./log/new.json", 'content', runtime, done);
    //});


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
describe('Firefox game', function () {
    var guiSvgModule = require("../lib/svggui");
    var util = require("../src/Util");
    var gui = require("../src/GUI");
    var domain = require("../src/Domain");
    var mainModule = require("../src/main");
    var adminModule = require("../src/admin");
    //var quizzManagerModule = require("../src/quizzManager");
    var testModule = require("../test/testTest");


    beforeEach(function () {
        runtime = mock.mockRuntime();
        runtime.declareAnchor('content');
        svg = SVG(runtime);
        guiSvgModule.setSVG(svg);
        var guiSvg = guiSvgModule.Gui({speed: 50, step: 10});
        util.setSvg(svg);
        util.SVGUtil();
        util.Bdd();
        util.setGui(guiSvg);
        util.setRuntime(runtime);
        mainModule.setSvg(svg);
        mainModule.setUtil(util);
        adminModule.setSvg(svg);
        adminModule.setUtil(util);
        testModule.setUtil(util);
        testModule.setSvg(svg);
        //quizzManagerModule.setSvg(svg);
        //quizzManagerModule.setUtil(util);
        svg.screenSize(1904,949); //Firefox
        var globalVariables = mainModule.setGlobalVariable();
        domain.setUtil(util);
        domain.setGlobalVariables(globalVariables);
        domain.Domain();
        domain.setRuntime(runtime);
        domain.setSvg(svg);
        gui.setDomain(domain);
        gui.AdminGUI();
        gui.setSVG(svg);
        gui.setGui(guiSvg);
        gui.setRuntime(runtime);
    });


    it("a short admin use (to Formation)", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                adminModule.admin();
            },
            "./log/testFirefoxAdminShort.json", 'content', runtime, done);
    });

    it("a short admin use (to Formation, with Games)", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                adminModule.admin();
            },
            "./log/testFirefoxAdminShortGames.json", 'content', runtime, done);
    });

    //it("a short admin use (to QuizzManager)", function (done) {
    //    this.timeout(100000);
    //    checkScenario(
    //        function () {
    //            adminModule.admin();
    //        },
    //        "./log/testFirefoxAdminQuizzManager.json", 'content', runtime, done);
    //});

    it("a short admin use (to QuizzManager, with new questions and answers)", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                adminModule.admin();
            },
            "./log/testFirefoxAdminAddElementsSmall.json", 'content', runtime, done);
    });

    it("a short admin use (to QuizzManager, with checkbox use and toggle button)", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                var param = {speed: 50, step: 10};
                adminModule.admin();
            },
            "./log/testFirefoxAdminCheckbox.json", 'content', runtime, done);
    });

    it("a short admin use (edit formation title)", function (done) {
        this.timeout(100000);
        checkScenario(
            function () {
                adminModule.admin();
            },
            "./log/testTextarea.json", 'content', runtime, done);
    });
});

