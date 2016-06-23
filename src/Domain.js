/**
 * Created by TDU3482 on 26/04/2016.
 */
var util, drawing, mainManipulator, iRuntime, runtime, asyncTimerController, svg;

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
    var imageController = ImageController(iRuntime);
    asyncTimerController = runtime ? AsyncTimerController(AsyncTimerRuntime) : AsyncTimerController();

////////////// Answer.js /////////////////

    /**
     * Created by qde3485 on 25/02/16.
     */

    /**
     *
     * @constructor
     * @param answerParameters
     * @param parent
     */
    Answer = function (answerParameters, parent) {
        var self = this;
        self.parentQuestion = parent;
        var answer = {
            label: '',
            imageSrc: null,
            correct: false
        };
        answerParameters && (answer = answerParameters);
        self.manipulator = new Manipulator(self);
        self.manipulator.addOrdonator(6);

        self.label = answer.label;
        self.imageSrc = answer.imageSrc;
        self.correct = answer.correct;
        self.selected = false;
        self.answerNameValidInput = true;
        self.fontSize = answer.fontSize ? answer.fontSize : 20;
        answer.font && (self.font = answer.font);

        self.imageLoaded = false;

        if (answer.imageSrc) {
            self.image = imageController.getImage(self.imageSrc, function () {
                self.imageLoaded = true;
                self.dimImage = {width: self.image.width, height: self.image.height};
            });
            self.imageLoaded = false;
        } else {
            self.imageLoaded = true;
        }

        self.colorBordure = answer.colorBordure ? answer.colorBordure : myColors.black;
        self.bgColor = answer.bgColor ? answer.bgColor : myColors.white;

        self.bordure = null;
        self.content = null;

        self.delete = function(){
            let index = self.parentQuestion.tabAnswer.indexOf(self);
            if(index!== -1){
                self.parentQuestion.tabAnswer.splice(index, 1);
                return true;
            }
            else{
                return false;
            }
        };


        self.isEditable = function(editor, editable) {
            self.editable = editable;
            self.labelDefault = "Double cliquer pour modifier et cocher si bonne réponse.";
            self._acceptDrop = editable;
            self.editor = editor;
            self.checkInputContentArea = editable ? function (objCont) {
                if (objCont.contentarea.messageText.match(REGEX)) {
                    self.label = objCont.contentarea.messageText;
                    objCont.remove();
                    objCont.contentarea.onblur = objCont.onblur;
                    //objCont.contentarea.component.style.border = "none";
                    //objCont.contentarea.component.style.outline = "none";
                } else {
                    self.label = objCont.contentarea.messageText;
                    objCont.display();
                    //svg.addEvent(objCont.contentarea,'blur',function () {
                    //    objCont.contentarea.component.value = "";
                    //    objCont.onblur();
                    //    objCont.remove();
                    //});
                }
            } : null;
        };
    };

//////////////////// end of Answer.js ////////////////

/////////////////// LibraryImage.js //////////////////

    /**
     * Created by ABO3476 on 15/03/2016.
     */


    Library = function (lib) {
        var self = this;
        self.libraryManipulator = new Manipulator(self);
        self.libraryManipulator.addOrdonator(2);
        self.arrowModeManipulator = new Manipulator(self);
        self.arrowModeManipulator.addOrdonator(3);

        self.title = lib.title;

        self.itemsTab = [];
        lib.tab && (self.itemsTab = JSON.parse(JSON.stringify(lib.tab)));
        self.libraryManipulators = [];

        self.imageWidth = 50;
        self.imageHeight = 50;
        self.libMargin = 5;
        self.libraryGamesTab = [];

        for (var i = 0; i < self.itemsTab.length; i++) {
            self.libraryManipulators[i] = new Manipulator(self);
            self.libraryManipulators[i].addOrdonator(2);
            if (self.itemsTab[i].imgSrc) {
                self.itemsTab[i] = imageController.getImage(self.itemsTab[i].imgSrc, function () {
                    this.imageLoaded = true;
                });
            }
        }

        lib.font ? (self.font = lib.font) : self.font = "Arial";
        lib.fontSize ? (self.fontSize = lib.fontSize) : self.fontSize = 20;

        self.run = function (x, y, w, h, callback) {
            self.intervalToken = asyncTimerController.interval(function () {
                if (self.itemsTab.every(e => e.imageLoaded)) {
                    asyncTimerController.clearInterval(self.intervalToken);
                    self.display(x, y, w, h);
                    callback();
                }
            }, 100);
            runtime && self.itemsTab.forEach(e => {
                imageController.imageLoaded(e.id, myImagesSourceDimensions[e.src].width, myImagesSourceDimensions[e.src].height);
            });
            if (runtime){
                self.display(x, y, w, h);
                callback();
            }
        };

        self.dropAction = function (element, event) {
            var target = drawings.background.getTarget(event.clientX, event.clientY);
            if (target && target._acceptDrop) {
                if (element instanceof svg.Image) {
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
                            answer.display(-answer.w/2,-answer.h/2);
                            break;
                    }
                    target.parent.parentManip.ordonator.set(0, oldQuest.cadre);
                    //target.parent.parentManip.ordonator.set(1, oldQuest.content);
                } else {
                    var formation = target.parent.parentManip.parentObject;
                    formation.addNewGame(event, self);
                }
            }
            self.gameSelected && formation && self.gameSelected.cadre.color(myColors.white, 1, myColors.black);
        };
    };

/////////////////// end of LibraryImage.js ///////////////

