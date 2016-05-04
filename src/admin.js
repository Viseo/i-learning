/**
 * Created by qde3485 on 25/02/16.
 */

var svg, util;


if(typeof SVG !== "undefined") {
    if(!svg) {
        svg = new SVG();
        }
    }


function setSvg(_svg) {
    svg = _svg;
    // call setSvg on modules
    }
function setUtil(_util){
    util = _util;
}

function setGlobalVariable() {
    //util && util.SVGGlobalHandler();
    //var wind = !util && window;
    //util && (wind=false);
    ////clientWidth = wind ? document.body.clientWidth : 1500;
    ////clientHeight = wind ? document.documentElement.clientHeight : 1500;
    //clientWidth = 1500;
    //clientHeight = 1000;
    //drawings = new Drawings(clientWidth, clientHeight);
    //drawing = drawings.drawing;
    //mainManipulator = drawing.manipulator;
    //return {drawing:drawing, mainManipulator:mainManipulator, clientHeight:clientHeight, clientWidth:clientWidth};
}

//mainManipulator.translator.move(document.body.clientWidth/4, document.documentElement.clientHeight/4);

function admin() {
    !util && setGlobalVariable();

  /*  myQuizz.tabQuestions[0].tabAnswer[0].bCorrect=true;
    var quizz=new Quizz(myQuizz);
   // Navigation Puzzle
   quizz.puzzleLines=1;
   quizz.puzzleRows=3;

   quizz.run(50,10,1200,1200);*/

    /*
    var bib=new Library(myBibImage);
    bib.run(0,0,document.body.clientWidth,drawing.height);
*/

    var param = {speed: 50, step: 10};
    var formationsManager = new FormationsManager(myFormations);
    formationsManager.display();

    //setTimeout(function(){
    //    quizz.displaySet.getTarget(0,0);
    //},2000);

}
if (typeof exports !== "undefined") {
    exports.admin = admin;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
    exports.setGlobalVariable = setGlobalVariable;
}
