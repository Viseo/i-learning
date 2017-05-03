const util = require('../Util').Utils;
const DashboardAdmin = require('./DashboardAdmin').DashboardAdmin;

exports.DashboardAdminP = function(globalVariables) {
    const dashboardView = DashboardAdmin(globalVariables);

    class DashboardAdminP {
        constructor(formations) {
            this.view = new dashboardView(this);
            this.formations = formations._formations;
        }
        getLabels(){
            return this.formations.getFormations().map(f => f.label);
        }
        getFormations(){
            return this.formations;
        }
        displayView(){
            this.view.display();
        }
    }
    return DashboardAdminP;
}