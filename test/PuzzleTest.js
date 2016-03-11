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

});