const Domain = require('./Domain').Domain,
    Util = require('./Util').Util,
    GUI = require('./GUI').GUI,
    gui = require('../lib/svggui').Gui;

let main = function (svg, runtime, dbListener, ImageRuntime) {

    let domain, util, Gui, drawing, drawings;

    let globalVariables = {svg, runtime, dbListener, ImageRuntime};

    globalVariables.gui = gui(svg, {speed: 5, step: 100});
    globalVariables.main = main;

    util = Util(globalVariables);
    globalVariables.util = util;
    util.SVGGlobalHandler();
    util.Bdd();
    util.SVGUtil();

    drawings = new util.Drawings(svg.screenSize().width, svg.screenSize().height);
    globalVariables.drawings = drawings;
    drawing = drawings.drawing;
    globalVariables.drawing = drawing;
    domain = Domain(globalVariables);
    globalVariables.domain = domain;

    const inscriptionManager = new domain.InscriptionManager();
    globalVariables.inscriptionManager = inscriptionManager;
    const connexionManager = new domain.ConnexionManager();
    globalVariables.connexionManager = connexionManager;

    Gui = GUI(globalVariables);
    globalVariables.GUI = Gui;

    util.setGlobalVariables();
    domain.setGlobalVariables();
    Gui.setGlobalVariables();

    let resizePaper = function (event) {
        // document.activeElement.blur();
        let newWidth, newHeight;
        if (event.w && event.h){
            newWidth = event.w;
            newHeight = event.h;
        }
        else if (document.documentElement.clientWidth > 0 && document.documentElement.clientHeight > 0){
            newWidth = document.documentElement.clientWidth;
            newHeight = document.documentElement.clientHeight;
        }
        drawing.dimension(newWidth, newHeight);
        drawings.glass.dimension(drawing.width, drawing.height).position(drawing.width / 2, drawing.height / 2);
        const
            formationsManager = globalVariables.formationsManager,
            formation = formationsManager && formationsManager.formationDisplayed,
            quizzManager = formation && formation.quizzManager;
        let quizz;
        switch (drawing.currentPageDisplayed) {
            case "ConnexionManager":
                connexionManager.display();
                break;
            case "InscriptionManager":
                inscriptionManager.display();
                break;
            case "FormationsManager":
                formationsManager.clippingManipulator.remove(formationsManager.panel.component);
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
                    quizz.manipulator.remove(quizz.tabQuestions[quizz.currentQuestionIndex].questionManipulator);
                }
                quizz.display(0, 0, drawing.width, drawing.height);

                if (quizz.currentQuestionIndex < quizz.tabQuestions.length) {
                    quizz.displayCurrentQuestion();
                }
                break;
            case "Quizz":
                quizz = formation.quizzManager.previewQuiz ? formation.quizzManager.previewQuiz : formation.quizzDisplayed;
                if (formation.quizzManager.previewQuiz) {
                    if (quizz.currentQuestionIndex !== -1) {
                        quizz.manipulator.remove(quizz.tabQuestions[quizz.currentQuestionIndex].manipulator);
                    }
                    quizz.display(0, 0, drawing.width, drawing.height);
                }
                else {
                    quizz.display(0, 0, drawing.width, drawing.height);
                    if (quizz.currentQuestionIndex < quizz.tabQuestions.length) {
                        quizz.displayCurrentQuestion();
                    } else {
                        quizz.resultManipulator.remove(quizz.puzzle.manipulator);
                        quizz.resultManipulator.remove(quizz.scoreManipulator);
                        quizz.displayResult();
                    }
                    break;
                }
        }
    };

    let listFormations = function() {
        util.Server.getAllFormations().then(data => {
            let myFormations = JSON.parse(data).myCollection;
            globalVariables.formationsManager = new domain.FormationsManager(myFormations);
            globalVariables.formationsManager.display();
        });
    };

    util.Server.checkCookie().then(data => {
        data = data && JSON.parse(data);
        if (data.ack === 'OK') {
            drawing.username = `${data.user.firstName} ${data.user.lastName}`;
            data.user.admin ? Gui.AdminGUI() : Gui.LearningGUI();
            util.setGlobalVariables();
            domain.setGlobalVariables();
            Gui.setGlobalVariables();
            listFormations();
        } else {
            Gui.LearningGUI();
            util.setGlobalVariables();
            domain.setGlobalVariables();
            Gui.setGlobalVariables();
            connexionManager.display();
        }
    });

    // setTimeout(function () {
    //     svg.runtime.addGlobalEvent("resize", resizePaper);
    //     //window.onresize = resizePaper;
    // }, 200);

    svg.addGlobalEvent("resize", resizePaper);


};
exports.main = main;