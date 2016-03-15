/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (question) {
    var self = this;
    if(!question) {
        // init default : 2 empty answers
        self.tabAnswer = [{}, {}];
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
    self.formationName = "Hibernate";

    self.displaySet = paper.set();

    self.displayQuestionCreator = function (x, y, w, h) {
        self.margin = 15;

        // bloc Question
        self.questionBlock = {};
        self.questionBlock.rect = paper.rect(x, y, w, h);
        self.questionBlock.title = displayText(self.label, x+self.margin, y+self.margin, w-2*self.margin, h*0.25, "black", "white", self.fontSize);
        var dblclickEdition = function () {
            console.log("double clic");
        };
        self.questionBlock.title.content.node.ondblclick = dblclickEdition;
        self.questionBlock.title.cadre.node.ondblclick = dblclickEdition;

        self.displaySet.push(self.questionBlock.rect, self.questionBlock.title.content, self.questionBlock.title.cadre);

        // bloc Answers
    };
    self.displayQuizzInfo = function (x, y, w, h) {
        
    };
    self.displayPreviewButton = function (x, y, w, h) {

    }
};