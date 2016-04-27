/**
 * Created by TDU3482 on 26/04/2016.
 */

////////////// Answer.js /////////////////

/**
 * Created by qde3485 on 25/02/16.
 */

/**
 *
 * @param label : texte à afficher pour la réponse
 * @param imageSrc : lien relatif vers l'image. Peut-être vide/null/indéfini si aucune image
 * @param correct : booléen qui indique si la réponse est correcte
 * @param colorBordure : objet de 3 éléments (r, g, b) correspondant aux composantes couleur de la bordure associée à la réponse
 * @param bgColor : objet de 3 élements (r, g, b) correspondant aux composantes couleur du fond
 * @constructor
 */
/*label, imageSrc, correct, colorBordure, bgColor*/
var Answer = function (answerParameters, parent) {
    var self = this;
    self.parent = parent;
    var answer = {
        label:'',
        imageSrc:null,
        correct:false
    };
    answerParameters && (answer = answerParameters);
    self.manipulator = new Manipulator(self);
    self.label = answer.label;
    self.imageSrc = answer.imageSrc;
    self.correct = answer.correct;
    self.selected = false;

    self.fontSize = answer.fontSize ? answer.fontSize : 20;
    answer.font && (self.font = answer.font);

    self.imageLoaded = false;

    if(answer.imageSrc) {
        self.image = imageController.getImage(self.imageSrc, function () {
            self.imageLoaded = true;
            self.dimImage = {width:self.image.width, height:self.image.height};
        });
        self.imageLoaded = false;
    } else {
        self.imageLoaded = true;
    }

    self.colorBordure = answer.colorBordure ? answer.colorBordure : myColors.black;
    self.bgColor = answer.bgColor ? answer.bgColor : myColors.white;

    self.bordure = null;
    self.content = null;

};

//////////////////// end of Answer.js ////////////////

/////////////////// BibImage.js //////////////////

/**
 * Created by ABO3476 on 15/03/2016.
 */


