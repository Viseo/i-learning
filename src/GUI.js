/**
 * Created by TDU3482 on 26/04/2016.
 */
'use strict';

var domain, svg, gui, runtime, playerMode, param;
function setDomain(_domain) {
    domain = _domain;
    // call setSvg on modules
}

/* istanbul ignore next */
if(!param) {
    param = {speed: 5, step: 100};
}

function setSVG(_svg){
    svg = _svg;
}

function setGui(_gui){
    gui = _gui;
}

function setRuntime(_runtime){
    runtime = _runtime;
}

function AnswerDisplay (x, y, w, h) {
    let self = this;

    if(self.editable) {
        answerEditableDisplay(x, y, w, h);
        return;
    }
    x && (self.x = x);
    y && (self.y = y);
    w && (self.w = w);
    h && (self.h = h);

    if (self.label && self.imageSrc) { // Question avec Texte ET image
        let obj = displayImageWithTitle(self.label, self.imageSrc, self.dimImage, self.w, self.h, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator,self.image);
        self.bordure = obj.cadre;
        self.content = obj.text;
        self.image = obj.image;
    } else if (self.label && !self.imageSrc) { // Question avec Texte uniquement
        let obj = displayText(self.label, self.w, self.h, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator);
        self.bordure = obj.cadre;
        self.content = obj.content;

    } else if (self.imageSrc && !self.label) { // Question avec Image uniquement
        let obj = displayImageWithBorder(self.imageSrc, self.dimImage, self.w, self.h, self.manipulator);
        self.image = obj.image;
        self.bordure = obj.cadre;
    } else { // Cas pour test uniquement : si rien, n'affiche qu'une bordure
        self.bordure = new svg.Rect(self.w, self.h).color(self.bgColor, 1, myColors.black).corners(25, 25);
        self.manipulator.last.children.indexOf(self.bordure)===-1 && self.manipulator.last.add(self.bordure);

    }

    if(self.selected){ // image pré-selectionnée
        self.bordure.color(self.bgColor, 5, SELECTION_COLOR);
    }
    self.manipulator.translator.move(self.x,self.y);

    function answerEditableDisplay(x, y, w, h) {
        self.checkboxSize = h * 0.2;

        let showTitle = function () {
            let text = (self.label) ? self.label : self.labelDefault,
                color = (self.label) ? myColors.black : myColors.grey;

            if(self.image){
                self.obj = displayImageWithTitle(text, self.image.src, self.image, w, h, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator);
            } else {
                self.obj = displayText(text, w, h, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator);
                self.obj.content.position((self.checkboxSize/2),self.obj.content.y);
            }

            self.obj.cadre.fillOpacity(0.001);
            self.obj.content.color(color);
            self.obj.cadre._acceptDrop = true;
            self.obj.content._acceptDrop = true;

            let editor = (self.editor.puzzle ? self.editor : self.editor.parent);
            editor.puzzle.puzzleManipulator.translator.move(0, editor.toggleButtonHeight-MARGIN);

            svg.addEvent(self.obj.content, 'dblclick', dblclickEditionAnswer);
            svg.addEvent(self.obj.cadre, 'dblclick', dblclickEditionAnswer);
        };

        let dblclickEditionAnswer = function () {
            let contentarea = svg.runtime.createDOM('textarea');
            contentarea.value = self.label;
            contentarea.width = w;
            contentarea.height = svg.runtime.boundingRect(self.obj.content.component).height;
            contentarea.globalPointCenter = self.obj.content.globalPoint(-(contentarea.width)/2,-(contentarea.height)/2);

            let contentareaStyle = {
                toppx: contentarea.globalPointCenter.y - (contentarea.height/2) * 2/3 ,
                leftpx: contentarea.globalPointCenter.x + (1/12) * self.obj.cadre.width,
                height: self.image ? contentarea.height : h * 0.5,
                width: self.obj.cadre.width * 5/6
            };

            svg.runtime.attr(contentarea, 'style',
                `position: absolute; top: ${contentareaStyle.toppx}px; left: ${contentareaStyle.leftpx}px;` +
                `width: ${contentareaStyle.width}px; height: ${contentareaStyle.height}px; overflow:hidden;` +
                `text-align:center; font-family: Arial; font-size: 20px; resize: none; border: none; background-color: transparent;`);

            self.manipulator.ordonator.unset(1, self.obj.content);

            svg.runtime.anchor('content').appendChild(contentarea).focus();

            let removeErrorMessage = function () {
                self.answerNameValidInput = true;
                self.errorMessage && self.editor.questionCreatorManipulator.ordonator.unset(0);
                self.obj.cadre.color(myColors.white, 1, myColors.black);
            };

            let displayErrorMessage = function () {
                removeErrorMessage();
                self.obj.cadre.color(myColors.white, 2, myColors.red);
                let libraryRatio = 0.2,
                    previewButtonHeightRatio = 0.1,
                    marginErrorMessagePreviewButton = 0.03,
                    position = (window.innerWidth / 2 - 0.5 * libraryRatio * drawing.width + 2 * MARGIN),
                    anchor = 'middle';
                self.errorMessage = new svg.Text(REGEXERROR)
                    .position(position,drawing.height * (1 - previewButtonHeightRatio - marginErrorMessagePreviewButton) - 2 * MARGIN)
                    .font('Arial', 15).color(myColors.red).anchor(anchor);
                self.editor.questionCreatorManipulator.ordonator.set(0,self.errorMessage);
                contentarea.focus();
                self.answerNameValidInput = false;
            };

            let onblur = function () {
                self.answerNameValidInput && (self.label = contentarea.value);
                contentarea.remove();
                showTitle();
                if(typeof self.obj.checkbox === 'undefined') {
                    self.checkbox = displayCheckbox(x + self.checkboxSize, y + h - self.checkboxSize, self.checkboxSize, self).checkbox;
                    self.obj.checkbox.answerParent = self;
                }
            };

            contentarea.oninput = function () {
                self.checkInputContentArea({
                    contentarea: contentarea,
                    border: self.obj.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
            };

            contentarea.onblur = onblur;
            self.checkInputContentArea({
                contentarea: contentarea,
                border: self.label.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };

        self.manipulator.flush();
        showTitle();

        if(typeof self.obj.checkbox === 'undefined') {
            self.checkbox = displayCheckbox(x + self.checkboxSize, y + h - self.checkboxSize, self.checkboxSize, self).checkbox;
            self.obj.checkbox.answerParent = self;
        }

        self.manipulator.ordonator.children.forEach(function(e) {
            e._acceptDrop = true;
        });
    }
}

function LibraryDisplay(x, y, w, h) {
    var self = this;
    if (typeof x !== "undefined")(self.x = x);
    if (typeof y !== "undefined")(self.y = y);
    if (typeof w !== "undefined")(self.w = w);
    if (typeof h !== "undefined")(self.h = h);
    self.borderSize = 3;

    self.bordure = new svg.Rect(w - self.borderSize, h, self.libraryManipulator).color(myColors.white, self.borderSize, myColors.black);
    self.bordure.position(w / 2, h / 2 );
    self.libraryManipulator.ordonator.set(0, self.bordure);

    self.titleSvg = autoAdjustText(self.title, 0, 0, w, (1 / 10) * h, null, self.font, self.libraryManipulator).text;
    self.titleSvg.position(w / 2, (1 / 20) * h);

    let maxImagesPerLine = Math.floor((w-MARGIN)/(self.imageWidth+MARGIN)) || 1; //||1 pour le cas de resize très petit
    self.libMargin = (w - (maxImagesPerLine * self.imageWidth)) / (maxImagesPerLine + 1);
    let maxGamesPerLine = 1;
    self.libMargin2 = (w - (maxGamesPerLine * w)) / (maxGamesPerLine + 1) + 2 * MARGIN;
    let tempY = (2 / 10 * h);

    self.itemsTab.forEach((item, i) => {
        if (i % maxImagesPerLine === 0 && i !== 0) {
            tempY += self.imageHeight + self.libMargin;
        }

        if(self.libraryManipulator.last.children.indexOf(self.libraryManipulators[i].first ) !== -1){
            self.libraryManipulator.last.remove(self.libraryManipulators[i].first);
        }
        self.libraryManipulator.last.children.indexOf(self.libraryManipulators[i].first)===-1 && self.libraryManipulator.last.add(self.libraryManipulators[i].first);

        if (drawing.currentPageDisplayed === "QuizManager") {
            let image = displayImage(myLibraryImage.tab[i].imgSrc, item, self.imageWidth, self.imageHeight, self.libraryManipulators[i]).image;
            image.srcDimension = {width: item.width, height: item.height};
            self.libraryManipulators[i].ordonator.set(0, image);

            let X = x + self.libMargin + ((i % maxImagesPerLine) * (self.libMargin + self.imageWidth));
            self.libraryManipulators[i].first.move(X, tempY);
        } else { // Formation
            if (i % maxGamesPerLine === 0 && i !== 0) {
                tempY += self.h / 4 + self.libMargin2;
            }

            let label = JSON.parse(JSON.stringify(myLibraryGames.tab[i].label));
            let obj = displayTextWithCircle(label, Math.min(w/2, h/4), h, myColors.black, myColors.white, null, self.fontSize, self.libraryManipulators[i]);
            obj.cadre.clicked = false;
            self.itemsTab[i] = obj;

            let X = x + self.libMargin2 - 2 * MARGIN + ((i % maxGamesPerLine + 1) * (self.libMargin2 + w / 2 - 2 * MARGIN));
            self.libraryManipulators[i].first.move(X, tempY);
        }
    });

    self.libraryManipulator.translator.move(self.x, self.y);

    self.libraryManipulators.forEach(function (e) {
        var mouseDownAction = function (event) {
            self.arrowMode && self.toggleArrowMode();

            e.parentObject.formation && e.parentObject.formation.removeErrorMessage(e.parentObject.formation.errorMessageDisplayed);
            var manip = new Manipulator(self);
            manip.addOrdonator(2);
            drawings.piste.last.add(manip.first);
            self.formation && self.formation.removeErrorMessage(self.formation.errorMessageDisplayed);
            var elementCopy = e.ordonator.children[0];

            var point = e.ordonator.children[0].globalPoint(e.ordonator.children[0].x, e.ordonator.children[0].y);
            var point2 = manip.first.globalPoint(0, 0);
            manip.first.move(point.x - point2.x, point.y - point2.y);

            if (self.itemsTab && self.itemsTab.length !== 0) {
                if (self.itemsTab[0].content && (self.itemsTab[0].content.messageText !== "")) {
                    self.gameMiniature = displayTextWithCircle(e.ordonator.children[1].messageText, w / 2, h, myColors.black, myColors.white, null, self.fontSize, manip);
                    self.draggedObjectLabel = self.gameMiniature.content.messageText;
                    manip.ordonator.set(0, self.gameMiniature.cadre);
                    manageDnD(self.gameMiniature.cadre, manip);
                    manageDnD(self.gameMiniature.content, manip);
                } else {
                    var img;
                    img = displayImage(elementCopy.src, elementCopy.srcDimension, elementCopy.width, elementCopy.height).image;
                    img.srcDimension = elementCopy.srcDimension;
                    manip.ordonator.set(0, img);
                    manageDnD(img, manip);
                    img.component.listeners && svg.removeEvent(img, 'mouseup', img.component.listeners.mouseup);
                    img.component.target && img.component.target.listeners && img.component.target.listeners.mouseup && svg.removeEvent(img.image, 'mouseup', img.image.component.target.listeners.mouseup);
                }
                var mouseClick = function (event) {
                    var target = drawings.background.getTarget(event.clientX, event.clientY);
                    self.itemsTab.forEach(function (e) {
                        if(e.content) {
                            if (e.content.messageText === target.parent.children[1].messageText) {
                                if (e !== self.gameSelected) {
                                    self.gameSelected && self.gameSelected.cadre.color(myColors.white, 1, myColors.black);
                                    e.cadre.color(myColors.white, 3, SELECTION_COLOR);
                                    self.gameSelected = e;
                                }
                                //else {
                                //    e.cadre.color(myColors.white, 1, myColors.black);
                                //    self.gameSelected = null;
                                //}
                                else {
                                    e.cadre.color(myColors.white, 1, myColors.black);
                                    self.gameSelected = null;
                                }
                            }
                        }
                });
                    self.formation && !self.gameSelected && svg.removeEvent(self.formation.graphBlock.rect, "mouseup", self.formation.mouseUpGraphBlock);
                    self.formation && self.formation.clickToAdd();

                };

                var mouseupHandler = function (event) {
                    var svgObj = manip.ordonator.children.shift();
                    manip.first.parent.remove(manip.first);
                    var target = drawings.background.getTarget(event.clientX, event.clientY);
                    if (target && target.parent && target.parent.parentManip) {
                        if (!(target.parent.parentManip.parentObject instanceof Library)) {
                            self.dropAction(svgObj, event);
                        }
                        else {
                            mouseClick(event);
                        }
                    }
                    self.draggedObjectLabel = "";
                };

                self.gameMiniature && self.gameMiniature.cadre.component.listeners && svg.removeEvent(self.gameMiniature.cadre, 'mouseup', self.gameMiniature.cadre.component.listeners.mouseup);
                self.gameMiniature && self.gameMiniature.cadre.component.target && self.gameMiniature.cadre.component.target.listeners && self.gameMiniature.cadre.component.target.listeners.mouseup && svg.removeEvent(self.gameMiniature.cadre, 'mouseup', self.gameMiniature.cadre.component.target.listeners.mouseup);

                svg.event(drawings.glass, "mousedown", event);
                self.gameMiniature && self.gameMiniature.cadre && svg.addEvent(self.gameMiniature.cadre, 'mouseup', mouseupHandler);
                img && svg.addEvent(img, 'mouseup', mouseupHandler);

                if (self.gameMiniature && self.gameMiniature.content) {
                    self.gameMiniature.content.component.listeners && svg.removeEvent(self.gameMiniature.content, 'mouseup', self.gameMiniature.content.component.listeners.mouseup);
                    self.gameMiniature.content.component.target && self.gameMiniature.content.component.target.listeners && self.gameMiniature.content.component.target.listeners.mouseup && svg.removeEvent(self.gameMiniature.content, 'mouseup', self.gameMiniature.content.component.target.listeners.mouseup);
                    svg.addEvent(self.gameMiniature.content, 'mouseup', mouseupHandler);
                }
            }
        };
        svg.addEvent(e.ordonator.children[0], 'mousedown', mouseDownAction);
        svg.addEvent(e.ordonator.children[1], 'mousedown', mouseDownAction);
    });

    if (drawing.currentPageDisplayed === "Formation") {
        if (self.libraryManipulator.last.children.indexOf(self.arrowModeManipulator.first)!==-1) {
            self.libraryManipulator.last.remove(self.arrowModeManipulator.first);
        }
        self.libraryManipulator.last.children.indexOf(self.arrowModeManipulator.first)===-1 && self.libraryManipulator.last.add(self.arrowModeManipulator.first);
        self.arrowModeManipulator.first.move(w / 2, tempY + (2 / 10) * h);

        let createLink = function (parentGame, childGame) {
            if (parentGame.childrenGames.indexOf(childGame) != -1) return;
            if (parentGame.getPositionInFormation().levelIndex >= childGame.getPositionInFormation().levelIndex) return;

            parentGame.childrenGames.push(childGame);
            childGame.parentGames.push(parentGame);

            let arrow = new Arrow(parentGame, childGame);
            parentGame.parentFormation.arrowsManipulator.last.add(arrow.arrowPath);
        };


        let arrowModeButton = displayText('', w*0.9, (6 / 100) * h, myColors.black, myColors.white, null, self.font, self.arrowModeManipulator);
        arrowModeButton.arrow = drawStraightArrow(-0.3 * w, 0, 0.3 * w, 0);
        arrowModeButton.arrow.color(myColors.black,1,myColors.black);
        self.arrowModeManipulator.ordonator.set(2, arrowModeButton.arrow);

        self.toggleArrowMode = function() {
            let arrowMode = false;

            return function () {
                arrowMode = !arrowMode;
                self.arrowMode = arrowMode;

                let panel = self.formation.panel,
                    graph = self.formation.graphManipulator.last,
                    clip = self.formation.clippingManipulator.last,
                    glass = new svg.Rect(panel.width, panel.height).opacity(0.001).color(myColors.white);

                if (arrowMode) {
                    self.gameSelected = null;
                    self.itemsTab.forEach(e => {e.cadre.color(myColors.white, 1, myColors.black)});

                    self.formation.selectedGame && self.formation.selectedGame.icon.cadre.component.listeners.click();

                    arrowModeButton.cadre.color(myColors.white, 3, SELECTION_COLOR);
                    arrowModeButton.arrow.color(myColors.blue,2,myColors.black);

                    clip.add(glass);
                    glass.position(glass.width/2, glass.height/2);

                    let mouseDownAction = function (event) {
                        event.preventDefault();
                        let targetParent = graph.getTarget(event.clientX, event.clientY);

                        let mouseUpAction = function(event) {
                            let targetChild = graph.getTarget(event.clientX, event.clientY);
                            let booleanInstanceOfCorrect = function(e) {
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

                    let clickAction = function(event) {
                        let target = graph.getTarget(event.clientX, event.clientY);
                        (target instanceof svg.Path ) && target.component && target.component.listeners && target.component.listeners.click();
                    };

                    svg.addEvent(glass, 'mousedown', mouseDownAction);
                    svg.addEvent(glass, 'click', clickAction);
                } else {
                    arrowModeButton.cadre.color(myColors.white, 1, myColors.black);
                    arrowModeButton.arrow.color(myColors.black, 1, myColors.black);
                    clip.remove(clip.children[clip.children.length - 1]);
                }
            }
        }();
        svg.addEvent(arrowModeButton.cadre, 'click', self.toggleArrowMode);
        svg.addEvent(arrowModeButton.arrow, 'click', self.toggleArrowMode)
    }
}

function AddEmptyElementDisplay(x, y, w, h) {
    let self = this;

    self.obj = displayText(self.label, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
    self.plus = drawPlus(0, 0, h * 0.3, h * 0.3);
    self.manipulator.ordonator.set(2, self.plus);
    self.obj.content.position(0, h * 0.35);

    self.obj.cadre.color(myColors.white, 3, myColors.black);
    self.obj.cadre.component.setAttribute && self.obj.cadre.component.setAttribute('stroke-dasharray', '10, 5');
    self.obj.cadre.component.target && self.obj.cadre.component.target.setAttribute('stroke-dasharray', '10, 5');

    var dblclickAdd = function () {
        self.manipulator.flush();
        switch (self.type) {
            case 'answer':
                let newAnswer = new Answer(null, self.parent.linkedQuestion);
                newAnswer.isEditable(self, true);
                self.parent.linkedQuestion.tabAnswer.pop();
                self.parent.linkedQuestion.tabAnswer.push(newAnswer);

                if(self.parent.linkedQuestion.tabAnswer.length < self.parent.MAX_ANSWERS) {
                    self.parent.linkedQuestion.tabAnswer.push(new AddEmptyElement(self.parent, self.type));
                }

                self.parent.puzzle = new Puzzle(2, 4, self.parent.linkedQuestion.tabAnswer, self.parent.coordinatesAnswers, true, self);
                self.parent.questionCreatorManipulator.last.add(self.parent.puzzle.puzzleManipulator.first);
                self.parent.puzzle.display(self.parent.coordinatesAnswers.x,
                    self.parent.coordinatesAnswers.y + self.parent.toggleButtonHeight + self.parent.questionBlock.title.cadre.height/2 - 2*MARGIN, self.parent.coordinatesAnswers.w,
                    self.parent.coordinatesAnswers.h,
                    0);
                break;
            case 'question':
                self.parent.quizz.tabQuestions.pop();
                self.parent.quizz.tabQuestions[self.parent.indexOfEditedQuestion].selected = false;
                self.parent.indexOfEditedQuestion = self.parent.quizz.tabQuestions.length;

                let newQuestion = new Question(null, self.parent.quizz);
                newQuestion.selected = true;
                self.parent.quizz.tabQuestions.push(newQuestion);

                let AddNewEmptyQuestion = new AddEmptyElement(self.parent, 'question');
                self.parent.quizz.tabQuestions.push(AddNewEmptyQuestion);

                if (self.parent.questionPuzzle.questionsTab.length > self.parent.questionPuzzle.rows) {
                    self.parent.displayQuestionsPuzzle(self.parent.questionPuzzleCoordinates.x,
                        self.parent.questionPuzzleCoordinates.y,
                        self.parent.questionPuzzleCoordinates.w,
                        self.parent.questionPuzzleCoordinates.h,
                        self.parent.questionPuzzle.startPosition + 1);
                } else {
                    self.parent.displayQuestionsPuzzle(self.parent.questionPuzzleCoordinates.x,
                        self.parent.questionPuzzleCoordinates.y,
                        self.parent.questionPuzzleCoordinates.w,
                        self.parent.questionPuzzleCoordinates.h,
                        self.parent.questionPuzzle.startPosition);
                }

                self.parent.questionCreator.loadQuestion(newQuestion);

                self.parent.questionCreator.display(self.parent.questionCreator.previousX,
                    self.parent.questionCreator.previousY,
                    self.parent.questionCreator.previousW,
                    self.parent.questionCreator.previousH);
        }
    };

    svg.addEvent(self.plus, "dblclick", dblclickAdd);
    svg.addEvent(self.obj.content, "dblclick", dblclickAdd);
    svg.addEvent(self.obj.cadre, "dblclick", dblclickAdd);
}

function FormationDisplayMiniature (w,h) {
    var self = this;
    self.miniature = displayText(self.label, w, h, myColors.black, myColors.white, null, null, self.manipulatorMiniature);
    self.miniature.cadre.corners(50, 50);
    if (playerMode) return;

    if(self.status==="statusEnum.Published") {
        self.status=statusEnum.Published;
    }
    else if(self.status==="statusEnum.Edited"){
        self.status=statusEnum.Edited;

    }
    else if(self.status==="statusEnum.NotPublished"){
        self.status=statusEnum.Edited;
    }

    var icon = self.status.icon(self.parent.iconeSize);

    for(var i=0; i<icon.elements.length; i++)
    {
        self.iconManipulator.ordonator.set(i,icon.elements[i]);
    }
    self.iconManipulator.translator.move(w / 2 - self.parent.iconeSize + MARGIN + 2, -h / 2 + self.parent.iconeSize - MARGIN - 2);//2Pxl pour la largeur de cadre

}

function FormationDisplayFormation(){
    var self = this;
    drawing.currentPageDisplayed = "Formation";
    self.saveButtonHeight = drawing.height * self.saveButtonHeightRatio;
    self.formationsManager.formationDisplayed = self;

    self.graphCreaHeight = drawing.height * self.graphCreaHeightRatio - drawing.height*0.1;//-15-self.saveButtonHeight;//15: Height Message Error
    self.graphCreaWidth = drawing.width * self.graphWidthRatio - MARGIN;

    self.gamesLibraryManipulator = self.library.libraryManipulator;
    self.manipulator.ordonator.set(2, self.gamesLibraryManipulator.first);
    self.manipulator.ordonator.set(4, self.formationInfoManipulator.first);

    self.libraryWidth = drawing.width * self.libraryWidthRatio;

    self.y = drawing.height * HEADER_SIZE ;

    self.globalMargin = {
        height: self.marginRatio * drawing.height,
        width: self.marginRatio * drawing.width
    };

    //self.clippingManipulator.flush();

    self.borderSize = 3;

    self.manipulator.first.move(0, drawing.height*0.075);
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.title = new svg.Text("Formation : ").position(MARGIN, 0).font("Arial", 20).anchor("start");
    self.manipulator.ordonator.set(0,self.title);
    self.formationWidth = svg.runtime.boundingRect(self.title.component).width;

    if (playerMode) return;


    var showTitle = function() {
        var text = (self.label) ? self.label : (self.label=self.labelDefault);
        var color = (self.label) ? myColors.black : myColors.grey;
        var bgcolor = myColors.grey;
        self.formationLabelWidth = 400 ;
        self.formationLabel = {};
        self.formationLabel.content = autoAdjustText(text, 0, 0, drawing.width, 20, 15, "Arial", self.formationInfoManipulator).text;
        self.labelHeight = svg.runtime.boundingRect(self.formationLabel.content.component).height;

        self.formationTitleWidth = svg.runtime.boundingRect(self.title.component).width;
        self.formationLabel.cadre = new svg.Rect(self.formationLabelWidth, self.labelHeight + MARGIN).color(bgcolor);
        self.formationLabel.cadre.position(self.formationTitleWidth + self.formationLabelWidth/2 +3/2*MARGIN, -MARGIN/2).fillOpacity(0.1);

        self.formationInfoManipulator.ordonator.set(0, self.formationLabel.cadre);
        self.formationLabel.content.position(self.formationTitleWidth + 2 * MARGIN, 0).color(color).anchor("start");

        svg.addEvent(self.formationLabel.content, "dblclick", dblclickEditionFormationLabel);
        svg.addEvent(self.formationLabel.cadre, "dblclick", dblclickEditionFormationLabel);
        self.formationCreator = formationValidation;
    };

    var dblclickEditionFormationLabel = function () {
        var width = svg.runtime.boundingRect(self.formationLabel.content.component).width;

        self.formationInfoManipulator.ordonator.unset(1);

        let contentarea = svg.runtime.createDOM("textarea");
        contentarea.value = self.label;
        var contentareaStyle = {
            toppx:(self.labelHeight/2+drawing.height*0.075-2*MARGIN+3),
            leftpx: (svg.runtime.boundingRect(self.title.component).width+ 2 * MARGIN + 1),
            width: 400,
            height:(self.labelHeight+3)
        };
        svg.runtime.attr(contentarea, "style", "position: absolute; top:" + contentareaStyle.toppx + "px; left:" + contentareaStyle.leftpx + "px; width:" + (contentareaStyle.width) + "px; height:" + contentareaStyle.height + "px; resize: none; border: none; outline:none; overflow:hidden; font-family: Arial; font-size: 15px; background-color: transparent;");
        svg.runtime.anchor("content").appendChild(contentarea).focus();

        var removeErrorMessage = function () {
            self.formationCreator.formationNameValidInput = true;
            self.errorMessage && self.formationInfoManipulator.ordonator.unset(2);
            self.formationLabel.cadre.color(myColors.grey, 1, myColors.none);
        };

        var displayErrorMessage = function () {
            removeErrorMessage();
            self.formationLabel.cadre.color(myColors.grey, 2, myColors.red);
            var anchor = 'start';
            self.errorMessage = new svg.Text(REGEXERRORFORMATION)
                .position(self.formationLabel.cadre.width + self.formationWidth + 2 * MARGIN,0)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            self.formationInfoManipulator.ordonator.set(2, self.errorMessage);
            contentarea.focus();
            self.labelValidInput = false;
        };
        var onblur = function () {
            self.formationCreator.formationNameValidInput && (self.label = contentarea.value);
            contentarea.remove();
            showTitle();
        };
        contentarea.oninput = function () {
            self.checkInputTextArea({
                textarea: contentarea,
                border: self.formationLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        contentarea.onblur = onblur;
        self.checkInputTextArea({
            textarea: contentarea,
            border: self.formationLabel.cadre,
            onblur: onblur,
            remove: removeErrorMessage,
            display: displayErrorMessage
        });
    };
    showTitle();

    var onclickQuizzHandler = function(event){
        var targetQuizz = drawings.background.getTarget(event.clientX,event.clientY).parent.parentManip.parentObject;
        self.quizzManager.loadQuizz(targetQuizz);
        self.quizzDisplayed = targetQuizz;
        self.quizzManager.display();
        self.selectedArrow = null;
        self.selectedGame = null;

        if (!runtime && window.getSelection)
            window.getSelection().removeAllRanges();
        else if (!runtime && document.selection)
            document.selection.empty();
    };

    self.displayLevel = function(w, h, level){

        if(self.levelsTab.length >= self.graphManipulator.ordonator.children.length-1){
            self.graphManipulator.ordonator.order(self.graphManipulator.ordonator.children.length + 1);
        }
        self.graphManipulator.ordonator.set(level.index+1, level.manipulator.first);

        level.obj = displayTextWithoutCorners("Niveau "+level.index, w-3*self.borderSize, self.levelHeight, myColors.none, myColors.white, 20, null, level.manipulator);
        level.obj.line = new svg.Line(MARGIN, self.levelHeight, level.parentFormation.levelWidth, self.levelHeight).color(myColors.black, 3, myColors.black);
        level.obj.line.component.setAttribute && level.obj.line.component.setAttribute('stroke-dasharray', '6');
        level.obj.line.component.target && level.obj.line.component.target.setAttribute && level.obj.line.component.target.setAttribute('stroke-dasharray', '6');
        (self.textLevelNumberDimensions = {
            width: svg.runtime.boundingRect(level.obj.content.component).width,
            height: svg.runtime.boundingRect(level.obj.content.component).height
        });
        level.manipulator.ordonator.set(2, level.obj.line);
        level.obj.cadre.position((w-self.borderSize)/2, self.levelHeight/2).opacity(0.001);
        level.obj.content.position(svg.runtime.boundingRect(level.obj.content.component).width, svg.runtime.boundingRect(level.obj.content.component).height);
        //self.messageDragDrop.position(w/2, svg.runtime.boundingRect(self.title.component).height + 3*self.messageDragDropMargin);
        level.obj.cadre._acceptDrop = true;
        level.obj.content._acceptDrop = true;
        level.w = w;
        level.h = h;
        level.y = (level.index-1) * level.parentFormation.levelHeight;
        level.manipulator.first.move(-w/2-self.panel.content.x, -h/2+level.y);
    };

    self.displayFrame = function (w, h) {
        svg.runtime.addGlobalEvent("keydown", function (event) {
            if(hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        });

        var hasKeyDownEvent = function (event) {
            self.target = self.panel;
            if (event.keyCode===46) { // suppr
                self.selectedArrow && self.selectedArrow.redCrossClickHandler();
                self.selectedGame && self.selectedGame.redCrossClickHandler();
            } else if(event.keyCode === 27 && self.library && self.library.arrowMode) { // échap
                self.library.toggleArrowMode();
            } else if(event.keyCode === 27 && self.library && self.library.gameSelected) {
                self.library.gameSelected.cadre.color(myColors.white, 1, myColors.black);
                self.library.gameSelected = null;
            }
            return self.target && self.target.processKeys && self.target.processKeys(event.keyCode);

        };

        self.manipulator.ordonator.set(1, self.clippingManipulator.first);
        self.clippingManipulator.translator.move(self.libraryWidth, drawing.height*HEADER_SIZE);
        if(typeof self.panel === "undefined") {
            self.panel = new gui.Panel(w, h);
            let spaceOccupiedByAGame = (self.graphElementSize + self.minimalMarginBetweenGraphElements);
            var trueWidth = self.findLongestLevel()[0].gamesTab.length*spaceOccupiedByAGame;
        }
        else {
            self.panel.resize(w, h);
            self.panel.hHandle.horizontal(-w/2,w/2,h/2);
        }
        if(typeof self.panel.hHandle === "undefined"){
            self.panel.addhHandle(function () {
                self.levelsTab.forEach(function (level) {
                    level.manipulator.first.move(-w/2-self.panel.content.x, -h/2+level.y);
                });
            });
            self.panel.resizeContentW(trueWidth-1);
        }

        function controlPositionH(x) {
            if (x > 0) {
                x = 0;
            }
            if (x < -self.panel.content.width + self.panel.view.width) {
                x = -self.panel.content.width + self.panel.view.width;
            }
            return x;
        }
        self.panel.functionOnMoveH(function (x) {
            self.levelsTab.forEach(function (level) {
                if(!level.animation) {
                    level.animation = true;
                    level.manipulator.first.onChannel("level"+level.index).smoothy(param.speed, param.step)
                        .execute(completeMovement).moveTo(-w/2-controlPositionH(x), -h/2+level.y);
                }
                function completeMovement(progress) {
                    if (progress===1) {
                        delete level.animation;
                    }
                }
            });
        });
        self.panel.resizeContent(self.levelHeight*(self.levelsTab.length));
        self.panel.component.move(w/2, h/2);
        (self.clippingManipulator.last.children.indexOf(self.panel.component) === -1) && self.clippingManipulator.last.add(self.panel.component);
        self.panel.border.color(myColors.none, 3, myColors.black);
        self.panel.content.add(self.graphManipulator.first);
        self.panel.hHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
        self.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
    };
    self.updateAllLinks = function(){
        self.arrowsManipulator.flush();
        self.levelsTab.forEach(function(level){
           level.gamesTab.forEach(function(parentGame){
               parentGame.childrenGames.forEach(function(game){
                   var arrow = new Arrow(parentGame,game);
                   parentGame.parentFormation.arrowsManipulator.last.add(arrow.arrowPath);/// !_! attention, peut-être pas remove
               });
           }) ;
        });


    };
    self.displayGraph = function (w, h){
        if (typeof w !== "undefined") self.graphW = w;
        if (typeof h !== "undefined") self.graphH = h;
        //self.graphManipulator.flush();
        self.messageDragDropMargin = self.graphCreaHeight/8-self.borderSize;
        var height = (self.levelHeight*(self.levelsTab.length+1) > self.graphH) ? (self.levelHeight*(self.levelsTab.length+1)) : self.graphH;
        if(self.levelWidth<self.graphCreaWidth){
            self.levelWidth=self.graphCreaWidth;
        }
        for(var i = 0; i<self.levelsTab.length; i++){
            self.displayLevel(self.graphCreaWidth, self.graphCreaHeight,self.levelsTab[i]);
            self.adjustGamesPositions(self.levelsTab[i]);
            self.levelsTab[i].gamesTab.forEach(function(tabElement){
                tabElement.miniatureManipulator.addOrdonator(2);
                (self.miniaturesManipulator.last.children.indexOf(tabElement.miniatureManipulator.first) === -1) && self.miniaturesManipulator.last.add(tabElement.miniatureManipulator.first);// mettre un manipulateur par niveau !_! attention à bien les enlever

                if(typeof tabElement.miniature === "undefined"){
                    tabElement.miniature = tabElement.displayMiniature(self.graphElementSize);
                }
                tabElement.miniatureManipulator.first.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);

                if(tabElement instanceof Quizz){
                    svg.addEvent(tabElement.miniature.icon.cadre, "dblclick", onclickQuizzHandler);
                    svg.addEvent(tabElement.miniature.icon.content, "dblclick", onclickQuizzHandler);
                }else if(tabElement instanceof Bd){
                    // Ouvrir le Bd creator du futur jeu Bd
                }
            });
        }

        self.messageDragDropMargin = self.graphCreaHeight/8-self.borderSize;
        self.graphBlock = {rect: new svg.Rect(self.levelWidth-self.borderSize, height-self.borderSize).color(myColors.white, self.borderSize, myColors.none)};//.position(w / 2 - self.borderSize, 0 + h / 2)};
        self.messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", 0, 0, self.graphW, self.graphH, 20, null, self.graphManipulator).text;
        self.messageDragDrop._acceptDrop = true;
        (self.levelsTab.length !== 0) && (self.messageDragDrop.x = (self.levelsTab.length !== 0) ? svg.runtime.boundingRect(self.levelsTab[self.levelsTab.length - 1].obj.content.component).width/2 + (self.levelWidth - self.graphCreaWidth)/2 :0);
        self.messageDragDrop.y = self.messageDragDropMargin - self.graphCreaHeight/2 + (self.levelsTab.length) * self.levelHeight;
        self.messageDragDrop.position(self.messageDragDrop.x, self.messageDragDrop.y).color(myColors.grey);//.fontStyle("italic");
        self.graphBlock.rect._acceptDrop = true;
        self.graphManipulator.translator.move(self.graphW/2, self.graphH/2);

        self.panel.back._acceptDrop = true;

        self.panel.resizeContent(height);

        let spaceOccupiedByAGame = (self.graphElementSize + self.minimalMarginBetweenGraphElements);
        var trueWidth = self.findLongestLevel()[0].gamesTab.length*spaceOccupiedByAGame;
        self.panel.resizeContentW(trueWidth-1);
        self.panel.back.parent.parentManip = self.graphManipulator;

        self.updateAllLinks();
    };

    self.displayFrame(self.graphCreaWidth, self.graphCreaHeight);
    self.displayGraph(self.graphCreaWidth, self.graphCreaHeight);
    self.library.display(0,drawing.height*HEADER_SIZE,self.libraryWidth, self.graphCreaHeight);
    //self.title.component.getBoundingClientRect && self.gamesLibraryManipulator.translator.move(0, self.graphCreaHeight/2);
    //self.title.component.target && self.title.component.target.getBoundingClientRect && self.gamesLibraryManipulator.translator.move(0, self.graphCreaHeight/2);
    self.displayFormationSaveButton(drawing.width/2, drawing.height*0.87 ,self.ButtonWidth, self.saveButtonHeight); ////15: Height Message Error
}

function FormationDisplayErrorMessage(message){
    var self = this;
    self.errorMessageDisplayed = autoAdjustText(message, 0, 0, self.graphCreaWidth, self.graphCreaHeight, 20, null, self.manipulator).text
        .color(myColors.red).position(drawing.width - MARGIN, 0).anchor("end");
}

function FormationRemoveErrorMessage(message) {
    message && message.parent && message.parent.remove(message);
}

function FormationDisplaySaveButton(x, y, w, h) {
        var self = this;
        self.saveFormationButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, self.saveFormationButtonManipulator);
        self.formationCreator.errorMessageSave && self.formationCreator.errorMessageSave.parent && self.saveFormationButtonManipulator.last.remove(self.formationCreator.errorMessageSave);

        var saveFormationFunction = function () {
            var validation = true;
            var exist = false;

            var callback = function (data) {
                var myFormation = data && JSON.parse(data).formation;
                if (myFormation) {
                    self.errorMessageSave && self.saveFormationButtonManipulator.last.remove(self.errorMessageSave);
                    var messageText = "Le nom de cette formation est déjà utilisé !";
                    self.errorMessage = new svg.Text(messageText)
                        .position(self.formationLabel.cadre.width + self.formationWidth + MARGIN * 2, 0)
                        .font("Arial", 15)
                        .anchor('start').color(myColors.red);
                    setTimeout(function () {
                        self.formationInfoManipulator.ordonator.set(2, self.errorMessage);
                    }, 1);
                    exist = true;
                }

                formationValidation.forEach(formValid => {
                    var result = formValid(self);

                    if (result.isValid && !exist) {
                        self.errorMessageSave && self.saveFormationButtonManipulator.last.remove(self.errorMessageSave);
                        self.errorMessageSave = new svg.Text(result.messageSave)
                            .position(0, -self.saveButtonHeight / 2 - MARGIN)
                            .font("Arial", 20)
                            .anchor('middle').color(myColors.green);
                        self.saveFormationButtonManipulator.last.add(self.errorMessageSave);
                    }
                    else if (!result.isValid) {
                        self.errorMessageSave &&  self.saveFormationButtonManipulator.last.remove(self.errorMessageSave);
                        self.errorMessageSave = new svg.Text(result.messageError)
                            .position(0, -self.saveButtonHeight / 2 - MARGIN)
                            .font("Arial", 20)
                            .anchor('middle').color(myColors.red);
                        self.saveFormationButtonManipulator.last.add(self.errorMessageSave);
                    }

                    validation = validation && result.isValid;
                });

                if (validation && !exist) {
                    var tmpFormationObject = {
                        label: self.label,
                        gamesCounter: self.gamesCounter,
                        levelsTab: self.levelsTab
                    };
                    let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
                    dbListener.httpPostAsync("/insert", tmpFormationObject, function(){}, ignoredData);
                }
            };
            Server.getFormationByName(self.label, callback);
    };

    svg.addEvent(self.saveFormationButton.cadre, "click", saveFormationFunction);
    svg.addEvent(self.saveFormationButton.content, "click", saveFormationFunction);
    self.saveFormationButtonManipulator.translator.move(x, y);
}

function FormationsManagerDisplay() {
    let self = this;
    drawing.currentPageDisplayed = "FormationsManager";
    self.manipulator.first.move(0, drawing.height * HEADER_SIZE);
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.manipulator.last.children.indexOf(self.headerManipulator.first)===-1 && self.manipulator.last.add(self.headerManipulator.first);

    if (playerMode) {
        self.headerManipulator.last.add(self.toggleFormationsManipulator.first);
        self.toggleFormationsCheck = new svg.Rect(20, 20).color(myColors.white, 2, myColors.black);
        self.toggleFormationsManipulator.ordonator.set(0, self.toggleFormationsCheck);
        let toggleFormationsText = new svg.Text("Formations en cours").font("Arial", 20);
        self.toggleFormationsManipulator.ordonator.set(1, toggleFormationsText);
        toggleFormationsText.position(svg.runtime.boundingRect(toggleFormationsText.component).width / 2 + 2 * MARGIN, 6);
        self.toggleFormationsManipulator.translator.move(drawing.width - (svg.runtime.boundingRect(toggleFormationsText.component).width + 2 * MARGIN +
            svg.runtime.boundingRect(self.toggleFormationsCheck.component).width ), 0);

        let toggleFormations = function () {
            let all = false;

            return function () {
                all = !all;
                let check = drawCheck(0, 0, 20),
                    manip = self.toggleFormationsManipulator.last;
                svg.addEvent(manip, "click", toggleFormations);
                if (all) {
                    manip.add(check);
                } else {
                    manip.remove(manip.children[manip.children.length - 1]);
                }
            }
        }();

        svg.addEvent(self.toggleFormationsCheck, "click", toggleFormations);
        svg.addEvent(toggleFormationsText, "click", toggleFormations);
    } else {
        self.headerManipulator.last.children.indexOf(self.addButtonManipulator)===-1 && self.headerManipulator.last.add(self.addButtonManipulator.first);
        self.addButtonManipulator.translator.move(self.plusDim / 2, self.addButtonHeight);
        self.headerManipulator.last.add(self.checkManipulator.first);
        self.headerManipulator.last.add(self.exclamationManipulator.first);
    }

    function displayPanel() {
        self.heightAllocatedToPanel = drawing.height - (playerMode ?
            self.toggleFormationsCheck.globalPoint(0, 0).y + self.toggleFormationsCheck.height + MARGIN :
            self.addFormationButton.cadre.globalPoint(0, 0).y + self.addFormationButton.cadre.height);
        self.headerHeightFormation = drawing.height * self.header.size ;
        self.spaceBetweenElements = {
            width:self.panel?0.015*self.panel.width:0.015*drawing.width,
            height: self.panel?0.030*self.panel.height:0.030*drawing.height
        };
        self.y = (!playerMode) ? self.addButtonHeight*2 : self.toggleFormationsCheck.height * 2;//drawing.height * self.header.size;

        self.rows = Math.floor((drawing.width - 2*MARGIN) / (self.tileWidth + self.spaceBetweenElements.width));
        if(self.rows === 0) self.rows = 1;

        svg.runtime.addGlobalEvent('keydown', function (event) {
            if(hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        });

        var hasKeyDownEvent = function (event) {
            self.target = self.panel;
            return self.target && self.target.processKeys && self.target.processKeys(event.keyCode);
        };

        self.manipulator.last.children.indexOf(self.clippingManipulator.first)===-1 && self.manipulator.last.add(self.clippingManipulator.first);
        self.clippingManipulator.translator.move(MARGIN/2, self.y);
        var formationPerLine = Math.floor((drawing.width - 2*MARGIN)/((self.tileWidth + self.spaceBetweenElements.width)));
        var widthAllocatedToDisplayedElementInPanel = Math.floor((drawing.width - 2*MARGIN)-(formationPerLine*(self.tileWidth + self.spaceBetweenElements.width)));
        if(typeof self.panel === "undefined") {
            self.panel = new gui.Panel(drawing.width - 2 * MARGIN, self.heightAllocatedToPanel, myColors.none);
        }
        else {
            self.panel.resize(drawing.width - 2 * MARGIN, self.heightAllocatedToPanel);
        }
        self.panel.component.move((drawing.width-2*MARGIN)/2, self.heightAllocatedToPanel /2);
        (self.clippingManipulator.last.children.indexOf(self.panel.component) === -1) && self.clippingManipulator.last.add(self.panel.component);
        self.panel.content.children.indexOf(self.formationsManipulator.first)===-1 && self.panel.content.add(self.formationsManipulator.first);
        self.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);

        self.formationsManipulator.translator.move((self.tileWidth+widthAllocatedToDisplayedElementInPanel)/2, self.tileHeight/2+self.spaceBetweenElements.height/2);
    }

    function onClickFormation(formation) {
        var callback = function (data) {
            var myFormation = JSON.parse(data).formation;
            formation.loadFormation(myFormation);
            formation.formationsManager.header.setMessage("Formation : " + formation.label);
            self.formationDisplayed = formation;
            self.formationDisplayed.displayFormation();
        };
        !playerMode && Server.getFormationById(formation._id, callback);
    }

    function onClickNewFormation() {
        var formation = new Formation({}, self);
        self.header.redim();
        self.formationDisplayed=formation;
        formation.parent = self;
        formation.displayFormation();
    }

    self.displayHeaderFormations = function () {
        self.title = new svg.Text("Formations").position(MARGIN, 0).font("Arial", 20).anchor("start");
        self.headerManipulator.ordonator.set(0, self.title);
        self.headerManipulator.translator.move(0,2*MARGIN);
        self.addFormationButton=displayText("Ajouter une formation",drawing.width/7,self.addButtonHeight,myColors.none, myColors.lightgrey, 20, null, self.addButtonManipulator);
        var addFormationButtonTextBr = svg.runtime.boundingRect(self.addFormationButton.content.component);
        self.addFormationButton.cadre.position(MARGIN +addFormationButtonTextBr.width/2, -addFormationButtonTextBr.height/2).corners(0,0);
        self.addFormationButton.content.position(self.plusDim+svg.runtime.boundingRect(self.addFormationButton.content.component).width/2, -addFormationButtonTextBr.height/8);
        self.addFormationObject = drawPlusWithCircle(MARGIN, -addFormationButtonTextBr.height/2, self.addButtonHeight, self.addButtonHeight);
        self.addButtonManipulator.ordonator.set(2, self.addFormationObject.circle);
        self.addButtonManipulator.ordonator.set(3, self.addFormationObject.plus);
        self.addFormationObject.circle.position(MARGIN, -addFormationButtonTextBr.height/2);

        svg.addEvent(self.addFormationObject.circle, "click", onClickNewFormation);
        svg.addEvent(self.addFormationObject.plus, "click", onClickNewFormation);
        svg.addEvent(self.addFormationButton.content, "click", onClickNewFormation);
        svg.addEvent(self.addFormationButton.cadre, "click", onClickNewFormation);

        self.legendDim = self.plusDim / 2;

        self.checkLegend = statusEnum.Published.icon(self.iconeSize);
        self.checkManipulator.ordonator.set(2, self.checkLegend.square);
        self.checkManipulator.ordonator.set(3, self.checkLegend.check);
        self.published = autoAdjustText("Publié", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize * 3 / 4, null, self.checkManipulator).text.anchor("start");
        self.published.position(25, self.published.y);

        self.exclamationLegend = statusEnum.Edited.icon(self.iconeSize);
        self.exclamationManipulator.ordonator.set(0, self.exclamationLegend.circle);
        self.exclamationManipulator.ordonator.set(2, self.exclamationLegend.dot);
        self.exclamationManipulator.ordonator.set(3, self.exclamationLegend.exclamation);
        self.toPublish = autoAdjustText("Nouvelle version à publier", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize * 3 / 4, null, self.exclamationManipulator).text.anchor("start");
        self.toPublish.position(25, self.toPublish.y);
        self.legendWidth = drawing.width * 0.3;
        self.legendItemLength = svg.runtime.boundingRect(self.toPublish.component).width+svg.runtime.boundingRect(self.exclamationLegend.circle.component).width+MARGIN;
        self.checkManipulator.first.move(drawing.width - self.legendItemLength - svg.runtime.boundingRect(self.published.component).width-svg.runtime.boundingRect(self.checkLegend.square.component).width-2*MARGIN, 30);
        self.exclamationManipulator.first.move(drawing.width - self.legendItemLength, 30);
       // self.exclamationManipulator.first.move(drawing.width - self.legendWidth + self.legendItemLength, 30);

        self.formations.sort(function (a, b) {
            var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase();
            if (nameA < nameB)
                return -1;
            if (nameA > nameB)
                return 1;
            return 0
        });
    };
    self.header.display();
    self.header.drawBody();
    self.displayHeaderFormations();
    (self.tileHeight < 0) && (self.tileHeight = undefined);
    (!self.tileHeight || self.tileHeight > 0) && displayPanel();

    self.displayFormations = function () {
        let posx = self.initialFormationsPosX,
            posy = MARGIN,
            count = 0,
            totalLines = 1;
        self.formations.forEach(formation => {
            if(playerMode && formation.status.toString() === statusEnum.NotPublished.toString()) return;

            if (count > (self.rows - 1)) {
                count = 0;
                totalLines ++;
                posy += (self.tileHeight + self.spaceBetweenElements.height);
                posx = self.initialFormationsPosX;
            }
            formation.parent = self;
            self.formationsManipulator.last.children.indexOf(formation.manipulatorMiniature.first)===-1 && self.formationsManipulator.last.add(formation.manipulatorMiniature.first);
            if(typeof formation.miniature === "undefined"){
                formation.displayMiniature(self.tileWidth, self.tileHeight);
            }
            formation.manipulatorMiniature.translator.move(posx, posy);
            formation.manipulatorMiniature.last.children.indexOf(formation.iconManipulator.first)===-1 && formation.manipulatorMiniature.last.add(formation.iconManipulator.first);

            (function (element) {
                if (element.miniature.cadre) {
                    svg.addEvent(element.miniature.cadre, "click", function () {
                        onClickFormation(element);
                    });
                }
                if (element.miniature.content) {
                    svg.addEvent(element.miniature.content, "click", function () {
                        onClickFormation(element);
                    });
                }
                if (element.miniature.image) {
                    svg.addEvent(element.miniature.image, "click", function () {
                        onClickFormation(element);
                    });
                }
            })(formation);
            count++;
            posx += (self.tileWidth+ self.spaceBetweenElements.width);
        });
        self.panel.resizeContent(totalLines*(MARGIN+self.tileHeight)+self.tileHeight/2);
    };
    (self.tileHeight > 0) && self.displayFormations();
}

function HeaderDisplay () {
    let self = this;

    self.width = drawing.width;
    self.height = 0.05 * drawing.height;

    let text = new svg.Text(self.label).position(MARGIN, self.height * 0.75).font('Arial', 20).anchor('start');
    self.manipulator.ordonator.set(1, text);

    mainManipulator.ordonator.set(0, self.manipulator.first);
    self.redim = function() {
        self.line = new svg.Line(0, self.height, self.width, self.height).color(myColors.black, 3, myColors.black);
        self.addMessage && (self.addMessageText = new svg.Text(self.addMessage).position(self.width/2, self.height/2+MARGIN).font('Arial', 32));
    };
    self.redim();

    self.addMessage ? self.manipulator.ordonator.set(2, self.addMessageText) : self.manipulator.ordonator.unset(2);
    self.manipulator.ordonator.set(0, self.line);
    self.manipulator.last.children.indexOf(self.userManipulator.first)===-1 && self.manipulator.last.add(self.userManipulator.first);
    //var body = new svg.Circle(20).color(myColors.black);
    self.drawBody = function(){
        var body = new svg.CurvedShield(35, 30, 0.5).color(myColors.black).position(0, -5);
        var head = new svg.Circle(12).color(myColors.black, 2, myColors.white).position(0, -20);
        self.userManipulator.ordonator.set(0, body);
        self.userManipulator.ordonator.set(1, head);
        self.userManipulator.translator.move(3*drawing.width/4, 30);
        self.userManipulator.scalor.scale(0.65);
        var user = {firstName: "Tony", name:"Stark"};
        var userText = autoAdjustText(user.firstName + " " + user.name, 0, 0, 200, 50, 30, null, self.userManipulator, 3);
        userText.text.position(100, 0);
        var deconnection = autoAdjustText("Déconnexion", 0, 0, 200, 50, 30, null, self.userManipulator, 4);
        deconnection.text.position(300,0);
    }
}

function PuzzleDisplay(x, y, w, h, startPosition) {
    let self = this;
    self.startPosition = startPosition;
    self.puzzleManipulator.last.remove(self.questionWithBadAnswersManipulator.first);
    self.questionWithBadAnswersManipulator = new Manipulator(self);
    self.puzzleManipulator.last.add(self.questionWithBadAnswersManipulator.first);

    let removeArrows = function (){
        if (self.leftArrowManipulator.last.children.length > 1) self.leftArrowManipulator.flush();
        if (self.rightArrowManipulator.last.children.length > 1) self.rightArrowManipulator.flush();
    };

    let handlerLeftArrow = function (){
        removeArrows();
        if (self.rows === 1 && startPosition !== 0) {
            self.display(x, y, w, h, startPosition - 1);
        } else if (startPosition - self.rows + 1 <= 0) {
            self.display(x, y, w, h, 0);
        } else {
            self.display(x, y, w, h, startPosition - self.rows + 1);
        }
    };

    if (self.rows < self.totalRows) {
        let leftArrow = drawArrow(0, 0, 75, 75, self.leftArrowManipulator);
        if (startPosition === 0) {
            leftArrow.color(myColors.grey);
            if (leftArrow.onClick !== null) {
                svg.removeEvent(leftArrow, 'click', leftArrow.onClick);
            }
        } else {
            leftArrow.color(myColors.black);
            svg.addEvent(leftArrow, "click", handlerLeftArrow);
        }

        self.leftArrowManipulator.rotator.rotate(180);
        self.leftArrowManipulator.translator.move(-w/2 - MARGIN + 75/2, y + h/2);// marge post-rotation

        let handlerRightArrow = function () {
            removeArrows();
            if(self.rows === 1 && startPosition !== self.totalRows - 1) {
                self.display(x, y, w, h, startPosition + 1);
            } else if(2*self.rows + startPosition >= self.totalRows) {
                let newStartPosition = self.totalRows - self.rows;
                self.display(x, y, w, h, newStartPosition);
            } else {
                let newStartPosition = startPosition + self.rows - 1;
                self.display(x, y, w, h, newStartPosition);
            }
        };

        let rightArrow = drawArrow(0, 0, 75, 75, self.rightArrowManipulator);
        if (startPosition + self.rows >= self.totalRows) {
            rightArrow.color(myColors.grey);
            if (rightArrow.onClick !== null) {
                svg.removeEvent(rightArrow, 'click', rightArrow.onClick);
            }
        } else {
            rightArrow.color(myColors.black);
            svg.addEvent(rightArrow, 'click', handlerRightArrow);
        }

        self.rightArrowManipulator.translator.move(w/2 - 75/2 + MARGIN, y + h/2);
        self.initTiles(x + MARGIN + 50, y, w - 100 - MARGIN*2, h, startPosition);
    } else {
        self.initTiles(x, y, w, h, startPosition);
    }
}

function PuzzleInitTiles(x, y, w, h, startPosition) {
    var self = this;
    self.w = w;
    self.h = h;
    self.tileWidth = (w - (self.rows - 1) * MARGIN) / self.rows;
    self.tileHeight = (h - (self.lines + 1) * MARGIN) / self.lines;
    var posX = 0;
    var posY = y;
    var count = startPosition * self.lines;
    if((self.tileHeight > 0) && (self.tileWidth > 0)){
    if (self.reverseMode) {
        // Valable pour 2 lignes 4 col
        for (var i = startPosition; i < (startPosition + self.lines); i++) {
            for (var j = 0; j < self.rows; j++) {
                if (count < self.questionsTab.length) {
                    self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].manipulator.first);
                    if (!(self.virtualTab[i][j].bordure)) {
                        self.virtualTab[i][j].display(-self.tileWidth / 2, -self.tileHeight / 2, self.tileWidth, self.tileHeight);
                        if (self.virtualTab[i][j].bordure && self.virtualTab[i][j].bordureEventHandler) {
                            svg.addEvent(self.virtualTab[i][j].bordure, 'click', self.virtualTab[i][j].bordureEventHandler);
                        }
                        if (self.virtualTab[i][j].content && self.virtualTab[i][j].contentEventHandler) {
                            svg.addEvent(self.virtualTab[i][j].content, 'click', self.virtualTab[i][j].contentEventHandler);
                        }
                        if (self.virtualTab[i][j].raphImage && self.virtualTab[i][j].imageEventHandler) {
                            svg.addEvent(self.virtualTab[i][j].raphImage, 'click', self.virtualTab[i][j].imageEventHandler);
                        }
                    }
                    self.virtualTab[i][j].manipulator.first.move(posX + self.tileWidth / 2 + MARGIN, posY + MARGIN);

                    posX += self.tileWidth + MARGIN;
                    count++;
                }
                else {
                    break;
                }
            }
            posY += self.tileHeight + MARGIN;
            posX = 0;
        }
    } else {
        for (i = startPosition; i < (startPosition + self.rows); i++) {
            for (j = 0; j < self.lines; j++) {
                if (count < self.questionsTab.length) {
                    if (self.virtualTab[i][j] instanceof AddEmptyElement) {
                        self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].manipulator.first);
                    } else {
                        self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].questionManipulator.first);
                        self.virtualTab[i][j].questionManipulator.ordonator.unset(3);
                    }
                    self.virtualTab[i][j].display(0, 0, self.tileWidth, self.tileHeight);
                    if (self.virtualTab[i][j].bordure && self.virtualTab[i][j].bordureEventHandler) {
                        svg.addEvent(self.virtualTab[i][j].bordure, 'click', self.virtualTab[i][j].bordureEventHandler);
                    }
                    if (self.virtualTab[i][j].content && self.virtualTab[i][j].contentEventHandler) {
                        svg.addEvent(self.virtualTab[i][j].content, 'click', self.virtualTab[i][j].contentEventHandler);
                    }
                    if (self.virtualTab[i][j].raphImage && self.virtualTab[i][j].imageEventHandler) {
                        svg.addEvent(self.virtualTab[i][j].raphImage, 'click', self.virtualTab[i][j].imageEventHandler);
                    }

                    if (self.virtualTab[i][j] instanceof AddEmptyElement) {
                        self.virtualTab[i][j].manipulator.translator.move(posX + self.tileWidth / 2 - w / 2, posY + self.tileHeight / 2 + MARGIN);
                    } else {
                        self.virtualTab[i][j].questionManipulator.translator.move(posX + self.tileWidth / 2 - w / 2, posY + self.tileHeight / 2 + MARGIN);
                    }

                    posY += self.tileHeight + MARGIN;
                    count++;
                } else {
                    break;
                }
            }
            posX += self.tileWidth + MARGIN;
            posY = y;
        }
    }
}
}

function QuestionDisplay(x, y, w, h) {
    var self = this;
    if(typeof x !== 'undefined'){
        self.x = x;
    }
    if(typeof y !== 'undefined' ){
        self.y=y;
    }
    w && (self.width = w);
    h && (self.height = h);

    // Question avec Texte ET image
    if (typeof self.label !== "undefined" && self.imageSrc) {
        let obj = displayImageWithTitle(self.label, self.imageSrc, {width:self.image.width, height:self.image.height}, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font, self.questionManipulator, self.raphImage);
        self.bordure = obj.cadre;
        self.content = obj.content;
        self.raphImage = obj.image;
    }
    // Question avec Texte uniquement
    else if (typeof self.label !== "undefined" && !self.imageSrc) {
        var object = displayText(self.label, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font,self.questionManipulator);
        self.bordure = object.cadre;
        self.content = object.content;

    }
    // Question avec Image uniquement
    else if (self.imageSrc && !self.label) {
        self.raphImage = displayImage(self.imageSrc, self.dimImage, self.w, self.height).image;
        self.questionManipulator.ordonator.set(2, self.raphImage);

    }
    else {
        self.bordure = new svg.Rect( self.width, self.height).color(self.bgColor,1,self.colorBordure);
        self.questionManipulator.ordonator.set(0, self.bordure);
    }
    var fontSize = Math.min(20, h*0.1);
    self.questNum = new svg.Text(self.questionNum).position(-w/2+MARGIN+(fontSize*(self.questionNum.toString.length)/2), -h/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
    self.questionManipulator.ordonator.set(4, self.questNum);
    self.questionManipulator.translator.move(self.x,self.y);
    self.selected && self.selectedQuestion();
}

function QuestionElementClicked(sourceElement) {
    var self = this;
    if(self.multipleChoice === false){// question normale, une seule réponse possible
        if(sourceElement.correct) {
            self.parentQuizz.score++;
            console.log("Bonne réponse!\n");
        } else {
            self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex]);
            var reponseD = "";
            self.rightAnswers.forEach(function(e){
                if(e.label)
                {
                    reponseD+= e.label+"\n";
                }
                else if(e.imageSrc)
                {
                    var tab = e.imageSrc.split('/');
                    reponseD += tab[(tab.length-1)]+"\n";
                }
            });
            console.log("Mauvaise réponse!\n  Bonnes réponses: \n"+reponseD);
        }

        self.parentQuizz.nextQuestion();
    }else{// question à choix multiples
        if(sourceElement.selected === false){
            // on sélectionne une réponse
            sourceElement.selected = true;
            self.selectedAnswers.push(sourceElement);
            sourceElement.colorBordure = sourceElement.bordure.strokeColor;
            sourceElement.bordure.color(sourceElement.bgColor, 5, SELECTION_COLOR);
            self.resetButton.cadre.color(myColors.yellow, 1, myColors.green);
        }else{
            sourceElement.selected = false;
            self.selectedAnswers.splice(self.selectedAnswers.indexOf(sourceElement), 1);
            sourceElement.bordure.color(sourceElement.bgColor, 1, sourceElement.colorBordure);
            if(self.selectedAnswers.length === 0){
                self.resetButton.cadre.color(myColors.grey,1,myColors.grey);
            }
        }
    }
}

function QuestionDisplayAnswers(x, y, w, h) {
    var self = this;
    if (self.rows !== 0) {
        if(typeof x !=='undefined'){
            (self.initialAnswersPosX=x);
        }
        if(typeof w !=='undefined' ){
            ( self.tileWidth = (w - MARGIN * (self.rows - 1)) / self.rows);
        }
        self.tileHeight = 0;
        h = h-50;

        if(typeof h !== 'undefined'){
            (self.tileHeightMax = Math.floor(h/self.lines)-2*MARGIN);
        }

        self.tileHeightMin = 2.50*self.fontSize;
        var tmpTileHeight;

        for(var answer of self.tabAnswer) {//answer.image.height
            answer.image ? (tmpTileHeight = self.tileHeightMax): (tmpTileHeight=self.tileHeightMin);
            if (tmpTileHeight > self.tileHeightMax && tmpTileHeight>self.tileHeight) {
                self.tileHeight = self.tileHeightMax;
            }
            else if (tmpTileHeight>self.tileHeight){
                self.tileHeight = tmpTileHeight;
            }
        }
        self.questionManipulator.ordonator.set(3, self.answersManipulator.first);

        self.answersManipulator.translator.move(0, self.height/2 + (self.tileHeight)/2);

        var posx = 0;
        var posy = 0;
        var count = 0;
        for (var i = 0; i < self.tabAnswer.length; i++) {
            if (i !== 0) {
                posx += (self.tileWidth + MARGIN);
            }
            if (count > (self.rows - 1)) {
                count = 0;
                posy += (self.tileHeight + MARGIN);
                posx = self.initialAnswersPosX;
            }

            self.answersManipulator.last.add(self.tabAnswer[i].manipulator.first);
            self.tabAnswer[i].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
            self.tabAnswer[i].manipulator.translator.move(posx-(self.rows - 1)*self.tileWidth/2-(self.rows - 1)*MARGIN/2,posy+MARGIN);

            (function(element) {
                if(element.bordure) {
                    svg.addEvent(element.bordure,"click",function() {
                        self.elementClicked(element);
                    });
                }

                if(element.content) {
                    svg.addEvent(element.content,"click",function() {
                        self.elementClicked(element);
                    });
                }

                if (element.image) {
                    svg.addEvent(element.image,"click",function() {
                        self.elementClicked(element);
                    });
                }
            })(self.tabAnswer[i]);
            count++;
        }
    }

    if(self.multipleChoice){
        //affichage d'un bouton "valider"
        w = 0.1 * drawing.width;
        h = Math.min(self.tileHeight, 50);
        var validateX,validateY;
        validateX = 0.08 * drawing.width - w/2;
        validateY = self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;

        var validateButton = displayText("Valider", w, h, myColors.green, myColors.yellow, 20, self.font, self.validateManipulator);
        self.validateManipulator.translator.move(validateX + w/2, validateY + h/2);

        //button. onclick
        var oclk = function(){
            // test des valeurs, en gros si selectedAnswers === rigthAnswers
            var allRight = false;

            if(self.rightAnswers.length !== self.selectedAnswers.length){
                allRight = false;
            }else{
                var subTotal = 0;
                self.selectedAnswers.forEach(function(e){
                    if(e.correct){
                        subTotal++;
                    }
                });
                allRight = (subTotal === self.rightAnswers.length);
            }

            if(allRight) {
                self.parentQuizz.score++;
                console.log("Bonne réponse!\n");
            } else {
                self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex]);
                var reponseD = "";
                self.rightAnswers.forEach(function(e){
                    if(e.label) {
                        reponseD += e.label+"\n";
                    }
                    else if(e.imageSrc)
                    {
                        var tab = e.imageSrc.split('/');
                        reponseD += tab[(tab.length-1)] + "\n";
                    }
                });
                console.log("Mauvaise réponse!\n  Bonnes réponses: "+reponseD);
            }
            self.parentQuizz.nextQuestion();

        };
        svg.addEvent(validateButton.cadre, 'click', oclk);
        svg.addEvent(validateButton.content, 'click', oclk);

        //Button reset
        w = 0.1 * drawing.width;
        h = Math.min(self.tileHeight, 50);
        var resetX = - w/2 - 0.08 * drawing.width;
        var resetY = self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;
        self.resetButton = displayText("Réinitialiser", w, h, myColors.grey, myColors.grey, 20, self.font, self.resetManipulator);
        self.resetManipulator.translator.move(resetX+w/2,resetY+h/2);
        if(self.selectedAnswers.length !== 0){
            self.resetButton.cadre.color(myColors.yellow, 1, myColors.green);
        }
        self.reset = function(){
            if(self.selectedAnswers.length > 0){
                self.selectedAnswers.forEach(function(e){
                    e.selected = false;
                    e.bordure.color(e.bgColor, 1, e.colorBordure);
                });
                self.selectedAnswers.splice(0, self.selectedAnswers.length);
                self.resetButton.cadre.color(myColors.grey, 1, myColors.grey);
            }
        };
        svg.addEvent(self.resetButton.content, 'click', self.reset);
        svg.addEvent(self.resetButton.cadre, 'click', self.reset);
    }
    else {
        w = 0.5 * drawing.width;
        h = Math.min(self.tileHeight, 50);
        var buttonX = - w/2;
        var buttonY = self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;
        self.simpleChoiceMessageManipulator.translator.move(buttonX+w/2, buttonY+h/2);
        self.simpleChoiceMessage = displayText("Cliquer sur une réponse pour passer à la question suivante", w, h, myColors.none, myColors.none, 20, "Arial", self.simpleChoiceMessageManipulator);
    }
}

function QuestionSelectedQuestion() {
    this.bordure.color(this.bgColor, 5, SELECTION_COLOR);
}

function QuestionCreatorDisplay (x, y, w, h) {
    var self = this;
    self.previousX = x;
    self.previousY = y;
    self.previousW = w;
    self.previousH = h;
    self.manipulator.last.children.indexOf(self.questionCreatorManipulator.first)===-1 && self.manipulator.last.add(self.questionCreatorManipulator.first);
    self.questionCreatorHeight = Math.floor(h * (1 - self.headerHeight) - 80);
    self.questionCreatorManipulator.translator.move(x, 0);
    self.toggleButtonHeight = 40;
    self.displayQuestionCreator(MARGIN + x, y, w, h);
    var clickedButton = self.multipleChoice ? myQuizzType.tab[1].label : myQuizzType.tab[0].label;
    self.displayToggleButton(MARGIN + x, MARGIN/2+y, w, self.toggleButtonHeight-MARGIN, clickedButton);
}

function QuestionCreatorDisplayToggleButton (x, y, w, h, clicked){
    var self = this;
    var size = self.puzzle.tileHeight*0.2;
    self.questionCreatorManipulator.last.children.indexOf(self.toggleButtonManipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.toggleButtonManipulator.first);
    var toggleHandler = function(event){
        self.target = drawings.background.getTarget(event.clientX, event.clientY);
        var questionType = self.target.parent.children[1].messageText;
        if (self.multipleChoice){
            self.linkedQuestion.tabAnswer.forEach(function(answer){
                if(answer.editable){
                    answer.multipleAnswer = answer.correct;
                    answer.parent.multipleChoice=answer.correct;
                    (typeof answer.simpleAnswer === 'undefined') && (answer.simpleAnswer = false);
                    answer.correct = answer.simpleAnswer;
                    answer.correct = answer.simpleAnswer;
                }
            });
        } else {
            self.linkedQuestion.tabAnswer.forEach(function(answer){
                if(answer.editable){
                    answer.simpleAnswer = answer.correct;
                    answer.parent.multipleChoice=!answer.correct;
                    (typeof answer.multipleAnswer==='undefined') && (answer.multipleAnswer = false);
                    answer.correct = answer.multipleAnswer;
                    answer.correct = answer.multipleAnswer;
                }
            });
        }

        (questionType === "Réponses multiples") ? (self.multipleChoice = true) : (self.multipleChoice = false);

        self.activeQuizzType = (!self.multipleChoice) ? self.quizzType[0] : self.quizzType[1];
        self.errorMessagePreview && self.errorMessagePreview.parent && self.parent.previewButtonManipulator.last.remove(self.errorMessagePreview);

        self.linkedQuestion.tabAnswer.forEach(function(answer){
            var xCheckBox, yCheckBox = 0;
            if (answer.obj.checkbox) {
                xCheckBox = answer.obj.checkbox.x;
                yCheckBox = answer.obj.checkbox.y;
                answer.correct = false;
                answer.obj.checkbox = displayCheckbox(xCheckBox, yCheckBox, size, answer).checkbox;
                answer.obj.checkbox.answerParent = answer;
            }
        });
        self.displayToggleButton(x, y, w, h, questionType);
    };

    self.toggleButtonWidth = drawing.width/5;
    var length = self.quizzType.length;
    var lengthToUse = (length+1)*MARGIN+length*self.toggleButtonWidth;
    self.margin = (w-lengthToUse)/2;
    self.x = self.margin+self.toggleButtonWidth/2+MARGIN;
    var i = 0;
    (!self.virtualTab) && (self.virtualTab = []);
    self.quizzType.forEach(function(type){

        if(self.virtualTab[i] && self.virtualTab[i].manipulator){
            self.toggleButtonManipulator.last.remove(self.virtualTab[i].manipulator.first);
        }

        self.virtualTab[i] = {};

        self.virtualTab[i].manipulator = new Manipulator(self);
        self.virtualTab[i].manipulator.addOrdonator(2);
        self.toggleButtonManipulator.last.add(self.virtualTab[i].manipulator.first);
        (type.label == clicked) ? (self.virtualTab[i].color = SELECTION_COLOR) : (self.virtualTab[i].color = myColors.white);
        self.virtualTab[i].toggleButton = displayTextWithoutCorners(type.label, self.toggleButtonWidth, h, myColors.black, self.virtualTab[i].color, 20, null, self.virtualTab[i].manipulator);
        self.virtualTab[i].toggleButton.content.color(getComplementary(self.virtualTab[i].color), 0, myColors.black);
        self.virtualTab[i].manipulator.translator.move(self.x,MARGIN+h/2);
        self.x += self.toggleButtonWidth + MARGIN;
        (type.label != clicked) && (svg.addEvent(self.virtualTab[i].toggleButton.content, "click", toggleHandler));
        (type.label != clicked) && (svg.addEvent(self.virtualTab[i].toggleButton.cadre, "click", toggleHandler));

        i++;
    });
    self.activeQuizzType = (self.multipleChoice) ? self.quizzType[1] : self.quizzType[0];
    self.toggleButtonManipulator.translator.move(0, y);
}

function QuestionCreatorDisplayQuestionCreator (x, y, w, h) {
    var self = this;
    // bloc Question
    self.questionCreatorManipulator.flush();
    self.questionBlock = {rect: new svg.Rect(w, h).color([], 3, myColors.black).position(w / 2, y + h / 2)};
    self.questionCreatorManipulator.last.children.indexOf(self.questionBlock.rect)===-1 && self.questionCreatorManipulator.last.add(self.questionBlock.rect);
    self.questionCreatorManipulator.last.children.indexOf(self.questionManipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.questionManipulator.first);
    var showTitle = function () {
        var color = (self.linkedQuestion.label) ? myColors.black : myColors.grey;
        var text = (self.linkedQuestion.label) ? self.linkedQuestion.label : self.labelDefault;
        if(self.linkedQuestion.image){
            var img = self.linkedQuestion.image;
            self.questionBlock.title = displayImageWithTitle(text, img.src, img, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.linkedQuestion.fontSize, self.linkedQuestion.font, self.questionManipulator);
            self.questionBlock.title.image._acceptDrop = true;
        } else {
            self.questionBlock.title = displayText(text, self.w - 2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.linkedQuestion.fontSize, self.linkedQuestion.font, self.questionManipulator);
        }
        var fontSize = Math.min(20, self.h*0.1);
        self.questNum = new svg.Text(self.linkedQuestion.questionNum).position(-self.w/2+2*MARGIN+(fontSize*(self.linkedQuestion.questionNum.toString.length)/2), -self.h*0.25/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
        self.questionManipulator.ordonator.set(4, self.questNum);
        self.questionBlock.title.content.color(color);
        self.questionBlock.title.content._acceptDrop = true;
        self.questionBlock.title.cadre.color(self.linkedQuestion.bgColor, 1, self.linkedQuestion.colorBordure);
        self.questionBlock.title.cadre._acceptDrop = true;
        svg.addEvent(self.questionBlock.title.content, "dblclick", dblclickEditionQuestionBlock);
        svg.addEvent(self.questionBlock.title.cadre, "dblclick", dblclickEditionQuestionBlock);

        self.questionManipulator.first.move(w/2, y + self.toggleButtonHeight + 2 * MARGIN + self.questionBlock.title.cadre.height/2);
    };

    var dblclickEditionQuestionBlock = function () {
        var textarea = svg.runtime.createDOM("textarea");
        textarea.value = self.linkedQuestion.label;
        textarea.width = self.w;
        textarea.height = (self.linkedQuestion.image) ? svg.runtime.boundingRect(self.questionBlock.title.content.component).height : ((self.h * .25)/2);

        self.questionManipulator.ordonator.unset(1);
        textarea.globalPointCenter = self.questionBlock.title.content.globalPoint(-(textarea.width)/2, -(textarea.height)/2);

        var contentareaStyle = {
            toppx: (self.linkedQuestion.image) ? (-textarea.height + 1 - drawing.height + textarea.globalPointCenter.y) : (- drawing.height + textarea.globalPointCenter.y),
            leftpx: (textarea.globalPointCenter.x+1/12*self.w),
            width: (self.w*5/6),
            height: (textarea.height)
        };
        svg.runtime.attr(textarea, "style", "position: relative; top:" +contentareaStyle.toppx+ "px; left:" + contentareaStyle.leftpx + "px; width:" +contentareaStyle.width+ "px; height:" +contentareaStyle.height+ "px; text-align: center; display: table-cell; font-family: Arial; font-size: 20px; resize: none; outline: none; border: none; background-color: transparent; padding-top:" + ((textarea.height - 4 * MARGIN)/2 - 20) + "px; overflow: hidden;");
        svg.runtime.anchor("content").appendChild(textarea).focus();
        var onblur = function () {
            if(textarea.value){
                self.label = textarea.value;
                self.linkedQuestion.label=textarea.value;
            }

            svg.runtime.anchor("content").removeChild(textarea);
            showTitle();
            self.parent.displayQuestionsPuzzle(null, null, null, null, self.parent.questionPuzzle.startPosition);
        };

        var removeErrorMessage = function () {
            self.questionNameValidInput = true;
            self.errorMessage && self.questionCreatorManipulator.ordonator.unset(0);
            self.questionBlock.title.cadre.color(myColors.white, 1, myColors.black);
        };

        var displayErrorMessage = function () {
            removeErrorMessage();
            self.questionBlock.title.cadre.color(myColors.white, 2, myColors.red);
            var anchor = 'middle';
            var quizzInfoHeightRatio = 0.05;
            var questionsPuzzleHeightRatio = 0.25;
            self.errorMessage = new svg.Text(REGEXERROR)
                .position(w/2, drawing.height * (quizzInfoHeightRatio + questionsPuzzleHeightRatio) + self.toggleButtonHeight+ 5 * MARGIN + self.questionBlock.title.cadre.height)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            self.questionCreatorManipulator.ordonator.set(0, self.errorMessage);
            textarea.focus();
            self.questionNameValidInput = false;
        };

        textarea.oninput = function () {
            self.checkInputTextArea({
                textarea: textarea,
                border: self.questionBlock.title.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        textarea.onblur = onblur;
    };

    x && (self.x = x);
    y && (self.y = y);
    w && (self.w = w);
    h && (self.h = h);
    self.coordinatesAnswers = {
        x: self.x + MARGIN,
        y: self.y + 3 * MARGIN + self.h * 0.25,
        w: self.w - 2 * MARGIN,
        h: (self.h - self.toggleButtonHeight - 2*MARGIN) * 0.75 - 3 * MARGIN - 20
    };
    showTitle();
    // bloc Answers
    if (self.linkedQuestion.tabAnswer.length < self.MAX_ANSWERS && !(self.linkedQuestion.tabAnswer[self.linkedQuestion.tabAnswer.length-1] instanceof AddEmptyElement)) {

        self.linkedQuestion.tabAnswer.push(new AddEmptyElement(self, 'answer'));
    }
    self.puzzle && self.questionCreatorManipulator.last.remove(self.puzzle.puzzleManipulator.first);
    self.puzzle = new Puzzle(2, 4, self.linkedQuestion.tabAnswer, self.coordinatesAnswers, true, self);
    self.questionCreatorManipulator.last.children.indexOf(self.puzzle.puzzleManipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.puzzle.puzzleManipulator.first);
    self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y+self.toggleButtonHeight + self.questionBlock.title.cadre.height/2 - 2*MARGIN, self.coordinatesAnswers.w, self.coordinatesAnswers.h , 0);
}

function QuizzDisplay(x,y,w,h) {
    var self = this;
    mainManipulator.ordonator.set(1, self.quizzManipulator.first);
    self.header.display();
    self.header.drawBody();
    x && (self.x = x);
    y && (self.y = y);
    w && (self.questionArea.w = w);
    (w && x) && (self.resultArea.w = w );
    x && (self.resultArea.x = x);
    w && (self.titleArea.w = w);
    x && (self.quizzMarginX = x);
    self.headerPercentage = 0.05;
    self.questionPercentageWithImage = 0.3;
    self.questionPercentage = 0.2;
    self.answerPercentageWithImage = 0.6;
    self.answerPercentage = 0.7;

    var heightPage = drawing.height;

    self.headerHeight = heightPage * self.headerPercentage;
    self.questionHeight = heightPage * self.questionPercentage -  MARGIN;
    self.answerHeight = heightPage * self.answerPercentage -  MARGIN;
    self.questionHeightWithoutImage = heightPage * self.questionPercentage -  MARGIN;
    self.answerHeightWithoutImage = heightPage * self.answerPercentage -  MARGIN;
    self.questionHeightWithImage = heightPage * self.questionPercentageWithImage -  MARGIN;
    self.answerHeightWithImage = heightPage * self.answerPercentageWithImage -  MARGIN;

    //self.quizzManipulator.ordonator.set(1,self.titleText);
    //self.quizzManipulator.ordonator.set(0,self.titleBox);
    self.quizzManipulator.translator.move(self.questionArea.w/2,self.headerHeight/2);

    if(self.currentQuestionIndex===-1){// on passe à la première question
        self.nextQuestion();
    }
}

function QuizzDisplayResult (color){
    var self = this;
    self.displayScore(color);
    self.puzzle.display(0, self.questionHeight/2, drawing.width, self.answerHeight, self.puzzle.startPosition);
}

function GameDisplayMiniature(size){
    var self = this;
    return new Miniature(self,size);
}

function QuizzDisplayScore(color){
    let self = this;
    let autoColor;
    switch(this.score) {
        case self.tabQuestions.length:
            str1 = 'Impressionant !';
            str2 = 'et toutes sont justes !';
            autoColor = [100, 255, 100];
            break;
        case 0:
            str1 = 'Votre niveau est désolant... Mais gardez espoir !';
            str2 = "dont aucune n'est juste !";
            autoColor = [255, 17, 0];
            break;
        case (self.tabQuestions.length - 1):
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
            str2 = `dont ${self.score} sont justes !`;
            autoColor = [220, 255, 0];
            break;
    }
    var str1,str2;

    self.finalMessage = `${str1} Vous avez répondu à ${self.tabQuestions.length} questions, ${str2}`;
    if(!color) {
        var usedColor = autoColor;
    } else {
        usedColor = color;
    }
    
    self.resultManipulator && (self.quizzManipulator.last.children.indexOf(self.resultManipulator.first) !== -1) && self.quizzManipulator.last.remove(self.resultManipulator.first);

    self.resultManipulator = new Manipulator(self);
    self.scoreManipulator = new Manipulator(self);
    self.scoreManipulator.addOrdonator(2);
    self.resultManipulator.translator.move(0, self.questionHeight/2 + self.headerHeight/2 + MARGIN);
    self.resultManipulator.last.add(self.scoreManipulator.first);
    self.resultManipulator.last.add(self.puzzle.puzzleManipulator.first);
    self.quizzManipulator.last.add(self.resultManipulator.first);

    displayText(self.finalMessage,self.titleArea.w,self.questionHeight, myColors.black, usedColor, self.fontSize, self.font, self.scoreManipulator);
}

function QuizzManagerDisplay(){
    var self = this;

    self.quizzManagerManipulator.last.children.indexOf(self.libraryIManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.libraryIManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.quizzInfoManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.quizzInfoManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.questionsPuzzleManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.questionsPuzzleManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.questionCreatorManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.questionCreatorManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.previewButtonManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.previewButtonManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.saveQuizButtonManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.saveQuizButtonManipulator.first);
    self.libraryWidth = drawing.width * self.libraryWidthRatio;
    self.questCreaWidth = drawing.width * self.questCreaWidthRatio;
    self.quizzInfoHeight = drawing.height * self.quizzInfoHeightRatio;
    self.questionsPuzzleHeight = drawing.height * self.questionsPuzzleHeightRatio;
    self.libraryHeight = drawing.height * self.libraryHeightRatio;
    self.questCreaHeight = drawing.height * self.questCreaHeightRatio;
    self.saveButtonHeight = drawing.height * self.saveButtonHeightRatio;
    self.previewButtonHeight = drawing.height * self.previewButtonHeightRatio;
    self.ButtonWidth = 150;
    self.globalMargin = {
        height: self.marginRatio * drawing.height,
        width: self.marginRatio * drawing.width
    };
    self.questionPuzzleCoordinates = {
        x: self.globalMargin.width / 2,
        y: (self.quizzInfoHeight + self.questionsPuzzleHeight / 2 + self.globalMargin.height / 2),
        w: (drawing.width - self.globalMargin.width),
        h: (self.questionsPuzzleHeight - self.globalMargin.height)
    };
    drawing.currentPageDisplayed = 'QuizManager';
    mainManipulator.ordonator.set(1, self.quizzManagerManipulator.first);

    self.questionClickHandler = function(event){
        var target = drawings.background.getTarget(event.clientX,event.clientY);
        var element = target.parent.parentManip.parentObject;
        self.quizz.tabQuestions[self.indexOfEditedQuestion].selected = false;
        element.selected = true;
        self.displayQuestionsPuzzle(null, null, null, null, self.questionPuzzle.startPosition);
        self.indexOfEditedQuestion = self.quizz.tabQuestions.indexOf(element);
        self.questionCreator.loadQuestion(element);
        //self.questionCreatorManipulator.flush();
        self.questionCreator.display(self.questionCreator.previousX,self.questionCreator.previousY,self.questionCreator.previousW,self.questionCreator.previousH);
    };

    var displayFunctions = function(){
        self.displayQuizzInfo(self.globalMargin.width/2, self.quizzInfoHeight/2, drawing.width,self.quizzInfoHeight);
        self.displayQuestionsPuzzle(self.questionPuzzleCoordinates.x, self.questionPuzzleCoordinates.y, self.questionPuzzleCoordinates.w, self.questionPuzzleCoordinates.h);
        self.questionCreator.display(self.library.x + self.libraryWidth, self.library.y,
            self.questCreaWidth-self.globalMargin.width, self.questCreaHeight);
        self.displayPreviewButton(drawing.width/2-self.ButtonWidth, drawing.height - self.previewButtonHeight/2-MARGIN/2,
            self.ButtonWidth, self.previewButtonHeight-self.globalMargin.height);
        self.displayQuizSaveButton(drawing.width/2+self.ButtonWidth, drawing.height - self.saveButtonHeight/2-MARGIN/2,
            self.ButtonWidth, self.saveButtonHeight-self.globalMargin.height);
        mainManipulator.ordonator.unset(0);
    };

    if (self.resizing){
        self.library.display(self.globalMargin.width/2, self.quizzInfoHeight+self.questionsPuzzleHeight+self.globalMargin.height/2,
            self.libraryWidth-self.globalMargin.width/2, self.libraryHeight);
        displayFunctions();
    }

    !self.resizing && self.library.run(self.globalMargin.width/2, self.quizzInfoHeight+self.questionsPuzzleHeight+self.globalMargin.height/2,
        self.libraryWidth-self.globalMargin.width/2, self.libraryHeight, function(){
        displayFunctions();
        });
}

function QuizzManagerDisplayQuizzInfo (x, y, w, h) {
    var self = this;
    self.quizzInfoManipulator.last.children.indexOf(self.returnButtonManipulator.first)===-1 && self.quizzInfoManipulator.last.add(self.returnButtonManipulator.first);
    self.returnText=new svg.Text("Retour");
    self.quizzInfoManipulator.ordonator.set(3, self.returnText);

    self.returnButton=drawArrow(-2*MARGIN, 0,20,20, self.returnButtonManipulator);
    var returnButtonHeight= -svg.runtime.boundingRect(self.returnText.component).height/2;
    self.returnText.position(svg.runtime.boundingRect(self.returnButton.component).width,0).font("Arial", 20).anchor("start");
    self.returnButtonManipulator.translator.move(0,returnButtonHeight);
    self.formationLabel = new svg.Text("Formation : " + self.parentFormation.label).position(drawing.width/2,0);
    self.formationLabel.font("Arial", 20).anchor("middle");
    self.quizzInfoManipulator.ordonator.set(2,self.formationLabel);
    self.returnButtonManipulator.rotator.rotate(180);
    var textSize = svg.runtime.boundingRect(self.returnText.component);
    self.returnTextCadre = new svg.Rect(textSize.width + svg.runtime.boundingRect(self.returnButton.component).width + MARGIN, textSize.height + MARGIN).color(myColors.white).opacity(0.001);
    self.returnTextCadre.position(textSize.width/2 + svg.runtime.boundingRect(self.returnButton.component).width/2 + MARGIN/2, -MARGIN);
    self.quizzInfoManipulator.ordonator.set(4, self.returnTextCadre);
    self.returnTextCadre.parentFormation=self.parentFormation;
    self.returnText.parentFormation=self.parentFormation;
    self.returnButton.parentFormation=self.parentFormation;

    var returnHandler = function(event){
        var target = drawings.background.getTarget(event.clientX,event.clientY);
        target.parentFormation.quizzDisplayed = false;
        target.parentFormation.displayFormation();
        self.header = new Header ();
        self.header.display();
    };

    svg.addEvent(self.returnButton, "click", returnHandler);
    svg.addEvent(self.returnText, "click", returnHandler);
    svg.addEvent(self.returnTextCadre, "click", returnHandler);

    var showTitle = function () {
        var text = (self.quizzName) ? self.quizzName : self.quizzNameDefault;
        var color = (self.quizzName) ? myColors.black : myColors.grey;
        var bgcolor = myColors.grey;

        self.quizzLabel = {};
        var width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBoundingClientRect().width;

        self.quizzLabel.content = autoAdjustText(text, 0, 0, w, h/2, 15, "Arial", self.quizzInfoManipulator).text;
        self.quizzNameHeight = svg.runtime.boundingRect(self.quizzLabel.content.component).height;

        self.quizzLabel.cadre = new svg.Rect(width, 0.5*h).color(bgcolor);
        self.quizzLabel.cadre.position(width/2,self.quizzLabel.cadre.height).fillOpacity(0.1);
        self.quizzInfoManipulator.ordonator.set(0, self.quizzLabel.cadre);
        self.quizzLabel.content.position(0, h/2 +self.quizzLabel.cadre.height/4).color(color).anchor("start");

        self.quizzInfoManipulator.first.move(x, y);
        svg.addEvent(self.quizzLabel.content, "dblclick", dblclickEditionQuizz);
        svg.addEvent(self.quizzLabel.cadre, "dblclick", dblclickEditionQuizz);
    };

    var dblclickEditionQuizz = function () {
        var width;
        width = svg.runtime.boundingRect(self.quizzLabel.content.component).width;

        self.quizzInfoManipulator.ordonator.unset(1);

        var textarea = svg.runtime.createDOM("textarea");
        textarea.value = self.quizzName;
        var contentareaStyle = {
            toppx:(self.quizzInfoHeight-self.quizzNameHeight/4+3),
            leftpx: (x + MARGIN/2 + 1),
            width: 700,
            height:(self.quizzNameHeight+3)
        };
        svg.runtime.attr(textarea, "style", "position: absolute; top:" + contentareaStyle.toppx + "px; left:" + contentareaStyle.leftpx + "px; width:" + (contentareaStyle.width) + "px; height:" + contentareaStyle.height + "px; resize: none; border: none; outline:none; overflow:hidden; font-family: Arial; font-size: 15px; background-color: transparent;");
        svg.runtime.anchor("content").appendChild(textarea).focus();

        var removeErrorMessage = function () {
            self.questionCreator.quizzNameValidInput = true;
            self.errorMessage && self.quizzInfoManipulator.ordonator.unset(3);
            self.quizzLabel.cadre.color(myColors.grey);
            self.quizzNameValidInput = true;
        };

        var displayErrorMessage = function () {
            removeErrorMessage();
            self.quizzLabel.cadre.color(myColors.grey, 2, myColors.red);
            var anchor = 'start';
            self.errorMessage = new svg.Text(REGEXERROR)
                .position(self.quizzLabel.cadre.width + MARGIN, h/2 +self.quizzLabel.cadre.height/4)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            self.quizzInfoManipulator.ordonator.set(3, self.errorMessage);
            textarea.focus();
            self.quizzNameValidInput = false;
        };
        var onblur = function () {
            self.quizzNameValidInput && (self.quizzName = textarea.value);
            textarea.remove();
            showTitle();
        };
        textarea.oninput = function () {
            self.questionCreator.checkInputTextArea({
                textarea: textarea,
                border: self.quizzLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        textarea.onblur = onblur;
        self.questionCreator.checkInputTextArea({
            textarea: textarea,
            border: self.quizzLabel.cadre,
            onblur: onblur,
            remove: removeErrorMessage,
            display: displayErrorMessage
        });
    };
    showTitle();
}

function QuizzManagerDisplayPreviewButton (x, y, w, h) {
    var self = this;
    self.previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, self.previewButtonManipulator);

    self.questionCreator.errorMessagePreview && self.questionCreator.errorMessagePreview.parent && self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
    self.previewFunction = function () {
        self.toggleButtonHeight = 40;
        drawing.currentPageDisplayed = "QuizPreview";
        var validation = true;
        self.questionCreator.activeQuizzType.validationTab.forEach(function (funcEl) {
            var result = funcEl(self);
            if(!result.isValid) {
                self.questionCreator.errorMessagePreview && self.questionCreator.errorMessagePreview.parent && self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
                self.questionCreator.errorMessagePreview = new svg.Text(result.message)
                    .position(self.ButtonWidth,-self.toggleButtonHeight)
                    .font("Arial", 20)
                    .anchor('middle').color(myColors.red);
                self.previewButtonManipulator.last.add(self.questionCreator.errorMessagePreview);
            }
            validation = validation && result.isValid;
        });

        self.displayEditedQuestion = function () {
            self.tabQuestions[self.indexOfEditedQuestion] = self.quizz.tabQuestions[self.indexOfEditedQuestion];
            (self.tabQuestions[self.indexOfEditedQuestion].tabAnswer[self.tabQuestions[self.indexOfEditedQuestion].tabAnswer.length - 1] instanceof AddEmptyElement) && self.tabQuestions[self.indexOfEditedQuestion].tabAnswer.pop();
            var tmpQuizzObject = {
                title: self.quizzName,
                bgColor: myColors.white,
                tabQuestions: [self.tabQuestions[self.indexOfEditedQuestion]],
                puzzleLines: 3,
                puzzleRows: 3
            };

            self.quizzManagerManipulator.flush();

            var tmpQuizz = new Quizz(tmpQuizzObject, true);
            tmpQuizz.run(1, 1, drawing.width, drawing.height);//
        };
        if(validation) {
            self.displayEditedQuestion();
        }
    };
    svg.addEvent(self.previewButton.cadre, "click", self.previewFunction);
    svg.addEvent(self.previewButton.content, "click", self.previewFunction);
    self.previewButtonManipulator.translator.move(x, y);
}

function QuizzManagerDisplaySaveButton(x, y, w, h) {
    var self = this;
    self.saveButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, self.saveQuizButtonManipulator);

    var saveFunction = function () {
        var thing = function (data) {
        };
    for(var i = 0;i<self.quizz.tabQuestions.length-1;i++){
        typeof (self.quizz.tabQuestions[i].tabAnswer) !== "undefined" &&(self.tabQuestions[i] = self.quizz.tabQuestions[i]);
        (self.tabQuestions[i].tabAnswer[self.tabQuestions[i].tabAnswer.length-1] instanceof AddEmptyElement) && self.tabQuestions[i].tabAnswer.pop();
    }
        var tmpQuizzObject = {
            title: self.quizzName,
            tabQuestions: self.tabQuestions
        };
        let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
        dbListener.httpGetAsync("/id", thing);
        dbListener.httpPostAsync("/insert", tmpQuizzObject, thing, ignoredData);
        console.log("Votre travail a été bien enregistré");
    };

    svg.addEvent(self.saveButton.cadre, "click", saveFunction);
    svg.addEvent(self.saveButton.content, "click", saveFunction);
    self.saveQuizButtonManipulator.translator.move(x, y);
}

function QuizzManagerDisplayQuestionPuzzle(x, y, w, h, ind) {
    var self = this;
    var index = ind ? ind : 0;
    x && (self.qPuzzleX=x);
    y && (self.qPuzzleY=y);
    w && (self.qPuzzleW=w);
    h && (self.qPuzzleH=h);
    self.questionPuzzle.puzzleManipulator && self.questionsPuzzleManipulator.last.remove(self.questionPuzzle.puzzleManipulator.first);
    var border = new svg.Rect(self.qPuzzleW, self.qPuzzleH);
    border.color([], 2, myColors.black);
    self.questionsPuzzleManipulator.ordonator.set(0, border);
    self.questionsPuzzleManipulator.first.move(self.qPuzzleX + self.qPuzzleW / 2, self.qPuzzleY);

    self.coordinatesQuestion = {
        x: 0,
        y: -self.questionsPuzzleHeight / 2 + self.globalMargin.height / 2,
        w: border.width - self.globalMargin.width / 2,
        h: self.questionsPuzzleHeight - self.globalMargin.height
    };

    for(var i=0;i<self.quizz.tabQuestions.length;i++){
        self.quizz.tabQuestions[i].bordureEventHandler=self.questionClickHandler;
        self.quizz.tabQuestions[i].contentEventHandler=self.questionClickHandler;
        self.quizz.tabQuestions[i].imageEventHandler=self.questionClickHandler;
    }

    self.questionPuzzle = new Puzzle(1, 6, self.quizz.tabQuestions, self.coordinatesQuestion, false, self);
    self.questionsPuzzleManipulator.last.children.indexOf(self.questionPuzzle.puzzleManipulator.first)===-1 && self.questionsPuzzleManipulator.last.add(self.questionPuzzle.puzzleManipulator.first);
    self.questionPuzzle.display(self.coordinatesQuestion.x, self.coordinatesQuestion.y, self.coordinatesQuestion.w, self.coordinatesQuestion.h, index);
}

function InscriptionManagerDisplay(labels={}) {
    let self = this;
    self.header = new Header("Inscription");
    self.header.display();
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.manipulator.first.move(drawing.width/2, drawing.height/2);
    var w = drawing.width/5;
    var x = drawing.width/9;
    var trueValue = "";

    var clickEditionField = function (field, manipulator) {
        return function () {
            let contentarea = svg.runtime.createDOM("textarea");
            contentarea.value = self[field].label;
            var width = w;
            var height = self.h;
            var globalPointCenter = self[field].cadre.globalPoint(-(width) / 2, -(height) / 2);

            var contentareaStyle = {
                toppx: globalPointCenter.y ,
                leftpx: globalPointCenter.x,
                height: height,
                width: self[field].cadre.width
            };
            svg.runtime.attr(contentarea, 'style', "position: absolute; top:" + (contentareaStyle.toppx) +
                "px; left:" + (contentareaStyle.leftpx) + "px; width:" + contentareaStyle.width + "px; height:" +
                (contentareaStyle.height) + "px; overflow:hidden; text-align:center; font-family: Arial;" +
                "font-size: 20px; resize: none; border: none; outline : none; background-color: transparent;");
            manipulator.ordonator.unset(1, self[field].content.text);
            svg.runtime.add(svg.runtime.anchor('content'), contentarea);
            !runtime && contentarea.focus();

            var displayErrorMessage = function(trueManipulator=manipulator){
                emptyAreasHandler();
                if (!(field==="passwordConfirmationField" && trueManipulator.ordonator.children[3].messageText)){
                    var message = autoAdjustText(self[field].errorMessage, 0, 0, drawing.width, self.h, 20, null, trueManipulator, 3);
                    message.text.color(myColors.red).position(self[field].cadre.width/2 + MARGIN, self[field].cadre.height+MARGIN);
                }
            };

            contentarea.oninput = function(){
                var staredContentarea = function(){
                    contentarea.value = "";
                    for (var i = 0; i<trueValue.length; i++){
                        contentarea.value+="*";
                    }
                }
                if (self[field].secret && trueValue.length<contentarea.value.length){
                    trueValue += contentarea.value.substring(contentarea.value.length-1);
                    staredContentarea();
                }
                else if (self[field].secret){
                    trueValue = trueValue.substring(0, contentarea.value.length);
                    staredContentarea();
                }
                self[field].label = contentarea.value;
                self[field].labelSecret!== "undefined" && (self[field].labelSecret = trueValue);
                if ((field === "lastNameField" || field==='firstNameField' ) && !self[field].checkInput()){
                    displayErrorMessage();
                    self[field].cadre.color(myColors.white, 3, myColors.red);
                }
                else {
                    field!== "passwordConfirmationField" && manipulator.ordonator.unset(3);
                    self[field].cadre.color(myColors.white, 1, myColors.black);
                }
            };
            contentarea.onblur = function(){
                self[field].label = contentarea.value;
                displayField(field, manipulator);
                if (self[field].checkInput()){
                    if (self[field].secret && self.passwordField.label===self.passwordConfirmationField.label){
                        self.passwordField.labelSecret = trueValue;
                    }
                    else {
                        self[field].cadre.color(myColors.white, 1, myColors.black);
                        field!== "passwordConfirmationField" && manipulator.ordonator.unset(3);
                    }
                }
                else {
                    self[field].secret || displayErrorMessage();
                    self[field].secret || self[field].cadre.color(myColors.white, 3, myColors.red);
                }
                contentarea.remove();
            }
        };
    };
    var displayField = function(field, manipulator){
        var fieldTitle = new svg.Text(self[field].title).position(0,0);
        fieldTitle.font("Arial", 20).anchor("end");
        manipulator.ordonator.set(2, fieldTitle);
        manipulator.first.move(-drawing.width/10, self[field].line*drawing.height/10);
        self.h = 1.5*svg.runtime.boundingRect(fieldTitle.component).height;
        var displayText = displayTextWithoutCorners(self[field].label, w, self.h, myColors.black, myColors.white, 20, null, manipulator);
        self[field].content = displayText.content;
        self[field].cadre = displayText.cadre;
        var y = -svg.runtime.boundingRect(fieldTitle.component).height/4;
        self[field].content.position(x,0);
        self[field].cadre.position(x,y);
        var clickEdition = clickEditionField(field, manipulator);
        svg.addEvent(self[field].content, "click", clickEdition);
        svg.addEvent(self[field].cadre, "click", clickEdition);
        self.tabForm.push(self[field]);
        self.formLabels[field] = self[field].label;
    };

    var nameCheckInput = function(field){
        self[field].label = self[field].label.trim();
        var regex = /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g;
        return self[field].label.match(regex);
    };

    var nameErrorMessage = "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés";
    self.lastNameField={label:labels.lastNameField || "", title:self.lastNameLabel, line:-3};
    self.lastNameField.checkInput = function(){return nameCheckInput("lastNameField")};
    self.lastNameField.errorMessage = nameErrorMessage;
    displayField("lastNameField", self.lastNameManipulator);

    self.firstNameField={label:labels.firstNameField || "", title:self.firstNameLabel, line:-2};
    self.firstNameField.errorMessage = nameErrorMessage;
    self.firstNameField.checkInput = function (){return nameCheckInput("firstNameField")};
    displayField("firstNameField", self.firstNameManipulator);

    self.mailAddressField={label:labels.mailAddressField || "", title:self.mailAddressLabel, line:-1};
    self.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
    self.mailAddressField.checkInput = function(){
        var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        return self.mailAddressField.label=== "" || self.mailAddressField.label.match(regex);
    };
    displayField("mailAddressField", self.mailAddressManipulator);

    var passwordCheckInput = function() {
        var passTooShort = self.passwordField.labelSecret !== "" && self.passwordField.labelSecret.length<6;
        var confTooShort = self.passwordConfirmationField.labelSecret !== "" && self.passwordConfirmationField.labelSecret.length<6;
        if (passTooShort || confTooShort){
            if (passTooShort){
                self.passwordField.cadre.color(myColors.white, 3, myColors.red);
                var message = autoAdjustText(self.passwordField.errorMessage, 0, 0, drawing.width, self.h, 20, null, self.passwordManipulator, 3);
                message.text.color(myColors.red).position(self.passwordField.cadre.width/2 + MARGIN, self.passwordField.cadre.height+MARGIN);
            }
            if (confTooShort){
                self.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
                var message = autoAdjustText(self.passwordField.errorMessage, 0, 0, drawing.width, self.h, 20, null, self.passwordManipulator, 3);
                message.text.color(myColors.red).position(self.passwordField.cadre.width/2 + MARGIN, self.passwordField.cadre.height+MARGIN);
            }
        }
        else if (self.passwordConfirmationField.labelSecret !== "" && self.passwordConfirmationField.labelSecret!== self.passwordField.labelSecret){
            self.passwordField.cadre.color(myColors.white, 3, myColors.red);
            self.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
            self.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
            var message = autoAdjustText(self.passwordConfirmationField.errorMessage, 0, 0, drawing.width, self.h, 20, null, self.passwordManipulator, 3);
            message.text.color(myColors.red).position(self.passwordField.cadre.width/2 + MARGIN, self.passwordField.cadre.height+MARGIN);
        }
        else if (self.passwordField.labelSecret.length>=6){
            self.passwordField.cadre.color(myColors.white, 1, myColors.black);
            self.passwordManipulator.ordonator.unset(3);
        }
        else {
            self.passwordConfirmationField.cadre.color(myColors.white, 1, myColors.black);
            self.passwordField.cadre.color(myColors.white, 1, myColors.black);
            self.passwordManipulator.ordonator.unset(3);
        }
        var result = !(passTooShort || confTooShort || self.passwordConfirmationField.labelSecret!== self.passwordField.labelSecret);
        return result;
    }

    self.passwordField={label:labels.passwordField || "", labelSecret:labels.passwordSecret || "", title:self.passwordLabel, line:0, secret:true, errorMessage: "La confirmation du mot de passe n'est pas valide"};
    self.passwordField.errorMessage = "Le mot de passe doit contenir au minimum 6 caractères";
    self.passwordField.checkInput = passwordCheckInput;
    displayField("passwordField", self.passwordManipulator);

    self.passwordConfirmationField={label:labels.passwordConfirmationField || "", labelSecret:labels.passwordSecret || "", title:self.passwordConfirmationLabel, line:1, secret:true, errorMessage: "La confirmation du mot de passe n'est pas valide"};
    self.passwordConfirmationField.checkInput = passwordCheckInput;
    displayField("passwordConfirmationField", self.passwordConfirmationManipulator);

    var AllOk = function (){
        return self.lastNameField.checkInput() &&
        self.firstNameField.checkInput() &&
        self.mailAddressField.checkInput() &&
        self.passwordField.checkInput() &&
        self.passwordConfirmationField.checkInput();
    };

    var emptyAreasHandler = function(save){
        var emptyAreas = self.tabForm.filter(field=> field.label === "");
        emptyAreas.forEach(function(emptyArea){
            save && emptyArea.cadre.color(myColors.white, 3, myColors.red);
        });
        if (emptyAreas.length>0 && save){
            var message = autoAdjustText(EMPTYFIELDERROR, 0, 0, drawing.width, self.h, 20, null, self.saveButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - self.saveButton.cadre.height+MARGIN);
        }
        else {
            self.saveButtonManipulator.ordonator.unset(3);
        }
        return (emptyAreas.length>0);
    };

    self.saveButtonHandler = function(){
        if (!emptyAreasHandler(true) && AllOk()){
            var callback = function(data){
                var myUser=JSON.parse(data).user;
                if (myUser){
                    var messageText = "Un utilisateur possède déjà cet adresse mail !";
                    var message = autoAdjustText(messageText, 0, 0, drawing.width, self.h, 20, null, self.saveButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, - self.saveButton.cadre.height+MARGIN);
                    setTimeout(function(){
                        self.saveButtonManipulator.ordonator.unset(3);
                    }, 10000);
                }
                else {
                    self.passwordField.hash = TwinBcrypt.hashSync(self.passwordField.labelSecret);
                    //console.log(TwinBcrypt.compareSync(self.passwordField.labelSecret, self.passwordField.hash));
                    //console.log(TwinBcrypt.compareSync("bbbbbb", self.passwordField.hash));
                    var tempObject = {
                        lastName: self.lastNameField.label,
                        firstName: self.firstNameField.label,
                        mailAddress: self.mailAddressField.label,
                        password: self.passwordField.hash
                    };
                    var callback = function (data) {
                        var messageText = "Votre compte a bien été créé !";
                        var message = autoAdjustText(messageText, 0, 0, drawing.width, self.h, 20, null, self.saveButtonManipulator, 3);
                        message.text.color(myColors.green).position(0, - self.saveButton.cadre.height+MARGIN);
                        setTimeout(function(){
                            self.saveButtonManipulator.ordonator.unset(3);
                        }, 10000);
                    };
                    dbListener.httpPostAsync("/inscription", tempObject, callback);
                    console.log(tempObject);
                }
            };
            dbListener.httpGetAsync("/getUserByMailAddress/" + self.mailAddressField.label, callback);
        }
        else if (!AllOk()){
            var messageText = "Corrigez les erreurs des champs avant d'enregistrer !";
            var message = autoAdjustText(messageText, 0, 0, drawing.width, self.h, 20, null, self.saveButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - self.saveButton.cadre.height+MARGIN);
        }
    };
    self.saveButtonHeight = drawing.height * self.saveButtonHeightRatio;
    self.saveButtonWidth = Math.min(drawing.width * self.saveButtonWidthRatio, 200);
    self.saveButton = displayText(self.saveButtonLabel, self.saveButtonWidth, self.saveButtonHeight, myColors.black, myColors.white, 20, null, self.saveButtonManipulator);
    self.saveButtonManipulator.first.move(0, 2.5*drawing.height/10);
    svg.addEvent(self.saveButton.content, "click", self.saveButtonHandler);
    svg.addEvent(self.saveButton.cadre, "click", self.saveButtonHandler);
}

function ConnectionManagerDisplay() {
    let self = this;
    self.header = new Header("Connexion");
    self.header.display();
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.manipulator.first.move(drawing.width/2, drawing.height/2);
    var w = drawing.width/6;
    var x = drawing.width/10;
    var trueValue = "";

    var clickEditionField = function (field, manipulator) {
        return function () {
            let contentarea = svg.runtime.createDOM("input");
            contentarea.value = self[field].labelSecret||self[field].label;
            var width = w;
            var height = self.h;
            var globalPointCenter = self[field].cadre.globalPoint(-(width) / 2, -(height) / 2);

            var contentareaStyle = {
                toppx: globalPointCenter.y ,
                leftpx: globalPointCenter.x,
                height: height,
                width: self[field].cadre.width
            };
            svg.runtime.attr(contentarea, 'style', "position: absolute; top:" + (contentareaStyle.toppx) +
                "px; left:" + (contentareaStyle.leftpx) + "px; width:" + contentareaStyle.width + "px; height:" +
                (contentareaStyle.height) + "px; overflow:hidden; text-align:center; font-family: Arial;" +
                "font-size: 20px; resize: none; border: none; outline : none; background-color: transparent;");
            self[field].secret && svg.runtime.attr(contentarea, 'type','password');
            manipulator.ordonator.unset(1, self[field].content.text);
            svg.runtime.add(svg.runtime.anchor('content'), contentarea);
            !runtime && contentarea.focus();

            var displayErrorMessage = function(trueManipulator=manipulator){
                if (!(field==="passwordConfirmationField" && trueManipulator.ordonator.children[3].messageText)){
                    var message = autoAdjustText(self[field].errorMessage, 0, 0, drawing.width, self.h, 20, null, trueManipulator, 3);
                    message.text.color(myColors.red).position(self[field].cadre.width/2 + MARGIN, self[field].cadre.height+MARGIN);
                }
            };


            contentarea.onblur = function(){
                if(self[field].secret){
                    self[field].label='';
                    self[field].labelSecret=contentarea.value;
                    for(let i=0;i<contentarea.value.length;i++){
                        self[field].label += '●';
                    }

                }else{
                    self[field].label=contentarea.value;
                }
                displayField(field, manipulator);
                //self[field].cadre.color(myColors.white, 1, myColors.black);
                manipulator.ordonator.unset(3);
                contentarea.remove();
            }
        };
    };
    var displayField = function(field, manipulator){
        var fieldTitle = new svg.Text(self[field].title).position(0,0);
        fieldTitle.font("Arial", 20).anchor("end");
        manipulator.ordonator.set(2, fieldTitle);
        manipulator.first.move(-drawing.width/10, self[field].line*drawing.height/10);
        self.h = 1.5*svg.runtime.boundingRect(fieldTitle.component).height;
        var displayText = displayTextWithoutCorners(self[field].label, w, self.h, myColors.black, myColors.white, 20, null, manipulator);
        self[field].content = displayText.content;
        self[field].cadre = displayText.cadre;
        var y = -svg.runtime.boundingRect(fieldTitle.component).height/4;
        self[field].content.position(x,0);
        self[field].cadre.position(x,y);
        var clickEdition = clickEditionField(field, manipulator);
        svg.addEvent(self[field].content, "click", clickEdition);
        svg.addEvent(self[field].cadre, "click", clickEdition);
        self.tabForm.indexOf(self[field])===-1 && self.tabForm.push(self[field]);
    };

    self.mailAddressField={label:"", title:self.mailAddressLabel, line:-1};
    self.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
    self.mailAddressField.checkInput = function(){
        var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        return self.mailAddressField.label=== "" || self.mailAddressField.label.match(regex);
    };
    displayField("mailAddressField", self.mailAddressManipulator);


    self.passwordField={label:"", labelSecret:"", title:self.passwordLabel, line:0, secret:true, errorMessage: "La confirmation du mot de passe n'est pas valide"};

    displayField("passwordField", self.passwordManipulator);


    self.connectionButtonHandler = function(){
        var emptyAreas = self.tabForm.filter(field=> field.label === "");
        emptyAreas.forEach(function(emptyArea){
            emptyArea.cadre.color(myColors.white, 3, myColors.red);
        });
        if (emptyAreas.length>0){
            var message = autoAdjustText(EMPTYFIELDERROR, 0, 0, drawing.width, self.h, 20, null, self.connectionButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - self.connectionButton.cadre.height+MARGIN);
            svg.timeout(function(){
                self.connectionButtonManipulator.ordonator.unset(3);
                emptyAreas.forEach(function(emptyArea){
                    emptyArea.cadre.color(myColors.white, 1, myColors.black);
                });
            },5000);
        } else {
            let callback = function(user){
                console.log(user);
                if(user){

                }else {
                    var message = autoAdjustText("Adresse et/ou mot de passe invalide(s)", 0, 0, drawing.width, self.h, 20, null, self.connectionButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, - self.connectionButton.cadre.height+MARGIN);
                    svg.timeout(function(){
                        self.connectionButtonManipulator.ordonator.unset(3);

                    },5000);
                }
            };
            dbListener.httpPostAsync("/connectUser/" ,{mailAddress: self.mailAddressField.label,password:self.passwordField.labelSecret}, callback);


        }
    };
    self.connectionButton = displayText(self.connectionButtonLabel, self.connectionButtonWidth, self.connectionButtonHeight, myColors.black, myColors.white, 20, null, self.connectionButtonManipulator);
    self.connectionButtonManipulator.first.move(0, 2.5*drawing.height/10);
    svg.addEvent(self.connectionButton.content, "click", self.connectionButtonHandler);
    svg.addEvent(self.connectionButton.cadre, "click", self.connectionButtonHandler);
}

var AdminGUI = function (){
    domain && domain.Domain();
    playerMode = false;
    Answer.prototype.display = AnswerDisplay;
    Library.prototype.display = LibraryDisplay;
    Header.prototype.display = HeaderDisplay;
    AddEmptyElement.prototype.display = AddEmptyElementDisplay;
    Formation.prototype.displayMiniature = FormationDisplayMiniature;
    Formation.prototype.displayFormation = FormationDisplayFormation;
    Formation.prototype.removeErrorMessage = FormationRemoveErrorMessage;
    Formation.prototype.displayErrorMessage = FormationDisplayErrorMessage;
    Formation.prototype.displayFormationSaveButton = FormationDisplaySaveButton;
    FormationsManager.prototype.display = FormationsManagerDisplay;
    Question.prototype.display = QuestionDisplay;
    Question.prototype.displayAnswers = QuestionDisplayAnswers;
    Question.prototype.selectedQuestion = QuestionSelectedQuestion;
    Question.prototype.elementClicked = QuestionElementClicked;
    QuestionCreator.prototype.display = QuestionCreatorDisplay;
    QuestionCreator.prototype.displayToggleButton = QuestionCreatorDisplayToggleButton;
    QuestionCreator.prototype.displayQuestionCreator = QuestionCreatorDisplayQuestionCreator;
    Quizz.prototype.display = QuizzDisplay;
    Quizz.prototype.displayResult = QuizzDisplayResult;
    Quizz.prototype.displayMiniature = GameDisplayMiniature;
    Bd.prototype.displayMiniature = GameDisplayMiniature;
    Quizz.prototype.displayScore = QuizzDisplayScore;
    Puzzle.prototype.display = PuzzleDisplay;
    Puzzle.prototype.initTiles = PuzzleInitTiles;
    QuizzManager.prototype.display = QuizzManagerDisplay;
    QuizzManager.prototype.displayQuizzInfo = QuizzManagerDisplayQuizzInfo;
    QuizzManager.prototype.displayPreviewButton = QuizzManagerDisplayPreviewButton;
    QuizzManager.prototype.displayQuizSaveButton = QuizzManagerDisplaySaveButton;
    QuizzManager.prototype.displayQuestionsPuzzle = QuizzManagerDisplayQuestionPuzzle;
};

var LearningGUI = function (){
    domain && domain.Domain();
    playerMode = true;
    Answer.prototype.display = AnswerDisplay;
    Library.prototype.display = LibraryDisplay;
    Header.prototype.display = HeaderDisplay;
    Formation.prototype.displayFormation = FormationDisplayFormation;
    Formation.prototype.displayMiniature = FormationDisplayMiniature;
    FormationsManager.prototype.display = FormationsManagerDisplay;
    Question.prototype.display = QuestionDisplay;
    Question.prototype.displayAnswers = QuestionDisplayAnswers;
    Question.prototype.elementClicked = QuestionElementClicked;
    Question.prototype.selectedQuestion = QuestionSelectedQuestion;
    Puzzle.prototype.display = PuzzleDisplay;
    Puzzle.prototype.initTiles = PuzzleInitTiles;
    Quizz.prototype.display = QuizzDisplay;
    Quizz.prototype.displayResult = QuizzDisplayResult;
    Quizz.prototype.displayMiniature = GameDisplayMiniature;
    Quizz.prototype.displayScore = QuizzDisplayScore;
    InscriptionManager.prototype.display = InscriptionManagerDisplay;
    ConnectionManager.prototype.display = ConnectionManagerDisplay;
};
if (typeof exports !== "undefined") {
    exports.AdminGUI = AdminGUI;
    exports.LearningGUI = LearningGUI;
    exports.setDomain = setDomain;
    exports.setSVG = setSVG;
    exports.setGui = setGui;
    exports.setRuntime = setRuntime;
}