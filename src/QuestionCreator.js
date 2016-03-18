/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;

    self.displaySet = paper.set();

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
    self.coordinatesAnswers = {x:0, y:0, w:0, h:0};
    self.formationName = "Hibernate";

    self.displayQuestionCreator = function (x, y, w, h) {
        self.displaySet.forEach(function (el) {
            el.remove();
        });
        self.margin = 15;

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

        console.log(x + " " + y + " " + w + " " + h);
        console.log(self.x + " " + self.y + " " + self.w + " " + self.h);

        self.coordinatesAnswers.x = self.x+self.margin;
        self.coordinatesAnswers.y = self.y+2*self.margin+self.h*0.25;
        self.coordinatesAnswers.w = self.w-2*self.margin;
        self.coordinatesAnswers.h = self.h*0.75-3*self.margin;

        // bloc Question
        self.questionBlock = {};
        self.questionBlock.rect = paper.rect(self.x, self.y, self.w, self.h).attr("fill", "none");
        self.questionBlock.title = displayText(self.label, self.x+self.margin, self.y+self.margin, self.w-2*self.margin, self.h*0.25, "black", "white", self.fontSize);
        self.questionBlock.title.cadre.attr("fill-opacity", 0);

        self.displaySet.push(self.questionBlock.rect);
        self.displaySet.push(self.questionBlock.title.content);
        self.displaySet.push(self.questionBlock.title.cadre);

        var dblclickEdition = function () {
            self.questionBlock.title.content.remove();
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.label;
            textarea.setAttribute("style", "position: absolute; top:"+(self.y+3*self.margin)+"px; left:"+(self.x+3*self.margin)+"px; width:"+(self.w-6*self.margin)+"px; height:"+(self.h*0.25-4*self.margin)+"px; text-align:center; resize: none; border: red;");
            var body = document.getElementById("body");
            body.appendChild(textarea).focus();
            textarea.onblur = function () {
                self.label = textarea.value;
                self.questionBlock.title.content.attr("text", self.label);
                textarea.remove();
                self.questionBlock.title.cadre.remove();
                self.questionBlock.title = displayText(self.label, self.x+self.margin, self.y+self.margin, self.w-2*self.margin, self.h*0.25, "black", "white", self.fontSize);
                self.questionBlock.title.cadre.attr("fill-opacity", 0);
                self.questionBlock.title.content.node.ondblclick = dblclickEdition;
                self.questionBlock.title.cadre.node.ondblclick = dblclickEdition;
            };
        };

        self.questionBlock.title.content.node.ondblclick = dblclickEdition;
        self.questionBlock.title.cadre.node.ondblclick = dblclickEdition;

        self.displaySet.push(self.questionBlock.rect, self.questionBlock.title.content, self.questionBlock.title.cadre);

        // bloc Answers
        if(self.tabAnswer.length === 8) {
            self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true);
            self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
        } else {
            self.tabAnswer.push(new AddEmptyElement(self));
            self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true);
            self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
        }
    };
    self.displayQuizzInfo = function (x, y, w, h) {
        self.formationLabel = paper.text(x, y, "Formation : " + self.formationName).attr("font-size", 20).attr("text-anchor", "start");
        var displaySet = paper.set();
        displaySet.push(self.formationLabel);
        self.displaySet.push(displaySet);
    };
    self.displayPreviewButton = function (x, y, w, h) {
        paper.setSize(x+w+2*self.margin, y+h+2);
        self.previewButton = displayText("Aperçu", x+w/2-100, y, 200, h, "black", "white", 20);

        var previewFunction = function () {
            console.log("Aperçu");
            var correctAnswers = 0;
            var incorrectAnswers = 0;

            self.tabAnswer.forEach(function (el) {
                if(el.bCorrect) {
                    correctAnswers++;
                } else {
                    incorrectAnswers++;
                }
            });
            console.log(correctAnswers);
            console.log(incorrectAnswers);
            if(correctAnswers >= 1 && incorrectAnswers >= 1) {
                console.log("preview mode step 1 OK");
                if(self.quizzName === "Ecrire ici le nom du quiz") {
                    console.log("preview mode step 2 OK");
                    if(self.label !== "Cliquer deux fois pour ajouter la question") {
                        console.log("Preview Mode ACCEPTED");
                        self.questionBlock.rect.remove();
                        self.questionBlock.title.cadre.remove();
                        self.questionBlock.title.content.remove();

                        self.displaySet.remove();

                        // TODO Display Preview Answer
                        var tabAnswer = [];
                        var questionObject = {
                            label: self.label,
                            tabAnswer: tabAnswer,
                            nbrows: 4,
                            colorBordure: myColors.blue,
                            bgColor: myColors.grey
                        };
                        var quest = new Question(questionObject, null);
                        quest.display(20, 20, 1500, 500);
                    } else {
                        console.log("preview mode REFUSED : il faut donner un nom à la question");
                    }
                } else {
                    console.log("preview mode REFUSED : il faut donner un nom au Quiz");
                }
            } else {
                console.log("preview mode REFUSED : il faut au moins une bonne et une mauvaise réponse");
            }
        };

        self.previewButton.cadre.node.onclick = previewFunction;
        self.previewButton.content.node.onclick = previewFunction;

        self.displaySet.push(self.previewButton.cadre);
        self.displaySet.push(self.previewButton.content);
    }
};