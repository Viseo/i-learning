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

        onClickGame(game){
            this.state.loadPresenterGameCollab(game);
        }
    };

    return FormationCollabP;
}
