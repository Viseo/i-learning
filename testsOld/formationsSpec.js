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
    contentArea.valueText = label;
    contentArea.listeners["input"]();
    contentArea.valueText = label;
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

const callClickOnElementPos = (root, nameClickElement) => {
    let clickElement = retrieve(root, "[" + nameClickElement + "]"),
        glass = retrieve(root, "[glass]");
    if (clickElement.handler.parentManip) {
        glass.listeners["click"]({
            pageX: clickElement.handler.parentManip.x, pageY: clickElement.handler.parentManip.y, preventDefault: () => {
            }
        });
    } else {
        glass.listeners["click"]({
            pageX: clickElement.parent.handler.parentManip.x, pageY: clickElement.parent.handler.parentManip.y, preventDefault: () => {
            }
        });
    }
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

describe('formationsManager', function () {

    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        mainMock = require("mainMock").main;
        dbListenerModule = require("../src/APIRequester").APIRequester;
        dbListener = new dbListenerModule(false, true);
    });

    it("DashboardAdminV/should add a new formation once", function (done) {
        let serverResponse = {
            noToken: {status: 'error'},
            wrongToken: {status: 'error'},
            oneTime: {status: 'oneTimeOnly'},
            adminConnected: {ack: "OK", user: {lastName: "MA", firstName: "David", admin: "true"}}
        }

        svg.screenSize(1920, 947);
        mainMock("DashboardAdminV", fakeModel);
        let root = runtime.anchor("content");
        runtime.screenSize(1500, 1500);
        testKeyDownArrow(runtime);
        done();
    });

    it("should not add a new formation", function (done) {
        testutils.retrieveDB("./log/dbFormation1.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            // runtime.listeners['resize']({w: 1500, h: 1500});
            runtime.screenSize(1500,1500);
            testKeyDownArrow(runtime);
            runtime.advance();
            testValueOnElement(root, "addFormationText", "Ajouter une formation");
            callClickOnElementPos(root, "addFormationButton");
            testValueOnElement(root, "formationErrorMessage", "Veuillez entrer un titre valide.");
            runtime.advance();
            callClickOnElement(root, "addFormationGlass");
            callEnterOnElement(root, "addFormationTextInput", "Test[");
            callClickOnElementPos(root, "addFormationButton");
            testValueOnElement(root, "formationErrorMessage", "Caractère(s) non autorisé(s).");
            runtime.advance();
            callClickOnElement(root, "addFormationGlass");
            callEnterOnElement(root, "addFormationTextInput", "MaFormation");
            callClickOnElementPos(root, "addFormationButton");
            testValueOnElement(root, "formationErrorMessage", null);

            callClickOnElement(root, "addFormationButton");
            testValueOnElement(root, "formationErrorMessage", "Cette formation existe déjà");
            runtime.advance();

            done();
        });
    });

    it('should highlight a formation', function (done) {
        testutils.retrieveDB("./log/dbFormation2.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners['mouseenter']();
            assert.ok(maFormation.handler.parentManip.get(0).fillColor.equals([130, 180, 255]));
            assert.equal(maFormation.handler.parentManip.get(0).strokeWidth, 3);
            assert.ok(maFormation.handler.parentManip.get(0).strokeColor.equals([0, 0, 0]));

            maFormation.handler.parentManip.listeners['mouseleave']();
            assert.ok(maFormation.handler.parentManip.get(0).fillColor.equals([250, 250, 250]));
            assert.equal(maFormation.handler.parentManip.get(0).strokeWidth, 1);
            assert.ok(maFormation.handler.parentManip.get(0).strokeColor.equals([125, 122, 117]));

            done();
        });
    });

    it('should add a formation', function (done) {
        testutils.retrieveDB("./log/dbFormation3.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let formationManagerLabelContent = retrieve(root, "[formationManagerLabelContent]");
            formationManagerLabelContent.listeners["click"]();
            let formationLabelContentArea2 = retrieve(root, "[formationLabelContentArea]");
            enter(formationLabelContentArea2, "maFormation");
            formationManagerLabelContent = retrieve(root, "[formationManagerLabelContent]");
            addFormationButton = retrieve(root, "[addFormationButton]");
            addFormationButton.listeners["click"]();

            let maFormation = retrieve(root, "[maFormation]");
            assert.equal(maFormation.handler.parentManip.get(1).messageText, "maFormation");

            done();
        })
    })

    it('should not publish a formation', function (done) {
        testutils.retrieveDB("./log/dbFormation4.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            runtime.listeners['resize']({w: 1500, h: 1500});

            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "maFormation");

            let publicationFormationButtonCadre = retrieve(root, "[publicationFormationButtonCadre]");
            publicationFormationButtonCadre.listeners["click"]();
            let errorMessagePublication = retrieve(root, "[errorMessagePublication]");
            assert.equal(errorMessagePublication.text,
                testutils.escape("Veuillez ajouter au moins un jeu à votre formation."));

            runtime.listeners['resize']({w: 1500, h: 1500});

            let homeText = retrieve(root, "[homeText]");
            homeText.listeners['click']();

            headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Formations");

            done();
        })
    })

    it("should change a formation's name", function (done) {
        testutils.retrieveDB("./log/dbFormation5.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            let formationLabel = retrieve(root, "[formationLabelContent]");
            formationLabel.listeners["dblclick"]();
            let contentarea = retrieve(root, "[formationLabelContentArea]");
            enter(contentarea, "maFormation2");

            let saveNameIcon = retrieve(root, "[saveNameIcon]");
            saveNameIcon.listeners['click']();

            formationLabel = retrieve(root, "[formationLabelContent]");
            assert.equal(formationLabel.handler.messageText, testutils.escape("maFormation2"));

            let formationErrorMessage = retrieve(root, "[formationErrorMessage]");
            assert.equal(formationErrorMessage.text,
                testutils.escape("Les modifications ont bien été enregistrées."));

            runtime.listeners['resize']({w: 1500, h: 1500});

            done()
        })
    })

    it("should add a quiz", function (done) {
        testutils.retrieveDB("./log/dbFormation6.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();

            //add quiz by click
            let gameQuiz = retrieve(root, "[miniInLibraryQuiz]");
            gameQuiz.listeners["mousedown"]({
                pageX: 165, pageY: 300, preventDefault: () => {
                }
            });
            let draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({
                pageX: 165, pageY: 300, preventDefault: () => {
                }
            });
            let miniatureSelected = retrieve(root, "[miniatureSelected]");
            assert.equal(miniatureSelected.stroke, 'rgb(25,25,112)');

            let panelBack = retrieve(root, "[panelBack]");
            panelBack.listeners['click']({
                pageX: 300, pageY: 300, preventDefault: () => {
                }
            });
            let game0 = retrieve(root, "[titlelevel0quizz0]");
            assert.equal(game0.handler.originalText, "Quiz 1");

            //add by dragndrop
            gameQuiz.listeners["mousedown"]({
                pageX: 165, pageY: 300, preventDefault: () => {
                }
            });
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({
                pageX: 350, pageY: 300, preventDefault: () => {
                }
            });

            let game1 = retrieve(root, "[titlelevel0quizz1]");
            assert.equal(game1.handler.originalText, "Quiz 2");

            done();
        });
    });

    it('should publish a formation', function (done) {
        testutils.retrieveDB("./log/dbFormation7.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[maFormation]");
            maFormation.handler.parentManip.listeners["click"]();
            let publicationFormationButtonCadre = retrieve(root, "[publicationFormationButtonCadre]");
            publicationFormationButtonCadre.listeners["click"]();

            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Formations");

            done();
        });
    });

    it('should delete a level in a formation', function (done) {
        testutils.retrieveDB("./log/dbFormation8.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let maFormation = retrieve(root, "[A-TestO]");
            maFormation.handler.parentManip.listeners["click"]();
            maFormation.handler.parentManip.parentObject.formation.levelsTab["1"].redCrossManipulator.components["0"]
                .component.listeners['click']();  // clic pour supprimer le dernier niveau (2 max)
            let saveFormationButton = retrieve(root,"[saveFormationButtonCadre]");
            saveFormationButton.listeners['click']();
            let backFormationManager = retrieve(root, "[returnButtonToFormationsManager]");
            backFormationManager.listeners['click']();
            maFormation.handler.parentManip.listeners["click"]();
            assert.equal(maFormation.handler.parentManip.parentObject.formation.levelsTab.length,1);
            done();
        });
    });

    it.skip('should', function (done) {
        testutils.retrieveDB("", dbListener, function () {

            const dragQuiz = (pointX, pointY) => {
                gameQuiz.listeners["mousedown"]({
                    pageX: 165, pageY: 300, preventDefault: () => {
                    }
                });
                let draggedGameCadre = retrieve(root, "[draggedGameCadre]");
                draggedGameCadre.listeners["mouseup"]({
                    pageX: 165, pageY: 300, preventDefault: () => {
                    }
                });
                pointX && pointY && panelBack.listeners['click']({
                    pageX: pointX, pageY: pointY, preventDefault: () => {
                    }
                });

            };

            dragQuiz();                                                         // on sélectionne un quiz
            runtime.listeners['keydown']({
                keyCode: 27, preventDefault: () => {
                }
            });  // au bouton échap, on déselectionne le quiz en surbrillance

            dragQuiz(300, 300);
            let game1 = retrieve(root, "[titlelevel1quizz1]");
            assert.equal(game1.handler.parentManip.components[0].messageText, "Quiz\n2");
            let miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 2);

            dragQuiz(300, 300);
            let game2 = retrieve(root, "[titlelevel1quizz2]");
            assert.equal(game2.handler.parentManip.components[0].messageText, "Quiz\n3");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 3);

            dragQuiz(300, 300);
            let game3 = retrieve(root, "[titlelevel1quizz3]");
            assert.equal(game3.handler.parentManip.components[0].messageText, "Quiz\n4");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            assert.equal(miniaturesManipulatorLast.children.length, 4);

            dragQuiz();
            gameQuiz.listeners["mousedown"]({
                pageX: 165, pageY: 300, preventDefault: () => {
                }
            });
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({
                pageX: 165, pageY: 300, preventDefault: () => {
                }
            });
            let gameQuizBorder = retrieve(root, "[miniInLibraryQuizBorder]");
            assert.equal(gameQuizBorder.stroke, 'rgb(0,0,0)');

            dragQuiz();
            let bdGame = retrieve(root, "[miniInLibraryBd]");
            bdGame.listeners['mousedown']({
                pageX: 165, pageY: 460, preventDefault: () => {
                }
            });
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({
                pageX: 165, pageY: 460, preventDefault: () => {
                }
            });

            let arrowModeButtonCadre = retrieve(root, '[arrowModeButtonCadre]');
            arrowModeButtonCadre.listeners['click']();
            let arrowModeArrow = retrieve(root, '[arrowModeArrow]');
            assert.equal(arrowModeArrow.fill, 'rgb(25,122,230)');

            let glass = retrieve(root, '[theGlass]');
            let coord = Array(4).fill({x: 0, y: 0}, 0, 4);

            coord[0].x = game0.handler.parent.globalPoint(game0.handler.parentManip.x, game0.handler.parentManip.y).x;
            coord[0].y = game0.handler.parent.globalPoint(game0.handler.parentManip.x, game0.handler.parentManip.y).y;
            coord[1].x = game1.handler.parent.globalPoint(game1.handler.parentManip.x, game1.handler.parentManip.y).x;
            coord[1].y = game1.handler.parent.globalPoint(game1.handler.parentManip.x, game1.handler.parentManip.y).y;
            coord[2].x = game2.handler.parent.globalPoint(game2.handler.parentManip.x, game2.handler.parentManip.y).x;
            coord[2].y = game2.handler.parent.globalPoint(game2.handler.parentManip.x, game2.handler.parentManip.y).y;
            coord[3].x = game3.handler.parent.globalPoint(game3.handler.parentManip.x, game3.handler.parentManip.y).x;
            coord[3].y = game3.handler.parent.globalPoint(game3.handler.parentManip.x, game3.handler.parentManip.y).y;
            console.log(coord);
            glass.listeners['mousedown']({
                pageX: 1108, pageY: 211, preventDefault: () => {
                }
            });
            glass.listeners['mouseup']({
                pageX: 1108, pageY: 360, preventDefault: () => {
                }
            });
            glass.listeners['mousedown']({
                pageX: 1108, pageY: 211, preventDefault: () => {
                }
            });
            glass.listeners['mouseup']({
                pageX: 949, pageY: 360, preventDefault: () => {
                }
            });
            glass.listeners['mousedown']({
                pageX: 1108, pageY: 360, preventDefault: () => {
                }
            });
            glass.listeners['mouseup']({
                pageX: 1108, pageY: 211, preventDefault: () => {
                }
            });
            glass.listeners['mousedown']({
                pageX: 1108, pageY: 211, preventDefault: () => {
                }
            });
            glass.listeners['mouseup']({
                pageX: 1108, pageY: 360, preventDefault: () => {
                }
            });
            let arrow01 = retrieve(root, '[quizz0quizz1]');
            let arrow02 = retrieve(root, '[quizz0quizz2]');
            let arrow03 = retrieve(root, '[quizz0quizz3]');
            let arrow20 = retrieve(root, '[quizz2quizz0]');
            assert(arrow02);
            assert(!arrow01);
            assert(arrow03);
            assert(!arrow20);

            runtime.listeners['keydown']({
                keyCode: 27, preventDefault: () => {
                }
            });


            game3.listeners['mousedown']({
                pageX: 949, pageY: 360, preventDefault: () => {
                }
            });
            game3.listeners['mouseup']({
                pageX: 949, pageY: 360, preventDefault: () => {
                }
            });
            arrow02.listeners['click']();
            arrow03.listeners['click']();
            runtime.listeners['keydown']({
                keyCode: 46, preventDefault: () => {
                }
            });

            arrow02.listeners['click']();
            arrow02.listeners['click']();
            arrow02.listeners['click']();


            assert.equal(arrow02.fill, 'rgb(25,122,230)');
            let redCross = retrieve(root, '[redCross]');
            redCross.listeners['click']();
            arrow02 = retrieve(root, '[quizz0quizz2]');
            assert(!arrow02);

            glass.listeners['mousedown']({
                pageX: 1108, pageY: 211, preventDefault: () => {
                }
            });
            glass.listeners['mouseup']({
                pageX: 945, pageY: 373, preventDefault: () => {
                }
            });
            arrow03 = retrieve(root, '[quizz0quizz3]');
            assert(arrow03);

            game3.listeners['mousedown']({
                pageX: 945, pageY: 373, preventDefault: () => {
                }
            });
            game3.listeners['mouseup']({
                pageX: 945, pageY: 373, preventDefault: () => {
                }
            });
            let gameRedCross = retrieve(root, '[gameRedCross]');
            gameRedCross.listeners['click']();
            game3 = retrieve(root, "[titlelevel1quizz3]");
            assert(!game3);
            arrow03 = retrieve(root, '[quizz0quizz3]');
            assert(!arrow03);

            dragQuiz();
            panelBack.listeners['mouseup']({
                pageX: 300, pageY: 500, preventDefault: () => {
                }
            });
            let game4 = retrieve(root, "[titlelevel2quizz4]");
            assert.equal(game4.text, "Quiz 5");

            game4.listeners['mousedown']({
                pageX: 862, pageY: 474, preventDefault: () => {
                }
            });
            game4.listeners['mouseup']({
                pageX: 862, pageY: 474, preventDefault: () => {
                }
            });
            game4.listeners['mousedown']({
                pageX: 862, pageY: 474, preventDefault: () => {
                }
            });
            game4.listeners['mouseup']({
                pageX: 862, pageY: 474, preventDefault: () => {
                }
            });
            game4.listeners['mousedown']({
                pageX: 862, pageY: 474, preventDefault: () => {
                }
            });
            game4.listeners['mouseup']({
                pageX: 862, pageY: 474, preventDefault: () => {
                }
            });
            gameRedCross = retrieve(root, '[gameRedCross]');
            gameRedCross.listeners['click']();
            game4 = retrieve(root, "[titlelevel1quizz3]");
            assert(!game4);

            dragQuiz(1885, 300);
            let game5 = retrieve(root, "[titlelevel1quizz5]");
            assert.equal(game5.text, "Quiz 6");
            miniaturesManipulatorLast = retrieve(root, "[miniaturesManipulatorLast]");
            for (let i = 0; i < 8; i++) {
                dragQuiz(300, 300);
            }
            dragQuiz(1142, 791);
            dragQuiz(1885, 791);
            let game15 = retrieve(root, "[titlelevel3quizz15]");

            game15.listeners['mousedown']({
                pageX: 500, pageY: 674, preventDefault: () => {
                }
            });
            game15.listeners['mouseup']({
                pageX: 1640, pageY: 80, preventDefault: () => {
                }
            });

            game15.listeners['mousedown']({
                pageX: 500, pageY: 674, preventDefault: () => {
                }
            });
            game15.listeners['mouseup']({
                pageX: 1176, pageY: 349, preventDefault: () => {
                }
            });

            game15.listeners['mousedown']({
                pageX: 1176, pageY: 349, preventDefault: () => {
                }
            });
            game15.listeners['mouseup']({
                pageX: 500, pageY: 674, preventDefault: () => {
                }
            });

            dragQuiz();
            panelBack.listeners['mouseup']({
                pageX: 1142, pageY: 791, preventDefault: () => {
                }
            });
            let game16 = retrieve(root, "[titlelevel4quizz16]");

            game16.listeners['mousedown']({
                pageX: 500, pageY: 791, preventDefault: () => {
                }
            });
            game16.listeners['mouseup']({
                pageX: 500, pageY: 791, preventDefault: () => {
                }
            });
            runtime.listeners['keydown']({
                keyCode: 46, preventDefault: () => {
                }
            });

            bdGame = retrieve(root, "[gameBd]");
            bdGame.listeners["mousedown"]({
                pageX: 165, pageY: 488, preventDefault: () => {
                }
            });
            draggedGameCadre = retrieve(root, "[draggedGameCadre]");
            draggedGameCadre.listeners["mouseup"]({
                pageX: 500, pageY: 791, preventDefault: () => {
                }
            });
            let bd1 = retrieve(root, "[titlelevel4bd0]");

            bd1.listeners['mousedown']({
                pageX: 500, pageY: 791, preventDefault: () => {
                }
            });
            bd1.listeners['mouseup']({
                pageX: 500, pageY: 500, preventDefault: () => {
                }
            });

            bd1.listeners['mousedown']({
                pageX: 500, pageY: 500, preventDefault: () => {
                }
            });
            bd1.listeners['mouseup']({
                pageX: 500, pageY: 791, preventDefault: () => {
                }
            });

            bd1.listeners['dblclick']();
            let returnButtonFromBdToFormation = retrieve(root, '[returnButtonFromBdToFormation]');
            returnButtonFromBdToFormation.listeners['click']();

            testKeyDownArrow(runtime);

            runtime.advance();
            runtime.advance();

            let bigGlass = retrieve(root, '[bigGlass]');
            bigGlass.listeners['mousemove']({
                pageX: 455, pageY: 486, preventDefault: () => {
                }
            });
            bigGlass.listeners['mouseup']({
                pageX: 455, pageY: 486, preventDefault: () => {
                }
            });
            bigGlass.listeners['dblclick']({
                pageX: 455, pageY: 486, preventDefault: () => {
                }
            });
            bigGlass.listeners['mouseout']();
            bigGlass.listeners['mousemove']({
                pageX: 514, pageY: 486, preventDefault: () => {
                }
            });
            bigGlass.listeners['mouseout']();

            game0.listeners['dblclick']({
                pageX: 1104, pageY: 212, preventDefault: () => {
                }
            });
            for (let image in ImageRuntime.images) {
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

            let questionFromPuzzleBordure1 = retrieve(root, '[questionFromPuzzleBordure1]');
            questionFromPuzzleBordure1.listeners['click']({
                pageX: 326, pageY: 156, preventDefault: () => {
                }
            });
            let questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();

            let emptyAnswerAddCadrequestion = retrieve(root, '[emptyAnswerAddCadrequestion]');
            for (let i = 0; i < 5; i++) {
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
                image.listeners['mousedown']({
                    pageX: 53, pageY: 411, preventDefault: () => {
                    }
                });
                let imgDraged = retrieve(root, '[imgDraged]');
                imgDraged.listeners['mouseup']({
                    pageX: pointX, pageY: pointY, preventDefault: () => {
                    }
                });
            };
            dragImage(397, 677);
            let explanationImage = retrieve(root, '[imageExplanation]');
            assert(explanationImage);

            let libraryVideos = retrieve(root, '[libraryVidéos]');
            libraryVideos.listeners['click']();
            let video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
            video.listeners['mousedown']({
                pageX: 39, pageY: 409, preventDefault: () => {
                }
            });
            let videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({
                pageX: 540, pageY: 677, preventDefault: () => {
                }
            });
            let glassVideo = retrieve(root, '[glassWIN_20160817_09_17_16_Pro]');
            glassVideo.listeners['mouseover']();
            glassVideo.listeners['mouseout']();
            glassVideo.listeners['mouseover']();
            let videoRedCross = retrieve(root, '[videoRedCross]');
            videoRedCross.listeners['click']();

            let libraryImages = retrieve(root, '[libraryImages]');
            libraryImages.listeners['click']();

            runtime.listeners['keydown']({
                keyCode: 27, preventDefault: () => {
                }
            });

            explanationCadre0 = retrieve(root, '[explanationSquare0]');
            explanationCadre0.listeners['click']();

            let circleCloseExplanation = retrieve(root, '[circleCloseExplanation]');
            circleCloseExplanation.listeners['click']();
            textExplanation = retrieve(root, '[textExplanation]');
            assert(!textExplanation);

            const dragVideo = (pointX, pointY) => {
                video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
                video.listeners['mousedown']({
                    pageX: 39, pageY: 409, preventDefault: () => {
                    }
                });
                videoDragged = retrieve(root, '[videoDragged]');
                video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
                video.listeners['mousedown']({
                    pageX: 39, pageY: 409, preventDefault: () => {
                    }
                });
                videoDragged.listeners['mouseup']({
                    pageX: pointX, pageY: pointY, preventDefault: () => {
                    }
                });
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
            for (let i = 0; i < 4; i++) {
                questionFromPuzzleBordure2 = retrieve(root, '[questionFromPuzzleBordure2]');
                questionFromPuzzleBordure2.listeners['click']({
                    pageX: 522, pageY: 223, preventDefault: () => {
                    }
                });
                questionRedCross = retrieve(root, '[questionRedCross]');
                questionRedCross.listeners['click']();
            }
            questionFromPuzzleBordure1 = retrieve(root, '[questionFromPuzzleBordure1]');
            questionFromPuzzleBordure1.listeners['click']({
                pageX: 166, pageY: 237, preventDefault: () => {
                }
            });
            questionRedCross = retrieve(root, '[questionRedCross]');
            questionRedCross.listeners['click']();

            dragImage(541, 453);
            questionImage = retrieve(root, '[questionImage1]');
            questionImage.listeners['mouseover']({
                pageX: 541, pageY: 453, preventDefault: () => {
                }
            });
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
            video.listeners['mousedown']({
                pageX: 39, pageY: 409, preventDefault: () => {
                }
            });
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({
                pageX: 884, pageY: 644, preventDefault: () => {
                }
            });

            video.listeners['mousedown']({
                pageX: 39, pageY: 409, preventDefault: () => {
                }
            });
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({
                pageX: 884, pageY: 644, preventDefault: () => {
                }
            });

            video.listeners['mousedown']({
                pageX: 39, pageY: 409, preventDefault: () => {
                }
            });
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({
                pageX: 574, pageY: 470, preventDefault: () => {
                }
            });

            video.listeners['mousedown']({
                pageX: 39, pageY: 409, preventDefault: () => {
                }
            });
            videoDragged = retrieve(root, '[videoDragged]');
            videoDragged.listeners['mouseup']({
                pageX: 1074, pageY: 94, preventDefault: () => {
                }
            });
            video = retrieve(root, '[WIN_20160817_09_17_16_Pro]');
            video.listeners['mouseover']();
            videoRedCross = retrieve(root, '[videoRedCross]');
            videoRedCross.listeners['click']();

            libraryImages = retrieve(root, '[libraryImages]');
            libraryImages.listeners['click']();
            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            image = retrieve(root, '[imageAlba]');
            image.listeners['mouseover']({
                pageX: 53, pageY: 411, preventDefault: () => {
                }
            });
            imageRedCross = retrieve(root, '[imageRedCross]');
            imageRedCross.listeners['click']();

            let checkbox = retrieve(root, '[checkbox0]');
            checkbox.listeners['click']({
                pageX: 339, pageY: 647, preventDefault: () => {
                }
            });

            let addImageButton = retrieve(root, '[addImageButton]');
            addImageButton.listeners['click']();

            let saveButtonQuiz = retrieve(root, '[saveButtonQuiz]');
            saveButtonQuiz.listeners['click']();

            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();

            let previewButton = retrieve(root, '[previewButton]');
            previewButton.listeners['click']();
            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let explanationIconSquare = retrieve(root, '[explanationIconSquare]');
            explanationIconSquare.listeners['click']();
            runtime.listeners['resize']({w: 1500, h: 1500});

            let returnButtonPreview = retrieve(root, '[returnButtonPreview]');
            returnButtonPreview.listeners['click']();
            runtime.advance();

            runtime.listeners['resize']({w: 1500, h: 1500});

            let returnButtonToFormation = retrieve(root, '[returnButtonToFormation]');
            returnButtonToFormation.listeners['click']();

            runtime.listeners['resize']({w: 1500, h: 1500});

            let returnButtonToFormationsManager = retrieve(root, '[returnButtonToFormationsManager]');
            returnButtonToFormationsManager.listeners['click']();

            bigGlass = retrieve(root, '[bigGlass]');
            bigGlass.listeners['mousedown']({
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            bigGlass.listeners['mouseup']({
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            bigGlass.listeners['dblclick']({
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            bigGlass.listeners['mousemove']({
                pageX: 1, pageY: 1, preventDefault: () => {
                }
            });
            bigGlass.listeners['mousemove']({
                pageX: 31, pageY: 71, preventDefault: () => {
                }
            });

            runtime.listeners['resize']({w: 1500, h: 1500});

            done();

        });
    });
});