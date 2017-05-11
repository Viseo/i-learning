/**
 * Created by DMA3622 on 05/05/2017.
 */
const QuizAdminV = require('./QuizAdminV').QuizAdminV;

exports.QuizAdminP = function (globalVariables) {
    const QuizAdminView = QuizAdminV(globalVariables),
        Presenter = globalVariables.Presenter;

    class QuizAdminP extends Presenter {
        constructor(state, quiz) {
            super(state);
            this.quiz = quiz;
            this.view = new QuizAdminView(this);
            this.mediaLibrary = state.getMediasLibrary();
            //this.parentPresenter = parentPresenter;

        }

        /*displayParentFormation() {
            this.parentPresenter.displayView();
        }*/

        getFormationLabel() {
            //return this.parentPresenter.getLabel();
            return "RIEN";
        }

        getLabel() {
            return this.quiz.label;
        }

        getImages(){
            return this.mediaLibrary.getImages();
        }

        getQuestions() {
            return this.quiz.questions;
        }
    }

    return QuizAdminP;
}