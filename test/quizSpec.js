/**
 * Created by TBE3610 on 06/04/2017.
 */

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
    runtime.listeners['keydown']({
        keyCode: 39, preventDefault: () => {
        }
    });
    runtime.listeners['keydown']({
        keyCode: 40, preventDefault: () => {
        }
    });
    runtime.listeners['keydown']({
        keyCode: 37, preventDefault: () => {
        }
    });
    runtime.listeners['keydown']({
        keyCode: 38, preventDefault: () => {
        }
    });
};

const enter = (contentArea, label) => {
    contentArea.value = label;
    contentArea.listeners["input"]();
    contentArea.value = label;
    contentArea.listeners["blur"]();
};


/**
 * @param root
 * @param nameCheckElement {string} nom de l element qu on souhaite checker la valeur : valueExpected
 * @param valueExpected la valeur qu on attend de l element : nameCheckElement, si cette la valeur est null on check si l element : nameCheckElement est bien null
 */
const testValueOnElement = (root, nameCheckElement, valueExpected) => {
    let checkElement = retrieve(root, "[" + nameCheckElement + "]");
    if (valueExpected == null) {
        assert(!checkElement);
    } else {
        assert.equal(checkElement.text, testutils.escape(valueExpected));
    }
};


/**
 *
 * @param root
 * @param nameClickElement {string} nom de l element qu on souhaite faire un click
 */
const callClickOnElement = (root, nameClickElement) => {
    let clickElement = retrieve(root, "[" + nameClickElement + "]");
    clickElement.listeners["click"]();
};


/**
 *
 * @param root
 * @param nameEnterElement
 * @param value
 */
const callEnterOnElement = (root, nameEnterElement, value) => {
    var myElement = retrieve(root, "[" + nameEnterElement + "]");
    enter(myElement, value);
};


let runtime,
    svg,
    main,
    dbListenerModule,
    dbListener;

