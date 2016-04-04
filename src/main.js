/**
 * Created by qde3485 on 25/02/16.
 */

var imageController = ImageController();
var asyncTimerController=AsyncTimerController();
var drawings = new Drawings(document.body.clientWidth, document.documentElement.clientHeight);
var drawing = drawings.drawing;
var mainManipulator = drawing.manipulator;


//mainManipulator.translator.move(document.body.clientWidth/4, document.documentElement.clientHeight/4);

function main() {

  /*  myQuizz.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz=new Quizz(myQuizz);
   // Navigation Puzzle
   quizz.puzzleLines=1;
   quizz.puzzleRows=3;

   quizz.run(50,10,1200,1200);*/

    var bib=new BibImage(myBib);
    bib.run(0,0,document.body.clientWidth,drawing.height);

    /*
    var quizzCopy=JSON.parse(JSON.stringify(myQuizz));
    quizzCopy.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz = new Quizz(quizzCopy);

    console.log('Length: '+quizz.tabQuestions.length);
    quizz.puzzleLines=1;
    quizz.puzzleRows=3;
    quizz.run(1,1,document.body.clientWidth,drawing.height);*/

    //setTimeout(function(){
    //    quizz.displaySet.getTarget(0,0);
    //},2000);


    function resizePaper(){

        var scale =1;
        var scaleY=window.oldHeight/window.innerHeight;
        window.oldHeight=window.innerHeight;
        var scaleX=window.oldWidth/window.innerWidth;
        window.oldWidth=window.innerWidth;


        scale=Math.min(scaleX,scaleY);

        //quizz.tabQuestions[0].tabAnswer[1].answerManipulator.scalor.scale(scale);
        quizz.quizzManipulator.scalor.scale(scale);
        quizz.quizzManipulator.translator.move((document.body.clientWidth/2)*scale,(document.documentElement.clientHeight/2)*scale);
        console.log(scale);

    }
    window.oldWidth=window.innerWidth;
    window.oldHeight=window.innerHeight;

   // window.onresize = resizePaper;


}
