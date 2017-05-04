/**
 * Created by DMA3622 on 04/05/2017.
 */

const RegisterV = require('../views/RegisterV').RegisterV;

exports.RegisterP = function (globalVariables) {
    const registerView = RegisterV(globalVariables);

    class RegisterP {
        constructor() {
            this.view = new registerView(this);
            var _declareTextFields = () => {
                this._fields = [
                    {
                        title: "Nom :",
                        type: "text",
                        errorMessage: "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés",
                        index: 0,
                        iconSrc: "../images/user.png",
                        pattern: /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g
                    },
                    {
                        title: "Prénom :",
                        type: "text",
                        errorMessage: "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés",
                        index: 1,
                        iconSrc: "../images/user.png",
                        pattern: /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g
                    },
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
                    },
                    {
                        title: "Confirmer votre mot de passe :",
                        type: "password",
                        errorMessage: "La confirmation du mot de passe n'est pas valide",
                        index: 4,
                        iconSrc: "../images/padlock.png",
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

        displayView() {
            this.view.display();
        }
    }

    return RegisterP;

}
