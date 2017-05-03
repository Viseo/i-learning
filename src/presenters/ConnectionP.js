/**
 * Created by DMA3622 on 03/05/2017.
 */
const ConnectionV = require('../views/ConnectionV').ConnectionV;

exports.ConnectionP = function(globalVariables) {
    const connectionView = ConnectionV(globalVariables);

    class ConnectionP {
        constructor() {
            this.view = new connectionView(this);
            var _declareTextFields = () => {
                this._fields = [
                    {
                        title: "Adresse mail :",
                        type: "text",
                        errorMessage: "L'adresse email n'est pas valide",
                        index: 2,
                        iconSrc: "../images/envelope.png",
                        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    },
                    {
                        title: "Mot de passe :",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        index: 3,
                        iconSrc: "../images/padlock.png",
                        pattern: /^[ -~]{6,63}$/
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
