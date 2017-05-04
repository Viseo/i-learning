const dashboard = require('./DashboardAdminP').DashboardAdminP;
const connection = require('./ConnectionP').ConnectionP;
const register = require('./RegisterP').RegisterP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.dashboardAdminP = dashboard(globalvariables);
    globalvariables.connectionP = connection(globalvariables);
    globalvariables.registerP = register(globalvariables);

}
