/**
 * Created by qde3485 on 25/02/16.
 */
var x = 0;
var y = 0;
//var paper=Raphael(0,0,1500,1500);

var imageController = ImageController(); 
//paper1=Raphael(x,y,document.body.clientWidth,1500);

var asyncTimerController=AsyncTimerController();
var papers = new Paper(x, y, document.body.clientWidth, 1500);
var paper = papers.paper;
//paper.setViewBox(0, 0, document.body.clientWidth/2, 1500/2, false);
paper.canvas.setAttribute('preserveAspectRatio', 'none');
var displaySet = papers.displaySet;

function main() {

  /*  myQuizz.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz=new Quizz(myQuizz);
   // Navigation Puzzle
   quizz.puzzleLines=1;
   quizz.puzzleRows=3;

   quizz.run(50,10,1200,1200);*/
    var quizzCopy=JSON.parse(JSON.stringify(myQuizz));
    quizzCopy.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz = new Quizz(quizzCopy);

    console.log('Length: '+quizz.tabQuestions.length);
    quizz.puzzleLines=1;
    quizz.puzzleRows=3;
    quizz.run(1,1,1200,1200);

    setTimeout(function(){
        quizz.displaySet.getTarget(0,0);
    },2000);

    displaySet.height= window.innerHeight;
    displaySet.width = window.innerWidth;
    viewBoxWidth = window.innerWidth;
    viewBoxHeight = window.innerHeight;

    function resizePaper(){
        var w = 0, h = 0;
        if (window.innerWidth){
            w = window.innerWidth;
            h = window.innerHeight;
        }else if(document.documentElement &&
            (document.documentElement.clientWidth ||
            document.documentElement.clientHeight)) {
            w = document.documentElement.clientWidth;
            h = document.documentElement.clientHeight;
        }
        var scale =1;
        /*if (displaySet.height!=h && displaySet.width==w){
            scale = h/displaySet.height;
        }
        else if (displaySet.height==h && displaySet.width!=w) {
            scale = w/displaySet.width;
            console.log("ici");
        }
        else {
            scale = 1/Math.max(displaySet.height/h, displaySet.width/w);

        }*/
        if (viewBoxHeight!=h && viewBoxWidth==w){
            scale = h/viewBoxHeight;
        }
        else if (viewBoxHeight==h && viewBoxWidth!=w) {
            scale = w/viewBoxWidth;
            console.log("ici");
        }
        else {
            scale = 1/Math.max(viewBoxHeight/h, viewBoxWidth/w);

        }
        /*if(scale<1){
            scale*=0.95;
        }
        else {
            scale*=1.05;
        }*/
        //scale = 1/Math.max(displaySet.height/h, displaySet.width/w);
        displaySet.height*=scale;
        displaySet.width*=scale;
        viewBoxHeight/=scale;
        viewBoxWidth/=scale;
        //displaySet.scale(scale);
        //viewBoxWidth

        //paper.setViewBox(0, 0, document.body.clientWidth*scale/2, 1500*scale/2, false);
        paper.setViewBox(0, 0, viewBoxHeight, viewBoxWidth, false);
        console.log(scale);
        //displaySet.scale(1/window.devicePixelRatio);
        //console.log(scale);
        //window.devicePixelRatio = 1;
        //console.log("zoom" + window.devicePixelRatio);
        /*displaySet[0].forEach(function(element){
            element.scale(scale);
        });*/
    }
    //window.onresize = function(){
    //    resizePaper();
    //}

    setTimeout(function(){
        var rect =paper.rect(0,0,10,10);
        console.log('préparez vous, on va push!');
        quizz.tabQuestions[0].tabAnswer[1].displaySet.push(rect);
    },500);


    /*setTimeout(function(){
        quizz.tabQuestions[0].displaySet.transform('...t50,50');
    },500);*/
    // Navigation Puzzle
    /*var puzzle = new Puzzle(3, 3, tabQuestions);
     puzzle.display(20, 20, 600, 600, 0);*/

    //var quizz=new Quizz("Ceci est le titre du Quizz n°1",tabQuestions);
    //quizz.display();

    // Display in rows
    /*var nbRows = 3;
     var tabAnswer = [{label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}];
     var question = new Question(null, null, tabAnswer, nbRows);
     question.display(50, 50, 1000, 200);*/

    //Display Resultat Puzzle
    //quizz.displayResult(50, 10, 1200, 1200, myColors.grey);
}
