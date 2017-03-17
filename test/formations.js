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


/**
 * @param root
 * @param nameCheckElement {string} nom de l element qu on souhaite checker la valeur : valueExpected
 * @param valueExpected la valeur qu on attend de l element : nameCheckElement, si cette la valeur est null on check si l element : nameCheckElement est bien null
 */
const testValueOnElement = (root, nameCheckElement, valueExpected) => {
    let checkElement = retrieve(root, "[" + nameCheckElement +"]");
    if(valueExpected == null){
        assert(!checkElement);
    }else{
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

describe('formationsManager', function () {

    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it ("should not add a new formation", function(done) {
        testutils.retrieveDB("./log/dbAdminFormationsManager.json", dbListener, function () {
            svg.screenSize(1920,947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content") ;

            testKeyDownArrow(runtime);

            runtime.advance();

            testValueOnElement(root, "formationManagerLabelContent", "Ajouter une f…");

            callClickOnElement(root, "addFormationButton");
            testValueOnElement(root, "formationErrorMessage", "Veuillez rentrer un nom de formation valide");

            runtime.advance();

            callClickOnElement(root, "formationManagerLabelContent");
            callEnterOnElement(root, "formationLabelContentArea", "Test[");
            testValueOnElement(root, "formationInputErrorMessage", "Veuillez rentrer un nom de formation valide");

            callClickOnElement(root, "formationManagerLabelContent");
            callEnterOnElement(root, "formationLabelContentArea", "MaFormation");
            testValueOnElement(root, "formationInputErrorMessage", null);

            callClickOnElement(root, "addFormationButton");
            testValueOnElement(root, "formationErrorMessage", null);

            callClickOnElement(root, "formationManagerLabelContent");
            callEnterOnElement(root, "formationLabelContentArea", "MaFormation");
            testValueOnElement(root, "formationInputErrorMessage", null);

            callClickOnElement(root, "addFormationButton");
            testValueOnElement(root, "formationErrorMessage", "Cette formation existe déjà");

            done();
        });
    });

    it("should add a formation", function(done){
        testutils.retrieveDB("./log/dbNewQuiz.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            testKeyDownArrow(runtime);

            runtime.advance();

            let formationManagerLabelContent = retrieve(root, "[formationManagerLabelContent]");
            formationManagerLabelContent.listeners["click"]();
            let formationLabelContentArea2 = retrieve(root, "[formationLabelContentArea]");
            enter(formationLabelContentArea2, "maFormation");
            formationManagerLabelContent = retrieve(root, "[formationManagerLabelContent]");
            addFormationButton = retrieve(root, "[addFormationButton]");
            addFormationButton.listeners["click"]();

            //let addFormationCadre = retrieve(root, "[addFormationCadre]");
            //addFormationCadre.listeners["click"]();

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.listeners["click"]();

            let publicationFormationButtonCadre = retrieve(root, "[publicationFormationButtonCadre]");
            publicationFormationButtonCadre.listeners["click"]();
            let errorMessagePublication = retrieve(root, "[errorMessagePublication]");
            assert.equal(errorMessagePublication.text,
                testutils.escape("Veuillez ajouter au moins un jeu à votre formation."));

            let gameQuiz = retrieve(root, "[gameQuiz]");
            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            let draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({pageX:165, pageY:300, preventDefault:()=>{}});
            let miniatureSelected = retrieve(root, "[miniatureSelected]");
            assert.equal(miniatureSelected.stroke, 'rgb(25,25,112)');

            let panelBack = retrieve(root, "[panelBack]");
            panelBack.listeners['click']({pageX:300, pageY:300, preventDefault:()=>{}});
            let game0 = retrieve(root, "[level0quizz0]");
            assert.equal(game0.handler.messageText, "Quiz\n1");

            publicationFormationButtonCadre.listeners["click"]();
            //assert.equal(errorMessagePublication.text, testutils.escape("Vous devez remplir le nom de la formation."));
            let formationLabelContent = retrieve(root, "[formationLabelContent]");

            formationLabelContent.listeners["dblclick"]();
            let formationLabelContentArea = retrieve(root, "[formationLabelContentArea]");
            enter(formationLabelContentArea, "La première formation ==");
            formationLabelContent = retrieve(root, "[formationLabelContent]");
            assert.equal(formationLabelContent.text, testutils.escape("La première formation =="));

            formationLabelContent.listeners["dblclick"]();
            formationLabelContentArea = retrieve(root, "[formationLabelContentArea]");
            enter(formationLabelContentArea, "La première formation");
            formationLabelContent = retrieve(root, "[formationLabelContent]");
            assert.equal(formationLabelContent.text, testutils.escape("La première formation"));

            const dragQuiz = (pointX, pointY) => {
                gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
                draggedGameCadre = retrieve(root, "[draggedGameCadre]");
                draggedGameCadre.listeners["mouseup"]({pageX:165, pageY:300, preventDefault:()=>{}});
                draggedGameCadre.listeners["click"]();
                pointX && pointY && panelBack.listeners['mouseup']({pageX:pointX, pageY:pointY, preventDefault:()=>{}});

            };

            dragQuiz();
            runtime.listeners['keydown']({keyCode:27, preventDefault:()=>{}});

            dragQuiz(300, 300);
            let game1 = retrieve(root, "[level1quizz1]");
            assert.equal(game1.text, "Quiz 2");
            let miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 2);

            dragQuiz(300, 300);
            let game2 = retrieve(root, "[level1quizz2]");
            assert.equal(game2.text, "Quiz 3");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 3);

            dragQuiz(300, 300);
            let game3 = retrieve(root, "[level1quizz3]");
            assert.equal(game3.text, "Quiz 4");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 4);

            dragQuiz();
            gameQuiz.listeners["mousedown"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({pageX:165, pageY:300, preventDefault:()=>{}});
            draggedGameCadre.listeners["click"]();

            dragQuiz();
            let bdGame = retrieve(root, "[gameBd]");
            bdGame.listeners['mousedown']({pageX:165, pageY:460, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({pageX:165, pageY:460, preventDefault:()=>{}});
            draggedGameCadre.listeners["click"]();

            let arrowModeButtonCadre = retrieve(root, '[arrowModeButtonCadre]');
            arrowModeButtonCadre.listeners['click']();
            let arrowModeArrow = retrieve(root, '[arrowModeArrow]');
            assert.equal(arrowModeArrow.fill, 'rgb(25,122,230)');

            let glass = retrieve(root, '[theGlass]');
            glass.listeners['mousedown']({pageX:1108, pageY:211, preventDefault:()=>{}});
            glass.listeners['mouseup']({pageX:1108, pageY:360, preventDefault:()=>{}});
            glass.listeners['mousedown']({pageX:1108, pageY:211, preventDefault:()=>{}});
            glass.listeners['mouseup']({pageX:949, pageY:360, preventDefault:()=>{}});
            glass.listeners['mousedown']({pageX:1108, pageY:360, preventDefault:()=>{}});
            glass.listeners['mouseup']({pageX:1108, pageY:211, preventDefault:()=>{}});
            glass.listeners['mousedown']({pageX:1108, pageY:211, preventDefault:()=>{}});
            glass.listeners['mouseup']({pageX:1108, pageY:360, preventDefault:()=>{}});
            let arrow01 = retrieve(root, '[quizz0quizz1]');
            let arrow02 = retrieve(root, '[quizz0quizz2]');
            let arrow03 = retrieve(root, '[quizz0quizz3]');
            let arrow20 = retrieve(root, '[quizz2quizz0]');
            assert(arrow02);
            assert(!arrow01);
            assert(arrow03);
            assert(!arrow20);

            runtime.listeners['keydown']({keyCode:27, preventDefault:()=>{}});


            game3.listeners['mousedown']({pageX:949, pageY:360, preventDefault:()=>{}});
            game3.listeners['mouseup']({pageX:949, pageY:360, preventDefault:()=>{}});
            arrow02.listeners['click']();
            arrow03.listeners['click']();
            runtime.listeners['keydown']({keyCode:46, preventDefault:()=>{}});

            arrow02.listeners['click']();
            arrow02.listeners['click']();
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

            dragQuiz();
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

            dragQuiz(1885, 300);
            let game5 = retrieve(root, "[level1quizz5]");
            assert.equal(game5.text, "Quiz 6");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            for (let i = 0 ; i < 8 ; i++){
                dragQuiz(300, 300);
            }
            dragQuiz(1142, 791);
            dragQuiz(1885, 791);
            let game15 = retrieve(root, "[level3quizz15]");

            game15.listeners['mousedown']({pageX:500, pageY:674, preventDefault:()=>{}});
            game15.listeners['mouseup']({pageX:1640, pageY:80, preventDefault:()=>{}});

            game15.listeners['mousedown']({pageX:500, pageY:674, preventDefault:()=>{}});
            game15.listeners['mouseup']({pageX:1176, pageY:349, preventDefault:()=>{}});

            game15.listeners['mousedown']({pageX:1176, pageY:349, preventDefault:()=>{}});
            game15.listeners['mouseup']({pageX:500, pageY:674, preventDefault:()=>{}});

            dragQuiz();
            panelBack.listeners['mouseup']({pageX:1142, pageY:791, preventDefault:()=>{}});
            let game16 = retrieve(root, "[level4quizz16]");

            game16.listeners['mousedown']({pageX:500, pageY:791, preventDefault:()=>{}});
            game16.listeners['mouseup']({pageX:500, pageY:791, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:46, preventDefault:()=>{}});

            bdGame = retrieve(root, "[gameBd]");
            bdGame.listeners["mousedown"]({pageX:165, pageY:488, preventDefault:()=>{}});
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({pageX:500, pageY:791, preventDefault:()=>{}});
            let bd1 = retrieve(root, "[level4bd0]");

            bd1.listeners['mousedown']({pageX:500, pageY:791, preventDefault:()=>{}});
            bd1.listeners['mouseup']({pageX:500, pageY:500, preventDefault:()=>{}});

            bd1.listeners['mousedown']({pageX:500, pageY:500, preventDefault:()=>{}});
            bd1.listeners['mouseup']({pageX:500, pageY:791, preventDefault:()=>{}});

            bd1.listeners['dblclick']();
            let returnButtonFromBdToFormation = retrieve(root, '[returnButtonFromBdToFormation]');
            returnButtonFromBdToFormation.listeners['click']();

            testKeyDownArrow(runtime);

            runtime.advance();
            runtime.advance();

            let bigGlass = retrieve(root, '[bigGlass]');
            bigGlass.listeners['mousemove']({pageX:455, pageY:486, preventDefault:()=>{}});
            bigGlass.listeners['mouseup']({pageX:455, pageY:486, preventDefault:()=>{}});
            bigGlass.listeners['dblclick']({pageX:455, pageY:486, preventDefault:()=>{}});
            bigGlass.listeners['mouseout']();
            bigGlass.listeners['mousemove']({pageX:514, pageY:486, preventDefault:()=>{}});
            bigGlass.listeners['mouseout']();

            game0.listeners['dblclick']({pageX:1104, pageY:212, preventDefault:()=>{}});
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let quizLabelContent = retrieve(root, '[quizLabelContent]');
            assert(quizLabelContent.text, "Quiz 1");

            quizLabelContent.listeners["dblclick"]();
            let quizEditionTextArea = retrieve(root, "[quizEditionTextArea]");
            enter(quizEditionTextArea, "Quiz n°1==");
            quizLabelContent = retrieve(root, "[quizLabelContent]");
            let quizLabelCadre = retrieve(root, "[quizLabelCadre]");
            let quizErrorMessage = retrieve(root, "[quizErrorMessage]");
            assert.equal(quizLabelCadre.stroke, 'rgb(255,0,0)');
            assert.equal(quizErrorMessage.text, ERROR_MESSAGE_INPUT);
            assert.equal(quizLabelContent.text, "Quiz n°1==");

            quizLabelContent.listeners["dblclick"]();
            quizEditionTextArea = retrieve(root, "[quizEditionTextArea]");
            enter(quizEditionTextArea, "Quiz n°1");
            quizLabelContent = retrieve(root, "[quizLabelContent]");
            quizLabelCadre = retrieve(root, "[quizLabelCadre]");
            quizErrorMessage = retrieve(root, "[quizErrorMessage]");
            assert.equal(quizLabelCadre.stroke, 'none');
            assert.equal(quizErrorMessage, null);
            assert.equal(quizLabelContent.text, "Quiz n°1");

            let questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            let questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            enter(questionBlockTextArea, "La première question ?==");
            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            let questionBlockCadre1 = retrieve(root, '[questionBlockCadre1]');
            let questionBlockErrorMessage = retrieve(root, '[questionBlockErrorMessage]');
            assert.equal(questionBlockCadre1.stroke, 'rgb(255,0,0)');
            assert.equal(questionBlockErrorMessage.text, ERROR_MESSAGE_INPUT);
            assert.equal(questionBlockTitle1.text, "La première question ?==");

            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockTitle1.listeners['dblclick']();
            questionBlockTextArea = retrieve(root, '[questionBlockTextArea]');
            enter(questionBlockTextArea, "La première question ?");
            questionBlockTitle1 = retrieve(root, '[questionBlockTitle1]');
            questionBlockCadre1 = retrieve(root, '[questionBlockCadre1]');

            questionBlockErrorMessage = retrieve(root, '[questionBlockErrorMessage]');
            assert.equal(questionBlockCadre1.stroke, 'rgb(0,0,0)');
            assert.equal(questionBlockErrorMessage, null);
            assert.equal(questionBlockTitle1.text, "La première question ?");

            let answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelContent0.listeners['dblclick']();
            let answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            enter(answerLabelContentArea, "La première réponse ?==");
            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            let answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            let answerErrorMessage = retrieve(root, '[answerErrorMessage]');
            assert.equal(answerLabelCadre0.stroke, 'rgb(255,0,0)');
            assert.equal(answerErrorMessage.text, ERROR_MESSAGE_INPUT);
            assert.equal(answerLabelContent0.text, "La première réponse ?==");

            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelContent0.listeners['dblclick']();
            answerLabelContentArea = retrieve(root, '[answerLabelContentArea]');
            enter(answerLabelContentArea, "La première réponse ?");
            answerLabelContent0 = retrieve(root, '[answerLabelContent0]');
            answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            answerErrorMessage = retrieve(root, '[answerErrorMessage]');
            assert.equal(answerLabelCadre0.stroke, 'rgb(0,0,0)');
            assert.equal(answerErrorMessage, null);
            assert.equal(answerLabelContent0.text, "La première réponse ?");

            let emptyAnswerAddCadreanswer;
            addEmptyAnswer = (index) => {
                emptyAnswerAddCadreanswer = retrieve(root, '[emptyAnswerAddCadreanswer]');
                emptyAnswerAddCadreanswer.listeners['dblclick']();
                let answerLabelContent = retrieve(root, '[answerLabelContent' + index + ']');
                assert.equal(answerLabelContent.text, 'Double cliquer pour modifier et cocher si bonne réponse.');
            };

            for (let i = 1 ; i<7 ; i++){
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

            let questionFromPuzzleBordure1 = retrieve(root, '[questionFromPuzzleBordure1]');
            questionFromPuzzleBordure1.listeners['click']({pageX:326, pageY:156, preventDefault:()=>{}});
            let questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();

            let emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            for (let i =0; i<5; i++){
                emptyAnswerAddCadrequestion.listeners['dblclick']();
                emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            }

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
            toggleButtonCadreUnique = retrieve(root, '[toggleButtonCadreunique]');
            toggleButtonCadreUnique.listeners['click']({pageX:1022, pageY:365, preventDefault:()=>{}});


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

            let image;
            const dragImage = (pointX, pointY) => {
                image = retrieve(root, '[imageAlba]');
                image.listeners['mousedown']({pageX:53, pageY:411, preventDefault:()=>{}});
                let imgDraged = retrieve(root, '[imgDraged]');
                imgDraged.listeners['mouseup']({pageX:pointX, pageY:pointY, preventDefault:()=>{}});
            };
            dragImage(397, 677);
            let explanationImage = retrieve(root, '[imageExplanation]');
            assert(explanationImage);

            let libraryVideos = retrieve(root, '[libraryVidéos]');
            libraryVideos.listeners['click']();
            let video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
            video.listeners['mousedown']({pageX:39, pageY:409, preventDefault:()=>{}});
            let videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({pageX:540, pageY:677, preventDefault:()=>{}});
            let glassVideo = retrieve(root, '[glassWIN_20160817_09_17_16_Pro]');
            glassVideo.listeners['mouseover']();
            glassVideo.listeners['mouseout']();
            glassVideo.listeners['mouseover']();
            let videoRedCross = retrieve(root, '[videoRedCross]');
            videoRedCross.listeners['click']();

            let libraryImages = retrieve(root, '[libraryImages]');
            libraryImages.listeners['click']();

            runtime.listeners['keydown']({keyCode:27, preventDefault:()=>{}});

            explanationCadre0 = retrieve(root, '[explanationSquare0]');
            explanationCadre0.listeners['click']();

            let circleCloseExplanation = retrieve(root, '[circleCloseExplanation]');
            circleCloseExplanation.listeners['click']();
            textExplanation = retrieve(root, '[textExplanation]');
            assert(!textExplanation);

            const dragVideo = (pointX, pointY) => {
                video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
                video.listeners['mousedown']({pageX:39, pageY:409, preventDefault:()=>{}});
                videoDragged = retrieve(root, '[videoDragged]');
                video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
                video.listeners['mousedown']({pageX:39, pageY:409, preventDefault:()=>{}});
                videoDragged.listeners['mouseup']({pageX:pointX, pageY:pointY, preventDefault:()=>{}});
                return retrieve(root, '[glassWIN_20160817_09_17_16_Pro]');
            };

            libraryVideos = retrieve(root, '[libraryVidéos]');
            libraryVideos.listeners['click']();
            glassVideo = dragVideo(417, 594);
            glassVideo.listeners['mouseover']();
            videoRedCross = retrieve(root, '[videoRedCross]');
            videoRedCross.listeners['click']();

            glassVideo = dragVideo(450, 450);
            glassVideo.listeners['mouseover']();
            videoRedCross = retrieve(root, '[videoRedCross]');
            videoRedCross.listeners['click']();

            libraryImages = retrieve(root, '[libraryImages]');
            libraryImages.listeners['click']();

            dragImage(830, 87);
            dragImage(425, 438);
            let questionImage = retrieve(root, '[questionImage6]');
            assert(questionImage);

            let questionFromPuzzleBordure2;
            for (let i = 0 ; i < 4 ; i++){
                questionFromPuzzleBordure2= retrieve(root, '[questionFromPuzzleBordure2]');
                questionFromPuzzleBordure2.listeners['click']({pageX:522, pageY:223, preventDefault:()=>{}});
                questionRedCross = retrieve(root, '[questionRedCross]');
                questionRedCross.listeners['click']();
            }
            questionFromPuzzleBordure1 = retrieve(root, '[questionFromPuzzleBordure1]');
            questionFromPuzzleBordure1.listeners['click']({pageX:166, pageY:237, preventDefault:()=>{}});
            questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();

            dragImage(541, 453);
            questionImage = retrieve(root, '[questionImage1]');
            questionImage.listeners['mouseover']({pageX:541, pageY:453, preventDefault:()=>{}});
            let imageRedCross = retrieve(root, '[imageRedCross]');
            imageRedCross.listeners['click']();

            dragImage(522, 632);
            let answerImage = retrieve(root, '[answerImage0]');
            assert(answerImage);

            dragImage(884, 644);
            answerImage = retrieve(root, '[answerImage1]');
            answerImage.listeners['mouseover']();
            imageRedCross = retrieve(root, '[imageRedCross]');
            imageRedCross.listeners['click']();
            answerImage = retrieve(root, '[answerImage1]');
            assert(!answerImage);

            dragImage(884, 644);
            answerImage = retrieve(root, '[answerImage1]');
            assert(answerImage);

            let answerLabelCadre1 = retrieve(root, '[answerLabelCadre1]');
            answerLabelCadre1.listeners['mouseover']();
            redCross = retrieve(root, '[redCross]');
            redCross.listeners['click']();
            answerLabelCadre1 = retrieve(root, '[answerLabelCadre1]');
            assert(answerLabelCadre1);

            answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            answerLabelCadre0.listeners['mouseover']();
            redCross = retrieve(root, '[redCross]');
            redCross.listeners['click']();
            answerLabelCadre0 = retrieve(root, '[answerLabelCadre0]');
            assert(answerLabelCadre0);

            dragImage(522, 632);
            answerImage = retrieve(root, '[answerImage0]');
            assert(answerImage);

            explanationCadre0 = retrieve(root, '[explanationSquare0]');
            explanationCadre0.listeners['click']();
            explanationPanel = retrieve(root, '[explanationPanel]');
            explanationPanel.listeners['click']();
            explanationContentArea = retrieve(root, '[explanationContentArea]');
            enter(explanationContentArea, "Ceci est la première explication");
            circleCloseExplanation = retrieve(root, '[circleCloseExplanation]');
            circleCloseExplanation.listeners['click']();

            dragImage(884, 644);
            answerImage = retrieve(root, '[answerImage1]');
            assert(answerImage);

            libraryVideos = retrieve(root, '[libraryVidéos]');
            libraryVideos.listeners['click']();
            video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
            video.listeners['mousedown']({pageX:39, pageY:409, preventDefault:()=>{}});
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({pageX:884, pageY:644, preventDefault:()=>{}});

            video.listeners['mousedown']({pageX:39, pageY:409, preventDefault:()=>{}});
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({pageX:884, pageY:644, preventDefault:()=>{}});

            video.listeners['mousedown']({pageX:39, pageY:409, preventDefault:()=>{}});
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({pageX:574, pageY:470, preventDefault:()=>{}});

            video.listeners['mousedown']({pageX:39, pageY:409, preventDefault:()=>{}});
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({pageX:1074, pageY:94, preventDefault:()=>{}});
            video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
            video.listeners['mouseover']();
            videoRedCross = retrieve(root, '[videoRedCross]');
            videoRedCross.listeners['click']();

            libraryImages = retrieve(root, '[libraryImages]');
            libraryImages.listeners['click']();
            for(let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            image = retrieve(root, '[imageAlba]');
            image.listeners['mouseover']({pageX:53, pageY:411, preventDefault:()=>{}});
            imageRedCross = retrieve(root, '[imageRedCross]');
            imageRedCross.listeners['click']();

            let checkbox = retrieve(root, '[checkbox0]');
            checkbox.listeners['click']({pageX:339, pageY:647, preventDefault:()=>{}});

            let addImageButton = retrieve(root, '[addImageButton]');
            addImageButton.listeners['click']();

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
            let explanationIconSquare = retrieve(root, '[explanationIconSquare]');
            explanationIconSquare.listeners['click']();
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

            bigGlass = retrieve(root, '[bigGlass]');
            bigGlass.listeners['mousedown']({pageX:0, pageY:0, preventDefault:()=>{}});
            bigGlass.listeners['mouseup']({pageX:0, pageY:0, preventDefault:()=>{}});
            bigGlass.listeners['dblclick']({pageX:0, pageY:0, preventDefault:()=>{}});
            bigGlass.listeners['mousemove']({pageX:1, pageY:1, preventDefault:()=>{}});
            bigGlass.listeners['mousemove']({pageX:31, pageY:71, preventDefault:()=>{}});

            runtime.listeners['resize']({w:1500, h:1500});

            let deconnection = retrieve(root, '[deconnection]');
            deconnection.listeners['click']();

            done();

        });
    });
});