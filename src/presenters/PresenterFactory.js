const dashboard = require('./DashboardAdminP').DashboardAdminP;
const connection = require('./ConnectionP').ConnectionP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.dashboardAdminP = dashboard(globalvariables);
    globalvariables.connectionP = connection(globalvariables);
}
