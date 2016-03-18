/** Created by ABO3476 on 29/02/2016. */

/**
 * @param question
 * @param quizz
 * @constructor
 */

/*label,imageSrc,tabAnswer, rows, colorBordure, bgColor*/
var Question = function (question,quizz) {
    var self = this;

    self._transformation={
        type:'',param1:'',param2:''
    };
    self.transformation=function(type,param1,param2){
        if(type){
            self._transformation.type=type;
        }
        if(param1){
            self._transformation.param1=param1;
        }
        if(param2){
            self._transformation.param2=param2;
        }

        return ""+self._transformation.type+self._transformation.param1+","+self._transformation.param2;
    };

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

    self.displaySet=paper.set();
    self.displaySetAnswers=paper.set();

    if (question.tabAnswer !== null) {
        question.tabAnswer.forEach(function (it) {
            var tmp = new Answer(it);
            self.tabAnswer.push(tmp);
            if(tmp.correct)
            {
               self.rightAnswers.push(tmp);
            }
            self.displaySetAnswers.push(tmp.displaySet);
        });
    }

    if(self.rightAnswers.length!=1){
        self.multipleChoice=true;
    }

    self.lines=Math.floor(self.tabAnswer.length/self.rows)+1;

    if (question.colorBordure && !isNaN(parseInt(question.colorBordure.r)) && !isNaN(parseInt(question.colorBordure.g)) && !isNaN(parseInt(question.colorBordure.b))) {
        self.rgbBordure = "rgb(" + question.colorBordure.r + ", " + question.colorBordure.g + ", " + question.colorBordure.b + ")";
    }
    else {
        self.rgbBordure = "black";
    }

    if (question.bgColor && !isNaN(parseInt(question.bgColor.r)) && !isNaN(parseInt(question.bgColor.g)) && !isNaN(parseInt(question.bgColor.b))) {
        self.bgColor = "rgb(" + question.bgColor.r + ", " + question.bgColor.g + ", " + question.bgColor.b + ")";
    }
    else {
        self.bgColor = "none";
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
        if (isNaN(parseInt(x)) || isNaN(parseInt(y)) || isNaN(parseInt(w)) || isNaN(parseInt(h))) {
            throw new Error(NaN);
        }

        self.x=x;
        self.y=y;
        if(!h) {
            self.height = getHeight(self.label, self.imageSrc, x, y, w, 20, self.image);
        } else {
            self.height=h;
        }

        // Question avec Texte ET image
        if (self.label && self.imageSrc) {
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.image, -w/2, -self.height/2, w, self.height, self.rgbBordure, self.bgColor, self.fontSize, self.font);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.raphImage = objectTotal.image;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
            self.displaySet.push(self.raphImage);

            var t=self.transformation('t',''+(x+w/2),''+(y+self.height/2));
            self.displaySet.transform(t);
        }
        // Question avec Texte uniquement
        else if (self.label && !self.imageSrc) {
            var object = displayText(self.label, -w/2, -self.height/2, w, self.height, self.rgbBordure, self.bgColor, self.fontSize, self.font);
            self.bordure = object.cadre;
            self.content = object.content;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);

            var t=self.transformation('t',''+(x+w/2),''+(y+self.height/2));
            self.displaySet.transform(t);
        }
        // Question avec Image uniquement
        else if (self.imageSrc && !self.label) {
            self.raphImage = displayImage(self.imageSrc, self.image, -w/2, -self.height/2, w, self.height).image;
            self.displaySet.push(self.raphImage);

            var t=self.transformation('t',''+(x+w/2),''+(y+self.height/2));
            self.displaySet.transform(t);
        }
        else if (!self.imageSrc && !self.label) {
            self.bordure = paper.rect(x, y, w, self.height).attr({fill: self.bgColor, stroke: self.rgbBordure})
        }
    };

    self.displayAnswers = function (x, y, w, h) {
        if (self.rows !== 0) {
            var margin = 15;
            var tileWidth = (w - margin * (self.rows - 1)) / self.rows;
            self.tileHeight = 0;

            var tmpTileHeight;

            for(var answer of self.tabAnswer) {
                tmpTileHeight = getHeight(answer.label, answer.imageSrc, x, y, tileWidth, 20 /*TODO*/, answer.image);
                if(tmpTileHeight > self.tileHeight) {
                    self.tileHeight = tmpTileHeight;

                }
            }

            if(self.tabAnswer.length%self.rows === 0) {
                paper.setSize(paper.width, (margin + self.tileHeight)*Math.floor(self.tabAnswer.length/self.rows) + self.height + y + 2*margin+100);
            } else {
                paper.setSize(paper.width, (margin + self.tileHeight)*Math.floor((self.tabAnswer.length/self.rows)+1) + self.height + y + 2*margin+100);
            }

            var posx = x;
            var posy = y + self.height + margin * 2;
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

                self.tabAnswer[i].display(posx, posy, tileWidth, self.tileHeight);
               // self.temp=self.tabAnswer[i];
                (function(element){
                    if(element.bordure) {
                        element.bordure.node.onclick=function() {
                            elementClicked(element,'bordure');
                        };
                    }

                    if(element.content) {
                        element.content.node.onclick=function() {
                            elementClicked(element,'content');
                        };
                    }

                    if (element.image) {
                        element.image.node.onclick = function () {
                            elementClicked(element, 'image');
                        };
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
            validateX=self.bordure.attr('width')/2+self.x-75+100;
            validateY=self.tileHeight*self.lines+(self.lines)*margin+self.y+self.height;
            var validateButton=displayText("Valider",-w/2,-h/2,w,h,'green','yellow',20
            );

            self.validatedisplaySet=paper.set();
            self.validatedisplaySet.push(validateButton.cadre);
            self.validatedisplaySet.push(validateButton.content);
            self.displaySetAnswers.push(self.validatedisplaySet);

            var t=self.transformation('t',''+(validateX+w/2),''+(validateY+h/2));
            self.validatedisplaySet.transform(t);

            //button. onclick
            var oclk=function(){
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
                        reponseD+= e.label+"\n";
                    });
                    console.log("Mauvaise réponse!\n  Bonnes réponses: "+reponseD);
                }

                self.parentQuizz.nextQuestion();

            };
            validateButton.cadre.node.onclick=oclk;
            validateButton.content.node.onclick=oclk;

            //Button reset
            var w=150;
            var h=50;
            var resetX=self.bordure.attr('width')/2+self.x-75 -100;
            var resetY=self.tileHeight*self.lines+(self.lines)*margin+self.y+self.height;
            self.resetButton=displayText("Reset",-w/2,-h/2,w,h,'grey','grey',20
            );

            self.resetDisplaySet=paper.set();

            self.resetDisplaySet.push(self.resetButton.cadre);
            self.resetDisplaySet.push(self.resetButton.content);
            self.displaySetAnswers.push(self.resetDisplaySet);
            var t=self.transformation('t',''+(resetX+w/2),''+(resetY+h/2));
            self.resetDisplaySet.transform(t);

            var reset = function(){
                if(self.selectedAnswers.length>0){
                    self.selectedAnswers.forEach(function(e){
                        e.selected=false;
                        e.bordure.attr("stroke-width",1);
                        e.bordure.attr("stroke",e.rgbBordure);
                    });
                    self.selectedAnswers.splice(0,self.selectedAnswers.length);
                    self.resetButton.cadre.attr("fill","grey");
                    self.resetButton.cadre.attr("stroke","grey");
                }
            };
            self.resetButton.content.node.onclick=reset;
            self.resetButton.cadre.node.onclick=reset;
        }

    };

    function elementClicked(sourceElement,type) {
        var partClicked;
        switch(type) {
            case 'bordure':
                partClicked=sourceElement.bordure;
                break;
            case 'content':
                partClicked=sourceElement.content;
                break;
            case 'image':
                partClicked=sourceElement.image;
                break;
        }
        if(self.multipleChoice===false){// question normale, une seule réponse possible
        if(sourceElement.correct) {
            self.parentQuizz.score++;
            console.log("Bonne réponse!\n");
        } else {
            self.parentQuizz.questionsWithBadAnswers.push(self.parentQuizz.tabQuestions[self.parentQuizz.currentQuestionIndex]);
            var reponseD="";
            self.rightAnswers.forEach(function(e){
               reponseD+= e.label+"\n";
            });
            console.log("Mauvaise réponse!\n  Bonnes réponses: "+reponseD);
        }

        self.parentQuizz.nextQuestion();
        }else{// question à choix multiples
            if(sourceElement.selected===false){
                // on sélectionne une réponse
                sourceElement.selected=true;
                self.selectedAnswers.push(sourceElement);
                sourceElement.bordure.attr("stroke-width",5);
                sourceElement.bordure.attr("stroke",'red');
                self.resetButton.cadre.attr("fill","yellow");
                self.resetButton.cadre.attr("stroke","green");

            }else{
                sourceElement.selected=false;
                self.selectedAnswers.splice(self.selectedAnswers.indexOf(sourceElement),1);
                sourceElement.bordure.attr("stroke-width",1);
                sourceElement.bordure.attr("stroke",sourceElement.rgbBordure);
                if(self.selectedAnswers.length==0){
                    self.resetButton.cadre.attr("fill","grey");
                    self.resetButton.cadre.attr("stroke","grey");
                }
            }


        }

       // console.log("score: "+self.parentQuizz.score);
    }

};


