/**
 * Created by qde3485 on 25/02/16.
 */

var paper=new RaphaelSpy(0,0,1500,1200);

function main()
{
    /*var puzzle= new Puzzle(paper,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
    puzzle.display(0,0,800,700);*/
    //puzzle.paper.canvas.style.backgroundColor='green';

    var src = "../resource/statue.jpg";
    //var src = "../resource/spectre.png";
    /*var answer = new Answer(null, src, false);
    answer.display(20, 20, 350, 92);*/

    var answer2 = new Answer("My Text. This is an example of text. It will ajust and adapt to fit into the rectangle. Bla bla bla bla bla bla bla ", src, true);
    answer2.display(500, 50, 500, 200);

    var question = new Question("Is this a folder?", "../resource/folder.png", []);
    question.display(50, 400, 200, 80);

}
