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
                var formation = target.parent.parentManip.parentObject;
                // déterminer le targetIndexLevel !_!
                var objectToBeAddedLabel = self.draggedObjectLabel ? self.draggedObjectLabel : (self.gameSelected.content.messageText ? self.gameSelected.content.messageText : false);
                switch (objectToBeAddedLabel) {
                    case (myBibJeux.tabLib[0].label):
                        var newQuizz=new Quizz({},false,formation);
                        newQuizz.label=objectToBeAddedLabel + " " + formation.gamesCounter.quizz;
                        formation.gamesTab[formation.targetLevelIndex].push(newQuizz);
                        formation.gamesCounter.quizz++;
                        break;
                    case (myBibJeux.tabLib[1].label):
                        formation.gamesTab[formation.targetLevelIndex].push({
                            type: objectToBeAddedLabel,
                            label: objectToBeAddedLabel + " " + formation.gamesCounter.bd
                        });
                        formation.gamesCounter.bd++;
                        break;
                }
                if (formation.gamesTab[0].length>formation.maxGameInARow){
                    autoAdjustText(formation.maxGameInARowMessage, 0, 0, formation.graphCreaWidth, formation.graphCreaHeight, 20, null, formation.manipulator).text.color(myColors.red)
                        .position(drawing.width - MARGIN, 0).anchor("end");
                }
                else {
                    formation.displayNewLevel(formation.graphCreaWidth, formation.graphCreaHeight);
                }
            }
        }

        self.gameSelected && formation && svg.removeEvent(formation.graphBlock.rect, "mouseup", formation.mouseUpGraphBlock);
        self.gameSelected && formation && self.gameSelected.cadre.color(myColors.white, 1, myColors.black);
    };


    self.display = function(x,y,w,h){
        x && (self.x = x);
        y && (self.y = y);
        w && (self.w = w);
        h && (self.h = h);
        self.borderSize = 3;

        self.bordure =  new svg.Rect(w-self.borderSize,h-self.borderSize,self.libraryManipulator).color(myColors.none,self.borderSize,myColors.black);
        self.bordure.position(w/2,h/2);
        self.libraryManipulator.last.add(self.bordure);

        self.title = autoAdjustText(self.title, 0, 0, w, (1/10)*h, null, self.font, self.libraryManipulator).text;
        self.title.position(w/2, (1/20)*h);

        var maxImagesPerLine = Math.floor((w-self.libMargin)/(self.imageWidth+self.libMargin));
        self.libMargin = (w -(maxImagesPerLine*self.imageWidth))/(maxImagesPerLine+1);
        var maxJeuxPerLine = 1;
        self.libMargin2 = (w -(maxJeuxPerLine*w))/(maxJeuxPerLine+1)+2*MARGIN;
        var tempY = (2/10*h);

        for (var i = 0; i<self.tabLib.length; i++) {
            if (i % maxImagesPerLine === 0 && i != 0) {
                tempY += self.imageHeight + self.libMargin;
            }
            self.bibManipulators[i] = new Manipulator(self);
            self.libraryManipulator.last.add(self.bibManipulators[i].first);
            if (self.tabLib[i].imgSrc) {
                var objectTotal = displayImage(self.tabLib[i].imgSrc, self.tabImgBib[i], self.imageWidth, self.imageHeight, self.bibManipulators[i]);
                objectTotal.image.srcDimension = {width: self.tabImgBib[i].width, height: self.tabImgBib[i].height};
                self.bibManipulators[i].ordonator.set(0, objectTotal.image);
                var X = x + self.libMargin + ((i % maxImagesPerLine) * (self.libMargin + self.imageWidth));
                self.bibManipulators[i].first.move(X, tempY);
            }
            else {

                if (i % maxJeuxPerLine === 0 && i != 0) {
                    tempY += self.w / 2 + self.libMargin2;
                }

                var objectTotal = displayTextWithCircle(self.tabLib[i].label, w / 2, h, myColors.black, myColors.white, null, self.fontSize, self.bibManipulators[i]);
                var X = x + self.libMargin2 - 2 * MARGIN + ((i % maxJeuxPerLine + 1) * (self.libMargin2 + w / 2 - 2 * MARGIN));
                self.bibManipulators[i].first.move(X, tempY);

                self.libraryGamesTab[i] = {objectTotal : objectTotal};
                self.libraryGamesTab[i].objectTotal.cadre.clicked = false;
            }
        }
        self.libraryManipulator.first.move(x, y);

        self.bibManipulators.forEach(function(e){
            svg.addEvent(e.ordonator.children[0], 'mousedown', function(event){
                var elementCopy = e.ordonator.children[0];
                var manip = new Manipulator(self);
                drawings.piste.last.add(manip.first);
                var img;
                if (e.ordonator.children[0] instanceof svg.Image){
                    img = displayImage(elementCopy.src,elementCopy.srcDimension,elementCopy.width,elementCopy.height).image;
                    img.srcDimension = elementCopy.srcDimension;
                }else{
                    img = displayTextWithCircle(e.ordonator.children[1].messageText, w/2, h, myColors.black, myColors.white, null, self.fontSize, manip);
                    self.draggedObjectLabel = img.content.messageText;
                    img = img.cadre;
                }

                manip.ordonator.set(0, img);
                var point = e.ordonator.children[0].globalPoint(e.ordonator.children[0].x, e.ordonator.children[0].y);
                var point2 = manip.first.globalPoint(0,0);
                manip.first.move(point.x-point2.x, point.y-point2.y);

                manageDnD(img, manip);

                var mouseClickHandler = function (event){
                    var target = drawing.getTarget(event.clientX, event.clientY);
                    self.libraryGamesTab.forEach(function(e){
                        if(e.objectTotal.content.messageText === target.parent.children[1].messageText){
                            if (e.objectTotal!==self.gameSelected){
                                target.color(myColors.white, 3, SELECTION_COLOR);
                                e.objectTotal.cadre.color(myColors.white, 3, SELECTION_COLOR);
                                self.gameSelected = e.objectTotal;

                            }
                            else{
                                e.objectTotal.cadre.color(myColors.white, 1, myColors.black);
                            }
                        }
                        else{
                            e.objectTotal.cadre.color(myColors.white, 1, myColors.black);
                        }

                    });
                    //svg.addEvent(target, 'mouseup', mouseupHandler);
                    //console.log(target);
                    //target.component.eventHandlers.mouseup();
                };

                var mouseupHandler = function(event){
                    var img = manip.ordonator.children.shift();
                    manip.first.parent.remove(manip.first);
                    // fonction qui accepte/refuse le drop
                    var target = drawing.getTarget(event.clientX, event.clientY);
                    if(!(target instanceof svg.Circle)){
                        self.dropAction(img, event);
                    }
                    else {
                        mouseClickHandler(event);
                        self.formation.clickToAdd();
                    }
                    self.draggedObjectLabel = "";

                };


                drawings.glass.component.eventHandlers.mousedown(event);
                svg.removeEvent(img, 'mouseup', img.component.eventHandlers.mouseup);
                svg.addEvent(img, 'mouseup', mouseupHandler);
                //img.component.eventHandlers.mouseup(event);
                //img.component.eventHandlers.mousedown(event);
            });
            console.log(e.ordonator.get(0));
            // manageDnD(e.ordonator.children[0],e);

        });

    };



};