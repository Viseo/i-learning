const FDashboardCollabV = require('../views/DashboardCollabV').DashboardCollabV;

exports.DashboardCollabP = function(globalVariables) {
    const DashboardCollabV = FDashboardCollabV(globalVariables);

    class DashboardCollabP {

        constructor(state,user, formations){
            this.view = new DashboardCollabV(this);
            this.formations = formations;
            this.user = user;
            this.state=state;

            //todo
            if(this.hasLastAction()){
                //alert("Todo Got last action");
            }
        };

        hasLastAction(){
            return this.user.hasLastAction();
        }

        displayView(){
            this.view.display();
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
        flushView(){
            this.view.flush();
        }

    }
    return DashboardCollabP;
}