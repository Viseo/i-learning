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

    /*
    var bib=new BibImage(myBib);
    bib.run(0,0,document.body.clientWidth,drawing.height);
*/

    var quizzCopy=JSON.parse(JSON.stringify(myQuizz));
    quizzCopy.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz = new Quizz(quizzCopy);

    console.log('Length: '+quizz.tabQuestions.length);
    quizz.puzzleLines=1;
    quizz.puzzleRows=3;
    quizz.run(1,1,document.body.clientWidth,drawing.height);

    //setTimeout(function(){
    //    quizz.displaySet.getTarget(0,0);
    //},2000);


    function resizePaper(){
        //zoom
        //var scale =1;
        //var scaleY=window.oldHeight/window.innerHeight;
        //window.oldHeight=window.innerHeight;
        //var scaleX=window.oldWidth/window.innerWidth;
        //window.oldWidth=window.innerWidth;
        //
        //
        //scale=Math.min(scaleX,scaleY);
        //
        ////quizz.tabQuestions[0].tabAnswer[1].answerManipulator.scalor.scale(scale);
        //quizz.quizzManipulator.scalor.scale(scale);
        //quizz.quizzManipulator.translator.move((document.body.clientWidth/2)*scale,(document.documentElement.clientHeight/2)*scale);
        //console.log(scale);

        //changement de taille de la fenêtre
        //quizz.quizzManipulator.first.remove();

        drawing.dimension(document.body.clientWidth,document.documentElement.clientHeight);//attr("preserveAspectRatio", "xMinYMin meet") ;

        drawings.piste.dimension(drawing.width,drawing.height);
        drawings.glass.dimension(drawing.width,drawing.height);

        quizz.display(0,0,drawing.width,drawing.height);
        var qManip=quizz.tabQuestions[quizz.currentQuestionIndex].questionManipulator;
        //qManip.last.remove(qManip.ordonator);
        //qManip.ordonator=new svg.Ordered(10);
        qManip.ordonator.children.forEach(function(e){
            e=new svg.Rect(0,0);
        });


        //qManip.last.children.forEach(function(e){
        //   if(e.children.length!==10){
        //       qManip.last.children.remove(e);
        //   }
        //});

        if(quizz.currentQuestionIndex<quizz.tabQuestions.length-1){//-1?
            quizz.tabQuestions[quizz.currentQuestionIndex].display(0, quizz.headerHeight/2 + quizz.questionHeight/2+MARGIN,
                quizz.cadreQuestion.w , quizz.questionHeight);
            quizz.tabQuestions[quizz.currentQuestionIndex].displayAnswers(0, quizz.headerHeight + MARGIN+quizz.questionHeight,
                quizz.cadreQuestion.w , quizz.responseHeight);
        }else{
            quizz.resultManipulator.last.remove(quizz.puzzle.puzzleManipulator.first);
            quizz.resultManipulator.last.remove(quizz.scoreManipulator.first);
            quizz.displayResult();
            //quizz.puzzle.display(0, quizz.responseHeight/2+quizz.questionHeight/2, quizz.cadreResult.w,quizz.responseHeight, quizz.puzzle.startPosition);
        }

    }
    window.oldWidth=window.innerWidth;
    window.oldHeight=window.innerHeight;
    setTimeout(function(){
        window.onresize = resizePaper;
    },200);



}
