/**
 * Created by DMA3622 on 03/05/2017.
 */
exports.Connection = function (globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        drawing = globalVariables.drawing,
        gui = globalVariables.gui,
        INSCRIPTION_TEXT = "Vous venez d'arriver ? Créer un compte",
        CONNECTION_TEXT = "Vous êtes déjà inscrit ? Se connecter",
        CONNECTION_REFUSED_ERROR = 'Connexion refusée : \nveuillez entrer une adresse e-mail et un mot de passe valide',
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
        TITLE_COLOR = [myColors.white, 0, myColors.white],
        // BLUE_FIELD_COLOR = [myColors.blue, 0, myColors.blue],
        ERROR_INPUT = [myColors.white, 2, myColors.red],
        ICON_SIZE = INPUT_HEIGHT * 2 / 3,
        MARGIN_DISPOSITION_BUTTON_FACTOR = 8.5;

    class Connection {
        constructor(presenter) {
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
            this.fieldsManip = new Manipulator(this);
            this.cookieManipulator = new Manipulator(this);
            this.cookieManipulator.component.mark("cookieManipulator");
            this.newPasswordManipulator = new Manipulator(this);
            this.newPasswordManipulator.component.mark("newPasswordManipulator");
            this.connexionButtonManipulator = new Manipulator(this);
            this.inscriptionTextManipulator = new Manipulator(this);
            this.manipulator
                .add(this.fieldsManip)
                .add(this.cookieManipulator)
                .add(this.newPasswordManipulator)
                .add(this.connexionButtonManipulator)
                .add(this.inscriptionTextManipulator);
        }

        display() {
            var _displayHeader = () => {
                let headerManipulator = this.header.getManipulator();
                this.manipulator.add(headerManipulator);
                this.header.display("Connexion");
            };
            var _displayFields = () => {
                var _displayField = (field) => {
                    let fieldManip = new Manipulator(this);
                    let fieldTitle = new svg.Text(field.title);
                    let fieldArea = new gui.TextField(0, 0, INPUT_WIDTH, INPUT_HEIGHT);

                    fieldTitle.dimension(INPUT_WIDTH, FONT_SIZE_TITLE).color(TITLE_COLOR).font(FONT, FONT_SIZE_TITLE).anchor("start");
                    fieldArea.font(FONT, FONT_SIZE_INPUT).anchor("center");
                    fieldArea.color(COLORS);
                    fieldArea.editColor(EDIT_COLORS);

                    fieldManip.add(fieldTitle).add(fieldArea.component);
                    let manipHeight = (fieldArea.height + FONT_SIZE_TITLE);
                    fieldManip.move(0, manipHeight / 2  + field.index * (manipHeight + 2*MARGIN));
                    fieldTitle.position(-fieldArea.width / 2, -1 * (fieldArea.y + fieldArea.height ));

                    return fieldManip;
                };
                let fields = this.getFields();
                this.fieldsManip.move(drawing.width / 2, this.header.height + 2*MARGIN);
                fields.forEach(field => {
                    let fieldManip = _displayField(field);
                    this.fieldsManip.add(fieldManip);
                });

            };
            var _displayCookieCheckbox = () => {
                let checkbox = new svg.Rect(CHECKBOX_SIZE, CHECKBOX_SIZE).color(myColors.white, 2, myColors.black);
                let fieldTitle = new svg.Text("Se souvenir de moi");

                fieldTitle.dimension(INPUT_WIDTH / 2, FONT_SIZE_TITLE);
                fieldTitle.font("Arial", FONT_SIZE_TITLE * 3 / 4).anchor("start");
                fieldTitle.color(TITLE_COLOR);
                fieldTitle.position(CHECKBOX_SIZE, (CHECKBOX_SIZE)/2);

                let checked = drawCheck(checkbox.x, checkbox.y, CHECKBOX_SIZE);
                this.cookieManipulator
                    .add(fieldTitle)
                    .add(checkbox)
                    .add(checked)
                    .move(drawing.width/2 - INPUT_WIDTH / 2 + CHECKBOX_SIZE / 2, this.header.height + 2*MARGIN + (INPUT_HEIGHT + FONT_SIZE_TITLE + 2*MARGIN) * 4);
            };
            var _displayForgotPWD = () => {
                let fieldTitle = new svg.Text("Mot de passe oublié ?")
                    .color(myColors.greyerBlue)
                    .dimension(INPUT_WIDTH / 2, INPUT_HEIGHT / 2)
                    .anchor('end')
                    .position(0, 0)
                    .font(FONT, FONT_SIZE_TITLE * 3 / 4);
                this.newPasswordManipulator.add(fieldTitle)
                    .move(drawing.width/2 + INPUT_WIDTH / 2, this.header.height + 2*MARGIN + (INPUT_HEIGHT + FONT_SIZE_TITLE + 2*MARGIN) * 4);
            };
            var _displayButton = () => {
                let button = new gui.Button(INPUT_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], 'Connexion');
                button.text.color(myColors.lightgrey, 0, myColors.white);
                button.activeShadow();
                this.connexionButtonManipulator
                    .add(button.component)
                    .move(drawing.width/2, this.header.height + BUTTON_MARGIN + 2*MARGIN + (INPUT_HEIGHT + FONT_SIZE_TITLE + 2*MARGIN) *5 );

                let inscriptionText = new svg.Text("Vous venez d'arriver ? Créer un compte")
                    .dimension(INPUT_WIDTH, INPUT_HEIGHT)
                    .color(myColors.greyerBlue)
                    .font(FONT, FONT_SIZE_TITLE * 2 / 3);
                this.inscriptionTextManipulator.add(inscriptionText).move(drawing.width/2, this.connexionButtonManipulator.y + BUTTON_HEIGHT + MARGIN);
            };

            drawing.manipulator.add(this.manipulator);
            _displayHeader();
            _displayFields();
            _displayCookieCheckbox();
            _displayForgotPWD();
            _displayButton();
        }

        getFields() {
            return this.presenter.getFields();
        }

        refresh() {

        }
    }
    return Connection;
}