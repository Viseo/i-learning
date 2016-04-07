/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;
    self.MAX_ANSWERS = 8;

    self.manipulator = new Manipulator();
    mainManipulator.ordonator.set(0,self.manipulator.first);

    self.manipulatorQuizzInfo = new Manipulator();
    self.manipulator.last.add(self.manipulatorQuizzInfo.first);

    self.manipulatorQuestionCreator = new Manipulator();
    self.manipulator.last.add(self.manipulatorQuestionCreator.first);

    self.previewButtonManipulator = new Manipulator();
    self.manipulator.last.add(self.previewButtonManipulator.first);

    MARGIN = 15;
    self.headerHeight=0.1;
    self.questionHeight=0.2;
    self.reponseHeight=0.7;

    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){0,3000}$/g;
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
        //self.tabAnswer = question.tabAnswer;
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

    self.checkInputTextArea = function (textarea, isValidElement, onblur) {
        if(textarea.textContent.match(self.regex)) {
            self.errorMessage && self.manipulatorQuestionCreator.ordonator.unset(5,self.errorMessage);
            textarea.onblur = onblur;
            textarea.style.border = "none";
            textarea.style.outline = "none";
            self[isValidElement] = true;

        } else {
            self.errorMessage && self.manipulatorQuestionCreator.ordonator.unset(5,self.errorMessage);
            textarea.style.border = "solid 2px #FF0000";
            var position = isValidElement === "questionNameValidInput" ? (textarea.getBoundingClientRect().left+textarea.getBoundingClientRect().right)/2 : textarea.getBoundingClientRect().left;
            var anchor = isValidElement === "questionNameValidInput" ? 'middle' : 'start';
            self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                .position(position, textarea.getBoundingClientRect().bottom+MARGIN)
                .font("arial", 15).color(myColors.red).anchor(anchor);
            self.manipulatorQuestionCreator.ordonator.set(5,self.errorMessage);
            textarea.focus();
            self[isValidElement] = false;
            textarea.onblur = function () {
                textarea.value = "";
                onblur();
                self.manipulatorQuestionCreator.ordonator.unset(5,self.errorMessage);
            }
        }
    };

    self.display = function (x, y, w, h) {
        var quizzInfoHeight=Math.floor(h*self.headerHeight);
        var questionCreatorHeight=Math.floor(h*(1-self.headerHeight)-80);
        //var reponseAreaHeight=Math.floor(h*);
        self.manipulatorQuestionCreator.translator.move(x, quizzInfoHeight);

        self.displayQuizzInfo(MARGIN+x, MARGIN+y, w*0.5,quizzInfoHeight);
        self.displayQuestionCreator(MARGIN+x,MARGIN+quizzInfoHeight+15, w, questionCreatorHeight-2*MARGIN-60);
        self.displayPreviewButton(x+w/2,quizzInfoHeight+questionCreatorHeight-75/2, w, 75);
    };

    self.displayQuestionCreator = function (x, y, w, h) {
        var showTitle = function () {
            var color = (self.label) ? myColors.black : myColors.grey;
            var text = (self.label) ? self.label : self.labelDefault;
            self.questionBlock.title = displayText(text, self.w-2*MARGIN, self.h*0.25, myColors.black, myColors.none, self.fontSize, null, self.manipulatorQuestionCreator);
            self.questionBlock.title.content.color(color).position(w/2,y);
            self.questionBlock.title.cadre.position(w/2,y).fillOpacity(0.001);
            svg.addEvent(self.questionBlock.title.content, "ondblclick", dblclickEdition);
            svg.addEvent(self.questionBlock.title.cadre, "ondblclick", dblclickEdition);
            //self.manipulatorQuestionCreator.last.add(self.questionBlock.title.content).add(self.questionBlock.title.cadre);
        };

        var dblclickEdition = function () {
            self.manipulatorQuestionCreator.ordonator.unset(1, self.questionBlock.title.content);
            var textarea = document.createElement("div");
            textarea.textContent = self.label;
            textarea.setAttribute("style", "position: absolute; top:"+(self.y+3*MARGIN)+"px; left:"+(self.x+3*MARGIN)+"px; width:"+(self.w-6*MARGIN)+"px; height:"+(self.h*0.25-4*MARGIN)+"px; text-align:center; resize: none; outline:none; border: none; vertical-align: center; display:inline-block;");
            textarea.setAttribute("contenteditable", true);
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var onblur = function () {
                console.log(textarea);
                textarea.textContent && (self.label = textarea.textContent);
                textarea.remove();
                self.manipulatorQuestionCreator.ordonator.unset(0, self.questionBlock.title.cadre);
                showTitle();
            };

            textarea.oninput = function () {
                self.checkInputTextArea(textarea, "questionNameValidInput", onblur);
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
            var bgcolor = (self.quizzName) ? myColors.white : myColors.grey;

            self.quizzLabel = {};
            //self.quizzLabel = new svg.Text(text).position(x+2, y+28).font("arial", 15).anchor("start").color(color);
            //self.quizzLabel = displayText(text, w, 35, color, color, 15, "arial", self.manipulatorQuizzInfo);
            self.quizzLabel.content = autoAdjustText(text, 0, 0, w, 35, 15, "Arial", self.manipulatorQuizzInfo).text;
            var width = self.quizzLabel.content.component.getBBox().width;
            self.quizzLabel.cadre = new svg.Rect(width+MARGIN, 35).color(bgcolor);
            self.quizzLabel.cadre.position(width/2+MARGIN,h/2-6).fillOpacity(0.1);
            self.manipulatorQuizzInfo.ordonator.set(0, self.quizzLabel.cadre);
            self.quizzLabel.content.position(width/2+MARGIN,h/2).color(color);

            svg.addEvent(self.quizzLabel.content, "ondblclick", dblclickEdition);
            svg.addEvent(self.quizzLabel.cadre, "ondblclick", dblclickEdition);
            //self.manipulatorQuizzInfo.last.add(self.quizzLabel.content/*, self.quizzBorder*/);
            //self.manipulatorQuizzInfo.last.add(self.quizzLabel.cadre/*, self.quizzBorder*/);

        };

        var dblclickEdition = function () {
            var width = self.quizzLabel.content.component.getBBox().width;
            self.manipulatorQuizzInfo.ordonator.unset(0);
            self.manipulatorQuizzInfo.ordonator.unset(1);

            //self.quizzBorder.remove();
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.quizzName;
            textarea.setAttribute("style", "position: absolute; top:"+(h/2-7.5)+"px; left:"+(MARGIN+6)+"px; width:"+(w)+"px; height:"+(18)+"px; resize: none; border: solid 2px #888; font-family: Arial; font-size: 15px; color: grey; background-color: #F2F2F1;");
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var onblur = function () {
                self.quizzNameValidInput && (self.quizzName = textarea.value);
                textarea.remove();
                showTitle();
            };
            textarea.oninput = function () {
                self.checkInputTextArea(textarea, "quizzNameValidInput", onblur);
            };
            textarea.onblur = onblur;
            self.checkInputTextArea(textarea, "quizzNameValidInput", onblur);
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
                if (correctAnswers >= 1 && incorrectAnswers >= 1 && isFilled) {
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
                                self.errorMessagePreview.remove();
                            }
                            self.errorMessagePreview = new svg.Text("Vous devez donner un nom à la question.")
                                .position(-11* MARGIN-5 , h/2 - 6* MARGIN)
                                .font("arial", 20)
                                .anchor('center').color(myColors.red)
                            self.previewButtonManipulator.last.add(self.errorMessagePreview);
                        }
                    } else {
                        if (self.errorMessagePreview) {
                            self.errorMessagePreview.remove();
                        }
                        self.errorMessagePreview = new svg.Text("Vous devez donner un nom au quiz.")
                            .position(-10* MARGIN-10 , h/2 - 6* MARGIN)
                            .font("arial", 20)
                            .anchor('center').color(myColors.red);
                        self.previewButtonManipulator.last.add(self.errorMessagePreview);                    }
                } else {
                    if (self.errorMessagePreview) {
                        self.errorMessagePreview.remove();
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