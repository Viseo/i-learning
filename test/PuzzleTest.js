/**
 * Created by TDU3482 on 29/02/2016.
 */
window.paper=null;
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

        var puzzle=new Puzzle(2,3,questions,quizz.cadreResult);

        expect(puzzle).toBeDefined();

        expect(puzzle.tileWidth).toBeUndefined();
        expect(puzzle.tileHeight).toBeUndefined();

        puzzle.initTiles();

        expect(puzzle.tileWidth).toBeDefined();
        expect(puzzle.tileHeight).toBeDefined();

        puzzle.display(quizz.cadreResult.x, quizz.cadreResult.y+quizz.cadreResult.h+15, quizz.cadreResult.w, 600, 0);

        console.log(puzzle.displaySet[2]);

        expect(puzzle.displaySet[2].attr('text')).toEqual(questions[0].label);

    });

    it('should check the right values for this example (auto generated)',function() {
        // puzzle.paper.writeTest();
        //
        puzzle= new Puzzle(0,0,1500,1500,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
        puzzle.display();
        paper.r0.test(15,15,356.25,727.5);
        paper.t1.test(193.125,378.75,"Q1");
        paper.r2.test(386.25,15,356.25,727.5);
        paper.t3.test(564.375,378.75,"Q2");
        paper.r4.test(757.5,15,356.25,727.5);
        paper.t5.test(935.625,378.75,"Q3");
        paper.r6.test(1128.75,15,356.25,727.5);
        paper.t7.test(1306.875,378.75,"Q4");
        paper.r8.test(15,757.5,356.25,727.5);
        paper.t9.test(193.125,1121.25,"Q5");
        paper.r10.test(386.25,757.5,356.25,727.5);
        paper.t11.test(564.375,1121.25,"Q6");
        paper.r12.test(757.5,757.5,356.25,727.5);
        paper.t13.test(935.625,1121.25,"Q7");
        paper.r14.test(1128.75,757.5,356.25,727.5);
        paper.t15.test(1306.875,1121.25,"Q8");
    });

});