////////////////// EmptyElement.js ///////////////
    /**
     * Created by qde3485 on 15/03/16.
     */

    AddEmptyElement = function (parent, type) {
        var self = this;
        self.manipulator = new Manipulator(self);
        self.manipulator.addOrdonator(3);

        self.delete = function() {
            console.log("Tentative de suppression d'AddEmptyElement");
        };

        type && (self.type = type);
        switch (type) {
            case 'question':
                self.label = "Double-cliquez pour ajouter une question";
                break;
            case 'answer':
                self.answerNameValidInput = true;
                self.label = "Nouvelle réponse";
                break;
        }
        self.fontSize = 20;
        self.parent = parent;
    };

//////////////////////// end of EmptyElement.js //////////////////////

/////////////////////// Formation.js /////////////////////
    var Level = function(formation, gamesTab){
        var self = this;
        self.parentFormation = formation;
        self.manipulator = new Manipulator(self);
        self.manipulator.addOrdonator(3);
        self.index = (self.parentFormation.levelsTab[self.parentFormation.levelsTab.length-1]) ? (self.parentFormation.levelsTab[self.parentFormation.levelsTab.length-1].index+1) : 1;
        gamesTab ? (self.gamesTab = gamesTab) : (self.gamesTab = []);
        self.x = self.parentFormation.libraryWidth ? self.parentFormation.libraryWidth : null; // Juste pour être sûr
        self.y = (self.index-1) * self.parentFormation.levelHeight;
        self.obj = null;

        self.removeGame = function(index){
            if(typeof index==='undefined'){
                self.gamesTab.pop();
            }else{
                self.gamesTab.splice(index, 1);
            }
        };
        self.addGame = function(game, index){
            if(!index){
                self.gamesTab.push(game);
            }else{
                self.gamesTab.splice(index, 0, game);
            }
        };
        return self;
    };

    Formation = function (formation, formationsManager) {
        var self = this;
        self.gamesCounter =  {
            quizz: 0,
            bd: 0
        };
        self._id = (formation._id || null);
        self.formationsManager = formationsManager;
        self.manipulatorMiniature = new Manipulator();
        self.manipulatorMiniature.addOrdonator(2);
        self.iconManipulator = new Manipulator();
        self.iconManipulator.addOrdonator(3);
        self.manipulator = new Manipulator(self);
        self.manipulator.addOrdonator(5);
        self.formationInfoManipulator = new Manipulator();
        self.formationInfoManipulator.addOrdonator(3);
        self.graphManipulator = new Manipulator(self);
        self.graphManipulator.addOrdonator(10);
        self.messageDragDropManipulator=new Manipulator(self);
        self.messageDragDropManipulator.addOrdonator(2);
        self.arrowsManipulator = new Manipulator(self);
        self.miniaturesManipulator = new Manipulator(self);
        self.graphManipulator.last.add(self.miniaturesManipulator.first);
        self.graphManipulator.last.add(self.arrowsManipulator.first);
        self.clippingManipulator = new Manipulator(self);
        self.saveFormationButtonManipulator = new Manipulator(self);
        self.saveFormationButtonManipulator.addOrdonator(2);
        self.library = new Library(myLibraryGames);
        self.library.formation = self;
        self.quizzManager = new QuizzManager();
        self.quizzManager.parentFormation = self;

        self.labelDefault = "Entrer le nom de la formation";
        self.needUpdate = true;
        // WIDTH
        self.libraryWidthRatio = 0.15;
        self.graphWidthRatio = 1 - self.libraryWidthRatio;

        // HEIGHT
        self.graphCreaHeightRatio = 0.85;
        self.graphPlayHeightRatio = 0.90;


        self.x = MARGIN;
        self.regex = FORMATION_TITLE_REGEX;
        self.maxGameInARowMessage = "Le nombre maximum de jeux dans ce niveau est atteint.";
        self.targetLevelIndex = 0;
        self.levelsTab = [];
        self.saveButtonHeightRatio = 0.07;
        self.marginRatio = 0.03;
        self.label = formation.label ? formation.label : "";
        self.status = formation.status ? formation.status : statusEnum.NotPublished;
        self.labelValidInput = true ;

        self.graphCreaWidth = drawing.width * self.graphWidthRatio - MARGIN;

        self.levelHeight = 150;
        self.graphElementSize = self.levelHeight*0.65;

        self.addNewGame = (event, lib) => {
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
                    this.gamesCounter.quizz++;
                    newQuizz.tabQuestions[0].parentQuizz = newQuizz;
                    newQuizz.title = objectToBeAddedLabel + " " + this.gamesCounter.quizz;
                    this.levelsTab[level].gamesTab.push(newQuizz);
                    break;
                case ("Bd"):
                    var newBd = new Bd({}, this);
                    this.gamesCounter.bd++;
                    newBd.title = objectToBeAddedLabel + " " + this.gamesCounter.bd;
                    this.levelsTab[level].gamesTab.push(newBd);
                    break;
            }
            this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
        };

        self.saveFormation = function (displayQuizzManager) {
            let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
            var validation = self.label !== "" && self.label !== self.labelDefault && (typeof self.label !== 'undefined');
            var messageSave = "Votre travail a bien été enregistré.";
            var messageError = "Vous devez remplir le nom de la formation.";
            var messageReplace =  "Les modifications ont bien été enregistrées";
            var messageUsedName = "Le nom de cette formation est déjà utilisé !";
            var messageNoModification = "Les modifications ont déjà été enregistrées";

            var displayErrorMessage = function (message){
                self.errorMessageSave && self.saveFormationButtonManipulator.last.remove(self.errorMessageSave);
                self.errorMessage = new svg.Text(message)
                    .position(self.formationLabel.cadre.width + self.formationWidth + MARGIN * 2, 0)
                    .font("Arial", 15)
                    .anchor('start').color(myColors.red);
                setTimeout(function () {
                    self.formationInfoManipulator.ordonator.set(2, self.errorMessage);
                }, 1);
            };

            var displaySaveMessage = function (message, displayQuizzManager){
                if (displayQuizzManager.__proto__ ===  Function.prototype){
                    displayQuizzManager();
                }
                else {
                    (self.saveFormationButtonManipulator.last.children.indexOf(self.errorMessageSave) !== -1) && self.saveFormationButtonManipulator.last.remove(self.errorMessageSave)
                    self.errorMessageSave = new svg.Text(message)
                        .position(0, -self.saveButtonHeight / 2 - MARGIN)
                        .font("Arial", 20)
                        .anchor('middle').color(myColors.green);
                    self.saveFormationButtonManipulator.last.add(self.errorMessageSave);
                    svg.timeout(function () {
                        (self.saveFormationButtonManipsulator.last.children.indexOf(self.errorMessageSave) !== -1) && self.saveFormationButtonManipulator.last.remove(self.errorMessageSave)
                    }, 5000);
                }
            };

            if (validation) {
                var addNewFormation = function () {
                    var callbackInsertion = function (data) {
                        self._id=JSON.parse(data);
                        displaySaveMessage(messageSave, displayQuizzManager);

                    };
                    var callbackCheckName = function (data) {
                        let formationWithSameName = JSON.parse(data).formation;
                        if (!formationWithSameName) {
                            Server.insertFormation(getObjectToSave(), callbackInsertion, ignoredData);
                        }
                        else {
                            displayErrorMessage(messageUsedName);
                        }
                    };
                    Server.getFormationByName(self.label, callbackCheckName);
                };
                var replaceFormation = function () {
                    var callbackCheckName = function (data) {
                        var callbackReplace = function () {
                            displaySaveMessage(messageReplace, displayQuizzManager);
                        };
                        let formationWithSameName = JSON.parse(data).formation;
                        if(formationWithSameName) {
                            var id = formationWithSameName._id;
                            delete formationWithSameName._id;
                            formationWithSameName = JSON.stringify(formationWithSameName);
                            let newFormation = getObjectToSave();
                            newFormation = JSON.stringify(newFormation, ignoredData);
                            if (formationWithSameName && id === self._id) {
                                if (formationWithSameName == newFormation) {
                                    displaySaveMessage(messageNoModification, displayQuizzManager);
                                } else {
                                    Server.replaceFormation(self._id, getObjectToSave(), callbackReplace, ignoredData);
                                }
                            } else if (formationWithSameName && formationWithSameName._id !== self._id) {
                                displayErrorMessage(messageUsedName);
                            }
                        } else {
                            Server.replaceFormation(self._id, getObjectToSave(), callbackReplace, ignoredData);
                        }
                    };
                    Server.getFormationByName(self.label, callbackCheckName);
                };


                    var getObjectToSave = function () {
                        return {label: self.label, gamesCounter: self.gamesCounter, levelsTab: self.levelsTab}
                    };

                self._id ? replaceFormation() : addNewFormation();
            } else {
                displayErrorMessage(messageError);
            }
        };

        self.loadFormation = function(formation) {
            self.gamesCounter = formation.gamesCounter;
            formation.levelsTab.forEach(function (level) {
                var gamesTab = [];
                level.gamesTab.forEach(function (game) {
                    game.tabQuestions && gamesTab.push(new Quizz(game, true, self));
                    game.tabQuestions || gamesTab.push(new Bd(game, self));
                });
                self.levelsTab.push(new Level(self, gamesTab));
            });

            self.loadDependencies = function () {
                formation.levelsTab && formation.levelsTab.forEach(function (level, i) {
                    level.gamesTab.forEach(function (game, j) {
                        game.childrenGames.forEach(function (childrenGame) {
                            var match = self.levelsTab && self.levelsTab[childrenGame.levelIndex].gamesTab && self.levelsTab[childrenGame.levelIndex].gamesTab[childrenGame.gameIndex];
                            !match.parentGames && (match.parentGames = []);
                            !self.levelsTab[i].gamesTab[j].childrenGames && (self.levelsTab[i].gamesTab[j].childrenGames = []);
                            self.levelsTab[i].gamesTab[j].childrenGames.push(match);
                            match.parentGames.push(self.levelsTab[i].gamesTab[j]);
                        });
                    })
                })
            };
            self.loadDependencies();
        };
    self.findLongestLevel = function() {
        var longestLevelCandidates = [];
        longestLevelCandidates.index = 0;
        self.levelsTab.forEach(level=> {
            if (level.gamesTab.length >= self.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                if (level.gamesTab.length === self.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                    longestLevelCandidates.push(level);
                } else {
                    longestLevelCandidates = [];
                    longestLevelCandidates.push(level);
                }
                longestLevelCandidates.index = level.index - 1;
            }
        });
        return longestLevelCandidates;
    };


        self.redim = function() {
            self.gamesLibraryManipulator = self.library.libraryManipulator;
            self.libraryWidth = drawing.width * self.libraryWidthRatio;
            self.graphCreaWidth = drawing.width * self.graphWidthRatio - MARGIN;
            self.graphCreaHeight = drawing.height * self.graphCreaHeightRatio+MARGIN;
            self.levelWidth = drawing.width - self.libraryWidth-MARGIN;
            self.minimalMarginBetweenGraphElements = self.graphElementSize / 2;
            self.y = drawing.height * HEADER_SIZE + 3 * MARGIN;

            self.saveButtonHeight = drawing.height * self.saveButtonHeightRatio;
            self.ButtonWidth = 150;
            self.globalMargin = {
                height: self.marginRatio * drawing.height,
                width: self.marginRatio * drawing.width
            };
            self.clippingManipulator.flush();

        };
        self.redim();
        self.manipulator.last.add(self.saveFormationButtonManipulator.first);

        self.checkInputTextArea = function (myObj) {
            if (myObj.textarea.messageText.match(self.regex)) {
                self.labelValidInput = true;
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.display();
                self.labelValidInput = false;
                //myObj.textarea.onblur = function () {
                //    myObj.textarea.messageText = "";
                //    myObj.onblur();
                //    myObj.remove();
                //}
            }
        };

        self.addNewLevel = function (index) {
            var level = new Level(self);
            if (!index) {
                self.levelsTab.push(level);
            } else {
                self.levelsTab.splice(index, 0, level);
            }
        };

        self.removeLevel = function (index) {
            self.levelsTab.splice(index - 1, 1);
        };

        self.clickToAdd = function () {

            self.mouseUpGraphBlock = function (event) {
                self.library.gameSelected && self.library.dropAction(self.library.gameSelected.cadre, event);
                self.library.gameSelected && self.library.gameSelected.cadre.color(myColors.white, 1, myColors.black);
                self.library.gameSelected = null;
                svg.removeEvent(self.panel.back, "mouseup", self.mouseUpGraphBlock);
            };
            if (self.library.gameSelected) {
                svg.addEvent(self.panel.back, "mouseup", self.mouseUpGraphBlock);
                svg.addEvent(self.messageDragDrop, "mouseup", self.mouseUpGraphBlock);
                runtime && runtime.addEvent(self.panel.back.component, "mouseup", self.mouseUpGraphBlock);
            }
        };

        self.adjustGamesPositions = function (level) {
            var nbOfGames = level.gamesTab.length;
            var spaceOccupied = (nbOfGames) * (self.minimalMarginBetweenGraphElements) + self.graphElementSize * nbOfGames;

            level.gamesTab.forEach(function (game) {
                !game.parentGames && (game.parentGames = []);
                !game.childrenGames && (game.childrenGames = []);

                var pos = game.getPositionInFormation();
                game.miniaturePosition.x = self.minimalMarginBetweenGraphElements * (3 / 2) + (pos.gameIndex - nbOfGames / 2) * spaceOccupied / nbOfGames;
                game.miniaturePosition.y = -self.panel.height / 2 + (level.index - 1 / 2) * self.levelHeight;
                //game.miniaturePosition.y =-self.panel.height / 2;
            });
        }
    };

