const dashboard = require('./DashboardAdminP').DashboardAdminP;
const FDashboardCollabP = require('./DashboardCollabP').DashboardCollabP;
const FFormationAdminP = require('./FormationsdminP').FormationAdminP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.dashboardAdminP = dashboard(globalvariables);
    globalvariables.DashboardCollabP = FDashboardCollabP(globalvariables);
    globalvariables.FormationsAdminP = FFormationAdminP(globalvariables);
};
