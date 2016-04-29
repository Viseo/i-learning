/**
 * Created by TDU3482 on 26/04/2016.
 */

var domain;
function setDomain(_domain) {
    domain = _domain;
    // call setSvg on modules
}


function AnswerDisplay (x, y, w, h) {

    if(typeof x !=='undefined'){
        this.x=x;
    }
    if(typeof y !=='undefined'){
        this.y=y;
    }
    w && (this.w=w);
    h && (this.h=h);



    // Question avec Texte ET image
    if(this.label && this.imageSrc) {
        var objectTotal = displayImageWithTitle(this.label, this.imageSrc, this.dimImage, this.w, this.h, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator,this.image);
        this.bordure = objectTotal.cadre;
        this.content = objectTotal.text;
        this.image = objectTotal.image;

    }
    // Question avec Texte uniquement
    else if(this.label && !this.imageSrc) {
        var object = displayText(this.label, this.w, this.h, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator);
        this.bordure = object.cadre;
        this.content = object.content;

    }
    // Question avec Image uniquement
    else if(this.imageSrc && !this.label) {
        var obj = displayImageWithBorder(this.imageSrc, this.dimImage, this.w, this.h, this.manipulator);
        this.image = obj.image;
        this.bordure = obj.cadre;
    }
    // Cas pour test uniquement : si rien, n'affiche qu'une bordure
    else {
        this.bordure = new svg.Rect(this.w, this.h).color(this.bgColor, 1, myColors.black).corners(25, 25);
        this.manipulator.last.add(this.bordure);

    }
    if(this.selected){// image pré-selectionnée
        this.bordure.color(this.bgColor, 5, SELECTION_COLOR);

    }
    this.manipulator.translator.move(this.x,this.y);

}

function LibraryDisplay(x,y,w,h){
    var self = this;
    x && (self.x = x);
    y && (self.y = y);
    w && (self.w = w);
    h && (self.h = h);
    self.borderSize = 3;

    self.bordure =  new svg.Rect(w-self.borderSize,h-self.borderSize,self.libraryManipulator).color(myColors.none,self.borderSize,myColors.black);
    self.bordure.position(w/2,h/2);
    self.libraryManipulator.last.add(self.bordure);

    self.title = autoAdjustText(self.title, 0, 0, w, (1/10)*h, null, self.font, self.libraryManipulator).text;
    self.title.position(w/2, (1/20)*h);

    var maxImagesPerLine = Math.floor((w-self.libMargin)/(self.imageWidth+self.libMargin));
    self.libMargin = (w -(maxImagesPerLine*self.imageWidth))/(maxImagesPerLine+1);
    var maxJeuxPerLine = 1;
    self.libMargin2 = (w -(maxJeuxPerLine*w))/(maxJeuxPerLine+1)+2*MARGIN;
    var tempY = (2/10*h);

    for (var i = 0; i<self.tabLib.length; i++) {
        if (i % maxImagesPerLine === 0 && i != 0) {
            tempY += self.imageHeight + self.libMargin;
        }
        self.bibManipulators[i] = new Manipulator(self);
        self.libraryManipulator.last.add(self.bibManipulators[i].first);
        if (self.tabLib[i].imgSrc) {
            var objectTotal = displayImage(self.tabLib[i].imgSrc, self.tabImgBib[i], self.imageWidth, self.imageHeight, self.bibManipulators[i]);
            objectTotal.image.srcDimension = {width: self.tabImgBib[i].width, height: self.tabImgBib[i].height};
            self.bibManipulators[i].ordonator.set(0, objectTotal.image);
            var X = x + self.libMargin + ((i % maxImagesPerLine) * (self.libMargin + self.imageWidth));
            self.bibManipulators[i].first.move(X, tempY);
        }
        else {

            if (i % maxJeuxPerLine === 0 && i != 0) {
                tempY += self.w / 2 + self.libMargin2;
            }

            objectTotal = displayTextWithCircle(self.tabLib[i].label, w / 2, h, myColors.black, myColors.white, null, self.fontSize, self.bibManipulators[i]);
            X = x + self.libMargin2 - 2 * MARGIN + ((i % maxJeuxPerLine + 1) * (self.libMargin2 + w / 2 - 2 * MARGIN));
            self.bibManipulators[i].first.move(X, tempY);

            self.libraryGamesTab[i] = {objectTotal : objectTotal};
            self.libraryGamesTab[i].objectTotal.cadre.clicked = false;
        }
    }
    self.libraryManipulator.first.move(x, y);

    self.bibManipulators.forEach(function(e){
        svg.addEvent(e.ordonator.children[0], 'mousedown', function(event){
            e.parentObject.formation && e.parentObject.formation.removeErrorMessage(e.parentObject.formation.errorMessageDisplayed);
            var elementCopy = e.ordonator.children[0];
            var manip = new Manipulator(self);
            drawings.piste.last.add(manip.first);
            var img;
            if (e.ordonator.children[0] instanceof svg.Image){
                img = displayImage(elementCopy.src,elementCopy.srcDimension,elementCopy.width,elementCopy.height).image;
                img.srcDimension = elementCopy.srcDimension;
            }else{
                img = displayTextWithCircle(e.ordonator.children[1].messageText, w/2, h, myColors.black, myColors.white, null, self.fontSize, manip);
                self.draggedObjectLabel = img.content.messageText;
                img = img.cadre;
            }

            manip.ordonator.set(0, img);
            var point = e.ordonator.children[0].globalPoint(e.ordonator.children[0].x, e.ordonator.children[0].y);
            var point2 = manip.first.globalPoint(0,0);
            manip.first.move(point.x-point2.x, point.y-point2.y);

            manageDnD(img, manip);

            var mouseClickHandler = function (event){
                var target = drawing.getTarget(event.clientX, event.clientY);
                self.libraryGamesTab.forEach(function(e){
                    if(e.objectTotal.content.messageText === target.parent.children[1].messageText){
                        if (e.objectTotal!==self.gameSelected){
                            target.color(myColors.white, 3, SELECTION_COLOR);
                            e.objectTotal.cadre.color(myColors.white, 3, SELECTION_COLOR);
                            self.gameSelected = e.objectTotal;
                        }
                        else{
                            e.objectTotal.cadre.color(myColors.white, 1, myColors.black);
                            self.gameSelected = null;
                        }
                    }
                    else{
                        e.objectTotal.cadre.color(myColors.white, 1, myColors.black);
                    }
                });
            };

            var mouseupHandler = function(event){
                var img = manip.ordonator.children.shift();
                manip.first.parent.remove(manip.first);
                var target = drawing.getTarget(event.clientX, event.clientY);
                if(!(target instanceof svg.Circle)){
                    self.dropAction(img, event);
                }
                else {
                    mouseClickHandler(event);
                    !self.gameSelected && svg.removeEvent(self.formation.graphBlock.rect, "mouseup", self.formation.mouseUpGraphBlock);
                    self.formation.clickToAdd();
                }
                self.draggedObjectLabel = "";
            };

            drawings.glass.component.eventHandlers && drawings.glass.component.eventHandlers.mousedown(event);
            drawings.glass.component.target && drawings.glass.component.target.eventHandlers && drawings.glass.component.target.eventHandlers.mousedown(event);

            img.component.eventHandlers && svg.removeEvent(img, 'mouseup', img.component.eventHandlers.mouseup);
            img.component.target && img.component.target.eventHandlers && svg.removeEvent(img, 'mouseup', img.component.target.eventHandlers.mouseup);
            svg.addEvent(img, 'mouseup', mouseupHandler);
        });
    });

}

