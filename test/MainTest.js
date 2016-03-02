/**
 * Created by ABL3483 on 01/03/2016.
 */
describe('Main test', function() {
    var paper;
    var puzzle;
    beforeEach(function(){
        paper=RaphaelMock(0,0,600,800);
        puzzle= new Puzzle(paper,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
        puzzle.display(0,0,800,700);
        //puzzle.paper.canvas.style.backgroundColor='green';
    });
    it('Test written',function() {
       // puzzle.paper.writeTest();
        paper.r0.test(15,15,131.25,377.5);
        paper.t1.test(80.625,203.75,'Q1');
        paper.r2.test(161.25,15,131.25,377.5);
        paper.t3.test(226.875,203.75,'Q2');
        paper.r4.test(307.5,15,131.25,377.5);
        paper.t5.test(373.125,203.75,'Q3');
        paper.r6.test(453.75,15,131.25,377.5);
        paper.t7.test(519.375,203.75,'Q4');
        paper.r8.test(15,407.5,131.25,377.5);
        paper.t9.test(80.625,596.25,'Q5');
        paper.r10.test(161.25,407.5,131.25,377.5);
        paper.t11.test(226.875,596.25,'Q6');
        paper.r12.test(307.5,407.5,131.25,377.5);
        paper.t13.test(373.125,596.25,'Q7');
        paper.r14.test(453.75,407.5,131.25,377.5);
        paper.t15.test(519.375,596.25,'Q8');
    });
});