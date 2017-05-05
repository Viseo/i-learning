/**
 * Created by TBE3610 on 05/05/2017.
 */

const QuizCollabV = require('../views/QuizCollabV').QuizCollabV;

exports.QuizCollabP = function (globalVariable) {
    const QuizCollabView = QuizCollabV(globalVariable);

    class QuizCollabP {
        constructor(parent, model) {
            this.view = new QuizCollabView(this);
            this.parent = parent;
            this.model = model;
        }

        displayView() {
            this.view.display();
        }

        returnHandler() {
            this.view.flush();
            this.parent.fromReturn();
        }

        getLabel() {
            return this.model.getLabel();
        }
        getQuestionLabel(index){
            return this.model.getQuestionLabel(index);
        }
        getAnswers(questionIndex){
            return this.model.getAnswers(questionIndex);
        }
    }

    return QuizCollabP;
}