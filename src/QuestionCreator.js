/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;
    var MAX_ANSWERS = 8;

    self._transformation={
        type:'',param1:'',param2:''
    };
    self.transformation=function(type,param1,param2){
        if(type){
            self._transformation.type=type;
        }
        if(param1){
            self._transformation.param1=param1;
        }
        if(param2){
            self._transformation.param2=param2;
        }

        return ""+self._transformation.type+self._transformation.param1+","+self._transformation.param2;
    };

    self.displaySet = paper.set();
    displaySet.push(self.displaySet);
    self.displaySet._transformation=self._transformation;
    self.margin = 15;
    self.headerHeight=0.1;
    self.questionHeight=0.2;
    self.reponseHeight=0.7;
    var larg = (window.innerWidth);
    var haut = (window.innerHeight);

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

    self.displaySetQuestionCreator = paper.set();
    self.displaySetQuizzInfo = paper.set();
    self.displaySetPreviewButton = paper.set();
    self.displaySet.push(self.displaySetQuestionCreator, self.displaySetQuizzInfo, self.displaySetPreviewButton);

    self.coordinatesAnswers = {x:0, y:0, w:0, h:0};
    self.formationName = "Hibernate";

    self.checkInputTextArea = function (textarea, isValidElement, onblur) {
        if(textarea.value.match(self.regex)) {
            self.errorMessage && self.errorMessage.remove();
            textarea.onblur = onblur;
            textarea.style.border = "none";
            textarea.style.outline = "none";
            self[isValidElement] = true;

        } else {
            self.errorMessage && self.errorMessage.remove();
            textarea.style.border = "solid 2px #FF0000";

            var position = isValidElement === "questionNameValidInput" ? (textarea.getBoundingClientRect().left+textarea.getBoundingClientRect().right)/2 : textarea.getBoundingClientRect().left;
            var anchor = isValidElement === "questionNameValidInput" ? 'middle' : 'start';

            self.errorMessage = paper.text(position, textarea.getBoundingClientRect().bottom+self.margin, "Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.").attr({
                "font-size": 15,"fill": 'red',"text-anchor": anchor});

            textarea.focus();
            self[isValidElement] = false;
            textarea.onblur = function () {
                textarea.value = "";
                onblur();
                self.errorMessage.remove();
            }
        }
    };

    self.display = function (x, y, w, h) {
        var quizzInfoHeight=Math.floor(haut*self.headerHeight);
        var questionCreatorHeight=Math.floor(haut*(1-self.headerHeight)-80);
        self.displayQuizzInfo(self.margin+x, self.margin+y, w*0.5,quizzInfoHeight);
        self.displayQuestionCreator(self.margin+x,self.margin+quizzInfoHeight+15, w, questionCreatorHeight-2*self.margin-30);
        self.displayPreviewButton(self.margin+x,self.margin+quizzInfoHeight+questionCreatorHeight-self.margin, w, 75);
    };

    self.displayQuestionCreator = function (x, y, w, h) {
        self.displaySetQuestionCreator.remove();
        self._transformation = self.transformation("t", x, y);
        var showTitle = function () {
            var color = (self.label) ? "black" : "#888";
            var text = (self.label) ? self.label : self.labelDefault;
            self.questionBlock.title = displayText(text, self.x+self.margin, self.y+self.margin, self.w-2*self.margin, self.h*0.25, "black", "white", self.fontSize);
            self.questionBlock.title.content.attr("fill", color);
            self.questionBlock.title.cadre.attr("fill-opacity", 0);
            self.questionBlock.title.content.node.ondblclick = dblclickEdition;
            self.questionBlock.title.cadre.node.ondblclick = dblclickEdition;
            self.displaySetQuestionCreator.push(self.questionBlock.title.content, self.questionBlock.title.cadre);
        };

        var dblclickEdition = function () {
            self.questionBlock.title.content.remove();
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.label;
            textarea.setAttribute("style", "position: absolute; top:"+(self.y+3*self.margin)+"px; left:"+(self.x+3*self.margin)+"px; width:"+(self.w-6*self.margin)+"px; height:"+(self.h*0.25-4*self.margin)+"px; text-align:center; resize: none; outline:none; border: none;");
            var body = document.getElementById("body");
            body.appendChild(textarea).focus();

            var onblur = function () {
                self.label = textarea.value;
                textarea.remove();
                self.questionBlock.title.cadre.remove();
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
            x: self.x+self.margin,
            y:self.y+2*self.margin+self.h*0.25,
            w: self.w-2*self.margin,
            h: h*0.75-3*self.margin
        };

        // bloc Question
        self.questionBlock = {rect: paper.rect(self.x, self.y, self.w, self.h).attr("fill", "none")};
        showTitle();
        self.displaySetQuestionCreator.push(self.questionBlock.rect);

        // bloc Answers
        if(self.tabAnswer.length !== MAX_ANSWERS) {
            self.tabAnswer.push(new AddEmptyElement(self));
        }
        self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true);
        self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
        self.displaySetQuestionCreator.push(self.puzzle.displaySet);
        /*self.tabAnswer.forEach(function (el) {
            self.displaySetQuestionCreator.push(el.displaySet);
        });*/
    };
    self.displayQuizzInfo = function (x, y, w, h) {
        self.formationLabel = paper.text(x, y, "Formation : " + self.formationName).attr("font-size", 20).attr("text-anchor", "start");
        self.displaySetQuizzInfo.push(self.formationLabel);

        var showTitle = function () {
            var text = (self.quizzName) ? self.quizzName : self.quizzNameDefault;
            var color = (self.quizzName) ? "black" : "#888";
            self.quizzLabel = paper.text(x+2, y+28, text).attr("font-size", 15).attr("text-anchor", "start").attr("fill", color);
            self.quizzBorder = paper.rect(x, y+18, self.quizzLabel.getBBox().width+4, 20);
            self.quizzLabel.node.ondblclick = dblclickEdition;
            self.displaySetQuizzInfo.push(self.quizzLabel, self.quizzBorder);
        };

        var dblclickEdition = function () {
            var width = self.quizzLabel.getBBox().width;
            self.quizzLabel.remove();
            self.quizzBorder.remove();
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.quizzName;
            textarea.setAttribute("style", "position: absolute; top:"+(y+16)+"px; left:"+(x-1)+"px; width:"+(width)+"px; height:"+(18)+"px; resize: none; border: solid 2px #888; font-family: Arial; font-size: 15px;");
            var body = document.getElementById("body");
            body.appendChild(textarea).focus();

            var onblur = function () {
                self.quizzName = textarea.value;
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
        self.previewButton = displayText("Aperçu", x+w/2-100, y, 200, h, "black", "white", 20);

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
                            self.errorMessagePreview = paper.text(x+ w/2 - self.margin -170, y + h / 2 - 50, "Vous devez donner un nom à la question.").attr({
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
                        self.errorMessagePreview = paper.text(x+ w/2 - self.margin -150, y + h / 2 - 50, "Vous devez donner un nom au quiz.").attr({
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
                    self.errorMessagePreview = paper.text(x+ w/2 - self.margin -240, y + h / 2 - 50, "Vous ne pouvez pas créer une question sans réponses.").attr({
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