/**
 * Created by DMA3622 on 03/05/2017.
 */
const ConnectionV = require('../views/ConnectionV').ConnectionV;

exports.ConnectionP = function(globalVariables) {
    const connectionView = ConnectionV(globalVariables);
    const Server = globalVariables.util.Server;
    const drawing = globalVariables.drawing;

    class ConnectionP {
        constructor() {
            var _declareTextFields = () => {
                this._fields = [
                    {
                        title: "Adresse mail :",
                        text: "",
                        type: "text",
                        errorMessage: "L'adresse email n'est pas valide",
                        index: 2,
                        iconSrc: "../images/envelope.png",
                        valid: false,
                        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    },
                    {
                        title: "Mot de passe :",
                        text: "",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        index: 3,
                        iconSrc: "../images/padlock.png",
                        valid: false,
                        pattern: /^[ -~]{6,63}$/
                    }
                ];
                this._stayConnected = true;
            };

            _declareTextFields();
            this.view = new connectionView(this);
        }
        displayView(){
            this.view.display();
        }

        getFields () {
            return this._fields;
        }
        setValid(field, valid){
            let index = this._fields.indexOf(field);
            if(index != -1){
                this._fields[index].valid = valid;
            }
        }
        setFieldText(field, text){
            let index = this._fields.indexOf(field);
            if(index != -1){
                this._fields[index].text = text;
            }
        }
        setStayConnected(stay){
            this._stayConnected = !!stay;
        }

        onConnected(handler){
            this._onConnected = handler;
        }
        logIn(){
            var _checkInputs = () => {
                return this._fields.reduce((o, n) => o.valid && n.valid);
            }

            if(_checkInputs()){
                //TODO faire stayConnected
                return Server.connect(this._fields[0].text, this._fields[1].text, this._stayConnected).then(data => {
                    if(!data) throw 'Connexion refusée';
                    data = JSON.parse(data);
                    if (data.ack === 'OK') {
                        this._onConnected(data);
                    } else {
                        throw 'adresse e-mail ou mot de passe invalide';
                    }
                });
            }else {
                //TODO changer pour pouvoir mocker pour les tests
                return Promise.reject("Veuillez remplir correctement tous les champs");
            }
        }

        goToRegister(){
            drawing.manipulator.flush();
            let registerP = new globalVariables.RegisterP();
            registerP.displayView();
        }
    }
    return ConnectionP;
}
