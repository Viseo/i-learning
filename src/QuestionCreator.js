/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;

    self.displaySet = paper.set();
    self.margin = 15;

    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){1,3000}$/g;
    self.questionNameValidInput = true;
    self.quizzNameValidInput = true;

    if(!question) {
        // init default : 2 empty answers
        self.tabAnswer = [new AnswerElement(myQuizz.tabQuestions[0].tabAnswer[1], self), new AnswerElement(null, self)];
        self.quizzName = "Ecrire ici le nom du quiz";
        self.label = "Cliquer deux fois pour ajouter la question";
        self.rightAnswers = [];
        self.fontSize = 20;
    } else {
        self.tabAnswer = question.tabAnswer;
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

    self.displaySetQuestionCreator = paper.set();
    self.displaySetQuizzInfo = paper.set();
    self.displaySetPreviewButton = paper.set();
    self.displaySet.push(self.displaySetQuestionCreator, self.displaySetQuizzInfo, self.displaySetPreviewButton);

    self.coordinatesAnswers = {x:0, y:0, w:0, h:0};
    self.formationName = "Hibernate";

    self.display = function (x, y, w, h) {
        self.displayQuizzInfo(x, y, w*0.5, 10);
        self.displayQuestionCreator(x, y+50, w, h-150);
        self.displayPreviewButton(x, y+50+h-150+self.margin, w, 75);
    };

    self.displayQuestionCreator = function (x, y, w, h) {
        self.displaySetQuestionCreator.remove();

        if(x) {
            self.x = x;
        }
        if(y){
            self.y = y;
        }
        if(w){
            self.w = w;
        }
        if(h){
            self.h = h;
        }

        self.coordinatesAnswers.x = self.x+self.margin;
        self.coordinatesAnswers.y = self.y+2*self.margin+self.h*0.25;
        self.coordinatesAnswers.w = self.w-2*self.margin;
        self.coordinatesAnswers.h = self.h*0.75-3*self.margin;

        // bloc Question
        self.questionBlock = {};
        self.questionBlock.rect = paper.rect(self.x, self.y, self.w, self.h).attr("fill", "none");
        self.questionBlock.title = displayText(self.label, self.x+self.margin, self.y+self.margin, self.w-2*self.margin, self.h*0.25, "black", "white", self.fontSize);
        self.questionBlock.title.cadre.attr("fill-opacity", 0);

        var dblclickEdition = function () {
            self.questionBlock.title.content.remove();
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.label;
            textarea.setAttribute("style", "position: absolute; top:"+(self.y+3*self.margin)+"px; left:"+(self.x+3*self.margin)+"px; width:"+(self.w-6*self.margin)+"px; height:"+(self.h*0.25-4*self.margin)+"px; text-align:center; resize: none; border: none;");
            var body = document.getElementById("body");
            body.appendChild(textarea).focus();

            var onblur = function () {
                self.label = textarea.value;
                textarea.remove();
                self.questionBlock.title.cadre.remove();
                self.questionBlock.title = displayText(self.label, self.x+self.margin, self.y+self.margin, self.w-2*self.margin, self.h*0.25, "black", "white", self.fontSize);
                self.questionBlock.title.cadre.attr("fill-opacity", 0);
                self.questionBlock.title.content.node.ondblclick = dblclickEdition;
                self.questionBlock.title.cadre.node.ondblclick = dblclickEdition;
                self.displaySetQuestionCreator.push(self.questionBlock.title.content);
                self.displaySetQuestionCreator.push(self.questionBlock.title.cadre);
            };

            textarea.oninput = function () {
                if(textarea.value.match(self.regex)) {
                    textarea.onblur = onblur;
                    textarea.style.border = "none";
                    self.questionNameValidInput = true;
                } else {
                    textarea.style.border = "solid #FF0000";
                    textarea.focus();
                    self.questionNameValidInput = false;
                    textarea.onblur = function () {
                        asyncTimerController.timeout(function () {
                            textarea.focus();
                        }, 0);
                    }
                }
            };
            textarea.onblur = onblur;

        };


        self.questionBlock.title.content.node.ondblclick = dblclickEdition;
        self.questionBlock.title.cadre.node.ondblclick = dblclickEdition;

        self.displaySetQuestionCreator.push(self.questionBlock.rect);
        self.displaySetQuestionCreator.push(self.questionBlock.title.content);
        self.displaySetQuestionCreator.push(self.questionBlock.title.cadre);

        // bloc Answers
        self.answersBlock = {};
        if(self.tabAnswer.length !== 8) {
            self.tabAnswer.push(new AddEmptyElement(self));
        }
        self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true);
        self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
        self.tabAnswer.forEach(function (el) {
            self.displaySetQuestionCreator.push(el.displaySet);
        });
        //self.displaySetQuestionCreator.push(self.puzzle.displaySet);
    };
    self.displayQuizzInfo = function (x, y, w, h) {
        self.formationLabel = paper.text(x, y, "Formation : " + self.formationName).attr("font-size", 20).attr("text-anchor", "start");
        self.displaySetQuizzInfo.push(self.formationLabel);

        var dblclickEdition = function () {
            self.quizzLabel.remove();
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.quizzName;
            textarea.setAttribute("style", "position: absolute; top:"+(y+20)+"px; left:"+(x)+"px; width:"+(w/2)+"px; height:"+(20)+"px; resize: none; border: red;");
            var body = document.getElementById("body");
            body.appendChild(textarea).focus();
            var onblur = function () {
                self.quizzName = textarea.value;
                textarea.remove();
                self.quizzLabel = paper.text(x, y+30, self.quizzName).attr("font-size", 20).attr("text-anchor", "start");
                self.quizzLabel.node.ondblclick = dblclickEdition;
                self.displaySetQuizzInfo.push(self.quizzLabel);
            };

            textarea.oninput = function () {
                if(textarea.value.match(self.regex)) {
                    textarea.onblur = onblur;
                    textarea.style.border = "none";
                    self.quizzNameValidInput = true;
                } else {
                    textarea.style.border = "solid #FF0000";
                    textarea.focus();
                    self.quizzNameValidInput = false;
                    textarea.onblur = function () {
                        asyncTimerController.timeout(function () {
                            textarea.focus();
                        }, 0);
                    }
                }
            };
            textarea.onblur = onblur;
        };

        self.quizzLabel = paper.text(x, y+30, self.quizzName).attr("font-size", 20).attr("text-anchor", "start");
        self.quizzLabel.node.ondblclick = dblclickEdition;
        self.displaySetQuizzInfo.push(self.quizzLabel);

    };

    self.displayPreviewButton = function (x, y, w, h) {
        paper.setSize(x+w+2*self.margin, y+h+2);
        self.previewButton = displayText("Aperçu", x+w/2-100, y, 200, h, "black", "white", 20);

        var previewFunction = function () {
            var correctAnswers = 0;
            var incorrectAnswers = 0;

            var isValidInput = true;

            self.tabAnswer.forEach(function (el) {
                if(el instanceof AnswerElement) {
                    if(el.bCorrect) {
                        correctAnswers++;
                    } else {
                        incorrectAnswers++;
                    }
                    isValidInput = isValidInput && el.isValidInput;

                }
            });
            if(isValidInput && self.questionNameValidInput && self.quizzNameValidInput) {
                if (correctAnswers >= 1 && incorrectAnswers >= 1) {
                    if (self.quizzName !== "Ecrire ici le nom du quiz") {
                        if (self.label !== "Cliquer deux fois pour ajouter la question") {
                            self.displaySet.remove();

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
                            //var quest = new Question(questionObject, null);
                            //quest.display(20, 20, 1500, 200);
                            //quest.displayAnswers(20, 20, 1500, 200);
                        } else {
                            if (self.errorMessagePreview) {
                                self.errorMessagePreview.remove();
                            }
                            self.errorMessagePreview = paper.text(x + w / 2 + 100 + self.margin, y + h / 2, "Vous devez donner un nom à la question.").attr({
                                "font-size": 20,
                                "fill": 'red',
                                "text-anchor": 'start'
                            });
                            self.displaySetPreviewButton.push(self.errorMessagePreview);
                        }
                    } else {
                        if (self.errorMessagePreview) {
                            self.errorMessagePreview.remove();
                        }
                        self.errorMessagePreview = paper.text(x + w / 2 + 100 + self.margin, y + h / 2, "Vous devez donner un nom au quiz.").attr({
                            "font-size": 20,
                            "fill": 'red',
                            "text-anchor": 'start'
                        });
                        self.displaySetPreviewButton.push(self.errorMessagePreview);
                    }
                } else {
                    if (self.errorMessagePreview) {
                        self.errorMessagePreview.remove();
                    }
                    self.errorMessagePreview = paper.text(x + w / 2 + 100 + self.margin, y + h / 2, "Vous devez définir au moins une bonne et une mauvaise réponse.").attr({
                        "font-size": 20,
                        "fill": 'red',
                        "text-anchor": 'start'
                    });
                    self.displaySetPreviewButton.push(self.errorMessagePreview);
                }
            }
        };

        self.previewButton.cadre.node.onclick = previewFunction;
        self.previewButton.content.node.onclick = previewFunction;

        self.displaySetPreviewButton.push(self.previewButton.cadre);
        self.displaySetPreviewButton.push(self.previewButton.content);
    }
};