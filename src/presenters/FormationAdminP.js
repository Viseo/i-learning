const FormationAdmin = require('../views/FormationAdminV').FormationAdminV;

exports.FormationAdminP = function(globalVariables){
    const FormationAdminV = FormationAdmin(globalVariables),
    TITLE_FORMATION_REGEX = /^([A-Za-z0-9.:+#@%éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ'-]){2,50}$/g;
    class FormationsAdminP{
        constructor(parentPresenter, formation){
            this.formation = formation;
            this.view = new FormationAdminV(this);
            this.parentPresenter = parentPresenter;
            this.regex = TITLE_FORMATION_REGEX;
        }
        displayView(){
            this.view.display();
        }
        getLabel(){
            return this.formation.label;
        }

        returnHandler(){
            this.view.flush();
            this.parentPresenter.fromReturn();
        }
        renameFormation(label){
            this.formation.setLabel(label);
            const messageError = "Vous devez remplir correctement le nom de la formation.";
            if (label && label !== this.formation.labelDefault && label.match(this.regex)) {
                const getObjectToSave = () => {
                    return {label: this.formation.label};
                };
                if (this.formation.getId()){
                    this.formation.replaceFormation(getObjectToSave()).then(message => {
                        this.view.displayMessage(message);
                    });
                }
                else{
                    this.formation.addNewFormation(getObjectToSave()).then(message => {
                        this.view.displayMessage(message);
                    })
                }
            } else {
                this.view.displayMessage(messageError);
            }

        }
    }

    return FormationsAdminP;
}