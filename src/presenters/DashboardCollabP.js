const FDashboardCollabV = require('./DashboardCollabV').DashboardCollabV;

exports.DashboardCollabP = function(globalVariables) {
    const DashboardCollabV = FDashboardCollabV(globalVariables);

    class DashboardCollabP {
        constructor(formations){
            this.view = new DashboardCollabV(this);
            this.formations = formations;
        };

        displayView(){
            this.view.display();
        }
    }
    return DashboardCollabP;
};