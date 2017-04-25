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

const enterTextarea = (root, id, text) => {
    let answerLabelContent = retrieve(root, `[${id}]`);
    answerLabelContent.handler.parentObject.message(text);
    answerLabelContent.handler.parentObject.onInputFct(text);
    answerLabelContent = retrieve(root, `[${id}]`)
    assert.equal(answerLabelContent.text, testutils.escape(text));
}

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
    enhance,
    dbListenerModule,
    dbListener;

describe('QuizManager', function () {
    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should change a quiz's name", function (done) {
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[quizz0]");
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

    it('should fill a question', function (done) {
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[quizz0]");
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
            answerLabelContent0.handler.textMessage = "la première réponse ?";

            let emptyAnswerAddCadreanswer;
            addEmptyAnswer = (index) => {
                emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
                emptyAnswerAddCadreanswer.handler.parentManip.listeners['dblclick']();
                let answerLabelContent = retrieve(root, '[answerLabelContent' + index + ']');
                assert.equal(answerLabelContent.handler.messageText, 'Cliquer pour modifier et cocher si bonne réponse.');
            };

            for (let i = 1; i < 7; i++) {
                addEmptyAnswer(i);
            }

            let emptyAnswerAddCadreanswerDoesNotExistAnymore = retrieve(root, '[emptyAnswerAddCadreanswer]');
            assert(!emptyAnswerAddCadreanswerDoesNotExistAnymore);

            let answerLabelCadre7 = retrieve(root, '[answerLabelCadre7]');
            answerLabelCadre7.handler.parent.parentManip.listeners['mouseenter']();
            redCross = retrieve(root, '[redCross]');
            redCross.listeners['mouseup']();

            answerLabelCadre7 = retrieve(root, '[answerLabelCadre7]');
            assert(!answerLabelCadre7);

            done();
        })
    });

    it('should save and preview a quiz', function (done) {
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function () {
            svg.screenSize(1134, 735);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[quizz0]");
            game0.handler.parentManip.listeners['dblclick']();

            let questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            enter(questionBlockTextArea, "La première question ?");

            enterTextarea(root, "answerLabelContent0", "La première réponse ?");
            enterTextarea(root, "answerLabelContent1", "La deuxième réponse ?");

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

    it('should toggle single/multiple answers', function (done) {
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[quizz0]");
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

    it('should add an explanation', function (done) {
        testutils.retrieveDB("./log/dbQuiz1.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let game0 = retrieve(root, "[quizz0]");
            game0.handler.parentManip.listeners['dblclick']();

            let explanationCadre0 = retrieve(root, '[explanationSquare0]');
            explanationCadre0.listeners['click']();
            let textExplanation = retrieve(root, '[textExplanation]');
            assert(textExplanation.text, 'Cliquer ici pour ajouter du texte');
            enterTextarea(root, "textExplanation", "Ceci est la première explication");

            //TODO check explanation in preview mode

            done();
        })
    })

    it.skip('should enter and leave a bd', function (done) {
        let returnButtonFromBdToFormation = retrieve(root, '[returnButtonFromBdToFormation]');
        returnButtonFromBdToFormation.listeners['click']();
    })

    it('should toggle arrows and quizz', function (done) {
        testutils.retrieveDB("./log/dbQuiz2.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();
            let arrowModeButtonCadre = retrieve(root, '[arrowModeButtonCadre]');
            arrowModeButtonCadre.listeners['click']();
            let arrowModeArrow = retrieve(root, '[arrowModeArrow]');
            assert.equal(arrowModeArrow.fill, 'rgb(25,122,230)');
            let titleGame0 = retrieve(root, "[titlelevel0quizz0]");
            assert.equal(titleGame0.handler.originalText, "Quiz 1");
            let titleGame1 = retrieve(root, "[titlelevel1quizz1]");
            assert.equal(titleGame1.handler.originalText, "Quiz 2");
            let titleGame2 = retrieve(root, "[titlelevel1quizz2]");
            assert.equal(titleGame2.handler.originalText, "Quiz 3");
            let game0pos = titleGame0.handler.parent.globalPoint(0, 0);
            let game1pos = titleGame1.handler.parent.globalPoint(0, 0);
            let game2pos = titleGame2.handler.parent.globalPoint(0, 0);
            let glass = retrieve(root, '[theGlass]');
            glass.listeners['mousedown']({                  // on crée les liens entre game0 et 1 et game0 et 2
                pageX: game0pos.x, pageY: game0pos.y, preventDefault: () => {
                }
            });
            glass.listeners['mouseup']({
                pageX: game1pos.x, pageY: game1pos.y, preventDefault: () => {
                }
            });
            glass.listeners['mousedown']({
                pageX: game0pos.x, pageY: game0pos.y, preventDefault: () => {
                }
            });
            glass.listeners['mouseup']({
                pageX: game2pos.x, pageY: game2pos.y, preventDefault: () => {
                }
            });
            let arrow01 = retrieve(root, '[quizz0quizz1]');
            let arrow02 = retrieve(root, '[quizz0quizz2]');
            arrow01.listeners['click']();
            assert.equal(arrow01.fill, 'rgb(25,122,230)');
            arrow01.listeners['click']();
            assert.equal(arrow01.fill, 'rgb(0,0,0)');
            arrow01.listeners['click']();
            assert.equal(arrow01.fill, 'rgb(25,122,230)');
            arrow02.listeners['click']();
            assert.equal(arrow01.fill, 'rgb(0,0,0)');
            assert.equal(arrow02.fill, 'rgb(25,122,230)');
            arrowModeButtonCadre.listeners['click']();
            arrowModeArrow = retrieve(root, '[arrowModeArrow]');
            assert.equal(arrowModeArrow.fill, 'rgb(0,0,0)');
            let panelBack = retrieve(root, "[panelBack]");
            panelBack.listeners['click']({
                pageX: 300, pageY: 300, preventDefault: () => {
                }
            });
            let game0Hexagon = retrieve(root, "[hexBorder0quizz0]");
            let game0 = retrieve(root, "[quizz0]");
            game0.handler.parentManip.listeners['mousedown']({
                pageX: titleGame0.handler.parentManip.x, pageY: titleGame0.handler.parentManip.y, preventDefault: () => {
                }});
            game0.handler.parentManip.listeners['mouseup']({
                pageX: titleGame0.handler.parentManip.x, pageY: titleGame0.handler.parentManip.y, preventDefault: () => {
                }});
            assert.equal(game0Hexagon.stroke, 'rgb(25,25,112)'); // le jeu game0 est sélectionné
            game0.handler.parentManip.listeners['mousedown']({
                pageX: titleGame0.handler.parentManip.x, pageY: titleGame0.handler.parentManip.y, preventDefault: () => {
                }});
            game0.handler.parentManip.listeners['mouseup']({
                pageX: titleGame0.handler.parentManip.x, pageY: titleGame0.handler.parentManip.y, preventDefault: () => {
                }});
            assert.equal(game0Hexagon.stroke, 'rgb(125,122,117)'); // le jeu game0 est désélectionné
            done();
        });
    });
})