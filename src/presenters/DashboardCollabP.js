const FDashboardCollabV = require('./DashboardCollabV').DashboardCollabV;

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

        clickOnFormation(formation){
            alert(JSON.stringify(formation));
        }

        getFormations(){
            return this.formations.getFormations();
        }
    }
    return DashboardCollabP;
};