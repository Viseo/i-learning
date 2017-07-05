const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {retrieve, enterTextField, given, when, click, assertMessage, loadPage, assertMissing} = testutils;

const doneFormationJson = '{"label":"aaa","gamesCounter":{"quizz":2,"doll":1},"links":[{"parentGame":{"id":"quizz0","gameIndex":0,"levelIndex":0,"label":"Quiz 0","labelDefault":"Titre du quiz","type":"Quiz","questions":[{"label":"Question 1","multipleChoice":false,"answers":[{"correct":false,"label":"Réponse","explanation":{}},{"correct":true,"label":"Réponse","explanation":{}}]}],"answered":[],"lastQuestionIndex":1,"imageSrc":null},"childGame":{"id":"quizz1","gameIndex":0,"levelIndex":1,"label":"Quiz 1","labelDefault":"Titre du quiz","type":"Quiz","questions":[{"label":"Question 1","multipleChoice":false,"answers":[{"correct":true,"label":"Réponse","explanation":{}},{"correct":false,"label":"Réponse","explanation":{}}]}],"answered":[],"lastQuestionIndex":1,"imageSrc":null}}],"levelsTab":[{"gamesTab":[{"id":"quizz0","gameIndex":0,"levelIndex":0,"label":"Quiz 0","labelDefault":"Titre du quiz","type":"Quiz","questions":[{"label":"Question 1","multipleChoice":false,"answers":[{"correct":false,"label":"Réponse","explanation":{}},{"correct":true,"label":"Réponse","explanation":{}}]}],"answered":[],"lastQuestionIndex":1,"imageSrc":null}],"index":0},{"gamesTab":[{"id":"quizz1","gameIndex":0,"levelIndex":1,"label":"Quiz 1","labelDefault":"Titre du quiz","type":"Quiz","questions":[{"label":"Question 1","multipleChoice":false,"answers":[{"correct":true,"label":"Réponse","explanation":{}},{"correct":false,"label":"Réponse","explanation":{}}]}],"answered":[],"lastQuestionIndex":1,"imageSrc":null}],"index":1}],"status":"Published","_id":"5940f6c9b038e8267ce80823","id":"5940f6c9b038e8267ce80823","formationId":"5940f6c9b038e8267ce80824"}'
describe('Formation Collab', function () {
    it('should find a miniature', function () {
        let {root, state} = given(() => {
            return loadPage("FormationCollab", {data:doneFormationJson, className: "Formation"});
        })
        when(() => {
        }).then(() => {
            let game0 = retrieve(root, '[miniatureQuiz 0]');
            assert(game0);
        });
    })

    it('should display lock', function(){
        let {root, state} = given(() => {
            return loadPage("FormationCollab", {data:doneFormationJson, className: "Formation"});
        })
        when(() => {
            click(root, 'miniatureQuiz 1')
            click(root, 'miniatureQuiz 1')
        }).then(() => {

        })
    })

    it('should enter a game and return to FormationCollabV', function(){
        let {root, state} = given(() => {
            return loadPage("FormationCollab", {data:doneFormationJson, className: "Formation"});
        })
        when(() => {
            click(root, 'miniatureQuiz 0');
            assertMessage(root, 'headerMessage', 'Quiz 0');
            click(root, "return");
        }).then(() => {
            assertMessage(root, 'headerMessage', 'aaa');
        })
    })
});