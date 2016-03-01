/**
 * Created by ABL3483 on 01/03/2016.
 */
function Quizz(paper,title,tabQuestions)
{
    var self=this;

    self.tabQuestions=tabQuestions;
    self.questionsWithBadAnswers=[];
    self.score=0;
    self.paper=paper;
    //self.puzzle;  //plus tard !
    self.title=title;

    self.currentQuestionIndex=0;

    self.finalMessage="";
    var displayScore=function(paper,x,y,w,h){
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

        self.resultBox=self.paper.rect(x,y,w,h);
        self.resultText=self.paper.text(x+w/2,y+h/2,self.finalMessage);


    };


    self.display=function(){
        self.titleBox=self.paper.rect(0,0,self.paper.width,self.paper.height);
        self.titleText=self.paper.text(0+self.titleBox.width/2,0+self.titleBox.height/2,self.title);



    };
}