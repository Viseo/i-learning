/**
 * Created by DMA3622 on 05/05/2017.
 */
exports.QuizAdminV = function (globalVariables) {
    const
        View = globalVariables.View,
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        popUp = globalVariables.popUp,
        IconCreator = globalVariables.Icons.IconCreator,
        ListManipulatorView = globalVariables.Lists.ListManipulatorView,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        drawCheck = globalVariables.Helpers.drawCheck,
        Helpers = globalVariables.Helpers,
        installDnD = gui.installDnD;

    const
        BUTTON_WIDTH = 250,
        BUTTON_HEIGHT = 30,
        ANSWERS_PER_LINE = 4,
        CHECKBOX_SIZE = 15,
        IMAGES_PER_LINE = 3,
        QUESTION_BUTTON_SIZE = {w: 200, h: 90},
        EXPLANATION_DEFAULT_TEXT = "Cliquer ici pour ajouter du texte",
        EXPLANATION_DEFAULT_IMAGESRC = "../images/quiz/newImage.png";

    class QuizAdminV extends View {
        constructor(presenter) {
            super(presenter);
            this.label = this.getLabel();
        }

        display() {
            var _declareManipulator = () => {
                this.questionsBlockManipulator = new Manipulator(this).addOrdonator(1);
                this.questionDetailsManipulator = new Manipulator(this).addOrdonator(4);
                this.titleManipulator = new Manipulator(this).addOrdonator(2);
                this.mediasLibraryManipulator = new Manipulator(this).addOrdonator(3);
                this.previewButtonManipulator = new Manipulator(this).addOrdonator(1);
                this.saveQuizButtonManipulator = new Manipulator(this).addOrdonator(1);
                this.returnButtonManipulator = new Manipulator(this);
                this.manipulator
                    .add(this.questionsBlockManipulator)
                    .add(this.questionDetailsManipulator)
                    .add(this.titleManipulator)
                    .add(this.mediasLibraryManipulator)
                    .add(this.saveQuizButtonManipulator)
                    .add(this.returnButtonManipulator)
                    .add(this.previewButtonManipulator);
            };
            var _resetDrawings = () => {
                this.width = drawing.width - 2 * MARGIN;
                this.height = drawing.height - this.header.height;
            }
            var _updateHeader = () => {
                let formationLabel = this.getFormationLabel();
                this.displayHeader(formationLabel + " - " + this.label);
            }
            var _displayReturnButton = () => {
                this.returnButton = new gui.Button(BUTTON_WIDTH + 2 * MARGIN, BUTTON_HEIGHT - 5, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5, 5);
                this.returnButton.text.font('Arial', 20).position(0, 6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width / 2 + MARGIN, this.header.height + this.returnButton.height / 2 + MARGIN);
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-BUTTON_WIDTH / 2, 0);
                this.returnButtonManipulator.add(chevron).mark('return');
                this.returnButtonManipulator.addEvent('click', this.returnToOldPage.bind(this));
            }
            var _displayTitleArea = () => {
                var _renameWhenEnter = (event) => {
                    if (event.keyCode === 13) {
                        this.renameQuiz();
                        titleTextArea.hideControl();
                    }
                }

                let quizTitleDim = {
                    w: Math.max(this.width * 1 / 4, 300),
                    h: BUTTON_HEIGHT
                };
                let titleTextArea = new gui.TextField(0, 0, quizTitleDim.w, quizTitleDim.h, this.label);
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
                this.titleManipulator.move(MARGIN + titleTextArea.width / 2,
                    this.header.height + this.returnButton.height + titleTextArea.height);
                this.quizTitleField = titleTextArea;

                let saveIcon = new svg.Image('../../images/save.png');
                this.titleManipulator.add(saveIcon);
                saveIcon
                    .dimension(25, 25)
                    .position(titleTextArea.width / 2 + 12.5 + MARGIN, 0)
                    .mark('saveNameButton');
                svg.addEvent(saveIcon, 'click', this.renameQuiz.bind(this));
                svg.addGlobalEvent('keydown', _renameWhenEnter);
            }
            var _displayQuestionsHeader = () => {
                let questionListDim = {
                    w: Math.max(this.width, 1260 ),
                    h: Math.max(this.height * 1 / 6, 100)
                };
                this.questionsBlockListView = new ListManipulatorView([],'H',
                    questionListDim.w, questionListDim.h, 50, 80,
                    QUESTION_BUTTON_SIZE.w, QUESTION_BUTTON_SIZE.h, 10, myColors.white, 10);
                this.questionsBlockListView.mark("listQ")

                this.questionsBlockManipulator.set(0, this.questionsBlockListView.manipulator);
                this.questionsBlockManipulator.move(MARGIN + questionListDim.w / 2,
                    this.header.height + this.returnButton.height + this.quizTitleField.height + questionListDim.h / 2 + 3 * MARGIN);
                return questionListDim;
            };

            var _displayQuestionDetails = () => {
                let questionDetailsDim = {
                    w: Math.max(this.width * 4 / 5, 850),
                    h: Math.max(this.height - this.header.height - this.questionsBlockListView.getListDim().h
                        - this.returnButton.height - this.quizTitleField.height  - BUTTON_HEIGHT - MARGIN,280)
                }
                this.questionDetailsDim = questionDetailsDim;
                let border = new svg.Rect(questionDetailsDim.w, questionDetailsDim.h).color(myColors.white, 1, myColors.black).corners(5, 5);
                this.questionDetailsManipulator.set(0, border);
                this.questionDetailsManipulator.move(this.mediaLibrary.width + questionDetailsDim.w/2 + 2 * MARGIN,
                    questionDetailsDim.h/2 + this.questionsBlockManipulator.y + this.questionsBlockListView.getListDim().h/2 + MARGIN);

            }

            let _createBottomButton = () => {
                let calculateButtonBottomDim = () =>{
                    let dim = {
                        w: BUTTON_WIDTH,
                        h: BUTTON_HEIGHT
                    }
                    dim.x = Math.max(this.width / 2 + dim.w / 2 + MARGIN,this.questionDetailsDim.w/2+ this._calculateLibraryDimension().w);
                    dim.y = this.header.height + this.returnButton.height + this.quizTitleField.height
                        + this.questionsBlockListView.listDim.h + this.questionDetailsDim.h + dim.h / 2 + 5 * MARGIN;
                    return dim;
                }
                let _createButton = (dim, labelButton, markId, clickHandler) => {
                    let button = new gui.Button(dim.w, dim.h, [[43, 120, 228], 1, myColors.black], labelButton);
                    button.glass.mark(markId);
                    button.onClick(clickHandler);
                    return button;
                };

                let dim = calculateButtonBottomDim();
                let previewButton = _createButton(dim, "Aperçu", "previewButton", this.previewQuiz.bind(this));
                this.previewButtonManipulator.set(0, previewButton.component);
                this.previewButtonManipulator.move(dim.x, dim.y);

                let saveButton = _createButton(dim, "Sauvegarder", "saveButtonQuiz", this.updateQuiz.bind(this));
                this.saveQuizButtonManipulator.set(0, saveButton.component);
                this.saveQuizButtonManipulator.move(dim.x+dim.w+ MARGIN , dim.y);
            };

            var _displayToggleMedias = () => {
                let tabsDim = {
                    w: Math.max((this.width * 1 / 5 - MARGIN) / 2, 250/2),
                    h: BUTTON_HEIGHT
                };
                let imageTabs = new svg.Rect(tabsDim.w, tabsDim.h).corners(2, 2).color(myColors.white, 1, myColors.grey)
                    .mark('imageTab');
                let videoTabs = new svg.Rect(tabsDim.w, tabsDim.h).corners(2, 2).color(myColors.white, 1, myColors.grey)
                    .position(tabsDim.w, 0).mark('videoTab');
                let imageText = new svg.Text('Image').font('Arial', 18)
                    .position(0, 6).mark('imageTabText');
                let videoText = new svg.Text('Video').font('Arial', 18)
                    .position(tabsDim.w, 6).mark('videoTabText');
                let tabsManipulator = new Manipulator(this);
                tabsManipulator.add(imageTabs).add(videoTabs).add(imageText).add(videoText);
                tabsManipulator.move(tabsDim.w / 2 + MARGIN,
                    this.questionsBlockManipulator.y + this.questionsBlockListView.height / 2 + tabsDim.h / 2 + MARGIN);
                svg.addEvent(imageTabs, 'click', () => {
                    this.toggleMediaPanel(true)
                });
                svg.addEvent(videoTabs, 'click', () => {
                    this.toggleMediaPanel(false)
                });
                svg.addEvent(imageText, 'click', () => {
                    this.toggleMediaPanel(true)
                });
                svg.addEvent(videoText, 'click', () => {
                    this.toggleMediaPanel(false)
                });
                this.manipulator.add(tabsManipulator);
            }


            this.mediaPanel = true;
            super.display();
            _declareManipulator();
            _resetDrawings();


            _updateHeader();
            _displayReturnButton();
            _displayTitleArea();
            _displayQuestionsHeader();
            _displayToggleMedias();
            this.displayImageLibrary();
            this.displayUploadButton();
            _displayQuestionDetails();
            _createBottomButton();
            this._displayQuestionsBlock();
            this._loadQuestionsDetail();

        }

        _calculateLibraryDimension(){
            return {
                w: Math.max(this.width * 1 / 5 - MARGIN, 250),
                h: Math.max(this.height - this.header.height - this.questionsBlockListView.getListDim().h
                    - this.returnButton.height - this.quizTitleField.height  - 2*BUTTON_HEIGHT - MARGIN, 280 - BUTTON_HEIGHT)
            };
        }

        displayVideoLibrary() {
            this.manipulator.remove(this.mediasLibraryManipulator);
            this.mediasLibraryManipulator = new Manipulator(this).addOrdonator(4);

            let mediaLibDim = this._calculateLibraryDimension();

            var _createPanel = () => {
                let videosPanel = new gui.Panel(mediaLibDim.w, mediaLibDim.h);
                videosPanel.border.color(myColors.none, 1, myColors.black).corners(5, 5);
                this.mediaLibrary = videosPanel;
                let rectWhite = new svg.Rect(5000, 5000).color(myColors.white, 1, myColors.white).position(videosPanel.width / 2, videosPanel.height / 2);

               //  let addPictureButton = new gui.Button(BUTTON2_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], 'Ajouter une image')
               //      .position(0, videosPanel.height / 2 + BUTTON_HEIGHT - MARGIN)
               // addPictureButton.text.font('Arial',15).color(myColors.black).position(0, 4.33);
               //  resizeStringForText(addPictureButton.text, BUTTON_WIDTH - MARGIN, BUTTON_HEIGHT);
               //  addPictureButton.component.add(addPictureButton.text);
                videosPanel.add(rectWhite);
                this.mediasLibraryManipulator.set(0, videosPanel.component);
                this.mediasLibraryManipulator.move(videosPanel.width / 2 + MARGIN,
                    mediaLibDim.h/2 +BUTTON_HEIGHT+ this.questionsBlockManipulator.y + this.questionsBlockListView.getListDim().h/2 + MARGIN);
                this.manipulator.add(this.mediasLibraryManipulator);
                videosPanel.back.mark('videoPanel');

            };

           _createPanel();
            this.loadVideos();
        }

        loadVideos() {
            this.getVideos().then(videos => {
                let conf = {
                    drop: (what, whatParent, x, y) => {
                        this._dropMediaAction(whatParent, x, y, (target) => {
                            target.url('../../images/play-button.png');
                            target.videoSrc = what.videoSrc;
                        });
                        return {x: what.x, y: what.y, parent: whatParent};
                    },
                    moved: (what) => {
                        what.flush();
                        return true;
                    }
                };
                videos.forEach((videoElem, index) => {
                    var createDraggableCopy = (vid) => {
                        let vidManip = new Manipulator(this).addOrdonator(1);
                        let point = vid.globalPoint(0, 0);
                        vidManip.move(point.x, point.y);


                        let vidCopy = vid.duplicate(vid);
                        vidManip.set(0, vidCopy);
                        vidManip.videoSrc = videoElem.src;
                        drawings.piste.add(vidManip);

                        installDnD(vidManip, drawings.component.glass.parent.manipulator.last, conf);
                        svg.event(drawings.component.glass, "mousedown", {pageX: vidManip.x, pageY: vidManip.y,preventDefault: () => {
                        }});
                    };

                    let indexX = Math.floor(index % 1);
                    let indexY = Math.floor(index / 1);
                    let video = new svg.Image('../../images/play-button.png').mark('video'+index);
                    let videoTitle = new svg.Text(videoElem.name).font('Arial', 12).anchor('left').position(30, 4);
                    video.dimension(30, 30);
                    let vidManip = new Manipulator(this);
                    vidManip.move(indexX * (30 + MARGIN / 2) + 30 / 2 + MARGIN, 30 + indexY * (30 + 2 * MARGIN))
                    vidManip.add(video);
                    vidManip.add(videoTitle)


                    this.mediaLibrary.content.add(vidManip.component);


                    video.onMouseDown(() => createDraggableCopy(video));
                });
            })
        }

        getVideos() {
            return this.presenter.getVideos();
        }

        displayImageLibrary() {
            this.manipulator.remove(this.mediasLibraryManipulator);
            this.mediasLibraryManipulator = new Manipulator(this).addOrdonator(4);
            let mediaLibDim = this._calculateLibraryDimension();

            let mediasPanel = new gui.Panel(mediaLibDim.w, mediaLibDim.h);
            mediasPanel.border.color(myColors.none, 1, myColors.black).corners(5, 5);
            this.mediaLibrary = mediasPanel;
            let rectWhite = new svg.Rect(5000, 5000).color(myColors.white, 1, myColors.white).position(mediasPanel.width / 2, mediasPanel.height / 2);


            mediasPanel.add(rectWhite);
            this.mediasLibraryManipulator.set(0, mediasPanel.component);
            this.mediasLibraryManipulator.move(mediasPanel.width / 2 + MARGIN,
                mediaLibDim.h/2 +BUTTON_HEIGHT+ this.questionsBlockManipulator.y + this.questionsBlockListView.getListDim().h/2 + MARGIN);


            this.imageWidth = -MARGIN + mediaLibDim.w / IMAGES_PER_LINE;
            let imagesManipulator = new Manipulator(this);
            mediasPanel.content.add(imagesManipulator.first);
            mediasPanel.back.mark('imagePanel')
            this.mediasLibraryManipulator.add(imagesManipulator);
            imagesManipulator.move(-mediaLibDim.w / 2 + this.imageWidth / 2 + MARGIN, -mediaLibDim.h / 2 + this.imageWidth / 2 + MARGIN)
            this.manipulator.add(this.mediasLibraryManipulator);
            this.mediaPanel && this.loadImage(mediasPanel);
        }

        displayUploadButton() {
            const onChangeFileExplorerHandler = () => {
                uploadFiles(fileExplorer.getFilesSelected())
            };

            var uploadFiles = (files) => {
                for (let file of files) {
                    let progressDisplay;
                    if (file.type === 'video/mp4') {
                        progressDisplay = _progressDisplayer();
                        this.presenter.uploadVideo(file, () => {}).then(() => {
                            this.loadVideos();
                        })
                    } else {
                        this.presenter.uploadImage(file, () => {}).then(() => {
                            this.loadImage(this.mediaLibrary);
                        });
                    }
                }
            };

            let fileExplorer = new Helpers.FileExplorer(this.width, this.height, true);
            fileExplorer.acceptImageAndVideoMP4()
                .handlerOnValide(onChangeFileExplorerHandler);

            let addPictureButton = new gui.Button(BUTTON_WIDTH, BUTTON_HEIGHT,  [[43, 120, 228], 1, myColors.black], 'Ajouter un Media');
            resizeStringForText(addPictureButton.text, BUTTON_WIDTH - MARGIN, BUTTON_HEIGHT);
            addPictureButton.component.add(addPictureButton.text);
            addPictureButton.onClick(fileExplorer.display);
            svg.addEvent(addPictureButton.text, 'click', fileExplorer.display);
            let addButtonManip = new Manipulator(this);
            addButtonManip.add(addPictureButton.component);
            addButtonManip.move(BUTTON_WIDTH/2 + MARGIN , this.mediasLibraryManipulator.y + this.mediaLibrary.height / 2 + BUTTON_HEIGHT - MARGIN)
            this.manipulator.add(addButtonManip);
        }

        toggleMediaPanel(bool) {
            this.mediaPanel = bool;
            if (this.mediaPanel) {
                this.displayImageLibrary();
            }
            else {
                this.displayVideoLibrary();
            }
        }

        loadImage(panel) {
            this.getImages().then((images) => {
                let conf = {
                    drop: (what, whatParent, x, y) => {
                        this._dropMediaAction(whatParent, x, y, (target) => {
                            let imageSrc = what.components[0].src;
                            target.url(imageSrc);
                            target.imageSrc = imageSrc;
                        })
                        return {x: what.x, y: what.y, parent: whatParent};
                    },
                    moved: (what) => {
                        what.flush();
                        return true;
                    },
                    clicked: (what)=>{
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
                    picture.dimension(this.imageWidth, this.imageWidth);
                    let picManip = new Manipulator(this);
                    picManip.move(indexX * (this.imageWidth + MARGIN / 2) + this.imageWidth / 2 + MARGIN,
                        this.imageWidth / 2 + indexY * (this.imageWidth + 2 * MARGIN))
                    picManip.add(picture);

                    panel.content.add(picManip.component);


                    picture.onMouseDown(() => createDraggableCopy(picture));
                })
            })
        }

        _dropMediaAction(parent, x, y, cb) {
            if (this.selectedQuestionIndex >= 0 && this.selectedQuestionIndex < this.questionsBlockListView.length) {
                let globalPoints = parent.globalPoint(x, y);
                let target = this.questionsDetail[this.selectedQuestionIndex].guiManipulator
                    .last.getTarget(globalPoints.x, globalPoints.y);

                if (target) {
                    if (target instanceof svg.Image && !target.id && target.id != "explanation") {
                        cb(target);
                    }
                }
            }
        }

        displayMessage(message) {
            popUp.displayValidMessage(message, this.manipulator);
        }

        displayWarnignMessage(message) {
            popUp.displayWarningMessage(message, this.manipulator);
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
                    questionButton.glass.mark('selectQuestionBlock' + lastQuestionIndex);
                    questionManip.add(questionButton.component);

                    IconCreator.createRedCrossIcon(questionManip)
                        .position(QUESTION_BUTTON_SIZE.w / 2, -QUESTION_BUTTON_SIZE.h / 2)
                        .mark('questionRedCross' + lastQuestionIndex)
                        .addEvent('click', () => _deleteQuestion());
                };
                var _displayBlock = () => {
                    this.questionsBlockListView.addManipInIndex(questionManip, lastQuestionIndex);
                    resizeStringForText(questionManip.buttonText, QUESTION_BUTTON_SIZE.w, QUESTION_BUTTON_SIZE.h/2);
                }

                let questionManip = new Manipulator(this).addOrdonator(2);
                questionManip.mark('questionBlock' + lastQuestionIndex);
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
                width: this.questionDetailsDim.w - 2 * MARGIN,
                height: this.questionDetailsDim.h - 2 * MARGIN
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
                let toggleButtonDim = {
                    w: BUTTON_WIDTH,
                    h: BUTTON_HEIGHT
                }
                questionGui.uniqueButton = new gui.Button(toggleButtonDim.w, toggleButtonDim.h, [myColors.white, 1, myColors.black], "Réponse unique");
                questionGui.multipleButton = new gui.Button(toggleButtonDim.w, toggleButtonDim.h, [myColors.white, 1, myColors.black], 'Réponses multiples');
                questionGui.uniqueButton.position(-(toggleButtonDim.w / 2 + MARGIN), MARGIN - this.questionDetailsDim.h / 2 + toggleButtonDim.h / 2);
                questionGui.multipleButton.position(toggleButtonDim.w / 2 + MARGIN, MARGIN - this.questionDetailsDim.h / 2 + toggleButtonDim.h / 2);

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
                questionGui.answersDimension.height -= toggleButtonDim.h;
            };
            var _displayTextArea = (questionGui, index, question) => {
                var _setQuestionBlockTitle = (oldMessage, newMessage) => {
                    let questionManip = this.questionsBlockListView.get(this.selectedQuestionIndex);
                    questionManip.buttonText.message(newMessage);
                    let tmpText = questionManip.buttonText;
                    resizeStringForText(tmpText,QUESTION_BUTTON_SIZE.w, QUESTION_BUTTON_SIZE.h/2);
                    //questionManip.add(tmpText)
                }


                let questionTextAreaDim = {
                    w: this.questionDetailsDim.w - 2 * MARGIN,
                    h: this.questionDetailsDim.h / 4 - 2 * MARGIN
                };

                let titleArea = new svg.Rect(questionTextAreaDim.w, questionTextAreaDim.h).color(myColors.white, 1, myColors.black);
                questionGui.textAreaManipulator.set(0, titleArea);

                questionGui.textArea = new gui.TextArea(0, 0, questionTextAreaDim.w * 6 / 8, questionTextAreaDim.h - MARGIN, question.label);
                questionGui.textAreaManipulator.set(1, questionGui.textArea.component);

                let sizePicture = questionTextAreaDim.h - MARGIN;

                questionGui.textAreaPicture = new svg.Image((question.imageSrc) ? question.imageSrc : "../images/quiz/newImage.png");
                questionGui.textAreaPicture.dimension(sizePicture, sizePicture)
                    .position(-questionGui.textArea.width / 2 - (titleArea.width - questionGui.textArea.width) / 4, 0);

                questionGui.textAreaManipulator.add(questionGui.textAreaPicture);
                questionGui.textArea.font('Arial', 15);
                questionGui.textArea.anchor('center');
                questionGui.textArea.frame.color(myColors.none, 0, myColors.none).fillOpacity(1);
                questionGui.textArea.onInput(_setQuestionBlockTitle);
                questionGui.textAreaManipulator.move(0, -this.questionDetailsDim.h / 2 + questionTextAreaDim.h / 2 + 2 * MARGIN + BUTTON_HEIGHT);
                questionGui.answersDimension.height -= questionTextAreaDim.h;
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
                            answerGui.manipulator.mark('answer' + index);
                            questionGui.answersManipulator.add(answerGui.manipulator);
                        }
                        var _initInfos = () => {
                            answerGui.index = index;
                        }
                        _initManipulators();
                        _initInfos();
                    };
                    var _initAnswerTextArea = (answerGui, answerLabel, index) => {
                        let answerTextDim = {
                            w: questionGui.answersDimension.width / ANSWERS_PER_LINE - MARGIN,
                            h: 70
                        };
                        var _initRedCross = (answerGui) => {
                            answerGui.iconRedCross = IconCreator.createRedCrossIcon(answerGui.manipulator, 3);
                            answerGui.iconRedCross.mark('answerRedCross' + answerGui.index);
                            answerGui.iconRedCross.position(answerTextDim.w / 2, -answerTextDim.h / 2);
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
                            var _toggleIconColor = (icon) => {
                                let msg = answerGui.popUpExplanation.textExplanation.textMessage;
                                let mediaSrc = answerGui.popUpExplanation.media.src;
                                if (msg && msg !== EXPLANATION_DEFAULT_TEXT || mediaSrc !== EXPLANATION_DEFAULT_IMAGESRC) {
                                    icon.activeStatusActionIcon();
                                    icon.showActualBorder();
                                } else {
                                    icon.cancelActionIcon();
                                    icon.showActualBorder();
                                }
                            }
                            var _createExplanationPopUp = () => {
                                var _createRedCross = () => {
                                    var _closeExplanation = () => {
                                        questionGui.explanationManipulator.remove(answerGui.popUpExplanation.manipulator);
                                        _toggleIconColor(answerGui.iconExplanation);
                                    };

                                    let iconRedCross = IconCreator.createRedCrossIcon(popUpExplanation.manipulator, 2);
                                    iconRedCross.position(dimExplanation.w / 2, -dimExplanation.h / 2);
                                    iconRedCross.addEvent('click', _closeExplanation);
                                };
                                var _drawBackPanel = () => {
                                    let panel = new svg.Rect(dimExplanation.w, dimExplanation.h)
                                        .color(myColors.white, 2, myColors.black);
                                    popUpExplanation.manipulator.set(0, panel);
                                }
                                var _drawTitle = () => {
                                    popUpExplanation.setTextTitle = function (msg) {
                                        this.textTitle.message("Explication de la réponse : " + msg);
                                    };

                                    let titleManip = new Manipulator(popUpExplanation).addOrdonator(1);
                                    popUpExplanation.textTitle = new svg.Text("Explication de la réponse : Réponse").font('Arial', 25).color(myColors.grey);
                                    titleManip.add(popUpExplanation.textTitle).move(0, -dimExplanation.h / 2 + 50);
                                    popUpExplanation.manipulator.add(titleManip);
                                };
                                var _drawContent = () => {
                                    var _drawContentRect = () => {
                                        let contentRect = new svg.Rect(dimensionContent.w, dimensionContent.h)
                                            .color(myColors.white, 1, myColors.grey).corners(MARGIN);
                                        contentManip.add(contentRect);
                                    }
                                    var _drawTextExplanation = () => {
                                        let explanationLabel = (answerGui.explanation && answerGui.explanation.label) ? answerGui.explanation.label : EXPLANATION_DEFAULT_TEXT;
                                        popUpExplanation.textExplanation = new gui.TextArea(0, 0, dimensionContent.w * 2 / 3 - MARGIN,
                                            dimensionContent.h - MARGIN, explanationLabel);
                                        popUpExplanation.textExplanation.font('Arial', 20)
                                            .frame.color(myColors.white, 0, myColors.black);
                                        popUpExplanation.textExplanation.position(dimensionContent.w / 6 - MARGIN, 0);
                                        popUpExplanation.textExplanation.mark('explanationText');

                                        contentManip.add(popUpExplanation.textExplanation.component);
                                    };
                                    var _drawMediaPic = () => {
                                        if (answerGui.explanation && answerGui.explanation.imageSrc) {
                                            popUpExplanation.media = new svg.Image(answerGui.explanation.imageSrc);
                                            popUpExplanation.media.imageSrc = answerGui.explanation.imageSrc;
                                        } else if (answerGui.explanation && answerGui.explanation.videoSrc) {
                                            popUpExplanation.media = new svg.Image('../../images/play-button.png');
                                            popUpExplanation.media.videoSrc = answerGui.explanation.videoSrc;
                                        } else {
                                            popUpExplanation.media = new svg.Image(EXPLANATION_DEFAULT_IMAGESRC);
                                        }
                                        popUpExplanation.media.dimension(dimensionContent.w / 6, dimensionContent.w / 6);
                                        popUpExplanation.media.position(-dimensionContent.w / 2 + popUpExplanation.media.width, 0);
                                        contentManip.add(popUpExplanation.media);
                                    };

                                    let contentManip = new Manipulator(popUpExplanation);
                                    popUpExplanation.manipulator.add(contentManip);
                                    _drawContentRect();
                                    _drawTitle();
                                    _drawTextExplanation();
                                    _drawMediaPic();
                                };

                                let dimExplanation = {w: this.questionDetailsDim.w, h: this.questionDetailsDim.h};
                                let dimensionContent = {
                                    w: dimExplanation.w - MARGIN * 2, h: dimExplanation.h / 2
                                };
                                let popUpExplanation = {};
                                popUpExplanation.manipulator = new Manipulator(popUpExplanation).addOrdonator(3);
                                popUpExplanation.manipulator.mark('explanation');

                                _createRedCross();
                                _drawBackPanel();
                                _drawContent();

                                return popUpExplanation;
                            };
                            var _createExplanationIcon = () => {
                                let answerTextDim = {
                                    w: questionGui.answersDimension.width / ANSWERS_PER_LINE - MARGIN,
                                    h: 70
                                };
                                var _toggleExplanation = () => {
                                    questionGui.explanationManipulator.add(answerGui.popUpExplanation.manipulator);
                                    answerGui.popUpExplanation.setTextTitle(answerGui.textArea.textMessage);
                                };

                                let icon = IconCreator.createExplanationIcon(answerGui.manipulator, 1)
                                    .mark("explanationButton" + answerGui.index)
                                    .addEvent('click', _toggleExplanation);
                                icon.position(answerTextDim.w / 2 - icon.getContentSize() * 2 / 3, 0)
                                _toggleIconColor(icon);
                                return icon;
                            }

                            answerGui.explanationPenManipulator = new Manipulator(this);
                            answerGui.linesManipulator = new Manipulator(this);
                            answerGui.penManipulator = new Manipulator(this);
                            answerGui.popUpExplanation = _createExplanationPopUp();
                            answerGui.iconExplanation = _createExplanationIcon();

                        };
                        var _addValidCheckbox = (answerGui) => {
                            answerGui.checkBoxManipulator = new Manipulator(this);
                            answerGui.checkBoxManipulator.mark("answerCheckbox" + answerGui.index);
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
                            answerGui.checkBoxManipulator.add(checkbox).move(-answerTextDim.w / 2 + CHECKBOX_SIZE, -MARGIN + CHECKBOX_SIZE * 2);
                            if (answerGui.checked) {
                                answerGui.checkBoxManipulator.add(checked);
                            }
                            answerGui.manipulator.set(2, answerGui.checkBoxManipulator);
                        };

                        answerGui.textArea = new gui.TextArea(0, 0, answerTextDim.w, answerTextDim.h, answerLabel || "Réponse");
                        answerGui.manipulator.set(0, answerGui.textArea.component);
                        answerGui.textArea.font('Arial', 15).anchor('center');
                        answerGui.textArea.frame.color(myColors.white, 1, myColors.black).fillOpacity(0.001);
                        let pos = _calculatePositionAnswer(questionGui, index);
                        answerGui.manipulator.move(pos.x, pos.y);
                        _initRedCross(answerGui);
                        _addExplanationPen(answerGui);
                        _addValidCheckbox(answerGui);
                    };
                    let answerGui = {checked: answer.correct, explanation: answer.explanation};

                    _initGui(answerGui, index);
                    _initAnswerTextArea(answerGui, answer.label, index);
                    return answerGui;
                };
                var _createAddNewResponse = () => {
                    let answerTextDim = {
                        w: questionGui.answersDimension.width / ANSWERS_PER_LINE - MARGIN,
                        h: 70
                    };
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
                        = new gui.Button(answerTextDim.w, answerTextDim.h, [myColors.white, 1, myColors.black], "");
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
            this.questionsBlockListView.length >= 2 && this.questionsBlockListView.get(0).select();
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
                    explanation: {}
                };

                let labelExplanation = answerGui.popUpExplanation.textExplanation.textMessage
                if (labelExplanation && labelExplanation !== EXPLANATION_DEFAULT_TEXT) {
                    answer.explanation.label = answerGui.popUpExplanation.textExplanation.textMessage;
                }

                let media = answerGui.popUpExplanation.media;
                if (media.imageSrc) {
                    answer.explanation.imageSrc = media.imageSrc;
                }else if(media.videoSrc){
                    answer.explanation.videoSrc = media.videoSrc;
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

                let media = questionElementVue.textAreaPicture;
                if (media.imageSrc) {
                    question.imageSrc = media.imageSrc;
                }else if(media.videoSrc){
                    question.videoSrc = media.videoSrc;
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

        previewQuiz() {
            this.updateQuiz();
            this.presenter.previewQuiz(this.selectedQuestionIndex);
        }

        setLastQuestionIndex(index) {
            this.presenter.setLastQuestionIndex(index);
        }

        renameQuiz() {
            let quizViewData = {
                label: this.getNewLabel(),
                questions: this.getNewQuestions(),
            }
            this.presenter.updateQuiz(quizViewData).then(data => {
                data.message && this.displayMessage(data.message);
                if (data.status) {
                    let formationLabel = this.getFormationLabel();
                    this.label = this.getLabel();
                    this.displayHeader(formationLabel + " - " + this.label);
                }
            }).catch(error => {
                console.log(error);
                this.displayWarnignMessage(error );
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
            let quizViewData = {
                label: this.getNewLabel(),
                questions: this.getNewQuestions(),
            }
            this.presenter.updateQuiz(quizViewData).then((data)=>{
                data.message && this.displayMessage(data.message);
            }).catch((error) => {
                console.log(error);
                this.displayWarnignMessage(error);
            })
        }

    }

    return QuizAdminV;
}