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
        self.rgbBordure = myColors.black;

    }else{
        self.label = question.label;
        self.imageSrc = question.imageSrc;
        self.rows = question.nbrows;
        self.rightAnswers = [];
        self.selectedAnswers = [];
        self.multipleChoice = question.multipleChoice;
        self.simpleChoice = question.simpleChoice;

        question.colorBordure && (self.rgbBordure = question.colorBordure);
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

    self.display = function (x, y, w, h) {

        if(typeof x !== 'undefined'){
            self.x = x;
        }
        if(typeof y !== 'undefined' ){
            self.y=y;
        }
        w && (self.width = w);
        h && (self.height = h);

        // Question avec Texte ET image
        if (typeof self.label !== "undefined" && self.imageSrc) {
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, {width:self.image.width, height:self.image.height}, self.width, self.height, self.rgbBordure, self.bgColor, self.fontSize, self.font, self.questionManipulator, self.raphImage);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.content;
            self.raphImage = objectTotal.image;
        }
        // Question avec Texte uniquement
        else if (typeof self.label !== "undefined" && !self.imageSrc) {
            var object = displayText(self.label, self.width, self.height, self.rgbBordure, self.bgColor, self.fontSize, self.font,self.questionManipulator);
            self.bordure = object.cadre;
            self.content = object.content;

        }
        // Question avec Image uniquement
        else if (self.imageSrc && !self.label) {
            self.raphImage = displayImage(self.imageSrc, self.dimImage, self.w, self.height).image;
            self.questionManipulator.ordonator.set(2, self.raphImage);

        }
        else {
            //var point=self.questionManipulator.globalToLocal(self.x,self.y);
            self.bordure = new svg.Rect( self.width, self.height).color(self.bgColor,1,self.rgbBordure);
            self.questionManipulator.ordonator.set(0, self.bordure);
        }
        var fontSize = Math.min(20, h*0.1);
        self.questNum = new svg.Text(self.questionNum).position(-w/2+MARGIN+(fontSize*(self.questionNum.toString.length)/2), -h/2+(fontSize)/2+2*MARGIN).font("Arial", fontSize);
        self.questionManipulator.ordonator.set(4, self.questNum);
        self.questionManipulator.translator.move(self.x,self.y);
        self.selected && self.selectedQuestion();
        //self.questionManipulator.ordonator.children.forEach(function(e){
        //    manageDnD(e,self.questionManipulator);
        //});
    };

    self.displayAnswers = function (x, y, w, h) {
        if (self.rows !== 0) {

            //self.answersManipulator.translator.move(0,0);
            if(typeof x !=='undefined'){
                (self.initialAnswersPosX=x);
            }
            w && ( self.tileWidth= (w - MARGIN * (self.rows - 1)) / self.rows);
            self.tileHeight = 0;
            self.multipleChoice && (h=h-50);

            h && (self.tileHeightMax = Math.floor(h/self.lines)-2*MARGIN);

            self.tileHeightMin = 2.50*self.fontSize;

            var tmpTileHeight;

            for(var answer of self.tabAnswer) {//answer.image.height
                answer.image ? (tmpTileHeight = self.tileHeightMax): (tmpTileHeight=self.tileHeightMin);
                if (tmpTileHeight > self.tileHeightMax && tmpTileHeight>self.tileHeight) {
                    self.tileHeight = self.tileHeightMax;
                }
                else if (tmpTileHeight>self.tileHeight){
                    self.tileHeight = tmpTileHeight;
                }
            }
            self.questionManipulator.last.add(self.answersManipulator.first);
            //self.answersManipulator.translator.move(0,self.height/2+2*MARGIN);
            self.answersManipulator.translator.move(0,self.height/2+(self.tileHeight)/2);

            //var posx = x;
            //var posy = y + self.height + MARGIN * 2;

            var posx = 0;
            var posy = 0;
            var count = 0;
            for (var i = 0; i < self.tabAnswer.length; i++) {
                if (i !== 0) {
                    posx += (self.tileWidth + MARGIN);
                }
                if (count > (self.rows - 1)) {
                    count = 0;
                    posy += (self.tileHeight + MARGIN);
                    posx = self.initialAnswersPosX;
                }

                self.answersManipulator.last.add(self.tabAnswer[i].answerManipulator.first);

                self.tabAnswer[i].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
                self.tabAnswer[i].answerManipulator.translator.move(posx-(self.rows - 1)*self.tileWidth/2-(self.rows - 1)*MARGIN/2,posy+MARGIN);

                //self.tabAnswer[i].display(-tileWidth/2, -self.tileHeight/2, tileWidth, self.tileHeight);
                //self.tabAnswer[i].answerManipulator.first.move(posx+tileWidth/2,posy+self.tileHeight/2);
                /*self.tabAnswer[i].display(0, 0, tileWidth, self.tileHeight);*/
                //self.tabAnswer[i].answerManipulator.translator.move(posx+tileWidth/2,posy+self.tileHeight/2);
                //self.tabAnswer[i].answerManipulator.translator.move(posx-tileWidth/2-MARGIN/2,posy-self.tileHeight/2-MARGIN/2);
                /*self.tabAnswer[i].answerManipulator.translator.move(posx-tileWidth/2-MARGIN/2,posy);*/

                (function(element) {
                    if(element.bordure) {
                        svg.addEvent(element.bordure,"click",function() {
                            elementClicked(element);
                        });
                    }

                    if(element.content) {
                        svg.addEvent(element.content,"click",function() {
                            elementClicked(element);
                        });
                    }

                    if (element.image) {
                        svg.addEvent(element.image,"click",function() {
                            elementClicked(element);
                        });
                    }

                })(self.tabAnswer[i]);

                count++;
            }
        }

        if(self.multipleChoice){

            //affichage d'un bouton "valider"
            var w=150;
            var h=50;
            var validateX,validateY;
            validateX=-75+100;
            validateY=self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;

            var validateButton=displayText("Valider",w,h,myColors.green,myColors.yellow,20, self.font,self.validateManipulator);
            self.validateManipulator.translator.move(validateX+w/2,validateY+h/2);

            //button. onclick
            var oclk = function(){
                // test des valeurs, en gros si selectedAnswers === rigthAnswers
                var allRight=false;

                if(self.rightAnswers.length!=self.selectedAnswers.length){
                    allRight=false;
                }else{
                    var subTotal=0;
                    self.selectedAnswers.forEach(function(e){
                        if(e.correct){
                            subTotal++;
                        }
                    });

                    if(subTotal===self.rightAnswers.length){
                        allRight=true;
                    }else{
                        allRight=false;
                    }

                }

                if(allRight) {
                    self.parentQuizz.score++;
                    console.log("Bonne réponse!\n");
                } else {
                    self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex]);
                    var reponseD="";
                    self.rightAnswers.forEach(function(e){
                        if(e.label) {
                            reponseD+= e.label+"\n";
                        }
                        else if(e.imageSrc)
                        {
                            var tab=e.imageSrc.split('/');
                            reponseD+= tab[(tab.length-1)]+"\n";
                        }
                    });
                    console.log("Mauvaise réponse!\n  Bonnes réponses: "+reponseD);
                }

                self.parentQuizz.nextQuestion();

            };
            svg.addEvent(validateButton.cadre, 'click', oclk);
            svg.addEvent(validateButton.content, 'click', oclk);

            //Button reset
            var w = 150;
            var h = 50;
            var resetX =- 75 -100;
            var resetY = self.tileHeight*(self.lines-1/2)+(self.lines+1)*MARGIN;
            self.resetButton=displayText("Reset",w,h,myColors.grey,myColors.grey,20, self.font,self.resetManipulator);
            self.resetManipulator.translator.move(resetX+w/2,resetY+h/2);
            if(self.selectedAnswers.length!=0){
                self.resetButton.cadre.color(myColors.yellow,1,myColors.green);
            }
            self.reset = function(){
                if(self.selectedAnswers.length>0){
                    self.selectedAnswers.forEach(function(e){
                        e.selected = false;
                        e.bordure.color(e.bgColor,1,e.rgbBordure);
                    });
                    self.selectedAnswers.splice(0,self.selectedAnswers.length);
                    self.resetButton.cadre.color(myColors.grey,1,myColors.grey);
                }
            };
            svg.addEvent(self.resetButton.content,'click',self.reset);
            svg.addEvent(self.resetButton.cadre,'click',self.reset);
        }

    };

    function elementClicked(sourceElement) {
        if(self.multipleChoice===false){// question normale, une seule réponse possible
        if(sourceElement.correct) {
            self.parentQuizz.score++;
            console.log("Bonne réponse!\n");
        } else {
            self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex]);
            var reponseD="";
            self.rightAnswers.forEach(function(e){
               if(e.label)
               {
                   reponseD+= e.label+"\n";
               }
                else if(e.imageSrc)
               {
                   var tab=e.imageSrc.split('/');
                   reponseD+= tab[(tab.length-1)]+"\n";
               }
            });
            console.log("Mauvaise réponse!\n  Bonnes réponses: \n"+reponseD);
        }

        self.parentQuizz.nextQuestion();
        }else{// question à choix multiples
            if(sourceElement.selected===false){
                // on sélectionne une réponse
                sourceElement.selected=true;
                self.selectedAnswers.push(sourceElement);
                sourceElement.rgbBordure = sourceElement.bordure.strokeColor;
                sourceElement.bordure.color(sourceElement.bgColor, 5, SELECTION_COLOR);
                self.resetButton.cadre.color(myColors.yellow,1,myColors.green);

            }else{
                sourceElement.selected=false;
                self.selectedAnswers.splice(self.selectedAnswers.indexOf(sourceElement),1);
                sourceElement.bordure.color(sourceElement.bgColor,1,sourceElement.rgbBordure);
                if(self.selectedAnswers.length==0){
                    self.resetButton.cadre.color(myColors.grey,1,myColors.grey);
                }
            }
        }
    }

    self.selectedQuestion = function () {
        self.bordure.color(self.bgColor, 5, SELECTION_COLOR);
    }
};


