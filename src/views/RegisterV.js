/**
 * Created by DMA3622 on 04/05/2017.
 */

exports.RegisterV = function (globalVariables) {
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
        EDIT_COLORS = [myColors.white, 1, myColors.greyerBlue],
        COLORS = [myColors.white, 1, myColors.black],
        INPUT_WIDTH = 550,
        INPUT_HEIGHT = 30,
        BUTTON_HEIGHT = INPUT_HEIGHT * 5 / 4,
        TITLE_COLOR = [myColors.white, 0, myColors.white];

    class RegisterV {
        constructor(presenter) {
            var _initV = () => {
                this.presenter = presenter;
                this.inputs = [];
            }
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.header = new globalVariables.domain.HeaderVue();
                this.fieldsManip = new Manipulator(this);
                this.saveButtonManipulator = new Manipulator(this).addOrdonator(2);
                this.saveButtonManipulator.component.mark('saveButton');
                this.connectionTextManipulator = new Manipulator(this);
                this.connectionTextManipulator.component.mark('connexionText');
                this.manipulator
                    .add(this.fieldsManip)
                    .add(this.saveButtonManipulator)
                    .add(this.connectionTextManipulator);
            }

            _initV();
            _declareManipulator();
        }

        flush(){
            drawing.manipulator.flush();
        }

        display() {
            var _displayHeader = () => {
                let headerManipulator = this.header.getManipulator();
                this.manipulator.add(headerManipulator);
                this.header.display("Inscription");
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
            var _displaySaveButton = () => {
                let saveButton = new gui.Button(INPUT_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], 'Inscription');
                saveButton.text.color(myColors.lightgrey, 0, myColors.white);
                saveButton.activeShadow();
                this.saveButtonManipulator
                    .add(saveButton.component)
                    .move(drawing.width / 2, this.header.height + BUTTON_MARGIN + 2 * MARGIN + (INPUT_HEIGHT + FONT_SIZE_TITLE + 2 * MARGIN) * 5);
                this.saveButtonManipulator.addEvent('click', () => this.tryRegister.call(this));
            };
            var _displayConnectionLabel = () => {
                let connexionText = new svg.Text("Vous êtes déjà inscrit ? Se connecter")
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .color(myColors.greyerBlue)
                    .font(FONT, FONT_SIZE_TITLE * 2 / 3)
                    .mark('connexionText');

                this.connectionTextManipulator.add(connexionText).move(drawing.width / 2, this.saveButtonManipulator.y + BUTTON_HEIGHT + MARGIN);
                this.connectionTextManipulator.addEvent('click',(event) => this.goToConnection.call(this, event));
            };

            drawing.manipulator.add(this.manipulator);
            _displayHeader();
            _displayFields();
            _displaySaveButton();
            _displayConnectionLabel();
            svg.addGlobalEvent('keydown',(event) => this.keyDown.call(this,event));
        }

        refresh() {

        }

        tryRegister(){
            this.registerNewUser().then(() => {
                let message = new svg.Text("Votre compte a bien été créé !")
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .position(0, -MARGIN - BUTTON_HEIGHT)
                    .color(myColors.green)
                    .font(FONT, FONT_SIZE_INPUT)
                    .mark('successMessage');
                this.saveButtonManipulator.add(message);
                setTimeout(() => {
                    this.saveButtonManipulator.remove(message);
                    this.goToConnection();
                }, 3000);
            }).catch((message) => {
                let error = new svg.Text(message)
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .position(0, -(INPUT_HEIGHT + MARGIN))
                    .color(myColors.red)
                    .font(FONT, FONT_SIZE_INPUT)
                    .mark("msgFieldError");
                this.saveButtonManipulator.add(error);
                svg.timeout(() => {
                    this.saveButtonManipulator.remove(error);
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
                this.tryRegister();
                this.selectedInput.hideControl();
            }
        }

        getFields() {
            return this.presenter.getFields();
        }
        goToConnection(){
            this.presenter.goToConnection();
        }
        registerNewUser() {
            return this.presenter.registerNewUser();
        }
        setValid(field, valid) {
            this.presenter.setValid(field, valid);
        }
        setFieldText(field, text) {
            this.presenter.setFieldText(field, text);
        }
    }

    return RegisterV;
}
