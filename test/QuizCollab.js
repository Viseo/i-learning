/**
 * Created by TBE3610 on 23/05/2017.
 */

const testutils = require('../lib/testutils'),
    {given, when, loadPage, click, clickElement, assertMessage, assertPresent} = testutils;

let mockResponses = {
    "users/self/progress": {code: 200}
}
let quizJson = {
    id: "1",
    label: "quiz",
    questions: [
        {label: "question 1", answers: [{label: "answer1", correct: true}]},
        {label: "question 2", answers: [{label: "answer1"}, {label: "answer2", correct:true}]},
    ]
}

describe('quiz collab page', function () {
    it('should answer a question', function () {
        let {root, state} = given(() => {
            return loadPage("GameCollab", {
                mockResponses,
                data:quizJson,
                className:"Quiz",
                beforeLoad: (page)=>{
                    page.state.formation = page.state.createFormation({_id: "1", "formationId": "2"});
                }
            });
        })
        when(() => {
            assertMessage(root, "questionTitle1", "question 1");
            click(root, "answer1");
        }).then(() => {
            assertMessage(root, "questionTitle1", "question 2");
        })
    });

    it('should answer a multiple choice question', function(){
        let {root, state} = given(()=>{
            let quizMultiple = {
                id: "1",
                label: "quiz",
                questions: [
                    {
                        label: "question 1",
                        multipleChoice: true,
                        answers: [{label: "answer1", correct: true}, {label: "answer2", correct: true}, {label: "answer3"}]
                    },
                    {
                        label: "question 2",
                        multipleChoice: true,
                        answers: [{label: "answer1", correct: true}, {label: "answer2", correct: true}, {label: "answer3"}]
                    }
                ]
            }
            return loadPage("GameCollab", {
                mockResponses,
                data:quizMultiple,
                className:"Quiz",
                beforeLoad: (page)=>{
                    page.state.formation = page.state.createFormation({_id: "1", "formationId": "2"});
                }
            });
        })
        when(()=>{
            click(root, 'answer1');
            click(root, 'answer2');
            clickElement(root, "validateButton");
        }).then(()=>{
            assertMessage(root, 'questionTitle1', 'question 2');
        })
    })

    it('should navigate between questions', function(){
        let {root, state} = given(() => {
            let page = loadPage("GameCollab", {
                mockResponses,
                data:quizJson,
                className:"Quiz",
                beforeLoad: (page)=>{
                    page.state.formation = page.state.createFormation({_id: "1", "formationId": "2"});
                }
            });
            click(page.root, "answer1");
            return page;
        })
        when(() => {
            click(root, 'leftChevron')
        }).then(() => {
            assertMessage(root, "questionTitle1", "question 1");
        })
        when(()=>{
            click(root, 'rightChevron')
        }).then(()=>{
            assertMessage(root, "questionTitle1", "question 2");
        })
    });

    it('should finish a quiz', function(){
        let {root, state} = given(() => {
            return loadPage("GameCollab", {
                mockResponses,
                data:quizJson,
                className:"Quiz",
                beforeLoad: (page)=>{
                    page.state.formation = page.state.createFormation({_id: "1", "formationId": "2"});
                }
            });
        })
        when(()=>{
            click(root, "answer1");
            click(root, "answer1");
        }).then(()=>{
            assertPresent(root, "scoreTitle");
        })
    })

    it('should display an answered question', function(){
        let {root, state} = given(() => {
            let page = loadPage("GameCollab", {
                mockResponses,
                data:quizJson,
                className:"Quiz",
                beforeLoad: (page)=>{
                    page.state.formation = page.state.createFormation({_id: "1", "formationId": "2"});
                }
            });
            click(page.root, "answer1");
            click(page.root, "answer1");
            return page;
        })
        when(()=>{
            clickElement(root, "answeredButton");
        }).then(()=>{
            assertPresent(root, 'scoreText');
        })
    })
})