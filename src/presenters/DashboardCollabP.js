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

            //todo
            if(this.hasLastAction()){
                //alert("Todo Got last action");
            }
        };

        hasLastAction(){
            return this.user.hasLastAction();
        }

        loadFormation(formation){
            this.formations.loadFormation(formation)
        }

        //todo
        clickOnFormation(formation){
            this.state.loadPresenterFormationCollab(formation,this.user);
        }

        getFormations(){
            return this.formations.getFormations();
        }


    }
    return DashboardCollabP;
}