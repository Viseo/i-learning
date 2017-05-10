const FormationAdmin = require('../views/FormationAdminV').FormationAdminV;

exports.FormationAdminP = function(globalVariables){
    const FormationAdminV = FormationAdmin(globalVariables),
    TITLE_FORMATION_REGEX = /^([A-Za-z0-9.:+#@%éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ'-]){2,50}$/g;
    class FormationsAdminP{
        constructor(state, formation){
            this.formation = formation;
            this.view = new FormationAdminV(this);
            this.regex = TITLE_FORMATION_REGEX;
            this.state = state;
        }
        displayView(){
            this.view.display();
        }
        getLabel(){
            return this.formation.label;
        }
        getFormation(){
            return this.formation;
        }

        returnHandler(){
            this.state.returnToOldPage();
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

        flushView(){
            this.view.flush();
        }

        getGamesLibrary(){
            return this.state.getGamesLibrary();
        }
    }

    return FormationsAdminP;
}