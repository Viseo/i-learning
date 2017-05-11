const FormationCollab = require('../views/FormationCollabV').FormationCollabV;

exports.FormationCollabP = function(globalVariables){
    const FormationsCollabV = FormationCollab(globalVariables);


    class FormationCollabP {

        constructor(state, formation){
            this.formation = formation;
            this.view = new FormationsCollabV(this);
            this.state = state;
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


    };



    return FormationCollabP;
}
