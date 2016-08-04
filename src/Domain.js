exports.Domain = function (globalVariables) {

    let iRuntime, imageController;

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

    // const ImageRuntime = {
    //     images: {},
    //     count: 0,
    //
    //     getImage: function (imgUrl, onloadHandler) {
    //         this.count++;
    //         const image = {
    //             src: imgUrl,
    //             onload: onloadHandler,
    //             id: "i" + this.count
    //         };
    //         this.images[image.id] = image;
    //         return image;
    //     },
    //
    //     imageLoaded: function (id, w, h) {
    //         this.images[id].width = w;
    //         this.images[id].height = h;
    //         this.images[id].onload();
    //     }
    // };

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
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(8);
            this.explanationIconManipulator = new Manipulator(this).addOrdonator(5);
            this.label = answer.label;
            this.imageSrc = answer.imageSrc;
            this.correct = answer.correct;
            this.selected = false;
            this.validLabelInput = answer.validLabelInput !== undefined ? answer.validLabelInput : true;
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

            this.bordure = null;
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
            this.linesManipulator = new Manipulator(this);
            this.linesManipulator.addOrdonator(4);
            this.manipulator.last.add(this.linesManipulator.first);
            this.penManipulator = new Manipulator(this);
            this.penManipulator.addOrdonator(4);
            this.manipulator.last.add(this.penManipulator.first);
            this.editable = editable;
            this.labelDefault = "Double cliquer pour modifier et cocher si bonne réponse.";
            this._acceptDrop = editable;
            this.editor = editor;
            this.checkInputContentArea = editable ? ((objCont) => {
                if (typeof objCont.contentarea.messageText !== "undefined") {
                    if (objCont.contentarea.messageText.match(REGEX)) {
                        this.validLabelInput = true;
                        this.label = objCont.contentarea.messageText;
                        objCont.remove();
                        //objCont.contentarea.onblur = objCont.onblur;
                    } else {
                        this.validLabelInput = false;
                        this.label = objCont.contentarea.messageText;
                        objCont.display();
                    }
                } else {
                    this.label = "";
                }
            }) : null;
        }
    }

    class Question {
        constructor(question, quizz) {
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(6);
            this.answersManipulator = new Manipulator(this);
            this.manipulator.last.add(this.answersManipulator.first);
            this.resetManipulator = new Manipulator(this);
            this.resetManipulator.addOrdonator(2);
            this.answersManipulator.last.add(this.resetManipulator.first);
            this.validateManipulator = new Manipulator(this);
            this.validateManipulator.addOrdonator(2);
            this.answersManipulator.last.add(this.validateManipulator.first);
            this.simpleChoiceMessageManipulator = new Manipulator(this);
            this.simpleChoiceMessageManipulator.addOrdonator(2);
            this.answersManipulator.last.add(this.simpleChoiceMessageManipulator.first);
            this.invalidQuestionPictogramManipulator = new Manipulator(this);
            this.invalidQuestionPictogramManipulator.addOrdonator(5);
            this.manipulator.last.add(this.invalidQuestionPictogramManipulator.first);

            this.validLabelInput = (question && question.validLabelInput !== undefined) ? question.validLabelInput : true;

            this.selected = false;
            this.parentQuizz = quizz;
            this.tabAnswer = [];
            this.fontSize = 20;
            this.questionNum = question && question.questionNum || this.parentQuizz.tabQuestions.length + 1;

            if (!question) {
                this.label = "";
                this.imageSrc = "";
                this.rows = 4;
                this.rightAnswers = [];
                this.tabAnswer = [new Answer(null, this), new Answer(null, this)];
                this.multipleChoice = false;
                this.font = "Arial";
                this.bgColor = myColors.white;
                this.colorBordure = myColors.black;
                this.selectedAnswers = [];

            } else {
                this.label = question.label;
                this.imageSrc = question.imageSrc;
                this.rows = question.rows;
                this.rightAnswers = [];
                this.multipleChoice = question.multipleChoice;
                this.selectedAnswers = question.selectedAnswers || [];

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

            this.lines = Math.floor(this.tabAnswer.length / this.rows); //+ 1;
            if (this.tabAnswer.length % this.rows !== 0) {
                this.lines += 1;
            }// else {
            //    this.lines = Math.floor(this.tabAnswer.length / this.rows) + 1;
            //}

            this.bordure = null;
            this.content = null;
        }

        remove() {
            let index = this.parentQuizz.tabQuestions.indexOf(this);
            if (index !== -1) {
                this.parentQuizz.tabQuestions.splice(index, 1);
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

        toggleInvalidQuestionPictogram(active) {
            let pictoSize = 20;
            if (active) {
                this.invalidQuestionPictogram = statusEnum.Edited.icon(pictoSize);
                this.invalidQuestionPictogramManipulator.ordonator.set(0, this.invalidQuestionPictogram.circle);
                this.invalidQuestionPictogramManipulator.ordonator.set(2, this.invalidQuestionPictogram.dot);
                this.invalidQuestionPictogramManipulator.ordonator.set(3, this.invalidQuestionPictogram.exclamation);
                this.invalidQuestionPictogramManipulator.translator.move(this.bordure.width / 2 - pictoSize, this.bordure.height / 2 - pictoSize);
            } else {
                this.invalidQuestionPictogramManipulator.ordonator.unset(0);
                this.invalidQuestionPictogramManipulator.ordonator.unset(2);
                this.invalidQuestionPictogramManipulator.ordonator.unset(3);
            }
        }
    }

    class QuestionCreator {
        constructor(parent, question) {
            this.MAX_ANSWERS = 8;
            this.parent = parent;

            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(2);
            this.manipulatorQuizzInfo = new Manipulator(this);
            //this.questionCreatorManipulator = new Manipulator(this);
            //this.questionCreatorManipulator.addOrdonator(2);
            this.questionManipulator = new Manipulator(this);
            this.questionManipulator.addOrdonator(6);
            this.toggleButtonManipulator = new Manipulator(this);
            this.previewButtonManipulator = new Manipulator(this);
            this.previewButtonManipulator.addOrdonator(2);
            this.manipulator.last.add(this.previewButtonManipulator.first);
            this.saveQuizButtonManipulator = new Manipulator(this);
            this.manipulator.last.add(this.saveQuizButtonManipulator.first);

            // this.validLabelInput = true;

            this.labelDefault = "Cliquer deux fois pour ajouter la question";
            this.questionType = myQuestionType.tab;
            this.toggleButtonHeight = 40;

            if (!question) {
                // init default : 2 empty answers
                this.linkedQuestion = new Question(defaultQuestion, this.parent.quizz);
            } else {
                this.loadQuestion(question);
            }
            this.puzzle = new Puzzle(2, 4, this.linkedQuestion.tabAnswer, "leftToRight", this);
            this.manipulator.last.add(this.puzzle.manipulator.first);
            this.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};
        }

        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(REGEX)) || myObj.textarea.messageText === "") {
                // this.validLabelInput = true;
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.display();
                // this.validLabelInput = false;
            }
        }

        loadQuestion(quest) {
            this.linkedQuestion = quest;
            quest.label && (this.label = quest.label);
            if (typeof quest.multipleChoice !== 'undefined') {
                this.multipleChoice = quest.multipleChoice;
            } else {
                this.multipleChoice = false;
            }
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
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(5);
            this.closeButtonManipulator = new Manipulator(this);
            this.closeButtonManipulator.addOrdonator(2);
            this.manipulator.ordonator.set(2, this.closeButtonManipulator.first);
            this.panelManipulator = new Manipulator(this);
            this.manipulator.last.add(this.panelManipulator.first);
            this.panelManipulator.addOrdonator(2);
            this.textManipulator = new Manipulator(this);
            this.textManipulator.addOrdonator(1);
            this.editable = editable;
            if (this.editable) {
                this.draganddropText = "Glisser-déposer une image de la bibliothèque vers le champ";
                this.defaultLabel = "Cliquer ici pour ajouter du texte";
            }
            if (answer.explanation && answer.explanation.label) {
                this.label = answer.explanation.label;
            }
            if (answer.explanation && answer.explanation.image) {
                this.image = answer.explanation.image;
            }
            answer.filled = this.image || this.label;
        }
    }

    class AddEmptyElement {
        constructor(parent, type) {
            this.manipulator = new Manipulator(this);

            this.manipulator.addOrdonator(3);

            type && (this.type = type);

            switch (type) {
                case 'question':
                    this.label = "Double cliquer pour ajouter une question";
                    this.validLabelInput = true;
                    break;
                case 'answer':
                    this.validLabelInput = true;
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
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(3);
            this.index = (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1]) ? (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1].index + 1) : 1;
            this.gamesTab = gamesTab ? gamesTab : [];
            this.x = this.parentFormation.libraryWidth ? this.parentFormation.libraryWidth : null; // Juste pour être sûr
            this.y = (this.index - 1) * this.parentFormation.levelHeight;
            this.obj = null;
        }

        removeGame(index) {
            if (typeof index === 'undefined') {
                this.gamesTab.pop();
            } else {
                this.gamesTab.splice(index, 1);
            }
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
            //this.header = new Header();
            this.headerManipulator = new Manipulator();
            this.headerManipulator.addOrdonator(1);
            this.addButtonManipulator = new Manipulator();
            this.addButtonManipulator.addOrdonator(4);
            this.checkManipulator = new Manipulator();
            this.checkManipulator.addOrdonator(4);
            this.exclamationManipulator = new Manipulator();
            this.exclamationManipulator.addOrdonator(4);
            this.formationsManipulator = new Manipulator();
            this.clippingManipulator = new Manipulator(this);

            /* for Player */
            this.toggleFormationsManipulator = new Manipulator(this);
            this.toggleFormationsManipulator.addOrdonator(3);
        }
    }

    class Formation {
        constructor(formation, formationsManager) {
            this.gamesCounter = {
                quizz: 0,
                bd: 0
            };
            this.link = [];
            this._id = (formation._id || null);
            this.formationId = (formation.formationId || null);
            this.progress = formation.progress;
            this.formationsManager = formationsManager;
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(5);
            this.formationInfoManipulator = new Manipulator(this);
            this.formationInfoManipulator.addOrdonator(3);
            this.graphManipulator = new Manipulator(this);
            this.graphManipulator.addOrdonator(10);
            this.messageDragDropManipulator = new Manipulator(this);
            this.messageDragDropManipulator.addOrdonator(2);
            this.arrowsManipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this);
            this.graphManipulator.last.add(this.miniaturesManipulator.first);
            this.graphManipulator.last.add(this.arrowsManipulator.first);
            this.clippingManipulator = new Manipulator(this);
            this.saveFormationButtonManipulator = new Manipulator(this);
            this.saveFormationButtonManipulator.addOrdonator(2);
            this.publicationFormationButtonManipulator = new Manipulator(this);
            this.publicationFormationButtonManipulator.addOrdonator(2);
            this.deactivateFormationButtonManipulator = new Manipulator(this);
            this.deactivateFormationButtonManipulator.addOrdonator(2);
            this.library = new GamesLibrary(myLibraryGames);
            this.library.formation = this;
            this.quizzManager = new QuizzManager(null, this);
            this.returnButtonManipulator = new Manipulator(this);
            this.returnButtonManipulator.addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour aux formations");
            this.labelDefault = "Entrer le nom de la formation";
            //this.needUpdate = true;
            // WIDTH
            this.libraryWidthRatio = 0.15;
            this.graphWidthRatio = 1 - this.libraryWidthRatio;
            // HEIGHT
            this.graphCreaHeightRatio = 0.85;
            //this.graphPlayHeightRatio = 0.90;

            this.x = MARGIN;
            this.regex = FORMATION_TITLE_REGEX;
            // this.maxGameInARowMessage = "Le nombre maximum de jeux dans ce niveau est atteint.";
            // this.targetLevelIndex = 0;
            this.levelsTab = [];
            this.gamesTab = [];
            this.saveButtonHeightRatio = 0.07;
            this.publicationButtonHeightRatio = 0.07;
            this.marginRatio = 0.03;
            this.label = formation.label ? formation.label : "";
            this.status = formation.status ? formation.status : "NotPublished";
            this.validLabelInput = true ;

            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;

            this.levelHeight = 150;
            this.graphElementSize = this.levelHeight * 0.65;
            this.miniature = new MiniatureFormation(this);

            this.redim();
            this.manipulator.last.add(this.saveFormationButtonManipulator.first);
            this.manipulator.last.add(this.publicationFormationButtonManipulator.first);
            this.manipulator.last.add(this.deactivateFormationButtonManipulator.first);
        }

        dropAction(event,game){

            let getDropLocation = event => {
                let dropLocation = this.panel.back.localPoint(event.pageX, event.pageY);
                dropLocation.y -= this.panel.contentV.y;
                dropLocation.x -= this.panel.contentV.x;
                return dropLocation;
            };
            let getLevel = (dropLocation) => {
                let level = -1;
                while(dropLocation.y > -this.panel.content.height/2) {
                    dropLocation.y -= this.levelHeight;
                    level++;
                }
                if (level >= this.levelsTab.length) {
                    level = this.levelsTab.length;
                    this.addNewLevel(level);
                }
                return level;
            };
            let getColumn = (dropLocation, level)=>{
                let column=this.levelsTab[level].gamesTab.length;
                for(let i=0; i<this.levelsTab[level].gamesTab.length; i++){
                    if(dropLocation.x<this.levelsTab[level].gamesTab[i].miniaturePosition.x){
                        column = i;
                        break;
                    }
                }
                return column;
            };

            let dropLocation=getDropLocation(event);
            let level =getLevel(dropLocation);
            let column = getColumn(dropLocation, level);
            if(game){
                this.moveGame(game, level, column);
                game.levelIndex === level || game.miniature.removeAllLinks();
            }else{
                this.addNewGame(level, column)
            }
            this.library.gameSelected && this.library.gameSelected.miniature.cadre.color(myColors.white, 1, myColors.black);
            this.displayGraph();
        }

        addNewGame (level, column) {
            let gameBuilder = this.library.draggedObject || this.library.gameSelected || null;
            gameBuilder.create(this, level, column);
        }

        moveGame(game, level, column) {
            this.levelsTab[game.levelIndex].gamesTab.splice(game.gameIndex,1);
            this.levelsTab[level].gamesTab.splice(column,0 ,game);
        }

        createLink (parentGame, childGame) {

            let isChildOf = function (parentGame,childGame){
                parentGame.parentFormation.link.some((links) => links.parentGame === parentGame.id && links.childGame === childGame.id);
            };
            if (isChildOf(parentGame, childGame)) return;
            if (parentGame.levelIndex >= childGame.levelIndex) return;
            this.link.push({parentGame : parentGame.id, childGame : childGame.id});
        };

        deactivateFormation() {
        this.status = "NotPublished";
        Server.deactivateFormation(this.formationId, ignoredData)
            .then(() => {
                this.manipulator.flush();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    let formationsManager = new FormationsManager(myFormations);
                    formationsManager.display();
                });
            })
    }

        saveFormation (displayQuizzManager, status = "Edited") {
        const
            messageSave = "Votre travail a bien été enregistré.",
            messageError = "Vous devez remplir correctement le nom de la formation.",
            messageReplace =  "Les modifications ont bien été enregistrées.",
            messageUsedName = "Le nom de cette formation est déjà utilisé !",
            messageNoModification = "Les modifications ont déjà été enregistrées.";

            const displayMessage = (message, displayQuizzManager) => {
                let error = false;
                switch (message) {
                    case messageError:
                    case messageUsedName:
                        error = true;
                        break;
                    default:
                        error = false;
                }

                if (this.publicationFormationButtonManipulator.last.children.indexOf(this.errorMessagePublication) !== -1) {
                    this.publicationFormationButtonManipulator.last.remove(this.errorMessagePublication);
                }
                if (displayQuizzManager) {
                    displayQuizzManager();
                } else {
                    (this.manipulator.last.children.indexOf(this.message) !== -1) && this.manipulator.last.remove(this.message);
                    const messageY = this.saveFormationButton.cadre.globalPoint(0, 0).y;
                    this.message = new svg.Text(message)
                        .position(drawing.width/2, messageY - this.saveFormationButton.cadre.height*1.5 - MARGIN)
                        .font("Arial", 20)
                        .mark("formationErrorMessage")
                        .anchor('middle').color(error ? myColors.red : myColors.green);
                    this.manipulator.last.add(this.message);
                    svg.timeout(() => {
                        if (this.manipulator.last.children.indexOf(this.message) !== -1) {
                            this.manipulator.last.remove(this.message);
                        }
                    }, 5000);
                }
            };

        const returnToFormationList = () => {
            this.manipulator.flush();
            Server.getAllFormations().then(data => {
                let myFormations = JSON.parse(data).myCollection;
                let formationsManager = new FormationsManager(myFormations);
                formationsManager.display();
            });
        };

        if (this.label && this.label !== this.labelDefault && this.label.match(this.regex)) {
            const getObjectToSave = () => {
                const levelsTab = [];
                const gamesCounter = {quizz: 0 , bd : 0};
                this.levelsTab.forEach((level, i) => {
                    const gamesTab = [];
                    levelsTab.push({gamesTab: gamesTab});
                    level.gamesTab.forEach(game => {
                        if (game.tabQuestions) {
                            game.id || (game.id = "quizz"  + gamesCounter.quizz);
                            gamesCounter.quizz ++;
                        } else {
                            game.id || (game.id = "bd" + gamesCounter.bd);
                            gamesCounter.bd ++;
                        }
                        levelsTab[i].gamesTab.push(game);
                    });
                });
                return {label: this.label, gamesCounter: this.gamesCounter, link: this.link, levelsTab: levelsTab};
            };

            let addNewFormation = () => {
                Server.insertFormation(getObjectToSave(), status, ignoredData)
                    .then(data => {
                        let answer = JSON.parse(data);
                        if(answer.saved) {
                            this._id = answer.idVersion;
                            this.formationId = answer.id;
                            status === "Edited" ? displayMessage(messageSave, displayQuizzManager) : returnToFormationList();
                        } else {
                            if(answer.reason === "NameAlreadyUsed") {
                                throw messageUsedName;
                            }
                        }
                    });
                    // .catch(()=>displayMessage(messageSave, displayQuizzManager));
            };

            let replaceFormation = () => {
                Server.replaceFormation(this._id, getObjectToSave(), status, ignoredData)
                    .then((data) => {
                        let answer = JSON.parse(data);
                        if(answer.saved) {
                            status === "Edited" ? displayMessage(messageReplace, displayQuizzManager) : returnToFormationList();
                        } else {
                            if(answer.reason === "NoModif") {
                                throw messageNoModification;
                            } else if(answer.reason === "NameAlreadyUsed") {
                                throw messageUsedName;
                            }
                        }
                    })
                    .catch(()=>displayMessage(messageSave, displayQuizzManager));
            };

                this._id ? replaceFormation() : addNewFormation();
            } else {
                displayMessage(messageError, displayQuizzManager);
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
                if (this.saveFormationButtonManipulator.last.children.indexOf(this.message) !== -1) {
                    this.saveFormationButtonManipulator.last.remove(this.message);
                }
                this.formationInfoManipulator.ordonator.unset(2);
                (this.publicationFormationButtonManipulator.last.children.indexOf(this.errorMessagePublication) !== -1) && this.publicationFormationButtonManipulator.last.remove(this.errorMessagePublication);
                this.errorMessagePublication = new svg.Text(messagePublication);
                this.publicationFormationButtonManipulator.last.add(this.errorMessagePublication);
                this.errorMessagePublication.position(-this.buttonWidth, -this.publicationButtonHeight / 2 - MARGIN)
                    .font("Arial", 20)
                    .anchor('middle').color(myColors.red)
                    .mark("errorMessagePublication");

                svg.timeout(() => {
                    if (this.publicationFormationButtonManipulator.last.children.indexOf(this.errorMessagePublication) !== -1) {
                        this.publicationFormationButtonManipulator.last.remove(this.errorMessagePublication);
                    }
                }, 5000);
            };

            this.publicationFormationQuizzManager();
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
            formation.link ? this.link = formation.link : this.link = [];
            formation.levelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    game.tabQuestions && gamesTab.push(new Quizz(game, false, this));
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
            this.link.forEach(linkElement => {
                if (linkElement.childGame === game.id) {
                    const parentGame = this.findGameById(linkElement.parentGame);
                    if (parentGame && (parentGame.status === undefined || (parentGame.status && parentGame.status !== "done"))) {
                        available = false;
                        return available;
                    }
                }
            });
            return available;
        }

        redim() {
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
                this.validLabelInput = true;
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.display();
                this.validLabelInput = false;
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
                this.library.gameSelected && this.library.gameSelected.miniature.cadre.color(myColors.white, 1, myColors.black);
                this.library.gameSelected = null;
                svg.removeEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            };
            if (this.library.gameSelected) {
                svg.addEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
                svg.addEvent(this.messageDragDrop, "mouseup", this.mouseUpGraphBlock);
            }
        }

        adjustGamesPositions (level) {
            let computeIndexes =() => {
                for (let i = 0; i < this.levelsTab.length; i++) {
                    for(let j = 0; j < this.levelsTab[i].gamesTab.length; j++) {
                        this.levelsTab[i].gamesTab[j].levelIndex = i;
                        this.levelsTab[i].gamesTab[j].gameIndex = j;
                    }
                }
            };

            computeIndexes();
            var nbOfGames = level.gamesTab.length;
            var spaceOccupied = nbOfGames * this.minimalMarginBetweenGraphElements + this.graphElementSize * nbOfGames;
            level.gamesTab.forEach(game => {
                game.miniaturePosition.x = this.minimalMarginBetweenGraphElements * (3 / 2) + (game.gameIndex - nbOfGames / 2) * spaceOccupied / nbOfGames;
                game.miniaturePosition.y = -this.panel.height / 2 + (level.index - 1 / 2) * this.levelHeight;
            });
        }

        trackProgress (displayFunction) {
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

                            theGame.currentQuestionIndex = game.index;
                            theGame.questionsWithBadAnswers = [];
                            game.tabWrongAnswers.forEach(wrongAnswer => {
                                theGame.questionsWithBadAnswers.add({
                                    index: wrongAnswer.index - 1,
                                    question: theGame.tabQuestions[wrongAnswer.index - 1],
                                    selectedAnswers: wrongAnswer.selectedAnswers
                                });
                            });
                            theGame.score = game.index - theGame.questionsWithBadAnswers.length;
                            theGame.status = (game.index === theGame.tabQuestions.length) ? "done" : "inProgress";
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
            this.libraryManipulator = new Manipulator(this);
            this.libraryManipulator.addOrdonator(3);
            this.itemsTab = [];
            this.libraryManipulators = [];
        }
    }

    class GamesLibrary extends Library {

        constructor (lib) {
            super();
            this.title = lib.title;
            this.font = lib.font ;
            this.fontSize = lib.fontSize ;
            this.itemsTab = lib.tab;
            for (let i = 0; i < this.itemsTab.length; i++) {
                this.libraryManipulators[i] = new Manipulator(this.itemsTab[i]);
                this.libraryManipulators[i].addOrdonator(2);
            }
            this.arrowModeManipulator = new Manipulator(this);
            this.arrowModeManipulator.addOrdonator(3);
        }

    }

    class ImagesLibrary extends Library {
        constructor() {
            super();
            this.title = "Bibliothèque";
            this.font = "Courier New";
            this.imageWidth = 50;
            this.imageHeight = 50;
            this.addButtonManipulator = new Manipulator(this);
            this.addButtonManipulator.addOrdonator(3);
        }

        dropAction(element, event) {
            let target = drawings.background.getTarget(event.pageX, event.pageY);
            if (target && target._acceptDrop) {
                if (target.parent.parentManip.parentObject.answer) {
                    target.parent.parentManip.parentObject.image = element.src;
                    let questionCreator = target.parent.parentManip.parentObject.answer.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                    target.parent.parentManip.parentObject.display(questionCreator, 0, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                }
                else {
                    var oldElement = {
                        cadre: target.parent.parentManip.ordonator.get(0),
                        content: target.parent.parentManip.ordonator.get(1)
                    };
                    target.parent.parentManip.ordonator.unset(0);
                    target.parent.parentManip.ordonator.unset(1);
                    var newElement = displayImageWithTitle(oldElement.content.messageText, element.src,
                        element.srcDimension,
                        oldElement.cadre.width, oldElement.cadre.height,
                        oldElement.cadre.strokeColor, oldElement.cadre.fillColor, null, null, target.parent.parentManip
                    );
                    oldElement.cadre.position(newElement.cadre.x, newElement.cadre.y);
                    oldElement.content.position(newElement.content.x, newElement.content.y);
                    newElement.image._acceptDrop = true;
                    newElement.image.name = element.name;
                    switch (true) {
                        case target.parent.parentManip.parentObject instanceof QuestionCreator:
                            let questionCreator = target.parent.parentManip.parentObject;
                            questionCreator.linkedQuestion.image = newElement.image;
                            questionCreator.linkedQuestion.imageSrc = newElement.image.src;
                            questionCreator.parent.displayQuestionsPuzzle(null, null, null, null, questionCreator.parent.questionPuzzle.startPosition);
                            questionCreator.display();
                            questionCreator.linkedQuestion.checkValidity();
                            break;
                        case target.parent.parentManip.parentObject instanceof Answer:
                            let answer = target.parent.parentManip.parentObject;
                            answer.image = newElement.image;
                            answer.imageSrc = newElement.image.src;
                            answer.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
                            answer.parentQuestion.checkValidity();
                            break;
                    }
                    target.parent.parentManip.ordonator.set(0, oldElement.cadre);
                }

            }
        }
    }

    class Header {
        constructor() {
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(3);
            this.userManipulator = new Manipulator(this);
            this.userManipulator.addOrdonator(6);
            this.label = "I-learning";
            this.size = HEADER_SIZE;
        }
    }


    class QuizzManager {
        constructor(quizz, formation) {
            this.quizzName = "";
            this.quizzNameDefault = "Ecrire ici le nom du quiz";
            this.tabQuestions = [defaultQuestion];
            this.parentFormation = formation;
            //this.questionPuzzle = {};
            this.quizzNameValidInput = true;
            if (!quizz) {
                var initialQuizzObject = {
                    title: defaultQuizz.title,
                    bgColor: myColors.white,
                    tabQuestions: this.tabQuestions,
                    puzzleLines: 3,
                    puzzleRows: 3
                };
                this.quizz = new Quizz(initialQuizzObject, false, this.parentFormation);
                this.indexOfEditedQuestion = 0;
                this.quizzName = this.quizz.title;
            } else {
                this.loadQuizz(quizz);
            }
            this.questionCreator = new QuestionCreator(this, this.quizz.tabQuestions[this.indexOfEditedQuestion]);
            //this.header = new Header();
            this.library = new ImagesLibrary();
            this.quizz.tabQuestions[0].selected = true;
            this.questionCreator.loadQuestion(this.quizz.tabQuestions[0]);
            this.quizz.tabQuestions.push(new AddEmptyElement(this, 'question'));
            this.quizzManagerManipulator = new Manipulator(this);
            this.questionsPuzzleManipulator = new Manipulator(this);
            this.questionsPuzzleManipulator.addOrdonator(1);
            this.quizzInfoManipulator = new Manipulator(this);
            this.quizzInfoManipulator.addOrdonator(6);
            //this.questionCreatorManipulator = this.questionCreator.manipulator;
            //this.questionCreatorManipulator.addOrdonator(2);
            this.previewButtonManipulator = new Manipulator(this);
            this.previewButtonManipulator.addOrdonator(2);
            this.saveQuizButtonManipulator = new Manipulator(this);
            this.saveQuizButtonManipulator.addOrdonator(2);
            this.returnButtonManipulator = new Manipulator(this);
            this.returnButtonManipulator.addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.libraryIManipulator = this.library.libraryManipulator;

            // WIDTH
            this.libraryWidthRatio = 0.15;
            this.questCreaWidthRatio = 1 - this.libraryWidthRatio;

            // HEIGHT
            this.quizzInfoHeightRatio = 0.05;
            this.questionsPuzzleHeightRatio = 0.25;
            this.questCreaHeightRatio = 0.57;
            this.libraryHeightRatio = this.questCreaHeightRatio;
            this.previewButtonHeightRatio = 0.1;
            this.saveButtonHeightRatio = 0.1;
            this.marginRatio = 0.02;

            this.questionPuzzle = new Puzzle(1, 6, this.quizz.tabQuestions, "leftToRight", this);
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

    loadQuizz (quizz, indexOfEditedQuestion) {
        this.indexOfEditedQuestion = (indexOfEditedQuestion && indexOfEditedQuestion!==-1 ? indexOfEditedQuestion: 0) ;
        this.quizz = new Quizz(quizz, false, this.parentFormation);
        this.quizzName = this.quizz.title;
        this.quizz.tabQuestions[this.indexOfEditedQuestion].selected = true;
        this.questionCreator.loadQuestion(this.quizz.tabQuestions[this.indexOfEditedQuestion]);
        this.quizz.tabQuestions.forEach( (question, index )  => {
            //(question.questionType = myQuestionType.tab.find(type => type.label === quizz.tabQuestions[index].questionType.label));
            (question.tabAnswer[question.tabAnswer.length-1] instanceof AddEmptyElement) || question.tabAnswer.push(new AddEmptyElement(this.questionCreator, 'answer'));
        });
        this.quizz.tabQuestions.push(new AddEmptyElement(this, 'question'));

        };

        getObjectToSave() {
            this.tabQuestions = this.quizz.tabQuestions;
            (this.tabQuestions[this.quizz.tabQuestions.length - 1] instanceof AddEmptyElement) && this.tabQuestions.pop();
            this.tabQuestions.forEach(question => {
                (question.tabAnswer[question.tabAnswer.length - 1] instanceof AddEmptyElement) && question.tabAnswer.pop();
                question.tabAnswer.forEach(answer => {
                    if (answer.popIn) {
                        answer.explanation = {};
                        answer.popIn.image && (answer.explanation.image = answer.popIn.image);
                        answer.popIn.label && (answer.explanation.label = answer.popIn.label);
                        answer.popIn = null;
                    }
                });
            });
            return {
                id: this.quizz.id,
                title: this.quizz.title,
                tabQuestions: this.quizz.tabQuestions,
                levelIndex: this.quizz.levelIndex,
                gameIndex: this.quizz.gameIndex
            };
        }

        displayMessage(message, color) {
            this.questionCreator.errorMessagePreview && this.questionCreator.errorMessagePreview.parent && this.previewButtonManipulator.last.remove(this.questionCreator.errorMessagePreview);
            this.questionCreator.errorMessagePreview = new svg.Text(message)
                .position(this.buttonWidth, -this.saveButton.cadre.height / 2 - MARGIN / 2)
                .font("Arial", 20)
                .anchor('middle').color(color);
            this.previewButtonManipulator.last.add(this.questionCreator.errorMessagePreview);
            setTimeout(() => {
                this.previewButtonManipulator.last.children.indexOf(this.questionCreator.errorMessagePreview) !== -1 && this.previewButtonManipulator.last.remove(this.questionCreator.errorMessagePreview);
            }, 5000);
        }

        saveQuizz() {
            let completeQuizzMessage = "Les modifications ont bien été enregistrées";
            let imcompleteQuizzMessage = "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide";
            let errorMessage = "Entrer un nom valide pour enregistrer";
            if (this.quizzName !== "" && this.quizzName.match(REGEX)) {
                let quiz = this.getObjectToSave();
                this.quizz.isValid = true;
                quiz.tabQuestions.forEach(question => {
                    question.questionType && question.questionType.validationTab.forEach((funcEl) => {
                        var result = funcEl(question);
                        this.quizz.isValid = this.quizz.isValid && result.isValid;
                    });
                });

                this.quizz.isValid ? this.displayMessage(completeQuizzMessage, myColors.green) : this.displayMessage(imcompleteQuizzMessage, myColors.orange);

                Server.replaceQuizz(quiz, this.parentFormation._id, this.quizz.levelIndex, this.quizz.gameIndex, ignoredData)
                    .then(() => {
                        svg.addEvent(this.saveButton.cadre, "click", ()=> {
                        });
                        svg.addEvent(this.saveButton.content, "click", ()=> {
                        });
                        this.quizz.tabQuestions = this.tabQuestions;
                        let quizz = this.parentFormation.levelsTab[this.quizz.levelIndex].gamesTab[this.quizz.gameIndex];
                        (this.parentFormation.miniaturesManipulator.last.children.indexOf(quizz.miniatureManipulator.first) !== -1) && this.parentFormation.miniaturesManipulator.last.remove(quizz.miniatureManipulator.first);
                        this.parentFormation.levelsTab[this.quizz.levelIndex].gamesTab[this.quizz.gameIndex] = this.quizz;
                        this.loadQuizz(this.parentFormation.levelsTab[this.quizz.levelIndex].gamesTab[this.quizz.gameIndex], this.quizz.parentFormation.quizzManager.indexOfEditedQuestion);
                        this.questionPuzzle.checkPuzzleElementsArrayValidity(this.questionPuzzle.elementsArray);
                        this.display();

                    });
            }
            else {
                this.displayMessage(errorMessage, myColors.red);
            }
        }

        checkInputTextArea(myObj) {
            if ((typeof myObj.textarea.messageText !== "undefined" && myObj.textarea.messageText.match(REGEX)) || myObj.textarea.messageText === "") {
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                !runtime && (myObj.textarea.border = "none");
                !runtime && (myObj.textarea.outline = "none");
                this.quizzNameValidInput = true;
            } else {
                myObj.display();
                this.quizzNameValidInput = false;
            }
        }

    }

    class Quizz {
        constructor(quizz, previewMode, parentFormation) {
            this.id = quizz.id;
            this.miniatureManipulator = new Manipulator(this);
            this.parentFormation = parentFormation || quizz.parentFormation;
            this.quizzManipulator = new Manipulator(this);
            this.quizzManipulator.addOrdonator(2);
            this.returnButtonManipulator = new Manipulator(this);
            this.returnButton = playerMode ? (previewMode ? new ReturnButton(this, "Retour aux résultats") : new ReturnButton(this, "Retour à la formation")) : new ReturnButton(this, "Retour à l'édition du jeu");
            this.quizzManipulator.last.add(this.returnButtonManipulator.first);

            if (previewMode) {
                this.chevronManipulator = new Manipulator(this);
                this.leftChevronManipulator = new Manipulator(this);
                this.rightChevronManipulator = new Manipulator(this);
                this.leftChevronManipulator.addOrdonator(1);
                this.rightChevronManipulator.addOrdonator(1);
                this.quizzManipulator.last.add(this.chevronManipulator.first);
                this.chevronManipulator.last.add(this.leftChevronManipulator.first);
                this.chevronManipulator.last.add(this.rightChevronManipulator.first);
            }
            this.loadQuestions(quizz);
            if (this.levelIndex === undefined) {
                this.levelIndex = quizz.levelIndex;
            }
            if (this.gameIndex === undefined) {
                this.gameIndex = quizz.gameIndex;
            }
            (previewMode) ? (this.previewMode = previewMode) : (this.previewMode = false);
            quizz.puzzleRows ? (this.puzzleRows = quizz.puzzleRows) : (this.puzzleRows = 2);
            quizz.puzzleLines ? (this.puzzleLines = quizz.puzzleLines) : (this.puzzleLines = 2);
            quizz.font && (this.font = quizz.font);
            quizz.fontSize ? (this.fontSize = quizz.fontSize) : (this.fontSize = 20);
            quizz.colorBordure ? (this.colorBordure = quizz.colorBordure) : (this.colorBordure = myColors.black);
            quizz.bgColor ? (this.bgColor = quizz.bgColor) : (this.bgColor = myColors.none);

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
            //this.questionsWithBadAnswers = [];
            this.questionsWithBadAnswers = quizz.questionsWithBadAnswers ? quizz.questionsWithBadAnswers : [];
            this.score = (quizz.score ? quizz.score : 0);
            this.drawing = drawing;
            this.title = quizz.title ? quizz.title : '';
            this.currentQuestionIndex = quizz.currentQuestionIndex ? quizz.currentQuestionIndex : -1;
            this.finalMessage = "";
        }

        loadQuestions(quizz) {
            if (quizz && typeof quizz.tabQuestions !== 'undefined') {
                this.tabQuestions = [];
                quizz.tabQuestions.forEach(it => {
                    it.questionType = it.multipleChoice ? myQuestionType.tab[1] : myQuestionType.tab[0];
                    var tmp = new Question(it, this);
                    //it.questionType && (tmp.questionType = it.questionType);
                    tmp.parentQuizz = this;
                    this.tabQuestions.push(tmp);
                });
            } else {
                this.tabQuestions = [];
                this.tabQuestions.push(new Question(defaultQuestion, this));
                this.tabQuestions.push(new Question(defaultQuestion, this));
            }
        }

        run(x, y, w, h) {
            var intervalToken = runtime.interval(() => {
                if (this.tabQuestions.every(e => e.imageLoaded && e.tabAnswer.every(el => el.imageLoaded))) {
                    runtime.clearInterval(intervalToken);
                    this.display(x, y, w, h);
                }
            }, 100);
            // runtime && this.tabQuestions.forEach(e => {
            //     e.image && imageController.imageLoaded(e.image.id, myImagesSourceDimensions[e.image.src].width, myImagesSourceDimensions[e.image.src].height);
            //     e.tabAnswer.forEach(el => {
            //         el.image && imageController.imageLoaded(el.image.id, myImagesSourceDimensions[el.image.src].width, myImagesSourceDimensions[el.image.src].height);
            //     });
            //
            // });
            // runtime && this.display(x, y, w, h);
        }

        displayCurrentQuestion() {
            if (this.tabQuestions[this.currentQuestionIndex].imageSrc) {
                this.questionHeight = this.questionHeightWithImage;
                this.answerHeight = this.answerHeightWithImage;
            } else {
                this.questionHeight = this.questionHeightWithoutImage;
                this.answerHeight = this.answerHeightWithoutImage;
            }
            this.quizzManipulator.last.children.indexOf(this.tabQuestions[this.currentQuestionIndex].manipulator.first) === -1 && this.quizzManipulator.last.add(this.tabQuestions[this.currentQuestionIndex].manipulator.first);
            this.tabQuestions[this.currentQuestionIndex].manipulator.flush();
            this.tabQuestions[this.currentQuestionIndex].display(this.x, this.headerHeight + this.questionHeight / 2 + MARGIN,
                this.questionArea.w, this.questionHeight);
            !this.previewMode && this.tabQuestions[this.currentQuestionIndex].manipulator.last.children.indexOf(this.tabQuestions[this.currentQuestionIndex].answersManipulator.translator) === -1 && this.tabQuestions[this.currentQuestionIndex].manipulator.last.add(this.tabQuestions[this.currentQuestionIndex].answersManipulator.translator);
            this.tabQuestions[this.currentQuestionIndex].displayAnswers(this.x, this.headerHeight + MARGIN + this.questionHeight,
                this.questionArea.w, this.answerHeight);
        }

        // !_! bof, y'a encore des display appelés ici
        nextQuestion() {
            if (this.currentQuestionIndex !== -1) {
                this.quizzManipulator.last.remove(this.tabQuestions[this.currentQuestionIndex].manipulator.first);
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
                            let questionsWithBadAnswersTab = [];
                            this.questionsWithBadAnswers.forEach(x => questionsWithBadAnswersTab.push(x.question));
                            this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, questionsWithBadAnswersTab, "leftToRight", this);
                            this.displayResult();
                        }
                    });
            }
        }

        getPositionInFormation() {
            var gameIndex, levelIndex;
            for (var i = 0; i < this.parentFormation.levelsTab.length; i++) {
                gameIndex = this.parentFormation.levelsTab[i].gamesTab.indexOf(this);
                if (gameIndex !== -1) {
                    break;
                }
            }
            levelIndex = i;
            this.levelIndex = levelIndex;
            this.gameIndex = gameIndex;
            return {levelIndex, gameIndex};
        }

    }

    class Bd {
        constructor(bd, parentFormation) {
            this.miniatureManipulator = new Manipulator(this);
            this.parentFormation = parentFormation;
            this.title = bd.title || "BD";
            this.miniaturePosition = {x: 0, y: 0};
            this.returnButtonManipulator = new Manipulator(this);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.manipulator = new Manipulator(this);
            this.manipulator.last.add(this.returnButtonManipulator.first);
        }

        getPositionInFormation() {
            var gameIndex, levelIndex;
            for (var i = 0; i < this.parentFormation.levelsTab.length; i++) {
                gameIndex = this.parentFormation.levelsTab[i].gamesTab.indexOf(this);
                if (gameIndex !== -1) {
                    break;
                }
            }
            levelIndex = i;
            this.levelIndex = levelIndex;
            this.gameIndex = gameIndex;
            return {levelIndex: levelIndex, gameIndex: gameIndex};
        }
    }

    class InscriptionManager {
        constructor() {
            this.manipulator = new Manipulator(this);
            this.header = new Header("Inscription");
            this.firstNameManipulator = new Manipulator(this);
            this.firstNameManipulator.addOrdonator(4);
            this.lastNameManipulator = new Manipulator(this);
            this.lastNameManipulator.addOrdonator(4);
            this.mailAddressManipulator = new Manipulator(this);
            this.mailAddressManipulator.addOrdonator(4);
            this.passwordManipulator = new Manipulator(this);
            this.passwordManipulator.addOrdonator(4);
            this.passwordConfirmationManipulator = new Manipulator(this);
            this.passwordConfirmationManipulator.addOrdonator(3);
            this.saveButtonManipulator = new Manipulator(this);
            this.saveButtonManipulator.addOrdonator(4);
            //this.errorMessageManipulator = new Manipulator(this);

            this.manipulator.last.add(this.firstNameManipulator.first);
            this.manipulator.last.add(this.lastNameManipulator.first);
            this.manipulator.last.add(this.mailAddressManipulator.first);
            this.manipulator.last.add(this.passwordManipulator.first);
            this.manipulator.last.add(this.passwordConfirmationManipulator.first);
            this.manipulator.last.add(this.saveButtonManipulator.first);
            //this.saveButtonManipulator.last.add(this.errorMessageManipulator.first);
            //this.errorMessageManipulator.addOrdonator(2);

            // HEIGHT
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
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(6);
            this.header = new Header("Connexion");
            this.mailAddressManipulator = new Manipulator(this);
            this.mailAddressManipulator.addOrdonator(4);
            this.passwordManipulator = new Manipulator(this);
            this.passwordManipulator.addOrdonator(4);
            this.connexionButtonManipulator = new Manipulator(this);
            this.connexionButtonManipulator.addOrdonator(4);

            this.manipulator.last.add(this.mailAddressManipulator.first);
            this.manipulator.last.add(this.passwordManipulator.first);
            this.manipulator.last.add(this.connexionButtonManipulator.first);

            // HEIGHT
            this.connexionButtonHeightRatio = 0.075;

            this.connexionButtonHeight = drawing.height * this.connexionButtonHeightRatio;
            this.connexionButtonWidth = 200;

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
                let emptyAreas = this.tabForm.filter(field => field.label === '');
                emptyAreas.forEach(emptyArea => {
                    emptyArea.cadre.color(myColors.white, 3, myColors.red);
                });
                if (emptyAreas.length > 0) {
                    let message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, -this.connexionButton.cadre.height + MARGIN);
                    svg.timeout(()=> {
                        this.connexionButtonManipulator.ordonator.unset(3);
                        emptyAreas.forEach(emptyArea => {
                            emptyArea.cadre.color(myColors.white, 1, myColors.black);
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
                            message.text.color(myColors.red).position(0, -this.connexionButton.cadre.height + MARGIN);
                            svg.timeout(() => {
                                this.connexionButtonManipulator.ordonator.unset(3);
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
        Quizz,
        QuizzManager
    }
};