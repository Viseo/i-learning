/**
 * Created by qde3485 on 15/03/16.
 */

var AddEmptyElement = function (parent, type) {
    var self = this;
    self.manipulator = new Manipulator(self);
    self.plusManipulator = new Manipulator(self);
    self.manipulator.last.add(self.plusManipulator.first);
    type && (self.type = type);
    switch(type) {
        case 'question':
            //self.questionNameValidInput = true;
            self.label = "Double-cliquez pour ajouter une question";
            break;
        case 'answer':
            self.answerNameValidInput = true;
            self.label = "Double-cliquez pour ajouter une réponse";
            break;
    };

    self.fontSize = 20;
    self.parent = parent;

    self.display = function (x, y, w, h) {
        self.obj = displayText(self.label, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
        self.plus = drawPlus(0, 0, h*.3, h*0.3);
        self.plusManipulator.ordonator.set(0, self.plus);
        self.plusManipulator.translator.move(x+w/2, y+(h*0.4));
        self.manipulator.last.add(self.plus);
        self.obj.content.position(0,h*0.35);

        self.obj.cadre.color(myColors.white, 3, myColors.black);
        self.obj.cadre.component.setAttribute("stroke-dasharray", [10, 5]);

        var dblclickEdition = function () {
            switch (self.type) {
                case 'answer':
                    self.parent.tabAnswer.pop();
                    var newAnswer = new Answer();
                    self.manipulator.ordonator.unset(self.manipulator.ordonator.children.indexOf(self.obj.content));
                    self.manipulator.ordonator.unset(self.manipulator.ordonator.children.indexOf(self.obj.cadre));
                    self.manipulator.last.remove(self.plus);
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

                    self.parent.quizz.tabQuestions.pop();

                    // self.parent.questionsPuzzleManipulator.last.children[1].children[0].children[0].children[2].children[0].children[0].children[0].remove(self.plus);
                    var index = self.parent.questionsPuzzleManipulator.last.children[1].children[0].children[0].children[2].children[0].children[0].children[0].remove(self.plus);//scaling.children.indexOf(self.obj.cadre);
                    self.parent.questionsPuzzleManipulator.puzzleManipulator.ordonator.unset(index);
                    index = self.parent.questionsPuzzleManipulator.ordonator.children.indexOf(self.obj.content);
                    self.parent.questionsPuzzleManipulator.puzzleManipulator.ordonator.unset(index);
                    self.parent.questionsPuzzleManipulator.puzzleManipulator.last.remove(self.plus);

                    //self.manipulator.last.remove(self.plus);

                    var newQuestion = new Question(null, self.parent.quizz);

                    self.parent.quizz.tabQuestions.push(newQuestion);
                    //self.parent.quizz.tabQuestions.push();

                    self.parent.displayQuestionsPuzzle(self.parent.questionPuzzleCoordinates.x, self.parent.questionPuzzleCoordinates.y, self.parent.questionPuzzleCoordinates.w, self.parent.questionPuzzleCoordinates.h, self.parent.questionPuzzle.startPosition+1);

            };
        };

        svg.addEvent(self.plus, "dblclick", dblclickEdition);
        svg.addEvent(self.obj.content, "dblclick", dblclickEdition);
        svg.addEvent(self.obj.cadre, "dblclick", dblclickEdition);
    };
};

var AnswerElement = function (answer, parent) {
    var self = this;

    self.manipulator = new Manipulator(self);
    self.linkedAnswer = answer;
    self.isValidInput = true;
    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){0,50}$/g;
    self.labelDefault = "Double clic pour modifier";
    self._acceptDrop = true;

    if(answer) {
        self.label = answer.label;
        if(answer.fontSize) {
            self.fontSize = answer.fontSize;
        } else {
            self.fontSize = 20;
        }
        if(typeof answer.correct !== 'undefined'){
            self.bCorrect = answer.correct;
        }else{
            self.bCorrect=false;
        }
    }else {
        self.label = "";
        self.fontSize = 20;
        self.bCorrect = false;
    }
    self.parent = parent;

    self.toAnswer = function () {
        if(self.manipulator.ordonator.children[2] instanceof svg.Image){
            self.img = self.manipulator.ordonator.children[2].src;
        }else{
            self.img = null;
        }
        return {label: self.label, imageSrc:self.img, bCorrect: self.bCorrect, colorBordure: myColors.black, bgColor: myColors.white};
    };

    self.checkInputContentArea = function (objCont) {
        if (objCont.contentarea.value.match(self.regex)) {
            self.label = objCont.contentarea.value;
            objCont.remove();
            objCont.contentarea.onblur = objCont.onblur;
            objCont.contentarea.style.border = "none";
            objCont.contentarea.style.outline = "none";
        } else {
            objCont.display();
            objCont.contentarea.onblur = function () {
                objCont.contentarea.value = "";
                objCont.onblur();
                objCont.remove();
            }
        }
    };

    self.display = function (x, y, w, h) {
        self.checkboxSize=h*0.2;
        var showTitle = function () {
            var text = (self.label) ? self.label : self.labelDefault;
            var color = (self.label) ? myColors.black : myColors.grey;
            if(self.linkedAnswer.image){
                self.img = self.linkedAnswer.image;
                self.obj = displayImageWithTitle(text, self.img.src, self.img, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
                //self.obj.content.position((self.checkboxSize/2),self.obj.content.y);

            }
            else{
                self.obj = displayText(text, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
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
            contentarea.height = self.obj.content.component.getBBox().height;
            contentarea.globalPointCenter = self.obj.content.globalPoint(-(contentarea.width)/2,-(contentarea.height)/2);
            self.manipulator.ordonator.unset(1, self.obj.content);
            var contentareaStyle = {
                toppx: contentarea.globalPointCenter.y-(contentarea.height/2)*2/3 ,
                leftpx: contentarea.globalPointCenter.x+(1/6)*self.obj.cadre.component.getBBox().width,
                height:(self.linkedAnswer.image) ? contentarea.height : (h*.5),
                width:self.obj.cadre.component.getBBox().width*2/3
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
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
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
                /*if(self.checkbox.checked) {
                 self.checkbox.checked.toFront();
                 };*/
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
       // self.cBLabel = new svg.Text("Bonne réponse").position(x+2*self.checkboxSize, y+h-self.checkboxSize).font("arial", 20).anchor("start");
       // self.manipulator.ordonator.set(6, self.cBLabel);
        self.manipulator.ordonator.children.forEach(function(e) {
            e._acceptDrop = true;
        });
    };
};