const FormationAdmin = require('../views/FormationAdminV').FormationAdminV;

exports.FormationAdminP = function(globalVariables){
    const FormationAdminV = FormationAdmin(globalVariables);

    class FormationsAdminP{
        constructor(formation){
            this.formation = formation;
            this.view = new FormationAdminV(this);
        }
        displayView(){
            this.view.display();
        }
        getLabel(){
            return this.formation.label;
        }

        returnHandler(){
            let dashboardAP = new globalVariables.dashboardAdminP();
            this.view.flush();
            dashboardAP.displayView();
        }
    }

    return FormationsAdminP;
}