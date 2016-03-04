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
            var tmp = new Question(it.label, it.imageSrc, it.tabAnswer,it.nbrows, it.colorBordure, it.bgColor,self);
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
    self.puzzle;
    self.title=title;


    self.currentQuestionIndex=-1;

    self.finalMessage="";

    /**
     *
     * @param x
     * @param y
     * @param w
     * @param h
     * @param color
     */

    var displayScore = function(color){
        var autoColor;
        switch(self.score){
            case 0:
                self.finalMessage="T'es naze!";
                nom="dont aucune n'est juste";
                autoColor={r:255,g:17,b:0};
                break;
            case 1:
                self.finalMessage="Pas terrible!";
                nom="dont une seule est juste";
                autoColor={r:255,g:100,b:0};
                break;
            case self.tabQuestions.length:
                self.finalMessage="Génial !";
                nom=" et toutes sont justes";
                autoColor={r:100,g:255,b:100};
                break;
            case (self.tabQuestions.length-1):
                self.finalMessage="Presque parfait !";
                nom=" et toutes sont justes (sauf une!)";
                autoColor={r:200,g:255,b:0};
                break;
            default:
                self.finalMessage="Pas mal !";
                nom=" dont "+self.score+" sont justes";
                autoColor={r:220,g:255,b:0};
                break;

        }
        //self.bgColor=color;
        var nom;

        self.finalMessage+="\nVous avez répondu à "+tabQuestions.length+" questions, "+nom+" !";
        if(!color)
        {
            var usedColor=autoColor;
        }else
        {
            usedColor=color;
        }
        self.resultBox=paper.rect(cadreResult.x,cadreResult.y,cadreResult.w,cadreResult.h).attr('fill','rgb('+usedColor.r+','+usedColor.g+','+usedColor.b+')');
        self.resultText=paper.text(cadreResult.x+cadreResult.w/2,cadreResult.y+cadreResult.h/2,self.finalMessage);

    };

    self.display=function(x,y,w,h){
        // Quizz title
        cadreQuestion.w=w;
        cadreResult.w=w-x;
        cadreResult.x=x;
        cadreTitle.w=w;
        self.quizzMarginX=x;
        self.quizzMarginY=y;

        self.titleBox=self.paper.rect(x,y,cadreTitle.w-x,cadreTitle.h).attr('fill','rgb('+self.bgColor.r+','+self.bgColor.g+','+self.bgColor.b+')');
        self.titleText=self.paper.text(x+self.titleBox.attr('width')/2,y+self.titleBox.attr('height')/2,self.title);


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
        if(type === 'set')
        {
            self.displaySet[self.displaySet.length-1].forEach(function(e){
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
            console.log("Final score: "+self.score);
            self.displayResult();//{r:210,g:56,b:33}
        }

    };


    self.displayResult=function(color){
        //le cadre du score (avec le score et le message)
        displayScore(color);
        //le puzzle qui prend en compte le tableau de questions ratées
        self.puzzle=new Puzzle(4,4,self.questionsWithBadAnswers);
        self.puzzle.display(cadreResult.x,cadreResult.y+cadreResult.h+15,cadreResult.w,600,0);
    };
}