describe('QuizManager', function(){
    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should change a quiz's name", function(done){
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function(){
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[level0quizz0]");
            assert.equal(game0.handler.messageText, "Quiz 1");
            game0.handler.parentManip.listeners['dblclick']();

            let quizLabelContent = retrieve(root, '[quizLabelContent]');
            assert(quizLabelContent.text, "Quiz 1");
            quizLabelContent.listeners["click"]();

            let quizEditionTextArea = retrieve(root, "[quizEditionTextArea]");
            enter(quizEditionTextArea, "Quiz n°1==");
            quizLabelContent = retrieve(root, "[quizLabelContent]");
            let quizLabelCadre = retrieve(root, "[quizLabelCadre]");
            let quizErrorMessage = retrieve(root, "[quizErrorMessage]");
            assert.equal(quizLabelCadre.stroke, 'rgb(255,0,0)');
            assert.equal(quizErrorMessage.text, testutils.escape(ERROR_MESSAGE_INPUT));
            assert.equal(quizLabelContent.text, testutils.escape("Quiz n°1=="));

            quizLabelContent.listeners["click"]();
            quizEditionTextArea = retrieve(root, "[quizEditionTextArea]");
            enter(quizEditionTextArea, "Quiz n°1");
            quizLabelContent = retrieve(root, "[quizLabelContent]");
            quizLabelCadre = retrieve(root, "[quizLabelCadre]");
            quizErrorMessage = retrieve(root, "[quizErrorMessage]");
            assert.equal(quizLabelCadre.stroke, 'rgb(0,0,0)');
            assert.equal(quizErrorMessage, null);
            assert.equal(quizLabelContent.text, testutils.escape("Quiz n°1"));

            let returnButton = retrieve(root, "[returnButtonToFormation]");
            returnButton.listeners["click"]();

            done();
        })
    });

    it('should fill a question', function(done){
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function(){
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[level0quizz0]");
            assert.equal(game0.handler.messageText, "Quiz 1");
            game0.handler.parentManip.listeners['dblclick']();

            let questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            let questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            enter(questionBlockTextArea, "La première question ?==");
            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            let questionBlockCadre1 = retrieve(root, '[questionBlockCadre1]');
            let questionBlockErrorMessage = retrieve(root, '[questionBlockErrorMessage]');
            assert.equal(questionBlockCadre1.stroke, 'rgb(255,0,0)');
            assert.equal(questionBlockErrorMessage.text, testutils.escape(ERROR_MESSAGE_INPUT));
            assert.equal(questionBlockTitle1.text, testutils.escape("La première question ?=="));

            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            enter(questionBlockTextArea, "La première question ?");
            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockCadre1 = retrieve(root, '[questionBlockCadre1]');

            questionBlockErrorMessage = retrieve(root, '[questionBlockErrorMessage]');
            assert.equal(questionBlockCadre1.stroke, 'rgb(0,0,0)');
            assert.equal(questionBlockErrorMessage, null);
            assert.equal(questionBlockTitle1.text, testutils.escape("La première question ?"));

            let answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelContent0.listeners['dblclick']();
            let answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            enter(answerLabelContentArea, "La première réponse ?==");
            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            let answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            let answerErrorMessage = retrieve(root, '[answerErrorMessage]');
            assert.equal(answerLabelCadre0.stroke, 'rgb(255,0,0)');
            assert.equal(answerErrorMessage.text, testutils.escape(ERROR_MESSAGE_INPUT));
            assert.equal(answerLabelContent0.text, testutils.escape("La première réponse ?=="));

            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelContent0.listeners['dblclick']();
            answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            enter(answerLabelContentArea, "La première réponse ?");
            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            answerErrorMessage = retrieve(root, '[answerErrorMessage]');
            assert.equal(answerLabelCadre0.stroke, 'rgb(0,0,0)');
            assert.equal(answerErrorMessage, null);
            assert.equal(answerLabelContent0.text, testutils.escape("La première réponse ?"));

            let emptyAnswerAddCadreanswer;
            addEmptyAnswer = (index) => {
                emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
                emptyAnswerAddCadreanswer.handler.parentManip.listeners['dblclick']();
                let answerLabelContent = retrieve(root, '[answerLabelContent' + index + ']');
                assert.equal(answerLabelContent.handler.messageText, 'Double cliquer pour modifier\net cocher si bonne réponse.');
            };

            for (let i = 1; i < 7; i++) {
                addEmptyAnswer(i);
            }

            let emptyAnswerAddCadreanswerDoesNotExistAnymore = retrieve(root, '[emptyAnswerAddCadreanswer]');
            assert(!emptyAnswerAddCadreanswerDoesNotExistAnymore);

            let answerLabelCadre7 = retrieve(root, '[answerLabelCadre7]');
            answerLabelCadre7.listeners['mouseover']();
            redCross = retrieve(root, '[redCross]');
            redCross.listeners['click']();

            answerLabelCadre7 = retrieve(root, '[answerLabelCadre7]');
            assert(!answerLabelCadre7);

            done();
        })
    });

    it('should save and preview a quiz', function(done){
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function(){
            svg.screenSize(1134, 735);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[level0quizz0]");
            game0.handler.parentManip.listeners['dblclick']();

            let questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            enter(questionBlockTextArea, "La première question ?");

            let answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelContent0.listeners['dblclick']();
            let answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            enter(answerLabelContentArea, "La première réponse ?");

            answerLabelContent1 = retrieve(root, '[answerLabelContent1]');
            answerLabelContent1.listeners['dblclick']();
            answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            enter(answerLabelContentArea, "La deuxième réponse ?");

            let checkBox0 = retrieve(root, "[checkbox0]");
            checkBox0.listeners['click']({
                pageX: 208, pageY: 514
            });

            let saveButtonQuiz = retrieve(root, "[saveButtonQuiz]");
            saveButtonQuiz.listeners['click']()
            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            let quizInfoMessage = retrieve(root, "[quizInfoMessage]");
            assert.equal(quizInfoMessage.text, testutils.escape("Les modifications ont bien été enregistrées"))

            let previewButton = retrieve(root, '[previewButton]');
            previewButton.listeners['click']();

            runtime.listeners['resize']({w: 1500, h: 1500});

            let returnButtonPreview = retrieve(root, "[returnButtonPreview]");
            returnButtonPreview.listeners["click"]();

            done();
        })
    })

    it('should toggle single/multiple answers', function(done){
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function(){
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[level0quizz0]");
            assert.equal(game0.handler.messageText, "Quiz 1");
            game0.handler.parentManip.listeners['dblclick']();

            let toggleButtonCadreMultiple = retrieve(root, '[toggleButtonCadremultiples]');
            let toggleButtonCadreUnique = retrieve(root, '[toggleButtonCadreunique]');
            assert(toggleButtonCadreMultiple.fill, 'rgb(0,0,0)');
            assert(toggleButtonCadreUnique.fill, 'rgb(25,25,112)');
            toggleButtonCadreMultiple.listeners['click']({
                pageX: 1306, pageY: 365, preventDefault: () => {
                }
            });
            assert(toggleButtonCadreUnique.fill, 'rgb(0,0,0)');
            assert(toggleButtonCadreMultiple.fill, 'rgb(25,25,112)');
            toggleButtonCadreUnique = retrieve(root, '[toggleButtonCadreunique]');
            toggleButtonCadreUnique.listeners['click']({
                pageX: 1022, pageY: 365, preventDefault: () => {
                }
            });

            done();
        })
    })

    it('should add an explanation', function(done){
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function(){
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[level0quizz0]");
            assert.equal(game0.handler.messageText, "Quiz 1");
            game0.handler.parentManip.listeners['dblclick']();

            let explanationCadre0 = retrieve(root, '[explanationSquare0]');
            explanationCadre0.listeners['click']();
            let textExplanation = retrieve(root, '[textExplanation]');
            assert(textExplanation.text, 'Cliquer ici pour ajouter du texte');
            let explanationPanel = retrieve(root, '[explanationPanel]');
            explanationPanel.listeners['click']();
            let explanationContentArea = retrieve(root, '[explanationContentArea]');
            enter(explanationContentArea, "Ceci est la première explication");
            textExplanation = retrieve(root, '[textExplanation]');
            assert(textExplanation.text, "Ceci est la première explication");

            //TODO check explanation in preview mode

            done();
        })
    })

    it.skip('should enter and leave a bd', function (done) {
        let returnButtonFromBdToFormation = retrieve(root, '[returnButtonFromBdToFormation]');
        returnButtonFromBdToFormation.listeners['click']();
    })
})