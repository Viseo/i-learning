const FormationAdmin = require('../views/FormationAdminV').FormationAdminV;

exports.FormationAdminP = function(globalVariables){
    const FormationAdminV = FormationAdmin(globalVariables),
    TITLE_FORMATION_REGEX = /^([A-Za-z0-9.:+#@%éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ'-]){2,50}$/g,
        Presenter = globalVariables.Presenter;
    class FormationAdminP extends Presenter{
        constructor(state, formation){
            super(state);
            this.formation = formation;
            this.view = new FormationAdminV(this);
            this.regex = TITLE_FORMATION_REGEX;
            this.levelsTab = formation.getLevelsTab();
        }

        getLabel(){
            return this.formation.label;
        }
        getFormation(){
            return this.formation;
        }

        renameFormation(label){
            this.formation.setLabel(label);
            const messageError = "Vous devez remplir correctement le nom de la formation.";
            if (label && label !== this.formation.labelDefault && label.match(this.regex)) {
                const getObjectToSave = () => {
                    return {label: this.formation.label};
                };
                if (this.formation.getId()){
                    return this.formation.replaceFormation(getObjectToSave()).then(data => {
                        this.view.displayMessage(data.message);
                        return data.status;
                    });
                }
                else{
                    return this.formation.addNewFormation(getObjectToSave()).then(data => {
                        this.view.displayMessage(data.message);
                        return data.status;
                    })
                }
            } else {
                this.view.displayMessage(messageError);
                return Promise.resolve(false);
            }

        }
        moveGame(game,level,column){
            this.formation.moveGame(game,level,column);
            this.view.displayGraph();
        }
        removeGame(game){
            this.formation.removeGame(game);
            this.view.displayGraph();
        }
        removeLevel(level){
            this.formation.removeLevel(level);
            this.view.displayGraph();
        }
        checkLink(parentGame, childGame){
            return this.formation.checkLink(parentGame, childGame);
        }
        createLink(parent, child){
            if (this.checkLink(parent,child)){
                this.formation.createLink(parent,child);
            }
            this.view.updateAllLinks();
        }
        getLinks(){
            return this.formation.getLinks();
        }
        addLevel(level){
            this.formation.addLevel(level);
        }
        saveFormation() {
            const messageError = "Vous devez remplir correctement le nom de la formation.";

            if (this.formation.label && this.formation.label !== this.formation.labelDefault && this.formation.label.match(this.regex)) {
                const getObjectToSave = () => {
                    if (this.imageSrc) {
                        return {
                            label: this.formation.label,
                            gamesCounter: this.formation.gamesCounter,
                            links: this.formation.links,
                            levelsTab: this.formation.levelsTab,
                            imageSrc: this.formation.imageSrc,
                            status: this.formation.status
                        }
                    }
                    else {
                        return {
                            label: this.formation.label,
                            gamesCounter: this.formation.gamesCounter,
                            links: this.formation.links,
                            levelsTab: this.formation.levelsTab,
                            status: this.formation.status
                        };
                    }
                };

                if (this.formation.getId()) {
                    return this.formation.replaceFormation(getObjectToSave()).then(data => {
                        this.view.displayMessage(data.message);
                        return data.status;
                    });
                }
                else {
                    return this.formation.addNewFormation(getObjectToSave()).then(data => {
                        this.view.displayMessage(data.message);
                        return data.status;
                    })
                }
            } else {
                this.view.displayMessage(messageError);
                return Promise.resolve(false);
            }
        }

        loadPresenterGameAdmin(game){
            this.state.loadPresenterGameAdmin(game);
        }

        publishFormation(){
            const messageErrorNoNameFormation = "Vous devez remplir le nom de la formation.",
                messageErrorNoGame = "Veuillez ajouter au moins un jeu à votre formation.";

            if (this.formation.levelsTab.length === 0) {
                this.view.displayMessage(messageErrorNoGame);
                return;
            }
            if (!this.formation.label || this.formation.label === this.formation.labelDefault || !this.formation.label.match(this.regex)) {
                this.view.displayMessage(messageErrorNoNameFormation);
                return;
            }
            let check = this.formation.checkAllGameValidity();
            if (check) {
                this.formation.status = 'Published'
                this.saveFormation();
            } else {
                //this.displayPublicationMessage(message[0]);
            }
        }

        loadQuiz(quiz) {
            // this.quizz.loadQuiz(quizz);
            this.state.loadPresenterQuizAdmin(quiz);
        }

        getGamesLibrary(){
            return this.state.getGamesLibrary();
        }
    }

    return FormationAdminP;
}