/**
 * Created by qde3485 on 25/02/16.
 */

//var paper=Raphael(0,0,1500,1500);

var imageController = ImageController();
var x=20;
var y=20;
paper1=Raphael(x,y,document.body.clientWidth,1500);
paper1.x=x;
paper1.y=y;
var asyncTimerController=AsyncTimerController();
var papers = new Paper(0, 0, document.body.clientWidth, 1500);
var paper = papers.paper;
var displaySet = papers.displaySet;

function main() {

  /*  myQuizz.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz=new Quizz(myQuizz);
   // Navigation Puzzle
   quizz.puzzleLines=1;
   quizz.puzzleRows=3;

   quizz.run(50,10,1200,1200);*/
    var quizzCopy=JSON.parse(JSON.stringify(myQuizz));
    quizzCopy.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz = new Quizz(quizzCopy);

    console.log('Length: '+quizz.tabQuestions.length);
    quizz.puzzleLines=1;
    quizz.puzzleRows=3;
    quizz.run(20,20,1200,1200);

    // Navigation Puzzle
    /*var puzzle = new Puzzle(3, 3, tabQuestions);
     puzzle.display(20, 20, 600, 600, 0);*/

    //var quizz=new Quizz("Ceci est le titre du Quizz n°1",tabQuestions);
    //quizz.display();

    // Display in rows
    /*var nbRows = 3;
     var tabAnswer = [{label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}];
     var question = new Question(null, null, tabAnswer, nbRows);
     question.display(50, 50, 1000, 200);*/

    //Display Resultat Puzzle
    //quizz.displayResult(50, 10, 1200, 1200, myColors.grey);
}
