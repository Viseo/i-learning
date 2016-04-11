/**
 * Created by qde3485 on 15/03/16.
 */

var AddEmptyElement = function (parent) {
    var self = this;
    self.manipulator = new Manipulator();
    MARGIN = 15;

    self.answerNameValidInput = true;

    self.label = "Double-cliquez pour ajouter une réponse";
    self.fontSize = 20;
    self.parent = parent;

    self.display = function (x, y, w, h) {
        self.margin = 15;
        self.obj = displayText(self.label, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
        self.plus = drawPlus(x+w/2, y+(h*0.4), h*.3, h*0.3);
        self.manipulator.last.add(self.plus);
        self.obj.content.position(0,h*0.35);

        self.obj.cadre.color(myColors.white, 3, myColors.black);
        self.obj.cadre.component.setAttribute("stroke-dasharray", [10, 5]);

        var dblclickEdition = function () {
            self.parent.tabAnswer.pop();
            self.manipulator.ordonator.remove(self.obj.content);
            self.manipulator.ordonator.remove(self.obj.cadre);
            self.manipulator.last.remove(self.plus);
            self.parent.tabAnswer.push(new AnswerElement(null, self.parent));
            if(self.parent.tabAnswer.length !== self.parent.MAX_ANSWERS) {
                self.parent.tabAnswer.push(new AddEmptyElement(self.parent));
            }
            self.parent.puzzle = new Puzzle(2, 4, self.parent.tabAnswer, self.parent.coordinatesAnswers, true, self);
            self.parent.manipulatorQuestionCreator.last.add(self.parent.puzzle.puzzleManipulator.first);
            self.parent.puzzle.display(self.parent.coordinatesAnswers.x, self.parent.coordinatesAnswers.y + self.parent.toggleButtonHeight/2 + MARGIN/2, self.parent.coordinatesAnswers.w, self.parent.coordinatesAnswers.h, 0);
        };

        svg.addEvent(self.plus, "ondblclick", dblclickEdition);
        svg.addEvent(self.obj.content, "ondblclick", dblclickEdition);
        svg.addEvent(self.obj.cadre, "ondblclick", dblclickEdition);
    }
};

var AnswerElement = function (answer, parent) {
    var self = this;

    self.manipulator = new Manipulator();

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
        self.bCorrect = answer.bCorrect;
    }else {
        self.label = "";
        self.fontSize = 20;
        self.bCorrect = false;
    }
    self.parent = parent;

    self.toAnswer = function () {
        return {label: self.label, bCorrect: self.bCorrect, colorBordure: myColors.black, bgColor: myColors.none};
    };

    self.checkInputContentArea = function (objCont) {
            if (objCont.contentarea.textContent.match(self.regex)) {
                self.label = objCont.contentarea.textContent;
                objCont.remove();
                objCont.contentarea.onblur = onblur;
                objCont.contentarea.style.border = "none";
                objCont.contentarea.style.outline = "none";
            } else {
                objCont.display();
                objCont.contentarea.onblur = function () {
                    objCont.contentarea.textContent = "";
                    objCont.onblur();
                    objCont.remove();
                }
            }
        };

    self.display = function (x, y, w, h) {
        self.margin = 15;
        var showTitle = function () {
            var text = (self.label) ? self.label : self.labelDefault;
            var color = (self.label) ? myColors.black : myColors.grey;
            if(self.manipulator.ordonator.children[2] instanceof svg.Image){
                var img = self.manipulator.ordonator.children[2];
                self.obj = displayImageWithTitle(text, img.src, img, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
            }
            else{
                self.obj = displayText(text, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
            }
            self.obj.cadre.fillOpacity(0.001);
            self.obj.content.color(color);
            svg.addEvent(self.obj.content, "ondblclick", dblclickEdition);
            svg.addEvent(self.obj.cadre, "ondblclick", dblclickEdition);
        };

        var dblclickEdition = function () {
            var contentarea = document.createElement("div");
            contentarea.textContent = self.label;
            contentarea.width = w-2*self.margin-2;
            contentarea.height = self.obj.content.component.getBBox().height+MARGIN;
            contentarea.globalPointCenter = self.obj.content.globalPoint(-(contentarea.width)/2,-(contentarea.height)/2);
            self.manipulator.ordonator.unset(1, self.obj.content);
            contentarea.setAttribute("contenteditable",true);
            contentarea.setAttribute("style", "position: absolute; top:"+contentarea.globalPointCenter.y+"px; left:"+contentarea.globalPointCenter.x+"px; width:"+(w-6*self.margin-2)+"px; height:"+(h*.8-6*self.margin)+"px; content-align:center; resize: none; border: none;");

            var body = document.getElementById("content");
            body.appendChild(contentarea).focus();

            var removeErrorMessage = function () {
                self.answerNameValidInput = true;
                self.errorMessage && self.parent.manipulatorQuestionCreator.ordonator.unset(5);
                self.obj.cadre.color(myColors.white, 1, myColors.black);
            };


            var displayErrorMessage = function () {
                removeErrorMessage();
                self.obj.cadre.color(myColors.white, 2, myColors.red);
                var bibRatio=0.2;
                var position = (window.innerWidth/2 - 0.5 * bibRatio*drawing.width - MARGIN);
                var anchor = 'middle' ;
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                    .position(position, self.parent.questionCreatorHeight - self.parent.quizzInfoHeight - MARGIN)
                    .font("arial", 15).color(myColors.red).anchor(anchor);
                self.parent.manipulatorQuestionCreator.ordonator.set(5,self.errorMessage);
                contentarea.focus();
                self.answerNameValidInput = false;
            };

            var onblur = function () {
                self.answerNameValidInput && (self.label = contentarea.textContent);
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
        showTitle();
        self.checkboxSize=h*0.2;
        self.checkbox = displayCheckbox(x+self.checkboxSize, y+h-self.checkboxSize , self.checkboxSize, self);
        self.checkbox.checkbox.answerParent = self;
        self.cBLabel = new svg.Text("Bonne réponse").position(x+2*self.checkboxSize, y+h-self.checkboxSize).font("arial", 20).anchor("start");
        self.manipulator.ordonator.set(6, self.cBLabel);
        self.manipulator.ordonator.children.forEach(function(e) {
            e._acceptDrop = true;
        });
    }
};