/**
 * Created by qde3485 on 25/02/16.
 */


function main()
{
    //var paper=RaphaelSpy(0,0,600,800);
    var paper=Raphael(0,0,600,800);
    /*var puzzle= new Puzzle(paper,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
    puzzle.display(0,0,800,700);
    */
    var set=paper.set();
    var huit=paper.set();
    var r=paper.rect(0,0,200,200);
    set.push(r);
    var c=paper.circle(20,20,50);
    var c1=paper.circle(70,70,200,200);
    huit.push(c1);
    set.push(c);
    set.push(huit);
    console.log("Avant: "+set);
    //clearSet(set);
    set.remove();
    console.log("Après: "+set);
    //puzzle.paper.canvas.style.backgroundColor='green';
}
