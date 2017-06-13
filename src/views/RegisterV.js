/**
 * Created by DMA3622 on 04/05/2017.
 */

exports.RegisterV = function (globalVariables) {
    const
        View = globalVariables.View,
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        drawing = globalVariables.drawing,
        gui = globalVariables.gui,
        IconCreator = globalVariables.Icons.IconCreator;

    const
        FONT_SIZE_INPUT = 20,
        FONT_SIZE_TITLE = 25,
        BUTTON_MARGIN = 80,
        TITLE_COLOR = [myColors.white, 0, myColors.white],
        EDIT_COLORS = [myColors.white, 1, myColors.greyerBlue],
        COLORS = [myColors.white, 1, myColors.black],
        INPUT_SIZE = {w:550, h: 30},
        BUTTON_HEIGHT = INPUT_SIZE.h * 5 / 4;

    class RegisterV extends View {
        constructor(presenter) {
            super(presenter);
            this.inputs = [];
        }

        display() {
            var _declareManipulator = () => {
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
            var _displayFields = () => {
                var _displayField = (field) => {
                    var _updatePresenter = (oldMessage, newMessage, valid) => {
                        this.setValid(field, valid);
                        if (valid) this.setFieldText(field, newMessage);
                    }
                    var _selectInput = () => {
                        this.selectedInput = fieldArea;
                    }
                    var _displayPwdIcon = (isShown) => {
                        var _toggleIcon = () => {
                            _displayPwdIcon(!isShown);
                        }

                        let src = isShown ? '../images/hide.png' : '../images/view.png';
                        let icon = IconCreator.createImageIcon(src, fieldManip, 2);
                        icon.position(INPUT_SIZE.w/2 + MARGIN + icon.getContentSize() / 2, 0);
                        icon.addEvent('click', _toggleIcon);
                        fieldArea.type(isShown ? 'text' : 'password');
                    }

                    let fieldManip = new Manipulator(this).addOrdonator(3);
                    let manipHeight = (INPUT_SIZE.h + FONT_SIZE_TITLE);

                    let icon = IconCreator.createImageIcon(field.iconSrc, fieldManip, 1);
                    icon.position(-INPUT_SIZE.w / 2 + icon.getContentSize() / 2 + MARGIN, 0);
                    let fieldTitle = new svg.Text(field.title);
                    fieldTitle
                        .dimension(INPUT_SIZE.w, FONT_SIZE_TITLE)
                        .font(FONT, FONT_SIZE_TITLE)
                        .color(TITLE_COLOR)
                        .anchor("start")
                        .position(-INPUT_SIZE.w / 2, -INPUT_SIZE.h);

                    let fieldArea = new gui.TextField(0, 0, INPUT_SIZE.w, INPUT_SIZE.h, "");
                    fieldArea.font(FONT, FONT_SIZE_INPUT)
                        .color(COLORS)
                        .editColor(EDIT_COLORS)
                        .pattern(field.pattern)
                        .type(field.type)
                        .anchor("center")
                        .mark(field.id);
                    fieldArea.onInput(_updatePresenter);
                    fieldArea.onClick(_selectInput);
                    fieldManip.add(fieldTitle);
                    fieldManip.set(0, fieldArea.component);
                    fieldManip.move(0, manipHeight / 2 + field.index * (manipHeight + 2 * MARGIN));

                    this.inputs.push(fieldArea);

                    if(field.type === "password"){
                        _displayPwdIcon(false);
                    }

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
                let saveButton = new gui.Button(INPUT_SIZE.w, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], 'Inscription');
                saveButton.text.color(myColors.lightgrey, 0, myColors.white);
                saveButton.component.mark('saveButton');
                saveButton.activeShadow();
                this.saveButtonManipulator
                    .add(saveButton.component)
                    .move(drawing.width / 2, this.header.height + BUTTON_MARGIN + 2 * MARGIN + (INPUT_SIZE.h + FONT_SIZE_TITLE + 2 * MARGIN) * 5);
                this.saveButtonManipulator.addEvent('click', () => this.tryRegister.call(this));
            };
            var _displayConnectionLabel = () => {
                let connexionText = new svg.Text("Vous êtes déjà inscrit ? Se connecter")
                    .dimension(INPUT_SIZE.w, INPUT_SIZE.h)
                    .color(myColors.greyerBlue)
                    .font(FONT, FONT_SIZE_TITLE * 2 / 3)
                    .mark('connexionText');

                this.connectionTextManipulator.add(connexionText).move(drawing.width / 2, this.saveButtonManipulator.y + BUTTON_HEIGHT + MARGIN);
                this.connectionTextManipulator.addEvent('click',() => this.returnToOldPage());
            };

            super.display();
            _declareManipulator();
            this.displayHeader('Inscription');
            _displayFields();
            _displaySaveButton();
            _displayConnectionLabel();
            svg.addGlobalEvent('keydown',(event) => this.keyDown.call(this,event));
        }

        tryRegister(){
            this.registerNewUser().then(() => {
                let message = new svg.Text('Votre compte a bien été créé !')
                    .dimension(INPUT_SIZE.w, INPUT_SIZE.h)
                    .position(0, -MARGIN - BUTTON_HEIGHT)
                    .color(myColors.green)
                    .font(FONT, FONT_SIZE_INPUT)
                    .mark('successMessage');
                this.saveButtonManipulator.add(message);
                setTimeout(() => {
                    this.saveButtonManipulator.remove(message);
                    this.returnToOldPage();
                }, 3000);
            }).catch((data) => {
                let error = new svg.Text(JSON.parse(data).reason)
                    .dimension(INPUT_SIZE.w, INPUT_SIZE.h)
                    .position(0, -(INPUT_SIZE.h + MARGIN))
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
                this.selectedInput.mark(this.selectedInput.id + 'selectedInput');
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
        returnToOldPage(){
            this.presenter.returnToOldPage();
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
