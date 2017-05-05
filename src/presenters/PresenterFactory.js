const dashboard = require('./DashboardAdminP').DashboardAdminP;
const FDashboardCollabP = require('./DashboardCollabP').DashboardCollabP;
const FFormationAdminP = require('./FormationsdminP').FormationAdminP;
const connection = require('./ConnectionP').ConnectionP;
const register = require('./RegisterP').RegisterP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.dashboardAdminP = dashboard(globalvariables);
    globalvariables.DashboardCollabP = FDashboardCollabP(globalvariables);
    globalvariables.FormationsAdminP = FFormationAdminP(globalvariables);
    globalvariables.ConnectionP = connection(globalvariables);
    globalvariables.RegisterP = register(globalvariables);
};
