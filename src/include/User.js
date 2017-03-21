/**
 * Created by MLE3657 on 20/03/2017.
 */

exports.User = function (globalVariables, Vue, HeaderVue, FormationsManagerVue) {
    let
        main = globalVariables.main,
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        Manipulator = globalVariables.util.Manipulator,
        Server = globalVariables.util.Server;
        gui = globalVariables.gui;
    const
        FONT = 'Arial',
        FONT_SIZE_INPUT = 15,
        FONT_SIZE_TITLE = 15,
        EDIT_COLORS = [myColors.white, 1, myColors.greyerBlue],
        COLORS = [myColors.white, 1, myColors.black],
        INPUT_WIDTH = 300,
        INPUT_HEIGHT = 25,
        TITLE_COLOR = [myColors.white, 0, myColors.white],
        ERROR_INPUT = [myColors.white, 2, myColors.red];

    /**
     * @class
     */
    class InscriptionManagerVue extends Vue {
        constructor(options) {
            super(options);
            this.header = new HeaderVue("Inscription");
            this.firstNameManipulator = new Manipulator(this).addOrdonator(4);
            this.lastNameManipulator = new Manipulator(this).addOrdonator(4);
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordConfirmationManipulator = new Manipulator(this).addOrdonator(3);
            this.saveButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.firstNameManipulator);
            this.manipulator.add(this.lastNameManipulator);
            this.manipulator.add(this.mailAddressManipulator);
            this.manipulator.add(this.passwordManipulator);
            this.manipulator.add(this.passwordConfirmationManipulator);
            this.manipulator.add(this.saveButtonManipulator);
            this.saveButtonHeightRatio = 0.075;
            this.saveButtonWidthRatio = 0.25;
            this.lastNameLabel = "Nom :";
            this.firstNameLabel = "Prénom :";
            this.mailAddressLabel = "Adresse mail :";
            this.passwordLabel = "Mot de passe :";
            this.passwordConfirmationLabel = "Confirmer votre mot de passe :";
            this.lastNameLabel = "Nom :";
            this.saveButtonLabel = "S'enregistrer";
            this.tabForm = [];
            this.formLabels = {};
            var nameErrorMessage = "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés";
            this.errorToDisplay = '';
            this.lastNameField = {label: this.formLabels.lastNameField || "", title: this.lastNameLabel, line: -3};
            this.lastNameField.errorMessage = nameErrorMessage;
            this.firstNameField = {label: this.formLabels.firstNameField || "", title: this.firstNameLabel, line: -2};
            this.firstNameField.errorMessage = nameErrorMessage;
            this.mailAddressField = {
                label: this.formLabels.mailAddressField || "",
                title: this.mailAddressLabel,
                line: -1
            };
            this.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
            this.mailAddressField.checkInput = () => {
                if (this.mailAddressField.input.textMessage) {
                    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    let valid = regex.test(this.mailAddressField.input.textMessage);
                    if(valid){
                        this.mailAddressField.input.color(COLORS);
                    }
                    else{
                        this.mailAddressField.input.color(ERROR_INPUT);
                        this.errorToDisplay = this.mailAddressField.errorMessage;
                    }
                    return valid;
                }
            };
            this.passwordField = {
                label: this.formLabels.passwordField || "",
                labelSecret: (this.tabForm[3] && this.tabForm[3].labelSecret) || "",
                title: this.passwordLabel,
                line: 0,
                secret: true,
                errorMessage: "La confirmation du mot de passe n'est pas valide"
            };
            this.passwordField.errorMessage = "Le mot de passe doit contenir au minimum 6 caractères";
            this.passwordConfirmationField = {
                label: this.formLabels.passwordConfirmationField || "",
                labelSecret: (this.tabForm[4] && this.tabForm[4].labelSecret) || "",
                title: this.passwordConfirmationLabel,
                line: 1,
                secret: true,
                errorMessage: "La confirmation du mot de passe n'est pas valide"
            };
        }

        events() {
            return {
                "click saveButtonManipulator": this.saveButtonHandler,
                "keydown": this.keyDownHandler
            };
        }

        render() {
            main.currentPageDisplayed = "InscriptionManager";
            globalVariables.header.display("Inscription");
            globalVariables.drawing.manipulator.set(1, this.manipulator);
            this.manipulator.move(drawing.width / 2, drawing.height / 2);
            this.focusedField = null;

            var nameCheckInput = (field) => {
                if (this[field].input.textMessage) {
                    this[field].input.textMessage = this[field].input.textMessage.trim();
                    var regex = /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g;
                    let valid = regex.test(this[field].input.textMessage);
                    if (valid){
                        valid && this[field].input.color(COLORS);
                        return valid;
                    }else {
                        !valid && this[field].input.color(ERROR_INPUT)
                        this.errorToDisplay = this[field].errorMessage;
                    }
                }
            };
            var passwordCheckInput = () => {
                const passTooShort = this.passwordField.input.textMessage !== "" && this.passwordField.input.textMessage && this.passwordField.input.textMessage.length < 6,
                    confTooShort = this.passwordConfirmationField.input.textMessage !== "" && this.passwordField.input.textMessage && this.passwordConfirmationField.input.textMessage.length < 6,
                    cleanIfEgality = () => {
                        if (this.passwordField.input.textMessage === this.passwordConfirmationField.input.textMessage) {
                            this.passwordField.input.color(COLORS);
                            this.passwordConfirmationField.input.color(COLORS);
                        }
                    };
                if (passTooShort || confTooShort) {
                    if (passTooShort) {
                        this.passwordField.input.color(ERROR_INPUT);
                         this.errorToDisplay = this.passwordField.errorMessage;
                    }
                    if (confTooShort) {
                        this.passwordConfirmationField.input.color(ERROR_INPUT);
                        this.errorToDisplay = this.passwordField.errorMessage;
                    }
                }
                else if (this.passwordConfirmationField.input.textMessage !== "" && this.passwordConfirmationField.input.textMessage !== this.passwordField.input.textMessage) {
                    this.passwordField.input.color(ERROR_INPUT);
                    this.passwordConfirmationField.input.color(ERROR_INPUT);
                    message = autoAdjustText(this.passwordConfirmationField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                    message.text.color(myColors.red).position(this.passwordField.border.width / 2 + MARGIN, this.passwordField.border.height + MARGIN);
                    message.text.mark('inscriptionErrorMessagepasswordField');
                }
                else { //(this.passwordField.labelSecret && this.passwordField.labelSecret.length >= 6) {
                    this.passwordField.input.color(COLORS);
                    this.passwordManipulator.unset(3);
                    cleanIfEgality();
                }
                return !(passTooShort || confTooShort || this.passwordConfirmationField.labelSecret !== this.passwordField.labelSecret);
            };
            this.lastNameField.checkInput = () => nameCheckInput("lastNameField");
            this.firstNameField.checkInput = () => nameCheckInput("firstNameField");
            this.passwordField.checkInput = passwordCheckInput;
            this.passwordConfirmationField.checkInput = passwordCheckInput;
            this.displayField("lastNameField", this.lastNameManipulator);
            this.displayField("firstNameField", this.firstNameManipulator);
            this.displayField("mailAddressField", this.mailAddressManipulator);
            this.displayField("passwordField", this.passwordManipulator);
            this.displayField("passwordConfirmationField", this.passwordConfirmationManipulator);
            let saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
            this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
            let saveButtonWidth = Math.min(drawing.width * this.saveButtonWidthRatio, 200);
            let saveButton = displayText(this.saveButtonLabel, saveButtonWidth, saveButtonHeight, myColors.black, myColors.white, 20, null, this.saveButtonManipulator);
            saveButton.border.mark('inscriptionButton');
            this.saveButtonManipulator.move(0, 2.5 * drawing.height / 10);
            this._setEvents();
        }

        keyDownHandler(event) {
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                let index = this.tabForm.indexOf(this.focusedField);
                if (index !== -1) {
                    event.shiftKey ? index-- : index++;
                    if (index === this.tabForm.length) index = 0;
                    if (index === -1) index = this.tabForm.length - 1;
                    svg.event(this.tabForm[index].input.glass, "click");
                    this.focusedField = this.tabForm[index];
                }
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                this.focusedField.input.hideControl();
                this.saveButtonHandler();
            }
        };

        emptyAreasHandler(save) {
            var emptyAreas = this.tabForm.filter(field => field.input.textMessage === "");
            emptyAreas.forEach(function (emptyArea) {
                save && emptyArea.input.color(ERROR_INPUT);
            });
            if (emptyAreas.length > 0 && save) {
                this.errorToDisplay = EMPTY_FIELD_ERROR;
            }
            else {
                this.saveButtonManipulator.unset(3);
            }
            return (emptyAreas.length > 0);
        };

        displayField(field, manipulator) {
            manipulator.move(manipulator.x, this[field].line * drawing.height / 10);
            var fieldTitle = new gui.TextField(0,0,INPUT_WIDTH, FONT_SIZE_TITLE, this[field].title);
            fieldTitle.color(TITLE_COLOR).font(FONT, FONT_SIZE_TITLE).anchor('left');
            svg.removeEvent(fieldTitle.glass, 'click');
            this.h = 1.5 * fieldTitle.height;
            var fieldArea = new gui.TextField(0,0, INPUT_WIDTH, INPUT_HEIGHT, '');
            fieldArea.color(COLORS).font(FONT, FONT_SIZE_INPUT).anchor('center').editColor(EDIT_COLORS);
            var y = -fieldTitle.height / 4;
            manipulator.set(1, fieldArea.component);
            manipulator.set(2, fieldTitle.component);
            fieldTitle.position(manipulator.x, (fieldArea.y - fieldArea.height));
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            this[field].translatorInput = fieldArea.component;
            this[field].translatorTitle = fieldTitle.component;
            this[field].input = fieldArea;
            this[field].titleText = fieldTitle;
            let hidePassword = (oldMessage, message, valid) => {
                if (valid) {
                    let messageArray = message.split('');
                    fieldArea.pass += messageArray[messageArray.length - 1];
                    let tmp = '';
                    for (let i in message) {
                        tmp += '*';
                    }
                    fieldArea.message(tmp);
                }
                this.focusedField = this[field];
            }
            if(field == "passwordField" || field == "passwordConfirmationField"){
                fieldArea.pass = '';
                fieldArea.onInput(hidePassword);
            }
            else{
                fieldArea.onInput((oldMessage, message, valid) => {
                    this.focusedField = this[field];
                });
            }
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
            this.formLabels[field] = this[field].field;
        };

        AllOk() {
            return this.lastNameField.checkInput() &&
                this.firstNameField.checkInput() &&
                this.mailAddressField.checkInput() &&
                this.passwordField.checkInput() &&
                this.passwordConfirmationField.checkInput();
        };

        saveButtonHandler() {
            if (!this.emptyAreasHandler(true) && this.AllOk()) {
                this.passwordField.hash = runtime.twinBcrypt(this.passwordField.input.pass); // algorithme pour crypter le mot de passe
                let tempObject = {
                    lastName: this.lastNameField.input.textMessage,
                    firstName: this.firstNameField.input.textMessage,
                    mailAddress: this.mailAddressField.input.textMessage,
                    password: this.passwordField.hash
                };
                Server.inscription(tempObject)
                    .then(data => {
                        let created = JSON.parse(data);
                        if (created) {
                            const messageText = "Votre compte a bien été créé !",
                                message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                            message.text.color(myColors.green).position(0, -this.saveButtonManipulator.ordonator.children[0].height + MARGIN);
                            setTimeout(() => {
                                this.saveButtonManipulator.unset(3);
                            }, 10000);
                        } else {
                            const messageText = "Un utilisateur possède déjà cette adresse mail !",
                                message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                            message.text.color(myColors.red).position(0, -this.saveButtonManipulator.ordonator.children[0].height + MARGIN);
                            setTimeout(() => {
                                this.saveButtonManipulator.unset(3);
                            }, 10000);
                        }
                    })
            } else {
                const messageText = this.errorToDisplay,
                    message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -this.saveButtonManipulator.ordonator.children[0].height + MARGIN);
            }
        };

    }

    /**
     * @class
     */
    class ConnexionManagerVue extends Vue {
        constructor(options) {
            super(options);
            this.header = new HeaderVue("Connexion");
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordManipulator = new Manipulator(this).addOrdonator(4);
            this.connexionButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.cookieManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.mailAddressManipulator);
            this.manipulator.add(this.passwordManipulator);
            this.manipulator.add(this.connexionButtonManipulator);
            this.manipulator.add(this.cookieManipulator);
            this.mailAddressLabel = "Adresse mail :";
            this.passwordLabel = "Mot de passe :";
            this.connexionButtonLabel = "Connexion";
            this.cookieLabel = "Rester connecté";
            this.tabForm = [];
            this.obj = {checkbox: "", checked: "", size: 0, x: 0, y: 0};      /** format requis pour la vérification d'une case à cocher **/
            this.model = {correct: false};              /** Reprendre le format de la classe AnswerVue **/

        }

        events() {
            return {
                "click connexionButtonManipulator": this.connexionButtonHandler,
                "click cookieManipulator": this.cookieAction,
                "keydown": this.keyDownHandler
            }
        }

        render() {
            main.currentPageDisplayed = "ConnexionManager";
            globalVariables.header.display("Connexion");
            globalVariables.drawing.manipulator.set(1, this.manipulator);
            this.manipulator.move(drawing.width / 2, drawing.height / 2);

            this.focusedField = null;
            this.mailAddressField = {
                label: "",
                title: this.mailAddressLabel,
                line: -1,
                errorMessage: "L'adresse email n'est pas valide"
            };
            this.passwordField = {
                label: '',
                labelSecret: '',
                title: this.passwordLabel,
                line: 0,
                secret: true,
                errorMessage: "La confirmation du mot de passe n'est pas valide"
            };
            this.cookieField = {
                label: '',
                labelSecret: '',
                title: this.cookieLabel,
                line: 1,
                errorMessage: "errMsgTest"
            };
            this.obj && (this.obj.size = 20) && (this.obj.x = 40);
            /*this.obj = {
                size: 20,
                x: 40,
                y: 0,
            };*/

            this.displayField("mailAddressField", this.mailAddressManipulator);
            this.displayField('passwordField', this.passwordManipulator);
            addCookieCheckbox(this.obj.x, this.obj.y, this.obj.size, this);

            const connexionButtonHeightRatio = 0.075,
                connexionButtonHeight = drawing.height * connexionButtonHeightRatio,
                connexionButtonWidth = 200,
                connexionButton = displayText(this.connexionButtonLabel, connexionButtonWidth, connexionButtonHeight, myColors.black, myColors.white, 20, null, this.connexionButtonManipulator);
            connexionButton.border.mark('connexionButton');
            this.connexionButtonManipulator.move(0, 2.5 * drawing.height / 10);
        }

        cookieAction() {
            if (this.model.correct) {
                this.model.correct = false;
                this.cookieManipulator.unset(2);
            } else if (!this.model.correct) {
                this.model.correct = true;
                this.obj.checked = drawCheck(this.obj.x - drawing.width / 8, this.obj.y, this.obj.size);
                this.cookieManipulator.set(2, this.obj.checked);
            }
        }

        keyDownHandler(event) {
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                let index = this.tabForm.indexOf(this.focusedField);
                if (index !== -1) {
                    event.shiftKey ? index-- : index++;
                    if (index === this.tabForm.length) index = 0;
                    if (index === -1) index = this.tabForm.length - 1;
                    svg.event(this.tabForm[index].input.glass, "click");
                    this.focusedField = this.tabForm[index];
                }
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                this.focusedField.input.hideControl();
                this.connexionButtonHandler();
            }
        }

        displayField(field, manipulator) {
            this[field].label = field == "mailAddressField" ? "Email : " : "Password : ";
            let fieldTitle = new gui.TextField(0, 0, INPUT_WIDTH, FONT_SIZE_TITLE, this[field].label);
            let fieldArea = new gui.TextField(0, 0, INPUT_WIDTH, INPUT_HEIGHT, '');
            svg.removeEvent(fieldTitle.glass, 'click');
            fieldTitle.color(TITLE_COLOR);
            fieldTitle.font(FONT, FONT_SIZE_TITLE);
            fieldArea.font(FONT, FONT_SIZE_INPUT).anchor("center");
            fieldArea.color(COLORS);
            fieldArea.editColor(EDIT_COLORS);
            if (field == "passwordField") {
                let hidePassword = (oldMessage, message, valid) => {
                    if (valid) {
                        let messageArray = message.split('');
                        fieldArea.pass += messageArray[messageArray.length - 1];
                        let tmp = '';
                        for (let i in message) {
                            tmp += '*';
                        }
                        fieldArea.message(tmp);
                    }
                    this.focusedField = this[field];
                }
                fieldArea.pass = "";
                fieldArea.onInput(hidePassword);
            }
            else {
                let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                fieldArea.pattern(regexEmail);
                let showEmailEvenIfIncorrect = (oldMessage, message, valid) => {
                    fieldArea.message(message);
                    this.focusedField = this[field];
                }
                fieldArea.onInput(showEmailEvenIfIncorrect);
            }
            this.h = 1.5 * fieldArea.height;
            this[field].translatorInput = fieldArea.component;
            this[field].translatorTitle = fieldTitle.component;
            this[field].input = fieldArea;
            this[field].titleText = fieldTitle;
            this[field].field = field;
            manipulator.set(3, fieldTitle.component);
            manipulator.set(2, fieldArea.component);
            fieldTitle.position(manipulator.x, -1 * (fieldArea.y + fieldArea.height));
            manipulator.move(manipulator.x, this[field].line * drawing.height / 10);
            var y = -fieldArea.height / 4;
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
        }


        connexionButtonHandler() {
            let emptyAreas = this.tabForm.filter(field => field.input.textMessage === '');
            emptyAreas.forEach(emptyArea => {
                emptyArea.input.color([myColors.white, 2, myColors.red]);
            });

            if (emptyAreas.length > 0) {
                let message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                svg.timeout(() => {
                    this.connexionButtonManipulator.unset(3);
                    emptyAreas.forEach(emptyArea => {
                        emptyArea.input.color([myColors.white, 1, myColors.black]);
                    });
                }, 5000);
            } else {
                Server.connect(this.mailAddressField.input.textMessage, this.passwordField.input.pass).then(data => {
                    data = data && JSON.parse(data);
                    if (data.ack === 'OK') {
                        drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                        data.user.admin ? globalVariables.domain.adminGUI() : globalVariables.domain.learningGUI();
                        Server.getAllFormations().then(data => {
                            let myFormations = JSON.parse(data).myCollection;
                            globalVariables.formationsManager = new FormationsManagerVue(myFormations);
                            if (!this.obj.checked) {
                                runtime.setCookie("token=; path=/; max-age=0;");
                            }
                            globalVariables.formationsManager.display();
                        });
                    } else {
                        let message = autoAdjustText('Adresse et/ou mot de passe invalide(s)', drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                        message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                        svg.timeout(() => {
                            this.connexionButtonManipulator.unset(3);
                        }, 5000);
                    }
                });
            }
        }
    }

    return {
        InscriptionManagerVue: InscriptionManagerVue,
        ConnexionManagerVue: ConnexionManagerVue
    }
}
