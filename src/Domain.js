/**
 * Created by TDU3482 on 26/04/2016.
 */
var util, drawing, mainManipulator, iRuntime, runtime, imageController, asyncTimerController, svg;

setUtil = function(_util){
    util = _util;
};
setGlobalVariables = function(gv) {
    drawing = gv.drawing;
    mainManipulator = gv.mainManipulator;
    clientWidth = gv.clientWidth;
    clientHeight = gv.clientHeight;
};

setRuntime = function(_runtime){
    runtime = _runtime;
};

function setSvg(_svg) {
    svg = _svg;
    // call setSvg on modules
}

class Answer {
    constructor (answerParameters, parent) {
        this.parentQuestion = parent;
        var answer = {
            label: '',
            imageSrc: null,
            correct: false
        };
        answerParameters && (answer = answerParameters);
        this.manipulator = new Manipulator(this);
        this.manipulator.addOrdonator(6);
        this.label = answer.label;
        this.imageSrc = answer.imageSrc;
        this.correct = answer.correct;
        this.selected = false;
        this.answerNameValidInput = true;
        this.fontSize = answer.fontSize ? answer.fontSize : 20;
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

    remove () {
        let index = this.parentQuestion.tabAnswer.indexOf(this);
        if (index!== -1) {
            this.parentQuestion.tabAnswer.splice(index, 1);
            return true;
        } else {
            return false;
        }
    };

    isEditable (editor, editable) {
        this.editable = editable;
        this.labelDefault = "Double cliquer pour modifier et cocher si bonne réponse.";
        this._acceptDrop = editable;
        this.editor = editor;
        let self = this;
        this.checkInputContentArea = editable ? function (objCont) {
            if(typeof objCont.contentarea.messageText !== "undefined"){
                if (objCont.contentarea.messageText.match(REGEX)) {
                    self.label = objCont.contentarea.messageText;
                    objCont.remove();
                    objCont.contentarea.onblur = objCont.onblur;
                } else {
                    self.label = objCont.contentarea.messageText;
                    objCont.display();
                }
            }else{
                self.label = "";
            }
        } : null;
    }
}

class Question {
    constructor (question, quizz) {
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

        this.questionNameValidInput = true;

        this.selected = false;
        this.parentQuizz = quizz;
        this.tabAnswer = [];
        this.fontSize = 20;
        this.questionNum = this.parentQuizz.tabQuestions.length+1;

        if (!question) {
            this.label = "";
            this.imageSrc = "";
            this.rows = 4;
            this.rightAnswers = [];
            this.tabAnswer = [new Answer(null, this), new Answer(null, this)];
            this.selectedAnswers = [];
            this.multipleChoice = false;
            this.font = "Arial";
            this.bgColor = myColors.white;
            this.colorBordure = myColors.black;

        } else {
            this.label = question.label;
            this.imageSrc = question.imageSrc;
            this.rows = question.rows;
            this.rightAnswers = [];
            this.selectedAnswers = [];
            this.multipleChoice = question.multipleChoice;

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

    remove () {
        let index = this.parentQuizz.tabQuestions.indexOf(this);
        if(index!== -1){
            this.parentQuizz.tabQuestions.splice(index, 1);
            return true;
        }
        else{
            return false;
        }
    }
}

class QuestionCreator {
    constructor (parent, question) {
        this.MAX_ANSWERS = 8;
        this.parent = parent;

        this.manipulator = new Manipulator(this);
        this.manipulatorQuizzInfo = new Manipulator(this);
        this.questionCreatorManipulator = new Manipulator(this);
        this.questionCreatorManipulator.addOrdonator(6);
        this.questionManipulator = new Manipulator(this);
        this.questionManipulator.addOrdonator(6);
        this.toggleButtonManipulator = new Manipulator(this);
        this.previewButtonManipulator = new Manipulator(this);
        this.previewButtonManipulator.addOrdonator(2);
        this.manipulator.last.add(this.previewButtonManipulator.first);
        this.saveQuizButtonManipulator = new Manipulator(this);
        this.manipulator.last.add(this.saveQuizButtonManipulator.first);

        this.questionNameValidInput = true;


        this.labelDefault = "Cliquer deux fois pour ajouter la question";
        this.questionType = myQuestionType.tab;
        this.toggleButtonHeight = 40;

        if (!question) {
            // init default : 2 empty answers
            this.linkedQuestion = new Question(defaultQuestion,this.parent.quizz);
        } else {
            this.loadQuestion(question);
        }
        this.puzzle = new Puzzle(2, 4, this.linkedQuestion.tabAnswer, "leftToRight", this);
        this.manipulator.last.add(this.puzzle.manipulator.first);
        this.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};
    }

    checkInputTextArea (myObj) {
        if ((myObj.textarea.messageText && myObj.textarea.messageText.match(REGEX)) || myObj.textarea.messageText === "") {
            this.labelValidInput = true;
            myObj.remove();
            myObj.textarea.onblur = myObj.onblur;
            myObj.textarea.border = "none";
            myObj.textarea.outline = "none";
        } else {
            myObj.display();
            this.labelValidInput = false;
        }
    }

    loadQuestion (quest) {
        this.linkedQuestion = quest;
        quest.label && (this.label = quest.label);
        if (typeof quest.multipleChoice !== 'undefined') {
            this.multipleChoice = quest.multipleChoice;
        } else {
            this.multipleChoice = false;
        }
        quest.tabAnswer.forEach(answer => {
            if(answer instanceof Answer){
                answer.isEditable(this, true);
            }
        });
        quest.tabAnswer.forEach(el => {
            if (el.correct) {
                quest.rightAnswers.push(el);
            }
        });
    }
}

class AddEmptyElement {
    constructor (parent, type) {
        this.manipulator = new Manipulator(this);

        this.manipulator.addOrdonator(3);

        type && (this.type = type);

        switch (type) {
            case 'question':
                this.label = "Double-cliquez pour ajouter une question";
                this.questionNameValidInput = true;
                break;
            case 'answer':
                this.answerNameValidInput = true;
                this.label = "Nouvelle réponse";
                break;
        }
        this.fontSize = 20;
        this.parent = parent;
    }

