/**
 * Created by DMA3622 on 05/05/2017.
 */
const QuizAdminV = require('./QuizAdminV').QuizAdminV;

exports.QuizAdminP = function (globalVariables) {
    const QuizAdminView = QuizAdminV(globalVariables);
    class QuizAdminP {
        constructor(parentPresenter, model) {
            this.model = model;
            this.view = new QuizAdminView(this);
            this.parentPresenter = parentPresenter;

        }

        displayParentFormation() {
            this.parentPresenter.displayView();
        }

        displayView() {
            this.view.display();
        }

        getFormationLabel() {
            return this.parentPresenter.getLabel();
        }

        getLabel() {
            return this.model.label;
        }
        getQuestions() {
            return this.model.questions;
        }
    }

    return QuizAdminP;
}