/////////////////////// end of Formation.js ///////////////////

/////////////////////// FormationManager.js ///////////////////
    /**
     * Created by ACA3502 on 14/04/2016.
     */

    FormationsManager = function (formations) {
        var self = this;

        self.x = MARGIN;
        self.tileHeight = 150;
        self.tileWidth = self.tileHeight*(16/9);
        self.addButtonWidth = 330;
        self.addButtonHeight = 40;
        self.fontSize = 20;
        self.plusDim = self.fontSize * 2;
        self.iconeSize = self.plusDim / 1.5;
        self.puzzleRows = 6;
        self.initialFormationsPosX = MARGIN;
        self.rows = 6;
        self.lines = 4;
        self.formations = [];
        self.count = 0;
        formations.forEach(function (formation, count) {
            self.formations[count] = new Formation(formation, self);
        });
        self.manipulator = new Manipulator();
        self.header = new Header();
        self.headerManipulator = new Manipulator();
        self.headerManipulator.addOrdonator(1);
        self.addButtonManipulator = new Manipulator();
        self.addButtonManipulator.addOrdonator(4);
        self.checkManipulator = new Manipulator();
        self.checkManipulator.addOrdonator(4);
        self.exclamationManipulator = new Manipulator();
        self.exclamationManipulator.addOrdonator(4);
        self.formationsManipulator = new Manipulator();
        self.clippingManipulator = new Manipulator(self);

        /* for Player */
        self.toggleFormationsManipulator = new Manipulator(self);
        self.toggleFormationsManipulator.addOrdonator(2);
    };

