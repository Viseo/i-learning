/**
 * Created by DMA3622 on 19/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    {
        given, when, click, clickPos, inputValue, assertMessage, loadPage, assertMissing, mouseEnterElement,
        mouseLeave, checkBorderColor, onChangeElement
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
const user = {
        lastName: "MA",
        firstName: "David",
        admin: true
    },
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
        questions: {
            answers: [answers],
            label: "Boubou",
            multipleChoice: false,

        },
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
        _id: "591ec683aabd34544c5azgzagz",
        formationId: "591ec683aabd34544c5azgzagy",
        gamesCounter: {doll: 0, quizz: 1},
        label: "Force",
        progress: undefined,
        imageSrc: undefined,
        note: 5,
        noteCounter: 1,
        status: "Published",
        levelsTab: [{gamesTab: gamesTab}]
    },
    jsonFormation = {myCollection: [formationMock, formationMock2]};

describe('dashboard admin page', function () {
    it('should add a new formation', function () {
        let mockResponses = {
                '/formations': {code: 200, content: jsonFormation},
                '/formations/insert': {
                    code: 200,
                    content: {saved: true, id: "59230077e7bee64594a41612", idVersion: "59230077e7bee64594a41611"}
                }
            },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", {mockResponses, data: user});
            });
        when(() => {
            inputValue(root, "addFormationTextInput", "MaFormation");
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMissing(root, "popUpMessage");
        });
        when(() => {
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMessage(root, "popUpMessage", "Veuillez entrer un titre valide.");
            runtime.advance();
        });
        when(() => {
            inputValue(root, "addFormationTextInput", "Test[");
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMessage(root, "popUpMessage", "Caractère(s) non autorisé(s).");
            runtime.advance();
        });
        when(() => {
            inputValue(root, "addFormationTextInput", "Le");
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMessage(root, "popUpMessage" , "Caractère(s) non autorisé(s).");
        });
    });
    it('should try create a new formation (Enter keydown)', function(){
        let mockResponses = {
                '/formations': {code: 200, content: {myCollection: []}}
            },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", {mockResponses, data: user});
            });
        when(() => {
            runtime.listeners['keydown']({keyCode:13, preventDefault: () => {}})
        }).then(() => {
            assertMessage(root, "popUpMessage", "Veuillez entrer un titre valide.");
            runtime.advance();
        });
    });
    it("should enter in a formation and return to DashBoard", function () {
        let mockResponses = {
                '/formations': {code: 200, content: jsonFormation},
            },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", {mockResponses, data: user});
            });
        when(() => {
            click(root, "miniatureManipAgilité");
            assertMissing(root, "formationErrorMessage");
            assertMessage(root, "headerMessage", "Agilité");
            click(root, "return");
        }).then(() => {
            assertMessage(root, "headerMessage", "Dashboard");
        });
    });

    it("should highlight some formations", function () {
        let mockResponses = {
                '/formations': {code: 200, content: jsonFormation},
            },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", {mockResponses, data: user});
            });
        when(() => {
            mouseEnterElement(root, "miniatureManipAgilité");
        }).then(() => {
            checkBorderColor(root, "miniatureBorderAgilité", [130, 180, 255]);
        });
        when(() => {
            mouseLeave(root, "miniatureManipAgilité");
        }).then(() => {
            checkBorderColor(root, "miniatureBorderAgilité", [232, 232, 238]);
        });
    });
    it("should set up an image to a formation", function () {
        let mockResponses = {
                '/formations': {code: 200, content: jsonFormation},
                '/medias/images': {
                    content: {
                        images: [{
                            imgSrc: "../resource/625dd8b7bb91c04f4f07c88500d50e19",
                            name: "svg-guy.png", _id: "592c24c36a4f592c987fa84e"
                        }]
                    }
                },
                '/formations/update': {content: {saved: true}}
            },
            {root, state} = given(() => {
                return loadPage("Dashboard", {mockResponses, data: user});
            });
        when(() => {
            click(root, "popUpImgAgilité");
        }).then(() => {
            click(root, "image0-0");
        });

    });

    it("should add up an image to the library", function () {
        let mockResponses = {
                '/formations': {code: 200, content: jsonFormation},
                '/medias/images': {
                    content: {
                        images: [{
                            imgSrc: "../resource/625dd8b7bb91c04f4f07c88500d50e19",
                            name: "svg-guy.png", _id: "592c24c36a4f592c987fa84e"
                        }]
                    }
                },
                '/formations/591ec683aabd34544c5bceda': {content: {saved: true}},
                '/medias/upload': {content: {ack: 'ok', name: 'bidon.PNG', src: '../resource/0015254c306b9308a4fe0bac8efea0bd'} }
            },
            {root, state} = given(() => {
                return loadPage("Dashboard", {mockResponses, data: user});
            });
        when(() => {
            click(root, "popUpImgAgilité");
            click(root, "addPictureButtonGlass");
            onChangeElement(root, "fileExplorer");
        }).then(() => {

        });
    });
});