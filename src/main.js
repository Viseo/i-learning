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

    let findVideo = function(){
        let video;
        if (globalVariables.videoDisplayed.miniature && globalVariables.videoDisplayed.miniature.video){
            video = globalVariables.videoDisplayed.miniature.video;
        }
        else if (globalVariables.videoDisplayed.miniatureVideo){
            video = globalVariables.videoDisplayed.miniatureVideo;
        }
        else if (globalVariables.videoDisplayed.video.miniature){
            video = globalVariables.videoDisplayed.video.miniature;
        }
        console.log(video);
        return video;
    };

    let resizePaper = function (event) {
        if (!svg.fullScreen()) {
            drawings.screen.empty();
            let newWidth, newHeight;
            if (event.w && event.h) {
                newWidth = event.w;
                newHeight = event.h;
            }
            /* istanbul ignore next */
            else if (document.documentElement.clientWidth > 0 && document.documentElement.clientHeight > 0) {
                newWidth = document.documentElement.clientWidth;
                newHeight = document.documentElement.clientHeight;
            }
            drawing.dimension(newWidth, newHeight);
            drawings.glass.dimension(drawing.width, drawing.height).position(drawing.width / 2, drawing.height / 2);
            drawing.mousedOverTarget = null;
            const
                formationsManager = globalVariables.formationsManager,
                formation = formationsManager && formationsManager.formationDisplayed,
                quizManager = formation && formation.quizManager;
            let quiz;
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
                    if (formation.message) {
                        let saveFormationButtonCadre = formation.saveFormationButtonManipulator.ordonator.children[0];
                        let messageY = saveFormationButtonCadre.globalPoint(0, 0).y;
                        formation.message.position(drawing.width / 2, messageY - saveFormationButtonCadre.height * 1.5 - MARGIN);
                    }
                    if (formation.errorMessagePublication) {
                        const messageY = formation.publicationFormationButtonManipulator.first.globalPoint(0, 0).y;
                        formation.errorMessagePublication.position(drawing.width / 2, messageY - formation.publicationButtonHeight * 1.5 - MARGIN)
                    }
                    break;
                case "QuizManager":
                    formation.library.libraryManipulator.flush();
                    quizManager.library.libraryManipulator.flush();
                    quizManager.resizing = true;
                    quizManager.display();
                    break;
                case "QuizPreview":
                    quiz = formation.quizManager.previewQuiz;
                    if (quiz.currentQuestionIndex !== -1) {
                        quiz.manipulator.remove(quiz.tabQuestions[quiz.currentQuestionIndex].questionManipulator);
                    }
                    quiz.display(0, 0, drawing.width, drawing.height);

                    if (quiz.currentQuestionIndex < quiz.tabQuestions.length) {
                        quiz.displayCurrentQuestion();
                    }
                    // if (globalVariables.videoDisplayed){
                    //     findVideo().playFunction();
                    // }
                    break;
                case "Quiz":
                    quiz = formation.quizManager.previewQuiz ? formation.quizManager.previewQuiz : formation.quizDisplayed;
                    if (formation.quizManager.previewQuiz) {
                        if (quiz.currentQuestionIndex !== -1) {
                            quiz.manipulator.remove(quiz.tabQuestions[quiz.currentQuestionIndex].manipulator);
                        }
                        quiz.display(0, 0, drawing.width, drawing.height);
                        if (globalVariables.videoDisplayed){
                            findVideo().playFunction();
                        }
                    }
                    else {
                        quiz.display(0, 0, drawing.width, drawing.height);
                        if (quiz.currentQuestionIndex < quiz.tabQuestions.length) {
                            quiz.displayCurrentQuestion();
                            if (globalVariables.videoDisplayed){
                                findVideo().playFunction();
                            }
                        } else {
                            quiz.resultManipulator.remove(quiz.puzzle.manipulator);
                            quiz.resultManipulator.remove(quiz.scoreManipulator);
                            quiz.displayResult();
                            if (globalVariables.videoDisplayed){
                                findVideo().playFunction();
                            }
                        }
                        break;
                    }
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