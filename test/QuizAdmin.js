/**
 * Created by TBE3610 on 29/05/2017.
 */

const testutils = require('../lib/testutils'),
    {given, when, retrieve, loadPage, click, inputValue, assertPresent, assertMissing, assertMessage, mouseDown} = testutils;

let mockResponses = {
    "/medias/images": {code: 200, content: {images: []}},
    "/formations/update": {content: {saved: true}},
    "/formations/quiz": {code: 200, content: {valid: true}},
    "/medias/videos": {code:200, content: [{name: "deepchord-presents-echospace-ghost-theory.mp4",
        src: "../resource/63b48e1176c52e478812bc684af407c9", _id:"58ff20e27f3e802c0c7ffa29"}]}
}

describe('quiz admin', function () {

    it('should not rename quiz (wrong name)', function(){
        let {root, state} = given(() => {
            mockResponses = {
                "/medias/images": {code: 200, content: {images: []}},
                "/formations/update": {content: {saved: true}},
                "/formations/quiz": {code: 200, content: {valid: false}},
                "/medias/videos": {code:200, content: [{name: "deepchord-presents-echospace-ghost-theory.mp4",
                    src: "../resource/63b48e1176c52e478812bc684af407c9", _id:"58ff20e27f3e802c0c7ffa29"}]}            }
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
            click(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, "infoMessage", "Le nom du quiz est incorrect");
        })
    })
    it('should not rename quiz (not valid quiz)', function () {
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
            click(root, 'saveNameButton');
        }).then(() => {
            assertMessage(root, "infoMessage", "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide");
        })
    })
    it('should press Enter (empty quiz)', function(){
        let {root, state, runtime} = given(() => {
            mockResponses = {
                "/medias/images": {code: 200, content: {images: []}},
                "/formations/update": {content: {saved: true}},
                "/formations/quiz": {code: 200, content: {valid: false}},
                "/medias/videos": {code:200, content: [{name: "deepchord-presents-echospace-ghost-theory.mp4",
                    src: "../resource/63b48e1176c52e478812bc684af407c9", _id:"58ff20e27f3e802c0c7ffa29"}]}
            }
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
           runtime.listeners['keydown']({keyCode: 13, preventDefault: () => {}})
        }).then(() => {
            assertMessage(root, "infoMessage", "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide");
        })
    })

    it('should rename quiz with enter', function(){
        let {root, state, runtime} = given(() => {
            mockResponses = {
                "/medias/images": {code: 200, content: {images: []}},
                "/formations/update": {content: {saved: true}},
                "/formations/quiz": {code: 200, content: {valid: true}},
                "/medias/videos": {code:200, content: [{name: "deepchord-presents-echospace-ghost-theory.mp4",
                    src: "../resource/63b48e1176c52e478812bc684af407c9", _id:"58ff20e27f3e802c0c7ffa29"}]}
            }
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
            inputValue(root, 'quizTitle', 'newQuizName');
            runtime.listeners['keydown']({keyCode: 13, preventDefault: () => {}})
        }).then(() => {
            assertMessage(root, "infoMessage", "Les modifications ont bien été enregistrées");
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
            click(root, 'newQuestionButton')
        }).then(() => {
            assertPresent(root, "questionBlock0")
        })
    });

    it('should switch between two question', function () {
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
                        },
                        {
                            label: "question 2",
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
            assertPresent(root, "questionBlock0");
            assertPresent(root, "questionBlock1");
        }).then(() => {
            click(root, "selectQuestionBlock0");
            click(root, "selectQuestionBlock1");
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
            mockResponses = {
                "/medias/images": {code: 200, content: {images: []}},
                "/formations/update": {content: {saved: true}},
                "/formations/quiz": {code: 200, content: {valid: false}},
                "/medias/videos": {code:200, content: [{name: "deepchord-presents-echospace-ghost-theory.mp4",
                    src: "../resource/63b48e1176c52e478812bc684af407c9", _id:"58ff20e27f3e802c0c7ffa29"}]}            }
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
            click(root, "saveButtonQuiz");
        }).then(()=>{
            assertMessage(root, "infoMessage", "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide")
        })
    })
    it('should save quiz', function(){
        let {root, state} = given(() => {
            mockResponses = {
                "/medias/images": {code: 200, content: {images: []}},
                "/formations/update": {content: {saved: true}},
                "/formations/quiz": {code: 200, content: {valid: true}},
                "/medias/videos": {code:200, content: [{name: "deepchord-presents-echospace-ghost-theory.mp4",
                    src: "../resource/63b48e1176c52e478812bc684af407c9", _id:"58ff20e27f3e802c0c7ffa29"}]}            }
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
            click(root, "saveButtonQuiz");
        }).then(()=>{
            assertMessage(root, "infoMessage", "Les modifications ont bien été enregistrées")
        })
    })

    it('should rename saved quiz', function(){
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
            assertMessage(root, "headerMessage", "formation - quiz")
            inputValue(root, 'quizTitle', 'quizname');
            click(root, "saveButtonQuiz");
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
            click(root, 'previewButton');
        }).then(()=>{
            assertPresent(root, "questionTitle1");
        })
    })
    it('should toggle video panel', function(){
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
            click(root, 'videoTab');
        }).then(()=>{
            assertPresent(root, 'videoPanel')
        })
    })

    it('should toggle video panel then image panel', function(){
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
            click(root, 'videoTab');
        }).then(()=>{
            assertPresent(root, 'videoPanel')
        })
        when(()=>{
            click(root, 'imageTab');
        }).then(()=>{
            assertPresent(root, 'imagePanel')
        })
        when(()=>{
            click(root, 'videoTabText');
        }).then(()=>{
            assertPresent(root, 'videoPanel')
        })
        when(()=>{
            click(root, 'imageTabText');
        }).then(()=>{
            assertPresent(root, 'imagePanel')
        })
    })

    it('should add a video to the question content', function () {
        mockResponses = {
            "/medias/images": {code: 200, content: {images: []}},
            "/formations/update": {content: {saved: true}},
            "/formations/quiz": {code: 200, content: {valid: true}},
            "/medias/videos": {code:200, content: [{name: "deepchord-presents-echospace-ghost-theory.mp4",
                src: "../resource/63b48e1176c52e478812bc684af407c9", _id:"58ff20e27f3e802c0c7ffa29"}]}
        }
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
        });
        when(()=>{
            click(root, 'videoTab');
        }).then(()=>{
            assertPresent(root, 'videoPanel');
            mouseDown(root, 'video0');
        })
    })
    it('should finish above test');

    it('should scroll through questions', function(){
        let questions = [];

        for(let i = 1; i<15; i++){
            let question = {
                label: "question " + i,
                    answers: [{label: "answer1", correct: true}, {label: "answer2"}, {label: "answer3"}]
            }
            questions.push(question)
        }

        let {root, state} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {
                    id: "1",
                    label: "quiz",
                    questions: questions
                },
                className: "Quiz",
                beforeLoad: (page) => {
                    page.state.formation = page.state.createFormation({_id: "1", formationId: "2", label: "formation"});
                }
            })
        })
        when(() => {
            do{
                click(root, 'listQChevronRD');
            }while(retrieve(root, '[listQChevronRD]'))
        }).then(() => {
            assertPresent(root, 'listQChevronLT');
        })
    })

})