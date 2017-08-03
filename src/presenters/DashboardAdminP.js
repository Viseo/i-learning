const DashboardAdmin = require('../views/DashboardAdminV').DashboardAdmin;

exports.DashboardAdminP = function(globalVariables) {
    const DashboardView = DashboardAdmin(globalVariables),
        Presenter = globalVariables.Presenter,
        Validator = globalVariables.Validator;

    class DashboardAdminP extends Presenter{
        constructor(state, formations) {
            super(state);
            this.view = new DashboardView(this);
            this.formations = formations;
            this.mediaLibrary = state.getMediasLibrary();
            this.formationsList = formations.getFormations();
        }
        getFormations(){
            return this.formations.getFormations();
        }

        getImages() {
            return this.mediaLibrary.getImages();
        }

        setImageOnFormation(formation, src){
            formation.setImage(src);
            this.view.displayMiniatures();
            formation.replaceFormation({imageOnly:true});
        }
        createFormation(label){
            let check = Validator.FormationValidator.checkNameFormation(label, this.formationsList);
            if(check.status){
                this.formations.createFormation(label).then(data=>{
                    if(data.status) {
                        this.updateFormations();
                        this.view.displayMiniatures();
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

        uploadImage(file){
            return this.state.uploadImage(file);
        }

        enterFormation(formation){
            this.state.loadPresenterFormationAdmin(formation);
        }

        getUsername() {
            return this.state.getUsername();
        }

        setUsername(username) {
            return this.state.setUsername(username);
        }
    }
    return DashboardAdminP;
}