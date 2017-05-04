/**
 * Created by DMA3622 on 04/05/2017.
 */

const RegisterV = require('../views/RegisterV').RegisterV;

exports.RegisterP = function (globalVariables) {
    const registerView = RegisterV(globalVariables),
        runtime = globalVariables.runtime,
        Server = globalVariables.util.Server,
        drawing = globalVariables.drawing;

    class RegisterP {
        constructor(parent) {
            this.view = new registerView(this);
            this.parent = parent;
            var _declareTextFields = () => {
                this._fields = [
                    {
                        title: "Nom :",
                        type: "text",
                        errorMessage: "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés",
                        index: 0,
                        iconSrc: "../images/user.png",
                        valid: false,
                        pattern: /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g
                    },
                    {
                        title: "Prénom :",
                        type: "text",
                        errorMessage: "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés",
                        index: 1,
                        iconSrc: "../images/user.png",
                        valid: false,
                        pattern: /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g
                    },
                    {
                        title: "Adresse mail :",
                        type: "text",
                        errorMessage: "L'adresse email n'est pas valide",
                        index: 2,
                        iconSrc: "../images/envelope.png",
                        valid: false,
                        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    },
                    {
                        title: "Mot de passe :",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        index: 3,
                        iconSrc: "../images/padlock.png",
                        valid: false,
                        pattern: /^[ -~]{6,63}$/
                    },
                    {
                        title: "Confirmer votre mot de passe :",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        index: 4,
                        iconSrc: "../images/padlock.png",
                        valid: false,
                        pattern: /^[ -~]{6,63}$/
                    }
                ];
                this.focusedField = null;
            };

            _declareTextFields();
        }

        getFields() {
            return this._fields;
        }

        goToConnection() {
            drawing.manipulator.flush();
            this.parent.displayView();
        }

        registerNewUser() {

            var _checkInputs = () => {
                return this._fields.reduce((o, n) => o && n.valid, true);
            };
            if (_checkInputs()) {

                let tempObject = {
                    lastName: this._fields[0].text,
                    firstName: this._fields[1].text,
                    mailAddress: this._fields[2].text,
                    password: runtime.twinBcrypt(this._fields[3].text)
                };
                return Server.inscription(tempObject)
                    .then(data => {
                        if (!data) throw 'errorDisplay';
                        let created = JSON.parse(data);
                        if (created.ack === 'ok') {
                            return;
                        } else {
                            throw "Un utilisateur possède déjà cette adresse mail !";
                        }
                    })
            } else {
                return Promise.reject("Veuillez remplir tous les champs")
            }
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

        displayView() {
            this.view.display();
        }
    }

    return RegisterP;

}
