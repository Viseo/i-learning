/**
 * Created by ABL3483 on 12/04/2016.
 */

function QuizzManager(){
    var self=this;

    self.formationName = "Hibernate";
    self.quizzName="";
    self.quizzNameDefault = "Ecrire ici le nom du quiz";

    self.questionCreator = new QuestionCreator();
    self.bib = new BibImage(myBib);

    self.quizzManagerManipulator = new Manipulator();
    mainManipulator.ordonator.set(0,self.quizzManagerManipulator.first);

    self.questionsPuzzleManipulator = new Manipulator();
    self.quizzInfoManipulator = new Manipulator();
    self.questionCreatorManipulator = self.questionCreator.manipulator;
    self.previewButtonManipulator = new Manipulator();
    self.libraryManipulator = self.bib.bibManipulator;

    self.quizzManagerManipulator.last.add(self.libraryManipulator.first); // La bibliothèque n'est pas removed lors de l'aperçu

    self.quizzManagerManipulator.last.add(self.quizzInfoManipulator.first);
    self.quizzManagerManipulator.last.add(self.questionsPuzzleManipulator.first);
    self.quizzManagerManipulator.last.add(self.questionCreatorManipulator.first);
    self.quizzManagerManipulator.last.add(self.previewButtonManipulator.first);


    // WIDTH
    self.bibWidthRatio=0.15;
    self.questCreaWidthRatio = 1-self.bibWidthRatio;

    self.bibWidth = drawing.width*self.bibWidthRatio;
    self.questCreaWidth = drawing.width*self.questCreaWidthRatio;

    // HEIGHT
    self.quizzInfoHeightRatio = 0.05;
    self.questionsPuzzleHeightRatio = 0.25;
    self.questCreaHeightRatio = 0.57;
    self.bibHeightRatio = self.questCreaHeightRatio;
    self.previewButtonHeightRatio = 0.1;

    self.quizzInfoHeight = drawing.height*self.quizzInfoHeightRatio;
    self.questionsPuzzleHeight = drawing.height*self.questionsPuzzleHeightRatio;
    self.bibHeight = drawing.height*self.bibHeightRatio;
    self.questCreaHeight = drawing.height*self.questCreaHeightRatio;
    self.previewButtonHeight = drawing.height*self.previewButtonHeightRatio;

    self.display = function(){

        self.bib.run(1, self.quizzInfoHeight+self.questionsPuzzleHeight, self.bibWidth, self.bibHeight, function(){
            self.questionCreator.display(self.bib.x + self.bibWidth, self.bib.y, self.questCreaWidth, self.questCreaHeight);
            self.displayQuizzInfo(1, self.quizzInfoHeight/2, drawing.width,self.quizzInfoHeight);
            self.displayPreviewButton(drawing.width/2, drawing.height - self.previewButtonHeight/2-MARGIN/2, 150, self.previewButtonHeight-2*MARGIN);

        });

    };

    self.displayQuizzInfo = function (x, y, w, h) {

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
            self.quizzNameHeight = self.quizzLabel.content.component.getBBox().height;
            self.quizzLabel.cadre = new svg.Rect(width, 2*self.quizzNameHeight).color(bgcolor);
            self.quizzLabel.cadre.position(width/2,h/2).fillOpacity(0.1);
            self.quizzInfoManipulator.ordonator.set(0, self.quizzLabel.cadre);
            self.quizzLabel.content.position(0,h/2 + self.quizzNameHeight/4).color(color).anchor("start");

            self.quizzInfoManipulator.first.move(x,y);
            svg.addEvent(self.quizzLabel.content, "dblclick", dblclickEdition);
            svg.addEvent(self.quizzLabel.cadre, "dblclick", dblclickEdition);
        };

        var dblclickEdition = function (event) {
            var width = self.quizzLabel.content.component.getBBox().width;
            //self.quizzInfoManipulator.ordonator.unset(0);
            self.quizzInfoManipulator.ordonator.unset(1);

            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.quizzName;
            textarea.setAttribute("style", "position: absolute; top:" + (self.quizzInfoHeight-self.quizzNameHeight/4+1) + "px; left:" + (x+MARGIN/2 + 1) + "px; width:" + (700) + "px; height:" + (self.quizzNameHeight+3) + "px; resize: none; border: none; outline:none; overflow:hidden; font-family: Arial; font-size: 15px; background-color: transparent;");
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var removeErrorMessage = function () {
                self.questionCreator.quizzNameValidInput = true;
                self.questionCreator.errorMessage && self.quizzInfoManipulator.ordonator.unset(5);
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
                self.quizzInfoManipulator.ordonator.set(5, self.errorMessage);
                textarea.focus();
                self.quizzNameValidInput = false;
            };
            var onblur = function () {
                self.questionCreator.quizzNameValidInput && (self.quizzName = textarea.value);
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
    };

    self.displayPreviewButton = function (x, y, w, h) {
        self.previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, self.previewButtonManipulator);

        var previewFunction = function () {
            var correctAnswers = 0;
            var incorrectAnswers = 0;

            var isValidInput = true;
            var isFilled = false;

            self.questionCreator.tabAnswer.forEach(function (el) {
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
            if (isValidInput && self.questionCreator.questionNameValidInput && self.questionCreator.quizzNameValidInput) {
                if (correctAnswers >= 1 && incorrectAnswers >= 1) {
                    if (self.quizzName) {
                        if (self.questionCreator.label) {
                            //mainManipulator.ordonator.unset(0, self.questionCreator.manipulator.first);
                            self.quizzManagerManipulator.last.flush();
                            var tabAnswer = [];
                            self.questionCreator.tabAnswer.forEach(function (el) {
                                if (el instanceof AnswerElement) {
                                    tabAnswer.push(el.toAnswer());
                                }
                            });

                            var tabQuestion = [];
                            var questionObject = {
                                label: self.questionCreator.label,
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
                            if (self.questionCreator.errorMessagePreview) {
                                self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
                            }
                            self.questionCreator.errorMessagePreview = new svg.Text("Vous devez donner un nom à la question.")
                                .position(-11 * MARGIN - 5, h / 2 - 6 * MARGIN)
                                .font("arial", 20)
                                .anchor('center').color(myColors.red);
                            self.previewButtonManipulator.last.add(self.questionCreator.errorMessagePreview);
                        }
                    } else {
                        if (self.questionCreator.errorMessagePreview) {
                            self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
                        }
                        self.questionCreator.errorMessagePreview = new svg.Text("Vous devez donner un nom au quiz.")
                            .position(-10 * MARGIN - 10, h / 2 - 6 * MARGIN)
                            .font("arial", 20)
                            .anchor('center').color(myColors.red);
                        self.previewButtonManipulator.last.add(self.questionCreator.errorMessagePreview);                    }
                } else {
                    if (self.questionCreator.errorMessagePreview) {
                        self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
                    }
                    self.questionCreator.errorMessagePreview = new svg.Text("Vous ne pouvez pas créer de question sans bonne réponse.")
                        .position(-15 * MARGIN - 5, h / 2 - 6 * MARGIN)
                        .font("arial", 20)
                        .anchor('center').color(myColors.red);

                    self.previewButtonManipulator.last.add(self.questionCreator.errorMessagePreview);
                }
            }
        };

        svg.addEvent(self.previewButton.cadre, "click", previewFunction);
        svg.addEvent(self.previewButton.content, "click", previewFunction);

        //self.previewButtonManipulator.last.add(self.previewButton.cadre);
        //self.previewButtonManipulator.last.add(self.previewButton.content);

        self.previewButtonManipulator.translator.move(x, y);
       // self.previewButtonManipulator.translator.move(w/2-MARGIN, h - self.headerHeight*h);

    }


};