/////////////////// end of FormationManager.js ///////////////////


////////////////// Header.js //////////////////////////
    /**
     * Created by qde3485 on 14/04/16.
     */

    Header = function (additionalMessage) {
        var self = this;
        additionalMessage && (self.addMessage = additionalMessage);
        self.manipulator = new Manipulator(self);
        self.manipulator.addOrdonator(3);
        self.userManipulator = new Manipulator(self);
        self.userManipulator.addOrdonator(6);
        self.label = "I-learning";
        self.size = 0.05; // 5%
        self.setMessage = function (additionalMessage) {
            self.addMessage = additionalMessage;
        };
        self.removeMessage = function () {
            self.addMessage = null;
        };
    };
////////////////// end of Header.js //////////////////////////


////////////////// Puzzle.js //////////////////////////
    /**
     * Created by ABL3483 on 29/02/2016.
     */

    Puzzle = function (lines, rows, questionsTab, resultArea, reverseMode, parent) {
        var self = this;

        self.lines = lines;
        self.rows = rows;
        self.tilesTab = [];
        self.questionsTab = questionsTab;
        self.startPosition = 0;
        self.reverseMode = reverseMode;
        self.parent = parent;
        self.totalRows = 0;
        if (self.questionsTab.length % self.lines === 0) {
            self.totalRows = self.questionsTab.length / self.lines;
        }
        else {
            self.totalRows = Math.floor(self.questionsTab.length / self.lines) + 1;
        }

        var count = 0;
        self.completeBanner = [];
        self.puzzleManipulator = new Manipulator(self);
        self.leftChevronManipulator = new Manipulator(self);
        self.leftChevronManipulator.addOrdonator(1);
        self.rightChevronManipulator = new Manipulator(self);
        self.rightChevronManipulator.addOrdonator(1);
        self.questionWithBadAnswersManipulator = new Manipulator(self);
        self.puzzleManipulator.last.add(self.questionWithBadAnswersManipulator.first);
        self.puzzleManipulator.last.add(self.leftChevronManipulator.first);
        self.puzzleManipulator.last.add(self.rightChevronManipulator.first);

        if (self.reverseMode) {
            for (var i = 0; i < self.lines; i++) {
                self.completeBanner[i] = [];
                for (var j = 0; j < self.rows; j++) {
                    if (count < self.questionsTab.length) {
                        self.completeBanner[i][j] = self.questionsTab[count];
                        count++;
                    } else {
                        break;
                    }
                }
            }
        } else {
            for (i = 0; i < self.totalRows; i++) {
                self.completeBanner[i] = [];
                for (j = 0; j < self.lines; j++) {
                    if (count < self.questionsTab.length) {
                        self.completeBanner[i][j] = self.questionsTab[count];
                        if ((self.completeBanner[i][j] instanceof Question) && self.completeBanner[i][j].answersManipulator.first) {
                            self.completeBanner[i][j].questionManipulator.flush();
                        }
                        count++;
                    } else {
                        break;
                    }
                }
            }
        }
    };

