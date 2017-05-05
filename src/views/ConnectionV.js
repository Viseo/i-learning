/**
 * Created by DMA3622 on 03/05/2017.
 */
exports.ConnectionV = function (globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        drawing = globalVariables.drawing,
        gui = globalVariables.gui,
        IconCreator = globalVariables.domain.IconCreator,
        FONT = 'Arial',
        FONT_SIZE_INPUT = 20,
        FONT_SIZE_TITLE = 25,
        BUTTON_MARGIN = 80,
        CHECKBOX_SIZE = 15,
        EDIT_COLORS = [myColors.white, 1, myColors.greyerBlue],
        COLORS = [myColors.white, 1, myColors.black],
        INPUT_WIDTH = 550,
        INPUT_HEIGHT = 30,
        BUTTON_HEIGHT = INPUT_HEIGHT * 5 / 4,
        TITLE_COLOR = [myColors.white, 0, myColors.white];

    class ConnectionV {
        constructor(presenter) {
            var _initV = () => {
                this.presenter = presenter;
                this.inputs = [];
            }
            var _declareManipulators = () => {
                this.manipulator = new Manipulator(this);
                this.header = new globalVariables.domain.HeaderVue();
                this.fieldsManip = new Manipulator(this);
                this.cookieManipulator = new Manipulator(this);
                this.cookieManipulator.component.mark("cookieManipulator");
                this.newPasswordManipulator = new Manipulator(this).addOrdonator(1);
                this.newPasswordManipulator.component.mark("newPasswordManipulator");
                this.connectionButtonManipulator = new Manipulator(this);
                this.registerTextManipulator = new Manipulator(this);
                this.manipulator
                    .add(this.fieldsManip)
                    .add(this.cookieManipulator)
                    .add(this.newPasswordManipulator)
                    .add(this.connectionButtonManipulator)
                    .add(this.registerTextManipulator);
            }

            _initV();
            _declareManipulators();
        }

        flush(){
            drawing.manipulator.flush();
        }

        fromReturn(){
            this.display();
        }

        display() {
            var _displayHeader = () => {
                let headerManipulator = this.header.getManipulator();
                this.manipulator.add(headerManipulator);
                this.header.display("Connexion");
            };
            var _displayFields = () => {
                var _displayField = (field) => {
                    var _displayIcon = () => {
                        let icon = IconCreator.createImageIcon(field.iconSrc, fieldManip, 1);
                        icon.position(-INPUT_WIDTH / 2 + icon.getContentSize() / 2 + MARGIN, 0);
                    }
                    var _displayTitle = () => {
                        let fieldTitle = new svg.Text(field.title);
                        fieldTitle
                            .dimension(INPUT_WIDTH, FONT_SIZE_TITLE)
                            .font(FONT, FONT_SIZE_TITLE)
                            .color(TITLE_COLOR)
                            .anchor("start")
                            .position(-INPUT_WIDTH / 2, -INPUT_HEIGHT);
                        fieldManip.add(fieldTitle);
                    }
                    var _displayArea = () => {
                        var _updatePresenter = (oldMessage, newMessage, valid) => {
                            this.setValid(field, valid);
                            if (valid) this.setFieldText(field, newMessage);
                        }
                        var _selectInput = () => {
                            this.selectedInput = fieldArea;
                        }
                        var _displayEye = () => {
                            var _displayPwdIcon = (isShown) => {
                                var _toggleIcon = () => {
                                    _displayPwdIcon(!isShown);
                                }

                                let src = isShown ? '../images/hide.png' : '../images/view.png';
                                let icon = IconCreator.createImageIcon(src, fieldManip, 2);
                                icon.position(INPUT_WIDTH/2 + MARGIN + icon.getContentSize() / 2, 0);
                                icon.addEvent('click', _toggleIcon);
                                fieldArea.type(isShown ? 'text' : 'password');
                            }

                            _displayPwdIcon(false);
                        }

                        let fieldArea = new gui.TextField(0, 0, INPUT_WIDTH, INPUT_HEIGHT, "");
                        fieldArea.font(FONT, FONT_SIZE_INPUT)
                            .color(COLORS)
                            .editColor(EDIT_COLORS)
                            .pattern(field.pattern)
                            .type(field.type)
                            .anchor("center")
                        fieldManip.set(0, fieldArea.component);

                        fieldArea.onInput(_updatePresenter);
                        fieldArea.onClick(_selectInput);
                        this.inputs.push(fieldArea);

                        if(field.type === "password"){
                            _displayEye();
                        }
                    }

                    let fieldManip = new Manipulator(this).addOrdonator(3);
                    let manipHeight = (INPUT_HEIGHT + FONT_SIZE_TITLE);
                    fieldManip.move(0, manipHeight / 2 + field.index * (manipHeight + 2 * MARGIN));

                    _displayTitle();
                    _displayArea()
                    _displayIcon();

                    return fieldManip;
                };

                let fields = this.getFields();
                this.fieldsManip.move(drawing.width / 2, this.header.height + 2 * MARGIN);
                fields.forEach(field => {
                    let fieldManip = _displayField(field);
                    this.fieldsManip.add(fieldManip);
                });

            };
            var _displayCookieCheckbox = () => {
                var _displayTitle = () => {
                    let fieldTitle = new svg.Text("Se souvenir de moi");
                    fieldTitle.dimension(INPUT_WIDTH / 2, FONT_SIZE_TITLE);
                    fieldTitle.font("Arial", FONT_SIZE_TITLE * 3 / 4).anchor("start");
                    fieldTitle.color(TITLE_COLOR);
                    fieldTitle.position(CHECKBOX_SIZE, (CHECKBOX_SIZE) / 2);
                    this.cookieManipulator.add(fieldTitle)
                }
                var _displayCheckBox = () => {
                    var _displayChecked = (isChecked) => {
                        var _toggleChecked = () => {
                            _displayChecked(!isChecked);
                        }

                        this.setStayConnected(isChecked);
                        if(isChecked){
                            this.cookieManipulator.add(checked);
                        }else {
                            this.cookieManipulator.remove(checked);
                        }
                        this.cookieManipulator.addEvent('click', _toggleChecked);
                    }

                    let checkbox = new svg.Rect(CHECKBOX_SIZE, CHECKBOX_SIZE).color(myColors.white, 2, myColors.black);
                    let checked = drawCheck(checkbox.x, checkbox.y, CHECKBOX_SIZE);
                    this.cookieManipulator.add(checkbox);
                    _displayChecked(true);
                }

                _displayTitle();
                _displayCheckBox();
                this.cookieManipulator.move(drawing.width / 2 - INPUT_WIDTH / 2 + CHECKBOX_SIZE / 2, this.header.height + 2 * MARGIN + (INPUT_HEIGHT + FONT_SIZE_TITLE + 2 * MARGIN) * 4);
            };
            var _displayForgotPWD = () => {
                var _forgotHandler = () => {
                    this.forgotPWD().then(()=> {
                        let forgotttenPassText = new svg.Text('Un mail a été envoyé pour réinitialiser votre mot de passe.')
                            .dimension(INPUT_WIDTH / 2, INPUT_HEIGHT / 2)
                            .color(myColors.greyerBlue)
                            .font(FONT, FONT_SIZE_TITLE * 2 / 3)
                            .mark("forgottenPassText");
                        this.newPasswordManipulator.set(0, forgotttenPassText);
                        svg.timeout(() => {
                            this.newPasswordManipulator.set(0, fieldTitle);
                        }, 5000);
                    })
                }
                let fieldTitle = new svg.Text("Mot de passe oublié ?")
                    .color(myColors.greyerBlue)
                    .dimension(INPUT_WIDTH / 2, INPUT_HEIGHT / 2)
                    .anchor('end')
                    .position(0, 0)
                    .font(FONT, FONT_SIZE_TITLE * 3 / 4);
                this.newPasswordManipulator.set(0, fieldTitle)
                    .move(drawing.width / 2 + INPUT_WIDTH / 2, this.header.height + 2 * MARGIN + (INPUT_HEIGHT + FONT_SIZE_TITLE + 2 * MARGIN) * 4);
                this.newPasswordManipulator.addEvent('click', _forgotHandler);
            };
            var _displayButton = () => {
                var _displayButton = () => {
                    let button = new gui.Button(INPUT_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], 'Connexion');
                    button.text.color(myColors.lightgrey, 0, myColors.white);
                    button.activeShadow();
                    this.connectionButtonManipulator
                        .add(button.component)
                        .move(drawing.width / 2, this.header.height + BUTTON_MARGIN + 2 * MARGIN + (INPUT_HEIGHT + FONT_SIZE_TITLE + 2 * MARGIN) * 5);
                    this.connectionButtonManipulator.addEvent('click', () => this.tryLogin.call(this));
                }
                var _displayRegisterText = () => {
                    let registerText = new svg.Text("Vous venez d'arriver ? Créer un compte")
                        .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                        .color(myColors.greyerBlue)
                        .font(FONT, FONT_SIZE_TITLE * 2 / 3);
                    this.registerTextManipulator.add(registerText).move(drawing.width / 2, this.connectionButtonManipulator.y + BUTTON_HEIGHT + MARGIN);
                    this.registerTextManipulator.addEvent('click',() => this.goToRegister.call(this));
                }

                _displayButton();
                _displayRegisterText();
            };

            drawing.manipulator.add(this.manipulator);
            _displayHeader();
            _displayFields();
            _displayCookieCheckbox();
            _displayForgotPWD();
            _displayButton();
            svg.addGlobalEvent("keydown", (event) => this.keyDown.call(this, event));
        }

        refresh() {

        }

        tryLogin(){
            this.logIn().catch((message) => {
                let error = new svg.Text(message)
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .position(0, -(INPUT_HEIGHT + MARGIN))
                    .color(myColors.red)
                    .font(FONT, FONT_SIZE_INPUT)
                    .mark("msgFieldError");
                this.connectionButtonManipulator.add(error);
                svg.timeout(() => {
                    this.connectionButtonManipulator.remove(error);
                }, 5000);
            });
        }

        keyDown(event) {
            var _focusField = (isPrevious) => {
                var _previousIndex = (currentIndex) => {
                    if (currentIndex != -1) {
                        if (currentIndex === 0) {
                            return (this.inputs.length - 1);
                        } else {
                            return currentIndex - 1;
                        }
                    } else {
                        return 0;
                    }
                }
                var _nextIndex = (currentIndex) => {
                    if (currentIndex != -1) {
                        if (currentIndex === (this.inputs.length - 1)) {
                            return 0;
                        } else {
                            return currentIndex + 1;
                        }
                    } else {
                        return 0;
                    }
                }

                let currentIndex = this.inputs.indexOf(this.selectedInput);
                let newIndex = isPrevious ? _previousIndex(currentIndex) : _nextIndex(currentIndex);
                svg.event(this.inputs[newIndex].glass, 'click');
                this.selectedInput = this.inputs[newIndex];
            }

            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                let isPrevious = event.shiftKey;
                _focusField(isPrevious);
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                this.tryLogin();
                this.selectedInput.hideControl();
            }
        }

        logIn() {
            return this.presenter.logIn();
        }
        goToRegister(){
            this.presenter.goToRegister();
        }
        forgotPWD(){
            return this.presenter.forgotPWD();
        }
        getFields() {
            return this.presenter.getFields();
        }
        setValid(field, valid) {
            this.presenter.setValid(field, valid);
        }
        setFieldText(field, text) {
            this.presenter.setFieldText(field, text);
        }
        setStayConnected(isStay){
            this.presenter.setStayConnected(isStay);
        }


    }
    return ConnectionV;
}