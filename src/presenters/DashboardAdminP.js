const util = require('../Util').Utils;
const DashboardAdmin = require('./DashboardAdmin').DashboardAdmin;

exports.DashboardAdminP = function(globalVariables) {
    const dashboardView = DashboardAdmin(globalVariables),
        TITLE_FORMATION_REGEX = /^([A-Za-z0-9.:+#@%éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ'-]){2,50}$/g;


    class DashboardAdminP {
        constructor(formations) {
            this.view = new dashboardView(this);
            this.formations = formations;
            this.formationsList = formations.getFormations();
        }
        getLabels(){
            return this.formations.getFormations().map(f => f.label);
        }
        getFormations(){
            return this.formations.getFormations();
        }
        displayView(){
            this.view.display();
        }
        createFormation(label){
            let checkLabel = (label)=>{
                if (label == 'Ajouter une formation'){
                    return false;
                }
                return label.match(TITLE_FORMATION_REGEX);
            }
            if(checkLabel(label)){
                let newFormation = this.formations.createFormation(label);
                this.updateFormations();
                this.view.addFormationMiniature(newFormation);
            }
            else{
                let message = label.length<2 ? 'Attention : Minimum 2 caractères.' : 'Caractère(s) non autorisé(s).';
                if (label == 'Ajouter une formation'){
                    message = 'Veuillez entrer un titre valide.'
                }
                this.view.displayErrorMessage(message);
            }
        }
        updateFormations(){
            this.formationsList = this.formations.getFormations();
        }
    }
    return DashboardAdminP;
}