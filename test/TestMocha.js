/**
 * Created by ACA3502 on 12/04/2016.
 */

const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require('../lib/svghandler').SVG,
    inspect = testutils.inspect,
    checkScenario = testutils.checkScenario,
    ERROR_MESSAGE_INPUT = 'Seuls les caractères alphanumériques, avec accent et "-,\',.;?!°© sont permis.';


const ImageRuntime = {
    images: {},
    count: 0,

    getImage: function (imgUrl, onloadHandler) {
        this.count++;
        const image = {
            src: imgUrl,
            onload: onloadHandler,
            id: "i" + this.count
        };
        this.images[image.id] = image;
        return image;
    },

    imageLoaded: function (id, w, h) {
        this.images[id].width = w;
        this.images[id].height = h;
        this.images[id].onload();
    }
};

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
            main(svg, runtime, dbListener, ImageRuntime);
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
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Liste des formations");
            done();
        });
    });

    it("player log in on formationsManager", function (done) {
        testutils.retrieveDB("./log/dbPlayerConnexionFormationsManager.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener, ImageRuntime);
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
        testutils.retrieveDB("./log/dbNewQuizz.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let addFormationCadre = retrieve(root, "[addFormationCadre]");
            addFormationCadre.listeners["click"]();
            let formationLabelContent = retrieve(root, "[formationLabelContent]");
            assert.equal(formationLabelContent.text, "Entrer le nom de la formation");

            let saveFormationButtonCadre = retrieve(root, "[saveFormationButtonCadre]");
            saveFormationButtonCadre.listeners["click"]();
            let formationErrorMessage = retrieve(root, "[formationErrorMessage]");
            assert.equal(formationErrorMessage.text, "Vous devez remplir correctement le nom de la formation.");
            runtime.advance();
            formationErrorMessage = retrieve(root, "[formationErrorMessage]");
            assert(!formationErrorMessage);

            let publicationFormationButtonCadre = retrieve(root, "[publicationFormationButtonCadre]");
            publicationFormationButtonCadre.listeners["click"]();
            let errorMessagePublication = retrieve(root, "[errorMessagePublication]");
            assert.equal(errorMessagePublication.text, "Vous devez remplir le nom de la formation.");

            let gameQuiz = retrieve(root, "[gameQuiz]");
            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            let draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); //{pageX:165, pageY:300, preventDefault:()=>{}}
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
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game1 = retrieve(root, "[level1quizz1]");
            assert.equal(game1.text, "Quiz 2");
            let miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 2);

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game2 = retrieve(root, "[level1quizz2]");
            assert.equal(game2.text, "Quiz 3");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 3);

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game3 = retrieve(root, "[level1quizz3]");
            assert.equal(game3.text, "Quiz 4");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 4);

            let arrowModeButtonCadre = retrieve(root, '[arrowModeButtonCadre]');
            arrowModeButtonCadre.listeners['click']();
            let arrowModeArrow = retrieve(root, '[arrowModeArrow]');
            assert.equal(arrowModeArrow.fill, 'rgb(25,122,230)');

            let glass = retrieve(root, '[theGlass]');
            glass.listeners['mousedown']({pageX:1108, pageY:211, preventDefault:()=>{}});
            glass.listeners['mouseup']({pageX:1108, pageY:360, preventDefault:()=>{}});
            let arrow01 = retrieve(root, '[quizz0quizz1]');
            let arrow02 = retrieve(root, '[quizz0quizz2]');
            let arrow03 = retrieve(root, '[quizz0quizz3]');
            let arrow20 = retrieve(root, '[quizz2quizz0]');
            assert(arrow02);
            assert(!arrow01);
            assert(!arrow03);
            assert(!arrow20);

            arrow02.listeners['click']();
            assert.equal(arrow02.fill, 'rgb(25,122,230)');
            let redCross = retrieve(root, '[redCross]');
            redCross.listeners['click']();
            arrow02 = retrieve(root, '[quizz0quizz2]');
            assert(!arrow02);

            glass.listeners['mousedown']({pageX:1108, pageY:211, preventDefault:()=>{}});
            glass.listeners['mouseup']({pageX:945, pageY:373, preventDefault:()=>{}});
            arrow03 = retrieve(root, '[quizz0quizz3]');
            assert(arrow03);

            game3.listeners['mousedown']({pageX:945, pageY:373, preventDefault:()=>{}});
            game3.listeners['mouseup']({pageX:945, pageY:373, preventDefault:()=>{}});
            let gameRedCross = retrieve(root, '[gameRedCross]');
            gameRedCross.listeners['click']();
            game3 = retrieve(root, "[level1quizz3]");
            assert(!game3);
            arrow03 = retrieve(root, '[quizz0quizz3]');
            assert(!arrow03);

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:500, preventDefault:()=>{}});
            let game4 = retrieve(root, "[level2quizz4]");
            assert.equal(game4.text, "Quiz 5");

            game4.listeners['mousedown']({pageX:862, pageY:474, preventDefault:()=>{}});
            game4.listeners['mouseup']({pageX:862, pageY:474, preventDefault:()=>{}});
            game4.listeners['mousedown']({pageX:862, pageY:474, preventDefault:()=>{}});
            game4.listeners['mouseup']({pageX:862, pageY:474, preventDefault:()=>{}});
            game4.listeners['mousedown']({pageX:862, pageY:474, preventDefault:()=>{}});
            game4.listeners['mouseup']({pageX:862, pageY:474, preventDefault:()=>{}});
            gameRedCross = retrieve(root, '[gameRedCross]');
            gameRedCross.listeners['click']();
            game4 = retrieve(root, "[level1quizz3]");
            assert(!game4);

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game5 = retrieve(root, "[level1quizz5]");
            assert.equal(game5.text, "Quiz 6");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game6 = retrieve(root, "[level1quizz6]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game7 = retrieve(root, "[level1quizz7]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game8 = retrieve(root, "[level1quizz8]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game9 = retrieve(root, "[level1quizz9]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game10 = retrieve(root, "[level1quizz10]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game11 = retrieve(root, "[level1quizz11]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game12 = retrieve(root, "[level1quizz12]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game13 = retrieve(root, "[level1quizz13]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:1142, pageY:791, preventDefault:()=>{}});
            let game14 = retrieve(root, "[level2quizz14]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:1142, pageY:791, preventDefault:()=>{}});
            let game15 = retrieve(root, "[level3quizz15]");

            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["click"](); // {pageX:165, pageY:300, preventDefault:()=>{}}
            panelBack.listeners['mouseup']({pageX:1142, pageY:791, preventDefault:()=>{}});
            let game16 = retrieve(root, "[level4quizz16]");

            let bdQuiz = retrieve(root, "[gameBd]");
            bdQuiz.listeners["mousedown"]({pageX:165, pageY:488, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({pageX:500, pageY:791, preventDefault:()=>{}}); //{pageX:165, pageY:300, preventDefault:()=>{}}
            let bd1 = retrieve(root, "[level4bd0]");

            bd1.listeners['mousedown']({pageX:500, pageY:791, preventDefault:()=>{}});
            bd1.listeners['mouseup']({pageX:500, pageY:500, preventDefault:()=>{}});

            bd1.listeners['dblclick']();
            let returnButtonFromBdToFormation = retrieve(root, '[returnButtonFromBdToFormation]');
            returnButtonFromBdToFormation.listeners['click']();

            runtime.listeners['keydown']({keyCode:39, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:40, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:37, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:38, preventDefault:()=>{}});
            runtime.advanceTo(6);
            runtime.advanceTo(7);

            game0.listeners['dblclick']({pageX:1104, pageY:212, preventDefault:()=>{}});
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let quizzLabelContent = retrieve(root, '[quizzLabelContent]');
            assert(quizzLabelContent.text, "Quiz 1");

            quizzLabelContent.listeners["dblclick"]();
            let quizEditionTextArea = retrieve(root, "[quizEditionTextArea]");
            quizEditionTextArea.value = "Quiz n°1==";
            quizEditionTextArea.listeners["input"]();
            quizEditionTextArea.value = "Quiz n°1==";
            quizEditionTextArea.listeners["blur"]();
            quizzLabelContent = retrieve(root, "[quizzLabelContent]");
            let quizzLabelCadre = retrieve(root, "[quizzLabelCadre]");
            let quizErrorMessage = retrieve(root, "[quizErrorMessage]");
            assert.equal(quizzLabelCadre.stroke, 'rgb(255,0,0)');
            assert.equal(quizErrorMessage.text, ERROR_MESSAGE_INPUT);
            assert.equal(quizzLabelContent.text, "Quiz n°1==");

            quizzLabelContent.listeners["dblclick"]();
            quizEditionTextArea = retrieve(root, "[quizEditionTextArea]");
            quizEditionTextArea.value = "Quiz n°1";
            quizEditionTextArea.listeners["input"]();
            quizEditionTextArea.value = "Quiz n°1";
            quizEditionTextArea.listeners["blur"]();
            quizzLabelContent = retrieve(root, "[quizzLabelContent]");
            quizzLabelCadre = retrieve(root, "[quizzLabelCadre]");
            quizErrorMessage = retrieve(root, "[quizErrorMessage]");
            assert.equal(quizzLabelCadre.stroke, 'none');
            assert.equal(quizErrorMessage, null);
            assert.equal(quizzLabelContent.text, "Quiz n°1");

            let questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            let questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            questionBlockTextArea.value = "La première question ?==";
            questionBlockTextArea.listeners['input']();
            questionBlockTextArea.value = "La première question ?==";
            questionBlockTextArea.listeners['blur']();
            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            let questionBlockCadre1 = retrieve(root, '[questionBlockCadre1]');
            let questionBlockErrorMessage = retrieve(root, '[questionBlockErrorMessage]');
            assert.equal(questionBlockCadre1.stroke, 'rgb(255,0,0)');
            assert.equal(questionBlockErrorMessage.text, ERROR_MESSAGE_INPUT);
            assert.equal(questionBlockTitle1.text, "La première question ?==");

            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            questionBlockTextArea.value = "La première question ?";
            questionBlockTextArea.listeners['input']();
            questionBlockTextArea.value = "La première question ?";
            questionBlockTextArea.listeners['blur']();
            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockCadre1 = retrieve(root, '[questionBlockCadre1]');

            questionBlockErrorMessage = retrieve(root, '[questionBlockErrorMessage]');
            assert.equal(questionBlockCadre1.stroke, 'rgb(0,0,0)');
            assert.equal(questionBlockErrorMessage, null);
            assert.equal(questionBlockTitle1.text, "La première question ?");

            let answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelContent0.listeners['dblclick']();
            let answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            answerLabelContentArea.value = "La première réponse ?==";
            answerLabelContentArea.listeners['input']();
            answerLabelContentArea.value = "La première réponse ?==";
            answerLabelContentArea.listeners['blur']();
            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            let answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            let answerErrorMessage = retrieve(root, '[answerErrorMessage]');
            assert.equal(answerLabelCadre0.stroke, 'rgb(255,0,0)');
            assert.equal(answerErrorMessage.text, ERROR_MESSAGE_INPUT);
            assert.equal(answerLabelContent0.text, "La première réponse ?==");

            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelContent0.listeners['dblclick']();
            answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            answerLabelContentArea.value = "La première réponse ?";
            answerLabelContentArea.listeners['input']();
            answerLabelContentArea.value = "La première réponse ?";
            answerLabelContentArea.listeners['blur']();
            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            answerErrorMessage = retrieve(root, '[answerErrorMessage]');
            assert.equal(answerLabelCadre0.stroke, 'rgb(0,0,0)');
            assert.equal(answerErrorMessage, null);
            assert.equal(answerLabelContent0.text, "La première réponse ?");

            let emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
            emptyAnswerAddCadreanswer.listeners['dblclick']();
            let answerLabelContent2 = retrieve(root, '[answerLabelContent2]');
            assert.equal(answerLabelContent2.text, 'Double cliquer pour modifier et cocher si bonne réponse.');

            emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
            emptyAnswerAddCadreanswer.listeners['dblclick']();
            let answerLabelContent3 = retrieve(root, '[answerLabelContent3]');
            assert.equal(answerLabelContent3.text, 'Double cliquer pour modifier et cocher si bonne réponse.');

            emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
            emptyAnswerAddCadreanswer.listeners['dblclick']();
            let answerLabelContent4 = retrieve(root, '[answerLabelContent4]');
            assert.equal(answerLabelContent4.text, 'Double cliquer pour modifier et cocher si bonne réponse.');

            emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
            emptyAnswerAddCadreanswer.listeners['dblclick']();
            let answerLabelContent5 = retrieve(root, '[answerLabelContent5]');
            assert.equal(answerLabelContent5.text, 'Double cliquer pour modifier et cocher si bonne réponse.');

            emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
            emptyAnswerAddCadreanswer.listeners['dblclick']();
            let answerLabelContent6 = retrieve(root, '[answerLabelContent6]');
            assert.equal(answerLabelContent6.text, 'Double cliquer pour modifier et cocher si bonne réponse.');

            emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
            emptyAnswerAddCadreanswer.listeners['dblclick']();
            let answerLabelContent7 = retrieve(root, '[answerLabelContent7]');
            assert.equal(answerLabelContent6.text, 'Double cliquer pour modifier et cocher si bonne réponse.');

            let emptyAnswerAddCadreanswerDoesNotExistAnymore = retrieve(root, '[emptyAnswerAddCadreanswer]');
            assert(!emptyAnswerAddCadreanswerDoesNotExistAnymore);

            let answerLabelCadre7 = retrieve(root, '[answerLabelCadre7]');
            answerLabelCadre7.listeners['mouseover']();
            redCross = retrieve(root, '[redCross]');
            redCross.listeners['click']();

            answerLabelCadre7 = retrieve(root, '[answerLabelCadre7]');
            assert(!answerLabelCadre7);

            let emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            emptyAnswerAddCadrequestion.listeners['dblclick']();
            emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            emptyAnswerAddCadrequestion.listeners['dblclick']();
            emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            emptyAnswerAddCadrequestion.listeners['dblclick']();
            emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            emptyAnswerAddCadrequestion.listeners['dblclick']();
            emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            emptyAnswerAddCadrequestion.listeners['dblclick']();

            let questionLeftChevron = retrieve(root, '[questionLeftChevron]');
            questionLeftChevron.listeners['click']();
            emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            assert(!emptyAnswerAddCadrequestion);
            let questionRightChevron = retrieve(root, '[questionRightChevron]');
            questionRightChevron.listeners['click']();
            emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            assert(emptyAnswerAddCadrequestion);

            let toggleButtonCadreMultiple = retrieve(root, '[toggleButtonCadremultiples]');
            let toggleButtonCadreUnique = retrieve(root, '[toggleButtonCadreunique]');
            assert(toggleButtonCadreMultiple.fill, 'rgb(0,0,0)');
            assert(toggleButtonCadreUnique.fill, 'rgb(25,25,112)');
            toggleButtonCadreMultiple.listeners['click']({pageX:1306, pageY:365, preventDefault:()=>{}});
            assert(toggleButtonCadreUnique.fill, 'rgb(0,0,0)');
            assert(toggleButtonCadreMultiple.fill, 'rgb(25,25,112)');

            let explanationCadre0 = retrieve(root, '[explanationSquare0]');
            explanationCadre0.listeners['click']();
            let textExplanation = retrieve(root, '[textExplanation]');
            assert(textExplanation.text, 'Cliquer ici pour ajouter du texte');
            let explanationPanel = retrieve(root, '[explanationPanel]');
            explanationPanel.listeners['click']();
            let explanationContentArea = retrieve(root, '[explanationContentArea]');
            explanationContentArea.value = "Ceci est la première explication";
            explanationContentArea.listeners['input']();
            explanationContentArea.value = "Ceci est la première explication";
            explanationContentArea.listeners['blur']();
            textExplanation = retrieve(root, '[textExplanation]');
            assert(textExplanation.text, "Ceci est la première explication");

            let circleCloseExplanation = retrieve(root, '[circleCloseExplanation]');
            circleCloseExplanation.listeners['click']();
            textExplanation = retrieve(root, '[textExplanation]');
            assert(!textExplanation);

            let image = retrieve(root, '[imageAlba]');
            image.listeners['mousedown']({pageX:53, pageY:411, preventDefault:()=>{}});
            let imgDraged = retrieve(root, '[imgDraged]');
            imgDraged.listeners['mouseup']({pageX:425, pageY:438, preventDefault:()=>{}});
            let questionImage = retrieve(root, '[questionImage6]');
            assert(questionImage);

            let questionFromPuzzleBordure2 = retrieve(root, '[questionFromPuzzleBordure2]');
            questionFromPuzzleBordure2.listeners['click']({pageX:185, pageY:223, preventDefault:()=>{}});
            let questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();
            questionFromPuzzleBordure2 = retrieve(root, '[questionFromPuzzleBordure2]');
            questionFromPuzzleBordure2.listeners['click']({pageX:185, pageY:223, preventDefault:()=>{}});
            questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();
            questionFromPuzzleBordure2 = retrieve(root, '[questionFromPuzzleBordure2]');
            questionFromPuzzleBordure2.listeners['click']({pageX:185, pageY:223, preventDefault:()=>{}});
            questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();
            questionFromPuzzleBordure2 = retrieve(root, '[questionFromPuzzleBordure2]');
            questionFromPuzzleBordure2.listeners['click']({pageX:185, pageY:223, preventDefault:()=>{}});
            questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();
            let questionFromPuzzleBordure1 = retrieve(root, '[questionFromPuzzleBordure1]');
            questionFromPuzzleBordure1.listeners['click']({pageX:185, pageY:223, preventDefault:()=>{}});
            questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();

            image = retrieve(root, '[imageAlba]');
            image.listeners['mousedown']({pageX:53, pageY:411, preventDefault:()=>{}});
            imgDraged = retrieve(root, '[imgDraged]');
            imgDraged.listeners['mouseup']({pageX:522, pageY:632, preventDefault:()=>{}});
            let answerImage = retrieve(root, '[answerImage0]');
            assert(answerImage);

            image = retrieve(root, '[imageAlba]');
            image.listeners['mousedown']({pageX:53, pageY:411, preventDefault:()=>{}});
            imgDraged = retrieve(root, '[imgDraged]');
            imgDraged.listeners['mouseup']({pageX:884, pageY:644, preventDefault:()=>{}});
            answerImage = retrieve(root, '[answerImage1]');
            answerImage.listeners['mouseover']();
            let imageRedCross = retrieve(root, '[imageRedCross]');
            imageRedCross.listeners['click']();
            answerImage = retrieve(root, '[answerImage1]');
            assert(!answerImage);

            image = retrieve(root, '[imageAlba]');
            image.listeners['mousedown']({pageX:53, pageY:411, preventDefault:()=>{}});
            imgDraged = retrieve(root, '[imgDraged]');
            imgDraged.listeners['mouseup']({pageX:884, pageY:644, preventDefault:()=>{}});
            answerImage = retrieve(root, '[answerImage1]');
            assert(answerImage);

            let answerLabelCadre1 = retrieve(root, '[answerLabelCadre1]');
            answerLabelCadre1.listeners['mouseover']();
            redCross = retrieve(root, '[redCross]');
            redCross.listeners['click']();
            answerLabelCadre1 = retrieve(root, '[answerLabelCadre1]');
            assert(answerLabelCadre1);

            // answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            // answerLabelCadre0.listeners['mouseover']();
            // redCross = retrieve(root, '[redCross]');
            // redCross.listeners['click']();
            // answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            // assert(answerLabelCadre0);
            //
            // image = retrieve(root, '[imageAlba]');
            // image.listeners['mousedown']({pageX:53, pageY:411, preventDefault:()=>{}});
            // imgDraged = retrieve(root, '[imgDraged]');
            // imgDraged.listeners['mouseup']({pageX:522, pageY:632, preventDefault:()=>{}});
            // answerImage = retrieve(root, '[answerImage0]');
            // assert(answerImage);

            image = retrieve(root, '[imageAlba]');
            image.listeners['mousedown']({pageX:53, pageY:411, preventDefault:()=>{}});
            imgDraged = retrieve(root, '[imgDraged]');
            imgDraged.listeners['mouseup']({pageX:884, pageY:644, preventDefault:()=>{}});
            answerImage = retrieve(root, '[answerImage1]');
            assert(answerImage);

            let checkbox = retrieve(root, '[checkbox0]');
            checkbox.listeners['click']({pageX:339, pageY:647, preventDefault:()=>{}});

            // let addImageButton = retrieve(root, '[addImageButton]');
            // addImageButton.listeners['click']();
            // let fileExplorer = retrieve(root, '[addImageButton]');

            let saveButtonQuiz = retrieve(root, '[saveButtonQuiz]');
            saveButtonQuiz.listeners['click']();

            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            let previewButton = retrieve(root, '[previewButton]');
            previewButton.listeners['click']();
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            runtime.listeners['resize']({w:1500, h:1500});

            let returnButtonPreview = retrieve(root, '[returnButtonPreview]');
            returnButtonPreview.listeners['click']();
            runtime.advance();

            runtime.listeners['resize']({w:1500, h:1500});

            let returnButtonToFormation = retrieve(root, '[returnButtonToFormation]');
            returnButtonToFormation.listeners['click']();

            runtime.listeners['resize']({w:1500, h:1500});

            let returnButtonToFormationsManager = retrieve(root, '[returnButtonToFormationsManager]');
            returnButtonToFormationsManager.listeners['click']();

            let bigGlass = retrieve(root, '[bigGlass]');
            bigGlass.listeners['mousedown']({pageX:0, pageY:0, preventDefault:()=>{}});
            bigGlass.listeners['mouseup']({pageX:0, pageY:0, preventDefault:()=>{}});
            bigGlass.listeners['dblclick']({pageX:0, pageY:0, preventDefault:()=>{}});

            runtime.listeners['resize']({w:1500, h:1500});


            let deconnection = retrieve(root, '[deconnection]');
            deconnection.listeners['click']();

            done();


        });
    });
});

