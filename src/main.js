/**
 * Created by qde3485 on 25/02/16.
 */

var svg, util;

/* istanbul ignore next */
if(typeof exports.SVG !== "undefined") {
    if(!svg) {
        svg = new exports.SVG();
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
    
    quizz.puzzleLines=1;
    quizz.puzzleRows=3;
    quizz.run(0,0, drawing.width, drawing.height);

    function resizePaper(){
        drawing.dimension(svg.screenSize().width,svg.screenSize().height);//attr("preserveAspectRatio", "xMinYMin meet") ;
        drawings.glass.dimension(drawing.width,drawing.height);

        quizz.display(0,0,drawing.width,drawing.height);

        if (quizz.currentQuestionIndex < quizz.tabQuestions.length) {
            let qManip = quizz.tabQuestions[quizz.currentQuestionIndex].questionManipulator;
            for(let i = 0; i < qManip.ordonator.children.length; i++) {
                qManip.ordonator.unset(i);
            }
            quizz.tabQuestions[quizz.currentQuestionIndex].display(0, quizz.headerHeight/2 + quizz.questionHeight/2 + MARGIN,
                quizz.questionArea.w , quizz.questionHeight);
            quizz.tabQuestions[quizz.currentQuestionIndex].displayAnswers(0, quizz.headerHeight + MARGIN + quizz.questionHeight,
                quizz.questionArea.w , quizz.answerHeight);
        } else {
            quizz.resultManipulator.last.remove(quizz.puzzle.puzzleManipulator.first);
            quizz.resultManipulator.last.remove(quizz.scoreManipulator.first);
            quizz.displayResult();
            //quizz.puzzle.display(0, quizz.answerHeight/2+quizz.questionHeight/2, quizz.cadreResult.w,quizz.answerHeight, quizz.puzzle.startPosition);
        }

    }
    //window.oldWidth=window.innerWidth;
    //window.oldHeight=window.innerHeight;
    setTimeout(function() {
        svg.runtime.addGlobalEvent("resize", resizePaper);
    },200);



}
if (typeof exports !== "undefined") {
    exports.main = main;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
    exports.setGlobalVariable = setGlobalVariable;
}