////////////////// end of Puzzle.js //////////////////////////


////////////////// Question.js //////////////////////////
    /** Created by ABO3476 on 29/02/2016. */

    /**
     * @param question
     * @param quizz
     * @constructor
     */

    Question = function (question, quizz) {
        var self = this;
        self.questionManipulator = new Manipulator(self);
        self.questionManipulator.addOrdonator(6);
        self.answersManipulator = new Manipulator(self);
        self.questionManipulator.last.add(self.answersManipulator.first);
        self.resetManipulator = new Manipulator(self);
        self.resetManipulator.addOrdonator(2);
        self.answersManipulator.last.add(self.resetManipulator.first);
        self.validateManipulator = new Manipulator(self);
        self.validateManipulator.addOrdonator(2);
        self.answersManipulator.last.add(self.validateManipulator.first);
        self.simpleChoiceMessageManipulator = new Manipulator(self);
        self.simpleChoiceMessageManipulator.addOrdonator(2);
        self.answersManipulator.last.add(self.simpleChoiceMessageManipulator.first);

        self.selected = false;
        self.parentQuizz = quizz;
        self.tabAnswer = [];
        self.fontSize = 20;
        self.questionNum = self.parentQuizz.tabQuestions.length+1;

        self.delete = function(){
            let index = self.parentQuizz.tabQuestions.indexOf(self);
            if(index!== -1){
                self.parentQuizz.tabQuestions.splice(index, 1);
                return true;
            }
            else{
                return false;
            }
        };

        if (!question) {
            self.label = "";
            self.imageSrc = "";
            self.rows = 4;
            self.rightAnswers = [];
            self.tabAnswer = [new Answer(null, self), new Answer(null, self)];
            self.selectedAnswers = [];
            self.multipleChoice = false;
            self.font = "Arial";
            self.bgColor = myColors.white;
            self.colorBordure = myColors.black;

        } else {
            self.label = question.label;
            self.imageSrc = question.imageSrc;
            self.rows = question.rows;
            self.rightAnswers = [];
            self.selectedAnswers = [];
            self.multipleChoice = question.multipleChoice;

            question.colorBordure && (self.colorBordure = question.colorBordure);
            question.bgColor && (self.bgColor = question.bgColor);
            question.font && (self.font = question.font);
            question.fontSize && (self.fontSize = question.fontSize);

            if (question.imageSrc) {
                self.image = imageController.getImage(self.imageSrc, function () {
                    self.imageLoaded = true;
                    self.dimImage = {width: self.image.width, height: self.image.height};
                });
                self.imageLoaded = false;
            } else {
                self.imageLoaded = true;
            }
        }
        if (question !== null && question.tabAnswer !== null) {

            question.tabAnswer.forEach(function (it) {
                var tmp = new Answer(it, self);
                self.tabAnswer.push(tmp);
                if (tmp.correct) {
                    self.rightAnswers.push(tmp);
                }

            });
        }

        self.lines = Math.floor(self.tabAnswer.length / self.rows); //+ 1;
        if (self.tabAnswer.length % self.rows !== 0) {
            self.lines += 1;
        }// else {
        //    self.lines = Math.floor(self.tabAnswer.length / self.rows) + 1;
        //}

        self.bordure = null;
        self.content = null;
    };

////////////////// end of Question.js //////////////////////////