    remove () {
        console.log("Tentative de suppression d'AddEmptyElement");
    };
}

class Level {
    constructor (formation, gamesTab) {
        this.parentFormation = formation;
        this.manipulator = new Manipulator(this);
        this.manipulator.addOrdonator(3);
        this.index = (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length-1]) ? (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length-1].index+1) : 1;
        gamesTab ? (this.gamesTab = gamesTab) : (this.gamesTab = []);
        this.x = this.parentFormation.libraryWidth ? this.parentFormation.libraryWidth : null; // Juste pour être sûr
        this.y = (this.index-1) * this.parentFormation.levelHeight;
        this.obj = null;
    }

    removeGame (index) {
        if (typeof index==='undefined') {
            this.gamesTab.pop();
        } else {
            this.gamesTab.splice(index, 1);
        }
    }

    addGame (game, index) {
        if(!index) {
            this.gamesTab.push(game);
        } else {
            this.gamesTab.splice(index, 0, game);
        }
    }
}

class FormationsManager {
    constructor (formations) {
        this.x = MARGIN;
        this.tileHeight = 150;
        this.tileWidth = this.tileHeight*(16/9);
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
            this.formations.push(new Formation(formation, this))
        }
        this.manipulator = new Manipulator();
        this.header = new Header();
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
        this.toggleFormationsManipulator.addOrdonator(2);
    }
}

class Formation {
    constructor (formation, formationsManager) {
        this.gamesCounter =  {
            quizz: 0,
            bd: 0
        };
        this.link = [];
        this._id = (formation._id || null);
        this.progress = formation.progress;
        this.formationsManager = formationsManager;
        this.manipulator = new Manipulator(this);
        this.manipulator.addOrdonator(5);
        this.formationInfoManipulator = new Manipulator();
        this.formationInfoManipulator.addOrdonator(3);
        this.graphManipulator = new Manipulator(this);
        this.graphManipulator.addOrdonator(10);
        this.messageDragDropManipulator=new Manipulator(this);
        this.messageDragDropManipulator.addOrdonator(2);
        this.arrowsManipulator = new Manipulator(this);
        this.miniaturesManipulator = new Manipulator(this);
        this.graphManipulator.last.add(this.miniaturesManipulator.first);
        this.graphManipulator.last.add(this.arrowsManipulator.first);
        this.clippingManipulator = new Manipulator(this);
        this.saveFormationButtonManipulator = new Manipulator(this);
        this.saveFormationButtonManipulator.addOrdonator(2);
        this.library = new GamesLibrary(myLibraryGames);
        this.library.formation = this;
        this.quizzManager = new QuizzManager();
        this.quizzManager.parentFormation = this;
        this.returnButtonManipulator = new Manipulator(this);
        this.returnButtonManipulator.addOrdonator(1);
        this.returnButton = new ReturnButton(this);
        this.labelDefault = "Entrer le nom de la formation";
        this.needUpdate = true;
        // WIDTH
        this.libraryWidthRatio = 0.15;
        this.graphWidthRatio = 1 - this.libraryWidthRatio;
        // HEIGHT
        this.graphCreaHeightRatio = 0.85;
        this.graphPlayHeightRatio = 0.90;


        this.x = MARGIN;
        this.regex = FORMATION_TITLE_REGEX;
        this.maxGameInARowMessage = "Le nombre maximum de jeux dans ce niveau est atteint.";
        this.targetLevelIndex = 0;
        this.levelsTab = [];
        this.gamesTab = [];
        this.saveButtonHeightRatio = 0.07;
        this.marginRatio = 0.03;
        this.label = formation.label ? formation.label : "";
        this.status = formation.status ? formation.status : statusEnum.NotPublished;
        this.labelValidInput = true ;

        this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;

        this.levelHeight = 150;
        this.graphElementSize = this.levelHeight*0.65;
        this.miniature = new MiniatureFormation(this);

        this.redim();
        this.manipulator.last.add(this.saveFormationButtonManipulator.first);
    }

