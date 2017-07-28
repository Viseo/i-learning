/**
 * Created by minhhuyle on 29/05/2017.
 */
const FDollCollabV = require('../views/DollCollabV').DollCollabV;

exports.DollCollabP = function(globalVariables) {
    const DollCollabV = FDollCollabV(globalVariables),
        Presenter = globalVariables.Presenter;

    class DollCollabP extends Presenter{
        constructor(state, doll){
            super(state);
            this.doll = doll;
            this.view = new DollCollabV(this);
        }

        getLabel(){
            return this.doll.getLabel();
        }

        getElements(){
            return this.doll.getElements();
        }

        getObjectives(){
            return this.doll.getObjectives();
        }

        getResponses(){
            return this.doll.getResponses();
        }

        checkResponses(array){
            return this.doll.checkResponses(array);
        }

        getUsername() {
            return this.state.getUsername();
        }

        setUsername(username) {
            return this.state.setUsername(username);
        }
    }
    return DollCollabP;
}
