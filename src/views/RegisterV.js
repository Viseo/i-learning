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
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
            this.fieldsManip = new Manipulator(this);
            this.firstNameManipulator = new Manipulator(this);
            this.lastNameManipulator = new Manipulator(this);
            this.mailAddressManipulator = new Manipulator(this);
            this.passwordManipulator = new Manipulator(this);
            this.passwordConfirmationManipulator = new Manipulator(this);
            this.saveButtonManipulator = new Manipulator(this);
            this.saveButtonManipulator.component.mark('saveButton');
            this.connexionTextManipulator = new Manipulator(this);
            this.connexionTextManipulator.component.mark('connexionText');

            this.manipulator
                .add(this.fieldsManip)
                .add(this.firstNameManipulator)
                .add(this.lastNameManipulator)
                .add(this.mailAddressManipulator)
                .add(this.passwordManipulator)
                .add(this.passwordConfirmationManipulator)
                .add(this.saveButtonManipulator)
                .add(this.connexionTextManipulator);
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
                        let fieldArea = new gui.TextField(0, 0, INPUT_WIDTH, INPUT_HEIGHT, "");
                        fieldArea.font(FONT, FONT_SIZE_INPUT)
                            .color(COLORS)
                            .editColor(EDIT_COLORS)
                            .pattern(field.pattern)
                            .type(field.type)
                            .anchor("center")
                        fieldManip.set(0, fieldArea.component);
                    }

                    let fieldManip = new Manipulator(this).addOrdonator(2);
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
            };
            var _displayConnectionLabel = () => {
                let connexionText = new svg.Text("Vous êtes déjà inscrit ? Se connecter")
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .color(myColors.greyerBlue)
                    .font(FONT, FONT_SIZE_TITLE * 2 / 3)
                    .mark('connexionText');

                this.connexionTextManipulator.add(connexionText).move(drawing.width / 2, this.saveButtonManipulator.y + BUTTON_HEIGHT + MARGIN);
            };

            drawing.manipulator.add(this.manipulator);
            _displayHeader();
            _displayFields();
            _displaySaveButton();
            _displayConnectionLabel();
        }

        refresh() {

        }

        getFields() {
            return this.presenter.getFields();
        }
    }

    return RegisterV;

}
