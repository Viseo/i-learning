/**
 * Created by ABL3483 on 12/04/2016.
 */

function QuizzManager(){
    var self=this;

    self.formationName = "Hibernate";
    self.quizzName="";
    self.quizzNameDefault = "Ecrire ici le nom du quiz";

    self.tabQuestions=[new Question(questionWithLabelImageAndMultipleAnswers,self.quizz)];
    for(var i=0;i<7;i++){
        self.tabQuestions.push(new Question(myQuizz.tabQuestions[i],self.quizz));
    }
    self.questionPuzzle={};
    var initialQuizzObject = {
        title: myQuizz.title,
        bgColor: myColors.white,
        tabQuestions:self.tabQuestions,
        puzzleLines: 3,
        puzzleRows: 3
    };
    self.quizz=new Quizz(initialQuizzObject,false);
    self.indexOfEditedQuestion=0;
    self.quizzName=self.quizz.title;

    self.questionCreator = new QuestionCreator(self,self.quizz.tabQuestions[self.indexOfEditedQuestion]);
    self.bib = new BibImage(myBib);

    self.quizzManagerManipulator = new Manipulator(self);
    mainManipulator.ordonator.set(0,self.quizzManagerManipulator.first);

    self.questionsPuzzleManipulator = new Manipulator(self);
    self.quizzInfoManipulator = new Manipulator(self);
    self.questionCreatorManipulator = self.questionCreator.manipulator;
    self.previewButtonManipulator = new Manipulator(self);
    self.libraryManipulator = self.bib.bibManipulator;

    self.quizzManagerManipulator.last.add(self.libraryManipulator.first); // La bibliothèque n'est pas removed lors de l'aperçu

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

    self.display = function(){

        self.bib.run(self.globalMargin.width/2, self.quizzInfoHeight+self.questionsPuzzleHeight+self.globalMargin.height/2,
            self.bibWidth-self.globalMargin.width/2, self.bibHeight-self.globalMargin.height, function(){
            self.displayQuizzInfo(self.globalMargin.width/2, self.quizzInfoHeight/2, drawing.width,self.quizzInfoHeight);
            self.displayQuestionsPuzzle(self.globalMargin.width/2,self.quizzInfoHeight+self.questionsPuzzleHeight/2+self.globalMargin.height/2
                ,drawing.width-self.globalMargin.width,self.questionsPuzzleHeight-self.globalMargin.height);
            self.questionCreator.display(self.bib.x + self.bibWidth, self.bib.y,
                self.questCreaWidth-self.globalMargin.width, self.questCreaHeight-self.globalMargin.height);
            self.displayPreviewButton(drawing.width/2, drawing.height - self.previewButtonHeight/2-MARGIN/2,
                150, self.previewButtonHeight-self.globalMargin.height);

        });

    };

    self.displayQuizzInfo = function (x, y, w, h) {

        self.formationLabel = new svg.Text("Formation : " + self.formationName);
        self.formationLabel.font("arial", 20).anchor("start");
        self.quizzInfoManipulator.ordonator.set(2,self.formationLabel);

        var showTitle = function () {
            var text = (self.quizzName) ? self.quizzName : self.quizzNameDefault;
            var color = (self.quizzName) ? myColors.black : myColors.grey;
            var bgcolor = myColors.grey;

            self.quizzLabel = {};
            var width = 700; // FontSize : 15px / Arial / 50*W  //self.quizzLabel.content.component.getBBox().width;

            self.quizzLabel.content = autoAdjustText(text, 0, 0, w, h/2, 15, "Arial", self.quizzInfoManipulator).text;
            self.quizzNameHeight = self.quizzLabel.content.component.getBBox().height;
            self.quizzLabel.cadre = new svg.Rect(width, 0.5*h).color(bgcolor);
            self.quizzLabel.cadre.position(width/2,self.quizzLabel.cadre.height).fillOpacity(0.1);
            self.quizzInfoManipulator.ordonator.set(0, self.quizzLabel.cadre);
            self.quizzLabel.content.position(0,h/2 +self.quizzLabel.cadre.height/4).color(color).anchor("start");

            self.quizzInfoManipulator.first.move(x,y);
            svg.addEvent(self.quizzLabel.content, "dblclick", dblclickEdition);
            svg.addEvent(self.quizzLabel.cadre, "dblclick", dblclickEdition);
        };

        var dblclickEdition = function (event) {
            var width = self.quizzLabel.content.component.getBBox().width;
            //self.quizzInfoManipulator.ordonator.unset(0);
            self.quizzInfoManipulator.ordonator.unset(1);

            var textarea = document.createElement("TEXTAREA");
            textarea.value = self.quizzName;
            var contentareaStyle = {
                toppx:(self.quizzInfoHeight-self.quizzNameHeight/4+3),
                leftpx: (x+MARGIN/2 + 1),
                width: 700,
                height:(self.quizzNameHeight+3)
            };
            textarea.setAttribute("style", "position: absolute; top:" + contentareaStyle.toppx + "px; left:" + contentareaStyle.leftpx + "px; width:" + (contentareaStyle.width) + "px; height:" + contentareaStyle.height + "px; resize: none; border: none; outline:none; overflow:hidden; font-family: Arial; font-size: 15px; background-color: transparent;");
            var body = document.getElementById("content");
            body.appendChild(textarea).focus();

            var removeErrorMessage = function () {
                self.questionCreator.quizzNameValidInput = true;
                self.questionCreator.errorMessage && self.quizzInfoManipulator.ordonator.unset(5);
                self.quizzLabel.cadre.color(myColors.grey, 1, myColors.none);
            };

            var displayErrorMessage = function () {
                removeErrorMessage();
                self.quizzLabel.cadre.color(myColors.grey, 2, myColors.red);
                var position = (textarea.getBoundingClientRect().left - MARGIN);
                var anchor = 'start';
                self.errorMessage = new svg.Text("Seuls les caractères avec accent et \" - \", \" ' \", \" . \" sont permis.")
                    .position(position, h - MARGIN)
                    .font("arial", 15).color(myColors.red).anchor(anchor);
                self.quizzInfoManipulator.ordonator.set(5, self.errorMessage);
                textarea.focus();
                self.quizzNameValidInput = false;
            };
            var onblur = function () {
                self.questionCreator.quizzNameValidInput && (self.quizzName = textarea.value);
                textarea.remove();
                showTitle();
            };
            textarea.oninput = function () {
                self.questionCreator.checkInputTextArea({
                    textarea: textarea,
                    border: self.quizzLabel.cadre,
                    onblur: onblur,
                    remove: removeErrorMessage,
                    display: displayErrorMessage
                });
                //self.questionCreator.checkInputTextArea(textarea, "quizzNameValidInput", onblur, self.quizzLabel.cadre);
            };
            textarea.onblur = onblur;
            self.questionCreator.checkInputTextArea({
                textarea: textarea,
                border: self.quizzLabel.cadre,
                onblur: onblur,
                remove: removeErrorMessage,
                display: displayErrorMessage
            });
        };
        showTitle();
    };

    self.displayPreviewButton = function (x, y, w, h) {
        self.previewButton = displayText("Aperçu", w, h, myColors.black, myColors.white, 20, null, self.previewButtonManipulator);

        self.questionCreator.errorMessagePreview && self.questionCreator.errorMessagePreview.parent && self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
        var previewFunction = function () {
            self.toggleButtonHeight = 40;

            var validation = true;
            console.log(self.questionCreator.activeQuizzType);
            self.questionCreator.activeQuizzType.validationTab.forEach(function (funcEl) {
                var result = funcEl(self);
                if(!result.isValid) {
                    self.questionCreator.errorMessagePreview && self.questionCreator.errorMessagePreview.parent && self.previewButtonManipulator.last.remove(self.questionCreator.errorMessagePreview);
                    self.questionCreator.errorMessagePreview = new svg.Text(result.message)
                        .position(0, h/2 - 2 * self.toggleButtonHeight-MARGIN)
                        .font("arial", 20)
                        .anchor('middle').color(myColors.red);
                    self.previewButtonManipulator.last.add(self.questionCreator.errorMessagePreview);
                }
                validation = validation&&result.isValid;
            });

            if(validation) {
                var tabAnswer = [];
                self.questionCreator.tabAnswer.forEach(function (el) {
                    if (el instanceof AnswerElement) {
                        tabAnswer.push(el.toAnswer());
                    }
                });

                var questionObject = {
                    label: self.questionCreator.label,
                    imageSrc:(self.questionCreator.questionBlock.title.image)?(self.questionCreator.questionBlock.title.image.src):null,
                    tabAnswer: tabAnswer,
                    multipleChoice:self.questionCreator.multipleChoice,
                    nbrows: 4,
                    colorBordure: myColors.black,
                    bgColor: myColors.white
                };

                self.tabQuestions[self.indexOfEditedQuestion]=questionObject;

                var tmpQuizzObject = {
                    title: self.quizzName,
                    bgColor: myColors.white,
                    tabQuestions: [self.tabQuestions[self.indexOfEditedQuestion]],
                    puzzleLines: 3,
                    puzzleRows: 3
                };



                self.quizzManagerManipulator.last.flush();

                var tmpQuizz = new Quizz(tmpQuizzObject, true);
                tmpQuizz.run(1, 1, document.body.clientWidth, drawing.height);
            }
        };
        svg.addEvent(self.previewButton.cadre, "click", previewFunction);
        svg.addEvent(self.previewButton.content, "click", previewFunction);

        //self.previewButtonManipulator.last.add(self.previewButton.cadre);
        //self.previewButtonManipulator.last.add(self.previewButton.content);

        self.previewButtonManipulator.translator.move(x, y);
       // self.previewButtonManipulator.translator.move(w/2-MARGIN, h - self.headerHeight*h);
    }

    var questionClickHandler=function(element){
        //self.target = drawing.getTarget(event.clientX, event.clientY);
        var index= self.quizz.tabQuestions.indexOf(element);
        self.indexOfEditedQuestion=index;
        self.questionCreator.loadQuestion(element);
        self.questionCreatorManipulator.last.flush();
        self.questionCreator.display(self.questionCreator.previousX,self.questionCreator.previousY,self.questionCreator.previousW,self.questionCreator.previousH);

    };

    self.displayQuestionsPuzzle = function(x, y, w, h) {

        var border = new svg.Rect(w, h);
        border.color([], 2, myColors.black);
        self.questionsPuzzleManipulator.ordonator.set(0, border);
        self.questionsPuzzleManipulator.first.move(x + w / 2, y);

        self.coordinatesQuestion = {
            x: 0,
            y: -self.questionsPuzzleHeight / 2 + self.globalMargin.height / 2,
            w: border.width - self.globalMargin.width / 2,
            h: self.questionsPuzzleHeight - self.globalMargin.height
        };

        self.questionPuzzle = new Puzzle(1, 6, self.quizz.tabQuestions, self.coordinatesQuestion, false, self);
        self.questionsPuzzleManipulator.last.add(self.questionPuzzle.puzzleManipulator.first);
        self.questionPuzzle.display(self.coordinatesQuestion.x, self.coordinatesQuestion.y, self.coordinatesQuestion.w, self.coordinatesQuestion.h, 0);

        //self.questionPuzzle.// !! hep, par ici!

        for(var i=0;i<self.quizz.tabQuestions.length;i++){
        (function (element) {
            if (element.bordure) {
                svg.addEvent(element.bordure, "click", function () {
                    questionClickHandler(element);
                });
            }

            if (element.content) {
                svg.addEvent(element.content, "click", function () {
                    questionClickHandler(element);
                });
            }

            if (element.raphImage) {
                svg.addEvent(element.raphImage, "click", function () {
                    questionClickHandler(element);
                });
            }

        })(self.quizz.tabQuestions[i]);
    }


    };

    var addQuestionToQuizz=function(){

        var finalQuizzObject = {
            title: self.quizzName,
            bgColor: myColors.white,
            tabQuestions: self.tabQuestions,
            puzzleLines: 3,
            puzzleRows: 3
        };

        //self.quizz = new Quizz(finalQuizzObject, false);
        self.quizz.loadQuestions(finalQuizzObject);
        self.quizz.puzzle.tabQuestions=[];
        self.quizz.tabQuestions.forEach(function(e){
            self.quizz.puzzle.tabQuestions.push(e);
        });

    };


};