/**
 * Created by TBE3610 on 05/05/2017.
 */

const QuizQuestionV = require('../views/QuizQuestionV').QuizQuestionV;
const QuizScoreV = require('../views/QuizScoreV').QuizScoreV;

exports.QuizCollabP = function (globalVariables) {
    const QuizQuestionView = QuizQuestionV(globalVariables);
    const QuizScoreView = QuizScoreV(globalVariables),
        Presenter = globalVariables.Presenter;

    class QuizCollabP extends Presenter{
        constructor(state, quiz) {
            super(state);
            this.questionView = new QuizQuestionView(this);
            this.scoreView = new QuizScoreView(this);
            this.view;
            this.quiz = quiz;
            this.currentQuestionIndex = 0;
            this.lastAnsweredIndex = 0;
            this.selectedAnswers = [];
            this.isDone = this.quiz.isDone();
        }

        displayView() {
            if (this.isDone) {
                this.displayScoreView();
            } else {
                this.displayQuestionView(this.getAnswered().length);
            }
        }

        displayQuestionView(questionIndex) {
            if(this.view) this.flushView();
            this.view = this.questionView;
            if (questionIndex !== undefined) {
                this.currentQuestionIndex = questionIndex;
            }
            this.questionView.display();
            if (this.isDone) this.questionView.displayResult();
        }

        displayScoreView() {
            if(this.view) this.flushView();
            this.view = this.scoreView;
            this.scoreView.display();
        }

        returnHandler() {
            if (this.isDone && this.view === this.questionView) {
                this.displayScoreView();
            } else {
                this.returnToOldPage();
            }
        }

        saveProgress(){
            this.state.saveProgress();
        }

        previousQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.displayQuestionView();
            }
        }

        nextQuestion() {
            if (this.currentQuestionIndex < this.getNbQuestions() - 1) {
                this.currentQuestionIndex++;
                if (this.lastAnsweredIndex < this.currentQuestionIndex) this.lastAnsweredIndex = this.currentQuestionIndex;
                this.displayQuestionView();
            }else {
                this.isDone = true;
                this.displayScoreView();
            }
        }

        selectAnswer(index) {
            if(this.isMultipleChoice()){
                let answerIndex = this.selectedAnswers.indexOf(index);
                if(answerIndex === -1){
                    this.selectedAnswers.push(index);
                }else {
                    this.selectedAnswers.splice(answerIndex, 1);
                }
            }else {
                this.validateQuestion(this.currentQuestionIndex, [index]);
                this.nextQuestion();
            }
        }

        resetAnswers(){
            this.selectedAnswers = [];
        }

        confirmQuestion(){
            this.validateQuestion(this.currentQuestionIndex, this.selectedAnswers);
            this.nextQuestion();
        }

        validateQuestion(questionIndex, answers){
            this.quiz.validateQuestion(questionIndex, answers);
            this.saveProgress();
        }

        getLabel() {
            return this.quiz.getLabel();
        }

        getId(){
            return this.quiz.getId();
        }

        getNbQuestions() {
            return this.quiz.getNbQuestions();
        }

        getNbQuestionsCorrect() {
            return this.quiz.getNbQuestionsCorrect();
        }

        getCurrentQuestion(){
            return this.quiz.getQuestion(this.currentQuestionIndex);
        }

        isMultipleChoice(){
            return this.quiz.isMultipleChoice(this.currentQuestionIndex);
        }

        isFirstQuestion() {
            return this.currentQuestionIndex === 0;
        }

        isLastAnsweredQuestion() {
            return this.currentQuestionIndex === this.lastAnsweredIndex;
        }

        getCurrentAnswers() {
            return this.quiz.getAnswers(this.currentQuestionIndex);
        }

        getCurrentAnswered() {
            return this.getAnswered()[this.currentQuestionIndex];
        }
        getAnswered(){
            return this.quiz.getAnswered();
        }
        getCorrectAnswersIndex() {
            return this.quiz.getCorrectAnswersIndex(this.currentQuestionIndex);
        }

        getWrongQuestions() {
            return this.quiz.getWrongQuestions();
        }

        getScore() {
            let nbQuestions = this.getNbQuestions();
            let nbCorrect = this.getNbQuestionsCorrect();
            let percentGoodQuestion = nbCorrect / nbQuestions;
            let message, color, emojiSrc, str1, str2;
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
            message = `${str1} Vous avez répondu à ${nbQuestions} questions, ${str2}`;
            if(percentGoodQuestion == 0.5){
                emojiSrc = '/images/emoji/meh.png';
            }else if(percentGoodQuestion > 0.5){
                emojiSrc = '/images/emoji/smile.png';
            }else {
                emojiSrc = '/images/emoji/angry.png';
            }
            return {message, color, emojiSrc};
        }
    }

    return QuizCollabP;
}