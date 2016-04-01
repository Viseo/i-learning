/** Created by ABO3476 on 29/02/2016. */

/**
 * @param question
 * @param quizz
 * @constructor
 */

var Question = function (question,quizz) {
    var self = this;
    self.questionManipulator = new Manipulator();
    self.answersManipulator = new Manipulator();
    self.questionManipulator.last.add(self.answersManipulator.translator);
    self.resetManipulator = new Manipulator();
    self.answersManipulator.last.add(self.resetManipulator.translator);
    self.validateManipulator = new Manipulator();
    self.answersManipulator.last.add(self.validateManipulator.translator);



    self.parentQuizz=quizz;
    self.label = question.label;
    self.imageSrc = question.imageSrc;
    self.tabAnswer = [];
    self.rows=question.nbrows;
    self.rightAnswers=[];
    self.selectedAnswers=[];
    self.multipleChoice=false;

    if(question.font) {
        self.font = question.font;
    }

    if(question.fontSize) {
        self.fontSize = question.fontSize;
    } else {
        self.fontSize = 20;
    }

    if(question.imageSrc) {
        self.image = imageController.getImage(self.imageSrc, function () {
            self.imageLoaded = true;
        });
        self.imageLoaded = false;
    } else {
        self.imageLoaded = true;
    }


    if (question.tabAnswer !== null) {
        question.tabAnswer.forEach(function (it) {
            var tmp = new Answer(it);
            tmp.parent=self;
            self.tabAnswer.push(tmp);
            if(tmp.correct) {
               self.rightAnswers.push(tmp);
            }

        });
    }

    if(self.rightAnswers.length!=1){
        self.multipleChoice=true;
    }

    self.lines=Math.floor(self.tabAnswer.length/self.rows)+1;
    if(self.tabAnswer.length%self.rows === 0) {
        self.lines=Math.floor(self.tabAnswer.length/self.rows);
    } else {
        self.lines=Math.floor(self.tabAnswer.length/self.rows)+1;
    }

    self.rgbBordure=question.colorBordure;
    self.bgColor = question.bgColor;

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

        self.x = x;
        self.y = y;
        self.width = w;
        self.height = h;

        // Question avec Texte ET image
        if (self.label && self.imageSrc) {
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.image, w, self.height, self.rgbBordure, self.bgColor, self.fontSize, self.font, self.questionManipulator);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.raphImage = objectTotal.image;
        }
        // Question avec Texte uniquement
        else if (self.label && !self.imageSrc) {
            var object = displayText(self.label, w, self.height, self.rgbBordure, self.bgColor, self.fontSize, self.font,self.questionManipulator);
            self.bordure = object.cadre;
            self.content = object.content;

        }
        // Question avec Image uniquement
        else if (self.imageSrc && !self.label) {
            self.raphImage = displayImage(self.imageSrc, self.image, w, self.height).image;
            self.questionManipulator.last.add(self.raphImage);

        }
        else {
            //var point=self.questionManipulator.globalToLocal(self.x,self.y);
            self.bordure = new svg.Rect( w, self.height).color(self.bgColor,1,self.rgbBordure);
            self.questionManipulator.last.add(self.bordure);

        }
        self.questionManipulator.translator.move(self.x,self.y);
    };

    self.displayAnswers = function (x, y, w, h) {
        if (self.rows !== 0) {

            //self.answersManipulator.translator.move(0,0);
            var margin = 15;
            var tileWidth = (w - margin * (self.rows - 1)) / self.rows;
            self.tileHeight = 0;
            self.tileHeightMax = Math.floor(h/self.rows)-2*margin;
            self.tileHeightMin = 50;

            var tmpTileHeight;

            for(var answer of self.tabAnswer) {
                answer.image ? (tmpTileHeight = answer.image.height): (tmpTileHeight=self.tileHeightMin);
                if (tmpTileHeight > self.tileHeightMax && tmpTileHeight>self.tileHeight) {
                    self.tileHeight = self.tileHeightMax;
                }
                else if (tmpTileHeight>self.tileHeight){
                    self.tileHeight = tmpTileHeight;
                }
            }
            self.questionManipulator.last.add(self.answersManipulator.translator);
            //self.answersManipulator.translator.move(0,self.height/2+2*margin);
            self.answersManipulator.translator.move(0,self.height/2+(self.tileHeight)/2+margin);

            //var posx = x;
            //var posy = y + self.height + margin * 2;

            var posx = 0;
            var posy = 0;
            var count = 0;
            for (var i = 0; i < self.tabAnswer.length; i++) {
                if (i !== 0) {
                    posx += (tileWidth + margin);
                }
                if (count > (self.rows - 1)) {
                    count = 0;
                    posy += (self.tileHeight + margin);
                    posx = x;
                }

                self.answersManipulator.last.add(self.tabAnswer[i].answerManipulator.first);

                self.tabAnswer[i].display(-tileWidth/2, -self.tileHeight/2, tileWidth, self.tileHeight);
                    self.tabAnswer[i].answerManipulator.translator.move(posx-(self.rows - 1)*tileWidth/2-(self.rows - 1)*margin/2,posy+margin);

                //self.tabAnswer[i].display(-tileWidth/2, -self.tileHeight/2, tileWidth, self.tileHeight);
                //self.tabAnswer[i].answerManipulator.first.move(posx+tileWidth/2,posy+self.tileHeight/2);
                /*self.tabAnswer[i].display(0, 0, tileWidth, self.tileHeight);*/
                //self.tabAnswer[i].answerManipulator.translator.move(posx+tileWidth/2,posy+self.tileHeight/2);
                //self.tabAnswer[i].answerManipulator.translator.move(posx-tileWidth/2-margin/2,posy-self.tileHeight/2-margin/2);
                /*self.tabAnswer[i].answerManipulator.translator.move(posx-tileWidth/2-margin/2,posy);*/

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
            var margin = 15;
            var w=150;
            var h=50;
            var validateX,validateY;
            validateX=-75+100;
            validateY=self.tileHeight*self.lines+(self.lines)*margin;

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
            svg.addEvent(validateButton.cadre,'click',oclk);
            svg.addEvent(validateButton.content,'click',oclk);

            //Button reset
            var w=150;
            var h=50;
            var resetX=-75 -100;
            var resetY=self.tileHeight*self.lines+(self.lines)*margin;
            self.resetButton=displayText("Reset",w,h,myColors.grey,myColors.grey,20, self.font,self.resetManipulator);
            self.resetManipulator.translator.move(resetX+w/2,resetY+h/2);

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

                sourceElement.bordure.color(sourceElement.bgColor,5,myColors.red);
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
};


