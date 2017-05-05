/**
 * Created by TBE3610 on 05/05/2017.
 */

const QuizCollabV = require('../views/QuizCollabV').QuizCollabV;

exports.QuizCollabP = function(globalVariable){
    const QuizCollabView = QuizCollabV(globalVariable);

    class QuizCollabP{
        constructor(parent, model){
            this.view = new QuizCollabView(this);
            this.parent = parent;
            this.model = model;
        }

        displayView(){
            this.view.display();
        }
    }

    return QuizCollabP;
}