var Library = function (lib) {
    var self = this;
    self.libraryManipulator = new Manipulator(self);
    //mainManipulator.last.add(self.libraryManipulator.first);
    self.title = lib.title;

    self.tabImgBib = [];
    self.tabLib = [];
    lib.tabLib && (self.tabLib = lib.tabLib);
    self.bibManipulators = [];

    self.imageWidth = 50;
    self.imageHeight = 50;
    self.libMargin = 5;
    self.libraryGamesTab=[];

    for(var i = 0; i<self.tabLib.length; i++) {
        if (self.tabLib[i].imgSrc) {
            var img = imageController.getImage(self.tabLib[i].imgSrc, function () {
                this.imageLoaded = true;
            });
            self.tabImgBib[i] = img;
        }
    }

    if(lib.font) {
        self.font = lib.font;
    }
    if(lib.fontSize) {
        self.fontSize = lib.fontSize;
    } else {
        self.fontSize = 20;
    }

    self.run = function(x,y,w,h,callback) {
        self.intervalToken = asyncTimerController.interval(function () {
            var loaded = true;
            self.tabImgBib.forEach(function (e) {
                loaded = loaded && e.imageLoaded;
            });
            if(loaded) {
                asyncTimerController.clearInterval(self.intervalToken);
                self.display(x,y,w,h);
                callback();
            }
        }, 100);
    };

    self.dropAction = function(element, event){
        var target = drawing.getTarget(event.clientX, event.clientY);
        if(target && target._acceptDrop) {
            if (element instanceof svg.Image) {
                var oldQuest={cadre:target.parent.parentManip.ordonator.get(0),
                    content:target.parent.parentManip.ordonator.get(1)};

                target.parent.parentManip.ordonator.unset(0);
                target.parent.parentManip.ordonator.unset(1);

                var newQuest = displayImageWithTitle(oldQuest.content.messageText, element.src,
                    element.srcDimension,
                    oldQuest.cadre.width, oldQuest.cadre.height,
                    oldQuest.cadre.strokeColor, oldQuest.cadre.fillColor, null, null, target.parent.parentManip
                );

                //for(var i=0;i<target.parent.children[0].children.length;i++){
                //    target.parent.children[0].unset(i);
                //}
                //target.parent.children[0].add(newQuest);
                oldQuest.cadre.position(newQuest.cadre.x, newQuest.cadre.y);
                oldQuest.content.position(newQuest.content.x,newQuest.content.y);

                newQuest.image._acceptDrop = true;
                switch(true){
                    case target.parent.parentManip.parentObject instanceof QuestionCreator:
                        target.parent.parentManip.parentObject.linkedQuestion.image = newQuest.image;
                        target.parent.parentManip.parentObject.linkedQuestion.imageSrc = newQuest.image.src;
                        target.parent.parentManip.parentObject.parent.displayQuestionsPuzzle(null, null, null, null, target.parent.parentManip.parentObject.parent.questionPuzzle.startPosition);
                        break;
                    case target.parent.parentManip.parentObject instanceof AnswerElement:
                        target.parent.parentManip.parentObject.linkedAnswer.image=newQuest.image;
                        target.parent.parentManip.parentObject.linkedAnswer.imageSrc=newQuest.image.src;
                        break;
                }
                target.parent.parentManip.ordonator.set(0, oldQuest.cadre);
                target.parent.parentManip.ordonator.set(1, oldQuest.content);
            }
            else {

                var formation;
                var dropLocation = target.parent.parentManip.parentObject;  // à renommer....
                if(dropLocation instanceof Formation){
                    formation = dropLocation;
                    formation.addNewLevel();
                    formation.targetLevelIndex = formation.levelsTab.length-1;
                }else{
                    if(dropLocation instanceof Level){
                        var level = dropLocation;
                        formation = level.parentFormation;
                        formation.targetLevelIndex = formation.levelsTab.indexOf(level);
                        console.log("e");
                    }
                }

                // déterminer le targetLevelIndex !_!

                var objectToBeAddedLabel = self.draggedObjectLabel ? self.draggedObjectLabel : (self.gameSelected.content.messageText ? self.gameSelected.content.messageText : false);
                switch (objectToBeAddedLabel) {
                    case (myBibJeux.tabLib[0].label):
                        var newQuizz = new Quizz({}, false, formation);
                        newQuizz.label = objectToBeAddedLabel + " " + formation.gamesCounter.quizz;
                        formation.levelsTab[formation.targetLevelIndex].gamesTab.push(newQuizz);
                        formation.gamesCounter.quizz++;
                        break;
                    case (myBibJeux.tabLib[1].label):
                        formation.levelsTab[formation.targetLevelIndex].gamesTab.push({
                            type: objectToBeAddedLabel,
                            label: objectToBeAddedLabel + " " + formation.gamesCounter.bd
                        });
                        formation.gamesCounter.bd++;
                        break;
                }
                if (formation.levelsTab[0].gamesTab.length>formation.maxGameInARow){
                    autoAdjustText(formation.maxGameInARowMessage, 0, 0, formation.graphCreaWidth, formation.graphCreaHeight, 20, null, formation.manipulator).text.color(myColors.red)
                        .position(drawing.width - MARGIN, 0).anchor("end");
                }
                else {
                    for(var i = 0 ; i<formation.levelsTab.length; i++){
                        formation.displayLevel(formation.graphCreaWidth, formation.graphCreaHeight, formation.levelsTab[i]);
                    }
                }
            }
        }

        //self.gameSelected && formation && svg.removeEvent(formation.graphBlock.rect, "mouseup", formation.mouseUpGraphBlock);
        self.gameSelected && formation && self.gameSelected.cadre.color(myColors.white, 1, myColors.black);
    };

};

/////////////////// end of BibImage.js ///////////////

////////////////// EmptyElement.js ///////////////
/**
 * Created by qde3485 on 15/03/16.
 */

var AddEmptyElement = function (parent, type) {
    var self = this;
    self.manipulator = new Manipulator(self);
    self.plusManipulator = new Manipulator(self);
    self.manipulator.last.add(self.plusManipulator.first);
    type && (self.type = type);
    switch(type) {
        case 'question':
            //self.questionNameValidInput = true;
            self.label = "Double-cliquez pour ajouter une question";
            break;
        case 'answer':
            self.answerNameValidInput = true;
            self.label = "Double-cliquez pour ajouter une réponse";
            break;
    }

    self.fontSize = 20;
    self.parent = parent;


};

var AnswerElement = function (answer, parent) {
    var self = this;

    self.manipulator = new Manipulator(self);
    self.linkedAnswer = answer;
    self.isValidInput = true;
    self.labelDefault = "Double cliquer pour modifier et cocher si bonne réponse.";
    self._acceptDrop = true;

    if(answer) {
        self.label = answer.label;
        answer.fontSize && (self.fontSize = answer.fontSize);

        if(typeof answer.correct !== 'undefined'){
            self.correct = answer.correct;
        }else{
            self.correct=false;
        }
        answer.font && (self.font = answer.font);

    }else {
        self.label = "";
        self.fontSize = 20;
        self.correct = false;
        self.font = "Arial";
        self.colorBordure = myColors.black;
        self.bgColor = myColors.white;
    }
    self.parent = parent;

    self.checkInputContentArea = function (objCont) {
        if (objCont.contentarea.value.match(REGEX)) {
            self.label = objCont.contentarea.value;
            objCont.remove();
            objCont.contentarea.onblur = objCont.onblur;
            objCont.contentarea.style.border = "none";
            objCont.contentarea.style.outline = "none";
        } else {
            objCont.display();
            objCont.contentarea.onblur = function () {
                objCont.contentarea.value = "";
                objCont.onblur();
                objCont.remove();
            }
        }
    };


};

