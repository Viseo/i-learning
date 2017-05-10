const FPresenter = require('./Presenter').Presenter;
const FView = require('../views/View').View;
const dashboard = require('./DashboardAdminP').DashboardAdminP;
const FDashboardCollabP = require('./DashboardCollabP').DashboardCollabP;
const FFormationAdminP = require('./FormationsdminP').FormationAdminP;
const connection = require('./ConnectionP').ConnectionP;
const register = require('./RegisterP').RegisterP;
const FQuizCollab = require('./QuizCollabP').QuizCollabP;
const FQuizAdminP = require('./QuizAdminP').QuizAdminP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.Presenter = FPresenter(globalvariables).Presenter;
    globalvariables.View = FView(globalvariables).View;
    globalvariables.dashboardAdminP = dashboard(globalvariables);
    globalvariables.DashboardCollabP = FDashboardCollabP(globalvariables);
    globalvariables.FormationsAdminP = FFormationAdminP(globalvariables);
    globalvariables.ConnectionP = connection(globalvariables);
    globalvariables.RegisterP = register(globalvariables);
    globalvariables.QuizCollabP = FQuizCollab(globalvariables);
    globalvariables.QuizAdminP = FQuizAdminP(globalvariables);
};
