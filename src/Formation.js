/**
 * Created by ABO3476 on 15/04/2016.
 */

var Formation = function(formation){
    var self = this;
    self.manipulatorMiniature = new Manipulator();
    self.iconManipulator = new Manipulator();

    self.manipulator = new Manipulator();
    self.formationInfoManipulator = new Manipulator();
    self.graphManipulator = new Manipulator();

    self.bib = new Library(myBibJeux);

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
    self.displayFormation = function (){
        self.manipulator.first.move(0, drawing.height*0.075);
        mainManipulator.ordonator.set(1, self.manipulator.first);
        self.title = new svg.Text("Formation : ").position(MARGIN, 0).font("Arial", 20).anchor("start");
        self.manipulator.last.add(self.title);

        self.bib.display(0,0,self.bibWidth, self.graphCreaHeight);

        var showTitle = function() {
            var text = (self.label) ? self.label : (self.label=self.labelDefault);
            var color = (self.label) ? myColors.black : myColors.grey;
            var bgcolor = myColors.grey;
            self.formationLabelWidth = 400 ;
            self.formationLabel = {};
            self.formationLabel.content = autoAdjustText(text, 0, 0, drawing.width, self.formationInfoHeight, 15, "Arial", self.formationInfoManipulator).text;
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

        var displayGraph = function (w, h){
            self.graphManipulator.translator.move(self.bibWidth, self.title.component.getBBox().height);
            self.borderSize = 3;
            self.graphBlock = {rect: new svg.Rect(w-self.borderSize, h-self.borderSize).color([], self.borderSize, myColors.grey).position(w / 2 - self.borderSize, 0 + h / 2)};
            self.graphManipulator.last.add(self.graphBlock.rect);
        };
    displayGraph(self.graphCreaWidth, self.graphCreaHeight);

    };


};






