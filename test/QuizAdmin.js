/**
 * Created by TBE3610 on 29/05/2017.
 */

const testutils = require('../lib/testutils'),
    {given, when, loadPage, click, clickElement, inputValue, assertPresent, assertMissing, assertMessage} = testutils;

let mockResponses = {
    "/medias/images": {code: 200, content: {images: []}},
    "/formations/quiz": {code: 200, content: {saved: true}}
};

describe('quiz admin', function () {
    it('should not rename quiz (wrong name)', function(){
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(() => {
            inputValue(root, 'quizTitle', '@@@@');
            clickElement(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, "infoMessage", "Vous devez remplir correctement le nom du quiz.");
        })
    })
    it('should rename quiz', function () {
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {label: "quiz"},
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(() => {
            assertMessage(root, "headerMessage", "formation - quiz")
            inputValue(root, 'quizTitle', 'quizname');
            clickElement(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, "headerMessage", 'formation - quizname');
        })
    })
    it('should create a question', function () {
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(() => {
            assertMissing(root, "questionBlock0");
            clickElement(root, 'newQuestionButton')
        }).then(() => {
            assertPresent(root, "questionBlock0")
        })
    });
    it('should add an answer', function () {
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: [
                        {label: "question 1", answers: [{label: "answer1", correct: true}]}
                    ]
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(() => {
            assertMissing(root, "answer1");
            click(root, "addAnswerButton");
        }).then(() => {
            assertPresent(root, "answer1");
        })
    })
    it('should delete a question', function () {
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: [
                        {label: "question 1", answers: []}
                    ]
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(() => {
            assertPresent(root, "questionBlock0");
            click(root, 'questionRedCross0');
        }).then(() => {
            assertMissing(root, "questionBlock0");
        })
    })
    it('should delete an answer', function () {
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: [
                        {
                            label: "question 1",
                            answers: [{label: "answer1", correct: true}, {label: "answer2"}, {label: "answer3"}]
                        }
                    ]
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(() => {
            assertPresent(root, "answer2");
            click(root, 'answerRedCross2');
        }).then(() => {
            assertMissing(root, "answer2");
        })
    })
    it('should add an explanation', function(){
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: [
                        {
                            label: "question 1",
                            answers: [{label: "answer1", correct: true}, {label: "answer2"}, {label: "answer3"}]
                        }
                    ]
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(()=>{
            click(root, "explanationButton0");
            inputValue(root, "explanationText", "explication")
        }).then(()=>{
            assertPresent(root, "explanation");
        })
    })
    it('should not save a quiz (too many correct answers)', function(){
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: [
                        {
                            label: "question 1",
                            answers: [{label: "answer1", correct: true}, {label: "answer2"}, {label: "answer3"}]
                        }
                    ]
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(()=>{
            click(root, "answerCheckbox1");
            clickElement(root, "saveButtonQuiz");
        }).then(()=>{
            assertMessage(root, "infoMessage", "Quiz non valide")
        })
    })
    it('should save quiz', function(){
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: [
                        {
                            label: "question 1",
                            answers: [{label: "answer1", correct: true}, {label: "answer2"}, {label: "answer3"}]
                        }
                    ]
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(()=>{
            clickElement(root, "saveButtonQuiz");
        }).then(()=>{
            assertMessage(root, "infoMessage", "Les modifications ont bien été enregistrées")
        })
    })
    it('should previw a quiz', function(){
        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: [
                        {
                            label: "question 1",
                            answers: [{label: "answer1", correct: true}, {label: "answer2"}, {label: "answer3"}]
                        }
                    ]
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(()=>{
            clickElement(root, 'previewButton');
        }).then(()=>{
            assertPresent(root, "questionTitle1");
        })
    })
})