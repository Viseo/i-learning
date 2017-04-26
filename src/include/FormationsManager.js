/**
 *
 FormationsManagerVue,
 *
 */
exports.formationsManager = function (globalVariables, classContainer) {
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
            var _declareConstVar = () => {
                this.tileHeight = 100;
                this.tileWidth = this.tileHeight * 5 / 4;
                this.addButtonWidth = 330;
                this.addButtonHeight = 40;
                this.addButtonSmall = 30;
                this.fontSize = 20;
                this.plusDim = this.fontSize * 2;
                this.iconeSize = this.plusDim / 1.5;
                this.circleToggleSize = 12.5;
                this.spaceBetweenElements = {};
            };
            var _declareLabels = () => {
                this.label = this.label ? this.label : "";
                this.labelDefault = "Ajouter une formation";
            };
            var _declareManipulators = () => {
                this.manipulator = new Manipulator(this);
                this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
                this.headerManipulator = new Manipulator(this).addOrdonator(1);
                this.addButtonManipulator = new Manipulator(this).addOrdonator(4);
                this.checkManipulator = new Manipulator(this).addOrdonator(4);
                this.exclamationManipulator = new Manipulator(this).addOrdonator(4);
                this.formationsManipulator = new Manipulator(this);
                this.clippingManipulator = new Manipulator(this);
                this.errorMessage = new Manipulator(this).addOrdonator(3);
                this.message = new Manipulator(this).addOrdonator(3);
            };
            var _declareFormationsList = () => {
                this.formations = [];
                for (let formation of formations) {
                    this.formations.push(classContainer.createClass("FormationVue", formation, this));
                }
            };

            _declareConstVar();
            _declareLabels();
            _declareManipulators();
            _declareFormationsList();
        }

        _preRender() {
            this.manipulator.move(0, drawing.height * HEADER_SIZE);
            drawing.manipulator.set(1, this.manipulator);
            this.manipulator.add(this.headerManipulator);
        }

        _postRender() {
            var _sortFormationsList = () => {
                const sortAlphabetical = function (array) {
                    return sort(array, (a, b) => (a.label.toLowerCase() < b.label.toLowerCase()));
                };
                this.formations = sortAlphabetical(this.formations);
            };
            var _displayHeader = () => {
                main.currentPageDisplayed = 'FormationsManager';
                globalVariables.header.display("Formations");
                this.headerManipulator.move(0, 0);
            };
            var _displayPanel = () => {
                var _setFormations = () => {
                    let checkLegend, published, exclamationLegend, toPublish, legendItemLength;
                    var _onClickNewFormation = () => {
                        var formation = classContainer.createClass("FormationVue", {}, this);
                        formation.label = this.label;
                        formation.saveNewFormation(function (message, error) {
                            this.messageSvg = new svg.Text(message) //TODO factoriser le code pour afficher les messages d'erreur
                                .position(200 + 6 * MARGIN, 5)
                                .font("Arial", 15)
                                .mark("formationErrorMessage")
                                .anchor('start').color(error ? myColors.red : myColors.green);
                            this.formationInfoManipulator.set(2, this.messageSvg);
                            svg.timeout(() => {
                                this.formationInfoManipulator.unset(2);
                            }, 5000);
                        }.bind(this));
                    };
                    var _setAddFormationObject = () => {
                        let addFormationObject = drawPlusWithCircle(MARGIN + 200, -12, this.addButtonSmall, this.addButtonSmall);
                        this.addButtonManipulator.set(2, addFormationObject.circle);
                        this.addButtonManipulator.set(3, addFormationObject.plus);
                        addFormationObject.circle.position(MARGIN + 200, -12);
                        addFormationObject.circle.mark("addFormationButton");
                        addFormationObject.plus.mark("addFormationButton");
                        svg.addEvent(addFormationObject.circle, "click", _onClickNewFormation);
                        svg.addEvent(addFormationObject.plus, "click", _onClickNewFormation);
                    };
                    var _formationLabelDisplay = () => {
                        let text = this.label ? this.label : this.labelDefault;
                        let color = this.label ? myColors.black : myColors.grey;
                        let formationLabel = {};
                        var _setFormationLabel = () => {
                            formationLabel.content = autoAdjustText(text, this.formationLabelWidth, 20, 15, "Arial", this.formationInfoManipulator).text;
                            formationLabel.content.mark('formationManagerLabelContent');
                            this.labelHeight = (formationLabel.content.boundingRect().height == 0 ) ? 20 : formationLabel.content.boundingRect().height;
                            formationLabel.border = new svg.Rect(this.formationLabelWidth, this.labelHeight + MARGIN);
                            this.invalidLabelInput ? formationLabel.border.color(myColors.white, 2, myColors.red) : formationLabel.border.color(myColors.white, 1, myColors.black);
                            formationLabel.border.position(this.formationTitleWidth + this.formationLabelWidth / 2 + 3 / 2 * MARGIN, -MARGIN / 2 + 3);
                            this.formationInfoManipulator.set(0, formationLabel.border);
                            formationLabel.content.position(this.formationTitleWidth + 2 * MARGIN, 2).color(color).anchor("start");
                            this.formationInfoManipulator.move(-5, 30);
                            this.manipulator.add(this.formationInfoManipulator);
                        }
                        var _clickEditionAddFormationLabel = () => {
                            let bounds = formationLabel.border.boundingRect();
                            let globalPointCenter = formationLabel.border.globalPoint(-(bounds.width) / 2, -(bounds.height) / 2);
                            var contentareaStyle = {
                                toppx: globalPointCenter.y + 4,
                                leftpx: globalPointCenter.x + 4,
                                width: formationLabel.border.width - MARGIN,
                                height: this.labelHeight
                            };
                            let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx,
                                contentareaStyle.width, contentareaStyle.height);
                            contentarea.color(myColors.white, 0, myColors.black)
                                .font("Arial", 15)
                                .mark("formationLabelContentArea")
                                .anchor("start");
                            var _removeErrorMessage = () => {
                                this.errorMessage && this.formationInfoManipulator.unset(2);
                                formationLabel.border.color(myColors.white, 1, myColors.black);
                            };
                            var _displayErrorMessage = () => {
                                _removeErrorMessage();
                                formationLabel.border.color(myColors.white, 2, myColors.red);
                                this.errorMessage = new svg.Text(REGEX_ERROR_FORMATION)
                                    .position(formationLabel.border.width + 6 * MARGIN, 5) //TODO position sur le manipulator
                                    .font("Arial", 15).color(myColors.red).anchor('start')
                                    .mark('formationInputErrorMessage');
                                this.formationInfoManipulator.set(2, this.errorMessage);
                                //contentarea.setCaretPosition(this.label.length);
                                this.invalidLabelInput = REGEX_ERROR_FORMATION;
                            };
                            var _onblur = () => {
                                contentarea.enter();
                                this.label = contentarea.messageText.trim();
                                drawings.component.remove(contentarea);
                                drawing.notInTextArea = true;
                                _formationLabelDisplay();
                            };
                            var _oninput = () => {
                                contentarea.enter();
                                this.checkInputTextArea({
                                    textarea: contentarea,
                                    border: formationLabel.border,
                                    onblur: _onblur,
                                    remove: _removeErrorMessage,
                                    display: _displayErrorMessage
                                });
                                _formationLabelDisplay();
                            };
                            var _displayContentArea = () => {
                                /** debug de l'indice 1 => à quel objet correspond-il ?
                                 */
                                this.formationInfoManipulator.unset(1);
                                drawing.notInTextArea = false;
                                (this.label === "" || this.label === this.labelDefault) ?
                                    contentarea.placeHolder(this.labelDefault) : contentarea.message(this.label);
                                drawings.component.add(contentarea);
                                contentarea.focus(this.label.length);
                            }
                            var _setContentAreaEvents = () => {
                                svg.addEvent(contentarea, "blur", _onblur);
                                svg.addEvent(contentarea, "input", _oninput);
                            }

                            _displayContentArea();
                            _setContentAreaEvents();
                            this.checkInputTextArea({
                                textarea: contentarea,
                                border: formationLabel.border,
                                onblur: _onblur,
                                remove: _removeErrorMessage,
                                display: _displayErrorMessage
                            });
                        };
                        var _setClickEventFormationLabel = () => {
                            svg.addEvent(formationLabel.content, "click", _clickEditionAddFormationLabel);
                            svg.addEvent(formationLabel.border, "click", _clickEditionAddFormationLabel);
                        }

                        this.formationLabelWidth = 200;
                        this.formationTitleWidth = 0;
                        _setFormationLabel();
                        _setClickEventFormationLabel();
                    };
                    var _setCheckedIcon = () => {
                        checkLegend = statusEnum.Published.icon(this.iconeSize);
                        this.checkManipulator.set(2, checkLegend.square);
                        this.checkManipulator.set(3, checkLegend.check);
                    };
                    var _setPublishedMessage = () => {
                        published = autoAdjustText("Publié", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.checkManipulator).text.anchor("start");
                        published.position(25, published.y);
                    };
                    var _setEditedIcon = () => {
                        exclamationLegend = statusEnum.Edited.icon(this.iconeSize);
                        this.exclamationManipulator.set(0, exclamationLegend.circle);
                        this.exclamationManipulator.set(2, exclamationLegend.dot);
                        this.exclamationManipulator.set(3, exclamationLegend.exclamation);
                    };
                    var _setToBePublishedMessage = () => {
                        toPublish = autoAdjustText("Nouvelle version à publier", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.exclamationManipulator).text.anchor("start");
                        toPublish.position(25, toPublish.y);
                        legendItemLength = toPublish.boundingRect().width + exclamationLegend.circle.boundingRect().width + MARGIN;
                        this.checkManipulator.move(drawing.width - legendItemLength - published.boundingRect().width - checkLegend.square.boundingRect().width - 2 * MARGIN, 30);
                        this.exclamationManipulator.move(drawing.width - legendItemLength, 30);
                    };

                    _setAddFormationObject();
                    _formationLabelDisplay();
                    _setCheckedIcon();
                    _setPublishedMessage();
                    _setEditedIcon();
                    _setToBePublishedMessage();
                };
                var _setDisplayProperties = () => {
                    this.spaceBetweenElements = {
                        width: this.panel ? 0.015 * this.panel.width : 0.015 * drawing.width,
                        height: this.panel ? 0.050 * this.panel.height : 0.050 * drawing.height
                    };
                    this.y = (!globalVariables.playerMode) ? this.addButtonHeight * 1.5 : this.circleToggleSize;//drawing.height * this.header.size;
                    drawing.notInTextArea = true;
                };
                var _setKeydownEvent = () => {
                    var _hasKeyDownEvent = (event) => {
                        return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
                    };

                    svg.addGlobalEvent("keydown", (event) => {
                        if (drawing.notInTextArea && _hasKeyDownEvent(event)) {
                            event.preventDefault();
                        }
                    });
                };
                var _definePanel = () => {
                    let heightAllocatedToPanel = drawing.height - (globalVariables.playerMode ?
                                this.toggleFormationsManipulator.component.globalPoint(0, 0).y + MARGIN : 100),
                        heightListFormations = (!globalVariables.playerMode) ? this.addButtonHeight * 1.5 : this.circleToggleSize * 2;
                    this.manipulator.add(this.clippingManipulator);
                    this.clippingManipulator.move(MARGIN / 2, heightListFormations - MARGIN);
                    if (typeof this.panel === "undefined") {
                        this.panel = new gui.Panel(drawing.width, heightAllocatedToPanel, myColors.none);
                    }
                    else {
                        this.panel.resize(drawing.width - 2 * MARGIN, heightAllocatedToPanel);
                    }
                    this.panel.border.color([], 0, []);
                    this.panel.component.move(((drawing.width - 2 * MARGIN) + MARGIN) / 2, heightAllocatedToPanel / 2);
                    this.clippingManipulator.add(this.panel.component);
                    this.panel.content.children.indexOf(this.formationsManipulator.first) === -1 && this.panel.content.add(this.formationsManipulator.first);
                    this.formationsManipulator.first.mark("test");
                    /** TODO à quoi sert cet id test ? **/
                    this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);

                    this.cols = Math.floor((this.panel.width - 2 * MARGIN) / (this.tileWidth + this.spaceBetweenElements.width));
                    this.formationsManipulator.move(MARGIN + (this.tileWidth) / 2, this.tileHeight + this.spaceBetweenElements.height / 2);
                };

                !globalVariables.playerMode && _setFormations();
                _setDisplayProperties();
                _setKeydownEvent();
                _definePanel();
            };

            _sortFormationsList();
            _displayHeader();
            _displayPanel();
            this._displayFormations();
        }

        _displayFormations(){
            var _onClickDisplayFormation = formation => {
                formation.miniature.removeHandler("click");
                Server.getFormationsProgress(formation._id).then(data => {
                    var tmp = JSON.parse(data);
                    let games = tmp.progress ? tmp.progress.gamesTab : null;
                    formation.loadFormation(tmp.formation, games);
                    this.formationDisplayed = formation;
                    this.manipulator.flush();
                    this.formationDisplayed.display();
                });
            };
            let evenLine = (totalLines) => totalLines % 2 === 0 ? 1 : 0;
            let posx = 0,
                posy = 0,
                count = 1,
                totalLines = 1;

            this.formations.forEach(formation => {
                if (globalVariables.playerMode && this.progressOnly && formation.progress !== 'inProgress') return;
                if (globalVariables.playerMode && this.doneOnly && formation.progress !== 'done') return;
                if (globalVariables.playerMode && this.undoneOnly && formation.progress != '') return;
                if (count > (this.cols - evenLine(totalLines))) {
                    count = 1;
                    totalLines++;
                    posy += (this.tileHeight * 3 / 2 + this.spaceBetweenElements.height);
                    posx = (this.tileWidth + this.spaceBetweenElements.width) * evenLine(totalLines) / 2;
                }
                formation.parent = this;
                this.formationsManipulator.add(formation.miniature.manipulator);
                formation.miniature.display(posx, posy, this.tileWidth, this.tileHeight);
                formation.miniature.setHandler("click", () => _onClickDisplayFormation(formation));
                count++;
                posx += (this.tileWidth + this.spaceBetweenElements.width);
            });
            this.panel.resizeContent(this.panel.width, totalLines * (this.spaceBetweenElements.height + this.tileHeight)
                + this.spaceBetweenElements.height + MARGIN);
        };

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

    class FormationsManagerVueCollab extends FormationsManagerVue {
        constructor(formations) {
            super(formations);
            this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(7);
        }

        render() {
            var _setHeaderManipulator = () => {
                this.headerManipulator.add(this.toggleFormationsManipulator);
            };
            var _createFilter = () => {
                let manip = this.toggleFormationsManipulator;
                var _declarePlayerIcons = () => {
                    let undoneIconSetting = classContainer.createClass("IconSetting").setBorderSize(this.circleToggleSize)
                        .setBorderLayer(2).setDefaultBorderColor(myColors.blue, 0, myColors.none)
                        .setBorderActionColor(myColors.blue, 1, myColors.darkBlue)
                        .setTriangleContent(8, 8, 'E', myColors.none, 3, myColors.white, 5);
                    this.undoneIcon = classContainer.createClass("Icon", manip, undoneIconSetting);
                    this.undoneIcon.position(-this.circleToggleSize * 4 - MARGIN * 2, 0).content.mark("unDoneIcon");


                    this.inProgressIcon = displayTextWithCircle('...', this.circleToggleSize * 2,
                        this.circleToggleSize * 2, myColors.none, myColors.orange, 15, 'Arial', manip);
                    this.inProgressIcon.content.font('arial', 20).color(myColors.white).mark('inProgressIcon');
                    this.doneIcon = {
                        border: new svg.Circle(this.circleToggleSize).color(myColors.green, 0, myColors.none)
                            .position(-this.circleToggleSize * 2 - MARGIN, 0)
                    };
                    this.doneIcon.content = drawCheck(this.doneIcon.border.x, this.doneIcon.border.y, 20)
                        .color(myColors.none, 3, myColors.white).mark('doneIcon');
                };
                var _setManipulatorIcons = () => {
                    manip.move(drawing.width - MARGIN * 3, MARGIN + this.circleToggleSize * 2);
                    manip.set(4, this.doneIcon.content);
                    manip.set(3, this.doneIcon.border);
                };
                var _drawBorderFilter = () => {
                    this.undoneOnly ? this.undoneIcon.showBorderActionColor() : this.undoneIcon.showBorderDefaultColor();
                    this.doneOnly && this.doneIcon.border.color(myColors.green, 1, myColors.darkBlue);
                    !this.doneOnly && this.doneIcon.border.color(myColors.green, 1, myColors.none);
                    this.progressOnly && this.inProgressIcon.border.color(myColors.orange, 1, myColors.darkBlue);
                    !this.progressOnly && this.inProgressIcon.border.color(myColors.orange, 1, myColors.none);
                };
                var _setIconClickEvent = () => {
                    var _toggleInProgress = () => {
                        this.progressOnly = !this.progressOnly;
                        this.doneOnly = false;
                        this.undoneOnly = false;
                        this.formationsManipulator.flush();
                        super._displayFormations();
                        _drawBorderFilter();
                    };
                    var _toggleDone = () => {
                        this.doneOnly = !this.doneOnly;
                        this.progressOnly = false;
                        this.undoneOnly = false;
                        this.formationsManipulator.flush();
                        super._displayFormations();
                        _drawBorderFilter();
                    };
                    var _toggleUndone = () => {
                        this.undoneOnly = !this.undoneOnly;
                        this.doneOnly = false;
                        this.progressOnly = false;
                        this.formationsManipulator.flush();
                        super._displayFormations();
                        _drawBorderFilter();
                    };

                    svg.addEvent(this.inProgressIcon.border, 'click', _toggleInProgress);
                    svg.addEvent(this.inProgressIcon.content, 'click', _toggleInProgress);
                    svg.addEvent(this.doneIcon.border, 'click', _toggleDone);
                    svg.addEvent(this.doneIcon.content, 'click', _toggleDone);
                    svg.addEvent(this.undoneIcon.border, 'click', _toggleUndone);
                    svg.addEvent(this.undoneIcon.content, 'click', _toggleUndone);
                };

                _declarePlayerIcons();
                _setManipulatorIcons();
                _setIconClickEvent();
            };

            super._preRender();
            _setHeaderManipulator();
            _createFilter();
            super._postRender();
        }
    }

    class FormationsManagerVueAdmin extends FormationsManagerVue {
        constructor(formations) {
            super(formations);
        }

        render() {
            var _setHeaderManipulatorAdmin = () => {
                this.headerManipulator.add(this.addButtonManipulator);
                this.addButtonManipulator.move(this.plusDim / 2, this.addButtonHeight);
                this.headerManipulator.add(this.checkManipulator);
                this.headerManipulator.add(this.exclamationManipulator);
            };

            super._preRender();
            _setHeaderManipulatorAdmin();
            super._postRender();
        }
    }

    return {
        FormationsManagerVueCollab,
        FormationsManagerVueAdmin
    };
}

