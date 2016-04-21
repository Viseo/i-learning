/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (parent, question) {
    var self = this;
    self.MAX_ANSWERS = 8;
    self.parent = parent;

    self.manipulator = new Manipulator(self);
    //mainManipulator.ordonator.set(0, self.manipulator.first);//!! à s'en inquiéter plus tard -> remplacer par .last.add

    self.manipulatorQuizzInfo = new Manipulator(self);
    self.manipulator.last.add(self.manipulatorQuizzInfo.first);

    self.questionCreatorManipulator= new Manipulator(self);
    self.manipulator.last.add(self.questionCreatorManipulator.first);

    self.questionManipulator=new Manipulator(self);
    self.questionCreatorManipulator.last.add(self.questionManipulator.first);

    self.toggleButtonManipulator = new Manipulator(self);
    self.questionCreatorManipulator.last.add(self.toggleButtonManipulator.first);

    self.previewButtonManipulator = new Manipulator(self);
    self.manipulator.last.add(self.previewButtonManipulator.first);

    self.headerHeight = 0.1;
    self.questionHeight = 0.2;
    self.reponseHeight = 0.7;

    var haut = (window.innerHeight);
    self.questionNameValidInput = true;
    self.quizzNameValidInput = true;

    self.labelDefault = "Cliquer deux fois pour ajouter la question";
    self.quizzType = myQuizzType.tab;

    self.loadQuestion = function(quest){
        self.linkedQuestion = quest;
        if(typeof quest.multipleChoice !== 'undefined'){
            self.multipleChoice = quest.multipleChoice;
        }else{
            self.multipleChoice = false;
        }
        if(typeof quest.simpleChoice !== 'undefined'){
            self.simpleChoice = quest.simpleChoice;
        }else{
            self.simpleChoice = (!self.multipleChoice);
        }
        self.tabAnswer = [];
        quest.tabAnswer.forEach(function (answer) {
            self.tabAnswer.push(new AnswerElement(answer, self));
        });
        self.quizzName = quest.parentQuizz.title;
        self.label = quest.label;
        self.rightAnswers = [];
        self.fontSize = quest.fontSize;
        self.font = quest.font;
        self.bgColor = quest.bgColor;
        self.colorBordure = quest.rgbBordure;

        self.tabAnswer.forEach(function (el) {
            if (el.bCorrect) {
                self.rightAnswers.push(el);
            }
        });

    };

    if (!question) {
        // init default : 2 empty answers

        self.tabAnswer = [new AnswerElement(null, self), new AnswerElement(null, self)];
        self.quizzName = "";
        self.label = "";
        self.rightAnswers = [];
        self.fontSize = 20;
        self.multipleChoice = false;
        self.simpleChoice = true;
    } else {
        self.loadQuestion(question);
    }

    self.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};

    self.checkInputTextArea = function (myObj) {
        if (myObj.textarea.value.match(REGEX)) {
            myObj.remove();
            myObj.textarea.onblur = myObj.onblur;
            myObj.textarea.style.border = "none";
            myObj.textarea.style.outline = "none";
        } else {
            myObj.display();
            myObj.textarea.onblur = function () {
                console.log("blur");
                myObj.textarea.value = "";
                myObj.onblur();
                myObj.remove();
            }
        }
    };

    self.display = function (x, y, w, h) {
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

    };

    self.displayToggleButton = function (x, y, w, h, clicked){
        var size = self.puzzle.tileHeight*0.2;
        var toggleHandler = function(event){
            self.target = drawing.getTarget(event.clientX, event.clientY);
            var questionType = self.target.parent.children[1].messageText;
            if (self.multipleChoice){
                self.tabAnswer.forEach(function(answer){
                    if(answer instanceof AnswerElement){
                        answer.multipleAnswer = answer.bCorrect;
                        answer.linkedAnswer.parent.multipleChoice=answer.bCorrect;
                        answer.linkedAnswer.parent.simpleChoice=!answer.bCorrect;
                        (typeof answer.simpleAnswer === 'undefined') && (answer.simpleAnswer = false);
                        answer.bCorrect = answer.simpleAnswer;
                        answer.linkedAnswer.correct = answer.simpleAnswer;
                    }});
            }
            else if (self.simpleChoice){
                self.tabAnswer.forEach(function(answer){
                    if(answer instanceof AnswerElement){
                        answer.simpleAnswer = answer.bCorrect;
                        answer.linkedAnswer.parent.simpleChoice=answer.bCorrect;
                        answer.linkedAnswer.parent.multipleChoice=!answer.bCorrect;
                        (typeof answer.multipleAnswer==='undefined') && (answer.multipleAnswer = false);
                        answer.bCorrect = answer.multipleAnswer;
                        answer.linkedAnswer.correct = answer.multipleAnswer;

                    }});
             }

            (questionType === "Réponses multiples") ? (self.multipleChoice = true) : (self.multipleChoice = false);
            (questionType === "Réponse unique") ? (self.simpleChoice = true) : (self.simpleChoice = false);
            self.activeQuizzType = (self.simpleChoice === true) ? self.quizzType[0] : self.quizzType[1];
            self.errorMessagePreview && self.errorMessagePreview.parent && self.parent.previewButtonManipulator.last.remove(self.errorMessagePreview);

            self.tabAnswer.forEach(function(answer) {
                if (answer.obj.checkbox) {
                    self.simpleChoice && (answer.bCorrect = false);
                    self.multipleChoice && (answer.bCorrect = false);
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
            (type.label == clicked) ? (self.virtualTab[i].color = myColors.blue) : (self.virtualTab[i].color = myColors.white);
            self.virtualTab[i].toggleButton = displayTextWithoutCorners(type.label, self.toggleButtonWidth, h, myColors.black, self.virtualTab[i].color, 20, null, self.virtualTab[i].manipulator);
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
    };

    self.displayQuestionCreator = function (x, y, w, h) {

        var showTitle = function () {
            var color = (self.label) ? myColors.black : myColors.grey;
            var text = (self.label) ? self.label : self.labelDefault;
            if(self.linkedQuestion.image){
                var img = self.linkedQuestion.image;
                self.questionBlock.title = displayImageWithTitle(text, img.src, img, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, self.font, self.questionManipulator);
                self.questionBlock.title.image._acceptDrop = true;
            }else{
                self.questionBlock.title = displayText(text, self.w - 2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, self.font, self.questionManipulator);
            }

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
            textarea.width = self.w - 2 * MARGIN;

            //(self.questionManipulator.ordonator.children[2] instanceof svg.Image) ? (textarea.height = self.questionBlock.title.content.component.getBBox().height) : (textarea.height = (self.h * .25)/2);
            textarea.height = (self.questionManipulator.ordonator.children[2] instanceof svg.Image) ? (self.questionBlock.title.content.component.getBBox().height) : ((self.h * .25)/2);

            self.questionManipulator.ordonator.unset(1);//, self.questionBlock.title.content);
            textarea.globalPointCenter = self.questionBlock.title.content.globalPoint(-(textarea.width)/2, -(textarea.height)/2);

            var contentareaStyle = {
                toppx: (self.questionManipulator.ordonator.children[2] instanceof svg.Image) ? (-textarea.height + 1 - drawing.height + textarea.globalPointCenter.y) : (- drawing.height + textarea.globalPointCenter.y),
                leftpx: (MARGIN + textarea.globalPointCenter.x),
                width: (self.w - 6 * MARGIN),
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
        self.questionCreatorManipulator.last.add(self.puzzle.puzzleManipulator.first);// !_! ça va pas! si on repasse plusieurs fois ici ça craque!
        self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y+self.toggleButtonHeight + self.questionBlock.title.cadre.height/2 - 2*MARGIN, self.coordinatesAnswers.w, self.coordinatesAnswers.h , 0);
    };

};