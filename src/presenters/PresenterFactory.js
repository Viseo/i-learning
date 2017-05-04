const dashboard = require('./DashboardAdminP').DashboardAdminP;
const FDashboardCollabP = require('./DashboardCollabP').DashboardCollabP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.dashboardAdminP = dashboard(globalvariables);
    globalvariables.DashboardCollabP = FDashboardCollabP(globalvariables);
};