function AddEmptyElementDisplay(x, y, w, h) {
    var self=this;
    self.obj = displayText(self.label, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
    self.plus = drawPlus(0,0, h*.3, h*0.3);
    self.plusManipulator.ordonator.set(0, self.plus);
    //self.plusManipulator.translator.move(x+w/2, y+(h*0.4));
    // self.manipulator.last.add(self.plus);
    self.obj.content.position(0,h*0.35);

    self.obj.cadre.color(myColors.white, 3, myColors.black);
    self.obj.cadre.component.setAttribute && self.obj.cadre.component.setAttribute("stroke-dasharray", [10, 5]);
    self.obj.cadre.component.target.setAttribute && self.obj.cadre.component.target.setAttribute("stroke-dasharray", [10, 5]);

    var dblclickEdition = function () {
        switch (self.type) {
            case 'answer':
                self.parent.tabAnswer.pop();
                var newAnswer = new Answer(null, self.parent.parent.quizz.tabQuestions[self.parent.parent.indexOfEditedQuestion]);
                self.manipulator.ordonator.unset(self.manipulator.ordonator.children.indexOf(self.obj.content));
                self.manipulator.ordonator.unset(self.manipulator.ordonator.children.indexOf(self.obj.cadre));
                self.plusManipulator.last.flush();

                self.parent.parent.quizz.tabQuestions[self.parent.parent.indexOfEditedQuestion].tabAnswer.push(newAnswer);
                self.parent.tabAnswer.push(new AnswerElement(newAnswer, self.parent));

                if(self.parent.tabAnswer.length !== self.parent.MAX_ANSWERS) {
                    self.parent.tabAnswer.push(new AddEmptyElement(self.parent, self.type));
                }
                self.parent.puzzle = new Puzzle(2, 4, self.parent.tabAnswer, self.parent.coordinatesAnswers, true, self);
                self.parent.questionCreatorManipulator.last.add(self.parent.puzzle.puzzleManipulator.first);
                self.parent.puzzle.display(self.parent.coordinatesAnswers.x, self.parent.coordinatesAnswers.y + self.parent.toggleButtonHeight + self.parent.questionBlock.title.cadre.height/2 - 2*MARGIN, self.parent.coordinatesAnswers.w, self.parent.coordinatesAnswers.h, 0);

                break;
            case 'question':
                self.parent.questionPuzzle.puzzleManipulator.ordonator.unset(0);
                self.parent.questionPuzzle.puzzleManipulator.ordonator.unset(1);
                self.plusManipulator.last.flush();

                self.parent.quizz.tabQuestions.pop();

                var newQuestion = new Question(null, self.parent.quizz);
                self.parent.quizz.tabQuestions[self.parent.indexOfEditedQuestion].selected = false;
                newQuestion.selected = true;
                self.parent.indexOfEditedQuestion = self.parent.quizz.tabQuestions.length;
                self.parent.quizz.tabQuestions.push(newQuestion);
                var AddNewEmptyQuestion = new AddEmptyElement(self.parent, 'question');
                self.parent.quizz.tabQuestions.push(AddNewEmptyQuestion);
                if(self.parent.questionPuzzle.questionsTab.length >self.parent.questionPuzzle.rows){
                    self.parent.displayQuestionsPuzzle(self.parent.questionPuzzleCoordinates.x, self.parent.questionPuzzleCoordinates.y, self.parent.questionPuzzleCoordinates.w, self.parent.questionPuzzleCoordinates.h, self.parent.questionPuzzle.startPosition+1);

                } else {
                    self.parent.displayQuestionsPuzzle(self.parent.questionPuzzleCoordinates.x, self.parent.questionPuzzleCoordinates.y, self.parent.questionPuzzleCoordinates.w, self.parent.questionPuzzleCoordinates.h, self.parent.questionPuzzle.startPosition);

                }
                self.parent.questionCreator.loadQuestion(newQuestion);
                self.parent.questionCreatorManipulator.last.flush();
                self.parent.questionCreator.display(self.parent.questionCreator.previousX, self.parent.questionCreator.previousY, self.parent.questionCreator.previousW, self.parent.questionCreator.previousH);
        }
    };

    svg.addEvent(self.plus, "dblclick", dblclickEdition);
    svg.addEvent(self.obj.content, "dblclick", dblclickEdition);
    svg.addEvent(self.obj.cadre, "dblclick", dblclickEdition);
}

function AnswerElementDisplay(x, y, w, h) {
    var self = this;
    self.checkboxSize = h*0.2;
    var showTitle = function () {
        var text = (self.label) ? self.label : self.labelDefault;
        var color = (self.label) ? myColors.black : myColors.grey;
        if(self.linkedAnswer.image){
            self.img = self.linkedAnswer.image;
            self.obj = displayImageWithTitle(text, self.img.src, self.img, w, h, self.linkedAnswer.colorBordure, self.linkedAnswer.bgColor, self.fontSize, self.font, self.manipulator);
        }
        else{
            self.obj = displayText(text, w, h, self.linkedAnswer.colorBordure, self.linkedAnswer.bgColor, self.fontSize, self.font, self.manipulator);
            self.obj.content.position((self.checkboxSize/2),self.obj.content.y);
        }
        self.obj.cadre.fillOpacity(0.001);
        self.obj.content.color(color);
        self.obj.cadre._acceptDrop = true;
        self.obj.content._acceptDrop = true;
        self.parent.puzzle.puzzleManipulator.translator.move(0, self.parent.toggleButtonHeight-MARGIN);
        svg.addEvent(self.obj.content, "dblclick", dblclickEdition);
        svg.addEvent(self.obj.cadre, "dblclick", dblclickEdition);
    };

    var dblclickEdition = function () {
        var contentarea = document.createElement("TEXTAREA");
        contentarea.value = self.label;
        contentarea.width = w;
        self.obj.content.component.getBBox && (contentarea.height = self.obj.content.component.getBBox().height);
        self.obj.content.component.target.getBBox && (contentarea.height = self.obj.content.component.target.getBBox().height);
        contentarea.globalPointCenter = self.obj.content.globalPoint(-(contentarea.width)/2,-(contentarea.height)/2);
        self.manipulator.ordonator.unset(1, self.obj.content);
        var contentareaStyle = {
            toppx: contentarea.globalPointCenter.y-(contentarea.height/2)*2/3 ,
            leftpx: contentarea.globalPointCenter.x+(1/12)*self.obj.cadre.width,
            height:(self.linkedAnswer.image) ? contentarea.height : (h*.5),
            width:self.obj.cadre.width*5/6
        };
        contentarea.setAttribute("style", "position: absolute; top:"+(contentareaStyle.toppx)+"px; left:"+(contentareaStyle.leftpx)+"px; width:"+contentareaStyle.width+"px; height:"+(contentareaStyle.height)+"px; overflow:hidden; text-align:center; font-family: Arial; font-size: 20px; resize: none; border: none; background-color: transparent;");

        var body = document.getElementById("content");
        body.appendChild(contentarea).focus();

        var removeErrorMessage = function () {
            self.answerNameValidInput = true;
            self.errorMessage && self.parent.questionCreatorManipulator.ordonator.unset(5);
            self.obj.cadre.color(myColors.white, 1, myColors.black);
        };


        var displayErrorMessage = function () {
            removeErrorMessage();
            self.obj.cadre.color(myColors.white, 2, myColors.red);
            var bibRatio = 0.2;
            var previewButtonHeightRatio = 0.1;
            var marginErrorMessagePreviewButton = 0.03;
            var position = (window.innerWidth/2 - 0.5 * bibRatio*drawing.width+2*MARGIN);
            var anchor = 'middle';
            self.errorMessage = new svg.Text(REGEXERROR)
                .position(position,drawing.height*(1-previewButtonHeightRatio - marginErrorMessagePreviewButton)-2*MARGIN)
                .font("arial", 15).color(myColors.red).anchor(anchor);
            self.parent.questionCreatorManipulator.ordonator.set(5,self.errorMessage);
            contentarea.focus();
            self.answerNameValidInput = false;
        };

        var onblur = function () {
            self.answerNameValidInput && (self.linkedAnswer.label = contentarea.value);
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


    self.manipulator.last.flush();
    showTitle();
    if(typeof self.obj.checkbox === 'undefined') {
        self.checkbox = displayCheckbox(x + self.checkboxSize, y + h - self.checkboxSize, self.checkboxSize, self).checkbox;
        self.obj.checkbox.answerParent = self;
    }
    self.manipulator.ordonator.children.forEach(function(e) {
        e._acceptDrop = true;
    });
}

function FormationDisplayMiniature (w,h) {
    var self = this;
    self.miniature = displayText(self.label, w, h, myColors.black, myColors.white, null, null, self.manipulatorMiniature);
    self.miniature.cadre.corners(50, 50);

    if (self.status === statusEnum.Published) {
        var icon = self.status.icon(0, 0, self.parent.iconeSize);
        self.iconManipulator.ordonator.set(5, icon.square);
        self.iconManipulator.ordonator.set(6, icon.check);
        self.iconManipulator.translator.move(w / 2 - self.parent.iconeSize + MARGIN + 2, -h / 2 + self.parent.iconeSize - MARGIN - 2);//2Pxl pour la largeur de cadre
    }
    else if (self.status === statusEnum.Edited) {
        var iconExclamation = self.status.icon(self.parent.iconeSize);
        self.iconManipulator.ordonator.set(5, iconExclamation.circle);
        self.iconManipulator.ordonator.set(6, iconExclamation.exclamation);
        self.iconManipulator.ordonator.set(7, iconExclamation.dot);
        self.iconManipulator.translator.move(w / 2 - self.parent.iconeSize + MARGIN + 2, -h / 2 + self.parent.iconeSize - MARGIN - 2);//2Pxl pour la largeur de cadre
    }
}

function FormationDisplayFormation(){
    var self = this;

    self.manipulator.first.move(0, drawing.height*0.075);
    mainManipulator.ordonator.set(1, self.manipulator.first);
    self.title = new svg.Text("Formation : ").position(MARGIN, 0).font("Arial", 20).anchor("start");
    self.manipulator.last.add(self.title);

    self.bib.display(0,0,self.bibWidth, self.graphCreaHeight);

    self.gamesCounter = myFormation.gamesCounter;

    var showTitle = function() {
        var text = (self.label) ? self.label : (self.label=self.labelDefault);
        var color = (self.label) ? myColors.black : myColors.grey;
        var bgcolor = myColors.grey;
        self.formationLabelWidth = 400 ;
        self.formationLabel = {};
        self.formationLabel.content = autoAdjustText(text, 0, 0, drawing.width, 20, 15, "Arial", self.formationInfoManipulator).text;
        self.formationLabel.content.component.getBBox && (self.labelHeight = self.formationLabel.content.component.getBBox().height);
        self.formationLabel.content.component.getBBox && (self.labelWidth = self.formationLabel.content.component.getBBox().width + 2 * MARGIN);
        self.formationLabel.content.component.target && self.formationLabel.content.component.target.getBBox && (self.labelHeight = self.formationLabel.content.component.target.getBBox().height);
        self.formationLabel.content.component.target && self.formationLabel.content.component.target.getBBox && (self.labelWidth = self.formationLabel.content.component.target.getBBox().width + 2 * MARGIN);
        self.formationLabel.cadre = new svg.Rect(self.formationLabelWidth, self.labelHeight + MARGIN).color(bgcolor);
        self.title.component.getBBox && self.formationLabel.cadre.position(self.title.component.getBBox().width + self.formationLabelWidth/2 + MARGIN + MARGIN/2, -MARGIN/2).fillOpacity(0.1);
        self.title.component.target && self.title.component.target.getBBox && self.formationLabel.cadre.position(self.title.component.target.getBBox().width + self.formationLabelWidth/2 + MARGIN + MARGIN/2, -MARGIN/2).fillOpacity(0.1);
        self.formationInfoManipulator.ordonator.set(0, self.formationLabel.cadre);
        self.title.component.getBBox && self.formationLabel.content.position(self.title.component.getBBox().width + 2 * MARGIN, 0).color(color).anchor("start");
        self.title.component.target && self.title.component.target.getBBox && self.formationLabel.content.position(self.title.component.target.getBBox().width + 2 * MARGIN, 0).color(color).anchor("start");
        svg.addEvent(self.formationLabel.content, "dblclick", dblclickEdition);
        svg.addEvent(self.formationLabel.cadre, "dblclick", dblclickEdition);
        self.formationCreator = formationValidation;
    };
    var dblclickEdition = function (event) {
        var width = self.formationLabel.content.component.getBBox().width;
        self.formationInfoManipulator.ordonator.unset(1);

        var textarea = document.createElement("TEXTAREA");
        textarea.value = self.label;
        var contentareaStyle = {
            toppx:(self.labelHeight/2+drawing.height*0.075-2*MARGIN+3),
            leftpx: (self.title.component.getBBox().width + 2 * MARGIN + 1),
            width: 400,
            height:(self.labelHeight+3)
        };
        textarea.setAttribute("style", "position: absolute; top:" + contentareaStyle.toppx + "px; left:" + contentareaStyle.leftpx + "px; width:" + (contentareaStyle.width) + "px; height:" + contentareaStyle.height + "px; resize: none; border: none; outline:none; overflow:hidden; font-family: Arial; font-size: 15px; background-color: transparent;");
        var body = document.getElementById("content");
        body.appendChild(textarea).focus();

        var removeErrorMessage = function () {
            self.formationCreator.formationNameValidInput = true;
            self.formationCreator.errorMessage && self.formationInfoManipulator.ordonator.unset(5);
            self.formationLabel.cadre.color(myColors.grey, 1, myColors.none);
        };

        var displayErrorMessage = function () {
            removeErrorMessage();
            self.formationLabel.cadre.color(myColors.grey, 2, myColors.red);
            var position = (textarea.getBoundingClientRect().left - MARGIN);
            var anchor = 'start';
            self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                .position(drawing.width/2, 0)
                .font("arial", 15).color(myColors.red).anchor(anchor);
            self.formationInfoManipulator.ordonator.set(5, self.errorMessage);
            textarea.focus();
            self.labelValidInput = false;
        };
        var onblur = function () {
            self.formationCreator.formationNameValidInput && (self.label = textarea.value);
            textarea.remove();
            showTitle();
        };
        textarea.oninput = function () {
            self.checkInputTextArea({
                textarea: textarea,
                border: self.formationLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        textarea.onblur = onblur;
        self.checkInputTextArea({
            textarea: textarea,
            border: self.formationLabel.cadre,
            onblur: onblur,
            remove: removeErrorMessage,
            display: displayErrorMessage
        });
    };
    showTitle();

    self.title.component.getBBox && self.gamesLibraryManipulator.translator.move(0, self.title.component.getBBox().height);
    self.title.component.target && self.title.component.target.getBBox && self.gamesLibraryManipulator.translator.move(0, self.title.component.target.getBBox().height);

    var onclickQuizzHandler = function(event){
        var targetQuizz=drawing.getTarget(event.clientX,event.clientY).parent.parentManip.parentObject;
        //myFormation.gamesTab[/*TODO*/][/*TODO*/] ? quizzManager = new QuizzManager(defaultQuizz): quizzManager = new quizzManager(myFormation.gamesTab[/*TODO*/][/*TODO*/]);
        self.quizzManager.loadQuizz(targetQuizz);
        self.quizzManager.display();
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else if (document.selection)
            document.selection.empty();
        mainManipulator.ordonator.unset(0);
    };
    self.displayLevel = function(w, h, level){
        self.graphManipulator.last.add(level.manipulator.first);

        level.obj = displayTextWithoutCorners("Niveau "+level.index, w-self.borderSize-2*self.borderSize, self.levelHeight-2*self.borderSize, myColors.none, myColors.white, 20, null, level.manipulator);
        level.obj.line = new svg.Line(MARGIN, self.levelHeight, level.parentFormation.levelWidth, self.levelHeight).color(myColors.black, 3, myColors.black);
        level.obj.line.component.setAttribute && level.obj.line.component.setAttribute("stroke-dasharray", 6);
        level.obj.line.component.target && level.obj.line.component.target.setAttribute && level.obj.line.component.target.setAttribute("stroke-dasharray", 6);
        self.textLevelNumberDimensions = {
            width: level.obj.content.component.getBBox().width,
            height:level.obj.content.component.getBBox().height
        };
        level.manipulator.ordonator.set(9, level.obj.line);
        level.obj.cadre.position((w-self.borderSize)/2, self.messageDragDropMargin).opacity(0.001);

        level.obj.content.component.getBBox && level.obj.content.position(level.obj.content.component.getBBox().width, self.messageDragDropMargin);
        level.obj.content.component.target && level.obj.content.component.target.getBBox && level.obj.content.position(self.textLevelNumberDimensions.width, self.messageDragDropMargin);
        self.title.component.getBBox && self.messageDragDrop.position(w/2, self.title.component.getBBox().height + 3*self.messageDragDropMargin);
        self.title.component.target && self.title.component.target.getBBox && self.messageDragDrop.position(w/2, self.title.component.getBBox().height + 3*self.messageDragDropMargin);

        level.obj.cadre._acceptDrop = true;
        level.obj.content._acceptDrop = true;
        level.manipulator.first.move(-w/2, -h/2+level.y);
    };

    self.displayFrame = function (w, h) {
        window.onkeydown = function (event) {
            if(hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        };

        hasKeyDownEvent = function (event) {
            self.target = self.panel;
            return self.target && self.target.processKeys && self.target.processKeys(event.keyCode);
        };

        self.clippingManipulator = new Manipulator(self);
        self.manipulator.last.add(self.clippingManipulator.first);
        self.title.component.getBBox && self.clippingManipulator.translator.move(self.bibWidth, self.title.component.getBBox().height);
        self.title.component.target && self.title.component.target.getBBox && self.clippingManipulator.translator.move(self.bibWidth, self.title.component.target.getBBox().height);

        self.panel = new gui.Panel(w, h-4);
        self.panel.addhHandle();
        (self.levelHeight*(self.levelsTab.length+1) > h) && self.panel.resizeContent(self.levelWidth, self.levelHeight*(self.levelsTab.length+1));
        self.panel.component.move(w/2, h/2);
        self.clippingManipulator.last.add(self.panel.component);
        self.panel.border.color(myColors.none, 3, myColors.black);
        self.panel.content.add(self.graphManipulator.first);
        self.panel.hHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
        self.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
    };

    self.displayGraph = function (w, h){
        var height = (self.levelHeight*(self.levelsTab.length+1) > h) ? (self.levelHeight*(self.levelsTab.length+1)) : h;
        var width = (self.levelWidth > w) ? self.levelWidth : w;
        console.log(self.levelWidth);
        self.panel.resizeContent(height);
        self.panel.resizeContentW(width);
        self.borderSize = 3;
        self.messageDragDropMargin = self.graphCreaHeight/8-self.borderSize;
        self.graphBlock = {rect: new svg.Rect(self.levelWidth-self.borderSize, height-self.borderSize).color(myColors.white, self.borderSize, myColors.none)};//.position(w / 2 - self.borderSize, 0 + h / 2)};
        self.graphBlock.rect.position(0, height/2-h/2);
        self.graphManipulator.ordonator.set(0, self.graphBlock.rect);
        self.messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", 0, 0, w, h, 20, null, self.graphManipulator).text;
        (self.levelsTab.length !== 0) && self.levelsTab[self.levelsTab.length - 1].obj.content.component.getBBox && (self.messageDragDrop.x = (self.levelsTab.length !== 0) ? self.levelsTab[self.levelsTab.length - 1].obj.content.component.getBBox().width/2 + (self.levelWidth - self.graphCreaWidth)/2 :0);
        (self.levelsTab.length !== 0) && self.levelsTab[self.levelsTab.length - 1].obj.content.component.target && self.levelsTab[self.levelsTab.length - 1].obj.content.component.target.getBBox && (self.messageDragDrop.x = (self.levelsTab.length !== 0) ? self.levelsTab[self.levelsTab.length - 1].obj.content.component.target.getBBox().width/2 + (self.levelWidth - self.graphCreaWidth)/2 :0);
        self.messageDragDrop.y = self.messageDragDropMargin - self.graphCreaHeight/2 + (self.levelsTab.length) * self.levelHeight;
        self.messageDragDrop.position(self.messageDragDrop.x, self.messageDragDrop.y).color(myColors.grey);//.fontStyle("italic");
        self.graphBlock.rect._acceptDrop = true;
        self.graphManipulator.translator.move(w/2-self.borderSize, h/2);

        //self.frame.resize(self.levelWidth, self.levelHeight);

        var count = 1;
        for(var i = 0; i<self.levelsTab.length; i++){
            self.adjustGamesPositions(self.levelsTab[i]);

            self.levelsTab[i].gamesTab.forEach(function(tabElement){
                if(tabElement.miniatureManipulator){
                    self.graphManipulator.last.remove(tabElement.miniatureManipulator.first);
                }
                tabElement.miniatureManipulator = new Manipulator(tabElement);
                self.graphManipulator.last.add(tabElement.miniatureManipulator.first);// mettre un manipulateur par niveau !_! attention à bien les enlever

                var testGame = tabElement.displayMiniature(self.graphElementSize);
                if(tabElement instanceof Quizz){
                    svg.addEvent(testGame.cadre, "dblclick", onclickQuizzHandler);
                    svg.addEvent(testGame.content, "dblclick", onclickQuizzHandler);
                }else if(tabElement instanceof Bd){
                    // Ouvrir le Bd creator du futur jeu Bd
                }
                count ++;
            });
        }
    };
    self.displayFrame(self.graphCreaWidth, self.graphCreaHeight);
    self.displayGraph(self.graphCreaWidth, self.graphCreaHeight);
}

function FormationDisplayErrorMessage(message){
    var self = this;
    self.errorMessageDisplayed = autoAdjustText(message, 0, 0, self.graphCreaWidth, self.graphCreaHeight, 20, null, self.manipulator).text
        .color(myColors.red).position(drawing.width - MARGIN, 0).anchor("end");
}

function FormationRemoveErrorMessage(message) {
    message && message.parent && message.parent.remove(message);
}

function FormationsManagerDisplay() {
    var self = this;
    function displayPanel() {
        window.onkeydown = function (event) {
            if(hasKeyDownEvent(event)) {
                event.preventDefault();
            }
        };

        hasKeyDownEvent = function (event) {
            self.target = self.panel;
            return self.target && self.target.processKeys && self.target.processKeys(event.keyCode);
        };

        self.clippingManipulator = new Manipulator(self);
        self.manipulator.last.add(self.clippingManipulator.first);
        self.clippingManipulator.translator.move(MARGIN/2, self.headerHeightFormation);

        var totalLines = self.count%self.rows === 0 ? self.count/self.rows : self.count/self.rows+1;
        totalLines = parseInt(totalLines);
        self.panel = new gui.Panel(drawing.width-2*MARGIN-2*self.tileWidth/2+self.tileWidth, (2*MARGIN+self.tileHeight)*4, myColors.none);
        self.panel.resizeContent(totalLines*(MARGIN+self.tileHeight)+self.tileHeight/2);
        self.panel.component.move((drawing.width-2*MARGIN)/2, ((2*MARGIN+self.tileHeight)*4)/2);
        self.clippingManipulator.last.add(self.panel.component);
        self.panel.content.add(self.formationsManipulator.first);
        self.formationsManipulator.translator.move(self.tileWidth/2, self.tileHeight/2);
        self.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);


        onScroll = function (event) {
            var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
            if(delta === -1) {
                self.panel.moveContent(self.panel.content.y-100);
            } else {
                self.panel.moveContent(self.panel.content.y+100);
            }
        };
    }

    function onClickFormation(formation) {
        console.log("Tu as bien cliqué");
        formation.displayFormation();
    }

    function onClickNewFormation() {
        var formation = new Formation({});
        console.log("Tu as bien cliqué pour ajouter une formation");
        formation.displayFormation();
    }

    self.header.display();
    displayPanel();
    self.displayHeaderFormations = function () {
        self.title = new svg.Text("Formations").position(MARGIN, 0).font("Arial", 20).anchor("start");
        self.headerManipulator.last.add(self.title);
        self.addFormationButton = new svg.Text("Ajouter une formation");
        self.addFormationButton.position(MARGIN + self.plusDim, MARGIN / 2).font("Arial", 20).anchor("start");
        self.addButtonManipulator.last.add(self.addFormationButton);
        self.addFormationCadre = new svg.Rect(self.addButtonWidth, self.addButtonHeight).color(myColors.lightgrey).position(self.addButtonWidth / 2 - MARGIN, 0);
        self.addButtonManipulator.ordonator.set(0, self.addFormationCadre);

        self.addFormationObject = drawPlusWithCircle(MARGIN, 0, self.addButtonHeight, self.addButtonHeight);
        self.addButtonManipulator.ordonator.set(2, self.addFormationObject.circle);
        self.addButtonManipulator.ordonator.set(3, self.addFormationObject.plus);
        self.addFormationObject.circle.position(MARGIN, 0);

        svg.addEvent(self.addFormationObject.circle, "click", onClickNewFormation);
        svg.addEvent(self.addFormationObject.plus, "click", onClickNewFormation);
        svg.addEvent(self.addFormationCadre, "click", onClickNewFormation);
        svg.addEvent(self.addFormationButton, "click", onClickNewFormation);

        self.legendDim = self.plusDim / 2;

        self.checkLegend = statusEnum.Published.icon(0, 0, self.iconeSize);
        self.checkManipulator.ordonator.set(2, self.checkLegend.square);
        self.checkManipulator.ordonator.set(3, self.checkLegend.check);
        self.published = autoAdjustText("Publié", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.checkManipulator).text.anchor("start");
        self.published.position(25, self.published.y);

        self.exclamationLegend = statusEnum.Edited.icon(self.iconeSize);
        self.exclamationManipulator.ordonator.set(0, self.exclamationLegend.circle);
        self.exclamationManipulator.ordonator.set(4, self.exclamationLegend.exclamation);
        self.exclamationManipulator.ordonator.set(2, self.exclamationLegend.dot);
        self.toPublish = autoAdjustText("Nouvelle version à publier", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.exclamationManipulator).text.anchor("start");
        self.toPublish.position(25, self.toPublish.y);

        self.toPublish.component.getBBox && (self.legendWidth = self.toPublish.component.getBBox().width + 4 * MARGIN + 2 * self.iconeSize + 2*self.published.component.getBBox().width);
        self.toPublish.component.target && self.toPublish.component.target.getBBox && (self.legendWidth = self.toPublish.component.target.getBBox().width + 4 * MARGIN + 2 * self.iconeSize + 2*self.published.component.target.getBBox().width);

        self.checkManipulator.first.move(drawing.width - self.legendWidth, 30);
        self.published.component.getBBox && self.exclamationManipulator.first.move(drawing.width - self.legendWidth + 3*self.published.component.getBBox().width, 30);
        self.published.component.target && self.published.component.target.getBBox && self.exclamationManipulator.first.move(drawing.width - self.legendWidth + 3*self.published.component.target.getBBox().width, 30);


        //self.headerManipulator.translator.move(drawing.width - self.legendWidth, 0);
        //self.checkManipulator.translator.move(self.published.component.getBBox().width, 0);
        //self.exclamationManipulator.translator.move(2 * self.published.component.getBBox().width, 0);
        //self.toPublish.position(self.toPublish.component.getBBox().width / 2 + self.legendDim, self.toPublish.y);
    };

    self.formations.sort(function (a, b) {
        var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase();
        if (nameA < nameB)
            return -1;
        if (nameA > nameB)
            return 1;
        return 0
    });

    self.displayHeaderFormations();
    self.displayFormations = function () {
        var posx = self.initialFormationsPosX;
        var posy = MARGIN;
        var count = 0;
        for (var i = 0; i < self.formations.length; i++) {
            if (i !== 0) {
                posx += (self.tileWidth + 2 * MARGIN);
            }
            if (count > (self.rows - 1)) {
                count = 0;
                posy += (self.tileHeight + 2 * MARGIN);
                posx = self.initialFormationsPosX;
            }

            self.formations[i].parent = self;
            self.formationsManipulator.last.add(self.formations[i].manipulatorMiniature.first);
            //self.formationsManipulator.translator.move(self.tileWidth / 2 - MARGIN, self.tileHeight / 2 + 3 * MARGIN);
            self.formations[i].displayMiniature(self.tileWidth, self.tileHeight);
            self.formations[i].manipulatorMiniature.translator.move(posx, posy + MARGIN);

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

            })(self.formations[i]);
            count++;
        }
    };
    self.displayFormations();

}

function HeaderDisplay () {
    var self =this;
    self.line = new svg.Line(0, drawing.height*self.size, drawing.width, drawing.height*self.size).color(myColors.black, 3, myColors.black);
    self.text = new svg.Text(self.label).position(MARGIN, drawing.height*self.size*.75).font("Arial", 20).anchor("start");
    self.addMessage && (self.addMessageText = new svg.Text(self.addMessage).position(drawing.width/2, drawing.height*self.size/2).font("Arial", 32));
    self.addMessage ? self.manipulator.ordonator.set(2, self.addMessageText) : self.manipulator.ordonator.unset(2);
    self.manipulator.ordonator.set(1, self.text);
    self.manipulator.ordonator.set(0, self.line);
}

function PuzzleDisplay(x, y, w, h, startPosition) {
    var self=this;
    self.startPosition = startPosition;
    // Clear SetDisplay
    //self.questionWithBadAnswersManipulator.last.children.forEach(function (el) {
    //    self.questionWithBadAnswersManipulator.last.remove(el);
    //});
    self.puzzleManipulator.last.remove(self.questionWithBadAnswersManipulator.first);
    self.questionWithBadAnswersManipulator = new Manipulator(self);
    self.puzzleManipulator.last.add(self.questionWithBadAnswersManipulator.first);


    var removeArrows = function (){
        if(self.leftArrowManipulator.last.children.length>1) {
            //self.puzzleManipulator.last.remove(self.leftArrowManipulator.first);
            //self.leftArrowManipulator = new Manipulator(self);
            //self.puzzleManipulator.last.add(self.leftArrowManipulator.first);
            self.leftArrowManipulator.last.flush();
        }
        if (self.rightArrowManipulator.last.children.length>1){
            //self.puzzleManipulator.last.remove(self.rightArrowManipulator.first);
            //self.rightArrowManipulator=new Manipulator(self);
            //self.puzzleManipulator.last.add(self.rightArrowManipulator.first);
            self.rightArrowManipulator.last.flush();
        }
    };

    self.handlerLeftArrow = function (){
        if (self.rows === 1 && startPosition !== 0) {
            removeArrows();
            self.display(x, y, w, h, startPosition - 1);
        } else if (startPosition - self.rows + 1 <= 0) {
            removeArrows();
            self.display(x, y, w, h, 0);
        } else {
            removeArrows();
            self.display(x, y, w, h, startPosition - self.rows + 1);
        }
    };

    if (self.rows < self.totalRows) {
        if(startPosition === 0) {
            self.leftArrow=drawArrow(0,0, 75, 75,self.leftArrowManipulator);
            self.leftArrow.color(myColors.grey);
            if(self.leftArrow.onClick!==null){
                svg.removeEvent(self.leftArrow,'click',self.leftArrow.onClick);
            }
        } else {
            self.leftArrow=drawArrow(0,0, 75, 75,self.leftArrowManipulator);
            self.leftArrow.color(myColors.black);
            svg.addEvent(self.leftArrow, "click",self.handlerLeftArrow);
        }

        //self.puzzleManipulator.last.add(self.leftArrowManipulator.first);
        self.leftArrowManipulator.rotator.rotate(180);
        //self.leftArrowManipulator.translator.move(x+self.margin+75/2,y + (h/2)+75/2);
        self.leftArrowManipulator.translator.move(-w/2-MARGIN+75/2, y+h/2);// marge post-rotation

        // self.leftArrowManipulator.scalor.scale(self.leftArrowManipulator.scale);

        self.handlerRightArrow = function (){
            if(self.rows === 1 && startPosition !== self.totalRows -1) {
                removeArrows();
                self.display(x, y, w, h, startPosition+1);
            } else if(2*self.rows + startPosition >= self.totalRows) {
                removeArrows();
                var newStartPosition = self.totalRows - self.rows;
                self.display(x, y, w, h, newStartPosition);
            } else {
                removeArrows();
                newStartPosition = startPosition + self.rows - 1;
                self.display(x, y, w, h, newStartPosition);
            }

        };


        if(startPosition + self.rows>= self.totalRows) {
            self.rightArrow= drawArrow(0, 0, 75, 75,self.rightArrowManipulator);
            self.rightArrow.color(myColors.grey);
            if(self.rightArrow.onClick!==null){
                svg.removeEvent(self.rightArrow,'click',self.rightArrow.onClick);
            }
        } else {
            self.rightArrow=drawArrow(0, 0, 75, 75,self.rightArrowManipulator);
            self.rightArrow.color(myColors.black);
            svg.addEvent(self.rightArrow, "click", self.handlerRightArrow);
        }


        //self.puzzleManipulator.push(self.rightArrow);
        //self.rightArrowManipulator=paper.set();
        //self.rightArrowManipulator.push(self.rightArrow);
        self.rightArrowManipulator.translator.move(w/2-75/2+MARGIN, y+h/2);
        //self.rightArrowManipulator.manipulator.scalor.scale(self.rightArrowManipulator._scale);

        self.initTiles(x+MARGIN+50, y, w-100-MARGIN*2, h, startPosition);
    } else {
        self.initTiles(x, y, w, h, startPosition);
    }


}

function PuzzleInitTiles(x, y, w, h, startPosition) {
    var self=this;
    self.tileWidth=(w-(self.rows-1)*MARGIN)/self.rows;
    self.tileHeight=(h-(self.lines+1)*MARGIN)/self.lines;

    var posX=0;
    var posY=y;

    var count = startPosition*self.lines;

    if(self.reverseMode) {
        // Valable pour 2 lignes 4 col
        for(var i = startPosition; i<(startPosition+self.lines); i++) {
            for(var j = 0; j<self.rows; j++) {
                if(count < self.questionsTab.length) {
                    self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].manipulator.first);
                    if(!(self.virtualTab[i][j].bordure)){
                        self.virtualTab[i][j].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
                        if(self.virtualTab[i][j].bordure && self.virtualTab[i][j].bordureEventHandler){
                            svg.addEvent(self.virtualTab[i][j].bordure,'click',self.virtualTab[i][j].bordureEventHandler);
                        }
                        if(self.virtualTab[i][j].content && self.virtualTab[i][j].contentEventHandler){
                            svg.addEvent(self.virtualTab[i][j].content,'click',self.virtualTab[i][j].contentEventHandler);
                        }
                        if(self.virtualTab[i][j].raphImage && self.virtualTab[i][j].imageEventHandler){
                            svg.addEvent(self.virtualTab[i][j].raphImage,'click',self.virtualTab[i][j].imageEventHandler);
                        }
                    }
                    self.virtualTab[i][j].manipulator.first.move(posX+self.tileWidth/2+MARGIN,posY+MARGIN);

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
        for (var i = startPosition; i < (startPosition + self.rows); i++) {
            for (var j = 0; j < self.lines; j++) {
                if (count < self.questionsTab.length) {
                    if(self.virtualTab[i][j] instanceof AddEmptyElement){
                        self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].manipulator.first);
                    }else{
                        self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].questionManipulator.first);
                    }
                    self.virtualTab[i][j].display(0, 0, self.tileWidth, self.tileHeight);
                    if(self.virtualTab[i][j].bordure && self.virtualTab[i][j].bordureEventHandler){
                        svg.addEvent(self.virtualTab[i][j].bordure,'click',self.virtualTab[i][j].bordureEventHandler);
                    }
                    if(self.virtualTab[i][j].content && self.virtualTab[i][j].contentEventHandler){
                        svg.addEvent(self.virtualTab[i][j].content,'click',self.virtualTab[i][j].contentEventHandler);
                    }
                    if(self.virtualTab[i][j].raphImage && self.virtualTab[i][j].imageEventHandler){
                        svg.addEvent(self.virtualTab[i][j].raphImage,'click',self.virtualTab[i][j].imageEventHandler);
                    }
                    // }

                    if(self.virtualTab[i][j] instanceof AddEmptyElement){
                        self.virtualTab[i][j].manipulator.translator.move(posX+self.tileWidth/2-w/2,posY+self.tileHeight/2+MARGIN);
                    }else{
                        self.virtualTab[i][j].questionManipulator.translator.move(posX+self.tileWidth/2-w/2,posY+self.tileHeight/2+MARGIN);
                    }


                    posY += self.tileHeight + MARGIN;
                    count++;
                }
                else {
                    break;
                }
            }
            posX += self.tileWidth +  MARGIN;
            posY = y;
        }
    }
}

function QuestionDisplay(x, y, w, h) {
    var self=this;
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
        var objectTotal = displayImageWithTitle(self.label, self.imageSrc, {width:self.image.width, height:self.image.height}, self.width, self.height, self.colorBordure, self.bgColor, self.fontSize, self.font, self.questionManipulator, self.raphImage);
        self.bordure = objectTotal.cadre;
        self.content = objectTotal.content;
        self.raphImage = objectTotal.image;
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
        //var point=self.questionManipulator.globalToLocal(self.x,self.y);
        self.bordure = new svg.Rect( self.width, self.height).color(self.bgColor,1,self.colorBordure);
        self.questionManipulator.ordonator.set(0, self.bordure);
    }
    var fontSize = Math.min(20, h*0.1);
    self.questNum = new svg.Text(self.questionNum).position(-w/2+MARGIN+(fontSize*(self.questionNum.toString.length)/2), -h/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
    self.questionManipulator.ordonator.set(4, self.questNum);
    self.questionManipulator.translator.move(self.x,self.y);
    self.selected && self.selectedQuestion();
    //self.questionManipulator.ordonator.children.forEach(function(e){
    //    manageDnD(e,self.questionManipulator);
    //});
}

function QuestionElementClicked(sourceElement) {
    var self=this;
    if(self.multipleChoice===false){// question normale, une seule réponse possible
        if(sourceElement.correct) {
            self.parentQuizz.score++;
            console.log("Bonne réponse!\n");
        } else {
            self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex]);
            var reponseD="";
            self.rightAnswers.forEach(function(e){
                if(e.label)
                {
                    reponseD+= e.label+"\n";
                }
                else if(e.imageSrc)
                {
                    var tab=e.imageSrc.split('/');
                    reponseD+= tab[(tab.length-1)]+"\n";
                }
            });
            console.log("Mauvaise réponse!\n  Bonnes réponses: \n"+reponseD);
        }

        self.parentQuizz.nextQuestion();
    }else{// question à choix multiples
        if(sourceElement.selected===false){
            // on sélectionne une réponse
            sourceElement.selected=true;
            self.selectedAnswers.push(sourceElement);
            sourceElement.colorBordure = sourceElement.bordure.strokeColor;
            sourceElement.bordure.color(sourceElement.bgColor, 5, SELECTION_COLOR);
            self.resetButton.cadre.color(myColors.yellow,1,myColors.green);

        }else{
            sourceElement.selected=false;
            self.selectedAnswers.splice(self.selectedAnswers.indexOf(sourceElement),1);
            sourceElement.bordure.color(sourceElement.bgColor,1,sourceElement.colorBordure);
            if(self.selectedAnswers.length==0){
                self.resetButton.cadre.color(myColors.grey,1,myColors.grey);
            }
        }
    }
}

