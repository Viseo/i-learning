/**
 * Created by DMA3622 on 05/05/2017.
 */
const QuizAdminV = require('../views/QuizAdminV').QuizAdminV;

exports.QuizAdminP = function (globalVariables) {
    const QuizAdminView = QuizAdminV(globalVariables),
        Presenter = globalVariables.Presenter,
        TITLE_QUIZ_REGEX = /^([A-Za-z0-9.,;:!?()éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ °'-]){0,50}$/g;

    class QuizAdminP extends Presenter {
        constructor(state, quiz) {
            super(state);
            this.quiz = quiz;
            this.view = new QuizAdminView(this);
            this.mediaLibrary = state.getMediasLibrary();
            this.regex = TITLE_QUIZ_REGEX;
        }

        updateQuiz(quizData) {
            const messageError = "Il manque des informations",
                getObjectToSave = () => {
                    return {
                        id: this.getId(),
                        gameIndex: this.getIndex(),
                        levelIndex: this.getLevelIndex(),
                        formationId: this.getFormationId(),
                        label: this.getLabel(),
                        lastQuestionIndex: this.getLastIndex(),
                        questions: this.getQuestions()
                    };
                };

            if (quizData.label && quizData.label !== this.quiz.labelDefault && quizData.label.match(this.regex)) {
                this.setLabel(quizData.label);
            } else {
                this.view.displayMessage(messageError);
                return;
            }
            this.setQuestions(quizData.questions);
            let quizToSave = getObjectToSave(),
                isValid = false;
            quizToSave.questions.forEach(question => {
                question.answers.forEach(answer => {
                    if (!question.multipleChoice && isValid == false && answer.correct == true) {
                        isValid = true;
                    } else if (!question.multipleChoice && isValid == true && answer.correct == true) {
                        isValid = false;
                    } else if (question.multipleChoice && answer.correct == true) {
                        isValid = true;
                        return;
                    }
                });

            });
            if (isValid) {
                return this.quiz.replaceQuiz(getObjectToSave()).then(data => {
                    data.message && this.view.displayMessage(data.message);
                    return data;
                }).catch(error => {
                    console.log(error);
                    return error;
                });
            } else {
                this.view.displayMessage(messageError);
            }

        }

        getFormationId() {
            return this.state.getFormationId();
        }

        getFormationLabel() {
            return this.state.getFormationLabel();
        }

        getId() {
            return this.quiz.getId();
        }

        getIndex() {
            return this.quiz.getIndex();
        }

        getLabel() {
            return this.quiz.getLabel();
        }

        getLastIndex() {
            return this.quiz.lastQuestionIndex;
        }

        getLevelIndex() {
            return this.quiz.getLevelIndex();
        }

        getImages() {
            return this.mediaLibrary.getImages();
        }

        getQuestions() {
            return this.quiz.getQuestions();
        }

        getLastQuestionIndex() {
            return this.quiz.getLastQuestionIndex();
        }

        renameQuiz(label) {
            this.quiz.setLabel(label);
            const messageError = "Vous devez remplir correctement le nom du quiz.";
            if (label && label !== this.quiz.labelDefault && label.match(this.regex)) {
                const getObjectToSave = () => {
                    return {
                        id: this.getId(),
                        gameIndex: this.getIndex(),
                        formationId: this.getFormationId(),
                        label: this.getLabel(),
                        lastQuestionIndex: this.getLastIndex(),
                        levelIndex: this.getLevelIndex(),
                    };
                };
                if (this.getId()) {
                    return this.quiz.renameQuiz(getObjectToSave()).then(data => {
                        data.message && this.view.displayMessage(data.message);
                        return data;
                    }).catch(error => {
                        console.log(error);
                        return error;
                    });
                }
            } else {
                this.view.displayMessage(messageError);
                return Promise.resolve(false);
            }

        }

        setLabel(quizLabel) {
            this.quiz.setLabel(quizLabel);
        }

        setQuestions(questions) {
            this.quiz.setQuestions(questions);
        }
    }

    return QuizAdminP;
}