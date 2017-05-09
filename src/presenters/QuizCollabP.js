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
            this.currentQuestionIndex = 0;
            this.lastAnsweredIndex = 0;
        }

        displayView() {
            this.view.display();
        }
        displayResultView(){
            this.displayView();
            this.view.displayResult();
        }

        returnHandler() {
            this.view.flush();
            this.parent.fromReturn();
        }
        previousQuestion(){
            if(this.currentQuestionIndex > 0){
                this.currentQuestionIndex--;
                this.displayView();
            }
        }
        nextQuestion(){
            if(this.currentQuestionIndex < this.getNbQuestions() - 1){
                this.currentQuestionIndex++;
                this.displayView();
            }
        }
        selectAnswer(index){
            this.model.selectAnswer(this.currentQuestionIndex, index);
            if(this.lastAnsweredIndex < index) this.lastAnsweredIndex = index;
            if(this.currentQuestionIndex < this.getNbQuestions() - 1){
                this.nextQuestion();
            }else {
                //TODO call state to show score presenter
                this.displayResultView();
            }
        }

        getLabel() {
            return this.model.getLabel();
        }
        getNbQuestions(){
            return this.model.getNbQuestions();
        }
        getCurrentQuestionLabel(){
            return this.model.getQuestionLabel(this.currentQuestionIndex);
        }
        isFirstQuestion(){
            return this.currentQuestionIndex === 0;
        }
        isLastAnsweredQuestion(){
            return this.currentQuestionIndex === this.lastAnsweredIndex;
        }
        getCurrentAnswers(){
            return this.model.getAnswers(this.currentQuestionIndex);
        }
        getCurrentAnswered(){
            return this.model.getAnswered(this.currentQuestionIndex);
        }
    }

    return QuizCollabP;
}