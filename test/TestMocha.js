/**
 * Created by ACA3502 on 12/04/2016.
 */

var assert = require('assert');
var testutils = require('../lib/testutils');
var targetRuntime = require('../lib/targetruntime').targetRuntime;
var mockRuntime = require('../lib/runtimemock').mockRuntime;
var SVG = require('../lib/svghandler').SVG;

var runTest = function (file, exec) {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(file)
    });

    var first = false;
    lineReader.on('line', function (line) {
        var data = JSON.parse(line);
        if(data.screenSize && !first) {
            svg.screenSize(data.screenSize.width, data.screenSize.height);
            first = true;
            exec();
        }
    });
};

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
var guiSvgModule;
var util;
var gui;
var domain;
var mainModule;
var adminModule;
var testModule;
var dbListenerModule;

describe('Quizz game', function () {

    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        guiSvgModule = require("../lib/svggui").Gui(svg, {speed: 5, step:100});
        util = require("../src/Util");
        gui = require("../src/GUI");
        domain = require("../src/Domain");
        mainModule = require("../src/main");
        adminModule = require("../src/admin");
        testModule = require("../test/testTest");
        runtime.declareAnchor('content');
        util.SVGUtil();
        util.Bdd();
        util.setSvg(svg);
        util.setGui(guiSvgModule);
        util.setRuntime(runtime);
        mainModule.setSvg(svg);
        mainModule.setUtil(util);
        adminModule.setSvg(svg);
        adminModule.setUtil(util);
        testModule.setUtil(util);
        testModule.setSvg(svg);
        //quizzManagerModule.setSvg(svg);
        //quizzManagerModule.setUtil(util);
        domain.setUtil(util);
        domain.Domain();
        domain.setRuntime(runtime);
        domain.setSvg(svg);
        gui.setDomain(domain);
        gui.LearningGUI();
        gui.setSVG(svg);
        gui.setGui(guiSvgModule);
        gui.setRuntime(runtime);
    });

    it("plays a complete quizz game with 2 Answers Right and a resize", function (done) {
        this.timeout(100000);
        var jsonFile = "./log/testQuizzTwoRightAnswersResize.json";
        var execute = function () {
            var globalVariables = mainModule.setGlobalVariable();
            domain.setGlobalVariables(globalVariables);
            checkScenario(
                function () {
                    mainModule.main(myQuizzTest);
                }, jsonFile, 'content', runtime, done);
        };
        runTest(jsonFile, execute);
    });
    it("plays a complete quizz game with all wrong", function (done) {
        this.timeout(100000);
        var jsonFile = "./log/testQuizzAllWrong.json";
        var execute = function () {
            var globalVariables = mainModule.setGlobalVariable();
            domain.setGlobalVariables(globalVariables);
            checkScenario(
                function () {
                    mainModule.main(myQuizzTest);
                }, jsonFile, 'content', runtime, done);
        };
        runTest(jsonFile, execute);
    });
    it("plays a complete quizz game with all correct but one", function (done) {
        this.timeout(100000);
        var jsonFile = "./log/testQuizzAllCorrectButOne.json";
        var execute = function () {
            var globalVariables = mainModule.setGlobalVariable();
            domain.setGlobalVariables(globalVariables);
            checkScenario(
                function () {
                    mainModule.main(myQuizzTest);
                }, jsonFile, 'content', runtime, done);
        };
        runTest(jsonFile, execute);
    });
    it("plays a complete quizz game with all correct", function (done) {
        this.timeout(100000);
        var jsonFile = "./log/testQuizzAllCorrect.json";
        var execute = function () {
            var globalVariables = mainModule.setGlobalVariable();
            domain.setGlobalVariables(globalVariables);
            checkScenario(
                function () {
                    mainModule.main(myQuizzTest);
                }, jsonFile, 'content', runtime, done);
        };
        runTest(jsonFile, execute);
    });
    it("plays a complete quizz game with only one right answer", function (done) {
        this.timeout(100000);
        var jsonFile = "./log/testQuizzAllWrongButOne.json";
        var execute = function () {
            var globalVariables = mainModule.setGlobalVariable();
            domain.setGlobalVariables(globalVariables);
            checkScenario(
                function () {
                    mainModule.main(myQuizzTest);
                }, jsonFile, 'content', runtime, done);
        };
        runTest(jsonFile, execute);
    });
});
describe('Firefox game', function () {
    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        guiSvgModule = require("../lib/svggui").Gui(svg, {speed: 5, step:100});
        util = require("../src/Util");
        gui = require("../src/GUI");
        domain = require("../src/Domain");
        mainModule = require("../src/main");
        adminModule = require("../src/admin");
        testModule = require("../test/testTest");
        dbListenerModule = require("../src/dbListener");
        runtime.declareAnchor('content');
        util.SVGUtil();
        util.Bdd();
        util.setSvg(svg);
        util.setGui(guiSvgModule);
        util.setRuntime(runtime);
        mainModule.setSvg(svg);
        mainModule.setUtil(util);
        adminModule.setSvg(svg);
        adminModule.setUtil(util);
        testModule.setUtil(util);
        testModule.setSvg(svg);
        //quizzManagerModule.setSvg(svg);
        //quizzManagerModule.setUtil(util);
        domain.setUtil(util);
        domain.Domain();
        domain.setRuntime(runtime);
        domain.setSvg(svg);
        gui.setDomain(domain);
        gui.AdminGUI();
        gui.setSVG(svg);
        gui.setGui(guiSvgModule);
        gui.setRuntime(runtime);
        dbListener = new dbListenerModule.DbListener(false, true);
    });

    it("a short admin use (to Formation)", function (done) {
        var jsonFile = "./log/testAdminShortUse.json";
        testutils.retrieveDB("./log/dbtestAdminShortUse.json", dbListener, function () {
            var execute = function () {
                var globalVariables = mainModule.setGlobalVariable();
                domain.setGlobalVariables(globalVariables);
                checkScenario(
                    function () {
                        adminModule.admin();
                    }, jsonFile, 'content', runtime, done);
            };
            runTest(jsonFile, execute);
        });
        this.timeout(100000);
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