function QuestionDisplayAnswers(x, y, w, h) {
    var self = this;
    if (self.rows !== 0) {

        //self.answersManipulator.translator.move(0,0);
        if(typeof x !=='undefined'){
            (self.initialAnswersPosX=x);
        }
        if(typeof w !=='undefined' ){
            ( self.tileWidth= (w - MARGIN * (self.rows - 1)) / self.rows);
        }
        self.tileHeight = 0;
        self.multipleChoice && (h=h-50);

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
        self.questionManipulator.last.add(self.answersManipulator.first);
        //self.answersManipulator.translator.move(0,self.height/2+2*MARGIN);
        self.answersManipulator.translator.move(0,self.height/2+(self.tileHeight)/2);

        //var posx = x;
        //var posy = y + self.height + MARGIN * 2;

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

            //self.tabAnswer[i].display(-tileWidth/2, -self.tileHeight/2, tileWidth, self.tileHeight);
            //self.tabAnswer[i].manipulator.first.move(posx+tileWidth/2,posy+self.tileHeight/2);
            /*self.tabAnswer[i].display(0, 0, tileWidth, self.tileHeight);*/
            //self.tabAnswer[i].manipulator.translator.move(posx+tileWidth/2,posy+self.tileHeight/2);
            //self.tabAnswer[i].manipulator.translator.move(posx-tileWidth/2-MARGIN/2,posy-self.tileHeight/2-MARGIN/2);
            /*self.tabAnswer[i].manipulator.translator.move(posx-tileWidth/2-MARGIN/2,posy);*/

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
        var w=150;
        var h=50;
        var validateX,validateY;
        validateX=-75+100;
        validateY=self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;

        var validateButton=displayText("Valider",w,h,myColors.green,myColors.yellow,20, self.font,self.validateManipulator);
        self.validateManipulator.translator.move(validateX+w/2,validateY+h/2);

        //button. onclick
        var oclk = function(){
            // test des valeurs, en gros si selectedAnswers === rigthAnswers
            var allRight=false;

            if(self.rightAnswers.length!=self.selectedAnswers.length){
                allRight=false;
            }else{
                var subTotal=0;
                self.selectedAnswers.forEach(function(e){
                    if(e.correct){
                        subTotal++;
                    }
                });

                if(subTotal===self.rightAnswers.length){
                    allRight=true;
                }else{
                    allRight=false;
                }

            }

            if(allRight) {
                self.parentQuizz.score++;
                console.log("Bonne réponse!\n");
            } else {
                self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex]);
                var reponseD="";
                self.rightAnswers.forEach(function(e){
                    if(e.label) {
                        reponseD+= e.label+"\n";
                    }
                    else if(e.imageSrc)
                    {
                        var tab=e.imageSrc.split('/');
                        reponseD+= tab[(tab.length-1)]+"\n";
                    }
                });
                console.log("Mauvaise réponse!\n  Bonnes réponses: "+reponseD);
            }

            self.parentQuizz.nextQuestion();

        };
        svg.addEvent(validateButton.cadre, 'click', oclk);
        svg.addEvent(validateButton.content, 'click', oclk);

        //Button reset
        var w = 150;
        var h = 50;
        var resetX =- 75 -100;
        var resetY = self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;
        self.resetButton=displayText("Reset",w,h,myColors.grey,myColors.grey,20, self.font,self.resetManipulator);
        self.resetManipulator.translator.move(resetX+w/2,resetY+h/2);
        if(self.selectedAnswers.length!=0){
            self.resetButton.cadre.color(myColors.yellow,1,myColors.green);
        }
        self.reset = function(){
            if(self.selectedAnswers.length>0){
                self.selectedAnswers.forEach(function(e){
                    e.selected = false;
                    e.bordure.color(e.bgColor,1,e.colorBordure);
                });
                self.selectedAnswers.splice(0,self.selectedAnswers.length);
                self.resetButton.cadre.color(myColors.grey,1,myColors.grey);
            }
        };
        svg.addEvent(self.resetButton.content,'click',self.reset);
        svg.addEvent(self.resetButton.cadre,'click',self.reset);
    }

}

