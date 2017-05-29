const DollAdminV = require('../views/DollAdminV').DollAdminV;

exports.DollAdminP = function(globalVariables) {
    const DollView = DollAdminV(globalVariables),
        Presenter = globalVariables.Presenter;

    class DollAdminP extends Presenter{
        constructor(state, doll){
            super(state);
            this.doll = doll;
            this.view = new DollView(this);
        }

        getLabel(){
            return this.doll.getLabel();
        }

    }
return DollAdminP;
}
