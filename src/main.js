var svg, util, connexionManager, inscriptionManager, formationsManager;

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

function main() {
    let resizePaper = function() {
        !runtime && document.activeElement.blur();
        if ((document.documentElement.clientWidth > 0) && (document.documentElement.clientHeight > 0)) {
            drawing.dimension(document.documentElement.clientWidth,document.documentElement.clientHeight);
            drawings.glass.dimension(drawing.width,drawing.height).position(drawing.width/2, drawing.height/2);
            let formation, quizzManager, quizz;
            if (typeof formationsManager !== 'undefined') formation = formationsManager.formationDisplayed;
            if (typeof formation !== 'undefined') quizzManager = formation.quizzManager;
            switch (drawing.currentPageDisplayed) {
                case "ConnexionManager":
                    connexionManager.display();
                    break;
                case "InscriptionManager":
                    inscriptionManager.display();
                    break;
                case "FormationsManager":
                    (formationsManager.clippingManipulator.last.children.indexOf(formationsManager.panel.component) !== -1) && formationsManager.clippingManipulator.last.remove(formationsManager.panel.component);
                    formationsManager.display();
                    break;
                case "Formation":
                    formation.gamesLibraryManipulator.flush();
                    formation.displayFormation();
                    break;
                case "QuizManager":
                    formation.library.libraryManipulator.flush();
                    quizzManager.library.libraryManipulator.flush();
                    quizzManager.resizing = true;
                    quizzManager.display();
                    break;
                case "QuizPreview":
                    quizz = formation.quizzManager.previewQuiz;
                    if (quizz.currentQuestionIndex !== -1) {
                        quizz.quizzManipulator.last.remove(quizz.tabQuestions[quizz.currentQuestionIndex].questionManipulator.first);
                    }
                    quizz.display(0, 0, drawing.width, drawing.height);

                    if (quizz.currentQuestionIndex < quizz.tabQuestions.length) {
                        quizz.displayCurrentQuestion();
                    }
                    break;
                case "Quizz":
                    quizz = formation.quizzDisplayed;
                    quizz.display(0, 0, drawing.width, drawing.height);

                    if (quizz.currentQuestionIndex < quizz.tabQuestions.length) {
                        quizz.displayCurrentQuestion();
                    } else {
                        quizz.resultManipulator.last.remove(quizz.puzzle.manipulator.first);
                        quizz.resultManipulator.last.remove(quizz.scoreManipulator.first);
                        quizz.displayResult();
                    }
                    break;
            }
        }
    };

    let listFormations = function() {
        Server.getAllFormationsNames().then(data => {
            let myFormations = JSON.parse(data).myCollection;
            formationsManager = new FormationsManager(myFormations);
            formationsManager.display();
        });
    };

    inscriptionManager = new InscriptionManager();
    connexionManager = new ConnexionManager();
    
    Server.checkCookie().then(data => {
        data = data && JSON.parse(data);
        if (data.ack === 'OK') {
            drawing.username = `${data.user.firstName} ${data.user.lastName}`;
            data.user.admin ? AdminGUI() : LearningGUI();
            listFormations();
        } else {
            connexionManager.display();
        }
    });

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