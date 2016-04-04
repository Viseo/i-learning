/**
 * Created by ABL3483 on 01/03/2016.
 */

/**
 *
 * @constructor
 * @param quizz
 * @param previewMode
 */
function Quizz(quizz, previewMode) {
    var self=this;

    self.quizzManipulator = new Manipulator();
    //mainManipulator.last.add(self.quizzManipulator.translator);
    mainManipulator.ordonator.set(0, self.quizzManipulator.first);

    self.tabQuestions=[];
    if (quizz.tabQuestions !== null) {
        quizz.tabQuestions.forEach(function (it) {
            var tmp = new Question(it, self);
            self.tabQuestions.push(tmp);
        });
    }

    (previewMode) ? (self.previewMode = previewMode):(self.previewMode = false);
    quizz.puzzleRows ? (self.puzzleRows = quizz.puzzleRows): (self.puzzleRows = 2);
    quizz.puzzleLines ? (self.puzzleLines = quizz.puzzleLines):(self.puzzleLines = 2);
    quizz.font && (self.font = quizz.font);
    quizz.fontSize ? (self.fontSize = quizz.fontSize): (self.fontSize = 20);
    quizz.colorBordure ? (self.rgbBordure = quizz.colorBordure):(self.rgbBordure = myColors.black);
    quizz.bgColor ? (self.bgColor = quizz.bgColor):(self.bgColor = myColors.none);

    self.cadreResult={
        x:drawing.width/2,
        y:220,
        w:drawing.width,
        h:200
    };
    self.cadreTitle={
        x:0,
        y:0,
        w:drawing.width,
        h:200
    };
    self.cadreQuestion={
        x:0,
        y:210,
        w:drawing.width,
        h:200
    };

    self.cadreBibImages={
        x:0,
        y:210,
        w:drawing.width,
        h:600
    };
    self.questionsWithBadAnswers=[];
    self.score=0;
    self.drawing=drawing;
    self.title=quizz.title;

    self.currentQuestionIndex=-1;
    self.finalMessage="";

    self.run = function(x,y,w,h) {
        var intervalToken = asyncTimerController.interval(function () {
            var loaded = true;
            self.tabQuestions.forEach(function (e) {
                loaded = loaded && e.imageLoaded;
                e.tabAnswer.forEach(function (el) {
                    loaded = loaded && el.imageLoaded;
                })
            });
            if(loaded) {
                asyncTimerController.clearInterval(intervalToken);
                self.display(x,y,w,h);
            }
        }, 100);
    };

    /**
     *
     * @param color
     */
    var displayScore = function(color){
        var autoColor;
        switch(self.score) {
            case self.tabQuestions.length:
                str1="Impressionant !";
                str2=" et toutes sont justes !";
                autoColor=[100,255,100];
                break;
            case 0:
                str1="Votre niveau est désolant... Mais gardez espoir !";
                str2="dont aucune n'est juste !";
                autoColor=[255,17,0];
                break;
            case (self.tabQuestions.length-1):
                str1="Pas mal du tout !";
                str2=" et toutes (sauf une...) sont justes !";
                autoColor=[200,255,0];
                break;
            case 1:
                str1="Vous avez encore de nombreux progrès à faire.";
                str2="dont une seule est juste.";
                autoColor=[255,100,0];
                break;
            default:
                str1="Correct, mais ne relachez pas vos efforts !";
                str2=" dont "+self.score+" sont justes !";
                autoColor=[220,255,0];
                break;
        }
        var str1,str2;

        self.finalMessage=str1+"\nVous avez répondu à "+self.tabQuestions.length+" questions, "+str2;
        if(!color) {
            var usedColor=autoColor;
        } else {
            usedColor=color;
        }

        self.resultManipulator = new Manipulator();
        self.resultManipulator.translator.move(0,self.questionHeight/2+self.headerHeight/2+MARGIN);
        self.resultManipulator.last.add(self.puzzle.puzzleManipulator.translator);
        self.quizzManipulator.last.add(self.resultManipulator.translator);

        var object = displayText(self.finalMessage,self.cadreResult.w,self.questionHeight, myColors.black, usedColor, self.fontSize, self.font, self.resultManipulator);


        self.quizzManipulator.translator.move(self.cadreResult.w/2,self.headerHeight/2);


       // console.log(self.cadreResult.y);

    };

    self.display=function(x,y,w,h) {

        x && (self.x = x);
        y && (self.y = y);
        w && (self.cadreQuestion.w = w);
        (w && x) && (self.cadreResult.w = w - x);
        x && (self.cadreResult.x = x);
        w && (self.cadreTitle.w = w);
        x && (self.quizzMarginX = x);
        self.headerPercentage = 0.1;
        self.questionPercentageWithImage = 0.3;
        self.questionPercentage = 0.2;
        self.responsePercentageWithImage = 0.6;
        self.responsePercentage = 0.7;

        var heightPage = document.documentElement.clientHeight;

        self.headerHeight = heightPage * self.headerPercentage - MARGIN;
        self.questionHeight = heightPage * self.questionPercentage -  MARGIN;
        self.responseHeight = heightPage * self.responsePercentage -  MARGIN;
        self.questionHeightWithoutImage = heightPage * self.questionPercentage -  MARGIN;
        self.responseHeightWithoutImage = heightPage * self.responsePercentage -  MARGIN;
        self.questionHeightWithImage = heightPage * self.questionPercentageWithImage -  MARGIN;
        self.responseHeightWithImage = heightPage * self.responsePercentageWithImage -  MARGIN;

        var object = displayText(self.title, (self.cadreTitle.w ), (self.headerHeight ), self.rgbBordure, self.bgColor, self.fontSize, self.font, self.quizzManipulator);
        self.titleBox = object.cadre;
        self.titleText = object.content;

        self.quizzManipulator.ordonator.set(1,self.titleText);

        self.quizzManipulator.ordonator.set(0,self.titleBox);
        self.quizzManipulator.translator.move(self.cadreQuestion.w/2,self.headerHeight/2);

        if(self.currentQuestionIndex===-1){// on passe à la première question
            self.nextQuestion();
        }
    };

    self.nextQuestion=function(){

            if(self.currentQuestionIndex !== -1) {
                //self.tabQuestions[self.currentQuestionIndex].questionManipulator.first.remove();
                self.quizzManipulator.last.remove(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);
                //self.tabQuestions[self.currentQuestionIndex].questionManipulator.first.remove(self.tabQuestions[self.currentQuestionIndex].questionManipulator.rotator);
                //self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.children.forEach(function(child){
                //    self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.remove(self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.child);
                //});

            }
            if(self.previewMode) {
                if(self.currentQuestionIndex === 0 && self.tabQuestions[0].multipleChoice) {
                    self.tabQuestions[0].reset();
                }

                self.currentQuestionIndex = 0;
                self.quizzManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);
                self.tabQuestions[self.currentQuestionIndex].display(self.quizzMarginX + self.cadreQuestion.x, MARGIN + self.headerHeight+MARGIN,
                    self.cadreQuestion.w , self.questionHeight);
                self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].answersManipulator.translator);
                self.tabQuestions[self.currentQuestionIndex].displayAnswers(self.quizzMarginX + self.cadreQuestion.x, MARGIN + self.headerHeight+MARGIN,
                    self.cadreQuestion.w , self.questionHeight);

            } else {
                if (self.currentQuestionIndex + 1 < self.tabQuestions.length) {
                    self.currentQuestionIndex++;
                    self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight=self.questionHeightWithImage);
                    !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight=self.questionHeightWithoutImage);
                    self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight=self.responseHeightWithImage);
                    !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight=self.responseHeightWithoutImage);
                    self.quizzManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);
                    //self.parentQuizz.headerHeight+self.parentQuizz.questionHeight/2
                    self.tabQuestions[self.currentQuestionIndex].display(0, self.headerHeight/2 + self.questionHeight/2+MARGIN,
                        self.cadreQuestion.w , self.questionHeight);
                    self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].answersManipulator.translator);
                    self.tabQuestions[self.currentQuestionIndex].displayAnswers(0, self.headerHeight + MARGIN+self.questionHeight,
                        self.cadreQuestion.w , self.responseHeight);


                } else //--> fin du tableau, dernière question
                {
                    console.log("Final score: " + self.score);
                    self.displayResult();
                }
            }
    };


    self.displayResult=function(color){
        //self.resultManipulator = new Manipulator();
        self.puzzle = new Puzzle(self.puzzleLines, self.puzzleRows, self.questionsWithBadAnswers, self.cadreResult,null,self);
        //self.puzzle.display(self.cadreResult.x, self.cadreResult.y+self.cadreResult.h+15, self.cadreResult.w, 600, 0);
        displayScore(color);

        self.puzzle.display(0, self.responseHeight/2+self.questionHeight/2, self.cadreResult.w,self.responseHeight, 0);
        //self.resultManipulator.last.add(self.puzzle.puzzleManipulator.translator);
    };
}