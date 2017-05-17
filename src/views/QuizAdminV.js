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
        CHECKBOX_SIZE = 15,
        IMAGES_PER_LINE = 3,
        EXPLANATION_DEFAUT_TEXT = "Cliquer ici pour ajouter du texte";

    class QuizAdminV extends View {
        constructor(presenter) {
            super(presenter);
            let _createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(BUTTON_WIDTH + 2 * MARGIN, BUTTON_HEIGHT - 5, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5, 5);
                this.returnButton.text.font('Arial', 20).position(0, 6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width / 2 + MARGIN, this.header.height + this.returnButton.height / 2 + MARGIN);
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-BUTTON_WIDTH / 2, 0);
                this.returnButtonManipulator.add(chevron);
                this.manipulator.add(this.returnButtonManipulator);
            }
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.questionsBlockManipulator = new Manipulator(this).addOrdonator(1);
                this.questionDetailsManipulator = new Manipulator(this).addOrdonator(4);
                this.questionsBlockChevronManipulator = new Manipulator(this);
                this.questionsBlockManipulator.add(this.questionsBlockChevronManipulator);

                this.titleManipulator = new Manipulator(this).addOrdonator(2);
                this.mediasLibraryManipulator = new Manipulator(this).addOrdonator(3);
                this.previewButtonManipulator = new Manipulator(this).addOrdonator(1);
                this.saveQuizButtonManipulator = new Manipulator(this).addOrdonator(1);

                this.manipulator
                    .add(this.questionsBlockManipulator)
                    .add(this.questionDetailsManipulator)
                    .add(this.titleManipulator)
                    .add(this.mediasLibraryManipulator)
                    .add(this.previewButtonManipulator)
                    .add(this.saveQuizButtonManipulator)
                    .add(this.header.getManipulator());
            };
            var _initMediaLibrary = () => {
                // this.library = classContainer.createClass('MediaLibraryVue');
            }

            this.label = this.getLabel();
            this.questionsBlockChevron = {};

            _declareManipulator();
            _createReturnButton();
            _initMediaLibrary();
        }

        display() {
            var _resetDrawings = () => {
                drawings.component.clean();
                this.questionsBlockManipulator.flush();
                this.questionDetailsManipulator.flush();
                drawing.manipulator.set(0, this.manipulator);
                this.width = drawing.width - 2 * MARGIN;
                this.height = drawing.height - drawing.height * HEADER_SIZE;
            }
            var _updateHeader = () => {
                let buttonSize = 20;
                let formationLabel = this.getFormationLabel();
                this.header.display(formationLabel + " - " + this.label);
                currentY += buttonSize + MARGIN;
            }
            var _displayTitleArea = () => {
                let dimensions = {
                    width: this.width * 1 / 4,
                    height: BUTTON_HEIGHT
                }
                let titleTextArea = new gui.TextField(0, 0, dimensions.width, dimensions.height, this.label);
                titleTextArea.font('Arial', 15);
                titleTextArea.text.position(-titleTextArea.width / 2 + MARGIN, 7.5);
                titleTextArea.control.placeHolder('Titre du quiz');
                titleTextArea.onInput((oldMessage, message, valid) => {
                    if (!message || !oldMessage) {
                        titleTextArea.text.message('Titre du quiz');
                    }
                    titleTextArea.text.position(-titleTextArea.width / 2 + MARGIN, 7.5);
                });
                titleTextArea.color([myColors.lightgrey, 1, myColors.black]);
                this.titleManipulator.set(0, titleTextArea.component);
                this.titleManipulator.move(MARGIN + dimensions.width / 2, currentY + dimensions.height / 2);
                this.quizTitleField = titleTextArea;

                let saveIcon = new util.Picture('../../images/save.png', false, this,'',null);
                saveIcon.draw(titleTextArea.width/2 + 12.5 + MARGIN, 0, 25,25, this.titleManipulator, 1);
                svg.addEvent(saveIcon.imageSVG, 'click', this.renameQuiz.bind(this));
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
                let mediasPanel = new gui.Panel(dimensions.width, dimensions.height);
                mediasPanel.border.color(myColors.none, 1, myColors.grey).corners(5, 5);
                let titleLibrary = new svg.Text('Médias').color(myColors.grey).font('Arial', 25).anchor('left');
                titleLibrary.position(-0.85 * mediasPanel.width / 2, -mediasPanel.height / 2 + 8.33);
                this.mediasLibraryManipulator.set(2, titleLibrary);
                let titleLibraryBack = new svg.Rect(titleLibrary.boundingRect().width + 2 * MARGIN, 3).color(myColors.white);
                titleLibraryBack.position(-0.85 * mediasPanel.width / 2 + titleLibrary.boundingRect().width / 2,
                    -mediasPanel.height / 2);
                this.mediasLibraryManipulator.set(0, mediasPanel.component);
                this.mediasLibraryManipulator.set(1, titleLibraryBack);
                this.mediasLibraryManipulator.move(mediasPanel.width / 2 + MARGIN, currentY + mediasPanel.height / 2);

                let imageWidth = (dimensions.width - 2 * MARGIN) / IMAGES_PER_LINE - (IMAGES_PER_LINE - 1) / IMAGES_PER_LINE * MARGIN;
                let imagesManipulator = new Manipulator(this);
                this.mediasLibraryManipulator.add(imagesManipulator);
                imagesManipulator.move(-dimensions.width / 2 + imageWidth / 2 + MARGIN, -dimensions.height / 2 + imageWidth / 2 + MARGIN)
                this.getImages().then((images) => {
                    images.images.forEach((image, index) => {
                        let indexX = Math.floor(index % IMAGES_PER_LINE);
                        let indexY = Math.floor(index / IMAGES_PER_LINE);
                        let picture = new svg.Image(image.imgSrc);
                        picture
                            .dimension(imageWidth, imageWidth)
                            .position(indexX * (imageWidth + MARGIN), indexY * (imageWidth + MARGIN))
                        imagesManipulator.add(picture);
                    })
                })
            };
            var _displayQuestionDetails = () => {
                let dimensions = {
                    width: this.width * 4 / 5,
                    height: drawing.height - currentY - (2 * MARGIN + BUTTON_HEIGHT)
                }
                this.questionDetailsDim = dimensions;
                let border = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 1, myColors.black);
                this.questionDetailsManipulator.set(0, border);
                this.questionDetailsManipulator.move(this.width - dimensions.width / 2 + MARGIN, currentY + dimensions.height / 2);
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
                saveButton.onClick(this._updateQuizData.bind(this));
                this.saveQuizButtonManipulator.set(0, saveButton.component);
                this.saveQuizButtonManipulator.move(this.width / 2 + dimensions.width / 2 + MARGIN, currentY + dimensions.height / 2);
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
            this._displayQuestionsBlock();
            this._loadQuestionsDetail();
            this.questionsBlock.length >= 1 && this.questionsBlock[0].select();
        }

        displayMessage(message){
            let messageText = new svg.Text(message).font('Arial', 20);
            messageText.position(drawing.width/2, this.header.height + 20);
            this.manipulator.add(messageText);
            svg.timeout(()=>{
                this.manipulator.remove(messageText);
            }, 3000);
        }


        _displayQuestionsBlock() {
            var calculatePositionOfQuestion = (index) =>{
                let pos = { x: dimensionsChevronQuestion.w + MARGIN*2 - this.width / 2
                        + dimensionsQuestionButton.width / 2 + index * (dimensionsQuestionButton.width + MARGIN),
                    y : 0
                }
                return pos;
            };
            var _displayQuestionBlock = (question, lastQuestionIndex) => {
                var _initQuestionBlock = () => {
                    questionGui.index = lastQuestionIndex;
                    questionGui.unselect = () => {
                        if (questionGui.selected) {
                            questionGui.selected = false;
                            questionGui.questionButton.color([myColors.white, 1, myColors.black]);
                        }
                    };
                    questionGui.select = () => {
                        if (!questionGui.selected) {
                            questionGui.selected = true;
                            questionGui.questionButton.color([[43, 120, 228], 1, myColors.black]);
                            this.selectQuestion(questionGui.index);
                        }
                    };
                }
                var _initGuiBlock = () => {
                    var _deleteQuestion = () => {
                        if(this.selectedQuestionIndex === questionGui.index){
                            if(questionGui.index > 0){
                                this.questionsBlock[questionGui.index - 1].select();
                            }else if(this.questionsBlock.length > 1){
                                this.questionsBlock[questionGui.index + 1].select();
                            }else {
                                this.unselectQuestion();
                            }
                        }
                        this.questions.splice(questionGui.index, 1);
                        this.questionsBlockManipulator.remove(this.questionsBlock[questionGui.index].manipulator);
                        this.questionsBlock.splice(questionGui.index, 1);
                        this.questionDetailsManipulator.remove(this.questionsDetail[questionGui.index].manipulator);
                        this.questionsDetail.splice(questionGui.index, 1);
                        for(let i = questionGui.index; i < this.questionsBlock.length; i++){
                            if(this.selectedQuestionIndex === this.questionsBlock[i].index) this.selectedQuestionIndex = i;
                            this.questionsBlock[i].index = i;
                            let pos = calculatePositionOfQuestion(this.questionsBlock[i].index);
                            this.questionsBlock[i].manipulator.move(pos.x, pos.y);
                        }
                        let pos = calculatePositionOfQuestion(this.questions.length);
                        this.addNewQuestion.manipulator.move(pos.x, pos.y);
                    }

                    questionGui.manipulator = new Manipulator(this).addOrdonator(2);
                    questionGui.questionButton = new gui.Button(
                        dimensionsQuestionButton.width,
                        dimensionsQuestionButton.height,
                        [myColors.white, 1, myColors.black], 
                        question.label
                    );
                    questionGui.questionButton.back.corners(5, 5);
                    questionGui.questionButton.onClick(() => questionGui.select());
                    questionGui.manipulator.add(questionGui.questionButton.component);

                    let pos = calculatePositionOfQuestion(questionGui.index);
                    questionGui.manipulator.move(pos.x, pos.y);
                    questionGui.redCross = IconCreator.createRedCrossIcon(questionGui.manipulator)
                        .position(dimensionsQuestionButton.width/2, -dimensionsQuestionButton.height/2)
                        .addEvent('click', () => _deleteQuestion());
                };
                var _displayBlock = () => {
                    this.questionsBlock.push(questionGui);
                    this.questionsBlockManipulator.add(questionGui.manipulator);
                }

                let questionGui = {};
                _initQuestionBlock();
                _initGuiBlock();
                _displayBlock();
                return questionGui;
            };
            var _displayNewQuestionBlock = () => {
                let onClickOnAddNewQuestion = () => {
                    this.lastQuestionIndex++;
                    let question = {label: "Question " + this.lastQuestionIndex};
                    let index = this.questions.push(question) - 1;
                    let questionGui = _displayQuestionBlock(question, index);
                    let questionInDetail = this._loadOneQuestionInDetail(question, index);
                    this.questionsDetail.add(questionInDetail);
                    questionGui.select();
                    let pos = calculatePositionOfQuestion(this.questions.length);
                    this.addNewQuestion.manipulator.move(pos.x, pos.y);
                };

                this.addNewQuestion = {};
                this.addNewQuestion.manipulator = new Manipulator(this).addOrdonator(2);
                this.addNewQuestion.questionButton = new gui.Button(dimensionsQuestionButton.width, dimensionsQuestionButton.height, [myColors.white, 1, myColors.black], "");
                this.addNewQuestion.questionButton.back.corners(5, 5);
                this.addNewQuestion.manipulator.set(0, this.addNewQuestion.questionButton.component);
                let pos = calculatePositionOfQuestion(this.questions.length);
                this.addNewQuestion.manipulator.move(pos.x, pos.y);
                let iconAddNewQuestion =  IconCreator.createPlusIcon(this.addNewQuestion.manipulator, 1);
                iconAddNewQuestion.addEvent('click', () => onClickOnAddNewQuestion());
                this.addNewQuestion.questionButton.onClick(() => onClickOnAddNewQuestion());
                this.questionsBlockManipulator.add(this.addNewQuestion.manipulator);
            };
            var _initChevron = () => {
                let posXRightChevron = this.width/2 - dimensionsChevronQuestion.w + MARGIN;

                this.questionsBlockChevron.right = new svg.Chevron( dimensionsChevronQuestion.w, dimensionsChevronQuestion.h, 20, "E");
                this.questionsBlockChevron.right.color(myColors.grey, 1 , myColors.black).position(posXRightChevron, 0);

                this.questionsBlockChevron.left = new svg.Chevron( dimensionsChevronQuestion.w, dimensionsChevronQuestion.h, 20, "W");
                this.questionsBlockChevron.left.color(myColors.grey, 1 , myColors.black).position(-posXRightChevron, 0);

                this.questionsBlockChevronManipulator.add(this.questionsBlockChevron.right);
                this.questionsBlockChevronManipulator.add(this.questionsBlockChevron.left);
            };

            this.questionsBlock = [];
            this.questions = this.getQuestions();
            this.lastQuestionIndex = this.getLastQuestionIndex();

            let dimensionsQuestionButton = {
                width: this.width / QUESTIONS_PER_LINE,
                height: this.height * 1 / 6 - 2 * MARGIN
            };

            let dimensionsChevronQuestion = {
                w: (this.width - Math.floor(this.width/(dimensionsQuestionButton.width + MARGIN)) * (dimensionsQuestionButton.width + MARGIN) - MARGIN*3)/2,
                h: dimensionsQuestionButton.height - MARGIN,
            };


            this.questions.forEach((itQuestion, i) => {
                _displayQuestionBlock(itQuestion, i);
            });


            _displayNewQuestionBlock();
            _initChevron();
        }

        _loadOneQuestionInDetail(question, index){
            let questionDetail = {};

            questionDetail.answersDimension = {
                width: this.questionDetailsDim.width - 2 * MARGIN,
                height: this.questionDetailsDim.height - 2 * MARGIN
            };

            var _declareManipulatorQuestionDetail = (questionGui) => {
                questionGui.typeManipulator = new Manipulator(this).addOrdonator(2);
                questionGui.textAreaManipulator = new Manipulator(this).addOrdonator(1);
                questionGui.answersManipulator = new Manipulator(this).addOrdonator(1);
                questionGui.explanationManipulator = new Manipulator(this);

                questionGui.guiManipulator = new Manipulator(this).addOrdonator(4)
                    .set(0, questionGui.typeManipulator)
                    .set(1, questionGui.textAreaManipulator)
                    .set(2, questionGui.answersManipulator)
                    .set(3, questionGui.explanationManipulator)
            };
            var _displayToggleTypeResponse = (questionGui, question) => {
                let dimensions = {
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT
                }
                questionGui.uniqueButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], "Réponse unique");
                questionGui.multipleButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], 'Réponses multiples');
                questionGui.uniqueButton.position(-(dimensions.width / 2 + MARGIN), MARGIN - this.questionDetailsDim.height / 2 + dimensions.height / 2);
                questionGui.multipleButton.position(dimensions.width / 2 + MARGIN, MARGIN - this.questionDetailsDim.height / 2 + dimensions.height / 2);

                questionGui.setMultipleChoice = (isMultiple) => {
                    if (isMultiple) {
                        questionGui.uniqueButton.color([myColors.white, 1, myColors.black]);
                        questionGui.multipleButton.color([[43, 120, 228], 1, myColors.black])
                    } else {
                        questionGui.uniqueButton.color([[43, 120, 228], 1, myColors.black]);
                        questionGui.multipleButton.color([myColors.white, 1, myColors.black]);
                    }
                    questionGui.multipleChoice = !!isMultiple; //convert to Boolean
                };

                questionGui.uniqueButton.onClick(() => questionGui.setMultipleChoice(false));
                questionGui.multipleButton.onClick(() => questionGui.setMultipleChoice(true));
                questionGui.setMultipleChoice(question.multipleChoice);
                /** TODO récupérer multipleChoice du modèle Question **/
                questionGui.typeManipulator.add(questionGui.uniqueButton.component).add(questionGui.multipleButton.component);
                questionGui.answersDimension.height -= dimensions.height;
            };
            var _displayTextArea = (questionGui, index, question) => {
                let dimensions = {
                    width: this.questionDetailsDim.width - 2 * MARGIN,
                    height: this.questionDetailsDim.height * 1 / 6 - 2 * MARGIN
                }
                questionGui.textArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, question.label);
                questionGui.textAreaManipulator.set(0, questionGui.textArea.component);
                questionGui.textArea.font('Arial', 15);
                questionGui.textArea.anchor('center');
                questionGui.textArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                questionGui.textAreaManipulator.move(0, -this.questionDetailsDim.height / 2 + dimensions.height / 2 + 2 * MARGIN + BUTTON_HEIGHT);
                questionGui.answersDimension.height -= dimensions.height;
            };
            var _loadAnswerBlockForOneQuestion = (questionGui, questionIndex, question) => {
                var _calculatePositionAnswer = (questionGui, indexReponse) => {
                    let pos = {
                            width: questionGui.answersDimension.width / ANSWERS_PER_LINE - MARGIN,
                            height: 70,
                            indexX: Math.floor(indexReponse % ANSWERS_PER_LINE),
                            indexY: Math.floor(indexReponse / ANSWERS_PER_LINE),
                            y: 70 / 2,
                            x: MARGIN / 2 + (questionGui.answersDimension.width / ANSWERS_PER_LINE - MARGIN) / 2
                                - questionGui.answersDimension.width / 2
                        }
                    let realPos = {x: pos.x + pos.indexX * (pos.width + MARGIN),
                     y : pos.y * pos.indexY + (pos.height + MARGIN) * pos.indexY}
                    return realPos;
                }
                var _loadOneAnswerBlock = (answer, index) => {
                    var _initGui = (answerGui, index) => {
                        var _initManipulators = () => {
                            answerGui.manipulator = new Manipulator(this).addOrdonator(5);
                            questionGui.answersManipulator.add(answerGui.manipulator);
                        }
                        var _initInfos = () => {
                            answerGui.index = index;
                        }
                        _initManipulators();
                        _initInfos();
                    };
                    var _initAnswerTextArea = (answerGui, answerLabel, index) => {
                        answerGui.textArea = new gui.TextArea(0, 0, dimensions.w, dimensions.h, answerLabel || "Réponse");
                        answerGui.manipulator.set(0, answerGui.textArea.component);
                        //answerGui.iconRedCross.addEvent('click', answerGui.iconRedCross.onClickRedCross);

                        answerGui.textArea.font('Arial', 15).anchor('center');
                        answerGui.textArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                        let pos = _calculatePositionAnswer(questionGui, index);
                        answerGui.manipulator.move(pos.x, pos.y);
                    };
                    var _initRedCross = (answerGui) =>{
                        answerGui.iconRedCross = IconCreator.createRedCrossIcon(answerGui.manipulator, 3);
                        answerGui.iconRedCross.position(dimensions.w/2, -dimensions.h/2);
                        answerGui.iconRedCross.onClickRedCross = () => {
                            let indexAnswer = answerGui.index;
                            questionGui.answersManipulator.remove(answerGui.manipulator);
                            questionGui.answersGui.splice(indexAnswer, 1);
                            for(var i = indexAnswer; i< questionGui.answersGui.length; i++){
                                questionGui.answersGui[i].index = i;
                            }

                            questionGui.answersGui.forEach( (ele, index) => {
                                let pos = _calculatePositionAnswer(questionGui, index);
                                ele.manipulator.move(pos.x, pos.y);
                            });
                            let posAddNewReponse = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);
                            questionGui.addNewResponseManip.move(posAddNewReponse.x, posAddNewReponse.y);
                            _attachRedCrossForAnswer(questionGui.answersGui);
                            if(questionGui.answersGui.length < 8){
                                questionGui.answersManipulator.add(questionGui.addNewResponseManip);
                                let pos = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);
                                questionGui.addNewResponseManip.move(pos.x, pos.y);
                            }
                        };
                    };

                    var _addExplanationPen = (answerGui) => {
                        var _createExplanationPopUp = () => {
                            var _createRedCross = () => {
                                var _closeExplanation = () =>{
                                    questionGui.explanationManipulator.remove(answerGui.popUpExplanation.manipulator);
                                };

                                let iconRedCross = IconCreator.createRedCrossIcon(popUpExplanation.manipulator, 2);
                                iconRedCross.position(dimExplanation.w/2, -dimExplanation.h/2);
                                iconRedCross.addEvent('click', _closeExplanation );
                            };
                            var _drawTitle = () => {
                                popUpExplanation.textTitle = new svg.Text("").font('Arial', 25).color(myColors.grey);
                                titleManip.add(popUpExplanation.textTitle).move(0, -dimExplanation.h/2 + 50);
                            };
                            var _drawContent = () => {
                                var _drawTextExplanation = () => {
                                    var _onModificationText = () => {
                                        if(popUpExplanation.textExplanation.textMessage != EXPLANATION_DEFAUT_TEXT){
                                            answerGui.iconExplanation.activeStatusActionIcon();
                                            answerGui.iconExplanation.showActualBorder();
                                        }
                                    };

                                    popUpExplanation.textExplanation = new gui.TextArea(0, 0, dimensionContent.w*2/3 - MARGIN,
                                        dimensionContent.h - MARGIN, EXPLANATION_DEFAUT_TEXT);
                                    popUpExplanation.textExplanation.font('Arial', 20)
                                        .frame.color(myColors.white, 0, myColors.black);
                                    popUpExplanation.textExplanation.position(dimensionContent.w/6 - MARGIN, 0);
                                    popUpExplanation.textExplanation.onBlur(_onModificationText);


                                    contentManip.add(popUpExplanation.textExplanation.component);
                                };
                                var _drawMediaPic = () => {
                                    popUpExplanation.media = new svg.Image("../images/quiz/media.png");
                                    popUpExplanation.media.dimension(dimensionContent.w/6, dimensionContent.w/6);
                                    popUpExplanation.media.position(-dimensionContent.w/2 + popUpExplanation.media.width, 0 );
                                    contentManip.add(popUpExplanation.media);
                                };

                                let contentRect = new svg.Rect(dimensionContent.w, dimensionContent.h )
                                    .color(myColors.white, 1, myColors.grey).corners(MARGIN);
                                contentManip.add(contentRect);

                                _drawTextExplanation();
                                _drawMediaPic();
                            };

                            let dimExplanation = { w: this.questionDetailsDim.width , h: this.questionDetailsDim.height};
                            let dimensionContent = {
                                w: dimExplanation.w - MARGIN *2, h: dimExplanation.h /2
                            };

                            let popUpExplanation = {};

                            let mediaManipulator = new Manipulator(popUpExplanation).addOrdonator(2);

                            let titleManip = new Manipulator(popUpExplanation).addOrdonator(1);
                            let contentManip = new Manipulator(popUpExplanation);
                            contentManip.add(mediaManipulator);

                            popUpExplanation.manipulator = new Manipulator(popUpExplanation).addOrdonator(3);
                            popUpExplanation.manipulator.add(titleManip);
                            popUpExplanation.manipulator.add(contentManip);

                            let panel = new svg.Rect(dimExplanation.w, dimExplanation.h)
                                .color(myColors.white, 2, myColors.black);
                            popUpExplanation.manipulator.set(0, panel);

                            _createRedCross();
                            _drawTitle();
                            _drawContent();

                            popUpExplanation.setTextTitle = function (msg) {
                                this.textTitle.message("Explication de la réponse : " + msg);
                            };


                            return popUpExplanation;
                        };


                        answerGui.explanationPenManipulator = new Manipulator(this);
                        answerGui.linesManipulator = new Manipulator(this);
                        answerGui.penManipulator = new Manipulator(this);

                        
                        var _toggleExplanation = () => {
                            answerGui.popUpExplanation.setTextTitle(answerGui.textArea.textMessage);
                            questionGui.explanationManipulator.add(answerGui.popUpExplanation.manipulator);
                        };
                        answerGui.popUpExplanation =  _createExplanationPopUp();


                        answerGui.iconExplanation = IconCreator.createExplanationIcon(answerGui.manipulator, 1);
                        answerGui.iconExplanation.position(dimensions.w / 2 - answerGui.iconExplanation.getContentSize() * 2 / 3, 0);
                        answerGui.iconExplanation.addEvent('click', _toggleExplanation);
                    };
                    var _addValidCheckbox = (answerGui) => {
                        answerGui.checkBoxManipulator = new Manipulator(this);
                        var _toggleChecked = () => {
                            if (answerGui.checked) {                           // modele or state
                                answerGui.checkBoxManipulator.remove(checked);
                                answerGui.checked = false;                     // modele or state
                            } else {
                                answerGui.checkBoxManipulator.add(checked);
                                answerGui.checked = true;                      // modele or state
                            }
                        }
                        let checkbox = new svg.Rect(CHECKBOX_SIZE, CHECKBOX_SIZE).color(myColors.white, 2, myColors.black);
                        let checked = drawCheck(checkbox.x, checkbox.y, CHECKBOX_SIZE);
                        answerGui.checkBoxManipulator.addEvent('click', _toggleChecked);
                        answerGui.checkBoxManipulator.add(checkbox).move(-dimensions.w / 2 + CHECKBOX_SIZE, -MARGIN + CHECKBOX_SIZE * 2);
                        answerGui.manipulator.set(2, answerGui.checkBoxManipulator);
                    };

                    let answerGui = {};

                    _initGui(answerGui, index);
                    _initAnswerTextArea(answerGui, answer.label, index);
                    _initRedCross(answerGui);
                    _addExplanationPen(answerGui);
                    _addValidCheckbox(answerGui);

                    return answerGui;
                };
                var _createAddNewResponse = () => {
                    var clickOnAddNewResponse = () => {
                        if (questionGui.answersGui.length < 8) {
                            let answerGui = _loadOneAnswerBlock({}, questionGui.answersGui.length);
                            questionGui.answersGui.push(answerGui);
                            _attachRedCrossForAnswer(questionGui.answersGui);

                            if (questionGui.answersGui.length == 8) {
                                questionGui.answersManipulator.remove(questionGui.addNewResponseManip);
                            }else{
                                let pos = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);
                                questionGui.addNewResponseManip.move(pos.x, pos.y);
                            }
                        }
                    };

                    questionGui.addNewResponseManip = new Manipulator(this).addOrdonator(2);
                    let pos = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);

                    let addNewResponseButton
                        = new gui.Button(dimensions.w, dimensions.h, [myColors.white, 1, myColors.black], "");
                    questionGui.addNewResponseManip.set(0, addNewResponseButton.component);

                    questionGui.addNewResponseManip.move(pos.x, pos.y);
                    IconCreator.createPlusIcon(questionGui.addNewResponseManip, 1);

                    questionGui.answersManipulator.add(questionGui.addNewResponseManip);
                    questionGui.addNewResponseManip.addEvent('click', () => clickOnAddNewResponse());
                };
                var _attachRedCrossForAnswer = (answersGui) =>{
                    if(answersGui.length >= 3){
                        answersGui.forEach(ele => {
                            ele.iconRedCross.addEvent('click', ele.iconRedCross.onClickRedCross);
                            ele.manipulator.set(3, ele.iconRedCross.manipulator);
                        });
                    }else{
                        answersGui.forEach(ele => {
                            ele.manipulator.unset(3);
                        });
                    }
                }

                let dimensions =  {
                    w: questionGui.answersDimension.width / ANSWERS_PER_LINE - MARGIN,
                    h: 70
                };

                if(!question.answers || question.answers.length < 1){
                    question.answers = [{label: ""}, {label: ""}]
                }

                questionGui.answersGui = [];
                question.answers.forEach((answer, index) => {
                    let answerGui = _loadOneAnswerBlock(answer, index);
                    questionGui.answersGui.push(answerGui);
                });

                _createAddNewResponse();
                _attachRedCrossForAnswer(questionGui.answersGui);

            };


            _declareManipulatorQuestionDetail(questionDetail);
            _displayToggleTypeResponse(questionDetail, question);
            _displayTextArea(questionDetail, index, question);
            _loadAnswerBlockForOneQuestion(questionDetail, index, question);

            return questionDetail;
        }

        _loadQuestionsDetail(){
            this.questionsDetail = [];
            let questions = this.getQuestions();

            questions.forEach((itQuestion, i) => {
                let questionDetail = this._loadOneQuestionInDetail(itQuestion, i);
                this.questionsDetail.add(questionDetail);
            });
        }


        createQuiz(quizData) {
            return this.presenter.createQuiz(quizData);
        }

        getFormationLabel() {
            return this.presenter.getFormationLabel();
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        // getNewAnswers() {
        //     let answers = [];
        //     return answers;
        // }

        getNewLabel() {
            return this.titleManipulator.get(0).children['1'].getMessageText();
        }

        getNewQuestions() {
            let questionsDetail = this.questionsDetail,
                questions = [];
            questionsDetail.forEach(question => {
                questions.push(
                    {
                        label: question.textArea.textMessage,
                        multipleChoice: question.multipleChoice,
                        answers: question.answers
                    }
                );
            });
            return questions;
        }

        getImages() {
            return this.presenter.getImages();
        }

        getQuestions() {
            return this.presenter.getQuestions();
        }
        getLastQuestionIndex(){
            return this.presenter.getLastQuestionIndex();
        }

        _updateQuizData() {
            let quizData = {
                label: this.getNewLabel(),
                questions: this.getNewQuestions(),
            }
            this.updateQuiz(quizData);
        }

        renameQuiz() {
            this.presenter.renameQuiz(this.quizTitleField.textMessage).then(status=>{
                if (status.ack == 'ok'){
                    let formationLabel = this.getFormationLabel();
                    this.label = this.getLabel();
                    this.header.display(formationLabel + " - " + this.label);
                }
            });
        }

        selectQuestion(index) {
            if (this.selectedQuestionIndex >= 0) this.questionsBlock[this.selectedQuestionIndex].unselect();
            this.selectedQuestionIndex = index;
            this.questionDetailsManipulator
                .set(1, this.questionsDetail[index].guiManipulator);
        }
        unselectQuestion(){
            if (this.selectedQuestionIndex >= 0) this.questionsBlock[this.selectedQuestionIndex].unselect();
            this.selectedQuestionIndex = -1;
            this.questionDetailsManipulator.unset(1);
        }

        refresh() {

        }
    }

    return QuizAdminV;
}