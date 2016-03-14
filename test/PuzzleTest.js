/**
 * Created by TDU3482 on 29/02/2016.
 */
window.paper=null;
var imageController = new ImageController(ImageRuntime);

describe('Puzzle test suite', function() {
    var puzzle;

    beforeEach(function(){
        paper=RaphaelMock(0,0,1500,1500);
        //puzzle=new Puzzle(0,0,1500,1500,2,3,questions);

    });


    it('should initialize the array of tiles',function(){

        var questions= JSON.parse(JSON.stringify(myQuizz.tabQuestions));// clone de myQuizz.tabQuestions
        var quizz=new Quizz(myQuizz);

        questions.shift();
        questions.shift();
        while(questions.length>4){
            questions.pop();
        }

        var puzzle=new Puzzle(2,2,questions,quizz.cadreResult);

        expect(puzzle).toBeDefined();

        expect(puzzle.tileWidth).toBeUndefined();
        expect(puzzle.tileHeight).toBeUndefined();

        puzzle.initTiles();

        expect(puzzle.tileWidth).toBeDefined();
        expect(puzzle.tileHeight).toBeDefined();

        puzzle.display(quizz.cadreResult.x, quizz.cadreResult.y+quizz.cadreResult.h+15, quizz.cadreResult.w, 600, 0);

        var q=puzzle.displaySet[1];
       //console.log(puzzle.displaySet.length);

        console.log(q.attr('text'));
        console.log(questions[0].label);
        expect(q.attr('text')).toEqual(questions[0].label);

    });
    it('should display a puzzle with no navigation arrows', function () {

        var quizz=new Quizz(myQuizz);
        quizz.puzzleLines=3;
        quizz.puzzleRows=3;
        for(var i=0;i<9;i++)
        {
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);
       /* imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[0].image.id,925,1000);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[1].image.id,2835,2582);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[1].image.id,166,200);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[2].image.id,183,262);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[3].image.id,225,225);*/

        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++)
        {
            quizz.nextQuestion();
        }
        quizz.puzzle.display(quizz.cadreResult.x, quizz.cadreResult.y+quizz.cadreResult.h+15, quizz.cadreResult.w, 600, 0);

       // quizz.puzzle=new Puzzle(quizz.puzzleLines, quizz.puzzleRows, quizz.questionsWithBadAnswers, quizz.cadreResult);

        paper.t216.test(236.66666666666666,597,"Une divinité féminine est une...");
        paper.i217.test("../resource/millions.png",174.66666666666666,445,124,124);
        paper.r218.test(50,435,373.3333333333333,190);
        paper.r220.test(50,640,373.3333333333333,190);
        paper.t219.test(236.66666666666666,735,"Parmi ces fruits, lequel possède un\nnoyau?");
        paper.r222.test(50,845,373.3333333333333,190);
        paper.t221.test(236.66666666666666,940,"Traditionnellement, le justaucorps\nest porté par...");
        paper.r224.test(438.3333333333333,435,373.3333333333333,190);
        paper.t223.test(625,530,"Quelle est la capitale de la Libye?");
        paper.r226.test(438.3333333333333,640,373.3333333333333,190);
        paper.t225.test(625,735,"Un terrain où on n'a rien planté\nest une terre...");
        paper.r228.test(438.3333333333333,845,373.3333333333333,190);
        paper.t227.test(625,940,"Un galurin est un...");
        paper.r230.test(826.6666666666666,435,373.3333333333333,190);
        paper.t229.test(1013.3333333333333,530,"Quelle est l'orthographe correcte\nde ce verbe?");
        paper.r232.test(826.6666666666666,640,373.3333333333333,190);
        paper.t231.test(1013.3333333333333,735,"Comment appelle-t-on un habitant de\nFlandre?");
        paper.r234.test(826.6666666666666,845,373.3333333333333,190);
        paper.t233.test(1013.3333333333333,940,"Formentera est une île des...");

    });
});