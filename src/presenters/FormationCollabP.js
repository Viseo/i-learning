const FormationCollab = require('../views/FormationCollabV').FormationCollabV;

exports.FormationCollabP = function(globalVariables){
    const FormationsCollabV = FormationCollab(globalVariables),
        Presenter = globalVariables.Presenter;

    class FormationCollabP extends Presenter{

        constructor(state, formation,user){
            super(state);
            this.formation = formation;
            this.view = new FormationsCollabV(this);
            this.user = user;
        }

        getLabel(){
            return this.formation.label;
        }
        getFormation(){
            return this.formation;
        }
        returnHandler(){
            this.state.returnToOldPage();
        }

        enterGame(game){
            this.state.loadPresenterGameCollab(game);
        }

        requirementsForThis(gameId){
            return this.formation.requirementsForThis(gameId);
        }
    };

    return FormationCollabP;
}
