/**
 * Created by TDU3482 on 26/04/2016.
 */
'use strict';

var domain, svg, gui, runtime, playerMode, param, header;
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

function answerDisplay (x, y, w, h) {
    let self = this;

    if (typeof x !== "undefined")(self.x = x);
    if (typeof y !== "undefined")(self.y = y);
    if (typeof w !== "undefined")(self.width = w);
    if (typeof h !== "undefined")(self.height = h);

    if(self.editable) {
        answerEditableDisplay(self.x, self.y, self.width, self.height);
        return;
    }

    if (self.label && self.imageSrc) { // Question avec Texte ET image
        let obj = displayImageWithTitle(self.label, self.imageSrc, self.dimImage, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator,self.image);
        self.bordure = obj.cadre;
        self.content = obj.text;
        self.image = obj.image;
    } else if (self.label && !self.imageSrc) { // Question avec Texte uniquement
        let obj = displayText(self.label, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator);
        self.bordure = obj.cadre;
        self.content = obj.content;

    } else if (self.imageSrc && !self.label) { // Question avec Image uniquement
        let obj = displayImageWithBorder(self.imageSrc, self.dimImage, self.width, self.height, self.manipulator);
        self.image = obj.image;
        self.bordure = obj.cadre;
    } else { // Cas pour test uniquement : si rien, n'affiche qu'une bordure
        self.bordure = new svg.Rect(self.width, self.height).color(self.bgColor, 1, myColors.black).corners(25, 25);
        self.manipulator.last.children.indexOf(self.bordure)===-1 && self.manipulator.last.add(self.bordure);
    }

    if(this.parentQuestion.parentQuizz.previewMode) {
        let event = () => {
            this.explanationPopIn = new PopIn(this, false);
            if (this.parentQuestion.image && this.image){
                this.explanationPopIn.display(this.parentQuestion, 0, this.parentQuestion.parentQuizz.x, this.parentQuestion.tileHeight/2 + this.parentQuestion.parentQuizz.questionHeightWithImage/2 + MARGIN, this.parentQuestion.width, this.parentQuestion.tileHeight);
            }
            else if (this.parentQuestion.image && !this.image){
                this.explanationPopIn.display(this.parentQuestion, 0, this.parentQuestion.parentQuizz.x, this.parentQuestion.tileHeightMax/2 + this.parentQuestion.parentQuizz.questionHeightWithImage/2 + MARGIN, this.parentQuestion.width, this.parentQuestion.tileHeightMax);
            }
            else if (!this.parentQuestion.image && this.image){
                this.explanationPopIn.display(this.parentQuestion, 0, this.parentQuestion.parentQuizz.x, this.parentQuestion.tileHeight/2 + this.parentQuestion.parentQuizz.questionHeightWithoutImage/2 + MARGIN, this.parentQuestion.width, this.parentQuestion.tileHeight);
            }
            else {
                this.explanationPopIn.display(this.parentQuestion, 0, this.parentQuestion.parentQuizz.x, this.parentQuestion.tileHeightMax/2 + this.parentQuestion.parentQuizz.questionHeightWithoutImage/2 + MARGIN, this.parentQuestion.width, this.parentQuestion.tileHeightMax);
            }
        };
        this.image && svg.addEvent(this.image, "click", event);
        this.bordure && svg.addEvent(this.bordure, "click", event);
        this.content && svg.addEvent(this.content, "click", event);
    }

    if(self.selected){ // image pré-selectionnée
        self.bordure.color(self.bgColor, 5, SELECTION_COLOR);
    }
    self.manipulator.translator.move(self.x,self.y);

    function answerEditableDisplay(x, y, w, h) {
        self.checkboxSize = h * 0.2;
        self.obj = {};
        let redCrossClickHandler=()=>{
            self.redCrossManipulator.flush();
            let index = self.parentQuestion.tabAnswer.indexOf(self);
            drawing.mousedOverTarget=null;
            self.parentQuestion.tabAnswer.splice(index,1);
            let questionCreator=self.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
            if (self.parentQuestion.tabAnswer.length<3){
                svg.event(self.parentQuestion.tabAnswer[self.parentQuestion.tabAnswer.length-1].plus,'dblclick',{});
                if(index===0){
                    [self.parentQuestion.tabAnswer[0],self.parentQuestion.tabAnswer[1]]=[self.parentQuestion.tabAnswer[1],self.parentQuestion.tabAnswer[0]];
                    }
                }
            questionCreator.display();
        };
        let mouseleaveHandler= ()=>{
            self.redCrossManipulator.flush();
        };
        let mouseoverHandler=()=>{
            if(typeof self.redCrossManipulator === 'undefined'){
                self.redCrossManipulator = new Manipulator(self);
                self.redCrossManipulator.addOrdonator(2);
                self.manipulator && self.manipulator.last.add(self.redCrossManipulator.first);
            }
            let redCrossSize = 15;
            let redCross = drawRedCross(self.width/2 - redCrossSize, -self.height/2 + redCrossSize, redCrossSize, self.redCrossManipulator);

            svg.addEvent(redCross,'click',redCrossClickHandler);
            self.redCrossManipulator.ordonator.set(1,redCross);
        };
        let showTitle = function () {
            let text = (self.label) ? self.label : self.labelDefault,
                color = (self.label) ? myColors.black : myColors.grey;

            if(self.image){
                self.imageLayer = 2;
                let picture = new Picture(self.image.src, true, self, text);
                picture.draw(0, 0, w, h, self.manipulator, w-2*self.checkboxSize);
                self.obj.cadre = picture.imageSVG.cadre;
                self.obj.image = picture.imageSVG.image;
                self.obj.content = picture.imageSVG.content;
            } else {
                var tempObj = displayText(text, w, h, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator, 0, 1, w-2*self.checkboxSize);
                self.obj.cadre = tempObj.cadre;
                self.obj.content = tempObj.content;
                self.obj.content.position(0,self.obj.content.y);
            }

            (self.answerNameValidInput && text !== "") ? (self.obj.cadre.color(myColors.white,1,myColors.black).fillOpacity(0.001)):(self.obj.cadre.color(myColors.white,2,myColors.red).fillOpacity(0.001));
            self.obj.content.color(color);
            self.obj.cadre._acceptDrop = true;
            self.obj.content._acceptDrop = true;

            let editor = (self.editor.puzzle ? self.editor : self.editor.parent);

            svg.addEvent(self.obj.content, 'dblclick', dblclickEditionAnswer);
            svg.addEvent(self.obj.cadre, 'dblclick', dblclickEditionAnswer);
            svg.addEvent(self.obj.cadre,'mouseover',mouseoverHandler);
            svg.addEvent(self.obj.cadre,'mouseout',mouseleaveHandler);
        };

        let dblclickEditionAnswer = function () {
            let contentarea={};
            contentarea.height = svg.runtime.boundingRect(self.obj.content.component).height;
            contentarea.globalPointCenter = self.obj.content.globalPoint(-(w)/2,-(contentarea.height)/2);
            let contentareaStyle = {
                toppx: contentarea.globalPointCenter.y - (contentarea.height/2) * 2/3 ,
                leftpx: contentarea.globalPointCenter.x + (1/12) * self.obj.cadre.width,
                height: self.image ? contentarea.height : h * 0.5,
                width: self.obj.cadre.width * 5/6
            };
            drawing.notInTextArea = false;
            contentarea = new svg.TextArea(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height).
            color(null, 0, myColors.black).
            font("Arial", 20);
            (self.label==="" || self.label===self.labelDefault) && contentarea.placeHolder(self.labelDefault);
            contentarea.message(self.label || "");
            contentarea.width = w;
            contentarea.globalPointCenter = self.obj.content.globalPoint(-(contentarea.width)/2,-(contentarea.height)/2);
            drawings.screen.add(contentarea);
            contentarea.height = svg.runtime.boundingRect(self.obj.content.component).height;
            self.manipulator.ordonator.unset(1);
            contentarea.focus();

            let removeErrorMessage = function () {
                self.answerNameValidInput = true;
                self.errorMessage && self.editor.parent.questionCreatorManipulator.ordonator.unset(1);
                self.obj.cadre.color(myColors.white, 1, myColors.black);
            };

            let displayErrorMessage = function () {
                removeErrorMessage();
                self.obj.cadre.color(myColors.white, 2, myColors.red);
                let libraryRatio = 0.2,
                    previewButtonHeightRatio = 0.1,
                    marginErrorMessagePreviewButton = 0.03,
                    //position = (drawing.width - 0.5 * libraryRatio * drawing.width)/2,
                    quizzManager = self.parentQuestion.parentQuizz.parentFormation.quizzManager,
                    position = 0.5*libraryRatio * drawing.width + (quizzManager.questCreaWidth/2),//-self.editor.parent.globalMargin.width)/2,
                    anchor = 'middle';
                self.errorMessage = new svg.Text(REGEX_ERROR);
                quizzManager.questionCreator.questionCreatorManipulator.ordonator.set(1,self.errorMessage);
                self.errorMessage.position(-(drawing.width-quizzManager.questionCreator.w)/2, quizzManager.questionCreator.h/2-MARGIN/2)
                    .font('Arial', 15).color(myColors.red).anchor(anchor);
                contentarea.focus();
                self.answerNameValidInput = false;
            };

            let onblur = function () {
                contentarea.enter();
                self.label = contentarea.messageText;
                drawings.screen.remove(contentarea);
                drawing.notInTextArea = true;
                showTitle();
            };
            svg.addEvent(contentarea,'input',function () {
                contentarea.enter();
                self.checkInputContentArea({
                    contentarea: contentarea,
                    border: self.obj.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
            });
            svg.addEvent(contentarea,'blur',onblur);
            self.checkInputContentArea({
                contentarea: contentarea,
                border: self.obj.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        self.manipulator.flush();
        self.manipulator.translator.move(x,y);
        showTitle();
        self.penHandler = function(){
            self.popIn = self.popIn || new PopIn(self, true);
            let questionCreator = self.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
            self.popIn.display(questionCreator, questionCreator.previousX, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
            questionCreator.explanation = self.popIn;
        };
        displayPen(self.width/2-self.checkboxSize, self.height/2 - self.checkboxSize, self.checkboxSize, self);

        if(typeof self.obj.checkbox === 'undefined') {
            self.obj.checkbox = displayCheckbox(-self.width/2+self.checkboxSize, self.height/2 - self.checkboxSize, self.checkboxSize, self).checkbox;
            self.obj.checkbox.answerParent = self;
        }else{
            console.log("quelque chose");
        }

        self.manipulator.ordonator.children.forEach(function(e) {
            e._acceptDrop = true;
        });
    }
}

function libraryDisplay(x, y, w, h) {
    if (typeof x !== "undefined")(this.x = x);
    if (typeof y !== "undefined")(this.y = y);
    if (typeof w !== "undefined")(this.w = w);
    if (typeof h !== "undefined")(this.h = h);
    this.borderSize = 3;

    this.bordure = new svg.Rect(w - this.borderSize, h, this.libraryManipulator).color(myColors.white, this.borderSize, myColors.black);
    this.bordure.position(w / 2, h / 2 );
    this.libraryManipulator.ordonator.set(0, this.bordure);

    this.titleSvg = autoAdjustText(this.title, w, (1 / 10) * h, null, this.font, this.libraryManipulator).text;
    this.titleSvg.position(w / 2, (1 / 20) * h);

    this.libraryManipulator.translator.move(this.x, this.y);
}

function gamesLibraryDisplay(x, y, w, h) {
    libraryDisplay.call(this, x+MARGIN, y, w, h);

    let displayArrowModeButton = () => {
        if (this.libraryManipulator.last.children.indexOf(this.arrowModeManipulator.first)!==-1) {
            this.libraryManipulator.last.remove(this.arrowModeManipulator.first);
        }
        this.libraryManipulator.last.children.indexOf(this.arrowModeManipulator.first)===-1 && this.libraryManipulator.last.add(this.arrowModeManipulator.first);
        this.arrowModeManipulator.first.move(w / 2, h - (2 / 10) * h);

        let isChildOf = function (parentGame,childGame){
            parentGame.parentFormation.link.some((links) => links.parentGame === parentGame.id && links.childGame === childGame.id);
        };
        let createLink = function (parentGame, childGame) {
            if (isChildOf(parentGame,childGame)) return;
            if (parentGame.getPositionInFormation().levelIndex >= childGame.getPositionInFormation().levelIndex) return;
            parentGame.parentFormation.link.push({parentGame : parentGame.id,childGame : childGame.id});
            let arrow = new Arrow(parentGame, childGame);
            parentGame.parentFormation.arrowsManipulator.last.add(arrow.arrowPath);
        };

        let arrowModeButton = displayText('', w*0.9, (6 / 100) * h, myColors.black, myColors.white, null, this.font, this.arrowModeManipulator);
        arrowModeButton.arrow = drawStraightArrow(-0.3 * w, 0, 0.3 * w, 0);
        arrowModeButton.arrow.color(myColors.black,1,myColors.black);
        this.arrowModeManipulator.ordonator.set(2, arrowModeButton.arrow);

        this.toggleArrowMode = () => {
            this.arrowMode = !this.arrowMode;

            let panel = this.formation.panel,
                graph = this.formation.graphManipulator.last,
                clip = this.formation.clippingManipulator.last,
                glass = new svg.Rect(panel.width, panel.height).opacity(0.001).color(myColors.white);

            if (this.arrowMode) {
                this.gameSelected = null;
                this.itemsTab.forEach(e => {e.cadre.color(myColors.white, 1, myColors.black)});

                this.formation.selectedGame && this.formation.selectedGame.icon.cadre.component.listeners.click();

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
        };
        svg.addEvent(arrowModeButton.cadre, 'click', this.toggleArrowMode);
        svg.addEvent(arrowModeButton.arrow, 'click', this.toggleArrowMode);
    };

    let displayItems = () => {
        let maxGamesPerLine = 1,
            libMargin = (w - (maxGamesPerLine * w)) / (maxGamesPerLine + 1) + 2 * MARGIN,
            tempY = (2 / 10 * h);

        this.itemsTab.forEach((item, i) => {
            if(this.libraryManipulator.last.children.indexOf(this.libraryManipulators[i].first ) !== -1){
                this.libraryManipulator.last.remove(this.libraryManipulators[i].first);
            }
            this.libraryManipulator.last.children.indexOf(this.libraryManipulators[i].first)===-1 && this.libraryManipulator.last.add(this.libraryManipulators[i].first);

            if (i % maxGamesPerLine === 0 && i !== 0) {
                tempY += this.h / 4 + libMargin;
            }

            let label = JSON.parse(JSON.stringify(myLibraryGames.tab[i].label)),
                obj = displayTextWithCircle(label, Math.min(w/2, h/4), h, myColors.black, myColors.white, null, this.fontSize, this.libraryManipulators[i]);
            obj.cadre.clicked = false;
            this.itemsTab[i] = obj;

            let X = x + libMargin - 2 * MARGIN + ((i % maxGamesPerLine + 1) * (libMargin + w / 2 - 2 * MARGIN));
            this.libraryManipulators[i].first.move(X, tempY);
        });
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
                        let target = drawings.background.getTarget(event.clientX, event.clientY);
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
                        var target = drawings.background.getTarget(event.clientX, event.clientY);
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

function imagesLibraryDisplay(x, y, w, h, callback) {
    let display = (x, y, w, h) => {
        libraryDisplay.call(this, x, y, w, h);

        let displayItems = () => {
            let maxImagesPerLine = Math.floor((w - MARGIN) / (this.imageWidth + MARGIN)) || 1, //||1 pour le cas de resize très petit
                libMargin = (w - (maxImagesPerLine * this.imageWidth)) / (maxImagesPerLine + 1),
                tempY = (2 / 10 * h);

            this.itemsTab.forEach((item, i) => {
                if (i % maxImagesPerLine === 0 && i !== 0) {
                    tempY += this.imageHeight + libMargin;
                }

                if (this.libraryManipulator.last.children.indexOf(this.libraryManipulators[i].first) !== -1) {
                    this.libraryManipulator.last.remove(this.libraryManipulators[i].first);
                }
                this.libraryManipulator.last.children.indexOf(this.libraryManipulators[i].first) === -1 && this.libraryManipulator.last.add(this.libraryManipulators[i].first);

                let image = displayImage(myLibraryImage.tab[i].imgSrc, item, this.imageWidth, this.imageHeight, this.libraryManipulators[i]).image;
                image.srcDimension = {width: item.width, height: item.height};
                this.libraryManipulators[i].ordonator.set(0, image);

                let X = x + libMargin + ((i % maxImagesPerLine) * (libMargin + this.imageWidth));
                this.libraryManipulators[i].first.move(X, tempY);

            });
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

                        let elementCopy = libraryManipulator.ordonator.children[0],
                            img = displayImage(elementCopy.src, elementCopy.srcDimension, elementCopy.width, elementCopy.height).image;
                        img.srcDimension = elementCopy.srcDimension;
                        manip.ordonator.set(0, img);
                        manageDnD(img, manip);
                        img.component.listeners && svg.removeEvent(img, 'mouseup');
                        img.component.target && img.component.target.listeners && img.component.target.listeners.mouseup && svg.removeEvent(img.image, 'mouseup');

                        let mouseupHandler = event => {
                            let svgObj = manip.ordonator.children.shift();
                            manip.first.parent.remove(manip.first);
                            let target = drawings.background.getTarget(event.clientX, event.clientY);
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

        let displaySaveButton = () => {
            if (!this.dora) {
                let globalPointCenter = this.bordure.globalPoint(0, 0);
                var doraStyle = {
                    leftpx: globalPointCenter.x,
                    toppx: globalPointCenter.y,
                    width: this.w / 5,
                    height: this.w / 5
                };
                this.dora = new svg.TextField(doraStyle.leftpx, doraStyle.toppx, doraStyle.width, doraStyle.height);
                this.dora.type("file");
                svg.runtime.attr(this.dora.component, "accept", "image/*");
                svg.runtime.attr(this.dora.component, "id", "dora");
                svg.runtime.attr(this.dora.component, "hidden", "true");
                drawings.screen.add(this.dora);

            }
            var doraHandler = () => {
                svg.runtime.anchor("dora").click();
            };
            let addButton = new svg.Rect(this.w / 7, this.w / 7).color(myColors.black);
            this.addButtonManipulator.ordonator.set(0, addButton);
            this.libraryManipulator.last.children.indexOf(this.addButtonManipulator) === -1 &&
            this.libraryManipulator.last.add(this.addButtonManipulator.first);
            this.addButtonManipulator.translator.move(this.w / 2, this.h / 2);
            svg.addEvent(this.addButtonManipulator.ordonator.children[0], 'click', doraHandler);
        }

        displayItems();
        displaySaveButton();
        assignEvents();

    };

    let intervalToken = asyncTimerController.interval(() => {
        if (this.itemsTab.every(e => e.imageLoaded)) {
            asyncTimerController.clearInterval(intervalToken);
            display(x, y, w, h);
            callback();
        }
    }, 100);
    runtime && this.itemsTab.forEach(e => {
        imageController.imageLoaded(e.id, myImagesSourceDimensions[e.src].width, myImagesSourceDimensions[e.src].height);
    });
    if (runtime) {
        display(x, y, w, h);
        callback();
    }

}

function addEmptyElementDisplay(x, y, w, h) {
    let self = this;
    if(typeof x !== 'undefined'){
        self.x = x;
    }
    if(typeof y !== 'undefined'){
        self.y = y;
    }
    if(typeof w !== 'undefined') {
        w && (self.width = w);
    }
    if(typeof h !== 'undefined') {
        h && (self.height = h);
    }

    self.obj = displayText(self.label, self.width, self.height, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
    self.plus = drawPlus(0, 0, self.height * 0.3, self.height * 0.3);
    self.manipulator.translator.move(x, y);
    self.manipulator.ordonator.set(2, self.plus);
    self.obj.content.position(0, self.height * 0.35);
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
                self.parent.puzzle.updateElementsArray(self.parent.linkedQuestion.tabAnswer);
                self.parent.puzzle && self.parent.puzzle.fillVisibleElementsArray("leftToRight");
                self.parent.questionCreatorManipulator.last.children.indexOf(self.parent.puzzle.manipulator.first) === -1 && self.parent.questionCreatorManipulator.last.add(self.parent.puzzle.manipulator.first);
                self.parent.puzzle.display(self.parent.coordinatesAnswers.x,
                    self.parent.coordinatesAnswers.y, self.parent.coordinatesAnswers.w,
                    self.parent.coordinatesAnswers.h, false);
                break;
            case 'question':
                self.parent.quizz.tabQuestions.pop();
                (self.parent.quizz.tabQuestions.length>0) && (self.parent.quizz.tabQuestions[self.parent.indexOfEditedQuestion].selected = false);
                self.parent.indexOfEditedQuestion = self.parent.quizz.tabQuestions.length;
                self.parent.quizz.tabQuestions.forEach(question=>{
                    question.redCrossManipulator && question.redCrossManipulator.flush();
                    question.selected=false});
                let newQuestion = new Question(null, self.parent.quizz);

                newQuestion.selected = true;
                self.parent.quizz.tabQuestions.push(newQuestion);
                let AddNewEmptyQuestion = new AddEmptyElement(self.parent, 'question');
                self.parent.quizz.tabQuestions.push(AddNewEmptyQuestion);
                self.parent.questionPuzzle.visibleElementsArray[0].length === 6 && self.parent.questionPuzzle.updateStartPosition('right');

                if (self.parent.questionPuzzle.elementsArray.length > self.parent.questionPuzzle.columns) {
                    self.parent.displayQuestionsPuzzle(self.parent.questionPuzzleCoordinates.x,
                        self.parent.questionPuzzleCoordinates.y,
                        self.parent.questionPuzzleCoordinates.w,
                        self.parent.questionPuzzleCoordinates.h,
                        self.parent.questionPuzzle.indexOfFirstVisibleElement + 1);
                } else {
                    self.parent.displayQuestionsPuzzle(self.parent.questionPuzzleCoordinates.x,
                        self.parent.questionPuzzleCoordinates.y,
                        self.parent.questionPuzzleCoordinates.w,
                        self.parent.questionPuzzleCoordinates.h,
                        self.parent.questionPuzzle.indexOfFirstVisibleElement);
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

function formationDisplayFormation() {
    var self = this;
    drawing.currentPageDisplayed = "Formation";
    header.display(this.label);
    self.formationsManager.formationDisplayed = self;
    self.globalMargin = {
        height: self.marginRatio * drawing.height,
        width: self.marginRatio * drawing.width
    };

    self.borderSize = 3;
    self.manipulator.first.move(0, drawing.height*0.075);
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.manipulator.last.children.indexOf(self.returnButtonManipulator.first) === -1 && self.manipulator.last.add(self.returnButtonManipulator.first);

    let returnHandler = (event) => {
        let target = drawings.background.getTarget(event.clientX,event.clientY);
        target.parentObj.parent.manipulator.flush();
        Server.getAllFormationsNames().then(data => {
            let myFormations = JSON.parse(data).myCollection;
            target.parentObj.parent.formationsManager = new FormationsManager(myFormations);
            target.parentObj.parent.formationsManager.display();
        });
    };
    self.manipulator.last.children.indexOf(self.returnButtonManipulator.first) === -1 && self.manipulator.last.add(self.returnButtonManipulator.first);
    self.returnButton.display(0, -5, 20, 20);
    self.returnButton.height = svg.runtime.boundingRect(self.returnButton.returnButton.component).height;
    self.returnButton.setHandler(returnHandler);

    let dblclickQuizzHandler = (event) => {
        let targetQuizz = drawings.background.getTarget(event.clientX, event.clientY).parent.parentManip.parentObject;
        let displayQuizzManager = function () {
            self.quizzManager.loadQuizz(targetQuizz);
            self.quizzDisplayed = targetQuizz;
            self.quizzManager.display();
            self.selectedArrow = null;
            self.selectedGame = null;
        };
        self.saveFormation(displayQuizzManager);
        self.publicationFormation(displayQuizzManager);
        if (!runtime && window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (!runtime && document.selection) {
            document.selection.empty();
        }
    };

    let clickQuizHandler = (event) => {
        let targetQuizz = drawings.background.getTarget(event.clientX, event.clientY).parent.parentManip.parentObject;
        mainManipulator.ordonator.unset(1, self.manipulator.first);
        drawing.currentPageDisplayed = "QuizPreview";
        self.quizzDisplayed = new Quizz(targetQuizz);
        self.quizzDisplayed.puzzleLines = 3;
        self.quizzDisplayed.puzzleRows = 3;
        self.quizzDisplayed.run(0, 0, drawing.width, drawing.height);
        if (!runtime && window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (!runtime && document.selection) {
            document.selection.empty();
        }
    };

    let resizePanel = () => {
        var height = (self.levelHeight*(self.levelsTab.length+1) > self.graphH) ? (self.levelHeight*(self.levelsTab.length+1)) : self.graphH;
        let spaceOccupiedByAGame = (self.graphElementSize + self.minimalMarginBetweenGraphElements);
        let longestLevel = self.findLongestLevel()[0];
        let trueWidth = longestLevel && longestLevel.gamesTab.length*spaceOccupiedByAGame+spaceOccupiedByAGame;
        let widthMAX = Math.max(self.panel.width, trueWidth);
        self.panel.resizeContent(widthMAX-1, height-MARGIN);
    };

    this.movePanelContent = () => {
        let spaceOccupiedByAGame = (self.graphElementSize + self.minimalMarginBetweenGraphElements);
        let longestLevel = self.findLongestLevel()[0];
        let trueWidth = longestLevel ? longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame : 0;
        let widthMAX = Math.max(self.panel.width, trueWidth);
        self.miniaturesManipulator.first.move((widthMAX - self.panel.width) / 2, 0);
    };

    let displayLevel = (w, h, level) => {
        if(self.levelsTab.length >= self.graphManipulator.ordonator.children.length-1) {
            self.graphManipulator.ordonator.order(self.graphManipulator.ordonator.children.length + 1);
        }
        self.panel.contentV.add(level.manipulator.first);
        var lineColor = playerMode ? myColors.grey : myColors.black;
        var levelText =  playerMode ? "" : "Niveau " + level.index;
        level.obj = autoAdjustText(levelText, w-3*self.borderSize, self.levelHeight, 20, "Arial", level.manipulator);
        level.obj.line = new svg.Line(MARGIN, self.levelHeight, level.parentFormation.levelWidth, self.levelHeight).color(lineColor , 3, lineColor);
        level.obj.line.component.setAttribute && level.obj.line.component.setAttribute('stroke-dasharray', '6');
        level.obj.line.component.target && level.obj.line.component.target.setAttribute && level.obj.line.component.target.setAttribute('stroke-dasharray', '6');
        (self.textLevelNumberDimensions = {
            width: svg.runtime.boundingRect(level.obj.text.component).width,
            height: svg.runtime.boundingRect(level.obj.text.component).height
        });
        level.manipulator.ordonator.set(2, level.obj.line);
        level.obj.text.position(svg.runtime.boundingRect(level.obj.text.component).width, svg.runtime.boundingRect(level.obj.text.component).height);
        level.obj.text._acceptDrop = true;
        level.w = w;
        level.h = h;
        level.y = (level.index-1) * level.parentFormation.levelHeight;
        level.manipulator.first.move(0, level.y);
    };

    let displayFrame = (w, h) => {
        let hasKeyDownEvent = (event) => {
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
        drawing.notInTextArea = true;
        svg.runtime.addGlobalEvent("keydown", (event) => {
            if(drawing.notInTextArea && hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        });
        self.manipulator.ordonator.set(1, self.clippingManipulator.first);
        !playerMode && self.clippingManipulator.translator.move(self.libraryWidth, drawing.height*HEADER_SIZE);
        playerMode && self.clippingManipulator.translator.move(MARGIN, drawing.height*HEADER_SIZE);
        self.graphCreaHeight = drawing.height * self.graphCreaHeightRatio - drawing.height*0.1;//-15-self.saveButtonHeight;//15: Height Message Error

        if(typeof self.panel !== "undefined") {
            self.clippingManipulator.last.remove(self.panel.component);
        }
        self.panel = new gui.ScrollablePanel(w, h, myColors.white);
        self.panel.contentV.add(self.messageDragDropManipulator.first);
        self.panel.component.move(w/2, h/2);
        self.clippingManipulator.last.add(self.panel.component);
        self.panel.contentH.add(self.graphManipulator.first);
        self.panel.hHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
        self.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);

        resizePanel();
        self.movePanelContent();
    };

    let updateAllLinks = () => {
        self.arrowsManipulator.flush();
        var childElement, parentElement;
        self.link.forEach(function (links) {
            self.levelsTab.forEach(function (level) {
                level.gamesTab.forEach(function (game) {
                    game.id === links.childGame && (childElement = game);
                    game.id === links.parentGame && (parentElement = game);
                })
            });
            let arrow = new Arrow(parentElement, childElement);
            parentElement.parentFormation.arrowsManipulator.last.add(arrow.arrowPath);
        });
    };

    let displayMessageDragAndDrop = () => {
        self.messageDragDropMargin = self.graphCreaHeight/8-self.borderSize;
        self.messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", self.graphW, self.graphH, 20, null, self.messageDragDropManipulator).text;
        self.messageDragDrop._acceptDrop = true;
        self.messageDragDrop.x = self.panel.width/2;
        self.messageDragDrop.y = self.messageDragDropMargin + (self.levelsTab.length) * self.levelHeight;
        self.messageDragDrop.position(self.messageDragDrop.x, self.messageDragDrop.y).color(myColors.grey);//.fontStyle("italic");
        self.panel.back._acceptDrop = true;
    };

    this.displayGraph = (w, h) => {
        this.movePanelContent();
        resizePanel();
        if (typeof w !== "undefined") self.graphW = w;
        if (typeof h !== "undefined") self.graphH = h;
        self.messageDragDropMargin = self.graphCreaHeight/8-self.borderSize;
        if(self.levelWidth<self.graphCreaWidth){
            self.levelWidth=self.graphCreaWidth;
        }

        let manageMiniature = (tabElement) => {
            (self.miniaturesManipulator.last.children.indexOf(tabElement.miniatureManipulator.first) === -1) && self.miniaturesManipulator.last.add(tabElement.miniatureManipulator.first);// mettre un manipulateur par niveau !_! attention à bien les enlever
            tabElement.miniatureManipulator.first.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
            if (tabElement instanceof Quizz) {
                let eventToUse = playerMode ? ["click", clickQuizHandler] : ["dblclick", dblclickQuizzHandler];
                tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.cadre, ...eventToUse);
                tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.content, ...eventToUse);
            } else if(tabElement instanceof Bd) {
                let eventToUse = playerMode ? ["click", clickBdHandler] : ["dblclick", dblclickQuizzHandler];
                let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
                var clickBdHandler = function(event){
                    let targetBd = drawings.background.getTarget(event.clientX, event.clientY).parent.parentManip.parentObject;
                    bdDisplay(targetBd);
                };
                tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.cadre, ...eventToUse);
                tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.content, ...eventToUse);
                // Ouvrir le Bd creator du futur jeu Bd
            }
        };

        for (let i = 0; i<self.levelsTab.length; i++) {
            displayLevel(self.graphCreaWidth, self.graphCreaHeight, self.levelsTab[i]);
            self.adjustGamesPositions(self.levelsTab[i]);
            self.levelsTab[i].gamesTab.forEach(function(tabElement){
                tabElement.miniatureManipulator.addOrdonator(3);
                (self.miniaturesManipulator.last.children.indexOf(tabElement.miniatureManipulator.first) === -1) && self.miniaturesManipulator.last.add(tabElement.miniatureManipulator.first);// mettre un manipulateur par niveau !_! attention à bien les enlever
                if (typeof tabElement.miniature === "undefined") {
                    (tabElement.miniature = tabElement.displayMiniature(self.graphElementSize));
                }
                manageMiniature(tabElement);

            });
        }
        !playerMode && displayMessageDragAndDrop();
        self.graphManipulator.translator.move(self.graphW/2, self.graphH/2);
        resizePanel();
        self.panel.back.parent.parentManip = self.graphManipulator;
        updateAllLinks();
    };

    if (playerMode) {
        self.graphCreaHeightRatio = 0.97;
        self.graphCreaHeight = (drawing.height - header.height - self.returnButton.height) * self.graphCreaHeightRatio;//-15-self.saveButtonHeight;//15: Height Message Error
        self.graphCreaWidth = drawing.width  - 2 *  MARGIN;
        displayFrame(self.graphCreaWidth, self.graphCreaHeight);
        self.displayGraph(self.graphCreaWidth, self.graphCreaHeight);
        self.clippingManipulator.translator.move((drawing.width - self.graphCreaWidth)/2, self.formationsManager.y/2 -self.borderSize);
    } else {
        self.saveButtonHeight = drawing.height * self.saveButtonHeightRatio;

        self.graphCreaHeight = (drawing.height - header.height - 40 - self.returnButton.height) * self.graphCreaHeightRatio;//-15-self.saveButtonHeight;//15: Height Message Error
        self.graphCreaWidth = drawing.width * self.graphWidthRatio - MARGIN;

        self.gamesLibraryManipulator = self.library.libraryManipulator;
        self.manipulator.ordonator.set(2, self.gamesLibraryManipulator.first);
        self.manipulator.ordonator.set(4, self.formationInfoManipulator.first);

        self.libraryWidth = drawing.width * self.libraryWidthRatio;

        self.y = drawing.height * HEADER_SIZE ;

        self.title = new svg.Text("Formation : ").position(MARGIN, self.returnButton.height).font("Arial", 20).anchor("start");
        self.manipulator.ordonator.set(0,self.title);
        self.formationWidth = svg.runtime.boundingRect(self.title.component).width;

        let dblclickEditionFormationLabel = () => {
            let bounds = svg.runtime.boundingRect(self.formationLabel.cadre.component);
            self.formationInfoManipulator.ordonator.unset(1);
            let globalPointCenter = self.formationLabel.cadre.globalPoint(-(bounds.width) / 2, -(bounds.height) / 2);
            var contentareaStyle = {
                toppx: globalPointCenter.y + 4,
                leftpx: globalPointCenter.x + 4,
                width: self.formationLabel.cadre.width-MARGIN,
                height:(self.labelHeight)
            };
            drawing.notInTextArea = false;

            let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
            contentarea.color(myColors.lightgrey, 0, myColors.black)
                .font("Arial", 15)
                .anchor("start");
            (self.label==="" || self.label===self.labelDefault) ? contentarea.placeHolder(self.labelDefault) : contentarea.message(self.label);
            drawings.screen.add(contentarea);
            contentarea.focus();

            var removeErrorMessage = function () {
                self.formationNameValidInput = true;
                self.errorMessage && self.formationInfoManipulator.ordonator.unset(2);
                self.formationLabel.cadre.color(myColors.lightgrey, 1, myColors.none);
            };

            var displayErrorMessage = function () {
                removeErrorMessage();
                self.formationLabel.cadre.color(myColors.lightgrey, 2, myColors.red);
                var anchor = 'start';
                self.errorMessage = new svg.Text(REGEX_ERROR_FORMATION)
                    .position(self.formationLabel.cadre.width + self.formationWidth + 2 * MARGIN,0)
                    .font("Arial", 15).color(myColors.red).anchor(anchor);
                self.formationInfoManipulator.ordonator.set(2, self.errorMessage);
                contentarea.focus();
                self.labelValidInput = false;
            };
            var onblur = function () {
                contentarea.enter();
                self.label = contentarea.messageText.trim();
                drawings.screen.remove(contentarea);
                drawing.notInTextArea = true;
                showTitle();
                self.labelValidInput && header.display(self.label);
            };
            svg.addEvent(contentarea, "blur", onblur);
            var oninput = function () {
                contentarea.enter();
                self.checkInputTextArea({
                    textarea: contentarea,
                    border: self.formationLabel.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
                showTitle();
            };
            svg.addEvent(contentarea, "input", oninput);
            self.checkInputTextArea({
                textarea: contentarea,
                border: self.formationLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };

        let showTitle = () => {
            let text = self.label ? self.label : self.labelDefault;
            let color = self.label ? myColors.black : myColors.grey;
            let bgcolor = myColors.lightgrey;
            self.formationLabelWidth = 400 ;
            self.formationLabel = {};
            self.formationLabel.content = autoAdjustText(text, self.formationLabelWidth, 20, 15, "Arial", self.formationInfoManipulator).text;
            self.labelHeight = svg.runtime.boundingRect(self.formationLabel.content.component).height;

            self.formationTitleWidth = svg.runtime.boundingRect(self.title.component).width;
            self.formationLabel.cadre = new svg.Rect(self.formationLabelWidth, self.labelHeight + MARGIN);
            self.labelValidInput ? self.formationLabel.cadre.color(bgcolor) : self.formationLabel.cadre.color(bgcolor, 2, myColors.red);
            self.formationLabel.cadre.position(self.formationTitleWidth + self.formationLabelWidth/2 +3/2*MARGIN, -MARGIN/2);

            self.formationInfoManipulator.ordonator.set(0, self.formationLabel.cadre);
            self.formationLabel.content.position(self.formationTitleWidth + 2 * MARGIN, 0).color(color).anchor("start");
            self.formationInfoManipulator.translator.move(0, self.returnButton.height);
            svg.addEvent(self.formationLabel.content, "dblclick", dblclickEditionFormationLabel);
            svg.addEvent(self.formationLabel.cadre, "dblclick", dblclickEditionFormationLabel);
        };
        showTitle();
        self.library.display(0,drawing.height*HEADER_SIZE,self.libraryWidth-MARGIN, self.graphCreaHeight);
        self.displayFormationSaveButton(drawing.width/2 - self.ButtonWidth, drawing.height*0.87 ,self.ButtonWidth, self.saveButtonHeight);
        self.displayFormationPublicationButton(drawing.width/2 + self.ButtonWidth , drawing.height* 0.87 ,self.ButtonWidth, self.publicationButtonHeight);
        displayFrame(self.graphCreaWidth, self.graphCreaHeight);
        self.displayGraph(self.graphCreaWidth, self.graphCreaHeight);
    }

 ////15: Height Message Error
}

function playerModeDisplayFormation () {
    this.trackProgress(formationDisplayFormation)
}

function formationRemoveErrorMessage(message) {
    message && message.parent && message.parent.remove(message);
}

function formationDisplaySaveButton(x, y, w, h) {
    this.saveFormationButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveFormationButtonManipulator);
    this.errorMessageSave && this.errorMessageSave.parent && this.saveFormationButtonManipulator.last.remove(this.errorMessageSave);
    svg.addEvent(this.saveFormationButton.cadre, "click", () => this.saveFormation());
    svg.addEvent(this.saveFormationButton.content, "click", () => this.saveFormation());
    this.saveFormationButtonManipulator.translator.move(x, y);
}

function formationDisplayPublicationButton(x, y, w, h) {
    this.publicationFormationButton = displayText("Publier", w, h, myColors.black, myColors.white, 20, null, this.publicationFormationButtonManipulator);
    this.errorMessagePublication && this.errorMessagePublication.parent && this.publicationFormationButtonManipulator.last.remove(this.errorMessagePublication);
    svg.addEvent(this.publicationFormationButton.cadre, "click", () => this.publicationFormation());
    svg.addEvent(this.publicationFormationButton.content, "click", () => this.publicationFormation());
    this.publicationFormationButtonManipulator.translator.move(x, y);
}

function formationsManagerDisplay() {
    let self = this;
    drawing.currentPageDisplayed = 'FormationsManager';
    self.manipulator.first.move(0, drawing.height * HEADER_SIZE);
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.manipulator.last.children.indexOf(self.headerManipulator.first)===-1 && self.manipulator.last.add(self.headerManipulator.first);

    if (playerMode) {
        self.headerManipulator.last.add(self.toggleFormationsManipulator.first);
        let manip = this.toggleFormationsManipulator,
            pos = -MARGIN,
            toggleFormationsText = displayText('Formations en cours', drawing.width*0.2, 25, myColors.none, myColors.none, 20, null, manip, 0, 1),
            textWidth = svg.runtime.boundingRect(toggleFormationsText.content.component).width;
        this.toggleFormationsCheck = new svg.Rect(20, 20).color(myColors.white, 2, myColors.black);
        pos-= textWidth/2;
        toggleFormationsText.content.position(pos, 6);
        toggleFormationsText.cadre.position(pos, 0);
        pos-= textWidth/2 + 2*MARGIN;
        this.toggleFormationsCheck.position(pos, 0);
        manip.ordonator.set(2, this.toggleFormationsCheck);
        manip.translator.move(drawing.width, 10 + MARGIN);

        let toggleFormations = () => {
            this.progressOnly = !this.progressOnly;
            let check = drawCheck(pos, 0, 20),
                manip = self.toggleFormationsManipulator.last;
            svg.addEvent(manip, "click", toggleFormations);
            if (this.progressOnly) {
                manip.add(check);
            } else {
                manip.remove(manip.children[manip.children.length - 1]);
            }
            this.formationsManipulator.flush();
            this.displayFormations();
        };
        svg.addEvent(self.toggleFormationsCheck, 'click', toggleFormations);
        svg.addEvent(toggleFormationsText.content, 'click', toggleFormations);
        svg.addEvent(toggleFormationsText.cadre, 'click', toggleFormations);
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
        self.headerHeightFormation = drawing.height * header.size ;
        self.spaceBetweenElements = {
            width:self.panel?0.015*self.panel.width:0.015*drawing.width,
            height: self.panel?0.030*self.panel.height:0.030*drawing.height
        };
        self.y = (!playerMode) ? self.addButtonHeight*1.5 : self.toggleFormationsCheck.height * 2;//drawing.height * self.header.size;

        self.rows = Math.floor((drawing.width - 2*MARGIN) / (self.tileWidth + self.spaceBetweenElements.width));
        if(self.rows === 0) self.rows = 1;

        drawing.notInTextArea = true;
        svg.runtime.addGlobalEvent("keydown", (event) => {
            if(drawing.notInTextArea && hasKeyDownEvent(event)) {
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
        self.panel.component.move(((drawing.width-2*MARGIN)+MARGIN)/2, self.heightAllocatedToPanel /2);
        (self.clippingManipulator.last.children.indexOf(self.panel.component) === -1) && self.clippingManipulator.last.add(self.panel.component);
        self.panel.content.children.indexOf(self.formationsManipulator.first)===-1 && self.panel.content.add(self.formationsManipulator.first);
        self.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
        self.formationsManipulator.translator.move((self.tileWidth+widthAllocatedToDisplayedElementInPanel)/2, self.tileHeight/2+self.spaceBetweenElements.height/2);
    }

    let onClickFormation = formation => {
        Server.getFormationById(formation._id).then(data => {
            var myFormation = JSON.parse(data).formation;
            formation.loadFormation(myFormation);
            this.formationDisplayed = formation;
            this.formationDisplayed.displayFormation();
        })
    };

    function onClickNewFormation() {
        var formation = new Formation({}, self);
        self.formationDisplayed=formation;
        formation.parent = self;
        formation.displayFormation();
    }

    self.displayHeaderFormations = function () {
        self.headerManipulator.translator.move(0,0);
        self.addFormationButton = displayText("Ajouter une formation", drawing.width/7, self.addButtonHeight, myColors.none, myColors.lightgrey, 20, null, self.addButtonManipulator);
        var addFormationButtonTextBr = svg.runtime.boundingRect(self.addFormationButton.content.component);
        self.addFormationButton.cadre.position(MARGIN + addFormationButtonTextBr.width/2, -addFormationButtonTextBr.height/2).corners(0,0);
        self.addFormationButton.content.position(self.plusDim + svg.runtime.boundingRect(self.addFormationButton.content.component).width/2, -addFormationButtonTextBr.height/8);
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
        self.published = autoAdjustText("Publié", self.addButtonWidth, self.addButtonHeight, self.fontSize * 3 / 4, null, self.checkManipulator).text.anchor("start");
        self.published.position(25, self.published.y);

        self.exclamationLegend = statusEnum.Edited.icon(self.iconeSize);
        self.exclamationManipulator.ordonator.set(0, self.exclamationLegend.circle);
        self.exclamationManipulator.ordonator.set(2, self.exclamationLegend.dot);
        self.exclamationManipulator.ordonator.set(3, self.exclamationLegend.exclamation);
        self.toPublish = autoAdjustText("Nouvelle version à publier", self.addButtonWidth, self.addButtonHeight, self.fontSize * 3 / 4, null, self.exclamationManipulator).text.anchor("start");
        self.toPublish.position(25, self.toPublish.y);
        self.legendWidth = drawing.width * 0.3;
        self.legendItemLength = svg.runtime.boundingRect(self.toPublish.component).width+svg.runtime.boundingRect(self.exclamationLegend.circle.component).width+MARGIN;
        self.checkManipulator.first.move(drawing.width - self.legendItemLength - svg.runtime.boundingRect(self.published.component).width-svg.runtime.boundingRect(self.checkLegend.square.component).width-2*MARGIN, 30);
        self.exclamationManipulator.first.move(drawing.width - self.legendItemLength, 30);

        self.formations.sort(function (a, b) {
            var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase();
            if (nameA < nameB)
                return -1;
            if (nameA > nameB)
                return 1;
            return 0
        });
    };
    header.display("Liste des formations");
    self.displayHeaderFormations();
    (self.tileHeight < 0) && (self.tileHeight = undefined);
    (!self.tileHeight || self.tileHeight > 0) && displayPanel();

    self.displayFormations = function () {
        let posx = self.initialFormationsPosX,
            posy = MARGIN,
            count = 0,
            totalLines = 1;
        self.formations.forEach(formation => {
            // we can't publish a formation yet
            //if (playerMode && formation.status.toString() === statusEnum.NotPublished.toString()) return;
            if (playerMode && this.progressOnly && formation.progress !== 'inProgress') return;

            if (count > (self.rows - 1)) {
                count = 0;
                totalLines ++;
                posy += (self.tileHeight + self.spaceBetweenElements.height);
                posx = self.initialFormationsPosX;
            }
            formation.parent = self;
            self.formationsManipulator.last.children.indexOf(formation.miniature.miniatureManipulator.first)===-1 && self.formationsManipulator.last.add(formation.miniature.miniatureManipulator.first);

             formation.miniature.display(posx, posy, self.tileWidth, self.tileHeight);

            formation.miniature.setHandler(onClickFormation);
            count++;
            posx += (self.tileWidth+ self.spaceBetweenElements.width);
        });
        self.panel.resizeContent(totalLines*(self.spaceBetweenElements.height+self.tileHeight)+self.spaceBetweenElements.height-MARGIN);
    };
    (self.tileHeight > 0) && self.displayFormations();
}

function headerDisplay (message) {
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
            userManip.flush();
            main();
        };
        svg.addEvent(deconnexion.content, "click", deconnexionHandler);
        svg.addEvent(deconnexion.cadre, "click", deconnexionHandler);
    };

    if (message) {
        const messageText = autoAdjustText(message, this.width * 0.3, 50, 32, 'Arial', manip, 2);
        messageText.text.position(this.width / 2, this.height / 2 + MARGIN);
    } else {
        manip.ordonator.unset(2);
    }

    manip.last.children.indexOf(userManip.first) === -1 && manip.last.add(userManip.first);
    drawing.username && displayUser();
    if (message === "Inscription" || message === "Connexion") {
        const link = message === "Inscription" ? "Connexion" : "Inscription";
        const clickHandler = () => {
            (link === "Inscription") ? inscriptionManager.display() : connexionManager.display();
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
    var self = this;
    if(typeof x !== 'undefined'){
        self.x = x;
    }
    if(typeof y !== 'undefined' ){
        self.y = y;
    }
    if(typeof w !== 'undefined' ) {
        w && (self.width = w);
    }
    if(typeof h !== 'undefined' ) {
        h && (self.height = h);
    }

    // Question avec Texte ET image
    if (typeof self.label !== "undefined" && self.imageSrc ) {//&& self.label !== ""
        let obj = displayImageWithTitle(self.label, self.imageSrc, {width:self.image.width, height:self.image.height}, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator, self.image);
        self.bordure = obj.cadre;
        self.content = obj.content;
        self.image = obj.image;
    }
    // Question avec Texte uniquement
    else if (typeof self.label !== "undefined" && !self.imageSrc) {
        var object = displayText(self.label, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font,self.manipulator);
        self.bordure = object.cadre;
        self.content = object.content;
    }
    // Question avec Image uniquement
    else if (self.imageSrc && !self.label) {
        self.image = displayImage(self.imageSrc, this.dimImage, self.width, self.height).image;
        self.manipulator.ordonator.set(2, self.image);
    }
    else {
        self.bordure = new svg.Rect( self.width, self.height).color(self.bgColor,1,self.colorBordure);
        self.manipulator.ordonator.set(0, self.bordure);
    }

    if(playerMode) {
        if(this.parentQuizz.currentQuestionIndex >= this.parentQuizz.tabQuestions.length) {
            let event = () => {
                let wrongQuiz = Object.assign({}, this.parentQuizz);
                let questionsWithBadAnswersTab = [];
                this.parentQuizz.questionsWithBadAnswers.forEach(x => questionsWithBadAnswersTab.push(x.question));
                wrongQuiz.tabQuestions = questionsWithBadAnswersTab;
                this.wrongQuestionsQuiz = new Quizz(wrongQuiz, true);
                this.wrongQuestionsQuiz.currentQuestionIndex = questionsWithBadAnswersTab.indexOf(this);
                this.wrongQuestionsQuiz.run(1, 1, drawing.width, drawing.height);
            };
            self.bordure && svg.addEvent(self.bordure, "click", event);
            self.content && svg.addEvent(self.content, "click", event);
            self.image && svg.addEvent(self.image, "click", event);
        }
    } else {
        self.bordure && svg.addEvent(self.bordure, "click", self.parentQuizz.parentFormation.quizzManager.questionClickHandler);
        self.content && svg.addEvent(self.content, "click", self.parentQuizz.parentFormation.quizzManager.questionClickHandler);
        self.image && svg.addEvent(self.image, "click", self.parentQuizz.parentFormation.quizzManager.questionClickHandler);
    }

    var fontSize = Math.min(20, self.height*0.1);
    self.questNum = new svg.Text(self.questionNum).position(-self.width/2+MARGIN+(fontSize*(self.questionNum.toString.length)/2), -self.height/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
    self.manipulator.ordonator.set(4, self.questNum);
    self.manipulator.translator.move(self.x,self.y);
    if(self.selected){
        self.selectedQuestion();
        //this.toggleInvalidQuestionPictogram(true);// !_! bon, mais à changer d'emplacement
    }else{
        //this.toggleInvalidQuestionPictogram(false);
    }
}

function questionElementClicked(sourceElement) {
    if(this.multipleChoice === false){// question normale, une seule réponse possible
        if(sourceElement.correct) {
            this.parentQuizz.score++;
            console.log("Bonne réponse!\n");
        } else {
            let selectedAnswerIndexTab = [this.parentQuizz.tabQuestions[this.parentQuizz.currentQuestionIndex].tabAnswer.indexOf(sourceElement)];
            this.parentQuizz.questionsWithBadAnswers.push({index: this.parentQuizz.currentQuestionIndex, question: this.parentQuizz.tabQuestions[this.parentQuizz.currentQuestionIndex], selectedAnswers: selectedAnswerIndexTab});
            var reponseD = "";
            this.rightAnswers.forEach(function(e){
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

        this.parentQuizz.nextQuestion();
    }else{// question à choix multiples
        if(sourceElement.selected === false){
            // on sélectionne une réponse
            sourceElement.selected = true;
            this.selectedAnswers.push(sourceElement);
            sourceElement.colorBordure = sourceElement.bordure.strokeColor;
            sourceElement.bordure.color(sourceElement.bgColor, 5, SELECTION_COLOR);
            this.resetButton.cadre.color(myColors.yellow, 1, myColors.green);
        }else{
            sourceElement.selected = false;
            this.selectedAnswers.splice(this.selectedAnswers.indexOf(sourceElement), 1);
            sourceElement.bordure.color(sourceElement.bgColor, 1, sourceElement.colorBordure);
            if(this.selectedAnswers.length === 0){
                this.resetButton.cadre.color(myColors.grey,1,myColors.grey);
            }
        }
    }
}

function questionDisplayAnswers(x, y, w, h) {
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
        self.manipulator.ordonator.set(3, self.answersManipulator.first);
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
                posx = 0;
            }

            self.answersManipulator.last.children.indexOf(self.tabAnswer[i].manipulator.first) === -1 && self.answersManipulator.last.add(self.tabAnswer[i].manipulator.first);
            self.tabAnswer[i].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
            self.tabAnswer[i].manipulator.translator.move(posx-(self.rows - 1)*self.tileWidth/2-(self.rows - 1)*MARGIN/2,posy+MARGIN);

            if(self.parentQuizz.previewMode) {
                if(self.tabAnswer[i].correct) {
                    self.tabAnswer[i].bordure.color(self.tabAnswer[i].bordure.component.fillColor || myColors.white, 5, myColors.primaryGreen);
                }
            } else {
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
            }
            count++;
        }
        if (self.parentQuizz.previewMode){
            let index;
            for (let j = 0; j<self.parentQuizz.questionsWithBadAnswers.length ; j++){
                (self.parentQuizz.questionsWithBadAnswers[j].index+1 === self.questionNum) && (index = j);
            }
            playerMode && self.parentQuizz.questionsWithBadAnswers[index].selectedAnswers.forEach(selectedAnswer=>{
                self.tabAnswer[selectedAnswer].correct ? self.tabAnswer[selectedAnswer].bordure.color(myColors.blue, 5, myColors.primaryGreen) : self.tabAnswer[selectedAnswer].bordure.color(myColors.blue, 5, myColors.red);
                //self.tabAnswer[selectedAnswer].correct ? self.tabAnswer[selectedAnswer].bordure.color(myColors.darkBlue, 5, myColors.primaryGreen) : self.tabAnswer[selectedAnswer].bordure.color(myColors.darkBlue, 5, myColors.red);
                //self.tabAnswer[selectedAnswer].content.color(getComplementary(myColors.darkBlue));
            });
        }

    }
    if (playerMode && self.parentQuizz.previewMode) {
        w = 0.5 * drawing.width;
        h = Math.min(self.tileHeight, 50);
        var buttonX = - w/2;
        var buttonY = self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;
        self.simpleChoiceMessageManipulator.translator.move(buttonX+w/2, buttonY+h/2);
        self.simpleChoiceMessage = displayText("Cliquer sur une réponse pour afficher son explication", w, h, myColors.none, myColors.none, 20, "Arial", self.simpleChoiceMessageManipulator);
    }
    else if(self.multipleChoice){
        //affichage d'un bouton "valider"
        w = 0.1 * drawing.width;
        h = Math.min(self.tileHeight, 50);
        var validateX,validateY;
        validateX = 0.08 * drawing.width - w/2;
        validateY = self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;

        var validateButton = displayText("Valider", w, h, myColors.green, myColors.yellow, 20, self.font, self.validateManipulator);
        self.validateManipulator.translator.move(validateX + w/2, validateY + h/2);

        //button. onclick
        if(!self.parentQuizz.previewMode) {
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
                    let indexOfSelectedAnswers = [];
                    self.selectedAnswers.forEach(aSelectedAnswer =>{
                        indexOfSelectedAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex].tabAnswer.indexOf(aSelectedAnswer));
                    })
                    self.parentQuizz.questionsWithBadAnswers.push({index: self.parentQuizz.currentQuestionIndex, question: self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex], selectedAnswers: indexOfSelectedAnswers});
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
        }

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
        if(!self.parentQuizz.previewMode) {
            self.reset = function () {
                if (self.selectedAnswers.length > 0) {
                    self.selectedAnswers.forEach(function (e) {
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

function questionSelectedQuestion() {
    this.bordure.color(this.bgColor, 5, SELECTION_COLOR);
    if(!this.redCrossManipulator){
        let redCrossClickHandler = () =>{
            let quizzManager = this.parentQuizz.parentFormation.quizzManager;
            let questionCreator = quizzManager.questionCreator;
            let questionPuzzle = quizzManager.questionPuzzle;
            let questionsArray = questionPuzzle.elementsArray;
            let index = questionsArray.indexOf(this);
            this.remove();
            (questionsArray[index] instanceof AddEmptyElement) && index--; // Cas où on clique sur l'AddEmptyElement (dernier élément)
            if(index !== -1) {
                quizzManager.indexOfEditedQuestion = index;
                quizzManager.questionClickHandler({question:this.parentQuizz.tabQuestions[index]});
                this.parentQuizz.tabQuestions[index].selected = true;
                resetQuestionsIndex(this.parentQuizz);
                questionPuzzle && questionPuzzle.indexOfFirstVisibleElement!=0 && questionPuzzle.indexOfFirstVisibleElement--;
                questionPuzzle && questionPuzzle.updateElementsArray(this.parentQuizz.tabQuestions);
                questionPuzzle && questionPuzzle.fillVisibleElementsArray("leftToRight");
                questionPuzzle.display();
            }
            else{
                this.parentQuizz.tabQuestions.splice(0,0, new Question(defaultQuestion, this.parentQuizz));
                resetQuestionsIndex(this.parentQuizz);
                if (questionPuzzle){
                    questionPuzzle.visibleElementsArray[0].length === 6 && questionPuzzle.updateStartPosition('right');
                    questionPuzzle.fillVisibleElementsArray("leftToRight");
                }
                quizzManager.indexOfEditedQuestion = ++index;
                this.parentQuizz.tabQuestions[0].selected = true;
                questionPuzzle.display();

                svg.event(questionsArray[0].bordure, "click", {question:questionsArray[0]}); // dernier élément du tableau (AddEmptyElement)
            }
        };
        this.redCrossManipulator = new Manipulator(this);
        let size = 20;
        this.redCross || (this.redCross = drawRedCross(-this.questNum.x, this.questNum.y - size/2, size, this.redCrossManipulator));
        svg.addEvent(this.redCross, "click", redCrossClickHandler);
        this.redCrossManipulator.last.children.indexOf(this.redCross) === -1 && this.redCrossManipulator.last.add(this.redCross);
        this.manipulator.last.add(this.redCrossManipulator.first);
    }
    else{
        this.redCrossManipulator.translator.move(-this.questNum.x, this.questNum.y - this.redCross.size/2);
        this.redCrossManipulator.last.children.indexOf(this.redCross) === -1 && this.redCrossManipulator.last.add(this.redCross);
    }
}

function questionCreatorDisplay (x, y, w, h) {
    x && (this.previousX = x);
    y && (this.previousY = y);
    w && (this.previousW = w);
    h && (this.previousH = h);
    this.manipulator.last.children.indexOf(this.questionCreatorManipulator.first)===-1 && this.manipulator.last.add(this.questionCreatorManipulator.first);
    this.questionCreatorHeight = Math.floor(this.previousH * (1 - this.headerHeight) - 80);
    this.questionCreatorManipulator.translator.move(this.previousX, 0);
    this.toggleButtonHeight = 40;
    this.displayQuestionCreator(this.previousX, this.previousY, this.previousW, this.previousH);
    var clickedButton = this.multipleChoice ? myQuestionType.tab[1].label : myQuestionType.tab[0].label;
    this.displayToggleButton(MARGIN + this.previousX, MARGIN/2+this.previousY, this.previousW, this.toggleButtonHeight-MARGIN, clickedButton);
}

function questionCreatorDisplayToggleButton (x, y, w, h, clicked){
    var size = this.questionBlock.rect.height*0.05;
    this.questionCreatorManipulator.last.children.indexOf(this.toggleButtonManipulator.first)===-1 && this.questionCreatorManipulator.last.add(this.toggleButtonManipulator.first);
    this.toggleButtonWidth = drawing.width/5;
    var toggleHandler = (event)=>{
        this.target = drawings.background.getTarget(event.clientX, event.clientY);
        var questionType = this.target.parent.children[1].messageText;
        this.linkedQuestion.tabAnswer.forEach(function(answer){
            answer.correct = false;
        });

        (questionType === "Réponses multiples") ? (this.multipleChoice = true) : (this.multipleChoice = false);
        (questionType === "Réponses multiples") ? (this.linkedQuestion.multipleChoice = true) : (this.linkedQuestion.multipleChoice = false);

        this.linkedQuestion.questionType = (!this.multipleChoice) ? this.questionType[0] : this.questionType[1];
        this.errorMessagePreview && this.errorMessagePreview.parent && this.parent.previewButtonManipulator.last.remove(this.errorMessagePreview);

        this.linkedQuestion.tabAnswer.forEach((answer)=>{
            var xCheckBox, yCheckBox = 0;
            if (answer.obj.checkbox) {
                xCheckBox = answer.obj.checkbox.x;
                yCheckBox = answer.obj.checkbox.y;
                answer.correct = false;
                answer.obj.checkbox = displayCheckbox(xCheckBox, yCheckBox, size, answer).checkbox;
                answer.obj.checkbox.answerParent = answer;
            }
        });
        this.displayToggleButton(x, y, w, h, questionType);
    };

    this.questionCreatorManipulator.last.children.indexOf(this.toggleButtonManipulator.first)===-1 && this.questionCreatorManipulator.last.add(this.toggleButtonManipulator.first);

    var length = this.questionType.length;
    var lengthToUse = (length+1)*MARGIN+length*this.toggleButtonWidth;
    this.margin = (w-lengthToUse)/2;
    this.x = this.margin+this.toggleButtonWidth/2+MARGIN;
    var i = 0;
    (!this.completeBanner) && (this.completeBanner = []);
    this.questionType.forEach((type)=>{
        if(this.completeBanner[i] && this.completeBanner[i].manipulator){
            this.toggleButtonManipulator.last.remove(this.completeBanner[i].manipulator.first);
        }
        this.completeBanner[i] = {};
        this.completeBanner[i].manipulator = new Manipulator(this);
        this.completeBanner[i].manipulator.addOrdonator(2);
        this.toggleButtonManipulator.last.add(this.completeBanner[i].manipulator.first);
        (type.label == clicked) ? (this.completeBanner[i].color = SELECTION_COLOR) : (this.completeBanner[i].color = myColors.white);
        this.completeBanner[i].toggleButton = displayTextWithoutCorners(type.label, this.toggleButtonWidth, h, myColors.black, this.completeBanner[i].color, 20, null, this.completeBanner[i].manipulator);
        this.completeBanner[i].toggleButton.content.color(getComplementary(this.completeBanner[i].color), 0, myColors.black);
        this.completeBanner[i].manipulator.translator.move(this.x-this.w/2, h - this.h/2);
        this.x += this.toggleButtonWidth + MARGIN;
        (type.label != clicked) && (svg.addEvent(this.completeBanner[i].toggleButton.content, "click", toggleHandler));
        (type.label != clicked) && (svg.addEvent(this.completeBanner[i].toggleButton.cadre, "click", toggleHandler));
        i++;
    });
    this.linkedQuestion.questionType = (this.multipleChoice) ? this.questionType[1] : this.questionType[0];
    this.toggleButtonManipulator.translator.move(0,0);
}

function questionCreatorDisplayQuestionCreator (x, y, w, h) {
    var self = this;
    // bloc Question
    self.questionCreatorManipulator.flush();
    self.questionBlock = {rect: new svg.Rect(w, h).color(myColors.none, 3, myColors.black).position(w / 2, y + h / 2)};
    self.questionBlock.rect.position(0, 0);
    self.questionBlock.rect.fillOpacity(0.001);
    self.questionCreatorManipulator.last.children.indexOf(self.questionBlock.rect)===-1 && self.questionCreatorManipulator.last.add(self.questionBlock.rect);
    self.questionCreatorManipulator.last.children.indexOf(self.questionManipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.questionManipulator.first);
    var showTitle = function () {
        var color = (self.linkedQuestion.label) ? myColors.black : myColors.grey;
        var text = (self.linkedQuestion.label) ? self.linkedQuestion.label : self.labelDefault;
        if(self.linkedQuestion.image){
            self.image = self.linkedQuestion.image;
            self.imageLayer = 2;
            var picture = new Picture(self.image.src, true, self, text);
            picture.draw(0, 0, self.w-2*MARGIN, self.h*0.25, self.questionManipulator);
            self.questionBlock.title = picture.imageSVG;
            let redCrossClickHandler = ()=>{
                var indexPuzzle = self.parent.questionPuzzle.elementsArray.indexOf(self.linkedQuestion);
                self.parent.questionPuzzle.elementsArray[indexPuzzle].manipulator.ordonator.unset(2);
                self.questionBlock.redCrossManipulator.flush();
                self.questionManipulator.ordonator.unset(2);//image
                self.linkedQuestion.image = null;
                self.linkedQuestion.imageSrc = null;
                self.parent.displayQuestionsPuzzle(null, null, null, null, self.parent.questionPuzzle.indexOfFirstVisibleElement);
                self.display(x, y, w, h);
            };

            let mouseleaveHandler = ()=>{
                self.questionBlock.redCrossManipulator && self.questionBlock.redCrossManipulator.flush();
            };

            let mouseoverHandler = ()=>{
                if(typeof self.questionBlock.redCrossManipulator === 'undefined'){
                    self.questionBlock.redCrossManipulator=new Manipulator(self);
                    self.questionBlock.redCrossManipulator.addOrdonator(2);
                    self.questionManipulator && self.questionManipulator.last.add(self.questionBlock.redCrossManipulator.first);
                }
                let redCrossSize = 15;
                let redCross = drawRedCross(self.questionBlock.title.image.x + self.questionBlock.title.image.width/2 - redCrossSize/2, self.questionBlock.title.image.y -self.questionBlock.title.image.height/2 + redCrossSize/2, redCrossSize, self.questionBlock.redCrossManipulator);

                svg.addEvent(redCross,'click',redCrossClickHandler);
                self.questionBlock.redCrossManipulator.ordonator.set(1,redCross);
            };
        } else {
            self.questionBlock.title = displayText(text, self.w - 2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.linkedQuestion.fontSize, self.linkedQuestion.font, self.questionManipulator);
        }
        var fontSize = Math.min(20, self.h*0.1);
        self.questNum = new svg.Text(self.linkedQuestion.questionNum).position(-self.w/2+2*MARGIN+(fontSize*(self.linkedQuestion.questionNum.toString.length)/2), -self.h*0.25/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
        self.questionManipulator.ordonator.set(4, self.questNum);
        self.questionBlock.title.content.color(color);
        self.questionBlock.title.content._acceptDrop = true;
        self.linkedQuestion.questionNameValidInput ? self.questionBlock.title.cadre.color(self.linkedQuestion.bgColor, 1, self.linkedQuestion.colorBordure) :
            self.questionBlock.title.cadre.color(self.linkedQuestion.bgColor, 2, myColors.red);
        self.questionBlock.title.cadre._acceptDrop = true;
        svg.addEvent(self.questionBlock.title.content, "dblclick", dblclickEditionQuestionBlock);
        svg.addEvent(self.questionBlock.title.cadre, "dblclick", dblclickEditionQuestionBlock);
        self.questionManipulator.translator.move(0, -self.h/2+self.questionBlock.title.cadre.height/2 + self.toggleButtonHeight + MARGIN);
        self.manipulator.translator.move(w/2, y + h/2);
    };

    var dblclickEditionQuestionBlock = function () {
        var globalPointCenter = self.questionBlock.title.content.globalPoint(-(self.w)/2, -((self.linkedQuestion.image) ? svg.runtime.boundingRect(self.questionBlock.title.content.component).height : ((self.h * .25)/2))/2);
        var contentareaStyle = {
            height: (self.linkedQuestion.image) ? svg.runtime.boundingRect(self.questionBlock.title.content.component).height : ((self.h * .25)/2),
            toppx: globalPointCenter.y,
            leftpx: (globalPointCenter.x+1/12*self.w),
            width: (self.w*5/6)
        };
        self.questionBlock.title.content.message("");
        drawing.notInTextArea = false;
        var textarea = new svg.TextArea(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height)
            .color(myColors.white, 0, myColors.black)
            .message(self.linkedQuestion.label)
            .font("Arial", 20);
        drawings.screen.add(textarea);
        textarea.focus();

        var onblur = function () {
            textarea.enter();
            self.linkedQuestion.label = textarea.messageText || '';
            if(textarea.messageText){
                self.label = textarea.messageText;
                self.linkedQuestion.label=textarea.messageText;
            }
            drawings.screen.remove(textarea);
            drawing.notInTextArea = true;
            showTitle();
            self.parent.displayQuestionsPuzzle(null, null, null, null, self.parent.questionPuzzle.indexOfFirstVisibleElement);
        };

        var removeErrorMessage = function () {
            self.linkedQuestion.questionNameValidInput = true;
            self.errorMessage && self.questionCreatorManipulator.ordonator.unset(0);
            self.questionBlock.title.cadre.color(myColors.white, 1, myColors.black);
        };

        var displayErrorMessage = function () {
            removeErrorMessage();
            self.questionBlock.title.cadre.color(myColors.white, 2, myColors.red);
            var anchor = 'middle';
            var quizzInfoHeightRatio = 0.05;
            var questionsPuzzleHeightRatio = 0.25;
            self.errorMessage = new svg.Text(REGEX_ERROR);
            self.questionCreatorManipulator.ordonator.set(0, self.errorMessage);
            self.errorMessage.position(0,-self.h/2 + self.toggleButtonHeight+ self.questionBlock.title.cadre.height+svg.runtime.boundingRect(self.errorMessage.component).height+MARGIN)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            textarea.focus();
            self.linkedQuestion.questionNameValidInput = false;
        };

        var oninput = function () {
            textarea.enter();
            self.parent.checkInputTextArea({
                textarea: textarea,
                border: self.questionBlock.title.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        svg.runtime.addEvent(textarea.component, "blur", onblur);
        svg.runtime.addEvent(textarea.component, "input", oninput);
    };

    (typeof x !== "undefined") && (self.x = x);
    (typeof y !== "undefined")  && (self.y = y);
    (typeof w !== "undefined")  && (self.w = w);
    (typeof h !== "undefined")  && (self.h = h);
    showTitle();
    var height = self.h - self.toggleButtonHeight - self.questionBlock.title.cadre.height - 3*MARGIN;
    self.coordinatesAnswers = {
        x: 0,
        y: (self.h-height)/2 -MARGIN, //self.y + 3 * MARGIN ,
        w: self.w - 2 * MARGIN,
        h: height
    };
    // bloc Answers
    if (self.linkedQuestion.tabAnswer.length < self.MAX_ANSWERS && !(self.linkedQuestion.tabAnswer[self.linkedQuestion.tabAnswer.length-1] instanceof AddEmptyElement)) {
        self.linkedQuestion.tabAnswer.push(new AddEmptyElement(self, 'answer'));
    }
    self.puzzle.updateElementsArray(self.linkedQuestion.tabAnswer);
    self.questionCreatorManipulator.last.children.indexOf(self.puzzle.manipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.puzzle.manipulator.first);
    self.puzzle && self.puzzle.fillVisibleElementsArray("leftToRight");

    self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h , false);
    if (self.explanation){
        self.explanation.display(self, self.previousX, self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h);
    }
}

function popInDisplay(parent, previousX, x, y, w, h) {
    let rect = new svg.Rect(w+2, h); //+2 border
    rect._acceptDrop = this.editable;
    rect.color(myColors.white, 1, myColors.black);
    this.manipulator.ordonator.set(0, rect);
    parent.manipulator.last.children.indexOf(this.manipulator.first) === -1 && parent.manipulator.last.add(this.manipulator.first);
    this.manipulator.translator.move(previousX, y);
    let blackCrossSize = 30, blackCross;
    let answerText = "Réponse : ";
    this.answer.label && (answerText+= this.answer.label);
    !this.answer.label && this.answer.image && (answerText+= this.answer.image.src);
    this.answerTextSVG = autoAdjustText(answerText, w, blackCrossSize, 20, null, this.manipulator, 1).text;
    this.answerTextSVG.position(0, -h / 2 + blackCrossSize);
    blackCross = blackCross || drawRedCross(w / 2 - blackCrossSize, -h / 2 + blackCrossSize, blackCrossSize, this.blackCrossManipulator);
    blackCross.color(myColors.black, 1, myColors.black);
    this.blackCrossManipulator.ordonator.set(0, blackCross);
    let blackCrossHandler = event=> {
        blackCross = null ;
        this.editable && (parent.explanation = false);
        let target = drawings.background.getTarget(event.clientX, event.clientY);
        parent.manipulator.last.remove(target.parent.parentManip.parentObject.manipulator.first);
        this.editable && parent.puzzle.display(x, y, w, h,false);
    };
    svg.addEvent(blackCross, "click", blackCrossHandler);
    drawing.notInTextArea = true;
    svg.runtime.addGlobalEvent("keydown", (event) => {
        if(drawing.notInTextArea && hasKeyDownEvent(event)) {
            event.preventDefault();
        }
    });
    var hasKeyDownEvent = (event)=> {
        this.target = this.panel;
        if (blackCross && event.keyCode===27) { // suppr
            this.editable && (parent.explanation = false);
            blackCross = null ;
            parent.manipulator.last.remove(this.manipulator.first);
            this.editable && parent.puzzle.display(x, y, w, h, false);
            drawing.mousedOverTarget = false;
        }
        return this.target && this.target.processKeys && this.target.processKeys(event.keyCode);
    };
    let panelWidth = 2*w/3,
    panelHeight = 2*h/3;
    this.panelManipulator.translator.move(w/8, 0);
    if (this.image){
        this.imageLayer = 3;
        let picture = new Picture(this.image, this.editable, this);
        let imageSize = Math.min(w/4, panelHeight);
        picture.draw(-w/2 + imageSize/4 + w/12, 0, imageSize, imageSize);
        this.answer.filled = true;
    }
    else if (this.editable){
        let draganddropTextSVG = autoAdjustText(this.draganddropText, w/6, h / 3, 20, null, this.manipulator, 3).text;
        draganddropTextSVG.position(-w/2 + w/12 + MARGIN, 0).color(myColors.grey);
        draganddropTextSVG._acceptDrop = this.editable;
       this.label ? this.answer.filled = true : this.answer.filled = false;
    }
    else {
        panelWidth = w - 2*MARGIN;
        panelHeight = h - blackCrossSize - 3*MARGIN;
        this.panelManipulator.translator.move(0, blackCrossSize/2+MARGIN/2);
    }
    if(typeof this.panel === "undefined"){
        this.panel = new gui.Panel(panelWidth, panelHeight, myColors.white);
        this.panel.border.color([], 1, [0, 0, 0]);
    }
    else {
        this.panel.resize(panelWidth, panelHeight);
    }
    this.panelManipulator.last.children.indexOf(this.panel.component) === -1 && this.panelManipulator.last.add(this.panel.component);
    this.panel.content.children.indexOf(this.textManipulator.first) === -1 && this.panel.content.add(this.textManipulator.first);
    this.panel.vHandle.handle.color(myColors.lightgrey,3,myColors.grey);
    this.textToDisplay = this.label ? this.label : (this.defaultLabel ? this.defaultLabel : "");
    this.text = autoAdjustText(this.textToDisplay, panelWidth, drawing.height, null, null, this.textManipulator,0).text;
    this.text.position(panelWidth/2,svg.runtime.boundingRect(this.text.component).height);
    this.panel.resizeContent(svg.runtime.boundingRect(this.text.component).height + MARGIN);
    let clickEdition = event => {
        let contentArea = {};
        contentArea.y = panelHeight-svg.runtime.boundingRect(this.answerTextSVG.component).height;
        contentArea.x = panelWidth/2;
        contentArea.globalPointCenter = this.panel.border.globalPoint(-contentArea.x,-contentArea.y/2-MARGIN);
        drawing.notInTextArea = false;
        contentArea = new svg.TextArea(contentArea.globalPointCenter.x, contentArea.globalPointCenter.y,panelWidth-MARGIN,panelHeight-MARGIN);
        contentArea.color(null, 0, myColors.black).font("Arial",20);
        (this.textToDisplay === "" || this.textToDisplay === this.defaultLabel) && contentArea.placeHolder(this.labelDefault);
        contentArea.message(this.label || "");
        this.textManipulator.ordonator.unset(0);
        contentArea.scroll(svg.TextArea.SCROLL);
        this.panel.vHandle.handle.color(myColors.none,3,myColors.none);
        drawings.screen.add(contentArea);
        contentArea.focus();
        let onblur = ()=> {
            contentArea.enter();
            this.label = contentArea.messageText;
            drawings.screen.remove(contentArea);
            drawing.notInTextArea = true;
            this.display(parent, previousX, x, y, w, h);
        };
        svg.addEvent(contentArea,'input',()=> {
            contentArea.enter();
        });
        svg.addEvent(contentArea,'blur',onblur);
    };
    if (this.editable){
        svg.addEvent(this.text, "click", clickEdition);
        svg.addEvent(this.panel.back, "click", clickEdition);
    }
}

function quizzDisplay(x, y, w, h) {
    var self = this;
    drawing.currentPageDisplayed = "Quizz";
    header.display(this.parentFormation.label + " - " + this.title);
    mainManipulator.ordonator.set(1, self.quizzManipulator.first);

    function setSizes() {
        self.x = x || self.x || 0;
        if (x===0)self.x = 0;
        self.y = y || self.y || 0;
        w && (self.questionArea.w = w);
        (w && x) && (self.resultArea.w = w );
        x && (self.resultArea.x = x);
        w && (self.titleArea.w = w);
        x && (self.quizzMarginX = x);
        self.headerPercentage = HEADER_SIZE;
        self.questionPercentageWithImage = 0.3;
        self.questionPercentage = 0.2;
        self.answerPercentageWithImage = 0.6;
        self.answerPercentage = 0.7;
    }
    function setPreviewSizes() {
        self.x = x+w*0.15 || self.x || 0;
        self.y = y || self.y || 0;
        w && (self.questionArea.w = w*0.7);
        (w && x) && (self.resultArea.w = w*0.85);
        x && (self.resultArea.x = x+w*0.15);
        w && (self.titleArea.w = w*0.85);
        x && (self.quizzMarginX = x+w*0.15);
        self.headerPercentage = HEADER_SIZE;
        self.questionPercentageWithImage = 0.3;
        self.questionPercentage = 0.2;
        self.answerPercentageWithImage = 0.6;
        self.answerPercentage = 0.7;
    }
    this.previewMode ? setPreviewSizes() : setSizes();

    let heightPage = drawing.height;
    self.headerHeight = heightPage * self.headerPercentage;
    self.questionHeight = heightPage * self.questionPercentage - MARGIN;
    self.answerHeight = heightPage * self.answerPercentage - MARGIN;
    self.questionHeightWithoutImage = heightPage * self.questionPercentage - MARGIN;
    self.answerHeightWithoutImage = heightPage * self.answerPercentage - MARGIN;
    self.questionHeightWithImage = heightPage * self.questionPercentageWithImage - MARGIN;
    self.answerHeightWithImage = heightPage * self.answerPercentageWithImage - MARGIN;

    self.quizzManipulator.translator.move(self.questionArea.w/2, self.headerHeight);

    self.returnButton.display(MARGIN-w*0.5+self.x, self.headerHeight/2, 20, 20);
    if (self.previewMode) {
        if (playerMode){
            self.returnButton.setHandler((event) => {
                let target = drawings.background.getTarget(event.clientX, event.clientY);
                target.parentObj.parent.previewMode = false;
                target.parentObj.parent.currentQuestionIndex = self.tabQuestions.length;
                target.parentObj.parent.quizzManipulator.flush();
                target.parentObj.parent.puzzleLines = 3;
                target.parentObj.parent.puzzleRows = 3;
                target.parentObj.parent.returnButton.label = "Retour à la formation";
                target.parentObj.parent.display(0, 0, drawing.width, drawing.height);
            });
        }
        else {
            self.returnButton.setHandler((event) => {
                let target = drawings.background.getTarget(event.clientX, event.clientY);
                target.parentObj.parent.quizzManipulator.flush();
                target.parentObj.parent.parentFormation.quizzManager.loadQuizz(target.parentObj.parent, target.parentObj.parent.currentQuestionIndex);
                target.parentObj.parent.parentFormation.quizzManager.display();
            });
        }
    }
    else {
        self.returnButton.setHandler((event) => {
                let target = drawings.background.getTarget(event.clientX,event.clientY);
                target.parentObj.parent.quizzManipulator.flush();
                target.parentObj.parent.parentFormation.displayFormation();
            });
    }
    if(self.currentQuestionIndex===-1){// on passe à la première question
        self.nextQuestion();
    }
    else if (self.currentQuestionIndex < self.tabQuestions.length){
        self.displayCurrentQuestion();
    }
    else {
        let questionsWithBadAnswersTab = [];
        self.questionsWithBadAnswers.forEach(x => questionsWithBadAnswersTab.push(x.question));
        self.puzzle = new Puzzle(self.puzzleLines, self.puzzleRows, questionsWithBadAnswersTab, "upToDown", self);
        self.displayResult();
    }

    if(this.previewMode) {
        this.leftChevron = new Chevron(x-w*0.3, y+h*0.45, w*0.1, h*0.15, this.leftChevronManipulator, "left");
        this.rightChevron = new Chevron(x+w*0.6, y+h*0.45, w*0.1, h*0.15, this.rightChevronManipulator, "right");
        this.leftChevron.parentObj = this;
        this.rightChevron.parentObj = this;
        let updateColorChevrons = (quiz) => {
            quiz.rightChevron.color(quiz.currentQuestionIndex === quiz.tabQuestions.length-1 ? myColors.grey : myColors.black);
            quiz.leftChevron.color(quiz.currentQuestionIndex === 0 ? myColors.grey : myColors.black);
        };

        let leftChevronHandler = (event) => {
            let target = drawings.background.getTarget(event.clientX,event.clientY);
            if(target.parentObj.currentQuestionIndex > 0) {
                target.parentObj.quizzManipulator.last.remove(target.parentObj.tabQuestions[target.parentObj.currentQuestionIndex].manipulator.first);
                target.parentObj.currentQuestionIndex--;
                updateColorChevrons(target.parentObj);
                target.parentObj.displayCurrentQuestion();
            }
        };
        let rightChevronHandler = (event) => {
            let target = drawings.background.getTarget(event.clientX,event.clientY);
            if(target.parentObj.currentQuestionIndex < target.parentObj.tabQuestions.length-1) {
                target.parentObj.quizzManipulator.last.remove(target.parentObj.tabQuestions[target.parentObj.currentQuestionIndex].manipulator.first);
                target.parentObj.currentQuestionIndex++;
                updateColorChevrons(target.parentObj);
                target.parentObj.displayCurrentQuestion();
            }
        };
        updateColorChevrons(this);
        svg.addEvent(this.leftChevron, "click", leftChevronHandler);
        svg.addEvent(this.rightChevron, "click", rightChevronHandler);
    }
}

function quizzDisplayResult (color){
    this.questionsWithBadAnswers.forEach(x=>{
        x.question.manipulator.ordonator.unset(3)});
    this.displayScore(color);
    this.puzzle && this.puzzle.fillVisibleElementsArray("upToDown");
    this.puzzle.display(0, this.questionHeight/2 + this.answerHeight/2 + MARGIN, drawing.width - MARGIN, this.answerHeight);
}

function gameDisplayMiniature(size){
    return new MiniatureGame(this, size);
}

function bdDisplay(bd){
    mainManipulator.ordonator.unset(1);
    var header = new Header(bd.title);
    header.display(bd.title);
    (mainManipulator.last.children.indexOf(bd.manipulator.first) === -1) && mainManipulator.last.add(bd.manipulator.first);
    bd.returnButton.display(0, drawing.height*header.size + 2*MARGIN, 20, 20);
    bd.returnButton.setHandler(self.previewMode ? (event) => {
        let target = drawings.background.getTarget(event.clientX,event.clientY);
        target.parentObj.parent.manipulator.flush();
        target.parentObj.parent.parentFormation.quizzManager.loadQuizz(target.parentObj.parent, target.parentObj.parent.currentQuestionIndex);
        target.parentObj.parent.parentFormation.quizzManager.display();
    } : (event) => {
        let target = drawings.background.getTarget(event.clientX,event.clientY);
        target.parentObj.parent.manipulator.flush();
        target.parentObj.parent.parentFormation.displayFormation();
    });
}

function quizzDisplayScore(color){
    let autoColor;
    switch(this.score) {
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
    var str1,str2;

    this.finalMessage = `${str1} Vous avez répondu à ${this.tabQuestions.length} questions, ${str2}`;
    if(!color) {
        var usedColor = autoColor;
    } else {
        usedColor = color;
    }

    this.resultManipulator && (this.quizzManipulator.last.children.indexOf(this.resultManipulator.first) !== -1) && this.quizzManipulator.last.remove(this.resultManipulator.first);

    this.resultManipulator = new Manipulator(this);
    this.scoreManipulator = new Manipulator(this);
    this.scoreManipulator.addOrdonator(2);
    this.resultManipulator.translator.move(0, this.questionHeight/2 + this.headerHeight/2 + 2*MARGIN);
    this.resultManipulator.last.add(this.scoreManipulator.first);
    this.resultManipulator.last.add(this.puzzle.manipulator.first);
    this.quizzManipulator.last.add(this.resultManipulator.first);
    displayText(this.finalMessage, this.titleArea.w-2*MARGIN, this.questionHeight, myColors.black, usedColor, this.fontSize, this.font, this.scoreManipulator);
}

function quizzManagerDisplay(){
    let verticalPosition = drawing.height * HEADER_SIZE;
    this.height = drawing.height - drawing.height * HEADER_SIZE;
    this.quizzManagerManipulator.first.move(0, verticalPosition);
    this.quizzManagerManipulator.last.children.indexOf(this.libraryIManipulator.first)===-1 && this.quizzManagerManipulator.last.add(this.libraryIManipulator.first);
    this.quizzManagerManipulator.last.children.indexOf(this.quizzInfoManipulator.first)===-1 && this.quizzManagerManipulator.last.add(this.quizzInfoManipulator.first);
    this.quizzManagerManipulator.last.children.indexOf(this.questionsPuzzleManipulator.first)===-1 && this.quizzManagerManipulator.last.add(this.questionsPuzzleManipulator.first);
    this.quizzManagerManipulator.last.children.indexOf(this.questionCreatorManipulator.first)===-1 && this.quizzManagerManipulator.last.add(this.questionCreatorManipulator.first);
    this.quizzManagerManipulator.last.children.indexOf(this.previewButtonManipulator.first)===-1 && this.quizzManagerManipulator.last.add(this.previewButtonManipulator.first);
    this.quizzManagerManipulator.last.children.indexOf(this.saveQuizButtonManipulator.first)===-1 && this.quizzManagerManipulator.last.add(this.saveQuizButtonManipulator.first);
    this.libraryWidth = drawing.width * this.libraryWidthRatio;
    this.questCreaWidth = drawing.width * this.questCreaWidthRatio;
    this.quizzInfoHeight = this.height * this.quizzInfoHeightRatio;
    this.questionsPuzzleHeight = this.height * this.questionsPuzzleHeightRatio;
    this.libraryHeight = this.height * this.libraryHeightRatio;
    this.questCreaHeight = this.height * this.questCreaHeightRatio;
    this.saveButtonHeight = this.height * this.saveButtonHeightRatio;
    this.previewButtonHeight = this.height * this.previewButtonHeightRatio;
    this.ButtonWidth = 150;
    this.globalMargin = {
        height: this.marginRatio * this.height*2,
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
        if(typeof event.clientX == "undefined" || typeof event.clientY == "undefined"){
            question = event.question;
        }
        else{
            var target = drawings.background.getTarget(event.clientX,event.clientY);
            question = target.parent.parentManip.parentObject;
        }
        this.quizz.tabQuestions[this.indexOfEditedQuestion] && this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator && this.quizz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator.flush();
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
        this.displayQuizzInfo(this.globalMargin.width/2, this.quizzInfoHeight/2, drawing.width,this.quizzInfoHeight);
        this.displayQuestionsPuzzle(this.questionPuzzleCoordinates.x, this.questionPuzzleCoordinates.y, this.questionPuzzleCoordinates.w, this.questionPuzzleCoordinates.h);
        this.questionCreator.display(this.library.x + this.libraryWidth, this.library.y,
            this.questCreaWidth-this.globalMargin.width, this.questCreaHeight);
        this.displayPreviewButton(drawing.width/2-this.ButtonWidth, this.height - this.previewButtonHeight/2,
            this.ButtonWidth, this.previewButtonHeight-this.globalMargin.height);
        this.displayQuizSaveButton(drawing.width/2+this.ButtonWidth, this.height - this.saveButtonHeight/2,
            this.ButtonWidth, this.saveButtonHeight-this.globalMargin.height);
        mainManipulator.ordonator.unset(0);
        header.display("Formation : " + this.parentFormation.label);
    };

    this.library.display(this.globalMargin.width/2, this.quizzInfoHeight + this.questionsPuzzleHeight + this.globalMargin.height/2,
        this.libraryWidth-this.globalMargin.width/2, this.libraryHeight, () => {
            displayFunctions();
        });
}

function quizzManagerDisplayQuizzInfo (x, y, w, h) {
    var self = this;
    self.quizzInfoManipulator.last.children.indexOf(self.returnButtonManipulator.first)===-1 && self.quizzInfoManipulator.last.add(self.returnButtonManipulator.first);

    var returnHandler = function(event){
        var target = drawings.background.getTarget(event.clientX,event.clientY);
        target.parentObj.parent.quizzNameValidInput = true;
        target.parentObj.parent.quizzManagerManipulator.flush();
        target.parentObj.parent.quizzDisplayed = false;
        target.parentObj.parent.parentFormation.displayFormation()
    };

    self.returnButton.display(-2*MARGIN, 0, 20, 20);
    self.returnButton.setHandler(returnHandler);

    var showTitle = function () {
        var text = (self.quizzName) ? self.quizzName : self.quizzNameDefault;
        var color = (self.quizzName) ? myColors.black : myColors.grey;
        var bgcolor = myColors.lightgrey;

        self.quizzLabel = {};
        var width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBoundingClientRect().width;
        self.quizzLabel.content = autoAdjustText(text, w, h/2, 15, "Arial", self.quizzInfoManipulator).text;
        self.quizzNameHeight = svg.runtime.boundingRect(self.quizzLabel.content.component).height;

        self.quizzLabel.cadre = new svg.Rect(width, 0.5*h);
        self.quizzNameValidInput ? self.quizzLabel.cadre.color(bgcolor) : self.quizzLabel.cadre.color(bgcolor, 2, myColors.red);
        self.quizzLabel.cadre.position(width/2, h/2 + self.quizzLabel.cadre.height/2);
        self.quizzInfoManipulator.ordonator.set(0, self.quizzLabel.cadre);
        self.quizzLabel.content.position(0, h/2 +self.quizzLabel.cadre.height*9/12).color(color).anchor("start");
        self.quizzInfoManipulator.first.move(x, y);
        svg.addEvent(self.quizzLabel.content, "dblclick", dblclickEditionQuizz);
        svg.addEvent(self.quizzLabel.cadre, "dblclick", dblclickEditionQuizz);
    };

    var dblclickEditionQuizz = function () {
        let bounds = svg.runtime.boundingRect(self.quizzLabel.content.component);
        let globalPointCenter = self.quizzLabel.content.globalPoint(0, -bounds.height +3);
        self.quizzInfoManipulator.ordonator.unset(1);
        let contentareaStyle = {
            leftpx: globalPointCenter.x,
            toppx: globalPointCenter.y,
            width: 700,
            height:(self.quizzNameHeight+3)-MARGIN/2
        };
        drawing.notInTextArea = false;
        let textarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
        textarea.color([], 0, myColors.black)
            .message(self.quizzName)
            .font("Arial", 15)
            .anchor("start");
        (self.quizzNameDefault || self.quizzName==="") && textarea.placeHolder(self.quizzNameDefault);
        drawings.screen.add(textarea);
        textarea.focus();
        textarea.value = self.quizzName;

        var removeErrorMessage = function () {
            self.questionCreator.quizzNameValidInput = true;
            self.errorMessage && self.quizzInfoManipulator.ordonator.unset(5);
            self.quizzLabel.cadre.color(myColors.lightgrey);
        };

        var displayErrorMessage = function () {
            removeErrorMessage();
            self.quizzLabel.cadre.color(myColors.lightgrey, 2, myColors.red);
            var anchor = 'start';
            self.errorMessage = new svg.Text(REGEX_ERROR);
            self.quizzInfoManipulator.ordonator.set(5, self.errorMessage);
            self.errorMessage.position(self.quizzLabel.cadre.width + MARGIN, bounds.height+3+self.quizzLabel.cadre.height/2+svg.runtime.boundingRect(self.errorMessage.component).height/2)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            textarea.focus();
            //self.quizzNameValidInput = false;
        };
        var onblur = function () {
            textarea.enter();
            self.quizzName = textarea.messageText.trim();
            drawings.screen.remove(textarea);
            drawing.notInTextArea = true;
            showTitle();
        };
        var oninput = function () {
            textarea.enter();
            self.checkInputTextArea({
                textarea: textarea,
                border: self.quizzLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        svg.addEvent(textarea, "input", oninput);
        svg.addEvent(textarea, "blur", onblur);
        self.checkInputTextArea({
            textarea: textarea,
            border: self.quizzLabel.cadre,
            onblur: onblur,
            remove: removeErrorMessage,
            display: displayErrorMessage
        });
    };
    showTitle();
}

function quizzManagerDisplayPreviewButton (x, y, w, h) {
    this.previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, this.previewButtonManipulator);
    this.previewFunction = () => {
        this.toggleButtonHeight = 40;
        this.quizz.isValid = true;
        let message;
        let arrayOfUncorrectQuestions = [];
        this.quizz.tabQuestions.forEach(question => {
            if(!(question instanceof AddEmptyElement)){
                question.questionType.validationTab.forEach((funcEl) => {
                    var result = funcEl(question);
                    if (!result.isValid) {
                        message = result.message;
                        arrayOfUncorrectQuestions.push(question.questionNum-1);
                    }
                    this.quizz.isValid = this.quizz.isValid && result.isValid;
                });
            }
        });
        if(!this.quizz.isValid) {
            this.displayMessage(message, myColors.red);
            //this.selectFirstInvalidQuestion(arrayOfUncorrectQuestions[0]);
        }
        this.displayEditedQuestion = ()=> {
            drawing.currentPageDisplayed = "QuizPreview";
            this.quizzManagerManipulator.flush();
            this.quizz.tabQuestions.pop();
            this.quizz.tabQuestions.forEach((it) => {
                it.tabAnswer.pop();
            });

            this.previewQuiz = new Quizz(this.quizz, true);
            this.previewQuiz.currentQuestionIndex = this.indexOfEditedQuestion;
            this.previewQuiz.run(1, 1, drawing.width, drawing.height);//
        };
        if(this.quizz.isValid) {
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

function quizzManagerDisplayQuestionPuzzle(x, y, w, h, ind) {
    var index = ind ? ind : 0;
    x && (this.qPuzzleX=x);
    y && (this.qPuzzleY=y);
    w && (this.qPuzzleW=w);
    h && (this.qPuzzleH=h);
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
    if (this.questionPuzzle){
        this.questionPuzzle.updateElementsArray(this.quizz.tabQuestions);
        this.questionPuzzle.fillVisibleElementsArray("leftToRight");
    }
    else {
        this.questionPuzzle = new Puzzle(1, 6, this.quizz.tabQuestions, "leftToRight", this);
    }
    this.questionsPuzzleManipulator.last.children.indexOf(this.questionPuzzle.manipulator.first)===-1 && this.questionsPuzzleManipulator.last.add(this.questionPuzzle.manipulator.first);
    this.questionPuzzle.display(this.coordinatesQuestion.x, this.coordinatesQuestion.y, this.qPuzzleW, this.qPuzzleH, true);
    checkPuzzleElementsArrayValidity(this.questionPuzzle.elementsArray);
}

function checkPuzzleElementsArrayValidity(array){
    // array.forEach(question => {
    //     if(!(question instanceof AddEmptyElement)){
    //         var validation = true;
    //         question.questionType.validationTab.forEach((funcEl) => {
    //             var result = funcEl(question);
    //             validation = validation && result.isValid;
    //         });
    //         validation ? question.toggleInvalidQuestionPictogram(false) : question.toggleInvalidQuestionPictogram(true);
    //     }
    // });
}

function inscriptionManagerDisplay() {
    drawing.currentPageDisplayed = "InscriptionManager";
    header.display("Inscription");
    mainManipulator.ordonator.set(1, this.manipulator.first);
    this.manipulator.first.move(drawing.width/2, drawing.height/2);
    var w = drawing.width/5;
    var x = drawing.width/9;
    var trueValue = "";
    let focusedField;

    var clickEditionField = (field, manipulator)=> {
        return ()=> {
            var width = w;
            var height = this.h;
            var globalPointCenter = this[field].cadre.globalPoint(-(width) / 2, -(height) / 2);
            var contentareaStyle = {
                toppx: globalPointCenter.y ,
                leftpx: globalPointCenter.x,
                height: height,
                width: width
            };
            drawing.notInTextArea = false;
            let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
            contentarea.message(this[field].labelSecret || this[field].label);
            contentarea.color(null, 0, myColors.black).
            font("Arial",20);
            this[field].secret ? contentarea.type('password') : contentarea.type("text");
            manipulator.ordonator.unset(1, this[field].content.text);
            drawings.screen.add(contentarea);
            contentarea.focus();
            var displayErrorMessage = (trueManipulator=manipulator)=>{
                emptyAreasHandler();
                if (!(field==="passwordConfirmationField" && trueManipulator.ordonator.children[3].messageText)){
                    var message = autoAdjustText(this[field].errorMessage, drawing.width, this.h, 20, null, trueManipulator, 3);
                    message.text.color(myColors.red).position(this[field].cadre.width/2 + MARGIN, this[field].cadre.height+MARGIN);
                }
            };
            var oninput = ()=>{
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
            var onblur = ()=>{
                if (!alreadyDeleted) {
                    contentarea.enter();
                    if (this[field].secret) {
                        this[field].label = '';
                        this[field].labelSecret = contentarea.messageText;
                        if (contentarea.messageText){
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
    var displayField = (field, manipulator)=>{
        manipulator.translator.move(-drawing.width/10, this[field].line*drawing.height/10);
        var fieldTitle = new svg.Text(this[field].title).position(0,0).font("Arial", 20).anchor("end");
        manipulator.ordonator.set(2, fieldTitle);
        this.h = 1.5*svg.runtime.boundingRect(fieldTitle.component).height;
        var displayText = displayTextWithoutCorners(this[field].label, w, this.h, myColors.black, myColors.white, 20, null, manipulator);
        this[field].content = displayText.content;
        this[field].cadre = displayText.cadre;
        var y = -svg.runtime.boundingRect(fieldTitle.component).height/4;
        this[field].content.position(x,0);
        this[field].cadre.position(x,y);
        var clickEdition = clickEditionField(field, manipulator);
        svg.addEvent(this[field].content, "click", clickEdition);
        svg.addEvent(this[field].cadre, "click", clickEdition);
        var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
        this[field].field = field;
        alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist),1,this[field]) : this.tabForm.push(this[field]);
        this.formLabels[field] = this[field].label;
    };

    var nameCheckInput = (field)=>{
        if (this[field].label){
            this[field].label = this[field].label.trim();
            var regex = /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g;
            return this[field].label.match(regex);
        }
    };

    var nameErrorMessage = "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés";
    this.lastNameField={label: this.formLabels.lastNameField || "", title:this.lastNameLabel, line:-3};
    this.lastNameField.checkInput = () => nameCheckInput("lastNameField");
    this.lastNameField.errorMessage = nameErrorMessage;
    displayField("lastNameField", this.lastNameManipulator);

    this.firstNameField={label: this.formLabels.firstNameField || "", title:this.firstNameLabel, line:-2};
    this.firstNameField.errorMessage = nameErrorMessage;
    this.firstNameField.checkInput = () => nameCheckInput("firstNameField");
    displayField("firstNameField", this.firstNameManipulator);

    this.mailAddressField={label: this.formLabels.mailAddressField || "", title:this.mailAddressLabel, line:-1};
    this.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
    this.mailAddressField.checkInput = ()=>{
        if (this.mailAddressField.label){
            var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            return this.mailAddressField.label=== "" || this.mailAddressField.label.match(regex);
        }
    };
    displayField("mailAddressField", this.mailAddressManipulator);

    var passwordCheckInput = ()=> {
        var passTooShort = this.passwordField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordField.labelSecret.length<6;
        var confTooShort = this.passwordConfirmationField.labelSecret !== "" && this.passwordField.labelSecret && this.passwordConfirmationField.labelSecret.length<6;
        var cleanIfEgality = ()=>{
            if (this.passwordField.labelSecret === this.passwordConfirmationField.labelSecret){
                this.passwordField.cadre.color(myColors.white, 1, myColors.black);
                this.passwordConfirmationField.cadre.color(myColors.white, 1, myColors.black);
            }
        };
        if (passTooShort || confTooShort){
            if (passTooShort){
                this.passwordField.cadre.color(myColors.white, 3, myColors.red);
                var message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                message.text.color(myColors.red).position(this.passwordField.cadre.width/2 + MARGIN, this.passwordField.cadre.height+MARGIN);
            }
            if (confTooShort){
                this.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
                var message = autoAdjustText(this.passwordField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
                message.text.color(myColors.red).position(this.passwordField.cadre.width/2 + MARGIN, this.passwordField.cadre.height+MARGIN);
            }
        }
        else if (this.passwordConfirmationField.labelSecret !== "" && this.passwordConfirmationField.labelSecret!== this.passwordField.labelSecret){
            this.passwordField.cadre.color(myColors.white, 3, myColors.red);
            this.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
            this.passwordConfirmationField.cadre.color(myColors.white, 3, myColors.red);
            var message = autoAdjustText(this.passwordConfirmationField.errorMessage, drawing.width, this.h, 20, null, this.passwordManipulator, 3);
            message.text.color(myColors.red).position(this.passwordField.cadre.width/2 + MARGIN, this.passwordField.cadre.height+MARGIN);
        }
        else if (this.passwordField.labelSecret && this.passwordField.labelSecret.length>=6){
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

    this.passwordField={label: this.formLabels.passwordField || "", labelSecret: (this.tabForm[3] && this.tabForm[3].labelSecret) || "", title:this.passwordLabel, line:0, secret:true, errorMessage: "La confirmation du mot de passe n'est pas valide"};
    this.passwordField.errorMessage = "Le mot de passe doit contenir au minimum 6 caractères";
    this.passwordField.checkInput = passwordCheckInput;
    displayField("passwordField", this.passwordManipulator);

    this.passwordConfirmationField={label: this.formLabels.passwordConfirmationField || "", labelSecret: (this.tabForm[4] && this.tabForm[4].labelSecret) || "", title:this.passwordConfirmationLabel, line:1, secret:true, errorMessage: "La confirmation du mot de passe n'est pas valide"};
    this.passwordConfirmationField.checkInput = passwordCheckInput;
    displayField("passwordConfirmationField", this.passwordConfirmationManipulator);

    var AllOk = ()=>{
        return this.lastNameField.checkInput() &&
            this.firstNameField.checkInput() &&
            this.mailAddressField.checkInput() &&
            this.passwordField.checkInput() &&
            this.passwordConfirmationField.checkInput();
    };

    var emptyAreasHandler = (save)=>{
        var emptyAreas = this.tabForm.filter(field=> field.label === "");
        emptyAreas.forEach(function(emptyArea){
            save && emptyArea.cadre.color(myColors.white, 3, myColors.red);
        });
        if (emptyAreas.length>0 && save){
            var message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - this.saveButton.cadre.height+MARGIN);
        }
        else {
            this.saveButtonManipulator.ordonator.unset(3);
        }
        return (emptyAreas.length>0);
    };

    this.saveButtonHandler = () => {
        if (!emptyAreasHandler(true) && AllOk()){
            Server.getUserByMail(this.mailAddressField.label)
                .then(data => {
                    let myUser = JSON.parse(data).user;
                    if (myUser) {
                        throw "Un utilisateur possède déjà cette adresse mail !"
                    } else {
                        this.passwordField.hash = TwinBcrypt.hashSync(this.passwordField.labelSecret);
                        let tempObject = {
                            lastName: this.lastNameField.label,
                            firstName: this.firstNameField.label,
                            mailAddress: this.mailAddressField.label,
                            password: this.passwordField.hash
                        };
                        return Server.inscription(tempObject)
                    }
                })
                .then(() => {
                    var messageText = "Votre compte a bien été créé !";
                    var message = autoAdjustText(messageText, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                    message.text.color(myColors.green).position(0, - this.saveButton.cadre.height+MARGIN);
                    setTimeout(() => {
                        this.saveButtonManipulator.ordonator.unset(3);
                    }, 10000);
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
            if(index === this.tabForm.length) index = 0;
            if(index === -1) index = this.tabForm.length - 1;
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
    let self = this;
    drawing.currentPageDisplayed = "ConnexionManager";
    header.display("Connexion");

    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.manipulator.first.move(drawing.width/2, drawing.height/2);
    let w = drawing.width/6;
    let x = drawing.width/10;

    let focusedField;

    var clickEditionField = function (field, manipulator) {
        return function () {
            var width = w;
            var height = self.h;
            var globalPointCenter = self[field].cadre.globalPoint(-(width) / 2, -(height) / 2);
            var contentareaStyle = {
                toppx: globalPointCenter.y,
                leftpx: globalPointCenter.x,
                height: height,
                width: self[field].cadre.width
            };
            drawing.notInTextArea = false;
            let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);

            contentarea.message(self[field].labelSecret||self[field].label);
            contentarea.color(null, 0, myColors.black).
            font("Arial",20);
            self[field].secret && contentarea.type('password');
            manipulator.ordonator.unset(1, self[field].content.text);
            drawings.screen.add(contentarea);
            contentarea.focus();

            var alreadyDeleted = false;
            var onblur = function() {
                if (!alreadyDeleted) {
                    contentarea.enter();
                    if (self[field].secret) {
                        self[field].label = '';
                        self[field].labelSecret = contentarea.messageText;
                        if (contentarea.messageText) {
                            for (let i = 0; i < contentarea.messageText.length; i++) {
                                self[field].label += '●';
                            }
                        }
                    } else {
                        self[field].label = contentarea.messageText;
                    }
                    contentarea.messageText && displayField(field, manipulator);
                    manipulator.ordonator.unset(3);
                    drawing.notInTextArea = true;
                    alreadyDeleted || drawings.screen.remove(contentarea);
                    alreadyDeleted = true;
                }
            };
            svg.addEvent(contentarea, "blur", onblur);
            focusedField = self[field];
        };
    };
    var displayField = function(field, manipulator){
        var fieldTitle = new svg.Text(self[field].title).position(0,0);
        fieldTitle.font("Arial", 20).anchor("end");
        manipulator.ordonator.set(2, fieldTitle);
        manipulator.first.move(-drawing.width/10, self[field].line*drawing.height / 10);
        self.h = 1.5 * svg.runtime.boundingRect(fieldTitle.component).height;
        var displayText = displayTextWithoutCorners(self[field].label, w, self.h, myColors.black, myColors.white, 20, null, manipulator);
        self[field].content = displayText.content;
        self[field].cadre = displayText.cadre;
        var y = -svg.runtime.boundingRect(fieldTitle.component).height / 4;
        self[field].content.position(x,0);
        self[field].cadre.position(x,y);
        var clickEdition = clickEditionField(field, manipulator);
        svg.addEvent(self[field].content, "click", clickEdition);
        svg.addEvent(self[field].cadre, "click", clickEdition);
        var alreadyExist = self.tabForm.find(formElement => formElement.field === field);
        self[field].field = field;
        alreadyExist ? self.tabForm.splice(self.tabForm.indexOf(alreadyExist),1, self[field]) : self.tabForm.push(self[field]);
    };

    self.mailAddressField = {label: "", title: self.mailAddressLabel, line: -1};
    self.mailAddressField.errorMessage = "L'adresse email n'est pas valide";
    self.mailAddressField.checkInput = function() {
        let regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        return self.mailAddressField.label=== "" || self.mailAddressField.label.match(regex);
    };
    displayField("mailAddressField", self.mailAddressManipulator);
    self.passwordField = {
        label: '',
        labelSecret: '',
        title: self.passwordLabel,
        line: 0,
        secret: true,
        errorMessage: "La confirmation du mot de passe n'est pas valide"
    };

    displayField('passwordField', self.passwordManipulator);
    self.connexionButton = displayText(self.connexionButtonLabel, self.connexionButtonWidth, self.connexionButtonHeight, myColors.black, myColors.white, 20, null, self.connexionButtonManipulator);
    self.connexionButtonManipulator.first.move(0, 2.5 * drawing.height / 10);
    svg.addEvent(self.connexionButton.content, "click", self.connexionButtonHandler);
    svg.addEvent(self.connexionButton.cadre, "click", self.connexionButtonHandler);

    let nextField = function(backwards = false) {
        let index = self.tabForm.indexOf(focusedField);
        if (index !== -1) {
            backwards ? index-- : index++;
            if(index === self.tabForm.length) index = 0;
            if(index === -1) index = self.tabForm.length - 1;
            clickEditionField(self.tabForm[index].field, self.tabForm[index].cadre.parentManip);
            svg.event(self.tabForm[index].cadre, "click", self.connexionButtonHandler);
        }
    };

    svg.runtime.addGlobalEvent("keydown", function (event) {
        if (event.keyCode === 9) { // TAB
            event.preventDefault();
            nextField(event.shiftKey);
        } else if (event.keyCode === 13) { // Entrée
            event.preventDefault();
            document.activeElement && document.activeElement.blur();
            self.connexionButtonHandler();
        }
    });
}

var AdminGUI = function (){
    domain && domain.Domain();
    playerMode = false;
    Answer.prototype.display = answerDisplay;
    Library.prototype.display = libraryDisplay;
    GamesLibrary.prototype.display = gamesLibraryDisplay;
    ImagesLibrary.prototype.display = imagesLibraryDisplay;
    Header.prototype.display = headerDisplay;
    AddEmptyElement.prototype.display = addEmptyElementDisplay;
    Formation.prototype.displayFormation = formationDisplayFormation;
    Formation.prototype.removeErrorMessage = formationRemoveErrorMessage;
    Formation.prototype.displayFormationSaveButton = formationDisplaySaveButton;
    Formation.prototype.displayFormationPublicationButton = formationDisplayPublicationButton;
    FormationsManager.prototype.display = formationsManagerDisplay;
    Question.prototype.display = questionDisplay;
    Question.prototype.displayAnswers = questionDisplayAnswers;
    Question.prototype.selectedQuestion = questionSelectedQuestion;
    Question.prototype.elementClicked = questionElementClicked;
    QuestionCreator.prototype.display = questionCreatorDisplay;
    QuestionCreator.prototype.displayToggleButton = questionCreatorDisplayToggleButton;
    QuestionCreator.prototype.displayQuestionCreator = questionCreatorDisplayQuestionCreator;
    PopIn.prototype.display = popInDisplay;
    Quizz.prototype.display = quizzDisplay;
    Quizz.prototype.displayResult = quizzDisplayResult;
    Quizz.prototype.displayMiniature = gameDisplayMiniature;
    Bd.prototype.displayMiniature = gameDisplayMiniature;
    Bd.prototype.display = bdDisplay;
    Quizz.prototype.displayScore = quizzDisplayScore;
    QuizzManager.prototype.display = quizzManagerDisplay;
    QuizzManager.prototype.displayQuizzInfo = quizzManagerDisplayQuizzInfo;
    QuizzManager.prototype.displayPreviewButton = quizzManagerDisplayPreviewButton;
    QuizzManager.prototype.displayQuizSaveButton = quizzManagerDisplaySaveButton;
    QuizzManager.prototype.displayQuestionsPuzzle = quizzManagerDisplayQuestionPuzzle;
    ConnexionManager.prototype.display = connexionManagerDisplay;
    header = new Header();
};

var LearningGUI = function (){
    domain && domain.Domain();
    playerMode = true;
    Answer.prototype.display = answerDisplay;
    Library.prototype.display = libraryDisplay;
    Header.prototype.display = headerDisplay;
    Formation.prototype.displayFormation = playerModeDisplayFormation;
    FormationsManager.prototype.display = formationsManagerDisplay;
    Question.prototype.display = questionDisplay;
    Question.prototype.displayAnswers = questionDisplayAnswers;
    Question.prototype.elementClicked = questionElementClicked;
    Question.prototype.selectedQuestion = questionSelectedQuestion;
    PopIn.prototype.display = popInDisplay;
    Quizz.prototype.display = quizzDisplay;
    Quizz.prototype.displayResult = quizzDisplayResult;
    Quizz.prototype.displayMiniature = gameDisplayMiniature;
    Quizz.prototype.displayScore = quizzDisplayScore;
    InscriptionManager.prototype.display = inscriptionManagerDisplay;
    ConnexionManager.prototype.display = connexionManagerDisplay;
    Bd.prototype.displayMiniature = gameDisplayMiniature;
    header = new Header();
};
if (typeof exports !== "undefined") {
    exports.AdminGUI = AdminGUI;
    exports.LearningGUI = LearningGUI;
    exports.setDomain = setDomain;
    exports.setSVG = setSVG;
    exports.setGui = setGui;
    exports.setRuntime = setRuntime;
}