//////////////////////// end of EmptyElement.js //////////////////////

/////////////////////// Formation.js /////////////////////
var Level = function(formation, gamesTab){
    var self = this;
    self.parentFormation = formation;
    self.index = (self.parentFormation.levelsTab[self.parentFormation.levelsTab.length-1]) ? (self.parentFormation.levelsTab[self.parentFormation.levelsTab.length-1].index+1) : 1;
    gamesTab? (self.gamesTab = gamesTab) : (self.gamesTab = []);
    self.x = self.parentFormation.bibWidth ? self.parentFormation.bibWidth : null; // Juste pour être sûr
    self.y = (self.index-1) * self.parentFormation.levelHeight;
    self.obj = null;
    self.removeGame = function(index){
        if(!index){
            self.gamesTab.pop();
        }else{
            self.gamesTab[index].splice(index, 1);
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

var Formation = function(formation){
    var self = this;
    self.manipulatorMiniature = new Manipulator();
    self.iconManipulator = new Manipulator();
    self.manipulator = new Manipulator(self);
    self.formationInfoManipulator = new Manipulator();
    self.graphManipulator = new Manipulator(self);

    self.bib = new Library(myBibJeux);
    self.bib.formation = self;

    //self.bib = new BibJeux(myQuizzTypeBib);

    self.gamesLibraryManipulator = self.bib.libraryManipulator;
    self.manipulator.last.add(self.gamesLibraryManipulator.first);
    self.manipulator.last.add(self.graphManipulator.first);


    self.manipulatorMiniature.last.add(self.iconManipulator.first);
    self.manipulator.last.add(self.formationInfoManipulator.first);
    self.labelDefault = "Entrer le nom de la formation";


    // WIDTH
    self.bibWidthRatio = 0.15;
    self.graphWidthRatio = 1-self.bibWidthRatio;
    self.bibWidth = drawing.width*self.bibWidthRatio;
    self.graphCreaWidth = drawing.width*self.graphWidthRatio;

    // HEIGHT
    self.graphCreaHeightRatio = 0.85;
    self.graphCreaHeight = drawing.height*self.graphCreaHeightRatio;


    self.graphElementSize = 100;
    self.levelHeight = (self.graphCreaHeight-3*MARGIN)/4;
    self.levelWidth = drawing.width - self.bibWidth;
    self.minimalMarginBetweenGraphElements = self.graphElementSize/2;
    self.x = MARGIN;
    self.y = drawing.height * HEADER_SIZE + 3 * MARGIN;
    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){0,50}$/g;
    self.maxGameInARow = 6;
    self.maxGameInARowMessage = "Le nombre maximum de jeux dans ce niveau est atteint.";

    self.quizzManager = new QuizzManager(defaultQuizz);
    self.targetLevelIndex = 0;
    self.levelsTab = [];

    //self.gamesTab = myFormation.gamesTab;
    self.marginRatio = 0.03;
    self.globalMargin = {
        height:self.marginRatio*drawing.height,
        width:self.marginRatio*drawing.width
    };

    self.label = formation.label ? formation.label : "Nouvelle formation";
    self.status = formation.status ? formation.status : statusEnum.NotPublished;


    self.checkInputTextArea = function (myObj) {
        if (myObj.textarea.value.match(self.regex)) {
            myObj.remove();
            myObj.textarea.onblur = myObj.onblur;
            myObj.textarea.style.border = "none";
            myObj.textarea.style.outline = "none";
        } else {
            myObj.display();
            myObj.textarea.onblur = function () {
                myObj.textarea.value = "";
                myObj.onblur();
                myObj.remove();
            }
        }
    };

    self.addNewLevel = function(index){
        var level = new Level(self);
        if(!index){
            self.levelsTab.push(level);
        }else{
            self.levelsTab.splice(index, 0, level);
        }
    };

    self.removeLevel = function(index){
        self.levelsTab.splice(index-1, 1);
    };

    self.clickToAdd = function (){

        self.mouseUpGraphBlock = function(event){
            self.bib.dropAction(self.bib.gameSelected.cadre, event);
            self.bib.gameSelected.cadre.color(myColors.white, 1, myColors.black);
            self.bib.gameSelected = null;
            svg.removeEvent(self.graphBlock.rect, "mouseup", self.mouseUpGraphBlock);
            self.levelsTab.forEach(function(e) {
                svg.removeEvent(e.obj.cadre, "mouseup", self.mouseUpGraphBlock);
            });
        };
        if(self.bib.gameSelected){
            svg.addEvent(self.graphBlock.rect, "mouseup", self.mouseUpGraphBlock);
            self.levelsTab.forEach(function(e) {
                svg.addEvent(e.obj.cadre, "mouseup", self.mouseUpGraphBlock);
            });
        }
    };

    self.adjustGamesPositions = function(level){
        var nbOfGames = level.gamesTab.length;
        var spaceOccupied = (nbOfGames)*(self.minimalMarginBetweenGraphElements)+self.graphElementSize*nbOfGames;

        level.gamesTab.forEach(function(game){
            var pos = game.getPositionInFormation();

            game.miniaturePosition.x = 0;

            if(pos.gameIndex<nbOfGames/2){
                game.miniaturePosition.x-= -self.minimalMarginBetweenGraphElements*(3/2) - self.borderSize + (nbOfGames/2-pos.gameIndex)*spaceOccupied/nbOfGames;
            }else{
                game.miniaturePosition.x+= +self.minimalMarginBetweenGraphElements*(3/2) + self.borderSize + (pos.gameIndex-nbOfGames/2)*spaceOccupied/nbOfGames;
            }

            game.miniaturePosition.y = -self.graphCreaHeight/2+(level.index-1/2)*self.levelHeight;

        });
    }
};

/////////////////////// end of Formation.js ///////////////////

/////////////////////// FormationManager.js ///////////////////
/**
 * Created by ACA3502 on 14/04/2016.
 */

function FormationsManager(formations, additionalMessage) {
    var self = this;

    self.header = new Header(additionalMessage);
    self.x = MARGIN;
    self.y = drawing.height * self.header.size + 3 * MARGIN;
    self.addButtonWidth = 330;
    self.addButtonHeight = 40;
    self.fontSize = 20;
    self.plusDim = self.fontSize * 2;
    self.iconeSize = self.plusDim/1.5;

    self.headerHeightFormation = drawing.height*self.header.size*2;
    self.puzzleRows = 6;
    self.initialFormationsPosX = MARGIN;
    self.rows = 6;
    self.lines = 4;
    self.tileWidth = (drawing.width - 2 * MARGIN * (self.rows + 1)) / self.rows;
    self.tileHeight = Math.floor(((drawing.height - self.headerHeightFormation - 2 * MARGIN * (self.rows + 1))) / self.lines);

    self.formations=[];
    var count = 0;
    formations.tab.forEach(function (formation) {
        self.formations[count] = new Formation(formation);
        count ++;
    });

    self.manipulator = new Manipulator();
    self.manipulator.first.move(0, drawing.height*0.075);
    mainManipulator.ordonator.set(1, self.manipulator.first);

    self.headerManipulator = new Manipulator();
    self.manipulator.last.add(self.headerManipulator.first);


    self.addButtonManipulator = new Manipulator();
    self.headerManipulator.last.add(self.addButtonManipulator.first);
    self.addButtonManipulator.translator.move(self.plusDim / 2, self.addButtonHeight);

    self.checkManipulator = new Manipulator();
    self.headerManipulator.last.add(self.checkManipulator.first);

    self.exclamationManipulator = new Manipulator();
    self.headerManipulator.last.add(self.exclamationManipulator.first);

    self.formationsManipulator = new Manipulator();
    self.manipulator.last.add(self.formationsManipulator.first);



    var gui = new Gui();
    self.panel = new gui.Panel(drawing.width-2*MARGIN-2*self.tileWidth/2, (2*MARGIN+self.tileHeight)*(4)-self.tileHeight, myColors.node);
    var totalLines = count%self.rows === 0 ? count/self.rows : count/self.rows+1;
    self.panel.resizeContent(totalLines*(MARGIN+self.tileHeight)-self.tileHeight+MARGIN);
    self.formationsManipulator.last.add(self.panel.translate);
    //self.panel.translate.move(-self.tileWidth/2, -self.tileHeight/2);

    //self.foreign = document.createElementNS('http://www.w3.org/2000/svg', "foreignObject");
    //self.foreign.setAttribute("style", "width: 900px; height: 900px;");
    //self.div = document.createElement("div");
    //self.div.setAttribute("id", "foreign");
    //self.div.setAttribute("style", "width: 900px; height: 900px;");
    //self.manipulator.last.component.appendChild(self.foreign);
    //self.foreign.appendChild(self.div);
    //self.svg = new svg.Drawing(900, 900).show("foreign").position(0,0);
    //self.svg.add(self.formationsManipulator.first);

    self.formationsManipulator.translator.move(self.tileWidth / 2, drawing.height*0.15+MARGIN);

}

/////////////////// end of FormationManager.js ///////////////////


////////////////// Header.js //////////////////////////
/**
 * Created by qde3485 on 14/04/16.
 */

var Header = function (additionalMessage) {
    var self = this;
    additionalMessage && (self.addMessage = additionalMessage);
    self.manipulator = new Manipulator(self);
    self.label = "I-learning";
    self.size = 0.05; // 5%
    mainManipulator.ordonator.set(0, self.manipulator.first);


    self.setMessage = function (additionalMessage) {
        self.addMessage = additionalMessage;
        //self.display();
    };
    self.removeMessage = function () {
        self.addMessage = null;
        //self.display();
    };
};
////////////////// end of Header.js //////////////////////////


////////////////// Puzzle.js //////////////////////////
/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(lines, rows, questionsTab, cadreResult, reverseMode, parent) {
    var self=this;

    self.lines=lines;
    self.rows=rows;
    self.tilesTab=[];
    self.questionsTab=questionsTab;
    self.startPosition=0;

    self.reverseMode = reverseMode;
    self.parent=parent;

    self.totalRows = 0;
    if(self.questionsTab.length%self.lines === 0) {
        self.totalRows = self.questionsTab.length/self.lines;
    }
    else {
        self.totalRows = Math.floor(self.questionsTab.length/self.lines) +1;
    }

    var count = 0;
    self.virtualTab = [];
    self.puzzleManipulator = new Manipulator(self);
    self.leftArrowManipulator=new Manipulator(self);
    self.rightArrowManipulator=new Manipulator(self);
    self.questionWithBadAnswersManipulator=new Manipulator(self);
    self.puzzleManipulator.last.add(self.questionWithBadAnswersManipulator.first);
    self.puzzleManipulator.last.add(self.leftArrowManipulator.first);
    self.puzzleManipulator.last.add(self.rightArrowManipulator.first);



    if(self.reverseMode) {
        for (var i = 0; i < self.lines; i++) {
            self.virtualTab[i] = [];
            for (var j = 0; j < self.rows; j++) {
                if (count < self.questionsTab.length) {
                    self.virtualTab[i][j] = self.questionsTab[count];
                    count++;
                } else {
                    break;
                }
            }
        }
    } else {
        for (var i = 0; i < self.totalRows; i++) {
            self.virtualTab[i] = [];
            for (var j = 0; j < self.lines; j++) {
                if (count < self.questionsTab.length) {
                    self.virtualTab[i][j] = self.questionsTab[count];
                    //self.virtualTab[i][j].tabAnswer.splice(0,self.virtualTab[i][j].tabAnswer.length);

                    if((self.virtualTab[i][j] instanceof Question) && self.virtualTab[i][j].answersManipulator.first){
                        self.virtualTab[i][j].questionManipulator.first.flush();
                        //self.virtualTab[i][j].questionManipulator.last.remove(self.virtualTab[i][j].answersManipulator.first);
                    }
                    count++;
                } else {
                    break;
                }
            }
        }
    }

    //self.initDisplay(x, y, w, h, startPosition){
    //
    //}

    /**
     *
     * @param x: X
     * @param y: Y
     * @param w: Width
     * @param h: Height
     * @param startPosition: Row number to align with
     */

}
////////////////// end of Puzzle.js //////////////////////////


////////////////// Question.js //////////////////////////
/** Created by ABO3476 on 29/02/2016. */

/**
 * @param question
 * @param quizz
 * @constructor
 */

var Question = function (question, quizz) {
    var self = this;
    self.questionManipulator = new Manipulator(self);
    self.answersManipulator = new Manipulator(self);
    self.questionManipulator.last.add(self.answersManipulator.first);
    self.resetManipulator = new Manipulator(self);
    self.answersManipulator.last.add(self.resetManipulator.first);
    self.validateManipulator = new Manipulator(self);
    self.answersManipulator.last.add(self.validateManipulator.first);

    self.selected = false;

    self.parentQuizz = quizz;
    self.tabAnswer = [];
    self.fontSize = 20;
    self.questionNum = self.parentQuizz.tabQuestions.length+1;

    if(!question){
        self.label = "";
        self.imageSrc = "";
        self.rows = 2;
        self.rightAnswers = [];
        self.tabAnswer = [new Answer(null, self), new Answer(null, self)];
        self.selectedAnswers = [];
        self.multipleChoice = false;
        self.simpleChoice = true;
        self.font = "Arial";
        self.bgColor = myColors.white;
        self.colorBordure = myColors.black;

    }else{
        self.label = question.label;
        self.imageSrc = question.imageSrc;
        self.rows = question.rows;
        self.rightAnswers = [];
        self.selectedAnswers = [];
        self.multipleChoice = question.multipleChoice;
        self.simpleChoice = question.simpleChoice;

        question.colorBordure && (self.colorBordure = question.colorBordure);
        question.bgColor && (self.bgColor = question.bgColor);
        question.font && (self.font = question.font);
        question.fontSize && (self.fontSize = question.fontSize);

        if(question.imageSrc) {
            self.image = imageController.getImage(self.imageSrc, function () {
                self.imageLoaded = true;
                self.dimImage = {width:self.image.width, height:self.image.height};
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
            if(tmp.correct) {
                self.rightAnswers.push(tmp);
            }

        });
    }

    self.lines = Math.floor(self.tabAnswer.length/self.rows)+1;
    if(self.tabAnswer.length % self.rows === 0) {
        self.lines = Math.floor(self.tabAnswer.length/self.rows);
    } else {
        self.lines = Math.floor(self.tabAnswer.length/self.rows)+1;
    }



    self.bordure = null;
    self.content = null;

    /**
     *
     * @param x : position en X
     * @param y : position en Y
     * @param w : largeur
     * @param h : hauteur
     */


};

////////////////// end of Question.js //////////////////////////


////////////////// QuestionCreator.js //////////////////////////
/**
 * Created by qde3485 on 15/03/16.
 */


var QuestionCreator = function (parent, question) {
    var self = this;
    self.MAX_ANSWERS = 8;
    self.parent = parent;

    self.manipulator = new Manipulator(self);
    //mainManipulator.ordonator.set(0, self.manipulator.first);//!! à s'en inquiéter plus tard -> remplacer par .last.add

    self.manipulatorQuizzInfo = new Manipulator(self);
    self.manipulator.last.add(self.manipulatorQuizzInfo.first);

    self.questionCreatorManipulator= new Manipulator(self);
    self.manipulator.last.add(self.questionCreatorManipulator.first);

    self.questionManipulator=new Manipulator(self);
    self.questionCreatorManipulator.last.add(self.questionManipulator.first);

    self.toggleButtonManipulator = new Manipulator(self);
    self.questionCreatorManipulator.last.add(self.toggleButtonManipulator.first);

    self.previewButtonManipulator = new Manipulator(self);
    self.manipulator.last.add(self.previewButtonManipulator.first);

    self.headerHeight = 0.1;
    self.questionHeight = 0.2;
    self.reponseHeight = 0.7;

    var haut = (window.innerHeight);
    self.questionNameValidInput = true;
    self.quizzNameValidInput = true;

    self.labelDefault = "Cliquer deux fois pour ajouter la question";
    self.quizzType = myQuizzType.tab;

    self.loadQuestion = function(quest){
        self.linkedQuestion = quest;
        if(typeof quest.multipleChoice !== 'undefined'){
            self.multipleChoice = quest.multipleChoice;
        } else {
            self.multipleChoice = false;
        }
        if(typeof quest.simpleChoice !== 'undefined'){
            self.simpleChoice = quest.simpleChoice;
        } else {
            self.simpleChoice = (!self.multipleChoice);
        }
        self.tabAnswer = [];
        quest.tabAnswer.forEach(function (answer) {
            self.tabAnswer.push(new AnswerElement(answer, self));
        });
        self.quizzName = quest.parentQuizz.title;
        self.label = quest.label;
        self.rightAnswers = [];
        self.fontSize = quest.fontSize;
        self.font = quest.font;
        self.bgColor = quest.bgColor;
        self.colorBordure = quest.colorBordure;
        self.questionNum = quest.questionNum;

        self.tabAnswer.forEach(function (el) {
            if (el.correct) {
                self.rightAnswers.push(el);
            }
        });

    };

    if (!question) {
        // init default : 2 empty answers

        self.tabAnswer = [new AnswerElement(null, self), new AnswerElement(null, self)];
        self.quizzName = "";
        self.label = "";
        self.rightAnswers = [];
        self.fontSize = 20;
        self.multipleChoice = false;
        self.simpleChoice = true;
    } else {
        self.loadQuestion(question);
    }

    self.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};

    self.checkInputTextArea = function (myObj) {
        if (myObj.textarea.value.match(REGEX)) {
            myObj.remove();
            myObj.textarea.onblur = myObj.onblur;
            myObj.textarea.style.border = "none";
            myObj.textarea.style.outline = "none";
        } else {
            myObj.display();
            myObj.textarea.onblur = function () {
                console.log("blur");
                myObj.textarea.value = "";
                myObj.onblur();
                myObj.remove();
            }
        }
    };



};
////////////////// end of QuestionCreator.js //////////////////////////


////////////////// Quizz.js //////////////////////////
/**
 * Created by ABL3483 on 01/03/2016.
 */

/**
 *
 * @constructor
 * @param quizz
 * @param previewMode
 */
function Quizz(quizz, previewMode, parentFormation) {
    var self = this;

    self.parentFormation=parentFormation;
    self.quizzManipulator = new Manipulator(self);
    //mainManipulator.last.add(self.quizzManipulator.translator);

    //self.tabQuestions=[];
    self.loadQuestions=function(quizz){
        if (quizz && typeof quizz.tabQuestions !== 'undefined') {
            //self.tabQuestions=quizz.tabQuestions;
            self.tabQuestions = [];
            quizz.tabQuestions.forEach(function (it) {
                var tmp = new Question(it, self);
                self.tabQuestions.push(tmp);
            });
        }else{
            self.tabQuestions = [];
            self.tabQuestions.push(new Question(defaultQuestion, self));
            self.tabQuestions.push(new Question(defaultQuestion, self));
        }
    };
    self.loadQuestions(quizz);
    (previewMode) ? (self.previewMode = previewMode):(self.previewMode = false);
    quizz.puzzleRows ? (self.puzzleRows = quizz.puzzleRows): (self.puzzleRows = 2);
    quizz.puzzleLines ? (self.puzzleLines = quizz.puzzleLines):(self.puzzleLines = 2);
    quizz.font && (self.font = quizz.font);
    quizz.fontSize ? (self.fontSize = quizz.fontSize): (self.fontSize = 20);
    quizz.colorBordure ? (self.colorBordure = quizz.colorBordure):(self.colorBordure = myColors.black);
    quizz.bgColor ? (self.bgColor = quizz.bgColor):(self.bgColor = myColors.none);

    self.cadreResult={
        x:drawing.width/2,
        y:220,
        w:document.body.clientWidth,
        h:200
    };
    self.cadreTitle={
        x:0,
        y:0,
        w:drawing.width,
        h:200
    };
    self.cadreQuestion={
        x:0,
        y:210,
        w:drawing.width,
        h:200
    };

    self.cadreBibImages={
        x:0,
        y:210,
        w:drawing.width,
        h:600
    };

    self.cadreBibJeux={
        x:0,
        y:210,
        w:drawing.width,
        h:600
    };

    self.miniaturePosition={x:0,y:0};

    self.questionsWithBadAnswers=[];
    self.score=0;
    self.drawing=drawing;
    self.title=quizz.title?quizz.title:'';

    self.currentQuestionIndex=-1;
    self.finalMessage="";

    self.run = function(x,y,w,h) {
        var intervalToken = asyncTimerController.interval(function () {
            var loaded = true;
            self.tabQuestions.forEach(function (e) {
                loaded = loaded && e.imageLoaded;
                e.tabAnswer.forEach(function (el) {
                    loaded = loaded && el.imageLoaded;
                })
            });
            if(loaded) {
                asyncTimerController.clearInterval(intervalToken);
                self.display(x,y,w,h);
            }
        }, 100);
    };

    /**
     *
     * @param color
     */

  // !_! bof, y'a encore des display appelés ici
    self.nextQuestion=function(){

        if(self.currentQuestionIndex !== -1 && !self.previewMode){
            //self.tabQuestions[self.currentQuestionIndex].questionManipulator.first.remove();
            self.quizzManipulator.last.remove(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);

            //self.tabQuestions[self.currentQuestionIndex].questionManipulator.first.remove(self.tabQuestions[self.currentQuestionIndex].questionManipulator.rotator);
            //self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.children.forEach(function(child){
            //    self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.remove(self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.child);
            //});

        }
        if(self.previewMode){
            if(self.currentQuestionIndex === -1) {
                if (self.currentQuestionIndex === 0 && self.tabQuestions[0].multipleChoice) {
                    self.tabQuestions[0].reset();
                }
                self.currentQuestionIndex = 0;//numéro de la question affichée
                self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight = self.questionHeightWithImage);
                !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight = self.questionHeightWithoutImage);
                self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight = self.responseHeightWithImage);
                !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight = self.responseHeightWithoutImage);


                self.quizzManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);
                // self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].answersManipulator.translator);
                self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.flush();

                self.tabQuestions[self.currentQuestionIndex].display(0, self.headerHeight / 2 + self.questionHeight / 2 + MARGIN,
                    self.cadreQuestion.w, self.questionHeight);
                self.tabQuestions[self.currentQuestionIndex].displayAnswers(0, self.headerHeight + MARGIN + self.questionHeight,
                    self.cadreQuestion.w, self.responseHeight);
            }
        } else {
            if (self.currentQuestionIndex + 1 < self.tabQuestions.length) {
                self.currentQuestionIndex++;
                self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight=self.questionHeightWithImage);
                !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight=self.questionHeightWithoutImage);
                self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight=self.responseHeightWithImage);
                !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight=self.responseHeightWithoutImage);
                self.quizzManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].questionManipulator.first);
                //self.parentQuizz.headerHeight+self.parentQuizz.questionHeight/2
                self.tabQuestions[self.currentQuestionIndex].display(0, self.headerHeight/2 + self.questionHeight/2+MARGIN,
                    self.cadreQuestion.w , self.questionHeight);
                self.tabQuestions[self.currentQuestionIndex].questionManipulator.last.add(self.tabQuestions[self.currentQuestionIndex].answersManipulator.translator);
                self.tabQuestions[self.currentQuestionIndex].displayAnswers(0, self.headerHeight + MARGIN+self.questionHeight,
                    self.cadreQuestion.w , self.responseHeight);
            } else {//--> fin du tableau, dernière question
                console.log("Final score: " + self.score);
                self.puzzle = new Puzzle(self.puzzleLines, self.puzzleRows, self.questionsWithBadAnswers, self.cadreResult,null,self);

                self.displayResult();
            }
        }
    };


    self.getPositionInFormation = function(){
        var gameIndex, levelIndex;

        for(var i = 0; i<self.parentFormation.levelsTab.length; i++){

            gameIndex = self.parentFormation.levelsTab[i].gamesTab.indexOf(self);
            if(gameIndex !== -1){
                break;
            }
        }

        levelIndex = i;

        return {levelIndex:levelIndex, gameIndex:gameIndex};
    };


    //self.responseHeight/2
}
////////////////// end of Quizz.js //////////////////////////


