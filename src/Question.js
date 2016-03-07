/** Created by ABO3476 on 29/02/2016. */

/**
 * @param question
 * @param quizz
 * @constructor
 */
/*label,imageSrc,tabAnswer, rows, colorBordure, bgColor*/
var Question = function (question,quizz) {
    var self = this;
    self.parentQuizz=quizz;
    self.label = question.label;
    self.imageSrc = question.imageSrc;
    self.tabAnswer = [];
    self.rows=question.nbrows;
    self.rightAnswers=[];

    if(question.imageSrc) {
        self.image = new Image();
        self.image.src = question.imageSrc;
        self.imageLoaded = false;
        self.image.onload = function () {
            self.imageLoaded = true;
        };
    } else {
        self.imageLoaded = true;
    }

    self.displaySet=paper.set();

    if (question.tabAnswer !== null) {
        question.tabAnswer.forEach(function (it) {
            var tmp = new Answer(/*it.label, it.imageSrc, it.bCorrect, it.colorBordure, it.bgColor*/it);
            self.tabAnswer.push(tmp);
            if(tmp.correct)
            {
               self.rightAnswers.push(tmp);
            }
            self.displaySet.push(tmp.displaySet);
        });
    }

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

        var height = getHeight(self.label, self.imageSrc, x, y, w, 20, self.image);

        // Question avec Texte ET image
        if (self.label && self.imageSrc) {
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.image, x, y, w, height, self.rgbBordure, self.bgColor);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.image = objectTotal.image;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
            self.displaySet.push(self.image);
        }
        // Question avec Texte uniquement
        else if (self.label && !self.imageSrc) {
            var object = displayText(self.label, x, y, w, height, self.rgbBordure, self.bgColor);
            self.bordure = object.cadre;
            self.content = object.content;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
        }
        // Question avec Image uniquement
        else if(self.imageSrc && !self.label) {
            self.image = displayImage(self.imageSrc, self.image, x, y, w, height).image;
            self.displaySet.push(self.image);
        }
        else if (!self.imageSrc && !self.label){
            self.bordure = paper.rect(x, y, w, height).attr({fill: self.bgColor, stroke: self.rgbBordure})
        }

        if (self.rows !== 0) {
            var margin = 15;
            var tileWidth = (w - margin * (self.rows - 1)) / self.rows;
            var tileHeight = 0;

            var tmpTileHeight;

            for(var answer of self.tabAnswer) {
                tmpTileHeight = getHeight(answer.label, answer.imageSrc, x, y, tileWidth, 20 /*TODO*/, answer.image);
                if(tmpTileHeight > tileHeight) {
                    tileHeight = tmpTileHeight;
                }
            }

            paper.setSize(paper.width, (margin + tileHeight)*Math.round(self.tabAnswer.length/self.rows) + height + y + 2*margin);

            var posx = x;
            var posy = y + height + margin * 2;
            var count = 0;
            for (var i = 0; i < self.tabAnswer.length; i++) {
                if (i !== 0) {
                    posx += (tileWidth + margin);
                }
                if (count > (self.rows - 1)) {
                    count = 0;
                    posy += (tileHeight + margin);
                    posx = x;
                }

                self.tabAnswer[i].display(posx, posy, tileWidth, tileHeight);
               // self.temp=self.tabAnswer[i];
                (function(element){
                    if(element.bordure) {
                        element.bordure.node.onclick=function()
                        {
                            elementClicked(element,'bordure');
                        };
                    }

                    if(element.content) {
                        element.content.node.onclick=function()
                        {
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

       // console.log("score: "+self.parentQuizz.score);
    }

};


