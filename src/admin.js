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


//mainManipulator.translator.move(document.body.clientWidth/4, document.documentElement.clientHeight/4);

function admin() {
    var formationsManager;
    var callback = function (data) {
        var myFormations=JSON.parse(data).myCollection;
        formationsManager = new FormationsManager(myFormations);
        formationsManager.display();
    };
    var result1 = dbListener.httpGetAsync("/getAllFormationsNames", callback);
    function resizePaper(){
        if ((document.body.clientWidth > 0) && (document.documentElement.clientHeight > 0)) {
            drawing.dimension(document.body.clientWidth,document.documentElement.clientHeight);//attr("preserveAspectRatio", "xMinYMin meet") ;
            drawings.glass.dimension(drawing.width,drawing.height).position(drawing.width/2, drawing.height/2);
            var formation = formationsManager.formationDisplayed;

            switch (drawing.currentPageDisplayed) {
                case "FormationsManager":
                    var minimalSize = drawing.height - (playerMode ?
                        formationsManager.toggleFormationsCheck.globalPoint(0, 0).y + formationsManager.toggleFormationsCheck.height + MARGIN :
                        formationsManager.addFormationButton.cadre.globalPoint(0, 0).y + formationsManager.addFormationButton.cadre.height);
                    if (minimalSize > 1) {
                        mainManipulator.flush();
                        drawing.manipulator.ordonator.set(2, drawings.piste.first);
                        (formationsManager.clippingManipulator.last.children.indexOf(formationsManager.panel.component) !== -1) && formationsManager.clippingManipulator.last.remove(formationsManager.panel.component);
                        formationsManager.header.display();
                        formationsManager.display();
                    }
                    break;
                case "Formation":
                    formation.gamesLibraryManipulator.flush();
                    formation.clippingManipulator.last.remove(formation.panel.component);
                    formation.library.libraryManipulator.last.remove(formation.library.arrowModeManipulator.first);
                    formationsManager.header.display();
                    formation.displayFormation();
                    break;
                case "QuizManager":
                    formation.library.libraryManipulator.flush();
                    formation.quizzManager.library.libraryManipulator.flush();
                    formation.quizzManager.resizing = true;
                    formation.quizzManager.display();
                    break;
                case "QuizPreview":
                    formation.quizzManager.quizz.quizzManipulator.flush();
                    formation.quizzManager.displayEditedQuestion();
                    break;
            }
        }
    }
    setTimeout(function(){
        window.onresize = resizePaper;
    },200);
}
if (typeof exports !== "undefined") {
    exports.admin = admin;
    exports.setSvg = setSvg;
    exports.setUtil = setUtil;
}
