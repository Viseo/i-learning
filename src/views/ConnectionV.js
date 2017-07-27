/**
 * Created by DMA3622 on 03/05/2017.
 */
exports.ConnectionV = function (globalVariables) {
    const
        View = globalVariables.View,
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        drawing = globalVariables.drawing,
        gui = globalVariables.gui,
        IconCreator = globalVariables.Icons.IconCreator,
        drawCheck = globalVariables.Helpers.drawCheck,
        popUp = globalVariables.popUp;

    const
        FONT_SIZE_INPUT = 18,
        FONT_SIZE_TEXT = 15,
        CHECKBOX_SIZE = 20,
        BUTTON_WIDTH = 230,
        FIELDS_COLORS = [myColors.white, 1, myColors.turquoise],
        TITLE_COLOR = [myColors.white, 0, myColors.white];

    var FORM_POS_X, ELEMENTS_MARGIN, BIG_ICON_MARGIN, INPUT_SIZE, BUTTON_HEIGHT, BIG_ICON_HEIGHT;

    class ConnectionV extends View {
        constructor(presenter) {
            super(presenter);
            this.inputs = [];
        }

        displayHeader(){
            var _displayConnection = () => {
                let messageText = new svg.Text('CONNEXION')
                    .dimension(BUTTON_WIDTH, this.height)
                    .font(FONT, FONT_SIZE_INPUT)
                    .fontWeight('bold')
                    .color(myColors.black)
                    .mark("headerMessage");
                this.manipulator.add(messageText);
                messageText.position(this.header.width - BUTTON_WIDTH - BUTTON_WIDTH/2 - 2*MARGIN, this.header.height / 2 + FONT_SIZE_INPUT/4 + MARGIN)
                let button = new gui.Button(BUTTON_WIDTH, this.header.height/2, [myColors.white, 1.5, myColors.turquoise], "Créer un compte")
                    .corners(25, 25)
                    .onClick(this.switchPage.bind(this))
                button.text.font(FONT)
                button.position(this.header.width - BUTTON_WIDTH/2 - MARGIN, this.header.height/2 + MARGIN)
                this.manipulator.add(button.component)
            }
            var _displayRegister = () => {
                let messageText = new svg.Text('CREER UN COMPTE')
                    .dimension(BUTTON_WIDTH, this.height)
                    .font(FONT, FONT_SIZE_INPUT)
                    .fontWeight('bold')
                    .color(myColors.black)
                    .mark("headerMessage");
                this.manipulator.add(messageText);
                messageText.position(this.header.width - BUTTON_WIDTH/2 - MARGIN, this.header.height / 2 + FONT_SIZE_INPUT/4 + MARGIN)
                let button = new gui.Button(BUTTON_WIDTH, this.header.height/2, [myColors.white, 1.5, myColors.turquoise], "Connexion")
                    .corners(25, 25)
                    .onClick(this.switchPage.bind(this))
                button.text.font(FONT)
                button.position(this.header.width - button.width/2 - 2*MARGIN - BUTTON_WIDTH, this.header.height/2 + MARGIN)
                this.manipulator.add(button.component)
            }

            super.displayHeader();
            if(this.isConnectionPage()){
                _displayConnection();
            }else {
                _displayRegister();
            }
        }

        display() {
            var _calcSizes = () => {
                FORM_POS_X = drawing.width*3/4;
                ELEMENTS_MARGIN = drawing.height*4/100;
                BIG_ICON_MARGIN = ELEMENTS_MARGIN*3;
                INPUT_SIZE = {w: drawing.width / 4, h: ELEMENTS_MARGIN*5/4};
                BUTTON_HEIGHT = INPUT_SIZE.h * 5 / 4;
            }
            var _displayBackground = () => {
                let offsetX = (drawing.width - drawing.height * (16 / 9)) / 2;
                let offsetY = (drawing.height - drawing.width / (16 / 9)) / 2;
                if (offsetX < 0) offsetX = 0;
                if (offsetY < 0) offsetY = 0;

                let background = new svg.Image('../images/login_back.png')
                    .dimension(drawing.width, drawing.height)
                    .position(drawing.width / 2 - offsetX, drawing.height / 2 + offsetY)
                this.manipulator.add(background);
            }
            var _initManips = () => {
                this.bigIconManipulator = new Manipulator(this);
                this.fieldsManipulator = new Manipulator(this);
                this.cookieManipulator = new Manipulator(this).mark("cookieManipulator")
                this.newPasswordManipulator = new Manipulator(this).addOrdonator(1).mark("newPasswordManipulator");
                this.connectionButtonManipulator = new Manipulator(this);
                this.registerTextManipulator = new Manipulator(this);
                this.manipulator
                    .add(this.bigIconManipulator)
                    .add(this.fieldsManipulator)
                    .add(this.cookieManipulator)
                    .add(this.newPasswordManipulator)
                    .add(this.connectionButtonManipulator)
                    .add(this.registerTextManipulator);
            }
            var _displayBigIcon = () => {
                let body_r = 40, head_r = body_r/2;
                BIG_ICON_HEIGHT = head_r*2 + body_r*2 + MARGIN;
                let headCircle = new svg.Circle(head_r).color(myColors.white, 8, myColors.turquoise)
                let bodyCircle = new svg.Circle(body_r)
                    .color(myColors.white, 8, myColors.turquoise)
                bodyCircle.position(0, headCircle.r*2 + bodyCircle.r/2 + MARGIN)
                let maskRect = new svg.Rect(body_r*2+8, body_r+8).color(myColors.white, 0, myColors.black);
                maskRect.position(0, bodyCircle.y+maskRect.height/2+5)

                this.bigIconManipulator
                    .add(headCircle)
                    .add(bodyCircle)
                    .add(maskRect)
                    .move(FORM_POS_X, this.header.height + BIG_ICON_MARGIN + headCircle.r)
            }
            var _displayFields = () => {
                var _displayField = (field, index) => {
                    var _updatePresenter = (oldMessage, newMessage, valid) => {
                        this.setValid(field, valid);
                        if (valid) this.setFieldText(field, newMessage);
                    }
                    var _selectInput = () => {
                        this.selectedInput = fieldArea;
                    }
                    var _displayPwdIcon = (isPasswordShown) => {
                        var _toggleIcon = () => {
                            _displayPwdIcon(!isPasswordShown);
                        }

                        let src = isPasswordShown ? '../images/hide.png' : '../images/view.png';
                        let icon = IconCreator.createImageIcon(src, fieldManip, 2);
                        icon.position(INPUT_SIZE.w / 2 + MARGIN + icon.getContentSize() / 2, 0);
                        icon.addEvent('click', _toggleIcon);
                        fieldArea.type(isPasswordShown ? 'text' : 'password');
                    }

                    let fieldManip = new Manipulator(this).addOrdonator(3);
                    let icon = IconCreator.createImageIcon(field.iconSrc, fieldManip, 1);
                    icon.position(-INPUT_SIZE.w / 2 - icon.getContentSize() / 2 - MARGIN, 0);
                    let fieldArea = new gui.TextField(0, 0, INPUT_SIZE.w, INPUT_SIZE.h, '')
                        .type(field.type)
                        .font(FONT, FONT_SIZE_INPUT)
                        .placeHolder(field.title)
                        .color(FIELDS_COLORS)
                        .editColor(FIELDS_COLORS)
                        .pattern(field.pattern)
                        .anchor("left")
                        .mark(field.id)
                        .onInput(_updatePresenter)
                        .onClick(_selectInput);
                    fieldManip.set(0, fieldArea.component);
                    fieldManip.move(0, index * (INPUT_SIZE.h + ELEMENTS_MARGIN));

                    this.inputs.push(fieldArea);
                    if (field.type === "password") {
                        _displayPwdIcon(false);
                    }
                    return fieldManip;
                };

                let fields = this.getFields();
                this.fieldsManipulator.move(FORM_POS_X, this.header.height + BIG_ICON_MARGIN + BIG_ICON_HEIGHT + ELEMENTS_MARGIN);
                fields.forEach((field, index) => {
                    let fieldManip = _displayField(field, index);
                    this.fieldsManipulator.add(fieldManip);
                });

            };
            var _displayRememberMe = () => {
                var _displayTitle = () => {
                    let fieldTitle = new svg.Text("se souvenir de moi")
                        .fontStyle('italic')
                        .dimension(INPUT_SIZE.w / 2, FONT_SIZE_TEXT)
                        .font(FONT, FONT_SIZE_TEXT)
                        .anchor("start")
                        .color(TITLE_COLOR)
                        .position(CHECKBOX_SIZE, 0);
                    this.cookieManipulator.add(fieldTitle)
                }
                var _displayCheckBox = () => {
                    var _displayChecked = (isChecked) => {
                        var _toggleChecked = () => {
                            _displayChecked(!isChecked);
                        }

                        this.setStayConnected(isChecked);
                        if (isChecked) {
                            this.cookieManipulator.add(checked);
                        } else {
                            this.cookieManipulator.remove(checked);
                        }
                        this.cookieManipulator.addEvent('click', _toggleChecked);
                    }

                    let checkbox = new svg.Rect(CHECKBOX_SIZE, CHECKBOX_SIZE).color(myColors.white, 1.5, myColors.turquoise);
                    let checked = drawCheck(checkbox.x, checkbox.y, CHECKBOX_SIZE);
                    this.cookieManipulator.add(checkbox);
                    _displayChecked(true);
                }

                _displayTitle();
                _displayCheckBox();
                this.cookieManipulator.move(FORM_POS_X - INPUT_SIZE.w / 2 + CHECKBOX_SIZE / 2, this.header.height + BIG_ICON_MARGIN + BIG_ICON_HEIGHT + MARGIN + (INPUT_SIZE.h + ELEMENTS_MARGIN) * this.getFields().length);
            };
            var _displayForgotPWD = () => {
                var _forgotHandler = () => {
                    this.forgotPWD().then(() => {
                        let forgotttenPassText = new svg.Text('Un mail a été envoyé pour réinitialiser votre mot de passe.')
                            .dimension(INPUT_SIZE.w / 2, INPUT_SIZE.h / 2)
                            .color(myColors.greyerBlue)
                            .font(FONT, FONT_SIZE_TEXT)
                            .mark("forgottenPassText");

                        this.newPasswordManipulator.set(0, forgotttenPassText);
                        svg.timeout(() => {
                            this.newPasswordManipulator.set(0, fieldTitle);
                        }, 5000);
                    })
                }
                let fieldTitle = new svg.Text("Mot de passe oublié ?")
                    .fontStyle('italic')
                    .color(myColors.greyerBlue)
                    .dimension(INPUT_SIZE.w / 2, INPUT_SIZE.h / 2)
                    .anchor('end')
                    .position(0, 0)
                    .font(FONT, FONT_SIZE_TEXT);
                this.newPasswordManipulator.set(0, fieldTitle)
                    .move(FORM_POS_X + INPUT_SIZE.w / 2, this.header.height + BIG_ICON_MARGIN + BIG_ICON_HEIGHT + MARGIN + (INPUT_SIZE.h + ELEMENTS_MARGIN) * this.getFields().length)
                this.newPasswordManipulator.addEvent('click', _forgotHandler);
            };
            var _displayButton = () => {
                let buttonText = this.isConnectionPage() ? 'Se Connecter' : "S'inscrire";
                let button = new gui.Button(INPUT_SIZE.w / 2, BUTTON_HEIGHT, [myColors.turquoise, 0, myColors.black], buttonText);
                button.text.color(myColors.white, 0, myColors.white);
                button.corners(25, 25);
                console.log(this.getFields().length);
                this.connectionButtonManipulator
                    .add(button.component)
                    .move(FORM_POS_X, this.header.height + BIG_ICON_MARGIN + BIG_ICON_HEIGHT + ELEMENTS_MARGIN + (INPUT_SIZE.h + ELEMENTS_MARGIN) * (this.getFields().length + (this.isConnectionPage() ? 1 : 0)))
                    .mark('connectionButton');
                this.connectionButtonManipulator.addEvent('click', () => this.tryLogin.call(this));
            };

            super.display();
            _calcSizes();
            _displayBackground();
            _initManips();
            this.displayHeader();
            _displayBigIcon();
            _displayFields();
            if(this.isConnectionPage()){
                _displayRememberMe();
                _displayForgotPWD();
            }
            _displayButton();
            svg.addGlobalEvent("keydown", (event) => this.keyDown.call(this, event));
        }

        tryLogin() {
            this.selectedInput && this.selectedInput.hideControl();
            this.logIn().catch((message) => {
                popUp.display(message, this.manipulator);
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
                svg.event(this.inputs[newIndex].glass, 'click', event);
                this.selectedInput = this.inputs[newIndex];
                this.selectedInput.mark(this.selectedInput.id + 'selectedInput');
            }

            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                let isPrevious = event.shiftKey;
                _focusField(isPrevious);
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                this.tryLogin();
            }
        }

        logIn() {
            return this.presenter.logIn();
        }

        isConnectionPage(){
            return this.presenter.isConnectionPage();
        }

        switchPage() {
            this.presenter.switchPage();
        }

        forgotPWD() {
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

        setStayConnected(isStay) {
            this.presenter.setStayConnected(isStay);
        }
    }

    return ConnectionV;
};