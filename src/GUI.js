exports.GUI = function (globalVariables) {

    let svg, gui, util, domain, runtime, drawings, drawing, imageController, playerMode,
        header, AddEmptyElement, Answer, Bd, Formation, FormationsManager, GamesLibrary, Header,
        ImagesLibrary, Library, PopIn, Question, QuestionCreator, Quizz, QuizzManager,
        InscriptionManager, ConnexionManager, Manipulator, MiniatureGame, Picture, Puzzle, Server,
        mainManipulator, main, dbListener;

    setGlobalVariables = () => {
        svg = globalVariables.svg;
        gui = globalVariables.gui;
        util = globalVariables.util;
        domain = globalVariables.domain;
        runtime = globalVariables.runtime;
        drawings = globalVariables.drawings;
        drawing = globalVariables.drawing;
        imageController = globalVariables.imageController;
        main = globalVariables.main;
        dbListener = globalVariables.dbListener;

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
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        let answerEditableDisplay = (x, y, w, h) => {
            let checkboxSize = h * 0.2;
            this.obj = {};
            let redCrossClickHandler = ()=> {
                this.redCrossManipulator.flush();
                let index = this.parentQuestion.tabAnswer.indexOf(this);
                drawing.mousedOverTarget = null;
                drawings.screen.remove(this.parentQuestion.tabAnswer[index].obj.video);
                this.parentQuestion.tabAnswer.splice(index, 1);
                let questionCreator = this.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                if (this.parentQuestion.tabAnswer.length < 3) {
                    svg.event(this.parentQuestion.tabAnswer[this.parentQuestion.tabAnswer.length - 1].manipulator.ordonator.children[2], 'dblclick', {});
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
                    this.redCrossManipulator = new Manipulator(this).addOrdonator(2);
                    this.manipulator && this.manipulator.add(this.redCrossManipulator);
                }
                let redCrossSize = 15;
                let redCross = drawRedCross(this.width / 2 - redCrossSize, -this.height / 2 + redCrossSize, redCrossSize, this.redCrossManipulator)
                    .mark('redCross');
                svg.addEvent(redCross, 'click', redCrossClickHandler);
                this.redCrossManipulator.set(1, redCross);
            };

            let removeErrorMessage = () => {
                this.invalidLabelInput = false;
                this.errorMessage && this.editor.parent.questionCreator.manipulator.unset(1);
                this.border.color(myColors.white, 1, myColors.black);
            };

            let displayErrorMessage = (message) => {
                removeErrorMessage();
                this.border.color(myColors.white, 2, myColors.red);
                let quizzManager = this.parentQuestion.parentQuizz.parentFormation.quizzManager,
                    anchor = 'middle';
                this.errorMessage = new svg.Text(message);
                quizzManager.questionCreator.manipulator.set(1, this.errorMessage);
                this.errorMessage.position(0, quizzManager.questionCreator.h / 2 - MARGIN / 2)
                    .font('Arial', 15).color(myColors.red).anchor(anchor)
                    .mark('answerErrorMessage');
                this.invalidLabelInput = message;
            };

            let answerBlockDisplay = ()=> {
                let text = (this.label) ? this.label : this.labelDefault,
                    color = (this.label) ? myColors.black : myColors.grey;

                if (this.image) {
                    this.imageLayer = 2;
                    let pictureRedCrossClickHandler = ()=>{
                        this.imageLayer && this.manipulator.unset(this.imageLayer);//image
                        this.image = null;
                        this.imageSrc = null;
                        let puzzle = this.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator.puzzle;
                        let x = -(puzzle.visibleArea.width - this.width) / 2 + this.puzzleColumnIndex * (puzzle.elementWidth + MARGIN);
                        let y = -(puzzle.visibleArea.height - this.height) / 2 + this.puzzleRowIndex * (puzzle.elementHeight + MARGIN) + MARGIN;
                        this.display(x, y, this.width, this.height);
                        this.parentQuestion.checkValidity();
                    };
                    let picture = new Picture(this.image.src, true, this, text, pictureRedCrossClickHandler);
                    picture.draw(0, 0, w, h, this.manipulator, w - 2 * checkboxSize);
                    this.border = picture.imageSVG.border;
                    this.obj.image = picture.imageSVG.image;
                    this.obj.content = picture.imageSVG.content;
                    this.obj.image.mark('answerImage' + this.parentQuestion.tabAnswer.indexOf(this));
                }else if (this.video) {
                    this.obj && this.obj.video && drawings.screen.remove(this.obj.video);
                    let obj = drawVideo(text, this.video, w, h, this.colorBordure, this.bgColor, this.fontsize, this.font, this.manipulator, true, false, 8);
                    this.obj.content = obj.content;
                    this.border = obj.border;
                    this.obj.video = obj.video;
                }
                else {
                    var tempObj = displayText(text, w, h, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, 0, 1, w - 2 * checkboxSize);
                    this.border = tempObj.border;
                    this.obj.content = tempObj.content;
                    this.obj.content.position(0, this.obj.content.y);
                }

                (!this.invalidLabelInput && text !== "") ? (this.border.color(myColors.white, 1, myColors.black).fillOpacity(0.001)) : (this.border.color(myColors.white, 2, myColors.red).fillOpacity(0.001));
                (!this.invalidLabelInput && text !== "") || displayErrorMessage(this.invalidLabelInput);
                this.obj.content.color(color).mark('answerLabelContent' + this.parentQuestion.tabAnswer.indexOf(this));
                this.border._acceptDrop = true;
                this.obj.content._acceptDrop = true;
                this.border.mark('answerLabelCadre' + this.parentQuestion.tabAnswer.indexOf(this));

                svg.addEvent(this.obj.content, 'dblclick', dblclickEditionAnswer);
                svg.addEvent(this.border, 'dblclick', dblclickEditionAnswer);
                svg.addEvent(this.border, 'mouseover', mouseoverHandler);
                svg.addEvent(this.border, 'mouseout', mouseleaveHandler);
            };

            let dblclickEditionAnswer = () => {
                let contentarea = {};
                contentarea.height = this.obj.content.boundingRect().height;
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
                contentarea.message(this.label || "")
                    .mark('answerLabelContentArea')
                    .width = w;
                contentarea.globalPointCenter = this.obj.content.globalPoint(-(contentarea.width) / 2, -(contentarea.height) / 2);
                drawings.screen.add(contentarea);
                contentarea.height = this.obj.content.boundingRect().height;
                this.manipulator.unset(1);
                contentarea.setCaretPosition(this.label.length);

                let onblur = () => {
                    contentarea.enter();
                    this.label = contentarea.messageText;
                    drawings.screen.remove(contentarea);
                    drawing.notInTextArea = true;
                    answerBlockDisplay();
                    let quizzManager = this.parentQuestion.parentQuizz.parentFormation.quizzManager;
                    quizzManager.displayQuestionsPuzzle(null, null, null, null, quizzManager.questionPuzzle.indexOfFirstVisibleElement);
                };
                let objectToBeCheck = {
                    contentarea: contentarea,
                    border: this.border,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                };
                svg.addEvent(contentarea, 'input', () => {
                    contentarea.enter();
                    this.checkInputContentArea(objectToBeCheck);
                });
                svg.addEvent(contentarea, 'blur', onblur);
                this.checkInputContentArea(objectToBeCheck);
            };
            this.manipulator.flush();
            this.manipulator.move(x, y);
            answerBlockDisplay();
            this.penHandler = () => {
                this.popIn = this.popIn || new PopIn(this, true);
                let questionCreator = this.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                this.popIn.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                questionCreator.explanation = this.popIn;
            };
            displayPen(this.width / 2 - checkboxSize, this.height / 2 - checkboxSize, checkboxSize, this);

            if (typeof this.obj.checkbox === 'undefined') {
                this.obj.checkbox = displayCheckbox(-this.width / 2 + checkboxSize, this.height / 2 - checkboxSize, checkboxSize, this).checkbox;
                this.obj.checkbox.mark('checkbox' + this.parentQuestion.tabAnswer.indexOf(this));
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
            this.border = obj.border;
            this.content = obj.text;
            this.image = obj.image;
        } else if (this.video) { // Reponse avec Texte uniquement
            let obj = drawVideo(this.label, this.video, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, true);
            this.border = obj.border;
            this.content = obj.content;
            this.video.miniature = obj.video;
        } else if (this.label && !this.imageSrc) { // Reponse avec Texte uniquement
            let obj = displayText(this.label, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator);
            this.border = obj.border;
            this.content = obj.content;
        } else if (this.imageSrc && !this.label) { // Reponse avec Image uniquement
            let obj = displayImageWithBorder(this.imageSrc, this.dimImage, this.width, this.height, this.manipulator);
            this.image = obj.image;
            this.border = obj.border;
        } else { // Cas pour test uniquement : si rien, n'affiche qu'une border
            this.border = new svg.Rect(this.width, this.height).color(this.bgColor, 1, myColors.black).corners(25, 25);
            this.manipulator.add(this.border);
        }
        let index = "answer" + this.parentQuestion.tabAnswer.indexOf(this);
        this.content && this.content.mark(index);

        if (this.parentQuestion.parentQuizz.previewMode) {
            if (this.explanation && (this.explanation.image || this.explanation.video || this.explanation.label)) {
                const openPopIn = () => {
                    svg.speechSynthesisCancel();
                    this.parentQuestion.parentQuizz.closePopIn();
                    let popInParent = this.parentQuestion,
                        popInX = this.parentQuestion.parentQuizz.x,
                        popInY,
                        popInWidth = this.parentQuestion.width,
                        popInHeight = this.parentQuestion.tileHeightMax * this.parentQuestion.lines * 0.8;
                    this.explanationPopIn = this.explanationPopIn || new PopIn(this, false);
                    if (this.parentQuestion.image) {
                        popInY = (this.parentQuestion.tileHeightMax * this.parentQuestion.lines + (this.parentQuestion.lines - 1) * MARGIN) / 2 + this.parentQuestion.parentQuizz.questionHeightWithImage / 2 + MARGIN;
                    } else {
                        popInY = (this.parentQuestion.tileHeightMax * this.parentQuestion.lines + (this.parentQuestion.lines - 1) * MARGIN) / 2 + this.parentQuestion.parentQuizz.questionHeightWithoutImage / 2 + MARGIN;
                    }
                    if (globalVariables.textToSpeechMode && this.explanationPopIn.label && (!this.explanationPopIn.video || !this.explanationPopIn.said)) {
                        setTimeout(()=>{svg.speechSynthesisSpeak(this.explanationPopIn.label)}, 200);
                        this.explanationPopIn.said = true;
                        (this.explanationPopIn.image || this.explanationPopIn.video) && this.explanationPopIn.display(popInParent, popInX, popInY, popInWidth, popInHeight);
                    }
                    else {
                        this.explanationPopIn.display(popInParent, popInX, popInY, popInWidth, popInHeight);
                    }
                };
                if (this.explanationPopIn && this.explanationPopIn.displayed) this.parentQuestion.openPopIn = openPopIn;
                this.image && svg.addEvent(this.image, "click", openPopIn);
                this.border && svg.addEvent(this.border, "click", openPopIn);
                this.content && svg.addEvent(this.content, "click", openPopIn);

                const pictoSize = 20,
                    explanationIconArray = drawExplanationIcon(this.border.width / 2 - pictoSize, this.border.height / 2 - pictoSize, pictoSize, this.explanationIconManipulator);
                this.manipulator.set(7, this.explanationIconManipulator);
                explanationIconArray.forEach(elem => svg.addEvent(elem, "click", openPopIn));
            }

        } else if(playerMode && !this.parentQuestion.parentQuizz.previewMode){
                let clickAnswerHandler = () => {
                    this.select();
                    if (this.parentQuestion.multipleChoice && this.selected) {
                        this.colorBordure = this.border.strokeColor;
                        this.border.color(this.bgColor, 5, SELECTION_COLOR);
                        this.parentQuestion.resetManipulator.ordonator.children[0].color(myColors.yellow, 1, myColors.green);
                    }else if (this.parentQuestion.multipleChoice){
                        this.border.color(this.bgColor, 1, this.colorBordure);
                        if (this.parentQuestion.selectedAnswers.length === 0) {
                            this.parentQuestion.resetManipulator.ordonator.children[0].color(myColors.grey, 1, myColors.grey);
                        }
                    }
                };
                this.border && svg.addEvent(this.border, "click", () => {clickAnswerHandler()});
                this.content && svg.addEvent(this.content, "click", () => {clickAnswerHandler()});
                this.image && svg.addEvent(this.image, "click", () => {clickAnswerHandler()});
        }
        if (this.selected) { // image pré-selectionnée
            this.border.color(this.bgColor, 5, SELECTION_COLOR);
        }
        this.manipulator.move(this.x, this.y);
    }

    function libraryDisplay(x, y, w, h, ratioPanelHeight, yPanel) {
        this.libraryManipulator.flush();
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        let borderSize = 3;

        this.border = new svg.Rect(w - borderSize, h, this.libraryManipulator)
            .color(myColors.white, borderSize, myColors.black)
            .position(w / 2, h / 2);
        this.libraryManipulator.set(0, this.border);
        this.libraryManipulator.move(this.x, this.y);

        this.panel = new gui.Panel(w - 4, ratioPanelHeight * h, myColors.white, 2).position(w / 2 + 0.5, yPanel);
        this.panel.border.color([], 3, [0, 0, 0]);
        this.libraryManipulator.set(2, this.panel.component);
        this.panel.vHandle.handle.color(myColors.lightgrey, 2, myColors.grey);
        drawing.notInTextArea = true;
        svg.addGlobalEvent("keydown", (event) => {
            if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        });
        var hasKeyDownEvent = (event) => {
            return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
        };
    }

    function gamesLibraryDisplay(x, y, w, h) {
        libraryDisplay.call(this, x + MARGIN, y, w, h, 0.9, 0.9*h / 2);

        let displayArrowModeButton = () => {
            this.libraryManipulator.remove(this.arrowModeManipulator);
            this.libraryManipulator.add(this.arrowModeManipulator);
            this.arrowModeManipulator.move(w / 2, h - 0.05 * h);

            let createLink = (parentGame, childGame) => {
                if (childGame.isChildOf(parentGame)) return;
                if (parentGame.levelIndex >= childGame.levelIndex) return;
                let arrow = new Arrow(parentGame, childGame);
                this.formation.createLink(parentGame, childGame, arrow);
                arrow.arrowPath.mark(parentGame.id + childGame.id);
            };

            let arrowModeButton = displayText('', w * 0.9, (6 / 100) * h, myColors.black, myColors.white, null, this.font, this.arrowModeManipulator);
            arrowModeButton.arrow = drawStraightArrow(-0.3 * w, 0, 0.3 * w, 0);
            arrowModeButton.arrow.color(myColors.black, 1, myColors.black).mark("arrowModeArrow");
            this.arrowModeManipulator.set(2, arrowModeButton.arrow);
            arrowModeButton.border.mark('arrowModeButtonCadre');

            this.toggleArrowMode = () => {
                this.arrowMode = !this.arrowMode;

                let panel = this.formation.panel,
                    graph = this.formation.graphManipulator.last,
                    clip = this.formation.clippingManipulator.last,
                    glass = new svg.Rect(panel.width, panel.height).opacity(0.001).color(myColors.white);

                if (this.arrowMode) {
                    this.gameSelected = null;
                    this.itemsTab.forEach(e => {
                        e.miniature.border.color(myColors.white, 1, myColors.black)
                    });

                    this.formation.selectedGame && this.formation.selectedGame.miniatureClickHandler();
                    arrowModeButton.border.color(myColors.white, 3, SELECTION_COLOR);
                    arrowModeButton.arrow.color(myColors.blue, 2, myColors.black);
                    clip.add(glass);
                    glass.position(glass.width / 2, glass.height / 2);

                    let mouseDownAction = (event) => {
                        event.preventDefault();
                        let targetParent = graph.getTarget(event.pageX, event.pageY);

                        let mouseUpAction = (event) => {
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
                    glass.mark("theGlass");
                    svg.addEvent(glass, 'mousedown', mouseDownAction);
                    svg.addEvent(glass, 'click', clickAction);
                } else {
                    arrowModeButton.border.color(myColors.white, 1, myColors.black);
                    arrowModeButton.arrow.color(myColors.black, 1, myColors.black);
                    clip.remove(clip.children[clip.children.length - 1]);
                }
            };
            svg.addEvent(arrowModeButton.border, 'click', this.toggleArrowMode);
            svg.addEvent(arrowModeButton.arrow, 'click', this.toggleArrowMode);
        };

        let displayItems = () => {
            let maxGamesPerLine = 1,
                libMargin = (w - (maxGamesPerLine * w)) / (maxGamesPerLine + 1) + 2 * MARGIN,
                tempY = (0.15 * h);

            this.itemsTab.forEach((item, i) => {
                this.panel.content.children.indexOf(this.libraryManipulators[i]) === -1 && this.panel.content.add(this.libraryManipulators[i].first);

                if (i % maxGamesPerLine === 0 && i !== 0) {
                    tempY += this.h / 4 + libMargin;
                }

                let label = myLibraryGames.tab[i].label,
                    obj = displayTextWithCircle(label, Math.min(w / 2, h / 4), h, myColors.black, myColors.white, null, this.fontSize, this.libraryManipulators[i]);
                obj.border.mark("game" + label);
                obj.border.clicked = false;
                this.itemsTab[i].miniature = obj;
                svg.addEvent(obj.border, 'mouseover', ()=>{drawings.screen.mouseCursor('pointer');});
                svg.addEvent(obj.border, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
                svg.addEvent(obj.content, 'mouseover', ()=>{drawings.screen.mouseCursor('pointer');});
                svg.addEvent(obj.content, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});

                let X = x + libMargin - 2 * MARGIN + ((i % maxGamesPerLine + 1) * (libMargin + w / 2 - 2 * MARGIN));
                this.libraryManipulators[i].move(X, tempY);
            });
            this.panel.resizeContent(w, tempY += Math.min(w / 2, h / 4) - 1);
        };

        let assignEvents = () => {
            this.itemsTab.forEach((item, i) => {
                let mouseDownAction = event => {

                    this.arrowMode && this.toggleArrowMode();
                    let mouseClickHandler = () => {
                        if (item !== this.gameSelected) {
                            this.gameSelected && this.gameSelected.miniature.border.color(myColors.white, 1, myColors.black);
                            item.miniature.border.color(myColors.white, 3, SELECTION_COLOR);
                            this.gameSelected = item;
                        } else {
                            item.miniature.border.color(myColors.white, 1, myColors.black);
                            this.gameSelected = null;
                        }
                        this.formation && !this.gameSelected && svg.removeEvent(this.formation.panel.back, "mouseup", this.formation.mouseUpGraphBlock);
                        this.formation && this.formation.clickToAdd();
                    };

                    let mouseupHandler = event => {
                        drawings.piste.remove(this.draggedObject.manipulator);
                        let target = drawings.background.getTarget(event.pageX, event.pageY);
                        let parentObject = (target && target.parent && target.parent.parentManip && target.parent.parentManip.parentObject) ? target.parent.parentManip.parentObject : null;
                        if (parentObject !== item) {
                            svg.removeEvent(this.draggedObject.border, 'click');
                            if (parentObject instanceof Formation) {
                                this.formation.dropAction(event);
                            }
                        }
                        this.draggedObject = null;
                    };

                    let createDraggableCopy = () =>{
                        let manipulator = new Manipulator(this).addOrdonator(2);
                        drawings.piste.add(manipulator);
                        let point = item.miniature.border.globalPoint(0, 0);
                        manipulator.move(point.x, point.y);
                        this.draggedObject = displayTextWithCircle(this.itemsTab[i].miniature.content.messageText, w / 2, h, myColors.black, myColors.white, null, this.fontSize, manipulator);
                        this.draggedObject.manipulator = manipulator;
                        this.draggedObject.border.mark("draggedGameCadre");
                        this.draggedObject.create = this.itemsTab[i].create;
                        manipulator.set(0, this.draggedObject.border);
                        manageDnD(this.draggedObject.border, manipulator);
                        manageDnD(this.draggedObject.content, manipulator);
                    };

                    createDraggableCopy();

                    svg.event(drawings.glass, "mousedown", event);
                    svg.addEvent(this.draggedObject.border, 'click', mouseClickHandler);
                    svg.addEvent(this.draggedObject.border, 'mouseup', mouseupHandler);
                    svg.addEvent(this.draggedObject.content, 'mouseup', mouseupHandler);
                };

                svg.addEvent(item.miniature.border, 'mousedown', mouseDownAction);
                svg.addEvent(item.miniature.content, 'mousedown', mouseDownAction);
            });
        };

        displayItems();
        displayArrowModeButton();
        assignEvents();
    }

    function imagesLibraryDisplay(x, y, w, h, callback = () => {}) {

        let display = (x, y, w, h) => {
            libraryDisplay.call(this, x, y, w, h, 0.8, h/2);

            const uploadFiles = (files) => {
                for (let file of files) {
                    let progressDisplay;
                    this.selectedTab = 0;
                    if (file.type === 'video/mp4') {
                        this.selectedTab = 1;
                        progressDisplay = (() => {
                            const width = 0.8 * w,
                                manipulator = new Manipulator().addOrdonator(4),
                                icon = drawUploadIcon({x: -0.56 * width, y: 5, size: 20});
                            manipulator.set(0, icon);
                            const rect = new svg.Rect(width -15, 16).color(myColors.none, 1, myColors.darkerGreen);
                            manipulator.set(1, rect);
                            manipulator.redCrossManipulator = new Manipulator(this);
                            manipulator.add(manipulator.redCrossManipulator);

                            let redCross = drawRedCross(width/2+MARGIN, 0, 15, manipulator.redCrossManipulator);
                            manipulator.redCrossManipulator.add(redCross);
                            let redCrossClickHandler = ()=> {
                                drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
                                drawings.screen.mouseCursor('default');
                                dbListener.uploadRequest && dbListener.uploadRequest.abort();
                                this.videosUploadManipulators.remove(manipulator);
                                manipulator.flush();
                            };
                            svg.addEvent(redCross, 'click', redCrossClickHandler);

                            this.videosUploadManipulators.push(manipulator);
                            return (e) => {
                                const progwidth = width * e.loaded / e.total;
                                const bar = new svg.Rect(progwidth-15, 14)
                                        .color(myColors.green)
                                        .position(-(width - progwidth) / 2, 0);
                                const percentage = new svg.Text(Math.round(e.loaded / e.total*100) + "%");
                                manipulator.set(3, percentage);
                                percentage.position(0, percentage.boundingRect().height/4);
                                manipulator.set(2, bar);
                                if (e.loaded === e.total) {
                                    this.videosUploadManipulators.remove(manipulator);
                                }
                            };
                        })();
                    }
                    this.display(x, y, w, h);
                    Server.upload(file, progressDisplay).then(() => {
                        this.display(x, y, w, h);
                    });
                }
            };

            const drop = (event) => {
                event.preventDefault();
                if (this.border.inside(event.pageX, event.pageY)) {
                    uploadFiles(event.dataTransfer.files)
                }
            };

            svg.addEvent(drawings.glass, 'dragover', (e) => {e.preventDefault()});
            svg.addEvent(drawings.glass, 'drop', drop);

            const assignImageEvents = () => {
                this.libraryManipulators.forEach(libraryManipulator => {
                    let mouseDownAction = event => {
                        let draggableImage = (() => {
                            let imgToCopy = libraryManipulator.ordonator.children[0];
                            img = displayImage(imgToCopy.src, imgToCopy.srcDimension, imgToCopy.width, imgToCopy.height, imgToCopy.name).image;
                            img.mark('imgDraged');
                            img.manipulator = new Manipulator(this).addOrdonator(2);
                            img.manipulator.set(0, img);
                            drawings.piste.add(img.manipulator);
                            let point = libraryManipulator.ordonator.children[0].globalPoint(libraryManipulator.ordonator.children[0].x, libraryManipulator.ordonator.children[0].y);
                            img.manipulator.move(point.x, point.y);
                            img.srcDimension = imgToCopy.srcDimension;
                            manageDnD(img, img.manipulator);
                            return img;
                        })();
                        let mouseupHandler = event => {
                            let svgObj = draggableImage.manipulator.ordonator.children.shift();
                            drawings.piste.remove(draggableImage.manipulator);
                            let target = drawings.background.getTarget(event.pageX, event.pageY);
                            this.dropImage(svgObj, target);
                        };
                        svg.event(drawings.glass, "mousedown", event);
                        svg.addEvent(draggableImage, 'mouseup', mouseupHandler);
                    };
                    svg.addEvent(libraryManipulator.ordonator.children[0], 'mousedown', mouseDownAction);
                    svg.addEvent(libraryManipulator.ordonator.children[1], 'mousedown', mouseDownAction);
                });
            };
            const assignVideoEvents = () => {
                this.videosManipulators.forEach((videoManipulator,i) => {
                    let mouseDownAction = event => {
                        let draggableVideo = (() => {
                            let draggableManipulator = new Manipulator(this).addOrdonator(2);
                            let video = drawVideoIcon(0, -10, 20, this);
                            video.mark('videoDragged');
                            draggableManipulator.set(0, video);
                            drawings.piste.add(draggableManipulator);
                            let videoTitle = autoAdjustText(videoManipulator.ordonator.children[1].fullTitle, 500, 50, 16, null, draggableManipulator, 1);
                            videoTitle.text.position(videoTitle.finalWidth/2 + 15, -videoTitle.finalHeight/4);
                            videoTitle.text._acceptDrop=true;
                            let point = videoManipulator.ordonator.children[0].globalPoint(videoManipulator.ordonator.children[0].x, videoManipulator.ordonator.children[0].y);
                            draggableManipulator.move(point.x, point.y);
                            video.manageDnD(draggableManipulator);
                            manageDnD(videoTitle.text, draggableManipulator);
                            return draggableManipulator;
                        })();
                        let mouseupHandler = event => {
                            drawings.piste.remove(draggableVideo);
                            let target = drawings.background.getTarget(event.pageX, event.pageY);
                            this.dropVideo(this.videosTab[i], target);
                        };
                        svg.event(drawings.glass, "mousedown", event);
                        draggableVideo.ordonator.children[0].parentManip.setHandler('mouseup', mouseupHandler);
                        svg.addEvent(draggableVideo.ordonator.children[1], 'mouseup', mouseupHandler);
                    };
                    videoManipulator.ordonator.children[0].parentManip.setHandler("mousedown", mouseDownAction);
                    svg.addEvent(videoManipulator.ordonator.children[1],"mousedown", mouseDownAction);
                });
            };

            const displayItems = () => {
                let maxImagesPerLine = Math.floor((w - MARGIN) / (this.imageWidth + MARGIN)) || 1, //||1 pour le cas de resize très petit
                    libMargin = (w - (maxImagesPerLine * this.imageWidth)) / (maxImagesPerLine + 1),
                    tempY = (0.075 * h);

                const displayImages = () => {
                    this.itemsTab.forEach((item, i) => {
                        if (i % maxImagesPerLine === 0 && i !== 0) {
                            tempY += this.imageHeight + libMargin;
                        }
                        this.panel.content.children.indexOf(this.libraryManipulators[i]) === -1 && this.panel.content.add(this.libraryManipulators[i].first);
                        this.imageLayer = 0;
                        let imageRedCrossClickHandler = ()=>{
                            this.itemsTab.splice(i, 1);
                            Server.deleteImage(item);
                            this.display(x, y, w, h);
                        };
                        let image = new Picture(item.imgSrc, true, this, null, imageRedCrossClickHandler);
                        image._acceptDrop = false;
                        image.draw(0, 0, this.imageWidth, this.imageHeight, this.libraryManipulators[i]);
                        image.name = item.name;
                        image.imageSVG.srcDimension = {width: item.width, height: item.height};
                        image.imageSVG.mark('image' + image.src.split('/')[2].split('.')[0]);
                        let X = x + libMargin + ((i % maxImagesPerLine) * (libMargin + this.imageWidth));
                        this.libraryManipulators[i].move(X, tempY);

                    });
                    this.panel.resizeContent(w, tempY += this.imageHeight);
                    assignImageEvents();
                };
                Server.getImages().then(data => {
                        let myLibraryImage = JSON.parse(data).images;
                        myLibraryImage.forEach((url, i) => {
                            this.libraryManipulators[i] || (this.libraryManipulators[i] = new Manipulator(this));
                            this.libraryManipulators[i].ordonator || (this.libraryManipulators[i].addOrdonator(2));
                            this.itemsTab[i] = imageController.getImage(url.imgSrc, function () {
                                this.imageLoaded = true; //this != library
                            });
                            this.itemsTab[i]._id = url._id;
                            this.itemsTab[i].name = url.name;
                            this.itemsTab[i].imgSrc = url.imgSrc;
                        });
                    })
                    .then(() => {
                        let intervalToken = svg.interval(() => {
                            if (this.itemsTab.every(e => e.imageLoaded)) {
                                svg.clearInterval(intervalToken);
                                displayImages();
                            }
                        }, 100);
                    });
            };

            const displayAddButton = () => {
                let fileExplorer;
                const fileExplorerHandler = () => {
                    if (!fileExplorer) {
                        let globalPointCenter = this.border.globalPoint(0, 0);
                        var fileExplorerStyle = {
                            leftpx: globalPointCenter.x,
                            toppx: globalPointCenter.y,
                            width: this.w / 5,
                            height: this.w / 5
                        };
                        fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
                        fileExplorer.type("file");
                        svg.addEvent(fileExplorer, "change", onChangeFileExplorerHandler);
                        svg.runtime.attr(fileExplorer.component, "accept", "image/*, video/mp4");
                        svg.runtime.attr(fileExplorer.component, "id", "fileExplorer");
                        svg.runtime.attr(fileExplorer.component, "hidden", "true");
                        svg.runtime.attr(fileExplorer.component, "multiple", "true");
                        drawings.screen.add(fileExplorer);
                        fileExplorer.fileClick = function(){
                            svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
                        }
                    }
                    fileExplorer.fileClick();
                };

                const onChangeFileExplorerHandler = () => {
                    uploadFiles(fileExplorer.component.files)
                };

                const addButton = new svg.Rect(this.w / 6, this.w / 6).color(myColors.white, 2, myColors.black),
                    addButtonLabel = "Ajouter image/vidéo",
                    addButtonText = autoAdjustText(addButtonLabel, 2 * this.w / 3, this.h / 15, 20, "Arial", this.addButtonManipulator),
                    plus = drawPlus(0, 0, this.w / 7, this.w / 7);
                addButton.mark('addImageButton').corners(10, 10);
                addButtonText.text.position(0, this.h / 12 - (this.h / 15) / 2 + 3 / 2 * MARGIN);

                this.addButtonManipulator.set(0, addButton);
                this.addButtonManipulator.set(2, plus);
                this.libraryManipulator.add(this.addButtonManipulator);
                this.addButtonManipulator.move(this.w / 2, 9 * this.h / 10);
                svg.addEvent(this.addButtonManipulator.ordonator.children[0], 'click', fileExplorerHandler);
                svg.addEvent(this.addButtonManipulator.ordonator.children[1], 'click', fileExplorerHandler);
                svg.addEvent(this.addButtonManipulator.ordonator.children[2], 'click', fileExplorerHandler);

            };

            const displayTabs = () => {
                const
                    width = w*0.8,
                    height = h*0.06;

                const videosPanel = new gui.Panel(w - 4, 0.8*h, myColors.white, 2);
                videosPanel.position(w / 2 + 0.5, h/2);
                videosPanel.vHandle.handle.color(myColors.lightgrey, 2, myColors.grey);

                const displayVideo = (video, manipulator)=> {
                    this.video = video;
                    let iconVideo = drawVideoIcon(0, -10, 20, this);
                    iconVideo.mark(video.name.split('.')[0]);
                    manipulator.set(0, iconVideo);
                    const title = autoAdjustText(video.name, w - 20, 20, 16, null, manipulator, 1);
                    title.text.fullTitle = video.name;
                    title.text.position(title.finalWidth/2 + 15, -title.finalHeight/4);
                    manipulator.video = video;

                    let overVideoIconHandler = ()=> {
                        let redCross = drawRedCross(0, -title.finalHeight/2, 15, manipulator.redCrossManipulator);
                        redCross.mark('videoRedCross');
                        svg.addEvent(redCross, 'mouseout', mouseleaveHandler);
                        manipulator.redCrossManipulator.add(redCross);
                        let redCrossClickHandler = ()=> {
                            Server.deleteVideo(video);
                            this.display(this.x, this.y, this.w, this.h);
                        };
                        svg.addEvent(redCross, 'click', redCrossClickHandler);
                    };

                    let mouseleaveHandler = ()=> {
                        manipulator.redCrossManipulator.flush();
                    };

                    iconVideo.setHandler('mouseover', overVideoIconHandler);
                    iconVideo.setHandler('mouseout', mouseleaveHandler);

                    svg.addEvent(title.text, 'mouseover', overVideoIconHandler);
                    svg.addEvent(title.text, 'mouseout', mouseleaveHandler);

                };

                const sortAlphabetical = function (array) {
                    return sort(array, (a, b) => (a.name.toUpperCase() < b.name.toUpperCase()));
                };

                const loadVideos = () => {
                    Server.getVideos().then(data => {
                        this.videosTab = sortAlphabetical(JSON.parse(data));
                        this.videosTab.forEach((video, i) => {
                            if (!this.videosManipulators[i]) {
                                this.videosManipulators[i] = new Manipulator().addOrdonator(2);
                            }
                            videosPanel.content.add(this.videosManipulators[i].first);
                            this.videosManipulators[i].redCrossManipulator = new Manipulator(this);
                            this.videosManipulators[i].add(this.videosManipulators[i].redCrossManipulator);
                            displayVideo(video, this.videosManipulators[i]);
                            this.videosManipulators[i].move(20, 30 + i*30 );
                        });
                        this.videosUploadManipulators.forEach((manipulator, i) => {
                            videosPanel.content.add(manipulator.first);
                            manipulator.move(w/2, 30 + (this.videosManipulators.length + i)*30)
                        });
                        videosPanel.resizeContent(w, (this.videosManipulators.length + this.videosUploadManipulators.length + 1) * 30);
                        assignVideoEvents();
                    });
                };

                const imagesPanel = this.panel;

                const createTab = function (text, width, height, fontsize, font, manipulator, setContent) {
                    let button = displayTextWithoutCorners(text, width, height, myColors.black, myColors.white, fontsize, font, manipulator);
                    button.content.position(0, 5).mark('library' + text);
                    let selected = false;

                    const select = function () {
                        selected = true;
                        button.border.color(SELECTION_COLOR, 1, myColors.black);
                        button.content.color(getComplementary(SELECTION_COLOR), 0, myColors.black);
                        setContent();
                    };

                    const unselect = function () {
                        if (selected) {
                            selected = false;
                            button.border.color(myColors.white, 1, myColors.black);
                            button.content.color(myColors.black, 0, myColors.white);
                        }
                    };

                    const setClickHandler = function (handler) {
                        svg.addEvent(button.border, 'click', handler);
                        svg.addEvent(button.content, 'click', handler);
                    };

                    return {
                        select,
                        unselect,
                        setClickHandler
                    };
                };

                const createTabManager = function (library) {
                    const tabs = [],
                        manipulator = new Manipulator().addOrdonator(2);

                    const addTab = function (name, i, setContent) {
                        const manip = new Manipulator().addOrdonator(2),
                            tab = createTab(name, width / 2, height, 20, null, manip, setContent);
                        tabs.push(tab);
                        tab.setClickHandler(() => select(i));
                        manip.move(i * (MARGIN + width / 2), 0);
                        manipulator.set(i, manip);
                    };

                    const select = function (numTab = 0) {
                        if (numTab >= tabs.length || numTab < 0) {
                            numTab = 0;
                        }
                        tabs.forEach((tab, index) => {
                            if (index === numTab) {
                                tab.select();
                                library.selectedTab = numTab;
                            } else {
                                tab.unselect();
                            }
                        });
                    };
                    return {
                        manipulator,
                        addTab,
                        select
                    };
                };
                const tabManager = createTabManager(this);
                tabManager.addTab("Images", 0, () => {
                    this.libraryManipulator.set(2, imagesPanel.component);
                });
                tabManager.addTab("Vidéos", 1, () => {
                    this.libraryManipulator.set(2, videosPanel.component);
                    loadVideos();
                });
                tabManager.manipulator.move(w/4 + MARGIN, h*0.05);
                tabManager.select(this.selectedTab);
                this.libraryManipulator.set(1, tabManager.manipulator);
                assignVideoEvents();
            };
            displayTabs();
            displayItems();
            displayAddButton();
        };
        display(x, y, w, h);
        callback();
    }

    function addEmptyElementDisplay(x, y, w, h) {
        let obj = displayText(this.label, w, h, myColors.black, myColors.white, this.fontSize, null, this.manipulator);
        let plus = drawPlus(0, 0, 2*this.fontSize, 2*this.fontSize);
        this.manipulator.move(x, y);
        this.manipulator.set(2, plus);
        obj.content.position(0, 2*this.fontSize + obj.content.boundingRect().height/2);
        obj.border.color(myColors.white, 3, myColors.black)
            .mark('emptyAnswerAddCadre' + this.type);
        obj.border.component.setAttribute && obj.border.component.setAttribute('stroke-dasharray', '10, 5');

        var dblclickAdd = ()=> {
            this.manipulator.flush();
            switch (this.type) {
                case 'answer':
                    let newAnswer = new Answer(null, this.parent.linkedQuestion);
                    newAnswer.isEditable(this, true);
                    let questionCreator = this.parent;
                    questionCreator.linkedQuestion.tabAnswer.forEach(answer => {
                        answer.obj && answer.obj.video && drawings.screen.remove(answer.obj.video);
                    });
                    questionCreator.linkedQuestion.tabAnswer.pop();
                    questionCreator.linkedQuestion.tabAnswer.push(newAnswer);

                    if (questionCreator.linkedQuestion.tabAnswer.length < questionCreator.MAX_ANSWERS) {
                        questionCreator.linkedQuestion.tabAnswer.push(new AddEmptyElement(questionCreator, this.type));
                    }
                    questionCreator.puzzle.updateElementsArray(questionCreator.linkedQuestion.tabAnswer);
                    questionCreator.puzzle && questionCreator.puzzle.fillVisibleElementsArray("leftToRight");
                    questionCreator.manipulator.add(questionCreator.puzzle.manipulator);
                    questionCreator.puzzle.display(questionCreator.coordinatesAnswers.x,
                        questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w,
                        questionCreator.coordinatesAnswers.h, false);
                    questionCreator.linkedQuestion.checkValidity();
                    break;
                case 'question':
                    drawings.screen.empty();
                    let quizzManager = this.parent;
                    quizzManager.quizz.tabQuestions.pop();
                    (quizzManager.quizz.tabQuestions.length > 0) && (quizzManager.quizz.tabQuestions[quizzManager.indexOfEditedQuestion].selected = false);
                    quizzManager.indexOfEditedQuestion = quizzManager.quizz.tabQuestions.length;
                    quizzManager.quizz.tabQuestions.forEach(question=> {
                        question.redCrossManipulator && question.redCrossManipulator.flush();
                        question.selected = false
                        question.tabAnswer.forEach(answer=> {
                            if (answer.popIn) {
                                quizzManager.questionCreator.manipulator.remove(answer.popIn.manipulator.add);
                                quizzManager.questionCreator.explanation = null;
                            }
                        })
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
        svg.addEvent(plus, "dblclick", dblclickAdd);
        svg.addEvent(obj.content, "dblclick", dblclickAdd);
        svg.addEvent(obj.border, "dblclick", dblclickAdd);
    }

    function formationDisplayFormation() {
        drawing.currentPageDisplayed = "Formation";
        header.display(this.label);
        this.formationsManager.formationDisplayed = this;
        this.globalMargin = {
            height: this.marginRatio * drawing.height,
            width: this.marginRatio * drawing.width
        };

        let borderSize = 3;
        this.manipulator.move(0, drawing.height * 0.075);
        mainManipulator.set(1, this.manipulator);
        this.manipulator.add(this.returnButtonManipulator);

        let returnHandler = () => {
            this.returnButton.manipulator.flush();
            Server.getAllFormations().then(data => {
                let myFormations = JSON.parse(data).myCollection;
                globalVariables.formationsManager = new FormationsManager(myFormations);
                globalVariables.formationsManager.display();
            });
            this.returnButton.removeHandler(returnHandler);
        };
        this.manipulator.add(this.returnButtonManipulator);
        this.returnButton.display(0, -MARGIN/2, 20, 20);
        let returnButtonChevron = this.returnButton.chevronManipulator.ordonator.children[0];
        this.returnButton.height = returnButtonChevron.boundingRect().height;
        returnButtonChevron.mark('returnButtonToFormationsManager');
        this.returnButton.setHandler(returnHandler);

        let dblclickQuizzHandler = (event, target) => {
            target = target || drawings.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
            let displayQuizzManager = () => {
                this.quizzManager.loadQuizz(target);
                this.quizzDisplayed = target;
                this.quizzManager.display();
                this.selectedArrow = null;
                this.selectedGame = null;
            };
            this.saveFormation(displayQuizzManager);
            svg.removeSelection();
        };

        let clickQuizHandler = (event, target) => {
            target = target || drawings.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
            mainManipulator.unset(1, this.manipulator.add);
            drawing.currentPageDisplayed = "QuizPreview";
            this.quizzDisplayed = new Quizz(target, false, this);
            this.quizzDisplayed.puzzleLines = 3;
            this.quizzDisplayed.puzzleRows = 3;
            this.quizzDisplayed.run(0, 0, drawing.width, drawing.height);
            svg.removeSelection();
        };

        let resizePanel = () => {
            var height = (this.levelHeight * (this.levelsTab.length + 1) > this.graphH) ? (this.levelHeight * (this.levelsTab.length + 1)) : this.graphH;
            let spaceOccupiedByAGame = (this.graphElementSize + this.minimalMarginBetweenGraphElements),
                longestLevel = this.findLongestLevel()[0],
                trueWidth = longestLevel && longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame,
                widthMAX = Math.max(this.panel.width, trueWidth);
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
            this.panel.contentV.add(level.manipulator.first);
            var lineColor = playerMode ? myColors.grey : myColors.black;
            var levelText = playerMode ? "" : "Niveau " + level.index;
            let obj = autoAdjustText(levelText, w - 3 * borderSize, this.levelHeight, 20, "Arial", level.manipulator, 0);
            obj.line = new svg.Line(MARGIN, this.levelHeight, level.parentFormation.levelWidth, this.levelHeight).color(lineColor, 3, lineColor);
            obj.line.component.setAttribute && obj.line.component.setAttribute('stroke-dasharray', '6');

            if(!playerMode){
                this.redCrossManipulator;
                let overLevelHandler = (event) => {
                    let levelIndex = -1;
                    let mouseY;
                    mouseY = this.panel.back.localPoint(event.pageX, event.pageY).y;
                    mouseY -= this.panel.contentV.y;
                    while (mouseY > -this.panel.content.height / 2) {
                        mouseY -= this.levelHeight;
                        levelIndex++;
                    }
                    this.levelsTab.forEach(levelElement => {
                        levelElement.redCrossManipulator.flush();
                    });
                    let levelObject = this.levelsTab[levelIndex];
                    if (levelIndex>=0 && levelIndex < this.levelsTab.length){
                        if (typeof levelObject.redCrossManipulator === 'undefined') {
                            levelObject.redCrossManipulator = new Manipulator(levelObject).addOrdonator(2);
                        }
                        levelObject.manipulator.set(2, levelObject.redCrossManipulator);
                        let redCrossSize = 15;
                        let redCross = this.textToDisplay ? drawRedCross(0, 0, redCrossSize, levelObject.redCrossManipulator)
                            : drawRedCross(60, -60, redCrossSize, levelObject.redCrossManipulator);
                        redCross.mark('levelRedCross');
                        levelObject.redCrossManipulator.move(obj.text.boundingRect().width/2 + levelObject.x/2, 15);
                        svg.addEvent(redCross, 'click', levelObject.redCrossClickHandler);
                        levelObject.redCrossManipulator.set(1, redCross);
                    }
                };
                let mouseleaveHandler = ()=> {
                    this.levelsTab.forEach(levelElement => {
                        levelElement.redCrossManipulator.flush();
                    });
                };

                svg.addEvent(this.panel.back, 'mouseover', overLevelHandler);
                svg.addEvent(this.panel.back, 'mouseout', mouseleaveHandler);

                level.redCrossClickHandler = () => {
                    level.redCrossManipulator.flush();
                    this.levelsTab.splice(level.index-1, 1);
                    level.manipulator.flush();
                    level.gamesTab.forEach(game => {
                        game.miniatureManipulator.flush();
                        for (let j=this.links.length-1; j>=0; j--){
                            if (this.links[j].childGame === game.id || this.links[j].parentGame === game.id){
                                this.links.splice(j, 1);
                            }
                        }
                    });
                    for (let i=level.index-1; i<this.levelsTab.length; i++){
                        this.levelsTab[i].index --;
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
                    this.library.gameSelected.miniature.border.color(myColors.white, 1, myColors.black);
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
            playerMode ? this.clippingManipulator.move(MARGIN, drawing.height * HEADER_SIZE)
                : this.clippingManipulator.move(this.libraryWidth, drawing.height * HEADER_SIZE);
            this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio - drawing.height * 0.1;//-15-this.saveButtonHeight;//15: Height Message Error

            if (typeof this.panel !== "undefined") {
                this.clippingManipulator.remove(this.panel.component);
            }
            this.panel = new gui.ScrollablePanel(w, h, myColors.white);
            this.panel.back.mark("panelBack");
            svg.addEvent(this.panel.back, 'mouseover', ()=>{drawings.screen.mouseCursor('default');});
            svg.addEvent(this.panel.back, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
            this.panel.contentV.add(this.messageDragDropManipulator.first);
            this.panel.component.move(w / 2, h / 2);
            this.clippingManipulator.add(this.panel.component);
            this.panel.contentH.add(this.graphManipulator.first);
            this.panel.hHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
            this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
            resizePanel();
            this.movePanelContent();
        };

        let updateAllLinks = () => {
            this.arrowsManipulator.flush();
            var childElement, parentElement;
            this.links.forEach((link)=> {
                this.levelsTab.forEach((level)=> {
                    level.gamesTab.forEach((game)=> {
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
                let mouseDownAction = eventDown => {
                    let miniatureElement = tabElement.miniatureManipulator.ordonator.children;
                    let putMiniatureInPiste = () =>{
                        let point = miniatureElement[0].globalPoint(0, 0);
                        this.miniaturesManipulator.remove(tabElement.miniatureManipulator);
                        tabElement.movingManipulator = new Manipulator(tabElement);
                        tabElement.movingManipulator.add(tabElement.miniatureManipulator);
                        drawings.piste.add(tabElement.movingManipulator);
                        tabElement.miniatureManipulator.move(point.x, point.y);
                        manageDnD(miniatureElement[0], tabElement.movingManipulator, () => {tabElement.miniature.moveAllLinks();});
                        manageDnD(miniatureElement[1], tabElement.movingManipulator, () => {tabElement.miniature.moveAllLinks();});
                    };
                    let mouseupHandler = eventUp => {
                        this.clicAction = () => {
                            tabElement.movingManipulator.remove(tabElement.miniatureManipulator);
                            this.miniaturesManipulator.add(tabElement.miniatureManipulator);
                            tabElement.miniatureManipulator.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
                            svg.addEvent(miniatureElement[0], 'mousedown', mouseDownAction);
                            svg.addEvent(miniatureElement[1], 'mousedown', mouseDownAction);
                            tabElement.miniature.miniatureClickHandler();
                        };
                        drawings.piste.remove(tabElement.movingManipulator);
                        let target = drawings.background.getTarget(eventUp.pageX, eventUp.pageY);
                        if (eventDown.pageX === eventUp.pageX && eventDown.pageY === eventUp.pageY) {
                            this.clicAction();
                        }
                        else if (target && target.parent && target.parent.parentManip && (target.parent.parentManip.parentObject instanceof Formation || target.parent.parentManip.parentObject instanceof Quizz)) {
                            this.dropAction(eventUp, tabElement);
                        }
                        else {
                            tabElement.movingManipulator.remove(tabElement.miniatureManipulator);
                            this.miniaturesManipulator.add(tabElement.miniatureManipulator);
                            tabElement.miniatureManipulator.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
                            this.displayGraph();
                            svg.addEvent(miniatureElement[0], 'mousedown', mouseDownAction);
                            svg.addEvent(miniatureElement[1], 'mousedown', mouseDownAction);
                        }
                    };
                    putMiniatureInPiste();
                    svg.event(drawings.glass, "mousedown", eventDown);
                    svg.addEvent(miniatureElement[0], 'mouseup', mouseupHandler);
                    svg.addEvent(miniatureElement[1], 'mouseup', mouseupHandler);
                };
                tabElement.miniatureElement = tabElement.miniature.game.miniatureManipulator.ordonator.children;
                !playerMode && svg.addEvent(tabElement.miniatureElement[0], 'mousedown', mouseDownAction);
                !playerMode && svg.addEvent(tabElement.miniatureElement[1], 'mousedown', mouseDownAction);

                this.miniaturesManipulator.add(tabElement.miniatureManipulator);// mettre un manipulateur par niveau !_! attention à bien les enlever
                tabElement.miniatureManipulator.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
                if (tabElement instanceof Quizz) {
                    let eventToUse = playerMode ? ["click", (event, tabElement) => clickQuizHandler(event, tabElement)] : ["dblclick", (event, tabElement) => dblclickQuizzHandler(event, tabElement)];
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniatureElement[0], ...eventToUse);
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniatureElement[1], ...eventToUse);
                } else if (tabElement instanceof Bd) {
                    let eventToUse = playerMode ? ["click", () => {
                    }] : ["dblclick", tabElement => dblclickBdHandler(tabElement)];
                    let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
                    var dblclickBdHandler = ()=> {
                        let targetBd = tabElement;//drawings.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
                        bdDisplay(targetBd);
                    };
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniatureElement[0], ...eventToUse);
                    tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniatureElement[1], ...eventToUse);
                    // Ouvrir le Bd creator du futur jeu Bd
                }
            };

            this.levelsTab.forEach((level)=>{
                displayLevel(this.graphCreaWidth, this.graphCreaHeight, level);
                this.adjustGamesPositions(level);
                this.miniaturesManipulator.last.mark("miniaturesManipulatorLast");
                level.gamesTab.forEach((tabElement)=> {
                    tabElement.miniatureManipulator.ordonator || tabElement.miniatureManipulator.addOrdonator(3);
                    this.miniaturesManipulator.add(tabElement.miniatureManipulator);// mettre un manipulateur par niveau !_! attention à bien les enlever
                    if (typeof tabElement.miniature === "undefined") {
                        (tabElement.miniature = tabElement.displayMiniature(this.graphElementSize));
                    }
                    manageMiniature(tabElement);
                });
            });
            !playerMode && displayMessageDragAndDrop();
            this.graphManipulator.move(this.graphW / 2, this.graphH / 2);
            resizePanel();
            this.panel.back.parent.parentManip = this.graphManipulator;
            updateAllLinks();
        };

        if (playerMode) {
            this.graphCreaHeightRatio = 0.97;
            this.graphCreaHeight = (drawing.height - drawing.height * HEADER_SIZE - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
            this.graphCreaWidth = drawing.width - 2 * MARGIN;
            displayFrame(this.graphCreaWidth, this.graphCreaHeight);
            this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
            this.clippingManipulator.move((drawing.width - this.graphCreaWidth) / 2, this.formationsManager.y / 2 - borderSize);
        } else {
            this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
            this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
            this.graphCreaHeight = (drawing.height - drawing.height*HEADER_SIZE - 40 - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.gamesLibraryManipulator = this.library.libraryManipulator;
            this.manipulator.set(4, this.gamesLibraryManipulator);
            this.manipulator.set(0, this.formationInfoManipulator);
            this.libraryWidth = drawing.width * this.libraryWidthRatio;
            this.y = drawing.height * HEADER_SIZE;
            this.titleSvg = new svg.Text("Formation : ").position(MARGIN, this.returnButton.height*1.3).font("Arial", 20).anchor("start");
            this.manipulator.set(2, this.titleSvg);
            let formationWidth = this.titleSvg.boundingRect().width;
            let formationLabel = {};

            let dblclickEditionFormationLabel = () => {
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
                contentarea.color(myColors.lightgrey, 0, myColors.black)
                    .font("Arial", 15)
                    .mark("formationLabelContentArea")
                    .anchor("start");
                (this.label === "" || this.label === this.labelDefault) ? contentarea.placeHolder(this.labelDefault) : contentarea.message(this.label);
                drawings.screen.add(contentarea);
                contentarea.setCaretPosition(this.label.length);

                var removeErrorMessage = ()=> {
                    this.errorMessage && this.formationInfoManipulator.unset(2);
                    formationLabel.border.color(myColors.lightgrey, 1, myColors.none);
                };

                var displayErrorMessage = ()=> {
                    removeErrorMessage();
                    formationLabel.border.color(myColors.lightgrey, 2, myColors.red);
                    var anchor = 'start';
                    this.errorMessage = new svg.Text(REGEX_ERROR_FORMATION)
                        .position(formationLabel.border.width + formationWidth + 2 * MARGIN, 0)
                        .font("Arial", 15).color(myColors.red).anchor(anchor);
                    this.formationInfoManipulator.set(2, this.errorMessage);
                    contentarea.setCaretPosition(this.label.length);
                    this.invalidLabelInput = REGEX_ERROR_FORMATION;
                };
                var onblur = ()=> {
                    contentarea.enter();
                    this.label = contentarea.messageText.trim();
                    drawings.screen.remove(contentarea);
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
                let bgcolor = myColors.lightgrey;
                this.formationLabelWidth = 400;
                let textToDisplay;
                if (text.length > MAX_CHARACTER_TITLE){
                    textToDisplay = text.substr(0, MAX_CHARACTER_TITLE) + "...";
                }
                formationLabel.content = autoAdjustText(textToDisplay ? textToDisplay : text, this.formationLabelWidth, 20, 15, "Arial", this.formationInfoManipulator).text;
                formationLabel.content.mark('formationLabelContent');
                this.labelHeight = formationLabel.content.boundingRect().height;
                this.formationTitleWidth = this.titleSvg.boundingRect().width;
                formationLabel.border = new svg.Rect(this.formationLabelWidth, this.labelHeight + MARGIN);
                this.invalidLabelInput ? formationLabel.border.color(bgcolor, 2, myColors.red) : formationLabel.border.color(bgcolor);
                formationLabel.border.position(this.formationTitleWidth + this.formationLabelWidth / 2 + 3 / 2 * MARGIN, -MARGIN / 2);
                this.formationInfoManipulator.set(0, formationLabel.border);
                formationLabel.content.position(this.formationTitleWidth + 2 * MARGIN, 0).color(color).anchor("start");
                this.formationInfoManipulator.move(0, this.returnButton.height*1.3);
                svg.addEvent(formationLabel.content, "dblclick", dblclickEditionFormationLabel);
                svg.addEvent(formationLabel.border, "dblclick", dblclickEditionFormationLabel);
                svg.addEvent(formationLabel.content, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
                svg.addEvent(formationLabel.content, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
                svg.addEvent(formationLabel.border, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
                svg.addEvent(formationLabel.border, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
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

    function playerModeDisplayFormation() {
        this.trackProgress(formationDisplayFormation)
    }

    function formationRemoveErrorMessage(message) {
        message && message.parent && message.parent.remove(message);
    }

    function formationDisplaySaveButton(x, y, w, h) {
        let saveFormationButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveFormationButtonManipulator);
        this.message && this.message.parent && this.saveFormationButtonManipulator.remove(this.message);
        saveFormationButton.border.mark("saveFormationButtonCadre");
        svg.addEvent(saveFormationButton.border, "click", () => this.saveFormation());
        svg.addEvent(saveFormationButton.content, "click", () => this.saveFormation());
        this.saveFormationButtonManipulator.move(x, y);
    }

    function formationDisplayDeactivateButton(x, y, w, h) {
        let deactivateFormationButton = displayText("Désactiver", w, h, myColors.black, myColors.white, 20, null, this.deactivateFormationButtonManipulator);
        svg.addEvent(deactivateFormationButton.border, "click", () => this.deactivateFormation());
        svg.addEvent(deactivateFormationButton.content, "click", () => this.deactivateFormation());
        this.deactivateFormationButtonManipulator.move(x, y);
    }

    function formationDisplayPublicationButton(x, y, w, h) {
        let label = "Publier";
        let publicationFormationButton = displayText(label, w, h, myColors.black, myColors.white, 20, null, this.publicationFormationButtonManipulator);
        this.errorMessagePublication && this.errorMessagePublication.parent && this.publicationFormationButtonManipulator.remove(this.errorMessagePublication);
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
                                    message.push("Un ou plusieurs jeu(x) ne sont pas complet(s)");
                                    arrayOfUncorrectQuestions.push(question.questionNum - 1);
                                }
                                result && (checkQuizz.isValid = checkQuizz.isValid && result.isValid);
                            });
                        }
                        allQuizzValid = allQuizzValid && checkQuizz.isValid;
                    });
                    checkQuizz.isValid || game.miniatureManipulator.ordonator.children[0].color(myColors.white, 3, myColors.red);
                });
            });
            if (!allQuizzValid) {
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

    function formationsManagerDisplay() {
        drawing.currentPageDisplayed = 'FormationsManager';
        this.manipulator.move(0, drawing.height * HEADER_SIZE);
        mainManipulator.set(1, this.manipulator);
        this.manipulator.add(this.headerManipulator);

        let toggleFormationsCheck;

        if (playerMode) {
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
            let heightAllocatedToPanel = drawing.height - (playerMode ?
                toggleFormationsCheck.globalPoint(0, 0).y + toggleFormationsCheck.height + MARGIN :
                addFormationButton.border.globalPoint(0, 0).y + addFormationButton.border.height);
            spaceBetweenElements = {
                width: this.panel ? 0.015 * this.panel.width : 0.015 * drawing.width,
                height: this.panel ? 0.030 * this.panel.height : 0.030 * drawing.height
            };
            this.y = (!playerMode) ? this.addButtonHeight * 1.5 : toggleFormationsCheck.height * 2;//drawing.height * this.header.size;

            this.rows = Math.floor((drawing.width - 2 * MARGIN) / (this.tileWidth + spaceBetweenElements.width));
            if (this.rows === 0) this.rows = 1;

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
            this.clippingManipulator.move(MARGIN / 2, this.y);
            var formationPerLine = Math.floor((drawing.width - 2 * MARGIN) / ((this.tileWidth + spaceBetweenElements.width)));
            var widthAllocatedToDisplayedElementInPanel = Math.floor((drawing.width - 2 * MARGIN) - (formationPerLine * (this.tileWidth + spaceBetweenElements.width)));
            if (typeof this.panel === "undefined") {
                this.panel = new gui.Panel(drawing.width - 2 * MARGIN, heightAllocatedToPanel, myColors.none);
            }
            else {
                this.panel.resize(drawing.width - 2 * MARGIN, heightAllocatedToPanel);
            }
            this.panel.component.move(((drawing.width - 2 * MARGIN) + MARGIN) / 2, heightAllocatedToPanel / 2);
            this.clippingManipulator.add(this.panel.component);
            this.panel.content.children.indexOf(this.formationsManipulator.first) === -1 && this.panel.content.add(this.formationsManipulator.first);
            this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
            this.formationsManipulator.move((this.tileWidth + widthAllocatedToDisplayedElementInPanel) / 2, this.tileHeight / 2 + spaceBetweenElements.height / 2);
        };

        let onClickFormation = formation => {
            formation.miniature.removeHandler(onClickFormation);
            Server.getVersionById(formation._id).then(data => {
                var myFormation = JSON.parse(data).formation;
                formation.loadFormation(myFormation);
                this.formationDisplayed = formation;
                this.formationDisplayed.displayFormation();
                drawings.screen.mouseCursor('default');
            });
        };

        var onClickNewFormation = () => {
            var formation = new Formation({}, this);
            this.formationDisplayed = formation;
            formation.parent = this;
            formation.displayFormation();
            drawings.screen.mouseCursor('default');
        };

        this.displayHeaderFormations = () => {
            this.headerManipulator.move(0, 0);
            addFormationButton = displayText("Ajouter une formation", drawing.width / 7, this.addButtonHeight, myColors.none, myColors.lightgrey, 20, null, this.addButtonManipulator);
            addFormationButton.border.mark("addFormationCadre");
            var addFormationButtonTextBr = addFormationButton.content.boundingRect();
            addFormationButton.border.position(MARGIN + addFormationButtonTextBr.width / 2, -addFormationButtonTextBr.height / 2).corners(0, 0);
            addFormationButton.content.position(this.plusDim + addFormationButtonTextBr.width / 2, -addFormationButtonTextBr.height / 8);
            let addFormationObject = drawPlusWithCircle(MARGIN, -addFormationButtonTextBr.height / 2, this.addButtonHeight, this.addButtonHeight);
            this.addButtonManipulator.set(2, addFormationObject.circle);
            this.addButtonManipulator.set(3, addFormationObject.plus);
            addFormationObject.circle.position(MARGIN, -addFormationButtonTextBr.height / 2);

            svg.addEvent(addFormationObject.circle, "click", onClickNewFormation);
            svg.addEvent(addFormationObject.plus, "click", onClickNewFormation);
            svg.addEvent(addFormationButton.content, "click", onClickNewFormation);
            svg.addEvent(addFormationButton.border, "click", onClickNewFormation);

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
        header.display("Liste des formations");
        !playerMode && this.displayHeaderFormations();
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
                    posy += (this.tileHeight + spaceBetweenElements.height);
                    posx = this.initialFormationsPosX;
                }
                formation.parent = this;
                this.formationsManipulator.add(formation.miniature.miniatureManipulator);
                formation.miniature.display(posx, posy, this.tileWidth, this.tileHeight);
                formation.miniature.setHandler(onClickFormation);
                count++;
                posx += (this.tileWidth + spaceBetweenElements.width);
            });
            this.panel.resizeContent(this.panel.width, totalLines * (spaceBetweenElements.height + this.tileHeight) + spaceBetweenElements.height - MARGIN);
        };
        (this.tileHeight > 0) && this.displayFormations();
    }

    function headerDisplay(message) {
        const width = drawing.width,
            height = HEADER_SIZE * drawing.height,
            manip = this.manipulator,
            userManip = this.userManipulator,
            text = new svg.Text(this.label).position(MARGIN, height * 0.75).font('Arial', 20).anchor('start'),
            line = new svg.Line(0, height, width, height).color(myColors.black, 3, myColors.black);
        manip.set(1, text);
        manip.set(0, line);
        mainManipulator.set(0, manip);

        const displayUser = () => {

            let pos = -MARGIN;
            const deconnexion = displayText("Déconnexion", width * 0.15, height, myColors.none, myColors.none, 20, null, userManip, 4, 5),
                deconnexionWidth = deconnexion.content.boundingRect().width,
                ratio = 0.65,
                body = new svg.CurvedShield(35 * ratio, 30 * ratio, 0.5).color(myColors.black),
                head = new svg.Circle(12 * ratio).color(myColors.black, 2, myColors.white),
                userText = autoAdjustText(drawing.username, width * 0.23, height, 20, null, userManip, 3);

            pos -= deconnexionWidth / 2;
            deconnexion.content.position(pos, 0);
            deconnexion.border.position(pos, -30 / 2).mark('deconnection');
            pos -= deconnexionWidth / 2 + 40;
            userText.text.anchor('end').position(pos, 0);
            pos -= userText.finalWidth;
            userManip.set(0, body);
            userManip.set(1, head);

            pos -= body.boundingRect().width / 2 + MARGIN;
            body.position(pos, -5 * ratio);
            head.position(pos, -20 * ratio);
            userManip.move(width, height * 0.75);

            const deconnexionHandler = () => {
                svg.setCookie("token=; path=/; max-age=0;");
                drawings.screen.empty();
                drawing.username = null;
                mainManipulator.flush();
                main(svg, runtime, dbListener);
            };
            svg.addEvent(deconnexion.content, "click", deconnexionHandler);
            svg.addEvent(deconnexion.border, "click", deconnexionHandler);
        };

        if (message) {
            const messageText = autoAdjustText(message, width * 0.3, height, 32, 'Arial', manip, 2);
            messageText.text.position(width / 2, height / 2 + MARGIN)
                .mark("headerMessage");
        } else {
            manip.unset(2);
        }

        manip.add(userManip);
        if (drawing.username){
            displayUser();
            returnToListFormation = ()=> {
                drawings.screen.empty();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new FormationsManager(myFormations);
                    globalVariables.formationsManager.display();
                });
            };
            svg.addEvent(text, 'click', returnToListFormation);
        }
        if (message === "Inscription" || message === "Connexion") {
            const link = message === "Inscription" ? "Connexion" : "Inscription";
            const clickHandler = () => {
                (link === "Inscription") ? globalVariables.inscriptionManager.display() : globalVariables.connexionManager.display();
            };
            const special = displayText(link, 220, 40, myColors.none, myColors.none, 25, 'Arial', userManip, 4, 5);
            special.border.mark('inscriptionLink');
            special.content.anchor("end");
            userManip.move(width - MARGIN, height * 0.5);
            userManip.scale(1);
            svg.addEvent(special.content, "click", clickHandler);
            svg.addEvent(special.border, "click", clickHandler);
        }
    }

    function questionDisplay(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.manipulator.flush();

        // Question avec Texte ET image
        if (typeof this.label !== "undefined" && this.imageSrc) {//&& this.label !== ""
            let obj = displayImageWithTitle(this.label, this.imageSrc, this.dimImage || {
                    width: this.image.width,
                    height: this.image.height
                }, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, this.image, this.width*0.8);
            this.border = obj.border;
            this.content = obj.content;
            this.image = obj.image;
        }
        else if (this.video) {//&& this.label !== ""
            let obj;
            if (this.parentQuizz.previewMode || playerMode) {
                obj = drawVideo(this.label, this.video, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, true);
            }
            else {
                obj = drawVideo(this.label, this.video, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, false);
            }
            this.border = obj.border;
            this.content = obj.content;
            this.miniatureVideo = obj.video;
            obj.video.mark('questionVideoToPlay');
        }
        // Question avec Texte uniquement
        else if (typeof this.label !== "undefined" && !this.imageSrc) {
            var object = displayText(this.label, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, 0, 1, this.width*0.8);
            this.border = object.border;
            this.content = object.content;
        }
        // Question avec Image uniquement
        else if (this.imageSrc && !this.label) {
            this.image = displayImage(this.imageSrc, this.dimImage, this.width, this.height).image;
            this.manipulator.set(2, this.image);
        }
        else {
            this.border = new svg.Rect(this.width, this.height).color(this.bgColor, 1, this.colorBordure);
            this.manipulator.set(0, this.border);
        }

        if (playerMode) {
            if (this.parentQuizz.currentQuestionIndex >= this.parentQuizz.tabQuestions.length) {
                let event = () => {
                    drawings.screen.empty();
                    let tempFinishedQuizz = Object.assign({}, this.parentQuizz);
                    this.finishedQuizz = new Quizz(tempFinishedQuizz, true);
                    this.finishedQuizz.currentQuestionIndex = this.questionNum - 1;
                    this.finishedQuizz.parentFormation.quizzDisplayed = this.finishedQuizz;
                    this.finishedQuizz.run(1, 1, drawing.width, drawing.height);
                };
                this.border && svg.addEvent(this.border, "click", event);
                this.content && svg.addEvent(this.content, "click", event);
                this.image && svg.addEvent(this.image, "click", event);
            }
        } else if (!this.parentQuizz.previewMode) {
            this.border && svg.addEvent(this.border, "click", this.parentQuizz.parentFormation.quizzManager.questionClickHandler);
            this.content && svg.addEvent(this.content, "click", this.parentQuizz.parentFormation.quizzManager.questionClickHandler);
            this.image && svg.addEvent(this.image, "click", this.parentQuizz.parentFormation.quizzManager.questionClickHandler);
        }

        this.border.mark('questionFromPuzzleBordure' + this.questionNum);

        var fontSize = Math.min(20, this.height * 0.1);
        this.questNum = new svg.Text(this.questionNum).position(-this.width / 2 + MARGIN + (fontSize * (this.questionNum.toString.length) / 2), -this.height / 2 + (fontSize) / 2 + 2 * MARGIN).font("Arial", fontSize);
        this.manipulator.set(4, this.questNum);
        this.manipulator.move(this.x, this.y);
        let globalPoints = this.manipulator.first.globalPoint(-50, -50);
        this.miniatureVideo && this.miniatureVideo.position(globalPoints.x, globalPoints.y);
        if (this.selected) {
            this.selectedQuestion();
        }
    }

    function questionDisplayAnswers(w, h) {

        findTileDimension = ()=>{
            const width = (w - MARGIN * (this.columns - 1)) / this.columns,
                heightMin = 2.50 * this.fontSize;
            let height = 0;
            h = h - 50;
            this.tileHeightMax = Math.floor(h / this.lines) - 2 * MARGIN;
            let tmpHeight;

            this.tabAnswer.forEach(answer=>{
                tmpHeight = (answer.image || answer.video)? this.tileHeightMax : heightMin;
                if (tmpHeight > this.tileHeightMax) {
                    height = this.tileHeightMax;
                }
                else if (tmpHeight > height) {
                    height = tmpHeight;
                }
            });
            return {width: width, height: height};
        };
        let tileDimension =  findTileDimension();
        this.manipulator.set(3, this.answersManipulator);
        this.answersManipulator.move(0, this.height / 2 + (tileDimension.height) / 2);
        let posx = 0,
            posy = 0,
            findTilePosition = (index) => {
            if (index % this.columns === 0 && index!==0) {
                posy += (tileDimension.height + MARGIN);
                posx = 0;

            } else if (index!==0){
                posx += (tileDimension.width + MARGIN);
            }
            return {x: posx, y: posy};
        };
        this.tabAnswer.forEach((answerElement, index)=> {
            let tilePosition = findTilePosition(index);
            this.answersManipulator.add(answerElement.manipulator);
            answerElement.display(-tileDimension.width / 2, -tileDimension.height / 2, tileDimension.width, tileDimension.height);
            answerElement.manipulator.move(tilePosition.x - (this.columns - 1) * (tileDimension.width) / 2 -MARGIN, tilePosition.y + MARGIN);
            let point = answerElement.border.globalPoint(-50,-50);
            answerElement.video && answerElement.video.miniature.position(point.x, point.y);
            answerElement.border.mark('answerElement' + index);
            if (!playerMode && this.parentQuizz.previewMode){
                answerElement.correct && answerElement.border.color(myColors.white, 5, myColors.primaryGreen);
            } else if(playerMode && this.parentQuizz.previewMode){
                if(this.parentQuizz.questionsAnswered[this.questionNum - 1].validatedAnswers.indexOf(index)!== -1)
                    answerElement.correct ? answerElement.border.color(myColors.greyerBlue, 5, myColors.primaryGreen) : answerElement.border.color(myColors.greyerBlue, 5, myColors.red);
                else {
                    answerElement.correct && answerElement.border.color(myColors.white, 5, myColors.primaryGreen)
                }
            } else if(playerMode && !this.parentQuizz.previewMode){
                if(this.parentQuizz.questionsAnswered.length <this.questionNum) {
                    answerElement.border.color(myColors.white, 1, answerElement.border.strokeColor);
                } else if(this.parentQuizz.questionsAnswered[this.questionNum - 1].validatedAnswers.indexOf(index)!== -1){
                    answerElement.border.color(myColors.greyerBlue, 1, answerElement.border.strokeColor);
                }
            }
        });
        this.openPopIn && this.openPopIn();
        this.openPopIn = null;
        let buttonY = tileDimension.height * (this.lines - 1 / 2) + (this.lines + 1) * MARGIN,
            buttonH = Math.min(tileDimension.height, 50),
            buttonW = 0.5 * drawing.width,
            buttonX = -buttonW / 2;
        if (playerMode && this.parentQuizz.previewMode) {
            this.parentQuizz.textToSpeechIcon = drawTextToSpeechIcon({x: 0.4 * drawing.width, y: -100, width: 35})
                .color(myColors.white, 0.5, SELECTION_COLOR)
                .mark('iconTextToSpeech');
            this.parentQuizz.textToSpeechIcon.clickHandler = () => {
                globalVariables.textToSpeechMode = !globalVariables.textToSpeechMode;
                if (globalVariables.textToSpeechMode) {
                    this.parentQuizz.textToSpeechIcon.color(SELECTION_COLOR);
                } else {
                    this.parentQuizz.textToSpeechIcon.color(myColors.white, 0.5, SELECTION_COLOR);
                }
            };
            this.parentQuizz.textToSpeechIcon.setHandler('click', this.parentQuizz.textToSpeechIcon.clickHandler);
            this.manipulator.add(this.parentQuizz.textToSpeechIcon.manipulator);
            this.simpleChoiceMessageManipulator.move(buttonX + buttonW / 2, buttonY + buttonH / 2);
            displayText("Cliquer sur une réponse pour afficher son explication", buttonW, buttonH, myColors.none, myColors.none, 20, "Arial", this.simpleChoiceMessageManipulator);
        }
        else if (!this.multipleChoice){
            this.simpleChoiceMessageManipulator.move(buttonX + buttonW / 2, buttonY + buttonH / 2);
            displayText("Cliquer sur une réponse pour passer à la question suivante", buttonW, buttonH, myColors.none, myColors.none, 20, "Arial", this.simpleChoiceMessageManipulator);
        }
        else {
            //affichage d'un bouton "valider"
            buttonW = 0.1 * drawing.width;
            const validateX = 0.08 * drawing.width - buttonW / 2,
                validateButton = displayText("Valider", buttonW, buttonH, myColors.green, myColors.yellow, 20, this.font, this.validateManipulator);
            validateButton.content.mark("validateButtonQuiz");
            this.validateManipulator.move(validateX + buttonW / 2, buttonY + buttonH / 2);

            if (!this.parentQuizz.previewMode) {
                var onClickValidateButton = this.validateAnswers.bind(this);
                svg.addEvent(validateButton.border, 'click', onClickValidateButton);
                svg.addEvent(validateButton.content, 'click', onClickValidateButton);
            }

            //Button reset
            const resetX = -buttonW / 2 - 0.08 * drawing.width,
                resetButton = displayText("Réinitialiser", buttonW, buttonH, myColors.grey, myColors.grey, 20, this.font, this.resetManipulator);
            resetButton.content.mark("resetButtonQuiz");
            this.resetManipulator.move(resetX + buttonW / 2, buttonY + buttonH / 2);
            if (this.selectedAnswers.length !== 0) {
                resetButton.border.color(myColors.yellow, 1, myColors.green);
            }
            if (!this.parentQuizz.previewMode) {
                let reset = ()=> {
                    if (this.selectedAnswers.length > 0) {
                        this.selectedAnswers.forEach((e)=> {
                            e.selected = false;
                            e.border.color(e.bgColor, 1, e.colorBordure);
                        });
                        this.selectedAnswers.splice(0, this.selectedAnswers.length);
                        resetButton.border.color(myColors.grey, 1, myColors.grey);
                    }
                };
                svg.addEvent(resetButton.content, 'click', reset);
                svg.addEvent(resetButton.border, 'click', reset);
            }
        }
    }

    function questionSelectedQuestion() {
        this.border.color(this.bgColor, 5, SELECTION_COLOR);
        if (!this.redCrossManipulator) {
            let redCrossClickHandler = () => {
                const quizzManager = this.parentQuizz.parentFormation.quizzManager,
                    questionPuzzle = quizzManager.questionPuzzle,
                    questionsArray = questionPuzzle.elementsArray;
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

                    svg.event(questionsArray[0].border, "click", {question: questionsArray[0]}); // dernier élément du tableau (AddEmptyElement)
                }
            };
            this.redCrossManipulator = new Manipulator(this);
            let size = 20;
            this.redCross || (this.redCross = drawRedCross(-this.questNum.x, this.questNum.y - size / 2, size, this.redCrossManipulator));
            this.redCross.mark('questionRedCross');
            svg.addEvent(this.redCross, "click", redCrossClickHandler);
            this.redCrossManipulator.add(this.redCross);
            this.manipulator.add(this.redCrossManipulator);
        }
        else {
            this.redCrossManipulator.move(-this.questNum.x, this.questNum.y - this.redCross.size / 2);
            this.redCrossManipulator.add(this.redCross);
        }
    }

    function questionCreatorDisplay(x, y, w, h) {
        x && (this.previousX = x);
        y && (this.previousY = y);
        w && (this.previousW = w);
        h && (this.previousH = h);
        this.manipulator.move(this.previousX, 0);
        let toggleButtonHeight = 40;
        this.displayQuestionCreator(this.previousX, this.previousY, this.previousW, this.previousH);
        let clickedButton = this.multipleChoice ? myQuestionType.tab[1].label : myQuestionType.tab[0].label;
        this.displayToggleButton(MARGIN + this.previousX, MARGIN / 2 + this.previousY, this.previousW, toggleButtonHeight - MARGIN, clickedButton);
    }

    function questionCreatorDisplayToggleButton(x, y, w, h, clicked) {
        const size = this.manipulator.ordonator.children[0].height * 0.05;
        this.manipulator.add(this.toggleButtonManipulator);
        let toggleButtonWidth = drawing.width / 5;
        var toggleHandler = (event)=> {
            drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
            drawings.screen.mouseCursor('default');
            const target = drawings.background.getTarget(event.pageX, event.pageY),
                questionType = target.parent.children[1].messageText;

            if (questionType === "Réponses multiples"){
                this.multipleChoice = true;
                this.linkedQuestion.multipleChoice = true;
            } else {
                this.multipleChoice = false;
                this.linkedQuestion.multipleChoice = false;
            }

            this.linkedQuestion.questionType = (!this.multipleChoice) ? this.questionType[0] : this.questionType[1];
            this.errorMessagePreview && this.errorMessagePreview.parent && this.parent.previewButtonManipulator.remove(this.errorMessagePreview);
            this.linkedQuestion.tabAnswer.forEach((answer)=> {
                answer.correct = false;
                if (answer.obj) {
                    answer.obj.checkbox = displayCheckbox(answer.obj.checkbox.x, answer.obj.checkbox.y, size, answer).checkbox;
                    answer.obj.checkbox.answerParent = answer;
                }
            });
            this.displayToggleButton(x, y, w, h, questionType);
            this.linkedQuestion.checkValidity();
        };
        this.manipulator.add(this.toggleButtonManipulator);
        const length = this.questionType.length,
            lengthToUse = (length + 1) * MARGIN + length * toggleButtonWidth,
            margin = (w - lengthToUse) / 2;
        this.x = margin + toggleButtonWidth / 2 + MARGIN;
        (!this.questionTypeSelectorManipulators) && (this.questionTypeSelectorManipulators = []);
        this.questionType.forEach((type, index)=> {
            if (this.questionTypeSelectorManipulators[index]) {
                this.toggleButtonManipulator.remove(this.questionTypeSelectorManipulators[index]);
            }
            this.questionTypeSelectorManipulators[index] = new Manipulator(this).addOrdonator(2);
            this.toggleButtonManipulator.add(this.questionTypeSelectorManipulators[index]);
            (type.label == clicked) ? (this.questionTypeSelectorManipulators[index].color = SELECTION_COLOR) : (this.questionTypeSelectorManipulators[index].color = myColors.white);
            let toggleButton = displayTextWithoutCorners(type.label, toggleButtonWidth, h, myColors.black, this.questionTypeSelectorManipulators[index].color, 20, null, this.questionTypeSelectorManipulators[index]);
            toggleButton.content.color(getComplementary(this.questionTypeSelectorManipulators[index].color), 0, myColors.black);
            toggleButton.border.mark('toggleButtonCadre' + type.label.split(" ")[1]);
            this.questionTypeSelectorManipulators[index].move(this.x - this.w / 2, h - this.h / 2);
            this.x += toggleButtonWidth + MARGIN;
            (type.label != clicked) && (svg.addEvent(toggleButton.content, "click", toggleHandler));
            (type.label != clicked) && (svg.addEvent(toggleButton.border, "click", toggleHandler));
        });
        this.linkedQuestion.questionType = (this.multipleChoice) ? this.questionType[1] : this.questionType[0];
    }

    function questionCreatorDisplayQuestionCreator(x, y, w, h) {
        // bloc Question
        this.manipulator.flush();
        let questionBlock = {rect: new svg.Rect(w, h).color(myColors.none, 3, myColors.black).position(w / 2, y + h / 2)};
        questionBlock.rect.position(0, 0);
        questionBlock.rect.fillOpacity(0.001);
        this.manipulator.set(0, questionBlock.rect);
        this.manipulator.add(this.questionManipulator);

        var removeErrorMessage = () => {
            this.linkedQuestion.invalidLabelInput = false;
            this.errorMessage && this.manipulator.unset(1);
            questionBlock.title.border.color(myColors.white, 1, myColors.black);
        };

        var displayErrorMessage = (message)=> {
            removeErrorMessage();
            questionBlock.title.border.color(myColors.white, 2, myColors.red);
            const anchor = 'middle';
            this.errorMessage = new svg.Text(message);
            this.errorMessage.mark("questionBlockErrorMessage");
            this.manipulator.set(1, this.errorMessage);
            this.errorMessage.position(0, -this.h / 2 + this.toggleButtonHeight + questionBlock.title.border.height + this.errorMessage.boundingRect().height + MARGIN)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            this.linkedQuestion.invalidLabelInput = message;
        };

        var questionBlockDisplay = () => {
            const color = (this.linkedQuestion.label) ? myColors.black : myColors.grey,
                text = (this.linkedQuestion.label) ? this.linkedQuestion.label : this.labelDefault;
            if (this.linkedQuestion.image) {
                this.image = this.linkedQuestion.image;
                this.imageLayer = 2;
                let pictureRedCrossClickHandler = ()=> {
                    this.imageLayer && this.questionManipulator.unset(this.imageLayer);//image
                    this.linkedQuestion.image = null;
                    this.linkedQuestion.imageSrc = null;
                    this.display();
                    this.linkedQuestion.checkValidity();
                    this.parent.questionPuzzle.display();
                };
                let picture = new Picture(this.image.src, true, this, text, pictureRedCrossClickHandler);
                picture.draw(0, 0, this.w - 2 * MARGIN, this.h * 0.25, this.questionManipulator);
                picture.imageSVG.image.mark('questionImage' + this.linkedQuestion.questionNum);
                questionBlock.title = picture.imageSVG;
            }else if(this.linkedQuestion.video){
                questionBlock.title = drawVideo(text, this.linkedQuestion.video, this.w - 2 * MARGIN, this.h * 0.25, this.colorBordure, this.bgColor, this.fontSize, this.font, this.questionManipulator, true, false);
            } else {
                questionBlock.title = displayText(text, this.w - 2 * MARGIN, this.h * 0.25, myColors.black, myColors.none, this.linkedQuestion.fontSize, this.linkedQuestion.font, this.questionManipulator);
            }
            questionBlock.title.content.mark("questionBlockTitle" + this.linkedQuestion.questionNum);
            questionBlock.title.border.mark("questionBlockCadre" + this.linkedQuestion.questionNum);
            const fontSize = Math.min(20, this.h * 0.1);
            this.questNum = new svg.Text(this.linkedQuestion.questionNum).position(-this.w / 2 + 2 * MARGIN + (fontSize * (this.linkedQuestion.questionNum.toString.length) / 2), -this.h * 0.25 / 2 + (fontSize) / 2 + 2 * MARGIN).font("Arial", fontSize);
            this.questionManipulator.set(4, this.questNum);
            questionBlock.title.content.color(color);
            questionBlock.title.content._acceptDrop = true;
            this.linkedQuestion.invalidLabelInput ? questionBlock.title.border.color(this.linkedQuestion.bgColor, 2, myColors.red)
                :questionBlock.title.border.color(this.linkedQuestion.bgColor, 1, this.linkedQuestion.colorBordure);
            this.linkedQuestion.invalidLabelInput && displayErrorMessage(this.linkedQuestion.invalidLabelInput);
            questionBlock.title.border._acceptDrop = true;

            this.questionManipulator.move(0, -this.h / 2 + questionBlock.title.border.height / 2 + this.toggleButtonHeight + MARGIN);
            this.manipulator.move(x + w / 2, y + h / 2);
            const globalPoints = questionBlock.title.border.globalPoint(-50, -50);
            questionBlock.title.video && questionBlock.title.video.position(globalPoints.x, globalPoints.y);
            svg.addEvent(questionBlock.title.content, "dblclick", dblclickEditionQuestionBlock);
            svg.addEvent(questionBlock.title.border, "dblclick", dblclickEditionQuestionBlock);
        };

        var dblclickEditionQuestionBlock = () => {
            const globalPointCenter = questionBlock.title.content.globalPoint(-(this.w) / 2, -((this.linkedQuestion.image || this.linkedQuestion.video) ? questionBlock.title.content.boundingRect().height : ((this.h * .25) / 2)) / 2),
                contentareaStyle = {
                height: (this.linkedQuestion.image || this.linkedQuestion.video) ? questionBlock.title.content.boundingRect().height : ((this.h * .25) / 2),
                toppx: globalPointCenter.y,
                leftpx: (globalPointCenter.x + 1 / 12 * this.w),
                width: (this.w * 5 / 6)
            };
            questionBlock.title.content.message("");
            drawing.notInTextArea = false;
            let textarea = new svg.TextArea(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height)
                .color(myColors.white, 0, myColors.black)
                .message(this.linkedQuestion.label)
                .mark('questionBlockTextArea')
                .font("Arial", 20);
            drawings.screen.add(textarea);
            textarea.setCaretPosition(this.linkedQuestion.label.length);

            let onblur = () => {
                textarea.enter();
                this.linkedQuestion.label = textarea.messageText || '';
                if (textarea.messageText) {
                    this.label = textarea.messageText;
                    this.linkedQuestion.label = textarea.messageText;
                }
                drawings.screen.remove(textarea);
                drawing.notInTextArea = true;
                questionBlockDisplay();
                this.parent.displayQuestionsPuzzle(null, null, null, null, this.parent.questionPuzzle.indexOfFirstVisibleElement);
            };

            let oninput = () => {
                textarea.enter();
                this.parent.questionCreator.checkInputTextArea({
                    textarea: textarea,
                    border: questionBlock.title.border,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
            };
            svg.addEvent(textarea, "blur", onblur);
            svg.addEvent(textarea, "input", oninput);
        };

        (typeof x !== "undefined") && (this.x = x);
        (typeof y !== "undefined") && (this.y = y);
        (typeof w !== "undefined") && (this.w = w);
        (typeof h !== "undefined") && (this.h = h);
        questionBlockDisplay();
        const height = this.h - this.toggleButtonHeight - questionBlock.title.border.height - 3 * MARGIN;
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
        this.manipulator.add(this.puzzle.manipulator);
        this.puzzle && this.puzzle.fillVisibleElementsArray("leftToRight");
        this.puzzle.leftChevron.mark('answerLeftChevron');
        this.puzzle.rightChevron.mark('answerRightChevron');
        this.puzzle.display(this.coordinatesAnswers.x, this.coordinatesAnswers.y, this.coordinatesAnswers.w, this.coordinatesAnswers.h, false);
        if (this.explanation) {
            this.explanation.display(this, this.coordinatesAnswers.x, this.coordinatesAnswers.y, this.coordinatesAnswers.w, this.coordinatesAnswers.h);
        }
    }

    function popInDisplay(parent, x, y, w, h) {
        let textToSpeechIcon = this.answer.parentQuestion.parentQuizz.textToSpeechIcon;
        let clickBanned, mouseLeaveHandler;
        if (textToSpeechIcon) {
            textToSpeechIcon.removeHandler('click');
            clickBanned = ()=> {
                drawings.screen.mouseCursor('not-allowed');
                textToSpeechIcon.removeHandler('mouseover', clickBanned);
            };
            mouseLeaveHandler = ()=> {
                drawings.screen.mouseCursor('default');
                textToSpeechIcon.setHandler('mouseover', clickBanned);
                textToSpeechIcon.setHandler('mouseout', mouseLeaveHandler);
            };
            textToSpeechIcon.setHandler('mouseover', clickBanned);
            textToSpeechIcon.setHandler('mouseout', mouseLeaveHandler);
        }

        const rect = new svg.Rect(w + 2, h) //+2 border
            .color(myColors.white, 1, myColors.black);
        rect._acceptDrop = this.editable;
        parent.manipulator.add(this.manipulator);
        this.manipulator.set(0, rect);
        this.manipulator.move(0, y);
        this.answer.editor && this.answer.editor.puzzle && this.answer.editor.puzzle.elementsArray.forEach(answerElement => {
            answerElement.obj && answerElement.obj.video && drawings.screen.remove(answerElement.obj.video);
        });
        this.answer.parentQuestion.tabAnswer.forEach(answer => {
            answer.video && drawings.screen.remove(answer.video.miniature);
        });
        let crossHandler;
        const drawGreyCross = (size) => {
            const
                circle = new svg.Circle(size).color(myColors.black, 2, myColors.white),
                cross = drawCross(w / 2, -h / 2, size, myColors.lightgrey, myColors.lightgrey, this.closeButtonManipulator);
            circle.mark('circleCloseExplanation');
            this.closeButtonManipulator.set(0, circle);
            this.closeButtonManipulator.set(1, cross);
            crossHandler = () => {
                drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
                drawings.screen.mouseCursor('default');
                if (textToSpeechIcon){
                    textToSpeechIcon.setHandler('click', textToSpeechIcon.clickHandler);
                    textToSpeechIcon.removeHandler('mouseover', clickBanned);
                    textToSpeechIcon.removeHandler('mouseout', mouseLeaveHandler);
                }
                this.said = false;
                svg.speechSynthesisCancel();
                this.editable && (parent.explanation = false);
                parent.manipulator.remove(cross.parent.parentManip.parentObject.manipulator);
                this.editable && parent.puzzle.display(x, y, w, h, false);
                this.displayed = false;
                this.miniature && drawings.screen.remove(this.miniature.video);
                if(parent instanceof Question){
                    parent.tabAnswer.forEach(answer => {
                        answer.video && drawings.screen.add(answer.video.miniature);
                    });
                }
            };
            svg.addEvent(cross, "click", crossHandler);
            svg.addEvent(circle, "click", crossHandler);
            return cross;
        };
        this.cross = drawGreyCross(12);

        drawing.notInTextArea = true;
        svg.addGlobalEvent("keydown", (event) => {
            if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        });
        var hasKeyDownEvent = (event) => {
            if (this.cross && event.keyCode === 27) { // suppr
                crossHandler();
            }
            return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
        };

        let panelWidth = (w - 2 * MARGIN) * 0.7,
            panelHeight = h - 2 * MARGIN;
        const textW = (w - 2 * MARGIN) * 0.3 - MARGIN;
        
        const createWithText = () => {
            const imageW = (w - 2 * MARGIN) * 0.3 - MARGIN;
            this.imageX = (-w + imageW) / 2 + MARGIN;
            this.panelManipulator.move((w - panelWidth) / 2 - MARGIN, 0);
            if (this.image) {
                this.miniature && this.miniature.video && drawings.screen.remove(this.miniature.video);
                this.manipulator.unset(6);
                this.imageLayer = 3;
                const imageSize = Math.min(imageW, panelHeight);
                let pictureRedCrossClickHandler = ()=> {
                    this.manipulator.flush();
                    this.image = null;
                    this.imageSrc = null;
                    let questionCreator = this.answer.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                    this.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                };
                let picture = new Picture(this.image, this.editable, this, null, pictureRedCrossClickHandler);
                this.manipulator.unset(5);
                picture.draw(this.imageX, 0, imageSize, imageSize);
                picture.imageSVG.mark('imageExplanation');
                this.answer.filled = true;
            }else if(this.video){
                this.miniature && this.miniature.video && drawings.screen.remove(this.miniature.video);
                this.manipulator.unset(3);
                this.miniature = drawVideo("NOT_TO_BE_DISPLAYED", this.video, w, h, myColors.black, myColors.white, 10, null, this.manipulator, !this.answer.parentQuestion.parentQuizz.previewMode, this.answer.parentQuestion.parentQuizz.previewMode, 5);
                this.miniature.border.corners(0, 0);
                this.miniature.video._acceptDrop = true;
                this.globalPoints = this.miniature.border.globalPoint(this.imageX -50, -50);
                this.miniature.video.position(this.globalPoints.x, this.globalPoints.y);
                this.manipulator.ordonator.children[this.manipulator.lastLayerOrdonator()].position(this.imageX, 25);
                this.answer.filled = true;
            }else if (this.editable) {
                autoAdjustText(this.draganddropText, textW, panelHeight, 20, null, this.manipulator, 3).text
                    .position(this.imageX, 0).color(myColors.grey)
                    ._acceptDrop = this.editable;
                this.label ? this.answer.filled = true : this.answer.filled = false;
            } else {
                panelWidth = w - 2 * MARGIN;
                this.panelManipulator.move(0, 0);
            }
        };
        const createWithoutText = () => {
            const imageW = (w - 2 * MARGIN) * 0.3 - MARGIN,
                imageX = 0;
            this.panelManipulator.unset(0);
            this.miniature && drawings.screen.remove(this.miniature.video);
            if (this.image) {
                this.manipulator.unset(6);
                this.imageLayer = 3;
                const imageSize = Math.min(imageW, panelHeight);
                this.manipulator.unset(5);
                let picture = new Picture(this.image, this.editable, this);
                picture.draw(imageX, 0, imageSize, imageSize);
                picture.imageSVG.mark('imageExplanation');
                this.answer.filled = true;
            } else if (this.video) {
                this.manipulator.unset(3);
                this.miniature = drawVideo('', this.video, w, h, myColors.black, myColors.white, 10, null, this.manipulator, !this.answer.parentQuestion.parentQuizz.previewMode, this.answer.parentQuestion.parentQuizz.previewMode, 5)
                    .resize(imageW);
                this.miniature.video.width = imageW;
                this.answer.filled = true;
            }
        };
        
        if (globalVariables.textToSpeechMode) {
            createWithoutText();
        } else {
            createWithText();
        }

        let textToDisplay, text;

        let drawTextPanel = () => {
            this.panel = new gui.Panel(panelWidth, panelHeight, myColors.white);
            this.panel.border.color([], 1, [0, 0, 0]);
            this.panel.back.mark('explanationPanel');
            this.panelManipulator.set(0, this.panel.component);
            this.panel.content.children.indexOf(this.textManipulator.first) === -1 && this.panel.content.add(this.textManipulator.first);
            this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
            textToDisplay = this.label ? this.label : (this.defaultLabel ? this.defaultLabel : "");
            text = autoAdjustText(textToDisplay, panelWidth, drawing.height, null, null, this.textManipulator, 0).text;
            text.position(panelWidth / 2, text.boundingRect().height)
                .mark('textExplanation');
            this.panel.resizeContent(this.panel.width, text.boundingRect().height + MARGIN);
        };

        if (globalVariables.textToSpeechMode) {
        } else {
            drawTextPanel();
        }

        const clickEdition = () => {
            let contentArea = {};
            contentArea.globalPointCenter = this.panel.border.globalPoint(-panelWidth / 2, -panelHeight / 2);
            drawing.notInTextArea = false;
            contentArea = new svg.TextArea(contentArea.globalPointCenter.x, contentArea.globalPointCenter.y, panelWidth - MARGIN, panelHeight - MARGIN)
                .color(null, 0, myColors.black).font("Arial", 20)
                .mark('explanationContentArea');
            (textToDisplay === "" || textToDisplay === this.defaultLabel) && contentArea.placeHolder(this.labelDefault);
            contentArea.message(this.label || "");
            this.textManipulator.unset(0);
            contentArea.scroll(svg.TextArea.SCROLL);
            this.panel.vHandle.handle.color(myColors.none, 3, myColors.none);
            drawings.screen.add(contentArea);
            contentArea.setCaretPosition(textToDisplay.length);
            const onblur = () => {
                contentArea.enter();
                this.label = contentArea.messageText;
                drawings.screen.remove(contentArea);
                drawing.notInTextArea = true;
                this.display(parent, x, y, w, h);
            };
            svg.addEvent(contentArea, 'blur', onblur);
            svg.addEvent(contentArea, 'input', () => {
                contentArea.enter();
            });
        };
        if (this.editable) {
            svg.addEvent(text, "click", clickEdition);
            svg.addEvent(this.panel.back, "click", clickEdition);
        }
        this.displayed = true;
    }

    function quizzDisplay(x, y, w, h) {
        drawing.currentPageDisplayed = "Quizz";
        header.display(this.parentFormation.label + " - " + this.title);
        mainManipulator.set(1, this.manipulator);
        let headerPercentage, questionPercentageWithImage, questionPercentage,
            answerPercentageWithImage;
        let setSizes = (()=> {
            this.x = x + w * 0.15 || this.x || 0;
            this.y = y || this.y || 0;
            w && (this.questionArea.w = w * 0.7);
            (w && x) && (this.resultArea.w = w );
            x && (this.resultArea.x = x );
            w && (this.titleArea.w = w );
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
            if (playerMode) {
                this.returnButton.setHandler(() => {
                    drawings.screen.empty();
                    this.closePopIn();
                    this.previewMode = false;
                    this.currentQuestionIndex = this.tabQuestions.length;
                    this.manipulator.flush();
                    this.puzzleLines = 3;
                    this.puzzleRows = 3;
                    this.returnButton.label = "Retour à la formation";
                    returnButtonChevron.mark('returnButtonToFormation');
                    drawing.currentPageDisplayed = "QuizPreview";
                    (this.oldQuiz ? this.oldQuiz : this).display(0, 0, drawing.width, drawing.height);
                });
            } else {
                drawings.screen.empty();
                returnButtonChevron.mark('returnButtonPreview');
                this.returnButton.setHandler(() => {
                    drawings.screen.empty();
                    this.closePopIn();
                    this.manipulator.flush();
                    this.parentFormation.quizzManager.loadQuizz(this, this.currentQuestionIndex);
                    this.parentFormation.quizzManager.display();
                });
            }
        } else {
            drawings.screen.empty();
            returnButtonChevron.mark('returnButtonToFormation');
            let returnHandler = () => {
                drawings.screen.empty();
                this.closePopIn();
                this.manipulator.flush();
                this.parentFormation.displayFormation();
                this.returnButton.removeHandler(returnHandler);
            };
            this.returnButton.setHandler(returnHandler);
        }
        this.leftChevron = new Chevron(x - w * 0.3, y + h * 0.45, w * 0.1, h * 0.15, this.leftChevronManipulator, "left");
        this.leftChevron.mark('leftChevron');
        this.rightChevron = new Chevron(x + w * 0.6, y + h * 0.45, w * 0.1, h * 0.15, this.rightChevronManipulator, "right");
        this.rightChevron.mark('rightChevron');

        this.leftChevron.update = function (quizz) {
            if(quizz.currentQuestionIndex === 0){
                this.color(myColors.grey);
                svg.removeEvent(this, "click");
            }else{
                this.color(myColors.black);
                svg.addEvent(this, "click", ()=>{leftChevronHandler();});
            }
        };
        this.rightChevron.update = function (quizz) {
            if(quizz.previewMode){
                if(quizz.currentQuestionIndex === quizz.tabQuestions.length - 1){
                    this.color(myColors.grey);
                    svg.removeEvent(this, "click");
                }else{
                    this.color(myColors.black);
                    svg.addEvent(this, "click", ()=>{rightChevronHandler();});
                }
            }else{
                if(quizz.currentQuestionIndex === quizz.questionsAnswered.length){
                    this.color(myColors.grey);
                    svg.removeEvent(this, "click");
                }else{
                    this.color(myColors.black);
                    svg.addEvent(this, "click", ()=>{rightChevronHandler();});
                }
            }
        };

        this.closePopIn = () => {
            this.tabQuestions[this.currentQuestionIndex] && this.tabQuestions[this.currentQuestionIndex].tabAnswer.forEach(answer => {
                if (answer.explanationPopIn && answer.explanationPopIn.displayed) {
                    let said = answer.explanationPopIn.said;
                    answer.explanationPopIn.cross.component.listeners["click"]();
                    answer.explanationPopIn.said = said;
                }
            });
        };

        let leftChevronHandler = () => {
            drawings.screen.empty();
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
            drawings.screen.empty();
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

    function quizzDisplayResult(color) {
        drawings.screen.empty();
        this.displayScore(color);
        this.leftChevronManipulator.unset(0);
        this.rightChevronManipulator.unset(0);

        const
            buttonExpHeight = 50,
            buttonExpWidth = drawing.width * 0.3,
            textExp = "Voir les réponses et explications",
            expButton = displayText(textExp, buttonExpWidth, buttonExpHeight, myColors.black, myColors.white, 20, null, this.expButtonManipulator);
        this.expButtonManipulator.move(buttonExpWidth/2, drawing.height - this.headerHeight - buttonExpHeight);
        expButton.border.mark('expButton');

        const displayExplanation = () => {
            drawings.screen.empty();
            this.manipulator.flush();
            let quizzExplanation = new Quizz(this, true);
            quizzExplanation.currentQuestionIndex = 0;
            quizzExplanation.oldQuiz = this;
            globalVariables.formationsManager.formationDisplayed.quizzDisplayed = quizzExplanation;
            quizzExplanation.run(1, 1, drawing.width, drawing.height);
        };

        svg.addEvent(expButton.border, "click", displayExplanation);
        svg.addEvent(expButton.content, "click", displayExplanation);

        this.puzzle.fillVisibleElementsArray("upToDown");
        this.answerHeight = (drawing.height - this.headerHeight - buttonExpHeight) * this.answerPercentage - MARGIN;
        this.puzzle.display(0, this.questionHeight / 2 + this.answerHeight / 2 + MARGIN, drawing.width - MARGIN, this.answerHeight);
        this.puzzle.leftChevron.resize(this.puzzle.chevronSize, this.puzzle.chevronSize);
    }

    function gameDisplayMiniature(size) {
        return new MiniatureGame(this, size);
    }

    function bdDisplay(bd) {
        mainManipulator.unset(1);
        header.display(bd.title);
        mainManipulator.add(bd.manipulator);
        bd.returnButton.display(0, drawing.height * HEADER_SIZE + 2 * MARGIN, 20, 20);
        let returnButtonChevron = bd.returnButton.chevronManipulator.ordonator.children[0];
        returnButtonChevron.mark('returnButtonFromBdToFormation');
        bd.returnButton.setHandler(this.previewMode ? (event) => {
            bd.returnButton.removeHandler(returnHandler);
            let target = bd.returnButton;
            target.parent.manipulator.flush();
            target.parent.parentFormation.quizzManager.loadQuizz(target.parent, target.parent.currentQuestionIndex);
            target.parent.parentFormation.quizzManager.display();
        } : (event) => {
            let target = bd.returnButton;//drawings.background.getTarget(event.pageX, event.pageY);
            target.parent.manipulator.flush();
            target.parent.parentFormation.displayFormation();
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
        let finalMessage = `${str1} Vous avez répondu à ${this.tabQuestions.length} questions, ${str2}`;
        if (!color) {
            var usedColor = autoColor;
        } else {
            usedColor = color;
        }
        this.resultManipulator && this.manipulator.remove(this.resultManipulator);
        this.resultManipulator = new Manipulator(this);
        this.scoreManipulator = new Manipulator(this).addOrdonator(2);
        this.resultManipulator.move(this.titleArea.w/2-this.questionArea.w / 2, this.questionHeight / 2 + this.headerHeight / 2 + 2 * MARGIN);
        this.resultManipulator.add(this.scoreManipulator);
        this.resultManipulator.add(this.puzzle.manipulator);
        this.manipulator.add(this.resultManipulator);
        displayText(finalMessage, this.titleArea.w - 2 * MARGIN, this.questionHeight, myColors.black, usedColor, this.fontSize, this.font, this.scoreManipulator);
    }

    function quizzManagerDisplay() {
        drawings.screen.empty();
        let verticalPosition = drawing.height * HEADER_SIZE;
        this.height = drawing.height - drawing.height * HEADER_SIZE;
        this.quizzManagerManipulator.move(0, verticalPosition);
        this.quizzManagerManipulator.add(this.libraryIManipulator);
        this.quizzManagerManipulator.add(this.quizzInfoManipulator);
        this.quizzManagerManipulator.add(this.questionsPuzzleManipulator);
        this.quizzManagerManipulator.add(this.questionCreator.manipulator);
        this.quizzManagerManipulator.add(this.previewButtonManipulator);
        this.quizzManagerManipulator.add(this.saveQuizButtonManipulator);
        let libraryWidthRatio = 0.15,
            quizzInfoHeightRatio = 0.05,
            questCreaWidthRatio = 1 - libraryWidthRatio,
            questionsPuzzleHeightRatio = 0.25,
            questCreaHeightRatio = 0.57,
            previewButtonHeightRatio = 0.1,
            saveButtonHeightRatio = 0.1,
            marginRatio = 0.02;
        this.libraryWidth = drawing.width * libraryWidthRatio;
        this.questCreaWidth = drawing.width * questCreaWidthRatio;
        this.quizzInfoHeight = this.height * quizzInfoHeightRatio;
        this.questionsPuzzleHeight = this.height * questionsPuzzleHeightRatio;
        this.libraryHeight = this.height * questCreaHeightRatio;
        this.questCreaHeight = this.height * questCreaHeightRatio;
        this.saveButtonHeight = this.height * saveButtonHeightRatio;
        this.previewButtonHeight = this.height * previewButtonHeightRatio;
        this.buttonWidth = 150;
        this.globalMargin = {
            height: marginRatio * this.height * 2,
            width: marginRatio * drawing.width
        };
        this.questionPuzzleCoordinates = {
            x: this.globalMargin.width / 2,
            y: (this.quizzInfoHeight + this.questionsPuzzleHeight / 2 + this.globalMargin.height / 2),
            w: (drawing.width - this.globalMargin.width),
            h: (this.questionsPuzzleHeight - this.globalMargin.height)
        };

        drawing.currentPageDisplayed = 'QuizManager';
        mainManipulator.set(1, this.quizzManagerManipulator);

        this.questionClickHandler = event => {
            drawings.screen.empty();
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
                        this.questionCreator.manipulator.remove(answer.popIn.manipulator);
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
            questionCreator.explanation && questionCreator.manipulator.remove(questionCreator.explanation.manipulator);
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
            mainManipulator.unset(0);
            header.display(this.parentFormation.label + " - " + this.quizz.title);
        };

        this.library.display(this.globalMargin.width / 2, this.quizzInfoHeight + this.questionsPuzzleHeight + this.globalMargin.height / 2,
            this.libraryWidth - this.globalMargin.width / 2, this.libraryHeight, () => {
                displayFunctions();
            });
    }

    function quizzManagerDisplayQuizzInfo(x, y, w, h) {
        this.quizzInfoManipulator.add(this.returnButtonManipulator);

        let returnHandler = ()=> {
            drawings.screen.empty();
            let target = this.returnButton;
            target.parent.parentFormation.quizzManager.questionCreator.explanation = null;
            if (this.quizz.tabQuestions[this.indexOfEditedQuestion]) {
                this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator && this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator.flush();
                this.quizz.tabQuestions[this.indexOfEditedQuestion].tabAnswer.forEach(answer=> {
                    if (answer.popIn) {
                        this.questionCreator.manipulator.remove(answer.popIn.manipulator);
                    }
                })
            }
            target.parent.quizzNameValidInput = true;
            target.parent.quizzManagerManipulator.flush();
            target.parent.quizzDisplayed = false;
            target.parent.parentFormation.publishedButtonActivated = false;
            target.parent.parentFormation.displayFormation();
            [].concat(...target.parent.parentFormation.levelsTab.map(level => level.gamesTab))
                .forEach(game => {
                    game.miniature.selected = false;
                    game.miniature.updateSelectionDesign();
                });
            this.returnButton.removeHandler(returnHandler);
        };

        this.returnButton.display(-2 * MARGIN, 0, 20, 20);
        this.returnButton.setHandler(returnHandler);
        let returnButtonChevron = this.returnButton.chevronManipulator.ordonator.children[0];
        returnButtonChevron.mark('returnButtonToFormation');

        let quizzLabel = {};

        var quizzLabelDisplay = ()=> {
            const text = (this.quizzName) ? this.quizzName : this.quizzNameDefault,
                color = (this.quizzName) ? myColors.black : myColors.grey,
                bgcolor = myColors.lightgrey,
                width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBoundingClientRect().width;
            let textToDisplay;
            if (text.length > MAX_CHARACTER_TITLE){
                textToDisplay = text.substr(0, MAX_CHARACTER_TITLE) + "...";
            }
            quizzLabel.content = autoAdjustText(textToDisplay ? textToDisplay : text, w, h / 2, 15, "Arial", this.quizzInfoManipulator).text;
            quizzLabel.content.mark("quizzLabelContent");
            this.quizzNameHeight = quizzLabel.content.boundingRect().height;
            quizzLabel.border = new svg.Rect(width, 0.5 * h).mark("quizzLabelCadre");
            svg.addEvent(quizzLabel.content, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
            svg.addEvent(quizzLabel.content, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
            svg.addEvent(quizzLabel.border, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
            svg.addEvent(quizzLabel.border, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
            this.quizzNameValidInput ? quizzLabel.border.color(bgcolor) : quizzLabel.border.color(bgcolor, 2, myColors.red);
            quizzLabel.border.position(width / 2, h / 2 + quizzLabel.border.height / 2);
            this.quizzInfoManipulator.set(0, quizzLabel.border);
            quizzLabel.content.position(0, h / 2 + quizzLabel.border.height * 9 / 12).color(color).anchor("start");
            this.quizzInfoManipulator.move(x, y);
            svg.addEvent(quizzLabel.content, "dblclick", dblclickEditionQuizz);
            svg.addEvent(quizzLabel.border, "dblclick", dblclickEditionQuizz);
        };

        var dblclickEditionQuizz = ()=> {
            let bounds = quizzLabel.content.boundingRect(),
                globalPointCenter = quizzLabel.content.globalPoint(0, -bounds.height + 3);
            this.quizzInfoManipulator.unset(1);
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
                .mark("quizEditionTextArea")
                .anchor("start");
            (this.quizzNameDefault || this.quizzName === "") && textarea.placeHolder(this.quizzNameDefault);
            drawings.screen.add(textarea);
            textarea.setCaretPosition(this.quizzName.length);
            // textarea.focus();
            textarea.value = this.quizzName;
            var removeErrorMessage = ()=> {
                this.questionCreator.quizzNameValidInput = true;
                this.errorMessage && this.quizzInfoManipulator.unset(5);
                quizzLabel.border.color(myColors.lightgrey);
            };
            var displayErrorMessage = ()=> {
                removeErrorMessage();
                quizzLabel.border.color(myColors.lightgrey, 2, myColors.red);
                var anchor = 'start';
                this.errorMessage = new svg.Text(REGEX_ERROR);
                this.errorMessage.mark("quizErrorMessage");
                this.quizzInfoManipulator.set(5, this.errorMessage);
                this.errorMessage.position(quizzLabel.border.width + MARGIN, bounds.height + 3 + quizzLabel.border.height / 2 + this.errorMessage.boundingRect().height / 2)
                    .font("Arial", 15).color(myColors.red).anchor(anchor);
                textarea.setCaretPosition(this.quizzName.length);
                // textarea.focus();
            };
            var onblur = ()=> {
                textarea.enter();
                this.quizzName = textarea.messageText.trim();
                this.quizz.title = textarea.messageText.trim();
                drawings.screen.remove(textarea);
                drawing.notInTextArea = true;
                quizzLabelDisplay();
                header.display(this.parentFormation.label + " - " + this.quizz.title);
            };
            let objectToBeChecked = {
                textarea: textarea,
                border: quizzLabel.border,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            };
            var oninput = ()=> {
                textarea.enter();
                this.checkInputTextArea(objectToBeChecked);
            };
            svg.addEvent(textarea, "input", oninput);
            svg.addEvent(textarea, "blur", onblur);
            this.checkInputTextArea(objectToBeChecked);
        };
        quizzLabelDisplay();
    }

    function quizzManagerDisplayPreviewButton(x, y, w, h) {
        let previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, this.previewButtonManipulator);
        previewButton.border.mark('previewButton');
        this.previewFunction = () => {
            this.toggleButtonHeight = 40;
            this.quizz.isValid = true;
            let message,
                arrayOfUncorrectQuestions = [];
            if (this.questionCreator.explanation) {
                if (this.questionCreator.explanation.answer.popIn) {
                    this.questionCreator.manipulator.remove(this.questionCreator.explanation.answer.popIn.manipulator);
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
                drawings.screen.empty();
                this.displayMessage(message, myColors.red);
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
        svg.addEvent(previewButton.border, "click", this.previewFunction);
        svg.addEvent(previewButton.content, "click", this.previewFunction);
        this.previewButtonManipulator.move(x, y);
    }

    function quizzManagerDisplaySaveButton(x, y, w, h) {
        let saveButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveQuizButtonManipulator);
        saveButton.border.mark('saveButtonQuiz');
        svg.addEvent(saveButton.border, "click", () => this.saveQuizz());
        svg.addEvent(saveButton.content, "click", () => this.saveQuizz());
        this.saveQuizButtonManipulator.move(x, y);
    }

    function quizzManagerDisplayQuestionPuzzle(x, y, w, h) {
        x && (this.qPuzzleX = x);
        y && (this.qPuzzleY = y);
        w && (this.qPuzzleW = w);
        h && (this.qPuzzleH = h);
        var border = new svg.Rect(this.qPuzzleW, this.qPuzzleH);
        border.color([], 2, myColors.black);
        this.questionsPuzzleManipulator.set(0, border);
        this.questionsPuzzleManipulator.move(this.qPuzzleX + this.qPuzzleW / 2, this.qPuzzleY);
        this.coordinatesQuestion = {
            x: 0,
            y: 0,
            w: border.width - this.globalMargin.width / 2,
            h: this.questionsPuzzleHeight - this.globalMargin.height
        };
        this.questionPuzzle.updateElementsArray(this.quizz.tabQuestions);
        this.questionPuzzle.fillVisibleElementsArray("leftToRight");
        this.questionPuzzle.leftChevron.mark('questionLeftChevron');
        this.questionPuzzle.rightChevron.mark('questionRightChevron');
        if (!this.questionPuzzle.handlersSet) {
            this.questionPuzzle.leftChevron.handler = this.questionPuzzle.leftChevronHandler;
            this.questionPuzzle.rightChevron.handler = this.questionPuzzle.rightChevronHandler;
            this.questionPuzzle.handlersSet = true;
        }
        this.questionsPuzzleManipulator.add(this.questionPuzzle.manipulator);
        this.questionPuzzle.display(this.coordinatesQuestion.x, this.coordinatesQuestion.y, this.qPuzzleW, this.qPuzzleH, true);
        this.questionPuzzle.checkPuzzleElementsArrayValidity(this.questionPuzzle.elementsArray);
    }

    function inscriptionManagerDisplay() {
        drawing.currentPageDisplayed = "InscriptionManager";
        header.display("Inscription");
        mainManipulator.set(1, this.manipulator);
        this.manipulator.move(drawing.width / 2, drawing.height / 2);
        let w = drawing.width / 5,
            x = drawing.width / 9,
            focusedField;

        var clickEditionField = (field, manipulator)=> {
            return ()=> {
                let width = w,
                    height = this.h,
                    globalPointCenter = this[field].border.globalPoint(-(width) / 2, -(height) / 2),
                    contentareaStyle = {
                    toppx: globalPointCenter.y,
                    leftpx: globalPointCenter.x,
                    height: height,
                    width: width
                };
                drawing.notInTextArea = false;
                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
                contentarea.message(this[field].labelSecret || this[field].label)
                    .color(null, 0, myColors.black).font("Arial", 20)
                    .mark('inscriptionContentArea');
                this[field].secret ? contentarea.type('password') : contentarea.type("text");
                manipulator.unset(1, this[field].content.text);
                drawings.screen.add(contentarea);
                contentarea.setCaretPosition(this[field].labelSecret && this[field].labelSecret.length || this[field].label.length);
                var displayErrorMessage = (trueManipulator = manipulator)=> {
                    emptyAreasHandler();
                    if (!(field === "passwordConfirmationField" && trueManipulator.ordonator.children[3].messageText)) {
                        var message = autoAdjustText(this[field].errorMessage, drawing.width, this.h, 20, null, trueManipulator, 3);
                        message.text.color(myColors.red).position(this[field].border.width / 2 + MARGIN, this[field].border.height + MARGIN);
                        message.text.mark('inscriptionErrorMessage' + field);
                    }
                };
                var oninput = ()=> {
                    contentarea.enter();
                    this[field].label = contentarea.messageText;
                    this[field].labelSecret !== "undefined" && (this[field].labelSecret = contentarea.messageText);
                    if ((field === "lastNameField" || field === 'firstNameField' ) && !this[field].checkInput()) {
                        displayErrorMessage();
                        this[field].border.color(myColors.white, 3, myColors.red);
                    }
                    else {
                        field !== "passwordConfirmationField" && manipulator.unset(3);
                        this[field].border.color(myColors.white, 1, myColors.black);
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
                            this[field].border.color(myColors.white, 1, myColors.black);
                            field !== "passwordConfirmationField" && manipulator.unset(3);
                        }
                        else {
                            this[field].secret || displayErrorMessage();
                            this[field].secret || this[field].border.color(myColors.white, 3, myColors.red);
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
            manipulator.move(-drawing.width / 10, this[field].line * drawing.height / 10);
            var fieldTitle = new svg.Text(this[field].title).position(0, 0).font("Arial", 20).anchor("end");
            manipulator.set(2, fieldTitle);
            this.h = 1.5 * fieldTitle.boundingRect().height;
            var displayText = displayTextWithoutCorners(this[field].label, w, this.h, myColors.black, myColors.white, 20, null, manipulator);
            this[field].content = displayText.content;
            this[field].border = displayText.border;
            this[field].border.mark(field);
            var y = -fieldTitle.boundingRect().height / 4;
            this[field].content.position(x, 0);
            this[field].border.position(x, y);
            svg.addEvent(this[field].content, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
            svg.addEvent(this[field].content, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
            svg.addEvent(this[field].border, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
            svg.addEvent(this[field].border, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
            var clickEdition = clickEditionField(field, manipulator);
            svg.addEvent(this[field].content, "click", clickEdition);
            svg.addEvent(this[field].border, "click", clickEdition);
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
            const passTooShort = this.passwordField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordField.labelSecret.length < 6,
                confTooShort = this.passwordConfirmationField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordConfirmationField.labelSecret.length < 6,
                cleanIfEgality = ()=> {
                if (this.passwordField.labelSecret === this.passwordConfirmationField.labelSecret) {
                    this.passwordField.border.color(myColors.white, 1, myColors.black);
                    this.passwordConfirmationField.border.color(myColors.white, 1, myColors.black);
                }
            };
            if (passTooShort || confTooShort) {
                if (passTooShort) {
                    this.passwordField.border.color(myColors.white, 3, myColors.red);
                    var message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                    message.text.color(myColors.red).position(this.passwordField.border.width / 2 + MARGIN, this.passwordField.border.height + MARGIN);
                    message.text.mark('inscriptionErrorMessagepasswordField');
                }
                if (confTooShort) {
                    this.passwordConfirmationField.border.color(myColors.white, 3, myColors.red);
                    message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                    message.text.color(myColors.red).position(this.passwordField.border.width / 2 + MARGIN, this.passwordField.border.height + MARGIN);
                    message.text.mark('inscriptionErrorMessagepasswordField');
                }
            }
            else if (this.passwordConfirmationField.labelSecret !== "" && this.passwordConfirmationField.labelSecret !== this.passwordField.labelSecret) {
                this.passwordField.border.color(myColors.white, 3, myColors.red);
                this.passwordConfirmationField.border.color(myColors.white, 3, myColors.red);
                message = autoAdjustText(this.passwordConfirmationField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                message.text.color(myColors.red).position(this.passwordField.border.width / 2 + MARGIN, this.passwordField.border.height + MARGIN);
                message.text.mark('inscriptionErrorMessagepasswordField');
            }
            else { //(this.passwordField.labelSecret && this.passwordField.labelSecret.length >= 6) {
                this.passwordField.border.color(myColors.white, 1, myColors.black);
                this.passwordManipulator.unset(3);
                cleanIfEgality();
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
                save && emptyArea.border.color(myColors.white, 3, myColors.red);
            });
            if (emptyAreas.length > 0 && save) {
                var message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -this.saveButtonManipulator.ordonator.children[0].height + MARGIN);
            }
            else {
                this.saveButtonManipulator.unset(3);
            }
            return (emptyAreas.length > 0);
        };

        this.saveButtonHandler = () => {
            if (!emptyAreasHandler(true) && AllOk()) {
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
                            const messageText = "Votre compte a bien été créé !",
                                message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                            message.text.color(myColors.green).position(0, -this.saveButtonManipulator.ordonator.children[0].height + MARGIN);
                            setTimeout(() => {
                                this.saveButtonManipulator.unset(3);
                            }, 10000);
                        } else {
                            const messageText = "Un utilisateur possède déjà cette adresse mail !",
                                message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                            message.text.color(myColors.red).position(0, -this.saveButtonManipulator.ordonator.children[0].height + MARGIN);
                            setTimeout(() => {
                                this.saveButtonManipulator.unset(3);
                            }, 10000);
                        }
                    })
            } else if (!AllOk()) {
                const messageText = "Corrigez les erreurs des champs avant d'enregistrer !",
                    message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -saveButton.border.height + MARGIN);
            }
        };
        let saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
        this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
        let saveButtonWidth = Math.min(drawing.width * this.saveButtonWidthRatio, 200);
        let saveButton = displayText(this.saveButtonLabel, saveButtonWidth, saveButtonHeight, myColors.black, myColors.white, 20, null, this.saveButtonManipulator);
        this.saveButtonManipulator.move(0, 2.5 * drawing.height / 10);
        saveButton.border.mark('inscriptionButton');
        svg.addEvent(saveButton.content, "click", this.saveButtonHandler);
        svg.addEvent(saveButton.border, "click", this.saveButtonHandler);

        let nextField = (backwards = false)=> {
            let index = this.tabForm.indexOf(focusedField);
            if (index !== -1) {
                backwards ? index-- : index++;
                if (index === this.tabForm.length) index = 0;
                if (index === -1) index = this.tabForm.length - 1;
                clickEditionField(this.tabForm[index].field, this.tabForm[index].border.parent.parentManip)();
            }
        };
        svg.addGlobalEvent("keydown", (event)=> {
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                nextField(event.shiftKey);
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                svg.activeElement() && svg.activeElement().blur();
                this.saveButtonHandler();
            }
        });
        AllOk();
    }

    function connexionManagerDisplay() {
        drawing.currentPageDisplayed = "ConnexionManager";
        header.display("Connexion");
        mainManipulator.set(1, this.manipulator);
        this.manipulator.move(drawing.width / 2, drawing.height / 2);
        let w = drawing.width / 6,
            x = drawing.width / 10,
            focusedField;
        var clickEditionField = (field, manipulator)=> {
            return ()=> {
                const width = w,
                    height = this.h,
                    globalPointCenter = this[field].border.globalPoint(-(width) / 2, -(height) / 2),
                    contentareaStyle = {
                    toppx: globalPointCenter.y,
                    leftpx: globalPointCenter.x,
                    height: height,
                    width: this[field].border.width
                };
                drawing.notInTextArea = false;
                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height)
                    .mark('connectionContentArea')
                    .message(this[field].labelSecret || this[field].label)
                    .color(null, 0, myColors.black).font("Arial", 20);
                this[field].secret && contentarea.type('password');
                manipulator.unset(1, this[field].content.text);
                drawings.screen.add(contentarea);
                contentarea.setCaretPosition(this[field].labelSecret && this[field].labelSecret.length || this[field].label.length);

                let alreadyDeleted = false,
                    onblur = ()=> {
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
                        manipulator.unset(3);
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
            manipulator.set(2, fieldTitle);
            manipulator.move(-drawing.width / 10, this[field].line * drawing.height / 10);
            this.h = 1.5 * fieldTitle.boundingRect().height;
            var displayText = displayTextWithoutCorners(this[field].label, w, this.h, myColors.black, myColors.white, 20, null, manipulator);
            this[field].content = displayText.content;
            this[field].border = displayText.border;
            this[field].border.mark(field);
            var y = -fieldTitle.boundingRect().height / 4;
            this[field].content.position(x, 0);
            this[field].border.position(x, y);
            var clickEdition = clickEditionField(field, manipulator);
            svg.addEvent(this[field].content, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
            svg.addEvent(this[field].content, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
            svg.addEvent(this[field].border, 'mouseover', ()=>{drawings.screen.mouseCursor('text');});
            svg.addEvent(this[field].border, 'mouseout', ()=>{drawings.screen.mouseCursor('default');});
            svg.addEvent(this[field].content, "click", clickEdition);
            svg.addEvent(this[field].border, "click", clickEdition);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
        };

        this.mailAddressField = {label: "", title: this.mailAddressLabel, line: -1};
        this.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
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
        const connexionButtonHeightRatio = 0.075,
            connexionButtonHeight = drawing.height * connexionButtonHeightRatio,
            connexionButtonWidth = 200,
            connexionButton = displayText(this.connexionButtonLabel, connexionButtonWidth, connexionButtonHeight, myColors.black, myColors.white, 20, null, this.connexionButtonManipulator);
        connexionButton.border.mark('connexionButton');
        this.connexionButtonManipulator.move(0, 2.5 * drawing.height / 10);
        svg.addEvent(connexionButton.content, "click", this.connexionButtonHandler);
        svg.addEvent(connexionButton.border, "click", this.connexionButtonHandler);

        let nextField = (backwards = false)=> {
            let index = this.tabForm.indexOf(focusedField);
            if (index !== -1) {
                backwards ? index-- : index++;
                if (index === this.tabForm.length) index = 0;
                if (index === -1) index = this.tabForm.length - 1;
                clickEditionField(this.tabForm[index].field, this.tabForm[index].border.parentManip);
                svg.event(this.tabForm[index].border, "click", this.connexionButtonHandler);
            }
        };

        svg.addGlobalEvent("keydown", (event)=> {
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                nextField(event.shiftKey);
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                svg.activeElement() && svg.activeElement().blur();
                this.connexionButtonHandler();
            }
        });
    }

    var AdminGUI = function () {
        globalVariables.playerMode = false;
        util.setGlobalVariables();
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
        util.setGlobalVariables();
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