    addNewGame (event, lib) {
        var dropLocation = this.panel.back.localPoint(event.clientX, event.clientY).y - this.panel.contentV.y;
        let level = -1;
        while(dropLocation > -this.panel.content.height/2) {
            dropLocation -= this.levelHeight;
            level++;
        }
        if (level >= this.levelsTab.length) {
            level = this.levelsTab.length;
            this.addNewLevel(level);
        }
        var objectToBeAddedLabel = lib.draggedObjectLabel ? lib.draggedObjectLabel : (lib.gameSelected.content.messageText ? lib.gameSelected.content.messageText : false);
        switch (objectToBeAddedLabel) {
            case ("Quiz"):
                var newQuizz = new Quizz(defaultQuizz, false, this);
                newQuizz.tabQuestions[0].parentQuizz = newQuizz;
                newQuizz.title = objectToBeAddedLabel + " " + this.gamesCounter.quizz;
                newQuizz.id = "quizz" + this.gamesCounter.quizz;
                this.gamesCounter.quizz++;
                newQuizz.title = objectToBeAddedLabel + " " + this.gamesCounter.quizz;
                this.levelsTab[level].gamesTab.push(newQuizz);
                break;
            case ("Bd"):
                var newBd = new Bd({}, this);
                newBd.title = objectToBeAddedLabel + " " + this.gamesCounter.bd;
                newBd.id = "bd" + this.gamesCounter.bd;
                this.gamesCounter.bd++;
                newBd.title = objectToBeAddedLabel + " " + this.gamesCounter.bd;
                this.levelsTab[level].gamesTab.push(newBd);
                break;
        }
        this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
    }

