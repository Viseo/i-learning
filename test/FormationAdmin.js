/**
 * Created by DMA3622 on 23/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    FModels = require('../src/Models').Models,
    models = FModels({}, {}),
    {
        given, when, loadPage, mouseDown, mouseUp, mouseMove, clickElement, assertMessage, onChangeElement, inputValue,
        mouseDownOnGlassElement, mouseUpOnGlassElement, mouseMoveOnGlassElement, getElement, dblclickElement
    } = testutils;

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

let answers, gamesTab, gamesTab2, formationMock, formationMock2, mockResponses;

describe('formation admin page', function () {
    beforeEach(function () {
        answers = [{
            correct: true,
            label: "Bibi",
            explanation: {label: "Hello"}
        }, {
            correct: false,
            label: "Baba",
            explanation: {label: "Baba"}
        }],
            gamesTab = [{
                formationId: "591ec683aabd34544c5bcedb",
                gameIndex: 0,
                id: "quizz0",
                label: "Introduction aux méthodes agiles",
                lastQuestionIndex: 0,
                levelIndex: 0,
                type: 'Quiz',
                questions: [{
                    answers: [answers],
                    label: "Boubou",
                    multipleChoice: false
                }
                ],
            }],
            gamesTab2 = [
                {
                    formationId: "591ec683aabd34544c5bcedb",
                    gameIndex: 0,
                    id: "quizz1",
                    label: "Introduction aux méthodes agiles Suite",
                    lastQuestionIndex: 0,
                    levelIndex: 1,
                    type: 'Quiz',
                    questions: [{
                        answers: [answers],
                        label: "Boubou",
                        multipleChoice: false
                    }
                    ],
                }],
            formationMock = {
                links: [],
                _id: "591ec683aabd34544c5bceda",
                formationId: "591ec683aabd34544c5bcedb",
                gamesCounter: {doll: 0, quizz: 1},
                label: "Agilité",
                progress: undefined,
                imageSrc: undefined,
                note: 0,
                noteCounter: 0,
                status: "NotPublished",
                levelsTab: [{gamesTab: gamesTab}]
            },
            formationMock2 = {
                links: [],
                _id: "591ec683aabd34544c5bceda",
                formationId: "591ec683aabd34544c5bcedb",
                gamesCounter: {doll: 0, quizz: 2},
                label: "Agilité",
                progress: undefined,
                imageSrc: undefined,
                note: 0,
                noteCounter: 0,
                status: "NotPublished",
                levelsTab: [{gamesTab: gamesTab}, {gamesTab: gamesTab2}]
            },
            mockResponses = {
                '/formations/update': {content: {saved: true}},
                '/medias/images': {
                    content: {
                        images: [{
                            imgSrc: "../resource/625dd8b7bb91c04f4f07c88500d50e19",
                            name: "svg-guy.png", _id: "592c24c36a4f592c987fa84e"
                        }]
                    }
                },
                '/medias/upload': {}
            }
    });

    it("should add a new quiz and save the new formation then publish it", function () {
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            mouseDown(root, "QuizLibManip");
        }).then(() => {
            mouseMove(root, "draggedGameCadre", {
                pageX: 500, pageY: 0, preventDefault: () => {
                }
            });
            mouseUp(root, "draggedGameCadre", {
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            when(() => {
                clickElement(root, "saveFormation");
            }).then(() => {
                assertMessage(root, "infoMessage", "Votre travail a bien été enregistré.");
            });
            when(() => {
                clickElement(root, "publishFormation");
            }).then(() => {

            });
        });
    });

    it("should select and unselect a quiz", function () {
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            mouseDown(root, "miniatureGameManipquizz0");
            mouseUp(root, "miniatureGameManipquizz0");
        }).then(() => {
            clickElement(root, "whitePanel");
        });
    });

    it('should enter in a quiz', function () {
       let {root} = given(() => {
           return loadPage("FormationAdmin", {mockResponses, data: formationMock2, className: "Formation"});
       });
       when(() => {
            dblclickElement(root, "miniatureGameManipquizz0");
       }).then(() => {

       })
    });

    it("should add an image into a quiz", function () {
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            clickElement(root, "popUpImgquizz0");
        }).then(() => {
            clickElement(root, "image0-0");
        });
    });

    it("should add up an image to the library", function () {
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            clickElement(root, "popUpImgquizz0");
            clickElement(root, "addPictureButtonGlass");
            onChangeElement(root, "fileExplorer");
        }).then(() => {

        });
    });

    it('should not rename formation (wrong name)', function () {
        let {root, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            inputValue(root, 'formationTitle', 'AAAAAAA-_-56+626fa0&ér');
            clickElement(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, "infoMessage", "Vous devez remplir correctement le nom de la formation.");
            runtime.advance();
            clickElement(root, "saveFormation");
            assertMessage(root, "infoMessage", "Vous devez remplir correctement le nom de la formation.");
            runtime.advance();
            clickElement(root, "publishFormation");
            assertMessage(root, "infoMessage", "Vous devez remplir correctement le nom de la formation.");
            runtime.advance();
        })
    });

    it('should press Enter (rename)', function(){
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            runtime.listeners['keydown']({keyCode: 13, preventDefault: () => {}})
        }).then(() => {
            assertMessage(root, "infoMessage", "Votre travail a bien été enregistré.");
        })
    })

    it('should rename formation', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            assertMessage(root, 'headerMessage', 'Agilité');
            inputValue(root, 'formationTitle', 'Agility');
            clickElement(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, 'headerMessage', 'Agility');
        })
    });

    it('should not publish an empty formation', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: {}, className: "Formation"});
        });
        when(() => {
            clickElement(root, "publishFormation")
        }).then(() => {
            assertMessage(root, "infoMessage", "Veuillez ajouter au moins un jeu à votre formation.");
        })
    });
    it('should set arrow dependencies', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock2, className: "Formation"});
        });
        when(() => {
            clickElement(root, 'toggleArrowManip');
            mouseDownOnGlassElement(root, 'miniatureGameManipquizz0');
            mouseMoveOnGlassElement(root, 'miniatureGameManipquizz0');
            mouseUpOnGlassElement(root, 'miniatureGameManipquizz1');
        }).then(() => {
            // isLinked("quizz0", "quizz1"); TODO DMA **/
        });
    });

    it('should delete a quizz', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock2, className: "Formation"});
        });
        when(() => {
            mouseDown(root, "miniatureGameManipquizz0");
            mouseUp(root, "miniatureGameManipquizz0");
            let miniatureGameManip = getElement(root, 'miniatureGameManipquizz0'),
                redCrossGame = miniatureGameManip.handler.parentManip.components['3'];
            redCrossGame.listeners['click']();
        }).then(() => {
        });
    });

    it('should delete a level', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock2, className: "Formation"});
        });
        when(() => {
            clickElement(root, "redCrossLevel0");
        }).then(() => {

        })
    });
});