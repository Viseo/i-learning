/**
 * Created by TBE3610 on 05/05/2017.
 */

const QuizCollabV = require('../views/QuizCollabV').QuizCollabV;
const QuizScoreV = require('../views/QuizScoreV').QuizScoreV;

exports.QuizCollabP = function (globalVariable) {
    const QuizCollabView = QuizCollabV(globalVariable);
    const QuizScoreView = QuizScoreV(globalVariable);

    class QuizCollabP {
        constructor(parent, model) {
            this.questionView = new QuizCollabView(this);
            this.scoreView = new QuizScoreView(this);
            this.parent = parent;
            this.model = model;
            this.currentQuestionIndex = 0;
            this.lastAnsweredIndex = 0;
            this.isDone = false; //chedk from model if already done
        }

        displayView() {
            if(this.isDone){
                this.displayScoreView();
            }else {
                this.displayQuestionView();
            }
        }

        displayQuestionView(){
            this.questionView.display();
            if(this.isDone) this.questionView.displayResult();
        }
        displayScoreView(){
            this.scoreView.display();
        }

        returnHandler() {
            //TODO use State
           //this.questionView.flush();
            //this.parent.fromReturn();
        }

        previousQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.displayView();
            }
        }

        nextQuestion() {
            if (this.currentQuestionIndex < this.getNbQuestions() - 1) {
                this.currentQuestionIndex++;
                if (this.lastAnsweredIndex < this.currentQuestionIndex) this.lastAnsweredIndex = this.currentQuestionIndex;
                this.displayView();
            }
        }

        selectAnswer(index) {
            this.model.selectAnswer(this.currentQuestionIndex, index);
            if (this.currentQuestionIndex < this.getNbQuestions() - 1) {
                this.nextQuestion();
            } else {
                this.isDone = true;
                this.displayScoreView();
            }
        }

        getLabel() {
            return this.model.getLabel();
        }

        getNbQuestions() {
            return this.model.getNbQuestions();
        }

        getNbCorrect(){
            return this.model.getNbCorrect();
        }

        getCurrentQuestionLabel() {
            return this.model.getQuestionLabel(this.currentQuestionIndex);
        }

        isFirstQuestion() {
            return this.currentQuestionIndex === 0;
        }

        isLastAnsweredQuestion() {
            return this.currentQuestionIndex === this.lastAnsweredIndex;
        }

        getCurrentAnswers() {
            return this.model.getAnswers(this.currentQuestionIndex);
        }

        getCurrentAnswered() {
            return this.model.getAnswered(this.currentQuestionIndex);
        }

        getCorrectAnswerIndex() {
            return this.model.getCorrectAnswerIndex(this.currentQuestionIndex);
        }

        getScore() {
            let nbQuestions = this.getNbQuestions();
            let nbCorrect = this.getNbCorrect();
            let color, str1, str2;
            switch (nbCorrect) {
                case nbQuestions:
                    str1 = 'Impressionant !';
                    str2 = 'et toutes sont justes !';
                    color = [100, 255, 100];
                    break;
                case 0:
                    str1 = 'Votre niveau est désolant... Mais gardez espoir !';
                    str2 = "dont aucune n'est juste !";
                    color = [255, 17, 0];
                    break;
                case (nbQuestions - 1):
                    str1 = 'Pas mal du tout !';
                    str2 = 'et toutes (sauf une...) sont justes !';
                    color = [200, 255, 0];
                    break;
                case 1:
                    str1 = 'Vous avez encore de nombreux progrès à faire.';
                    str2 = 'dont une seule est juste.';
                    color = [255, 100, 0];
                    break;
                default:
                    str1 = 'Correct, mais ne relachez pas vos efforts !';
                    str2 = `dont ${nbCorrect} sont justes !`;
                    color = [220, 255, 0];
                    break;
            }
            let message = `${str1} Vous avez répondu à ${nbQuestions} questions, ${str2}`;

            return {message, color};
        }
    }

    return QuizCollabP;
}