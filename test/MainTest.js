/**
 * Created by ABL3483 on 01/03/2016.
 */
window.paper=null;
describe('Main test', function() {

    var puzzle;
    beforeEach(function(){
        paper=RaphaelMock(0,0,1500,1500);
        puzzle= new Puzzle(0,0,1500,1500,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
        puzzle.display();
        //puzzle.paper.canvas.style.backgroundColor='green';
    });
    /*it('should check the right values for this example',function() {
       // puzzle.paper.writeTest();
        //

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
    });*/
});