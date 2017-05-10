const DashboardAdmin = require('./DashboardAdminV').DashboardAdmin;

exports.DashboardAdminP = function(globalVariables) {
    const DashboardView = DashboardAdmin(globalVariables),
        Presenter = globalVariables.Presenter,
        TITLE_FORMATION_REGEX = /^([A-Za-z0-9.:+#@%éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ'-]){2,50}$/g;


    class DashboardAdminP extends Presenter{
        constructor(state, formations) {
            super(state);
            this.view = new DashboardView(this);
            this.formations = formations;
            this.formationsList = formations.getFormations();
        }
        getLabels(){
            return this.formations.getFormations().map(f => f.label);
        }
        getFormations(){
            return this.formations.getFormations();
        }

        createFormation(label){
            let checkLabel = (label)=>{
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
            }
        }
        updateFormations(){
            this.formationsList = this.formations.getFormations();
        }

        miniatureClickHandler(formation){
            this.state.loadPresenterFormationAdmin(formation);
        }
    }
    return DashboardAdminP;
}