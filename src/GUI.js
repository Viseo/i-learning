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

    if(self.selected){ // image pré-selectionnée
        self.bordure.color(self.bgColor, 5, SELECTION_COLOR);
    }
    self.manipulator.translator.move(self.x,self.y);

    function answerEditableDisplay(x, y, w, h) {
        self.checkboxSize = h * 0.2;
        self.obj = {};
        let imageRedCrossClickHandler=()=>{
            self.redCrossManipulator.flush();
            self.manipulator.ordonator.unset(2);//image
            self.image = null;
            self.imageSrc = null;
            self.display(x, y, w, h);
        };
        let mouseleaveHandler= ()=>{
            self.redCrossManipulator.flush();
        };
        let ImageMouseoverHandler = ()=>{
            if(typeof self.redCrossManipulator === 'undefined'){
                self.redCrossManipulator = new Manipulator(self);
                self.redCrossManipulator.addOrdonator(2);
                self.manipulator && self.manipulator.last.add(self.redCrossManipulator.first);
            }
            let redCrossSize = 15;
            let redCross = drawRedCross(self.obj.image.x + self.obj.image.width/2 - redCrossSize/2 , self.obj.image.y -self.obj.image.height/2 + redCrossSize/2, redCrossSize, self.redCrossManipulator);

            svg.addEvent(redCross,'click',imageRedCrossClickHandler);
            self.redCrossManipulator.ordonator.set(1,redCross);
        };
        let redCrossClickHandler=()=>{
            self.redCrossManipulator.flush();
            let index = self.parentQuestion.tabAnswer.indexOf(self);
            drawing.mousedOverTarget=null;
            self.parentQuestion.tabAnswer.splice(index,1);
            let questionCreator=self.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;

            if(self.parentQuestion.tabAnswer.length<3){
                svg.event(self.parentQuestion.tabAnswer[self.parentQuestion.tabAnswer.length-1].plus,'dblclick',{});
                if(index===0){
                    [self.parentQuestion.tabAnswer[0],self.parentQuestion.tabAnswer[1]]=[self.parentQuestion.tabAnswer[1],self.parentQuestion.tabAnswer[0]];
                }
            }
            questionCreator.display();
        };
        let mouseoverHandler=()=>{
            if(typeof self.redCrossManipulator === 'undefined'){
                self.redCrossManipulator = new Manipulator(self);
                self.redCrossManipulator.addOrdonator(2);
                self.manipulator && self.manipulator.last.add(self.redCrossManipulator.first);
            }
            let redCrossSize = 15;
            let redCross = drawRedCross(self.width/2 , -self.height/2, redCrossSize, self.redCrossManipulator);

            svg.addEvent(redCross,'click',redCrossClickHandler);
            self.redCrossManipulator.ordonator.set(1,redCross);
        };
        let showTitle = function () {
            let text = (self.label) ? self.label : self.labelDefault,
                color = (self.label) ? myColors.black : myColors.grey;

            if(self.image){
                var tempObj = displayImageWithTitle(text, self.image.src, self.image, w, h, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator);
                self.obj.cadre = tempObj.cadre;
                self.obj.image = tempObj.image;
                self.obj.content = tempObj.content;
                svg.addEvent(self.obj.image,'mouseover',ImageMouseoverHandler);
                svg.addEvent(self.obj.image,'mouseout',mouseleaveHandler);
            } else {
                var tempObj = displayText(text, w, h, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator);
                self.obj.cadre = tempObj.cadre;
                self.obj.content = tempObj.content;
                self.obj.content.position((self.checkboxSize/2),self.obj.content.y);
            }

            (self.answerNameValidInput && text !== "") ? (self.obj.cadre.color(myColors.white,1,myColors.black).fillOpacity(0.001)):(self.obj.cadre.color(myColors.white,2,myColors.red).fillOpacity(0.001));
            self.obj.content.color(color);
            self.obj.cadre._acceptDrop = true;
            self.obj.content._acceptDrop = true;

            let editor = (self.editor.puzzle ? self.editor : self.editor.parent);
            //editor.puzzle.manipulator.translator.move(0, editor.toggleButtonHeight-MARGIN);

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
            //contentarea.position(contentarea.globalPointCenter.x, contentarea.globalPointCenter.y);
            //contentarea.dimension(contentarea.width, contentarea.height);
            contentarea.focus();

            let removeErrorMessage = function () {
                self.answerNameValidInput = true;
                self.errorMessage && self.editor.parent.questionCreatorManipulator.ordonator.unset(0);
                self.obj.cadre.color(myColors.white, 1, myColors.black);
            };

            let displayErrorMessage = function () {
                removeErrorMessage();
                self.obj.cadre.color(myColors.white, 2, myColors.red);
                let libraryRatio = 0.2,
                    previewButtonHeightRatio = 0.1,
                    marginErrorMessagePreviewButton = 0.03,
                    //position = (drawing.width - 0.5 * libraryRatio * drawing.width)/2,
                    position = 0.5*libraryRatio * drawing.width + (self.editor.parent.questCreaWidth/2),//-self.editor.parent.globalMargin.width)/2,
                    anchor = 'middle';
                self.errorMessage = new svg.Text(REGEX_ERROR)
                    .position(position,drawing.height * (1 - previewButtonHeightRatio - marginErrorMessagePreviewButton) - 2 * MARGIN)
                    .font('Arial', 15).color(myColors.red).anchor(anchor);
                self.editor.parent.questionCreatorManipulator.ordonator.set(0,self.errorMessage);
                contentarea.focus();
                self.answerNameValidInput = false;
            };

            let onblur = function () {
                contentarea.enter();
                self.label = contentarea.messageText;
                drawings.screen.remove(contentarea);
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
            let popIn = new PopIn(self);
            popIn.diplayPopIn();
            self.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator.explanation = popIn;
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

    self.libraryManipulator.translator.move(self.x, self.y);
}

function gamesLibraryDisplay(x, y, w, h) {
    libraryDisplay.call(this, x, y, w, h);

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

        displayItems();
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
    if(typeof y !== 'undefined' ){
        self.y = y;
    }
    if(typeof w !== 'undefined' ) {
        w && (self.width = w);
    }
    if(typeof h !== 'undefined' ) {
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
                //self.parent.puzzle = new Puzzle(2, 4, self.parent.linkedQuestion.tabAnswer, "leftToRight", self);
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

function formationDisplayMiniature (w, h) {
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
        target.parentObj.parent.formationsManager.display();
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
        self.quizzDisplayed.puzzleLines = 1;
        self.quizzDisplayed.puzzleRows = 3;
        self.quizzDisplayed.run(0,0, drawing.width, drawing.height);
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
        self.panel.resizeContent(widthMAX-1, height);
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
        level.obj = autoAdjustText(levelText, 0, 0, w-3*self.borderSize, self.levelHeight, 20, "Arial", level.manipulator);
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

        svg.runtime.addGlobalEvent("keydown", (event) => {
            if(hasKeyDownEvent(event)) {
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
        self.panel.border.color(myColors.none, 3, myColors.black);
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
        //self.graphBlock = {rect: new svg.Rect(self.levelWidth-self.borderSize, height-self.borderSize).color(myColors.white, self.borderSize, myColors.none)};//.position(w / 2 - self.borderSize, 0 + h / 2)};
        self.messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", 0, 0, self.graphW, self.graphH, 20, null, self.messageDragDropManipulator).text;
        self.messageDragDrop._acceptDrop = true;
        self.messageDragDrop.x = self.panel.width/2;
        self.messageDragDrop.y = self.messageDragDropMargin + (self.levelsTab.length) * self.levelHeight;
        self.messageDragDrop.position(self.messageDragDrop.x, self.messageDragDrop.y).color(myColors.grey);//.fontStyle("italic");
        //self.graphBlock.rect._acceptDrop = true;

        self.panel.back._acceptDrop = true;
    };

    this.displayGraph = (w, h) => {
        this.movePanelContent();
        resizePanel();
        if (typeof w !== "undefined") self.graphW = w;
        if (typeof h !== "undefined") self.graphH = h;
        self.messageDragDropMargin = self.graphCreaHeight/8-self.borderSize;
        //var height = (self.levelHeight*(self.levelsTab.length+1) > self.graphH) ? (self.levelHeight*(self.levelsTab.length+1)) : self.graphH;
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
                let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
                var clickBdHandler = function(event){
                    let targetBd = drawings.background.getTarget(event.clientX, event.clientY).parent.parentManip.parentObject;
                    bdDisplay(targetBd);
                };
                tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.cadre, "click", clickBdHandler);
                tabElement.status !== "notAvailable" && svg.addEvent(tabElement.miniature.icon.content, "click", clickBdHandler);
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
        self.graphCreaHeightRatio = 1;
        self.graphCreaHeight = (drawing.height - 40 - header.height - self.returnButton.height) * self.graphCreaHeightRatio;//-15-self.saveButtonHeight;//15: Height Message Error
        self.graphCreaWidth = drawing.width  - 2 *  MARGIN;
        displayFrame(self.graphCreaWidth, self.graphCreaHeight);
        self.displayGraph(self.graphCreaWidth, self.graphCreaHeight);
        self.clippingManipulator.translator.move((drawing.width - self.graphCreaWidth)/2, (drawing.height - header.height - self.returnButton.height - self.graphCreaHeight)/2);
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
            let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
            contentarea.color(myColors.lightgrey, 0, myColors.black)
                .font("Arial", 15)
                .anchor("start");
            (self.label==="" || self.label===self.labelDefault) ? contentarea.placeHolder(self.labelDefault) : contentarea.message(self.label)

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
                self.label = contentarea.messageText;
                //self.formationNameValidInput && (
                drawings.screen.remove(contentarea);
                showTitle();
                header.display(self.label);
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
            self.formationLabel.content = autoAdjustText(text, 0, 0, self.formationLabelWidth, 20, 15, "Arial", self.formationInfoManipulator).text;
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
            // self.formationCreator = formationValidation;
        };
        showTitle();
        self.library.display(0,drawing.height*HEADER_SIZE,self.libraryWidth, self.graphCreaHeight);
        self.displayFormationSaveButton(drawing.width/2, drawing.height*0.87 ,self.ButtonWidth, self.saveButtonHeight);
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

function formationsManagerDisplay() {
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
        self.headerHeightFormation = drawing.height * header.size ;
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
        // self.title = new svg.Text("Formations").position(MARGIN, 0).font("Arial", 20).anchor("start");
        // self.headerManipulator.ordonator.set(0, self.title);
        self.headerManipulator.translator.move(0,2*MARGIN);
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
            //if(playerMode && formation.status.toString() === statusEnum.NotPublished.toString()) return;

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
        self.panel.resizeContent(totalLines*(self.spaceBetweenElements.height+self.tileHeight)+self.spaceBetweenElements.height-MARGIN);
    };
    (self.tileHeight > 0) && self.displayFormations();
}

function headerDisplay (message) {
    this.width = drawing.width;
    this.height = this.size * drawing.height;

    let manip = this.manipulator,
        userManip = this.userManipulator,
        text = new svg.Text(this.label).position(MARGIN, this.height * 0.75).font('Arial', 20).anchor('start'),
        line = new svg.Line(0, this.height, this.width, this.height).color(myColors.black, 3, myColors.black);
    manip.ordonator.set(1, text);
    manip.ordonator.set(0, line);
    mainManipulator.ordonator.set(0, manip.first);

    let displayUser = () => {
        let svgwidth = x => svg.runtime.boundingRect(x.component).width;
        let pos = 0,
            deconnexion = displayText("Déconnexion", this.width*0.15, 50, myColors.none, myColors.none, 20, null, userManip, 4, 5),
            deconnexionWidth = svgwidth(deconnexion.content),
            ratio = 0.65,
            body = new svg.CurvedShield(35*ratio, 30*ratio, 0.5).color(myColors.black),
            head = new svg.Circle(12*ratio).color(myColors.black, 2, myColors.white),
            userText = autoAdjustText(drawing.username, 0, 0, this.width * 0.23, 50, 20, null, userManip, 3);

        pos-= deconnexionWidth / 2;
        deconnexion.content.position(pos, 0);
        deconnexion.cadre.position(pos, -30/2);
        pos-= deconnexionWidth / 2 + 40;
        userText.text.anchor('end');
        userText.text.position(pos, 0);
        pos-= userText.finalWidth;
        userManip.ordonator.set(0, body);
        userManip.ordonator.set(1, head);

        pos-= svgwidth(body)/2 + MARGIN;
        body.position(pos, -5*ratio);
        head.position(pos, -20*ratio);
        userManip.translator.move(this.width, this.height * 0.75);

        let deconnexionHandler = function() {
            document.cookie = "token=; path=/; max-age=0;";
            drawing.username = null;
            userManip.flush();
            main();
        };
        svg.addEvent(deconnexion.content, "click", deconnexionHandler);
        svg.addEvent(deconnexion.cadre, "click", deconnexionHandler);
    };

    if (message) {
        let messageText = autoAdjustText(message, 0, 0, this.width * 0.3, 50, 32, 'Arial', manip, 2);
        messageText.text.position(this.width/2, this.height/2 + MARGIN);
        //manip.ordonator.set(2, messageText);
    } else {
        manip.ordonator.unset(2);
    }

    manip.last.children.indexOf(userManip.first)===-1 && manip.last.add(userManip.first);
    drawing.username && displayUser();
    if (message === "Inscription" || message === "Connexion"){
        var link;
        message === "Inscription" ? (link = "Connexion") : (link = "Inscription");
        var clickHandler = function(){
            (link === "Inscription") ? inscriptionManager.display() : connexionManager.display();
        };
        let special = displayText(link, 220, 40, myColors.none, myColors.none, 25, 'Arial', userManip, 4, 5);
        special.content.anchor("end");
        userManip.translator.move(this.width, this.height * 0.5);
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
        let obj = displayImageWithTitle(self.label, self.imageSrc, {width:self.image.width, height:self.image.height}, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font, self.manipulator, self.raphImage);
        self.bordure = obj.cadre;
        self.content = obj.content;
        self.raphImage = obj.image;
    }
    // Question avec Texte uniquement
    else if (typeof self.label !== "undefined" && !self.imageSrc) {
        var object = displayText(self.label, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font,self.manipulator);
        self.bordure = object.cadre;
        self.content = object.content;
    }
    // Question avec Image uniquement
    else if (self.imageSrc && !self.label) {
        self.raphImage = displayImage(self.imageSrc, {width:self.image.width,height:self.image.height}, self.width, self.height).image;
        self.manipulator.ordonator.set(2, self.raphImage);
    }
    else {
        self.bordure = new svg.Rect( self.width, self.height).color(self.bgColor,1,self.colorBordure);
        self.manipulator.ordonator.set(0, self.bordure);
    }
    self.bordure && svg.addEvent(self.bordure, "click", self.parentQuizz.parentFormation.quizzManager.questionClickHandler);
    self.content && svg.addEvent(self.content, "click", self.parentQuizz.parentFormation.quizzManager.questionClickHandler);
    self.raphImage && svg.addEvent(self.raphImage, "click", self.parentQuizz.parentFormation.quizzManager.questionClickHandler);
    var fontSize = Math.min(20, self.height*0.1);
    self.questNum = new svg.Text(self.questionNum).position(-self.width/2+MARGIN+(fontSize*(self.questionNum.toString.length)/2), -self.height/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
    self.manipulator.ordonator.set(4, self.questNum);
    self.manipulator.translator.move(self.x,self.y);
    self.selected && self.selectedQuestion();
}

function questionElementClicked(sourceElement) {
    var self = this;
    if(self.multipleChoice === false){// question normale, une seule réponse possible
        if(sourceElement.correct) {
            self.parentQuizz.score++;
            console.log("Bonne réponse!\n");
        } else {
            self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.parentFormation.levelsTab[self.parentQuizz.levelIndex].gamesTab[self.parentQuizz.gameIndex].tabQuestions[self.parentQuizz.currentQuestionIndex]);
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
                posx = self.initialAnswersPosX;
            }

            self.answersManipulator.last.children.indexOf(self.tabAnswer[i].manipulator.first) === -1 && self.answersManipulator.last.add(self.tabAnswer[i].manipulator.first);
            self.tabAnswer[i].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
            self.tabAnswer[i].manipulator.translator.move(posx-(self.rows - 1)*self.tileWidth/2-(self.rows - 1)*MARGIN/2,posy+MARGIN);

            if(self.parentQuizz.previewMode) {
                if(self.tabAnswer[i].correct) {
                    self.tabAnswer[i].bordure.color(self.tabAnswer[i].bordure.component.fillColor, 5, myColors.primaryGreen);
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
                    self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.parentFormation.levelsTab[self.parentQuizz.levelIndex].gamesTab[self.parentQuizz.gameIndex].tabQuestions[self.parentQuizz.currentQuestionIndex]);
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
                svg.event(questionsArray[0].bordure, "dblclick", {}); // dernier élément du tableau (AddEmptyElement)
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
    var self = this;
    x && (self.previousX = x);
    y && (self.previousY = y);
    w && (self.previousW = w);
    h && (self.previousH = h);
    self.manipulator.last.children.indexOf(self.questionCreatorManipulator.first)===-1 && self.manipulator.last.add(self.questionCreatorManipulator.first);
    self.questionCreatorHeight = Math.floor(self.previousH * (1 - self.headerHeight) - 80);
    self.questionCreatorManipulator.translator.move(self.previousX, 0);
    self.toggleButtonHeight = 40;
    self.displayQuestionCreator(self.previousX, self.previousY, self.previousW, self.previousH);
    var clickedButton = self.multipleChoice ? myQuizzType.tab[1].label : myQuizzType.tab[0].label;
    self.displayToggleButton(MARGIN + self.previousX, MARGIN/2+self.previousY, self.previousW, self.toggleButtonHeight-MARGIN, clickedButton);
}

function questionCreatorDisplayToggleButton (x, y, w, h, clicked){
    var self = this;
    //var size = self.puzzle.tileHeight*0.2;
    var size = self.questionBlock.rect.height*0.05;
    self.questionCreatorManipulator.last.children.indexOf(self.toggleButtonManipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.toggleButtonManipulator.first);
    self.toggleButtonWidth = drawing.width/5;
    var toggleHandler = function(event){
        self.target = drawings.background.getTarget(event.clientX, event.clientY);
        var questionType = self.target.parent.children[1].messageText;
        self.linkedQuestion.tabAnswer.forEach(function(answer){
            answer.correct = false;
        });

        (questionType === "Réponses multiples") ? (self.multipleChoice = true) : (self.multipleChoice = false);
        (questionType === "Réponses multiples") ? (self.linkedQuestion.multipleChoice = true) : (self.linkedQuestion.multipleChoice = false);

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

    self.questionCreatorManipulator.last.children.indexOf(self.toggleButtonManipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.toggleButtonManipulator.first);

    var length = self.quizzType.length;
    var lengthToUse = (length+1)*MARGIN+length*self.toggleButtonWidth;
    self.margin = (w-lengthToUse)/2;
    self.x = self.margin+self.toggleButtonWidth/2+MARGIN;
    var i = 0;
    (!self.completeBanner) && (self.completeBanner = []);
    self.quizzType.forEach(function(type){
        if(self.completeBanner[i] && self.completeBanner[i].manipulator){
            self.toggleButtonManipulator.last.remove(self.completeBanner[i].manipulator.first);
        }

        self.completeBanner[i] = {};
        self.completeBanner[i].manipulator = new Manipulator(self);
        self.completeBanner[i].manipulator.addOrdonator(2);
        self.toggleButtonManipulator.last.add(self.completeBanner[i].manipulator.first);
        (type.label == clicked) ? (self.completeBanner[i].color = SELECTION_COLOR) : (self.completeBanner[i].color = myColors.white);
        self.completeBanner[i].toggleButton = displayTextWithoutCorners(type.label, self.toggleButtonWidth, h, myColors.black, self.completeBanner[i].color, 20, null, self.completeBanner[i].manipulator);
        self.completeBanner[i].toggleButton.content.color(getComplementary(self.completeBanner[i].color), 0, myColors.black);
        self.completeBanner[i].manipulator.translator.move(self.x-self.w/2, h - self.h/2);
        self.x += self.toggleButtonWidth + MARGIN;
        (type.label != clicked) && (svg.addEvent(self.completeBanner[i].toggleButton.content, "click", toggleHandler));
        (type.label != clicked) && (svg.addEvent(self.completeBanner[i].toggleButton.cadre, "click", toggleHandler));

        i++;
    });
    self.activeQuizzType = (self.multipleChoice) ? self.quizzType[1] : self.quizzType[0];
    self.toggleButtonManipulator.translator.move(0,0);
}

function questionCreatorDisplayQuestionCreator (x, y, w, h) {
    var self = this;
    // bloc Question
    self.questionCreatorManipulator.flush();
    self.questionBlock = {rect: new svg.Rect(w, h).color(myColors.none, 3, myColors.black).position(w / 2, y + h / 2)};
    self.questionBlock.rect.position(0, 0);
    self.questionBlock.rect.fillOpacity(0.001);
    //self.questionCreatorManipulator.ordonator.children.indexOf(self.questionBlock.rect)===-1 && self.questionCreatorManipulator.ordonator.set(5,self.questionBlock.rect);
    self.questionCreatorManipulator.last.children.indexOf(self.questionBlock.rect)===-1 && self.questionCreatorManipulator.last.add(self.questionBlock.rect);
    self.questionCreatorManipulator.last.children.indexOf(self.questionManipulator.first)===-1 && self.questionCreatorManipulator.last.add(self.questionManipulator.first);
    var showTitle = function () {
        var color = (self.linkedQuestion.label) ? myColors.black : myColors.grey;
        var text = (self.linkedQuestion.label) ? self.linkedQuestion.label : self.labelDefault;
        if(self.linkedQuestion.image){
            var img = self.linkedQuestion.image;
            self.questionBlock.title = displayImageWithTitle(text, img.src, img, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.linkedQuestion.fontSize, self.linkedQuestion.font, self.questionManipulator);
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

            svg.addEvent(self.questionBlock.title.image, 'mouseover', mouseoverHandler);
            svg.addEvent(self.questionBlock.title.image, 'mouseout', mouseleaveHandler);

            self.questionBlock.title.image._acceptDrop = true;
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
            self.errorMessage = new svg.Text(REGEX_ERROR)
                .position(w/2, drawing.height * (quizzInfoHeightRatio + questionsPuzzleHeightRatio) + self.toggleButtonHeight+ 5 * MARGIN + self.questionBlock.title.cadre.height)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            self.questionCreatorManipulator.ordonator.set(0, self.errorMessage);
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
        self.explanation.diplayPopIn();
    }
}

function popInDisplay(){
    let questionCreator = this.answer.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
    let rect = new svg.Rect(questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
    rect.color(myColors.white , 3 , myColors.black);
    this.manipulator.ordonator.set(0,rect);
    this.manipulator.translator.move(questionCreator.previousX ,questionCreator.coordinatesAnswers.y);

    questionCreator.manipulator.last.add(this.manipulator.first);
    let answerTextRatio = 0.2;
    let answerText = "Réponse : "+ this.answer.label;
    let answerTextSVG = autoAdjustText(answerText, 0,0,questionCreator.coordinatesAnswers.w,questionCreator.coordinatesAnswers.h * answerTextRatio , 20, null, this.manipulator, 1).text;
    answerTextSVG.position (0,- questionCreator.coordinatesAnswers.h/2 + svg.runtime.boundingRect(answerTextSVG.component).width/4);
    let blackCrossSize = 30;
    let blackCross = drawRedCross(questionCreator.coordinatesAnswers.w/2 - blackCrossSize, - questionCreator.coordinatesAnswers.h/2 + blackCrossSize, blackCrossSize,this.blackCrossManipulator);
    blackCross.color(myColors.black, 1 , myColors.black);
    this.blackCrossManipulator.ordonator.set(0,blackCross);
    let blackCrossHandler = function(event){
        questionCreator.explanation = false;
        let target = drawings.background.getTarget(event.clientX,event.clientY);
        questionCreator.manipulator.last.remove(target.parent.parentManip.parentObject.manipulator.first);
    };
    svg.addEvent(blackCross,"click",blackCrossHandler);
}

function quizzDisplay(x, y, w, h) {
    var self = this;
    drawing.currentPageDisplayed = "Quizz";
    header.display(this.title);
    mainManipulator.ordonator.set(1, self.quizzManipulator.first);

    function setSizes() {
        self.x = x || self.x || 0;
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
    self.returnButton.setHandler(self.previewMode ? (event) => {
        let target = drawings.background.getTarget(event.clientX,event.clientY);
        target.parentObj.parent.quizzManipulator.flush();
        target.parentObj.parent.parentFormation.quizzManager.loadQuizz(target.parentObj.parent, target.parentObj.parent.currentQuestionIndex);
        target.parentObj.parent.parentFormation.quizzManager.display();
    } : (event) => {
        let target = drawings.background.getTarget(event.clientX,event.clientY);
        target.parentObj.parent.quizzManipulator.flush();
        target.parentObj.parent.parentFormation.displayFormation();
    });

    if(self.currentQuestionIndex===-1){// on passe à la première question
        self.nextQuestion();
    }
    else if (self.currentQuestionIndex < self.tabQuestions.length){
        self.displayCurrentQuestion();
    }
    else {
        self.puzzle = new Puzzle(self.puzzleLines, self.puzzleRows, self.questionsWithBadAnswers, "leftToRight", self);
        self.displayResult();
    }

    if(this.previewMode) {
        //this.leftChevron = drawChevron(x-w*0.3, y+h*0.45, w*0.1, h*0.15, this.leftChevronManipulator, "left");
        //this.rightChevron = drawChevron(x+w*0.6, y+h*0.45, w*0.1, h*0.15, this.rightChevronManipulator, "right");
        //this.leftChevron.parentObj = this;
        //this.rightChevron.parentObj = this;
        this.leftChevron = new Chevron(x-w*0.3, y+h*0.45, w*0.1, h*0.15, this.leftChevronManipulator, "left");
        this.rightChevron = new Chevron(x+w*0.6, y+h*0.45, w*0.1, h*0.15, this.rightChevronManipulator, "right");
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
    var self = this;
    self.questionsWithBadAnswers.forEach(question=>{
        question.manipulator.ordonator.unset(3)});
    self.displayScore(color);
    self.puzzle && self.puzzle.fillVisibleElementsArray("leftToRight");
    self.puzzle.display(0, self.questionHeight/2 + self.answerHeight/2 + MARGIN, drawing.width - MARGIN, self.answerHeight);
}

function gameDisplayMiniature(size, special){
    var self = this;
    return new Miniature(self, size, special);
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
    self.resultManipulator.translator.move(0, self.questionHeight/2 + self.headerHeight/2 + 2*MARGIN);
    self.resultManipulator.last.add(self.scoreManipulator.first);
    self.resultManipulator.last.add(self.puzzle.manipulator.first);
    self.quizzManipulator.last.add(self.resultManipulator.first);

    displayText(self.finalMessage,self.titleArea.w,self.questionHeight, myColors.black, usedColor, self.fontSize, self.font, self.scoreManipulator);
}

function quizzManagerDisplay(){
    var self = this;

    let verticalPosition = drawing.height * HEADER_SIZE;
    self.height = drawing.height - drawing.height * HEADER_SIZE;
    self.quizzManagerManipulator.first.move(0, verticalPosition);
    self.quizzManagerManipulator.last.children.indexOf(self.libraryIManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.libraryIManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.quizzInfoManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.quizzInfoManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.questionsPuzzleManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.questionsPuzzleManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.questionCreatorManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.questionCreatorManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.previewButtonManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.previewButtonManipulator.first);
    self.quizzManagerManipulator.last.children.indexOf(self.saveQuizButtonManipulator.first)===-1 && self.quizzManagerManipulator.last.add(self.saveQuizButtonManipulator.first);
    self.libraryWidth = drawing.width * self.libraryWidthRatio;
    self.questCreaWidth = drawing.width * self.questCreaWidthRatio;
    self.quizzInfoHeight = self.height * self.quizzInfoHeightRatio;
    self.questionsPuzzleHeight = self.height * self.questionsPuzzleHeightRatio;
    self.libraryHeight = self.height * self.libraryHeightRatio;
    self.questCreaHeight = self.height * self.questCreaHeightRatio;
    self.saveButtonHeight = self.height * self.saveButtonHeightRatio;
    self.previewButtonHeight = self.height * self.previewButtonHeightRatio;
    self.ButtonWidth = 150;
    self.globalMargin = {
        height: self.marginRatio * self.height*2,
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

    self.questionClickHandler = event => {
        let question;
        if(typeof event.clientX == "undefined" || typeof event.clientY == "undefined"){
            question = event.question;
        }
        else{
            var target = drawings.background.getTarget(event.clientX,event.clientY);
            question = target.parent.parentManip.parentObject;
        }
        this.quizz.tabQuestions[self.indexOfEditedQuestion] && this.quizz.tabQuestions[self.indexOfEditedQuestion].redCrossManipulator && this.quizz.tabQuestions[self.indexOfEditedQuestion].redCrossManipulator.flush();
        question.selected = true;
        let quizzManager = question.parentQuizz.parentFormation.quizzManager,
            quizz = quizzManager.quizz,
            tabQuestions = quizz.tabQuestions,
            questionCreator = quizzManager.questionCreator;
        self.indexOfEditedQuestion !== this.quizz.tabQuestions.indexOf(question) && (tabQuestions[quizzManager.indexOfEditedQuestion].selected = false);
        quizzManager.indexOfEditedQuestion = tabQuestions.indexOf(question);
        quizzManager.displayQuestionsPuzzle(null, null, null, null, quizzManager.questionPuzzle.indexOfFirstVisibleElement);
        questionCreator.loadQuestion(question);
        questionCreator.display(questionCreator.previousX, questionCreator.previousY, questionCreator.previousW, questionCreator.previousH);
    };

    let displayFunctions = () => {
        this.displayQuizzInfo(this.globalMargin.width/2, this.quizzInfoHeight/2, drawing.width,this.quizzInfoHeight);
        this.displayQuestionsPuzzle(this.questionPuzzleCoordinates.x, this.questionPuzzleCoordinates.y, this.questionPuzzleCoordinates.w, this.questionPuzzleCoordinates.h);
        this.questionCreator.display(this.library.x + this.libraryWidth, this.library.y,
            this.questCreaWidth-this.globalMargin.width, this.questCreaHeight);
        this.displayPreviewButton(drawing.width/2-this.ButtonWidth, this.height - this.previewButtonHeight/2-MARGIN/2,
            this.ButtonWidth, this.previewButtonHeight-this.globalMargin.height);
        this.displayQuizSaveButton(drawing.width/2+this.ButtonWidth, this.height - this.saveButtonHeight/2-MARGIN/2,
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
        self.quizzLabel.content = autoAdjustText(text, 0, 0, w, h/2, 15, "Arial", self.quizzInfoManipulator).text;
        self.quizzNameHeight = svg.runtime.boundingRect(self.quizzLabel.content.component).height;

        self.quizzLabel.cadre = new svg.Rect(width, 0.5*h);
        self.quizzNameValidInput ? self.quizzLabel.cadre.color(bgcolor) : self.quizzLabel.cadre.color(bgcolor, 2, myColors.red);
        self.quizzLabel.cadre.position(width/2,self.quizzLabel.cadre.height);
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
            self.errorMessage = new svg.Text(REGEX_ERROR)
                .position(self.quizzLabel.cadre.width + MARGIN, h/2 +self.quizzLabel.cadre.height/4)
                .font("Arial", 15).color(myColors.red).anchor(anchor);
            self.quizzInfoManipulator.ordonator.set(5, self.errorMessage);
            textarea.focus();
            //self.quizzNameValidInput = false;
        };
        var onblur = function () {
            textarea.enter();
            self.quizzName = textarea.messageText;
            drawings.screen.remove(textarea);
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
    var self = this;
    self.previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, self.previewButtonManipulator);

    self.questionCreator.errorMessagePreview && self.questionCreator.errorMessagePreview.parent && self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
    self.previewFunction = function () {
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
            self.quizzManagerManipulator.flush();

            self.quizz.tabQuestions.pop();
            self.quizz.tabQuestions.forEach((it) => {
                it.tabAnswer.pop();
            });

            this.previewQuiz = new Quizz(self.quizz, true);
            this.previewQuiz.currentQuestionIndex = self.indexOfEditedQuestion;
            this.previewQuiz.run(1, 1, drawing.width, drawing.height);//
        };
        if(validation) {
            self.displayEditedQuestion();
        }
    };
    svg.addEvent(self.previewButton.cadre, "click", self.previewFunction);
    svg.addEvent(self.previewButton.content, "click", self.previewFunction);
    self.previewButtonManipulator.translator.move(x, y);
}

function quizzManagerDisplaySaveButton(x, y, w, h) {
    this.saveButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveQuizButtonManipulator);
    svg.addEvent(this.saveButton.cadre, "click", () => this.saveQuizz());
    svg.addEvent(this.saveButton.content, "click", () => this.saveQuizz());
    this.saveQuizButtonManipulator.translator.move(x, y);
}

function quizzManagerDisplayQuestionPuzzle(x, y, w, h, ind) {
    var self = this;
    var index = ind ? ind : 0;
    x && (self.qPuzzleX=x);
    y && (self.qPuzzleY=y);
    w && (self.qPuzzleW=w);
    h && (self.qPuzzleH=h);
    //self.questionPuzzle && self.questionPuzzle.manipulator && self.questionsPuzzleManipulator.last.remove(self.questionPuzzle.manipulator.first);
    var border = new svg.Rect(self.qPuzzleW, self.qPuzzleH);
    border.color([], 2, myColors.black);
    self.questionsPuzzleManipulator.ordonator.set(0, border);
    self.questionsPuzzleManipulator.first.move(self.qPuzzleX + self.qPuzzleW / 2, self.qPuzzleY);
    self.coordinatesQuestion = {
        x: 0,
        y: 0,
        w: border.width - self.globalMargin.width / 2,
        h: self.questionsPuzzleHeight - self.globalMargin.height
    };
    if (self.questionPuzzle){
        self.questionPuzzle.updateElementsArray(self.quizz.tabQuestions);
        //self.questionPuzzle.visibleElementsArray[0].length === 6 && self.questionPuzzle.updateStartPosition('right');
        self.questionPuzzle.fillVisibleElementsArray("leftToRight");
    }

    else {
        self.questionPuzzle = new Puzzle(1, 6, self.quizz.tabQuestions, "leftToRight", self);
    }
    self.questionsPuzzleManipulator.last.children.indexOf(self.questionPuzzle.manipulator.first)===-1 && self.questionsPuzzleManipulator.last.add(self.questionPuzzle.manipulator.first);
    self.questionPuzzle.display(self.coordinatesQuestion.x, self.coordinatesQuestion.y, self.qPuzzleW, self.qPuzzleH, true);
}

function inscriptionManagerDisplay(labels={}) {
    let self = this;
    drawing.currentPageDisplayed = "InscriptionManager";
    header.display("Inscription");
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.manipulator.first.move(drawing.width/2, drawing.height/2);
    var w = drawing.width/5;
    var x = drawing.width/9;
    var trueValue = "";
    let focusedField;

    var clickEditionField = function (field, manipulator) {
        return function () {
            var width = w;
            var height = self.h;
            var globalPointCenter = self[field].cadre.globalPoint(-(width) / 2, -(height) / 2);
            var contentareaStyle = {
                toppx: globalPointCenter.y ,
                leftpx: globalPointCenter.x,
                height: height,
                width: width
            };
            let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
            contentarea.message(self[field].labelSecret || self[field].label);
            contentarea.color(null, 0, myColors.black).
            font("Arial",20);
            self[field].secret ? contentarea.type('password') : contentarea.type("text");
            manipulator.ordonator.unset(1, self[field].content.text);
            drawings.screen.add(contentarea);
            contentarea.focus();
            var displayErrorMessage = function(trueManipulator=manipulator){
                emptyAreasHandler();
                if (!(field==="passwordConfirmationField" && trueManipulator.ordonator.children[3].messageText)){
                    var message = autoAdjustText(self[field].errorMessage, 0, 0, drawing.width, self.h, 20, null, trueManipulator, 3);
                    message.text.color(myColors.red).position(self[field].cadre.width/2 + MARGIN, self[field].cadre.height+MARGIN);
                }
            };
            var oninput = function(){
                contentarea.enter();
                    if (self[field].secret && trueValue &&  contentarea.messageText && trueValue.length < contentarea.messageText.length) {
                        trueValue += contentarea.messageText.substring(contentarea.messageText.length - 1);
                    }
                    else if (self[field].secret) {
                        trueValue = trueValue && contentarea.messageText && trueValue.substring(0, contentarea.messageText.length);
                    }
                    self[field].label = contentarea.messageText;
                    self[field].labelSecret !== "undefined" && (self[field].labelSecret = trueValue);
                    if ((field === "lastNameField" || field === 'firstNameField' ) && !self[field].checkInput()) {
                        displayErrorMessage();
                        self[field].cadre.color(myColors.white, 3, myColors.red);
                    }
                    else {
                        field !== "passwordConfirmationField" && manipulator.ordonator.unset(3);
                        self[field].cadre.color(myColors.white, 1, myColors.black);
                    }
            };
            svg.addEvent(contentarea, "input", oninput);
            var alreadyDeleted = false;
            var onblur = function(){
                if (!alreadyDeleted) {
                    contentarea.enter();
                    if (self[field].secret) {
                        self[field].label = '';
                        self[field].labelSecret = contentarea.messageText;
                        if (contentarea.messageText){
                            for (let i = 0; i < contentarea.messageText.length; i++) {
                                self[field].label += '●';
                            }
                        }
                    } else {
                        self[field].label = contentarea.messageText;
                    }
                    contentarea.messageText && displayField(field, manipulator);
                    if (self[field].checkInput()) {
                        self[field].cadre.color(myColors.white, 1, myColors.black);
                        field !== "passwordConfirmationField" && manipulator.ordonator.unset(3);
                    }
                    else {
                        self[field].secret || displayErrorMessage();
                        self[field].secret || self[field].cadre.color(myColors.white, 3, myColors.red);
                    }
                    drawings.screen.remove(contentarea);
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
        var alreadyExist = self.tabForm.find(formElement => formElement.field === field);
        self[field].field = field;
        alreadyExist ? self.tabForm.splice(self.tabForm.indexOf(alreadyExist),1,self[field]) : self.tabForm.push(self[field]);
        self.formLabels[field] = self[field].label;
    };

    var nameCheckInput = function(field){
        if (self[field].label){
            self[field].label = self[field].label.trim();
            var regex = /^([A-Za-zéèêâàîïëôûùöñüä '-]){0,150}$/g;
            return self[field].label.match(regex);
        }
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
        if (self.mailAddressField.label){
            var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            return self.mailAddressField.label=== "" || self.mailAddressField.label.match(regex);
        }
    };
    displayField("mailAddressField", self.mailAddressManipulator);

    var passwordCheckInput = function() {
        var passTooShort = self.passwordField.labelSecret !== "" && self.passwordField.labelSecret && self.passwordField.labelSecret.length<6;
        var confTooShort = self.passwordConfirmationField.labelSecret !== "" && self.passwordField.labelSecret && self.passwordConfirmationField.labelSecret.length<6;
        var cleanIfEgality = function(){
            if (self.passwordField.labelSecret === self.passwordConfirmationField.labelSecret){
                self.passwordField.cadre.color(myColors.white, 1, myColors.black);
                self.passwordConfirmationField.cadre.color(myColors.white, 1, myColors.black);
            }
        };
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
        else if (self.passwordField.labelSecret && self.passwordField.labelSecret.length>=6){
            self.passwordField.cadre.color(myColors.white, 1, myColors.black);
            self.passwordManipulator.ordonator.unset(3);
            cleanIfEgality();
        }
        else {
            cleanIfEgality();
            self.passwordManipulator.ordonator.unset(3);
        }
        var result = !(passTooShort || confTooShort || self.passwordConfirmationField.labelSecret!== self.passwordField.labelSecret);
        return result;
    };

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
            var message = autoAdjustText(EMPTY_FIELD_ERROR, 0, 0, drawing.width, self.h, 20, null, self.saveButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - self.saveButton.cadre.height+MARGIN);
        }
        else {
            self.saveButtonManipulator.ordonator.unset(3);
        }
        return (emptyAreas.length>0);
    };

    this.saveButtonHandler = () => {
        if (!emptyAreasHandler(true) && AllOk()){
            Server.getUserByMail(self.mailAddressField.label)
                .then(data => {
                    let myUser = JSON.parse(data).user;
                    if (myUser) {
                        throw "Un utilisateur possède déjà cet adresse mail !"
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
                    var message = autoAdjustText(messageText, 0, 0, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                    message.text.color(myColors.green).position(0, - this.saveButton.cadre.height+MARGIN);
                    setTimeout(() => {
                        this.saveButtonManipulator.ordonator.unset(3);
                    }, 10000);
                })
                .catch((messageText) => {
                    let message = autoAdjustText(messageText, 0, 0, drawing.width, this.h, 20, null, this.saveButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, -this.saveButton.cadre.height + MARGIN);
                    setTimeout(() => {
                        this.saveButtonManipulator.ordonator.unset(3);
                    }, 10000);
                });
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

    let nextField = function(backwards = false) {
        let index = self.tabForm.indexOf(focusedField);
        if (index !== -1) {
            backwards ? index-- : index++;
            if(index === self.tabForm.length) index = 0;
            if(index === -1) index = self.tabForm.length - 1;
            clickEditionField(self.tabForm[index].field, self.tabForm[index].cadre.parent.parentManip)();
        }
    };

    svg.runtime.addGlobalEvent("keydown", function (event) {
        if (event.keyCode === 9) { // TAB
            event.preventDefault();
            nextField(event.shiftKey);
        } else if (event.keyCode === 13) { // Entrée
            event.preventDefault();
            document.activeElement && document.activeElement.blur();
            self.saveButtonHandler();
        }
    });
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
    Formation.prototype.displayMiniature = formationDisplayMiniature;
    Formation.prototype.displayFormation = formationDisplayFormation;
    Formation.prototype.removeErrorMessage = formationRemoveErrorMessage;
    Formation.prototype.displayFormationSaveButton = formationDisplaySaveButton;
    FormationsManager.prototype.display = formationsManagerDisplay;
    Question.prototype.display = questionDisplay;
    Question.prototype.displayAnswers = questionDisplayAnswers;
    Question.prototype.selectedQuestion = questionSelectedQuestion;
    Question.prototype.elementClicked = questionElementClicked;
    QuestionCreator.prototype.display = questionCreatorDisplay;
    QuestionCreator.prototype.displayToggleButton = questionCreatorDisplayToggleButton;
    QuestionCreator.prototype.displayQuestionCreator = questionCreatorDisplayQuestionCreator;
    PopIn.prototype.diplayPopIn = popInDisplay;
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
    Formation.prototype.displayMiniature = formationDisplayMiniature;
    FormationsManager.prototype.display = formationsManagerDisplay;
    Question.prototype.display = questionDisplay;
    Question.prototype.displayAnswers = questionDisplayAnswers;
    Question.prototype.elementClicked = questionElementClicked;
    Question.prototype.selectedQuestion = questionSelectedQuestion;
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