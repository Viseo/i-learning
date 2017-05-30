/**
 * Created by DMA3622 on 19/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    {given, when, clickElement, clickPos, enterValue, assertMessage, loadPage, assertMissing, mouseEnter, mouseLeave, checkBorderColor} = testutils;

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
                return loadPage("Dashboard", {mockResponses, data:user});
            });
        assertMessage(root, "addFormationText", "Ajouter une formation");

        when(() => {
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMessage(root, "formationErrorMessage", "Veuillez entrer un titre valide.");
            runtime.advance();
        });
        when(() => {
            clickElement(root, "addFormationGlass");
            enterValue(root, "addFormationTextInput", "Test[");
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMessage(root, "formationErrorMessage", "Caractère(s) non autorisé(s).");
            runtime.advance();
        });
        when(() => {
            clickElement(root, "addFormationGlass");
            enterValue(root, "addFormationTextInput", "Le");
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMissing(root, "formationErrorMessage");
        });
        when(() => {
            clickElement(root, "addFormationGlass");
            enterValue(root, "addFormationTextInput", "MaFormation");
            clickPos(root, "addFormationButton");
        }).then(() => {
            assertMissing(root, "formationErrorMessage");
        });
    });
    it("should enter in a formation", function () {
        let mockResponses = {
            '/formations': {code: 200, content: jsonFormation},
        },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", {mockResponses, data:user});
            });
        when(() => {
            clickElement(root, "miniatureManipAgilité");
        }).then(() => {
            assertMissing(root, "formationErrorMessage");
        });
    });
    it("should highlight some formations", function () {
        let mockResponses = {
            '/formations': {code: 200, content: jsonFormation},
        },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", {mockResponses, data:user});
            });
        when(() => {
            mouseEnter(root, "miniatureManipAgilité");
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
            '/medias/images': {images: "boo", content: 'image'}
        },
            {root, state} = given(() => {
                return loadPage("Dashboard", {mockResponses, data:user});
            });
        when(() => {
            clickElement(root, "popUpImgAgilité");
        }).then(() => {
        });
    })
});