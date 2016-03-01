/**
 * Created by qde3485 on 25/02/16.
 */

//var paper=new RaphaelSpy(0,0,1500,1200);

function main()
{
    /*var puzzle= new Puzzle(paper,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
    puzzle.display(0,0,800,700);*/
    //puzzle.paper.canvas.style.backgroundColor='green';

    //var src = "http://svg.dabbles.info/tux.png";
    var src = "../resource/statue.jpg";
    var answer = new Answer(null, src, false);
    answer.display(20, 20, 350, 92);
    answer.display(150, 150, 250, 75);
    answer.display(250, 250, 800, 800);

}
