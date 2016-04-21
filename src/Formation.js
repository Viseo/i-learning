/**
 * Created by ABO3476 on 15/04/2016.
 */

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

    self.libraryJManipulator = self.bib.libraryManipulator;
    self.manipulator.last.add(self.libraryJManipulator.first);
    self.manipulator.last.add(self.graphManipulator.first);


    self.manipulatorMiniature.last.add(self.iconManipulator.first);
    self.manipulator.last.add(self.formationInfoManipulator.first);
    self.labelDefault = "Entrer le nom de la formation";

    self.x = MARGIN;
    self.y = drawing.height * mainManipulator.ordonator.children[0].parentManip.parentObject.size + 3 * MARGIN;
    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){0,50}$/g;
    self.maxGameInARow = 6;
    self.maxGameInARowMessage = "Le nombre maximum de jeux dans ce niveau est atteint.";

    self.quizzTab = [];
    self.quizzTab.push([]);
    //self.quizzTab = myFormation.quizzTab;
    self.marginRatio=0.03;
    self.globalMargin={
        height:self.marginRatio*drawing.height,
        width:self.marginRatio*drawing.width
    };

    self.label = formation.label ? formation.label : "Nouvelle formation";
    self.status = formation.status ? formation.status : statusEnum.NotPublished;

    // WIDTH
    self.bibWidthRatio = 0.15;
    self.graphWidthRatio = 1-self.bibWidthRatio;
    self.bibWidth = drawing.width*self.bibWidthRatio;
    self.graphCreaWidth = drawing.width*self.graphWidthRatio;

    // HEIGHT
    self.graphCreaHeightRatio = 0.85;
    self.graphCreaHeight = drawing.height*self.graphCreaHeightRatio;


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

    self.displayMiniature = function (w,h) {
        self.miniature = displayText(self.label, w, h, myColors.black, myColors.white, null, null, self.manipulatorMiniature);
        self.miniature.cadre.corners(50, 50);

        if (self.status === statusEnum.Published) {
            var icon = self.status.icon(0, 0, self.parent.iconeSize);
            self.iconManipulator.ordonator.set(5, icon.square);
            self.iconManipulator.ordonator.set(6, icon.check);
            self.iconManipulator.translator.move(w / 2 - self.parent.iconeSize + MARGIN + 2, -h / 2 + self.parent.iconeSize - MARGIN - 2);//2Pxl pour la largeur de cadre
        }
        else if (self.status === statusEnum.Edited) {
                var iconExclamation = self.status.icon(self.parent.iconeSize);
                self.iconManipulator.ordonator.set(5, iconExclamation.circle);
                self.iconManipulator.ordonator.set(6, iconExclamation.exclamation);
                self.iconManipulator.ordonator.set(7, iconExclamation.dot);
                self.iconManipulator.translator.move(w / 2 - self.parent.iconeSize + MARGIN + 2, -h / 2 + self.parent.iconeSize - MARGIN - 2);//2Pxl pour la largeur de cadre
            }
        };
    self.clickToAdd = function (){
        var selected;
        self.bib.jeux.forEach(function (game) {
            game.objectTotal.cadre.clicked && (selected = game.objectTotal.cadre);
        });

        var mouseUpGraphBlock = function(event){
            self.bib.upAddFunction(selected, event);
            selected.clicked = false;
            selected.color(myColors.white, 1, myColors.black);
            svg.removeEvent(self.graphBlock.rect, "mouseup", mouseUpGraphBlock);
        };

        selected && svg.addEvent(self.graphBlock.rect, "mouseup", mouseUpGraphBlock);
    }

    self.displayFormation = function (){

        //self.bib = new BibJeux(myBibJeux);

        self.manipulator.first.move(0, drawing.height*0.075);
        mainManipulator.ordonator.set(1, self.manipulator.first);
        self.title = new svg.Text("Formation : ").position(MARGIN, 0).font("Arial", 20).anchor("start");
        self.manipulator.last.add(self.title);

        self.bib.display(0,0,self.bibWidth, self.graphCreaHeight);

        self.gamesCounter = myFormation.gamesCounter;

        var showTitle = function() {
            var text = (self.label) ? self.label : (self.label=self.labelDefault);
            var color = (self.label) ? myColors.black : myColors.grey;
            var bgcolor = myColors.grey;
            self.formationLabelWidth = 400 ;
            self.formationLabel = {};
            self.formationLabel.content = autoAdjustText(text, 0, 0, drawing.width, 20, 15, "Arial", self.formationInfoManipulator).text;
            self.labelHeight = self.formationLabel.content.component.getBBox().height;
            self.labelWidth = self.formationLabel.content.component.getBBox().width + 2 * MARGIN;
            self.formationLabel.cadre = new svg.Rect(self.formationLabelWidth, self.labelHeight + MARGIN).color(bgcolor);
            self.formationLabel.cadre.position(self.title.component.getBBox().width + self.formationLabelWidth/2 + MARGIN + MARGIN/2, -MARGIN/2).fillOpacity(0.1);
            self.formationInfoManipulator.ordonator.set(0, self.formationLabel.cadre);
            self.formationLabel.content.position(self.title.component.getBBox().width + 2 * MARGIN, 0).color(color).anchor("start");
            svg.addEvent(self.formationLabel.content, "dblclick", dblclickEdition);
            svg.addEvent(self.formationLabel.cadre, "dblclick", dblclickEdition);
            self.formationCreator = formationValidation;
        };
        var dblclickEdition = function (event) {
            var width = self.formationLabel.content.component.getBBox().width;
            self.formationInfoManipulator.ordonator.unset(1);

            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.label;
            var contentareaStyle = {
                toppx:(self.labelHeight/2+drawing.height*0.075-2*MARGIN+3),
                leftpx: (self.title.component.getBBox().width + 2 * MARGIN + 1),
                width: 400,
                height:(self.labelHeight+3)
            };
            textarea.setAttribute("style", "position: absolute; top:" + contentareaStyle.toppx + "px; left:" + contentareaStyle.leftpx + "px; width:" + (contentareaStyle.width) + "px; height:" + contentareaStyle.height + "px; resize: none; border: none; outline:none; overflow:hidden; font-family: Arial; font-size: 15px; background-color: transparent;");
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var removeErrorMessage = function () {
                self.formationCreator.formationNameValidInput = true;
                self.formationCreator.errorMessage && self.formationInfoManipulator.ordonator.unset(5);
                self.formationLabel.cadre.color(myColors.grey, 1, myColors.none);
            };

            var displayErrorMessage = function () {
                removeErrorMessage();
                self.formationLabel.cadre.color(myColors.grey, 2, myColors.red);
                var position = (textarea.getBoundingClientRect().left - MARGIN);
                var anchor = 'start';
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                    .position(drawing.width/2, 0)
                    .font("arial", 15).color(myColors.red).anchor(anchor);
                self.formationInfoManipulator.ordonator.set(5, self.errorMessage);
                textarea.focus();
                self.labelValidInput = false;
            };
            var onblur = function () {
                self.formationCreator.formationNameValidInput && (self.label = textarea.value);
                textarea.remove();
                showTitle();
            };
            textarea.oninput = function () {
                self.checkInputTextArea({
                    textarea: textarea,
                    border: self.formationLabel.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
                //self.formationCreator.checkInputTextArea(textarea, "formationNameValidInput", onblur, self.formationLabel.cadre);
            };
            textarea.onblur = onblur;
            self.checkInputTextArea({
                textarea: textarea,
                border: self.formationLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        showTitle();

        self.libraryJManipulator.translator.move(0, self.title.component.getBBox().height);

        var onclickQuizzHandler = function(){
            var quizzManager = new QuizzManager();
            //quizzManager.loadQuizz();
            quizzManager.display();
            mainManipulator.ordonator.unset(1);
        };

        self.displayNewLevel = function(w, h){
            self.newLevelManipulator = new Manipulator();
            self.graphManipulator.last.add(self.newLevelManipulator.first);
            var line = new svg.Line(MARGIN,2*self.messageDragDropMargin,w-self.borderSize-2*MARGIN/3, 2*self.messageDragDropMargin).strokeDasharray(6).color(myColors.black, 3, myColors.black);
            self.newLevelManipulator.ordonator.set(9,line);
            var newLevel = displayTextWithoutCorners("Niveau 1", w-self.borderSize-2*self.borderSize, 2*self.messageDragDropMargin-2*self.borderSize, myColors.none, myColors.white, 20, null, self.newLevelManipulator);
            newLevel.cadre.position((w-self.borderSize)/2, self.messageDragDropMargin);
            newLevel.content.position(newLevel.content.component.getBBox().width, self.messageDragDropMargin);
            self.messageDragDrop.position(w/2, self.title.component.getBBox().height + 3*self.messageDragDropMargin);
            //self.quizzTab[self.quizzTab.length-1].push(displayTextWithCircle("toto", 50, 50, myColors.red, myColors.white, 20, null, self.newLevelManipulator));
            //self.quizzTab[self.quizzTab.length-1].push({type: "Quiz", label: "Quiz " + self.gamesCounter.quizz});
            //console.log(self.quizzTab);
            //var test = self.quizzTab[0][0].label;
            var count = 1;
            self.quizzTab[0].forEach(function(tabElement){
                tabElement.manipulator = new Manipulator();
                self.graphManipulator.last.add(tabElement.manipulator.first);
                var testQuizz = displayTextWithCircle(tabElement.label, 100, 100, myColors.red, myColors.white, 20, null, tabElement.manipulator);
                testQuizz.cadre.position(100*count, 0);
                testQuizz.content.position(100*count, 0);
                svg.addEvent(testQuizz.cadre, "dblclick", onclickQuizzHandler);
                svg.addEvent(testQuizz.content, "dblclick", onclickQuizzHandler);
                count ++;
            })

        };

        var displayGraph = function (w, h){
            self.graphManipulator.translator.move(self.bibWidth, self.title.component.getBBox().height);
            self.borderSize = 3;
            self.messageDragDropMargin = h/20;
            self.graphBlock = {rect: new svg.Rect(w-self.borderSize, h-self.borderSize).color(myColors.white, self.borderSize, myColors.grey).position(w / 2 - self.borderSize, 0 + h / 2)};
            self.messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", 0, 0, w, h, 20, null, self.graphManipulator).text;
            self.messageDragDrop.position(w/2, self.title.component.getBBox().height + self.messageDragDropMargin).color(myColors.grey).fontStyle("italic");
            self.graphManipulator.ordonator.set(4, self.graphBlock.rect);
            self.graphBlock.rect._acceptDrop = true;


            //var clickHandler = function(event){
            //    //self.quizzTab[0] = [0,1,2,3,4]; //JUSTE POUR TESTER
            //    var target = drawing.getTarget(event.clientX, event.clientY);
            //    /*TODO*/ // 0 à remplacer par l'indice du niveau où l'utilisateur à cliqué tâche gestion/ajout des niveaux
            //    if (self.quizzTab[0].length>=self.maxGameInARow){
            //        autoAdjustText(self.maxGameInARowMessage, 0, 0, w, h, 20, null, self.manipulator).text.color(myColors.red)
            //        .position(drawing.width - MARGIN, 0).anchor("end");
            //    }
            //    else {
            //        self.bib.jeux.forEach(function(game){
            //            game.objectTotal.cadre.color(myColors.white, 1, myColors.black);
            //            game.objectTotal.cadre.clicked = false;
            //        });
            //        self.displayNewLevel(w, h);
            //    }
            //};
            //svg.addEvent(self.graphBlock.rect, "click", clickHandler);
        };
    displayGraph(self.graphCreaWidth, self.graphCreaHeight);
    };
};