////////////////// QuestionCreator.js //////////////////////////
    /**
     * Created by qde3485 on 15/03/16.
     */

    QuestionCreator = function (parent, question) {
        var self = this;
        self.MAX_ANSWERS = 8;
        self.parent = parent;

        self.manipulator = new Manipulator(self);
        self.manipulatorQuizzInfo = new Manipulator(self);
        self.questionCreatorManipulator = new Manipulator(self);
        self.questionCreatorManipulator.addOrdonator(6);
        self.questionManipulator = new Manipulator(self);
        self.questionManipulator.addOrdonator(6);
        self.toggleButtonManipulator = new Manipulator(self);
        self.previewButtonManipulator = new Manipulator(self);
        self.previewButtonManipulator.addOrdonator(2);
        self.manipulator.last.add(self.previewButtonManipulator.first);
        self.saveQuizButtonManipulator = new Manipulator(self);
        self.manipulator.last.add(self.saveQuizButtonManipulator.first);

        self.questionNameValidInput = true;


        self.labelDefault = "Cliquer deux fois pour ajouter la question";
        self.quizzType = myQuizzType.tab;

        self.loadQuestion = function (quest) {
            self.linkedQuestion = quest;
            quest.label && (self.label = quest.label);
            if (typeof quest.multipleChoice !== 'undefined') {
                self.multipleChoice = quest.multipleChoice;
            } else {
                self.multipleChoice = false;
            }
            quest.tabAnswer.forEach(function (answer) {
                if(answer instanceof Answer){
                    answer.isEditable(self, true);
                }
            });
            quest.tabAnswer.forEach(function (el) {
                if (el.correct) {
                    quest.rightAnswers.push(el);
                }
            });
        };

        if (!question) {
            // init default : 2 empty answers
            self.linkedQuestion=new Question(defaultQuestion,self.parent.quizz);
        } else {
            self.loadQuestion(question);
        }

        self.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};
        self.checkInputTextArea = function (myObj) {
            if (myObj.textarea.messageText.match(REGEX)) {
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                !runtime && (myObj.textarea.border = "none");
                !runtime && (myObj.textarea.outline = "none");
                self.quizzNameValidInput = true;
            } else {
                myObj.display();
                //myObj.textarea.onblur = function () {
                //    myObj.textarea.component.value = "";
                //    myObj.onblur();
                //    myObj.remove();
                //}
            }
        };
    };
////////////////// end of QuestionCreator.js //////////////////////////

////////////////// BD //////////////////////////

    Bd = function(bd, parentFormation){
        var self = this;
        self.miniatureManipulator = new Manipulator(self);
        self.parentFormation = parentFormation;
        self.title = "BD";
        self.miniaturePosition = {x:0, y:0};

        self.getPositionInFormation = function () {
            var gameIndex, levelIndex;
            for (var i = 0; i < self.parentFormation.levelsTab.length; i++) {
                gameIndex = self.parentFormation.levelsTab[i].gamesTab.indexOf(self);
                if (gameIndex !== -1) {
                    break;
                }
            }
            levelIndex = i;
            self.levelIndex = levelIndex;
            self.gameIndex = gameIndex;
            return {levelIndex: levelIndex, gameIndex: gameIndex};
        };


    };

////////////////// end of BD //////////////////////////

////////////////// Quizz.js //////////////////////////
    /**
     * Created by ABL3483 on 01/03/2016.
     */

    /**
     *
     * @constructor
     * @param quizz
     * @param previewMode
     * @param parentFormation
     */
    Quizz = function (quizz, previewMode, parentFormation) {
        var self = this;

        self.miniatureManipulator = new Manipulator(self);
        self.parentFormation = parentFormation;
        self.quizzManipulator = new Manipulator(self);
        self.quizzManipulator.addOrdonator(2);
        self.childrenGames = [];
        self.loadQuestions = function (quizz) {
            if (quizz && typeof quizz.tabQuestions !== 'undefined') {
                self.tabQuestions = [];
                quizz.tabQuestions.forEach(function (it) {
                    var tmp = new Question(it, self);
                    tmp.parentQuizz=self;
                    self.tabQuestions.push(tmp);
                });
            } else {
                self.tabQuestions = [];
                self.tabQuestions.push(new Question(defaultQuestion, self));
                self.tabQuestions.push(new Question(defaultQuestion, self));
            }
        };
        self.loadQuestions(quizz);
        if(self.levelIndex === undefined ){self.levelIndex = quizz.levelIndex;}
        if(self.gameIndex === undefined) { self.gameIndex = quizz.gameIndex;}
        //self.childrenGames=quizz.childrenGames;
        (previewMode) ? (self.previewMode = previewMode) : (self.previewMode = false);
        quizz.puzzleRows ? (self.puzzleRows = quizz.puzzleRows) : (self.puzzleRows = 2);
        quizz.puzzleLines ? (self.puzzleLines = quizz.puzzleLines) : (self.puzzleLines = 2);
        quizz.font && (self.font = quizz.font);
        quizz.fontSize ? (self.fontSize = quizz.fontSize) : (self.fontSize = 20);
        quizz.colorBordure ? (self.colorBordure = quizz.colorBordure) : (self.colorBordure = myColors.black);
        quizz.bgColor ? (self.bgColor = quizz.bgColor) : (self.bgColor = myColors.none);
        self.resultArea = {
            x: drawing.width / 2,
            y: 220,
            w: drawing.width,
            h: 200
        };
        self.titleArea = {
            x: 0,
            y: 0,
            w: drawing.width,
            h: 200
        };
        self.questionArea = {
            x: 0,
            y: 210,
            w: drawing.width,
            h: 200
        };
        self.miniaturePosition = {x:0, y:0};
        self.questionsWithBadAnswers = [];
        self.score = 0;
        self.drawing = drawing;
        self.title = quizz.title ? quizz.title : '';
        self.currentQuestionIndex = -1;
        self.finalMessage = "";
        self.run = function (x, y, w, h) {
            var intervalToken = asyncTimerController.interval(function () {
                if (self.tabQuestions.every(e => e.imageLoaded && e.tabAnswer.every(el => el.imageLoaded))) {
                    asyncTimerController.clearInterval(intervalToken);
                    self.display(x, y, w, h);
                }
            }, 100);
            runtime && self.tabQuestions.forEach(function(e){
                e.image && imageController.imageLoaded(e.image.id, myImagesSourceDimensions[e.image.src].width, myImagesSourceDimensions[e.image.src].height);
                e.tabAnswer.forEach(function(el){
                    el.image && imageController.imageLoaded(el.image.id, myImagesSourceDimensions[el.image.src].width, myImagesSourceDimensions[el.image.src].height);
                });

            });
            runtime && self.display(x, y, w, h);
        };

        // !_! bof, y'a encore des display appelés ici
        self.nextQuestion = function(){
            if (self.currentQuestionIndex !== -1 && !self.previewMode) {
                self.quizzManipulator.last.remove(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);
            }
            var functionDisplayInAllCases = function(){
                if (self.tabQuestions[self.currentQuestionIndex].imageSrc){
                    self.questionHeight = self.questionHeightWithImage;
                    self.answerHeight = self.answerHeightWithImage;
                }
                else {
                    self.questionHeight = self.questionHeightWithoutImage;
                    self.answerHeight = self.answerHeightWithoutImage;
                }
                self.quizzManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);
                self.tabQuestions[self.currentQuestionIndex].questionManipulator.flush();
                self.tabQuestions[self.currentQuestionIndex].display(0, self.headerHeight / 2 + self.questionHeight / 2 + MARGIN,
                    self.questionArea.w, self.questionHeight);
                !self.previewMode && self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].answersManipulator.translator);
                self.tabQuestions[self.currentQuestionIndex].displayAnswers(0, self.headerHeight + MARGIN + self.questionHeight,
                    self.questionArea.w, self.answerHeight);
            };
            var callback = function () {
                if (++self.currentQuestionIndex < self.tabQuestions.length) {
                    functionDisplayInAllCases();
                } else {
                    console.log("Final score: " + self.score);
                    self.puzzle = new Puzzle(self.puzzleLines, self.puzzleRows, self.questionsWithBadAnswers, self.resultArea, null, self);
                    self.displayResult();
                }
            };
            if (self.previewMode) {
                if (self.currentQuestionIndex === -1) {
                    self.currentQuestionIndex = 0;//numéro de la question affichée
                    functionDisplayInAllCases();
                }
            } else {
                Server.sendProgressToServer(self);
                callback();
            }
        };

        self.getPositionInFormation = function () {
            var gameIndex, levelIndex;
            for (var i = 0; i < self.parentFormation.levelsTab.length; i++) {
                gameIndex = self.parentFormation.levelsTab[i].gamesTab.indexOf(self);
                if (gameIndex !== -1) {
                    break;
                }
            }
            levelIndex = i;
            self.levelIndex = levelIndex;
            self.gameIndex = gameIndex;
            return {levelIndex: levelIndex, gameIndex: gameIndex};
        };

    };

