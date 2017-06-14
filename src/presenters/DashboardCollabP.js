const FDashboardCollabV = require('../views/DashboardCollabV').DashboardCollabV;

exports.DashboardCollabP = function(globalVariables) {
    const DashboardCollabV = FDashboardCollabV(globalVariables),
        Presenter = globalVariables.Presenter;

    class DashboardCollabP extends Presenter{

        constructor(state,user, formations){
            super(state);
            this.view = new DashboardCollabV(this);
            this.formations = formations;
            this.formations.loadAllFormations();
            this.user = user;
        };

        clickOnFormation(formation){
            this.state.loadPresenterFormationCollab(formation,this.user);
        }

        getFormations(){
            return this.formations.getFormations();
        }
        updateSingleFormationStars(formationId, starId, versionId){
            return this.formations.updateSingleFormationStars(formationId,starId,versionId);
        }
        getNotes(){
            return this.user.getNotes();
        }
    }
    return DashboardCollabP;
}