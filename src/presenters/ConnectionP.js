/**
 * Created by DMA3622 on 03/05/2017.
 */
const Connection = require('./Connection').Connection;

exports.ConnectionP = function(globalVariables) {
    const connectionView = Connection(globalVariables);

    class ConnectionP {
        constructor() {
            this.view = new connectionView(this);
            var _declareTextFields = () => {
                this._fields = [
                    {
                        title: "Adresse mail :",
                        errorMessage: "L'adresse email n'est pas valide",
                        index: 2
                    },
                    {
                        title: "Mot de passe :",
                        secret: true,
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        index: 3
                    }
                ];
                this.focusedField = null;
            };

            _declareTextFields();
        }
        getFields () {
            return this._fields;
        }
        displayView(){
            this.view.display();
        }
    }
    return ConnectionP;
}
