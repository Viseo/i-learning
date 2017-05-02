const dashboard = require('./DashboardAdminP').DashboardAdminP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.dashboardAdminP = dashboard(globalvariables);
}
