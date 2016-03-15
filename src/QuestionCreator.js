/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;
    if(!question) {
        // init default : 2 empty answers
        self.tabAnswer = [new EmptyElement(), new EmptyElement()];
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
    self.displaySet = paper.set();

    self.displayQuestionCreator = function (x, y, w, h) {
        self.displaySet.forEach(function (el) {
            el.remove();
        });
        self.margin = 15;
        self.coordinatesAnswers.x = x+self.margin;
        self.coordinatesAnswers.y = y+2*self.margin+h*0.25;
        self.coordinatesAnswers.w = w-2*self.margin;
        self.coordinatesAnswers.h = h*0.75-3*self.margin;

        // bloc Question
        self.questionBlock = {};
        self.questionBlock.rect = paper.rect(x, y, w, h).attr("fill", "none");
        self.questionBlock.title = displayText(self.label, x+self.margin, y+self.margin, w-2*self.margin, h*0.25, "black", "none", self.fontSize);
        self.questionBlock.title.cadre.attr("fill-opacity", 0);
        self.questionBlock.title.cadre.node.setAttribute("id", "rect");
        var dblclickEdition = function () {
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.label;
            textarea.setAttribute("style", "position: absolute; top:"+(y+self.margin)+"px; left:"+(x+self.margin)+"px; width:"+(w-2*self.margin-2)+"px; height:"+(h*0.25-2)+"px; text-align:center; resize: none; border: none;");
            var body = document.getElementById("body");
            body.appendChild(textarea).focus();
            textarea.onblur = function () {
                self.label = textarea.value;
                self.questionBlock.title.content.attr("text", self.label);
                textarea.remove();
            };
            console.log("double clic");
        };
        self.questionBlock.title.content.node.ondblclick = dblclickEdition;
        self.questionBlock.title.cadre.node.ondblclick = dblclickEdition;

        self.displaySet.push(self.questionBlock.rect, self.questionBlock.title.content, self.questionBlock.title.cadre);

        // bloc Answers
        self.answersBlock = {};
        if(self.tabAnswer.length === 8) {
            self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true);
            self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
        } else {
            //self.tabAnswer.push({label: "Double-clic..."});
            self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true);
            self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
        }
    };
    self.displayQuizzInfo = function (x, y, w, h) {
        
    };
    self.displayPreviewButton = function (x, y, w, h) {

    }
};