const util = require('../Util').Utils;
const DashboardAdmin = require('./DashboardAdmin').DashboardAdmin;

exports.DashboardAdminP = function(globalVariables) {
    const dashboardView = DashboardAdmin(globalVariables);

    class DashboardAdminP {
        constructor(formations) {
            this.view = new dashboardView(this);
            this.formations = formations;
        }
        getLabels(){
            return this.formations.getFormations().map(f => f.label);
        }
        displayView(){
            this.view.display();
        }
    }
    return DashboardAdminP;
}