/**
 * Created by ABL3483 on 01/03/2016.
 */

/**
 *
 * @constructor
 * @param quizz
 * @param previewMode
 */


function Quizz(quizz, previewMode) {
    var self=this;

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

    self.tabQuestions=[];
    if (quizz.tabQuestions !== null) {
        quizz.tabQuestions.forEach(function (it) {
            var tmp = new Question(it, self);
            self.tabQuestions.push(tmp);
        });
    }

    (previewMode) ? (self.previewMode = previewMode):(self.previewMode = false);

    quizz.puzzleRows ? (self.puzzleRows = quizz.puzzleRows): (self.puzzleRows = 2);

    quizz.puzzleLines ? (self.puzzleLines = quizz.puzzleLines):(self.puzzleLines = 2);

    quizz.font && (self.font = quizz.font);

    quizz.fontSize ? (self.fontSize = quizz.fontSize): (self.fontSize = 20);

    if (quizz.colorBordure && !isNaN(parseInt(quizz.colorBordure.r)) && !isNaN(parseInt(quizz.colorBordure.g)) && !isNaN(parseInt(quizz.colorBordure.b))) {
        self.rgbBordure = "rgb(" + quizz.colorBordure.r + ", " + quizz.colorBordure.g + ", " + quizz.colorBordure.b + ")";
    }
    else {
        self.rgbBordure = "black";
    }

    if (quizz.bgColor && !isNaN(parseInt(quizz.bgColor.r)) && !isNaN(parseInt(quizz.bgColor.g)) && !isNaN(parseInt(quizz.bgColor.b))) {
        self.bgColor = "rgb(" + quizz.bgColor.r + ", " + quizz.bgColor.g + ", " + quizz.bgColor.b + ")";
    }
    else {
        self.bgColor = "none";
    }

    //self.bgColor=quizz.color;

    self.cadreResult={
        x:paper.width/2,
        y:220,
        w:paper.width,
        h:200
    };
    self.cadreTitle={
        x:0,
        y:0,
        w:paper.width,
        h:200
    };
    self.cadreQuestion={
        x:0,
        y:210,
        w:paper.width,
        h:200
    };

    self.cadreBibImages={
        x:0,
        y:210,
        w:paper.width,
        h:600
    };

    self.questionsWithBadAnswers=[];
    self.score=0;
    self.paper=paper;
    //self.puzzle;  //plus tard !
    self.title=quizz.title;

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
    var displayScore = function(color){
        var autoColor;
        switch(self.score) {
            case self.tabQuestions.length:
                self.finalMessage="Impressionant !";
                nom=" et toutes sont justes !";
                autoColor={r:100,g:255,b:100};
                break;
            case 0:
                self.finalMessage="Votre niveau est désolant... Mais gardez espoir !";
                nom="dont aucune n'est juste !";
                autoColor={r:255,g:17,b:0};
                break;
            case (self.tabQuestions.length-1):
                self.finalMessage="Pas mal du tout !";
                nom=" et toutes (sauf une...) sont justes !";
                autoColor={r:200,g:255,b:0};
                break;
            case 1:
                self.finalMessage="Vous avez encore de nombreux progrès à faire.";
                nom="dont une seule est juste.";
                autoColor={r:255,g:100,b:0};
                break;
            default:
                self.finalMessage="Correct, mais ne relachez pas vos efforts !";
                nom=" dont "+self.score+" sont justes !";
                autoColor={r:220,g:255,b:0};
                break;
        }
        var nom;

        self.finalMessage+="\nVous avez répondu à "+self.tabQuestions.length+" questions, "+nom;
        if(!color) {
            var usedColor=autoColor;
        } else {
            usedColor=color;
        }

        var object = displayText(self.finalMessage, self.cadreResult.x,self.cadreResult.y,self.cadreResult.w,self.cadreResult.h, "black", 'rgb('+usedColor.r+','+usedColor.g+','+usedColor.b+')', self.fontSize, self.font);

        self.resultBox = object.cadre;
        self.resultText = object.content;
        self.displaySetResult.push(self.resultBox);
        self.displaySetResult.push(self.resultText);
        var point=self.displaySetResult.globalToLocal(self.cadreResult.x,self.cadreResult.y);
        var t=self.transformation('t',''+(point.x+0),''+(point.y+self.cadreResult.h));//!! en chantier
        self.displaySetResult.transform('...'+t);
        self.displaySet.push(self.displaySetResult);

    };

    self.display=function(x,y,w,h){
        // Quizz title

        x && (self.x=x);
        y && (self.y=y);
        w && (self.cadreQuestion.w=w);
        (w && x) &&(self.cadreResult.w=w-x);
        x && (self.cadreResult.x=x);
        w && (self.cadreTitle.w=w);
        x && (self.quizzMarginX=x);
        y && (self.quizzMarginY=y);
        self.headerPercentage=0.1;
        self.questionPercentageWithImage=0.3;
        self.questionPercentage=0.2;
        self.responsePercentageWithImage=0.6;
        self.responsePercentage=0.7;

        var heightPage = document.documentElement.clientHeight;


        self.headerHeight=heightPage*self.headerPercentage-self.quizzMarginY;
        self.questionHeight=heightPage*self.questionPercentage-2*self.quizzMarginY;
        self.responseHeight=heightPage*self.responsePercentage-2*self.quizzMarginY;
        self.questionHeightWithoutImage=heightPage*self.questionPercentage-2*self.quizzMarginY;
        self.responseHeightWithoutImage=heightPage*self.responsePercentage-2*self.quizzMarginY;
        self.questionHeightWithImage=heightPage*self.questionPercentageWithImage-2*self.quizzMarginY;
        self.responseHeightWithImage=heightPage*self.responsePercentageWithImage-2*self.quizzMarginY;


        //var object = displayText(self.title, -w/2,-h/2,(self.cadreTitle.w-x),self.cadreTitle.h, self.rgbBordure, self.bgColor, self.fontSize, self.font);
        var object = displayText(self.title, -w/2,-h/2,(self.cadreTitle.w-x),self.headerHeight-x, self.rgbBordure, self.bgColor, self.fontSize, self.font);
        self.titleBox = object.cadre;
        self.titleText = object.content;

        self.displaySet=self.paper.set();
        displaySet.push(self.displaySet);
        self.displaySet._transformation=self._transformation;
        /// à remettre quand DisplayText le permettra (write test ne n'affiche pas encore la valeur finale)
        /*var titleObject=displayText(self.title,0,0,self.paper.width,200,'black','rgb('+self.bgColor.r+','+self.bgColor.g+','+self.bgColor.b+')');
         self.displaySet.push(titleObject.cadre);// à priori pas d'image dans le cadre du quizz
         self.displaySet.push(titleObject.content);*/

        self.displaySet.push(self.titleBox);
        self.displaySet.push(self.titleText);
        var point=self.displaySet.globalToLocal(self.x,self.y);
        //var t=self.transformation('t',''+(x+w/2),''+(y+h/2));
        var t=self.transformation('...t',''+(point.x+w/2),''+(point.y+h/2));


        self.displaySet.transform(t);

        self.nextQuestion();

        function getTarget(clientX, clientY){
            var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            var scrollLeft = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
            var target = null;
            // si la page du navigateur est trop zoomee et qu'un ascenseur apparait
            // il faut ajouter le deplacement de l'ascenseur à la position de la souris
            if (scrollTop>0){
                clientY+=scrollTop;
            }
            if (scrollLeft>0){
                clientX+=scrollLeft;
            }
            var element = self.tabQuestions[self.currentQuestionIndex];
            element.tabAnswer.forEach(function(reponse){
                var inside = insidePolygon(clientX,clientY,reponse);
                if (inside){
                    target=reponse;
                }
            });
            return target;
        };

        function insidePolygon(x, y, element) {
            var local = element.localPoint(x, y);
            console.log(element.label);
            return local.x>=-element.bordure.attrs.width/2 && local.x<=element.bordure.attrs.width/2
                && local.y>=-element.bordure.attrs.height/2 && local.y<=element.bordure.attrs.height/2;
        };

        var drag = null;
        var target = null;
        self=this;



    };

    self.nextQuestion=function(){
        if(self.displaySet[self.displaySet.length-1]) {

            if(self.currentQuestionIndex !== -1) {
                /*self.tabQuestions[self.currentQuestionIndex].displaySet.forEach(function (el) {
                    el.remove();
                });*/
                self.tabQuestions[self.currentQuestionIndex].displaySet.remove();
            }
            if(self.previewMode) {
                if(self.currentQuestionIndex === 0 && self.tabQuestions[0].multipleChoice) {
                    self.tabQuestions[0].reset();
                }

                self.currentQuestionIndex = 0;

                self.tabQuestions[self.currentQuestionIndex].display(self.quizzMarginX + self.cadreQuestion.x, self.quizzMarginY + self.cadreQuestion.y,
                    self.cadreQuestion.w - self.quizzMarginX, self.cadreQuestion.h);
                self.tabQuestions[self.currentQuestionIndex].displayAnswers(self.quizzMarginX + self.cadreQuestion.x, self.quizzMarginY + self.cadreQuestion.y,
                    self.cadreQuestion.w - self.quizzMarginX, self.cadreQuestion.h);
               // self.tabQuestions[self.currentQuestionIndex].displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySetAnswers);
                self.displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySet);
            } else {
                if (self.currentQuestionIndex + 1 < self.tabQuestions.length) {
                    self.currentQuestionIndex++;
                    self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight=self.questionHeightWithImage)
                    !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.questionHeight=self.questionHeightWithoutImage)
                    self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight=self.responseHeightWithImage)
                    !self.tabQuestions[self.currentQuestionIndex].imageSrc && (self.responseHeight=self.responseHeightWithoutImage)
                    self.tabQuestions[self.currentQuestionIndex].display(self.quizzMarginX + self.cadreQuestion.x, self.headerHeight + self.quizzMarginY,
                        self.cadreQuestion.w - self.quizzMarginX, self.questionHeight);
                    self.tabQuestions[self.currentQuestionIndex].displayAnswers(self.quizzMarginX + self.cadreQuestion.x, self.headerHeight + self.quizzMarginY,
                        self.cadreQuestion.w - self.quizzMarginX, self.responseHeight);
                    self.tabQuestions[self.currentQuestionIndex].displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySetAnswers);
                    self.displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySet);
                    /*self.tabQuestions[self.currentQuestionIndex].display(self.quizzMarginX + self.cadreQuestion.x, self.quizzMarginY + self.cadreQuestion.y,
                        self.cadreQuestion.w - self.quizzMarginX, self.cadreQuestion.h);
                    self.tabQuestions[self.currentQuestionIndex].displayAnswers(self.quizzMarginX + self.cadreQuestion.x, self.quizzMarginY + self.cadreQuestion.y,
                        self.cadreQuestion.w - self.quizzMarginX, self.cadreQuestion.h);
                    self.tabQuestions[self.currentQuestionIndex].displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySetAnswers);
                    self.displaySet.push(self.tabQuestions[self.currentQuestionIndex].displaySet);*/
                } else //--> fin du tableau, dernière question
                {
                    console.log("Final score: " + self.score);
                    self.displayResult();
                }
            }
        } else {
            console.log("No next question, end of the array\n");
        }
    };


    self.displayResult=function(color){
        self.displaySetResult=paper.set();

        /*
        gérer la couleur des réponses avec un éventuel dégradé/gradient de couleurs
        getGradientColors(rgb1, rgb2, nb_de_couleurs);
        */
        //le puzzle qui prend en compte le tableau de questions ratées
        self.puzzle=new Puzzle(self.puzzleLines, self.puzzleRows, self.questionsWithBadAnswers, self.cadreResult);
        self.puzzle.display(self.cadreResult.x, self.cadreResult.y+self.cadreResult.h+15, self.cadreResult.w, 600, 0);
        self.displaySetResult.push(self.puzzle.displaySet);
        displayScore(color);
        //self.puzzle.display(cadreResult.x,cadreResult.y+cadreResult.h+15,cadreResult.w,600,0);
    };
}