describe('connection', function(){
    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should connect someone", function (done) {
        testutils.retrieveDB("./log/dbConnection.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            runtime.listeners['resize']({w:1500, h:1500});

            let mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            let connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = '';
            connectionContentArea.listeners['blur']();
            let passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = 'aaaaaa';
            connectionContentArea.listeners['blur']();
            let connexionButton = retrieve(root, '[connexionButton]');
            connexionButton.listeners['click']();
            runtime.advance();

            mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = 'a@';
            connectionContentArea.listeners['blur']();
            passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = 'aaaaaa';
            connectionContentArea.listeners['blur']();
            connexionButton = retrieve(root, '[connexionButton]');
            connexionButton.listeners['click']();
            runtime.advance();

            mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = 'a@a.a';
            connectionContentArea.listeners['blur']();
            passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = 'aaaaaa';
            connectionContentArea.listeners['blur']();

            runtime.listeners['keydown']({keyCode:9, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:13, preventDefault:()=>{}});

            done();
        });
    });
});

describe('inscription', function(){
    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should sign up someone", function (done) {
        testutils.retrieveDB("./log/dbInscription.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let  inscriptionLink = retrieve(root, '[inscriptionLink]');
            inscriptionLink.listeners['click']();

            runtime.listeners['resize']({w:1500, h:1500});

            let lastNameField = retrieve(root, '[lastNameField]');
            lastNameField.listeners['click']();
            let inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = '';
            inscriptionContentArea.listeners['input']();
            inscriptionContentArea.value = '';
            inscriptionContentArea.listeners['blur']();
            let inscriptionErrorMessagelastNameField = retrieve(root, '[inscriptionErrorMessagelastNameField]');
            assert.equal(inscriptionErrorMessagelastNameField.text, "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés");

            lastNameField = retrieve(root, '[lastNameField]');
            lastNameField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'nom';
            inscriptionContentArea.listeners['blur']();
            inscriptionErrorMessagelastNameField = retrieve(root, '[inscriptionErrorMessagelastNameField]');
            assert(!inscriptionErrorMessagelastNameField);

            let firstNameField = retrieve(root, '[firstNameField]');
            firstNameField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = '';
            inscriptionContentArea.listeners['blur']();
            let inscriptionErrorMessagefirstNameField = retrieve(root, '[inscriptionErrorMessagefirstNameField]');
            assert.equal(inscriptionErrorMessagefirstNameField.text, "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés");

            firstNameField = retrieve(root, '[firstNameField]');
            firstNameField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'prénom';
            inscriptionContentArea.listeners['blur']();
            inscriptionErrorMessagefirstNameField = retrieve(root, '[inscriptionErrorMessagefirstNameField]');
            assert(!inscriptionErrorMessagefirstNameField);

            let mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = '';
            inscriptionContentArea.listeners['blur']();
            mailAddressField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'ra@';
            inscriptionContentArea.listeners['blur']();
            let inscriptionErrorMessagemailAddressField= retrieve(root, '[inscriptionErrorMessagemailAddressField]');
            assert.equal(inscriptionErrorMessagemailAddressField.text, "L'adresse email n'est pas valide");

            mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'test@test.test';
            inscriptionContentArea.listeners['blur']();
            inscriptionErrorMessagemailAddressField = retrieve(root, '[inscriptionErrorMessagemailAddressField]');
            assert(!inscriptionErrorMessagemailAddressField);

            let passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'aaa';
            inscriptionContentArea.listeners['blur']();
            let inscriptionErrorMessagepasswordField= retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert.equal(inscriptionErrorMessagepasswordField.text, "Le mot de passe doit contenir au minimum 6 caractères");

            passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'testtes';
            inscriptionContentArea.listeners['input']();
            inscriptionContentArea.value = 'testtest';
            inscriptionContentArea.listeners['blur']();
            inscriptionErrorMessagepasswordField = retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert(!inscriptionErrorMessagepasswordField);

            let passwordConfirmationField = retrieve(root, '[passwordConfirmationField]');
            passwordConfirmationField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'aaa';
            inscriptionContentArea.listeners['blur']();
            inscriptionErrorMessagepasswordField= retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert.equal(inscriptionErrorMessagepasswordField.text, "Le mot de passe doit contenir au minimum 6 caractères");

            passwordConfirmationField = retrieve(root, '[passwordConfirmationField]');
            passwordConfirmationField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'aaaaaa';
            inscriptionContentArea.listeners['blur']();
            inscriptionErrorMessagepasswordField = retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert.equal(inscriptionErrorMessagepasswordField.text, "La confirmation du mot de passe n'est pas valide");

            let inscriptionButton = retrieve(root, '[inscriptionButton]');
            inscriptionButton.listeners['click']();

            passwordConfirmationField = retrieve(root, '[passwordConfirmationField]');
            passwordConfirmationField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            inscriptionContentArea.value = 'testtest';
            inscriptionContentArea.listeners['blur']();
            inscriptionErrorMessagepasswordField = retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert(!inscriptionErrorMessagepasswordField);

            inscriptionButton = retrieve(root, '[inscriptionButton]');
            // inscriptionButton.listeners['click'](); //DO NOT CLICK TwinBcrypt NOT DEFINED
            // runtime.advance();


            done();
        });
    });
});

