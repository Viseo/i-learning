/**
 * Created by qde3485 on 25/02/16.
 */

//var paper=Raphael(0,0,1500,1500);

paper=RaphaelSpy(0,0,document.body.clientWidth,1500);
function main() {

    //var paper=Raphael(0,0,600,800);
    /*
    var puzzle= new Puzzle(0,0,1500,1500,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
    puzzle.display();

    puzzle.displaySet.forEach(function(e){
        e.remove();
    });

     */
    var tabAnswer = [
        {
            label: "My first answer is...",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        },
        {
            label: "Second answer is...",
            imageSrc: null,
            bCorrect: true,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        },
        {
            label: "Third answer is...",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 25, g: 122, b: 230}
        },
        {
            label: "Fourth answer is...",
            imageSrc: null,
            bCorrect: true,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 230, g: 122, b: 25}
        },
        {
            label: "Fifth answer is...",
            imageSrc: null,
            bCorrect: true,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 230, g: 122, b: 25}
        }
    ];
    var tabQuestions = [
        {label: 'Q1', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q2', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q3', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q4', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'}/*,
        {label: 'Q5', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q6', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q7', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q8', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q9', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q10', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q11', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q12', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q13', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q14', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'}*/
    ];
    var quizz = new Quizz("Ceci est le titre du Quizz n°1", tabQuestions, {r: 194, g: 46, b: 83});
     quizz.display(50,10,1200,1200);

    // Navigation puzzle
    /*var puzzle = new Puzzle(3, 1, tabQuestions);
     puzzle.initVirtualTab();
     var startPosition = 0;
     var countInterval = 0;
     puzzle.display(20, 20, 600, 600, 0);*/

    //var quizz=new Quizz("Ceci est le titre du Quizz n°1",tabQuestions);
    //quizz.display();

    // Display in rows
    /*var nbRows = 3;
     var tabAnswer = [{label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}];
     var question = new Question(null, null, tabAnswer, nbRows);
     question.display(50, 50, 1000, 200);*/

    //Display Resultat Puzzle
    //quizz.displayResult(50, 10, 1200, 1200, {r: 125, g: 122, b: 117});
}
