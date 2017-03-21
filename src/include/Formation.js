exports.Formation = function (globalVariables, classContainer) {
    let {Vue} = classContainer;

    let imageController;
    let myFormations;

    let
        main = globalVariables.main,
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        util = globalVariables.util,
        clientWidth = globalVariables.clientWidth,
        clientHeight = globalVariables.clientHeight,
        Manipulator = globalVariables.util.Manipulator,
        MiniatureFormation = globalVariables.util.MiniatureFormation,
        Puzzle = globalVariables.util.Puzzle,
        ReturnButton = globalVariables.util.ReturnButton,
        Server = globalVariables.util.Server,
        //globalVariables.playerMode = globalVariables.globalVariables.playerMode,
        Picture = globalVariables.util.Picture,
        installDnD = globalVariables.gui.installDnD;

    imageController = ImageController(globalVariables.ImageRuntime);
    globalVariables.imageController = imageController;

    installDnD = globalVariables.gui.installDnD;

    /**
     * Formation qui peut contenir différents jeux répartis sur différents niveaux
     * @class
     */
    class FormationVue extends Vue {
        /**
         * construit une formation
         * @constructs
         * @param {Object} formation - valeurs par défaut pour la formaiton
         * @param {Object} formationsManager - manager qui va contenir la formation
         */
        constructor(formation, formationsManager) {
            super();
            this.gamesCounter = {
                quizz: 0,
                bd: 0
            };
            this.links = [];
            this._id = (formation._id || null);
            this.formationId = (formation.formationId || null);
            this.progress = formation.progress;
            this.formationsManager = formationsManager;
            this.manipulator = new Manipulator(this).addOrdonator(6);
            this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
            this.graphManipulator = new Manipulator(this);
            this.messageDragDropManipulator = new Manipulator(this).addOrdonator(2);
            this.arrowsManipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this);
            this.graphManipulator.add(this.miniaturesManipulator);
            this.graphManipulator.add(this.arrowsManipulator);
            this.clippingManipulator = new Manipulator(this);
            this.saveFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.publicationFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.deactivateFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.library = new classContainer.GamesLibraryVue(myLibraryGames);
            this.library.formation = this;
            this.quizManager = new classContainer.QuizManagerVue(null, this);
            this.returnButtonManipulator = new Manipulator(this);//.addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour aux formations");
            this.labelDefault = "Entrer le nom de la formation";
            // WIDTH
            this.libraryWidthRatio = 0.15;
            this.graphWidthRatio = 1 - this.libraryWidthRatio;
            // HEIGHT
            this.graphCreaHeightRatio = 0.85;
            this.x = MARGIN;
            this.regex = TITLE_FORMATION_REGEX;
            this.levelsTab = [];
            this.saveButtonHeightRatio = 0.07;
            this.publicationButtonHeightRatio = 0.07;
            this.marginRatio = 0.03;
            this.label = formation.label ? formation.label : "";
            this.status = formation.status ? formation.status : "NotPublished";
            this.invalidLabelInput = false;
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.levelHeight = 150;
            this.graphElementSize = this.levelHeight * 0.65;
            this.miniature = new MiniatureFormation(this);
            this.changeableDimensions();
            this.manipulator.add(this.saveFormationButtonManipulator);
            this.manipulator.add(this.publicationFormationButtonManipulator);
            this.manipulator.add(this.deactivateFormationButtonManipulator);
        }

        /**
         * affiche la formation
         */
        render() {
            main.currentPageDisplayed = "Formation";
            globalVariables.header.display(this.label);
            this.formationsManager.formationDisplayed = this;
            this.globalMargin = {
                height: this.marginRatio * drawing.height,
                width: this.marginRatio * drawing.width
            };

            let borderSize = 3;
            this.manipulator.move(0, drawing.height * 0.075);
            drawing.manipulator.set(1, this.manipulator);
            this.manipulator.add(this.returnButtonManipulator);

            let returnHandler = () => {
                this.returnButton.manipulator.flush();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new classContainer.FormationsManagerVue(myFormations);
                    globalVariables.formationsManager.display();
                });
                this.returnButton.removeHandler(returnHandler);
            };
            this.manipulator.add(this.returnButtonManipulator);
            this.returnButton.display(0, -MARGIN / 2, 20, 20);
            let returnButtonChevron = this.returnButton.chevronManipulator.ordonator.children[0];
            this.returnButton.height = returnButtonChevron.boundingRect().height;
            returnButtonChevron.mark('returnButtonToFormationsManager');
            this.returnButton.setHandler(returnHandler);

            let dblclickQuizHandler = (event, target) => {
                target = target || drawings.component.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
                let displayQuizManager = () => {
                    this.quizManager.loadQuiz(target);
                    this.quizDisplayed = target;
                    this.quizManager.display();
                    this.selectedArrow = null;
                    this.selectedGame = null;
                };
                this.saveFormation(displayQuizManager);
                //svg.removeSelection();
            };

            let clickQuizHandler = (event, target) => {
                target = target || drawings.component.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
                drawing.manipulator.unset(1, this.manipulator.add);
                main.currentPageDisplayed = "QuizPreview";
                this.quizDisplayed = new classContainer.QuizVue(target, false, this);
                this.quizDisplayed.puzzleLines = 3;
                this.quizDisplayed.puzzleRows = 3;
                this.quizDisplayed.run(0, 0, drawing.width, drawing.height);
                //svg.removeSelection();
            };

            let resizePanel = () => {
                var height = (this.levelHeight * (this.levelsTab.length + 1) > this.graphH) ? (this.levelHeight * (this.levelsTab.length + 1)) : this.graphH;
                let spaceOccupiedByAGame = (this.graphElementSize + this.minimalMarginBetweenGraphElements),
                    longestLevel = this.findLongestLevel()[0],
                    trueWidth = longestLevel && longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame,
                    widthMAX = Math.max(this.panel.width, trueWidth);

                if (!longestLevel || !height) return;
                this.panel.resizeContent(widthMAX - 1, height - MARGIN);
            };

            this.movePanelContent = () => {
                let spaceOccupiedByAGame = (this.graphElementSize + this.minimalMarginBetweenGraphElements),
                    longestLevel = this.findLongestLevel()[0],
                    trueWidth = longestLevel ? longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame : 0,
                    widthMAX = Math.max(this.panel.width, trueWidth);
                this.miniaturesManipulator.move((widthMAX - this.panel.width) / 2, 0);
            };

            let displayLevel = (w, h, level) => {
                this.panel.content.add(level.manipulator.first);
                var lineColor = globalVariables.playerMode ? myColors.grey : myColors.black;
                var levelText = globalVariables.playerMode ? "" : "Niveau " + level.index;
                let obj = autoAdjustText(levelText, w - 3 * borderSize, this.levelHeight, 20, "Arial", level.manipulator, 0);
                obj.line = new svg.Line(MARGIN, this.levelHeight, level.parentFormation.levelWidth, this.levelHeight).color(lineColor, 3, lineColor);
                obj.line.component.setAttribute && obj.line.component.setAttribute('stroke-dasharray', '6');

                if (!globalVariables.playerMode) {
                    this.redCrossManipulator;
                    let overLevelHandler = (event) => {
                        let levelIndex = -1;
                        let mouseY;
                        mouseY = this.panel.back.localPoint(event.pageX, event.pageY).y;
                        mouseY -= this.panel.content.y;
                        while (mouseY > -this.panel.content.height / 2) {
                            mouseY -= this.levelHeight;
                            levelIndex++;
                        }
                        this.levelsTab.forEach(levelElement => {
                            levelElement.redCrossManipulator.flush();
                        });
                        let levelObject = this.levelsTab[levelIndex];
                        if (levelIndex >= 0 && levelIndex < this.levelsTab.length) {
                            if (typeof levelObject.redCrossManipulator === 'undefined') {
                                levelObject.redCrossManipulator = new Manipulator(levelObject).addOrdonator(2);
                            }
                            levelObject.manipulator.set(2, levelObject.redCrossManipulator);
                            let redCrossSize = 15;
                            let redCross = this.textToDisplay ? drawRedCross(0, 0, redCrossSize, levelObject.redCrossManipulator)
                                : drawRedCross(60, -60, redCrossSize, levelObject.redCrossManipulator);
                            redCross.mark('levelRedCross');
                            levelObject.redCrossManipulator.move(obj.text.boundingRect().width / 2 + levelObject.x / 2, 15);
                            svg.addEvent(redCross, 'click', levelObject.redCrossClickHandler);
                            levelObject.redCrossManipulator.set(1, redCross);
                        }
                    };
                    let mouseleaveHandler = () => {
                        this.levelsTab.forEach(levelElement => {
                            levelElement.redCrossManipulator.flush();
                        });
                    };

                    svg.addEvent(this.panel.back, 'mouseover', overLevelHandler);
                    svg.addEvent(this.panel.back, 'mouseout', mouseleaveHandler);

                    level.redCrossClickHandler = () => {
                        level.redCrossManipulator.flush();
                        this.levelsTab.splice(level.index - 1, 1);
                        level.manipulator.flush();
                        level.gamesTab.forEach(game => {
                            game.miniatureManipulator.flush();
                            for (let j = this.links.length - 1; j >= 0; j--) {
                                if (this.links[j].childGame === game.id || this.links[j].parentGame === game.id) {
                                    this.links.splice(j, 1);
                                }
                            }
                        });
                        for (let i = level.index - 1; i < this.levelsTab.length; i++) {
                            this.levelsTab[i].index--;
                            this.levelsTab[i].manipulator.flush();
                        }
                        this.displayGraph(this.graphW, this.graphH);
                    };
                }
                level.manipulator.set(1, obj.line);
                obj.text.position(obj.text.boundingRect().width, obj.text.boundingRect().height);
                obj.text._acceptDrop = true;
                level.w = w;
                level.h = h;
                level.y = (level.index - 1) * level.parentFormation.levelHeight;
                level.manipulator.move(0, level.y);
            };

            let displayFrame = (w, h) => {
                let hasKeyDownEvent = (event) => {
                    if (event.keyCode === 46) { // suppr
                        this.selectedArrow && this.selectedArrow.redCrossClickHandler();
                        this.selectedGame && this.selectedGame.redCrossClickHandler();
                    } else if (event.keyCode === 27 && this.library && this.library.arrowMode) { // échap
                        this.library.toggleArrowMode();
                    } else if (event.keyCode === 27 && this.library && this.library.gameSelected) {
                        this.library.gameSelected.border.color(myColors.white, 1, myColors.black);
                        this.library.gameSelected = null;
                    }
                    return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
                };
                drawing.notInTextArea = true;
                svg.addGlobalEvent("keydown", (event) => {
                    if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                        event.preventDefault();
                    }
                });
                this.manipulator.set(1, this.clippingManipulator);
                globalVariables.playerMode ? this.clippingManipulator.move(MARGIN, drawing.height * HEADER_SIZE)
                    : this.clippingManipulator.move(this.libraryWidth, drawing.height * HEADER_SIZE);
                this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio - drawing.height * 0.1;//-15-this.saveButtonHeight;//15: Height Message Error

                if (typeof this.panel !== "undefined") {
                    this.clippingManipulator.remove(this.panel.component);
                }
                this.panel = new gui.Panel(w, h, myColors.white);
                this.panel.back.mark("panelBack");
                this.panel.content.add(this.messageDragDropManipulator.first);
                this.panel.component.move(w / 2, h / 2);
                this.clippingManipulator.add(this.panel.component);
                this.panel.content.add(this.graphManipulator.first);
                this.panel.hHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
                this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
                resizePanel();
                this.movePanelContent();
            };

            let updateAllLinks = () => {
                this.arrowsManipulator.flush();
                var childElement, parentElement;
                this.links.forEach((link) => {
                    this.levelsTab.forEach((level) => {
                        level.gamesTab.forEach((game) => {
                            game.id === link.childGame && (childElement = game);
                            game.id === link.parentGame && (parentElement = game);
                        })
                    });
                    link.arrow = new Arrow(parentElement, childElement);
                });
            };

            let displayMessageDragAndDrop = () => {
                this.messageDragDropMargin = this.graphCreaHeight / 8 - borderSize;
                let messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", this.graphW, this.graphH, 20, null, this.messageDragDropManipulator).text;
                messageDragDrop._acceptDrop = true;
                messageDragDrop.x = this.panel.width / 2;
                messageDragDrop.y = this.messageDragDropMargin + (this.levelsTab.length) * this.levelHeight;
                messageDragDrop.position(messageDragDrop.x, messageDragDrop.y).color(myColors.grey);//.fontStyle("italic");
                this.panel.back._acceptDrop = true;
            };

            this.displayGraph = (w, h) => {
                this.movePanelContent();
                resizePanel();
                if (typeof w !== "undefined") this.graphW = w;
                if (typeof h !== "undefined") this.graphH = h;
                this.messageDragDropMargin = this.graphCreaHeight / 8 - borderSize;
                if (this.levelWidth < this.graphCreaWidth) {
                    this.levelWidth = this.graphCreaWidth;
                }

                let manageMiniature = (tabElement) => {
                    tabElement.miniatureManipulator.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
                    let conf = {
                        clicked : (what) => {
                            what.parentObject.miniature.miniatureClickHandler();
                        },
                        moved: (what) => {
                            let point = what.component.parent.globalPoint(what.x,what.y);
                            this.dropAction(point.x,point.y, what);
                            return true;
                        }
                    };
                    !globalVariables.playerMode && tabElement.miniatureManipulator.addEvent('dblclick', event => {
                        dblclickQuizHandler(event,tabElement);
                    });
                    globalVariables.playerMode && tabElement.miniatureManipulator.addEvent('click', event => {
                        clickQuizHandler(event,tabElement);
                    });

                    !globalVariables.playerMode && installDnD(tabElement.miniatureManipulator, drawings.component.glass.parent.manipulator.last, conf);
                };

                this.levelsTab.forEach((level) => {
                    displayLevel(this.graphCreaWidth, this.graphCreaHeight, level);
                    this.adjustGamesPositions(level);
                    this.miniaturesManipulator.last.mark("miniaturesManipulatorLast");
                    level.gamesTab.forEach((tabElement) => {
                        tabElement.miniatureManipulator.ordonator || tabElement.miniatureManipulator.addOrdonator(3);
                        this.miniaturesManipulator.add(tabElement.miniatureManipulator);// mettre un manipulateur par niveau !_! attention à bien les enlever
                        if (typeof tabElement.miniature === "undefined") {
                            (tabElement.miniature = tabElement.displayMiniature(this.graphElementSize));
                        }
                        manageMiniature(tabElement);
                    });
                });
                !globalVariables.playerMode && displayMessageDragAndDrop();
                this.graphManipulator.move(this.graphW / 2, this.graphH / 2);
                resizePanel();
                this.panel.back.parent.parentManip = this.graphManipulator;
                updateAllLinks();
            };

            if (globalVariables.playerMode) {
                this.graphCreaHeightRatio = 0.97;
                this.graphCreaHeight = (drawing.height - drawing.height * HEADER_SIZE - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
                this.graphCreaWidth = drawing.width - 2 * MARGIN;
                displayFrame(this.graphCreaWidth, this.graphCreaHeight);
                this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
                this.clippingManipulator.move((drawing.width - this.graphCreaWidth) / 2, this.formationsManager.y / 2 - borderSize);
            } else {
                this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
                this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
                this.graphCreaHeight = (drawing.height - drawing.height * HEADER_SIZE - 40 - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
                this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
                this.gamesLibraryManipulator = this.library.libraryManipulator;
                this.manipulator.set(4, this.gamesLibraryManipulator);
                this.manipulator.set(0, this.formationInfoManipulator);
                this.libraryWidth = drawing.width * this.libraryWidthRatio;
                this.y = drawing.height * HEADER_SIZE;
                this.titleSvg = new svg.Text("Formation : ").position(MARGIN, this.returnButton.height *1.1).font("Arial", 20).anchor("start");
                this.manipulator.set(2, this.titleSvg);
                let formationWidth = this.titleSvg.boundingRect().width;
                let formationLabel = {};

                let clickEditionFormationLabel = () => {
                    let bounds = formationLabel.border.boundingRect();
                    this.formationInfoManipulator.unset(1);
                    let globalPointCenter = formationLabel.border.globalPoint(-(bounds.width) / 2, -(bounds.height) / 2);
                    var contentareaStyle = {
                        toppx: globalPointCenter.y + 5,
                        leftpx: globalPointCenter.x + 5.2,
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
                    contentarea.focus();
                    var removeErrorMessage = () => {
                        this.errorMessage && this.formationInfoManipulator.unset(2);
                        formationLabel.border.color(myColors.white, 1, myColors.black);
                    };

                    var displayErrorMessage = () => {
                        removeErrorMessage();
                        formationLabel.border.color(myColors.white, 2, myColors.red);
                        var anchor = 'start';
                        this.errorMessage = new svg.Text(REGEX_ERROR_FORMATION)
                            .position(formationLabel.border.width + formationWidth + 2 * MARGIN, 0)
                            .font("Arial", 15).color(myColors.red).anchor(anchor);
                        this.formationInfoManipulator.set(2, this.errorMessage);
                        contentarea.focus();
                        //contentarea.setCaretPosition(this.label.length);
                        this.invalidLabelInput = REGEX_ERROR_FORMATION;
                    };
                    var onblur = () => {
                        contentarea.enter();
                        this.label = contentarea.messageText.trim();
                        drawings.component.remove(contentarea);
                        drawing.notInTextArea = true;
                        formationLabelDisplay();
                        this.invalidLabelInput || header.display(this.label);
                    };
                    svg.addEvent(contentarea, "blur", onblur);
                    let objectToBeChecked = {
                        textarea: contentarea,
                        border: formationLabel.border,
                        onblur: onblur,
                        remove: removeErrorMessage,
                        display: displayErrorMessage
                    };
                    var oninput = () => {
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
                    this.formationLabelWidth = 300;
                    let textToDisplay;
                    if (text.length > MAX_CHARACTER_TITLE) {
                        textToDisplay = text.substr(0, MAX_CHARACTER_TITLE) + "...";
                    }

                    formationLabel.content = new svg.Text(textToDisplay ? textToDisplay : text).font("Arial", 15).anchor('start');
                    formationLabel.content.mark('formationLabelContent');
                    this.formationInfoManipulator.set(1, formationLabel.content);
                    this.labelHeight = formationLabel.content.boundingRect().height - 4;
                    this.formationTitleWidth = this.titleSvg.boundingRect().width;
                    formationLabel.border = new svg.Rect(this.formationLabelWidth, this.labelHeight + MARGIN);
                    this.invalidLabelInput ? formationLabel.border.color(bgcolor, 2, myColors.red) : formationLabel.border.color(bgcolor, 1, myColors.black);
                    formationLabel.border.position(this.formationTitleWidth + this.formationLabelWidth / 2 + 3 / 2 * MARGIN, -MARGIN);
                    this.formationInfoManipulator.set(0, formationLabel.border);
                    formationLabel.content.position(this.formationTitleWidth + 2 * MARGIN, -5).color(color).anchor("start");
                    this.formationInfoManipulator.move(0, this.returnButton.height * 1.3);

                    let saveNameIcon = new svg.Image('save-file-option.png')
                        .dimension(16, 16)
                        .position(formationLabel.border.width + formationWidth + 3 * MARGIN, -MARGIN + 3);
                    this.formationInfoManipulator.set(2, saveNameIcon);

                    svg.addEvent(formationLabel.content, "dblclick", clickEditionFormationLabel);
                    svg.addEvent(formationLabel.border, "dblclick", clickEditionFormationLabel);
                    svg.addEvent(saveNameIcon, "click", () => this.saveFormation(null, "Edited", true));
                };
                formationLabelDisplay();
                this.library.display(0, drawing.height * HEADER_SIZE, this.libraryWidth - MARGIN, this.graphCreaHeight);

                if (this.status !== "NotPublished") {
                    this.displayFormationSaveButton(drawing.width / 2 - 2 * this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.saveButtonHeight);
                    this.displayFormationPublicationButton(drawing.width / 2, drawing.height * 0.87, this.buttonWidth, this.publicationButtonHeight);
                    this.displayFormationDeactivationButton(drawing.width / 2 + 2 * this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.saveButtonHeight);
                } else {
                    this.displayFormationSaveButton(drawing.width / 2 - this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.saveButtonHeight);
                    this.displayFormationPublicationButton(drawing.width / 2 + this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.publicationButtonHeight);
                }
                displayFrame(this.graphCreaWidth, this.graphCreaHeight);
                this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
            }
        }

        /**
         * affiche le bouton pour publier la formation
         * @param x
         * @param y
         * @param w
         * @param h
         */
        displayFormationPublicationButton(x, y, w, h) {
            let label = "Publier";
            let publicationFormationButton = displayText(label, w, h, myColors.black, myColors.white, 20, null, this.publicationFormationButtonManipulator);
            this.errorMessagePublication && this.errorMessagePublication.parent && this.publicationFormationButtonManipulator.remove(this.errorMessagePublication);
            this.publicationFormationQuizManager = () => {
                let message = [];
                let arrayOfUncorrectQuestions = [];
                let allQuizValid = true;
                this.levelsTab.forEach(level => {
                    level.gamesTab.forEach(game => {
                        let checkQuiz = new classContainer.QuizVue(game, false, this);
                        checkQuiz.isValid = true;
                        checkQuiz.tabQuestions.forEach(question => {
                            if (!(question instanceof AddEmptyElementVue)) {
                                question.questionType && question.questionType.validationTab.forEach(funcEl => {
                                    var result = funcEl && funcEl(question);
                                    if (result && (!result.isValid)) {
                                        message.push("Un ou plusieurs jeu(x) ne sont pas complet(s)");
                                        arrayOfUncorrectQuestions.push(question.questionNum - 1);
                                    }
                                    result && (checkQuiz.isValid = checkQuiz.isValid && result.isValid);
                                });
                            }
                            allQuizValid = allQuizValid && checkQuiz.isValid;
                        });
                        checkQuiz.isValid || game.miniatureManipulator.ordonator.children[0].color(myColors.white, 3, myColors.red);
                    });
                });
                if (!allQuizValid) {
                    this.displayPublicationMessage(message[0]);
                } else {
                    this.saveFormation(null, "Published");
                }
            };
            publicationFormationButton.border.mark("publicationFormationButtonCadre");
            svg.addEvent(publicationFormationButton.border, "click", () => this.publicationFormation());
            svg.addEvent(publicationFormationButton.content, "click", () => this.publicationFormation());
            this.publicationFormationButtonManipulator.move(x, y);
        }

        /**
         * affiche le bouton pour sauvegarder la formation
         * @param x
         * @param y
         * @param w
         * @param h
         */
        displayFormationSaveButton(x, y, w, h) {
            let saveFormationButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveFormationButtonManipulator);
            this.message && this.message.parent && this.saveFormationButtonManipulator.remove(this.message);
            saveFormationButton.border.mark("saveFormationButtonCadre");
            svg.addEvent(saveFormationButton.border, "click", () => this.saveFormation());
            svg.addEvent(saveFormationButton.content, "click", () => this.saveFormation());
            this.saveFormationButtonManipulator.move(x, y);
        }

        /**
         * affiche le bouton pour dépublier une formation
         * @param x
         * @param y
         * @param w
         * @param h
         */
        displayFormationDeactivationButton(x, y, w, h) {
            let deactivateFormationButton = displayText("Désactiver", w, h, myColors.black, myColors.white, 20, null, this.deactivateFormationButtonManipulator);
            svg.addEvent(deactivateFormationButton.border, "click", () => this.deactivateFormation());
            svg.addEvent(deactivateFormationButton.content, "click", () => this.deactivateFormation());
            this.deactivateFormationButtonManipulator.move(x, y);
        }

        /**
         * suppression du message d'erreur
         * @param message
         */
        removeErrorMessage(message) {
            message && message.parent && message.parent.remove(message);
        }

        /**
         * fonction appelée lorsqu'une bulle est lachée sur le graphe de formation (ajout ou déplacement d'un quiz)
         * @param event - evenement js
         * @param game - quiz associé au drop
         */
        dropAction(x, y, item) {
            let game;
            if (item && item.parentObject) {
                game = item.parentObject;
            }
            else{
                game = null;
            }
            let getDropLocation = (x,y) => {
                let dropLocation = this.panel.content.localPoint(x,y);
                return dropLocation;
            };
            let getLevel = (dropLocation) => {
                let level = -1;
                level = Math.floor(dropLocation.y/this.levelHeight);
                if (level >= this.levelsTab.length) {
                    level = this.levelsTab.length;
                    this.addNewLevel(level);
                }
                return level;
            };
            let getColumn = (dropLocation, level) => {
                let column = this.levelsTab[level].gamesTab.length;
                for (let i = 0; i < this.levelsTab[level].gamesTab.length; i++) {
                    let globalPointGameInLevel = this.graphManipulator.component.globalPoint(this.levelsTab[level].gamesTab[i].miniaturePosition);
                    let localPointGameInLevel = this.panel.content.localPoint(globalPointGameInLevel);
                    if (dropLocation.x < localPointGameInLevel.x) {
                        column = i;
                        break;
                    }
                }
                return column;
            };

            let dropLocation = getDropLocation(x,y);
            let level = getLevel(dropLocation);
            let column = getColumn(dropLocation, level);
            if (game && !item.addNew) {
                this.moveGame(game, level, column);
                game.levelIndex === level || game.miniature.removeAllLinks();
            } else {
                this.addNewGame(level, column)
            }
            this.displayGraph();
        }

        /**
         * ajout d'un nouveau jeu à une formation
         * @param level - niveau du jeu
         * @param column - position du jeu sur le niveau
         */
        addNewGame(level, column) {
            let gameBuilder = this.library.draggedObject || this.library.gameSelected;
            gameBuilder.create(this, level, column);
        }

        /**
         * change le niveau d'un jeu et/ou sa position sur le niveau
         * @param game - jeu a modifier
         * @param level - nouveau niveau
         * @param column - nouvelle position
         */
        moveGame(game, level, column) {
            this.levelsTab[game.levelIndex].gamesTab.splice(game.gameIndex, 1);
            this.levelsTab[level].gamesTab.splice(column, 0, game);
            if (this.levelsTab[game.levelIndex].gamesTab.length === 0 && game.levelIndex == this.levelsTab.length - 1)
                this.levelsTab.splice(game.levelIndex, 1);
        }

        /**
         * crée un lien entre 2 jeux
         * @param parentGame - jeux dont part le lien
         * @param childGame - jeux pointé par le lien
         * @param arrow - instance de la flèche qui représente le lien
         */
        createLink(parentGame, childGame, arrow) {
            this.links.push({parentGame: parentGame.id, childGame: childGame.id, arrow: arrow});
        };

        /**
         * supprime le lient entre 2 jeux
         * @param parentGame - jeu parent
         * @param childGame - jeu fils
         */
        removeLink(parentGame, childGame) {
            for (let i = this.links.length - 1; i >= 0; i--) {
                if (this.links[i].childGame === childGame.id && this.links[i].parentGame === parentGame.id)
                    this.links.splice(i, 1);
            }
        };

        /**
         * Désactive la formation. Elle n'est plus visible par les joueurs (seulement l'admin)
         */
        deactivateFormation() {
            this.status = "NotPublished";
            Server.deactivateFormation(this.formationId, ignoredData)
                .then(() => {
                    this.manipulator.flush();
                    Server.getAllFormations().then(data => {
                        let myFormations = JSON.parse(data).myCollection;
                        globalVariables.formationsManager = new classContainer.FormationsManagerVue(myFormations);
                        globalVariables.formationsManager.display();
                    });
                })
        }

        /**
         * crée et sauvegarde en bdd la nouvelle formation
         * @param callback - fonction appelée lorsque la création a reussi ou raté
         */
        saveNewFormation(callback) {
            const
                messageError = "Veuillez rentrer un nom de formation valide",
                messageUsedName = "Cette formation existe déjà"

            const returnToFormationList = () => {
                this.manipulator.flush();
                Server.getAllFormations().then(data => {
                    myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new classContainer.FormationsManagerVue(myFormations);
                    globalVariables.formationsManager.display();
                });
            };

            if (this.label && this.label !== this.labelDefault && this.label.match(this.regex)) {
                const getObjectToSave = () => {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab
                    };
                };

                let addNewFormation = () => {
                    Server.insertFormation(getObjectToSave(), ignoredData)
                        .then(data => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                this._id = answer.idVersion;
                                this.formationId = answer.id;
                                returnToFormationList();
                            } else {
                                if (answer.reason === "NameAlreadyUsed") {
                                    callback(messageUsedName, true);
                                }
                            }
                        })
                };
                addNewFormation()
            } else if (this.label == "" || this.label == null) {
                callback(messageError, true);
            }
        }

        /**
         * crée ou sauvegarde une formation
         * TODO rassembler avec saveNewFormation
         * @param displayQuizManager
         * @param status - status de la formation (not Published, Edited, Published)
         * @param onlyName - booleen pour indiquer si on veut ne sauvegarder que le nom
         */
        saveFormation(displayQuizManager, status = "Edited", onlyName = false) {
            const
                messageSave = "Votre travail a bien été enregistré.",
                messageError = "Vous devez remplir correctement le nom de la formation.",
                messageReplace = "Les modifications ont bien été enregistrées.",
                messageUsedName = "Le nom de cette formation est déjà utilisé !",
                messageNoModification = "Les modifications ont déjà été enregistrées.";

            const displayMessage = (message, displayQuizManager, error = false) => {
                switch (message) {
                    case messageError:
                    case messageUsedName:
                        error = true;
                        break;
                    default:
                        error = false;
                }
                this.publicationFormationButtonManipulator.remove(this.errorMessagePublication);
                if (displayQuizManager && !error) {
                    displayQuizManager();
                } else {
                    let saveFormationButtonCadre = this.saveFormationButtonManipulator.ordonator.children[0];
                    const messageY = saveFormationButtonCadre.globalPoint(0, 0).y;
                    this.message = new svg.Text(message)
                        .position(drawing.width / 2, messageY - saveFormationButtonCadre.height * 1.5 - MARGIN)
                        .font("Arial", 20)
                        .mark("formationErrorMessage")
                        .anchor('middle').color(error ? myColors.red : myColors.green);
                    this.manipulator.set(5, this.message);
                    svg.timeout(() => {
                        this.manipulator.unset(5);
                    }, 5000);
                }
            };


            const returnToFormationList = () => {
                this.manipulator.flush();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new classContainer.FormationsManagerVue(myFormations);
                    globalVariables.formationsManager.display();
                });
            };

            if (this.label && this.label !== this.labelDefault && this.label.match(this.regex)) {
                const getObjectToSave = () => {
                    if (onlyName && this._id) {
                        return {label: this.label};
                    } else {
                        return {
                            label: this.label,
                            gamesCounter: this.gamesCounter,
                            links: this.links,
                            levelsTab: this.levelsTab
                        };
                    }
                };

                let addNewFormation = () => {
                    Server.insertFormation(getObjectToSave(), status, ignoredData)
                        .then(data => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                this._id = answer.idVersion;
                                this.formationId = answer.id;
                                status === "Edited" ? displayMessage(messageSave, displayQuizManager) : returnToFormationList();
                            } else {
                                if (answer.reason === "NameAlreadyUsed") {
                                    displayMessage(messageUsedName, displayQuizManager);
                                }
                            }
                        })
                };

                let replaceFormation = () => {
                    Server.replaceFormation(this._id, getObjectToSave(), status, ignoredData)
                        .then((data) => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                status === "Edited" ? displayMessage(messageReplace, displayQuizManager) : returnToFormationList();
                            } else {
                                switch (answer.reason) {
                                    case "NoModif" :
                                        displayMessage(messageNoModification, displayQuizManager);
                                        break;
                                    case "NameAlreadyUsed" :
                                        displayMessage(messageUsedName, displayQuizManager);
                                        break;
                                }
                            }
                        })
                };

                this._id ? replaceFormation() : addNewFormation();
            } else {
                displayMessage(messageError, displayQuizManager);
            }
        }

        /**
         * publie une formation. Cela la rend visible aux utilisateurs du site
         */
        publicationFormation() {
            this.publishedButtonActivated = true;

            [].concat(...this.levelsTab.map(level => level.gamesTab))
                .filter(elem => elem.miniature.selected === true)
                .forEach(game => {
                    game.miniature.selected = false;
                    game.miniature.updateSelectionDesign();
                });

            const messageErrorNoNameFormation = "Vous devez remplir le nom de la formation.",
                messageErrorNoGame = "Veuillez ajouter au moins un jeu à votre formation.";

            this.displayPublicationMessage = (messagePublication) => {
                this.formationInfoManipulator.unset(2);
                this.errorMessagePublication = new svg.Text(messagePublication);
                this.manipulator.set(5, this.errorMessagePublication);
                const messageY = this.publicationFormationButtonManipulator.first.globalPoint(0, 0).y;
                this.errorMessagePublication.position(drawing.width / 2, messageY - this.publicationButtonHeight * 1.5 - MARGIN)
                    .font("Arial", 20)
                    .anchor('middle').color(myColors.red)
                    .mark("errorMessagePublication");
                svg.timeout(() => {
                    this.manipulator.unset(5, this.errorMessagePublication);
                }, 5000);
            };

            this.publicationFormationQuizManager();
            if (this.levelsTab.length === 0) {
                this.displayPublicationMessage(messageErrorNoGame);
            }
            if (!this.label || this.label === this.labelDefault || !this.label.match(this.regex)) {
                this.displayPublicationMessage(messageErrorNoNameFormation);
            }
        };

        /**
         * charge la formation
         * @param formation - infos à charger dans la formation
         */
        loadFormation(formation) {
            this.levelsTab = [];
            this.gamesCounter = formation.gamesCounter;
            this.links = formation.links || formation.link;
            formation.levelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    game.tabQuestions && gamesTab.push(new classContainer.QuizVue(game, false, this));
                    game.tabQuestions || gamesTab.push(new classContainer.BdVue(game, this));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                this.levelsTab.push(new classContainer.Level(this, gamesTab));
            });
        }

        /**
         * retourne la niveau possédant le plus de jeux
         * @returns {Array} - tableau de jeux
         */
        findLongestLevel() {
            var longestLevelCandidates = [];
            longestLevelCandidates.index = 0;
            this.levelsTab.forEach(level => {
                if (level.gamesTab.length >= this.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                    if (level.gamesTab.length === this.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                        longestLevelCandidates.push(level);
                    } else {
                        longestLevelCandidates = [];
                        longestLevelCandidates.push(level);
                    }
                    longestLevelCandidates.index = level.index - 1;
                }
            });
            return longestLevelCandidates;
        }

        /**
         * trouve la formation à l'aide de son id
         * @param id - id de la formation
         * @returns {*}
         */
        findGameById(id) {
            return [].concat(...this.levelsTab.map(x => x.gamesTab)).find(game => game.id === id);
        }

        /**
         * indique si le jeu est disponible (pas joué)
         * @param game
         * @returns {boolean}
         */
        isGameAvailable(game) {
            let available = true;
            this.links.forEach(link => {
                if (link.childGame === game.id) {
                    const parentGame = this.findGameById(link.parentGame);
                    if (parentGame && (parentGame.status === undefined || (parentGame.status && parentGame.status !== "done"))) {
                        available = false;
                        return available;
                    }
                }
            });
            return available;
        }

        /**
         * recalcule les différentes tailles des éléments en fonction de la taille d'écran
         */
        changeableDimensions() {
            this.gamesLibraryManipulator = this.library.libraryManipulator;
            this.libraryWidth = drawing.width * this.libraryWidthRatio;
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio + MARGIN;
            this.levelWidth = drawing.width - this.libraryWidth - MARGIN;
            this.minimalMarginBetweenGraphElements = this.graphElementSize / 2;
            this.y = drawing.height * HEADER_SIZE + 3 * MARGIN;
            this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
            this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
            this.buttonWidth = 150;
            this.globalMargin = {
                height: this.marginRatio * drawing.height,
                width: this.marginRatio * drawing.width
            };
            this.clippingManipulator.flush();
        }

        /**
         * vérifie le texte entré dans un input
         * @param myObj - input à tester
         */
        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(this.regex)) || myObj.textarea.messageText === "") {
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

        /**
         * ajoute un niveau à la formation
         * @param index - indice du niveau
         */
        addNewLevel(index) {
            var level = new classContainer.Level(this);
            if (!index) {
                this.levelsTab.push(level);
            } else {
                this.levelsTab.splice(index, 0, level);
            }
        }

        /**
         * évènement pour ajouter un jeu à un niveau au clic de la souris.
         */
        clickToAdd() {
            this.mouseUpGraphBlock = event => {
                this.library.gameSelected && this.dropAction(event);
                this.library.gameSelected && this.library.gameSelected.miniature.border.color(myColors.white, 1, myColors.black);
                this.library.gameSelected = null;
                svg.removeEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            };
            svg.addEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            svg.addEvent(this.messageDragDropManipulator.ordonator.children[1], "mouseup", this.mouseUpGraphBlock);
        }

        /**
         * mets à jour l'index des jeux dans les différents niveaux
         * @param level - niveau à réafficher
         */
        adjustGamesPositions(level) {
            let computeIndexes = () => {
                this.levelsTab.forEach((level, lIndex) => {
                    level.gamesTab.forEach((game, gIndex) => {
                        game.levelIndex = lIndex;
                        game.gameIndex = gIndex;
                    })
                });
            };

            computeIndexes();
            var nbOfGames = level.gamesTab.length;
            var spaceOccupied = nbOfGames * this.minimalMarginBetweenGraphElements + this.graphElementSize * nbOfGames;
            level.gamesTab.forEach(game => {
                game.miniaturePosition.x = this.minimalMarginBetweenGraphElements * (3 / 2) + (game.gameIndex - nbOfGames / 2) * spaceOccupied / nbOfGames;
                game.miniaturePosition.y = -this.panel.height / 2 + (level.index - 1 / 2) * this.levelHeight;
            });
        }

        /**
         * affiche les jetons de statut sur les différentes formations de l'utilisateur. (i.e pas commencé, en cours, finis)
         * @param displayFunction - fonction appelée lorsque trackProgress a finis
         */
        trackProgress(displayFunction) {
            this.levelsTab.forEach(level => {
                level.gamesTab.forEach(game => {
                    delete game.miniature;
                    delete game.status;
                });
            });
            this.miniaturesManipulator.flush();
            Server.getUser().then(data => {
                let user = JSON.parse(data);
                if (user.formationsTab) {
                    let formationUser = user.formationsTab.find(formation => formation.version === this._id);
                    formationUser && formationUser.gamesTab.forEach(game => {
                        let theGame = this.findGameById(game.game);
                        if (!theGame) {
                            return;
                        }
                        theGame.currentQuestionIndex = game.questionsAnswered.length;
                        theGame.questionsAnswered = [];
                        if (game.questionsAnswered) {
                            game.questionsAnswered.forEach((wrongAnswer, i) => {
                                theGame.questionsAnswered.push({
                                    question: theGame.tabQuestions[i],
                                    validatedAnswers: wrongAnswer.validatedAnswers
                                });
                            });
                            theGame.score = game.questionsAnswered.length - theGame.getQuestionsWithBadAnswers().length;
                            theGame.status = (game.questionsAnswered.length === theGame.tabQuestions.length) ? "done" : "inProgress";
                        }
                    });
                }
                this.levelsTab.forEach(level => {
                    level.gamesTab.forEach(game => {
                        if (!this.isGameAvailable(game)) {
                            game.status = "notAvailable";
                        }
                    });
                });
                displayFunction.call(this);
            });
        }
    }

    return {FormationVue};
}