describe('Player mode', function () {

    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should go into a quiz and play it", function (done) {
        testutils.retrieveDB("./log/dbPlayQuiz.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let greekMythFormationCadre = retrieve(root, "[Mythologie grecque]");
            greekMythFormationCadre.listeners["click"]();

            let firstGame = retrieve(root, "[level0quizz1]");
            assert.equal(firstGame.text, "Le Chaos");
            firstGame.listeners["click"]({pageX:959, pageY:172, preventDefault:()=>{}});
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            let header = retrieve(root, "[headerMessage]");
            assert.equal(header.text, "Mythologie grecque - Le Chaos");

            let firstAnswer = retrieve(root, "[answer0]");
            assert.equal(firstAnswer.text, "Zeus");
            firstAnswer.listeners["click"]();

            runtime.listeners['resize']({w:1500, h:1500});

            firstAnswer = retrieve(root, "[answer0]");
            assert.equal(firstAnswer.text, "Nyx, la Nuit");
            firstAnswer.listeners["click"]();

            firstAnswer = retrieve(root, "[answer0]");
            assert.equal(firstAnswer.text, "Les Titans");
            firstAnswer.listeners["click"]();

            let fourthAnswer = retrieve(root, "[answer3]");
            assert.equal(fourthAnswer.text, "Les Cyclopes");
            fourthAnswer.listeners["click"]();

            let seventhAnswer = retrieve(root, "[answer6]");
            assert.equal(seventhAnswer.text, "Les Hecatonchires");
            seventhAnswer.listeners["click"]();

            let validateButtonQuiz = retrieve(root, "[validateButtonQuiz]");
            assert.equal(validateButtonQuiz.text, "Valider");
            validateButtonQuiz.listeners["click"]();

            fourthAnswer = retrieve(root, "[answer3]");
            assert.equal(fourthAnswer.text, "12");
            fourthAnswer.listeners["click"]();

            fourthAnswer = retrieve(root, "[answer3]");
            assert.equal(fourthAnswer.text, "Stéropès");
            fourthAnswer.listeners["click"]();

            let resetButtonQuiz = retrieve(root, "[resetButtonQuiz]");
            assert.equal(resetButtonQuiz.text, "Réinitialiser");
            resetButtonQuiz.listeners["click"]();

            validateButtonQuiz = retrieve(root, "[validateButtonQuiz]");
            assert.equal(validateButtonQuiz.text, "Valider");
            validateButtonQuiz.listeners["click"]();

            fourthAnswer = retrieve(root, "[answer3]");
            assert.equal(fourthAnswer.text, "Cronos et Rhéa");
            fourthAnswer.listeners["click"]();

            fourthAnswer = retrieve(root, "[answer3]");
            assert.equal(fourthAnswer.text, "Il les abandonna dans la nature.");
            fourthAnswer.listeners["click"]();

            runtime.listeners['resize']({w:1500, h:1500});

            let returnButtonToFormation = retrieve(root, '[returnButtonToFormation]');
            returnButtonToFormation.listeners['click']();

            let returnButtonToFormationsManager = retrieve(root, '[returnButtonToFormationsManager]');
            returnButtonToFormationsManager.listeners['click']();

            done();
        });
    })
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
