exports.QuizElements = function (globalVariables, classContainer) {

    let Vue = classContainer.getClass("Vue");

    let
        main = globalVariables.main,
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        util = globalVariables.util,
        imageController = globalVariables.imageController,
        Manipulator = globalVariables.util.Manipulator,
        Puzzle = globalVariables.util.Puzzle,
        ReturnButton = globalVariables.util.ReturnButton,
        Server = globalVariables.util.Server,
        Picture = globalVariables.util.Picture;

    const
        BUTTON_WIDTH = 250,
        BUTTON_HEIGHT = 30,
        QUESTIONS_PER_LINE = 6,
        ANSWERS_PER_LINE = 4;

    //////////VUE////////////////////////////////////////////////////////
    class QuizManagerVue extends Vue {
        constructor(formation) {
            super();

            var _initInfos = () => {
                this.formation = formation;
                this.width = drawing.width;
                this.height = drawing.height - drawing.height * HEADER_SIZE;
                this.quizInfos = {};
                this.selectedQuestionIndex = -1;
            }
            var _initMediaLibrary = () => {
                this.library = classContainer.createClass('MediaLibraryVue');
            }
            var _initManipulators = () => {
                this.titleManipulator = new Manipulator(this).addOrdonator(1);
                this.mediaLibraryManipulator = this.library.manipulator;
                this.questionsBlockManipulator = new Manipulator(this).addOrdonator(1);
                this.questionDetailsManipulator = new Manipulator(this).addOrdonator(4);
                this.saveQuizButtonManipulator = new Manipulator(this).addOrdonator(1);
                this.previewButtonManipulator = new Manipulator(this).addOrdonator(1);
                this.manipulator
                    .add(this.titleManipulator)
                    .add(this.mediaLibraryManipulator)
                    .add(this.questionsBlockManipulator)
                    .add(this.questionDetailsManipulator)
                    .add(this.saveQuizButtonManipulator)
                    .add(this.previewButtonManipulator);
            }
            var _createReturnButton = () => {
                this.returnButton = new ReturnButton(this, "Retour à la formation");
                this.returnButton.setHandler(() => {
                    this.formation.display();
                })
                this.manipulator.add(this.returnButton.manipulator);
            }

            _initInfos();
            _initMediaLibrary();
            _initManipulators();
            _createReturnButton();
        }

        render() {
            var _resetDrawings = () => {
                main.currentPageDisplayed = "QuizManager";
                drawings.component.clean();
                this.questionsBlockManipulator.flush();
                this.questionDetailsManipulator.flush();
                drawing.manipulator.set(1, this.manipulator);
                this.questions = [];
                this.width = drawing.width - 2*MARGIN;
                this.height = drawing.height - drawing.height * HEADER_SIZE;
            }
            var _updateHeader = () => {
                let buttonSize = 20;
                globalVariables.header.display(this.formation.label + " - " + this.quizInfos.label);
                this.returnButton.display(0, buttonSize/2 + currentY, buttonSize, buttonSize);
                currentY += buttonSize + MARGIN;
            }
            var _displayTitleArea = () => {
                let dimensions = {
                    width : this.width * 1/4,
                    height: BUTTON_HEIGHT
                }
                let titleTextArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, this.quizInfos.label);

                this.titleManipulator.set(0, titleTextArea.component);
                titleTextArea.font('Arial', 15);
                titleTextArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                this.titleManipulator.move(MARGIN + dimensions.width/2, currentY + dimensions.height / 2);
                currentY += dimensions.height + MARGIN;
            }
            var _displayQuestionsHeader = () => {
                let dimensions = {
                    width : this.width,
                    height: this.height * 1/6
                }
                let border = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 1, myColors.black);
                this.questionsBlockManipulator.set(0, border);
                this.questionsBlockManipulator.move(MARGIN + dimensions.width / 2,  currentY + dimensions.height / 2);
                currentY += dimensions.height + MARGIN;
            }
            var _displayMediaLibrary = () => {
                let dimensions = {
                    width: this.width * 1/5 - MARGIN,
                    height: drawing.height - currentY - (2*MARGIN + BUTTON_HEIGHT)
                }
                this.library.display(MARGIN, currentY, dimensions.width, dimensions.height);
            }
            var _displayQuestionDetails = () => {
                let dimensions = {
                    width: this.width*4/5,
                    height: drawing.height - currentY - (2*MARGIN + BUTTON_HEIGHT)
                }
                this.questionDetailsDim = dimensions;
                let border = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 1, myColors.black);
                this.questionDetailsManipulator.set(0, border);
                this.questionDetailsManipulator.move(MARGIN + this.width*1/5 + dimensions.width/2, currentY + dimensions.height / 2);
                currentY += dimensions.height + MARGIN;
            }
            var _displayPreviewButton = () => {
                let dimensions = {
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT
                }
                let previewButton = new gui.Button(dimensions.width, dimensions.height, [[43, 120, 228], 1, myColors.black], "Aperçu");
                previewButton.glass.mark('previewButton');
                previewButton.onClick(this.previewQuiz);
                this.previewButtonManipulator.set(0, previewButton.component);
                this.previewButtonManipulator.move(this.width/2 - dimensions.width/2 - MARGIN, currentY + dimensions.height/2);
            }
            var _displaySaveButton = () => {
                let dimensions = {
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT
                }
                let saveButton = new gui.Button(dimensions.width, dimensions.height, [[43, 120, 228], 1, myColors.black], "Sauvegarder");
                saveButton.glass.mark('saveButtonQuiz');
                saveButton.onClick(this.saveQuiz);
                this.saveQuizButtonManipulator.set(0, saveButton.component);
                this.saveQuizButtonManipulator.move(this.width/2 + dimensions.width/2 + MARGIN, currentY + dimensions.height/2);
            }
            var _displayQuestions = () => {
                this.quizInfos.tabQuestions.forEach((question, index) => {
                    let vue = new QuestionVue(this, question, index);
                    this.questions.push(vue);
                    if(index === 0) vue.select();
                    this.questionsBlockManipulator.add(vue.blockManipulator);
                });
            }

            var currentY = drawing.height * HEADER_SIZE + MARGIN;
            _resetDrawings();
            _updateHeader();
            _displayTitleArea();
            _displayQuestionsHeader();
            _displayMediaLibrary();
            _displayQuestionDetails();
            _displayPreviewButton();
            _displaySaveButton();
            _displayQuestions();
        }

        loadQuiz(infos){
            this.quizInfos = infos;
            this.display();
        }
        saveQuiz(){

        }
        previewQuiz(){

        }

        selectQuestion(index){
            if(this.selectedQuestionIndex !== -1) this.questions[this.selectedQuestionIndex].unselect();
            this.selectedQuestionIndex = index;
            this.questionDetailsManipulator
                .set(1, this.questions[index].typeManipulator)
                .set(2, this.questions[index].textAreaManipulator)
                .set(3, this.questions[index].answersManipulator);
        }
    }
    class QuizVueAdmin extends QuizManagerVue {
    }
    class QuizVueCollab extends QuizManagerVue{
    }

    class QuestionVue extends Vue {
        constructor(quiz, questionInfos, index){
            super();

            var _initManipulators = () => {
                this.blockManipulator = new Manipulator(this).addOrdonator(2);
                this.typeManipulator = new Manipulator(this).addOrdonator(2);
                this.textAreaManipulator = new Manipulator(this).addOrdonator(1);
                this.answersManipulator = new Manipulator(this);
            }
            var _initInfos = () => {
                this.quiz = quiz;
                this.index = index;
                if(questionInfos){
                    this.load(questionInfos);
                }else {
                    this.load({
                        label: "",
                        multipleChoice: false,
                        tabAnswers : []
                    });
                }
            };

            _initManipulators();
            _initInfos();
        }

        render(){
            var _displayBloc = () => {
                let dimensions = {
                    width: this.quiz.width / QUESTIONS_PER_LINE,
                    height: this.quiz.height*1/6 - 2*MARGIN
                }
                this.questionButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], this.questionInfos.label || "Question " + this.index);
                this.questionButton.back.corners(5, 5);
                this.questionButton.onClick(() => this.select());
                this.blockManipulator.add(this.questionButton.component);
                this.blockManipulator.move(MARGIN -this.quiz.width/2 + dimensions.width/2 + this.index*(dimensions.width + MARGIN), 0);
            }
            var _displayType = () => {
                let dimensions = {
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT
                }
                this.uniqueButton = new gui.Button(dimensions.width, dimensions.height,[myColors.white, 1, myColors.black], "Réponse unique");
                this.multipleButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], 'Réponses multiples');
                this.uniqueButton.position(-(dimensions.width/2 + MARGIN), MARGIN - this.quiz.questionDetailsDim.height/2 + dimensions.height/2);
                this.multipleButton.position(dimensions.width/2 + MARGIN, MARGIN - this.quiz.questionDetailsDim.height/2 + dimensions.height/2);
                this.uniqueButton.onClick(()=> this.setMultipleChoice(false));
                this.multipleButton.onClick(()=> this.setMultipleChoice(true));
                this.setMultipleChoice(this.questionInfos.multipleChoice);
                this.typeManipulator.add(this.uniqueButton.component).add(this.multipleButton.component);
                this.answersDimension.height -= dimensions.height;
            }
            var _displayTextArea = () => {
                let dimensions = {
                    width : this.quiz.questionDetailsDim.width - 2*MARGIN,
                    height: this.quiz.questionDetailsDim.height*1/6 - 2*MARGIN
                }
                this.textArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, this.questionInfos.label || "Enoncé de la question " + this.index);
                this.textAreaManipulator.set(0, this.textArea.component);
                this.textArea.font('Arial', 15);
                this.textArea.anchor('center');
                this.textArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                this.textAreaManipulator.move(0, - this.quiz.questionDetailsDim.height/2 + dimensions.height/2  + 2*MARGIN + BUTTON_HEIGHT);
                this.answersDimension.height -= dimensions.height;
            }
            var _displayAnswers = () => {
                this.questionInfos.tabAnswers.forEach((answer, index) => {
                   let vue = new AnswerVue(this, answer, index);
                   this.answers.push(vue);
                   this.answersManipulator.add(vue.manipulator);
                });
            }

            this.answersDimension = {
                width: this.quiz.questionDetailsDim.width - 2*MARGIN,
                height: this.quiz.questionDetailsDim.height - 2*MARGIN
            }
            _displayBloc();
            _displayType();
            _displayTextArea();
            _displayAnswers();
        }

        load(infos){
            this.questionInfos = infos;
            this.answers = [];
            this.display();
        }

        select(){
            if(!this.selected){
                this.selected = true;
                this.questionButton.color([[43, 120, 228], 1, myColors.black]);
                this.quiz.selectQuestion(this.index);
            }
        }
        unselect(){
            if(this.selected){
                this.selected = false;
                this.questionButton.color([myColors.white, 1, myColors.black]);
            }
        }
        setMultipleChoice(isMultiple){
            if(isMultiple){
                this.uniqueButton.color([myColors.white, 1, myColors.black]);
                this.multipleButton.color([[43, 120, 228], 1, myColors.black])
            }else {
                this.uniqueButton.color([[43, 120, 228], 1, myColors.black]);
                this.multipleButton.color([myColors.white, 1, myColors.black]);
            }
            this.questionInfos.multipleChoice = !!isMultiple; //convert to Boolean
        }
    }
    class QuestionVueCollab extends QuestionVue {
    }
    class QuestionVueAdmin {
        constructor(){

        }
    }

    class AnswerVue extends Vue {
        constructor(question, answerInfos, index){
            super();

            var _initManipulators = () => {
                this.manipulator.addOrdonator(3);
            }
            var _initInfos = () => {
                this.question = question;
                this.index = index;
                if(answerInfos){
                    this.load(answerInfos);
                }else {
                    this.load({
                        label: "",
                        correct: false,
                        explanation: {}
                    });
                }
            }

            _initManipulators();
            _initInfos();
        }

        render(){
            var _displayBorder = () => {
                
            }
            var _displayTextArea = () => {
                let dimensions = {
                    width: this.question.answersDimension.width / ANSWERS_PER_LINE,
                    height: 50
                }
                this.textArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, this.answerInfos.label || "Réponse");
                this.manipulator.set(0, this.textArea.component);
                this.textArea.font('Arial', 15);
                this.textArea.anchor('center');
                this.textArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                this.manipulator.move(
                    -this.question.answersDimension.width/2 + dimensions.width/2 + this.index*(dimensions.width + MARGIN),
                    -this.question.answersDimension.height/2 + dimensions.height/2
                );
            }

            _displayBorder();
            _displayTextArea();
            // _displayCheckIcon();
            // _displayExplanationIcon();
        }

        load(infos){
            this.answerInfos = infos;
            this.display();
        }

        setCorrect(){

        }

    }
    class AnswerVueCollab extends AnswerVue {
    }
    class AnswerVueAdmin extends AnswerVue {
    }

    class ExplanationVue extends Vue {
        constructor(answer, ExplanationInfos){
            super();
            this.answer = answer;
            if(ExplanationInfos){
                //_load(ExplanationInfos);
            }else {
                //_loadEmpty();
            }
        }
    }

    return {
        QuizManagerVue,
        QuizVueAdmin,
        QuizVueCollab,
        QuestionVue,
        QuestionVueAdmin,
        AnswerVue,
        AnswerVueCollab,
        AnswerVueAdmin,
        ExplanationVue
    };
};