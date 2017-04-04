/**
 *
    FormationsManagerVue,
 *
 */
exports.formationsManager = function(globalVariables, classContainer){
    let Vue = classContainer.getClass("Vue");

    let
        main = globalVariables.main,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        Manipulator = globalVariables.util.Manipulator,
        Server = globalVariables.util.Server;

    /**
     * Crée un formation manager
     * @class
     */
    class FormationsManagerVue extends Vue {
        /**
         * construit un formation manager
         * @constructs
         * @param [Array] formations - formations à ajouter au manager
         */
        constructor(formations) {
            super();
            this.tileHeight = 100;
            this.tileWidth = this.tileHeight*5/4;
            this.addButtonWidth = 330;
            this.addButtonHeight = 40;
            this.addButtonSmall = 30;
            this.fontSize = 20;
            this.plusDim = this.fontSize * 2;
            this.iconeSize = this.plusDim / 1.5;
            this.label = this.label ? this.label : "";
            this.labelDefault = "Ajouter une formation";
            this.formations = [];
            for (let formation of formations) {
                this.formations.push(classContainer.createClass("FormationVue", formation, this));
            }
            this.manipulator = new Manipulator();
            this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
            this.headerManipulator = new Manipulator().addOrdonator(1);
            this.addButtonManipulator = new Manipulator().addOrdonator(4);
            this.checkManipulator = new Manipulator().addOrdonator(4);
            this.exclamationManipulator = new Manipulator().addOrdonator(4);
            this.formationsManipulator = new Manipulator();
            this.clippingManipulator = new Manipulator(this);
            this.errorMessage = new Manipulator(this).addOrdonator(3);
            this.message = new Manipulator(this).addOrdonator(3);
            /* for Player */
            this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(3);
        }

        render() {
            main.currentPageDisplayed = 'FormationsManager';
            this.manipulator.move(0, drawing.height * HEADER_SIZE);
            drawing.manipulator.set(1, this.manipulator);
            this.manipulator.add(this.headerManipulator);

            let toggleFormationsCheck;

            if (globalVariables.playerMode) {
                this.headerManipulator.add(this.toggleFormationsManipulator);
                let manip = this.toggleFormationsManipulator,
                    pos = -MARGIN,
                    toggleFormationsText = displayText('Formations en cours', drawing.width * 0.2, 25, myColors.none, myColors.none, 20, null, manip, 0, 1),
                    textWidth = toggleFormationsText.content.boundingRect().width;
                toggleFormationsCheck = new svg.Rect(20, 20).color(myColors.white, 2, myColors.black);
                pos -= textWidth / 2;
                toggleFormationsText.content.position(pos, 6);
                toggleFormationsText.border.position(pos, 0);
                pos -= textWidth / 2 + 2 * MARGIN;
                toggleFormationsCheck.position(pos, 0);
                manip.set(2, toggleFormationsCheck);
                manip.move(drawing.width, 10 + MARGIN);
                toggleFormationsText.border.mark('toggleFormationsText');

                let toggleFormations = () => {
                    this.progressOnly = !this.progressOnly;
                    let check = drawCheck(pos, 0, 20),
                        manip = this.toggleFormationsManipulator.last;
                    svg.addEvent(manip, "click", toggleFormations);
                    if (this.progressOnly) {
                        manip.add(check);
                    } else {
                        manip.remove(manip.children[manip.children.length - 1]);
                    }
                    this.formationsManipulator.flush();
                    this.displayFormations();
                };
                svg.addEvent(toggleFormationsCheck, 'click', toggleFormations);
                svg.addEvent(toggleFormationsText.content, 'click', toggleFormations);
                svg.addEvent(toggleFormationsText.border, 'click', toggleFormations);
            } else {
                this.headerManipulator.add(this.addButtonManipulator);
                this.addButtonManipulator.move(this.plusDim / 2, this.addButtonHeight);
                this.headerManipulator.add(this.checkManipulator);
                this.headerManipulator.add(this.exclamationManipulator);
            }

            let addFormationButton, spaceBetweenElements;
            let displayPanel = () => {
                let heightAllocatedToPanel = drawing.height - (globalVariables.playerMode ?
                        toggleFormationsCheck.globalPoint(0, 0).y + toggleFormationsCheck.height + MARGIN : 100);
                // addFormationButton.border.globalPoint(0, 0).y + addFormationButton.border.height;
                spaceBetweenElements = {
                    width: this.panel ? 0.015 * this.panel.width : 0.015 * drawing.width,
                    height: this.panel ? 0.050 * this.panel.height : 0.050 * drawing.height
                };

                drawing.notInTextArea = true;
                svg.addGlobalEvent("keydown", (event) => {
                    if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                        event.preventDefault();
                    }
                });

                var hasKeyDownEvent = (event) => {
                    return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
                };

                this.manipulator.add(this.clippingManipulator);
                this.clippingManipulator.move(MARGIN / 2, (!globalVariables.playerMode) ? this.addButtonHeight * 1.5 : toggleFormationsCheck.height * 2);

                if (typeof this.panel === "undefined") {
                    this.panel = new gui.Panel(drawing.width - 2 * MARGIN, heightAllocatedToPanel, myColors.none);
                }
                else {
                    this.panel.resize(drawing.width - 2 * MARGIN, heightAllocatedToPanel);
                }
                this.panel.border.color([], 0, []);
                this.panel.component.move(((drawing.width - 2 * MARGIN) + MARGIN) / 2, heightAllocatedToPanel / 2);
                this.clippingManipulator.add(this.panel.component);
                this.panel.content.children.indexOf(this.formationsManipulator.first) === -1 && this.panel.content.add(this.formationsManipulator.first);
                this.formationsManipulator.first.mark("test");
                this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);

                this.cols = Math.floor((this.panel.width - 2 * MARGIN) / (this.tileWidth + spaceBetweenElements.width));
                this.formationsManipulator.move(MARGIN + (this.tileWidth) / 2, this.tileHeight + spaceBetweenElements.height / 2);

            };

            let onClickFormation = formation => {
                formation.miniature.removeHandler(onClickFormation);
                Server.getVersionById(formation._id).then(data => {
                    var myFormation = JSON.parse(data).formation;
                    formation.loadFormation(myFormation);
                    this.formationDisplayed = formation;
                    this.formationDisplayed.display();
                });
            };

            var onClickNewFormation = () => {
                var formation = classContainer.createClass("FormationVue", {}, this);
                formation.label = this.label;
                formation.saveNewFormation(function(message, error) {
                    this.messageSvg = new svg.Text(message) //TODO factoriser le code pour afficher les messages d'erreur
                        .position(200+ 6*MARGIN, 5)
                        .font("Arial", 15)
                        .mark("formationErrorMessage")
                        .anchor('start').color(error ? myColors.red : myColors.green);
                    this.formationInfoManipulator.set(2, this.messageSvg);
                    svg.timeout(() => {
                        this.formationInfoManipulator.unset(2);
                    }, 5000);
                }.bind(this));
            };

            this.displayHeaderFormations = () => {
                //ajout input
                this.headerManipulator.move(0, 0);
                this.manipulator.add(this.formationInfoManipulator);
                let formationLabel = {};

                let addFormationObject = drawPlusWithCircle(MARGIN+200, -12, this.addButtonSmall, this.addButtonSmall);
                this.addButtonManipulator.set(2, addFormationObject.circle);
                this.addButtonManipulator.set(3, addFormationObject.plus);
                addFormationObject.circle.position(MARGIN + 200, -12);
                addFormationObject.circle.mark("addFormationButton");
                addFormationObject.plus.mark("addFormationButton");

                svg.addEvent(addFormationObject.circle, "click", onClickNewFormation);
                svg.addEvent(addFormationObject.plus, "click", onClickNewFormation);

                let clickEditionAddFormationLabel = () => {
                    let bounds = formationLabel.border.boundingRect();
                    this.formationInfoManipulator.unset(1);
                    let globalPointCenter = formationLabel.border.globalPoint(-(bounds.width) / 2, -(bounds.height) / 2);
                    var contentareaStyle = {
                        toppx: globalPointCenter.y + 4,
                        leftpx: globalPointCenter.x + 4,
                        width: formationLabel.border.width - MARGIN,
                        height: this.labelHeight
                    };
                    drawing.notInTextArea = false;

                    let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
                    contentarea.color(myColors.white, 0, myColors.black)
                        .font("Arial", 15)
                        .mark("formationLabelContentArea")
                        .anchor("start");
                    (this.label === "" || this.label === this.labelDefault) ? contentarea.placeHolder(this.labelDefault) : contentarea.message(this.label);
                    drawings.component.add(contentarea);
                    contentarea.focus(this.label.length);

                    var removeErrorMessage = ()=> {
                        this.errorMessage && this.formationInfoManipulator.unset(2);
                        formationLabel.border.color(myColors.white, 1, myColors.black);
                    };

                    var displayErrorMessage = ()=> {
                        removeErrorMessage();
                        formationLabel.border.color(myColors.white, 2, myColors.red);
                        this.errorMessage = new svg.Text(REGEX_ERROR_FORMATION)
                            .position(formationLabel.border.width+ 6*MARGIN, 5) //TODO position sur le manipulator
                            .font("Arial", 15).color(myColors.red).anchor('start')
                            .mark('formationInputErrorMessage');
                        this.formationInfoManipulator.set(2, this.errorMessage);
                        //contentarea.setCaretPosition(this.label.length);
                        this.invalidLabelInput = REGEX_ERROR_FORMATION;
                    };
                    var onblur = ()=> {
                        contentarea.enter();
                        this.label = contentarea.messageText.trim();
                        drawings.component.remove(contentarea);
                        drawing.notInTextArea = true;
                        formationLabelDisplay();
                    };
                    svg.addEvent(contentarea, "blur", onblur);
                    let objectToBeChecked = {
                        textarea: contentarea,
                        border: formationLabel.border,
                        onblur: onblur,
                        remove: removeErrorMessage,
                        display: displayErrorMessage
                    };
                    var oninput = ()=> {
                        contentarea.enter();
                        this.checkInputTextArea(objectToBeChecked);
                        formationLabelDisplay();
                    };
                    svg.addEvent(contentarea, "input", oninput);
                    this.checkInputTextArea(objectToBeChecked);
                };

                let formationLabelDisplay = () => {
                    let text = this.label ? this.label : this.labelDefault;
                    let color = this.label ? myColors.black : myColors.grey;
                    let bgcolor = myColors.white;
                    this.formationLabelWidth = 200;
                    this.formationTitleWidth = 0;

                    // if (text.length > MAX_CHARACTER_TITLE){
                    //     textToDisplay = text.substr(0, MAX_CHARACTER_TITLE) + "...";
                    // }
                    formationLabel.content = autoAdjustText(text, this.formationLabelWidth, 20, 15, "Arial", this.formationInfoManipulator).text;
                    formationLabel.content.mark('formationManagerLabelContent');
                    this.labelHeight = formationLabel.content.boundingRect().height;
                    //this.formationTitleWidth = this.titleSvg.boundingRect().width;
                    formationLabel.border = new svg.Rect(this.formationLabelWidth, this.labelHeight + MARGIN);
                    this.invalidLabelInput ? formationLabel.border.color(bgcolor, 2, myColors.red) : formationLabel.border.color(bgcolor,1,myColors.black);
                    formationLabel.border.position(this.formationTitleWidth + this.formationLabelWidth / 2 + 3 / 2 * MARGIN, -MARGIN / 2 +3);
                    this.formationInfoManipulator.set(0, formationLabel.border);
                    formationLabel.content.position(this.formationTitleWidth + 2 * MARGIN, 2).color(color).anchor("start");
                    this.formationInfoManipulator.move(-5, 30);
                    svg.addEvent(formationLabel.content, "click", clickEditionAddFormationLabel);
                    svg.addEvent(formationLabel.border, "click", clickEditionAddFormationLabel);
                };
                formationLabelDisplay();


                let checkLegend = statusEnum.Published.icon(this.iconeSize);
                this.checkManipulator.set(2, checkLegend.square);
                this.checkManipulator.set(3, checkLegend.check);
                let published = autoAdjustText("Publié", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.checkManipulator).text.anchor("start");
                published.position(25, published.y);

                let exclamationLegend = statusEnum.Edited.icon(this.iconeSize);
                this.exclamationManipulator.set(0, exclamationLegend.circle);
                this.exclamationManipulator.set(2, exclamationLegend.dot);
                this.exclamationManipulator.set(3, exclamationLegend.exclamation);
                let toPublish = autoAdjustText("Nouvelle version à publier", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.exclamationManipulator).text.anchor("start");
                toPublish.position(25, toPublish.y);
                let legendItemLength = toPublish.boundingRect().width + exclamationLegend.circle.boundingRect().width + MARGIN;
                this.checkManipulator.move(drawing.width - legendItemLength - published.boundingRect().width - checkLegend.square.boundingRect().width - 2 * MARGIN, 30);
                this.exclamationManipulator.move(drawing.width - legendItemLength, 30);
            };
            const sortAlphabetical = function (array) {
                return sort(array, (a, b) => (a.label.toLowerCase() < b.label.toLowerCase()));
            };
            this.formations = sortAlphabetical(this.formations);
            globalVariables.header.display("Formations");
            !globalVariables.playerMode && this.displayHeaderFormations();
            displayPanel();

            this.displayFormations = () => {
                let evenLine = (totalLines) => totalLines%2 === 0 ? 1:0;
                let posx = 0,
                    posy = 0,
                    count = 1,
                    totalLines = 1;
                this.formations.forEach(formation => {
                    if (globalVariables.playerMode && this.progressOnly && formation.progress !== 'inProgress') return;
                    if (count > (this.cols - evenLine(totalLines))) {
                        count = 1;
                        totalLines++;
                        posy += (this.tileHeight*3/2 + spaceBetweenElements.height);
                        posx = (this.tileWidth + spaceBetweenElements.width)*evenLine(totalLines)/2;
                    }
                    formation.parent = this;
                    this.formationsManipulator.add(formation.miniature.miniatureManipulator);
                    formation.miniature.display(posx, posy, this.tileWidth, this.tileHeight);
                    formation.miniature.setHandler(onClickFormation);

                    count++;
                    posx += (this.tileWidth + spaceBetweenElements.width);
                });
                //this.panel.resizeContent(this.panel.width, totalLines * (spaceBetweenElements.height + this.tileHeight) + spaceBetweenElements.height + MARGIN);
            };
            this.displayFormations();
        }

        /**
         * verifie la validité du texte dans l'input
         * @param {Object} myObj - input à vérifier
         */
        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(TITLE_FORMATION_REGEX)) || myObj.textarea.messageText === "") {
                this.invalidLabelInput = false;
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.display();
                this.invalidLabelInput = myObj.textarea.messageText.match(REGEX_NO_CHARACTER_LIMIT)
                    ? REGEX_ERROR_NUMBER_CHARACTER
                    : REGEX_ERROR;
            }
        }
    }

    return {
        FormationsManagerVue
    };
}

