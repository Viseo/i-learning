const FPresenter = require('./Presenter').Presenter;
const FView = require('../views/View').View;
const dashboard = require('./DashboardAdminP').DashboardAdminP;
const FDashboardCollabP = require('./DashboardCollabP').DashboardCollabP;
const FFormationAdminP = require('./FormationAdminP').FormationAdminP;
const FFormationCollabP = require('./FormationCollabP').FormationCollabP;
const connection = require('./ConnectionP').ConnectionP;
const FQuizCollab = require('./QuizCollabP').QuizCollabP;
const FQuizAdminP = require('./QuizAdminP').QuizAdminP;
const FDollAdminP = require('./DollAdminP').DollAdminP;
const FDollCollabP = require('./DollCollabP').DollCollabP;

exports.PresenterFactory = function(globalvariables){
    globalvariables.Presenter = FPresenter(globalvariables).Presenter;
    globalvariables.View = FView(globalvariables).View;
    globalvariables.dashboardAdminP = dashboard(globalvariables);
    globalvariables.DashboardCollabP = FDashboardCollabP(globalvariables);
    globalvariables.FormationAdminP = FFormationAdminP(globalvariables);
    globalvariables.FormationCollabP = FFormationCollabP(globalvariables);
    globalvariables.ConnectionP = connection(globalvariables);
    globalvariables.QuizCollabP = FQuizCollab(globalvariables);
    globalvariables.QuizAdminP = FQuizAdminP(globalvariables);
    globalvariables.DollAdminP = FDollAdminP(globalvariables);
    globalvariables.DollCollabP = FDollCollabP(globalvariables);
};
