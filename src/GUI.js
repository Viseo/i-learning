exports.GUI = function (globalVariables) {

    let svg, gui, util, domain, runtime, drawings, drawing, imageController, playerMode,
        header, AddEmptyElement, Answer, Bd, Formation, FormationsManager, GamesLibrary, Header,
        ImagesLibrary, Library, PopIn, Question, QuestionCreator, Quizz, QuizzManager,
        InscriptionManager, ConnexionManager, Manipulator, MiniatureGame, Picture, Puzzle, Server, mainManipulator;

    setGlobalVariables = () => {
        svg = globalVariables.svg;
        gui = globalVariables.gui;
        util = globalVariables.util;
        domain = globalVariables.domain;
        runtime = globalVariables.runtime;
        drawings = globalVariables.drawings;
        drawing = globalVariables.drawing;
        imageController = globalVariables.imageController;

        playerMode = globalVariables.playerMode;
        header = globalVariables.header;
        mainManipulator = drawing.manipulator;

        AddEmptyElement = domain.AddEmptyElement;
        Answer = domain.Answer;
        Bd = domain.Bd;
        Formation = domain.Formation;
        FormationsManager = domain.FormationsManager;
        GamesLibrary = domain.GamesLibrary;
        Header = domain.Header;
        ImagesLibrary = domain.ImagesLibrary;
        Library = domain.Library;
        PopIn = domain.PopIn;
        Question = domain.Question;
        QuestionCreator = domain.QuestionCreator;
        Quizz = domain.Quizz;
        QuizzManager = domain.QuizzManager;
        InscriptionManager = domain.InscriptionManager;
        ConnexionManager = domain.ConnexionManager;

        Manipulator = util.Manipulator;
        MiniatureGame = util.MiniatureGame;
        Picture = util.Picture;
        Puzzle = util.Puzzle;
        Server = util.Server;
    };

    setGlobalVariables();

    function answerDisplay(x, y, w, h) {
        if (typeof x !== "undefined")(this.x = x);
        if (typeof y !== "undefined")(this.y = y);
        if (typeof w !== "undefined")(this.width = w);
        if (typeof h !== "undefined")(this.height = h);

        let answerEditableDisplay = (x, y, w, h)=> {
            this.checkboxSize = h * 0.2;
            this.obj = {};
            let redCrossClickHandler = ()=> {
                this.redCrossManipulator.flush();
                let index = this.parentQuestion.tabAnswer.indexOf(this);
                drawing.mousedOverTarget = null;
                this.parentQuestion.tabAnswer.splice(index, 1);
                let questionCreator = this.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                if (this.parentQuestion.tabAnswer.length < 3) {
                    svg.event(this.parentQuestion.tabAnswer[this.parentQuestion.tabAnswer.length - 1].plus, 'dblclick', {});
                    if (index === 0) {
                        [this.parentQuestion.tabAnswer[0], this.parentQuestion.tabAnswer[1]] = [this.parentQuestion.tabAnswer[1], this.parentQuestion.tabAnswer[0]];
                    }
                }
                questionCreator.display();
                this.parentQuestion.checkValidity();
            };
            let mouseleaveHandler = ()=> {
                this.redCrossManipulator.flush();
            };
            let mouseoverHandler = ()=> {
                if (typeof this.redCrossManipulator === 'undefined') {
                    this.redCrossManipulator = new Manipulator(this);
                    this.redCrossManipulator.addOrdonator(2);
                    this.manipulator && this.manipulator.last.add(this.redCrossManipulator.first);
                }
                let redCrossSize = 15;
                let redCross = drawRedCross(this.width / 2 - redCrossSize, -this.height / 2 + redCrossSize, redCrossSize, this.redCrossManipulator);

                svg.addEvent(redCross, 'click', redCrossClickHandler);
                this.redCrossManipulator.ordonator.set(1, redCross);
            };

            let removeErrorMessage = () => {
                this.validLabelInput = true;
                this.errorMessage && this.editor.parent.questionCreator.manipulator.ordonator.unset(1);
                this.border.color(myColors.white, 1, myColors.black);
            };

            let displayErrorMessage = (contentarea) => {
                removeErrorMessage();
                this.border.color(myColors.white, 2, myColors.red);
                let /*libraryRatio = 0.2,*/
                    // previewButtonHeightRatio = 0.1,
                    // marginErrorMessagePreviewButton = 0.03,
                    quizzManager = this.parentQuestion.parentQuizz.parentFormation.quizzManager,
                    //position = 0.5*libraryRatio * drawing.width + (quizzManager.questCreaWidth/2),//-this.editor.parent.globalMargin.width)/2,
                    anchor = 'middle';
                this.errorMessage = new svg.Text(REGEX_ERROR);
                quizzManager.questionCreator.manipulator.ordonator.set(1, this.errorMessage);
                this.errorMessage.position(-(drawing.width - quizzManager.questionCreator.w) / 2, quizzManager.questionCreator.h / 2 - MARGIN / 2)
                    .font('Arial', 15).color(myColors.red).anchor(anchor);
                contentarea && contentarea.focus();
                this.validLabelInput = false;
            };

            let showTitle = ()=> {
                let text = (this.label) ? this.label : this.labelDefault,
                    color = (this.label) ? myColors.black : myColors.grey;

                if (this.image) {
                    this.imageLayer = 2;
                    let picture = new Picture(this.image.src, true, this, text);
                    picture.draw(0, 0, w, h, this.manipulator, w - 2 * this.checkboxSize);
                    this.border = picture.imageSVG.cadre;
                    this.obj.image = picture.imageSVG.image;
                    this.obj.content = picture.imageSVG.content;
                } else {
                    var tempObj = displayText(text, w, h, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, 0, 1, w - 2 * this.checkboxSize);
                    this.border = tempObj.cadre;
                    this.obj.content = tempObj.content;
                    this.obj.content.position(0, this.obj.content.y);
                }

                (this.validLabelInput && text !== "") ? (this.border.color(myColors.white, 1, myColors.black).fillOpacity(0.001)) : (this.border.color(myColors.white, 2, myColors.red).fillOpacity(0.001));
                (this.validLabelInput && text !== "") || displayErrorMessage();
                this.obj.content.color(color);
                this.border._acceptDrop = true;
                this.obj.content._acceptDrop = true;

                svg.addEvent(this.obj.content, 'dblclick', dblclickEditionAnswer);
                svg.addEvent(this.border, 'dblclick', dblclickEditionAnswer);
                svg.addEvent(this.border, 'mouseover', mouseoverHandler);
                svg.addEvent(this.border, 'mouseout', mouseleaveHandler);
            };

            let dblclickEditionAnswer = () => {
                let contentarea = {};
                contentarea.height = svg.runtime.boundingRect(this.obj.content.component).height;
                contentarea.globalPointCenter = this.obj.content.globalPoint(-(w) / 2, -(contentarea.height) / 2);
                let contentareaStyle = {
                    toppx: contentarea.globalPointCenter.y - (contentarea.height / 2) * 2 / 3,
                    leftpx: contentarea.globalPointCenter.x + (1 / 12) * this.border.width,
                    height: this.image ? contentarea.height : h * 0.5,
                    width: this.border.width * 5 / 6
                };
                drawing.notInTextArea = false;
                contentarea = new svg.TextArea(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height).color(null, 0, myColors.black).font("Arial", 20);
                (this.label === "" || this.label === this.labelDefault) && contentarea.placeHolder(this.labelDefault);
                contentarea.message(this.label || "");
                contentarea.width = w;
                contentarea.globalPointCenter = this.obj.content.globalPoint(-(contentarea.width) / 2, -(contentarea.height) / 2);
                drawings.screen.add(contentarea);
                contentarea.height = svg.runtime.boundingRect(this.obj.content.component).height;
                this.manipulator.ordonator.unset(1);
                contentarea.focus();

                let onblur = ()=> {
                    contentarea.enter();
                    this.label = contentarea.messageText;
                    drawings.screen.remove(contentarea);
                    drawing.notInTextArea = true;
                    showTitle();
                    let quizzManager = this.parentQuestion.parentQuizz.parentFormation.quizzManager;
                    quizzManager.displayQuestionsPuzzle(null, null, null, null, quizzManager.questionPuzzle.indexOfFirstVisibleElement);
                };
                svg.addEvent(contentarea, 'input', ()=> {
                    contentarea.enter();
                    this.checkInputContentArea({
                        contentarea: contentarea,
                        border: this.border,
                        onblur: onblur,
                        remove: removeErrorMessage,
                        display: () => {
                            displayErrorMessage(contentarea)
                        }
                    });
                });
                svg.addEvent(contentarea, 'blur', onblur);
                this.checkInputContentArea({
                    contentarea: contentarea,
                    border: this.border,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
            };
            this.manipulator.flush();
            this.manipulator.translator.move(x, y);
            showTitle();
            this.penHandler = () => {
                this.popIn = this.popIn || new PopIn(this, true);
                let questionCreator = this.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                this.popIn.display(questionCreator, 0, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                questionCreator.explanation = this.popIn;
            };
            displayPen(this.width / 2 - this.checkboxSize, this.height / 2 - this.checkboxSize, this.checkboxSize, this);

            if (typeof this.obj.checkbox === 'undefined') {
                this.obj.checkbox = displayCheckbox(-this.width / 2 + this.checkboxSize, this.height / 2 - this.checkboxSize, this.checkboxSize, this).checkbox;
                this.obj.checkbox.answerParent = this;
            }
            this.manipulator.ordonator.children.forEach((e) => {
                e._acceptDrop = true;
            });
        };

        if (this.editable) {
            answerEditableDisplay(this.x, this.y, this.width, this.height);
            return;
        }

        if (this.label && this.imageSrc) { // Reponse avec Texte ET image
            let obj = displayImageWithTitle(this.label, this.imageSrc, this.dimImage, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, this.image);
            this.bordure = obj.cadre;
            this.content = obj.text;
            this.image = obj.image;
        } else if (this.label && !this.imageSrc) { // Reponse avec Texte uniquement
            let obj = displayText(this.label, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator);
            this.bordure = obj.cadre;
            this.content = obj.content;

        } else if (this.imageSrc && !this.label) { // Reponse avec Image uniquement
            let obj = displayImageWithBorder(this.imageSrc, this.dimImage, this.width, this.height, this.manipulator);
            this.image = obj.image;
            this.bordure = obj.cadre;
        } else { // Cas pour test uniquement : si rien, n'affiche qu'une bordure
            this.bordure = new svg.Rect(this.width, this.height).color(this.bgColor, 1, myColors.black).corners(25, 25);
            this.manipulator.last.children.indexOf(this.bordure) === -1 && this.manipulator.last.add(this.bordure);
        }

        if (this.parentQuestion.parentQuizz.previewMode) {
            let event = () => {
                let popInParent = this.parentQuestion,
                    popInPreviousX = 0,
                    popInX = this.parentQuestion.parentQuizz.x,
                    popInY,
                    popInWidth = this.parentQuestion.width,
                    popInHeight = this.parentQuestion.tileHeightMax * this.parentQuestion.lines * 0.8;
                this.explanationPopIn = new PopIn(this, false);
                if (this.parentQuestion.image) {
                    popInY = (this.parentQuestion.tileHeightMax * this.parentQuestion.lines + (this.parentQuestion.lines - 1) * MARGIN) / 2 + this.parentQuestion.parentQuizz.questionHeightWithImage / 2 + MARGIN;
                } else {
                    popInY = (this.parentQuestion.tileHeightMax * this.parentQuestion.lines + (this.parentQuestion.lines - 1) * MARGIN) / 2 + this.parentQuestion.parentQuizz.questionHeightWithoutImage / 2 + MARGIN;
                }
                this.explanationPopIn.display(popInParent, popInPreviousX, popInX, popInY, popInWidth, popInHeight);
            };
            this.image && svg.addEvent(this.image, "click", event);
            this.bordure && svg.addEvent(this.bordure, "click", event);
            this.content && svg.addEvent(this.content, "click", event);
        }

        if (this.selected) { // image pré-selectionnée
            this.bordure.color(this.bgColor, 5, SELECTION_COLOR);
        }
        this.manipulator.translator.move(this.x, this.y);
    }

    function libraryDisplay(x, y, w, h, ratioPanelHeight, yPanel) {
        if (typeof x !== "undefined")(this.x = x);
        if (typeof y !== "undefined")(this.y = y);
        if (typeof w !== "undefined")(this.w = w);
        if (typeof h !== "undefined")(this.h = h);
        this.borderSize = 3;

        this.bordure = new svg.Rect(w - this.borderSize, h, this.libraryManipulator)
            .color(myColors.white, this.borderSize, myColors.black)
            .position(w / 2, h / 2);
        this.libraryManipulator.ordonator.set(0, this.bordure);
        const titleSvg = autoAdjustText(this.title, 0.9 * w, (0.08) * h, null, this.font, this.libraryManipulator);
        titleSvg.text.position(w / 2, (1 / 20) * h + titleSvg.finalHeight / 4);
        this.libraryManipulator.translator.move(this.x, this.y);

        this.panel = new gui.Panel(w - 4, ratioPanelHeight * h, myColors.white, 2).position(w / 2 + 0.5, yPanel);
        this.panel.border.color([], 3, [0, 0, 0]);
        this.libraryManipulator.ordonator.set(2, this.panel.component);
        this.panel.vHandle.handle.color(myColors.lightgrey, 2, myColors.grey);
        drawing.notInTextArea = true;
        svg.runtime.addGlobalEvent("keydown", (event) => {
            if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        });
        var hasKeyDownEvent = (event) => {
            this.target = this.panel;
            return this.target && this.target.processKeys && this.target.processKeys(event.keyCode);
        };
    }

    function gamesLibraryDisplay(x, y, w, h) {
        libraryDisplay.call(this, x + MARGIN, y, w, h, 8 / 10, h / 2);

        let displayArrowModeButton = () => {
            if (this.libraryManipulator.last.children.indexOf(this.arrowModeManipulator.first) !== -1) {
                this.libraryManipulator.last.remove(this.arrowModeManipulator.first);
            }
            this.libraryManipulator.last.children.indexOf(this.arrowModeManipulator.first) === -1 && this.libraryManipulator.last.add(this.arrowModeManipulator.first);
            this.arrowModeManipulator.first.move(w / 2, h - 0.05 * h);

            let isChildOf = function (parentGame, childGame) {
                parentGame.parentFormation.link.some((links) => links.parentGame === parentGame.id && links.childGame === childGame.id);
            };
            let createLink = function (parentGame, childGame) {
                if (isChildOf(parentGame, childGame)) return;
                if (parentGame.getPositionInFormation().levelIndex >= childGame.getPositionInFormation().levelIndex) return;
                parentGame.parentFormation.link.push({parentGame: parentGame.id, childGame: childGame.id});
                let arrow = new Arrow(parentGame, childGame);
                parentGame.parentFormation.arrowsManipulator.last.add(arrow.arrowPath);
            };

            let arrowModeButton = displayText('', w * 0.9, (6 / 100) * h, myColors.black, myColors.white, null, this.font, this.arrowModeManipulator);
            arrowModeButton.arrow = drawStraightArrow(-0.3 * w, 0, 0.3 * w, 0);
            arrowModeButton.arrow.color(myColors.black, 1, myColors.black);
            this.arrowModeManipulator.ordonator.set(2, arrowModeButton.arrow);

            this.toggleArrowMode = () => {
                this.arrowMode = !this.arrowMode;

                let panel = this.formation.panel,
                    graph = this.formation.graphManipulator.last,
                    clip = this.formation.clippingManipulator.last,
                    glass = new svg.Rect(panel.width, panel.height).opacity(0.001).color(myColors.white);

                if (this.arrowMode) {
                    this.gameSelected = null;
                    this.itemsTab.forEach(e => {
                        e.cadre.color(myColors.white, 1, myColors.black)
                    });

                    this.formation.selectedGame && this.formation.selectedGame.icon.cadre.component.listeners.click();

                    arrowModeButton.cadre.color(myColors.white, 3, SELECTION_COLOR);
                    arrowModeButton.arrow.color(myColors.blue, 2, myColors.black);

                    clip.add(glass);
                    glass.position(glass.width / 2, glass.height / 2);

                    let mouseDownAction = function (event) {
                        event.preventDefault();
                        let targetParent = graph.getTarget(event.pageX, event.pageY);

                        let mouseUpAction = function (event) {
                            let targetChild = graph.getTarget(event.pageX, event.pageY);
                            let booleanInstanceOfCorrect = function (e) {
                                return e && e.parent && e.parent.parentManip && e.parent.parentManip.parentObject &&
                                    (e.parent.parentManip.parentObject instanceof Quizz ||
                                    e.parent.parentManip.parentObject instanceof Bd);
                            };
                            if (booleanInstanceOfCorrect(targetParent) && booleanInstanceOfCorrect(targetChild)) {
                                createLink(targetParent.parent.parentManip.parentObject, targetChild.parent.parentManip.parentObject)
                            }
                        };
                        svg.addEvent(glass, 'mouseup', mouseUpAction);
                    };

                    let clickAction = function (event) {
                        let target = graph.getTarget(event.pageX, event.pageY);
                        (target instanceof svg.Path ) && target.component && target.component.listeners && target.component.listeners.click();
                    };

                    svg.addEvent(glass, 'mousedown', mouseDownAction);
                    svg.addEvent(glass, 'click', clickAction);
                } else {
                    arrowModeButton.cadre.color(myColors.white, 1, myColors.black);
                    arrowModeButton.arrow.color(myColors.black, 1, myColors.black);
                    clip.remove(clip.children[clip.children.length - 1]);
                }
            };
            svg.addEvent(arrowModeButton.cadre, 'click', this.toggleArrowMode);
            svg.addEvent(arrowModeButton.arrow, 'click', this.toggleArrowMode);
        };

        let displayItems = () => {
            let maxGamesPerLine = 1,
                libMargin = (w - (maxGamesPerLine * w)) / (maxGamesPerLine + 1) + 2 * MARGIN,
                tempY = (0.15 * h);

            this.itemsTab.forEach((item, i) => {
                this.panel.content.children.indexOf(this.libraryManipulators[i].first) === -1 && this.panel.content.add(this.libraryManipulators[i].first);

                if (i % maxGamesPerLine === 0 && i !== 0) {
                    tempY += this.h / 4 + libMargin;
                }

                let label = JSON.parse(JSON.stringify(myLibraryGames.tab[i].label)),
                    obj = displayTextWithCircle(label, Math.min(w / 2, h / 4), h, myColors.black, myColors.white, null, this.fontSize, this.libraryManipulators[i]);
                obj.cadre.mark("game" + label);
                obj.cadre.clicked = false;
                this.itemsTab[i] = obj;

                let X = x + libMargin - 2 * MARGIN + ((i % maxGamesPerLine + 1) * (libMargin + w / 2 - 2 * MARGIN));
                this.libraryManipulators[i].first.move(X, tempY);
            });
            this.panel.resizeContent(w, tempY += Math.min(w / 2, h / 4) - 1);
        };

        let assignEvents = () => {
            this.libraryManipulators.forEach(libraryManipulator => {
                let mouseDownAction = event => {
                    this.arrowMode && this.toggleArrowMode();

                    libraryManipulator.parentObject.formation && libraryManipulator.parentObject.formation.removeErrorMessage(libraryManipulator.parentObject.formation.errorMessageDisplayed);
                    let manip = new Manipulator(this);
                    manip.addOrdonator(2);
                    drawings.piste.last.add(manip.first);
                    this.formation && this.formation.removeErrorMessage(this.formation.errorMessageDisplayed);

                    let point = libraryManipulator.ordonator.children[0].globalPoint(libraryManipulator.ordonator.children[0].x, libraryManipulator.ordonator.children[0].y),
                        point2 = manip.first.globalPoint(0, 0);
                    manip.first.move(point.x - point2.x, point.y - point2.y);

                    if (this.itemsTab && this.itemsTab.length !== 0) {
                        if (this.itemsTab[0].content && (this.itemsTab[0].content.messageText !== "")) {
                            this.gameMiniature = displayTextWithCircle(libraryManipulator.ordonator.children[1].messageText, w / 2, h, myColors.black, myColors.white, null, this.fontSize, manip);
                            this.draggedObjectLabel = this.gameMiniature.content.messageText;
                            manip.ordonator.set(0, this.gameMiniature.cadre);
                            manageDnD(this.gameMiniature.cadre, manip);
                            manageDnD(this.gameMiniature.content, manip);
                        }

                        let mouseClick = event => {
                            let target = drawings.background.getTarget(event.pageX, event.pageY);
                            this.itemsTab.forEach(libraryManipulator => {
                                if (libraryManipulator.content.messageText === target.parent.children[1].messageText) {
                                    if (libraryManipulator !== this.gameSelected) {
                                        this.gameSelected && this.gameSelected.cadre.color(myColors.white, 1, myColors.black);
                                        libraryManipulator.cadre.color(myColors.white, 3, SELECTION_COLOR);
                                        this.gameSelected = libraryManipulator;
                                    } else {
                                        libraryManipulator.cadre.color(myColors.white, 1, myColors.black);
                                        this.gameSelected = null;
                                    }
                                }
                            });
                            this.formation && !this.gameSelected && svg.removeEvent(this.formation.graphBlock.rect, "mouseup", this.formation.mouseUpGraphBlock);
                            this.formation && this.formation.clickToAdd();
                        };

                        let mouseupHandler = event => {
                            var svgObj = manip.ordonator.children.shift();
                            manip.first.parent.remove(manip.first);
                            var target = drawings.background.getTarget(event.pageX, event.pageY);
                            if (target && target.parent && target.parent.parentManip) {
                                if (!(target.parent.parentManip.parentObject instanceof Library)) {
                                    this.dropAction(svgObj, event);
                                }
                                else {
                                    mouseClick(event);
                                }
                            }
                            this.draggedObjectLabel = "";
                        };

                        this.gameMiniature.cadre.component.listeners && svg.removeEvent(this.gameMiniature.cadre, 'mouseup', this.gameMiniature.cadre.component.listeners.mouseup);
                        this.gameMiniature.cadre.component.target && this.gameMiniature.cadre.component.target.listeners && this.gameMiniature.cadre.component.target.listeners.mouseup && svg.removeEvent(this.gameMiniature.cadre, 'mouseup', this.gameMiniature.cadre.component.target.listeners.mouseup);

                        svg.event(drawings.glass, "mousedown", event);
                        svg.addEvent(this.gameMiniature.cadre, 'mouseup', mouseupHandler);
                        this.gameMiniature.content.component.listeners && svg.removeEvent(this.gameMiniature.content, 'mouseup', this.gameMiniature.content.component.listeners.mouseup);
                        this.gameMiniature.content.component.target && this.gameMiniature.content.component.target.listeners && this.gameMiniature.content.component.target.listeners.mouseup && svg.removeEvent(this.gameMiniature.content, 'mouseup', this.gameMiniature.content.component.target.listeners.mouseup);
                        svg.addEvent(this.gameMiniature.content, 'mouseup', mouseupHandler);
                    }
                };
                svg.addEvent(libraryManipulator.ordonator.children[0], 'mousedown', mouseDownAction);
                svg.addEvent(libraryManipulator.ordonator.children[1], 'mousedown', mouseDownAction);
            });
        };

        displayItems();
        displayArrowModeButton();
        assignEvents();
    }

    function imagesLibraryDisplay(x, y, w, h, callback = ()=> {
    }) {
        if (typeof x !== "undefined")(this.x = x);
        if (typeof y !== "undefined")(this.y = y);
        if (typeof w !== "undefined")(this.w = w);
        if (typeof h !== "undefined")(this.h = h);

        let display = (x, y, w, h) => {
            libraryDisplay.call(this, x, y, w, h, 3 / 4, 0.45 * h);

            let assignEvents = () => {
                this.libraryManipulators.forEach(libraryManipulator => {
                    let mouseDownAction = event => {
                        this.arrowMode && this.toggleArrowMode();

                        libraryManipulator.parentObject.formation && libraryManipulator.parentObject.formation.removeErrorMessage(libraryManipulator.parentObject.formation.errorMessageDisplayed);
                        let manip = new Manipulator(this);
                        manip.addOrdonator(2);
                        drawings.piste.last.add(manip.first);
                        this.formation && this.formation.removeErrorMessage(this.formation.errorMessageDisplayed);

                        let point = libraryManipulator.ordonator.children[0].globalPoint(libraryManipulator.ordonator.children[0].x, libraryManipulator.ordonator.children[0].y),
                            point2 = manip.first.globalPoint(0, 0);
                        manip.first.move(point.x - point2.x, point.y - point2.y);

                        if (this.itemsTab && this.itemsTab.length !== 0) {

                            let elementCopy = libraryManipulator.ordonator.children[0],
                                img = displayImage(elementCopy.src, elementCopy.srcDimension, elementCopy.width, elementCopy.height, elementCopy.name).image;
                            img.srcDimension = elementCopy.srcDimension;
                            manip.ordonator.set(0, img);
                            manageDnD(img, manip);
                            img.component.listeners && svg.removeEvent(img, 'mouseup');
                            img.component.target && img.component.target.listeners && img.component.target.listeners.mouseup && svg.removeEvent(img.image, 'mouseup');

                            let mouseupHandler = event => {
                                let svgObj = manip.ordonator.children.shift();
                                manip.first.parent.remove(manip.first);
                                let target = drawings.background.getTarget(event.pageX, event.pageY);
                                if (target && target.parent && target.parent.parentManip) {
                                    if (!(target.parent.parentManip.parentObject instanceof Library)) {
                                        this.dropAction(svgObj, event);
                                    }
                                }
                                this.draggedObjectLabel = "";
                            };

                            svg.event(drawings.glass, "mousedown", event);
                            svg.addEvent(img, 'mouseup', mouseupHandler);
                        }
                    };
                    svg.addEvent(libraryManipulator.ordonator.children[0], 'mousedown', mouseDownAction);
                    svg.addEvent(libraryManipulator.ordonator.children[1], 'mousedown', mouseDownAction);
                });
            };

            let displayItems = () => {
                let maxImagesPerLine = Math.floor((w - MARGIN) / (this.imageWidth + MARGIN)) || 1, //||1 pour le cas de resize très petit
                    libMargin = (w - (maxImagesPerLine * this.imageWidth)) / (maxImagesPerLine + 1),
                    tempY = (0.075 * h);

                const displayImages = () => {
                    this.itemsTab.forEach((item, i) => {
                        if (i % maxImagesPerLine === 0 && i !== 0) {
                            tempY += this.imageHeight + libMargin;
                        }

                        this.panel.content.children.indexOf(this.libraryManipulators[i].first) === -1 && this.panel.content.add(this.libraryManipulators[i].first);
                        let image = displayImage(item.imgSrc, item, this.imageWidth, this.imageHeight, this.libraryManipulators[i]).image;
                        image.name = item.name;
                        image.srcDimension = {width: item.width, height: item.height};
                        this.libraryManipulators[i].ordonator.set(0, image);

                        let X = x + libMargin + ((i % maxImagesPerLine) * (libMargin + this.imageWidth));
                        this.libraryManipulators[i].first.move(X, tempY);

                    });
                    this.panel.resizeContent(w, tempY += this.imageHeight);
                    assignEvents();
                };

                //this.itemsTab.length === 0) {
                Server.getImages().then(data => {
                    let myLibraryImage = JSON.parse(data).images;
                    myLibraryImage.forEach((url, i) => {
                        this.libraryManipulators[i] || (this.libraryManipulators[i] = new Manipulator(this));
                        this.libraryManipulators[i].ordonator || (this.libraryManipulators[i].addOrdonator(2));
                        this.itemsTab[i] = imageController.getImage(url.imgSrc, function () {
                            this.imageLoaded = true; //this != library
                        });
                        this.itemsTab[i].name = url.name;
                        this.itemsTab[i].imgSrc = url.imgSrc;
                    });
                })
                    .then(() => {
                        let intervalToken = runtime.interval(() => {
                            if (this.itemsTab.every(e => e.imageLoaded)) {
                                runtime.clearInterval(intervalToken);
                                displayImages();
                            }
                        }, 100);
                    });
            };

            let displaySaveButton = () => {

                let fileExplorerHandler = () => {
                    if (!this.fileExplorer) {
                        let globalPointCenter = this.bordure.globalPoint(0, 0);
                        var fileExplorerStyle = {
                            leftpx: globalPointCenter.x,
                            toppx: globalPointCenter.y,
                            width: this.w / 5,
                            height: this.w / 5
                        };
                        this.fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
                        this.fileExplorer.type("file");
                        svg.addEvent(this.fileExplorer, "change", onChangeFileExplorerHandler);
                        svg.runtime.attr(this.fileExplorer.component, "accept", "image/*");
                        svg.runtime.attr(this.fileExplorer.component, "id", "fileExplorer");
                        svg.runtime.attr(this.fileExplorer.component, "hidden", "true");
                        drawings.screen.add(this.fileExplorer);
                    }
                    svg.runtime.anchor("fileExplorer").click();
                };

                let onChangeFileExplorerHandler = () => {

                    //let src = this.fileExplorer.component.files[0].name;
                    let pictureObject = this.fileExplorer.component.files[0];
                    Server.insertPicture(pictureObject).then((status)=> {
                        if (status === 'ok') {
                            this.display();
                        } else {
                            // TODO message d'erreur
                        }
                    });
                };

                let addButton = new svg.Rect(this.w / 6, this.w / 6).color(myColors.white, 2, myColors.black),
                    addButtonLabel = "Ajouter une image",
                    addButtonText = autoAdjustText(addButtonLabel, 2 * this.w / 3, this.h / 15, 20, "Arial", this.addButtonManipulator),
                    plus = drawPlus(0, 0, this.w / 7, this.w / 7);
                addButtonText.text.position(0, this.h / 12 - (this.h / 15) / 2 + 3 / 2 * MARGIN);
                addButton.corners(10, 10);

                this.addButtonManipulator.ordonator.set(0, addButton);
                this.addButtonManipulator.ordonator.set(2, plus);
                this.libraryManipulator.last.children.indexOf(this.addButtonManipulator) === -1 && this.libraryManipulator.last.add(this.addButtonManipulator.first);
                this.addButtonManipulator.translator.move(this.w / 2, 9 * this.h / 10);
                svg.addEvent(this.addButtonManipulator.ordonator.children[0], 'click', fileExplorerHandler);
                svg.addEvent(this.addButtonManipulator.ordonator.children[1], 'click', fileExplorerHandler);
                svg.addEvent(this.addButtonManipulator.ordonator.children[2], 'click', fileExplorerHandler);

            };

            displayItems();

            displaySaveButton();
        };

        display(this.x, this.y, this.w, this.h);
        callback();

        // let intervalToken = runtime.interval(() => {
        //     if (this.itemsTab.every(e => e.imageLoaded)) {
        //         runtime.clearInterval(intervalToken);
        //         display(x, y, w, h);
        //         callback();
        //     }
        // }, 100);
        // runtime && this.itemsTab.forEach(e => {
        //     imageController.imageLoaded(e.id, myImagesSourceDimensions[e.src].width, myImagesSourceDimensions[e.src].height);
        // });
        // if (runtime) {
        //     display(x, y, w, h);
        //     callback();
        // }

    }

    function addEmptyElementDisplay(x, y, w, h) {
        if (typeof x !== 'undefined') {
            this.x = x;
        }
        if (typeof y !== 'undefined') {
            this.y = y;
        }
        if (typeof w !== 'undefined') {
            w && (this.width = w);
        }
        if (typeof h !== 'undefined') {
            h && (this.height = h);
        }

        this.obj = displayText(this.label, this.width, this.height, myColors.black, myColors.white, this.fontSize, null, this.manipulator);
        this.plus = drawPlus(0, 0, this.height * 0.3, this.height * 0.3);
        this.manipulator.translator.move(x, y);
        this.manipulator.ordonator.set(2, this.plus);
        this.obj.content.position(0, this.height * 0.35);
        this.obj.cadre.color(myColors.white, 3, myColors.black);
        this.obj.cadre.component.setAttribute && this.obj.cadre.component.setAttribute('stroke-dasharray', '10, 5');
        this.obj.cadre.component.target && this.obj.cadre.component.target.setAttribute('stroke-dasharray', '10, 5');

        var dblclickAdd = ()=> {
            this.manipulator.flush();
            switch (this.type) {
                case 'answer':
                    let newAnswer = new Answer(null, this.parent.linkedQuestion);
                    newAnswer.isEditable(this, true);
                    let questionCreator = this.parent;
                    questionCreator.linkedQuestion.tabAnswer.pop();
                    questionCreator.linkedQuestion.tabAnswer.push(newAnswer);

                    if (questionCreator.linkedQuestion.tabAnswer.length < questionCreator.MAX_ANSWERS) {
                        questionCreator.linkedQuestion.tabAnswer.push(new AddEmptyElement(questionCreator, this.type));
                    }
                    questionCreator.puzzle.updateElementsArray(questionCreator.linkedQuestion.tabAnswer);
                    questionCreator.puzzle && questionCreator.puzzle.fillVisibleElementsArray("leftToRight");
                    questionCreator.manipulator.last.children.indexOf(questionCreator.puzzle.manipulator.first) === -1 && questionCreator.manipulator.last.add(questionCreator.puzzle.manipulator.first);
                    questionCreator.puzzle.display(questionCreator.coordinatesAnswers.x,
                        questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w,
                        questionCreator.coordinatesAnswers.h, false);
                    questionCreator.linkedQuestion.checkValidity();

                    break;
                case 'question':
                    let quizzManager = this.parent;
                    quizzManager.quizz.tabQuestions.pop();
                    (quizzManager.quizz.tabQuestions.length > 0) && (quizzManager.quizz.tabQuestions[quizzManager.indexOfEditedQuestion].selected = false);
                    quizzManager.indexOfEditedQuestion = quizzManager.quizz.tabQuestions.length;
                    quizzManager.quizz.tabQuestions.forEach(question=> {
                        question.redCrossManipulator && question.redCrossManipulator.flush();
                        question.selected = false
                    });
                    let newQuestion = new Question(null, quizzManager.quizz);

                    newQuestion.selected = true;
                    quizzManager.quizz.tabQuestions.push(newQuestion);
                    let AddNewEmptyQuestion = new AddEmptyElement(quizzManager, 'question');
                    quizzManager.quizz.tabQuestions.push(AddNewEmptyQuestion);
                    quizzManager.questionPuzzle.visibleElementsArray[0].length === 6 && quizzManager.questionPuzzle.updateStartPosition('right');

                    if (quizzManager.questionPuzzle.elementsArray.length > quizzManager.questionPuzzle.columns) {
                        quizzManager.displayQuestionsPuzzle(quizzManager.questionPuzzleCoordinates.x,
                            quizzManager.questionPuzzleCoordinates.y,
                            quizzManager.questionPuzzleCoordinates.w,
                            quizzManager.questionPuzzleCoordinates.h,
                            quizzManager.questionPuzzle.indexOfFirstVisibleElement + 1);
                    } else {
                        quizzManager.displayQuestionsPuzzle(quizzManager.questionPuzzleCoordinates.x,
                            quizzManager.questionPuzzleCoordinates.y,
                            quizzManager.questionPuzzleCoordinates.w,
                            quizzManager.questionPuzzleCoordinates.h,
                            quizzManager.questionPuzzle.indexOfFirstVisibleElement);
                    }

                    quizzManager.questionCreator.loadQuestion(newQuestion);
                    quizzManager.questionCreator.display(quizzManager.questionCreator.previousX,
                        quizzManager.questionCreator.previousY,
                        quizzManager.questionCreator.previousW,
                        quizzManager.questionCreator.previousH);
            }
        };
        svg.addEvent(this.plus, "dblclick", dblclickAdd);
        svg.addEvent(this.obj.content, "dblclick", dblclickAdd);
        svg.addEvent(this.obj.cadre, "dblclick", dblclickAdd);
    }

    function formationDisplayFormation() {
        drawing.currentPageDisplayed = "Formation";
        header.display(this.label);
        this.formationsManager.formationDisplayed = this;
        this.globalMargin = {
            height: this.marginRatio * drawing.height,
            width: this.marginRatio * drawing.width
        };

        this.borderSize = 3;
        this.manipulator.first.move(0, drawing.height * 0.075);
        mainManipulator.ordonator.set(1, this.manipulator.first);
        this.manipulator.last.children.indexOf(this.returnButtonManipulator.first) === -1 && this.manipulator.last.add(this.returnButtonManipulator.first);

    let returnHandler = (event) => {
        let target = drawings.background.getTarget(event.pageX,event.pageY);
        target.parentObj.parent.manipulator.flush();
        Server.getAllFormations().then(data => {
            let myFormations = JSON.parse(data).myCollection;
            formationsManager = new FormationsManager(myFormations);
            formationsManager.display();
        });
    };
    this.manipulator.last.children.indexOf(this.returnButtonManipulator.first) === -1 && this.manipulator.last.add(this.returnButtonManipulator.first);
    this.returnButton.display(0, -MARGIN/2, 20, 20);
    this.returnButton.height = svg.runtime.boundingRect(this.returnButton.returnButton.component).height;
    this.returnButton.setHandler(returnHandler);

        let dblclickQuizzHandler = (event) => {
            let targetQuizz = drawings.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
            let displayQuizzManager = ()=> {
                this.quizzManager.loadQuizz(targetQuizz);
                this.quizzDisplayed = targetQuizz;
                this.quizzManager.display();
                this.selectedArrow = null;
                this.selectedGame = null;
            };
            this.saveFormation(displayQuizzManager);
            if (!runtime && window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (!runtime && document.selection) {
                document.selection.empty();
            }
        };

        let clickQuizHandler = (event) => {
            let targetQuizz = drawings.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
            mainManipulator.ordonator.unset(1, this.manipulator.first);
            drawing.currentPageDisplayed = "QuizPreview";
            this.quizzDisplayed = new Quizz(targetQuizz);
            this.quizzDisplayed.puzzleLines = 3;
            this.quizzDisplayed.puzzleRows = 3;
            this.quizzDisplayed.run(0, 0, drawing.width, drawing.height);
            if (!runtime && window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (!runtime && document.selection) {
                document.selection.empty();
            }
        };

        let resizePanel = () => {
            var height = (this.levelHeight * (this.levelsTab.length + 1) > this.graphH) ? (this.levelHeight * (this.levelsTab.length + 1)) : this.graphH;
            let spaceOccupiedByAGame = (this.graphElementSize + this.minimalMarginBetweenGraphElements);
            let longestLevel = this.findLongestLevel()[0];
            let trueWidth = longestLevel && longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame;
            let widthMAX = Math.max(this.panel.width, trueWidth);
            this.panel.resizeContent(widthMAX - 1, height - MARGIN);
        };

        this.movePanelContent = () => {
            let spaceOccupiedByAGame = (this.graphElementSize + this.minimalMarginBetweenGraphElements);
            let longestLevel = this.findLongestLevel()[0];
            let trueWidth = longestLevel ? longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame : 0;
            let widthMAX = Math.max(this.panel.width, trueWidth);
            this.miniaturesManipulator.first.move((widthMAX - this.panel.width) / 2, 0);
        };

        let displayLevel = (w, h, level) => {
            if (this.levelsTab.length >= this.graphManipulator.ordonator.children.length - 1) {
                this.graphManipulator.ordonator.order(this.graphManipulator.ordonator.children.length + 1);
            }
            this.panel.contentV.add(level.manipulator.first);
            var lineColor = playerMode ? myColors.grey : myColors.black;
            var levelText = playerMode ? "" : "Niveau " + level.index;
            level.obj = autoAdjustText(levelText, w - 3 * this.borderSize, this.levelHeight, 20, "Arial", level.manipulator);
            level.obj.line = new svg.Line(MARGIN, this.levelHeight, level.parentFormation.levelWidth, this.levelHeight).color(lineColor, 3, lineColor);
            level.obj.line.component.setAttribute && level.obj.line.component.setAttribute('stroke-dasharray', '6');
            level.obj.line.component.target && level.obj.line.component.target.setAttribute && level.obj.line.component.target.setAttribute('stroke-dasharray', '6');

            level.manipulator.ordonator.set(2, level.obj.line);
            level.obj.text.position(svg.runtime.boundingRect(level.obj.text.component).width, svg.runtime.boundingRect(level.obj.text.component).height);
            level.obj.text._acceptDrop = true;
            level.w = w;
            level.h = h;
            level.y = (level.index - 1) * level.parentFormation.levelHeight;
            level.manipulator.first.move(0, level.y);
        };

        let displayFrame = (w, h) => {
            let hasKeyDownEvent = (event) => {
                this.target = this.panel;
                if (event.keyCode === 46) { // suppr
                    this.selectedArrow && this.selectedArrow.redCrossClickHandler();
                    this.selectedGame && this.selectedGame.redCrossClickHandler();
                } else if (event.keyCode === 27 && this.library && this.library.arrowMode) { // échap
                    this.library.toggleArrowMode();
                } else if (event.keyCode === 27 && this.library && this.library.gameSelected) {
                    this.library.gameSelected.cadre.color(myColors.white, 1, myColors.black);
                    this.library.gameSelected = null;
                }
                return this.target && this.target.processKeys && this.target.processKeys(event.keyCode);
            };
            drawing.notInTextArea = true;
            svg.runtime.addGlobalEvent("keydown", (event) => {
                if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                    event.preventDefault();
                }
            });
            this.manipulator.ordonator.set(1, this.clippingManipulator.first);
            //!playerMode && this.clippingManipulator.translator.move(this.libraryWidth, drawing.height*HEADER_SIZE);
            playerMode ? this.clippingManipulator.translator.move(MARGIN, drawing.height * HEADER_SIZE)
                : this.clippingManipulator.translator.move(this.libraryWidth, drawing.height * HEADER_SIZE);
            this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio - drawing.height * 0.1;//-15-this.saveButtonHeight;//15: Height Message Error

            if (typeof this.panel !== "undefined") {
                this.clippingManipulator.last.remove(this.panel.component);
            }
            this.panel = new gui.ScrollablePanel(w, h, myColors.white);
            this.panel.contentV.add(this.messageDragDropManipulator.first);
            this.panel.component.move(w / 2, h / 2);
            this.clippingManipulator.last.add(this.panel.component);
            this.panel.contentH.add(this.graphManipulator.first);
            this.panel.hHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
            this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);

            resizePanel();
            this.movePanelContent();
        };

        let updateAllLinks = () => {
            this.arrowsManipulator.flush();
            var childElement, parentElement;
            this.link.forEach((links)=> {
                this.levelsTab.forEach((level)=> {
                    level.gamesTab.forEach((game)=> {
                        game.id === links.childGame && (childElement = game);
                        game.id === links.parentGame && (parentElement = game);
                    })
                });
                let arrow = new Arrow(parentElement, childElement);
                parentElement.parentFormation.arrowsManipulator.last.add(arrow.arrowPath);
            });
        };

        let displayMessageDragAndDrop = () => {
            this.messageDragDropMargin = this.graphCreaHeight / 8 - this.borderSize;
            this.messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", this.graphW, this.graphH, 20, null, this.messageDragDropManipulator).text;
            this.messageDragDrop._acceptDrop = true;
            this.messageDragDrop.x = this.panel.width / 2;
            this.messageDragDrop.y = this.messageDragDropMargin + (this.levelsTab.length) * this.levelHeight;
            this.messageDragDrop.position(this.messageDragDrop.x, this.messageDragDrop.y).color(myColors.grey);//.fontStyle("italic");
            this.panel.back._acceptDrop = true;
        };

        this.displayGraph = (w, h) => {
            this.movePanelContent();
            resizePanel();
            if (typeof w !== "undefined") this.graphW = w;
            if (typeof h !== "undefined") this.graphH = h;
            this.messageDragDropMargin = this.graphCreaHeight / 8 - this.borderSize;
            if (this.levelWidth < this.graphCreaWidth) {
                this.levelWidth = this.graphCreaWidth;
            }

            let manageMiniature = (tabElement) => {
                (this.miniaturesManipulator.last.children.indexOf(tabElement.miniatureManipulator.first) === -1) && this.miniaturesManipulator.last.add(tabElement.miniatureManipulator.first);// mettre un manipulateur par niveau !_! attention à bien les enlever
                tabElement.miniatureManipulator.first.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
                if (tabElement instanceof Quizz) {
                    let eventToUse = playerMode ? ["click", clickQuizHandler] : ["dblclick", dblclickQuizzHandler];
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.cadre, ...eventToUse);
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.content, ...eventToUse);
                } else if (tabElement instanceof Bd) {
                    let eventToUse = playerMode ? ["click", clickBdHandler] : ["dblclick", dblclickQuizzHandler];
                    let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
                    var clickBdHandler = (event)=> {
                        let targetBd = drawings.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
                        bdDisplay(targetBd);
                    };
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.cadre, ...eventToUse);
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.content, ...eventToUse);
                    // Ouvrir le Bd creator du futur jeu Bd
                }
            };

            for (let i = 0; i < this.levelsTab.length; i++) {
                displayLevel(this.graphCreaWidth, this.graphCreaHeight, this.levelsTab[i]);
                this.adjustGamesPositions(this.levelsTab[i]);
                this.levelsTab[i].gamesTab.forEach((tabElement)=> {
                    tabElement.miniatureManipulator.ordonator || tabElement.miniatureManipulator.addOrdonator(3);
                    (this.miniaturesManipulator.last.children.indexOf(tabElement.miniatureManipulator.first) === -1) && this.miniaturesManipulator.last.add(tabElement.miniatureManipulator.first);// mettre un manipulateur par niveau !_! attention à bien les enlever
                    if (typeof tabElement.miniature === "undefined") {
                        (tabElement.miniature = tabElement.displayMiniature(this.graphElementSize));
                    }
                    manageMiniature(tabElement);

                });
            }
            !playerMode && displayMessageDragAndDrop();
            this.graphManipulator.translator.move(this.graphW / 2, this.graphH / 2);
            resizePanel();
            this.panel.back.parent.parentManip = this.graphManipulator;
            updateAllLinks();
        };

        if (playerMode) {
            this.graphCreaHeightRatio = 0.97;
            this.graphCreaHeight = (drawing.height - header.height - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
            this.graphCreaWidth = drawing.width - 2 * MARGIN;
            displayFrame(this.graphCreaWidth, this.graphCreaHeight);
            this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
            this.clippingManipulator.translator.move((drawing.width - this.graphCreaWidth) / 2, this.formationsManager.y / 2 - this.borderSize);
        } else {
            this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;

            this.graphCreaHeight = (drawing.height - header.height - 40 - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;

            this.gamesLibraryManipulator = this.library.libraryManipulator;
            this.manipulator.ordonator.set(2, this.gamesLibraryManipulator.first);
            this.manipulator.ordonator.set(4, this.formationInfoManipulator.first);

            this.libraryWidth = drawing.width * this.libraryWidthRatio;

            this.y = drawing.height * HEADER_SIZE;

            this.title = new svg.Text("Formation : ").position(MARGIN, this.returnButton.height).font("Arial", 20).anchor("start");
            this.manipulator.ordonator.set(0, this.title);
            this.formationWidth = svg.runtime.boundingRect(this.title.component).width;

            let dblclickEditionFormationLabel = () => {
                let bounds = svg.runtime.boundingRect(this.formationLabel.cadre.component);
                this.formationInfoManipulator.ordonator.unset(1);
                let globalPointCenter = this.formationLabel.cadre.globalPoint(-(bounds.width) / 2, -(bounds.height) / 2);
                var contentareaStyle = {
                    toppx: globalPointCenter.y + 4,
                    leftpx: globalPointCenter.x + 4,
                    width: this.formationLabel.cadre.width - MARGIN,
                    height: (this.labelHeight)
                };
                drawing.notInTextArea = false;

                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
                contentarea.color(myColors.lightgrey, 0, myColors.black)
                    .font("Arial", 15)
                    .anchor("start");
                (this.label === "" || this.label === this.labelDefault) ? contentarea.placeHolder(this.labelDefault) : contentarea.message(this.label);
                drawings.screen.add(contentarea);
                contentarea.focus();

                var removeErrorMessage = ()=> {
                    //this.formationNameValidInput = true;
                    this.errorMessage && this.formationInfoManipulator.ordonator.unset(2);
                    this.formationLabel.cadre.color(myColors.lightgrey, 1, myColors.none);
                };

                var displayErrorMessage = ()=> {
                    removeErrorMessage();
                    this.formationLabel.cadre.color(myColors.lightgrey, 2, myColors.red);
                    var anchor = 'start';
                    this.errorMessage = new svg.Text(REGEX_ERROR_FORMATION)
                        .position(this.formationLabel.cadre.width + this.formationWidth + 2 * MARGIN, 0)
                        .font("Arial", 15).color(myColors.red).anchor(anchor);
                    this.formationInfoManipulator.ordonator.set(2, this.errorMessage);
                    contentarea.focus();
                    this.validLabelInput = false;
                };
                var onblur = ()=> {
                    contentarea.enter();
                    this.label = contentarea.messageText.trim();
                    drawings.screen.remove(contentarea);
                    drawing.notInTextArea = true;
                    showTitle();
                    this.validLabelInput && header.display(this.label);
                };
                svg.addEvent(contentarea, "blur", onblur);
                var oninput = ()=> {
                    contentarea.enter();
                    this.checkInputTextArea({
                        textarea: contentarea,
                        border: this.formationLabel.cadre,
                        onblur: onblur,
                        remove: removeErrorMessage,
                        display: displayErrorMessage
                    });
                    showTitle();
                };
                svg.addEvent(contentarea, "input", oninput);
                this.checkInputTextArea({
                    textarea: contentarea,
                    border: this.formationLabel.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
            };

            let showTitle = () => {
                let text = this.label ? this.label : this.labelDefault;
                let color = this.label ? myColors.black : myColors.grey;
                let bgcolor = myColors.lightgrey;
                this.formationLabelWidth = 400;
                this.formationLabel = {};
                this.formationLabel.content = autoAdjustText(text, this.formationLabelWidth, 20, 15, "Arial", this.formationInfoManipulator).text;
                this.labelHeight = svg.runtime.boundingRect(this.formationLabel.content.component).height;

                this.formationTitleWidth = svg.runtime.boundingRect(this.title.component).width;
                this.formationLabel.cadre = new svg.Rect(this.formationLabelWidth, this.labelHeight + MARGIN);
                this.validLabelInput ? this.formationLabel.cadre.color(bgcolor) : this.formationLabel.cadre.color(bgcolor, 2, myColors.red);
                this.formationLabel.cadre.position(this.formationTitleWidth + this.formationLabelWidth / 2 + 3 / 2 * MARGIN, -MARGIN / 2);

            this.formationInfoManipulator.ordonator.set(0, this.formationLabel.cadre);
            this.formationLabel.content.position(this.formationTitleWidth + 2 * MARGIN, 0).color(color).anchor("start");
            this.formationInfoManipulator.translator.move(0, this.returnButton.height);
            svg.addEvent(this.formationLabel.content, "dblclick", dblclickEditionFormationLabel);
            svg.addEvent(this.formationLabel.cadre, "dblclick", dblclickEditionFormationLabel);
        };
        showTitle();
        this.library.display(0, drawing.height*HEADER_SIZE, this.libraryWidth-MARGIN, this.graphCreaHeight);

        if(this.status !== "NotPublished") {
            this.displayFormationSaveButton(drawing.width/2 - 2*this.buttonWidth, drawing.height*0.87 ,this.buttonWidth, this.saveButtonHeight);
            this.displayFormationPublicationButton(drawing.width/2 + 2*this.buttonWidth, drawing.height* 0.87 ,this.buttonWidth, this.publicationButtonHeight);
            this.displayFormationDeactivationButton(drawing.width/2, drawing.height*0.87, this.buttonWidth, this.saveButtonHeight);
        } else {
            this.displayFormationSaveButton(drawing.width/2 - this.buttonWidth, drawing.height*0.87 ,this.buttonWidth, this.saveButtonHeight);
            this.displayFormationPublicationButton(drawing.width/2 + this.buttonWidth , drawing.height* 0.87 ,this.buttonWidth, this.publicationButtonHeight);
        }
        displayFrame(this.graphCreaWidth, this.graphCreaHeight);
        this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
    }

        ////15: Height Message Error
    }

    function playerModeDisplayFormation() {
        this.trackProgress(formationDisplayFormation)
    }

    function formationRemoveErrorMessage(message) {
        message && message.parent && message.parent.remove(message);
    }

    function formationDisplaySaveButton(x, y, w, h) {
        this.saveFormationButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveFormationButtonManipulator);
        this.errorMessageSave && this.errorMessageSave.parent && this.saveFormationButtonManipulator.last.remove(this.errorMessageSave);
        this.saveFormationButton.cadre.mark("saveFormationButtonCadre");
        svg.addEvent(this.saveFormationButton.cadre, "click", () => this.saveFormation());
        svg.addEvent(this.saveFormationButton.content, "click", () => this.saveFormation());
        this.saveFormationButtonManipulator.translator.move(x, y);
    }

function formationDisplayDeactivateButton(x, y, w, h) {
    this.deactivateFormationButton = displayText("Désactiver", w, h, myColors.black, myColors.white, 20, null, this.deactivateFormationButtonManipulator);
    svg.addEvent(this.deactivateFormationButton.cadre, "click", () => this.deactivateFormation());
    svg.addEvent(this.deactivateFormationButton.content, "click", () => this.deactivateFormation());
    this.deactivateFormationButtonManipulator.translator.move(x, y);
}

function formationDisplayPublicationButton(x, y, w, h) {
    let label = this.status === "NotPublished" ? "Publier" : "Publier une nouvelle version";
    this.publicationFormationButton = displayText(label, w, h, myColors.black, myColors.white, 20, null, this.publicationFormationButtonManipulator);
    this.errorMessagePublication && this.errorMessagePublication.parent && this.publicationFormationButtonManipulator.last.remove(this.errorMessagePublication);
    this.publicationFormationQuizzManager = () => {
        let message = [];
        let arrayOfUncorrectQuestions = [];
        let allQuizzValid = true;
        this.levelsTab.forEach(level => {
            level.gamesTab.forEach(game => {
                let checkQuizz = new Quizz(game, false, this);
                checkQuizz.isValid = true;
                checkQuizz.tabQuestions.forEach(question => {
                    if (!(question instanceof AddEmptyElement)) {
                        question.questionType && question.questionType.validationTab.forEach(funcEl => {
                            var result = funcEl && funcEl(question);
                            if (result && (!result.isValid)) {
                                message.push ("Un ou plusieurs jeu(x) ne sont pas complet(s)");
                                arrayOfUncorrectQuestions.push(question.questionNum - 1);
                            }
                            result && (checkQuizz.isValid = checkQuizz.isValid && result.isValid);
                        });
                    }
                    allQuizzValid = allQuizzValid && checkQuizz.isValid;
                });
                checkQuizz.isValid || game.miniature.icon.cadre.color(myColors.white,3,myColors.red);
            });
        });
        if(!allQuizzValid) {
            this.displayPublicationMessage(message[0]);
        } else {
            this.saveFormation(null, "Published");
        }
    };
    this.publicationFormationButton.cadre.mark("publicationFormationButtonCadre");
    svg.addEvent(this.publicationFormationButton.cadre, "click", () => this.publicationFormation());
    svg.addEvent(this.publicationFormationButton.content, "click", () => this.publicationFormation());
    this.publicationFormationButtonManipulator.translator.move(x, y);
}

    function formationsManagerDisplay() {
        drawing.currentPageDisplayed = 'FormationsManager';
        this.manipulator.first.move(0, drawing.height * HEADER_SIZE);
        mainManipulator.ordonator.set(1, this.manipulator.first);
        this.manipulator.last.children.indexOf(this.headerManipulator.first) === -1 && this.manipulator.last.add(this.headerManipulator.first);

        if (playerMode) {
            this.headerManipulator.last.add(this.toggleFormationsManipulator.first);
            let manip = this.toggleFormationsManipulator,
                pos = -MARGIN,
                toggleFormationsText = displayText('Formations en cours', drawing.width * 0.2, 25, myColors.none, myColors.none, 20, null, manip, 0, 1),
                textWidth = svg.runtime.boundingRect(toggleFormationsText.content.component).width;
            this.toggleFormationsCheck = new svg.Rect(20, 20).color(myColors.white, 2, myColors.black);
            pos -= textWidth / 2;
            toggleFormationsText.content.position(pos, 6);
            toggleFormationsText.cadre.position(pos, 0);
            pos -= textWidth / 2 + 2 * MARGIN;
            this.toggleFormationsCheck.position(pos, 0);
            manip.ordonator.set(2, this.toggleFormationsCheck);
            manip.translator.move(drawing.width, 10 + MARGIN);

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
            svg.addEvent(this.toggleFormationsCheck, 'click', toggleFormations);
            svg.addEvent(toggleFormationsText.content, 'click', toggleFormations);
            svg.addEvent(toggleFormationsText.cadre, 'click', toggleFormations);
        } else {
            this.headerManipulator.last.children.indexOf(this.addButtonManipulator) === -1 && this.headerManipulator.last.add(this.addButtonManipulator.first);
            this.addButtonManipulator.translator.move(this.plusDim / 2, this.addButtonHeight);
            this.headerManipulator.last.add(this.checkManipulator.first);
            this.headerManipulator.last.add(this.exclamationManipulator.first);
        }

        let displayPanel = () => {
            this.heightAllocatedToPanel = drawing.height - (playerMode ?
                this.toggleFormationsCheck.globalPoint(0, 0).y + this.toggleFormationsCheck.height + MARGIN :
                this.addFormationButton.cadre.globalPoint(0, 0).y + this.addFormationButton.cadre.height);
            //this.headerHeightFormation = drawing.height * header.size ;
            this.spaceBetweenElements = {
                width: this.panel ? 0.015 * this.panel.width : 0.015 * drawing.width,
                height: this.panel ? 0.030 * this.panel.height : 0.030 * drawing.height
            };
            this.y = (!playerMode) ? this.addButtonHeight * 1.5 : this.toggleFormationsCheck.height * 2;//drawing.height * this.header.size;

            this.rows = Math.floor((drawing.width - 2 * MARGIN) / (this.tileWidth + this.spaceBetweenElements.width));
            if (this.rows === 0) this.rows = 1;

            drawing.notInTextArea = true;
            svg.runtime.addGlobalEvent("keydown", (event) => {
                if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                    event.preventDefault();
                }
            });

            var hasKeyDownEvent = (event) => {
                this.target = this.panel;
                return this.target && this.target.processKeys && this.target.processKeys(event.keyCode);
            };

            this.manipulator.last.children.indexOf(this.clippingManipulator.first) === -1 && this.manipulator.last.add(this.clippingManipulator.first);
            this.clippingManipulator.translator.move(MARGIN / 2, this.y);
            var formationPerLine = Math.floor((drawing.width - 2 * MARGIN) / ((this.tileWidth + this.spaceBetweenElements.width)));
            var widthAllocatedToDisplayedElementInPanel = Math.floor((drawing.width - 2 * MARGIN) - (formationPerLine * (this.tileWidth + this.spaceBetweenElements.width)));
            if (typeof this.panel === "undefined") {
                this.panel = new gui.Panel(drawing.width - 2 * MARGIN, this.heightAllocatedToPanel, myColors.none);
            }
            else {
                this.panel.resize(drawing.width - 2 * MARGIN, this.heightAllocatedToPanel);
            }
            this.panel.component.move(((drawing.width - 2 * MARGIN) + MARGIN) / 2, this.heightAllocatedToPanel / 2);
            (this.clippingManipulator.last.children.indexOf(this.panel.component) === -1) && this.clippingManipulator.last.add(this.panel.component);
            this.panel.content.children.indexOf(this.formationsManipulator.first) === -1 && this.panel.content.add(this.formationsManipulator.first);
            this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
            this.formationsManipulator.translator.move((this.tileWidth + widthAllocatedToDisplayedElementInPanel) / 2, this.tileHeight / 2 + this.spaceBetweenElements.height / 2);
        };

    let onClickFormation = formation => {
        Server.getVersionById(formation._id).then(data => {
            var myFormation = JSON.parse(data).formation;
            formation.loadFormation(myFormation);
            this.formationDisplayed = formation;
            this.formationDisplayed.displayFormation();
        })
    };

        var onClickNewFormation = () => {
            var formation = new Formation({}, this);
            this.formationDisplayed = formation;
            formation.parent = this;
            formation.displayFormation();
            formation.formationLabel.content.mark('formationLabelContent');
        };

        this.displayHeaderFormations = () => {
            this.headerManipulator.translator.move(0, 0);
            this.addFormationButton = displayText("Ajouter une formation", drawing.width / 7, this.addButtonHeight, myColors.none, myColors.lightgrey, 20, null, this.addButtonManipulator);
            this.addFormationButton.cadre.mark("addFormationCadre");
            var addFormationButtonTextBr = svg.runtime.boundingRect(this.addFormationButton.content.component);
            this.addFormationButton.cadre.position(MARGIN + addFormationButtonTextBr.width / 2, -addFormationButtonTextBr.height / 2).corners(0, 0);
            this.addFormationButton.content.position(this.plusDim + svg.runtime.boundingRect(this.addFormationButton.content.component).width / 2, -addFormationButtonTextBr.height / 8);
            this.addFormationObject = drawPlusWithCircle(MARGIN, -addFormationButtonTextBr.height / 2, this.addButtonHeight, this.addButtonHeight);
            this.addButtonManipulator.ordonator.set(2, this.addFormationObject.circle);
            this.addButtonManipulator.ordonator.set(3, this.addFormationObject.plus);
            this.addFormationObject.circle.position(MARGIN, -addFormationButtonTextBr.height / 2);

            svg.addEvent(this.addFormationObject.circle, "click", onClickNewFormation);
            svg.addEvent(this.addFormationObject.plus, "click", onClickNewFormation);
            svg.addEvent(this.addFormationButton.content, "click", onClickNewFormation);
            svg.addEvent(this.addFormationButton.cadre, "click", onClickNewFormation);

            //this.legendDim = this.plusDim / 2;

            this.checkLegend = statusEnum.Published.icon(this.iconeSize);
            this.checkManipulator.ordonator.set(2, this.checkLegend.square);
            this.checkManipulator.ordonator.set(3, this.checkLegend.check);
            this.published = autoAdjustText("Publié", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.checkManipulator).text.anchor("start");
            this.published.position(25, this.published.y);

            this.exclamationLegend = statusEnum.Edited.icon(this.iconeSize);
            this.exclamationManipulator.ordonator.set(0, this.exclamationLegend.circle);
            this.exclamationManipulator.ordonator.set(2, this.exclamationLegend.dot);
            this.exclamationManipulator.ordonator.set(3, this.exclamationLegend.exclamation);
            this.toPublish = autoAdjustText("Nouvelle version à publier", this.addButtonWidth, this.addButtonHeight, this.fontSize * 3 / 4, null, this.exclamationManipulator).text.anchor("start");
            this.toPublish.position(25, this.toPublish.y);
            //this.legendWidth = drawing.width * 0.3;
            this.legendItemLength = svg.runtime.boundingRect(this.toPublish.component).width + svg.runtime.boundingRect(this.exclamationLegend.circle.component).width + MARGIN;
            this.checkManipulator.first.move(drawing.width - this.legendItemLength - svg.runtime.boundingRect(this.published.component).width - svg.runtime.boundingRect(this.checkLegend.square.component).width - 2 * MARGIN, 30);
            this.exclamationManipulator.first.move(drawing.width - this.legendItemLength, 30);

            this.formations.sort((a, b) => {
                var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase();
                if (nameA < nameB)
                    return -1;
                if (nameA > nameB)
                    return 1;
                return 0
            });
        };
        header.display("Liste des formations");
        this.displayHeaderFormations();
        (this.tileHeight < 0) && (this.tileHeight = undefined);
        (!this.tileHeight || this.tileHeight > 0) && displayPanel();

    this.displayFormations = ()=> {
        let posx = this.initialFormationsPosX,
            posy = MARGIN,
            count = 0,
            totalLines = 1;
        this.formations.forEach(formation => {
            if (playerMode && this.progressOnly && formation.progress !== 'inProgress') return;

                if (count > (this.rows - 1)) {
                    count = 0;
                    totalLines++;
                    posy += (this.tileHeight + this.spaceBetweenElements.height);
                    posx = this.initialFormationsPosX;
                }
                formation.parent = this;
                this.formationsManipulator.last.children.indexOf(formation.miniature.miniatureManipulator.first) === -1 && this.formationsManipulator.last.add(formation.miniature.miniatureManipulator.first);

                formation.miniature.display(posx, posy, this.tileWidth, this.tileHeight);

                formation.miniature.setHandler(onClickFormation);
                count++;
                posx += (this.tileWidth + this.spaceBetweenElements.width);
            });
            this.panel.resizeContent(this.panel.width, totalLines * (this.spaceBetweenElements.height + this.tileHeight) + this.spaceBetweenElements.height - MARGIN);
        };
        (this.tileHeight > 0) && this.displayFormations();
    }

    function headerDisplay(message) {
        this.width = drawing.width;
        this.height = this.size * drawing.height;

        const manip = this.manipulator,
            userManip = this.userManipulator,
            text = new svg.Text(this.label).position(MARGIN, this.height * 0.75).font('Arial', 20).anchor('start'),
            line = new svg.Line(0, this.height, this.width, this.height).color(myColors.black, 3, myColors.black);
        manip.ordonator.set(1, text);
        manip.ordonator.set(0, line);
        mainManipulator.ordonator.set(0, manip.first);

        const displayUser = () => {
            const svgwidth = x => svg.runtime.boundingRect(x.component).width;

            let pos = -MARGIN;
            const deconnexion = displayText("Déconnexion", this.width * 0.15, 50, myColors.none, myColors.none, 20, null, userManip, 4, 5),
                deconnexionWidth = svgwidth(deconnexion.content),
                ratio = 0.65,
                body = new svg.CurvedShield(35 * ratio, 30 * ratio, 0.5).color(myColors.black),
                head = new svg.Circle(12 * ratio).color(myColors.black, 2, myColors.white),
                userText = autoAdjustText(drawing.username, this.width * 0.23, 50, 20, null, userManip, 3);

            pos -= deconnexionWidth / 2;
            deconnexion.content.position(pos, 0);
            deconnexion.cadre.position(pos, -30 / 2);
            pos -= deconnexionWidth / 2 + 40;
            userText.text.anchor('end');
            userText.text.position(pos, 0);
            pos -= userText.finalWidth;
            userManip.ordonator.set(0, body);
            userManip.ordonator.set(1, head);

            pos -= svgwidth(body) / 2 + MARGIN;
            body.position(pos, -5 * ratio);
            head.position(pos, -20 * ratio);
            userManip.translator.move(this.width, this.height * 0.75);

            const deconnexionHandler = () => {
                document.cookie = "token=; path=/; max-age=0;";
                drawing.username = null;
                mainManipulator.flush();
                main(svg, runtime, dbListener);
            };
            svg.addEvent(deconnexion.content, "click", deconnexionHandler);
            svg.addEvent(deconnexion.cadre, "click", deconnexionHandler);
        };

        if (message) {
            const messageText = autoAdjustText(message, this.width * 0.3, 50, 32, 'Arial', manip, 2);
            messageText.text.position(this.width / 2, this.height / 2 + MARGIN);
            messageText.text.mark("headerMessage");
        } else {
            manip.ordonator.unset(2);
        }

        manip.last.children.indexOf(userManip.first) === -1 && manip.last.add(userManip.first);
        drawing.username && displayUser();
        if (message === "Inscription" || message === "Connexion") {
            const link = message === "Inscription" ? "Connexion" : "Inscription";
            const clickHandler = () => {
                (link === "Inscription") ? globalVariables.inscriptionManager.display() : globalVariables.connexionManager.display();
            };
            const special = displayText(link, 220, 40, myColors.none, myColors.none, 25, 'Arial', userManip, 4, 5);
            special.content.anchor("end");
            userManip.translator.move(this.width - MARGIN, this.height * 0.5);
            userManip.scalor.scale(1);
            svg.addEvent(special.content, "click", clickHandler);
            svg.addEvent(special.cadre, "click", clickHandler);
        }
    }

    function questionDisplay(x, y, w, h) {
        if (typeof x !== 'undefined') {
            this.x = x;
        }
        if (typeof y !== 'undefined') {
            this.y = y;
        }
        if (typeof w !== 'undefined') {
            w && (this.width = w);
        }
        if (typeof h !== 'undefined') {
            h && (this.height = h);
        }
        this.manipulator.flush();

        // Question avec Texte ET image
        if (typeof this.label !== "undefined" && this.imageSrc) {//&& this.label !== ""
            let obj = displayImageWithTitle(this.label, this.imageSrc, this.dimImage || {
                    width: this.image.width,
                    height: this.image.height
                }, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, this.image);
            this.bordure = obj.cadre;
            this.content = obj.content;
            this.image = obj.image;
        }
        // Question avec Texte uniquement
        else if (typeof this.label !== "undefined" && !this.imageSrc) {
            var object = displayText(this.label, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator);
            this.bordure = object.cadre;
            this.content = object.content;
        }
        // Question avec Image uniquement
        else if (this.imageSrc && !this.label) {
            this.image = displayImage(this.imageSrc, this.dimImage, this.width, this.height).image;
            this.manipulator.ordonator.set(2, this.image);
        }
        else {
            this.bordure = new svg.Rect(this.width, this.height).color(this.bgColor, 1, this.colorBordure);
            this.manipulator.ordonator.set(0, this.bordure);
        }

        if (playerMode) {
            if (this.parentQuizz.currentQuestionIndex >= this.parentQuizz.tabQuestions.length) {
                let event = () => {
                    let wrongQuiz = Object.assign({}, this.parentQuizz);
                    let questionsWithBadAnswersTab = [];
                    this.parentQuizz.questionsWithBadAnswers.forEach(x => questionsWithBadAnswersTab.push(x.question));
                    wrongQuiz.tabQuestions = questionsWithBadAnswersTab;
                    this.wrongQuestionsQuiz = new Quizz(wrongQuiz, true);
                    this.wrongQuestionsQuiz.currentQuestionIndex = questionsWithBadAnswersTab.indexOf(this);
                    this.wrongQuestionsQuiz.parentFormation.quizzDisplayed = this.wrongQuestionsQuiz;
                    this.wrongQuestionsQuiz.run(1, 1, drawing.width, drawing.height);
                };
                this.bordure && svg.addEvent(this.bordure, "click", event);
                this.content && svg.addEvent(this.content, "click", event);
                this.image && svg.addEvent(this.image, "click", event);
            }
        } else if (!this.parentQuizz.previewMode) {
            this.bordure && svg.addEvent(this.bordure, "click", this.parentQuizz.parentFormation.quizzManager.questionClickHandler);
            this.content && svg.addEvent(this.content, "click", this.parentQuizz.parentFormation.quizzManager.questionClickHandler);
            this.image && svg.addEvent(this.image, "click", this.parentQuizz.parentFormation.quizzManager.questionClickHandler);
        }

        var fontSize = Math.min(20, this.height * 0.1);
        this.questNum = new svg.Text(this.questionNum).position(-this.width / 2 + MARGIN + (fontSize * (this.questionNum.toString.length) / 2), -this.height / 2 + (fontSize) / 2 + 2 * MARGIN).font("Arial", fontSize);
        this.manipulator.ordonator.set(4, this.questNum);
        this.manipulator.translator.move(this.x, this.y);
        if (this.selected) {
            this.selectedQuestion();
            //this.toggleInvalidQuestionPictogram(true);// !_! bon, mais à changer d'emplacement
        } else {
            //this.toggleInvalidQuestionPictogram(false);
        }
    }

    function questionElementClicked(sourceElement) {
        if (this.multipleChoice === false) {// question normale, une seule réponse possible
            if (sourceElement.correct) {
                this.parentQuizz.score++;
                console.log("Bonne réponse!\n");
            } else {
                let selectedAnswerIndexTab = [this.parentQuizz.tabQuestions[this.parentQuizz.currentQuestionIndex].tabAnswer.indexOf(sourceElement)];
                this.parentQuizz.questionsWithBadAnswers.push({
                    index: this.parentQuizz.currentQuestionIndex,
                    question: this.parentQuizz.tabQuestions[this.parentQuizz.currentQuestionIndex],
                    selectedAnswers: selectedAnswerIndexTab
                });
                var reponseD = "";
                this.rightAnswers.forEach(function (e) {
                    if (e.label) {
                        reponseD += e.label + "\n";
                    }
                    else if (e.imageSrc) {
                        var tab = e.imageSrc.split('/');
                        reponseD += tab[(tab.length - 1)] + "\n";
                    }
                });
                console.log("Mauvaise réponse!\n  Bonnes réponses: \n" + reponseD);
            }

            this.parentQuizz.nextQuestion();
        } else {// question à choix multiples
            if (sourceElement.selected === false) {
                // on sélectionne une réponse
                sourceElement.selected = true;
                this.selectedAnswers.push(sourceElement);
                sourceElement.colorBordure = sourceElement.bordure.strokeColor;
                sourceElement.bordure.color(sourceElement.bgColor, 5, SELECTION_COLOR);
                this.resetButton.cadre.color(myColors.yellow, 1, myColors.green);
            } else {
                sourceElement.selected = false;
                this.selectedAnswers.splice(this.selectedAnswers.indexOf(sourceElement), 1);
                sourceElement.bordure.color(sourceElement.bgColor, 1, sourceElement.colorBordure);
                if (this.selectedAnswers.length === 0) {
                    this.resetButton.cadre.color(myColors.grey, 1, myColors.grey);
                }
            }
        }
    }

    function questionDisplayAnswers(x, y, w, h) {
        if (this.rows !== 0) {
            if (typeof x !== 'undefined') {
                //(this.initialAnswersPosX=x);
            }
            if (typeof w !== 'undefined') {
                ( this.tileWidth = (w - MARGIN * (this.rows - 1)) / this.rows);
            }
            this.tileHeight = 0;
            h = h - 50;

            if (typeof h !== 'undefined') {
                (this.tileHeightMax = Math.floor(h / this.lines) - 2 * MARGIN);
            }

            this.tileHeightMin = 2.50 * this.fontSize;
            var tmpTileHeight;

            for (var answer of this.tabAnswer) {//answer.image.height
                answer.image ? (tmpTileHeight = this.tileHeightMax) : (tmpTileHeight = this.tileHeightMin);
                if (tmpTileHeight > this.tileHeightMax && tmpTileHeight > this.tileHeight) {
                    this.tileHeight = this.tileHeightMax;
                }
                else if (tmpTileHeight > this.tileHeight) {
                    this.tileHeight = tmpTileHeight;
                }
            }
            this.manipulator.ordonator.set(3, this.answersManipulator.first);
            this.answersManipulator.translator.move(0, this.height / 2 + (this.tileHeight) / 2);

            var posx = 0;
            var posy = 0;
            var count = 0;
            for (var i = 0; i < this.tabAnswer.length; i++) {
                if (i !== 0) {
                    posx += (this.tileWidth + MARGIN);
                }
                if (count > (this.rows - 1)) {
                    count = 0;
                    posy += (this.tileHeight + MARGIN);
                    posx = 0;
                }

                this.answersManipulator.last.children.indexOf(this.tabAnswer[i].manipulator.first) === -1 && this.answersManipulator.last.add(this.tabAnswer[i].manipulator.first);
                this.tabAnswer[i].display(-this.tileWidth / 2, -this.tileHeight / 2, this.tileWidth, this.tileHeight);
                this.tabAnswer[i].manipulator.translator.move(posx - (this.rows - 1) * this.tileWidth / 2 - (this.rows - 1) * MARGIN / 2, posy + MARGIN);

                if (this.parentQuizz.previewMode) {
                    if (this.tabAnswer[i].correct) {
                        this.tabAnswer[i].bordure.color(this.tabAnswer[i].bordure.component.fillColor || myColors.white, 5, myColors.primaryGreen);
                    }
                } else {
                    ((element)=> {
                        if (element.bordure) {
                            svg.addEvent(element.bordure, "click", ()=> {
                                this.elementClicked(element);
                            });
                        }
                        if (element.content) {
                            svg.addEvent(element.content, "click", ()=> {
                                this.elementClicked(element);
                            });
                        }
                        if (element.image) {
                            svg.addEvent(element.image, "click", ()=> {
                                this.elementClicked(element);
                            });
                        }
                    })(this.tabAnswer[i]);
                }
                count++;
            }
            if (this.parentQuizz.previewMode) {
                let index;
                for (let j = 0; j < this.parentQuizz.questionsWithBadAnswers.length; j++) {
                    (this.parentQuizz.questionsWithBadAnswers[j].index + 1 === this.questionNum) && (index = j);
                }
                playerMode && this.parentQuizz.questionsWithBadAnswers[index].selectedAnswers.forEach(selectedAnswer=> {
                    this.tabAnswer[selectedAnswer].correct ? this.tabAnswer[selectedAnswer].bordure.color(myColors.greyerBlue, 5, myColors.primaryGreen) : this.tabAnswer[selectedAnswer].bordure.color(myColors.greyerBlue, 5, myColors.red);
                    //this.tabAnswer[selectedAnswer].correct ? this.tabAnswer[selectedAnswer].bordure.color(myColors.darkBlue, 5, myColors.primaryGreen) : this.tabAnswer[selectedAnswer].bordure.color(myColors.darkBlue, 5, myColors.red);
                    //this.tabAnswer[selectedAnswer].content.color(getComplementary(myColors.darkBlue));
                });
            }

        }
        if (playerMode && this.parentQuizz.previewMode) {
            w = 0.5 * drawing.width;
            h = Math.min(this.tileHeight, 50);
            var buttonX = -w / 2;
            var buttonY = this.tileHeight * (this.lines - 1 / 2) + (this.lines + 1) * MARGIN;
            this.simpleChoiceMessageManipulator.translator.move(buttonX + w / 2, buttonY + h / 2);
            this.simpleChoiceMessage = displayText("Cliquer sur une réponse pour afficher son explication", w, h, myColors.none, myColors.none, 20, "Arial", this.simpleChoiceMessageManipulator);
        }
        else if (this.multipleChoice) {
            //affichage d'un bouton "valider"
            w = 0.1 * drawing.width;
            h = Math.min(this.tileHeight, 50);
            var validateX, validateY;
            validateX = 0.08 * drawing.width - w / 2;
            validateY = this.tileHeight * (this.lines - 1 / 2) + (this.lines + 1) * MARGIN;

            var validateButton = displayText("Valider", w, h, myColors.green, myColors.yellow, 20, this.font, this.validateManipulator);
            this.validateManipulator.translator.move(validateX + w / 2, validateY + h / 2);

            //button. onclick
            if (!this.parentQuizz.previewMode) {
                var oclk = ()=> {
                    // test des valeurs, en gros si selectedAnswers === rigthAnswers
                    var allRight = false;

                    if (this.rightAnswers.length !== this.selectedAnswers.length) {
                        allRight = false;
                    } else {
                        var subTotal = 0;
                        this.selectedAnswers.forEach((e)=> {
                            if (e.correct) {
                                subTotal++;
                            }
                        });
                        allRight = (subTotal === this.rightAnswers.length);
                    }

                    if (allRight) {
                        this.parentQuizz.score++;
                        console.log("Bonne réponse!\n");
                    } else {
                        let indexOfSelectedAnswers = [];
                        this.selectedAnswers.forEach(aSelectedAnswer => {
                            indexOfSelectedAnswers.push(this.parentQuizz.tabQuestions[this.parentQuizz.currentQuestionIndex].tabAnswer.indexOf(aSelectedAnswer));
                        });
                        this.parentQuizz.questionsWithBadAnswers.push({
                            index: this.parentQuizz.currentQuestionIndex,
                            question: this.parentQuizz.tabQuestions[this.parentQuizz.currentQuestionIndex],
                            selectedAnswers: indexOfSelectedAnswers
                        });
                        var reponseD = "";
                        this.rightAnswers.forEach((e)=> {
                            if (e.label) {
                                reponseD += e.label + "\n";
                            }
                            else if (e.imageSrc) {
                                var tab = e.imageSrc.split('/');
                                reponseD += tab[(tab.length - 1)] + "\n";
                            }
                        });
                        console.log("Mauvaise réponse!\n  Bonnes réponses: " + reponseD);
                    }
                    this.parentQuizz.nextQuestion();
                };
                svg.addEvent(validateButton.cadre, 'click', oclk);
                svg.addEvent(validateButton.content, 'click', oclk);
            }

            //Button reset
            w = 0.1 * drawing.width;
            h = Math.min(this.tileHeight, 50);
            var resetX = -w / 2 - 0.08 * drawing.width;
            var resetY = this.tileHeight * (this.lines - 1 / 2) + (this.lines + 1) * MARGIN;
            this.resetButton = displayText("Réinitialiser", w, h, myColors.grey, myColors.grey, 20, this.font, this.resetManipulator);
            this.resetManipulator.translator.move(resetX + w / 2, resetY + h / 2);
            if (this.selectedAnswers.length !== 0) {
                this.resetButton.cadre.color(myColors.yellow, 1, myColors.green);
            }
            if (!this.parentQuizz.previewMode) {
                this.reset = ()=> {
                    if (this.selectedAnswers.length > 0) {
                        this.selectedAnswers.forEach((e)=> {
                            e.selected = false;
                            e.bordure.color(e.bgColor, 1, e.colorBordure);
                        });
                        this.selectedAnswers.splice(0, this.selectedAnswers.length);
                        this.resetButton.cadre.color(myColors.grey, 1, myColors.grey);
                    }
                };
                svg.addEvent(this.resetButton.content, 'click', this.reset);
                svg.addEvent(this.resetButton.cadre, 'click', this.reset);
            }
        }
        else {
            w = 0.5 * drawing.width;
            h = Math.min(this.tileHeight, 50);
            buttonX = -w / 2;
            buttonY = this.tileHeight * (this.lines - 1 / 2) + (this.lines + 1) * MARGIN;
            this.simpleChoiceMessageManipulator.translator.move(buttonX + w / 2, buttonY + h / 2);
            this.simpleChoiceMessage = displayText("Cliquer sur une réponse pour passer à la question suivante", w, h, myColors.none, myColors.none, 20, "Arial", this.simpleChoiceMessageManipulator);
        }
    }

    function questionSelectedQuestion() {
        this.bordure.color(this.bgColor, 5, SELECTION_COLOR);
        if (!this.redCrossManipulator) {
            let redCrossClickHandler = () => {
                let quizzManager = this.parentQuizz.parentFormation.quizzManager;
                //let questionCreator = quizzManager.questionCreator;
                let questionPuzzle = quizzManager.questionPuzzle;
                let questionsArray = questionPuzzle.elementsArray;
                let index = questionsArray.indexOf(this);
                this.remove();
                (questionsArray[index] instanceof AddEmptyElement) && index--; // Cas où on clique sur l'AddEmptyElement (dernier élément)
                if (index !== -1) {
                    quizzManager.indexOfEditedQuestion = index;
                    this.parentQuizz.tabQuestions[index].selected = true;
                    resetQuestionsIndex(this.parentQuizz);
                    questionPuzzle && questionPuzzle.indexOfFirstVisibleElement != 0 && questionPuzzle.indexOfFirstVisibleElement--;
                    questionPuzzle && questionPuzzle.updateElementsArray(this.parentQuizz.tabQuestions);
                    questionPuzzle && questionPuzzle.fillVisibleElementsArray("leftToRight");
                    quizzManager.questionClickHandler({question: this.parentQuizz.tabQuestions[index]});
                }
                else {
                    this.parentQuizz.tabQuestions.splice(0, 0, new Question(defaultQuestion, this.parentQuizz));
                    resetQuestionsIndex(this.parentQuizz);
                    if (questionPuzzle) {
                        questionPuzzle.visibleElementsArray[0].length === 6 && questionPuzzle.updateStartPosition('right');
                        questionPuzzle.fillVisibleElementsArray("leftToRight");
                    }
                    quizzManager.indexOfEditedQuestion = ++index;
                    this.parentQuizz.tabQuestions[0].selected = true;
                    questionPuzzle.display();

                    svg.event(questionsArray[0].bordure, "click", {question: questionsArray[0]}); // dernier élément du tableau (AddEmptyElement)
                }
            };
            this.redCrossManipulator = new Manipulator(this);
            let size = 20;
            this.redCross || (this.redCross = drawRedCross(-this.questNum.x, this.questNum.y - size / 2, size, this.redCrossManipulator));
            svg.addEvent(this.redCross, "click", redCrossClickHandler);
            this.redCrossManipulator.last.children.indexOf(this.redCross) === -1 && this.redCrossManipulator.last.add(this.redCross);
            this.manipulator.last.add(this.redCrossManipulator.first);
        }
        else {
            this.redCrossManipulator.translator.move(-this.questNum.x, this.questNum.y - this.redCross.size / 2);
            this.redCrossManipulator.last.children.indexOf(this.redCross) === -1 && this.redCrossManipulator.last.add(this.redCross);
        }
    }

    function questionCreatorDisplay(x, y, w, h) {
        x && (this.previousX = x);
        y && (this.previousY = y);
        w && (this.previousW = w);
        h && (this.previousH = h);
        //this.manipulator.last.children.indexOf(this.questionCreatorManipulator.first)===-1 && this.manipulator.last.add(this.questionCreatorManipulator.first);
        //this.questionCreatorHeight = Math.floor(this.previousH * (1 - this.headerHeight) - 80);
        this.manipulator.translator.move(this.previousX, 0);
        this.toggleButtonHeight = 40;
        this.displayQuestionCreator(this.previousX, this.previousY, this.previousW, this.previousH);
        var clickedButton = this.multipleChoice ? myQuestionType.tab[1].label : myQuestionType.tab[0].label;
        this.displayToggleButton(MARGIN + this.previousX, MARGIN / 2 + this.previousY, this.previousW, this.toggleButtonHeight - MARGIN, clickedButton);
    }

    function questionCreatorDisplayToggleButton(x, y, w, h, clicked) {
        var size = this.questionBlock.rect.height * 0.05;
        this.manipulator.last.children.indexOf(this.toggleButtonManipulator.first) === -1 && this.manipulator.last.add(this.toggleButtonManipulator.first);
        this.toggleButtonWidth = drawing.width / 5;
        var toggleHandler = (event)=> {
            this.target = drawings.background.getTarget(event.pageX, event.pageY);
            var questionType = this.target.parent.children[1].messageText;
            this.linkedQuestion.tabAnswer.forEach(function (answer) {
                answer.correct = false;
            });

            (questionType === "Réponses multiples") ? (this.multipleChoice = true) : (this.multipleChoice = false);
            (questionType === "Réponses multiples") ? (this.linkedQuestion.multipleChoice = true) : (this.linkedQuestion.multipleChoice = false);

            this.linkedQuestion.questionType = (!this.multipleChoice) ? this.questionType[0] : this.questionType[1];
            this.errorMessagePreview && this.errorMessagePreview.parent && this.parent.previewButtonManipulator.last.remove(this.errorMessagePreview);

            this.linkedQuestion.tabAnswer.forEach((answer)=> {
                var xCheckBox, yCheckBox = 0;
                if (answer.obj && answer.obj.checkbox) {
                    xCheckBox = answer.obj.checkbox.x;
                    yCheckBox = answer.obj.checkbox.y;
                    answer.correct = false;
                    answer.obj.checkbox = displayCheckbox(xCheckBox, yCheckBox, size, answer).checkbox;
                    answer.obj.checkbox.answerParent = answer;
                }
            });
            this.displayToggleButton(x, y, w, h, questionType);
            this.linkedQuestion.checkValidity();
        };

        this.manipulator.last.children.indexOf(this.toggleButtonManipulator.first) === -1 && this.manipulator.last.add(this.toggleButtonManipulator.first);

        var length = this.questionType.length;
        var lengthToUse = (length + 1) * MARGIN + length * this.toggleButtonWidth;
        this.margin = (w - lengthToUse) / 2;
        this.x = this.margin + this.toggleButtonWidth / 2 + MARGIN;
        var i = 0;
        (!this.completeBanner) && (this.completeBanner = []);
        this.questionType.forEach((type)=> {
            if (this.completeBanner[i] && this.completeBanner[i].manipulator) {
                this.toggleButtonManipulator.last.remove(this.completeBanner[i].manipulator.first);
            }
            this.completeBanner[i] = {};
            this.completeBanner[i].manipulator = new Manipulator(this);
            this.completeBanner[i].manipulator.addOrdonator(2);
            this.toggleButtonManipulator.last.add(this.completeBanner[i].manipulator.first);
            (type.label == clicked) ? (this.completeBanner[i].color = SELECTION_COLOR) : (this.completeBanner[i].color = myColors.white);
            this.completeBanner[i].toggleButton = displayTextWithoutCorners(type.label, this.toggleButtonWidth, h, myColors.black, this.completeBanner[i].color, 20, null, this.completeBanner[i].manipulator);
            this.completeBanner[i].toggleButton.content.color(getComplementary(this.completeBanner[i].color), 0, myColors.black);
            this.completeBanner[i].manipulator.translator.move(this.x - this.w / 2, h - this.h / 2);
            this.x += this.toggleButtonWidth + MARGIN;
            (type.label != clicked) && (svg.addEvent(this.completeBanner[i].toggleButton.content, "click", toggleHandler));
            (type.label != clicked) && (svg.addEvent(this.completeBanner[i].toggleButton.cadre, "click", toggleHandler));
            i++;
        });
        this.linkedQuestion.questionType = (this.multipleChoice) ? this.questionType[1] : this.questionType[0];
        this.toggleButtonManipulator.translator.move(0, 0);
    }

    function questionCreatorDisplayQuestionCreator(x, y, w, h) {
        // bloc Question
        this.manipulator.flush();
        this.questionBlock = {rect: new svg.Rect(w, h).color(myColors.none, 3, myColors.black).position(w / 2, y + h / 2)};
        this.questionBlock.rect.position(0, 0);
        this.questionBlock.rect.fillOpacity(0.001);
        this.manipulator.last.children.indexOf(this.questionBlock.rect) === -1 && this.manipulator.last.add(this.questionBlock.rect);
        this.manipulator.last.children.indexOf(this.questionManipulator.first) === -1 && this.manipulator.last.add(this.questionManipulator.first);

        var removeErrorMessage = () => {
            this.linkedQuestion.validLabelInput = true;
            this.errorMessage && this.manipulator.ordonator.unset(0);
            this.questionBlock.title.cadre.color(myColors.white, 1, myColors.black);
        };

        var displayErrorMessage = (textarea)=> {
            removeErrorMessage();
            this.questionBlock.title.cadre.color(myColors.white, 2, myColors.red);
            var anchor = 'middle';
            //var quizzInfoHeightRatio = 0.05;
            //var questionsPuzzleHeightRatio = 0.25;
            this.errorMessage = new svg.Text(REGEX_ERROR);
            this.manipulator.ordonator.set(0, this.errorMessage);
            this.errorMessage.position(0, -this.h / 2 + this.toggleButtonHeight + this.questionBlock.title.cadre.height + svg.runtime.boundingRect(this.errorMessage.component).height + MARGIN)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            textarea && textarea.focus();
            this.linkedQuestion.validLabelInput = false;
        };

        var showTitle = () => {
            var color = (this.linkedQuestion.label) ? myColors.black : myColors.grey;
            var text = (this.linkedQuestion.label) ? this.linkedQuestion.label : this.labelDefault;
            if (this.linkedQuestion.image) {
                this.image = this.linkedQuestion.image;
                this.imageLayer = 2;
                var picture = new Picture(this.image.src, true, this, text);
                picture.draw(0, 0, this.w - 2 * MARGIN, this.h * 0.25, this.questionManipulator);
                this.questionBlock.title = picture.imageSVG;

            } else {
                this.questionBlock.title = displayText(text, this.w - 2 * MARGIN, this.h * 0.25, myColors.black, myColors.none, this.linkedQuestion.fontSize, this.linkedQuestion.font, this.questionManipulator);
            }
            var fontSize = Math.min(20, this.h * 0.1);
            this.questNum = new svg.Text(this.linkedQuestion.questionNum).position(-this.w / 2 + 2 * MARGIN + (fontSize * (this.linkedQuestion.questionNum.toString.length) / 2), -this.h * 0.25 / 2 + (fontSize) / 2 + 2 * MARGIN).font("Arial", fontSize);
            this.questionManipulator.ordonator.set(4, this.questNum);
            this.questionBlock.title.content.color(color);
            this.questionBlock.title.content._acceptDrop = true;
            this.linkedQuestion.validLabelInput ? this.questionBlock.title.cadre.color(this.linkedQuestion.bgColor, 1, this.linkedQuestion.colorBordure) :
                this.questionBlock.title.cadre.color(this.linkedQuestion.bgColor, 2, myColors.red);
            this.linkedQuestion.validLabelInput || displayErrorMessage();
            this.questionBlock.title.cadre._acceptDrop = true;
            svg.addEvent(this.questionBlock.title.content, "dblclick", dblclickEditionQuestionBlock);
            svg.addEvent(this.questionBlock.title.cadre, "dblclick", dblclickEditionQuestionBlock);
            this.questionManipulator.translator.move(0, -this.h / 2 + this.questionBlock.title.cadre.height / 2 + this.toggleButtonHeight + MARGIN);
            this.manipulator.translator.move(x + w / 2, y + h / 2);
        };

        var dblclickEditionQuestionBlock = () => {
            var globalPointCenter = this.questionBlock.title.content.globalPoint(-(this.w) / 2, -((this.linkedQuestion.image) ? svg.runtime.boundingRect(this.questionBlock.title.content.component).height : ((this.h * .25) / 2)) / 2);
            var contentareaStyle = {
                height: (this.linkedQuestion.image) ? svg.runtime.boundingRect(this.questionBlock.title.content.component).height : ((this.h * .25) / 2),
                toppx: globalPointCenter.y,
                leftpx: (globalPointCenter.x + 1 / 12 * this.w),
                width: (this.w * 5 / 6)
            };
            this.questionBlock.title.content.message("");
            drawing.notInTextArea = false;
            var textarea = new svg.TextArea(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height)
                .color(myColors.white, 0, myColors.black)
                .message(this.linkedQuestion.label)
                .font("Arial", 20);
            drawings.screen.add(textarea);
            textarea.focus();

            var onblur = () => {
                textarea.enter();
                this.linkedQuestion.label = textarea.messageText || '';
                if (textarea.messageText) {
                    this.label = textarea.messageText;
                    this.linkedQuestion.label = textarea.messageText;
                }
                drawings.screen.remove(textarea);
                drawing.notInTextArea = true;
                showTitle();
                this.parent.displayQuestionsPuzzle(null, null, null, null, this.parent.questionPuzzle.indexOfFirstVisibleElement);
            };

            var oninput = () => {
                textarea.enter();
                this.parent.questionCreator.checkInputTextArea({
                    textarea: textarea,
                    border: this.questionBlock.title.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: () => {
                        displayErrorMessage(textarea)
                    }
                });
            };
            svg.runtime.addEvent(textarea.component, "blur", onblur);
            svg.runtime.addEvent(textarea.component, "input", oninput);
        };

        (typeof x !== "undefined") && (this.x = x);
        (typeof y !== "undefined") && (this.y = y);
        (typeof w !== "undefined") && (this.w = w);
        (typeof h !== "undefined") && (this.h = h);
        showTitle();
        var height = this.h - this.toggleButtonHeight - this.questionBlock.title.cadre.height - 3 * MARGIN;
        this.coordinatesAnswers = {
            x: 0,
            y: (this.h - height) / 2 - MARGIN, //this.y + 3 * MARGIN ,
            w: this.w - 2 * MARGIN,
            h: height
        };
        // bloc Answers
        if (this.linkedQuestion.tabAnswer.length < this.MAX_ANSWERS && !(this.linkedQuestion.tabAnswer[this.linkedQuestion.tabAnswer.length - 1] instanceof AddEmptyElement)) {
            this.linkedQuestion.tabAnswer.push(new AddEmptyElement(this, 'answer'));
        }
        this.puzzle.updateElementsArray(this.linkedQuestion.tabAnswer);
        this.manipulator.last.children.indexOf(this.puzzle.manipulator.first) === -1 && this.manipulator.last.add(this.puzzle.manipulator.first);
        this.puzzle && this.puzzle.fillVisibleElementsArray("leftToRight");

        this.puzzle.display(this.coordinatesAnswers.x, this.coordinatesAnswers.y, this.coordinatesAnswers.w, this.coordinatesAnswers.h, false);
        if (this.explanation) {
            this.explanation.display(this, 0, this.coordinatesAnswers.x, this.coordinatesAnswers.y, this.coordinatesAnswers.w, this.coordinatesAnswers.h);
        }
    }

    function popInDisplay(parent, previousX, x, y, w, h) {
        const rect = new svg.Rect(w + 2, h) //+2 border
            .color(myColors.white, 1, myColors.black);
        rect._acceptDrop = this.editable;
        if (parent.manipulator.last.children.indexOf(this.manipulator.first) === -1) {
            parent.manipulator.last.add(this.manipulator.first);
        }
        this.manipulator.ordonator.set(0, rect);
        this.manipulator.translator.move(previousX, y);

        let crossSize = 12;
        let drawCross = () => {
            let circle = new svg.Circle(crossSize).color(myColors.black, 2, myColors.white);
            let cross = drawRedCross(w / 2, -h / 2, crossSize, this.blackCrossManipulator)
                .color(myColors.lightgrey, 1, myColors.lightgrey);
            this.blackCrossManipulator.ordonator.set(0, circle);
            this.blackCrossManipulator.ordonator.set(1, cross);
            let crossHandler = event => {
                this.editable && (parent.explanation = false);
                let target = drawings.background.getTarget(event.clientX, event.clientY);
                parent.manipulator.last.remove(target.parent.parentManip.parentObject.manipulator.first);
                this.editable && parent.puzzle.display(x, y, w, h, false);
            };
            svg.addEvent(cross, "click", crossHandler);
            svg.addEvent(circle, "click", crossHandler);
        };
        drawCross();

        drawing.notInTextArea = true;
        runtime.addGlobalEvent("keydown", (event) => {
            if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        });
        var hasKeyDownEvent = (event) => {
            this.target = this.panel;
            if (blackCross && event.keyCode === 27) { // suppr
                this.editable && (parent.explanation = false);
                parent.manipulator.last.remove(this.manipulator.first);
                this.editable && parent.puzzle.display(x, y, w, h, false);
                drawing.mousedOverTarget = false;
            }
            return this.target && this.target.processKeys && this.target.processKeys(event.keyCode);
        };
        let panelWidth = 2 * w / 3,
            panelHeight = 2 * h / 3;
        this.panelManipulator.translator.move(w / 8, 0);
        if (this.image) {
            this.imageLayer = 3;
            let picture = new Picture(this.image, this.editable, this);
            let imageSize = Math.min(w / 4, panelHeight);
            picture.draw(-w / 2 + imageSize / 4 + w / 12, 0, imageSize, imageSize);
            this.answer.filled = true;
        } else if (this.editable) {
            let draganddropTextSVG = autoAdjustText(this.draganddropText, w / 6, h / 3, 20, null, this.manipulator, 3).text;
            draganddropTextSVG.position(-w / 2 + w / 12 + MARGIN, 0).color(myColors.grey);
            draganddropTextSVG._acceptDrop = this.editable;
            this.label ? this.answer.filled = true : this.answer.filled = false;
        } else {
            panelWidth = w - 2 * MARGIN;
            panelHeight = h - crossSize - 3 * MARGIN;
            this.panelManipulator.translator.move(0, crossSize / 2 + MARGIN / 2);
        }

        if (typeof this.panel === "undefined") {
            this.panel = new gui.Panel(panelWidth, panelHeight, myColors.white);
            this.panel.border.color([], 1, [0, 0, 0]);
            this.panel.component.noFlush = true;
        } else {
            this.panel.resize(panelWidth, panelHeight);
        }

        this.panelManipulator.last.children.indexOf(this.panel.component) === -1 && this.panelManipulator.last.add(this.panel.component);
        this.panel.content.children.indexOf(this.textManipulator.first) === -1 && this.panel.content.add(this.textManipulator.first);
        this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
        this.textToDisplay = this.label ? this.label : (this.defaultLabel ? this.defaultLabel : "");
        this.text = autoAdjustText(this.textToDisplay, panelWidth, drawing.height, null, null, this.textManipulator, 0).text;
        this.text.position(panelWidth / 2, svg.runtime.boundingRect(this.text.component).height);
        this.panel.resizeContent(this.panel.width, svg.runtime.boundingRect(this.text.component).height + MARGIN);

        let clickEdition = () => {
            let contentArea = {};
            contentArea.y = panelHeight;
            contentArea.x = panelWidth / 2;
            contentArea.globalPointCenter = this.panel.border.globalPoint(-contentArea.x, -contentArea.y / 2 - MARGIN);
            drawing.notInTextArea = false;
            contentArea = new svg.TextArea(contentArea.globalPointCenter.x, contentArea.globalPointCenter.y, panelWidth - MARGIN, panelHeight - MARGIN);
            contentArea.color(null, 0, myColors.black).font("Arial", 20);
            (this.textToDisplay === "" || this.textToDisplay === this.defaultLabel) && contentArea.placeHolder(this.labelDefault);
            contentArea.message(this.label || "");
            this.textManipulator.ordonator.unset(0);
            contentArea.scroll(svg.TextArea.SCROLL);
            this.panel.vHandle.handle.color(myColors.none, 3, myColors.none);
            drawings.screen.add(contentArea);
            contentArea.focus();
            let onblur = () => {
                contentArea.enter();
                this.label = contentArea.messageText;
                drawings.screen.remove(contentArea);
                drawing.notInTextArea = true;
                this.display(parent, previousX, x, y, w, h);
            };
            svg.addEvent(contentArea, 'blur', onblur);
            svg.addEvent(contentArea, 'input', () => {
                contentArea.enter();
            });
        };
        if (this.editable) {
            svg.addEvent(this.text, "click", clickEdition);
            svg.addEvent(this.panel.back, "click", clickEdition);
        }
    }

    function quizzDisplay(x, y, w, h) {
        drawing.currentPageDisplayed = "Quizz";
        header.display(this.parentFormation.label + " - " + this.title);
        mainManipulator.ordonator.set(1, this.quizzManipulator.first);

        let setSizes = ()=> {
            this.x = x || this.x || 0;
            if (x === 0)this.x = 0;
            this.y = y || this.y || 0;
            w && (this.questionArea.w = w);
            (w && x) && (this.resultArea.w = w );
            x && (this.resultArea.x = x);
            w && (this.titleArea.w = w);
            //x && (this.quizzMarginX = x);
            this.headerPercentage = HEADER_SIZE;
            this.questionPercentageWithImage = 0.3;
            this.questionPercentage = 0.2;
            this.answerPercentageWithImage = 0.6;
            this.answerPercentage = 0.7;
        };
        let setPreviewSizes = ()=> {
            this.x = x + w * 0.15 || this.x || 0;
            this.y = y || this.y || 0;
            w && (this.questionArea.w = w * 0.7);
            (w && x) && (this.resultArea.w = w * 0.85);
            x && (this.resultArea.x = x + w * 0.15);
            w && (this.titleArea.w = w * 0.85);
            //x && (this.quizzMarginX = x+w*0.15);
            this.headerPercentage = HEADER_SIZE;
            this.questionPercentageWithImage = 0.3;
            this.questionPercentage = 0.2;
            this.answerPercentageWithImage = 0.6;
            this.answerPercentage = 0.7;
        };
        this.previewMode ? setPreviewSizes() : setSizes();

        let heightPage = drawing.height;
        this.headerHeight = heightPage * this.headerPercentage;
        this.questionHeight = heightPage * this.questionPercentage - MARGIN;
        this.answerHeight = heightPage * this.answerPercentage - MARGIN;
        this.questionHeightWithoutImage = heightPage * this.questionPercentage - MARGIN;
        this.answerHeightWithoutImage = heightPage * this.answerPercentage - MARGIN;
        this.questionHeightWithImage = heightPage * this.questionPercentageWithImage - MARGIN;
        this.answerHeightWithImage = heightPage * this.answerPercentageWithImage - MARGIN;

        this.quizzManipulator.translator.move(this.questionArea.w / 2, this.headerHeight);

        this.returnButton.display(MARGIN - w * 0.5 + this.x, this.headerHeight / 2, 20, 20);
        if (this.previewMode) {
            if (playerMode) {
                this.returnButton.setHandler((event) => {
                    let target = drawings.background.getTarget(event.pageX, event.pageY);
                    target.parentObj.parent.previewMode = false;
                    target.parentObj.parent.currentQuestionIndex = this.tabQuestions.length;
                    target.parentObj.parent.quizzManipulator.flush();
                    drawing.currentPageDisplayed = "QuizPreview";
                    target.parentObj.parent.puzzleLines = 3;
                    target.parentObj.parent.puzzleRows = 3;
                    target.parentObj.parent.returnButton.label = "Retour à la formation";
                    target.parentObj.parent.display(0, 0, drawing.width, drawing.height);
                });
            }
            else {
                this.returnButton.setHandler((event) => {
                    let target = drawings.background.getTarget(event.pageX, event.pageY);
                    target.parentObj.parent.quizzManipulator.flush();
                    target.parentObj.parent.parentFormation.quizzManager.loadQuizz(target.parentObj.parent, target.parentObj.parent.currentQuestionIndex);
                    target.parentObj.parent.parentFormation.quizzManager.display();
                });
            }
        }
        else {
            this.returnButton.setHandler((event) => {
                let target = drawings.background.getTarget(event.pageX, event.pageY);
                target.parentObj.parent.quizzManipulator.flush();
                target.parentObj.parent.parentFormation.displayFormation();
            });
        }
        if (this.currentQuestionIndex === -1) {// on passe à la première question
            this.nextQuestion();
        }
        else if (this.currentQuestionIndex < this.tabQuestions.length) {
            this.displayCurrentQuestion();
        }
        else {
            let questionsWithBadAnswersTab = [];
            this.questionsWithBadAnswers.forEach(x => questionsWithBadAnswersTab.push(x.question));
            this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, questionsWithBadAnswersTab, "upToDown", this);
            this.displayResult();
        }

        if (this.previewMode) {
            this.leftChevron = new Chevron(x - w * 0.3, y + h * 0.45, w * 0.1, h * 0.15, this.leftChevronManipulator, "left");
            this.rightChevron = new Chevron(x + w * 0.6, y + h * 0.45, w * 0.1, h * 0.15, this.rightChevronManipulator, "right");
            //this.leftChevron.resize(w*0.1, h*0.15);
            //this.rightChevron.resize(w*0.1, h*0.15);
            //this.leftChevron.move();
            //this.rightChevron.move();

            this.leftChevron.parentObj = this;
            this.rightChevron.parentObj = this;
            let updateColorChevrons = (quiz) => {
                quiz.rightChevron.color(quiz.currentQuestionIndex === quiz.tabQuestions.length - 1 ? myColors.grey : myColors.black);
                quiz.leftChevron.color(quiz.currentQuestionIndex === 0 ? myColors.grey : myColors.black);
            };

            let leftChevronHandler = (event) => {
                let target = drawings.background.getTarget(event.pageX, event.pageY);
                let puzzle = target.parentObj;
                if (puzzle.currentQuestionIndex > 0) {
                    puzzle.quizzManipulator.last.remove(puzzle.tabQuestions[puzzle.currentQuestionIndex].manipulator.first);
                    puzzle.currentQuestionIndex--;
                    updateColorChevrons(puzzle);
                    puzzle.displayCurrentQuestion();
                }
            };
            let rightChevronHandler = (event) => {
                let target = drawings.background.getTarget(event.pageX, event.pageY);
                let puzzle = target.parentObj;
                if (puzzle.currentQuestionIndex < puzzle.tabQuestions.length - 1) {
                    puzzle.quizzManipulator.last.remove(puzzle.tabQuestions[puzzle.currentQuestionIndex].manipulator.first);
                    puzzle.currentQuestionIndex++;
                    updateColorChevrons(puzzle);
                    puzzle.displayCurrentQuestion();
                }
            };
            updateColorChevrons(this);
            svg.addEvent(this.leftChevron, "click", leftChevronHandler);
            svg.addEvent(this.rightChevron, "click", rightChevronHandler);
        }
    }

    function quizzDisplayResult(color) {
        this.questionsWithBadAnswers.forEach(x=> {
            x.question.manipulator.ordonator.unset(3)
        });
        this.displayScore(color);
        this.puzzle && this.puzzle.fillVisibleElementsArray("upToDown");
        this.puzzle.display(0, this.questionHeight / 2 + this.answerHeight / 2 + MARGIN, drawing.width - MARGIN, this.answerHeight);
        this.puzzle.leftChevron.resize(this.puzzle.chevronSize, this.puzzle.chevronSize);
        this.buttonAnswersExpHeight = 50;
        this.answersExpButtonManipulator = new Manipulator(this);
        this.answersExpButtonManipulator.addOrdonator(2);
        this.quizzManipulator.last.add(this.answersExpButtonManipulator.first);

        this.textAnswersExp = "Voir les réponses et explications";
        this.returnText = new svg.Text(this.textAnswersExp).font("Arial", 20);
        this.answersExpButtonManipulator.ordonator.set(1, this.returnText);
        this.width = svg.runtime.boundingRect(this.returnText.component).width;
        this.answerExpButton = displayText(this.textAnswersExp, this.width + this.width / 4, this.buttonAnswersExpHeight, myColors.black, myColors.white, 20, null, this.answersExpButtonManipulator);
        this.answerExpFunction = () => {
            this.displayAnswersExp = () => {
                this.quizzManipulator.flush();
                this.quizzManipulator.parentObject.tabQuestions.forEach(y => {
                    y.manipulator.ordonator.unset(3)
                });
                this.questionPuzzle = new Puzzle(1, 6, this.quizzManipulator.parentObject.tabQuestions, "leftToRight", this);
                this.questionPuzzle.display();

            };
            this.displayAnswersExp();
        };

        svg.addEvent(this.answerExpButton.cadre, "click", this.answerExpFunction);
        svg.addEvent(this.answerExpButton.content, "click", this.answerExpFunction);
        this.answersExpButtonManipulator.translator.move(0, drawing.height - 3 * MARGIN - this.buttonAnswersExpHeight);
    }

    function gameDisplayMiniature(size) {
        return new MiniatureGame(this, size);
    }

    function bdDisplay(bd) {
        mainManipulator.ordonator.unset(1);
        var header = new Header(bd.title);
        header.display(bd.title);
        (mainManipulator.last.children.indexOf(bd.manipulator.first) === -1) && mainManipulator.last.add(bd.manipulator.first);
        bd.returnButton.display(0, drawing.height * header.size + 2 * MARGIN, 20, 20);
        bd.returnButton.setHandler(self.previewMode ? (event) => {
            let target = drawings.background.getTarget(event.pageX, event.pageY);
            target.parentObj.parent.manipulator.flush();
            target.parentObj.parent.parentFormation.quizzManager.loadQuizz(target.parentObj.parent, target.parentObj.parent.currentQuestionIndex);
            target.parentObj.parent.parentFormation.quizzManager.display();
        } : (event) => {
            let target = drawings.background.getTarget(event.pageX, event.pageY);
            target.parentObj.parent.manipulator.flush();
            target.parentObj.parent.parentFormation.displayFormation();
        });
    }

    function quizzDisplayScore(color) {
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

        this.finalMessage = `${str1} Vous avez répondu à ${this.tabQuestions.length} questions, ${str2}`;
        if (!color) {
            var usedColor = autoColor;
        } else {
            usedColor = color;
        }

        this.resultManipulator && (this.quizzManipulator.last.children.indexOf(this.resultManipulator.first) !== -1) && this.quizzManipulator.last.remove(this.resultManipulator.first);

        this.resultManipulator = new Manipulator(this);
        this.scoreManipulator = new Manipulator(this);
        this.scoreManipulator.addOrdonator(2);
        this.resultManipulator.translator.move(0, this.questionHeight / 2 + this.headerHeight / 2 + 2 * MARGIN);
        this.resultManipulator.last.add(this.scoreManipulator.first);
        this.resultManipulator.last.add(this.puzzle.manipulator.first);
        this.quizzManipulator.last.add(this.resultManipulator.first);
        displayText(this.finalMessage, this.titleArea.w - 2 * MARGIN, this.questionHeight, myColors.black, usedColor, this.fontSize, this.font, this.scoreManipulator);
    }

    function quizzManagerDisplay() {
        let verticalPosition = drawing.height * HEADER_SIZE;
        this.height = drawing.height - drawing.height * HEADER_SIZE;
        this.quizzManagerManipulator.first.move(0, verticalPosition);
        this.quizzManagerManipulator.last.children.indexOf(this.libraryIManipulator.first) === -1 && this.quizzManagerManipulator.last.add(this.libraryIManipulator.first);
        this.quizzManagerManipulator.last.children.indexOf(this.quizzInfoManipulator.first) === -1 && this.quizzManagerManipulator.last.add(this.quizzInfoManipulator.first);
        this.quizzManagerManipulator.last.children.indexOf(this.questionsPuzzleManipulator.first) === -1 && this.quizzManagerManipulator.last.add(this.questionsPuzzleManipulator.first);
        this.quizzManagerManipulator.last.children.indexOf(this.questionCreator.manipulator.first) === -1 && this.quizzManagerManipulator.last.add(this.questionCreator.manipulator.first);
        this.quizzManagerManipulator.last.children.indexOf(this.previewButtonManipulator.first) === -1 && this.quizzManagerManipulator.last.add(this.previewButtonManipulator.first);
        this.quizzManagerManipulator.last.children.indexOf(this.saveQuizButtonManipulator.first) === -1 && this.quizzManagerManipulator.last.add(this.saveQuizButtonManipulator.first);
        this.libraryWidth = drawing.width * this.libraryWidthRatio;
        this.questCreaWidth = drawing.width * this.questCreaWidthRatio;
        this.quizzInfoHeight = this.height * this.quizzInfoHeightRatio;
        this.questionsPuzzleHeight = this.height * this.questionsPuzzleHeightRatio;
        this.libraryHeight = this.height * this.libraryHeightRatio;
        this.questCreaHeight = this.height * this.questCreaHeightRatio;
        this.saveButtonHeight = this.height * this.saveButtonHeightRatio;
        this.previewButtonHeight = this.height * this.previewButtonHeightRatio;
        this.buttonWidth = 150;
        this.globalMargin = {
            height: this.marginRatio * this.height * 2,
            width: this.marginRatio * drawing.width
        };
        this.questionPuzzleCoordinates = {
            x: this.globalMargin.width / 2,
            y: (this.quizzInfoHeight + this.questionsPuzzleHeight / 2 + this.globalMargin.height / 2),
            w: (drawing.width - this.globalMargin.width),
            h: (this.questionsPuzzleHeight - this.globalMargin.height)
        };

        drawing.currentPageDisplayed = 'QuizManager';
        mainManipulator.ordonator.set(1, this.quizzManagerManipulator.first);

        this.questionClickHandler = event => {
            let question;
            if (typeof event.pageX == "undefined" || typeof event.pageY == "undefined") {
                question = event.question;
            }
            else {
                var target = drawings.background.getTarget(event.pageX, event.pageY);
                question = target.parent.parentManip.parentObject;
            }
            question.parentQuizz.parentFormation.quizzManager.questionCreator.explanation = null;
            if (this.quizz.tabQuestions[this.indexOfEditedQuestion]) {
                this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator && this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator.flush();
                this.quizz.tabQuestions[this.indexOfEditedQuestion].tabAnswer.forEach(answer=> {
                    if (answer.popIn) {
                        this.questionCreator.manipulator.last.children.indexOf(answer.popIn.manipulator.first) !== -1 && this.questionCreator.manipulator.last.remove(answer.popIn.manipulator.first);
                    }
                })
            }
            question.selected = true;
            let quizzManager = question.parentQuizz.parentFormation.quizzManager,
                quizz = quizzManager.quizz,
                tabQuestions = quizz.tabQuestions,
                questionCreator = quizzManager.questionCreator;
            this.indexOfEditedQuestion !== this.quizz.tabQuestions.indexOf(question) && (tabQuestions[quizzManager.indexOfEditedQuestion].selected = false);
            quizzManager.indexOfEditedQuestion = tabQuestions.indexOf(question);
            quizzManager.displayQuestionsPuzzle(null, null, null, null, quizzManager.questionPuzzle.indexOfFirstVisibleElement);
            questionCreator.loadQuestion(question);
            questionCreator.display(questionCreator.previousX, questionCreator.previousY, questionCreator.previousW, questionCreator.previousH);
            questionCreator.explanation && questionCreator.manipulator.last.remove(questionCreator.explanation.manipulator.first);
        };

        let displayFunctions = () => {
            this.displayQuizzInfo(this.globalMargin.width / 2, this.quizzInfoHeight / 2, drawing.width, this.quizzInfoHeight);
            this.displayQuestionsPuzzle(this.questionPuzzleCoordinates.x, this.questionPuzzleCoordinates.y, this.questionPuzzleCoordinates.w, this.questionPuzzleCoordinates.h);
            this.questionCreator.display(this.library.x + this.libraryWidth, this.library.y,
                this.questCreaWidth - this.globalMargin.width, this.questCreaHeight);
            this.displayPreviewButton(drawing.width / 2 - this.buttonWidth, this.height - this.previewButtonHeight / 2,
                this.buttonWidth, this.previewButtonHeight - this.globalMargin.height);
            this.displayQuizSaveButton(drawing.width / 2 + this.buttonWidth, this.height - this.saveButtonHeight / 2,
                this.buttonWidth, this.saveButtonHeight - this.globalMargin.height);
            mainManipulator.ordonator.unset(0);
            header.display("Formation : " + this.parentFormation.label);
        };

        this.library.display(this.globalMargin.width / 2, this.quizzInfoHeight + this.questionsPuzzleHeight + this.globalMargin.height / 2,
            this.libraryWidth - this.globalMargin.width / 2, this.libraryHeight, () => {
                displayFunctions();
            });
    }

    function quizzManagerDisplayQuizzInfo(x, y, w, h) {
        this.quizzInfoManipulator.last.children.indexOf(this.returnButtonManipulator.first) === -1 && this.quizzInfoManipulator.last.add(this.returnButtonManipulator.first);

        let returnHandler = (event)=> {
            let target = drawings.background.getTarget(event.pageX, event.pageY);
            target.parentObj.parent.parentFormation.quizzManager.questionCreator.explanation = null;
            if (this.quizz.tabQuestions[this.indexOfEditedQuestion]) {
                this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator && this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator.flush();
                this.quizz.tabQuestions[this.indexOfEditedQuestion].tabAnswer.forEach(answer=> {
                    if (answer.popIn) {
                        this.questionCreator.manipulator.last.children.indexOf(answer.popIn.manipulator.first) !== -1 && this.questionCreator.manipulator.last.remove(answer.popIn.manipulator.first);
                    }
                })
            }
            target.parentObj.parent.quizzNameValidInput = true;
            target.parentObj.parent.quizzManagerManipulator.flush();
            target.parentObj.parent.quizzDisplayed = false;
            target.parentObj.parent.parentFormation.publishedButtonActivated = false;
            target.parentObj.parent.parentFormation.displayFormation();
            [].concat(...target.parentObj.parent.parentFormation.levelsTab.map(level => level.gamesTab))
                .forEach(game => {
                    game.miniature.selected = false;
                    game.miniature.updateSelectionDesign();
                });
        };

        this.returnButton.display(-2 * MARGIN, 0, 20, 20);
        this.returnButton.setHandler(returnHandler);

        var showTitle = ()=> {
            var text = (this.quizzName) ? this.quizzName : this.quizzNameDefault;
            var color = (this.quizzName) ? myColors.black : myColors.grey;
            var bgcolor = myColors.lightgrey;

            this.quizzLabel = {};
            var width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBoundingClientRect().width;
            this.quizzLabel.content = autoAdjustText(text, w, h / 2, 15, "Arial", this.quizzInfoManipulator).text;
            this.quizzNameHeight = svg.runtime.boundingRect(this.quizzLabel.content.component).height;

            this.quizzLabel.cadre = new svg.Rect(width, 0.5 * h);
            this.quizzNameValidInput ? this.quizzLabel.cadre.color(bgcolor) : this.quizzLabel.cadre.color(bgcolor, 2, myColors.red);
            this.quizzLabel.cadre.position(width / 2, h / 2 + this.quizzLabel.cadre.height / 2);
            this.quizzInfoManipulator.ordonator.set(0, this.quizzLabel.cadre);
            this.quizzLabel.content.position(0, h / 2 + this.quizzLabel.cadre.height * 9 / 12).color(color).anchor("start");
            this.quizzInfoManipulator.first.move(x, y);
            svg.addEvent(this.quizzLabel.content, "dblclick", dblclickEditionQuizz);
            svg.addEvent(this.quizzLabel.cadre, "dblclick", dblclickEditionQuizz);
        };

        var dblclickEditionQuizz = ()=> {
            let bounds = svg.runtime.boundingRect(this.quizzLabel.content.component);
            let globalPointCenter = this.quizzLabel.content.globalPoint(0, -bounds.height + 3);
            this.quizzInfoManipulator.ordonator.unset(1);
            let contentareaStyle = {
                leftpx: globalPointCenter.x,
                toppx: globalPointCenter.y,
                width: 700,
                height: (this.quizzNameHeight + 3) - MARGIN / 2
            };
            drawing.notInTextArea = false;
            let textarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
            textarea.color([], 0, myColors.black)
                .message(this.quizzName)
                .font("Arial", 15)
                .anchor("start");
            (this.quizzNameDefault || this.quizzName === "") && textarea.placeHolder(this.quizzNameDefault);
            drawings.screen.add(textarea);
            textarea.focus();
            textarea.value = this.quizzName;

            var removeErrorMessage = ()=> {
                this.questionCreator.quizzNameValidInput = true;
                this.errorMessage && this.quizzInfoManipulator.ordonator.unset(5);
                this.quizzLabel.cadre.color(myColors.lightgrey);
            };

            var displayErrorMessage = ()=> {
                removeErrorMessage();
                this.quizzLabel.cadre.color(myColors.lightgrey, 2, myColors.red);
                var anchor = 'start';
                this.errorMessage = new svg.Text(REGEX_ERROR);
                this.quizzInfoManipulator.ordonator.set(5, this.errorMessage);
                this.errorMessage.position(this.quizzLabel.cadre.width + MARGIN, bounds.height + 3 + this.quizzLabel.cadre.height / 2 + svg.runtime.boundingRect(this.errorMessage.component).height / 2)
                    .font("Arial", 15).color(myColors.red).anchor(anchor);
                textarea.focus();
                //this.quizzNameValidInput = false;
            };
            var onblur = ()=> {
                textarea.enter();
                this.quizzName = textarea.messageText.trim();
                this.quizz.title = textarea.messageText.trim();
                drawings.screen.remove(textarea);
                drawing.notInTextArea = true;
                showTitle();
            };
            var oninput = ()=> {
                textarea.enter();
                this.checkInputTextArea({
                    textarea: textarea,
                    border: this.quizzLabel.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
            };
            svg.addEvent(textarea, "input", oninput);
            svg.addEvent(textarea, "blur", onblur);
            this.checkInputTextArea({
                textarea: textarea,
                border: this.quizzLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        showTitle();
    }

    function quizzManagerDisplayPreviewButton(x, y, w, h) {
        this.previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, this.previewButtonManipulator);
        this.previewFunction = () => {
            this.toggleButtonHeight = 40;
            this.quizz.isValid = true;
            let message;
            let arrayOfUncorrectQuestions = [];
            if (this.questionCreator.explanation) {
                if (this.questionCreator.explanation.answer.popIn) {
                    this.questionCreator.manipulator.last.children.indexOf(this.questionCreator.explanation.answer.popIn.manipulator.first) !== -1 && this.questionCreator.manipulator.last.remove(this.questionCreator.explanation.answer.popIn.manipulator.first);
                    this.questionCreator.explanation = null;
                }
            }
            this.quizz.tabQuestions.forEach(question => {
                if (!(question instanceof AddEmptyElement)) {
                    question.questionType.validationTab.forEach((funcEl) => {
                        var result = funcEl(question);
                        if (!result.isValid) {
                            message = result.message;
                            arrayOfUncorrectQuestions.push(question.questionNum - 1);
                        }
                        this.quizz.isValid = this.quizz.isValid && result.isValid;
                    });
                }
            });
            if (!this.quizz.isValid) {
                this.displayMessage(message, myColors.red);
                //this.selectFirstInvalidQuestion(arrayOfUncorrectQuestions[0]);
            }
            this.displayEditedQuestion = ()=> {
                drawing.currentPageDisplayed = "QuizPreview";
                this.quizzManagerManipulator.flush();
                this.quizz.tabQuestions.pop();
                this.quizz.tabQuestions.forEach((it) => {
                    (it.tabAnswer[it.tabAnswer.length - 1] instanceof AddEmptyElement) && it.tabAnswer.pop();
                });

                this.previewQuiz = new Quizz(this.quizz, true);
                this.previewQuiz.currentQuestionIndex = this.indexOfEditedQuestion;
                this.previewQuiz.run(1, 1, drawing.width, drawing.height);//
            };
            if (this.quizz.isValid) {
                this.displayEditedQuestion();
            }
        };
        svg.addEvent(this.previewButton.cadre, "click", this.previewFunction);
        svg.addEvent(this.previewButton.content, "click", this.previewFunction);
        this.previewButtonManipulator.translator.move(x, y);
    }

    function quizzManagerDisplaySaveButton(x, y, w, h) {
        this.saveButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveQuizButtonManipulator);
        svg.addEvent(this.saveButton.cadre, "click", () => this.saveQuizz());
        svg.addEvent(this.saveButton.content, "click", () => this.saveQuizz());
        this.saveQuizButtonManipulator.translator.move(x, y);
    }

    function quizzManagerDisplayQuestionPuzzle(x, y, w, h) {
        //var index = ind ? ind : 0;
        x && (this.qPuzzleX = x);
        y && (this.qPuzzleY = y);
        w && (this.qPuzzleW = w);
        h && (this.qPuzzleH = h);
        var border = new svg.Rect(this.qPuzzleW, this.qPuzzleH);
        border.color([], 2, myColors.black);
        this.questionsPuzzleManipulator.ordonator.set(0, border);
        this.questionsPuzzleManipulator.first.move(this.qPuzzleX + this.qPuzzleW / 2, this.qPuzzleY);
        this.coordinatesQuestion = {
            x: 0,
            y: 0,
            w: border.width - this.globalMargin.width / 2,
            h: this.questionsPuzzleHeight - this.globalMargin.height
        };
        this.questionPuzzle.updateElementsArray(this.quizz.tabQuestions);
        this.questionPuzzle.fillVisibleElementsArray("leftToRight");
        if (!this.questionPuzzle.handlersSet) {
            this.questionPuzzle.leftChevron.handler = this.questionPuzzle.leftChevronHandler;
            this.questionPuzzle.rightChevron.handler = this.questionPuzzle.rightChevronHandler;
            this.questionPuzzle.handlersSet = true;
        }
        this.questionsPuzzleManipulator.last.children.indexOf(this.questionPuzzle.manipulator.first) === -1 && this.questionsPuzzleManipulator.last.add(this.questionPuzzle.manipulator.first);
        this.questionPuzzle.display(this.coordinatesQuestion.x, this.coordinatesQuestion.y, this.qPuzzleW, this.qPuzzleH, true);
        this.questionPuzzle.checkPuzzleElementsArrayValidity(this.questionPuzzle.elementsArray);
    }

    function inscriptionManagerDisplay() {
        drawing.currentPageDisplayed = "InscriptionManager";
        header.display("Inscription");
        mainManipulator.ordonator.set(1, this.manipulator.first);
        this.manipulator.first.move(drawing.width / 2, drawing.height / 2);
        var w = drawing.width / 5;
        var x = drawing.width / 9;
        var trueValue = "";
        let focusedField;

        var clickEditionField = (field, manipulator)=> {
            return ()=> {
                var width = w;
                var height = this.h;
                var globalPointCenter = this[field].cadre.globalPoint(-(width) / 2, -(height) / 2);
                var contentareaStyle = {
                    toppx: globalPointCenter.y,
                    leftpx: globalPointCenter.x,
                    height: height,
                    width: width
                };
                drawing.notInTextArea = false;
                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
                contentarea.message(this[field].labelSecret || this[field].label);
                contentarea.color(null, 0, myColors.black).font("Arial", 20);
                this[field].secret ? contentarea.type('password') : contentarea.type("text");
                manipulator.ordonator.unset(1, this[field].content.text);
                drawings.screen.add(contentarea);
                contentarea.focus();
                var displayErrorMessage = (trueManipulator = manipulator)=> {
                    emptyAreasHandler();
                    if (!(field === "passwordConfirmationField" && trueManipulator.ordonator.children[3].messageText)) {
                        var message = autoAdjustText(this[field].errorMessage, drawing.width, this.h, 20, null, trueManipulator, 3);
                        message.text.color(myColors.red).position(this[field].cadre.width / 2 + MARGIN, this[field].cadre.height + MARGIN);
                    }
                };
                var oninput = ()=> {
                    contentarea.enter();
                    if (this[field].secret && trueValue && contentarea.messageText && trueValue.length < contentarea.messageText.length) {
                        trueValue += contentarea.messageText.substring(contentarea.messageText.length - 1);
                    } else if (this[field].secret) {
                        trueValue = trueValue && contentarea.messageText && trueValue.substring(0, contentarea.messageText.length);
                    }
                    this[field].label = contentarea.messageText;
                    this[field].labelSecret !== "undefined" && (this[field].labelSecret = trueValue);
                    if ((field === "lastNameField" || field === 'firstNameField' ) && !this[field].checkInput()) {
                        displayErrorMessage();
                        this[field].cadre.color(myColors.white, 3, myColors.red);
                    }
                    else {
                        field !== "passwordConfirmationField" && manipulator.ordonator.unset(3);
                        this[field].cadre.color(myColors.white, 1, myColors.black);
                    }
                };
                svg.addEvent(contentarea, "input", oninput);
                var alreadyDeleted = false;
                var onblur = ()=> {
                    if (!alreadyDeleted) {
                        contentarea.enter();
                        if (this[field].secret) {
                            this[field].label = '';
                            this[field].labelSecret = contentarea.messageText;
                            if (contentarea.messageText) {
                                for (let i = 0; i < contentarea.messageText.length; i++) {
                                    this[field].label += '●';
                                }
                            }
                        } else {
                            this[field].label = contentarea.messageText;
                        }
                        contentarea.messageText && displayField(field, manipulator);
                        if (this[field].checkInput()) {
                            this[field].cadre.color(myColors.white, 1, myColors.black);
                            field !== "passwordConfirmationField" && manipulator.ordonator.unset(3);
                        }
                        else {
                            this[field].secret || displayErrorMessage();
                            this[field].secret || this[field].cadre.color(myColors.white, 3, myColors.red);
                        }
                        drawings.screen.remove(contentarea);
                        drawing.notInTextArea = true;
                        alreadyDeleted = true;
                    }
                };
                svg.addEvent(contentarea, "blur", onblur);
                focusedField = this[field];
            };
        };
        var displayField = (field, manipulator)=> {
            manipulator.translator.move(-drawing.width / 10, this[field].line * drawing.height / 10);
            var fieldTitle = new svg.Text(this[field].title).position(0, 0).font("Arial", 20).anchor("end");
            manipulator.ordonator.set(2, fieldTitle);
            this.h = 1.5 * svg.runtime.boundingRect(fieldTitle.component).height;
            var displayText = displayTextWithoutCorners(this[field].label, w, this.h, myColors.black, myColors.white, 20, null, manipulator);
            this[field].content = displayText.content;
            this[field].cadre = displayText.cadre;
            var y = -svg.runtime.boundingRect(fieldTitle.component).height / 4;
            this[field].content.position(x, 0);
            this[field].cadre.position(x, y);
            var clickEdition = clickEditionField(field, manipulator);
            svg.addEvent(this[field].content, "click", clickEdition);
            svg.addEvent(this[field].cadre, "click", clickEdition);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
            this.formLabels[field] = this[field].label;
        };

        var nameCheckInput = (field)=> {
            if (this[field].label) {
                this[field].label = this[field].label.trim();
                var regex = /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g;
                return this[field].label.match(regex);
            }
        };

        var nameErrorMessage = "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés";
        this.lastNameField = {label: this.formLabels.lastNameField || "", title: this.lastNameLabel, line: -3};
        this.lastNameField.checkInput = () => nameCheckInput("lastNameField");
        this.lastNameField.errorMessage = nameErrorMessage;
        displayField("lastNameField", this.lastNameManipulator);

        this.firstNameField = {label: this.formLabels.firstNameField || "", title: this.firstNameLabel, line: -2};
        this.firstNameField.errorMessage = nameErrorMessage;
        this.firstNameField.checkInput = () => nameCheckInput("firstNameField");
        displayField("firstNameField", this.firstNameManipulator);

        this.mailAddressField = {label: this.formLabels.mailAddressField || "", title: this.mailAddressLabel, line: -1};
        this.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
        this.mailAddressField.checkInput = ()=> {
            if (this.mailAddressField.label) {
                var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
                return this.mailAddressField.label === "" || this.mailAddressField.label.match(regex);
            }
        };
        displayField("mailAddressField", this.mailAddressManipulator);

        var passwordCheckInput = ()=> {
            var passTooShort = this.passwordField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordField.labelSecret.length < 6;
            var confTooShort = this.passwordConfirmationField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordConfirmationField.labelSecret.length < 6;
            var cleanIfEgality = ()=> {
                if (this.passwordField.labelSecret === this.passwordConfirmationField.labelSecret) {
                    this.passwordField.cadre.color(myColors.white, 1, myColors.black);
                    this.passwordConfirmationField.cadre.color(myColors.white, 1, myColors.black);
                }
            };
            if (passTooShort || confTooShort) {
                if (passTooShort) {
                    this.passwordField.cadre.color(myColors.white, 3, myColors.red);
                    var message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                    message.text.color(myColors.red).position(this.passwordField.cadre.width / 2 + MARGIN, this.passwordField.cadre.height + MARGIN);
                }
                if (confTooShort) {
                    this.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
                    message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                    message.text.color(myColors.red).position(this.passwordField.cadre.width / 2 + MARGIN, this.passwordField.cadre.height + MARGIN);
                }
            }
            else if (this.passwordConfirmationField.labelSecret !== "" && this.passwordConfirmationField.labelSecret !== this.passwordField.labelSecret) {
                this.passwordField.cadre.color(myColors.white, 3, myColors.red);
                this.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
                this.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
                message = autoAdjustText(this.passwordConfirmationField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                message.text.color(myColors.red).position(this.passwordField.cadre.width / 2 + MARGIN, this.passwordField.cadre.height + MARGIN);
            }
            else if (this.passwordField.labelSecret && this.passwordField.labelSecret.length >= 6) {
                this.passwordField.cadre.color(myColors.white, 1, myColors.black);
                this.passwordManipulator.ordonator.unset(3);
                cleanIfEgality();
            }
            else {
                cleanIfEgality();
                this.passwordManipulator.ordonator.unset(3);
            }
            return !(passTooShort || confTooShort || this.passwordConfirmationField.labelSecret !== this.passwordField.labelSecret);
        };

        this.passwordField = {
            label: this.formLabels.passwordField || "",
            labelSecret: (this.tabForm[3] && this.tabForm[3].labelSecret) || "",
            title: this.passwordLabel,
            line: 0,
            secret: true,
            errorMessage: "La confirmation du mot de passe n'est pas valide"
        };
        this.passwordField.errorMessage = "Le mot de passe doit contenir au minimum 6 caractères";
        this.passwordField.checkInput = passwordCheckInput;
        displayField("passwordField", this.passwordManipulator);

        this.passwordConfirmationField = {
            label: this.formLabels.passwordConfirmationField || "",
            labelSecret: (this.tabForm[4] && this.tabForm[4].labelSecret) || "",
            title: this.passwordConfirmationLabel,
            line: 1,
            secret: true,
            errorMessage: "La confirmation du mot de passe n'est pas valide"
        };
        this.passwordConfirmationField.checkInput = passwordCheckInput;
        displayField("passwordConfirmationField", this.passwordConfirmationManipulator);

        var AllOk = ()=> {
            return this.lastNameField.checkInput() &&
                this.firstNameField.checkInput() &&
                this.mailAddressField.checkInput() &&
                this.passwordField.checkInput() &&
                this.passwordConfirmationField.checkInput();
        };

        var emptyAreasHandler = (save)=> {
            var emptyAreas = this.tabForm.filter(field=> field.label === "");
            emptyAreas.forEach(function (emptyArea) {
                save && emptyArea.cadre.color(myColors.white, 3, myColors.red);
            });
            if (emptyAreas.length > 0 && save) {
                var message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -this.saveButton.cadre.height + MARGIN);
            }
            else {
                this.saveButtonManipulator.ordonator.unset(3);
            }
            return (emptyAreas.length > 0);
        };

    this.saveButtonHandler = () => {
        if (!emptyAreasHandler(true) && AllOk()){
            this.passwordField.hash = TwinBcrypt.hashSync(this.passwordField.labelSecret);
            let tempObject = {
                lastName: this.lastNameField.label,
                firstName: this.firstNameField.label,
                mailAddress: this.mailAddressField.label,
                password: this.passwordField.hash
            };
            Server.inscription(tempObject)
                .then(data => {
                    let created = JSON.parse(data);
                    if (created) {
                        var messageText = "Votre compte a bien été créé !";
                        var message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                        message.text.color(myColors.green).position(0, - this.saveButton.cadre.height+MARGIN);
                        setTimeout(() => {
                            this.saveButtonManipulator.ordonator.unset(3);
                        }, 10000);
                    } else {
                        throw "Un utilisateur possède déjà cette adresse mail !"
                    }
                })
                .catch((messageText) => {
                    let message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, -this.saveButton.cadre.height + MARGIN);
                    setTimeout(() => {
                        this.saveButtonManipulator.ordonator.unset(3);
                    }, 10000);
                });
        }
        else if (!AllOk()){
            let messageText = "Corrigez les erreurs des champs avant d'enregistrer !",
                message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - this.saveButton.cadre.height+MARGIN);
        }
    };
    this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
    this.saveButtonWidth = Math.min(drawing.width * this.saveButtonWidthRatio, 200);
    this.saveButton = displayText(this.saveButtonLabel, this.saveButtonWidth, this.saveButtonHeight, myColors.black, myColors.white, 20, null, this.saveButtonManipulator);
    this.saveButtonManipulator.first.move(0, 2.5*drawing.height/10);
    svg.addEvent(this.saveButton.content, "click", this.saveButtonHandler);
    svg.addEvent(this.saveButton.cadre, "click", this.saveButtonHandler);

        let nextField = (backwards = false)=> {
            let index = this.tabForm.indexOf(focusedField);
            if (index !== -1) {
                backwards ? index-- : index++;
                if (index === this.tabForm.length) index = 0;
                if (index === -1) index = this.tabForm.length - 1;
                clickEditionField(this.tabForm[index].field, this.tabForm[index].cadre.parent.parentManip)();
            }
        };
        svg.runtime.addGlobalEvent("keydown", (event)=> {
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                nextField(event.shiftKey);
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                document.activeElement && document.activeElement.blur();
                this.saveButtonHandler();
            }
        });
        AllOk();
    }

    function connexionManagerDisplay() {
        drawing.currentPageDisplayed = "ConnexionManager";
        header.display("Connexion");

        mainManipulator.ordonator.set(1, this.manipulator.first);
        this.manipulator.first.move(drawing.width / 2, drawing.height / 2);
        let w = drawing.width / 6;
        let x = drawing.width / 10;

        let focusedField;

        var clickEditionField = (field, manipulator)=> {
            return ()=> {
                var width = w;
                var height = this.h;
                var globalPointCenter = this[field].cadre.globalPoint(-(width) / 2, -(height) / 2);
                var contentareaStyle = {
                    toppx: globalPointCenter.y,
                    leftpx: globalPointCenter.x,
                    height: height,
                    width: this[field].cadre.width
                };
                drawing.notInTextArea = false;
                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);

                contentarea.message(this[field].labelSecret || this[field].label);
                contentarea.color(null, 0, myColors.black).font("Arial", 20);
                this[field].secret && contentarea.type('password');
                manipulator.ordonator.unset(1, this[field].content.text);
                drawings.screen.add(contentarea);
                contentarea.focus();

                var alreadyDeleted = false;
                var onblur = ()=> {
                    if (!alreadyDeleted) {
                        contentarea.enter();
                        if (this[field].secret) {
                            this[field].label = '';
                            this[field].labelSecret = contentarea.messageText;
                            if (contentarea.messageText) {
                                for (let i = 0; i < contentarea.messageText.length; i++) {
                                    this[field].label += '●';
                                }
                            }
                        } else {
                            this[field].label = contentarea.messageText;
                        }
                        contentarea.messageText && displayField(field, manipulator);
                        manipulator.ordonator.unset(3);
                        drawing.notInTextArea = true;
                        alreadyDeleted || drawings.screen.remove(contentarea);
                        alreadyDeleted = true;
                    }
                };
                svg.addEvent(contentarea, "blur", onblur);
                focusedField = this[field];
            };
        };
        var displayField = (field, manipulator)=> {
            var fieldTitle = new svg.Text(this[field].title).position(0, 0);
            fieldTitle.font("Arial", 20).anchor("end");
            manipulator.ordonator.set(2, fieldTitle);
            manipulator.first.move(-drawing.width / 10, this[field].line * drawing.height / 10);
            this.h = 1.5 * svg.runtime.boundingRect(fieldTitle.component).height;
            var displayText = displayTextWithoutCorners(this[field].label, w, this.h, myColors.black, myColors.white, 20, null, manipulator);
            this[field].content = displayText.content;
            this[field].cadre = displayText.cadre;
            var y = -svg.runtime.boundingRect(fieldTitle.component).height / 4;
            this[field].content.position(x, 0);
            this[field].cadre.position(x, y);
            var clickEdition = clickEditionField(field, manipulator);
            svg.addEvent(this[field].content, "click", clickEdition);
            svg.addEvent(this[field].cadre, "click", clickEdition);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
        };

        this.mailAddressField = {label: "", title: this.mailAddressLabel, line: -1};
        this.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
        this.mailAddressField.checkInput = ()=> {
            let regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            return this.mailAddressField.label === "" || this.mailAddressField.label.match(regex);
        };
        displayField("mailAddressField", this.mailAddressManipulator);
        this.passwordField = {
            label: '',
            labelSecret: '',
            title: this.passwordLabel,
            line: 0,
            secret: true,
            errorMessage: "La confirmation du mot de passe n'est pas valide"
        };

        displayField('passwordField', this.passwordManipulator);
        this.connexionButton = displayText(this.connexionButtonLabel, this.connexionButtonWidth, this.connexionButtonHeight, myColors.black, myColors.white, 20, null, this.connexionButtonManipulator);
        this.connexionButtonManipulator.first.move(0, 2.5 * drawing.height / 10);
        svg.addEvent(this.connexionButton.content, "click", this.connexionButtonHandler);
        svg.addEvent(this.connexionButton.cadre, "click", this.connexionButtonHandler);

        let nextField = (backwards = false)=> {
            let index = this.tabForm.indexOf(focusedField);
            if (index !== -1) {
                backwards ? index-- : index++;
                if (index === this.tabForm.length) index = 0;
                if (index === -1) index = this.tabForm.length - 1;
                clickEditionField(this.tabForm[index].field, this.tabForm[index].cadre.parentManip);
                svg.event(this.tabForm[index].cadre, "click", this.connexionButtonHandler);
            }
        };

        svg.runtime.addGlobalEvent("keydown", (event)=> {
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                nextField(event.shiftKey);
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                document.activeElement && document.activeElement.blur();
                this.connexionButtonHandler();
            }
        });
    }

    var AdminGUI = function () {
        globalVariables.playerMode = false;
        playerMode = false;
        AddEmptyElement.prototype.display = addEmptyElementDisplay;
        Answer.prototype.display = answerDisplay;
        Bd.prototype.display = bdDisplay;
        Bd.prototype.displayMiniature = gameDisplayMiniature;
        ConnexionManager.prototype.display = connexionManagerDisplay;
        Formation.prototype.displayFormation = formationDisplayFormation;
        Formation.prototype.displayFormationPublicationButton = formationDisplayPublicationButton;
        Formation.prototype.displayFormationSaveButton = formationDisplaySaveButton;
        Formation.prototype.displayFormationDeactivationButton = formationDisplayDeactivateButton;
        Formation.prototype.removeErrorMessage = formationRemoveErrorMessage;
        FormationsManager.prototype.display = formationsManagerDisplay;
        GamesLibrary.prototype.display = gamesLibraryDisplay;
        Header.prototype.display = headerDisplay;
        ImagesLibrary.prototype.display = imagesLibraryDisplay;
        Library.prototype.display = libraryDisplay;
        PopIn.prototype.display = popInDisplay;
        Question.prototype.display = questionDisplay;
        Question.prototype.displayAnswers = questionDisplayAnswers;
        Question.prototype.elementClicked = questionElementClicked;
        Question.prototype.selectedQuestion = questionSelectedQuestion;
        QuestionCreator.prototype.display = questionCreatorDisplay;
        QuestionCreator.prototype.displayToggleButton = questionCreatorDisplayToggleButton;
        QuestionCreator.prototype.displayQuestionCreator = questionCreatorDisplayQuestionCreator;
        Quizz.prototype.display = quizzDisplay;
        Quizz.prototype.displayMiniature = gameDisplayMiniature;
        Quizz.prototype.displayResult = quizzDisplayResult;
        Quizz.prototype.displayScore = quizzDisplayScore;
        QuizzManager.prototype.display = quizzManagerDisplay;
        QuizzManager.prototype.displayPreviewButton = quizzManagerDisplayPreviewButton;
        QuizzManager.prototype.displayQuestionsPuzzle = quizzManagerDisplayQuestionPuzzle;
        QuizzManager.prototype.displayQuizzInfo = quizzManagerDisplayQuizzInfo;
        QuizzManager.prototype.displayQuizSaveButton = quizzManagerDisplaySaveButton;

        header = new Header();
        globalVariables.header = header;
    };

    var LearningGUI = function () {
        globalVariables.playerMode = true;
        playerMode = true;
        Answer.prototype.display = answerDisplay;
        Bd.prototype.displayMiniature = gameDisplayMiniature;
        ConnexionManager.prototype.display = connexionManagerDisplay;
        Formation.prototype.displayFormation = playerModeDisplayFormation;
        FormationsManager.prototype.display = formationsManagerDisplay;
        Header.prototype.display = headerDisplay;
        InscriptionManager.prototype.display = inscriptionManagerDisplay;
        Library.prototype.display = libraryDisplay;
        PopIn.prototype.display = popInDisplay;
        Question.prototype.display = questionDisplay;
        Question.prototype.displayAnswers = questionDisplayAnswers;
        Question.prototype.elementClicked = questionElementClicked;
        Question.prototype.selectedQuestion = questionSelectedQuestion;
        Quizz.prototype.display = quizzDisplay;
        Quizz.prototype.displayMiniature = gameDisplayMiniature;
        Quizz.prototype.displayResult = quizzDisplayResult;
        Quizz.prototype.displayScore = quizzDisplayScore;

        header = new Header();
        globalVariables.header = header;
    };

    return {
        setGlobalVariables,
        AdminGUI,
        LearningGUI
    }
};
