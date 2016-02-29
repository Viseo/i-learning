/**
 * Created by TDU3482 on 29/02/2016.
 */

describe('Puzzle test suite', function() {
    var puzzle;
    var questions=[{label:"Q1"},
        {label:"Q2"},
        {label:"Q3"},
        {label:"Q4"},
        {label:"Q5"},
        {label:"Q6"}
    ];
    beforeEach(function(){

        puzzle=new Puzzle(2,3,questions);

    });

    it('should initiate values passed with parameters',function(){

        expect(puzzle.lines).toEqual(2);
        expect(puzzle.rows).toEqual(3);
        expect(puzzle.questionsTab).toEqual(questions);// le toEqual ne marche peut-être pas ici (comparaison d'adresse)

    });

    it('should initiate the array of tiles',function(){
        puzzle.paper=Raphael(0,0,200,200);
        puzzle.initTiles();

        expect(puzzle.tileWidth).toBeDefined();
        expect(puzzle.tileHeight).toBeDefined();

    });

});