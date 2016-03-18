/**
 * Created by TDU3482 on 29/02/2016.
 */
window.paper=null;
var imageController = new ImageController(ImageRuntime);
var asyncTimerController=AsyncTimerController(AsyncTimerRuntime);
describe('Puzzle test suite', function() {
    var puzzle;

    beforeEach(function(){
        paper=RaphaelMock(0,0,1500,1500);
        //puzzle=new Puzzle(0,0,1500,1500,2,3,questions);

    });


    it('should initialize the array of tiles',function(){

        var quizz=new Quizz(myQuizz);
        questions=quizz.tabQuestions;
        questions.shift();
        questions.shift();
        while(questions.length>4){
            questions.pop();
        }

        var puzzle=new Puzzle(2,2,questions,quizz.cadreResult);

        expect(puzzle).toBeDefined();

        puzzle.display(quizz.cadreResult.x, quizz.cadreResult.y+quizz.cadreResult.h+15, quizz.cadreResult.w, 600, 0);

        expect(puzzle.tileWidth).toBeDefined();
        expect(puzzle.tileHeight).toBeDefined();

        var q=puzzle.displaySet[1];
       //console.log(puzzle.displaySet.length);

        /*
        console.log(q.attr('text'));
        console.log(questions[0].label);
        */
        expect(q.attr('text')).toEqual(questions[0].label);

    });
    it('should display a puzzle with no navigation arrows', function () {
        // TODO: pareil que les autres tests dans QuizzTest, devrait passer quand il n'y aura plus de chargement dans puzzle.display
        var quizz=new Quizz(myQuizz);
        quizz.puzzleLines=3;
        quizz.puzzleRows=3;
        for(var i=0;i<9;i++)
        {
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);
        /*
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[0].image.id,925,1000);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[1].image.id,2835,2582);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[1].image.id,166,200);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[2].image.id,183,262);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[3].image.id,225,225);
        */

        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++)
        {
            quizz.nextQuestion();
        }
        console.log(quizz.puzzle);



        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t198.test(625,320,"Votre niveau est désolant... Mais gardez espoir !\nVous avez répondu à 14 questions, dont aucune n'est juste !");
        paper.r199.test(50,220,1150,200);
        paper.t200.test(236 ,597,"Une divinité féminine est une...");
        paper.i201.test("../resource/millions.png",174 ,445,124,124);
        paper.r202.test(50,435,373.3333333333333,190);
        paper.t203.test(236 ,735,"Parmi ces fruits, lequel possède un\nnoyau?");
        paper.r204.test(50,640,373.3333333333333,190);
        paper.t205.test(236 ,940,"Traditionnellement, le justaucorps\nest porté par...");
        paper.r206.test(50,845,373.3333333333333,190);
        paper.t207.test(625,530,"Quelle est la capitale de la Libye?");
        paper.r208.test(438.3333333333333,435,373.3333333333333,190);
        paper.t209.test(625,735,"Un terrain où on n'a rien planté\nest une terre...");
        paper.r210.test(438.3333333333333,640,373.3333333333333,190);
        paper.t211.test(625,940,"Un galurin est un...");
        paper.r212.test(438.3333333333333,845,373.3333333333333,190);
        paper.t213.test(1013.3333333333333,530,"Quelle est l'orthographe correcte\nde ce verbe?");
        paper.r214.test(826 ,435,373.3333333333333,190);
        paper.t215.test(1013.3333333333333,735,"Comment appelle-t-on un habitant de\nFlandre?");
        paper.r216.test(826 ,640,373.3333333333333,190);
        paper.t217.test(1013.3333333333333,940,"Formentera est une île des...");
        paper.r218.test(826 ,845,373.3333333333333,190);

    });
});