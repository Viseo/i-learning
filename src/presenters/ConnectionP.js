/**
 * Created by DMA3622 on 03/05/2017.
 */
const ConnectionV = require('../views/ConnectionV').ConnectionV;

exports.ConnectionP = function (globalVariables) {
    const connectionView = ConnectionV(globalVariables),
        Presenter = globalVariables.Presenter,
        runtime = globalVariables.runtime;

    class ConnectionP extends Presenter {
        constructor(state) {
            const _initFields = () => {
                this._connectFields = [
                    {
                        id: "login",
                        title: "Mail",
                        text: "",
                        type: "text",
                        errorMessage: "L'adresse email n'est pas valide",
                        iconSrc: "../images/envelope.png",
                        valid: false,
                        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    },
                    {
                        id: "password",
                        title: "Mot de passe",
                        text: "",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        iconSrc: "../images/padlock.png",
                        valid: false,
                        pattern: /^[ -~]{6,63}$/
                    }
                ];
                this._registerFields = [
                    {
                        id: "name",
                        title: "Nom",
                        type: "text",
                        errorMessage: "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés",
                        iconSrc: "../images/user.png",
                        valid: false,
                        pattern: /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/
                    },
                    {
                        id: "surname",
                        title: "Prénom",
                        type: "text",
                        errorMessage: "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés",
                        iconSrc: "../images/user.png",
                        valid: false,
                        pattern: /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/
                    },
                    {
                        id: "mail",
                        title: "Adresse mail",
                        type: "text",
                        errorMessage: "L'adresse email n'est pas valide",
                        iconSrc: "../images/envelope.png",
                        valid: false,
                        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    },
                    {
                        id: "password",
                        title: "Mot de passe",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        iconSrc: "../images/padlock.png",
                        valid: false,
                        pattern: /^[ -~]{6,63}$/
                    },
                    {
                        id: "confirmPassword",
                        title: "Confirmer votre mot de passe",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        iconSrc: "../images/padlock.png",
                        valid: false,
                        pattern: /^[ -~]{6,63}$/
                    }
                ];
            }

            super(state);
            _initFields();
            this._stayConnected = true;
            this._fields = this._connectFields;
            this.view = new connectionView(this);
        }

        tryLoginOrRegister(){
            if(this.isConnectionPage()){
                return this.logIn();
            }else {
                return this.registerNewUser();
            }
        }

        _connectWith(login, pwd, stayConnected){
            return this.state.tryConnectForPresenterDashboard(login, pwd, stayConnected);
        }

        logIn() {
            var _checkInputs = () => {
                return this._fields.reduce((o, n) => o && n.valid, true);
            };

            if (_checkInputs()) {
                return this._connectWith(this._fields[0].text, this._fields[1].text, this._stayConnected);
            } else {
                return Promise.reject("Veuillez remplir correctement tous les champs");
            }
        }

        isConnectionPage() {
            return this._fields === this._connectFields;
        }

        switchPage() {
            if (this._fields === this._registerFields) {
                this._fields = this._connectFields;
            } else {
                this._fields = this._registerFields;
            }
            this.displayView();
        }

        registerNewUser() {
            let error = "Veuillez remplir correctement tous les champs";
            var _checkInputs = () => {
                let isPasswordConfirmed = this._fields[3].text === this._fields[4].text;
                let allValid = this._fields.reduce((o, n) => o && n.valid, true);
                if (!isPasswordConfirmed) {
                    error = "La vérification du mot de passe ne correspond pas";
                }
                if (!allValid) {
                    error = this._fields.find(f => f.valid === false).errorMessage;
                }
                return isPasswordConfirmed && allValid;
            };

            if (_checkInputs()) {
                let userInfos = {
                    lastName: this._fields[0].text,
                    firstName: this._fields[1].text,
                    mailAddress: this._fields[2].text,
                    password: runtime.twinBcrypt(this._fields[3].text)
                };
                return this.state.registerNewUser(userInfos).then(() => {
                    setTimeout(() => this.switchPage(), 3000);
                    return "Votre compte a bien été créé !"
                }).catch((err) => {
                    throw JSON.parse(err).reason
                })
            } else {
                return Promise.reject(error);
            }
        }

        forgotPWD() {
            return this.state.resetPassword({mailAddress: this._fields[0].text});
        }

        getFields() {
            return this._fields;
        }

        setValid(field, valid) {
            let index = this._fields.indexOf(field);
            if (index != -1) {
                this._fields[index].valid = valid;
            }
        }

        setFieldText(field, text) {
            let index = this._fields.indexOf(field);
            if (index != -1) {
                this._fields[index].text = text;
            }
        }

        setStayConnected(isStay) {
            this._stayConnected = !!isStay;
        }

        getUsername() {
            return this.state.getUsername();
        }

        setUsername(username) {
            return this.state.setUsername(username);
        }
    }

    return ConnectionP;
}
