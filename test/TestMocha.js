/**
 * Created by ACA3502 on 12/04/2016.
 */

const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require('../lib/svghandler').SVG,
    inspect = testutils.inspect,
    checkScenario = testutils.checkScenario;

const runTest = function (file, exec) {
    const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(file)
    });

    let first = false;
    lineReader.on('line', function (line) {
        const data = JSON.parse(line);
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


let runtime,
    svg,
    main,
    dbListenerModule,
    dbListener;
let retrieve = testutils.retrieve;
// describe('Vilains tests', function () {
//
//     beforeEach(function () {
//         runtime = mockRuntime();
//         svg = SVG(runtime);
//         runtime.declareAnchor('content');
//         main = require("../src/main").main;
//         dbListenerModule = require("../src/dbListener").dbListener;
//         dbListener = new dbListenerModule(false, true);
//     });
//
//     /*it("Rien", function (done) {
//         this.timeout(100000);
//         const jsonFile = "./log/rien.json";
//         const execute = () => {
//             checkScenario(() => {
//                 main(svg, runtime, dbListener)
//             }, jsonFile, 'content', runtime, done);
//         };
//         runTest(jsonFile, execute);
//     });*/
//
//     // it("Un clic sur rien", function (done) {
//     //     const jsonFile = "./log/clic_rien.json";
//     //     this.timeout(100000);
//     //     testutils.retrieveDB("./log/dbRien.json", dbListener, function () {
//     //         const execute = () => {
//     //             checkScenario(() => {
//     //                 main(svg, runtime, dbListener)
//     //             }, jsonFile, 'content', runtime, done);
//     //         };
//     //         runTest(jsonFile, execute);
//     //     });
//     // });
// });

describe('Connection', function () {

    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("header message without connection", function (done) {
        testutils.retrieveDB("./log/dbRien.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Connexion");
            done();
        });
        // let wilfried = retrieve(root, "[Wilfried].[image]");
        // let wilfriedChance = retrieve(root, "[Wilfried].[chance]");
        // let heweraldChance = retrieve(root, "[Hewerald].[chance]");
        // assert.equal(wilfriedChance.text, "?");
        // assert.equal(heweraldChance.text, "?");
        // wilfried.event("click", {});
        // rollDice(6, 6, 6);
        // assert.equal(wilfriedChance.text, "Azar !");
        // assert.equal(heweraldChance.text, "?");

    });

    it("admin log in on formationsManager", function (done) {
        testutils.retrieveDB("./log/dbAdminConnexionFormationsManager.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Liste des formations");
            done();
        });
    });

    it("player log in on formationsManager", function (done) {
        testutils.retrieveDB("./log/dbPlayerConnexionFormationsManager.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Liste des formations");
            done();
        });
    });

});

describe('formationsManager', function () {

    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should add a formation", function(done){
        testutils.retrieveDB("./log/dbAdminConnexionFormationsManager.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener);
            let root = runtime.anchor("content");
            let addFormationCadre = retrieve(root, "[addFormationCadre]");
            addFormationCadre.listeners["click"]();
            let formationLabelContent = retrieve(root, "[formationLabelContent]");
            assert.equal(formationLabelContent.text, "Entrer le nom de la formation");

            let saveFormationButtonCadre = retrieve(root, "[saveFormationButtonCadre]");
            saveFormationButtonCadre.listeners["click"]();
            let formationErrorMessage = retrieve(root, "[formationErrorMessage]");
            assert.equal(formationErrorMessage.text, "Vous devez remplir correctement le nom de la formation.");

            let publicationFormationButtonCadre = retrieve(root, "[publicationFormationButtonCadre]");
            publicationFormationButtonCadre.listeners["click"]();
            let errorMessagePublication = retrieve(root, "[errorMessagePublication]");
            assert.equal(errorMessagePublication.text, "Vous devez remplir le nom de la formation.");

            let gameQuiz = retrieve(root, "[gameQuiz]");
            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            let gameMiniatureCadre = retrieve(root, "[gameMiniatureCadre]");
            gameMiniatureCadre.listeners["mouseup"]({pageX:165, pageY:300, preventDefault:()=>{}});
            assert.equal(gameQuiz.stroke, 'rgb(25,25,112)');

            let panelBack = retrieve(root, "[panelBack]");
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game0 = retrieve(root, "[level0quizz0]");
            assert.equal(game0.text, "Quiz 1");

            publicationFormationButtonCadre.listeners["click"]();
            assert.equal(errorMessagePublication.text, "Vous devez remplir le nom de la formation.");

            formationLabelContent.listeners["dblclick"]();
            let formationLabelContentArea = retrieve(root, "[formationLabelContentArea]");
            formationLabelContentArea.value = "La première formation";
            formationLabelContentArea.listeners["blur"]();
            formationLabelContent = retrieve(root, "[formationLabelContent]");
            assert.equal(formationLabelContent.text, "La première formation");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            gameMiniatureCadre = retrieve(root, "[gameMiniatureCadre]");
            gameMiniatureCadre.listeners["mouseup"]({pageX:165, pageY:300, preventDefault:()=>{}});
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game1 = retrieve(root, "[level1quizz1]");
            assert.equal(game1.text, "Quiz 2");
            let miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 2);

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            gameMiniatureCadre = retrieve(root, "[gameMiniatureCadre]");
            gameMiniatureCadre.listeners["mouseup"]({pageX:165, pageY:300, preventDefault:()=>{}});
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game2 = retrieve(root, "[level1quizz2]");
            assert.equal(game2.text, "Quiz 3");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 3);

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            gameMiniatureCadre = retrieve(root, "[gameMiniatureCadre]");
            gameMiniatureCadre.listeners["mouseup"]({pageX:165, pageY:300, preventDefault:()=>{}});
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game3 = retrieve(root, "[level1quizz3]");
            assert.equal(game3.text, "Quiz 4");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 4);

            done();
        });
    });
});

