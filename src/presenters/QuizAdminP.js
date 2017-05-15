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

        }

        updateQuiz(quizData) {
            this.saveNewLabel(quizData);
            this.saveNewQuestions(quizData);
            // return {status: "ok"};
            /*let checkLabel = (label)=>{
             if (label == 'Ajouter une formation'){
             return {status: false, error: 'Veuillez entrer un titre valide.'};
             }
             let filter = (form)=>{
             return form.label == label;
             }
             let testArray = this.formationsList.filter(filter);
             if (testArray.length != 0){
             return {status: false, error: 'Nom déjà utilisé'}
             }
             if (label.length<2){
             return {status: false, error:'Attention : Minimum 2 caractères.'}
             }
             if (!label.match(TITLE_FORMATION_REGEX)){
             return {status: false, error:'Caractère(s) non autorisé(s).'}
             }
             return {status: true};
             }
             let check = checkLabel(label);
             if(check.status){
             this.formations.createFormation(label).then(data=>{
             if(data.status) {
             let newFormation = data.formation;
             this.updateFormations();
             this.view.addFormationMiniature(newFormation);
             }
             else{
             this.view.displayErrorMessage(data.error);
             }
             });
             }
             else{
             this.view.displayErrorMessage(check.error);
             }*/
        }

        getFormationLabel() {
            //return this.parentPresenter.getLabel();
            return "RIEN";
        }

        getLabel() {
            return this.quiz.label;
        }

        getImages() {
            return this.mediaLibrary.getImages();
        }

        getQuestions() {
            return this.quiz.questions;
        }

        getLastQuestionIndex(){
            return this.quiz.getLastQuestionIndex();
        }

        saveNewLabel(quizData) {
            //
        }

        saveNewQuestions(quizData) {

        }
    }

    return QuizAdminP;
}