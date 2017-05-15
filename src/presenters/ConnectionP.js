/**
 * Created by DMA3622 on 03/05/2017.
 */
const ConnectionV = require('../views/ConnectionV').ConnectionV;

exports.ConnectionP = function(globalVariables) {
    const connectionView = ConnectionV(globalVariables),
        Server = globalVariables.util.Server,
        Presenter = globalVariables.Presenter;

    class ConnectionP extends Presenter{
        constructor(state) {
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
            super(state);
            _declareTextFields();
            this.view = new connectionView(this);
        }

        _connectWith(login, pwd, stayConnected){
            return this.state.tryConnectForPresenterDashboard(login, pwd, stayConnected);
        }

        logIn(){
            var _checkInputs = () => {
                return this._fields.reduce((o, n) => o && n.valid, true);
            };

            if(_checkInputs()){
                return this._connectWith(this._fields[0].text, this._fields[1].text, this._stayConnected);
            }else {
                //TODO changer pour pouvoir mocker pour les tests
                return Promise.reject("Veuillez remplir correctement tous les champs");
            }
        }

        goToRegister(){
            this.state.loadPresenterRegister();
        }

        forgotPWD(){
            return Server.resetPassword({mailAddress: this._fields[0].text});
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

        setStayConnected(isStay){
            this._stayConnected = !!isStay;
        }

    }
    return ConnectionP;
}
