/**
 * Created by DMA3622 on 19/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    {given, when, clickElement, clickPos, enterValue, inputValue, assertMessage, loadPage, assertMissing, mouseEnter, mouseLeave, checkBorderColor} = testutils;

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
let user, answers, gamesTab, formationMock, formationMock2, jsonFormation, responsesMock;

describe('dashboard admin page', function () {
    beforeEach(function () {
        user = {
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
    });
    it('should add a new formation', function (done) {
        responsesMock = {
            '/formations': {code: 200, content: jsonFormation},
            '/formations/insert': {
                code: 200,
                content: {saved: true, id: "59230077e7bee64594a41612", idVersion: "59230077e7bee64594a41611"}
            }
        },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", responsesMock, user);
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

        done();
    });
    it("should enter in a formation", function (done) {
        responsesMock = {
            '/formations': {code: 200, content: jsonFormation},
        },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", responsesMock, user);
            });
        when(() => {
            clickElement(root, "miniatureManipAgilité");
        }).then(() => {
            assertMissing(root, "formationErrorMessage");
        });
        done();
    });
    it("should highlight some formations", function (done) {
        responsesMock = {
            '/formations': {code: 200, content: jsonFormation},
        },
            {root, state, runtime} = given(() => {
                return loadPage("Dashboard", responsesMock, user);
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
        done();
    });
});