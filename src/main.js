/**
 * Created by qde3485 on 25/02/16.
 */


function main()
{
    var paper=RaphaelSpy(0,0,600,800);
    var puzzle= new Puzzle(paper,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
    puzzle.display(0,0,800,700);
    //puzzle.paper.canvas.style.backgroundColor='green';
}
