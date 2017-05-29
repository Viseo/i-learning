/**
 * Created by DMA3622 on 23/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    FModels = require('../src/Models').Models,
    models = FModels({},{}),
    {given, when, loadPage, mouseDown, mouseUp} = testutils;

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

let answers, gamesTab, formationMock, mockResponses;

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
            mockResponses = {
                'boo': {data: 200, content: {}}
            }
    });
    it("should", function (done) {
        let {root, state, runtime} = given(() => {
            return loadPage("FormationAdmin", {mockResponses, data:formationMock, className: "Formation"});
        });
        when(() => {
            mouseDown(root, "QuizLibManip");
        }).then(() => {
            mouseUp(root, "draggedGameCadre", {
                pageX: 165, pageY: 300, preventDefault: () => {
                }
            });
        });
        done();
    });
});