function QuestionSelectedQuestion() {
    this.bordure.color(this.bgColor, 5, SELECTION_COLOR);
}

function QuestionCreatorDisplay (x, y, w, h) {
    var self=this;
    self.previousX = x;
    self.previousY = y;
    self.previousW = w;
    self.previousH = h;

    self.questionCreatorHeight = Math.floor(h * (1 - self.headerHeight) - 80);
    //var reponseAreaHeight=Math.floor(h*);
    self.questionCreatorManipulator.translator.move(x, 0);
    self.toggleButtonHeight = 40;
    self.displayQuestionCreator(MARGIN+x, y, w, h);
    var clickedButton= self.multipleChoice? myQuizzType.tab[1].label :myQuizzType.tab[0].label;
    self.displayToggleButton(MARGIN+x, MARGIN/2+y, w,self.toggleButtonHeight-MARGIN, clickedButton);

}

function QuestionCreatorDisplayToggleButton (x, y, w, h, clicked){
    var self=this;
    var size = self.puzzle.tileHeight*0.2;
    var toggleHandler = function(event){
        self.target = drawing.getTarget(event.clientX, event.clientY);
        var questionType = self.target.parent.children[1].messageText;
        if (self.multipleChoice){
            self.tabAnswer.forEach(function(answer){
                if(answer instanceof AnswerElement){
                    answer.multipleAnswer = answer.correct;
                    answer.linkedAnswer.parent.multipleChoice=answer.correct;
                    answer.linkedAnswer.parent.simpleChoice=!answer.correct;
                    (typeof answer.simpleAnswer === 'undefined') && (answer.simpleAnswer = false);
                    answer.correct = answer.simpleAnswer;
                    answer.linkedAnswer.correct = answer.simpleAnswer;
                }});
        }
        else if (self.simpleChoice){
            self.tabAnswer.forEach(function(answer){
                if(answer instanceof AnswerElement){
                    answer.simpleAnswer = answer.correct;
                    answer.linkedAnswer.parent.simpleChoice=answer.correct;
                    answer.linkedAnswer.parent.multipleChoice=!answer.correct;
                    (typeof answer.multipleAnswer==='undefined') && (answer.multipleAnswer = false);
                    answer.correct = answer.multipleAnswer;
                    answer.linkedAnswer.correct = answer.multipleAnswer;

                }});
        }

        (questionType === "Réponses multiples") ? (self.multipleChoice = true) : (self.multipleChoice = false);
        (questionType === "Réponse unique") ? (self.simpleChoice = true) : (self.simpleChoice = false);
        self.activeQuizzType = (self.simpleChoice === true) ? self.quizzType[0] : self.quizzType[1];
        self.errorMessagePreview && self.errorMessagePreview.parent && self.parent.previewButtonManipulator.last.remove(self.errorMessagePreview);

        self.tabAnswer.forEach(function(answer) {
            if (answer.obj.checkbox) {
                self.simpleChoice && (answer.correct = false);
                self.multipleChoice && (answer.correct = false);
                self.simpleChoice && (answer.linkedAnswer.correct = false);
                self.multipleChoice && (answer.linkedAnswer.correct = false);
            }
        });
        self.tabAnswer.forEach(function(answer){
            var xCheckBox, yCheckBox = 0;
            if (answer.obj.checkbox) {
                xCheckBox = answer.obj.checkbox.x;
                yCheckBox = answer.obj.checkbox.y;
                if (self.simpleChoice || self.multipleChoice){
                    //if(typeof answer.checkbox ==='undefined')
                    //{
                    answer.obj.checkbox = displayCheckbox(xCheckBox, yCheckBox, size, answer).checkbox;
                    answer.obj.checkbox.answerParent = answer;

                    //}
                }
            }
        });
        self.displayToggleButton(x, y, w, h, questionType);

    };

    self.toggleButtonWidth = 300;
    var length = self.quizzType.length;
    var lengthToUse = (length+1)*MARGIN+length*self.toggleButtonWidth;
    self.margin = (w-lengthToUse)/2;
    self.x = self.margin+self.toggleButtonWidth/2+MARGIN;
    var i = 0;
    self.virtualTab=[];
    self.quizzType.forEach(function(type){
        self.virtualTab[i] = {};
        self.virtualTab[i].manipulator= new Manipulator(self);
        self.toggleButtonManipulator.last.add(self.virtualTab[i].manipulator.first);
        //type.default && (self.clicked = self.virtualTab[i]);
        (type.label == clicked) ? (self.virtualTab[i].color = SELECTION_COLOR) : (self.virtualTab[i].color = myColors.white);
        self.virtualTab[i].toggleButton = displayTextWithoutCorners(type.label, self.toggleButtonWidth, h, myColors.black, self.virtualTab[i].color, 20, null, self.virtualTab[i].manipulator);
        self.virtualTab[i].toggleButton.content.color(getComplementary(self.virtualTab[i].color), 0, myColors.black);
        self.virtualTab[i].manipulator.translator.move(self.x,MARGIN+h/2);
        self.x += self.toggleButtonWidth + MARGIN;
        (type.label != clicked) && (svg.addEvent(self.virtualTab[i].toggleButton.content, "click", toggleHandler));
        (type.label != clicked) && (svg.addEvent(self.virtualTab[i].toggleButton.cadre, "click", toggleHandler));

        i++;
    });
    //self.toggleButton = displayTextWithoutCorners("Choix unique", w-2*MARGIN, h, myColors.black, myColors.none, self.fontSize, null, self.toggleButtonManipulator);
    //self.toggleButton.cadre.position(w/2, h/2);
    //self.toggleButton.content.position(w/2, h/2);
    self.activeQuizzType = (self.simpleChoice === true) ? self.quizzType[0] : self.quizzType[1];
    self.toggleButtonManipulator.translator.move(0, y);
}

