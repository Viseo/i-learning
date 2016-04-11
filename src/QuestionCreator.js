/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;
    self.MAX_ANSWERS = 8;

    self.manipulator = new Manipulator();
    mainManipulator.ordonator.set(0, self.manipulator.first);//!! à s'en inquiéter plus tard -> remplacer par .last.add

    self.manipulatorQuizzInfo = new Manipulator();
    self.manipulator.last.add(self.manipulatorQuizzInfo.first);

    self.manipulatorQuestionCreator = new Manipulator();
    self.manipulator.last.add(self.manipulatorQuestionCreator.first);

    self.questionManipulator=new Manipulator();
    self.manipulatorQuestionCreator.last.add(self.questionManipulator.first);

    self.toggleButtonManipulator = new Manipulator();
    self.manipulatorQuestionCreator.last.add(self.toggleButtonManipulator.first);

    self.previewButtonManipulator = new Manipulator();
    self.manipulator.last.add(self.previewButtonManipulator.first);

    self.headerHeight = 0.1;
    self.questionHeight = 0.2;
    self.reponseHeight = 0.7;

    var haut = (window.innerHeight);
    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){0,50}$/g;
    self.questionNameValidInput = true;
    self.quizzNameValidInput = true;

    self.quizzNameDefault = "Ecrire ici le nom du quiz";
    self.labelDefault = "Cliquer deux fois pour ajouter la question";
    self.quizzType = myQuizzType.tab;

    if (!question) {
        // init default : 2 empty answers
        self.tabAnswer = [new AnswerElement(null, self), new AnswerElement(null, self)];
        self.quizzName = "";
        self.label = "";
        self.rightAnswers = [];
        self.fontSize = 20;
        self.multipleChoice=false;
        self.simpleChoice=true;
    } else {
        self.multipleChoice=question.multipleChoice;
        self.simpleChoice=question.simpleChoice;
        self.tabAnswer = [];
        question.tabAnswer.forEach(function (answer) {
            self.tabAnswer.push(new AnswerElement(answer));
        });
        self.quizzName = question.parentQuizz.title;
        self.label = question.label;
        self.rightAnswers = [];
        self.fontSize = question.fontSize;
        self.tabAnswer.forEach(function (el) {
            if (el.bCorrect) {
                self.rightAnswers.push(el);
            }
        });
    }

    self.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};
    self.formationName = "Hibernate";

    self.checkInputTextArea = function (myObj) {
        if (myObj.textarea.value.match(self.regex)) {
            myObj.remove();
            myObj.textarea.onblur = myObj.onblur;
            myObj.textarea.style.border = "none";
            myObj.textarea.style.outline = "none";
        } else {
            myObj.display();
            myObj.textarea.onblur = function () {
                myObj.textarea.value = "";
                myObj.onblur();
                myObj.remove();
            }
        }
    };

    self.display = function (x, y, w, h) {
        self.quizzInfoHeight = Math.floor(h * self.headerHeight);
        self.questionCreatorHeight = Math.floor(h * (1 - self.headerHeight) - 80);
        //var reponseAreaHeight=Math.floor(h*);
        self.manipulatorQuestionCreator.translator.move(x, self.quizzInfoHeight);
        self.previewButtonManipulator.translator.move(w/2-MARGIN, h - self.headerHeight*h);
        self.toggleButtonHeight = 40;
        self.displayQuizzInfo(MARGIN+x, 2*MARGIN+y, w*0.5,self.quizzInfoHeight);
        self.displayQuestionCreator(MARGIN+x,self.quizzInfoHeight, w, self.questionCreatorHeight-2*MARGIN-60);
        self.displayPreviewButton(x+w/2,self.quizzInfoHeight+self.questionCreatorHeight, w, 75);
        self.displayToggleButton(MARGIN+x, MARGIN+y, w,self.toggleButtonHeight, myQuizzType.tab[0].label);
    };

    self.displayToggleButton = function (x, y, w, h, clicked){
        var size=self.puzzle.tileHeight*0.2;
        var toggleHandler = function(event){
            self.target = drawing.getTarget(event.clientX, event.clientY);
            var questionType = self.target.parent.children[1].messageText;
            self.displayToggleButton(x, y, w, h, questionType);
            if (self.multipleChoice){
                self.tabAnswer.forEach(function(answer){
                    answer.multipleAnswer = answer.bCorrect;
                    (answer.simpleAnswer==undefined) && (answer.simpleAnswer = false);
                });
            }
            else if (self.simpleChoice){
                self.tabAnswer.forEach(function(answer){
                    answer.simpleAnswer = answer.bCorrect;
                    (answer.multipleAnswer==undefined) && (answer.multipleAnswer = false);
                });
             }

            (questionType === "Réponses multiples") ? (self.multipleChoice=true) : (self.multipleChoice=false);
            (questionType === "Réponse unique") ? (self.simpleChoice=true) : (self.simpleChoice=false);
            self.tabAnswer.forEach(function(answer){
                var xCheckBox, yCheckBox = 0;
                if (answer.checkbox){
                    xCheckBox = answer.checkbox.checkbox.x;
                    yCheckBox = answer.checkbox.checkbox.y;
                    self.simpleChoice && (answer.bCorrect=answer.simpleAnswer);
                    self.multipleChoice && (answer.bCorrect = answer.multipleAnswer);
                    (self.simpleChoice || self.multipleChoice) && (answer.checkbox = displayCheckbox(xCheckBox, yCheckBox, size, answer));
                    answer.checkbox.checkbox.answerParent = answer;
                }
            });
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
            self.virtualTab[i].manipulator= new Manipulator();
            self.toggleButtonManipulator.last.add(self.virtualTab[i].manipulator.first);
            //type.default && (self.clicked = self.virtualTab[i]);
            (type.label == clicked) ? (self.virtualTab[i].color = myColors.blue) : (self.virtualTab[i].color = myColors.white);
            self.virtualTab[i].toggleButton = displayTextWithoutCorners(type.label, self.toggleButtonWidth, h, myColors.black, self.virtualTab[i].color, self.fontSize, null, self.virtualTab[i].manipulator);
            self.virtualTab[i].manipulator.translator.move(self.x,MARGIN+h/2);
            self.x+= self.toggleButtonWidth + MARGIN;
            (type.label != clicked) && (svg.addEvent(self.virtualTab[i].toggleButton.content, "click", toggleHandler));
            (type.label != clicked) && (svg.addEvent(self.virtualTab[i].toggleButton.cadre, "click", toggleHandler));

            //self.toggleButtonManipulator.translator.move(x, MARGIN);
            i++;
        });
        //self.toggleButton = displayTextWithoutCorners("Choix unique", w-2*MARGIN, h, myColors.black, myColors.none, self.fontSize, null, self.toggleButtonManipulator);
        //self.toggleButton.cadre.position(w/2, h/2);
        //self.toggleButton.content.position(w/2, h/2);
        //self.toggleButtonManipulator.translator.move(x, MARGIN);
    };

    self.displayQuestionCreator = function (x, y, w, h) {
        var showTitle = function () {
            var color = (self.label) ? myColors.black : myColors.grey;
            var text = (self.label) ? self.label : self.labelDefault;
            if(self.questionManipulator.ordonator.children[2] instanceof svg.Image){
                var img=self.questionManipulator.ordonator.children[2];
                self.questionBlock.title=displayImageWithTitle(text, img.src,img, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, null, self.questionManipulator);
            }else{
                self.questionBlock.title = displayText(text, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, null, self.questionManipulator);

            }
            self.questionBlock.title.content.color(color);
            self.questionBlock.title.content._acceptDrop=true;
            // self.questionBlock.title.cadre.fillOpacity(0.001);
            self.questionBlock.title.cadre.color(myColors.white,1,myColors.black);
            self.questionBlock.title.cadre._acceptDrop=true;
            svg.addEvent(self.questionBlock.title.content, "ondblclick", dblclickEdition);
            svg.addEvent(self.questionBlock.title.cadre, "ondblclick", dblclickEdition);

            //move
            self.questionManipulator.first.move(w/2,y + self.toggleButtonHeight+ 2*MARGIN);

        };

        var dblclickEdition = function () {
            var textarea = document.createElement("TEXTAREA");
            textarea.textContent = self.label;
            textarea.width = self.w-2*MARGIN;
            var decalageImage;
            if(self.questionManipulator.ordonator.children[2] instanceof svg.Image){
                textarea.height = self.questionBlock.title.content.component.getBBox().height;//self.questionBlock.title.content.component.getBBox().height;
                decalageImage=-textarea.height+1;
            }
            else{
                textarea.height = (self.h*.25)/2;//self.questionBlock.title.content.component.getBBox().height;
                decalageImage=MARGIN;
            }
            self.questionManipulator.ordonator.unset(1);//, self.questionBlock.title.content);
            textarea.globalPointCenter = self.questionBlock.title.content.globalPoint(-(textarea.width)/2,-(textarea.height)/2);
            textarea.setAttribute("style", "position: relative; top:" + (decalageImage-drawing.height+textarea.globalPointCenter.y) + "px; left:" + (MARGIN+textarea.globalPointCenter.x) + "px; width:" + (self.w - 6 * MARGIN) + "px; height:" + (textarea.height) + "px; text-align:center; display:table-cell; font-family: Arial; font-size: 20px; resize: none; outline:none; border: none; background-color: transparent; padding-top:"+((textarea.height - 4 * MARGIN)/2-20)+"px; overflow:hidden;");

            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var onblur = function () {
                console.log(textarea);
                textarea.value && (self.label = textarea.value);
                body.removeChild(textarea);
                //textarea.remove();
                //self.questionManipulator.ordonator.unset(0);//, self.questionBlock.title.cadre);
                showTitle();
            };

            var removeErrorMessage = function () {
                self.questionNameValidInput = true;
                self.errorMessage && self.manipulatorQuestionCreator.ordonator.unset(5);
                self.questionBlock.title.cadre.color(myColors.white, 1, myColors.black);

            };

            var displayErrorMessage = function () {
                removeErrorMessage();
                self.questionBlock.title.cadre.color(myColors.white, 2, myColors.red);
                var bibRatio=0.2;
                var position = window.innerWidth/2 - 0.5 * bibRatio*drawing.width - MARGIN;
                var anchor = 'middle';
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                    .position(position, textarea.height + 2 * MARGIN)
                    .font("arial", 15).color(myColors.red).anchor(anchor);
                self.manipulatorQuestionCreator.ordonator.set(5, self.errorMessage);
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
            y: self.y + 2 * MARGIN + self.h * 0.25,
            w: self.w - 2 * MARGIN,
            h: (self.h-self.toggleButtonHeight - 2*MARGIN) * 0.75 - 3 * MARGIN
        };

        // bloc Question
        self.questionBlock = {rect: new svg.Rect(self.w, self.h).color([], 1, myColors.black).position(self.w / 2, self.h / 2)};
        self.manipulatorQuestionCreator.last.add(self.questionBlock.rect);
        showTitle();

        // bloc Answers
        if (self.tabAnswer.length !== self.MAX_ANSWERS) {
            self.tabAnswer.push(new AddEmptyElement(self));
        }
        self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true, self);
        self.manipulatorQuestionCreator.last.add(self.puzzle.puzzleManipulator.first);
        self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y+self.toggleButtonHeight/2 + MARGIN/2, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
    };
    self.displayQuizzInfo = function (x, y, w, h) {

        self.formationLabel = new svg.Text("Formation : " + self.formationName);
        self.formationLabel.font("arial", 20).anchor("start");
        self.manipulatorQuizzInfo.last.add(self.formationLabel);

        var showTitle = function () {
            var text = (self.quizzName) ? self.quizzName : self.quizzNameDefault;
            var color = (self.quizzName) ? myColors.black : myColors.grey;
            var bgcolor = myColors.grey;

            self.quizzLabel = {};
            var width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBBox().width;

            self.quizzLabel.content = autoAdjustText(text, 0, 0, w, h/2, 15, "Arial", self.manipulatorQuizzInfo).text;
            self.quizzNameHeight = self.quizzLabel.content.component.getBBox().height;
            self.quizzLabel.cadre = new svg.Rect(width, 2*self.quizzNameHeight).color(bgcolor);
            self.quizzLabel.cadre.position(width/2,h/4).fillOpacity(0.1);
            self.manipulatorQuizzInfo.ordonator.set(0, self.quizzLabel.cadre);
            self.quizzLabel.content.position(0,h/4 + self.quizzNameHeight/4).color(color).anchor("start");

            self.manipulatorQuizzInfo.first.move(x,y);

            svg.addEvent(self.quizzLabel.content, "ondblclick", dblclickEdition);
            svg.addEvent(self.quizzLabel.cadre, "ondblclick", dblclickEdition);
        };

        var dblclickEdition = function () {
            var width = self.quizzLabel.content.component.getBBox().width;
            //self.manipulatorQuizzInfo.ordonator.unset(0);
            self.manipulatorQuizzInfo.ordonator.unset(1);

            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.quizzName;
            textarea.setAttribute("style", "position: absolute; top:" + (h / 2 - self.quizzNameHeight/2 + 2) + "px; left:" + (x+MARGIN/2 + 1) + "px; width:" + (700) + "px; height:" + (2*self.quizzNameHeight) + "px; resize: none; border: solid 2px #888; font-family: Arial; font-size: 15px; background-color: transparent;");
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var removeErrorMessage = function () {
                self.quizzNameValidInput = true;
                self.errorMessage && self.manipulatorQuizzInfo.ordonator.unset(5);
                self.quizzLabel.cadre.color(myColors.grey, 1, myColors.none);

            };

            var displayErrorMessage = function () {
                removeErrorMessage();
                self.quizzLabel.cadre.color(myColors.grey, 2, myColors.red);
                var position = (textarea.getBoundingClientRect().left - MARGIN);
                var anchor = 'start';
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                    .position(position, h - MARGIN)
                    .font("arial", 15).color(myColors.red).anchor(anchor);
                self.manipulatorQuizzInfo.ordonator.set(5, self.errorMessage);
                textarea.focus();
                self.quizzNameValidInput = false;
            };
            var onblur = function () {
                self.quizzNameValidInput && (self.quizzName = textarea.value);
                textarea.remove();
                showTitle();
            };
            textarea.oninput = function () {
                self.checkInputTextArea({
                    textarea: textarea,
                    border: self.quizzLabel.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
                //self.checkInputTextArea(textarea, "quizzNameValidInput", onblur, self.quizzLabel.cadre);
            };
            textarea.onblur = onblur;
            self.checkInputTextArea({
                textarea: textarea,
                border: self.quizzLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        showTitle();
    };

    self.displayPreviewButton = function (x, y, w, h) {
        self.previewButton = displayText("Aperçu", 200, h, myColors.black, myColors.white, 20, null, self.previewButtonManipulator);

        var previewFunction = function () {
            var correctAnswers = 0;
            var incorrectAnswers = 0;

            var isValidInput = true;
            var isFilled = false;

            self.tabAnswer.forEach(function (el) {
                if (el instanceof AnswerElement) {
                    if (el.bCorrect) {
                        correctAnswers++;
                    } else {
                        incorrectAnswers++;
                    }
                    isValidInput = isValidInput && el.isValidInput;
                    isFilled = isFilled || (el.label);
                }
            });
            if (isValidInput && self.questionNameValidInput && self.quizzNameValidInput) {
                if (correctAnswers >= 1 && incorrectAnswers >= 1) {
                    if (self.quizzName) {
                        if (self.label) {
                            mainManipulator.ordonator.unset(0, self.manipulator.first);

                            var tabAnswer = [];
                            self.tabAnswer.forEach(function (el) {
                                if (el instanceof AnswerElement) {
                                    tabAnswer.push(el.toAnswer());
                                }
                            });

                            var tabQuestion = [];
                            var questionObject = {
                                label: self.label,
                                tabAnswer: tabAnswer,
                                nbrows: 4,
                                colorBordure: myColors.black,
                                bgColor: myColors.white
                            };
                            tabQuestion.push(questionObject);

                            var quizzObject = {
                                title: self.quizzName,
                                bgColor: myColors.white,
                                tabQuestions: tabQuestion,
                                puzzleLines: 3,
                                puzzleRows: 3
                            };

                            var quizz = new Quizz(quizzObject, true);
                            quizz.run(1, 1, document.body.clientWidth, drawing.height);
                        } else {
                            if (self.errorMessagePreview) {
                                self.previewButtonManipulator.last.remove(self.errorMessagePreview);
                            }
                            self.errorMessagePreview = new svg.Text("Vous devez donner un nom à la question.")
                                .position(-11 * MARGIN - 5, h / 2 - 6 * MARGIN)
                                .font("arial", 20)
                                .anchor('center').color(myColors.red);
                            self.previewButtonManipulator.last.add(self.errorMessagePreview);
                        }
                    } else {
                        if (self.errorMessagePreview) {
                            self.previewButtonManipulator.last.remove(self.errorMessagePreview);
                        }
                        self.errorMessagePreview = new svg.Text("Vous devez donner un nom au quiz.")
                            .position(-10 * MARGIN - 10, h / 2 - 6 * MARGIN)
                            .font("arial", 20)
                            .anchor('center').color(myColors.red);
                        self.previewButtonManipulator.last.add(self.errorMessagePreview);                    }
                } else {
                    if (self.errorMessagePreview) {
                        self.previewButtonManipulator.last.remove(self.errorMessagePreview);
                    }
                    self.errorMessagePreview = new svg.Text("Vous ne pouvez pas créer de question sans bonne réponse.")
                        .position(-15 * MARGIN - 5, h / 2 - 6 * MARGIN)
                        .font("arial", 20)
                        .anchor('center').color(myColors.red);

                    self.previewButtonManipulator.last.add(self.errorMessagePreview);
                }
            }
        };

        svg.addEvent(self.previewButton.cadre, "click", previewFunction);
        svg.addEvent(self.previewButton.content, "click", previewFunction);

        self.previewButtonManipulator.last.add(self.previewButton.cadre);
        self.previewButtonManipulator.last.add(self.previewButton.content);

        self.previewButtonManipulator.translator.move(x, y);

    }
};