/**
 * Created by MLE3657 on 20/03/2017.
 */

/**
 *
 InscriptionManagerVue,
 ConnexionManagerVue
 *
 */
exports.User = function (globalVariables, classContainer) {
    let {Vue, HeaderVue} = classContainer.classes;

    let
        main = globalVariables.main,
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        Manipulator = globalVariables.util.Manipulator,
        Server = globalVariables.util.Server,
        gui = globalVariables.gui,
        util = globalVariables.util,
        domain = globalVariables.domain;
    const
        INSCRIPTION_TEXT = "Vous venez d'arriver ? Créer un compte",
        CONNECTION_TEXT = "Vous êtes déjà inscrit ? Se connecter",
        CONNECTION_REFUSED_ERROR = 'Connexion refusée : \nveuillez entrer une adresse e-mail et un mot de passe valide',
        FONT = 'Arial',
        FONT_SIZE_INPUT = 20,
        FONT_SIZE_TITLE = 25,
        EDIT_COLORS = [myColors.white, 1, myColors.greyerBlue],
        COLORS = [myColors.white, 1, myColors.black],
        INPUT_WIDTH = 550,
        INPUT_HEIGHT = 30,
        BUTTON_HEIGHT = INPUT_HEIGHT * 5 / 4,
        TITLE_COLOR = [myColors.white, 0, myColors.white],
        // BLUE_FIELD_COLOR = [myColors.blue, 0, myColors.blue],
        ERROR_INPUT = [myColors.white, 2, myColors.red],
        ICON_SIZE = INPUT_HEIGHT * 2 / 3;

    /**
     * Page d'inscription
     * @class
     */
    class InscriptionManagerVue extends Vue {
        constructor(options) {
            super(options);
            this.header = new HeaderVue("Inscription");
            this.firstNameManipulator = new Manipulator(this).addOrdonator(5);
            this.firstNameManipulator.imageLayer = 3;
            this.lastNameManipulator = new Manipulator(this).addOrdonator(5);
            this.lastNameManipulator.imageLayer = 3;
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(5);
            this.mailAddressManipulator.imageLayer = 3;
            this.passwordManipulator = new Manipulator(this).addOrdonator(5);
            this.passwordManipulator.imageLayer = 3;
            this.passwordConfirmationManipulator = new Manipulator(this).addOrdonator(5);
            this.passwordConfirmationManipulator.imageLayer = 2;
            this.saveButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.saveButtonManipulator.component.mark('saveButton');
            this.connexionTextManipulator = new Manipulator(this);
            this.connexionTextManipulator.component.mark('connexionText');
            this.manipulator.add(this.firstNameManipulator)
                .add(this.lastNameManipulator)
                .add(this.mailAddressManipulator)
                .add(this.passwordManipulator)
                .add(this.passwordConfirmationManipulator)
                .add(this.saveButtonManipulator)
                .add(this.connexionTextManipulator);
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
                    if (valid) {
                        this.mailAddressField.input.color(COLORS);
                    }
                    else {
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
                errorMessage: "Le mot de passe doit contenir au minimum 6 caractères"
            };
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
                "click connexionTextManipulator": this.connexionTextHandler,
                "keydown": this.keyDownHandler
            };
        }

        render() {
            this.connexionTextManipulator.flush();
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
                    if (valid) {
                        valid && this[field].input.color(COLORS);
                        return valid;
                    } else {
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
                    this.errorToDisplay = this.passwordConfirmationField.errorMessage;
                }
                else { //(this.passwordField.labelSecret && this.passwordField.labelSecret.length >= 6) {
                    this.passwordField.input.color(COLORS);
                    this.passwordManipulator.unset(3);
                    cleanIfEgality();
                }
                return !(passTooShort || confTooShort || this.passwordConfirmationField.input.textMessage !== this.passwordField.input.textMessage);
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
            this.loadImage();

            let saveButton = new gui.Button(INPUT_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], this.saveButtonLabel);
            saveButton.text.color(myColors.lightgrey, 0, myColors.white);
            saveButton.component.mark('saveButton');
            this.saveButtonManipulator.set(0, saveButton.component).move(0, 2.5 * drawing.height / 10);

            let connexionText = new svg.Text(CONNECTION_TEXT)
                .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                .color(myColors.greyerBlue)
                .font(FONT, FONT_SIZE_TITLE * 2 / 3)
                .mark('connexionText');
            this.connexionTextManipulator.add(connexionText).move(0, this.saveButtonManipulator.y + BUTTON_HEIGHT + MARGIN);
        }

        loadPasswordSelector() {
            let passwordSelectorHandler = (event) => {
                if (this.passwordHidden) {
                    svg.removeEvent(this.passwordManipulator.viewIcon, 'click', passwordSelectorHandler);
                    svg.removeEvent(this.passwordConfirmationManipulator.viewIcon, 'click', passwordSelectorHandler);
                    this.passwordSelectorIcon.hide.draw(this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator, 4, 'hideIcon');
                    this.passwordSelectorIcon.hide.draw(this.passwordConfirmationField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordConfirmationManipulator, 4, 'hideIcon');
                    svg.addEvent(this.passwordManipulator.hideIcon, 'click', passwordSelectorHandler);
                    svg.addEvent(this.passwordConfirmationManipulator.hideIcon, 'click', passwordSelectorHandler);
                }
                else {
                    svg.removeEvent(this.passwordManipulator.hideIcon, 'click', passwordSelectorHandler);
                    svg.removeEvent(this.passwordConfirmationManipulator.hideIcon, 'click', passwordSelectorHandler);
                    this.passwordSelectorIcon.view.draw(this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator, 4, 'viewIcon');
                    this.passwordSelectorIcon.view.draw(this.passwordConfirmationField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordConfirmationManipulator, 4, 'viewIcon');
                    svg.addEvent(this.passwordManipulator.viewIcon, 'click', passwordSelectorHandler);
                    svg.addEvent(this.passwordConfirmationManipulator.viewIcon, 'click', passwordSelectorHandler);
                }
                this.passwordHidden = !this.passwordHidden;
                if (!this.passwordHidden) {
                    this.passwordField.input.message(this.passwordField.input.pass);
                    this.passwordConfirmationField.input.message(this.passwordConfirmationField.input.pass);
                }
                else {
                    let hidden = '';
                    for (let i in this.passwordField.input.pass.split('')) {
                        hidden += '*';
                    }
                    this.passwordField.input.message(hidden);
                    let hiddenConfirm = '';
                    for (let i in this.passwordConfirmationField.input.pass.split('')) {
                        hiddenConfirm += '*';
                    }
                    this.passwordConfirmationField.input.message(hiddenConfirm);
                }
            }
            this.passwordHidden = true;
            this.passwordSelectorIcon = {}
            this.passwordSelectorIcon.view = new util.Picture('../images/view.png', false, this.passwordManipulator, '', null);
            this.passwordSelectorIcon.hide = new util.Picture('../images/hide.png', false, this.passwordManipulator, '', null);
            this.passwordSelectorIcon.view.draw(this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator, 4, 'viewIcon');
            this.passwordSelectorIcon.view.draw(this.passwordConfirmationField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordConfirmationManipulator, 4, 'viewIcon');
            //svg.addEvent(this.passwordManipulator.viewIcon, 'click', passwordSelectorHandler);
            //svg.addEvent(this.passwordConfirmationManipulator.viewIcon, 'click', passwordSelectorHandler);
        }

        loadImage() {
            this.mailIcon = new util.Picture('../images/envelope.png', false, this.mailAddressManipulator, '', null);
            this.mailIcon.draw(-this.mailAddressField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.mailAddressManipulator);
            this.passIcon = new util.Picture('../images/padlock.png', false, this.passwordManipulator, '', null);
            this.passIcon.draw(-this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator);
            this.passIcon = new util.Picture('../images/padlock.png', false, this.passwordManipulator, '', null);
            this.passIcon.draw(-this.passwordConfirmationField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordConfirmationManipulator);
            this.userIcon = new util.Picture('../images/user.png', false, this.firstNameManipulator, '', null);
            this.userIcon.draw(-this.firstNameField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.firstNameManipulator);
            this.userIcon = new util.Picture('../images/user.png', false, this.lastNameManipulator, '', null);
            this.userIcon.draw(-this.lastNameField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.lastNameManipulator);
            this.loadPasswordSelector();
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
                this.saveButtonManipulator.unset(1);
            }
            return (emptyAreas.length > 0);
        };

        displayField(field, manipulator) {
            manipulator.move(manipulator.x, this[field].line * drawing.height / 8.5);
            var fieldTitle = new gui.TextField(0, 0, INPUT_WIDTH, FONT_SIZE_TITLE, this[field].title);
            fieldTitle.color(TITLE_COLOR).font(FONT, FONT_SIZE_TITLE).anchor('left');
            svg.removeEvent(fieldTitle.glass, 'click');
            this.h = 1.5 * fieldTitle.height;
            var fieldArea = new gui.TextField(0, 0, INPUT_WIDTH, INPUT_HEIGHT, '');
            fieldArea.color(COLORS).font(FONT, FONT_SIZE_INPUT).anchor('center').editColor(EDIT_COLORS);
            if(this[field].secret){
                fieldArea.type("password");
            }
            //TODO a changer, corrige le problème de handler de TextField
            fieldArea.component.mark(field);
            fieldArea.component.parentObj = fieldArea;
            /////////////////////////////////////////////////////////////
            var y = -fieldTitle.height / 4;
            manipulator.set(1, fieldArea.component);
            manipulator.set(2, fieldTitle.component);
            fieldTitle.position(manipulator.x, (fieldArea.y - fieldArea.height - MARGIN));
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            this[field].translatorInput = fieldArea.component;
            this[field].translatorTitle = fieldTitle.component;
            this[field].input = fieldArea;
            this[field].titleText = fieldTitle;
            fieldArea.onInput((oldMessage, message, valid) => {
                this.focusedField = this[field];
                !this[field].checkInput() && this[field].input.control.fontColor(svg.RED);
                this[field].checkInput() && this[field].input.control.fontColor(svg.BLACK);
            });
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
                let tempObject = {
                    lastName: this.lastNameField.input.textMessage,
                    firstName: this.firstNameField.input.textMessage,
                    mailAddress: this.mailAddressField.input.textMessage,
                    password: runtime.twinBcrypt(this.passwordField.input.textMessage)
                };
                Server.inscription(tempObject)
                    .then(data => {
                        let created = JSON.parse(data);
                        if (created) {
                            let message = new svg.Text("Votre compte a bien été créé !")
                                .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                                .position(0, -MARGIN - BUTTON_HEIGHT)
                                .color(myColors.green)
                                .font(FONT, FONT_SIZE_INPUT)
                                .mark('successMessage');
                            this.saveButtonManipulator.set(1, message);
                            setTimeout(() => {
                                this.saveButtonManipulator.unset(1);
                                globalVariables.connexionManager.display();
                            }, 3000);
                        } else {
                            let message = new svg.Text("Un utilisateur possède déjà cette adresse mail !")
                                .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                                .position(0, -MARGIN - BUTTON_HEIGHT)
                                .color(myColors.red)
                                .font(FONT, FONT_SIZE_INPUT)
                                .mark('errorMessage');
                            this.saveButtonManipulator.set(1, message);
                            setTimeout(() => {
                                this.saveButtonManipulator.unset(1);
                            }, 10000);
                        }
                    })
            } else {
                let message = new svg.Text(this.errorToDisplay)
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .position(0, -MARGIN - BUTTON_HEIGHT)
                    .color(myColors.red)
                    .font(FONT, FONT_SIZE_INPUT)
                    .mark('errorMessage');
                this.saveButtonManipulator.set(1, message);
            }
        };

        connexionTextHandler() {
            globalVariables.connexionManager.display();
        }

    }

    /**
     * Page de connexion
     * @class
     */
    class ConnexionManagerVue extends Vue {
        constructor(options) {
            super(options);
            this.header = new HeaderVue("Connexion");
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(5);
            this.passwordManipulator = new Manipulator(this).addOrdonator(5);
            this.newPasswordManipulator = new Manipulator(this).addOrdonator(5);
            this.connexionButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.connexionButtonManipulator.component.mark("connexionButtonManipulator");
            this.cookieManipulator = new Manipulator(this).addOrdonator(5);
            this.inscriptionTextManipulator = new Manipulator(this);
            this.inscriptionTextManipulator.component.mark("inscriptiontext");
            this.manipulator
                .add(this.mailAddressManipulator)
                .add(this.cookieManipulator)
                .add(this.inscriptionTextManipulator)
                .add(this.newPasswordManipulator)
                .add(this.passwordManipulator)
                .add(this.connexionButtonManipulator);
            this.mailAddressManipulator.imageLayer = 3;
            this.passwordManipulator.imageLayer = 3;
            this.mailAddressLabel = "Adresse mail :";
            this.newPasswordLabel = "Mot de passe oublié ?";
            this.passwordLabel = "Mot de passe :";
            this.connexionButtonLabel = "Connexion";
            this.cookieLabel = "Rester connecté";
            this.tabForm = [];
            /** format requis pour la vérification d'une case à cocher **/
            this.model = {correct: false};
            /** Reprendre le format de la classe AnswerVue **/
        }

        addCookieCheckbox(x, y, size, manipulator) {
            let obj = {
                checkbox: new svg.Rect(size, size).color(myColors.white, 2, myColors.black),
                size: size,
                x: x,
                y: y
            };
            this.checkBox = obj;
            let fieldTitle = new gui.TextField(0, 0, INPUT_WIDTH / 2, FONT_SIZE_TITLE, this.cookieLabel);
            obj.checkbox.position(size, 0);
            svg.removeEvent(fieldTitle.glass, 'click');
            fieldTitle.font("Arial", FONT_SIZE_TITLE * 3 / 4).anchor("start");
            fieldTitle.color(TITLE_COLOR);
            fieldTitle.position(0, 0);
            this.model.correct = true;
            this.checkBox.checked = drawCheck(this.checkBox.checkbox.x, this.checkBox.checkbox.y, this.checkBox.size);
            this.cookieManipulator.set(3, this.checkBox.checked);
            manipulator.set(1, fieldTitle.component);
            manipulator.set(2, obj.checkbox);
            manipulator.move(x, y + MARGIN);
        };

        addNewPassword(x, y, manipulator) {
            let fieldTitle = new svg.Text(this.newPasswordLabel)
                .color(myColors.greyerBlue)
                .dimension(INPUT_WIDTH / 2, INPUT_HEIGHT / 2)
                .anchor('end')
                .position(0, 0)
                .font(FONT, FONT_SIZE_TITLE * 3 / 4);
            this.newPasswordText = fieldTitle;
            manipulator.set(0, fieldTitle);
            manipulator.move(x, y + MARGIN);
        }

        events() {
            return {
                "click connexionButtonManipulator": this.connexionButtonHandler,
                "click inscriptionTextManipulator": this.inscriptionTextHandler,
                "click cookieManipulator": this.cookieAction,
                "click newPasswordManipulator": this.newPasswordAction,
                "keydown": this.keyDownHandler
            }
        }

        render() {
            this.inscriptionTextManipulator.flush();
            main.currentPageDisplayed = "ConnexionManager";
            this.header.display("Connexion");
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

            this.displayField("mailAddressField", this.mailAddressManipulator);
            this.displayField('passwordField', this.passwordManipulator);
            this.addCookieCheckbox(-INPUT_WIDTH / 4, this.passwordField.input.y + this.passwordField.input.height
                , 15, this.cookieManipulator);
            this.addNewPassword(INPUT_WIDTH / 2, this.passwordField.input.y + this.passwordField.input.height
                , this.newPasswordManipulator);
            this.loadImage();

            let button = new gui.Button(INPUT_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], this.connexionButtonLabel);
            button.text.color(myColors.lightgrey, 0, myColors.white);
            this.connexionButtonManipulator
                .set(0, button.component)
                .move(0, 2.5 * drawing.height / 10);

            let inscriptionText = new svg.Text(INSCRIPTION_TEXT)
                .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                .color(myColors.greyerBlue)
                .font(FONT, FONT_SIZE_TITLE * 2 / 3);
            this.inscriptionTextManipulator.add(inscriptionText).move(0, this.connexionButtonManipulator.y + BUTTON_HEIGHT + MARGIN);
        }

        cookieAction() {
            if (this.model.correct) {
                this.model.correct = false;
                this.cookieManipulator.unset(3);
            } else if (!this.model.correct) {
                this.model.correct = true;
                this.checkBox.checked = drawCheck(this.checkBox.checkbox.x, this.checkBox.checkbox.y, this.checkBox.size);
                this.cookieManipulator.set(3, this.checkBox.checked);
            }
        }

        forgottenPasswordMessage(mailAddress) {
            let forgotttenPassText = new svg.Text('Un mail a été envoyé à ' + mailAddress + ' pour réinitialiser votre mot de passe.')
                .dimension(INPUT_WIDTH / 2, INPUT_HEIGHT / 2)
                .color(myColors.greyerBlue)
                .font(FONT, FONT_SIZE_TITLE * 2 / 3);
            this.newPasswordManipulator.set(0, forgotttenPassText);
            svg.timeout(() => {
                this.newPasswordManipulator.set(0, this.newPasswordText);
            }, 5000);
        }

        newPasswordAction(event) {
            event.preventDefault();
            let mailAddress = this.mailAddressField.input.textMessage;
            let p = Server.resetPassword({mailAddress: mailAddress});
            p.then((data) => {
                data = JSON.parse(data);
                if (data.status == 200) {
                    this.forgottenPasswordMessage(mailAddress);
                }
            });
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

        loadImage() {
            this.mailIcon = new util.Picture('../images/envelope.png', false, this.mailAddressManipulator, '', null);
            this.mailIcon.draw(-this.mailAddressField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.mailAddressManipulator);
            this.passIcon = new util.Picture('../images/padlock.png', false, this.passwordManipulator, '', null);
            this.passIcon.draw(-this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator);
            this.loadPasswordSelector();
        }

        loadPasswordSelector() {
            let passwordSelectorHandler = (event) => {
                if (this.passwordHidden) {
                    svg.removeEvent(this.passwordManipulator.viewIcon, 'click', passwordSelectorHandler);
                    this.passwordSelectorIcon.hide.draw(this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator, 4, 'hideIcon');
                    svg.addEvent(this.passwordManipulator.hideIcon, 'click', passwordSelectorHandler);
                }
                else {
                    svg.removeEvent(this.passwordManipulator.hideIcon, 'click', passwordSelectorHandler);
                    this.passwordSelectorIcon.view.draw(this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator, 4, 'viewIcon');
                    svg.addEvent(this.passwordManipulator.viewIcon, 'click', passwordSelectorHandler);
                }
                this.passwordField.input.message(this.passwordField.input.pass);
                this.passwordField.input.onInput((oldMessage, message, valid) => {
                    this.passwordField.input.message(message);
                    this.passwordField.input.pass = message;
                });
            }
            this.passwordSelectorIcon = {}
            this.passwordSelectorIcon.view = new util.Picture('../images/view.png', false, this.passwordManipulator, '', null);
            this.passwordSelectorIcon.hide = new util.Picture('../images/hide.png', false, this.passwordManipulator, '', null);
            this.passwordSelectorIcon.view.draw(this.passwordField.input.width / 2 + ICON_SIZE, 0, ICON_SIZE, ICON_SIZE, this.passwordManipulator, 4, 'viewIcon');
            //svg.addEvent(this.passwordManipulator.viewIcon, 'click', passwordSelectorHandler);
        }

        displayField(field, manipulator) {
            this[field].label = field == "mailAddressField" ? "Adresse mail : " : "Mot de passe : ";
            let fieldTitle = new gui.TextField(0, 0, INPUT_WIDTH, FONT_SIZE_TITLE, this[field].label);
            let fieldArea = new gui.TextField(0, 0, INPUT_WIDTH, INPUT_HEIGHT, '');
            svg.removeEvent(fieldTitle.glass, 'click');
            fieldTitle.color(TITLE_COLOR);
            fieldTitle.font(FONT, FONT_SIZE_TITLE);
            fieldArea.font(FONT, FONT_SIZE_INPUT).anchor("center");
            fieldArea.color(COLORS);
            fieldArea.editColor(EDIT_COLORS);
            if (field == "passwordField") {
                let regex = /^[ -~]{6,63}$/;
                fieldArea.pattern(regex);
                fieldArea.type('password');
            }
            else {
                let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                fieldArea.pattern(regexEmail);
                let showEmailEvenIfIncorrect = (oldMessage, message, valid) => {
                    fieldArea.message(message);
                    this.focusedField = this[field];
                    if (!this.focusedField.input.valid) {
                        this.focusedField.input.color(ERROR_INPUT);
                    }
                    else {
                        this.focusedField.input.color(COLORS);
                    }
                }
                fieldArea.onInput(showEmailEvenIfIncorrect);
            }
            this.h = 1.5 * fieldArea.height;
            this[field].translatorInput = fieldArea.component;
            this[field].translatorTitle = fieldTitle.component;

            fieldArea.component.mark(field);
            fieldArea.component.parentObj = fieldArea;

            this[field].input = fieldArea;
            this[field].titleText = fieldTitle;
            this[field].field = field;
            manipulator.set(2, fieldTitle.component);
            manipulator.set(1, fieldArea.component);
            fieldTitle.position(manipulator.x, -1 * (fieldArea.y + fieldArea.height + MARGIN));
            manipulator.move(manipulator.x, this[field].line * drawing.height / 5);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
        }


        connexionButtonHandler() {
            let emptyAreas = this.tabForm.filter(field => field.input.textMessage === '');
            emptyAreas.forEach(emptyArea => {
                emptyArea.input.color(ERROR_INPUT);
            });

            if (emptyAreas.length > 0) {
                let message = new svg.Text(EMPTY_FIELD_ERROR)
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .position(0, -MARGIN - BUTTON_HEIGHT)
                    .color(myColors.red)
                    .font(FONT, FONT_SIZE_INPUT);
                this.connexionButtonManipulator.set(1, message);

                svg.timeout(() => {
                    this.connexionButtonManipulator.unset(1);
                    emptyAreas.forEach(emptyArea => {
                        emptyArea.input.color(COLORS);
                    });
                }, 5000);
            } else {
                Server.connect(this.mailAddressField.input.textMessage, this.passwordField.input.textMessage).then(data => {
                    data = data && JSON.parse(data);
                    if (data.ack === 'OK') {
                        drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                        data.user.admin ? globalVariables.domain.adminGUI() : globalVariables.domain.learningGUI();
                        Server.getAllFormations().then(data => {
                            let myFormations = JSON.parse(data).myCollection;
                            globalVariables.formationsManager = classContainer.createClass("FormationsManagerVue", myFormations);
                            if (!this.model.correct) {
                                runtime.setCookie("token=; path=/; max-age=0;");
                            }
                            globalVariables.formationsManager.display();
                        });
                    } else {
                        let message = new svg.Text(CONNECTION_REFUSED_ERROR)
                            .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                            .position(0, -2 * (INPUT_HEIGHT + MARGIN))
                            .color(myColors.red)
                            .font(FONT, FONT_SIZE_INPUT);
                        this.connexionButtonManipulator.set(1, message);
                        svg.timeout(() => {
                            this.connexionButtonManipulator.unset(1);
                        }, 5000);
                    }
                });
            }
        }

        inscriptionTextHandler() {
            globalVariables.inscriptionManager.display();
        }
    }

    /**
     * Page de réinitialisation de mot de passe
     * @class
     */
    class PasswordVue extends Vue {
        constructor(options) {
            super(options);
            this.header = new HeaderVue("Password");
            this.createPasswordManipulator = new Manipulator(this).addOrdonator(4);
            this.checkPasswordManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordValidManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.waitManipulator = new Manipulator(this).addOrdonator(5);
            this.manipulator.add(this.waitManipulator);
            this.messageManipulator = new Manipulator(this).addOrdonator(1);
            this.manipulator
                .add(this.createPasswordManipulator)
                .add(this.checkPasswordManipulator)
                .add(this.passwordValidManipulator)
                .add(this.passwordButtonManipulator)
                .add(this.messageManipulator);
            this.createPasswordLabel = "Nouveau mot de passe :";
            this.checkPasswordLabel = "Confirmer votre nouveau mot de passe :";
            this.passwordButtonLabel = "Réinitialiser le mot de passe";
            this.tabForm = [];
            this.ID;
        }

        events() {
            return {
                "click passwordButtonManipulator": this.sendNewPassword,
                "keydown": this.keyDownHandler
            }
        }

        render(ID) {
            this.ID = ID;
            main.currentPageDisplayed = "Password";
            globalVariables.drawing.manipulator.set(1, this.manipulator);
            this.manipulator.move(drawing.width / 2, drawing.height / 2);
            if (globalVariables.header) {
                globalVariables.header.display("Password");
            } else {
                let header = classContainer.createClass('HeaderVue');
                header.display('Password');
            }
            let waitText = new svg.Text('Veuillez Patienter...')
                .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                .color(myColors.black)
                .font(FONT, FONT_SIZE_TITLE * 3 / 2);
            this.waitManipulator.set(4, waitText);
            //this.waitManipulator.move(200,200);
            let check = Server.checkTimestampPassword({id: ID});
            check.then(data => {
                data = JSON.parse(data);
                if (data.data == 200) {
                    this.waitManipulator.flush();
                    this.focusedField = null;
                    this.createPasswordField = {
                        label: "",
                        labelSecret: "",
                        title: this.createPasswordLabel,
                        line: -1,
                        secret: true,
                        errorMessage: "Le mot de passe doit contenir au minimum 6 caractères"
                    };
                    this.checkPasswordField = {
                        label: "",
                        title: this.checkPasswordLabel,
                        line: 0,
                        errorMessage: "La confirmation du mot de passe n'est pas valide"
                    };
                    var passwordCheckInput = () => {
                        const passTooShort = this.createPasswordField.input.textMessage !== "" && this.createPasswordField.input.textMessage && this.createPasswordField.input.textMessage.length < 6,
                            confTooShort = this.checkPasswordField.input.textMessage !== "" && this.checkPasswordField.input.textMessage && this.checkPasswordField.input.textMessage.length < 6,
                            cleanIfEgality = () => {
                                if (this.createPasswordField.input.textMessage === this.checkPasswordField.input.textMessage) {
                                    this.createPasswordField.input.color(COLORS);
                                    this.checkPasswordField.input.color(COLORS);
                                }
                            };
                        if (passTooShort || confTooShort) {
                            if (passTooShort) {
                                this.createPasswordField.input.color(ERROR_INPUT);
                                this.errorToDisplay = this.createPasswordField.errorMessage;
                            }
                            if (confTooShort) {
                                this.checkPasswordField.input.color(ERROR_INPUT);
                                this.errorToDisplay = this.createPasswordField.errorMessage;
                            }
                        }
                        else if (this.checkPasswordField.input.textMessage !== "" && this.checkPasswordField.input.textMessage !== this.createPasswordField.input.textMessage) {
                            this.createPasswordField.input.color(ERROR_INPUT);
                            this.checkPasswordField.input.color(ERROR_INPUT);
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
                    this.createPasswordField.checkInput = passwordCheckInput;
                    this.checkPasswordField.checkInput = passwordCheckInput;
                    this.displayField("createPasswordField", this.createPasswordManipulator);
                    this.displayField("checkPasswordField", this.checkPasswordManipulator);
                    let button = new gui.Button(INPUT_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], this.passwordButtonLabel);
                    this.passwordButtonManipulator
                        .set(0, button.component)
                        .move(this.passwordButtonManipulator.x, 2.5 * drawing.height / 10);
                }
                else {
                    this.waitManipulator.set(4, new svg.Text('Veuillez réessayer, le délai est dépassé, ou l\'ID est érroné')
                        .font(FONT, FONT_SIZE_TITLE * 3 / 2));
                }
            });

        }

        displayField(field, manipulator) {
            this[field].label = field == "createPasswordField" ? this.createPasswordLabel : this.checkPasswordLabel;
            let fieldTitle = new gui.TextField(0, 0, INPUT_WIDTH, FONT_SIZE_TITLE, this[field].label);
            let fieldArea = new gui.TextField(0, 0, INPUT_WIDTH, INPUT_HEIGHT, '');
            svg.removeEvent(fieldTitle.glass, 'click');
            fieldTitle.color(TITLE_COLOR);
            fieldTitle.font(FONT, FONT_SIZE_TITLE);
            fieldArea.font(FONT, FONT_SIZE_INPUT).anchor("center");
            fieldArea.color(COLORS);
            fieldArea.editColor(EDIT_COLORS);
            this[field].translatorInput = fieldArea.component;
            this[field].translatorTitle = fieldTitle.component;
            this[field].input = fieldArea;
            this[field].titleText = fieldTitle;
            this[field].field = field;
            fieldArea.pattern(/^[ -~]{6,63}$/);
            // this.focusedField = this[field];
            // if (!this.focusedField.input.valid) {
            //     this.focusedField.input.color(ERROR_INPUT);
            // }
            // else {
            //     this.focusedField.input.color(COLORS);
            // }
            manipulator.set(3, fieldTitle.component);
            manipulator.set(2, fieldArea.component);
            fieldTitle.position(manipulator.x, -1 * (fieldArea.y + fieldArea.height + MARGIN));
            manipulator.move(manipulator.x, this[field].line * drawing.height / 5);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
        }

        sendNewPassword() {
            let newPass = this.createPasswordField.input.textMessage;
            let checkPass = this.checkPasswordField.input.textMessage;
            if (newPass == checkPass) {
                let update = Server.updatePassword(this.ID, newPass);
                update.then((data) => {
                    data = JSON.parse(data);
                    if (data.data == 200) {
                        let message = new svg.Text('Mot de passe mis à jour !').font(FONT, FONT_SIZE_TITLE * 3 / 2);
                        this.messageManipulator.set(0, message);
                        this.messageManipulator.move(this.passwordButtonManipulator.x, this.passwordButtonManipulator.y - BUTTON_HEIGHT);
                        svg.timeout(() => {
                            this.manipulator.flush();
                            globalVariables.connexionManager.display();
                        }, 3000);
                    }
                    else {
                        let message = new svg.Text('Une Erreur est survenue, rééssayer plus tard !').font(FONT, FONT_SIZE_TITLE * 3 / 2).color(svg.RED);
                        this.messageManipulator.set(0, message);
                        this.messageManipulator.move(this.passwordButtonManipulator.x, this.passwordButtonManipulator.y - BUTTON_HEIGHT);
                    }
                });
            }
            else {
                let message = new svg.Text('Les champs ne correspondent pas !').font(FONT, FONT_SIZE_TITLE * 3 / 2).color(svg.RED);
                this.messageManipulator.set(0, message);
                this.messageManipulator.move(this.passwordButtonManipulator.x, this.passwordButtonManipulator.y - BUTTON_HEIGHT);
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
                this.sendNewPassword();
            }
        }
    }
    return {
        InscriptionManagerVue,
        ConnexionManagerVue,
        PasswordVue
    }
}
