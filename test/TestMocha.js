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
var inscriptionModule;

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
        inscriptionModule = require("../src/inscription");
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
        gui.LearningGUI();
        gui.setSVG(svg);
        gui.setGui(guiSvgModule);
        gui.setRuntime(runtime);
        dbListener = new dbListenerModule.DbListener(false, true);
    });

    // it("plays a complete quizz game using resize", function (done) {
    //     this.timeout(100000);
    //     var jsonFile = "./log/testQuizzResize.json";
    //     var execute = function () {
    //         var globalVariables = mainModule.setGlobalVariable();
    //         domain.setGlobalVariables(globalVariables);
    //         checkScenario(
    //             function () {
    //                 mainModule.main(myQuizzTest);
    //             }, jsonFile, 'content', runtime, done);
    //     };
    //     runTest(jsonFile, execute);
    // });

    it("plays a complete quizz game with 2 Answers correct", function (done) {
        this.timeout(100000);
        var jsonFile = "./log/testQuizzTwoRightAnswers.json";
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
    it("Inscription page", function (done) {
        this.timeout(100000);
        var jsonFile = "./log/testInscription.json";
        var execute = function () {
            var globalVariables = mainModule.setGlobalVariable();
            domain.setGlobalVariables(globalVariables);
            checkScenario(
                function () {
                    inscriptionModule.inscription();
                }, jsonFile, 'content', runtime, done);
        };
        runTest(jsonFile, execute);
    });
});
describe('Admin use', function () {
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

    it("an admin goes to formation and creates games and save", function (done) {
        var jsonFile = "./log/testAdminCreatesGamesAndSave.json";
        testutils.retrieveDB("./log/dbtestAdminCreatesGamesAndSave.json", dbListener, function () {
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

    it("an admin creates a new game and fill it with pictures", function (done) {
        var jsonFile = "./log/testAdminNewGame.json";
        testutils.retrieveDB("./log/dbtestAdminNewGame.json", dbListener, function () {
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

    // Mock AppendChild
    // it("an admin creates a new game and fill it with data", function (done) {
    //     var jsonFile = "./log/testAdminNewGameData.json";
    //     testutils.retrieveDB("./log/dbtestAdminNewGameData.json", dbListener, function () {
    //         var execute = function () {
    //             var globalVariables = mainModule.setGlobalVariable();
    //             domain.setGlobalVariables(globalVariables);
    //             checkScenario(
    //                 function () {
    //                     adminModule.admin();
    //                 }, jsonFile, 'content', runtime, done);
    //         };
    //         runTest(jsonFile, execute);
    //     });
    //     this.timeout(100000);
    // });

    it("an admin use with add/delete arrows", function (done) {
        var jsonFile = "./log/testAdminArrows.json";
        testutils.retrieveDB("./log/dbtestAdminArrows.json", dbListener, function () {
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

    it("an admin use with quiz preview and its validation tests", function (done) {
        var jsonFile = "./log/testAdminPreview.json";
        testutils.retrieveDB("./log/dbtestAdminPreview.json", dbListener, function () {
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

    it("an admin use (quiz) with creation of new answer and new question", function (done) {
        var jsonFile = "./log/testAdminCreateQuestionAnswer.json";
        testutils.retrieveDB("./log/dbtestAdminCreateQuestionAnswer.json", dbListener, function () {
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
});

