/**
 * Created by DMA3622 on 05/05/2017.
 */
exports.QuizAdminV = function (globalVariables) {
    const util = globalVariables.util,
        View = globalVariables.View,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        BUTTON_SIZE = {w: 40, h: 30},
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        Tool = globalVariables.Tool,
        IconCreator = Tool.IconCreator,
        ListManipulatorView = Tool.ListManipulatorView,
        installDnD = gui.installDnD,
        BUTTON_WIDTH = 250,
        BUTTON_HEIGHT = 30,
        ANSWERS_PER_LINE = 4,
        CHECKBOX_SIZE = 15,
        IMAGES_PER_LINE = 3,
        QUESTION_BUTTON_SIZE = {w: 200, h: 90},
        EXPLANATION_DEFAULT_TEXT = "Cliquer ici pour ajouter du texte";

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
                this.mainManip = new Manipulator(this).addOrdonator(2);
            }
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.questionsBlockManipulator = new Manipulator(this).addOrdonator(1);
                this.questionDetailsManipulator = new Manipulator(this).addOrdonator(4);


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
                var _renameWhenEnter = (event) => {
                    if(event.keyCode === 13){
                        this.renameQuiz();
                        titleTextArea.hideControl();
                    }
                }

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
                });
                titleTextArea.onBlur(() => {
                    titleTextArea.text.position(-titleTextArea.width / 2 + MARGIN, 7.5);
                })
                titleTextArea.color([myColors.lightgrey, 1, myColors.black]);
                titleTextArea.mark('quizTitle');
                this.titleManipulator.set(0, titleTextArea.component);
                this.titleManipulator.move(MARGIN + dimensions.width / 2, currentY + dimensions.height / 2);
                this.quizTitleField = titleTextArea;

                let saveIcon = new svg.Image('../../images/save.png');
                this.titleManipulator.add(saveIcon);
                saveIcon
                    .dimension(25, 25)
                    .position(titleTextArea.width / 2 + 12.5 + MARGIN, 0)
                    .mark('saveNameButton');
                svg.addEvent(saveIcon, 'click', this.renameQuiz.bind(this));
                svg.addGlobalEvent('keydown', _renameWhenEnter);
                currentY += dimensions.height + MARGIN;
            }
            var _displayQuestionsHeader = () => {
                let dimensions = {
                    width: this.width,
                    height: this.height * 1 / 6
                };

                this.questionsBlockListView = new ListManipulatorView([], 'H',
                    dimensions.width - 100, dimensions.height, 50, 80,
                    QUESTION_BUTTON_SIZE.w, QUESTION_BUTTON_SIZE.h, 10, myColors.white, 10);

                this.questionsBlockManipulator.set(0, this.questionsBlockListView.manipulator);
                this.questionsBlockManipulator.move(MARGIN + dimensions.width / 2, currentY + dimensions.height / 2);
                currentY += dimensions.height + MARGIN;
            }
            var _displayMediaLibrary = () => {
             //   this.mediasLibraryManipulator.flush();
              // this.mainManip.set(1, this.mediasLibraryManipulator);

                let dimensions = {
                    width: this.width * 1 / 5 - MARGIN,
                    height: drawing.height - currentY - (2 * MARGIN + BUTTON_HEIGHT)
                };

                let mediasPanel = new gui.Panel(dimensions.width - 2* MARGIN , dimensions.height - 4* MARGIN );
                mediasPanel.border.color(myColors.none, 1, myColors.black).corners(5, 5);

                let rectWhite = new svg.Rect(5000,5000).color(myColors.white,1,myColors.white).position(mediasPanel.width/2, mediasPanel.height/2);
                let titleLibrary = new svg.Text('Médias').color(myColors.grey).font('Arial', 25).anchor('left');
                titleLibrary.position(-0.85 * mediasPanel.width / 2, -mediasPanel.height / 2 + 8.33);
                this.mediasLibraryManipulator.set(2, titleLibrary);
                let titleLibraryBack = new svg.Rect(titleLibrary.boundingRect().width + 2 * MARGIN, 3).color(myColors.white);
                titleLibraryBack.position(-0.85 * mediasPanel.width / 2 + titleLibrary.boundingRect().width / 2,
                    -mediasPanel.height / 2);
                let addPictureButton = new gui.Button(3*BUTTON_SIZE.w,BUTTON_SIZE.h,[myColors.customBlue,0,myColors.none ],'Ajouter une image')
                    .position( dimensions.width /2 - BUTTON_SIZE.w*3/2 -2*MARGIN ,dimensions.height/2-BUTTON_SIZE.h/2 +2*MARGIN);
                addPictureButton.text.font('Arial', 13, 12).color(myColors.white).position(0,4.33);
                Tool.resizeStringForText(addPictureButton.text, 3*BUTTON_SIZE.w - MARGIN, BUTTON_SIZE.h);
                addPictureButton.component.add(addPictureButton.text);
                mediasPanel.add(rectWhite);
                this.mediasLibraryManipulator.set(0, mediasPanel.component);
                this.mediasLibraryManipulator.set(1, titleLibraryBack);

                this.mediasLibraryManipulator.move(mediasPanel.width / 2 + MARGIN, currentY + mediasPanel.height / 2 );

                const onChangeFileExplorerHandler = () => {
                    uploadFiles(fileExplorer.component.files)
                };

                var uploadFiles = (files) => {
                    var _progressDisplayer = () => {
                        var _displayUploadIcon = manipulator => {
                            let icon = drawUploadIcon({x: -w / 2, y: 5, size: 20});
                            manipulator.set(0, icon);
                        }
                        var _displayRect = manipulator => {
                            let rect = new svg.Rect(w * 0.7, 16).color(myColors.none, 1, myColors.darkerGreen);
                            manipulator.set(1, rect);
                        }

                        let manipulator = new Manipulator().addOrdonator(4);
                        _displayUploadIcon(manipulator);
                        _displayRect(manipulator);
                        this.videosUploadManipulators.push(manipulator);

                        return (e) => {
                            var _displayProgressBar = manipulator => {
                                const progwidth = w * e.loaded / e.total;
                                const bar = new svg.Rect(progwidth - 15, 14)
                                    .color(myColors.green)
                                    .position(-(w - progwidth) / 2, 0);
                                manipulator.set(2, bar);
                            }
                            var _displayPercentage = manipulator => {
                                const percentage = new svg.Text(Math.round(e.loaded / e.total * 100) + "%");
                                percentage.position(0, percentage.boundingRect().height / 4);
                                manipulator.set(3, percentage);
                            }

                            _displayProgressBar(manipulator);
                            _displayPercentage(manipulator);
                            if (e.loaded === e.total) {
                                this.videosUploadManipulators.remove(manipulator);
                            }
                        };
                    };

                    for (let file of files) {
                        let progressDisplay;
                        this.selectedTab = 0;
                        if (file.type === 'video/mp4') {
                            this.selectedTab = 1;
                            progressDisplay = _progressDisplayer();
                        }
                        this.presenter.uploadImage(file, progressDisplay).then(() => {
                            this.displayMediaLibrary(mediasPanel, imageWidth);
                        });
                    }
                };


                let fileExplorer;
                const fileExplorerHandler = () => {
                    if (!fileExplorer) {
                        let globalPointCenter ={x:drawing.w/2, y:drawing.h/2};
                        var fileExplorerStyle = {
                            leftpx: globalPointCenter.x,
                            toppx: globalPointCenter.y,
                            width: this.w / 5,
                            height: this.w / 5
                        };
                        fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
                        fileExplorer.type("file");
                        svg.addEvent(fileExplorer, "change", onChangeFileExplorerHandler);
                        svg.runtime.attr(fileExplorer.component, "accept", "image/*, video/mp4");
                        svg.runtime.attr(fileExplorer.component, "id", "fileExplorer");
                        svg.runtime.attr(fileExplorer.component, "hidden", "true");
                        svg.runtime.attr(fileExplorer.component, "multiple", "true");
                        drawings.component.add(fileExplorer);
                        fileExplorer.fileClick = function () {
                            svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
                        }
                    }
                    fileExplorer.fileClick();
                };

                addPictureButton.onClick(fileExplorerHandler);
                svg.addEvent(addPictureButton.text, 'click', fileExplorerHandler);


                let imageWidth = (dimensions.width - 2 * MARGIN) / IMAGES_PER_LINE - (IMAGES_PER_LINE - 1) / IMAGES_PER_LINE * MARGIN;
                let imagesManipulator = new Manipulator(this);
                mediasPanel.content.add(imagesManipulator.first);
                this.mediasLibraryManipulator.add(imagesManipulator);
                this.mediasLibraryManipulator.add(addPictureButton.component);
                imagesManipulator.move(-dimensions.width / 2 + imageWidth / 2 + MARGIN, -dimensions.height / 2 + imageWidth / 2 + MARGIN)
                this.displayMediaLibrary(mediasPanel, imageWidth)
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
                previewButton.onClick(this.previewQuiz.bind(this));
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
                saveButton.onClick(this.updateQuiz.bind(this));
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
            if(this.selectedQuestionIndex){
                this.questionsBlockListView.get(this.selectedQuestionIndex).select();
            }else {
                this.questionsBlockListView.length >= 2 && this.questionsBlockListView.get(0).select();
            }
        }

        displayMediaLibrary(panel, imageWidth){
            this.getImages().then((images) => {
                let conf = {
                    drop: (what, whatParent, x, y) => {
                        this._dropMediaAction(what.components[0], whatParent, x, y);
                        return {x: what.x, y: what.y, parent: whatParent};
                    },
                    moved: (what) => {
                        what.flush();
                        return true;
                    }
                };

                images.images.forEach((image, index) => {
                    var createDraggableCopy = (pic) => {
                        let picManip = new Manipulator(this).addOrdonator(1);
                        let point = pic.globalPoint(0, 0);
                        picManip.move(point.x, point.y);


                        let picCopy = pic.duplicate(pic);
                        picManip.set(0, picCopy);
                        drawings.piste.add(picManip);

                        installDnD(picManip, drawings.component.glass.parent.manipulator.last, conf);
                        svg.event(drawings.component.glass, "mousedown", event);
                    };

                    let indexX = Math.floor(index % IMAGES_PER_LINE);
                    let indexY = Math.floor(index / IMAGES_PER_LINE);
                    let picture = new svg.Image(image.imgSrc);
                    picture
                        .dimension(imageWidth, imageWidth)
                    let picManip = new Manipulator(this);
                    picManip.move(indexX * (imageWidth + MARGIN/2) + imageWidth/2, indexY * (imageWidth + MARGIN))
                    picManip.add(picture);

                    panel.content.add(picManip.component);


                    picture.onMouseDown(() => createDraggableCopy(picture));
                })
            })
        }

        _dropMediaAction(item, parent, x, y) {
            if (this.selectedQuestionIndex >= 0 && this.selectedQuestionIndex < this.questionsBlockListView.length) {
                let globalPoints = parent.globalPoint(x, y);
                let target = this.questionsDetail[this.selectedQuestionIndex].guiManipulator
                    .last.getTarget(globalPoints.x, globalPoints.y);

                if (target) {
                    if (target instanceof svg.Image && !target.id && target.id != "explanation") {
                        target.url(item.src);
                    }

                }
            }
        }

        displayMessage(message) {
            let messageText = new svg.Text(message).font('Arial', 20);
            messageText.position(drawing.width / 2, this.header.height + 20);
            messageText.mark('infoMessage');
            this.manipulator.add(messageText);
            svg.timeout(() => {
                this.manipulator.remove(messageText);
            }, 3000);
        }



        _displayQuestionsBlock() {
            var _displayQuestionBlock = (question, lastQuestionIndex) => {
                var _initBlock = (questionManip) => {
                    var _deleteQuestion = () => {
                        if (this.selectedQuestionIndex === questionManip.index) {
                            if (questionManip.index > 0) {
                                this.questionsBlockListView.get(questionManip.index - 1).select();
                            } else if (this.questionsBlockListView.length > 2) {
                                this.questionsBlockListView.get(questionManip.index + 1).select();
                            } else {
                                this.unselectQuestion();
                            }
                        }
                        this.questions.splice(questionManip.index, 1);
                        this.questionsBlockListView.removeElementFromList(questionManip);
                        this.questionDetailsManipulator.remove(this.questionsDetail[questionManip.index].manipulator);
                        this.questionsDetail.splice(questionManip.index, 1);

                        for (let i = questionManip.index; i < this.questionsBlockListView.length; i++) {
                            if (this.selectedQuestionIndex === this.questionsBlockListView.get(i).index) this.selectedQuestionIndex = i;
                            this.questionsBlockListView.get(i).index = i;
                        }

                        this.questionsBlockListView.refreshListView();
                    };

                    let questionButton = new gui.Button(
                        QUESTION_BUTTON_SIZE.w, QUESTION_BUTTON_SIZE.h,
                        [myColors.white, 1, myColors.black], question.label
                    );

                    questionManip.index = lastQuestionIndex;
                    questionManip.unselect = () => {
                        if (questionButton.selected) {
                            questionButton.selected = false;
                            questionButton.color([myColors.white, 1, myColors.black]);
                        }
                    };
                    questionManip.select = () => {
                        if (!questionButton.selected) {
                            questionButton.selected = true;
                            questionButton.color([[43, 120, 228], 1, myColors.black]);
                            this.selectQuestion(questionManip.index);
                        }
                    };
                    questionManip.buttonText = questionButton.text;

                    questionButton.back.corners(5, 5);
                    questionButton.onClick(() => questionManip.select());
                    questionManip.add(questionButton.component);

                    IconCreator.createRedCrossIcon(questionManip)
                        .position(QUESTION_BUTTON_SIZE.w / 2, -QUESTION_BUTTON_SIZE.h / 2)
                        .mark('questionRedCross'+lastQuestionIndex)
                        .addEvent('click', () => _deleteQuestion());
                };
                var _displayBlock = () => {
                    this.questionsBlockListView.addManipInIndex(questionManip, lastQuestionIndex);
                }

                let questionManip = new Manipulator(this).addOrdonator(2);
                questionManip.mark('questionBlock'+lastQuestionIndex);
                _initBlock(questionManip);
                _displayBlock();

                return questionManip;
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
                    this.questionsBlockListView.refreshListView();
                    this.setLastQuestionIndex(this.lastQuestionIndex);
                };

                let addNewQuestionManip = new Manipulator(this).addOrdonator(2);
                let questionButton = new gui.Button(QUESTION_BUTTON_SIZE.w, QUESTION_BUTTON_SIZE.h, [myColors.white, 1, myColors.black], "");
                questionButton.back.corners(5, 5);
                addNewQuestionManip.set(0, questionButton.component);

                let iconAddNewQuestion = IconCreator.createPlusIcon(addNewQuestionManip, 1);
                iconAddNewQuestion.addEvent('click', () => onClickOnAddNewQuestion());
                questionButton.onClick(() => onClickOnAddNewQuestion());
                questionButton.glass.mark('newQuestionButton');

                this.questionsBlockListView.add(addNewQuestionManip);
            };

            this.questionsBlockListView.empty();
            this.questions = this.getQuestions();
            this.lastQuestionIndex = this.getLastQuestionIndex();
            this.questions.forEach((itQuestion, i) => {
                _displayQuestionBlock(itQuestion, i);
            });
            _displayNewQuestionBlock();
            this.questionsBlockListView.refreshListView();
        }


        _loadOneQuestionInDetail(question, index) {
            let questionDetail = {};

            questionDetail.answersDimension = {
                width: this.questionDetailsDim.width - 2 * MARGIN,
                height: this.questionDetailsDim.height - 2 * MARGIN
            };

            var _declareManipulatorQuestionDetail = (questionGui) => {
                questionGui.typeManipulator = new Manipulator(this).addOrdonator(2);
                questionGui.textAreaManipulator = new Manipulator(this).addOrdonator(3);
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
                var _setQuestionBlockTitle = (oldMessage, newMessage) => {
                    let questionManip = this.questionsBlockListView.get(this.selectedQuestionIndex);
                    questionManip.buttonText.message(newMessage);
                }

                let dimensions = {
                    width: this.questionDetailsDim.width - 2 * MARGIN,
                    height: this.questionDetailsDim.height / 4 - 2 * MARGIN
                };

                let titleArea = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 1, myColors.black);
                questionGui.textAreaManipulator.set(0, titleArea);

                questionGui.textArea = new gui.TextArea(0, 0, dimensions.width * 6 / 8, dimensions.height - MARGIN, question.label);
                questionGui.textAreaManipulator.set(1, questionGui.textArea.component);

                let sizePicture = dimensions.height - MARGIN;

                questionGui.textAreaPicture = new svg.Image((question.imageSrc) ? question.imageSrc : "../images/quiz/newImage.png");
                questionGui.textAreaPicture.dimension(sizePicture, sizePicture)
                    .position(-questionGui.textArea.width / 2 - (titleArea.width - questionGui.textArea.width) / 4, 0);

                questionGui.textAreaManipulator.add(questionGui.textAreaPicture);
                questionGui.textArea.font('Arial', 15);
                questionGui.textArea.anchor('center');
                questionGui.textArea.frame.color(myColors.none, 0, myColors.none).fillOpacity(1);
                questionGui.textArea.onInput(_setQuestionBlockTitle);
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
                    let realPos = {
                        x: pos.x + pos.indexX * (pos.width + MARGIN),
                        y: pos.y * pos.indexY + (pos.height + MARGIN) * pos.indexY
                    }
                    return realPos;
                }
                var _loadOneAnswerBlock = (answer, index) => {
                    var _initGui = (answerGui, index) => {
                        var _initManipulators = () => {
                            answerGui.manipulator = new Manipulator(this).addOrdonator(5);
                            answerGui.manipulator.mark('answer'+index);
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
                    var _initRedCross = (answerGui) => {
                        answerGui.iconRedCross = IconCreator.createRedCrossIcon(answerGui.manipulator, 3);
                        answerGui.iconRedCross.mark('answerRedCross'+answerGui.index);
                        answerGui.iconRedCross.position(dimensions.w / 2, -dimensions.h / 2);
                        answerGui.iconRedCross.onClickRedCross = () => {
                            let indexAnswer = answerGui.index;
                            questionGui.answersManipulator.remove(answerGui.manipulator);
                            questionGui.answersGui.splice(indexAnswer, 1);
                            for (var i = indexAnswer; i < questionGui.answersGui.length; i++) {
                                questionGui.answersGui[i].index = i;
                            }

                            questionGui.answersGui.forEach((ele, index) => {
                                let pos = _calculatePositionAnswer(questionGui, index);
                                ele.manipulator.move(pos.x, pos.y);
                            });
                            let posAddNewReponse = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);
                            questionGui.addNewResponseManip.move(posAddNewReponse.x, posAddNewReponse.y);
                            _attachRedCrossForAnswer(questionGui.answersGui);
                            if (questionGui.answersGui.length < 8) {
                                questionGui.answersManipulator.add(questionGui.addNewResponseManip);
                                let pos = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);
                                questionGui.addNewResponseManip.move(pos.x, pos.y);
                            }
                        };
                    };

                    var _addExplanationPen = (answerGui) => {
                        var _createExplanationPopUp = () => {
                            var _createRedCross = () => {
                                var _closeExplanation = () => {
                                    questionGui.explanationManipulator.remove(answerGui.popUpExplanation.manipulator);
                                };

                                let iconRedCross = IconCreator.createRedCrossIcon(popUpExplanation.manipulator, 2);
                                iconRedCross.position(dimExplanation.w / 2, -dimExplanation.h / 2);
                                iconRedCross.addEvent('click', _closeExplanation);
                            };
                            var _drawTitle = () => {
                                popUpExplanation.textTitle = new svg.Text("").font('Arial', 25).color(myColors.grey);
                                titleManip.add(popUpExplanation.textTitle).move(0, -dimExplanation.h / 2 + 50);
                            };
                            var _drawContent = () => {
                                var _drawTextExplanation = () => {
                                    var _onModificationText = () => {
                                        if (popUpExplanation.textExplanation.textMessage != EXPLANATION_DEFAULT_TEXT) {
                                            answerGui.iconExplanation.activeStatusActionIcon();
                                            answerGui.iconExplanation.showActualBorder();
                                        }
                                    };
                                    if (!answerGui.explanation) {
                                        answerGui.explanation = {label: EXPLANATION_DEFAULT_TEXT};
                                    }
                                    popUpExplanation.textExplanation = new gui.TextArea(0, 0, dimensionContent.w * 2 / 3 - MARGIN,
                                        dimensionContent.h - MARGIN, answerGui.explanation.label);
                                    popUpExplanation.textExplanation.font('Arial', 20)
                                        .frame.color(myColors.white, 0, myColors.black);
                                    popUpExplanation.textExplanation.position(dimensionContent.w / 6 - MARGIN, 0);
                                    popUpExplanation.textExplanation.onBlur(_onModificationText);
                                    popUpExplanation.textExplanation.mark('explanationText');


                                    contentManip.add(popUpExplanation.textExplanation.component);
                                };
                                var _drawMediaPic = () => {
                                    popUpExplanation.media = new svg.Image((answer.explanation && answer.explanation.imageSrc) ? answer.explanation.imageSrc : "../images/quiz/newImage.png");
                                    popUpExplanation.media.dimension(dimensionContent.w / 6, dimensionContent.w / 6);
                                    popUpExplanation.media.position(-dimensionContent.w / 2 + popUpExplanation.media.width, 0);
                                    contentManip.add(popUpExplanation.media);
                                };

                                let contentRect = new svg.Rect(dimensionContent.w, dimensionContent.h)
                                    .color(myColors.white, 1, myColors.grey).corners(MARGIN);
                                contentManip.add(contentRect);

                                _drawTextExplanation();
                                _drawMediaPic();
                            };

                            let dimExplanation = {w: this.questionDetailsDim.width, h: this.questionDetailsDim.height};
                            let dimensionContent = {
                                w: dimExplanation.w - MARGIN * 2, h: dimExplanation.h / 2
                            };

                            let popUpExplanation = {};

                            let mediaManipulator = new Manipulator(popUpExplanation).addOrdonator(2);

                            let titleManip = new Manipulator(popUpExplanation).addOrdonator(1);
                            let contentManip = new Manipulator(popUpExplanation);
                            contentManip.add(mediaManipulator);

                            popUpExplanation.manipulator = new Manipulator(popUpExplanation).addOrdonator(3);
                            popUpExplanation.manipulator.mark('explanation');
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
                        answerGui.popUpExplanation = _createExplanationPopUp();


                        answerGui.iconExplanation = IconCreator.createExplanationIcon(answerGui.manipulator, 1);
                        answerGui.iconExplanation.mark("explanationButton"+answerGui.index);
                        answerGui.iconExplanation.position(dimensions.w / 2 - answerGui.iconExplanation.getContentSize() * 2 / 3, 0);
                        answerGui.iconExplanation.addEvent('click', _toggleExplanation);

                    };
                    var _addValidCheckbox = (answerGui) => {
                        answerGui.checkBoxManipulator = new Manipulator(this);
                        answerGui.checkBoxManipulator.mark("answerCheckbox"+answerGui.index);
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
                        let checked = util.drawCheck(checkbox.x, checkbox.y, CHECKBOX_SIZE);
                        answerGui.checkBoxManipulator.addEvent('click', _toggleChecked);
                        answerGui.checkBoxManipulator.add(checkbox).move(-dimensions.w / 2 + CHECKBOX_SIZE, -MARGIN + CHECKBOX_SIZE * 2);
                        if (answerGui.checked) {
                            answerGui.checkBoxManipulator.add(checked);
                        }
                        answerGui.manipulator.set(2, answerGui.checkBoxManipulator);
                    };

                    let answerGui = {checked: answer.correct, explanation: answer.explanation};

                    _initGui(answerGui, index);
                    _initAnswerTextArea(answerGui, answer.label, index);
                    _initRedCross(answerGui);
                    _addExplanationPen(answerGui);
                    _addValidCheckbox(answerGui);
                    if (answerGui.explanation.label != EXPLANATION_DEFAULT_TEXT) {
                        answerGui.iconExplanation.activeStatusActionIcon();
                        answerGui.iconExplanation.showActualBorder();
                    }

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
                            } else {
                                let pos = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);
                                questionGui.addNewResponseManip.move(pos.x, pos.y);
                            }
                        }
                    };

                    questionGui.addNewResponseManip = new Manipulator(this).addOrdonator(2);
                    questionGui.addNewResponseManip.mark('addAnswerButton');
                    let pos = _calculatePositionAnswer(questionGui, questionGui.answersGui.length);

                    let addNewResponseButton
                        = new gui.Button(dimensions.w, dimensions.h, [myColors.white, 1, myColors.black], "");
                    questionGui.addNewResponseManip.set(0, addNewResponseButton.component);

                    questionGui.addNewResponseManip.move(pos.x, pos.y);
                    IconCreator.createPlusIcon(questionGui.addNewResponseManip, 1);

                    questionGui.answersManipulator.add(questionGui.addNewResponseManip);
                    questionGui.addNewResponseManip.addEvent('click', () => clickOnAddNewResponse());
                };
                var _attachRedCrossForAnswer = (answersGui) => {
                    if (answersGui.length >= 3) {
                        answersGui.forEach(ele => {
                            ele.iconRedCross.addEvent('click', ele.iconRedCross.onClickRedCross);
                            ele.manipulator.set(3, ele.iconRedCross.manipulator);
                        });
                    } else {
                        answersGui.forEach(ele => {
                            ele.manipulator.unset(3);
                        });
                    }
                }

                let dimensions = {
                    w: questionGui.answersDimension.width / ANSWERS_PER_LINE - MARGIN,
                    h: 70
                };

                if (!question.answers || question.answers.length < 1) {
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

        _loadQuestionsDetail() {
            this.questionsDetail = [];
            let questions = this.getQuestions();

            questions.forEach((itQuestion, i) => {
                let questionDetail = this._loadOneQuestionInDetail(itQuestion, i);
                this.questionsDetail.add(questionDetail);
            });
        }

        getFormationLabel() {
            return this.presenter.getFormationLabel();
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        getNewAnswers(questionElementVue) {
            let answers = [];
            questionElementVue.answersGui.forEach(answerGui => {
                let answer = {
                    correct: answerGui.checked ? true : false,
                    label: answerGui.textArea.textMessage,
                    explanation: {label: answerGui.popUpExplanation.textExplanation.textMessage}
                };

                if (answerGui.popUpExplanation.media.src != "../images/quiz/newImage.png") {
                    answer.explanation.imageSrc = answerGui.popUpExplanation.media.src;
                }

                answers.push(answer);
            });

            return answers;
        }

        getNewLabel() {
            return this.titleManipulator.get(0).children['1'].getMessageText();
        }

        getNewQuestions() {
            let questionsDetail = this.questionsDetail,
                questions = [];
            questionsDetail.forEach(questionElementVue => {
                questionElementVue.answers = this.getNewAnswers(questionElementVue);

                let question = {
                    label: questionElementVue.textArea.textMessage,
                    multipleChoice: questionElementVue.multipleChoice,
                    answers: questionElementVue.answers
                };

                if (questionElementVue.textAreaPicture.src != "../images/quiz/newImage.png") {
                    question.imageSrc = questionElementVue.textAreaPicture.src;
                }

                questions.push(question);
            });
            return questions;
        }

        getImages() {
            return this.presenter.getImages();
        }

        getQuestions() {
            return this.presenter.getQuestions();
        }

        getLastQuestionIndex() {
            return this.presenter.getLastQuestionIndex();
        }

        previewQuiz(){
            this.updateQuiz();
            this.presenter.previewQuiz(this.selectedQuestionIndex);
        }

        setLastQuestionIndex(index){
            this.presenter.setLastQuestionIndex(index);
        }

        renameQuiz() {
            this.presenter.renameQuiz(this.quizTitleField.textMessage).then(status => {
                status.message && this.displayMessage(status.message);
                if (status.saved) {
                    let formationLabel = this.getFormationLabel();
                    this.label = this.getLabel();
                    this.header.display(formationLabel + " - " + this.label);
                }
            }).catch(error => {
                console.log(error);
                this.displayMessage(error);
            });
        }

        selectQuestion(index) {
            if (this.selectedQuestionIndex >= 0 && this.selectedQuestionIndex !== index)
                this.questionsBlockListView.get(this.selectedQuestionIndex).unselect();
            this.selectedQuestionIndex = index;
            this.questionDetailsManipulator.set(1, this.questionsDetail[index].guiManipulator);
        }

        unselectQuestion() {
            if (this.selectedQuestionIndex >= 0) this.questionsBlockListView.get(this.selectedQuestionIndex).unselect();
            this.selectedQuestionIndex = -1;
            this.questionDetailsManipulator.unset(1);
        }

        updateQuiz() {
            let quizData = {
                label: this.getNewLabel(),
                questions: this.getNewQuestions(),
            }
            this.presenter.updateQuiz(quizData).then((data)=>{
                data.message && this.displayMessage(data.message);
            }).catch((error)=>{
                console.log(error);
                this.displayMessage(error);
            })
        }

        resize() {

        }
    }

    return QuizAdminV;
}