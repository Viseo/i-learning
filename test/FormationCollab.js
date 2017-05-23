const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {retrieve, enterTextField, given, when, click, assertMessage, loadPage, assertMissing, loadPageWithFormation} = testutils;

const doneFormationJson = '{"links":[],"_id":"5922a85388b9a80f44f5737c","formationId":"5922a85388b9a80f44f5737d","gamesCounter":{"quizz":1,"doll":0},"progress":"done","imageSrc":"../resource/c2b4cc3bb64725ab1c5df279bc5aa21f","labelDefault":"Entrer le nom de la formation","levelsTab":[{"gamesTab":[{"id":"quizz0","gameIndex":0,"levelIndex":0,"label":"Quiz 0","labelDefault":"Titre du quiz","type":"Quiz","questions":[{"label":"eded","multipleChoice":false,"answers":[{"correct":false,"label":"dede","explanation":{"label":"Cliquer ici pour ajouter du texte"}},{"correct":true,"label":"edede","explanation":{"label":"Cliquer ici pour ajouter du texte"}}]},{"label":"polo","multipleChoice":false,"answers":[{"correct":false,"label":"polo","explanation":{"label":"Cliquer ici pour ajouter du texte"}},{"correct":true,"label":"polo","explanation":{"label":"hahaha"}}]}],"answered":[[1],[1]],"lastQuestionIndex":2}],"index":0}],"label":"polo","status":"Published","note":5,"noteCounter":1}'

describe('Formation Collab', function () {
    it('should find a miniature', function () {
        let {root, state} = given(() => {
            return loadPageWithFormation(...["FormationCollab", , doneFormationJson]);
        })
        when(() => {
        }).then(() => {
            let game0 = retrieve(root, '[miniatureQuiz 0]');
            assert(game0);
        });
    })
});