/**
 *
     Level,
     FormationVue,
     GameVue,
     QuizVue,
     BdVue
 *
 */
exports.Formation = function (globalVariables, classContainer) {
    let Vue = classContainer.getClass("Vue");

    let imageController;
    let myFormations;

    let
        main = globalVariables.main,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        Manipulator = globalVariables.util.Manipulator,
        MiniatureFormation = globalVariables.util.MiniatureFormation,
        ReturnButton = globalVariables.util.ReturnButton,
        Server = globalVariables.util.Server,
        util = globalVariables.util,
        Puzzle = globalVariables.util.Puzzle;

    imageController = ImageController(globalVariables.ImageRuntime);
    globalVariables.imageController = imageController;

    installDnD = globalVariables.gui.installDnD;

    /**
     * Niveau d'une formation. Il peut contenir un ou plusieurs quiz. Une formation peut avoir un ou plusieurs niveaux
     * @class
     */
    class Level {
        /**
         * ajoute un niveau à une formation
         * @constructs
         * @param formation - formation qui va contenir le nouveau niveau
         * @param gamesTab - quizs associés à ce niveau
         */
        constructor(formation, gamesTab, playerCheck) {
            this.parentFormation = formation;
            this.manipulator = new Manipulator(this).addOrdonator(4);

            //croix rouge pour fermer
            this.redCrossManipulator = new Manipulator(this).addOrdonator(2);


            this.index = (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1]) ? (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1].index + 1) : 1;
            this.gamesTab = gamesTab ? gamesTab : [];
            this.x = this.parentFormation.libraryWidth ? this.parentFormation.libraryWidth : null; // Juste pour être sûr
            this.y = (this.index - 1) * this.parentFormation.levelHeight;

           if(!playerCheck){
                this.manipulator.add( this.redCrossManipulator);
                let redCross = drawRedCross(150, 15, 20, this.redCrossManipulator);
                this.redCrossManipulator.add(redCross);

                //effacer l objet (ce niveau)
                this.redCrossClickHandler = () => {
                    this.redCrossManipulator.flush();
                    formation.levelsTab.splice(this.index-1, 1);
                    this.manipulator.flush();
                    this.gamesTab.forEach(game => {
                        game.miniatureManipulator.flush();
                        for (let j=formation.links.length-1; j>=0; j--){
                            if (formation.links[j].childGame === game.id || formation.links[j].parentGame === game.id){
                                formation.links.splice(j, 1);
                            }
                        }
                    });
                    for (let i=this.index-1; i<formation.levelsTab.length; i++){
                        //formation.levelsTab[i].manipulator.flush();
                        formation.levelsTab[i].index --;
                        //formation.levelsTab[i].manipulator.flush();
                    }
                    formation.displayGraph(formation.graphW, formation.graphH);
                };
                svg.addEvent(redCross, 'click', this.redCrossClickHandler);
            }
        }

        /**
         * supprime le niveau de la formation parent
         * @param index
         */
        removeGame(index) {
            this.gamesTab.splice(index, 1);
        }

    }

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
            this.manipulator.addOrdonator(7);

            this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
            this.graphManipulator = new Manipulator(this);
            this.levelManipulator = new Manipulator(this);

            this.messageDragDropManipulator = new Manipulator(this).addOrdonator(2);
            this.arrowsManipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this);

            this.graphManipulator.add(this.miniaturesManipulator);
            this.graphManipulator.add(this.arrowsManipulator);
            this.clippingManipulator = new Manipulator(this);
            this.saveFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.publicationFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.deactivateFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.library = classContainer.createClass("GamesLibraryVue", myLibraryGames);
            this.library.formation = this;
            this.quizManager = classContainer.createClass("QuizManagerVue", null, this);
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
            this.graphElementSize = 100;//Cette valeur influe directement sur les proportions du graph.
            this.graphElementWidth = this.graphElementSize * 2;
            this.miniature = new MiniatureFormation(this);
            this.changeableDimensions();
            this.manipulator.add(this.saveFormationButtonManipulator);
            this.manipulator.add(this.publicationFormationButtonManipulator);
            this.manipulator.add(this.deactivateFormationButtonManipulator);
            this.formationLeftManipulator = new Manipulator(this);
            this.manipulator.add(this.formationLeftManipulator);
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
            drawing.manipulator.set(1, this.manipulator);
            this.manipulator.add(this.returnButtonManipulator);

            let returnHandler = () => {
                this.returnButton.manipulator.flush();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = classContainer.createClass("FormationsManagerVue", myFormations);
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
            this.manipulator.move(0, globalVariables.header.height + this.returnButton.height);
            globalVariables.playerMode && this.graphManipulator.move(this.graphElementWidth, 0);
            !globalVariables.playerMode && this.graphManipulator.move(this.graphElementWidth/4,0);

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
                // drawing.manipulator.unset(1, this.manipulator.add);
                drawing.manipulator.unset(1);
                main.currentPageDisplayed = "QuizPreview";
                this.quizDisplayed = classContainer.createClass("QuizVue", target, false, this);
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
                this.graphManipulator.add(level.manipulator.first);
                let icon = {
                    content: new svg.Text("Niveau " + level.index).dimension(this.graphElementWidth, 0).anchor('left').position(0, -MARGIN),
                    line: new svg.Line(0, 0, this.graphElementWidth/2 , 0)
                        .color(myColors.grey, 1, myColors.grey)
                };
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
                level.manipulator.set(1, icon.content);
                level.manipulator.set(2, icon.line);
                //level.manipulator.set(0,icon.border);
                level.w = w;
                level.h = h;
                level.y = (level.index -0.5) * level.parentFormation.levelHeight;
                level.manipulator.move(0, level.y);
            };

            let displayFormationLeft = ()=>{
                let icon = {
                    content: new svg.Text(this.label).dimension(this.graphElementWidth, 0).position(0, 0).font('Arial', 15),
                    border: util.drawHexagon(this.graphElementWidth/2, this.graphElementSize*1.5, 'V', 1)
                }

                this.formationLeftManipulator.add(icon.border);
                this.formationLeftManipulator.add(icon.content);
                this.formationLeftManipulator.move(this.graphElementWidth/3, globalVariables.drawing.height/2 - globalVariables.header.height);
            }

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
                //on utilise actuellement pour desectionner
                this.clickOnPanel = () => {
                    this.selectedArrow = null;
                    this.displayGraph();
                };

                svg.addEvent(this.panel.back, "click", this.clickOnPanel);

                this.panel.border.color([], 0, []);
                this.panel.back.mark("panelBack");
                this.panel.content.add(this.levelManipulator.first);
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
                messageDragDrop.position(messageDragDrop.x, messageDragDrop.y).color(myColors.grey).fontStyle("italic");
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
                    //tabElement.miniatureManipulator.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
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
                    this.miniaturesManipulator.last.mark("miniaturesManipulatorLast");
                    level.gamesTab.forEach((tabElement) => {
                        tabElement.miniatureManipulator.ordonator || tabElement.miniatureManipulator.addOrdonator(3);
                        this.miniaturesManipulator.add(tabElement.miniatureManipulator);
                        // mettre un manipulateur par niveau !_! attention à bien les enlever
                        if (typeof tabElement.miniature === "undefined") {
                            (tabElement.miniature = tabElement.createMiniature(this.graphElementSize));
                        }
                        tabElement.miniature.display();
                        this.adjustGamesPositions(level);
                        manageMiniature(tabElement);
                    });
                });
                !globalVariables.playerMode && displayMessageDragAndDrop();

                resizePanel();
                this.panel.back.parent.parentManip = this.graphManipulator;
                updateAllLinks();
            };

            if (globalVariables.playerMode) {
                this.graphCreaHeightRatio = 0.97;
                this.graphCreaHeight = (drawing.height - drawing.height * HEADER_SIZE - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
                this.graphCreaWidth = drawing.width - 2 * MARGIN;
                displayFrame(this.graphCreaWidth, this.graphCreaHeight);
                displayFormationLeft();
                this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
                this.clippingManipulator.move((drawing.width - this.graphCreaWidth) / 2, this.formationsManager.y / 2 - borderSize);
            } else {
                this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
                this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
                this.graphCreaHeight = (drawing.height - drawing.height * HEADER_SIZE - 40 - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
                this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
                this.gamesLibraryManipulator = this.library.manipulator;
                this.manipulator.set(4, this.gamesLibraryManipulator);
                this.manipulator.set(0, this.formationInfoManipulator);
                this.libraryWidth = drawing.width * this.libraryWidthRatio;
                this.y = drawing.height * HEADER_SIZE;
                this.titleSvg = new svg.Text("Formation : ").position(MARGIN, this.returnButton.height *1.1).font("Arial", 20).anchor("start");
                this.manipulator.set(2, this.titleSvg);
                let formationWidth = this.titleSvg.boundingRect().width;
                let formationLabel = {};

                //TODO changer l'input pour changer le nom de la formation
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

                    let saveNameIcon = new svg.Image('../images/save-file-option.png')
                        .dimension(16, 16)
                        .position(formationLabel.border.width + formationWidth + 3 * MARGIN, -MARGIN + 3)
                        .mark('saveNameIcon');
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
                        let checkQuiz = classContainer.createClass("QuizVue", game, false, this);
                        checkQuiz.isValid = true;
                        checkQuiz.tabQuestions.forEach(question => {
                            if (!(classContainer.isInstanceOf("AddEmptyElementVue", question))) {
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
                if(this.levelsTab[game.levelIndex].gamesTab.length == 0){
                    this.levelsTab[game.levelIndex].redCrossClickHandler();
                }
                game.levelIndex = level;
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
            //if (this.levelsTab[game.levelIndex].gamesTab.length === 0 && game.levelIndex == this.levelsTab.length - 1){
            //    this.levelsTab.splice(game.levelIndex, 1);
            //}
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
                        globalVariables.formationsManager = classContainer.createClass("FormationsManagerVue", myFormations);
                        globalVariables.formationsManager.display();
                    });
                })
        }

        /**
         * crée et sauvegarde en bdd la nouvelle formation
         * @param callback - fonction appelée lorsque la création a reussi ou raté
         */
        saveNewFormation(callback) {
            const messageError = "Veuillez rentrer un nom de formation valide",
                messageUsedName = "Cette formation existe déjà"

            if (this.label && this.label !== this.labelDefault && this.label.match(this.regex)) {
                const getObjectToSave = () => {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab
                    };
                };

                Server.insertFormation(getObjectToSave(), ignoredData)
                    .then(data => {
                        let answer = JSON.parse(data);
                        if (answer.saved) {
                            this._id = answer.idVersion;
                            this.formationId = answer.id;
                            this.manipulator.flush();
                            Server.getAllFormations().then(data => {
                                myFormations = JSON.parse(data).myCollection;
                                globalVariables.formationsManager = classContainer.createClass("FormationsManagerVue", myFormations);
                                globalVariables.formationsManager.display();
                            });
                        } else {
                            if (answer.reason === "NameAlreadyUsed") {
                                callback(messageUsedName, true);
                            }
                        }
                    })
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
                    globalVariables.formationsManager = classContainer.createClass("FormationsManagerVue", myFormations);
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

            if (this.levelsTab.length === 0) {
                this.displayPublicationMessage(messageErrorNoGame);
                return;
            }
            if (!this.label || this.label === this.labelDefault || !this.label.match(this.regex)) {
                this.displayPublicationMessage(messageErrorNoNameFormation);
                return;
            }

            this.publicationFormationQuizManager();
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
                    game.tabQuestions && gamesTab.push(classContainer.createClass("QuizVue", game, false, this));
                    game.tabQuestions || gamesTab.push(classContainer.createClass("BdVue", game, this));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                this.levelsTab.push(classContainer.createClass("Level", this, gamesTab, globalVariables.playerMode));
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
            this.gamesLibraryManipulator = this.library.manipulator;
            this.libraryWidth = drawing.width * this.libraryWidthRatio;
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio + MARGIN;
            this.levelWidth = drawing.width - this.libraryWidth - MARGIN;
            this.minimalMarginBetweenGraphElements = this.graphElementSize / 4;
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
            var level = classContainer.createClass("Level", this);
            if (!index) {
                this.levelsTab.push(level);
            } else {
                this.levelsTab.splice(index, 0, level);
            }
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
            var spaceOccupied = this.minimalMarginBetweenGraphElements + this.graphElementWidth*0.8;
            level.gamesTab.forEach(game => {
                game.miniatureManipulator.move(this.graphElementWidth*0.9+ (game.gameIndex * spaceOccupied) ,
                    (level.index - 0.5) * game.parentFormation.levelHeight );
                //game.miniaturePosition.y = -this.panel.height / 2 + (level.index) * this.levelHeight/2;
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

    /**
     * classe générique représentant un jeu
     * @class
     */
    class GameVue extends Vue {
        /**
         * construit un jeu
         * @constructs
         * @param game - options sur le jeu
         * @param parentFormation - formation contenant le jeu
         */
        constructor(game, parentFormation) {
            super();
            this.id = game.id;
            this.miniatureManipulator = new Manipulator(this);
            this.parentFormation = parentFormation || game.parentFormation;
            this.title = game.title || '';
            this.miniaturePosition = {x: 0, y: 0};
            this.returnButtonManipulator = new Manipulator(this);
        }

        /**
         * Cette classe ne devrait pas être affichée. Cette fonction affiche une erreur dans la console.
         */
        render(){
            console.error('error: attempting to display something that is not a view (Game class)');
        }

        /**
         * affiche la miniature du quiz
         * @param size - taille de la miniature
         * @returns {MiniatureGame}
         */
        createMiniature(size) {
            return new util.MiniatureGame(this, size);
        }

        /**
         * le jeu est il lié au parentGame (i.e la flèche part du parentgame et pointe vers le jeu)
         * @param parentGame - jeu parent
         * @returns {boolean}
         */
        isChildOf(parentGame) {
            return parentGame.parentFormation.links.some((link) => link.parentGame === parentGame.id && link.childGame === this.id);
        };
    }

    /**
     * Quiz
     * @class
     */
    class QuizVue extends GameVue{
        /**
         * construit un quiz
         * @constructs
         * @param {Object} quiz - options sur le quiz
         * @param {Boolean} previewMode - le jeu est il affiché en mode preview (lorsque l'admin modifie un quiz, il peut voir un aperçu de ce dernier
         * @param {Formation} parentFormation - formation contenant le quiz
         */
        constructor(quiz, previewMode, parentFormation) {
            super(quiz, parentFormation);
            const returnText = globalVariables.playerMode ? (previewMode ? "Retour aux résultats" : "Retour à la formation") : "Retour à l'édition du jeu";
            this.returnButton = new ReturnButton(this, returnText);
            this.manipulator.add(this.returnButtonManipulator);
            this.expButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.add(this.expButtonManipulator);
            this.chevronManipulator = new Manipulator(this);
            this.leftChevronManipulator = new Manipulator(this).addOrdonator(1);
            this.rightChevronManipulator = new Manipulator(this).addOrdonator(1);
            this.manipulator.add(this.chevronManipulator);
            this.chevronManipulator.add(this.leftChevronManipulator);
            this.chevronManipulator.add(this.rightChevronManipulator);
            this.loadQuestions(quiz);
            this.levelIndex = quiz.levelIndex || 0;
            this.gameIndex = quiz.gameIndex || 0;
            (previewMode) ? (this.previewMode = previewMode) : (this.previewMode = false);
            quiz.puzzleRows ? (this.puzzleRows = quiz.puzzleRows) : (this.puzzleRows = 3);
            quiz.puzzleLines ? (this.puzzleLines = quiz.puzzleLines) : (this.puzzleLines = 3);
            quiz.font && (this.font = quiz.font);
            quiz.fontSize ? (this.fontSize = quiz.fontSize) : (this.fontSize = 20);
            quiz.colorBordure ? (this.colorBordure = quiz.colorBordure) : (this.colorBordure = myColors.black);
            quiz.bgColor ? (this.bgColor = quiz.bgColor) : (this.bgColor = myColors.none);
            this.resultArea = {
                x: drawing.width / 2,
                y: 220,
                w: drawing.width,
                h: 200
            };
            this.titleArea = {
                x: 0,
                y: 0,
                w: drawing.width,
                h: 200
            };
            this.questionArea = {
                x: 0,
                y: 210,
                w: drawing.width,
                h: 200
            };
            this.miniaturePosition = {x: 0, y: 0};
            this.questionsAnswered = quiz.questionsAnswered ? quiz.questionsAnswered : [];
            this.score = (quiz.score ? quiz.score : 0);
            this.currentQuestionIndex = quiz.currentQuestionIndex ? quiz.currentQuestionIndex : -1;
        }

        /**
         *
         * @param x
         * @param y
         * @param w
         * @param h
         */
        render(x, y, w, h) {
            main.currentPageDisplayed = "Quiz";
            globalVariables.header.display(this.parentFormation.label + " : " + this.title);
            drawing.manipulator.set(1, this.manipulator);
            let headerPercentage, questionPercentageWithImage, questionPercentage,
                answerPercentageWithImage;
            let setSizes = (() => {
                this.x = x + w * 0.15 || this.x || 0;
                this.y = y || this.y || 0;
                w && (this.questionArea.w = w * 0.7);
                (w && x) && (this.resultArea.w = w);
                x && (this.resultArea.x = x);
                w && (this.titleArea.w = w);
                headerPercentage = HEADER_SIZE;
                questionPercentageWithImage = 0.3;
                questionPercentage = 0.2;
                answerPercentageWithImage = 0.6;
                this.answerPercentage = 0.7;
            })();

            let heightPage = drawing.height;
            this.headerHeight = heightPage * headerPercentage;
            this.questionHeight = heightPage * questionPercentage - MARGIN;
            this.answerHeight = heightPage * this.answerPercentage - MARGIN;
            this.questionHeightWithoutImage = heightPage * questionPercentage - MARGIN;
            this.answerHeightWithoutImage = heightPage * this.answerPercentage - MARGIN;
            this.questionHeightWithImage = heightPage * questionPercentageWithImage - MARGIN;
            this.answerHeightWithImage = heightPage * answerPercentageWithImage - MARGIN;
            this.manipulator.move(this.questionArea.w / 2, this.headerHeight);
            this.returnButton.display(MARGIN - w * 0.5 + this.x, this.headerHeight / 2, 20, 20);
            this.returnButtonManipulator.ordonator.children[0].mark('returnButtonToResults');
            let returnButtonChevron = this.returnButton.chevronManipulator.ordonator.children[0];
            if (this.previewMode) {
                if (globalVariables.playerMode) {
                    this.returnButton.setHandler(() => {
                        drawings.component.clean();
                        this.closePopIn();
                        this.previewMode = false;
                        this.currentQuestionIndex = this.tabQuestions.length;
                        this.manipulator.flush();
                        this.puzzleLines = 3;
                        this.puzzleRows = 3;
                        this.returnButton.label = "Retour à la formation";
                        returnButtonChevron.mark('returnButtonToFormation');
                        main.currentPageDisplayed = "QuizPreview";
                        (this.oldQuiz ? this.oldQuiz : this).display(0, 0, drawing.width, drawing.height);
                    });
                } else {
                    drawings.component.clean();
                    returnButtonChevron.mark('returnButtonPreview');
                    this.returnButton.setHandler(() => {
                        drawings.component.clean();
                        this.closePopIn();
                        this.manipulator.flush();
                        this.parentFormation.quizManager.loadQuiz(this, this.currentQuestionIndex);
                        this.parentFormation.quizManager.display();
                    });
                }
            } else {
                drawings.component.clean();
                returnButtonChevron.mark('returnButtonToFormation');
                let returnHandler = () => {
                    drawings.component.clean();
                    this.closePopIn();
                    this.manipulator.flush();
                    this.parentFormation.display();
                    this.returnButton.removeHandler(returnHandler);
                };
                this.returnButton.setHandler(returnHandler);
            }
            this.leftChevron = new Chevron(x - w * 0.3, y + h * 0.45, w * 0.1, h * 0.15, this.leftChevronManipulator, "left");
            this.leftChevron.mark('leftChevron');
            this.rightChevron = new Chevron(x + w * 0.6, y + h * 0.45, w * 0.1, h * 0.15, this.rightChevronManipulator, "right");
            this.rightChevron.mark('rightChevron');

            this.leftChevron.update = function (quiz) {
                if (quiz.currentQuestionIndex === 0) {
                    this.color(myColors.grey);
                    svg.removeEvent(this, "click");
                } else {
                    this.color(myColors.black);
                    svg.addEvent(this, "click", () => { leftChevronHandler(); });
                }
            };
            this.rightChevron.update = function (quiz) {
                if (quiz.previewMode) {
                    if (quiz.currentQuestionIndex === quiz.tabQuestions.length - 1) {
                        this.color(myColors.grey);
                        svg.removeEvent(this, "click");
                    } else {
                        this.color(myColors.black);
                        svg.addEvent(this, "click", () => { rightChevronHandler(); });
                    }
                } else {
                    if (quiz.currentQuestionIndex === quiz.questionsAnswered.length) {
                        this.color(myColors.grey);
                        svg.removeEvent(this, "click");
                    } else {
                        this.color(myColors.black);
                        svg.addEvent(this, "click", () => { rightChevronHandler(); });
                    }
                }
            };

            this.closePopIn = () => {
                this.tabQuestions[this.currentQuestionIndex] && this.tabQuestions[this.currentQuestionIndex].tabAnswer.forEach(answer => {
                    if (answer.model.explanationPopIn && answer.model.explanationPopIn.displayed) {
                        let said = answer.model.explanationPopIn.said;
                        answer.model.explanationPopIn.cross.component.listeners["click"]();
                        answer.model.explanationPopIn.said = said;
                    }
                });
            };

            let leftChevronHandler = () => {
                drawings.component.clean();
                this.closePopIn();
                if (this.currentQuestionIndex > 0) {
                    this.manipulator.remove(this.tabQuestions[this.currentQuestionIndex].manipulator);
                    this.currentQuestionIndex--;
                    this.leftChevron.update(this);
                    this.rightChevron.update(this);
                    this.displayCurrentQuestion();
                }
            };
            let rightChevronHandler = () => {
                drawings.component.clean();
                this.closePopIn();
                if (this.currentQuestionIndex < this.tabQuestions.length - 1) {
                    this.manipulator.remove(this.tabQuestions[this.currentQuestionIndex].manipulator);
                    this.currentQuestionIndex++;
                    this.leftChevron.update(this);
                    this.rightChevron.update(this);
                    this.displayCurrentQuestion();
                }
            };

            if (this.currentQuestionIndex === -1) {// on passe à la première question
                this.nextQuestion();
            }
            else if (this.currentQuestionIndex < this.tabQuestions.length) {
                this.displayCurrentQuestion();
            }
            else {
                this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, this.getQuestionsWithBadAnswers(), "upToDown", this);
                this.displayResult();
            }
        }

        /**
         *
         * @param color
         */
        displayResult(color) {
            drawings.component.clean();
            this.displayScore(color);
            this.leftChevronManipulator.unset(0);
            this.rightChevronManipulator.unset(0);

            const
                buttonExpHeight = 50,
                buttonExpWidth = drawing.width * 0.3,
                textExp = "Voir les réponses et explications",
                expButton = displayText(textExp, buttonExpWidth, buttonExpHeight, myColors.black, myColors.white, 20, null, this.expButtonManipulator);
            this.expButtonManipulator.move(buttonExpWidth / 2, drawing.height - this.headerHeight - buttonExpHeight);
            expButton.border.mark('expButton');

            const displayExplanation = () => {
                drawings.component.clean();
                this.manipulator.flush();
                let quizExplanation = classContainer.createClass("QuizVue", this, true);
                quizExplanation.currentQuestionIndex = 0;
                quizExplanation.oldQuiz = this;
                globalVariables.formationsManager.formationDisplayed.quizDisplayed = quizExplanation;
                quizExplanation.run(1, 1, drawing.width, drawing.height);
            };

            svg.addEvent(expButton.border, "click", displayExplanation);
            svg.addEvent(expButton.content, "click", displayExplanation);

            this.puzzle.fillVisibleElementsArray("upToDown");
            this.answerHeight = (drawing.height - this.headerHeight - buttonExpHeight) * this.answerPercentage - MARGIN;
            this.puzzle.display(0, this.questionHeight / 2 + this.answerHeight / 2 + MARGIN, drawing.width - MARGIN, this.answerHeight);
            this.puzzle.leftChevron.resize(this.puzzle.chevronSize, this.puzzle.chevronSize);
        }

        /**
         *
         * @param color
         */
        displayScore(color) {
            let autoColor;
            switch (this.score) {
                case this.tabQuestions.length:
                    str1 = 'Impressionant !';
                    str2 = 'et toutes sont justes !';
                    autoColor = [100, 255, 100];
                    break;
                case 0:
                    str1 = 'Votre niveau est désolant... Mais gardez espoir !';
                    str2 = "dont aucune n'est juste !";
                    autoColor = [255, 17, 0];
                    break;
                case (this.tabQuestions.length - 1):
                    str1 = 'Pas mal du tout !';
                    str2 = 'et toutes (sauf une...) sont justes !';
                    autoColor = [200, 255, 0];
                    break;
                case 1:
                    str1 = 'Vous avez encore de nombreux progrès à faire.';
                    str2 = 'dont une seule est juste.';
                    autoColor = [255, 100, 0];
                    break;
                default:
                    str1 = 'Correct, mais ne relachez pas vos efforts !';
                    str2 = `dont ${this.score} sont justes !`;
                    autoColor = [220, 255, 0];
                    break;
            }
            var str1, str2;
            let finalMessage = `${str1} Vous avez répondu à ${this.tabQuestions.length} questions, ${str2}`;
            if (!color) {
                var usedColor = autoColor;
            } else {
                usedColor = color;
            }
            this.resultManipulator && this.manipulator.remove(this.resultManipulator);
            this.resultManipulator = new Manipulator(this);
            this.scoreManipulator = new Manipulator(this).addOrdonator(2);
            this.scoreManipulator.mark('scoreManipulator');
            this.resultManipulator.move(this.titleArea.w / 2 - this.questionArea.w / 2, this.questionHeight / 2 + this.headerHeight / 2 + 2 * MARGIN);
            this.resultManipulator.add(this.scoreManipulator);
            this.resultManipulator.add(this.puzzle.manipulator);
            this.manipulator.add(this.resultManipulator);
            displayText(finalMessage, this.titleArea.w - 2 * MARGIN, this.questionHeight, myColors.black, usedColor, this.fontSize, this.font, this.scoreManipulator);
        }

        /**
         * charge les questions du quiz (crée une classe Question pour chaque objet dans quiz.tabQuestions)
         * @param quiz - quiz à charger
         */
        loadQuestions(quiz) {
            if (quiz && typeof quiz.tabQuestions !== 'undefined') {
                this.tabQuestions = [];
                quiz.tabQuestions.forEach(it => {
                    it.questionType = it.multipleChoice ? myQuestionType.tab[1] : myQuestionType.tab[0];
                    let tmp = classContainer.createClass("QuestionVue", it, this);
                    tmp.parentQuiz = this;
                    this.tabQuestions.push(tmp);
                });
            } else {
                this.tabQuestions = [];
                this.tabQuestions.push(classContainer.createClass("QuestionVue", defaultQuestion, this));
            }
        }

        /**
         *
         * @param x
         * @param y
         * @param w
         * @param h
         */
        run(x, y, w, h) {
            let intervalToken = svg.interval(() => {
                if (this.tabQuestions.every(e => e.imageLoaded && e.tabAnswer.every(el => el.model.imageLoaded))) {
                    svg.clearInterval(intervalToken);
                    this.display(x, y, w, h);
                }
            }, 100);
        }

        /**
         * affiche la question en cours
         */
        displayCurrentQuestion() {
            if (this.tabQuestions[this.currentQuestionIndex].imageSrc) {
                this.questionHeight = this.questionHeightWithImage;
                this.answerHeight = this.answerHeightWithImage;
            } else {
                this.questionHeight = this.questionHeightWithoutImage;
                this.answerHeight = this.answerHeightWithoutImage;
            }
            this.manipulator.add(this.tabQuestions[this.currentQuestionIndex].manipulator);
            this.tabQuestions[this.currentQuestionIndex].manipulator.flush();
            this.tabQuestions[this.currentQuestionIndex].display(this.x, this.headerHeight + this.questionHeight / 2 + MARGIN,
                this.questionArea.w, this.questionHeight);
            this.rightChevron.update(this);
            this.leftChevron.update(this);
            !this.previewMode && this.tabQuestions[this.currentQuestionIndex].manipulator.add(this.tabQuestions[this.currentQuestionIndex].answersManipulator);
            this.tabQuestions[this.currentQuestionIndex].displayAnswers(this.questionArea.w, this.answerHeight);
        }

        /**
         * question suivante
         * !_! bof, y'a encore des display appelés ici
         */
        nextQuestion() {
            if (this.currentQuestionIndex !== -1) {
                this.manipulator.remove(this.tabQuestions[this.currentQuestionIndex].manipulator);
            }

            if (this.previewMode) {
                if (this.currentQuestionIndex === -1) {
                    this.currentQuestionIndex++;
                }
                this.displayCurrentQuestion();
            } else {
                Server.sendProgressToServer(this)
                    .then(() => {
                        if (++this.currentQuestionIndex < this.tabQuestions.length) {
                            this.displayCurrentQuestion();
                        } else {
                            this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, this.getQuestionsWithBadAnswers(), "leftToRight", this);
                            this.displayResult();
                        }
                    });
            }
        }

        /**
         * retourne toutes les questions qui ont été mal répondues
         * @returns {Array}
         */
        getQuestionsWithBadAnswers() {
            let questionsWithBadAnswers = [],
                allRight = false;
            this.questionsAnswered.forEach(questionAnswered => {
                let question = questionAnswered.question;
                if (question.multipleChoice) {
                    if (question.rightAnswers.length !== questionAnswered.validatedAnswers.length) {
                        questionsWithBadAnswers.push(question);
                    } else {
                        let subTotal = 0;
                        questionAnswered.validatedAnswers.forEach((e) => {
                            if (question.tabAnswer[e].model.correct) {
                                subTotal++;
                            }
                        });
                        allRight = (subTotal === question.rightAnswers.length);
                        !allRight && questionsWithBadAnswers.push(question);
                    }
                } else if (!question.multipleChoice && !question.tabAnswer[questionAnswered.validatedAnswers[0]].model.correct) {
                    questionsWithBadAnswers.push(question);
                }

            });
            return questionsWithBadAnswers;
        }
    }

    /**
     * Bd
     * @class
     */
    class BdVue extends GameVue {
        /**
         * construit une Bd
         * @constructs
         * @param bd - options sur la bd
         * @param parentFormation - formation contenant la bd
         */
        constructor(bd, parentFormation) {
            super(bd, parentFormation);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.manipulator.add(this.returnButtonManipulator);
        }

        render(bd) {
            drawing.manipulator.unset(1);
            globalVariables.header.display(bd.title);
            drawing.manipulator.add(bd.manipulator);
            bd.returnButton.display(0, drawing.height * HEADER_SIZE + 2 * MARGIN, 20, 20);
            let returnButtonChevron = bd.returnButton.chevronManipulator.ordonator.children[0];
            returnButtonChevron.mark('returnButtonFromBdToFormation');
            bd.returnButton.setHandler(this.previewMode ? (event) => {
                    bd.returnButton.removeHandler(returnHandler);
                    let target = bd.returnButton;
                    target.parent.manipulator.flush();
                    target.parent.parentFormation.quizManager.loadQuiz(target.parent, target.parent.currentQuestionIndex);
                    target.parent.parentFormation.quizManager.display();
                } : (event) => {
                    let target = bd.returnButton;//drawings.background.getTarget(event.pageX, event.pageY);
                    target.parent.manipulator.flush();
                    target.parent.parentFormation.display();
                });
        }
    }

    return {
        Level,
        FormationVue,
        GameVue,
        QuizVue,
        BdVue
    };
}