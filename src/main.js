/**
 * Created by qde3485 on 25/02/16.
 */

var svg, util, drawings;

/* istanbul ignore next */
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
    util && util.SVGGlobalHandler();
    drawings = new Drawings(svg.screenSize().width, svg.screenSize().height);
    drawing = drawings.drawing;
    mainManipulator = drawing.manipulator;
    return {drawing:drawing, mainManipulator:mainManipulator, clientHeight:svg.screenSize().height, clientWidth:svg.screenSize().width};
}


function main(targetQuizz) {
    !util && setGlobalVariable();
    var quizzCopy=JSON.parse(JSON.stringify(targetQuizz));
    var quizz = new Quizz(quizzCopy);

    console.log('Length: '+quizz.tabQuestions.length);
    quizz.puzzleLines=1;
    quizz.puzzleRows=3;
    quizz.run(0,0, drawing.width, drawing.height);

    function resizePaper(){
        //zoom
        //var scale =1;
        //var scaleY=window.oldHeight/window.innerHeight;
        //window.oldHeight=window.innerHeight;
        //var scaleX=window.oldWidth/window.innerWidth;
        //window.oldWidth=window.innerWidth;
        //
        //
        //scale=Math.min(scaleX,scaleY);
        //
        ////quizz.tabQuestions[0].tabAnswer[1].answerManipulator.scalor.scale(scale);
        //quizz.quizzManipulator.scalor.scale(scale);
        //quizz.quizzManipulator.translator.move((document.body.clientWidth/2)*scale,(document.documentElement.clientHeight/2)*scale);
        //console.log(scale);

        //changement de taille de la fenêtre
        //quizz.quizzManipulator.first.remove();

        drawing.dimension(document.body.clientWidth,document.documentElement.clientHeight);//attr("preserveAspectRatio", "xMinYMin meet") ;

       // drawings.piste.dimension(drawing.width,drawing.height); N'a plus de dimension !!!
        drawings.glass.dimension(drawing.width,drawing.height);

        quizz.display(0,0,drawing.width,drawing.height);
        var qManip=quizz.tabQuestions[quizz.currentQuestionIndex].questionManipulator;
        //qManip.last.remove(qManip.ordonator);
        //qManip.ordonator=new svg.Ordered(10);
        for( var i = 0;i<qManip.ordonator.children.length;i++) {
            qManip.ordonator.unset(i);
        }


        //qManip.last.children.forEach(function(e){
        //   if(e.children.length!==10){
        //       qManip.last.children.remove(e);
        //   }
        //});

        if(quizz.currentQuestionIndex<quizz.tabQuestions.length-1){//-1?
            quizz.tabQuestions[quizz.currentQuestionIndex].display(0, quizz.headerHeight/2 + quizz.questionHeight/2+MARGIN,
                quizz.questionArea.w , quizz.questionHeight);
            quizz.tabQuestions[quizz.currentQuestionIndex].displayAnswers(0, quizz.headerHeight + MARGIN+quizz.questionHeight,
                quizz.questionArea.w , quizz.answerHeight);
        }else{
            quizz.resultManipulator.last.remove(quizz.puzzle.puzzleManipulator.first);
            quizz.resultManipulator.last.remove(quizz.scoreManipulator.first);
            quizz.displayResult();
            //quizz.puzzle.display(0, quizz.answerHeight/2+quizz.questionHeight/2, quizz.cadreResult.w,quizz.answerHeight, quizz.puzzle.startPosition);
        }

    }
    //window.oldWidth=window.innerWidth;
    //window.oldHeight=window.innerHeight;
    setTimeout(function(){
        window.onresize = resizePaper;
    },200);



}
if (typeof exports !== "undefined") {
    exports.main = main;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
    exports.setGlobalVariable = setGlobalVariable;
}
