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
                if (this.mailAddressField.label) {
                    var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
                    return this.mailAddressField.label === "" || this.mailAddressField.label.match(regex);
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
                "click firstNameManipulator": this.clickEditionField("firstNameField", this.firstNameManipulator),
                "click lastNameManipulator": this.clickEditionField("lastNameField", this.lastNameManipulator),
                "click mailAddressManipulator": this.clickEditionField("mailAddressField", this.mailAddressManipulator),
                "click passwordManipulator": this.clickEditionField("passwordField", this.passwordManipulator),
                "click passwordConfirmationManipulator": this.clickEditionField("passwordConfirmationField", this.passwordConfirmationManipulator),
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
                if (this[field].label) {
                    this[field].label = this[field].label.trim();
                    var regex = /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g;
                    return this[field].label.match(regex);
                }
            };
            var passwordCheckInput = () => {
                const passTooShort = this.passwordField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordField.labelSecret.length < 6,
                    confTooShort = this.passwordConfirmationField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordConfirmationField.labelSecret.length < 6,
                    cleanIfEgality = () => {
                        if (this.passwordField.labelSecret === this.passwordConfirmationField.labelSecret) {
                            this.passwordField.border.color(myColors.white, 1, myColors.black);
                            this.passwordConfirmationField.border.color(myColors.white, 1, myColors.black);
                        }
                    };
                if (passTooShort || confTooShort) {
                    if (passTooShort) {
                        this.passwordField.border.color(myColors.white, 3, myColors.red);
                        var message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                        message.text.color(myColors.red).position(this.passwordField.border.width / 2 + MARGIN, this.passwordField.border.height + MARGIN);
                        message.text.mark('inscriptionErrorMessagepasswordField');
                    }
                    if (confTooShort) {
                        this.passwordConfirmationField.border.color(myColors.white, 3, myColors.red);
                        message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                        message.text.color(myColors.red).position(this.passwordField.border.width / 2 + MARGIN, this.passwordField.border.height + MARGIN);
                        message.text.mark('inscriptionErrorMessagepasswordField');
                    }
                }
                else if (this.passwordConfirmationField.labelSecret !== "" && this.passwordConfirmationField.labelSecret !== this.passwordField.labelSecret) {
                    this.passwordField.border.color(myColors.white, 3, myColors.red);
                    this.passwordConfirmationField.border.color(myColors.white, 3, myColors.red);
                    message = autoAdjustText(this.passwordConfirmationField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                    message.text.color(myColors.red).position(this.passwordField.border.width / 2 + MARGIN, this.passwordField.border.height + MARGIN);
                    message.text.mark('inscriptionErrorMessagepasswordField');
                }
                else { //(this.passwordField.labelSecret && this.passwordField.labelSecret.length >= 6) {
                    this.passwordField.border.color(myColors.white, 1, myColors.black);
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
            this.AllOk();
        }

        keyDownHandler(event) {
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                let index = this.tabForm.indexOf(this.focusedField);
                if (index !== -1) {
                    event.shiftKey ? index-- : index++;
                    if (index === this.tabForm.length) index = 0;
                    if (index === -1) index = this.tabForm.length - 1;
                    svg.event(this.tabForm[index].border, "click");
                }
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                // runtime.activeElement() && runtime.activeElement().blur();
                this.saveButtonHandler();
            }
        }

        emptyAreasHandler(save) {
            var emptyAreas = this.tabForm.filter(field => field.label === "");
            emptyAreas.forEach(function (emptyArea) {
                save && emptyArea.border.color(myColors.white, 3, myColors.red);
            });
            if (emptyAreas.length > 0 && save) {
                var message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -this.saveButtonManipulator.ordonator.children[0].height + MARGIN);
            }
            else {
                this.saveButtonManipulator.unset(3);
            }
            return (emptyAreas.length > 0);
        };

        clickEditionField(field, manipulator) {
            return () => {
                let width = drawing.width / 5,
                    height = this.h,
                    globalPointCenter = this[field].border.globalPoint(-(width) / 2, -(height) / 2),
                    contentareaStyle = {
                        toppx: globalPointCenter.y,
                        leftpx: globalPointCenter.x,
                        height: height,
                        width: width
                    };
                drawing.notInTextArea = false;
                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
                contentarea.message(this[field].labelSecret || this[field].label)
                    .color(null, 0, myColors.black).font("Arial", 20)
                    .mark('inscriptionContentArea');
                this[field].secret ? contentarea.type('password') : contentarea.type("text");
                manipulator.unset(1, this[field].content.text);
                drawings.component.add(contentarea);
                contentarea.focus();

                var displayErrorMessage = (trueManipulator = manipulator) => {
                    this.emptyAreasHandler();
                    if (!(field === "passwordConfirmationField" && trueManipulator.ordonator.children[3].messageText)) {
                        var message = autoAdjustText(this[field].errorMessage, drawing.width, this.h, 20, null, trueManipulator, 3);
                        message.text.color(myColors.red).position(this[field].border.width / 2 + MARGIN, this[field].border.height + MARGIN);
                        message.text.mark('inscriptionErrorMessage' + field);
                    }
                };
                /**
                 * mouseEvent pour modifier le champ où le clic est effectué
                 */
                var oninput = () => {
                    contentarea.enter();
                    this[field].label = contentarea.messageText;
                    this[field].labelSecret !== "undefined" && (this[field].labelSecret = contentarea.messageText);
                    if ((field === "lastNameField" || field === 'firstNameField') && !this[field].checkInput()) {
                        displayErrorMessage();
                        this[field].border.color(myColors.white, 3, myColors.red);
                    }
                    else {
                        field !== "passwordConfirmationField" && manipulator.unset(3);
                        this[field].border.color(myColors.white, 1, myColors.black);
                    }
                };
                svg.addEvent(contentarea, "input", oninput);
                var alreadyDeleted = false,
                    onblur = () => {
                        if (!alreadyDeleted) {
                            contentarea.enter();
                            if (this[field].secret) {
                                this[field].label = '';
                                this[field].labelSecret = contentarea.messageText;
                                if (contentarea.messageText) {
                                    for (let i = 0; i < contentarea.messageText.length; i++) {
                                        this[field].label += '●';
                                    }
                                }
                            } else {
                                this[field].label = contentarea.messageText;
                            }
                            contentarea.messageText && this.displayField(field, manipulator);
                            if (this[field].checkInput()) {
                                this[field].border.color(myColors.white, 1, myColors.black);
                                field !== "passwordConfirmationField" && manipulator.unset(3);
                            }
                            else {
                                this[field].secret || displayErrorMessage();
                                this[field].secret || this[field].border.color(myColors.white, 3, myColors.red);
                            }
                            drawings.component.remove(contentarea);
                            drawing.notInTextArea = true;
                            alreadyDeleted = true;
                        }
                    };
                svg.addEvent(contentarea, "blur", onblur);
                this.focusedField = this[field];
            };
        };

        displayField(field, manipulator) {
            manipulator.move(-drawing.width / 10, this[field].line * drawing.height / 10);
            var fieldTitle = new svg.Text(this[field].title).position(0, 0).font("Arial", 20).anchor("end");
            manipulator.set(2, fieldTitle);
            this.h = 1.5 * fieldTitle.boundingRect().height;
            var displayText = displayTextWithoutCorners(this[field].label, drawing.width / 5, this.h, myColors.black, myColors.white, 20, null, manipulator);
            this[field].content = displayText.content;
            this[field].border = displayText.border;
            this[field].border.mark(field);
            var y = -fieldTitle.boundingRect().height / 4;
            this[field].content.position(drawing.width / 9, 0);
            this[field].border.position(drawing.width / 9, y);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
            this.formLabels[field] = this[field].label;
            this._setEvents();
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
                this.passwordField.hash = runtime.twinBcrypt(this.passwordField.labelSecret); // algorithme pour crypter le mot de passe
                let tempObject = {
                    lastName: this.lastNameField.label,
                    firstName: this.firstNameField.label,
                    mailAddress: this.mailAddressField.label,
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
            } else if (!this.AllOk()) {
                const messageText = "Corrigez les erreurs des champs avant d'enregistrer !",
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
                "click mailAddressManipulator": this.clickEditionField("mailAddressField", this.mailAddressManipulator),
                "click passwordManipulator": this.clickEditionField('passwordField', this.passwordManipulator),
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
                    svg.event(this.tabForm[index].border, "click");
                }
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                this.connexionButtonHandler();
            }
        }

        displayField(field, manipulator) {
            var fieldTitle = new svg.Text(this[field].title).position(0, 0);
            fieldTitle.font("Arial", 20).anchor("end");
            manipulator.set(2, fieldTitle);
            manipulator.move(-drawing.width / 10, this[field].line * drawing.height / 10);
            this.h = 1.5 * fieldTitle.boundingRect().height;
            var displayText = displayTextWithoutCorners(this[field].label, drawing.width / 6, this.h, myColors.black, myColors.white, 20, null, manipulator);
            this[field].content = displayText.content;
            this[field].border = displayText.border;
            this[field].border.mark(field);
            var y = -fieldTitle.boundingRect().height / 4;
            this[field].content.position(drawing.width / 10, 0);
            this[field].border.position(drawing.width / 10, y);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
            this._setEvents(); //TODO a changer, on en a besoin car display field recrée à chaque fois le text, donc on perd les events
        }

        /*displayCookieLabel(sourceObject) {
         let fieldTitle = new svg.Text(sourceObject["cookieField"].title).position(0, 0);
         fieldTitle.font("Arial", 20).anchor("end");
         let manipulator = sourceObject.cookieManipulator;
         manipulator.set(2, fieldTitle);
         manipulator.move(-drawing.width / 10, sourceObject["cookieField"].line * drawing.height / 10);
         }*/

        clickEditionField(field, manipulator) {
            return () => {
                const width = drawing.width / 6,
                    height = this.h,
                    globalPointCenter = this[field].border.globalPoint(-(width) / 2, -(height) / 2),
                    contentareaStyle = {
                        toppx: globalPointCenter.y,
                        leftpx: globalPointCenter.x,
                        height: height,
                        width: this[field].border.width
                    };
                drawing.notInTextArea = false;
                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height)
                    .mark('connectionContentArea')
                    .message(this[field].labelSecret || this[field].label)
                    .color(null, 0, myColors.black).font("Arial", 20);
                this[field].secret && contentarea.type('password');
                manipulator.unset(1, this[field].content.text);
                drawings.component.add(contentarea);
                contentarea.focus();
                let alreadyDeleted = false,
                    onblur = () => {
                        if (!alreadyDeleted) {
                            contentarea.enter();
                            if (this[field].secret) {
                                this[field].label = '';
                                this[field].labelSecret = contentarea.messageText;
                                if (contentarea.messageText) {
                                    for (let i = 0; i < contentarea.messageText.length; i++) {
                                        this[field].label += '●';
                                    }
                                }
                            } else {
                                this[field].label = contentarea.messageText;
                            }
                            contentarea.messageText && this.displayField(field, manipulator);
                            manipulator.unset(3);
                            drawing.notInTextArea = true;
                            alreadyDeleted || drawings.component.remove(contentarea);
                            alreadyDeleted = true;
                        }
                    };
                svg.addEvent(contentarea, "blur", onblur);
                this.focusedField = this[field];
            };
        }

        connexionButtonHandler() {
            let emptyAreas = this.tabForm.filter(field => field.label === '');
            emptyAreas.forEach(emptyArea => {
                emptyArea.border.color(myColors.white, 3, myColors.red);
            });

            if (emptyAreas.length > 0) {
                let message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                svg.timeout(() => {
                    this.connexionButtonManipulator.unset(3);
                    emptyAreas.forEach(emptyArea => {
                        emptyArea.border.color(myColors.white, 1, myColors.black);
                    });
                }, 5000);
            } else {
                Server.connect(this.mailAddressField.label, this.passwordField.labelSecret).then(data => {
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
