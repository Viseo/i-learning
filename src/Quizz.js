/**
 * Created by ABL3483 on 01/03/2016.
 */

/**
 *
 * @constructor
 * @param quizz
 */


function Quizz(quizz)
{
    var self=this;
    self.tabQuestions=[];
    if (quizz.tabQuestions !== null) {
        quizz.tabQuestions.forEach(function (it) {
            var tmp = new Question(it, self);
            self.tabQuestions.push(tmp);
        });
    }

    if(quizz.puzzleRows) {
        self.puzzleRows = quizz.puzzleRows;
    } else {
        self.puzzleRows = 2;
    }

    if(quizz.puzzleLines) {
        self.puzzleLines = quizz.puzzleLines;
    } else {
        self.puzzleLines = 2;
    }

    if(quizz.font) {
        self.font = quizz.font;
    }

    if(quizz.fontSize) {
        self.fontSize = quizz.fontSize;
    } else {
        self.fontSize = 20;
    }

    if (quizz.colorBordure && !isNaN(parseInt(quizz.colorBordure.r)) && !isNaN(parseInt(quizz.colorBordure.g)) && !isNaN(parseInt(quizz.colorBordure.b))) {
        self.rgbBordure = "rgb(" + quizz.colorBordure.r + ", " + quizz.colorBordure.g + ", " + quizz.colorBordure.b + ")";
    }
    else {
        self.rgbBordure = "black";
    }

    if (quizz.bgColor && !isNaN(parseInt(quizz.bgColor.r)) && !isNaN(parseInt(quizz.bgColor.g)) && !isNaN(parseInt(quizz.bgColor.b))) {
        self.bgColor = "rgb(" + quizz.bgColor.r + ", " + quizz.bgColor.g + ", " + quizz.bgColor.b + ")";
    }
    else {
        self.bgColor = "none";
    }

    //self.bgColor=quizz.color;

    var cadreResult={
        x:0,
        y:220,
        w:paper.width,
        h:200
    };
    var cadreTitle={
        x:0,
        y:0,
        w:paper.width,
        h:200
    };
    var cadreQuestion={
        x:0,
        y:210,
        w:paper.width,
        h:200
    };

    self.questionsWithBadAnswers=[];
    self.score=0;
    self.paper=paper;
    //self.puzzle;  //plus tard !
    self.title=quizz.title;


    self.currentQuestionIndex=-1;

    self.finalMessage="";

    var intervalToken = setInterval(function () {
        var loaded = true;
        self.tabQuestions.forEach(function (e) {
            loaded = loaded && e.imageLoaded;
            e.tabAnswer.forEach(function (el) {
                loaded = loaded && el.imageLoaded;
            })
        });
        if(loaded) {
            clearInterval(intervalToken);
            self.display(50,10,1200,1200);
        }
    }, 100);

    /**
     *
     * @param color
     */
    var displayScore = function(color){
        var autoColor;
        switch(self.score) {
            case 0:
                self.finalMessage="Votre niveau est désolant... Mais gardez espoir !";
                nom="dont aucune n'est juste !";
                autoColor={r:255,g:17,b:0};
                break;
            case 1:
                self.finalMessage="Vous avez encore de nombreux progrès à faire.";
                nom="dont une seule est juste.";
                autoColor={r:255,g:100,b:0};
                break;
            case self.tabQuestions.length:
                self.finalMessage="Impressionant !";
                nom=" et toutes sont justes !";
                autoColor={r:100,g:255,b:100};
                break;
            case (self.tabQuestions.length-1):
                self.finalMessage="Pas mal du tout !";
                nom=" et toutes (sauf une...) sont justes !";
                autoColor={r:200,g:255,b:0};
                break;
            default:
                self.finalMessage="Correct, mais ne relachez pas vos efforts !";
                nom=" dont "+self.score+" sont justes !";
                autoColor={r:220,g:255,b:0};
                break;
        }
        var nom;

        self.finalMessage+="\nVous avez répondu à "+quizz.tabQuestions.length+" questions, "+nom;
        if(!color) {
            var usedColor=autoColor;
        } else {
            usedColor=color;
        }

        var object = displayText(self.finalMessage, cadreResult.x,cadreResult.y,cadreResult.w,cadreResult.h, "black", 'rgb('+usedColor.r+','+usedColor.g+','+usedColor.b+')', self.fontSize, self.font);

        self.resultBox = object.cadre;
        self.resultText = object.content;
        self.displaySet.push(self.resultBox);
        self.displaySet.push(self.resultText);
    };

    self.display=function(x,y,w,h){
        // Quizz title
        cadreQuestion.w=w;
        cadreResult.w=w-x;
        cadreResult.x=x;
        cadreTitle.w=w;
        self.quizzMarginX=x;
        self.quizzMarginY=y;

        var object = displayText(self.title, x,y,(cadreTitle.w-x),cadreTitle.h, self.rgbBordure, self.bgColor, self.fontSize, self.font);
        self.titleBox = object.cadre;
        self.titleText = object.content;

        self.displaySet=self.paper.set();
        /// à remettre quand DisplayText le permettra (write test ne n'affiche pas encore la valeur finale)
        /*var titleObject=displayText(self.title,0,0,self.paper.width,200,'black','rgb('+self.bgColor.r+','+self.bgColor.g+','+self.bgColor.b+')');
         self.displaySet.push(titleObject.cadre);// à priori pas d'image dans le cadre du quizz
         self.displaySet.push(titleObject.content);*/

        self.displaySet.push(self.titleBox);
        self.displaySet.push(self.titleText);
        self.nextQuestion();

    };
    self.nextQuestion=function(){
        var type=self.displaySet[self.displaySet.length-1].type;
        if(type === 'set') {
            self.displaySet[self.displaySet.length-1].forEach(function(e) {
                e.remove();
            });
        }
        if(self.currentQuestionIndex+1<self.tabQuestions.length)
        {
            self.currentQuestionIndex++;
            self.tabQuestions[self.currentQuestionIndex].display(self.quizzMarginX+cadreQuestion.x,self.quizzMarginY+cadreQuestion.y,
                cadreQuestion.w-self.quizzMarginX,cadreQuestion.h);
            self.displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySet);

        }else //--> fin du tableau, dernière question
        {
            console.log("score: "+self.score);
            self.displayResult();
        }

    };


    self.displayResult=function(color){
        displayScore(color);
        /*
        gérer la couleur des réponses avec un éventuel dégradé/gradient de couleurs
        getGradientColors(rgb1, rgb2, nb_de_couleurs);
        */

        //le puzzle qui prend en compte le tableau de questions ratées
        self.puzzle=new Puzzle(self.puzzleLines, self.puzzleRows, self.questionsWithBadAnswers, cadreResult);
        //self.puzzle.display(cadreResult.x,cadreResult.y+cadreResult.h+15,cadreResult.w,600,0);
    };
}