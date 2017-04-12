const Domain = require('./Domain').Domain,
    Util = require('./Util').Util,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill;

let main = function (svg, runtime, dbListener, ImageRuntime,param) {

    let domain, util, gui, drawing, drawings;

    let globalVariables = { svg, runtime, dbListener, ImageRuntime };

    //polyfill pour ajouter des fonctionnalités à svghandler
    svgPolyfill(svg);

    gui = svggui(svg, { speed: 5, step: 100 });
    globalVariables.gui = gui;
    //polyfill pour ajouter des fonctionnaolités à svggui
    guiPolyfill(svg, gui);

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

    const inscriptionManager = new domain.InscriptionManagerVue();
    globalVariables.inscriptionManager = inscriptionManager;
    const connexionManager = new domain.ConnexionManagerVue();
    globalVariables.connexionManager = connexionManager;
    const password = new domain.PasswordVue();
    globalVariables.password = password;

    util.setGlobalVariables();
    domain.setGlobalVariables();
    let redirect;
    if(param){
        redirect = param.redirect;
    }

    let findVideo = function () {
        let video;
        if (globalVariables.videoDisplayed.miniature && globalVariables.videoDisplayed.miniature.video) {
            video = globalVariables.videoDisplayed.miniature.video;
        }
        else if (globalVariables.videoDisplayed.miniatureVideo) {
            video = globalVariables.videoDisplayed.miniatureVideo;
        }
        else if (globalVariables.videoDisplayed.video.miniature) {
            video = globalVariables.videoDisplayed.video.miniature;
        }
        return video;
    };

    let resizePaper = function (event) {
        drawings.component.clean();
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
        const
            formationsManager = globalVariables.formationsManager,
            formation = formationsManager && formationsManager.formationDisplayed,
            quizManager = formation && formation.quizManager;
        let quiz;
        if(redirect){
            main.currentPageDisplayed = 'Password';
        }
        switch (main.currentPageDisplayed) {
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
                formation.display();
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
                formation.library.manipulator.flush();
                quizManager.library.manipulator.flush();
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
                break;
            case "Quiz":
                quiz = formation.quizManager.previewQuiz ? formation.quizManager.previewQuiz : formation.quizDisplayed;
                if (formation.quizManager.previewQuiz) {
                    if (quiz.currentQuestionIndex !== -1) {
                        quiz.manipulator.remove(quiz.tabQuestions[quiz.currentQuestionIndex].manipulator);
                    }
                    quiz.display(0, 0, drawing.width, drawing.height);
                    if (globalVariables.videoDisplayed) {
                        findVideo().playFunction();
                    }
                }
                else {
                    quiz.display(0, 0, drawing.width, drawing.height);
                    if (quiz.currentQuestionIndex < quiz.tabQuestions.length) {
                        quiz.displayCurrentQuestion();
                        if (globalVariables.videoDisplayed) {
                            findVideo().playFunction();
                        }
                    } else {
                        quiz.resultManipulator.remove(quiz.puzzle.manipulator);
                        quiz.resultManipulator.remove(quiz.scoreManipulator);
                        quiz.displayResult();
                        if (globalVariables.videoDisplayed) {
                            findVideo().playFunction();
                        }
                    }
                    break;
                }
        }
    };

    let listFormations = function (user) {
        util.Server.getAllFormations().then(data => {
            let myFormations = JSON.parse(data).myCollection;
            globalVariables.formationsManager = new domain.FormationsManagerVue(myFormations);
            if (user && user.lastAction && user.lastAction.formation){
                util.goDirectlyToLastAction(user.lastAction);
            }
            globalVariables.formationsManager.display();
        });
    };

    util.Server.checkCookie().then(data => {
        data = data && JSON.parse(data);
        if(redirect){
            password.display(param.ID);
            redirect = false;
        }
        else {
            if (data.ack === 'OK') {
                drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                data.user.admin ? domain.adminGUI() : domain.learningGUI();
                util.setGlobalVariables();
                domain.setGlobalVariables();
                listFormations(data.user);
            } else {
                domain.learningGUI();
                util.setGlobalVariables();
                domain.setGlobalVariables();
                connexionManager.display();
            }
        }
    });

    // setTimeout(function () {
    //     svg.runtime.addGlobalEvent("resize", resizePaper);
    //     //window.onresize = resizePaper;
    // }, 200);

    svg.addGlobalEvent("resize", resizePaper);


    return globalVariables;
};
exports.main = main;