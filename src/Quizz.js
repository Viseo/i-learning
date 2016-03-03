/**
 * Created by ABL3483 on 01/03/2016.
 */

/**
 *
 * @param paper
 * @param title
 * @param tabQuestions
 * @constructor
 */

function Quizz(title,tabQuestions,color)
{
    var self=this;
    self.tabQuestions=[];
    if (tabQuestions !== null) {
        tabQuestions.forEach(function (it) {
            var tmp = new Question(it.label, it.imageSrc, it.tabAnswer,it.nbrows, it.colorBordure, it.bgColor);
            self.tabQuestions.push(tmp);
        });
    }

    self.bgColor=color;

    var cadreResult={
        x:0,
        y:300,
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
    self.title=title;


    self.currentQuestionIndex=0;

    self.finalMessage="";

    /**
     *
     * @param x
     * @param y
     * @param w
     * @param h
     */

    var displayScore = function(x,y,w,h){
        switch(self.score){
            case self.score===0:
                self.finalMessage="T'es naze!";
                nom="dont aucune n'est juste";
                break;
            case self.score===1:
                self.finalMessage="Pas terrible!";
                nom="dont une seule est juste";
                break;
            case self.score===self.tabQuestions.length:
                self.finalMessage="Génial !";
                nom=" et toutes sont justes";
                break;
            case self.score===(self.tabQuestions.length-1):
                self.finalMessage="Presque parfait !";
                nom=" et toutes sont justes (sauf une!)";
                break;
            default:
                self.finalMessage="Pas mal !";
                nom=" dont "+self.score+" sont justes";
                break;

        }

        var nom;

        self.finalMessage+="\nVous avez répondu à "+tabQuestions.length+" questions, "+nom+" !";

        self.resultBox=paper.rect(x,y,w,h);
        self.resultText=paper.text(x+w/2,y+h/2,self.finalMessage);

    };

    self.display=function(x,y,w,h){
        // Quizz title
        cadreQuestion.w=w;
        cadreResult.w=w;
        cadreTitle.w=w;

        self.titleBox=self.paper.rect(x,y,cadreTitle.w-x,cadreTitle.h).attr('fill','rgb('+self.bgColor.r+','+self.bgColor.g+','+self.bgColor.b+')');
        self.titleText=self.paper.text(x+self.titleBox.attr('width')/2,y+self.titleBox.attr('height')/2,self.title);

        self.tabQuestions[self.currentQuestionIndex].display(x+cadreQuestion.x,y+cadreQuestion.y,cadreQuestion.w-x,cadreQuestion.h);
        self.displaySet=self.paper.set();
        /// à remettre quand DisplayText le permettra (write test ne n'affiche pas encore la valeur finale)
        /*var titleObject=displayText(self.title,0,0,self.paper.width,200,'black','rgb('+self.bgColor.r+','+self.bgColor.g+','+self.bgColor.b+')');
         self.displaySet.push(titleObject.cadre);// à priori pas d'image dans le cadre du quizz
         self.displaySet.push(titleObject.content);*/

        self.displaySet.push(self.titleBox);
        self.displaySet.push(self.titleText);
        self.displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySet);//à regarder quand on aura plusieurs quizz

    };

    self.displayResult=function(x, y, w, h){
        self.titleBox=self.paper.rect(x,y,self.paper.width,200);
        self.titleText=self.paper.text(x+self.titleBox.attr('width')/2,y+self.titleBox.attr('height')/2,self.title);

        displayScore(x, y+200+15, paper.width, 200);
    };
}