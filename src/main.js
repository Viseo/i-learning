/**
 * Created by qde3485 on 25/02/16.
 */

//var paper=Raphael(0,0,1500,1500);
var imageController = ImageController();
paper=Raphael(0,0,document.body.clientWidth,1500);

function main() {

    var quizz=new Quizz(myQuizz);
    quizz.puzzleLines=3;
    quizz.puzzleRows=3;
    for(var i=0;i<9;i++)
    {
        quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
    }
    quizz.run(50,10,1200,1200);
    setTimeout(function(){
        for(var i=0;i<quizz.tabQuestions.length;i++)
        {
            quizz.nextQuestion();
        }

    },5000);
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
