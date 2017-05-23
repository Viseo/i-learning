/**
 * Created by TBE3610 on 23/05/2017.
 */

const testutils = require('../lib/testutils'),
    {given, when, loadPage, click, assertMessage} = testutils;

describe('quiz collab page', function () {
    it('should answer a question', function () {
        let {root, state} = given(() => {
            let mockResponses = {
                "users/self/progress": {code: 200}
            }
            let quizJson = {
                id: "1",
                label: "quiz",
                questions: [
                    {label: "question 1", answers: [{label: "answer1", correct: true}]},
                    {label: "question 2", answers: []},
                ]
            }
            let page = loadPage("GameCollab", mockResponses, quizJson, "Quiz");
            page.state.formation = page.state.createFormation({_id: "1", "formationId": "2"});
            return page;
        })
        when(() => {
            assertMessage(root, "questionTitle1", "question 1");
            click(root, "answer1");
        }).then(() => {
            assertMessage(root, "questionTitle1", "question 2");
        })
    });
    it('should navigate between questions', function(){
        
    })
})