////////////////// end of Quizz.js //////////////////////////


////////////////// QuizzManager.js //////////////////////////
    /**
     * Created by ABL3483 on 12/04/2016.
     */

    QuizzManager = function (quizz) {
        var self = this;

        self.quizzName = "";
        self.quizzNameDefault = "Ecrire ici le nom du quiz";
        self.tabQuestions = [defaultQuestion];
        self.questionPuzzle = {};
        self.quizzNameValidInput = true;
        self.loadQuizz = function (quizz, parentFormation) {
            self.indexOfEditedQuestion = 0;
            self.quizz = new Quizz(quizz, true, parentFormation);
            self.quizz.childrenGames = quizz.childrenGames;
            self.quizz.parentGames=quizz.parentGames;
            self.quizzName = self.quizz.title;
            self.quizz.tabQuestions[0].selected = true;
            self.questionCreator.loadQuestion(self.quizz.tabQuestions[0]);
            self.quizz.tabQuestions.push(new AddEmptyElement(self, 'question'));
        };
        if (!quizz) {
            var initialQuizzObject = {
                title: defaultQuizz.title,
                bgColor: myColors.white,
                tabQuestions: self.tabQuestions,
                puzzleLines: 3,
                puzzleRows: 3
            };
            self.quizz = new Quizz(initialQuizzObject, false);
            self.indexOfEditedQuestion = 0;
            self.quizzName = self.quizz.title;
        } else {
            self.loadQuizz(quizz);
        }

        self.saveQuizz = function () {

            var getObjectToSave = function () {
                console.log(self.tabQuestions);
                self.tabQuestions=self.quizz.tabQuestions;
                (self.tabQuestions[self.quizz.tabQuestions.length-1] instanceof  AddEmptyElement) && self.tabQuestions.pop();
                self.tabQuestions.forEach(function(question){
                    (question.tabAnswer[question.tabAnswer.length-1] instanceof  AddEmptyElement)&& question.tabAnswer.pop();
                });

                return{
                    title: self.quizzName,
                    tabQuestions: self.quizz.tabQuestions,
                    childrenGames: self.quizz.childrenGames,
                    levelIndex: self.quizz.levelIndex,
                    gameIndex: self.quizz.gameIndex
                };
            };
            var callback = function () {
                self.quizz.title=self.quizzName;
                self.quizz.tabQuestions=self.tabQuestions;
                let quizz = self.parentFormation.levelsTab[self.quizz.levelIndex].gamesTab[self.quizz.gameIndex];
                (self.parentFormation.miniaturesManipulator.last.children.indexOf(quizz.miniatureManipulator.first)!==-1) && self.parentFormation.miniaturesManipulator.last.remove(quizz.miniatureManipulator.first);
                self.parentFormation.levelsTab[self.quizz.levelIndex].gamesTab[self.quizz.gameIndex]=self.quizz;
                quizz.parentGames.forEach(function(parent){
                    let index = parent.childrenGames.indexOf(quizz);
                    parent.childrenGames.splice(index,1,self.parentFormation.levelsTab[self.quizz.levelIndex].gamesTab[self.quizz.gameIndex]);
                });
                console.log("Votre travail a été bien enregistré");
            };

            let ignoredData = (key, value) => myParentsList.some(parent => key === parent) ? undefined : value;
            Server.replaceQuizz(getObjectToSave(), self.parentFormation._id, self.quizz.levelIndex, self.quizz.gameIndex, callback, ignoredData)
        };

        self.questionCreator = new QuestionCreator(self, self.quizz.tabQuestions[self.indexOfEditedQuestion]);
        self.header = new Header();
        self.library = new Library(myLibraryImage);
        self.quizz.tabQuestions[0].selected = true;
        self.questionCreator.loadQuestion(self.quizz.tabQuestions[0]);
        self.quizz.tabQuestions.push(new AddEmptyElement(self, 'question'));
        self.quizzManagerManipulator = new Manipulator(self);
        self.questionsPuzzleManipulator = new Manipulator(self);
        self.questionsPuzzleManipulator.addOrdonator(1);
        self.quizzInfoManipulator = new Manipulator(self);
        self.quizzInfoManipulator.addOrdonator(6);
        self.questionCreatorManipulator = self.questionCreator.manipulator;
        self.questionCreatorManipulator.addOrdonator(1);
        self.previewButtonManipulator = new Manipulator(self);
        self.previewButtonManipulator.addOrdonator(2);
        self.saveQuizButtonManipulator = new Manipulator(self);
        self.saveQuizButtonManipulator.addOrdonator(2);
        self.returnButtonManipulator = new Manipulator(self);
        self.returnButtonManipulator.addOrdonator(1);
        self.returnButton = new ReturnButton(self);
        self.libraryIManipulator = self.library.libraryManipulator;

        // WIDTH
        self.libraryWidthRatio = 0.15;
        self.questCreaWidthRatio = 1 - self.libraryWidthRatio;


        // HEIGHT
        self.quizzInfoHeightRatio = 0.05;
        self.questionsPuzzleHeightRatio = 0.25;
        self.questCreaHeightRatio = 0.57;
        self.libraryHeightRatio = self.questCreaHeightRatio;
        self.previewButtonHeightRatio = 0.1;
        self.saveButtonHeightRatio = 0.1;
        self.marginRatio = 0.03;

        self.selectNextQuestion = () =>{
            self.indexOfEditedQuestion++;
        };

    };

