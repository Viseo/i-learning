/**
 * Created by ABL3483 on 01/03/2016.
 */



function Quizz(paper,title,tabQuestions)
{
    var self=this;


    var cadreResult={
        x:0,
        y:0,
        w:paper.width,
        h:200

    };

    var cadreQuestion={
        x:0,
        y:300,
        w:paper.width,
        h:200

    };

    self.tabQuestions=tabQuestions;
    self.questionsWithBadAnswers=[];
    self.score=0;
    self.paper=paper;
    //self.puzzle;  //plus tard !
    self.title=title;




    self.currentQuestionIndex=0;

    self.finalMessage="";
    var displayScore=function(paper,cadre){
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

        self.resultBox=self.paper.rect(cadre.x,cadre.y,cadre.w,cadre.h);
        self.resultText=self.paper.text(cadre.x+cadre.w/2,cadre.y+cadre.h/2,self.finalMessage);


    };


    self.display=function(){
        self.titleBox=self.paper.rect(0,0,self.paper.width,200);
        self.titleText=self.paper.text(0+self.titleBox.width/2,0+self.titleBox.height/2,self.title);

        self.tabQuestions[self.currentQuestionIndex].display(cadreQuestion.x,cadreQuestion.y,cadreQuestion.w,cadreQuestion.h);
        self.displaySet=self.paper.set();
        self.displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySet);//à regarder quand on aura plusieurs quizz

        /*self.displaySet.push(self.titleBox);
        self.displaySet.push(self.titleText);*/
    };
}