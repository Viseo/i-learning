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
                        let iconCreator = classContainer.createClass("IconCreator");
                        let icon = iconCreator.createPlusIcon(this.addButtonManipulator, 2);
                        icon.position(MARGIN + 200, -12).content.mark("addFormationButton");
                        icon.addEvent("click", _onClickNewFormation);
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
                    let iconCreator = classContainer.createClass("IconCreator");

                    var _setCheckedIcon = () => {
                        checkLegend = iconCreator.createDoneIcon(this.checkManipulator, 2);
                    };
                    var _setPublishedMessage = () => {
                        published = autoAdjustText("Publié", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.checkManipulator).text.anchor("start");
                        published.position(25, published.y);
                    };
                    var _setEditedIcon = () => {
                        exclamationLegend = iconCreator.createEditedIcon(this.exclamationManipulator, 2);
                    };
                    var _setToBePublishedMessage = () => {
                        toPublish = autoAdjustText("Nouvelle version à publier", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.exclamationManipulator).text.anchor("start");
                        toPublish.position(25, toPublish.y);
                        legendItemLength = toPublish.boundingRect().width + exclamationLegend.border.boundingRect().width + MARGIN;
                        this.checkManipulator.move(drawing.width - legendItemLength - published.boundingRect().width - checkLegend.border.boundingRect().width - 2 * MARGIN, 30);
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
                if (globalVariables.playerMode && this.inProgressIcon.action && formation.progress !== 'inProgress') return;
                if (globalVariables.playerMode && this.doneIcon.action && formation.progress !== 'done') return;
                if (globalVariables.playerMode && this.undoneIcon.action && formation.progress != '') return;
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
            var _settingManipulator = () => {
                this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(7);
                this.headerManipulator.add(this.toggleFormationsManipulator);
            };
            var _declarePlayerIcons = () => {
                let iconCreator = classContainer.createClass("IconCreator");

                this.undoneIcon = iconCreator.createUndoneIcon(this.toggleFormationsManipulator, 0);
                this.undoneIcon.position(-this.circleToggleSize * 4 - MARGIN * 2, 0).content.mark("unDoneIcon");

                this.inProgressIcon = iconCreator.createInProgressIcon(this.toggleFormationsManipulator, 1);
                this.inProgressIcon.content.mark('inProgressIcon');

                this.doneIcon = iconCreator.createDoneIcon(this.toggleFormationsManipulator, 2);
                this.doneIcon.position(-this.circleToggleSize * 2 - MARGIN, 0).content.mark("doneIcon");
            };
            var _createFilter = () => {
                var _drawBorderFilter = () => {
                    this.undoneIcon.showActualBorder();
                    this.doneIcon.showActualBorder();
                    this.inProgressIcon.showActualBorder();
                };
                var _setIconClickEvent = () => {
                    var _toggleFilter = (iconActionReverse, iconCancelAction1, iconCancelAction2) => {
                        iconActionReverse.action = !iconActionReverse.action;
                        iconCancelAction1.action = iconCancelAction2.action = false;
                        this.formationsManipulator.flush();
                        super._displayFormations();
                        _drawBorderFilter();
                    };
                    this.inProgressIcon.addEvent('click', () => { _toggleFilter(this.inProgressIcon, this.undoneIcon, this.doneIcon)});
                    this.undoneIcon.addEvent('click', () => { _toggleFilter(this.undoneIcon, this.inProgressIcon, this.doneIcon)});
                    this.doneIcon.addEvent('click', () => { _toggleFilter(this.doneIcon, this.undoneIcon, this.inProgressIcon)});
                };

                _setIconClickEvent();
            };

            _settingManipulator();
            _declarePlayerIcons();
            _createFilter();
        }

        render() {
            super._preRender();
            this.toggleFormationsManipulator.move(drawing.width - MARGIN * 3, MARGIN + this.circleToggleSize * 2);
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

