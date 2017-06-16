/**
 * Created by DMA3622 on 05/05/2017.
 */
const QuizAdminV = require('../views/QuizAdminV').QuizAdminV;

exports.QuizAdminP = function (globalVariables) {
    const QuizQuestionV = require('../views/QuizQuestionV').QuizQuestionV;
    const QuizQuestionView = QuizQuestionV(globalVariables);
    const QuizAdminView = QuizAdminV(globalVariables),
        Presenter = globalVariables.Presenter,
        TITLE_QUIZ_REGEX = /^([A-Za-z0-9.,;:!?()éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ °'-]){0,50}$/g;

    class QuizAdminP extends Presenter {
        constructor(state, quiz) {
            super(state);
            this.quiz = quiz;
            this.view = new QuizAdminView(this);
            this.previewVue = new QuizQuestionView(this);
            this.mediaLibrary = state.getMediasLibrary();
            this.regex = TITLE_QUIZ_REGEX;
        }

        previewQuiz(questionIndex){
            this.previewIndex = questionIndex;
            this.previewVue.display();
            this.previewVue.displayResult();
        }

        getCurrentQuestionLabel(){
            return this.quiz.getQuestionLabel(this.previewIndex);
        }

        getCurrentQuestionImageSrc(){
            return this.quiz.getQuestionImageSrc(this.currentQuestionIndex);
        }

        isLastAnsweredQuestion(){
            return true;
        }
        isFirstQuestion(){
            return true;
        }
        getCurrentAnswers(){
            return this.quiz.getAnswers(this.previewIndex);
        }
        isMultipleChoice(){
            return this.quiz.isMultipleChoice();
        }
        getScore(){
            return {
                message: "",
                color: [],
                emojiSrc: ""
            }
        }
        getVideos(){
            return this.mediaLibrary.getVideos();
        }
        getCurrentAnswered(){
            return [];
        }
        getCorrectAnswersIndex(){
            return this.quiz.getCorrectAnswersIndex(this.previewIndex);
        }

        uploadImage(file, progressDisplay){
            return this.state.uploadImage(file, progressDisplay);
        }
        uploadVideo(file, progressDisplay){
            return this.state.uploadVideo(file, progressDisplay);
        }

        returnHandler(){
            this.view.display();
        }

        updateQuiz(quizViewData) {
            const getObjectToSave = () => {
                return {
                    id: this.getId(),
                    gameIndex: this.getIndex(),
                    levelIndex: this.getLevelIndex(),
                    formationId: this.getFormationId(),
                    label: this.getLabel(),
                    lastQuestionIndex: this.getLastIndex(),
                    questions: this.getQuestions(),
                    type: 'Quiz'
                };
            };

            if (quizViewData.label && quizViewData.label !== this.quiz.labelDefault && quizViewData.label.match(this.regex)) {
                this.setLabel(quizViewData.label);
                this.setQuestions(quizViewData.questions);
                let quizToSave = getObjectToSave();
                if (this.isQuizValid()) {
                    return this.quiz.updateQuiz(quizToSave);
                    // if (this.replaceFormation()) {
                    //     return this.quiz.updateQuiz(quizToSave)
                    // }
                } else {
                    return Promise.reject("Quiz non valide");
                }
            } else {
                return Promise.reject("Le nom du quiz est incorrect");
            }
        }

        // renameQuiz(label) {
        //     this.setLabel(label);
        //     if (label && label !== this.quiz.labelDefault && label.match(this.regex)) {
        //         const getObjectToSave = () => {
        //             return {
        //                 id: this.getId(),
        //                 gameIndex: this.getIndex(),
        //                 levelIndex: this.getLevelIndex(),
        //                 formationId: this.getFormationId(),
        //                 label: this.getLabel(),
        //                 lastQuestionIndex: this.getLastIndex(),
        //                 questions: this.getQuestions(),
        //                 type: 'Quiz'
        //             };
        //         };
        //         this.replaceFormation();
        //         return this.quiz.renameQuiz(getObjectToSave());
        //     } else {
        //         return Promise.reject("Vous devez remplir correctement le nom du quiz.");
        //     }
        // }

        isQuizValid() {
            return this.quiz.isValid();
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

        replaceFormation() {
            this.state.replaceFormation();
        }

        setLabel(quizLabel) {
            this.quiz.setLabel(quizLabel);
        }

        setQuestions(questions) {
            this.quiz.setQuestions(questions);
        }

        setLastQuestionIndex(index){
            this.quiz.setLastQuestionIndex(index);
        }
        setImageOnMiniature(panel, src){
            panel.setImage(src);
            this.view._();
            //miniature.replaceFormation({imageOnly:true});
        }
    }

    return QuizAdminP;
}