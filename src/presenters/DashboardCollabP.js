const FDashboardCollabV = require('../views/DashboardCollabV').DashboardCollabV;

exports.DashboardCollabP = function(globalVariables) {
    const DashboardCollabV = FDashboardCollabV(globalVariables);

    class DashboardCollabP {
        constructor(user, formations){
            this.view = new DashboardCollabV(this);
            this.formations = formations;
            this.user = user;
        };

        displayView(){
            this.view.display();
        }

        loadFormation(formation){
            this.formations.loadFormation(formation)
        }

        clickOnFormation(formation){
            alert(JSON.stringify(formation));
            /*this.formations.loadFormation(formation);
            let formationPresenter = new globalVariables.FormationsAdminP(formation);
            this.view.flush();
            formationPresenter.displayView();*/
        }

        getFormations(){
            return this.formations.getFormations();
        }
    }
    return DashboardCollabP;
};