/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;
    self.MAX_ANSWERS = 8;

    self.manipulator = new Manipulator();
    mainManipulator.ordonator.set(0, self.manipulator.first);

    self.manipulatorQuizzInfo = new Manipulator();
    self.manipulator.last.add(self.manipulatorQuizzInfo.first);

    self.manipulatorQuestionCreator = new Manipulator();
    self.manipulator.last.add(self.manipulatorQuestionCreator.first);

    self.previewButtonManipulator = new Manipulator();
    self.manipulator.last.add(self.previewButtonManipulator.first);

    self.headerHeight=0.1;
    self.questionHeight=0.2;
    self.reponseHeight=0.7;

    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){0,50}$/g;
    self.questionNameValidInput = true;
    self.quizzNameValidInput = true;

    self.quizzNameDefault = "Ecrire ici le nom du quiz";
    self.labelDefault = "Cliquer deux fois pour ajouter la question";

    if(!question) {
        // init default : 2 empty answers
        self.tabAnswer = [new AnswerElement(null, self), new AnswerElement(null, self)];
        self.quizzName = "";
        self.label = "";
        self.rightAnswers = [];
        self.fontSize = 20;
    } else {
        self.tabAnswer = [];
        question.tabAnswer.forEach(function (answer) {
            self.tabAnswer.push(new AnswerElement(answer));
        });
        self.quizzName = question.parentQuizz.title;
        self.label = question.label;
        self.rightAnswers = [];
        self.fontSize = question.fontSize;
        self.tabAnswer.forEach(function (el) {
            if(el.bCorrect) {
                self.rightAnswers.push(el);
            }
        });
    }

    self.coordinatesAnswers = {x:0, y:0, w:0, h:0};
    self.formationName = "Hibernate";

    self.checkInputTextArea = function (myObj) {
        if(myObj.textarea.textContent.match(self.regex)) {
            myObj.remove();
            myObj.textarea.onblur = onblur;
            myObj.textarea.style.border = "none";
            myObj.textarea.style.outline = "none";
        } else {
            myObj.display();
            myObj.textarea.onblur = function () {
                myObj.textarea.textContent = "";
                myObj.onblur();
                myObj.remove();
            }
        }
    };

    self.display = function (x, y, w, h) {
        var quizzInfoHeight=Math.floor(h*self.headerHeight);
        var questionCreatorHeight=Math.floor(h*(1-self.headerHeight)-80);
        //var reponseAreaHeight=Math.floor(h*);
        self.manipulatorQuestionCreator.translator.move(x, quizzInfoHeight);

        //self.displayQuizzInfo(MARGIN+x, 2*MARGIN+y, w*0.5,quizzInfoHeight);
        //self.displayQuestionCreator(MARGIN+x, 3*MARGIN+quizzInfoHeight, w, questionCreatorHeight-2*MARGIN-60);
        //self.displayPreviewButton(MARGIN+x,MARGIN+quizzInfoHeight+questionCreatorHeight-MARGIN, w, 75);
        self.displayQuizzInfo(MARGIN+x, 2*MARGIN+y, w*0.5,quizzInfoHeight);
        self.displayQuestionCreator(MARGIN+x,2*MARGIN+quizzInfoHeight+15, w, questionCreatorHeight-2*MARGIN-60);
        self.displayPreviewButton(x+w/2,2*MARGIN+quizzInfoHeight+questionCreatorHeight-75/2, w, 75);
    };

    self.displayQuestionCreator = function (x, y, w, h) {
        var showTitle = function () {
            var color = (self.label) ? myColors.black : myColors.grey;
            var text = (self.label) ? self.label : self.labelDefault;
            self.questionBlock.title = displayText(text, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, null, self.manipulatorQuestionCreator);
            self.questionBlock.title.content.color(color).position(w/2, y-2*MARGIN);
            self.questionBlock.title.cadre.position(w/2,y-2*MARGIN).fillOpacity(0.001);
            svg.addEvent(self.questionBlock.title.content, "ondblclick", dblclickEdition);
            svg.addEvent(self.questionBlock.title.cadre, "ondblclick", dblclickEdition);
        };

        var dblclickEdition = function () {
            self.manipulatorQuestionCreator.ordonator.unset(1, self.questionBlock.title.content);
            var textarea = document.createElement("div");
            textarea.textContent = self.label;
            textarea.setAttribute("contenteditable", true);
            textarea.setAttribute("style", "position: relative; top:"+(-drawing.height+self.y-MARGIN+1)+"px; left:"+(self.x+2*MARGIN)+"px; width:"+(self.w-6*MARGIN)+"px; height:"+(self.h*0.25-3*MARGIN)+"px; vertical-align: middle; text-align:center; display:table-cell; font-family: Arial; font-size: 20px; resize: none; outline:none; border: none;");
            
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var onblur = function () {
                console.log(textarea);
                textarea.textContent && (self.label = textarea.textContent);
                textarea.remove();
                self.manipulatorQuestionCreator.ordonator.unset(0, self.questionBlock.title.cadre);
                showTitle();
            };

            var removeErrorMessage = function () {
                self.questionNameValidInput = true;
                self.errorMessage && self.manipulatorQuestionCreator.ordonator.unset(5);
            };

            var displayErrorMessage = function () {
                removeErrorMessage();
                self.questionBlock.title.cadre.color(myColors.white, 2, myColors.red);
                var position = (textarea.getBoundingClientRect().left+textarea.getBoundingClientRect().right)/2;
                var anchor = 'middle' ;
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                    .position(position, self.h*0.25+MARGIN)
                    .font("arial", 15).color(myColors.red).anchor(anchor);
                self.manipulatorQuestionCreator.ordonator.set(5,self.errorMessage);
                textarea.focus();
                self.questionNameValidInput = false;
            };

            textarea.oninput = function () {
                self.checkInputTextArea({textarea: textarea, border: self.questionBlock.title.cadre, onblur: onblur, remove: removeErrorMessage, display: displayErrorMessage});
            };
            textarea.onblur = onblur;
        };

        x && (self.x = x);
        y && (self.y = y);
        w && (self.w = w);
        h && (self.h = h);
        self.coordinatesAnswers = {
            x: self.x+MARGIN,
            y:self.y+2*MARGIN+self.h*0.25,
            w: self.w-2*MARGIN,
            h: h*0.75-3*MARGIN
        };

        // bloc Question
        self.questionBlock = {rect: new svg.Rect(self.w, self.h).color([],1, myColors.black).position(self.w/2, self.h/2)};
        self.manipulatorQuestionCreator.last.add(self.questionBlock.rect);
        showTitle();

        // bloc Answers
        if(self.tabAnswer.length !== self.MAX_ANSWERS) {
            self.tabAnswer.push(new AddEmptyElement(self));
        }
        self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true, self);
        self.manipulatorQuestionCreator.last.add(self.puzzle.puzzleManipulator.first);
        self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
    };
    self.displayQuizzInfo = function (x, y, w, h) {

        self.formationLabel = new svg.Text("Formation : " + self.formationName);
        self.formationLabel.position(x, y).font("arial", 20).anchor("start");
        self.manipulatorQuizzInfo.last.add(self.formationLabel);

        var showTitle = function () {
            var text = (self.quizzName) ? self.quizzName : self.quizzNameDefault;
            var color = (self.quizzName) ? myColors.black : myColors.grey;
            var bgcolor = myColors.grey;

            self.quizzLabel = {};
            self.quizzLabel.content = autoAdjustText(text, 0, 0, w, 35, 15, "Arial", self.manipulatorQuizzInfo).text;
            var width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBBox().width;
            self.quizzLabel.cadre = new svg.Rect(width+MARGIN, 35).color(bgcolor);
            self.quizzLabel.cadre.position(width/2+MARGIN,h/2-6).fillOpacity(0.1);
            self.manipulatorQuizzInfo.ordonator.set(0, self.quizzLabel.cadre);
            self.quizzLabel.content.position(MARGIN,h/2).color(color).anchor("start");

            svg.addEvent(self.quizzLabel.content, "ondblclick", dblclickEdition);
            svg.addEvent(self.quizzLabel.cadre, "ondblclick", dblclickEdition);
        };

        var dblclickEdition = function () {
            var width = self.quizzLabel.content.component.getBBox().width;
            //self.manipulatorQuizzInfo.ordonator.unset(0);
            self.manipulatorQuizzInfo.ordonator.unset(1);

            var textarea = document.createElement("div");
            textarea.textContent = self.quizzName;
            textarea.setAttribute("contenteditable", true);
            textarea.setAttribute("style", "position: absolute; top:"+(h/2-7.5)+"px; left:"+(MARGIN+6)+"px; width:"+(700)+"px; height:"+(20)+"px; resize: none; border: solid 2px #888; font-family: Arial; font-size: 15px; color: grey;");
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var removeErrorMessage = function () {
                self.quizzNameValidInput= true;
                self.errorMessage && self.manipulatorQuizzInfo.ordonator.unset(5);
            };

            var displayErrorMessage = function () {
                removeErrorMessage();
                self.quizzLabel.cadre.color(myColors.grey, 2, myColors.red);
                var position = (textarea.getBoundingClientRect().left-MARGIN);
                var anchor = 'start';
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                    .position(position, h-MARGIN)
                    .font("arial", 15).color(myColors.red).anchor(anchor);
                self.manipulatorQuizzInfo.ordonator.set(5,self.errorMessage);
                textarea.focus();
                self.quizzNameValidInput = false;
            };
            var onblur = function () {
                self.quizzNameValidInput && (self.quizzName = textarea.textContent);
                textarea.remove();
                showTitle();
            };
            textarea.oninput = function () {
                self.checkInputTextArea({textarea: textarea, border: self.quizzLabel.cadre, onblur: onblur, remove: removeErrorMessage, display: displayErrorMessage});
                //self.checkInputTextArea(textarea, "quizzNameValidInput", onblur, self.quizzLabel.cadre);
            };
            textarea.onblur = onblur;
            self.checkInputTextArea({textarea: textarea, border: self.quizzLabel.cadre, onblur: onblur, remove: removeErrorMessage, display: displayErrorMessage});
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
                if(el instanceof AnswerElement) {
                    if(el.bCorrect) {
                        correctAnswers++;
                    } else {
                        incorrectAnswers++;
                    }
                    isValidInput = isValidInput && el.isValidInput;
                    isFilled = isFilled || (el.label);
                }
            });
            if(isValidInput && self.questionNameValidInput && self.quizzNameValidInput) {
                if (correctAnswers >= 1 && incorrectAnswers >= 1) {
                    if (self.quizzName) {
                        if (self.label) {
                            mainManipulator.remove(self.manipulator);

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
                            quizz.run(20, 20, 1500, 800);
                        } else {
                            if (self.errorMessagePreview) {
                                self.previewButtonManipulator.last.remove(self.errorMessagePreview);
                            }
                            self.errorMessagePreview = new svg.Text("Vous devez donner un nom à la question.")
                                .position(-11* MARGIN-5 , h/2 - 6* MARGIN)
                                .font("arial", 20)
                                .anchor('center').color(myColors.red)
                            self.previewButtonManipulator.last.add(self.errorMessagePreview);
                        }
                    } else {
                        if (self.errorMessagePreview) {
                            self.previewButtonManipulator.last.remove(self.errorMessagePreview);
                        }
                        self.errorMessagePreview = new svg.Text("Vous devez donner un nom au quiz.")
                            .position(-10* MARGIN-10 , h/2 - 6* MARGIN)
                            .font("arial", 20)
                            .anchor('center').color(myColors.red);
                        self.previewButtonManipulator.last.add(self.errorMessagePreview);                    }
                } else {
                    if (self.errorMessagePreview) {
                        self.previewButtonManipulator.last.remove(self.errorMessagePreview);
                    }
                    self.errorMessagePreview = new svg.Text("Vous ne pouvez pas créer de question sans bonne réponse.")
                        .position(-15* MARGIN-5 , h/2 - 6* MARGIN)
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