/**
 * Created by DMA3622 on 05/05/2017.
 */
const QuizAdminV = require('./QuizAdminV').QuizAdminV;

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
            console.log(quizData);
            this.setLabel(quizData.label);
            this.setQuestions(quizData.questions);
            const messageError = "Il manque des informations";

            const getObjectToSave = () => {
                return {
                    id: this.getId(),
                    index: this.getIndex(),
                    levelIndex: this.getLevelIndex(),
                    formationId: this.getFormationId(),
                    label: this.getLabel(),
                    lastQuestionIndex: this.getLastIndex(),
                    questions: this.getQuestions()
                };
            };
            let quizToSave = getObjectToSave();
            switch (true) {

            }
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

        saveNewLabel(quizData) {
            //
        }

        renameQuiz(label) {
            this.quiz.setLabel(label);
            const messageError = "Vous devez remplir correctement le nom du quiz.";
            if (label && label !== this.quiz.labelDefault && label.match(this.regex)) {
                const getObjectToSave = () => {
                    return {
                        id: this.getId(),
                        index: this.getIndex(),
                        formationId: this.getFormationId(),
                        label: this.getLabel(),
                        lastQuestionIndex: this.getLastIndex(),
                        levelIndex: this.getLevelIndex(),
                        questions: this.getQuestions()
                    };
                };
                if (this.quiz.getId()) {
                    return this.quiz.renameQuiz(getObjectToSave()).then(data => {
                        // console.log(data);
                        // if (data && data.ack == "ok") {
                        //     return data.ack;
                        // } else {
                        //     return "error";
                        // }
                        data.message && this.view.displayMessage(data.message);
                        return data;
                    }).catch(error => {
                        console.log(error);
                        return error;
                    });
                }
                // else{
                //     return this.formation.addNewFormation(getObjectToSave()).then(data => {
                //         this.view.displayMessage(data.message);
                //         return data.status;
                //     })
                // }
            } else {
                this.view.displayMessage(messageError);
                return Promise.resolve(false);
            }

        }

        setLabel(quizLabel) {
            // check du nom du quiz à implémenter
            this.quiz.setLabel(quizLabel);
        }

        setQuestions(questions) {
            // check des questions à implémenter
            this.quiz.setQuestions(questions);
        }
    }

    return QuizAdminP;
}