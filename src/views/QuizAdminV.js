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
        IMAGES_PER_LINE = 3;

    class QuizAdminV extends View {
        constructor(presenter) {
            super(presenter);
            let _createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(BUTTON_WIDTH + 2*MARGIN, BUTTON_HEIGHT-5 , [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5,5);
                this.returnButton.text.font('Arial', 20).position(0,6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width/2 + MARGIN,this.header.height + this.returnButton.height/2 + MARGIN);
                let chevron = new svg.Chevron(10,20,3,'W').color(myColors.grey);
                chevron.position(-BUTTON_WIDTH/2 , 0);
                this.returnButtonManipulator.add(chevron);
                this.manipulator.add(this.returnButtonManipulator);
            }
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.questionsBlockManipulator = new Manipulator(this).addOrdonator(1);
                this.questionDetailsManipulator = new Manipulator(this).addOrdonator(4);
                this.titleManipulator = new Manipulator(this).addOrdonator(1);
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
                imagesManipulator.move(- dimensions.width/2 + imageWidth/2 + MARGIN, -dimensions.height/2 + imageWidth/2 + MARGIN)
                this.getImages().then((images)=> {
                    images.images.forEach((image, index)=>{
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
            //_displayQuestions();
            this._displayQuestionBlock();
            this._loadQuestionDetail();
            this.questionsBlock.length > 1 && this.questionsBlock[0].select();
        }


        _displayQuestionBlock() {
            var _loadOneQuestionInBlock = (question, questionIndex) => {
                let questionBlock = {};

                var _initQuestionBlock = (questionGui, index) => {
                    questionGui.manipulator = new Manipulator(this).addOrdonator(2);
                    questionGui.index = index;
                    questionGui.unselect = () => {
                        if (questionGui.selected) {
                            questionGui.selected = false;
                            questionGui.questionButton.color([myColors.white, 1, myColors.black]);
                        }
                    };
                    questionGui.select = () => {
                        //this._loadQuestionDetail();
                        if (!questionGui.selected) {
                            questionGui.selected = true;
                            questionGui.questionButton.color([[43, 120, 228], 1, myColors.black]);
                            this.selectQuestion(questionGui.index);
                        }
                    };
                }
                var _initGuiBlock = (questionGui, question) => {
                    questionGui.questionButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], question.label || "Question " + questionGui.index);
                    questionGui.questionButton.back.corners(5, 5);
                    questionGui.questionButton.onClick(() => questionGui.select());
                    questionGui.manipulator.add(questionGui.questionButton.component);
                    questionGui.manipulator.move(MARGIN - this.width / 2 + dimensions.width / 2 + questionGui.index * (dimensions.width + MARGIN), 0);
                };
                _initQuestionBlock(questionBlock, questionIndex);
                _initGuiBlock(questionBlock, question);

                //todo deplacer questionsDetails
                this.questionsBlock.splice(questionIndex, 0, questionBlock);
                if (questionIndex <= this.questionsBlock.length) {
                    for (let i = questionIndex + 1; i < this.questionsBlock.length; i++) {
                        this.questionsBlock[i].index = i;
                        this.questionsBlock[i].manipulator
                            .move(MARGIN - this.width / 2 + dimensions.width / 2 + i * (dimensions.width + MARGIN), 0);
                    }
                }
                this.questionsBlockManipulator.add(questionBlock.manipulator);
            };

            var _createAddNewQuestion = () => {
                let onClickOnAddNewQuestion = () => {
                    let question = {label: ""};
                    let index = this.questionsBlock.length - 1;
                    _loadOneQuestionInBlock(question, index);
                    let questionInDetail = this._loadOneQuestionInDetail(question, index);
                    this.questionsDetail.splice(index, 0, questionInDetail);
                };

                let addNewQuestion = {};
                addNewQuestion.manipulator = new Manipulator(this).addOrdonator(2);
                addNewQuestion.questionButton = new gui.Button(dimensions.width, dimensions.height, [myColors.white, 1, myColors.black], "");
                addNewQuestion.questionButton.back.corners(5, 5);
                this.questionsBlock.splice(this.questionsBlock.length, 0, addNewQuestion);

                addNewQuestion.manipulator.set(0, addNewQuestion.questionButton.component);
                addNewQuestion.manipulator.move(MARGIN - this.width / 2 + dimensions.width / 2 + questions.length * (dimensions.width + MARGIN), 0);
                let iconAddNewQuestion =  IconCreator.createPlusIcon(addNewQuestion.manipulator, 1);
                iconAddNewQuestion.addEvent('click', () => onClickOnAddNewQuestion());
                addNewQuestion.questionButton.onClick(() => onClickOnAddNewQuestion());

                this.questionsBlockManipulator.add(addNewQuestion.manipulator);
            };


            this.questionsBlock = [];
            let questions = this.getQuestions();
            let dimensions = {
                width: this.width / QUESTIONS_PER_LINE,
                height: this.height * 1 / 6 - 2 * MARGIN
            };

            questions.forEach((itQuestion, i) => {
                _loadOneQuestionInBlock(itQuestion, i);
            });
            _createAddNewQuestion();

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

                questionGui.guiManipulator = new Manipulator(this).addOrdonator(3)
                    .add(questionGui.typeManipulator)
                    .add(questionGui.textAreaManipulator)
                    .add(questionGui.answersManipulator)
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
                questionGui.textArea = new gui.TextArea(0, 0, dimensions.width, dimensions.height, question.label || "Enoncé de la question " + (index + 1));
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
                        };
                    }

                    var _addExplanationPen = (answerGui) => {
                        answerGui.explanationPenManipulator = new Manipulator(this);
                        answerGui.linesManipulator = new Manipulator(this);
                        answerGui.penManipulator = new Manipulator(this);
                        var _toggleExplanation = () => {
                            var _hideAnswers = () => {

                            }
                            // if (!answerGui.explanation.label || !answerGui.explanation.manipulator) {
                            if (!answerGui.explanation) {
                                answerGui.explanation = this.newPopInExplanation(answerGui, true);    // modele or state
                            }
                            // console.log(answer.explanation + 'help me !');
                            answerGui.manipulator.set(4, answerGui.explanation.manipulator);
                            _hideAnswers();
                            answerGui.explanation.display();
                        }

                        let iconExplanation = IconCreator.createExplanationIcon(answerGui.manipulator, 1);
                        iconExplanation.position(dimensions.w / 2 - iconExplanation.getContentSize() * 2 / 3,
                            dimensions.h / 2 - iconExplanation.getContentSize() / 2);
                        iconExplanation.addEvent('click', _toggleExplanation);

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
                        if(questionGui.answersGui.length < 8){
                            let answerGui = _loadOneAnswerBlock({}, questionGui.answersGui.length);
                            questionGui.answersGui.push(answerGui);
                            _attachRedCrossForAnswer(questionGui.answersGui);

                            if(questionGui.answersGui.length == 8){
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

            }


            _declareManipulatorQuestionDetail(questionDetail);
            _displayToggleTypeResponse(questionDetail, question);
            _displayTextArea(questionDetail, index, question);
            _loadAnswerBlockForOneQuestion(questionDetail, index, question);

            return questionDetail;
        }

        _loadQuestionDetail(){
            this.questionsDetail = [];
            let questions = this.getQuestions();

            questions.forEach((itQuestion, i) => {
                let questionDetail = this._loadOneQuestionInDetail(itQuestion, i);
                this.questionsDetail.add(questionDetail);
            });
        }



        newPopInExplanation(answerGui, editable) {
            let popInExplanation = {};
            var _initManipulators = () => {
                popInExplanation.manipulator = new Manipulator(this).addOrdonator(1);
                // popInExplanation.manipulator.set(2, popInExplanation.closeButtonManipulator);
                popInExplanation.closeButtonManipulator = new Manipulator(this);
                popInExplanation.textManipulator = new Manipulator(this).addOrdonator(1);
                popInExplanation.mediaManipulator = new Manipulator(this);
                // popInExplanation.mediaManipulator.set(1, popInExplanation.textManipulator);
                popInExplanation.manipulator.add(popInExplanation.textManipulator);
                popInExplanation.manipulator.add(popInExplanation.mediaManipulator);

            };
            var _initExplanation = () => {
                popInExplanation.editable = editable;
                if (popInExplanation.editable) {
                    popInExplanation.draganddropText = "Glisser-déposer une image ou une vidéo de la bibliothèque ici";
                    popInExplanation.defaultLabel = "Cliquer ici pour ajouter du texte";
                }
                if (answerGui.explanation && answerGui.explanation.label) {
                    popInExplanation.label = answerGui.explanation.label;
                }
                if (answerGui.explanation && answerGui.explanation.image) {
                    popInExplanation.image = answerGui.explanation.image;
                }
                if (answerGui.explanation && answerGui.explanation.video) {
                    popInExplanation.video = answerGui.explanation.video;
                }
                answerGui.filled = popInExplanation.image || popInExplanation.video || popInExplanation.label;
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
                    let explanationRect = new svg.Rect(this.width * 4 / 5 - MARGIN, this.height * 2 / 5 - MARGIN)
                            .color(myColors.white, 1, myColors.black),
                        answerAreaWidth = answerGui.textArea.width + MARGIN,
                        answerAreaHeight = answerGui.textArea.height + MARGIN + answerGui.textArea.height / 2;
                    explanationRect._acceptDrop = popInExplanation.editable;
                    popInExplanation.manipulator.set(0, explanationRect);
                    popInExplanation.manipulator.move(explanationRect.width / 2 - answerGui.textArea.width / 2 - MARGIN - answerAreaWidth * answerGui.indexX,
                        explanationRect.height / 2 - answerGui.textArea.height - MARGIN - answerAreaHeight * answerGui.indexY);
                    _removeSetupVideo();
                };
                var _displayExplanation = () => {
                    var _defineMediaPlaceholder = () => {
                        popInExplanation.dndPlaceholder = new svg.Text(popInExplanation.draganddropText)
                            .font("Arial", 20)
                            .dimension((this.width * 4 / 5 - MARGIN) * 3 / 5, this.height * 1 / 3 - MARGIN);
                        popInExplanation.mediaManipulator.add(popInExplanation.dndPlaceholder);
                        popInExplanation.mediaManipulator.move(-(this.width * 4 / 5 - MARGIN) * 2 / 5 - MARGIN + popInExplanation.dndPlaceholder.width / 2, 0);
                    };
                    var _displayText = () => {
                        let textToDisplay = popInExplanation.label ? popInExplanation.label : popInExplanation.defaultLabel;
                        popInExplanation.text = new svg.Text(textToDisplay)
                            .dimension((this.width * 4 / 5 - MARGIN) * 3 / 5, this.height * 1 / 3 - MARGIN)
                            //.position(panelWidth / 2 + MARGIN * 2, MARGIN * 2)
                            .font("Arial", 20)
                            .mark('textExplanation');
                        popInExplanation.textManipulator.set(0, popInExplanation.text);
                    }
                    var _displayTextArea = () => {
                        let panelWidth = (this.width * 4 / 5 - MARGIN) * 3 / 5, panelHeight = this.height * 1 / 3 - MARGIN; // width et height de explanationRect
                        let textToDisplay = popInExplanation.label ? popInExplanation.label : popInExplanation.defaultLabel;
                        popInExplanation.text = new gui.TextArea(0, 0, panelWidth, panelHeight, textToDisplay)
                            .font("Arial", 20)
                            .anchor("center")
                            .color(myColors.white, 1, myColors.black);
                        // this.text.text.parentObject = this.text;
                        popInExplanation.text.text.mark('textExplanation');
                        popInExplanation.textManipulator.set(0, popInExplanation.text.component);
                        popInExplanation.textManipulator.move((this.width * 4 / 5 - MARGIN) / 5 - MARGIN, 0);
                        popInExplanation.text.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                        popInExplanation.text.onInput((oldMessage, message) => {
                            popInExplanation.label = message;
                            popInExplanation.display();
                        })
                    }

                    _defineMediaPlaceholder();
                    if (popInExplanation.editable) {
                        _displayTextArea();
                    } else {
                        // _displayTextArea();  // previewMode ??? TODO prendre en compte ou pas le mode aperçu ?
                        // _displayText();
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

                _initPopIn();
                _displayExplanation();
            }
            popInExplanation.close = () => {
                var _showAnswers = () => {

                }
                _showAnswers();
            }
            return popInExplanation;
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

        getNewLabel() {
            return this.label;
        }

        getNewQuestions() {
            let questions = this.questionsDetail;
        }

        getImages() {
            return this.presenter.getImages();
        }

        getQuestions() {
            return this.presenter.getQuestions();
        }

        _updateQuizData() {
            let quizData = {
                label : this.getNewLabel(),
                questions : this.getNewQuestions()
            }
            this.createQuiz(quizData);

        }

        selectQuestion(index) {
            if (this.selectedQuestionIndex >= 0) this.questionsBlock[this.selectedQuestionIndex].unselect();
            this.selectedQuestionIndex = index;
            this.questionDetailsManipulator
                .set(1, this.questionsDetail[index].guiManipulator);
        }

        refresh() {

        }
    }

    return QuizAdminV;
}