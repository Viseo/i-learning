/**
 * Created by DMA3622 on 05/05/2017.
 */
exports.QuizAdminV = function (globalVariables) {
    const util = globalVariables.util,
        View = globalVariables.View,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        IconCreator = globalVariables.domain.IconCreator,
        ReturnButton = globalVariables.util.ReturnButton,
        BUTTON_WIDTH = 250,
        BUTTON_HEIGHT = 30,
        QUESTIONS_PER_LINE = 6,
        ANSWERS_PER_LINE = 4,
        CHECKBOX_SIZE = 15;

    class QuizAdminV extends View {
        constructor(presenter) {
            super(presenter);
            var _createReturnButton = () => {
                this.returnButton = new ReturnButton(this, "Retour à la formation");
                this.returnButton.setHandler(() => {
                    // this.formation.display();
                    this.returnToOldPage();
                })
                this.manipulator.add(this.returnButton.manipulator);
            }
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.questionsBlockManipulator = new Manipulator(this).addOrdonator(1);
                this.questionDetailsManipulator = new Manipulator(this).addOrdonator(4);
                this.titleManipulator = new Manipulator(this).addOrdonator(1);
                this.previewButtonManipulator = new Manipulator(this).addOrdonator(1);
                this.saveQuizButtonManipulator = new Manipulator(this).addOrdonator(1);
                this.manipulator
                    .add(this.questionsBlockManipulator)
                    .add(this.questionDetailsManipulator)
                    .add(this.titleManipulator)
                    .add(this.previewButtonManipulator)
                    .add(this.saveQuizButtonManipulator)
                    .add(this.header.getManipulator());
            };
            var _initMediaLibrary = () => {
                // this.library = classContainer.createClass('MediaLibraryVue');
            }

            this.label = this.getLabel();
            _declareManipulator();
            _createReturnButton();
            _initMediaLibrary();
        }

        display() {
            var _resetDrawings = () => {
                // main.currentPageDisplayed = "QuizManager";
                drawings.component.clean();
                this.questionsBlockManipulator.flush();
                this.questionDetailsManipulator.flush();
                drawing.manipulator.set(0, this.manipulator);
                this.questions = [];
                this.width = drawing.width - 2 * MARGIN;
                this.height = drawing.height - drawing.height * HEADER_SIZE;
            }
            var _updateHeader = () => {
                let buttonSize = 20;
                let formationLabel = this.getFormationLabel();
                this.header.display(formationLabel + " - " + this.label);
                this.returnButton.display(0, buttonSize / 2 + currentY, buttonSize, buttonSize);
                currentY += buttonSize + MARGIN;
            }
            var _displayTitleArea = () => {
                let dimensions = {
                    width: this.width * 1 / 4,
                    height: BUTTON_HEIGHT
                }
                let titleTextArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, this.label);

                this.titleManipulator.set(0, titleTextArea.component);
                titleTextArea.font('Arial', 15);
                titleTextArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                this.titleManipulator.move(MARGIN + dimensions.width / 2, currentY + dimensions.height / 2);
                currentY += dimensions.height + MARGIN;
            }
            var _displayQuestionsHeader = () => {
                let dimensions = {
                    width: this.width,
                    height: this.height * 1 / 6
                }
                let border = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 1, myColors.black);
                this.questionsBlockManipulator.set(0, border);
                this.questionsBlockManipulator.move(MARGIN + dimensions.width / 2, currentY + dimensions.height / 2);
                currentY += dimensions.height + MARGIN;
            }
            var _displayMediaLibrary = () => {
                let dimensions = {
                    width: this.width * 1 / 5 - MARGIN,
                    height: drawing.height - currentY - (2 * MARGIN + BUTTON_HEIGHT)
                };

                this.gamePanel = new gui.Panel(dimensions.width, dimensions.height);
                this.gamePanel.border.color(myColors.none, 1, myColors.grey).corners(5,5);
                this.gameLibraryManipulator = new Manipulator(this).addOrdonator(3);
                this.gameLibraryManipulator.set(0,this.gamePanel.component);
                this.gameLibraryManipulator.move(this.gamePanel.width/2 + MARGIN, currentY + this.gamePanel.height/2);
                this.manipulator.add(this.gameLibraryManipulator);
                this.titleLibrary = new svg.Text('Jeux').color(myColors.grey).font('Arial', 25).anchor('left');
                this.titleLibrary.position(-0.85*this.gamePanel.width/2, -this.gamePanel.height/2 + 8.33);
                this.gameLibraryManipulator.set(2,this.titleLibrary);
                this.titleLibraryBack = new svg.Rect(this.titleLibrary.boundingRect().width + 2*MARGIN, 3).color(myColors.white);
                this.titleLibraryBack.position(-0.85*this.gamePanel.width/2 + this.titleLibrary.boundingRect().width/2,
                    -this.gamePanel.height/2);
                this.gameLibraryManipulator.set(1,this.titleLibraryBack);
            };
            var _displayQuestionDetails = () => {
                let dimensions = {
                    width: this.width * 4 / 5,
                    height: drawing.height - currentY - (2 * MARGIN + BUTTON_HEIGHT)
                }
                this.questionDetailsDim = dimensions;
                let border = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 1, myColors.black);
                this.questionDetailsManipulator.set(0, border);
                this.questionDetailsManipulator.move(this.width - dimensions.width/2 + MARGIN, currentY + dimensions.height / 2);
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
                this.previewButtonManipulator.move(this.width / 2 - dimensions.width / 2 - MARGIN, currentY + dimensions.height / 2);
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
                this.saveQuizButtonManipulator.move(this.width / 2 + dimensions.width / 2 + MARGIN, currentY + dimensions.height / 2);
            }
            var _displayQuestions = () => {
                let questions = this.getQuestions();
                // this.numberQuestions = questions.length;
                questions.forEach((question, i) => {
                    let questionDisplayElement = this.newQuestionBlock(question, i);
                    this.questions.push(question);
                    this.questionsBlockManipulator.add(questionDisplayElement.blockManipulator);
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

        newQuestionBlock(question, index) {
            var _createBlock = (question, index) => {
                var _newQuestionObject = () => {
                    var _initManipulators = () => {
                        question.blockManipulator = new Manipulator(this).addOrdonator(2);
                        question.typeManipulator = new Manipulator(this).addOrdonator(2);
                        question.textAreaManipulator = new Manipulator(this).addOrdonator(1);
                        question.answersManipulator = new Manipulator(this);
                    };
                    var _initInfos = () => {
                        question.index = index;
                    };

                    _initManipulators();
                    _initInfos();
                    question.unselect = () => {
                        if (question.selected) {
                            question.selected = false;
                            question.questionButton.color([myColors.white, 1, myColors.black]);
                        }
                    }
                    question.select = () => {
                        if (!question.selected) {
                            question.selected = true;
                            question.questionButton.color([[43, 120, 228], 1, myColors.black]);
                            this.selectQuestion(question.index);
                        }
                    }
                    question.setMultipleChoice = (isMultiple) => {
                        if (isMultiple) {
                            question.uniqueButton.color([myColors.white, 1, myColors.black]);
                            question.multipleButton.color([[43, 120, 228], 1, myColors.black])
                        } else {
                            question.uniqueButton.color([[43, 120, 228], 1, myColors.black]);
                            question.multipleButton.color([myColors.white, 1, myColors.black]);
                        }
                        question.multipleChoice = !!isMultiple; //convert to Boolean
                    }
                }
                var _displayBloc = () => {
                    let dimensions = {
                        width: this.width / QUESTIONS_PER_LINE,
                        height: this.height * 1 / 6 - 2 * MARGIN
                    }
                    question.questionButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], question.label || "Question " + question.index);
                    question.questionButton.back.corners(5, 5);
                    question.questionButton.onClick(() => question.select());
                    question.blockManipulator.add(question.questionButton.component);
                    question.blockManipulator.move(MARGIN - this.width / 2 + dimensions.width / 2 + question.index * (dimensions.width + MARGIN), 0);
                };
                var _displayType = () => {
                    let dimensions = {
                        width: BUTTON_WIDTH,
                        height: BUTTON_HEIGHT
                    }
                    question.uniqueButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], "Réponse unique");
                    question.multipleButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], 'Réponses multiples');
                    question.uniqueButton.position(-(dimensions.width / 2 + MARGIN), MARGIN - this.questionDetailsDim.height / 2 + dimensions.height / 2);
                    question.multipleButton.position(dimensions.width / 2 + MARGIN, MARGIN - this.questionDetailsDim.height / 2 + dimensions.height / 2);
                    question.uniqueButton.onClick(() => question.setMultipleChoice(false));
                    question.multipleButton.onClick(() => question.setMultipleChoice(true));
                    question.setMultipleChoice(question.multipleChoice);
                    /** TODO récupérer multipleChoice du modèle Question **/
                    question.typeManipulator.add(question.uniqueButton.component).add(question.multipleButton.component);
                    question.answersDimension.height -= dimensions.height;
                };
                var _displayTextArea = () => {
                    let dimensions = {
                        width: this.questionDetailsDim.width - 2 * MARGIN,
                        height: this.questionDetailsDim.height * 1 / 6 - 2 * MARGIN
                    }
                    question.textArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, question.label || "Enoncé de la question " + question.index);
                    question.textAreaManipulator.set(0, question.textArea.component);
                    question.textArea.font('Arial', 15);
                    question.textArea.anchor('center');
                    question.textArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                    question.textAreaManipulator.move(0, -this.questionDetailsDim.height / 2 + dimensions.height / 2 + 2 * MARGIN + BUTTON_HEIGHT);
                    question.answersDimension.height -= dimensions.height;
                };
                var _displayAnswers = () => {
                    question.answers.forEach((answer, index) => {
                        let answerDisplayElement = this.newAnswerBlock(question, answer, index);
                        question.answersManipulator.add(answerDisplayElement.manipulator);
                    });
                }

                question.answersDimension = {
                    width: this.questionDetailsDim.width - 2 * MARGIN,
                    height: this.questionDetailsDim.height - 2 * MARGIN
                }
                _newQuestionObject();
                _displayBloc();
                _displayType();
                _displayTextArea();
                _displayAnswers();
                return question;
            }
            return _createBlock(question, index);
        }

        newAnswerBlock(question, answer, index) {
            var _newAnswerObject = () => {
                var _initManipulators = () => {
                    answer.manipulator = new Manipulator(this).addOrdonator(4);
                }
                var _initInfos = () => {
                    answer.index = index;
                }
                _initManipulators();
                _initInfos();
            };
            var _displayTextArea = () => {
                var _addExplanationPen = () => {
                    answer.explanationPenManipulator = new Manipulator(this);
                    answer.linesManipulator = new Manipulator(this);
                    answer.penManipulator = new Manipulator(this);
                    var _toggleExplanation = () => {
                        var _createPopInExplanation = (editable) => {
                            let popInExplanation = {label: " "};
                            var _initManipulators = () => {
                                popInExplanation.manipulator = new Manipulator(this).addOrdonator(1);
                                popInExplanation.closeButtonManipulator = new Manipulator(this);
                                // popInExplanation.manipulator.set(2, popInExplanation.closeButtonManipulator);
                                popInExplanation.panelManipulator = new Manipulator(this);
                                popInExplanation.textManipulator = new Manipulator(this);
                                // popInExplanation.panelManipulator.set(1, popInExplanation.textManipulator);
                                popInExplanation.manipulator.add(popInExplanation.panelManipulator);
                            };
                            var _initExplanation = () => {
                                // popInExplanation.answer = answer;
                                popInExplanation.editable = editable;
                                if (popInExplanation.editable) {
                                    popInExplanation.draganddropText = "Glisser-déposer une image ou une vidéo de la bibliothèque ici";
                                    popInExplanation.defaultLabel = "Cliquer ici pour ajouter du texte";
                                }
                                if (answer.explanation && answer.explanation.label) {
                                    popInExplanation.label = answer.explanation.label;
                                }
                                if (answer.explanation && answer.explanation.image) {
                                    popInExplanation.image = answer.explanation.image;
                                }
                                if (answer.explanation && answer.explanation.video) {
                                    popInExplanation.video = answer.explanation.video;
                                }
                                answer.filled = popInExplanation.image || popInExplanation.video || popInExplanation.label;
                            }


                            _initManipulators();
                            _initExplanation();
                            popInExplanation.display = () => {
                                var _initPopIn = () => {
                                    var _removeSetupVideo = () => {
                                        // this.answer.model.editor && this.answer.model.editor.puzzle && this.answer.model.editor.puzzle.elementsArray.forEach(answerElement => {
                                        //     answerElement.obj && answerElement.obj.video && drawings.component.remove(answerElement.obj.video);
                                        // });
                                        // this.answer.model.parentQuestion.tabAnswer.forEach(answer => {
                                        //     answer.model.video && drawings.component.remove(answer.model.video.miniature);
                                        // });
                                    }
                                    const rect = new svg.Rect(dimensions.width, dimensions.height)
                                        .color(myColors.white, 1, myColors.black);
                                    rect._acceptDrop = popInExplanation.editable;
                                    // parent.manipulator.add(this.manipulator);
                                    popInExplanation.manipulator.set(0, rect);
                                    // popInExplanation.manipulator.move(0, y);
                                    popInExplanation.manipulator.move(0, 0);
                                    _removeSetupVideo();
                                }
                                var _displayExplanation = () => {
                                    var _definePanel = () => {
                                        let panelWidth = (dimensions.width - 2 * MARGIN) * 3 / 4, panelHeight = dimensions.height - 2 * MARGIN;
                                        popInExplanation.panel = new gui.Panel(panelWidth, panelHeight, myColors.white);
                                        popInExplanation.panel.border.color([], 1, [0, 0, 0]);
                                        popInExplanation.panel.back.mark('explanationPanel');
                                        popInExplanation.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
                                        popInExplanation.panelManipulator.set(0, popInExplanation.panel.component);
                                        popInExplanation.panelManipulator.move(dimensions.width * 1 / 8, 0);
                                    };
                                    var _displayText = () => {
                                        let textToDisplay = popInExplanation.label ? popInExplanation.label : (popInExplanation.defaultLabel ? popInExplanation.defaultLabel : "");
                                        popInExplanation.text = new svg.Text(textToDisplay)
                                            .dimension(popInExplanation.panel.width, 0)
                                            //.position(panelWidth / 2 + MARGIN * 2, MARGIN * 2)
                                            .font("Arial", 20)
                                            .mark('textExplanation');
                                        popInExplanation.textManipulator.set(0, popInExplanation.text);
                                    }
                                    var _displayTextArea = () => {
                                        let panelWidth = (dimensions.width - 2 * MARGIN) * 3 / 4, panelHeight = dimensions.height - 2 * MARGIN;
                                        let textToDisplay = popInExplanation.label ? popInExplanation.label : (popInExplanation.defaultLabel ? popInExplanation.defaultLabel : "");
                                        popInExplanation.text = new gui.TextArea(0, 0, panelWidth, panelHeight, textToDisplay)
                                            .font("Arial", 20)
                                            .anchor("center")
                                            .color(myColors.white, 1, myColors.black);
                                        // this.text.text.parentObject = this.text;
                                        popInExplanation.text.text.mark('textExplanation');
                                        popInExplanation.textManipulator.set(0, popInExplanation.text.component);

                                        popInExplanation.text.onInput((oldMessage, message) => {
                                            popInExplanation.label = message;
                                            popInExplanation.display();
                                        })
                                    }

                                    _definePanel();
                                    if (this.editable) {
                                        _displayTextArea();
                                    } else {
                                        _displayText();
                                    }
                                };
                                var _drawGreyCross = (size) => {
                                    var _crossHandler = () => {
                                        drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
                                        runtime.speechSynthesisCancel();
                                        popInExplanation.editable && (parent.explanation = false);
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

                                let dimensions = {
                                    width: this.width / QUESTIONS_PER_LINE,
                                    height: this.height * 1 / 6 - 2 * MARGIN
                                }

                                _initPopIn();
                                _displayExplanation();
                            }

                            return popInExplanation;
                        }
                        // if (answer.explanation) {                           // modele or state
                        //     // answer.checkBoxManipulator.remove(checked);
                        //     answer.explanation = false;                     // modele or state
                        // } else {
                        //     // answer.checkBoxManipulator.add(checked);
                        //     answer.explanation = true;                      // modele or state
                        // }
                        //     if (!answer.explanation) answer.explanation = classContainer.createClass("PopInVue", this, true);
                        //     let questionCreator = this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                        //     this.popIn.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                        //     questionCreator.explanation = this.popIn;
                        if (!answer.explanation.label || !answer.explanation.manipulator) {
                            answer.explanation = _createPopInExplanation(true);    // modele or state
                        }
                        // console.log(answer.explanation + 'help me !');
                        answer.manipulator.set(3, answer.explanation.manipulator);
                        answer.explanation.display();
                    }

                    let iconExplanation = IconCreator.createExplanationIcon(answer.manipulator, 1);
                    iconExplanation.position(dimensions.width / 2 - iconExplanation.getContentSize() * 2 / 3, dimensions.height / 2 - iconExplanation.getContentSize() / 2);
                    iconExplanation.addEvent('click', _toggleExplanation);

                }
                var _addValidCheckbox = () => {
                    answer.checkBoxManipulator = new Manipulator(this);
                    var _toggleChecked = () => {
                        if (answer.checked) {                           // modele or state
                            answer.checkBoxManipulator.remove(checked);
                            answer.checked = false;                     // modele or state
                        } else {
                            answer.checkBoxManipulator.add(checked);
                            answer.checked = true;                      // modele or state
                        }
                    }
                    let checkbox = new svg.Rect(CHECKBOX_SIZE, CHECKBOX_SIZE).color(myColors.white, 2, myColors.black);
                    let checked = drawCheck(checkbox.x, checkbox.y, CHECKBOX_SIZE);
                    answer.checkBoxManipulator.addEvent('click', _toggleChecked);
                    answer.checkBoxManipulator.add(checkbox).move(-dimensions.width / 2 + CHECKBOX_SIZE, -MARGIN + CHECKBOX_SIZE * 2);
                    answer.manipulator.set(2, answer.checkBoxManipulator);
                }
                let dimensions = {
                        width: question.answersDimension.width / ANSWERS_PER_LINE - MARGIN,
                        height: 70
                    },
                    indexX = Math.floor(index % ANSWERS_PER_LINE),
                    indexY = Math.floor(index / ANSWERS_PER_LINE),
                    y = dimensions.height / 2,
                    x = MARGIN / 2 + dimensions.width / 2 - question.answersDimension.width / 2;

                answer.textArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, answer.label || "Réponse");
                answer.manipulator.set(0, answer.textArea.component);
                answer.textArea.font('Arial', 15);
                answer.textArea.anchor('center');
                answer.textArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                answer.manipulator.move(x + indexX * (dimensions.width + MARGIN), y * indexY + (dimensions.height + MARGIN) * indexY);
                _addExplanationPen();
                _addValidCheckbox();
            }

            _newAnswerObject();
            _displayTextArea();
            return answer;
        }


        getFormationLabel() {
            return this.presenter.getFormationLabel();
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        getQuestions() {
            return this.presenter.getQuestions();
        }

        selectQuestion(index) {
            if (this.selectedQuestionIndex >= 0) this.questions[this.selectedQuestionIndex].unselect();
            this.selectedQuestionIndex = index;
            this.questionDetailsManipulator
                .set(1, this.questions[index].typeManipulator)
                .set(2, this.questions[index].textAreaManipulator)
                .set(3, this.questions[index].answersManipulator);
        }

        refresh() {

        }
    }

    return QuizAdminV;
}