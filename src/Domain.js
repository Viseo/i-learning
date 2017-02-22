exports.Domain = function (globalVariables) {

    let imageController;

    let
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        clientWidth = globalVariables.clientWidth,
        clientHeight = globalVariables.clientHeight,
        Manipulator = globalVariables.util.Manipulator,
        MiniatureFormation = globalVariables.util.MiniatureFormation,
        Puzzle = globalVariables.util.Puzzle,
        ReturnButton = globalVariables.util.ReturnButton,
        Server = globalVariables.util.Server,
        playerMode = globalVariables.playerMode;

    imageController = ImageController(globalVariables.ImageRuntime);
    globalVariables.imageController = imageController;

    setGlobalVariables = () => {
        runtime = globalVariables.runtime;
        drawing = globalVariables.drawing;
        drawings = globalVariables.drawings;
        svg = globalVariables.svg;
        clientWidth = globalVariables.clientWidth;
        clientHeight = globalVariables.clientHeight;
        Manipulator = globalVariables.util.Manipulator;
        MiniatureFormation = globalVariables.util.MiniatureFormation;
        Puzzle = globalVariables.util.Puzzle;
        ReturnButton = globalVariables.util.ReturnButton;
        Server = globalVariables.util.Server;
        playerMode = globalVariables.playerMode;
    };

    class Answer {
        constructor(answerParameters, parent) {
            this.parentQuestion = parent;
            let answer = {
                label: '',
                imageSrc: null,
                correct: false
            };
            answerParameters && (answer = answerParameters);
            this.manipulator = new Manipulator(this).addOrdonator(10);
            this.explanationIconManipulator = new Manipulator(this).addOrdonator(5);
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
                    self.dimImage = {width: this.width, height: this.height};
                });
                this.imageLoaded = false;
            } else {
                this.imageLoaded = true;
            }
            this.colorBordure = answer.colorBordure ? answer.colorBordure : myColors.black;
            this.bgColor = answer.bgColor ? answer.bgColor : myColors.white;
            this.border = null;
            this.content = null;
        }

        remove() {
            let index = this.parentQuestion.tabAnswer.indexOf(this);
            if (index !== -1) {
                this.parentQuestion.tabAnswer.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }

        isEditable(editor, editable) {
            this.linesManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.linesManipulator);
            this.penManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.penManipulator);
            this.editable = editable;
            this.labelDefault = "Double cliquer pour modifier et cocher si bonne réponse.";
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

        select() {
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
                let selectedAnswer = [quiz.tabQuestions[quiz.currentQuestionIndex].tabAnswer.indexOf(this)];
                quiz.questionsAnswered[quiz.currentQuestionIndex]={
                    index: quiz.questionsAnswered.length,
                    question: quiz.tabQuestions[quiz.currentQuestionIndex],
                    validatedAnswers: selectedAnswer
                };
                quiz.nextQuestion();
            } else {// question à choix multiples
                this.selected = !this.selected;
                if (this.selected) {
                    // on sélectionne une réponse
                    question.selectedAnswers.push(this);
                } else {
                    question.selectedAnswers.splice(question.selectedAnswers.indexOf(this), 1);
                }
            }
        }

    }

    class Question {
        constructor(question, quiz) {
            this.manipulator = new Manipulator(this).addOrdonator(7);
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

            this.invalidLabelInput = (question && question.invalidLabelInput !== undefined) ? question.invalidLabelInput : false;
            this.selected = false;
            this.parentQuiz = quiz;
            this.tabAnswer = [];
            this.fontSize = 20;
            this.questionNum = question && question.questionNum || this.parentQuiz.tabQuestions.length + 1;

            if (!question) {
                this.label = "";
                this.imageSrc = "";
                this.columns = 4;
                this.rightAnswers = [];
                this.tabAnswer = [new Answer(null, this), new Answer(null, this)];
                this.multipleChoice = false;
                this.font = "Arial";
                this.bgColor = myColors.white;
                this.colorBordure = myColors.black;
                this.selectedAnswers = [];
                this.validatedAnswers = [];
            } else {
                this.label = question.label;
                this.imageSrc = question.imageSrc;
                this.video=question.video;
                this.columns = question.columns ? question.columns : 4;
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
            this.questionType = (this.multipleChoice) ? myQuestionType.tab[1] : myQuestionType.tab[0];
            if (question !== null && question.tabAnswer !== null) {
                question.tabAnswer.forEach(it => {
                    var tmp = new Answer(it, this);
                    this.tabAnswer.push(tmp);
                    if (tmp.correct) {
                        this.rightAnswers.push(tmp);
                    }
                });
            }

            this.lines = Math.floor(this.tabAnswer.length / this.columns); //+ 1;
            if (this.tabAnswer.length % this.columns !== 0) {
                this.lines += 1;
            }
            this.border = null;
            this.content = null;
        }

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

        checkValidity() {
            var validation = true;
            this.questionType.validationTab.forEach((funcEl) => {
                var result = funcEl(this);
                validation = validation && result.isValid;
            });
            validation ? this.toggleInvalidQuestionPictogram(false) : this.toggleInvalidQuestionPictogram(true);
        }

        validateAnswers(){
            // test des valeurs, en gros si selectedAnswers === rigthAnswers
            var allRight = false;
            this.validatedAnswers = this.selectedAnswers;
            this.selectedAnswers = [];
            if (this.rightAnswers.length !== this.validatedAnswers.length) {
                allRight = false;
            } else {
                var subTotal = 0;
                this.validatedAnswers.forEach((e)=> {
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
                this.rightAnswers.forEach((e)=> {
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
            this.parentQuiz.questionsAnswered[this.parentQuiz.currentQuestionIndex]={
                question: this.parentQuiz.tabQuestions[this.parentQuiz.currentQuestionIndex],
                validatedAnswers: indexOfValidatedAnswers
            };
            this.parentQuiz.nextQuestion();
        }

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

    class QuestionCreator {
        constructor(parent, question) {
            this.MAX_ANSWERS = 8;
            this.parent = parent;
            this.manipulator = new Manipulator(this).addOrdonator(2);
            this.manipulatorQuizInfo = new Manipulator(this);
            this.questionManipulator = new Manipulator(this).addOrdonator(7);
            this.toggleButtonManipulator = new Manipulator(this);
            this.previewButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.add(this.previewButtonManipulator);
            this.saveQuizButtonManipulator = new Manipulator(this);
            this.manipulator.add(this.saveQuizButtonManipulator);
            this.labelDefault = "Cliquer deux fois pour ajouter la question";
            this.questionType = myQuestionType.tab;
            this.toggleButtonHeight = 40;
            this.loadQuestion(question);
            this.puzzle = new Puzzle(2, 4, this.linkedQuestion.tabAnswer, "leftToRight", this);
            this.manipulator.add(this.puzzle.manipulator);
            this.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};
        }

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

        loadQuestion(quest) {
            this.linkedQuestion = quest;
            quest.label && (this.label = quest.label);
            this.multipleChoice = quest.multipleChoice;
            quest.tabAnswer.forEach(answer => {
                if (answer instanceof Answer) {
                    answer.isEditable(this, true);
                }
                answer.popIn = new PopIn(answer, true);
            });
            quest.tabAnswer.forEach(el => {
                if (el.correct) {
                    quest.rightAnswers.push(el);
                }
            });
        }
    }

    class PopIn {
        constructor(answer, editable) {
            this.answer = answer;
            this.manipulator = new Manipulator(this).addOrdonator(7);
            this.closeButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.set(2, this.closeButtonManipulator);
            this.panelManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.add(this.panelManipulator);
            this.textManipulator = new Manipulator(this).addOrdonator(1);
            this.editable = editable;
            if (this.editable) {
                this.draganddropText = "Glisser-déposer une image ou une vidéo de la bibliothèque ici";
                this.defaultLabel = "Cliquer ici pour ajouter du texte";
            }
            if (answer.explanation && answer.explanation.label) {
                this.label = answer.explanation.label;
            }
            if (answer.explanation && answer.explanation.image) {
                this.image = answer.explanation.image;
            }
            if (answer.explanation && answer.explanation.video) {
                this.video = answer.explanation.video;
            }
            answer.filled = this.image || this.video || this.label;
        }
    }

    class AddEmptyElement {
        constructor(parent, type) {
            this.manipulator = new Manipulator(this).addOrdonator(3);
            type && (this.type = type);
            this.invalidLabelInput = false;
            switch (type) {
                case 'question':
                    this.label = "Double cliquer pour ajouter une question";
                    break;
                case 'answer':
                    this.label = "Nouvelle réponse";
                    break;
            }
            this.fontSize = 20;
            this.parent = parent;
        }
        remove() {
            console.log("Tentative de suppression d'AddEmptyElement");
        }
    }

    class Level {
        constructor(formation, gamesTab) {
            this.parentFormation = formation;
            this.manipulator = new Manipulator(this).addOrdonator(3);
            this.redCrossManipulator = new Manipulator(this).addOrdonator(2);
            this.index = (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1]) ? (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1].index + 1) : 1;
            this.gamesTab = gamesTab ? gamesTab : [];
            this.x = this.parentFormation.libraryWidth ? this.parentFormation.libraryWidth : null; // Juste pour être sûr
            this.y = (this.index - 1) * this.parentFormation.levelHeight;
        }

        removeGame(index) {
            this.gamesTab.splice(index, 1);
        }

    }

    class FormationsManager {
        constructor(formations) {
            this.x = MARGIN;
            this.tileHeight = 150;
            this.tileWidth = this.tileHeight * (16 / 9);
            this.addButtonWidth = 330;
            this.addButtonHeight = 40;
            this.fontSize = 20;
            this.plusDim = this.fontSize * 2;
            this.iconeSize = this.plusDim / 1.5;
            this.puzzleRows = 6;
            this.initialFormationsPosX = MARGIN;
            this.rows = 6;
            this.lines = 4;
            this.formations = [];
            this.count = 0;
            for (let formation of formations) {
                this.formations.push(new Formation(formation, this));
            }
            this.manipulator = new Manipulator();
            this.headerManipulator = new Manipulator().addOrdonator(1);
            this.addButtonManipulator = new Manipulator().addOrdonator(4);
            this.checkManipulator = new Manipulator().addOrdonator(4);
            this.exclamationManipulator = new Manipulator().addOrdonator(4);
            this.formationsManipulator = new Manipulator();
            this.clippingManipulator = new Manipulator(this);

            /* for Player */
            this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(3);
        }
    }

    class Formation {
        constructor(formation, formationsManager) {
            this.gamesCounter = {
                quizz: 0,
                bd: 0
            };
            this.links = [];
            this._id = (formation._id || null);
            this.formationId = (formation.formationId || null);
            this.progress = formation.progress;
            this.formationsManager = formationsManager;
            this.manipulator = new Manipulator(this).addOrdonator(6);
            this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
            this.graphManipulator = new Manipulator(this);
            this.messageDragDropManipulator = new Manipulator(this).addOrdonator(2);
            this.arrowsManipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this);
            this.graphManipulator.add(this.miniaturesManipulator);
            this.graphManipulator.add(this.arrowsManipulator);
            this.clippingManipulator = new Manipulator(this);
            this.saveFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.publicationFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.deactivateFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.library = new GamesLibrary(myLibraryGames);
            this.library.formation = this;
            this.quizManager = new QuizManager(null, this);
            this.returnButtonManipulator = new Manipulator(this);//.addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour aux formations");
            this.labelDefault = "Entrer le nom de la formation";
            // WIDTH
            this.libraryWidthRatio = 0.15;
            this.graphWidthRatio = 1 - this.libraryWidthRatio;
            // HEIGHT
            this.graphCreaHeightRatio = 0.85;
            this.x = MARGIN;
            this.regex = TITLE_REGEX;
            this.levelsTab = [];
            this.saveButtonHeightRatio = 0.07;
            this.publicationButtonHeightRatio = 0.07;
            this.marginRatio = 0.03;
            this.label = formation.label ? formation.label : "";
            this.status = formation.status ? formation.status : "NotPublished";
            this.invalidLabelInput = false;
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.levelHeight = 150;
            this.graphElementSize = this.levelHeight * 0.65;
            this.miniature = new MiniatureFormation(this);
            this.changeableDimensions();
            this.manipulator.add(this.saveFormationButtonManipulator);
            this.manipulator.add(this.publicationFormationButtonManipulator);
            this.manipulator.add(this.deactivateFormationButtonManipulator);
        }

        dropAction(event, game) {
            drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
            let getDropLocation = event => {
                let dropLocation = this.panel.back.localPoint(event.pageX, event.pageY);
                dropLocation.y -= this.panel.contentV.y;
                dropLocation.x -= this.panel.contentV.x;
                return dropLocation;
            };
            let getLevel = (dropLocation) => {
                let level = -1;
                while (dropLocation.y > -this.panel.content.height / 2) {
                    dropLocation.y -= this.levelHeight;
                    level++;
                }
                if (level >= this.levelsTab.length) {
                    level = this.levelsTab.length;
                    this.addNewLevel(level);
                }
                return level;
            };
            let getColumn = (dropLocation, level)=> {
                let column = this.levelsTab[level].gamesTab.length;
                for (let i = 0; i < this.levelsTab[level].gamesTab.length; i++) {
                    if (dropLocation.x < this.levelsTab[level].gamesTab[i].miniaturePosition.x) {
                        column = i;
                        break;
                    }
                }
                return column;
            };

            let dropLocation = getDropLocation(event);
            let level = getLevel(dropLocation);
            let column = getColumn(dropLocation, level);
            if (game) {
                this.moveGame(game, level, column);
                game.levelIndex === level || game.miniature.removeAllLinks();
            } else {
                this.addNewGame(level, column)
            }
            this.library.gameSelected && this.library.gameSelected.miniature.border.color(myColors.white, 1, myColors.black);
            this.displayGraph();
        }

        addNewGame(level, column) {
            let gameBuilder = this.library.draggedObject || this.library.gameSelected;
            gameBuilder.create(this, level, column);
        }

        moveGame(game, level, column) {
            this.levelsTab[game.levelIndex].gamesTab.splice(game.gameIndex, 1);
            this.levelsTab[level].gamesTab.splice(column, 0, game);
            if(this.levelsTab[game.levelIndex].gamesTab.length === 0 && game.levelIndex == this.levelsTab.length-1)
                this.levelsTab.splice(game.levelIndex,1);
        }

        createLink(parentGame, childGame, arrow) {
            this.links.push({parentGame: parentGame.id, childGame: childGame.id, arrow: arrow});
        };

        removeLink(parentGame, childGame) {
            for (let i = this.links.length - 1; i >= 0; i--) {
                if (this.links[i].childGame === childGame.id && this.links[i].parentGame === parentGame.id)
                    this.links.splice(i, 1);
            }
        };

        deactivateFormation() {
            this.status = "NotPublished";
            Server.deactivateFormation(this.formationId, ignoredData)
                .then(() => {
                    this.manipulator.flush();
                    Server.getAllFormations().then(data => {
                        let myFormations = JSON.parse(data).myCollection;
                        globalVariables.formationsManager = new FormationsManager(myFormations);
                        globalVariables.formationsManager.display();
                    });
                })
        }

        saveFormation(displayQuizManager, status = "Edited", onlyName = false) {
            const
                messageSave = "Votre travail a bien été enregistré.",
                messageError = "Vous devez remplir correctement le nom de la formation.",
                messageReplace = "Les modifications ont bien été enregistrées.",
                messageUsedName = "Le nom de cette formation est déjà utilisé !",
                messageNoModification = "Les modifications ont déjà été enregistrées.";

            const displayMessage = (message, displayQuizManager, error = false) => {
                switch (message) {
                    case messageError:
                    case messageUsedName:
                        error = true;
                        break;
                    default:
                        error = false;
                }
                this.publicationFormationButtonManipulator.remove(this.errorMessagePublication);
                if (displayQuizManager && !error) {
                    displayQuizManager();
                } else {
                    let saveFormationButtonCadre = this.saveFormationButtonManipulator.ordonator.children[0];
                    const messageY = saveFormationButtonCadre.globalPoint(0, 0).y;
                    this.message = new svg.Text(message)
                        .position(drawing.width/2, messageY - saveFormationButtonCadre.height*1.5 - MARGIN)
                        .font("Arial", 20)
                        .mark("formationErrorMessage")
                        .anchor('middle').color(error ? myColors.red : myColors.green);
                    this.manipulator.set(5, this.message);
                    svg.timeout(() => {
                        this.manipulator.unset(5);
                    }, 5000);
                }
            };

            const returnToFormationList = () => {
                this.manipulator.flush();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new FormationsManager(myFormations);
                    globalVariables.formationsManager.display();
                });
            };

            if (this.label && this.label !== this.labelDefault && this.label.match(this.regex)) {
                const getObjectToSave = () => {
                    if(onlyName && this._id){
                        return {label: this.label};
                    } else {
                        return {label: this.label, gamesCounter: this.gamesCounter, links: this.links, levelsTab: this.levelsTab};
                    }
                };

                let addNewFormation = () => {
                    Server.insertFormation(getObjectToSave(), status, ignoredData)
                        .then(data => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                this._id = answer.idVersion;
                                this.formationId = answer.id;
                                status === "Edited" ? displayMessage(messageSave, displayQuizManager) : returnToFormationList();
                            } else {
                                if (answer.reason === "NameAlreadyUsed") {
                                    displayMessage(messageUsedName, displayQuizManager);
                                }
                            }
                        })
                };

                let replaceFormation = () => {
                    Server.replaceFormation(this._id, getObjectToSave(), status, ignoredData)
                        .then((data) => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                status === "Edited" ? displayMessage(messageReplace, displayQuizManager) : returnToFormationList();
                            } else {
                                switch (answer.reason) {
                                    case "NoModif" :
                                        displayMessage(messageNoModification, displayQuizManager);
                                        break;
                                    case "NameAlreadyUsed" :
                                        displayMessage(messageUsedName, displayQuizManager);
                                        break;
                                }
                            }
                        })
                };

                this._id ? replaceFormation() : addNewFormation();
            } else {
                displayMessage(messageError, displayQuizManager);
            }
        }

        publicationFormation() {
            this.publishedButtonActivated = true;

            [].concat(...this.levelsTab.map(level => level.gamesTab))
                .filter(elem => elem.miniature.selected === true)
                .forEach(game => {
                    game.miniature.selected = false;
                    game.miniature.updateSelectionDesign();
                });

            const messageErrorNoNameFormation = "Vous devez remplir le nom de la formation.",
                messageErrorNoGame = "Veuillez ajouter au moins un jeu à votre formation.";

            this.displayPublicationMessage = (messagePublication) => {
                this.formationInfoManipulator.unset(2);
                this.errorMessagePublication = new svg.Text(messagePublication);
                this.manipulator.set(5, this.errorMessagePublication);
                const messageY = this.publicationFormationButtonManipulator.first.globalPoint(0, 0).y;
                this.errorMessagePublication.position(drawing.width/2, messageY - this.publicationButtonHeight*1.5 - MARGIN)
                    .font("Arial", 20)
                    .anchor('middle').color(myColors.red)
                    .mark("errorMessagePublication");
                svg.timeout(() => {
                    this.manipulator.unset(5, this.errorMessagePublication);
                }, 5000);
            };

            this.publicationFormationQuizManager();
            if (this.levelsTab.length === 0) {
                this.displayPublicationMessage(messageErrorNoGame);
            }
            if (!this.label || this.label === this.labelDefault || !this.label.match(this.regex)) {
                this.displayPublicationMessage(messageErrorNoNameFormation);
            }
        };

        loadFormation(formation) {
            this.levelsTab = [];
            this.gamesCounter = formation.gamesCounter;
            this.links = formation.links || formation.link;
            formation.levelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    game.tabQuestions && gamesTab.push(new Quiz(game, false, this));
                    game.tabQuestions || gamesTab.push(new Bd(game, this));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                this.levelsTab.push(new Level(this, gamesTab));
            });
        }

        findLongestLevel() {
            var longestLevelCandidates = [];
            longestLevelCandidates.index = 0;
            this.levelsTab.forEach(level => {
                if (level.gamesTab.length >= this.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                    if (level.gamesTab.length === this.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                        longestLevelCandidates.push(level);
                    } else {
                        longestLevelCandidates = [];
                        longestLevelCandidates.push(level);
                    }
                    longestLevelCandidates.index = level.index - 1;
                }
            });
            return longestLevelCandidates;
        }

        findGameById(id) {
            return [].concat(...this.levelsTab.map(x => x.gamesTab)).find(game => game.id === id);
        }

        isGameAvailable(game) {
            let available = true;
            this.links.forEach(link => {
                if (link.childGame === game.id) {
                    const parentGame = this.findGameById(link.parentGame);
                    if (parentGame && (parentGame.status === undefined || (parentGame.status && parentGame.status !== "done"))) {
                        available = false;
                        return available;
                    }
                }
            });
            return available;
        }

        changeableDimensions() {
            this.gamesLibraryManipulator = this.library.libraryManipulator;
            this.libraryWidth = drawing.width * this.libraryWidthRatio;
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio + MARGIN;
            this.levelWidth = drawing.width - this.libraryWidth - MARGIN;
            this.minimalMarginBetweenGraphElements = this.graphElementSize / 2;
            this.y = drawing.height * HEADER_SIZE + 3 * MARGIN;
            this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
            this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
            this.buttonWidth = 150;
            this.globalMargin = {
                height: this.marginRatio * drawing.height,
                width: this.marginRatio * drawing.width
            };
            this.clippingManipulator.flush();
        }

        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(this.regex)) || myObj.textarea.messageText === "") {
                this.invalidLabelInput = false;
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.display();
                this.invalidLabelInput = myObj.textarea.messageText.match(REGEX_NO_CHARACTER_LIMIT)
                    ? REGEX_ERROR_NUMBER_CHARACTER
                    : REGEX_ERROR;
            }
        }

        addNewLevel(index) {
            var level = new Level(this);
            if (!index) {
                this.levelsTab.push(level);
            } else {
                this.levelsTab.splice(index, 0, level);
            }
        }

        clickToAdd() {
            this.mouseUpGraphBlock = event => {
                this.library.gameSelected && this.dropAction(event);
                this.library.gameSelected && this.library.gameSelected.miniature.border.color(myColors.white, 1, myColors.black);
                this.library.gameSelected = null;
                svg.removeEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            };
            svg.addEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            svg.addEvent(this.messageDragDropManipulator.ordonator.children[1], "mouseup", this.mouseUpGraphBlock);
        }

        adjustGamesPositions(level) {
            let computeIndexes = () => {
                this.levelsTab.forEach((level, lIndex)=>{
                    level.gamesTab.forEach((game, gIndex)=>{
                        game.levelIndex = lIndex;
                        game.gameIndex = gIndex;
                    })
                });
            };

            computeIndexes();
            var nbOfGames = level.gamesTab.length;
            var spaceOccupied = nbOfGames * this.minimalMarginBetweenGraphElements + this.graphElementSize * nbOfGames;
            level.gamesTab.forEach(game => {
                game.miniaturePosition.x = this.minimalMarginBetweenGraphElements * (3 / 2) + (game.gameIndex - nbOfGames / 2) * spaceOccupied / nbOfGames;
                game.miniaturePosition.y = -this.panel.height / 2 + (level.index - 1 / 2) * this.levelHeight;
            });
        }

        trackProgress(displayFunction) {
            this.levelsTab.forEach(level => {
                level.gamesTab.forEach(game => {
                    delete game.miniature;
                    delete game.status;
                });
            });
            this.miniaturesManipulator.flush();
            Server.getUser().then(data => {
                let user = JSON.parse(data);
                if (user.formationsTab) {
                    let formationUser = user.formationsTab.find(formation => formation.version === this._id);
                    formationUser && formationUser.gamesTab.forEach(game => {
                        let theGame = this.findGameById(game.game);
                        if (!theGame) {
                            return;
                        }
                        theGame.currentQuestionIndex = game.questionsAnswered.length;
                        theGame.questionsAnswered = [];
                        if (game.questionsAnswered) {
                            game.questionsAnswered.forEach((wrongAnswer, i) => {
                                theGame.questionsAnswered.push({
                                    question: theGame.tabQuestions[i],
                                    validatedAnswers: wrongAnswer.validatedAnswers
                                });
                            });
                            theGame.score = game.questionsAnswered.length - theGame.getQuestionsWithBadAnswers().length;
                            theGame.status = (game.questionsAnswered.length === theGame.tabQuestions.length) ? "done" : "inProgress";
                        }
                    });
                }
                this.levelsTab.forEach(level => {
                    level.gamesTab.forEach(game => {
                        if (!this.isGameAvailable(game)) {
                            game.status = "notAvailable";
                        }
                    });
                });
                displayFunction.call(this);
            });
        }
    }

    class Library {
        constructor() {
            this.libraryManipulator = new Manipulator(this).addOrdonator(4);
            this.itemsTab = [];
            this.libraryManipulators = [];
        }
    }

    class GamesLibrary extends Library {
        constructor(lib) {
            super();
            this.title = lib.title;
            this.font = lib.font;
            this.fontSize = lib.fontSize;
            this.itemsTab = lib.tab;
            this.itemsTab.forEach((item, index)=>{
                this.libraryManipulators[index] = new Manipulator(item).addOrdonator(2);
            });
            this.arrowModeManipulator = new Manipulator(this).addOrdonator(3);
        }
    }

    class ImagesLibrary extends Library {
        constructor() {
            super();
            this.imageWidth = 50;
            this.imageHeight = 50;
            this.videosManipulators = [];
            this.videosUploadManipulators = [];
            this.addButtonManipulator = new Manipulator(this).addOrdonator(3);
        }

        dropImage(element, target) {
            if (target && target._acceptDrop) {
                if (target.parent.parentManip.parentObject instanceof PopIn) {
                    let popIn =target.parent.parentManip.parentObject;
                    popIn.image = element.src;
                    popIn.video = null;
                    popIn.miniature && popIn.miniature.video && popIn.miniature.video.redCrossManipulator && popIn.miniature.video.redCrossManipulator.flush();
                    let questionCreator = target.parent.parentManip.parentObject.answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                    target.parent.parentManip.parentObject.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                }
                else {
                    var oldElement = {
                        border: target.parent.parentManip.ordonator.get(0),
                        content: target.parent.parentManip.ordonator.get(1)
                    };
                    target.parent.parentManip.unset(0);
                    target.parent.parentManip.unset(1);
                    var newElement = displayImageWithTitle(oldElement.content.messageText, element.src,
                        element.srcDimension,
                        oldElement.border.width, oldElement.border.height,
                        oldElement.border.strokeColor, oldElement.border.fillColor, null, null, target.parent.parentManip
                    );
                    oldElement.border.position(newElement.border.x, newElement.border.y);
                    oldElement.content.position(newElement.content.x, newElement.content.y);
                    newElement.image._acceptDrop = true;
                    newElement.image.name = element.name;
                    switch (true) {
                        case target.parent.parentManip.parentObject instanceof QuestionCreator:
                            drawings.component.clean();
                            let questionCreator = target.parent.parentManip.parentObject;
                            questionCreator.linkedQuestion.video = null;
                            questionCreator.linkedQuestion.image = newElement.image;
                            questionCreator.linkedQuestion.imageSrc = newElement.image.src;
                            questionCreator.parent.displayQuestionsPuzzle(null, null, null, null, questionCreator.parent.questionPuzzle.startPosition);
                            questionCreator.display();
                            questionCreator.linkedQuestion.checkValidity();
                            break;
                        case target.parent.parentManip.parentObject instanceof Answer:
                            let answer = target.parent.parentManip.parentObject;
                            answer.video = null;
                            answer.obj.video && drawings.component.remove(answer.obj.video);
                            answer.image = newElement.image;
                            answer.imageSrc = newElement.image.src;
                            answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.elementsArray.forEach(element=>{
                               element.obj && element.obj.video && drawings.component.remove(element.obj.video);
                            });
                            answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
                            answer.parentQuestion.checkValidity();
                            break;
                    }
                    target.parent.parentManip.set(0, oldElement.border);
                }

            }
        }
        dropVideo(element, target) {
            if (target && target._acceptDrop) {
                if (target.parent.parentManip.parentObject instanceof PopIn) {
                    let popIn =target.parent.parentManip.parentObject;
                    popIn.video = element;
                    popIn.image = null;
                    popIn.miniature && popIn.miniature.video && popIn.miniature.video.redCrossManipulator && popIn.miniature.video.redCrossManipulator.flush();
                    let questionCreator = target.parent.parentManip.parentObject.answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                    popIn.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                }
                else {
                    var oldElement = {
                        border: target.parent.parentManip.ordonator.get(0),
                        content: target.parent.parentManip.ordonator.get(1)
                    };
                    target.parent.parentManip.unset(0);
                    target.parent.parentManip.unset(1);
                    switch (true) {
                        case target.parent.parentManip.parentObject instanceof QuestionCreator:
                            target.parent.parentManip.unset(2);
                            drawings.component.clean();
                            let questionCreator = target.parent.parentManip.parentObject;
                            questionCreator.linkedQuestion.video = element;
                            questionCreator.linkedQuestion.image = null;
                            questionCreator.linkedQuestion.imageSrc = null;
                            questionCreator.parent.displayQuestionsPuzzle(null, null, null, null, questionCreator.parent.questionPuzzle.startPosition);
                            questionCreator.display();
                            questionCreator.linkedQuestion.checkValidity();
                            break;
                        case target.parent.parentManip.parentObject instanceof Answer:
                            let answer = target.parent.parentManip.parentObject;
                            answer.obj.video && drawings.component.remove(answer.obj.video);
                            answer.video = element;
                            answer.image = null;
                            answer.imageSrc = null;
                            answer.parentQuestion.tabAnswer.forEach(otherAnswer => {
                                otherAnswer.obj && otherAnswer.obj.video && drawings.component.remove(otherAnswer.obj.video);
                            });
                            answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
                            answer.parentQuestion.checkValidity();
                            break;
                    }
                    target.parent.parentManip.set(0, oldElement.border);
                }
            }
        }
    }

    class Header {
        constructor() {
            this.manipulator = new Manipulator(this).addOrdonator(3);
            this.userManipulator = new Manipulator(this).addOrdonator(6);
            this.label = "I-learning";
        }
    }

    class QuizManager {
        constructor(quiz, formation) {
            this.quizName = "";
            this.quizNameDefault = "Ecrire ici le nom du quiz";
            this.tabQuestions = [defaultQuestion];
            this.parentFormation = formation;
            this.quizNameValidInput = true;
            if (!quiz) {
                var initialQuizObject = {
                    title: defaultQuiz.title,
                    bgColor: myColors.white,
                    tabQuestions: this.tabQuestions,
                    puzzleLines: 3,
                    puzzleRows: 3
                };
                this.quiz = new Quiz(initialQuizObject, false, this.parentFormation);
                this.indexOfEditedQuestion = 0;
                this.quizName = this.quiz.title;
            } else {
                this.loadQuiz(quiz);
            }
            this.questionCreator = new QuestionCreator(this, this.quiz.tabQuestions[this.indexOfEditedQuestion]);
            this.library = new ImagesLibrary();
            this.quiz.tabQuestions[0].selected = true;
            this.questionCreator.loadQuestion(this.quiz.tabQuestions[0]);
            this.quiz.tabQuestions.push(new AddEmptyElement(this, 'question'));
            this.quizManagerManipulator = new Manipulator(this);
            this.questionsPuzzleManipulator = new Manipulator(this).addOrdonator(1);
            this.quizInfoManipulator = new Manipulator(this).addOrdonator(6);
            this.previewButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.saveQuizButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.returnButtonManipulator = new Manipulator(this).addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.libraryIManipulator = this.library.libraryManipulator;
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
        }

        loadQuiz (quiz, indexOfEditedQuestion) {
            this.indexOfEditedQuestion = (indexOfEditedQuestion && indexOfEditedQuestion!==-1 ? indexOfEditedQuestion: 0) ;
            this.quiz = new Quiz(quiz, false, this.parentFormation);
            this.quizName = this.quiz.title;
            this.quiz.tabQuestions[this.indexOfEditedQuestion].selected = true;
            this.questionCreator.loadQuestion(this.quiz.tabQuestions[this.indexOfEditedQuestion]);
            this.quiz.tabQuestions.forEach(question => {
                (question.tabAnswer[question.tabAnswer.length-1] instanceof AddEmptyElement) || question.tabAnswer.push(new AddEmptyElement(this.questionCreator, 'answer'));
            });
            this.quiz.tabQuestions.push(new AddEmptyElement(this, 'question'));

        };

        getObjectToSave() {
            this.tabQuestions = this.quiz.tabQuestions;
            (this.tabQuestions[this.quiz.tabQuestions.length - 1] instanceof AddEmptyElement) && this.tabQuestions.pop();
            this.tabQuestions.forEach(question => {
                (question.tabAnswer[question.tabAnswer.length - 1] instanceof AddEmptyElement) && question.tabAnswer.pop();
                question.tabAnswer.forEach(answer => {
                    if (answer.popIn) {
                        answer.explanation = {};
                        answer.popIn.image && (answer.explanation.image = answer.popIn.image);
                        answer.popIn.label && (answer.explanation.label = answer.popIn.label);
                        answer.popIn.video && (answer.explanation.video = answer.popIn.video);
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

        displayMessage(message, color) {
            this.questionCreator.errorMessagePreview && this.questionCreator.errorMessagePreview.parent && this.previewButtonManipulator.remove(this.questionCreator.errorMessagePreview);
            this.questionCreator.errorMessagePreview = new svg.Text(message)
                .position(this.buttonWidth, -this.saveQuizButtonManipulator.ordonator.children[0].height / 2 - MARGIN / 2)
                .font("Arial", 20)
                .anchor('middle').color(color);
            this.previewButtonManipulator.add(this.questionCreator.errorMessagePreview);
            setTimeout(() => {
                this.previewButtonManipulator.remove(this.questionCreator.errorMessagePreview);
            }, 5000);
        }

        saveQuiz() {
            let completeQuizMessage = "Les modifications ont bien été enregistrées",
                imcompleteQuizMessage = "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide",
                errorMessage = "Entrer un nom valide pour enregistrer";
            if (this.quizName !== "" && this.quizName.match(TITLE_REGEX)) {
                let quiz = this.getObjectToSave();
                this.quiz.isValid = true;
                quiz.tabQuestions.forEach(question => {
                    question.questionType && question.questionType.validationTab.forEach((funcEl) => {
                        var result = funcEl(question);
                        this.quiz.isValid = this.quiz.isValid && result.isValid;
                    });
                });
                this.quiz.isValid ? this.displayMessage(completeQuizMessage, myColors.green) : this.displayMessage(imcompleteQuizMessage, myColors.orange);
                Server.replaceQuiz(quiz, this.parentFormation._id, this.quiz.levelIndex, this.quiz.gameIndex, ignoredData)
                    .then(() => {
                        svg.addEvent(this.saveQuizButtonManipulator.ordonator.children[0], "click", ()=> {
                        });
                        svg.addEvent(this.saveQuizButtonManipulator.ordonator.children[1], "click", ()=> {
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

    class Game {
        constructor(game, parentFormation) {
            this.id = game.id;
            this.miniatureManipulator = new Manipulator(this);
            this.parentFormation = parentFormation || game.parentFormation;
            this.title = game.title || '';
            this.miniaturePosition = {x: 0, y: 0};
            this.returnButtonManipulator = new Manipulator(this);
            this.manipulator = new Manipulator(this);
        }
        isChildOf(parentGame){
            return parentGame.parentFormation.links.some((link) => link.parentGame === parentGame.id && link.childGame === this.id);
        };
    }

    class Quiz extends Game{
        constructor(quiz, previewMode, parentFormation) {
            super(quiz, parentFormation);
            const returnText = playerMode ? (previewMode ? "Retour aux résultats" : "Retour à la formation") : "Retour à l'édition du jeu";
            this.returnButton = new ReturnButton(this, returnText);
            this.manipulator.add(this.returnButtonManipulator);
            this.expButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.add(this.expButtonManipulator);
            this.chevronManipulator = new Manipulator(this);
            this.leftChevronManipulator = new Manipulator(this).addOrdonator(1);
            this.rightChevronManipulator = new Manipulator(this).addOrdonator(1);
            this.manipulator.add(this.chevronManipulator);
            this.chevronManipulator.add(this.leftChevronManipulator);
            this.chevronManipulator.add(this.rightChevronManipulator);
            this.loadQuestions(quiz);
            this.levelIndex = quiz.levelIndex || 0;
            this.gameIndex = quiz.gameIndex || 0;
            (previewMode) ? (this.previewMode = previewMode) : (this.previewMode = false);
            quiz.puzzleRows ? (this.puzzleRows = quiz.puzzleRows) : (this.puzzleRows = 3);
            quiz.puzzleLines ? (this.puzzleLines = quiz.puzzleLines) : (this.puzzleLines = 3);
            quiz.font && (this.font = quiz.font);
            quiz.fontSize ? (this.fontSize = quiz.fontSize) : (this.fontSize = 20);
            quiz.colorBordure ? (this.colorBordure = quiz.colorBordure) : (this.colorBordure = myColors.black);
            quiz.bgColor ? (this.bgColor = quiz.bgColor) : (this.bgColor = myColors.none);
            this.resultArea = {
                x: drawing.width / 2,
                y: 220,
                w: drawing.width,
                h: 200
            };
            this.titleArea = {
                x: 0,
                y: 0,
                w: drawing.width,
                h: 200
            };
            this.questionArea = {
                x: 0,
                y: 210,
                w: drawing.width,
                h: 200
            };
            this.miniaturePosition = {x: 0, y: 0};
            this.questionsAnswered = quiz.questionsAnswered ? quiz.questionsAnswered : [];
            this.score = (quiz.score ? quiz.score : 0);
            this.currentQuestionIndex = quiz.currentQuestionIndex ? quiz.currentQuestionIndex : -1;
        }

        loadQuestions(quiz) {
            if (quiz && typeof quiz.tabQuestions !== 'undefined') {
                this.tabQuestions = [];
                quiz.tabQuestions.forEach(it => {
                    it.questionType = it.multipleChoice ? myQuestionType.tab[1] : myQuestionType.tab[0];
                    let tmp = new Question(it, this);
                    tmp.parentQuiz = this;
                    this.tabQuestions.push(tmp);
                });
            } else {
                this.tabQuestions = [];
                this.tabQuestions.push(new Question(defaultQuestion, this));
            }
        }

        run(x, y, w, h) {
            let intervalToken = svg.interval(() => {
                if (this.tabQuestions.every(e => e.imageLoaded && e.tabAnswer.every(el => el.imageLoaded))) {
                    svg.clearInterval(intervalToken);
                    this.display(x, y, w, h);
                }
            }, 100);
        }

        displayCurrentQuestion() {
            if (this.tabQuestions[this.currentQuestionIndex].imageSrc) {
                this.questionHeight = this.questionHeightWithImage;
                this.answerHeight = this.answerHeightWithImage;
            } else {
                this.questionHeight = this.questionHeightWithoutImage;
                this.answerHeight = this.answerHeightWithoutImage;
            }
            this.manipulator.add(this.tabQuestions[this.currentQuestionIndex].manipulator);
            this.tabQuestions[this.currentQuestionIndex].manipulator.flush();
            this.tabQuestions[this.currentQuestionIndex].display(this.x, this.headerHeight + this.questionHeight / 2 + MARGIN,
                this.questionArea.w, this.questionHeight);
            this.rightChevron.update(this);
            this.leftChevron.update(this);
            !this.previewMode && this.tabQuestions[this.currentQuestionIndex].manipulator.add(this.tabQuestions[this.currentQuestionIndex].answersManipulator);
            this.tabQuestions[this.currentQuestionIndex].displayAnswers(this.questionArea.w, this.answerHeight);
        }

        // !_! bof, y'a encore des display appelés ici
        nextQuestion() {
            if (this.currentQuestionIndex !== -1) {
                this.manipulator.remove(this.tabQuestions[this.currentQuestionIndex].manipulator);
            }

            if (this.previewMode) {
                if (this.currentQuestionIndex === -1) {
                    this.currentQuestionIndex++;
                }
                this.displayCurrentQuestion();
            } else {
                Server.sendProgressToServer(this)
                    .then(() => {
                        if (++this.currentQuestionIndex < this.tabQuestions.length) {
                            this.displayCurrentQuestion();
                        } else {
                            this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, this.getQuestionsWithBadAnswers(), "leftToRight", this);
                            this.displayResult();
                        }
                    });
            }
        }

        getQuestionsWithBadAnswers() {
            let questionsWithBadAnswers = [],
                allRight = false;
            this.questionsAnswered.forEach(questionAnswered => {
                let question = questionAnswered.question;
                if (question.multipleChoice) {
                    if (question.rightAnswers.length !== questionAnswered.validatedAnswers.length) {
                        questionsWithBadAnswers.push(question);
                    } else {
                        let subTotal = 0;
                        questionAnswered.validatedAnswers.forEach((e)=> {
                            if (question.tabAnswer[e].correct) {
                                subTotal++;
                            }
                        });
                        allRight = (subTotal === question.rightAnswers.length);
                        !allRight && questionsWithBadAnswers.push(question);
                    }
                } else if (!question.multipleChoice && !question.tabAnswer[questionAnswered.validatedAnswers[0]].correct) {
                    questionsWithBadAnswers.push(question);
                }

            });
            return questionsWithBadAnswers;
        }
    }

    class Bd extends Game {
        constructor(bd, parentFormation) {
            super(bd,parentFormation);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.manipulator.add(this.returnButtonManipulator);
        }
    }

    class InscriptionManager {
        constructor() {
            this.manipulator = new Manipulator(this);
            this.header = new Header("Inscription");
            this.firstNameManipulator = new Manipulator(this).addOrdonator(4);
            this.lastNameManipulator = new Manipulator(this).addOrdonator(4);
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordConfirmationManipulator = new Manipulator(this).addOrdonator(3);
            this.saveButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.firstNameManipulator);
            this.manipulator.add(this.lastNameManipulator);
            this.manipulator.add(this.mailAddressManipulator);
            this.manipulator.add(this.passwordManipulator);
            this.manipulator.add(this.passwordConfirmationManipulator);
            this.manipulator.add(this.saveButtonManipulator);
            this.saveButtonHeightRatio = 0.075;
            this.saveButtonWidthRatio = 0.25;
            this.lastNameLabel = "Nom :";
            this.firstNameLabel = "Prénom :";
            this.mailAddressLabel = "Adresse mail :";
            this.passwordLabel = "Mot de passe :";
            this.passwordConfirmationLabel = "Confirmer votre mot de passe :";
            this.lastNameLabel = "Nom :";
            this.saveButtonLabel = "S'enregistrer";
            this.tabForm = [];
            this.formLabels = {};
        }
    }
////////////////// end of InscriptionManager.js //////////////////////////

////////////////// ConnexionManager.js //////////////////////////
    class ConnexionManager {
        constructor() {
            this.manipulator = new Manipulator(this).addOrdonator(6);
            this.header = new Header("Connexion");
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordManipulator = new Manipulator(this).addOrdonator(4);
            this.connexionButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.mailAddressManipulator);
            this.manipulator.add(this.passwordManipulator);
            this.manipulator.add(this.connexionButtonManipulator);
            this.mailAddressLabel = "Adresse mail :";
            this.passwordLabel = "Mot de passe :";
            this.connexionButtonLabel = "Connexion";
            this.tabForm = [];

            let listFormations = () => {
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new FormationsManager(myFormations);
                    globalVariables.formationsManager.display();
                });
            };

            this.connexionButtonHandler = () => {
                // ** DMA3622 debug
                //console.log(this.tabForm);
                let emptyAreas = this.tabForm.filter(field => field.label === '');
                emptyAreas.forEach(emptyArea => {
                    emptyArea.border.color(myColors.white, 3, myColors.red);
                });
                // ** DMA3622 debug
                //console.log(emptyAreas);
                if (emptyAreas.length > 0) {
                    let message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                    svg.timeout(()=> {
                        this.connexionButtonManipulator.unset(3);
                        emptyAreas.forEach(emptyArea => {
                            emptyArea.border.color(myColors.white, 1, myColors.black);
                        });
                    }, 5000);
                } else {
                    Server.connect(this.mailAddressField.label, this.passwordField.labelSecret).then(data => {
                        data = data && JSON.parse(data);
                        if (data.ack === 'OK') {
                            drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                            data.user.admin ? globalVariables.GUI.AdminGUI() : globalVariables.GUI.LearningGUI();
                            listFormations();
                        } else {
                            let message = autoAdjustText('Adresse et/ou mot de passe invalide(s)', drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                            message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                            svg.timeout(() => {
                                this.connexionButtonManipulator.unset(3);
                            }, 5000);
                        }
                    });
                }
            };
        }
    }
////////////////// end of ConnexionManager.js //////////////////////////

    return {
        setGlobalVariables,
        AddEmptyElement,
        Answer,
        Bd,
        ConnexionManager,
        Formation,
        FormationsManager,
        GamesLibrary,
        ImagesLibrary,
        Header,
        InscriptionManager,
        Level,
        Library,
        PopIn,
        Question,
        QuestionCreator,
        Quiz,
        QuizManager
    }
};