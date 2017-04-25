/**
 *
 Answer,
 QuizManagerVue,
 QuestionCreatorVue,
 QuestionVue,
 AddEmptyElementVue,
 AnswerVue,
 PopInVue,
 GameVue,
 QuizVue,
 Level,
 BdVue
 *
 */
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
        OFFSET_POSITION_Y_QUESTION = -30,
        SPACE_BETWEEN_TITLE_AND_ANSWER = 100 + OFFSET_POSITION_Y_QUESTION,
        SPACE_BETWEEN_TWO_ANSWER = 20,
        NUMBER_ANSWER_BY_LINE = 3,
        COEFF_HEIGHT_TITTLE_QUESTION = 5/9;

    ///////MODEL/////////////////////////////////////////////////////////
    /**
     * Réponse à un quiz. Cette réponse peut être correcte ou non. Une explication peut etre associée, avec une image ou une vidéo.
     * @class
     */
    class Answer {
        /**
         * Crée une réponse à un QCM
         * @constructs
         * @param {Object} answerParameters - permet d'affecter des valeurs par défaut
         * @param {string} answerParameters.label - label de la réponse
         * @param {string} answerParameters.imageSrc - source de l'image
         * @param {Boolean} answerParameters.correct - la réponse est elle correcte
         * @param {Object} parent - parent de la réponse (i.e Question)
         */
        constructor(answerParameters, parent) {
            this.parentQuestion = parent;
            let answer = {
                label: '',
                imageSrc: null,
                correct: false
            };
            answerParameters && (answer = answerParameters);
            this.label = answer.label;
            this.imageSrc = answer.imageSrc;
            this.video = answer.video;
            this.correct = answer.correct;
            this.selected = false;
            this.invalidLabelInput = answer.invalidLabelInput !== undefined ? answer.invalidLabelInput : false;
            this.fontSize = answer.fontSize ? answer.fontSize : 20;
            this.explanation = answer.explanation;
            answer.explanation && (this.filled = true);
            answer.font && (this.font = answer.font);

            this.imageLoaded = false;

            if (answer.imageSrc) {
                let self = this;
                this.image = imageController.getImage(this.imageSrc, function () {
                    self.imageLoaded = true;
                    self.dimImage = {width: this.width/2, height: this.height };
                });

               /* this.image = imageController.getImage(this.imageSrc, () => {
                    this.imageLoaded = true;
                    this.dimImage = {width: this.image.width, height: this.image.height};
                });*/

                this.imageLoaded = false;
            } else {
                this.imageLoaded = true;
            }
            this.colorBordure = answer.colorBordure ? answer.colorBordure : myColors.black;
            this.bgColor = answer.bgColor ? answer.bgColor : myColors.white;
        }

        /**
         * supprime la réponse
         * @returns {boolean}
         */
        remove() {
            let index = this.parentQuestion.tabAnswer.indexOf(this);
            if (index !== -1) {
                this.parentQuestion.tabAnswer.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }

        /**
         * indique si la question est modifiable
         * @param {Object} editor - instance de QuestionCreator correspondant à la réponse
         * @param {Boolean} editable - la réponse est elle editable
         */
        isEditable(editor, editable) {
            this.editable = editable;
            this.labelDefault = "Cliquer pour modifier et cocher si bonne réponse.";
            this._acceptDrop = editable;
            this.editor = editor;
            this.checkInputContentArea = editable ? ((objCont) => {
                if (typeof objCont.contentarea.messageText !== "undefined") {
                    if (objCont.contentarea.messageText.match(REGEX)) {
                        this.invalidLabelInput = false;
                        this.label = objCont.contentarea.messageText;
                        objCont.remove();
                    } else {
                        this.invalidLabelInput = objCont.contentarea.messageText.match(REGEX_NO_CHARACTER_LIMIT)
                            ? REGEX_ERROR_NUMBER_CHARACTER
                            : REGEX_ERROR;
                        this.label = objCont.contentarea.messageText;
                        objCont.display(this.invalidLabelInput);
                    }
                } else {
                    this.label = "";
                }
            }) : null;
        }

        /**
         * fonction appelée lorsque l'utilisateur sélectionne la réponse.
         * Affiche le message lui indiquant si la réponse est bonne ou pas
         */
        select(vue) {
            let question = this.parentQuestion,
                quiz = question.parentQuiz;
            if (!question.multipleChoice) {
                if (this.correct) {
                    quiz.score++;
                    console.log("Bonne réponse!\n");
                } else {
                    let reponseD = "";
                    question.rightAnswers.forEach(function (e) {
                        if (e.label) {
                            reponseD += e.label + "\n";
                        } else if (e.imageSrc) {
                            let tab = e.imageSrc.split('/');
                            reponseD += tab[(tab.length - 1)] + "\n";
                        }
                    });
                    console.log("Mauvaise réponse!\n  Bonnes réponses: \n" + reponseD);
                }
                let selectedAnswer = [quiz.tabQuestions[quiz.currentQuestionIndex].tabAnswer.indexOf(vue)];
                quiz.questionsAnswered[quiz.currentQuestionIndex] = {
                    index: quiz.questionsAnswered.length,
                    question: quiz.tabQuestions[quiz.currentQuestionIndex],
                    validatedAnswers: selectedAnswer
                };
                quiz.nextQuestion();
            } else {// question à choix multiples
                this.selected = !this.selected;
                if (this.selected) {
                    // on sélectionne une réponse
                    question.selectedAnswers.push(vue);
                } else {
                    question.selectedAnswers.splice(question.selectedAnswers.indexOf(vue), 1);
                }
            }
        }

    }

    //////////VUE////////////////////////////////////////////////////////

    /**
     * @class
     */
    class QuizManagerVue extends Vue {
        /**
         * construit un quiz associé à une formation
         * @constructs
         * @param quiz - objet qui va contenir toutes les informations du quiz crée
         * @param formation - formation qui va contenir le quiz
         */
        constructor(quiz, formation) {
            super();

            var _declareDefaultSetting = () => {
                this.quizName = "";
                this.quizNameDefault = "Ecrire ici le nom du quiz";
                this.tabQuestions = [defaultQuestion];
                this.parentFormation = formation;
                this.quizNameValidInput = true;
            };
            var _initDefaultQuizOrLoadQuiz = () => {
                if (!quiz) {
                    var initialQuizObject = {
                        title: defaultQuiz.title,
                        bgColor: myColors.white,
                        tabQuestions: this.tabQuestions,
                        puzzleLines: 3,
                        puzzleRows: 3
                    };
                    this.quiz = classContainer.createClass("QuizVue", initialQuizObject, false, this.parentFormation);
                    this.indexOfEditedQuestion = 0;
                    this.quizName = this.quiz.title;
                } else {
                    this.loadQuiz(quiz);
                }
            };
            var _declareQuestionCreator = () => {
                this.questionCreator = classContainer.createClass("QuestionCreatorVue", this,
                    this.quiz.tabQuestions[this.indexOfEditedQuestion]);
            };
            var _declareLibraryMediaTool = () => {
                this.library = classContainer.createClass('MediaLibraryVue');
            };
            var _declareManipulator = () => {
                this.quizManagerManipulator = new Manipulator(this);
                this.questionsPuzzleManipulator = new Manipulator(this).addOrdonator(1);
                this.quizInfoManipulator = new Manipulator(this).addOrdonator(6);
                this.previewButtonManipulator = new Manipulator(this).addOrdonator(2);
                this.saveQuizButtonManipulator = new Manipulator(this).addOrdonator(2);
                this.returnButtonManipulator = new Manipulator(this).addOrdonator(1);

                this.libraryIManipulator = this.library.manipulator;

                this.quizManagerManipulator.add(this.libraryIManipulator);
                this.quizManagerManipulator.add(this.quizInfoManipulator);
                this.quizManagerManipulator.add(this.questionsPuzzleManipulator);
                this.quizManagerManipulator.add(this.questionCreator.manipulator);
                this.quizManagerManipulator.add(this.previewButtonManipulator);
                this.quizManagerManipulator.add(this.saveQuizButtonManipulator);
            };
            var _declareButton = () => {
                this.returnButton = new ReturnButton(this, "Retour à la formation");
            };
            var _declareQuestionPuzzle = () => {
                this.questionPuzzle = new Puzzle(1, 6, this.quiz.tabQuestions, "leftToRight", this);
                this.questionPuzzle.leftChevronHandler = () => {
                    this.questionPuzzle.updateStartPosition("left");
                    this.questionPuzzle.fillVisibleElementsArray(this.questionPuzzle.orientation);
                    this.questionPuzzle.display();
                    this.questionPuzzle.checkPuzzleElementsArrayValidity();
                };
                this.questionPuzzle.rightChevronHandler = () => {
                    this.questionPuzzle.updateStartPosition("right");
                    this.questionPuzzle.fillVisibleElementsArray(this.questionPuzzle.orientation);
                    this.questionPuzzle.display();
                    this.questionPuzzle.checkPuzzleElementsArrayValidity();
                };
            };

            _declareDefaultSetting();
            _initDefaultQuizOrLoadQuiz();
            _declareQuestionCreator();
            _declareLibraryMediaTool();

            //todo a revoir ya certain code qui semble ne rien faire
            this.quiz.tabQuestions[0].selected = true;
            this.questionCreator.loadQuestion(this.quiz.tabQuestions[0]);
            this.quiz.tabQuestions.push(classContainer.createClass("AddEmptyElementVue", this, 'question'));

            _declareManipulator();
            _declareButton();
            _declareQuestionPuzzle();
        }

        render() {
            var _cleanDrawings = () => {
                drawings.component.clean();
            };
            var _settingDimension = () => {
                let verticalPosition = drawing.height * HEADER_SIZE;
                this.height = drawing.height - drawing.height * HEADER_SIZE;
                this.quizManagerManipulator.move(0, verticalPosition);

                let libraryWidthRatio = 0.15,
                    quizInfoHeightRatio = 0.05,
                    questCreaWidthRatio = 1 - libraryWidthRatio,
                    questionsPuzzleHeightRatio = 0.25,
                    questCreaHeightRatio = 0.57,
                    previewButtonHeightRatio = 0.1,
                    saveButtonHeightRatio = 0.1,
                    marginRatio = 0.02;
                this.libraryWidth = drawing.width * libraryWidthRatio;
                this.questCreaWidth = drawing.width * questCreaWidthRatio;
                this.quizInfoHeight = this.height * quizInfoHeightRatio;
                this.questionsPuzzleHeight = this.height * questionsPuzzleHeightRatio;
                this.libraryHeight = this.height * questCreaHeightRatio;
                this.questCreaHeight = this.height * questCreaHeightRatio;
                this.saveButtonHeight = this.height * saveButtonHeightRatio;
                this.previewButtonHeight = this.height * previewButtonHeightRatio;
                this.buttonWidth = 150;
                this.globalMargin = {
                    height: marginRatio * this.height * 2,
                    width: marginRatio * drawing.width
                };
                this.questionPuzzleCoordinates = {
                    x: this.globalMargin.width / 2,
                    y: (this.quizInfoHeight + this.questionsPuzzleHeight / 2 + this.globalMargin.height / 2),
                    w: (drawing.width - this.globalMargin.width),
                    h: (this.questionsPuzzleHeight - this.globalMargin.height)
                };
            };
            var _settingHeader = () => {
                main.currentPageDisplayed = 'QuizManager';
            };
            var _settingManipulator = () => {
                drawing.manipulator.set(1, this.quizManagerManipulator);
            };
            var _displayQuizHeadInfo = (x, y, w, h) => {
                this.quizInfoManipulator.add(this.returnButtonManipulator);

                let returnHandler = () => {
                    drawings.component.clean();
                    let target = this.returnButton;
                    target.parent.parentFormation.quizManager.questionCreator.explanation = null;
                    if (this.quiz.tabQuestions[this.indexOfEditedQuestion]) {
                        this.quiz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator && this.quiz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator.flush();
                        this.quiz.tabQuestions[this.indexOfEditedQuestion].tabAnswer.forEach(answer => {
                            if (answer.popIn) {
                                this.questionCreator.manipulator.remove(answer.popIn.manipulator);
                            }
                        })
                    }
                    target.parent.quizNameValidInput = true;
                    target.parent.quizManagerManipulator.flush();
                    target.parent.quizDisplayed = false;
                    target.parent.parentFormation.publishedButtonActivated = false;
                    target.parent.parentFormation.display();
                    [].concat(...target.parent.parentFormation.levelsTab.map(level => level.gamesTab))
                        .forEach(game => {
                            game.miniature.selected = false;
                            game.miniature.updateSelectionDesign();
                        });
                    this.returnButton.removeHandler(returnHandler);
                };

                this.returnButton.display(-2 * MARGIN, 0, 20, 20);
                this.returnButton.setHandler(returnHandler);
                let returnButtonChevron = this.returnButton.chevronManipulator.ordonator.children[0];
                returnButtonChevron.mark('returnButtonToFormation');

                let quizLabel = {};

                var quizLabelDisplay = () => {
                    //TODO changer quiz label
                    const text = (this.quizName) ? this.quizName : this.quizNameDefault,
                        color = (this.quizName) ? myColors.black : myColors.grey,
                        bgcolor = myColors.white,
                        width = 300; // FontSize : 15px / Arial / 50*W  //self.quizLabel.content.component.getBoundingClientRect().width;
                    let textToDisplay;
                    if (text.length > MAX_CHARACTER_TITLE) {
                        textToDisplay = text.substr(0, MAX_CHARACTER_TITLE) + "...";
                    }
                    quizLabel.content = autoAdjustText(textToDisplay ? textToDisplay : text, w, h / 2, 15, "Arial", this.quizInfoManipulator).text;
                    quizLabel.content.mark("quizLabelContent");
                    this.quizNameHeight = quizLabel.content.boundingRect().height;
                    quizLabel.border = new svg.Rect(width, h * 0.7).mark("quizLabelCadre");
                    this.quizNameValidInput ? quizLabel.border.color(bgcolor, 1, myColors.black) : quizLabel.border.color(bgcolor, 2, myColors.red);
                    quizLabel.border.position(width / 2, h / 2 + quizLabel.border.height / 2);
                    this.quizInfoManipulator.set(0, quizLabel.border);
                    quizLabel.content.position(3, h / 2 + quizLabel.border.height * 9 / 12).color(color).anchor("start");
                    this.quizInfoManipulator.move(x, y);
                    svg.addEvent(quizLabel.content, "click", clickEditionQuiz);
                    svg.addEvent(quizLabel.border, "click", clickEditionQuiz);
                };

                var clickEditionQuiz = () => {
                    let bounds = quizLabel.content.boundingRect(),
                        globalPointCenter = quizLabel.content.globalPoint(0, -bounds.height + 3);
                    this.quizInfoManipulator.unset(1);
                    let contentareaStyle = {
                        leftpx: globalPointCenter.x,
                        toppx: globalPointCenter.y + 0.2,
                        width: 300,
                        height: (this.quizNameHeight + 3) - MARGIN / 2
                    };
                    drawing.notInTextArea = false;
                    let textarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
                    textarea.color([], 0, myColors.black)
                        .message(this.quizName)
                        .font("Arial", 15)
                        .mark("quizEditionTextArea")
                        .anchor("start");
                    (this.quizNameDefault || this.quizName === "") && textarea.placeHolder(this.quizNameDefault);
                    drawings.component.add(textarea);
                    //textarea.setCaretPosition(this.quizName.length);
                    textarea.focus();
                    textarea.value = this.quizName;
                    var removeErrorMessage = () => {
                        this.questionCreator.quizNameValidInput = true;
                        this.errorMessage && this.quizInfoManipulator.unset(5);
                        quizLabel.border.color(myColors.white, 1, myColors.black);
                    };
                    var displayErrorMessage = () => {
                        removeErrorMessage();
                        quizLabel.border.color(myColors.white, 2, myColors.red);
                        var anchor = 'start';
                        this.errorMessage = new svg.Text(REGEX_ERROR);
                        this.errorMessage.mark("quizErrorMessage");
                        this.quizInfoManipulator.set(5, this.errorMessage);
                        this.errorMessage.position(quizLabel.border.width + MARGIN, bounds.height + 3 + quizLabel.border.height / 2 + this.errorMessage.boundingRect().height / 2)
                            .font("Arial", 15).color(myColors.red).anchor(anchor);
                        //textarea.setCaretPosition(this.quizName.length);
                        textarea.focus();
                    };
                    var onblur = () => {
                        textarea.enter();
                        this.quizName = textarea.messageText.trim();
                        this.quiz.title = textarea.messageText.trim();
                        drawings.component.remove(textarea);
                        drawing.notInTextArea = true;
                        quizLabelDisplay();
                        globalVariables.header.display(this.parentFormation.label + " - " + this.quiz.title);
                    };
                    let objectToBeChecked = {
                        textarea: textarea,
                        border: quizLabel.border,
                        onblur: onblur,
                        remove: removeErrorMessage,
                        display: displayErrorMessage
                    };
                    var oninput = () => {
                        textarea.enter();
                        this.checkInputTextArea(objectToBeChecked);
                    };
                    svg.addEvent(textarea, "input", oninput);
                    svg.addEvent(textarea, "blur", onblur);
                    this.checkInputTextArea(objectToBeChecked);
                };
                quizLabelDisplay();
            };
            var _displayPreviewButton = (x, y, w, h) => {
                let previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, this.previewButtonManipulator);
                previewButton.border.mark('previewButton');
                this.previewFunction = () => {
                    this.toggleButtonHeight = 40;
                    this.quiz.isValid = true;
                    let message,
                        arrayOfUncorrectQuestions = [];
                    if (this.questionCreator.explanation) {
                        if (this.questionCreator.explanation.answer.popIn) {
                            this.questionCreator.manipulator.remove(this.questionCreator.explanation.answer.popIn.manipulator);
                            this.questionCreator.explanation = null;
                        }
                    }
                    this.quiz.tabQuestions.forEach(question => {
                        if (!(classContainer.isInstanceOf("AddEmptyElementVue", question))) {
                            question.questionType.validationTab.forEach((funcEl) => {
                                var result = funcEl(question);
                                if (!result.isValid) {
                                    message = result.message;
                                    arrayOfUncorrectQuestions.push(question.questionNum - 1);
                                }
                                this.quiz.isValid = this.quiz.isValid && result.isValid;
                            });
                        }
                    });
                    if (!this.quiz.isValid) {
                        drawings.component.clean();
                        this.displayMessage(message, myColors.red);
                    }
                    this.displayEditedQuestion = () => {
                        main.currentPageDisplayed = "QuizPreview";
                        this.quizManagerManipulator.flush();
                        this.quiz.tabQuestions.pop();
                        this.quiz.tabQuestions.forEach((it) => {
                            (classContainer.isInstanceOf("AddEmptyElementVue", it.tabAnswer[it.tabAnswer.length - 1])) && it.tabAnswer.pop();
                        });
                        this.previewQuiz = classContainer.createClass("QuizVue", this.quiz, true);
                        this.previewQuiz.currentQuestionIndex = this.indexOfEditedQuestion;
                        this.previewQuiz.run(1, 1, drawing.width, drawing.height);//
                    };
                    if (this.quiz.isValid) {
                        this.displayEditedQuestion();
                    }
                };
                svg.addEvent(previewButton.border, "click", this.previewFunction);
                svg.addEvent(previewButton.content, "click", this.previewFunction);
                this.previewButtonManipulator.move(x, y);
            };
            var _displayQuizSaveButton = (x, y, w, h) => {
                let saveButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveQuizButtonManipulator);
                saveButton.border.mark('saveButtonQuiz');
                svg.addEvent(saveButton.border, "click", () => this.saveQuiz());
                svg.addEvent(saveButton.content, "click", () => this.saveQuiz());
                this.saveQuizButtonManipulator.move(x, y);
            }
            var _displayTitleFormationInHeader = () => {
                globalVariables.header.display(this.parentFormation.label + " - " + this.quiz.title);
            };

            _cleanDrawings();
            _settingDimension();
            _settingHeader();
            _settingManipulator();
            this.questionClickHandler = event => {
                _cleanDrawings();
                let question;
                if (typeof event.pageX == "undefined" || typeof event.pageY == "undefined") {
                    question = event.question;
                }
                else {
                    var target = drawings.component.background.getTarget(event.pageX, event.pageY);
                    question = target.parent.parentManip.parentObject;
                }
                question.parentQuiz.parentFormation.quizManager.questionCreator.explanation = null;
                if (this.quiz.tabQuestions[this.indexOfEditedQuestion]) {
                    this.quiz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator
                        && this.quiz.tabQuestions[this.indexOfEditedQuestion].redCrossManipulator.flush();
                    this.quiz.tabQuestions[this.indexOfEditedQuestion].tabAnswer.forEach(answer => {
                        if (answer.popIn) {
                            this.questionCreator.manipulator.remove(answer.popIn.manipulator);
                        }
                    })
                }
                question.selected = true;
                let quizManager = question.parentQuiz.parentFormation.quizManager,
                    quiz = quizManager.quiz,
                    tabQuestions = quiz.tabQuestions,
                    questionCreator = quizManager.questionCreator;
                this.indexOfEditedQuestion !== this.quiz.tabQuestions.indexOf(question)
                    && (tabQuestions[quizManager.indexOfEditedQuestion].selected = false);

                quizManager.indexOfEditedQuestion = tabQuestions.indexOf(question);
                quizManager.displayQuestionsPuzzle(null, null, null, null, quizManager.questionPuzzle.indexOfFirstVisibleElement);
                questionCreator.loadQuestion(question);
                questionCreator.display(questionCreator.previousX, questionCreator.previousY, questionCreator.previousW, questionCreator.previousH);
                questionCreator.explanation && questionCreator.manipulator.remove(questionCreator.explanation.manipulator);
            };

            this.library.display(this.globalMargin.width / 2, this.quizInfoHeight + this.questionsPuzzleHeight + this.globalMargin.height / 2,
                this.libraryWidth - this.globalMargin.width / 2, this.libraryHeight);
            _displayQuizHeadInfo(this.globalMargin.width / 2, this.quizInfoHeight / 2, drawing.width, this.quizInfoHeight);
            this.displayQuestionsPuzzle(this.questionPuzzleCoordinates.x, this.questionPuzzleCoordinates.y,
                this.questionPuzzleCoordinates.w, this.questionPuzzleCoordinates.h);
            this.questionCreator.display(this.library.x + this.libraryWidth, this.library.y,
                this.questCreaWidth - this.globalMargin.width, this.questCreaHeight);
            _displayPreviewButton(drawing.width / 2 - this.buttonWidth, this.height - this.previewButtonHeight / 2,
                this.buttonWidth, this.previewButtonHeight - this.globalMargin.height);
            _displayQuizSaveButton(drawing.width / 2 + this.buttonWidth, this.height - this.saveButtonHeight / 2,
                this.buttonWidth, this.saveButtonHeight - this.globalMargin.height);
            drawing.manipulator.unset(0);
            _displayTitleFormationInHeader();
        }

        displayQuestionsPuzzle(x, y, w, h) {
            x && (this.qPuzzleX = x);
            y && (this.qPuzzleY = y);
            w && (this.qPuzzleW = w);
            h && (this.qPuzzleH = h);
            var border = new svg.Rect(this.qPuzzleW, this.qPuzzleH);
            border.color([], 2, myColors.black);
            this.questionsPuzzleManipulator.set(0, border);
            this.questionsPuzzleManipulator.move(this.qPuzzleX + this.qPuzzleW / 2, this.qPuzzleY);
            this.coordinatesQuestion = {
                x: 0,
                y: 0,
                w: border.width - this.globalMargin.width / 2,
                h: this.questionsPuzzleHeight - this.globalMargin.height
            };
            this.questionPuzzle.updateElementsArray(this.quiz.tabQuestions);
            this.questionPuzzle.fillVisibleElementsArray("leftToRight");
            this.questionPuzzle.leftChevron.mark('questionLeftChevron');
            this.questionPuzzle.rightChevron.mark('questionRightChevron');
            if (!this.questionPuzzle.handlersSet) {
                this.questionPuzzle.leftChevron.handler = this.questionPuzzle.leftChevronHandler;
                this.questionPuzzle.rightChevron.handler = this.questionPuzzle.rightChevronHandler;
                this.questionPuzzle.handlersSet = true;
            }
            this.questionsPuzzleManipulator.add(this.questionPuzzle.manipulator);
            this.questionPuzzle.display(this.coordinatesQuestion.x, this.coordinatesQuestion.y, this.qPuzzleW, this.qPuzzleH, true);
            this.questionPuzzle.checkPuzzleElementsArrayValidity(this.questionPuzzle.elementsArray);
        }

        /**
         * chargement du quizManager avec les infos du quiz à modifier
         * @param quiz - quiz à modifier
         * @param indexOfEditedQuestion - index de la question en train d'être modifiée
         */
        loadQuiz(quiz, indexOfEditedQuestion) {
            this.indexOfEditedQuestion = (indexOfEditedQuestion && indexOfEditedQuestion !== -1 ? indexOfEditedQuestion : 0);
            this.quiz = classContainer.createClass("QuizVue", quiz, false, this.parentFormation);
            this.quizName = this.quiz.title;
            this.quiz.tabQuestions[this.indexOfEditedQuestion].selected = true;
            this.questionCreator.loadQuestion(this.quiz.tabQuestions[this.indexOfEditedQuestion]);
            this.quiz.tabQuestions.forEach(question => {
                (classContainer.isInstanceOf("AddEmptyElementVue", question.tabAnswer[question.tabAnswer.length - 1])) || question.tabAnswer.push(classContainer.createClass("AddEmptyElementVue", this.questionCreator, 'answer'));
            });
            this.quiz.tabQuestions.push(classContainer.createClass("AddEmptyElementVue", this, 'question'));

        };

        /**
         * retourne l'objet qui va être sauvegardé en base de données
         * @returns {{id: *, title: (string|*), tabQuestions: Array, levelIndex: (*|number), gameIndex: (*|number)}}
         */
        getObjectToSave() {
            this.tabQuestions = this.quiz.tabQuestions;
            (classContainer.isInstanceOf('AddEmptyElementVue', this.tabQuestions[this.quiz.tabQuestions.length - 1])) && this.tabQuestions.pop();
            this.tabQuestions.forEach(question => {
                (classContainer.isInstanceOf("AddEmptyElementVue", question.tabAnswer[question.tabAnswer.length - 1])) && question.tabAnswer.pop();
                question.tabAnswer.forEach(answer => {
                    if (answer.popIn) {
                        answer.model.explanation = {};
                        answer.popIn.image && (answer.model.explanation.image = answer.popIn.image);
                        answer.popIn.label && (answer.model.explanation.label = answer.popIn.label);
                        answer.popIn.video && (answer.model.explanation.video = answer.popIn.video);
                        answer.popIn = null;
                    }
                });
            });
            return {
                id: this.quiz.id,
                title: this.quiz.title,
                tabQuestions: this.quiz.tabQuestions,
                levelIndex: this.quiz.levelIndex,
                gameIndex: this.quiz.gameIndex
            };
        }

        /**
         * affiche un message d'info sur l'état de la sauvegarde du quiz (bien sauvegardé ou erreur quelque part)
         * @param message - message à afficher
         * @param color - couleur du message
         */
        displayMessage(message, color) {
            this.questionCreator.errorMessagePreview && this.questionCreator.errorMessagePreview.parent && this.previewButtonManipulator.remove(this.questionCreator.errorMessagePreview);
            this.questionCreator.errorMessagePreview = new svg.Text(message)
                .position(this.buttonWidth, -this.saveQuizButtonManipulator.ordonator.children[0].height / 2 - MARGIN / 2)
                .font("Arial", 20)
                .anchor('middle')
                .color(color)
                .mark("quizInfoMessage");
            this.previewButtonManipulator.add(this.questionCreator.errorMessagePreview);
            setTimeout(() => {
                this.previewButtonManipulator.remove(this.questionCreator.errorMessagePreview);
            }, 5000);
        }

        /**
         * sauvegarde le quiz
         */
        saveQuiz() {
            let completeQuizMessage = "Les modifications ont bien été enregistrées",
                imcompleteQuizMessage = "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide",
                errorMessage = "Entrer un nom valide pour enregistrer";
            if (this.quizName !== "" && this.quizName.match(TITLE_REGEX)) {
                let quiz = this.getObjectToSave();
                this.quiz.isValid = true;
                this.quiz.tabQuestions.forEach(question => {
                    question.questionType && question.questionType.validationTab.forEach((funcEl) => {
                        var result = funcEl(question);
                        this.quiz.isValid = this.quiz.isValid && result.isValid;
                    });
                });
                this.quiz.isValid ? this.displayMessage(completeQuizMessage, myColors.green) : this.displayMessage(imcompleteQuizMessage, myColors.orange);
                Server.replaceQuiz(quiz, this.parentFormation._id, this.quiz.levelIndex, this.quiz.gameIndex, ignoredData)
                    .then(() => {
                        svg.addEvent(this.saveQuizButtonManipulator.ordonator.children[0], "click", () => {
                        });
                        svg.addEvent(this.saveQuizButtonManipulator.ordonator.children[1], "click", () => {
                        });
                        this.quiz.tabQuestions = this.tabQuestions;
                        let quiz = this.parentFormation.levelsTab[this.quiz.levelIndex].gamesTab[this.quiz.gameIndex];
                        this.parentFormation.miniaturesManipulator.remove(quiz.miniatureManipulator);
                        this.parentFormation.levelsTab[this.quiz.levelIndex].gamesTab[this.quiz.gameIndex] = this.quiz;
                        this.loadQuiz(this.parentFormation.levelsTab[this.quiz.levelIndex].gamesTab[this.quiz.gameIndex], this.quiz.parentFormation.quizManager.indexOfEditedQuestion);
                        this.questionPuzzle.checkPuzzleElementsArrayValidity(this.questionPuzzle.elementsArray);
                        this.display();
                    });
            }
            else {
                this.displayMessage(errorMessage, myColors.red);
            }
        }

        /**
         * vérifie le texte entré dans un input
         * @param myObj - input à vérifier
         */
        checkInputTextArea(myObj) {
            if ((typeof myObj.textarea.messageText !== "undefined" && myObj.textarea.messageText.match(TITLE_REGEX)) || myObj.textarea.messageText === "") {
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
                this.quizNameValidInput = true;
            } else {
                myObj.display();
                this.quizNameValidInput = false;
            }
        }
    }

    /**
     * @class
     */
    class QuestionCreatorVue extends Vue {
        /**
         * Crée une nouvelle question dans un quiz
         * @constructs
         * @param {Object} parent - parent du créateur
         * @param {Object} question - question associée
         */
        constructor(parent, question) {
            super();
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this).addOrdonator(2);
                this.manipulatorQuizInfo = new Manipulator(this);
                this.questionManipulator = new Manipulator(this).addOrdonator(7);
                this.toggleButtonManipulator = new Manipulator(this);
                this.previewButtonManipulator = new Manipulator(this).addOrdonator(2);
                this.manipulator.add(this.previewButtonManipulator);
                this.saveQuizButtonManipulator = new Manipulator(this);
                this.manipulator.add(this.saveQuizButtonManipulator);
            };
            var _declareDimension = () => {
                this.toggleButtonHeight = 40;
                this.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};
            };
            var _declarePuzzle = () => {
                this.puzzle = new Puzzle(2, 4, this.linkedQuestion.tabAnswer, "leftToRight", this);
                this.manipulator.add(this.puzzle.manipulator);
            };

            this.MAX_ANSWERS = 8;
            this.parent = parent;
            _declareDimension();
            _declareManipulator();
            this.labelDefault = "Cliquer deux fois pour ajouter la question";
            this.questionType = myQuestionType.tab;
            this.loadQuestion(question);
            _declarePuzzle();
        }

        dropImage (element) {
            drawings.component.clean();
            this.linkedQuestion.video = null;
            this.linkedQuestion.image = element.component;
            this.linkedQuestion.imageSrc = element.src;
            this.parent.displayQuestionsPuzzle(null, null, null, null, this.parent.questionPuzzle.startPosition);
            this.display();
            this.linkedQuestion.checkValidity();
        }

        render(x, y, w, h) {
            var _setPreviousPosition = () => {
                x && (this.previousX = x);
                y && (this.previousY = y);
                w && (this.previousW = w);
                h && (this.previousH = h);
            };
            var _displayQuestionCreator = (x, y, w, h) => {
                // bloc Question
                this.manipulator.flush();
                let questionBlock = {rect: new svg.Rect(w, h).color(myColors.none, 3, myColors.black).position(w / 2, y + h / 2)};
                questionBlock.rect.position(0, 0);
                questionBlock.rect.fillOpacity(0.001);
                this.manipulator.set(0, questionBlock.rect);
                this.manipulator.add(this.questionManipulator);

                var removeErrorMessage = () => {
                    this.linkedQuestion.invalidLabelInput = false;
                    this.errorMessage && this.manipulator.unset(1);
                    questionBlock.title.border.color(myColors.white, 1, myColors.black);
                };

                var displayErrorMessage = (message) => {
                    removeErrorMessage();
                    questionBlock.title.border.color(myColors.white, 2, myColors.red);
                    const anchor = 'middle';
                    this.errorMessage = new svg.Text(message);
                    this.errorMessage.mark("questionBlockErrorMessage");
                    this.manipulator.set(1, this.errorMessage);
                    this.errorMessage.position(0, -this.h / 2 + this.toggleButtonHeight + questionBlock.title.border.height + this.errorMessage.boundingRect().height + MARGIN)
                        .font("Arial", 15).color(myColors.red).anchor(anchor);
                    this.linkedQuestion.invalidLabelInput = message;
                };

                var questionBlockDisplay = () => {
                    const color = (this.linkedQuestion.label) ? myColors.black : myColors.grey,
                        text = (this.linkedQuestion.label) ? this.linkedQuestion.label : this.labelDefault;
                    if (this.linkedQuestion.image) {
                        this.image = this.linkedQuestion.image;
                        this.imageLayer = 2;
                        let pictureRedCrossClickHandler = () => {
                            this.imageLayer && this.questionManipulator.unset(this.imageLayer);//image
                            this.linkedQuestion.image = null;
                            this.linkedQuestion.imageSrc = null;
                            this.display();
                            this.linkedQuestion.checkValidity();
                            this.parent.questionPuzzle.display();
                        };
                        let picture = new Picture(this.image.src, true, this, text, pictureRedCrossClickHandler);
                        picture.draw(0, 0, this.w - 2 * MARGIN, this.h * 0.25, this.questionManipulator);
                        picture.imageSVG.image.mark('questionImage' + this.linkedQuestion.questionNum);
                        questionBlock.title = picture.imageSVG;
                    } else if (this.linkedQuestion.video) {
                        questionBlock.title = drawVideo(text, this.linkedQuestion.video, this.w - 2 * MARGIN, this.h * 0.25, this.colorBordure, this.bgColor, this.fontSize, this.font, this.questionManipulator, true, false);
                        questionBlock.title.video.setRedCrossClickHandler(() => {
                            questionBlock.title.video.redCrossManipulator.flush();
                            this.questionManipulator.unset(3);
                            drawings.component.clean();
                            this.linkedQuestion.video = null;
                            this.parent.questionPuzzle.elementsArray[this.linkedQuestion.questionNum - 1].video = null;
                            this.display();
                            this.linkedQuestion.checkValidity();
                            this.parent.questionPuzzle.display();
                        });
                    } else {
                        questionBlock.title = displayText(text, this.w - 2 * MARGIN, this.h * 0.25, myColors.black, myColors.none, this.linkedQuestion.fontSize, this.linkedQuestion.font, this.questionManipulator);
                    }
                    questionBlock.title.content.mark("questionBlockTitle" + this.linkedQuestion.questionNum);
                    questionBlock.title.border.mark("questionBlockCadre" + this.linkedQuestion.questionNum);
                    const fontSize = Math.min(20, this.h * 0.1);
                    this.questNum = new svg.Text(this.linkedQuestion.questionNum).position(-this.w / 2 + 2 * MARGIN + (fontSize * (this.linkedQuestion.questionNum.toString.length) / 2), -this.h * 0.25 / 2 + (fontSize) / 2 + 2 * MARGIN).font("Arial", fontSize);
                    this.questionManipulator.set(4, this.questNum);
                    questionBlock.title.content.color(color);
                    questionBlock.title.content._acceptDrop = true;
                    this.linkedQuestion.invalidLabelInput ? questionBlock.title.border.color(this.linkedQuestion.bgColor, 2, myColors.red)
                        : questionBlock.title.border.color(this.linkedQuestion.bgColor, 1, this.linkedQuestion.colorBordure);
                    this.linkedQuestion.invalidLabelInput && displayErrorMessage(this.linkedQuestion.invalidLabelInput);
                    questionBlock.title.border._acceptDrop = true;

                    this.questionManipulator.move(0, -this.h / 2 + questionBlock.title.border.height / 2 + this.toggleButtonHeight + MARGIN);
                    this.manipulator.move(x + w / 2, y + h / 2);
                    const globalPoints = questionBlock.title.border.globalPoint(-50, -50);
                    questionBlock.title.video && questionBlock.title.video.position(globalPoints.x, globalPoints.y);
                    svg.addEvent(questionBlock.title.content, "dblclick", dblclickEditionQuestionBlock);
                    svg.addEvent(questionBlock.title.border, "dblclick", dblclickEditionQuestionBlock);
                };

                var dblclickEditionQuestionBlock = () => {
                    const globalPointCenter = questionBlock.title.content.globalPoint(-(this.w) / 2, -((this.linkedQuestion.image || this.linkedQuestion.video) ? questionBlock.title.content.boundingRect().height : ((this.h * .25) / 2)) / 2),
                        contentareaStyle = {
                            height: (this.linkedQuestion.image || this.linkedQuestion.video) ? questionBlock.title.content.boundingRect().height : ((this.h * .25) / 2),
                            toppx: globalPointCenter.y,
                            leftpx: (globalPointCenter.x + 1 / 12 * this.w),
                            width: (this.w * 5 / 6)
                        };
                    questionBlock.title.content.message("");
                    drawing.notInTextArea = false;
                    let textarea = new svg.TextArea(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height)
                        .color(myColors.white, 0, myColors.black)
                        .message(this.linkedQuestion.label)
                        .mark('questionBlockTextArea')
                        .font("Arial", 20);
                    drawings.component.add(textarea);
                    textarea.focus();
                    //textarea.setCaretPosition(this.linkedQuestion.label.length);

                    let onblur = () => {
                        textarea.enter();
                        this.linkedQuestion.label = textarea.messageText || '';
                        if (textarea.messageText) {
                            this.label = textarea.messageText;
                            this.linkedQuestion.label = textarea.messageText;
                        }
                        drawings.component.remove(textarea);
                        drawing.notInTextArea = true;
                        questionBlockDisplay();
                        this.parent.displayQuestionsPuzzle(null, null, null, null, this.parent.questionPuzzle.indexOfFirstVisibleElement);
                    };

                    let oninput = () => {
                        textarea.enter();
                        this.parent.questionCreator.checkInputTextArea({
                            textarea: textarea,
                            border: questionBlock.title.border,
                            onblur: onblur,
                            remove: removeErrorMessage,
                            display: displayErrorMessage
                        });
                    };
                    svg.addEvent(textarea, "blur", onblur);
                    svg.addEvent(textarea, "input", oninput);
                };

                (typeof x !== "undefined") && (this.x = x);
                (typeof y !== "undefined") && (this.y = y);
                (typeof w !== "undefined") && (this.w = w);
                (typeof h !== "undefined") && (this.h = h);
                questionBlockDisplay();
                const height = this.h - this.toggleButtonHeight - questionBlock.title.border.height - 3 * MARGIN;
                this.coordinatesAnswers = {
                    x: 0,
                    y: (this.h - height) / 2 - MARGIN, //this.y + 3 * MARGIN ,
                    w: this.w - 2 * MARGIN,
                    h: height
                };
                // bloc Answers
                if (this.linkedQuestion.tabAnswer.length < this.MAX_ANSWERS && !(classContainer.isInstanceOf("AddEmptyElementVue", this.linkedQuestion.tabAnswer[this.linkedQuestion.tabAnswer.length - 1]))) {
                    this.linkedQuestion.tabAnswer.push(classContainer.createClass("AddEmptyElementVue", this, 'answer'));
                }
                this.puzzle.updateElementsArray(this.linkedQuestion.tabAnswer);
                this.manipulator.add(this.puzzle.manipulator);
                this.puzzle && this.puzzle.fillVisibleElementsArray("leftToRight");
                this.puzzle.leftChevron.mark('answerLeftChevron');
                this.puzzle.rightChevron.mark('answerRightChevron');
                this.puzzle.display(this.coordinatesAnswers.x, this.coordinatesAnswers.y, this.coordinatesAnswers.w, this.coordinatesAnswers.h, false);
                if (this.explanation) {
                    this.explanation.display(this, this.coordinatesAnswers.x, this.coordinatesAnswers.y, this.coordinatesAnswers.w, this.coordinatesAnswers.h);
                }
            }
            var _displayToggleButtonResponseType = (x, y, w, h, clicked) => {
                const size = this.manipulator.ordonator.children[0].height * 0.05;
                this.manipulator.add(this.toggleButtonManipulator);
                let toggleButtonWidth = drawing.width / 5;
                var toggleHandler = (event) => {
                    drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
                    const target = drawings.component.background.getTarget(event.pageX, event.pageY),
                        questionType = target.parent.children[1].messageText;

                    if (questionType === "Réponses multiples") {
                        this.multipleChoice = true;
                        this.linkedQuestion.multipleChoice = true;
                    } else {
                        this.multipleChoice = false;
                        this.linkedQuestion.multipleChoice = false;
                    }

                    this.linkedQuestion.questionType = (!this.multipleChoice) ? this.questionType[0] : this.questionType[1];
                    this.errorMessagePreview && this.errorMessagePreview.parent && this.parent.previewButtonManipulator.remove(this.errorMessagePreview);
                    this.linkedQuestion.tabAnswer.forEach((answer) => {
                        answer.correct = false;
                        if (answer.obj) {
                            answer.obj.checkbox = displayCheckbox(answer.obj.checkbox.x, answer.obj.checkbox.y, size, answer).checkbox;
                            answer.obj.checkbox.answerParent = answer;
                        }
                    });
                    _displayToggleButtonResponseType(x, y, w, h, questionType);
                    this.linkedQuestion.checkValidity();
                };
                this.manipulator.add(this.toggleButtonManipulator);
                const length = this.questionType.length,
                    lengthToUse = (length + 1) * MARGIN + length * toggleButtonWidth,
                    margin = (w - lengthToUse) / 2;
                this.x = margin + toggleButtonWidth / 2 + MARGIN;
                (!this.questionTypeSelectorManipulators) && (this.questionTypeSelectorManipulators = []);
                this.questionType.forEach((type, index) => {
                    if (this.questionTypeSelectorManipulators[index]) {
                        this.toggleButtonManipulator.remove(this.questionTypeSelectorManipulators[index]);
                    }
                    this.questionTypeSelectorManipulators[index] = new Manipulator(this).addOrdonator(2);
                    this.toggleButtonManipulator.add(this.questionTypeSelectorManipulators[index]);
                    (type.label == clicked) ? (this.questionTypeSelectorManipulators[index].color = SELECTION_COLOR) : (this.questionTypeSelectorManipulators[index].color = myColors.white);
                    let toggleButton = displayTextWithoutCorners(type.label, toggleButtonWidth, h, myColors.black, this.questionTypeSelectorManipulators[index].color, 20, null, this.questionTypeSelectorManipulators[index]);
                    toggleButton.content.color(getComplementary(this.questionTypeSelectorManipulators[index].color), 0, myColors.black);
                    toggleButton.border.mark('toggleButtonCadre' + type.label.split(" ")[1]);
                    this.questionTypeSelectorManipulators[index].move(this.x - this.w / 2, h - this.h / 2);
                    this.x += toggleButtonWidth + MARGIN;
                    (type.label != clicked) && (svg.addEvent(toggleButton.content, "click", toggleHandler));
                    (type.label != clicked) && (svg.addEvent(toggleButton.border, "click", toggleHandler));
                });
                this.linkedQuestion.questionType = (this.multipleChoice) ? this.questionType[1] : this.questionType[0];
            };

            _setPreviousPosition();
            this.manipulator.move(this.previousX, 0);

            _displayQuestionCreator(this.previousX, this.previousY, this.previousW, this.previousH);
            let clickedButton = this.multipleChoice ? myQuestionType.tab[1].label : myQuestionType.tab[0].label;
            _displayToggleButtonResponseType(MARGIN + this.previousX, MARGIN / 2 + this.previousY, this.previousW, this.toggleButtonHeight - MARGIN, clickedButton);
        }

        /**
         * vérifie que le texte entré dans la question est correct
         * @param myObj - input à tester
         */
        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(REGEX)) || myObj.textarea.messageText === "") {
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.textarea.messageText.match(REGEX_NO_CHARACTER_LIMIT) ?
                    myObj.display(REGEX_ERROR_NUMBER_CHARACTER) :
                    myObj.display(REGEX_ERROR);
            }
        }

        /**
         * associe la question au créateur de question. i.e remplis les champs avec les infos de la question
         * @param {Object} quest - question
         */
        loadQuestion(quest) {
            this.linkedQuestion = quest;
            quest.label && (this.label = quest.label);
            this.multipleChoice = quest.multipleChoice;
            quest.tabAnswer.forEach(answer => {
                if (classContainer.isInstanceOf("AnswerVueAdmin", answer)) {
                    answer.isEditable(this, true);
                }
                answer.popIn = classContainer.createClass("PopInVue", answer, true);
            });
            quest.tabAnswer.forEach(el => {
                if (el.correct) {
                    quest.rightAnswers.push(el);
                }
            });
        }
    }

    /**
     * @class
     */
    class QuestionVue extends Vue {
        constructor(question, quiz) {
            super();
            var _declareManipulator = () => {
                this.manipulator.addOrdonator(9);
                this.answersManipulator = new Manipulator(this);
                this.manipulator.add(this.answersManipulator);
                this.resetManipulator = new Manipulator(this).addOrdonator(2);
                this.answersManipulator.add(this.resetManipulator);
                this.validateManipulator = new Manipulator(this).addOrdonator(2);
                this.answersManipulator.add(this.validateManipulator);
                this.simpleChoiceMessageManipulator = new Manipulator(this).addOrdonator(2);
                this.answersManipulator.add(this.simpleChoiceMessageManipulator);
                this.invalidQuestionPictogramManipulator = new Manipulator(this).addOrdonator(5);
                this.manipulator.add(this.invalidQuestionPictogramManipulator);
            };
            var _loadQuestion = () => {
                if (!question) {
                    this.label = "";
                    this.imageSrc = "";
                    this.rightAnswers = [];
                    this.tabAnswer = [classContainer.createClass("AnswerVueAdmin", {model: new Answer(null, this, this)}),
                        classContainer.createClass("AnswerVueAdmin", {model: new Answer(null, this, this)})];
                    this.multipleChoice = false;
                    this.font = "Arial";
                    this.bgColor = myColors.white;
                    this.colorBordure = myColors.black;
                    this.selectedAnswers = [];
                    this.validatedAnswers = [];
                } else {
                    this.label = question.label;
                    this.imageSrc = question.imageSrc;
                    this.video = question.video;
                    this.rightAnswers = [];
                    this.multipleChoice = question.multipleChoice;
                    this.selectedAnswers = question.selectedAnswers || [];
                    this.validatedAnswers = question.validatedAnswers || [];

                    question.colorBordure && (this.colorBordure = question.colorBordure);
                    question.bgColor && (this.bgColor = question.bgColor);
                    question.font && (this.font = question.font);
                    question.fontSize && (this.fontSize = question.fontSize);

                    if (question.imageSrc) {
                        this.image = imageController.getImage(this.imageSrc, () => {
                            this.imageLoaded = true;
                            this.dimImage = {width: this.image.width, height: this.image.height};
                        });
                        this.imageLoaded = false;
                    } else {
                        this.imageLoaded = true;
                    }
                }
            };
            var _loadAnswer = () => {
                this.questionType = (this.multipleChoice) ? myQuestionType.tab[1] : myQuestionType.tab[0];
                if (question !== null && question.tabAnswer !== null) {
                    question.tabAnswer.forEach(it => {
                        let nameAnswerClassToInstance = (globalVariables.playerMode) ? "AnswerVueCollab" : "AnswerVueAdmin";
                        var tmp = classContainer.createClass(nameAnswerClassToInstance, {model: new Answer(it.model, this)});
                        this.tabAnswer.push(tmp);
                        if (tmp.model.correct) {
                            this.rightAnswers.push(tmp);
                        }
                    });
                }
            };

            _declareManipulator();

            this.invalidLabelInput = (question && question.invalidLabelInput !== undefined) ? question.invalidLabelInput : false;
            this.selected = false;
            this.parentQuiz = quiz;
            this.tabAnswer = [];
            this.fontSize = 20;
            this.questionNum = question && question.questionNum || this.parentQuiz.tabQuestions.length + 1;

            _loadQuestion();
            _loadAnswer();

            this.lines = Math.ceil(this.tabAnswer.length / NUMBER_ANSWER_BY_LINE); //+ 1;
            this.border = null;
            this.content = null;
        }

        manageDisplayTitle() {
        }

        render(x, y, w, h) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
            this.manipulator.flush();

            this.manageDisplayTitle();
        }

        genericPostRender() {
            this.border.mark('questionFromPuzzleBordure' + this.questionNum);

            var fontSize = Math.min(20, this.height * 0.1);


            let posXQuestNum = (this.image && this.image.width) ? (-this.image.width / 2) : 0;
            posXQuestNum = (posXQuestNum == 0) ? -util.getStringWidthByFontSize(this.label.length / 2, this.fontSize) - MARGIN : posXQuestNum - MARGIN;


            this.questNum = new svg.Text(this.questionNum).font("Arial", fontSize)
                .position(posXQuestNum, OFFSET_POSITION_Y_QUESTION);

            this.manipulator.set(6, this.questNum);
            this.manipulator.move(this.x, this.y);
            if (this.selected) {
                this.selectedQuestion();
            }
        }

        displayAnswers(w, h) {
            let findTileDimension = () => {
                const width = (w - MARGIN * (NUMBER_ANSWER_BY_LINE)) / (NUMBER_ANSWER_BY_LINE + 1),
                    heightMin = 2.50 * this.fontSize;
                let height = 0;

                this.tileHeightMax = Math.floor(h / this.lines) - 2 * MARGIN;

                let tmpHeight;
                //TODO a corriger pour calculer la place maximum mais actuellement h est faux donc imposible d'afficher correctement
                height = heightMin;

                // this.tabAnswer.forEach(answer => {
                //     tmpHeight = (answer.model.image || answer.model.video) ? this.tileHeightMax : heightMin;
                //     if (tmpHeight > this.tileHeightMax) {
                //         height = this.tileHeightMax;
                //     }
                //     else if (tmpHeight > height) {
                //         height = tmpHeight;
                //     }
                // });
                return {width: width, height: height * 1.5};
            };
           this.tileDimension = findTileDimension();

            this.manipulator.set(5, this.answersManipulator);
            this.answersManipulator.move(0, this.height / 2 + (this.tileDimension.height) / 2);
        }

        genericPostDisplayAnswer() {
            let answerY = Math.ceil(this.tabAnswer.length / NUMBER_ANSWER_BY_LINE) * (this.tileDimension.height + MARGIN);

            let buttonY = this.tileDimension.height * (NUMBER_ANSWER_BY_LINE - 1 / 2) + (NUMBER_ANSWER_BY_LINE + 1) * MARGIN,
                buttonH = Math.min(this.tileDimension.height, 50),
                buttonW = 0.5 * drawing.width,
                buttonX = -buttonW / 2;

            if (!this.multipleChoice) {
                this.simpleChoiceMessageManipulator.move(buttonX + buttonW / 2, answerY + SPACE_BETWEEN_TITLE_AND_ANSWER);
                displayText("Cliquer sur une réponse pour passer à la question suivante",
                    buttonW, buttonH, myColors.none, myColors.none, 20, "Arial", this.simpleChoiceMessageManipulator);
            } else {
                //affichage d'un bouton "valider"
                buttonW = 0.1 * drawing.width;
                const validateX = 0.08 * drawing.width - buttonW / 2,
                    validateButton = displayText("Valider", buttonW, buttonH, myColors.green, myColors.yellow, 20, this.font, this.validateManipulator);
                validateButton.content.mark("validateButtonQuiz");
                this.validateManipulator.move(validateX + buttonW / 2, buttonY + buttonH / 2);

                if (!this.parentQuiz.previewMode) {
                    var onClickValidateButton = this.validateAnswers.bind(this);
                    svg.addEvent(validateButton.border, 'click', onClickValidateButton);
                    svg.addEvent(validateButton.content, 'click', onClickValidateButton);
                }

                //Button reset
                const resetX = -buttonW / 2 - 0.08 * drawing.width,
                    resetButton = displayText("Réinitialiser", buttonW, buttonH, myColors.grey, myColors.grey, 20, this.font, this.resetManipulator);
                resetButton.content.mark("resetButtonQuiz");
                this.resetManipulator.move(resetX + buttonW / 2, buttonY + buttonH / 2);
                if (this.selectedAnswers.length !== 0) {
                    resetButton.border.color(myColors.yellow, 1, myColors.green);
                }
                if (!this.parentQuiz.previewMode) {
                    let reset = () => {
                        if (this.selectedAnswers.length > 0) {
                            this.selectedAnswers.forEach((e) => {
                                e.selected = false;
                                e.border.color(e.model.bgColor, 1, e.model.colorBordure);
                            });
                            this.selectedAnswers.splice(0, this.selectedAnswers.length);
                            resetButton.border.color(myColors.grey, 1, myColors.grey);
                        }
                    };
                    svg.addEvent(resetButton.content, 'click', reset);
                    svg.addEvent(resetButton.border, 'click', reset);
                }
            }
        }

        findTilePosition(index) {
            let posx = (index % NUMBER_ANSWER_BY_LINE) * (NUMBER_ANSWER_BY_LINE * this.tileDimension.width) / 2;
            let posy = Math.floor(index / NUMBER_ANSWER_BY_LINE) * (this.tileDimension.height + SPACE_BETWEEN_TWO_ANSWER);
            return {x: posx, y: posy};
        }

        selectedQuestion() {
            this.border.color(this.bgColor, 5, SELECTION_COLOR);
            if (!this.redCrossManipulator) {
                let redCrossClickHandler = () => {
                    const quizManager = this.parentQuiz.parentFormation.quizManager,
                        questionPuzzle = quizManager.questionPuzzle,
                        questionsArray = questionPuzzle.elementsArray;
                    let index = questionsArray.indexOf(this);
                    this.remove();
                    (classContainer.isInstanceOf("AddEmptyElementVue", questionsArray[index])) && index--; // Cas où on clique sur l'AddEmptyElement (dernier élément)
                    if (index !== -1) {
                        quizManager.indexOfEditedQuestion = index;
                        this.parentQuiz.tabQuestions[index].selected = true;
                        resetQuestionsIndex(this.parentQuiz);
                        questionPuzzle && questionPuzzle.indexOfFirstVisibleElement != 0 && questionPuzzle.indexOfFirstVisibleElement--;
                        questionPuzzle && questionPuzzle.updateElementsArray(this.parentQuiz.tabQuestions);
                        questionPuzzle && questionPuzzle.fillVisibleElementsArray("leftToRight");
                        quizManager.questionClickHandler({question: this.parentQuiz.tabQuestions[index]});
                    }
                    else {
                        this.parentQuiz.tabQuestions.splice(0, 0, classContainer.createClass("QuestionVue", defaultQuestion, this.parentQuiz));
                        resetQuestionsIndex(this.parentQuiz);
                        if (questionPuzzle) {
                            questionPuzzle.visibleElementsArray[0].length === 6 && questionPuzzle.updateStartPosition('right');
                            questionPuzzle.fillVisibleElementsArray("leftToRight");
                        }
                        quizManager.indexOfEditedQuestion = ++index;
                        this.parentQuiz.tabQuestions[0].selected = true;
                        questionPuzzle.display();

                        svg.event(questionsArray[0].border, "click", {question: questionsArray[0]}); // dernier élément du tableau (AddEmptyElement)
                    }
                };
                this.redCrossManipulator = new Manipulator(this);
                let size = 20;
                this.redCross || (this.redCross = drawRedCross(-this.questNum.x, this.questNum.y - size / 2, size, this.redCrossManipulator));
                this.redCross.mark('questionRedCross');
                svg.addEvent(this.redCross, "click", redCrossClickHandler);
                this.redCrossManipulator.add(this.redCross);
                this.manipulator.add(this.redCrossManipulator);
            }
            else {
                this.redCrossManipulator.move(-this.questNum.x, this.questNum.y - this.redCross.size / 2);
                this.redCrossManipulator.add(this.redCross);
            }
        }

        /**
         * suppression de la question
         * @returns {boolean}
         */
        remove() {
            let index = this.parentQuiz.tabQuestions.indexOf(this);
            if (index !== -1) {
                this.parentQuiz.tabQuestions.splice(index, 1);
                return true;
            }
            else {
                return false;
            }
        }

        /**
         * Verifie que la question est correctement formatée
         */
        checkValidity() {
            var validation = true;
            this.questionType.validationTab.forEach((funcEl) => {
                var result = funcEl(this);
                validation = validation && result.isValid;
            });
            validation ? this.toggleInvalidQuestionPictogram(false) : this.toggleInvalidQuestionPictogram(true);
        }

        /**
         * vérifie si les réponses de l'utilisateur sont correctes
         */
        validateAnswers() {
            // test des valeurs, en gros si selectedAnswers === rigthAnswers
            var allRight = false;
            this.validatedAnswers = this.selectedAnswers;
            this.selectedAnswers = [];
            if (this.rightAnswers.length !== this.validatedAnswers.length) {
                allRight = false;
            } else {
                var subTotal = 0;
                this.validatedAnswers.forEach((e) => {
                    if (e.correct) {
                        subTotal++;
                    }
                });
                allRight = (subTotal === this.rightAnswers.length);
            }
            if (allRight) {
                this.parentQuiz.score++;
                console.log("Bonne réponse!\n");
            } else {
                var reponseD = "";
                this.rightAnswers.forEach((e) => {
                    if (e.label) {
                        reponseD += e.label + "\n";
                    }
                    else if (e.imageSrc) {
                        var tab = e.imageSrc.split('/');
                        reponseD += tab[(tab.length - 1)] + "\n";
                    }
                });
                console.log("Mauvaise réponse!\n  Bonnes réponses: " + reponseD);
            }
            let indexOfValidatedAnswers = [];
            this.validatedAnswers.forEach(aSelectedAnswer => {
                aSelectedAnswer.selected = false;
                indexOfValidatedAnswers.push(this.parentQuiz.tabQuestions[this.parentQuiz.currentQuestionIndex].tabAnswer.indexOf(aSelectedAnswer));
            });
            this.parentQuiz.questionsAnswered[this.parentQuiz.currentQuestionIndex] = {
                question: this.parentQuiz.tabQuestions[this.parentQuiz.currentQuestionIndex],
                validatedAnswers: indexOfValidatedAnswers
            };
            this.parentQuiz.nextQuestion();
        }

        /**
         * affiche ou cache le pictogramme indiquant que la question est mal formatée
         * @param {Boolean} active - la question est elle mal formatée
         */
        toggleInvalidQuestionPictogram(active) {
            let pictoSize = 20;
            if (active) {
                this.invalidQuestionPictogram = statusEnum.Edited.icon(pictoSize);
                this.invalidQuestionPictogramManipulator.set(0, this.invalidQuestionPictogram.circle);
                this.invalidQuestionPictogramManipulator.set(2, this.invalidQuestionPictogram.dot);
                this.invalidQuestionPictogramManipulator.set(3, this.invalidQuestionPictogram.exclamation);
                this.invalidQuestionPictogramManipulator.move(this.border.width / 2 - pictoSize, this.border.height / 2 - pictoSize);
            } else {
                this.invalidQuestionPictogramManipulator.unset(0);
                this.invalidQuestionPictogramManipulator.unset(2);
                this.invalidQuestionPictogramManipulator.unset(3);
            }
        }
    }

    class QuestionVueCollab extends QuestionVue {
        constructor(question, quiz) {
            super(question, quiz);
        }

        manageDisplayTitle() {

            let textHeight = 0;

            // Question avec Texte ET image
            if (this.imageSrc) {//&& this.label !== ""
                let imgObj = this.dimImage || {
                        width: this.image.width,
                        height: this.image.height
                    };
                let size = {width: this.width, height: this.height};
                if ((this.width <= 0) || (this.height <= 0)) {
                    size.width = size.height = 1;
                }

                textHeight = size.height * 0.25;
                var newHeight = this.imageSrc && size.height === this.imageSrc.height ? size.height : (size.height - textHeight) * 0.8;
                var image = displayImage(this.imageSrc, imgObj, newHeight * imgObj.width / imgObj.height, newHeight * 0.7).image;//

                image.position(0, OFFSET_POSITION_Y_QUESTION - ((this.label && this.label.length > 0) ? textHeight / 2 : 0));
                this.manipulator.set(2, image);
                this.image = image;

                (this.content && this.content.position(0, MARGIN));
            }
            else if (this.video) {
                let obj = drawSimpleVideo(this.label, this.video, this.height, this.height*COEFF_HEIGHT_TITTLE_QUESTION,
                    this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, true);
                this.miniatureVideo = obj.video;
                obj.video.mark('questionVideoToPlay');
            }

            if (this.label) {
                let imagePosY = OFFSET_POSITION_Y_QUESTION;
                let imagePosX = 0;
                if(this.image){
                    imagePosY += (this.label && this.label.length > 0) ? textHeight : 0;
                }else if(this.video){
                    imagePosX += this.miniatureVideo.width/2;
                }

                this.content = autoAdjustText(this.label, this.width/2, this.height*2/3, this.fontSize,
                    this.font, this.manipulator, 4).text.position(imagePosX, imagePosY);
            }

            let formation = this.parentQuiz.parentFormation;


            this.border = util.drawHexagon(this.width/2, this.height*COEFF_HEIGHT_TITTLE_QUESTION, 'H', 0.65)
                .position(0, OFFSET_POSITION_Y_QUESTION);
            this.manipulator.set(1, this.border);

            let line = new svg.Line(-this.width / 2 + MARGIN, OFFSET_POSITION_Y_QUESTION, this.width / 2 - MARGIN,
                OFFSET_POSITION_Y_QUESTION).color(myColors.grey, 1, myColors.grey);
            this.manipulator.set(0, line);


            //Title in the left corner  with limit 15 char
            autoAdjustText(formation.label, util.getStringWidthByFontSize(15, this.fontSize), this.fontSize, this.fontSize, this.font, this.manipulator, 3).text
                .position(-this.width / 2 + MARGIN + util.getStringWidthByFontSize(formation.label.length / 2, this.fontSize) + MARGIN, OFFSET_POSITION_Y_QUESTION - MARGIN);


        }

        render(x, y, w, h) {
            super.render(x, y, w, h);

            if (this.parentQuiz.currentQuestionIndex >= this.parentQuiz.tabQuestions.length) {
                let event = () => {
                    drawings.component.clean();
                    let tempFinishedQuiz = Object.assign({}, this.parentQuiz);
                    this.finishedQuiz = classContainer.createClass("QuizVue", tempFinishedQuiz, true);
                    this.finishedQuiz.currentQuestionIndex = this.questionNum - 1;
                    this.finishedQuiz.parentFormation.quizDisplayed = this.finishedQuiz;
                    this.finishedQuiz.run(1, 1, drawing.width, drawing.height);
                };
                this.border && svg.addEvent(this.border, "click", event);
                this.content && svg.addEvent(this.content, "click", event);
                this.image && svg.addEvent(this.image, "click", event);
            }

            super.genericPostRender();
            let realHeightPollygon = this.height*COEFF_HEIGHT_TITTLE_QUESTION;
            let point = this.border.globalPoint((this.label) ? -this.height : -this.height/2, 0);
            this.miniatureVideo && this.miniatureVideo.position(point.x, point.y-realHeightPollygon/2);
        }

        displayAnswers(w, h) {
            super.displayAnswers(w, h);

            this.tabAnswer.forEach((answerElement, index) => {
                let tilePosition = this.findTilePosition(index);
                this.answersManipulator.add(answerElement.manipulator);
                answerElement.display(-this.tileDimension.width / 2, -this.tileDimension.height / 2, this.tileDimension.width, this.tileDimension.height);

                answerElement.manipulator
                    .move(tilePosition.x - (NUMBER_ANSWER_BY_LINE) * (this.tileDimension.width) / 2 - MARGIN,
                        tilePosition.y + MARGIN + SPACE_BETWEEN_TITLE_AND_ANSWER);


                let point = answerElement.border.globalPoint(-50, -50);
                answerElement.video && answerElement.video.miniature.position(point.x, point.y);
                answerElement.border.mark('answerElementCadre' + index);        // id answerElementCadre & Content
                answerElement.content.mark('answerElementContent' + index);     // différents du coté admin answerLabelCadre & Content

                if (this.parentQuiz.previewMode) {
                    if (this.parentQuiz.questionsAnswered[this.questionNum - 1].validatedAnswers.indexOf(index) !== -1)
                        answerElement.model.correct ? answerElement.border.color(myColors.greyerBlue, 5, myColors.primaryGreen) : answerElement.border.color(myColors.greyerBlue, 5, myColors.red);
                    else {
                        answerElement.model.correct && answerElement.border.color(myColors.white, 5, myColors.primaryGreen)
                    }
                } else{
                    if (this.parentQuiz.questionsAnswered.length < this.questionNum) {
                        answerElement.border.color(myColors.white, 1, answerElement.border.strokeColor);
                    } else if (this.parentQuiz.questionsAnswered[this.questionNum - 1].validatedAnswers.indexOf(index) !== -1) {
                        answerElement.border.color(myColors.greyerBlue, 1, answerElement.border.strokeColor);
                    }
                }
            });

            this.openPopIn && this.openPopIn();
            this.openPopIn = null;

            if (this.parentQuiz.previewMode) {
                /* TODO lATER :
                 this.parentQuiz.textToSpeechIcon = drawTextToSpeechIcon({ x: 0.4 * drawing.width, y: -100, width: 35 })
                 .color(myColors.white, 0.5, SELECTION_COLOR)
                 .mark('iconTextToSpeech');
                 globalVariables.textToSpeechMode = false;
                 this.parentQuiz.textToSpeechIcon.clickHandler = () => {
                 globalVariables.textToSpeechMode = !globalVariables.textToSpeechMode;
                 if (globalVariables.textToSpeechMode) {
                 this.parentQuiz.textToSpeechIcon.color(SELECTION_COLOR);
                 } else {
                 this.parentQuiz.textToSpeechIcon.color(myColors.white, 0.5, SELECTION_COLOR);
                 }
                 };
                 this.parentQuiz.textToSpeechIcon.setMiniatureHandler('click', this.parentQuiz.textToSpeechIcon.clickHandler);
                 this.manipulator.add(this.parentQuiz.textToSpeechIcon.manipulator);
                 this.simpleChoiceMessageManipulator.move(buttonX + buttonW / 2, buttonY + buttonH / 2);
                 displayText("Cliquer sur une réponse pour afficher son explication", buttonW, buttonH, myColors.none, myColors.none, 20, "Arial", this.simpleChoiceMessageManipulator);*/
            } else {
                super.genericPostDisplayAnswer();
            }
        }
    }

    class QuestionVueAdmin extends QuestionVue {
        constructor(question, quiz) {
            super(question, quiz);
        }

        manageDisplayTitle() {
            // Question avec Texte ET image
            if (typeof this.label !== "undefined" && this.imageSrc) {//&& this.label !== ""
                let obj = displayImageWithTitle(this.label, this.imageSrc, this.dimImage || {
                        width: this.width/4,
                        height: this.height/4
                    }, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, this.image, this.width * 0.8);
                this.border = obj.border;
                this.content = obj.content;
                this.image = obj.image;
            }
            else if (this.video) {//&& this.label !== ""
                let obj;
                if (this.parentQuiz.previewMode) {
                    obj = drawVideo(this.label, this.video, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, true);
                }
                else {
                    obj = drawVideo(this.label, this.video, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, false);
                }
                this.border = obj.border;
                this.content = obj.content;
                this.miniatureVideo = obj.video;
                obj.video.mark('questionVideoToPlay');
            }
            // Question avec Texte uniquement
            else if (typeof this.label !== "undefined" && !this.imageSrc) {
                var object = displayText(this.label, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, 0, 1, this.width * 0.8);
                this.border = object.border;
                this.content = object.content;
            }
            // Question avec Image uniquement
            else if (this.imageSrc && !this.label) {
                this.image = displayImage(this.imageSrc, this.dimImage, this.width, this.height).image;
                this.manipulator.set(2, this.image);
            }
            else {
                this.border = new svg.Rect(this.width, this.height).color(this.bgColor, 1, this.colorBordure);
                this.manipulator.set(0, this.border);
            }
        }

        render(x, y, w, h) {
            super.render(x, y, w, h);

            if (!this.parentQuiz.previewMode) {
                this.border && svg.addEvent(this.border, "click", this.parentQuiz.parentFormation.quizManager.questionClickHandler);
                this.content && svg.addEvent(this.content, "click", this.parentQuiz.parentFormation.quizManager.questionClickHandler);
                this.image && svg.addEvent(this.image, "click", this.parentQuiz.parentFormation.quizManager.questionClickHandler);
            }

            super.genericPostRender();
            let globalPoints = this.manipulator.first.globalPoint(-50, -50);
            this.miniatureVideo && this.miniatureVideo.position(globalPoints.x, globalPoints.y);
        }

        displayAnswers(w, h) {
            super.displayAnswers(w, h);

            this.tabAnswer.forEach((answerElement, index) => {
                let tilePosition = super.findTilePosition(index);
                this.answersManipulator.add(answerElement.manipulator);
                answerElement.display(-this.tileDimension.width / 2, -this.tileDimension.height / 2, this.tileDimension.width, this.tileDimension.height);

                answerElement.manipulator
                    .move(tilePosition.x - (NUMBER_ANSWER_BY_LINE) * (this.tileDimension.width) / 2 - MARGIN,
                        tilePosition.y + MARGIN + SPACE_BETWEEN_TITLE_AND_ANSWER);

                let point = answerElement.border.globalPoint(-50, -50);
                answerElement.video && answerElement.video.miniature.position(point.x, point.y);
                answerElement.border.mark('answerElement' + index);
                if (this.parentQuiz.previewMode) {
                    answerElement.model.correct && answerElement.border.color(myColors.white, 5, myColors.primaryGreen);
                }
            });

            this.openPopIn && this.openPopIn();
            this.openPopIn = null;

            super.genericPostDisplayAnswer();
        }

        selectedQuestion() {
            this.border.color(this.bgColor, 5, SELECTION_COLOR);
            if (!this.redCrossManipulator) {
                let redCrossClickHandler = () => {
                    const quizManager = this.parentQuiz.parentFormation.quizManager,
                        questionPuzzle = quizManager.questionPuzzle,
                        questionsArray = questionPuzzle.elementsArray;
                    let index = questionsArray.indexOf(this);
                    this.remove();
                    (classContainer.isInstanceOf("AddEmptyElementVue", questionsArray[index])) && index--; // Cas où on clique sur l'AddEmptyElement (dernier élément)
                    if (index !== -1) {
                        quizManager.indexOfEditedQuestion = index;
                        this.parentQuiz.tabQuestions[index].selected = true;
                        resetQuestionsIndex(this.parentQuiz);
                        questionPuzzle && questionPuzzle.indexOfFirstVisibleElement != 0 && questionPuzzle.indexOfFirstVisibleElement--;
                        questionPuzzle && questionPuzzle.updateElementsArray(this.parentQuiz.tabQuestions);
                        questionPuzzle && questionPuzzle.fillVisibleElementsArray("leftToRight");
                        quizManager.questionClickHandler({question: this.parentQuiz.tabQuestions[index]});
                    }
                    else {
                        this.parentQuiz.tabQuestions.splice(0, 0, classContainer.createClass("QuestionVue", defaultQuestion, this.parentQuiz));
                        resetQuestionsIndex(this.parentQuiz);
                        if (questionPuzzle) {
                            questionPuzzle.visibleElementsArray[0].length === 6 && questionPuzzle.updateStartPosition('right');
                            questionPuzzle.fillVisibleElementsArray("leftToRight");
                        }
                        quizManager.indexOfEditedQuestion = ++index;
                        this.parentQuiz.tabQuestions[0].selected = true;
                        questionPuzzle.display();

                        svg.event(questionsArray[0].border, "click", {question: questionsArray[0]}); // dernier élément du tableau (AddEmptyElement)
                    }
                };
                this.redCrossManipulator = new Manipulator(this);
                let size = 20;
                this.redCross || (this.redCross = drawRedCross(-this.questNum.x, this.questNum.y - size / 2, size, this.redCrossManipulator));
                this.redCross.mark('questionRedCross');
                svg.addEvent(this.redCross, "click", redCrossClickHandler);
                this.redCrossManipulator.add(this.redCross);
                this.manipulator.add(this.redCrossManipulator);
            }
            else {
                this.redCrossManipulator.move(-this.questNum.x, this.questNum.y - this.redCross.size / 2);
                this.redCrossManipulator.add(this.redCross);
            }
        }

        /**
         * suppression de la question
         * @returns {boolean}
         */
        remove() {
            let index = this.parentQuiz.tabQuestions.indexOf(this);
            if (index !== -1) {
                this.parentQuiz.tabQuestions.splice(index, 1);
                return true;
            }
            else {
                return false;
            }
        }

        /**
         * Verifie que la question est correctement formatée
         */
        checkValidity() {
            var validation = true;
            this.questionType.validationTab.forEach((funcEl) => {
                var result = funcEl(this);
                validation = validation && result.isValid;
            });
            validation ? this.toggleInvalidQuestionPictogram(false) : this.toggleInvalidQuestionPictogram(true);
        }

        /**
         * vérifie si les réponses de l'utilisateur sont correctes
         */
        validateAnswers() {
            // test des valeurs, en gros si selectedAnswers === rigthAnswers
            var allRight = false;
            this.validatedAnswers = this.selectedAnswers;
            this.selectedAnswers = [];
            if (this.rightAnswers.length !== this.validatedAnswers.length) {
                allRight = false;
            } else {
                var subTotal = 0;
                this.validatedAnswers.forEach((e) => {
                    if (e.correct) {
                        subTotal++;
                    }
                });
                allRight = (subTotal === this.rightAnswers.length);
            }
            if (allRight) {
                this.parentQuiz.score++;
                console.log("Bonne réponse!\n");
            } else {
                var reponseD = "";
                this.rightAnswers.forEach((e) => {
                    if (e.label) {
                        reponseD += e.label + "\n";
                    }
                    else if (e.imageSrc) {
                        var tab = e.imageSrc.split('/');
                        reponseD += tab[(tab.length - 1)] + "\n";
                    }
                });
                console.log("Mauvaise réponse!\n  Bonnes réponses: " + reponseD);
            }
            let indexOfValidatedAnswers = [];
            this.validatedAnswers.forEach(aSelectedAnswer => {
                aSelectedAnswer.selected = false;
                indexOfValidatedAnswers.push(this.parentQuiz.tabQuestions[this.parentQuiz.currentQuestionIndex].tabAnswer.indexOf(aSelectedAnswer));
            });
            this.parentQuiz.questionsAnswered[this.parentQuiz.currentQuestionIndex] = {
                question: this.parentQuiz.tabQuestions[this.parentQuiz.currentQuestionIndex],
                validatedAnswers: indexOfValidatedAnswers
            };
            this.parentQuiz.nextQuestion();
        }

        /**
         * affiche ou cache le pictogramme indiquant que la question est mal formatée
         * @param {Boolean} active - la question est elle mal formatée
         */
        toggleInvalidQuestionPictogram(active) {
            let pictoSize = 20;
            if (active) {
                this.invalidQuestionPictogram = statusEnum.Edited.icon(pictoSize);
                this.invalidQuestionPictogramManipulator.set(0, this.invalidQuestionPictogram.circle);
                this.invalidQuestionPictogramManipulator.set(2, this.invalidQuestionPictogram.dot);
                this.invalidQuestionPictogramManipulator.set(3, this.invalidQuestionPictogram.exclamation);
                this.invalidQuestionPictogramManipulator.move(this.border.width / 2 - pictoSize, this.border.height / 2 - pictoSize);
            } else {
                this.invalidQuestionPictogramManipulator.unset(0);
                this.invalidQuestionPictogramManipulator.unset(2);
                this.invalidQuestionPictogramManipulator.unset(3);
            }
        }
    }

    /**
     * @class
     */
    class AddEmptyElementVue extends Vue {
        constructor(parent, type) {
            super();
            var _initVars = () => {
                this.manipulator.addOrdonator(3);
                this.invalidLabelInput = false;
                this.fontSize = 20;
                this.parent = parent;
            }
            var _setType = (type) => {
                this.type = type;
                switch (type) {
                    case 'question':
                        this.label = "Nouvelle question";
                        break;
                    case 'answer':
                        this.label = "Nouvelle réponse";
                        break;
                    default:
                        throw new Error('EmptyElement should have a type');
                        break;
                }
            }

            _initVars();
            _setType(type);
        }

        events() {
            return {
                "dblclick manipulator": this.dblclickAdd
            }
        }

        render(x, y, w, h) {
            var _displayText = () => {
                let obj = displayText(this.label, w, h, myColors.black, myColors.white, this.fontSize, null, this.manipulator);
                obj.content.position(0, this.fontSize);
                obj.border.color(myColors.white, 3, myColors.black)
                    .mark('emptyAnswerAddCadre' + this.type);
                obj.border.component.setAttribute && obj.border.component.setAttribute('stroke-dasharray', '10, 5');
            }
            var _displayPlus = () => {
                let plusSize = 2 * this.fontSize;
                let plus = drawPlus(0, -plusSize / 2, plusSize, plusSize);
                this.manipulator.set(2, plus);
            }

            this.manipulator.move(x, y);
            _displayText();
            _displayPlus();
        }

        dblclickAdd() {
            var _addAnswer = () => {
                let newAnswer = classContainer.createClass("AnswerVueAdmin", {model: new Answer(null, this.parent.linkedQuestion, this)});
                newAnswer.isEditable(this, true);
                let questionCreator = this.parent;
                questionCreator.linkedQuestion.tabAnswer.forEach(answer => {
                    answer.obj && answer.obj.video && drawings.component.remove(answer.obj.video);
                });
                questionCreator.linkedQuestion.tabAnswer.pop();
                questionCreator.linkedQuestion.tabAnswer.push(newAnswer);

                if (questionCreator.linkedQuestion.tabAnswer.length < questionCreator.MAX_ANSWERS) {
                    questionCreator.linkedQuestion.tabAnswer.push(classContainer.createClass("AddEmptyElementVue", questionCreator, this.type));
                }
                questionCreator.puzzle.updateElementsArray(questionCreator.linkedQuestion.tabAnswer);
                questionCreator.puzzle && questionCreator.puzzle.fillVisibleElementsArray("leftToRight");
                questionCreator.manipulator.add(questionCreator.puzzle.manipulator);
                questionCreator.puzzle.display(questionCreator.coordinatesAnswers.x,
                    questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w,
                    questionCreator.coordinatesAnswers.h, false);
                questionCreator.linkedQuestion.checkValidity();
            };
            var _addQuestion = () => {
                drawings.component.clean();
                let quizManager = this.parent;
                quizManager.quiz.tabQuestions.pop();
                (quizManager.quiz.tabQuestions.length > 0) && (quizManager.quiz.tabQuestions[quizManager.indexOfEditedQuestion].selected = false);
                quizManager.indexOfEditedQuestion = quizManager.quiz.tabQuestions.length;
                quizManager.quiz.tabQuestions.forEach(question => {
                    question.redCrossManipulator && question.redCrossManipulator.flush();
                    question.selected = false
                    question.tabAnswer.forEach(answer => {
                        if (answer.popIn) {
                            quizManager.questionCreator.manipulator.remove(answer.popIn.manipulator.add);
                            quizManager.questionCreator.explanation = null;
                        }
                    })
                });
                let newQuestion = classContainer.createClass("QuestionVueAdmin", null, quizManager.quiz);
                newQuestion.selected = true;
                quizManager.quiz.tabQuestions.push(newQuestion);
                let AddNewEmptyQuestion = classContainer.createClass("AddEmptyElementVue", quizManager, 'question');
                quizManager.quiz.tabQuestions.push(AddNewEmptyQuestion);
                quizManager.questionPuzzle.visibleElementsArray[0].length === 6 && quizManager.questionPuzzle.updateStartPosition('right');
                if (quizManager.questionPuzzle.elementsArray.length > quizManager.questionPuzzle.columns) {
                    quizManager.displayQuestionsPuzzle(quizManager.questionPuzzleCoordinates.x,
                        quizManager.questionPuzzleCoordinates.y,
                        quizManager.questionPuzzleCoordinates.w,
                        quizManager.questionPuzzleCoordinates.h,
                        quizManager.questionPuzzle.indexOfFirstVisibleElement + 1);
                } else {
                    quizManager.displayQuestionsPuzzle(quizManager.questionPuzzleCoordinates.x,
                        quizManager.questionPuzzleCoordinates.y,
                        quizManager.questionPuzzleCoordinates.w,
                        quizManager.questionPuzzleCoordinates.h,
                        quizManager.questionPuzzle.indexOfFirstVisibleElement);
                }
                quizManager.questionCreator.loadQuestion(newQuestion);
                quizManager.questionCreator.display(quizManager.questionCreator.previousX,
                    quizManager.questionCreator.previousY,
                    quizManager.questionCreator.previousW,
                    quizManager.questionCreator.previousH);
            };

            this.manipulator.flush();
            switch (this.type) {
                case 'answer':
                    _addAnswer();
                    break;
                case 'question':
                    _addQuestion();
                    break;
            }
        }

        remove() {
            throw new Error("Tentative de suppression d'AddEmptyElement");
        }
    }

    class AnswerVue extends Vue {
        constructor(options) {
            super(options);
            this.explanationIconManipulator = new Manipulator(this).addOrdonator(5);
            this.manipulator.addOrdonator(10);
        }

        isEditable(editor, editable) {
        }
        dropImage(element){
            this.model.video = null;
            this.obj.video && drawings.component.remove(this.obj.video);
            this.model.image = element.component;
            this.model.imageSrc = element.src;
            this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.elementsArray.forEach(elem => {
                elem.obj && elem.obj.video && drawings.component.remove(elem.obj.video);
            });
            this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
            this.model.parentQuestion.checkValidity();
        }

        render(x, y, w, h) {
            var _savePosAndSize = () => {
                this.x = x;
                this.y = y;
                this.width = w;
                this.height = h;
            };
            var _answerEditableDisplay = (x, y, w, h) => {
                let _placeManipulator = () => {
                    this.manipulator.flush();
                    this.manipulator.move(x, y);
                    this.obj = {};
                };
                let _displayAnswerBox = () => {
                    let text = (this.model.label) ? this.model.label : this.model.labelDefault,
                        color = (this.model.label) ? myColors.black : myColors.grey,
                        checkboxSize = h * 0.2;

                    if (this.model.image) {
                        let pictureRedCrossClickHandler = () => {
                            this.manipulator.unset(2);
                            this.model.image = null;
                            this.model.imageSrc = null;
                            this.model.parentQuestion.checkValidity();
                        };
                        let picture = new Picture(this.model.imageSrc, true, this.model, "", pictureRedCrossClickHandler);
                        picture.draw(0, 0, w * 1 / 3, h * 1 / 3, this.manipulator, 2, 'answerImage' + this.model.parentQuestion.tabAnswer.indexOf(this), w - 2 * checkboxSize);
                        this.border = picture.imageSVG.border;
                        this.obj.image = picture.imageSVG.image;
                        this.obj.content = picture.imageSVG.content;
                    } else if (this.model.video) {
                        this.obj && this.obj.video && drawings.component.remove(this.obj.video);
                        let obj = drawVideo(text, this.model.video, w, h, this.model.colorBordure, this.model.bgColor, this.model.fontsize, this.model.font, this.manipulator, true, false, 8);
                        obj.video.setRedCrossClickHandler(() => {
                            obj.video.redCrossManipulator.flush();
                            this.manipulator.unset(8);
                            this.obj && this.obj.video && drawings.component.remove(this.obj.video);
                            this.video = null;
                            this.model.parentQuestion.checkValidity();
                        });
                        this.obj.content = obj.content;
                        this.border = obj.border;
                        this.obj.video = obj.video;
                    }


                    var tempObj = new gui.TextArea(0, 0, w, h, text).font(this.model.font, this.model.fontSize).anchor("center");
                    tempObj.glass._acceptDrop = true;
                    this.border = tempObj.frame;
                    this.obj.content = tempObj.text;
                    this.manipulator.set(0, tempObj.component);
                    //TODO rajouter les checks
                    tempObj.onInput((oldMessage, newMessage, valid) => {
                        if (oldMessage === this.model.labelDefault) this.obj.content.color(myColors.black);
                        if (newMessage !== this.model.labelDefault) this.model.label = newMessage;
                    });
                    tempObj.onClick((textarea) => {
                        if (textarea.value === this.model.labelDefault) {
                            textarea.value = "";
                        }
                    });

                    //TODO rechanger pour afficher plus correctement les textarea avec les corners
                    this.border
                        .corners(25, 25)
                        .color(myColors.white, 1, myColors.black).fillOpacity(0.001)
                        .mark('answerLabelCadre' + this.model.parentQuestion.tabAnswer.indexOf(this));
                    this.obj.content.color(color).mark('answerLabelContent' + this.model.parentQuestion.tabAnswer.indexOf(this));
                    this.obj.content.parentObject = tempObj;
                    this.border._acceptDrop = true;
                    this.obj.content._acceptDrop = true;

                    this.redCrossManipulator = new Manipulator(this).addOrdonator(2);
                    this.manipulator.add(this.redCrossManipulator);
                    let redCrossClickHandler = () => {
                        let index = this.model.parentQuestion.tabAnswer.indexOf(this);
                        drawing.mousedOverTarget = null;
                        drawings.component.remove(this.model.parentQuestion.tabAnswer[index].obj.video);
                        this.model.parentQuestion.tabAnswer.splice(index, 1);
                        let questionCreator = this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                        if (this.model.parentQuestion.tabAnswer.length < 3) {
                            svg.event(this.model.parentQuestion.tabAnswer[this.model.parentQuestion.tabAnswer.length - 1].manipulator.ordonator.children[2], 'dblclick', {});
                            if (index === 0) {
                                [this.model.parentQuestion.tabAnswer[0], this.model.parentQuestion.tabAnswer[1]] = [this.model.parentQuestion.tabAnswer[1], this.model.parentQuestion.tabAnswer[0]];
                            }
                        }
                        questionCreator.display();
                        this.model.parentQuestion.checkValidity();
                    };
                    let mouseenterhandler = () => {
                        let redCrossSize = 15;
                        let redCross = drawRedCross(this.width / 2 - redCrossSize, -this.height / 2 + redCrossSize, redCrossSize, this.redCrossManipulator)
                            .mark('redCross');
                        svg.addEvent(redCross, 'mouseup', (event) => {
                            this.redCrossManipulator.flush();
                            redCrossClickHandler(event)
                        });
                        this.redCrossManipulator.set(1, redCross);
                    };
                    let mouseleavehandler = (event) => {
                        let target = drawings.component.background.getTarget(event.pageX, event.pageY);
                        if (!target || target.id !== "redCross") {
                            this.redCrossManipulator.flush();
                        }
                    }
                    this.manipulator.addEvent('mouseenter', mouseenterhandler);
                    this.manipulator.addEvent('mouseleave', mouseleavehandler);
                };
                let _displayPenAndCheckBox = () => {
                    let penHandler = () => {
                        if (!this.popIn) this.popIn = classContainer.createClass("PopInVue", this, true);
                        let questionCreator = this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                        this.popIn.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                        questionCreator.explanation = this.popIn;



                    };

                    let checkboxSize = h * 0.2;
                    displayPen(this.width / 2 - checkboxSize, this.height / 2 - checkboxSize, checkboxSize, this, penHandler);
                    this.obj.checkbox = displayCheckbox(-this.width / 2 + checkboxSize, this.height / 2 - checkboxSize, checkboxSize, this).checkbox;
                    this.obj.checkbox.mark('checkbox' + this.model.parentQuestion.tabAnswer.indexOf(this));
                    this.obj.checkbox.answerParent = this;
                    this.manipulator.ordonator.children.forEach((e) => {
                        e._acceptDrop = true;
                    });
                }

                _placeManipulator();
                _displayAnswerBox();
                _displayPenAndCheckBox();
            };
            var _generateElements = () => {

                this.border = util.drawHexagon(this.width, this.height - MARGIN, null, 0.60);
                this.manipulator.set(0, this.border);

                var text = autoAdjustText(this.model.label, this.width, null, this.model.fontSize,
                    this.model.font, this.manipulator, 1).text;
                this.content = text;
                this.manipulator.set(1, this.content);

                if(this.model.imageSrc){
                    var image = displayImage(this.model.imageSrc, this.model.dimImage, this.width, this.height).image;
                    this.image = image;
                    this.manipulator.set(2, image);
                    if(this.model.label){
                        image.position(-this.width/2 + image.width/2,0);
                        this.content.position(-this.width/2 + image.width
                            + util.getStringWidthByFontSize(this.model.label.length / 2 + 1, this.model.fontSize), 0);
                    }
                }

                if (this.model.selected) { // image pré-selectionnée
                    this.border.color(this.model.bgColor, 5, SELECTION_COLOR);
                }
                this.manipulator.move(this.x, this.y);
            };
            var _drawPopIn = () => {
                var openPopIn = () => {
                    runtime.speechSynthesisCancel();
                    this.model.parentQuestion.parentQuiz.closePopIn();
                    let popInParent = this.model.parentQuestion,
                        popInX = this.model.parentQuestion.parentQuiz.x,
                        popInY=MARGIN,
                        popInWidth = this.model.parentQuestion.width-2*MARGIN,
                        popInHeight = this.model.parentQuestion.height * this.model.parentQuestion.lines  ;
                    this.model.explanationPopIn = this.model.explanationPopIn || classContainer.createClass("PopInVue", this, false);

                    if (globalVariables.textToSpeechMode && this.model.explanationPopIn.label && (!this.model.explanationPopIn.video || !this.model.explanationPopIn.said)) {
                        setTimeout(() => {
                            runtime.speechSynthesisSpeak(this.model.explanationPopIn.label)
                        }, 200);
                        this.model.explanationPopIn.said = true;
                        (this.model.explanationPopIn.image || this.model.explanationPopIn.video) && this.model.explanationPopIn.display(popInParent, popInX, MARGIN, popInWidth, popInHeight);
                    }
                    else {
                        this.model.explanationPopIn.display(popInParent, popInX, MARGIN, popInWidth, popInHeight);
                    }
                };
                if (this.model.explanationPopIn && this.model.explanationPopIn.displayed) this.model.parentQuestion.openPopIn = openPopIn;

                const pictoSize = 20;
                drawExplanationIcon(-this.border.width / 2, 0, pictoSize, this.explanationIconManipulator);
                this.manipulator.set(7, this.explanationIconManipulator);
                this.explanationIconManipulator.addEvent("click", openPopIn);
                svg.addEvent(this.border, "click", openPopIn);
                svg.addEvent(this.content, "click", openPopIn);
            };
            var _displayVoiceIcon = () => {
                if(this.model.label && this.model.label.length > 0){
                    this.voiceIcon = new util.Picture("../images/speaker.png", false, this);
                    ///this.voiceIcon.draw(this.border.width / 2 - 2 * MARGIN, -this.border.height / 2 + 2 * MARGIN, 16, 16, this.manipulator, 6);
                    this.voiceIcon.draw(this.width/2, 0, 16, 16, this.manipulator, 6);
                    svg.addEvent(this.voiceIcon.imageSVG, 'click', () => {
                        runtime.speechSynthesisSpeak(this.model.label);
                    });
                }
            };

            _savePosAndSize();
            if (this.model.editable) {
                _answerEditableDisplay(this.x, this.y, this.width, this.height);
            } else {
                _generateElements();
                if (this.model.parentQuestion.parentQuiz.previewMode) {
                    this.model.explanation && !this.model.explanation.empty() && _drawPopIn();
                    _displayVoiceIcon();
                }
            }
        }
    }

    class AnswerVueCollab extends AnswerVue {
        constructor(options) {
            super(options);
        }

        render(x, y, w, h) {
            super.render(x, y, w, h);
            if (!this.model.editable && !this.model.parentQuestion.parentQuiz.previewMode) {
                var _chooseAnswer = () => {
                    this.model.select(this);
                    let parentQuestion = this.model.parentQuestion;
                    if (parentQuestion.multipleChoice) {
                        if (this.model.selected) {
                            this.model.colorBordure = this.border.strokeColor;
                            this.border.color(this.model.bgColor, 5, SELECTION_COLOR);
                            parentQuestion.resetManipulator.ordonator.children[0].color(myColors.yellow, 1, myColors.green);
                        } else {
                            this.border.color(this.model.bgColor, 1, this.model.colorBordure);
                            if (parentQuestion.selectedAnswers.length === 0) {
                                parentQuestion.resetManipulator.ordonator.children[0].color(myColors.grey, 1, myColors.grey);
                            }
                        }
                    }
                };
                this.manipulator.addEvent('click', _chooseAnswer);
            }
        }
    }

    class AnswerVueAdmin extends AnswerVue {
        constructor(options) {
            super(options);
        }

        isEditable(editor, editable) {
            this.linesManipulator = new Manipulator(this).addOrdonator(4);
             this.manipulator.add(this.linesManipulator);
             this.penManipulator = new Manipulator(this).addOrdonator(4);
             this.manipulator.add(this.penManipulator);
             this.model.isEditable(editor, editable);
        }
    }

    /**
     * @class
     */
    class PopInVue extends Vue {
        constructor(answerVue, editable) {
            super();
            var _initManipulators = () => {
                this.manipulator.addOrdonator(7);
                this.closeButtonManipulator = new Manipulator(this).addOrdonator(2);
                this.manipulator.set(2, this.closeButtonManipulator);
                this.panelManipulator = new Manipulator(this).addOrdonator(3);
                this.textManipulator = new Manipulator(this).addOrdonator(1);
                this.panelManipulator.set(1, this.textManipulator);
                this.manipulator.add(this.panelManipulator);
            };
            var _initExplanations = () => {
                this.answer = answerVue;
                this.editable = editable;
                if (this.editable) {
                    this.draganddropText = "Glisser-déposer une image ou une vidéo de la bibliothèque ici";
                    this.defaultLabel = "Cliquer ici pour ajouter du texte";
                }
                if (this.answer.model.explanation && this.answer.model.explanation.label) {
                    this.label = this.answer.model.explanation.label;
                }
                if (this.answer.model.explanation && this.answer.model.explanation.image) {
                    this.image = this.answer.model.explanation.image;
                }
                if (this.answer.model.explanation && this.answer.model.explanation.video) {
                    this.video = this.answer.model.explanation.video;
                }
                this.answer.filled = this.image || this.video || this.label;
            }

            _initManipulators();
            _initExplanations();
        }

        dropImage(element){
            this.image = element.src;
            this.video = null;
            this.miniature && this.miniature.video && this.miniature.video.redCrossManipulator && this.miniature.video.redCrossManipulator.flush();
            let questionCreator = this.answer.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
            this.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
        }

        render(parent, x, y, w, h) {
            var _initPopIn = () => {
                const rect = new svg.Rect(w , h)
                    .color(myColors.white, 1, myColors.black);
                rect._acceptDrop = this.editable;
                parent.manipulator.add(this.manipulator);
                this.manipulator.set(0, rect);
                this.manipulator.move(0, y);
                this.answer.model.editor && this.answer.model.editor.puzzle && this.answer.model.editor.puzzle.elementsArray.forEach(answerElement => {
                    answerElement.obj && answerElement.obj.video && drawings.component.remove(answerElement.obj.video);
                });
                this.answer.model.parentQuestion.tabAnswer.forEach(answer => {
                    answer.model.video && drawings.component.remove(answer.model.video.miniature);
                });
            }
            var _drawGreyCross = (size) => {
                var _crossHandler = () => {
                    drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
                    this.said = false;
                    runtime.speechSynthesisCancel();
                    this.editable && (parent.explanation = false);
                    parent.manipulator.remove(cross.parent.parentManip.parentObject.manipulator);
                    this.editable && parent.puzzle.display(x, y, w, h, false);
                    this.displayed = false;
                    this.miniature && drawings.component.remove(this.miniature.video);
                    if (classContainer.isInstanceOf("QuestionVue", parent)) {
                        parent.tabAnswer.forEach(answer => {
                            answer.video && drawings.component.add(answer.video.miniature);
                        });
                    }
                };

                let circle = new svg.Circle(size).color(myColors.black, 2, myColors.white),
                    cross = drawCross(w / 2, -h / 2, size, myColors.lightgrey, myColors.lightgrey, this.closeButtonManipulator);
                this.closeButtonManipulator.set(0, circle);
                this.closeButtonManipulator.set(1, cross);
                this.closeButtonManipulator.addEvent('click', _crossHandler);
                this.closeButtonManipulator.mark('closeButtonManipulator');
                // svg.addEvent(cross, "click", _crossHandler);
                // svg.addEvent(circle, "click", _crossHandler);
                svg.addGlobalEvent("keydown", (event) => {
                    (event.keyCode === 27) && _crossHandler();
                });
            };
            var _displayImageOrVideo = () => {
                var _displayImage = () => {
                    let pictureRedCrossClickHandler = () => {
                        this.manipulator.flush();
                        this.image = null;
                        this.dimImage = {width: this.image.width, height: this.image.height};

                        this.imageSrc = null;
                        let questionCreator = this.answer.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                      // this.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                    };


                    this.miniature && this.miniature.video && drawings.component.remove(this.miniature.video);
                    let picture = new util.Picture(this.image, this.editable, this, null, pictureRedCrossClickHandler);
                    picture.draw(-w*0.375, 0, h-MARGIN , h-MARGIN, this.manipulator,3);
                    picture.imageSVG.mark('imageExplanation');
                    this.answer.filled = true;


                };
                //TODO corriger video
                var _displayVideo = () => {
                    this.miniature && this.miniature.video && drawings.component.remove(this.miniature.video);
                    this.manipulator.unset(3);
                    this.miniature = util.drawVideo("NOT_TO_BE_DISPLAYED", this.video, w, h, myColors.black, myColors.white, 10, null, this.manipulator, !this.answer.parentQuestion.parentQuiz.previewMode, this.answer.parentQuestion.parentQuiz.previewMode, 5);
                    this.answer.parentQuestion.parentQuiz.previewMode || this.miniature.video.setRedCrossClickHandler(() => {
                        this.miniature.video.redCrossManipulator.flush();
                        this.manipulator.unset(5);
                        this.video = null;
                        drawings.component.remove(this.miniature.video);
                        this.manipulator.unset(this.manipulator.lastLayerOrdonator());
                        let questionCreator = this.answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                        this.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                        this.answer.parentQuestion.checkValidity();
                    });
                    this.miniature.border.corners(0, 0);
                    this.miniature.video._acceptDrop = true;
                    this.globalPoints = this.miniature.border.globalPoint(0 - 50, -50);
                    this.miniature.video.position(this.globalPoints.x, this.globalPoints.y);
                    this.manipulator.ordonator.children[this.manipulator.lastLayerOrdonator()].position(0, 25);
                    this.answer.filled = true;
                };
                var _displayEditableText = () => {
                    autoAdjustText(this.draganddropText,w/6-2*MARGIN, panelHeight, 20, 'Arial', this.manipulator, 3).text
                        .position(-w*1/3-(2*MARGIN), -h/3+2*MARGIN).color(myColors.grey)
                        ._acceptDrop = this.editable;
                    this.label ? this.answer.filled = true : this.answer.filled = false;
                }

                const panelWidth = w - 2 * MARGIN, panelHeight = h-2 * MARGIN;


                //const contentW = panelWidth * 1/3;
                if (this.image) {
                    _displayImage();
                } else if (this.video) {
                    _displayVideo();
                } else if (this.editable) {
                    _displayEditableText();
                }
            };
            var _displayExplanation = () => {
                var _definePanel = () => {
                    let panelWidth = (w - 2 * MARGIN) * 3/4, panelHeight = h - 2 * MARGIN;
                    this.panel = new gui.Panel(panelWidth, panelHeight, myColors.white)
                    this.panel.border.color([], 1, [0, 0, 0]);
                    this.panel.back.mark('explanationPanel');
                    this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
                    this.panelManipulator.set(0, this.panel.component);
                    this.panelManipulator.move(w*1/8, 0);
                };
                var _displayText = () => {
                    let textToDisplay = this.label ? this.label : (this.defaultLabel ? this.defaultLabel : "");
                    this.text = new svg.Text(textToDisplay)
                        .dimension(this.panel.width, 0)
                        //.position(panelWidth / 2 + MARGIN * 2, MARGIN * 2)
                        .font("Arial", 20)
                        .mark('textExplanation');
                    this.textManipulator.set(0, this.text);
                }
                var _displayTextArea = () => {
                    let panelWidth = (w - 2 * MARGIN) * 3/4, panelHeight = h - 2 * MARGIN;
                    let textToDisplay = this.label ? this.label : (this.defaultLabel ? this.defaultLabel : "");
                    this.text = new gui.TextArea(0, 0, panelWidth, panelHeight, textToDisplay)
                        .font("Arial", 20)
                        .anchor("center")
                        .color(myColors.white, 1, myColors.black);
                    this.text.text.parentObject = this.text;
                    this.text.text.mark('textExplanation');
                    this.textManipulator.set(0, this.text.component);

                    this.text.onInput((oldMessage, message)=>{
                        this.label = message;
                        this.display(parent, x, y, w, h);
                    })
                }

                _definePanel();
                if (this.editable) {
                    _displayTextArea();
                }else {
                    _displayText();
                }
            };
            var _displayVoiceIcon = () => {
                let panelWidth = (w +2*MARGIN ) * 2 / 3, panelHeight = h - 2 * MARGIN;
                this.voiceIcon = new util.Picture("../images/speaker.png", false, this);
                this.voiceIcon.draw(panelWidth /2 +  2*MARGIN, -panelHeight / 2 + MARGIN, 16, 16, this.panelManipulator,2);
                svg.addEvent(this.voiceIcon.imageSVG, 'click', () => {
                    runtime.speechSynthesisSpeak(this.label);
                });

            }


            _initPopIn();
            _drawGreyCross(12);
            _displayImageOrVideo();
            _displayExplanation();

            if(!this.editable){
                _displayVoiceIcon();
            }

            this.displayed = true;
        }
    }

    return {
        Answer,
        QuizManagerVue,
        QuestionCreatorVue,
        QuestionVueCollab,
        QuestionVueAdmin,
        AddEmptyElementVue,
        AnswerVueCollab,
        AnswerVueAdmin,
        PopInVue
    };
};