function QuestionCreatorDisplayQuestionCreator (x, y, w, h) {
    var self=this;
    var showTitle = function () {
        var color = (self.label) ? myColors.black : myColors.grey;
        var text = (self.label) ? self.label : self.labelDefault;
        if(self.linkedQuestion.image){
            var img = self.linkedQuestion.image;
            self.questionBlock.title = displayImageWithTitle(text, img.src, img, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, self.font, self.questionManipulator);
            self.questionBlock.title.image._acceptDrop = true;
        } else {
            self.questionBlock.title = displayText(text, self.w - 2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, self.font, self.questionManipulator);
        }
        var fontSize = Math.min(20, self.h*0.1);
        self.questNum = new svg.Text(self.questionNum).position(-self.w/2+2*MARGIN+(fontSize*(self.questionNum.toString.length)/2), -self.h*0.25/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
        self.questionManipulator.ordonator.set(6, self.questNum);
        self.questionBlock.title.content.color(color);
        self.questionBlock.title.content._acceptDrop = true;
        // self.questionBlock.title.cadre.fillOpacity(0.001);
        self.questionBlock.title.cadre.color(self.bgColor, 1, self.colorBordure);
        self.questionBlock.title.cadre._acceptDrop = true;
        svg.addEvent(self.questionBlock.title.content, "dblclick", dblclickEdition);
        svg.addEvent(self.questionBlock.title.cadre, "dblclick", dblclickEdition);
        //move
        self.questionManipulator.first.move(w/2, y + self.toggleButtonHeight + 2 * MARGIN + self.questionBlock.title.cadre.height/2);
    };

    var dblclickEdition = function () {
        var textarea = document.createElement("TEXTAREA");
        textarea.textContent = self.label;
        textarea.width = self.w;

        //(self.questionManipulator.ordonator.children[2] instanceof svg.Image) ? (textarea.height = self.questionBlock.title.content.component.getBBox().height) : (textarea.height = (self.h * .25)/2);
        textarea.height = (self.linkedQuestion.image) ? (self.questionBlock.title.content.component.getBBox().height) : ((self.h * .25)/2);

        self.questionManipulator.ordonator.unset(1);//, self.questionBlock.title.content);
        textarea.globalPointCenter = self.questionBlock.title.content.globalPoint(-(textarea.width)/2, -(textarea.height)/2);

        var contentareaStyle = {
            toppx: (self.linkedQuestion.image) ? (-textarea.height + 1 - drawing.height + textarea.globalPointCenter.y) : (- drawing.height + textarea.globalPointCenter.y),
            leftpx: (textarea.globalPointCenter.x+1/12*self.w),
            width: (self.w*5/6),
            height: (textarea.height)
        };
        textarea.setAttribute("style", "position: relative; top:" +contentareaStyle.toppx+ "px; left:" + contentareaStyle.leftpx + "px; width:" +contentareaStyle.width+ "px; height:" +contentareaStyle.height+ "px; text-align: center; display: table-cell; font-family: Arial; font-size: 20px; resize: none; outline: none; border: none; background-color: transparent; padding-top:" + ((textarea.height - 4 * MARGIN)/2 - 20) + "px; overflow: hidden;");
        var body = document.getElementById("content");
        body.appendChild(textarea).focus();

        var onblur = function () {
            console.log(textarea);
            if(textarea.value){
                self.label = textarea.value;
                self.linkedQuestion.label=textarea.value;
            }

            body.removeChild(textarea);
            //textarea.remove();
            //self.questionManipulator.ordonator.unset(0);//, self.questionBlock.title.cadre);
            showTitle();
            self.parent.displayQuestionsPuzzle(null, null, null, null, self.parent.questionPuzzle.startPosition);
        };

        var removeErrorMessage = function () {
            self.questionNameValidInput = true;
            self.errorMessage && self.questionCreatorManipulator.ordonator.unset(5);
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
                .font("arial", 15).color(myColors.red).anchor(anchor);
            self.questionCreatorManipulator.ordonator.set(5, self.errorMessage);
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

    // bloc Question
    self.questionCreatorManipulator.last.flush();
    self.questionBlock = {rect: new svg.Rect(self.w, self.h).color([], 1, myColors.black).position(self.w / 2, y + self.h / 2)};
    self.questionCreatorManipulator.last.add(self.questionBlock.rect);

    showTitle();

    // bloc Answers
    if (self.tabAnswer.length !== self.MAX_ANSWERS) {
        self.tabAnswer.push(new AddEmptyElement(self, 'answer'));
    }
    self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true, self);
    self.questionCreatorManipulator.last.add(self.puzzle.puzzleManipulator.first);
    self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y+self.toggleButtonHeight + self.questionBlock.title.cadre.height/2 - 2*MARGIN, self.coordinatesAnswers.w, self.coordinatesAnswers.h , 0);
}

function QuizzDisplay(x,y,w,h) {
    var self=this;
    mainManipulator.ordonator.set(1, self.quizzManipulator.first);

    x && (self.x = x);
    y && (self.y = y);
    w && (self.cadreQuestion.w = w);
    (w && x) && (self.cadreResult.w = w );
    x && (self.cadreResult.x = x);
    w && (self.cadreTitle.w = w);
    x && (self.quizzMarginX = x);
    self.headerPercentage = 0.1;
    self.questionPercentageWithImage = 0.3;
    self.questionPercentage = 0.2;
    self.responsePercentageWithImage = 0.6;
    self.responsePercentage = 0.7;

    var heightPage = document.documentElement.clientHeight;

    self.headerHeight = heightPage * self.headerPercentage - MARGIN;
    self.questionHeight = heightPage * self.questionPercentage -  MARGIN;
    self.responseHeight = heightPage * self.responsePercentage -  MARGIN;
    self.questionHeightWithoutImage = heightPage * self.questionPercentage -  MARGIN;
    self.responseHeightWithoutImage = heightPage * self.responsePercentage -  MARGIN;
    self.questionHeightWithImage = heightPage * self.questionPercentageWithImage -  MARGIN;
    self.responseHeightWithImage = heightPage * self.responsePercentageWithImage -  MARGIN;

    var object = displayText(self.title, (self.cadreTitle.w ), (self.headerHeight ), self.colorBordure, self.bgColor, self.fontSize, self.font, self.quizzManipulator);
    self.titleBox = object.cadre;
    self.titleText = object.content;

    self.quizzManipulator.ordonator.set(1,self.titleText);

    self.quizzManipulator.ordonator.set(0,self.titleBox);
    self.quizzManipulator.translator.move(self.cadreQuestion.w/2,self.headerHeight/2);

    if(self.currentQuestionIndex===-1){// on passe à la première question
        self.nextQuestion();
    }
}

function QuizzDisplayResult (color){
    var self=this;
    //this.resultManipulator = new Manipulator(this);
    //this.puzzle.display(this.cadreResult.x, this.cadreResult.y+this.cadreResult.h+15, this.cadreResult.w, 600, 0);
    self.displayScore(color);
    self.puzzle.display(0, self.questionHeight/2, drawing.width,self.responseHeight, self.puzzle.startPosition);
    //this.resultManipulator.last.add(this.puzzle.puzzleManipulator.translator);
}

function GameDisplayMiniature(size){
    var self = this;
    var obj = displayTextWithCircle(self.title, size, size, myColors.black, myColors.white, 20, null, self.miniatureManipulator);
    self.miniatureManipulator.first.move(self.miniaturePosition.x, self.miniaturePosition.y);

    return obj;
}

function QuizzDisplayScore(color){
    var self = this;
    var autoColor;
    switch(this.score) {
        case self.tabQuestions.length:
            str1="Impressionant !";
            str2=" et toutes sont justes !";
            autoColor=[100,255,100];
            break;
        case 0:
            str1="Votre niveau est désolant... Mais gardez espoir !";
            str2="dont aucune n'est juste !";
            autoColor=[255,17,0];
            break;
        case (self.tabQuestions.length-1):
            str1="Pas mal du tout !";
            str2=" et toutes (sauf une...) sont justes !";
            autoColor=[200,255,0];
            break;
        case 1:
            str1="Vous avez encore de nombreux progrès à faire.";
            str2="dont une seule est juste.";
            autoColor=[255,100,0];
            break;
        default:
            str1="Correct, mais ne relachez pas vos efforts !";
            str2=" dont "+self.score+" sont justes !";
            autoColor=[220,255,0];
            break;
    }
    var str1,str2;

    self.finalMessage=str1+" Vous avez répondu à "+self.tabQuestions.length+" questions, "+str2;
    if(!color) {
        var usedColor=autoColor;
    } else {
        usedColor=color;
    }

    self.resultManipulator = new Manipulator(self);
    self.scoreManipulator=new Manipulator(self);
    self.resultManipulator.translator.move(0,self.questionHeight/2+self.headerHeight/2+MARGIN);
    self.resultManipulator.last.add(self.scoreManipulator.first);
    self.resultManipulator.last.add(self.puzzle.puzzleManipulator.first);
    self.quizzManipulator.last.add(self.resultManipulator.first);

    var object = displayText(self.finalMessage,self.cadreTitle.w,self.questionHeight, myColors.black, usedColor, self.fontSize, self.font, self.scoreManipulator);

}

function QuizzManagerDisplay(){
    var self=this;
    mainManipulator.ordonator.set(1, self.quizzManagerManipulator.first);

    self.questionClickHandler=function(event){
        var target=drawing.getTarget(event.clientX,event.clientY);
        var element=target.parent.parentManip.parentObject;
        self.quizz.tabQuestions[self.indexOfEditedQuestion].selected = false;
        element.selected = true;
        self.displayQuestionsPuzzle(null, null, null, null, self.questionPuzzle.startPosition);
        var index= self.quizz.tabQuestions.indexOf(element);
        self.indexOfEditedQuestion=index;
        self.questionCreator.loadQuestion(element);
        self.questionCreatorManipulator.last.flush();
        self.questionCreator.display(self.questionCreator.previousX,self.questionCreator.previousY,self.questionCreator.previousW,self.questionCreator.previousH);
    };

    self.bib.run(self.globalMargin.width/2, self.quizzInfoHeight+self.questionsPuzzleHeight+self.globalMargin.height/2,
        self.bibWidth-self.globalMargin.width/2, self.bibHeight-self.globalMargin.height, function(){
            self.displayQuizzInfo(self.globalMargin.width/2, self.quizzInfoHeight/2, drawing.width,self.quizzInfoHeight);
            self.displayQuestionsPuzzle(self.questionPuzzleCoordinates.x, self.questionPuzzleCoordinates.y, self.questionPuzzleCoordinates.w, self.questionPuzzleCoordinates.h);
            self.questionCreator.display(self.bib.x + self.bibWidth, self.bib.y,
                self.questCreaWidth-self.globalMargin.width, self.questCreaHeight-self.globalMargin.height);
            self.displayPreviewButton(drawing.width/2, drawing.height - self.previewButtonHeight/2-MARGIN/2,
                150, self.previewButtonHeight-self.globalMargin.height);

        });

}

function QuizzManagerDisplayQuizzInfo (x, y, w, h) {
    var self=this;

    self.formationLabel = new svg.Text("Formation : " + self.formationName);
    self.formationLabel.font("arial", 20).anchor("start");
    self.quizzInfoManipulator.ordonator.set(2,self.formationLabel);

    var showTitle = function () {
        var text = (self.quizzName) ? self.quizzName : self.quizzNameDefault;
        var color = (self.quizzName) ? myColors.black : myColors.grey;
        var bgcolor = myColors.grey;

        self.quizzLabel = {};
        var width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBBox().width;

        self.quizzLabel.content = autoAdjustText(text, 0, 0, w, h/2, 15, "Arial", self.quizzInfoManipulator).text;
        self.quizzLabel.content.component.getBBox && (self.quizzNameHeight = self.quizzLabel.content.component.getBBox().height);
        self.quizzLabel.content.component.target.getBBox && (self.quizzNameHeight = self.quizzLabel.content.component.target.getBBox().height);
        self.quizzLabel.cadre = new svg.Rect(width, 0.5*h).color(bgcolor);
        self.quizzLabel.cadre.position(width/2,self.quizzLabel.cadre.height).fillOpacity(0.1);
        self.quizzInfoManipulator.ordonator.set(0, self.quizzLabel.cadre);
        self.quizzLabel.content.position(0, h/2 +self.quizzLabel.cadre.height/4).color(color).anchor("start");

        self.quizzInfoManipulator.first.move(x,y);
        svg.addEvent(self.quizzLabel.content, "dblclick", dblclickEdition);
        svg.addEvent(self.quizzLabel.cadre, "dblclick", dblclickEdition);
    };

    var dblclickEdition = function (event) {
        var width;
        self.quizzLabel.content.component.getBBox && (width = self.quizzLabel.content.component.getBBox().width);
        //self.quizzInfoManipulator.ordonator.unset(0);
        self.quizzInfoManipulator.ordonator.unset(1);

        var textarea = document.createElement("TEXTAREA");
        textarea.value = self.quizzName;
        var contentareaStyle = {
            toppx:(self.quizzInfoHeight-self.quizzNameHeight/4+3),
            leftpx: (x+MARGIN/2 + 1),
            width: 700,
            height:(self.quizzNameHeight+3)
        };
        textarea.setAttribute("style", "position: absolute; top:" + contentareaStyle.toppx + "px; left:" + contentareaStyle.leftpx + "px; width:" + (contentareaStyle.width) + "px; height:" + contentareaStyle.height + "px; resize: none; border: none; outline:none; overflow:hidden; font-family: Arial; font-size: 15px; background-color: transparent;");
        var body = document.getElementById("content");
        body.appendChild(textarea).focus();

        var removeErrorMessage = function () {
            self.questionCreator.quizzNameValidInput = true;
            self.errorMessage && self.quizzInfoManipulator.ordonator.unset(5);
            self.quizzLabel.cadre.color(myColors.grey, 1, myColors.none);
            self.quizzNameValidInput = true;
        };

        var displayErrorMessage = function () {
            removeErrorMessage();
            self.quizzLabel.cadre.color(myColors.grey, 2, myColors.red);
            //var position = (textarea.getBoundingClientRect().left - MARGIN);
            var anchor = 'start';
            self.errorMessage = new svg.Text(REGEXERROR)
                .position(self.quizzLabel.cadre.width + MARGIN, h/2 +self.quizzLabel.cadre.height/4)
                .font("arial", 15).color(myColors.red).anchor(anchor);
            self.quizzInfoManipulator.ordonator.set(5, self.errorMessage);
            textarea.focus();
            self.quizzNameValidInput = false;
        };
        var onblur = function () {
            self.quizzNameValidInput && (self.quizzName = textarea.value);
            textarea.remove();
            showTitle();
            //removeErrorMessage();
        };
        textarea.oninput = function () {
            self.questionCreator.checkInputTextArea({
                textarea: textarea,
                border: self.quizzLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
            //self.questionCreator.checkInputTextArea(textarea, "quizzNameValidInput", onblur, self.quizzLabel.cadre);
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
    var self=this;
    self.previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, self.previewButtonManipulator);

    self.questionCreator.errorMessagePreview && self.questionCreator.errorMessagePreview.parent && self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
    var previewFunction = function () {
        self.toggleButtonHeight = 40;

        var validation = true;
        console.log(self.questionCreator.activeQuizzType);
        self.questionCreator.activeQuizzType.validationTab.forEach(function (funcEl) {
            var result = funcEl(self);
            if(!result.isValid) {
                self.questionCreator.errorMessagePreview && self.questionCreator.errorMessagePreview.parent && self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
                self.questionCreator.errorMessagePreview = new svg.Text(result.message)
                    .position(0,-self.toggleButtonHeight)
                    .font("arial", 20)
                    .anchor('middle').color(myColors.red);
                self.previewButtonManipulator.last.add(self.questionCreator.errorMessagePreview);
            }
            validation = validation&&result.isValid;
        });

        if(validation) {
            var tabAnswer = [];
            //self.questionCreator.tabAnswer.forEach(function (el) {
            //    if (el instanceof AnswerElement) {
            //        tabAnswer.push(el.toAnswer());
            //    }
            //});

            //var questionObject = {
            //    label: self.questionCreator.linkedQuestion.label,
            //    imageSrc:(self.questionCreator.linkedQuestion.image)?(self.questionCreator.linkedQuestion.image.src):null,
            //    tabAnswer: self.questionCreator.linkedQuestion.tabAnswer,
            //    multipleChoice:self.questionCreator.multipleChoice,
            //    font:self.questionCreator.linkedQuestion.font,
            //    fontSize:self.questionCreator.linkedQuestion.fontSize,
            //    nbrows: 4,
            //    colorBordure: self.questionCreator.linkedQuestion.rgbBordure,
            //    bgColor: self.questionCreator.linkedQuestion.bgColor
            //};

            self.tabQuestions[self.indexOfEditedQuestion] = self.quizz.tabQuestions[self.indexOfEditedQuestion];

            var tmpQuizzObject = {
                title: self.quizzName,
                bgColor: myColors.white,
                tabQuestions: [self.tabQuestions[self.indexOfEditedQuestion]],
                puzzleLines: 3,
                puzzleRows: 3
            };



            self.quizzManagerManipulator.last.flush();

            var tmpQuizz = new Quizz(tmpQuizzObject, true);
            tmpQuizz.run(1, 1, document.body.clientWidth, drawing.height);
        }
    };
    svg.addEvent(self.previewButton.cadre, "click", previewFunction);
    svg.addEvent(self.previewButton.content, "click", previewFunction);

    //self.previewButtonManipulator.last.add(self.previewButton.cadre);
    //self.previewButtonManipulator.last.add(self.previewButton.content);

    self.previewButtonManipulator.translator.move(x, y);
    // self.previewButtonManipulator.translator.move(w/2-MARGIN, h - self.headerHeight*h);
}

function QuizzManagerDisplayQuestionPuzzle(x, y, w, h, index) {
    var self = this;
    var index = index ? index : 0;
    x && (self.qPuzzleX=x);
    y && (self.qPuzzleY=y);
    w && (self.qPuzzleW=w);
    h && (self.qPuzzleH=h);
    self.questionPuzzle.puzzleManipulator && self.questionsPuzzleManipulator.last.remove(self.questionPuzzle.puzzleManipulator.first);
    //self.questionsPuzzleManipulator.last.flush();
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
    self.questionsPuzzleManipulator.last.add(self.questionPuzzle.puzzleManipulator.first);
    self.questionPuzzle.display(self.coordinatesQuestion.x, self.coordinatesQuestion.y, self.coordinatesQuestion.w, self.coordinatesQuestion.h, index);

}

var AdminGUI = function (){

    domain && domain.Domain();
    Answer.prototype.display = AnswerDisplay;
    Library.prototype.display = LibraryDisplay;
    Header.prototype.display = HeaderDisplay;
    AddEmptyElement.prototype.display = AddEmptyElementDisplay;
    AnswerElement.prototype.display = AnswerElementDisplay;
    Formation.prototype.displayMiniature = FormationDisplayMiniature;
    Formation.prototype.displayFormation = FormationDisplayFormation;
    Formation.prototype.removeErrorMessage = FormationRemoveErrorMessage;
    Formation.prototype.displayErrorMessage = FormationDisplayErrorMessage;
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
    QuizzManager.prototype.displayQuestionsPuzzle = QuizzManagerDisplayQuestionPuzzle;

};

var LearningGUI=function (){
    domain && domain.Domain();
    Answer.prototype.display = AnswerDisplay;
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

};
if (typeof exports !== "undefined") {
    exports.AdminGUI = AdminGUI;
    exports.LearningGUI = LearningGUI;
    exports.setDomain = setDomain;
}