////////////////// end of QuizzManager.js //////////////////////////
}

User = function () {
    let self = this;
    self.firstName;
    self.lastName;
    self.mailAddress;
    self.password;
};
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

////////////////// ConnectionManager.js //////////////////////////

ConnectionManager = function () {

    let self = this;

    self.manipulator = new Manipulator(self);
    self.manipulator.addOrdonator(6);
    self.header = new Header("Connexion");
    self.mailAddressManipulator = new Manipulator(self);
    self.mailAddressManipulator.addOrdonator(4);
    self.passwordManipulator = new Manipulator(self);
    self.passwordManipulator.addOrdonator(4);
    self.connectionButtonManipulator=new Manipulator(self);
    self.connectionButtonManipulator.addOrdonator(4);

    self.manipulator.last.add(self.mailAddressManipulator.first);
    self.manipulator.last.add(self.passwordManipulator.first);
    self.manipulator.last.add(self.connectionButtonManipulator.first);

    // HEIGHT
    self.connectionButtonHeightRatio = 0.075;

    self.connectionButtonHeight = drawing.height * self.connectionButtonHeightRatio;
    self.connectionButtonWidth = 200;

    self.mailAddressLabel = "Adresse mail :";
    self.passwordLabel = "Mot de passe :";

    self.connectionButtonLabel = "Connexion";
    self.tabForm =[];

    let listFormations = function() {
        Server.getAllFormationsNames(data => {
            let myFormations = JSON.parse(data).myCollection;
            formationsManager = new FormationsManager(myFormations);
            formationsManager.display();
        });
    };

    self.connectionButtonHandler = function() {

        let emptyAreas = self.tabForm.filter(field => field.label === '');
        emptyAreas.forEach(emptyArea => {emptyArea.cadre.color(myColors.white, 3, myColors.red)});

        if (emptyAreas.length > 0) {
            let message = autoAdjustText(EMPTY_FIELD_ERROR, 0, 0, drawing.width, self.h, 20, null, self.connectionButtonManipulator, 3);
            message.text.color(myColors.red).position(0, - self.connectionButton.cadre.height + MARGIN);
            svg.timeout(function() {
                self.connectionButtonManipulator.ordonator.unset(3);
                emptyAreas.forEach(emptyArea => {emptyArea.cadre.color(myColors.white, 1, myColors.black)});
            },5000);
        } else {
            Server.connect(self.mailAddressField.label, self.passwordField.labelSecret, data => {
                data = data && JSON.parse(data);
                if (data.ack === 'OK') {
                    drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                    data.user.admin ? AdminGUI() : LearningGUI();
                    listFormations();
                } else {
                    let message = autoAdjustText('Adresse et/ou mot de passe invalide(s)', 0, 0, drawing.width, self.h, 20, null, self.connectionButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, - self.connectionButton.cadre.height + MARGIN);
                    svg.timeout(() => {self.connectionButtonManipulator.ordonator.unset(3)}, 5000);
                }
            });
        }
    };
};
////////////////// end of ConnectionManager.js //////////////////////////

if(typeof exports !== "undefined") {
    exports.Domain = Domain;
    exports.setUtil = setUtil;
    exports.setGlobalVariables = setGlobalVariables;
    exports.setRuntime = setRuntime;
    exports.setSvg = setSvg;
}