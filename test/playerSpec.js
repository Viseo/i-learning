const
    assert = require('assert'),
    TwinBcrypt = require('twin-bcrypt'),

    testutils = require('../lib/testutils'),
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require('../lib/svghandler').SVG,
    inspect = testutils.inspect,
    retrieve = testutils.retrieve,
    checkScenario = testutils.checkScenario,
    ERROR_MESSAGE_INPUT = 'Seuls les caractères alphanumériques, avec accent et "-,\',.;?!°© sont permis';


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

const testKeyDownArrow = (runtime) => {
    runtime.listeners['keydown']({keyCode:39, preventDefault:()=>{}});
    runtime.listeners['keydown']({keyCode:40, preventDefault:()=>{}});
    runtime.listeners['keydown']({keyCode:37, preventDefault:()=>{}});
    runtime.listeners['keydown']({keyCode:38, preventDefault:()=>{}});
};

const enter = (contentArea, label) => {
    contentArea.value = label;
    contentArea.listeners["input"]();
    contentArea.value = label;
    contentArea.listeners["blur"]();
};

const filterFormations = (root) => {        // "faux test" car dépend de la réponse de la base de données
    let doneIcon = retrieve(root,'[doneIcon]');
    let inProgressIcon = retrieve(root,'[inProgressIcon]');
    let unDoneIcon = retrieve(root,'[unDoneIcon]');
    doneIcon.listeners['click']();
    doneIcon.listeners['click']();

    inProgressIcon.listeners['click']();
    inProgressIcon.listeners['click']();

    unDoneIcon.listeners['click']();
    unDoneIcon.listeners['click']();
}

let enhance,
    runtime,
    svg,
    main,
    dbListenerModule,
    dbListener;

describe('Player mode', function () {

    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should finish a quiz with one question only", function (done) {
        testutils.retrieveDB("./log/playerSpecTest.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor('content');
            filterFormations(root);                                 // test le filtre des formations publiées pour le collaborateur
            let formationCadre = retrieve(root,'[TestPlayerSpec]')  // mais pas de test pour vérifier que les formations affichées correspondent bien au filtre
            formationCadre.handler.parentManip.listeners['click']();
            let firstGameTitle = retrieve(root, "[titlelevel0quizz0]");
            assert.equal(firstGameTitle.handler.originalText,'Un test de réponse unique');
            let firstGame = retrieve(root, "[quizz0]");
            firstGame.listeners['click']({pageX:959, pageY:172, preventDefault:()=>{}});
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let answer;
            const playerAnswers = (index, label) => {
                answer = retrieve(root, "[answerElementContent" + index + "]");     // DMA3622 : changement du id "answer" vers answerElementContent
                assert.equal(answer.text, testutils.escape(label));
                answer.handler.parentManip.listeners['click']();
            };
            playerAnswers(0, 'Une réponse');
            let scoreManipulator = retrieve(root,'[scoreManipulator]');
            let endQuizFinalMessage = scoreManipulator.children["0"].children["0"].children["0"].children["1"];
            assert.equal(endQuizFinalMessage.text, testutils.escape('Impressionant ! Vous avez répondu à 1 questions, et toutes sont justes !'));
            runtime.listeners['resize']({w:1500, h:1500});
            // page résultat final => on souhaite afficher les explications
            let expButton = retrieve(root,'[expButton]');
            expButton.listeners['click']();
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let questionLabel = retrieve(root,'[questionFromPuzzleBordure1]');
            let questionLabelText = questionLabel.handler.parentManip.components[2];        // tester si la question affichée correspond bien à "Une question"
            assert.equal(questionLabelText.messageText, 'Une question');                    // nom de la question du quiz d'indice level0quizz0
            let answerElementContent, answerElementCadre;
            const playerAnswersElements = (index, label) => {
                answerElementCadre = retrieve(root, "[answerElementCadre" + index + "]");
                assert.equal(answerElementCadre.parent.children["1"].text, testutils.escape(label));
                answerElementContent = retrieve(root, "[answerElementContent" + index + "]");
                if ((index+1)%2 == 0) {
                    answerElementContent.listeners['click']();
                } else {
                    answerElementCadre.listeners['click']();
                }
            };
            playerAnswersElements(0, 'Une réponse');
            /** TODO in progress by CSI **/
            // let explanationIconSquare = retrieve(root, '[explanationIconSquare]');
            // explanationIconSquare.listeners['click']();
            let explanationText = retrieve(root, '[textExplanation]');
            assert.equal(explanationText.text, testutils.escape('Une explication conne'));
            let circleCloseExplanation = retrieve(root, '[closeButtonManipulator]');
            circleCloseExplanation.listeners['click']();
            playerAnswersElements(1, 'Plusieurs réponses');
            explanationText = retrieve(root, '[textExplanation]');
            assert.equal(explanationText.text, testutils.escape('Pas d\'explication'));
            let returnButtonToResults = retrieve(root, '[returnButtonToResults]');
            returnButtonToResults.listeners['click']();
            let returnButtonToFormation = retrieve(root, '[returnButtonToFormation]');
            returnButtonToFormation.listeners['click']();
            let returnButtonToFormationsManager = retrieve(root, '[returnButtonToFormationsManager]');
            returnButtonToFormationsManager.listeners['click']();
            done();
        });
    });
});