/*describe('Quizz game', function () {

 beforeEach(function () {
 runtime = mockRuntime();
 svg = SVG(runtime);
 runtime.declareAnchor('content');
 main = require("../src/main").main;
 dbListenerModule = require("../src/dbListener").dbListener;
 dbListener = new dbListenerModule(true, false);
 });

 it("plays a complete quizz game with 2 Answers correct", function (done) {
 this.timeout(100000);
 const jsonFile = "./log/testQuizzTwoRightAnswers.json";
 const execute = () => {
 checkScenario(() => {main(svg, runtime, dbListener)}, jsonFile, 'content', runtime, done);
 };
 runTest(jsonFile, execute);
 });
 it("plays a complete quizz game with all wrong", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testQuizzAllWrong.json";
 var execute = function () {
 checkScenario(
 function () {
 main(svg, runtime);
 }, jsonFile, 'content', runtime, done);
 };
 runTest(jsonFile, execute);
 });
 it("plays a complete quizz game with all correct but one", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testQuizzAllCorrectButOne.json";
 var execute = function () {
 checkScenario(
 function () {
 main(svg, runtime);
 }, jsonFile, 'content', runtime, done);
 };
 runTest(jsonFile, execute);
 });
 it("plays a complete quizz game with all correct", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testQuizzAllCorrect.json";
 var execute = function () {
 checkScenario(
 function () {
 main(svg, runtime);
 }, jsonFile, 'content', runtime, done);
 };
 runTest(jsonFile, execute);
 });
 it("plays a complete quizz game with only one right answer", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testQuizzAllWrongButOne.json";
 var execute = function () {
 checkScenario(
 function () {
 main(svg, runtime);
 }, jsonFile, 'content', runtime, done);
 };
 runTest(jsonFile, execute);
 });
 });

 describe('Inscription/Connexion', function () {

 beforeEach(function () {
 runtime = mockRuntime();
 svg = SVG(runtime);
 runtime.declareAnchor('content');
 main = require("../src/main").main;
 dbListenerModule = require("../src/dbListener").dbListener;
 dbListener = new dbListenerModule(true, false);
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
 it("Inscription Ok", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testInscriptionOK.json";
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
 it("Inscription Errors", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testInscriptionErrors.json";
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
 it("Connection page", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testConnection.json";
 var execute = function () {
 var globalVariables = mainModule.setGlobalVariable();
 domain.setGlobalVariables(globalVariables);
 checkScenario(
 function () {
 connexionModule.connexion();
 }, jsonFile, 'content', runtime, done);
 };
 runTest(jsonFile, execute);
 });
 it("Connection texfield filled but no click on the connection button", function (done) {
 this.timeout(100000);
 var jsonFile = "./log/testConnectionSansClick.json";
 var execute = function () {
 var globalVariables = mainModule.setGlobalVariable();
 domain.setGlobalVariables(globalVariables);
 checkScenario(
 function () {
 connexionModule.connexion();
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
 Server = util.Server;
 ReturnButton = util.ReturnButton;
 Answer = domain.Answer;
 Question = domain.Question;
 QuestionCreator = domain.QuestionCreator;
 AddEmptyElement = domain.AddEmptyElement;
 Level = domain.Level;
 FormationsManager = domain.FormationsManager;
 Formation = domain.Formation;
 Library = domain.Library;
 Header = domain.Header;
 Puzzle = domain.Puzzle;
 QuizzManager = domain.QuizzManager;
 Quizz = domain.Quizz;
 Bd = domain.Bd;
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
 it("an admin use formationLabel correct and not", function (done) {
 var jsonFile = "./log/testAdminFormationLabel.json";
 testutils.retrieveDB("./log/dbtestAdminFormationLabel.json", dbListener, function () {
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
 it("an admin quizz textareas Ok and not", function (done) {
 var jsonFile = "./log/testAdminQuizzTextAreas.json";
 testutils.retrieveDB("./log/dbtestAdminQuizzTextAreas.json", dbListener, function () {
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

 it("an admin use with add/delete arrows game and level", function (done) {
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
 });*/
