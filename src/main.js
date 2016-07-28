const Domain = require('./Domain').Domain,
    Util = require('./Util').Util,
    GUI = require('./GUI').GUI,
    gui = require('../lib/svggui').Gui;

exports.main = function (svg, runtime, dbListener) {

    let domain, util, Gui, drawing, drawings;

    let globalVariables = {svg, runtime, dbListener};

    globalVariables.gui = gui(svg, {speed: 5, step: 100});

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

    let resizePaper = function () {
        !runtime && document.activeElement.blur();
        if ((document.documentElement.clientWidth > 0) && (document.documentElement.clientHeight > 0)) {
            drawing.dimension(document.documentElement.clientWidth, document.documentElement.clientHeight);
            drawings.glass.dimension(drawing.width, drawing.height).position(drawing.width / 2, drawing.height / 2);
            const
                formationsManager = globalVariables.formationsManager,
                formation = formationsManager.formationDisplayed,
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
                    quizz = formation.quizzManager.previewQuiz ? formation.quizzManager.previewQuiz : formation.quizzDisplayed;
                    if (formation.quizzManager.previewQuiz){
                        if (quizz.currentQuestionIndex !== -1) {
                            quizz.quizzManipulator.last.remove(quizz.tabQuestions[quizz.currentQuestionIndex].manipulator.first);
                        }
                        quizz.display(0, 0, drawing.width, drawing.height);
                    }
                    else {
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
        }
    };

    let listFormations = function () {
        util.Server.getAllFormationsNames().then(data => {
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
            listFormations();
        } else {
            Gui.LearningGUI();
            connexionManager.display();
        }
    });


    setTimeout(function () {
        window.onresize = resizePaper;
    }, 200);


};
