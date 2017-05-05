const FormationAdmin = require('../views/FormationAdminV').FormationAdminV;

exports.FormationAdminP = function(globalVariables){
    const FormationAdminV = FormationAdmin(globalVariables);

    class FormationsAdminP{
        constructor(parentPresenter, formation){
            this.formation = formation;
            this.view = new FormationAdminV(this);
            this.parentPresenter = parentPresenter;
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
    }

    return FormationsAdminP;
}