////////////////// QuizzManager.js //////////////////////////
/**
 * Created by ABL3483 on 12/04/2016.
 */

function QuizzManager(quizz){
    var self = this;

    self.formationName = "Hibernate";
    self.quizzName="";
    self.quizzNameDefault = "Ecrire ici le nom du quiz";

    self.tabQuestions=[defaultQuestion];
    //for(var i=0;i<7;i++){
    //    self.tabQuestions.push(myQuizz.tabQuestions[i]);
    //}
    self.questionPuzzle={};

    self.loadQuizz = function(quizz){
        self.indexOfEditedQuestion = 0;
        self.quizz = new Quizz(quizz);
    };


    if(!quizz){
        var initialQuizzObject = {
            title: myQuizz.title,
            bgColor: myColors.white,
            tabQuestions:self.tabQuestions,
            puzzleLines: 3,
            puzzleRows: 3
        };
        self.quizz = new Quizz(initialQuizzObject,false);
        self.indexOfEditedQuestion = 0;
        self.quizzName = self.quizz.title;

    }else {
        self.loadQuizz(quizz);
    }
    self.quizz.tabQuestions[0].selected = true;
    self.quizz.tabQuestions.push(new AddEmptyElement(self, 'question'));

    self.questionCreator = new QuestionCreator(self,self.quizz.tabQuestions[self.indexOfEditedQuestion]);
    self.bib = new Library(myBibImage);

    self.quizzManagerManipulator = new Manipulator(self);

    self.questionsPuzzleManipulator = new Manipulator(self);
    self.quizzInfoManipulator = new Manipulator(self);
    self.questionCreatorManipulator = self.questionCreator.manipulator;
    self.previewButtonManipulator = new Manipulator(self);

    self.libraryIManipulator = self.bib.libraryManipulator;
    self.quizzManagerManipulator.last.add(self.libraryIManipulator.first); // La bibliothèque n'est pas removed lors de l'aperçu

    self.quizzManagerManipulator.last.add(self.quizzInfoManipulator.first);
    self.quizzManagerManipulator.last.add(self.questionsPuzzleManipulator.first);
    self.quizzManagerManipulator.last.add(self.questionCreatorManipulator.first);
    self.quizzManagerManipulator.last.add(self.previewButtonManipulator.first);


    // WIDTH
    self.bibWidthRatio=0.15;
    self.questCreaWidthRatio = 1-self.bibWidthRatio;

    self.bibWidth = drawing.width*self.bibWidthRatio;
    self.questCreaWidth = drawing.width*self.questCreaWidthRatio;

    // HEIGHT
    self.quizzInfoHeightRatio = 0.05;
    self.questionsPuzzleHeightRatio = 0.25;
    self.questCreaHeightRatio = 0.57;
    self.bibHeightRatio = self.questCreaHeightRatio;
    self.previewButtonHeightRatio = 0.1;

    self.quizzInfoHeight = drawing.height*self.quizzInfoHeightRatio;
    self.questionsPuzzleHeight = drawing.height*self.questionsPuzzleHeightRatio;
    self.bibHeight = drawing.height*self.bibHeightRatio;
    self.questCreaHeight = drawing.height*self.questCreaHeightRatio;
    self.previewButtonHeight = drawing.height*self.previewButtonHeightRatio;

    self.marginRatio=0.03;
    self.globalMargin={
        height:self.marginRatio*drawing.height,
        width:self.marginRatio*drawing.width
    };
    self.questionPuzzleCoordinates={
        x : self.globalMargin.width/2,
        y : (self.quizzInfoHeight+self.questionsPuzzleHeight/2+self.globalMargin.height/2),
        w : (drawing.width-self.globalMargin.width),
        h : (self.questionsPuzzleHeight-self.globalMargin.height)
    };





}
////////////////// end of QuizzManager.js //////////////////////////
