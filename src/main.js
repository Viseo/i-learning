/**
 * Created by qde3485 on 25/02/16.
 */

paper=RaphaelSpy(0,0,1500,1500);
function main()
{

    //var paper=Raphael(0,0,600,800);
    /*
    var puzzle= new Puzzle(0,0,1500,1500,2,4,[{label:'Q1'},{label:'Q2'},{label:'Q3'},{label:'Q4'},{label:'Q5'},{label:'Q6'},{label:'Q7'},{label:'Q8'}]);
    puzzle.display();
    */
    var tabAnswer=[
        {label:"My first answer is...",imageSrc:null, bCorrect:false,colorBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}},
        {label:"Second answer is...", imageSrc:null, bCorrect:true, colorBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}},
        {label:"Third answer is...", imageSrc:null, bCorrect:false, colorBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 25, g: 122, b: 230}},
        {label:"Fourth answer is...", imageSrc:null, bCorrect:true, colorBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 230, g: 122, b: 25}}
    ];
    var tabQuestions=[
        {label:'Q1',imageSrc:null,tabAnswer:tabAnswer,colorBordure:'blue', bgColor:'purple'},
        {label:'Q2',imageSrc:null,tabAnswer:tabAnswer,colorBordure:'blue', bgColor:'purple'},
        {label:'Q3',imageSrc:null,tabAnswer:tabAnswer,colorBordure:'blue', bgColor:'purple'},
        {label:'Q4',imageSrc:null,tabAnswer:tabAnswer,colorBordure:'blue', bgColor:'purple'}
    ];
    var quizz=new Quizz(paper,"Ceci est le titre du Quizz n°1",tabQuestions);
    quizz.display();


    //puzzle.paper.canvas.style.backgroundColor='green';

    var src = "../resource/statue.jpg";
    //var src = "../resource/spectre.png";
    /*var answer = new Answer(null, src, false);
    answer.display(20, 20, 350, 92);*/

    var answer2 = new Answer("My Text. This is an example of text. It will ajust and adapt to fit into the rectangle. Bla bla bla bla bla bla bla ", src, true);
    answer2.display(50, 200, 350, 500);

    /*var question = new Question(null, "../resource/folder.png", []);
    question.display(50, 400, 200, 200);*/

}
