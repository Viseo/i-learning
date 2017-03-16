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

let runtime,
    svg,
    main,
    dbListenerModule,
    dbListener;

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
        testutils.retrieveDB("./log/dbPlayQuiz2.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let toggleFormationsText = retrieve(root, '[toggleFormationsText]');
            toggleFormationsText.listeners['click']();
            toggleFormationsText.listeners['click']();

            let greekMythFormationCadre = retrieve(root, "[Mythe]");
            greekMythFormationCadre.listeners["click"]();

            let firstGame = retrieve(root, "[level0quizz0]");
            assert.equal(firstGame.handler.messageText, "Fa");

            firstGame.listeners["click"]({pageX:959, pageY:172, preventDefault:()=>{}});
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            let header = retrieve(root, "[headerMessage]");
            assert.equal(header.text, testutils.escape("Mythe - Fa"));

            let answer;
            const playerAnswers = (index, label) => {
                answer = retrieve(root, "[answer" + index + "]");
                assert.equal(answer.text, label);
                answer.listeners["click"]();
            };

            playerAnswers(0, "Oui");
            runtime.listeners['resize']({w:1500, h:1500});

            playerAnswers(0, "Conte");
            playerAnswers(1, "Legende");

            let resetButtonQuiz = retrieve(root, "[resetButtonQuiz]");
            assert.equal(resetButtonQuiz.text, "Réinitialiser");
            resetButtonQuiz.listeners["click"]();

            playerAnswers(0, "Conte");
            playerAnswers(1, "Legende");

            let validateButtonQuiz = retrieve(root, "[validateButtonQuiz]");
            assert.equal(validateButtonQuiz.text, "Valider");
            validateButtonQuiz.listeners["click"]();


            let expButton = retrieve(root, '[expButton]');
            expButton.listeners['click']();
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            /* todo a faire quand ca marche
            let explanationIconSquare = retrieve(root, '[explanationIconSquare]');
            explanationIconSquare.listeners['click']();
            let circleCloseExplanation = retrieve(root, '[circleCloseExplanation]');
            circleCloseExplanation.listeners['click']();*/

            /* TODO LATER:
             let iconTextToSpeech = retrieve(root, '[iconTextToSpeech]');
             iconTextToSpeech.listeners['click']();
             explanationIconSquare = retrieve(root, '[explanationIconSquare]');
             explanationIconSquare.listeners['click']();
             iconTextToSpeech.listeners['click']();
             */



           /* let answerElement0 = retrieve(root, '[answerElement0]');
            answerElement0.listeners['click']();*/

            let rightChevron = retrieve(root, '[rightChevron]');
            rightChevron.listeners['click']();

            leftChevron = retrieve(root, '[leftChevron]');
            assert(leftChevron.listeners['click']);

            /*
            let retrieveClickChevron = () => {
                rightChevron = retrieve(root, '[rightChevron]');
                rightChevron.listeners['click']();
            };


            for (let i = 0; i<5; i++){
                retrieveClickChevron();
            }*/

            rightChevron = retrieve(root, '[rightChevron]');
            assert(!rightChevron.listeners['click']);
            leftChevron = retrieve(root, '[leftChevron]');
            leftChevron.listeners['click']();

            let returnButtonToResults = retrieve(root, '[returnButtonToResults]');
            returnButtonToResults.listeners['click']();

            let returnButtonToFormation = retrieve(root, '[returnButtonToFormation]');
            returnButtonToFormation.listeners['click']();

            let returnButtonToFormationsManager = retrieve(root, '[returnButtonToFormationsManager]');
            returnButtonToFormationsManager.listeners['click']();

            done();
        });
    })
});