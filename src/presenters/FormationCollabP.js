const FormationCollab = require('../views/FormationCollabV').FormationCollabV;

exports.FormationCollabP = function(globalVariables){
    const FormationsCollabV = FormationCollab(globalVariables);


    class FormationCollabP {

        constructor(state, formation,user){
            this.formation = formation;
            this.view = new FormationsCollabV(this);
            this.state = state;
            this.user = user;
        }

        displayView(){
            this.view.display();
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
        flushView(){
            this.view.flush();
        }

        getFormationWithProgress (id) {
            return this.user.getFormationWithProgress(id).then(data=> {
                this.formation.loadFormationFromUser(data.formation);
              return this.formation
           })
        }

        onClickGame(game){
            this.state.loadPresenterGameCollab(game);
        }

    };



    return FormationCollabP;
}
