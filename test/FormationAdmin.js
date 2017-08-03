/**
 * Created by DMA3622 on 23/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    FModels = require('../src/Models').Models,
    models = FModels({}, {}),
    {
        given, when, loadPage, mouseDown, mouseUp, mouseUpElement, mouseMove, click, assertMessage, onChangeElement, inputValue,
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

let answers = [{
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
        '/medias/upload': {content: {ack: 'ok', name: 'bidon.PNG', src: '../resource/0015254c306b9308a4fe0bac8efea0bd'} }
    };

describe('formation admin page', function () {

    it('should return to dashboard (header button)', function(){
        let {root, state} = given(() => {
            return loadPage('FormationAdmin', {
                mockResponses: {
                    "/formations": {content: {myCollection: []}},
                    "/users/notes": {content: {}}
                },
                data: formationMock,
                className: "Formation",
                beforeLoad: function(page){
                    page.state.user = page.state.createUser({})
                    page.state.username = "Blanche-Neige";
                }
            })
        })
        when(() => {
            click(root, 'homeText')
        }).then(() => {
            assertMessage(root, 'headerMessage', 'Dashboard')
        })
    })

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
                click(root, "saveFormation");
            }).then(() => {
                assertMessage(root, "popUpMessage", "Votre travail a bien été enregistré.");
            });
            when(() => {
                click(root, "publishFormation");
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
            mouseUpElement(root, "background");
        });
    });

    it('should enter in a quiz and return to Formation', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {
                mockResponses, data: formationMock2, className: "Formation",
                beforeLoad: function (page) {
                    page.state.username = "Blanche-Neige";
                }
            });
        });
       when(() => {
           assertMessage(root, 'headerMessage', 'Agilité');
           dblclickElement(root, "miniatureGameManipquizz0");
           assertMessage(root, 'headerMessage', 'Agilité - Introduction aux méthodes agiles');
           click(root, "return");
       }).then(() => {
           assertMessage(root, 'headerMessage', 'Agilité');
       })
    });

    it("should add an image into a quiz", function () {
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            mouseDown(root, "miniatureGameManipquizz0");
            mouseUp(root, "miniatureGameManipquizz0");
            click(root, "popUpImgquizz0");
        }).then(() => {
            click(root, "image0-0");
        });
    });

    it("should add up an image to the library", function () {
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            mouseDown(root, "miniatureGameManipquizz0");
            mouseUp(root, "miniatureGameManipquizz0");
            click(root, "popUpImgquizz0");
            click(root, "addPictureButtonGlass");
            onChangeElement(root, "fileExplorer");
        }).then(() => {

        });
    });

    it('should not rename formation (wrong name)', function () {
        let {root, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock, className: "Formation"});
        });
        when(() => {
            inputValue(root, 'formationTitle', '  AAAAAAA-_-56+626fa0&ér');
            click(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, "popUpMessage", "Caractère(s) non autorisé(s).");
            runtime.advance();
            click(root, "saveFormation");
            assertMessage(root, "popUpMessage", "Caractère(s) non autorisé(s).");
            runtime.advance();
            click(root, "publishFormation");
            assertMessage(root, "popUpMessage", "Il y a des jeux non valides.");
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
            assertMessage(root, "popUpMessage", "Votre travail a bien été enregistré.");
        })
    })

    it('should rename formation', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {
                mockResponses, data: formationMock, className: "Formation",
                beforeLoad: function (page) {
                    page.state.username = "Blanche-Neige";
                }
            });
        });
        when(() => {
            assertMessage(root, 'headerMessage', 'Agilité');
            inputValue(root, 'formationTitle', 'Agility');
            click(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, 'headerMessage', 'Agility');
        })
    });

    it('should not publish an empty formation', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: {}, className: "Formation"});
        });
        when(() => {
            click(root, "publishFormation")
        }).then(() => {
            assertMessage(root, "popUpMessage", "Veuillez ajouter au moins un jeu à votre formation.");
        })
    });
    it('should set arrow dependencies', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock2, className: "Formation"});
        });
        when(() => {
            click(root, 'toggleArrowManip');
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
                trash = miniatureGameManip.handler.parentManip.components['3'];
            trash.component.listeners['click']();
        }).then(() => {
        });
    });

    it('should delete a level', function () {
        let {root} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data: formationMock2, className: "Formation"});
        });
        when(() => {
            click(root, "trashLevel0");
        }).then(() => {

        })
    });
});