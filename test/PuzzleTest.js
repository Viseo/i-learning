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

        puzzle=new Puzzle(0,0,1500,1500,2,3,questions);

    });

    it('should initiate values passed with parameters',function(){

        expect(puzzle.lines).toEqual(2);
        expect(puzzle.rows).toEqual(3);
        expect(puzzle.questionsTab).toEqual(questions);

    });

    it('should initialize the array of tiles',function(){

        expect(puzzle).toBeDefined();

        puzzle.paper=Raphael(0,0,200,200);

        expect(puzzle.tileWidth).toBeUndefined();
        expect(puzzle.tileHeight).toBeUndefined();

        puzzle.initTiles();

        expect(puzzle.tileWidth).toBeDefined();
        expect(puzzle.tileHeight).toBeDefined();
        expect(puzzle.tilesTab.length).toEqual(questions.length);
        var truc=puzzle.tilesTab[4].text.attr('text');
        console.log(truc);
        expect(puzzle.tilesTab[4].text.attr('text')).toEqual(questions[4].label);

    });



});