/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;

    self.displaySet = paper.set();

    if(!question) {
        // init default : 2 empty answers
        self.tabAnswer = [new EmptyElement(self), new EmptyElement(self)];
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

        var dblclickEdition = function () {
            self.questionBlock.title.content.remove();
            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.label;
            textarea.setAttribute("style", "position: absolute; top:"+(self.y+3*self.margin)+"px; left:"+(self.x+3*self.margin)+"px; width:"+(self.w-6*self.margin-2)+"px; height:"+(self.h*0.25-2-6*self.margin)+"px; text-align:center; resize: none; border: none;");
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
            self.tabAnswer.push(new AddEmptyElement(self));
            self.puzzle = new Puzzle(2, 4, self.tabAnswer, self.coordinatesAnswers, true);
            self.puzzle.display(self.coordinatesAnswers.x, self.coordinatesAnswers.y, self.coordinatesAnswers.w, self.coordinatesAnswers.h, 0);
        }
    };
    self.displayQuizzInfo = function (x, y, w, h) {
        
    };
    self.displayPreviewButton = function (x, y, w, h) {

    }
};