    saveFormation (displayQuizzManager) {
        let messageSave = "Votre travail a bien été enregistré.",
            messageError = "Vous devez remplir le nom de la formation.",
            messageReplace =  "Les modifications ont bien été enregistrées",
            messageUsedName = "Le nom de cette formation est déjà utilisé !",
            messageNoModification = "Les modifications ont déjà été enregistrées";

        let displayErrorMessage = (message) => {
            (this.saveFormationButtonManipulator.last.children.indexOf(this.errorMessageSave) !== -1) && this.saveFormationButtonManipulator.last.remove(this.errorMessageSave);
            this.errorMessage = new svg.Text(message)
                .position(this.formationLabel.cadre.width + this.formationWidth + MARGIN * 2, 0)
                .font("Arial", 15)
                .anchor('start').color(myColors.red);
            setTimeout(() => {
                this.formationInfoManipulator.ordonator.set(2, this.errorMessage);
            }, 1);
        };

        let displaySaveMessage = (message, displayQuizzManager) => {
            if (displayQuizzManager) {
                displayQuizzManager();
            } else {
                (this.saveFormationButtonManipulator.last.children.indexOf(this.errorMessageSave) !== -1) && this.saveFormationButtonManipulator.last.remove(this.errorMessageSave);
                this.errorMessageSave = new svg.Text(message)
                    .position(0, -this.saveButtonHeight / 2 - MARGIN)
                    .font("Arial", 20)
                    .anchor('middle').color(myColors.green);
                this.saveFormationButtonManipulator.last.add(this.errorMessageSave);
                svg.timeout(() => {
                    (this.saveFormationButtonManipulator.last.children.indexOf(this.errorMessageSave) !== -1) && this.saveFormationButtonManipulator.last.remove(this.errorMessageSave)
                }, 5000);
            }
        };

        let displayMessage = message => {
            switch (message) {
                case messageError:
                case messageUsedName:
                    displayErrorMessage(message);
                    break;
                default:
                    displaySaveMessage(message, displayQuizzManager);
            }
        };

        if (this.label && this.label !== this.labelDefault) {
            let getObjectToSave = () => {
                var levelsTab = [];
                var gamesCounter = {quizz: 0 , bd : 0};
                this.levelsTab.forEach((level, i) => {
                    var gamesTab = [];
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
                return {label: this.label, gamesCounter: this.gamesCounter, link: this.link, levelsTab: levelsTab}
            };

            let addNewFormation = () => {
                Server.getFormationByName(this.label).then(data => {
                    let formationWithSameName = JSON.parse(data).formation;
                    if (!formationWithSameName) {
                        Server.insertFormation(getObjectToSave(), ignoredData)
                            .then(data => {
                                this._id = JSON.parse(data);
                                displayMessage(messageSave);
                            })
                    } else {
                        displayMessage(messageUsedName);
                    }
                })
            };

            let replaceFormation = () => {
                Server.getFormationByName(this.label)
                    .then(data => {
                        let formationWithSameName = JSON.parse(data).formation;
                        if(formationWithSameName) {
                            let id = formationWithSameName._id;
                            delete formationWithSameName._id;
                            formationWithSameName = JSON.stringify(formationWithSameName);
                            let newFormation = JSON.stringify(getObjectToSave(), ignoredData);
                            if (id === this._id) {
                                if (formationWithSameName === newFormation) {
                                    throw messageNoModification
                                } else {
                                    return getObjectToSave()
                                }
                            } else {
                                throw messageUsedName
                            }
                        } else {
                            return getObjectToSave()
                        }
                    })
                    .then((formation) => {
                        Server.replaceFormation(this._id, formation, ignoredData)
                            .then(() => {
                                displayMessage(messageReplace);
                            });
                    })
                    .catch(displayMessage)
            };

            this._id ? replaceFormation() : addNewFormation();
        } else {
            displayMessage(messageError);
        }
    }

    loadFormation (formation) {
        this.levelsTab = [];
        this.gamesCounter = formation.gamesCounter;
        formation.link ? this.link = formation.link : this.link = [];
        formation.levelsTab.forEach(level => {
            var gamesTab = [];
            level.gamesTab.forEach(game => {
                game.tabQuestions && gamesTab.push(new Quizz(game, true, this));
                game.tabQuestions || gamesTab.push(new Bd(game, this));
                gamesTab[gamesTab.length-1].id = game.id;
            });
            this.levelsTab.push(new Level(this, gamesTab));
        });
    }

    findLongestLevel () {
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

    findGameById (id){
        let theGame;
        this.levelsTab.forEach(function(level){
            level.gamesTab.forEach(function(game){
                if(game.id === id)
                {
                    theGame = game;
                }
            });
        });
        return theGame;
    };

    isGameAvailable (game) {
        let available = true;
        this.link.forEach(linkElement => {
            if(linkElement.childGame === game.id)
            {
                let parentGame = this.findGameById(linkElement.parentGame);
                if(parentGame && (parentGame.status === undefined || (parentGame.status && parentGame.status !== "done"))) {
                    available = false;
                    return available
                }
            }
        });
        return available ;
    }

    redim () {
        this.gamesLibraryManipulator = this.library.libraryManipulator;
        this.libraryWidth = drawing.width * this.libraryWidthRatio;
        this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
        this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio+MARGIN;
        this.levelWidth = drawing.width - this.libraryWidth-MARGIN;
        this.minimalMarginBetweenGraphElements = this.graphElementSize / 2;
        this.y = drawing.height * HEADER_SIZE + 3 * MARGIN;

        this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
        this.ButtonWidth = 150;
        this.globalMargin = {
            height: this.marginRatio * drawing.height,
            width: this.marginRatio * drawing.width
        };
        this.clippingManipulator.flush();

    }

    checkInputTextArea (myObj) {
        if ((myObj.textarea.messageText && myObj.textarea.messageText.match(this.regex)) || myObj.textarea.messageText === "") {
            this.labelValidInput = true;
            myObj.remove();
            myObj.textarea.onblur = myObj.onblur;
            myObj.textarea.border = "none";
            myObj.textarea.outline = "none";
        } else {
            myObj.display();
            this.labelValidInput = false;
        }
    }

    addNewLevel (index) {
        var level = new Level(this);
        if (!index) {
            this.levelsTab.push(level);
        } else {
            this.levelsTab.splice(index, 0, level);
        }
    };

    removeLevel (index) {
        this.levelsTab.splice(index - 1, 1);
    }

    clickToAdd () {
        this.mouseUpGraphBlock = event => {
            this.library.gameSelected && this.library.dropAction(this.library.gameSelected.cadre, event);
            this.library.gameSelected && this.library.gameSelected.cadre.color(myColors.white, 1, myColors.black);
            this.library.gameSelected = null;
            svg.removeEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
        };
        if (this.library.gameSelected) {
            svg.addEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            svg.addEvent(this.messageDragDrop, "mouseup", this.mouseUpGraphBlock);
            runtime && runtime.addEvent(this.panel.back.component, "mouseup", this.mouseUpGraphBlock);
        }
    };

    adjustGamesPositions (level) {
        var nbOfGames = level.gamesTab.length;
        var spaceOccupied = (nbOfGames) * (this.minimalMarginBetweenGraphElements) + this.graphElementSize * nbOfGames;

        level.gamesTab.forEach(game => {
            var pos = game.getPositionInFormation();
            game.miniaturePosition.x = this.minimalMarginBetweenGraphElements * (3 / 2) + (pos.gameIndex - nbOfGames / 2) * spaceOccupied / nbOfGames;
            game.miniaturePosition.y = -this.panel.height / 2 + (level.index - 1 / 2) * this.levelHeight;
        });
    }

    trackProgress (displayFunction) {
        this.levelsTab.forEach(level => {
            level.gamesTab.forEach(game => {
                delete game.miniature;
                delete game.status;
            })
        });
        this.miniaturesManipulator.flush();
        Server.getUser().then(data => {
            let user = JSON.parse(data);
            if (user.formationsTab) {
                let formationUser = user.formationsTab.find(formation => formation.formation === this._id);
                formationUser && formationUser.gamesTab.forEach(game => {
                    let theGame = this.findGameById(game.game);
                    if (!theGame) return;

                    theGame.currentQuestionIndex = game.index;
                    game.tabWrongAnswers.forEach(wrongAnswer => {
                        theGame.questionsWithBadAnswers.add(theGame.tabQuestions[wrongAnswer - 1]);
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

            displayFunction.call(this)
        });
    }
}

class Library {
    constructor (lib) {
        this.libraryManipulator = new Manipulator(this);
        this.libraryManipulator.addOrdonator(2);

        this.title = lib.title;

        this.itemsTab = [];
        lib.tab && (this.itemsTab = JSON.parse(JSON.stringify(lib.tab)));
        this.libraryManipulators = [];

        this.imageWidth = 50;
        this.imageHeight = 50;
        this.libMargin = 5;

        for (var i = 0; i < this.itemsTab.length; i++) {
            this.libraryManipulators[i] = new Manipulator(this);
            this.libraryManipulators[i].addOrdonator(2);
        }

        this.font = lib.font || "Arial";
        this.fontSize = lib.fontSize || 20;
    }
}

class GamesLibrary extends Library {

    constructor (lib) {
        super(lib);
        this.arrowModeManipulator = new Manipulator(this);
        this.arrowModeManipulator.addOrdonator(3);

    }

    dropAction (element, event) {
        var target = drawings.background.getTarget(event.clientX, event.clientY);
        if (target && target._acceptDrop) {
            var formation = target.parent.parentManip.parentObject;
            formation.addNewGame(event, this);
        }
        this.gameSelected && formation && this.gameSelected.cadre.color(myColors.white, 1, myColors.black);
    }
}

class ImagesLibrary extends Library {
    constructor (lib) {
        super(lib);
        for (var i = 0; i < this.itemsTab.length; i++) {
            this.itemsTab[i] = imageController.getImage(this.itemsTab[i].imgSrc, function () {
                this.imageLoaded = true; //this != library
            });
        }
    }

    dropAction (element, event) {
        let target = drawings.background.getTarget(event.clientX, event.clientY);
        if (target && target._acceptDrop) {
            var oldQuest = {
                cadre: target.parent.parentManip.ordonator.get(0),
                content: target.parent.parentManip.ordonator.get(1)
            };
            target.parent.parentManip.ordonator.unset(0);
            target.parent.parentManip.ordonator.unset(1);
            var newQuest = displayImageWithTitle(oldQuest.content.messageText, element.src,
                element.srcDimension,
                oldQuest.cadre.width, oldQuest.cadre.height,
                oldQuest.cadre.strokeColor, oldQuest.cadre.fillColor, null, null, target.parent.parentManip
            );
            oldQuest.cadre.position(newQuest.cadre.x, newQuest.cadre.y);
            oldQuest.content.position(newQuest.content.x, newQuest.content.y);
            newQuest.image._acceptDrop = true;

            switch (true) {
                case target.parent.parentManip.parentObject instanceof QuestionCreator:
                    let questionCreator = target.parent.parentManip.parentObject;
                    questionCreator.linkedQuestion.image = newQuest.image;
                    questionCreator.linkedQuestion.imageSrc = newQuest.image.src;
                    questionCreator.parent.displayQuestionsPuzzle(null, null, null, null, questionCreator.parent.questionPuzzle.startPosition);
                    questionCreator.display();
                    break;
                case target.parent.parentManip.parentObject.editable:
                    let answer = target.parent.parentManip.parentObject;
                    answer.image = newQuest.image;
                    answer.imageSrc = newQuest.image.src;
                    answer.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
                    //answer.display(-answer.w / 2, -answer.h / 2);
                    break;
            }
            target.parent.parentManip.ordonator.set(0, oldQuest.cadre);
            //target.parent.parentManip.ordonator.set(1, oldQuest.content);
        }
    }
}

class Header {
    constructor () {
        this.manipulator = new Manipulator(this);
        this.manipulator.addOrdonator(3);
        this.userManipulator = new Manipulator(this);
        this.userManipulator.addOrdonator(6);
        this.label = "I-learning";
        this.size = HEADER_SIZE;
    }
}

class QuizzManager {
    constructor (quizz) {
        this.quizzName = "";
        this.quizzNameDefault = "Ecrire ici le nom du quiz";
        this.tabQuestions = [defaultQuestion];
        //this.questionPuzzle = {};
        this.quizzNameValidInput = true;
        this.loadQuizz = function (quizz, indexOfEditedQuestion) {
            this.indexOfEditedQuestion = (indexOfEditedQuestion && indexOfEditedQuestion!==-1 ? indexOfEditedQuestion: 0) ;
            this.quizz = new Quizz(quizz, true);
            this.quizzName = this.quizz.title;
            this.quizz.tabQuestions[this.indexOfEditedQuestion].selected = true;
            this.questionCreator.loadQuestion(this.quizz.tabQuestions[this.indexOfEditedQuestion]);
            this.quizz.tabQuestions.forEach( (question, index )  => {
                quizz.tabQuestions[index].questionType && (question.questionType = quizz.tabQuestions[index].questionType);
                (question.tabAnswer[question.tabAnswer.length-1] instanceof AddEmptyElement) || question.tabAnswer.push(new AddEmptyElement(this.questionCreator, 'answer'));
            })
            this.quizz.tabQuestions.push(new AddEmptyElement(this, 'question'));

        };
        if (!quizz) {
            var initialQuizzObject = {
                title: defaultQuizz.title,
                bgColor: myColors.white,
                tabQuestions: this.tabQuestions,
                puzzleLines: 3,
                puzzleRows: 3
            };
            this.quizz = new Quizz(initialQuizzObject, false);
            this.indexOfEditedQuestion = 0;
            this.quizzName = this.quizz.title;
        } else {
            this.loadQuizz(quizz);
        }
        this.questionCreator = new QuestionCreator(this, this.quizz.tabQuestions[this.indexOfEditedQuestion]);
        this.header = new Header();
        this.library = new ImagesLibrary(myLibraryImage);
        this.quizz.tabQuestions[0].selected = true;
        this.questionCreator.loadQuestion(this.quizz.tabQuestions[0]);
        this.quizz.tabQuestions.push(new AddEmptyElement(this, 'question'));
        this.quizzManagerManipulator = new Manipulator(this);
        this.questionsPuzzleManipulator = new Manipulator(this);
        this.questionsPuzzleManipulator.addOrdonator(1);
        this.quizzInfoManipulator = new Manipulator(this);
        this.quizzInfoManipulator.addOrdonator(6);
        this.questionCreatorManipulator = this.questionCreator.manipulator;
        this.questionCreatorManipulator.addOrdonator(1);
        this.previewButtonManipulator = new Manipulator(this);
        this.previewButtonManipulator.addOrdonator(2);
        this.saveQuizButtonManipulator = new Manipulator(this);
        this.saveQuizButtonManipulator.addOrdonator(2);
        this.returnButtonManipulator = new Manipulator(this);
        this.returnButtonManipulator.addOrdonator(1);
        this.returnButton = new ReturnButton(this);
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
    }


    getObjectToSave  () {
        this.tabQuestions = this.quizz.tabQuestions;
        (this.tabQuestions[this.quizz.tabQuestions.length-1] instanceof  AddEmptyElement) && this.tabQuestions.pop();
        this.tabQuestions.forEach(question => {
            (question.tabAnswer[question.tabAnswer.length-1] instanceof  AddEmptyElement)&& question.tabAnswer.pop();
        });
        return {
            id: this.quizz.id,
            title: this.quizz.title,
            tabQuestions: this.quizz.tabQuestions,
            levelIndex: this.quizz.levelIndex,
            gameIndex: this.quizz.gameIndex
        };
    };

    displayMessage (message, color) {
        this.questionCreator.errorMessagePreview && this.questionCreator.errorMessagePreview.parent && this.previewButtonManipulator.last.remove(this.questionCreator.errorMessagePreview);
        this.questionCreator.errorMessagePreview = new svg.Text(message)
            .position(this.ButtonWidth, -this.questionCreator.toggleButtonHeight + MARGIN)
            .font("Arial", 20)
            .anchor('middle').color(color);
        setTimeout(() => {
            this.previewButtonManipulator.last.add(this.questionCreator.errorMessagePreview);
        }, 1);
    }

    saveQuizz () {

        let completeQuizzMessage = "Les modifications ont bien été enregistrées";
        let imcompleteQuizzMessage = "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide";

        let quiz = this.getObjectToSave();

        var validation = true;
        quiz.tabQuestions.forEach(question => {
            question.questionType.validationTab.forEach( (funcEl) => {
                var result = funcEl(question);
                validation = validation && result.isValid;
            });
        })

        validation ? this.displayMessage(completeQuizzMessage, myColors.green) : this.displayMessage(imcompleteQuizzMessage, myColors.orange);

        Server.replaceQuizz(quiz, this.parentFormation._id, this.quizz.levelIndex, this.quizz.gameIndex, ignoredData)
            .then(() => {
                this.quizz.title = this.quizzName;
                this.quizz.tabQuestions = this.tabQuestions;
                let quizz = this.parentFormation.levelsTab[this.quizz.levelIndex].gamesTab[this.quizz.gameIndex];
                (this.parentFormation.miniaturesManipulator.last.children.indexOf(quizz.miniatureManipulator.first) !== -1) && this.parentFormation.miniaturesManipulator.last.remove(quizz.miniatureManipulator.first);
                this.parentFormation.levelsTab[this.quizz.levelIndex].gamesTab[this.quizz.gameIndex]=this.quizz;
                this.loadQuizz(this.parentFormation.levelsTab[this.quizz.levelIndex].gamesTab[this.quizz.gameIndex], this.quizz.parentFormation.quizzManager.indexOfEditedQuestion);
                this.display();
                console.log("Votre travail a été bien enregistré");
            });
    };

    selectNextQuestion () {
        this.indexOfEditedQuestion++;
    };

    checkInputTextArea (myObj) {
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
    };

}

class Quizz {
    constructor (quizz, previewMode, parentFormation) {
        this.id=quizz.id;
        this.miniatureManipulator = new Manipulator(this);
        this.parentFormation = parentFormation || quizz.parentFormation;
        this.quizzManipulator = new Manipulator(this);
        this.quizzManipulator.addOrdonator(2);
        this.returnButtonManipulator = new Manipulator(this);
        this.returnButton = new ReturnButton(this);
        this.quizzManipulator.last.add(this.returnButtonManipulator.first);

        if(previewMode) {
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
        if(this.levelIndex === undefined ){this.levelIndex = quizz.levelIndex;}
        if(this.gameIndex === undefined) { this.gameIndex = quizz.gameIndex;}
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
        this.miniaturePosition = {x:0, y:0};
        //this.questionsWithBadAnswers = [];
        this.questionsWithBadAnswers = quizz.questionsWithBadAnswers ? quizz.questionsWithBadAnswers : [];
        this.score = (quizz.score ? quizz.score : 0);
        this.drawing = drawing;
        this.title = quizz.title ? quizz.title : '';
        this.currentQuestionIndex = quizz.currentQuestionIndex ? quizz.currentQuestionIndex  : -1;
        this.finalMessage = "";
    }

    loadQuestions (quizz) {
        if (quizz && typeof quizz.tabQuestions !== 'undefined') {
            this.tabQuestions = [];
            quizz.tabQuestions.forEach(it => {
                var tmp = new Question(it, this);
                it.questionType && (tmp.questionType = it.questionType);
                tmp.parentQuizz = this;
                this.tabQuestions.push(tmp);
            });
        } else {
            this.tabQuestions = [];
            this.tabQuestions.push(new Question(defaultQuestion, this));
            this.tabQuestions.push(new Question(defaultQuestion, this));
        }
    }

    run (x, y, w, h) {
        var intervalToken = asyncTimerController.interval(() => {
            if (this.tabQuestions.every(e => e.imageLoaded && e.tabAnswer.every(el => el.imageLoaded))) {
                asyncTimerController.clearInterval(intervalToken);
                this.display(x, y, w, h);
            }
        }, 100);
        runtime && this.tabQuestions.forEach(e => {
            e.image && imageController.imageLoaded(e.image.id, myImagesSourceDimensions[e.image.src].width, myImagesSourceDimensions[e.image.src].height);
            e.tabAnswer.forEach(el => {
                el.image && imageController.imageLoaded(el.image.id, myImagesSourceDimensions[el.image.src].width, myImagesSourceDimensions[el.image.src].height);
            });

        });
        runtime && this.display(x, y, w, h);
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
        this.tabQuestions[this.currentQuestionIndex].display(this.x, this.headerHeight + this.questionHeight/ 2 + MARGIN,
            this.questionArea.w, this.questionHeight);
        !this.previewMode && this.tabQuestions[this.currentQuestionIndex].manipulator.last.children.indexOf(this.tabQuestions[this.currentQuestionIndex].answersManipulator.translator)=== -1 && this.tabQuestions[this.currentQuestionIndex].manipulator.last.add(this.tabQuestions[this.currentQuestionIndex].answersManipulator.translator);
        this.tabQuestions[this.currentQuestionIndex].displayAnswers(this.x, this.headerHeight + MARGIN + this.questionHeight,
            this.questionArea.w, this.answerHeight);
    };

    // !_! bof, y'a encore des display appelés ici
    nextQuestion () {
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
                        this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, this.questionsWithBadAnswers, "leftToRight", this);
                        this.displayResult();
                    }
                });
        }
    }

    getPositionInFormation () {
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
    constructor (bd, parentFormation) {
        this.miniatureManipulator = new Manipulator(this);
        this.parentFormation = parentFormation;
        this.title = bd.title || "BD";
        this.miniaturePosition = {x:0, y:0};
        this.returnButtonManipulator = new Manipulator(this);
        this.returnButton = new ReturnButton(this);
        this.manipulator = new Manipulator(this);
        this.manipulator.last.add(this.returnButtonManipulator.first);
    }


    getPositionInFormation () {
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

function Domain() {

    util && util.SVGUtil();
    util && util.SVGGlobalHandler();
    var ImageRuntime = {
        images: {},
        count: 0,
        getImage: function (imgUrl, onloadHandler) {
            this.count++;
            var image = {
                src: imgUrl,
                onload: onloadHandler,
                id: "i"+ this.count
            };
            this.images[image.id] = image;
            return image;
        },

        imageLoaded: function(id, w, h) {
            this.images[id].width = w;
            this.images[id].height = h;
            this.images[id].onload();
        }
    };
    var AsyncTimerRuntime = {
        timers: {},
        count: 0,
        interval: function (handler, timer) {
            var interval = {
                id:"interval" + this.count,
                next: handler,
                timer: timer
            };
            this.count++;
            this.timers[interval.id] = interval;
            return interval;
        },
        clearInterval: function (id) {
            delete this.timers[id];
        },
        timeout: function (handler, timer) {
            var timeout = {
                id:"timeout" + this.count,
                next: function () {
                    handler();
                    delete this;
                },
                timer:timer
            };
            this.count++;
            this.timers[timeout.id] = timeout;
            return timeout;
        }
    };
    runtime && (iRuntime = ImageRuntime);
    runtime && (aRuntime = AsyncTimerRuntime);
    imageController = ImageController(iRuntime);
    asyncTimerController = runtime ? AsyncTimerController(AsyncTimerRuntime) : AsyncTimerController();
}

////////////////// InscriptionManager.js //////////////////////////
InscriptionManager = function () {

    let self = this;

    self.manipulator = new Manipulator(self);
    self.header = new Header("Inscription");
    self.firstNameManipulator = new Manipulator(self);
    self.firstNameManipulator.addOrdonator(4);
    self.lastNameManipulator = new Manipulator(self);
    self.lastNameManipulator.addOrdonator(4);
    self.mailAddressManipulator = new Manipulator(self);
    self.mailAddressManipulator.addOrdonator(4);
    self.passwordManipulator = new Manipulator(self);
    self.passwordManipulator.addOrdonator(4);
    self.passwordConfirmationManipulator = new Manipulator(self);
    self.passwordConfirmationManipulator.addOrdonator(3);
    self.saveButtonManipulator = new Manipulator(self);
    self.saveButtonManipulator.addOrdonator(4);
    //self.errorMessageManipulator = new Manipulator(self);

    self.manipulator.last.add(self.firstNameManipulator.first);
    self.manipulator.last.add(self.lastNameManipulator.first);
    self.manipulator.last.add(self.mailAddressManipulator.first);
    self.manipulator.last.add(self.passwordManipulator.first);
    self.manipulator.last.add(self.passwordConfirmationManipulator.first);
    self.manipulator.last.add(self.saveButtonManipulator.first);
    //self.saveButtonManipulator.last.add(self.errorMessageManipulator.first);
    //self.errorMessageManipulator.addOrdonator(2);

    // HEIGHT
    self.saveButtonHeightRatio = 0.075;
    self.saveButtonWidthRatio = 0.25;

    self.lastNameLabel = "Nom :";
    self.firstNameLabel = "Prénom :";
    self.mailAddressLabel = "Adresse mail :";
    self.passwordLabel = "Mot de passe :";
    self.passwordConfirmationLabel = "Confirmer votre mot de passe :";
    self.lastNameLabel = "Nom :";
    self.saveButtonLabel = "S'enregistrer";
    self.tabForm =[];
    self.formLabels = {};
};
////////////////// end of InscriptionManager.js //////////////////////////

////////////////// ConnexionManager.js //////////////////////////
ConnexionManager = function () {

    let self = this;

    self.manipulator = new Manipulator(self);
    self.manipulator.addOrdonator(6);
    self.header = new Header("Connexion");
    self.mailAddressManipulator = new Manipulator(self);
    self.mailAddressManipulator.addOrdonator(4);
    self.passwordManipulator = new Manipulator(self);
    self.passwordManipulator.addOrdonator(4);
    self.connexionButtonManipulator=new Manipulator(self);
    self.connexionButtonManipulator.addOrdonator(4);

    self.manipulator.last.add(self.mailAddressManipulator.first);
    self.manipulator.last.add(self.passwordManipulator.first);
    self.manipulator.last.add(self.connexionButtonManipulator.first);

    // HEIGHT
    self.connexionButtonHeightRatio = 0.075;

    self.connexionButtonHeight = drawing.height * self.connexionButtonHeightRatio;
    self.connexionButtonWidth = 200;

    self.mailAddressLabel = "Adresse mail :";
    self.passwordLabel = "Mot de passe :";

    self.connexionButtonLabel = "Connexion";
    self.tabForm =[];

    let listFormations = function() {
        Server.getAllFormationsNames().then(data => {
            let myFormations = JSON.parse(data).myCollection;
            formationsManager = new FormationsManager(myFormations);
            formationsManager.display();
        });
    };

    self.connexionButtonHandler = function() {

        let emptyAreas = self.tabForm.filter(field => field.label === '');
        emptyAreas.forEach(emptyArea => {emptyArea.cadre.color(myColors.white, 3, myColors.red)});

        if (emptyAreas.length > 0) {
            let message = autoAdjustText(EMPTY_FIELD_ERROR, 0, 0, drawing.width, self.h, 20, null, self.connexionButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - self.connexionButton.cadre.height + MARGIN);
            svg.timeout(function() {
                self.connexionButtonManipulator.ordonator.unset(3);
                emptyAreas.forEach(emptyArea => {emptyArea.cadre.color(myColors.white, 1, myColors.black)});
            },5000);
        } else {
            Server.connect(self.mailAddressField.label, self.passwordField.labelSecret).then(data => {
                data = data && JSON.parse(data);
                if (data.ack === 'OK') {
                    drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                    data.user.admin ? AdminGUI() : LearningGUI();
                    listFormations();
                } else {
                    let message = autoAdjustText('Adresse et/ou mot de passe invalide(s)', 0, 0, drawing.width, self.h, 20, null, self.connexionButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, - self.connexionButton.cadre.height + MARGIN);
                    svg.timeout(() => {self.connexionButtonManipulator.ordonator.unset(3)}, 5000);
                }
            });
        }
    };
};
////////////////// end of ConnexionManager.js //////////////////////////

if(typeof exports !== "undefined") {
    exports.Domain = Domain;
    exports.setUtil = setUtil;
    exports.setGlobalVariables = setGlobalVariables;
    exports.setRuntime = setRuntime;
    exports.setSvg = setSvg;
    exports.Answer = Answer;
    exports.Question = Question;
    exports.QuestionCreator = QuestionCreator;
    exports.AddEmptyElement = AddEmptyElement;
    exports.Level = Level;
    exports.FormationsManager = FormationsManager;
    exports.Formation = Formation;
    exports.Library = Library;
    exports.Header = Header;
    exports.Puzzle = Puzzle;
    exports.QuizzManager = QuizzManager;
    exports.Quizz = Quizz;
    exports.Bd = Bd;
}