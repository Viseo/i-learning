/**
 * Created by ABO3476 on 15/03/2016.
 */


var Library = function (lib) {
    var self = this;
    self.libraryManipulator = new Manipulator(self);
    mainManipulator.last.add(self.libraryManipulator.first);
    self.title = lib.title;

    self.tabImgBib = [];
    self.tabLib = [];
    lib.tabLib && (self.tabLib = lib.tabLib);
    self.bibManipulators=[];

    self.imageWidth = 50;
    self.imageHeight = 50;
    self.libMargin = 5;

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

    self.display = function(x,y,w,h){
        x && (self.x = x);
        y && (self.y = y);
        w && (self.w = w);
        h && (self.h = h);
        self.borderSize = 3;

        self.bordure =  new svg.Rect(w-self.borderSize,h-self.borderSize,self.libraryManipulator).color(myColors.white,self.borderSize,myColors.black);
        self.bordure.position(w/2,h/2);
        self.libraryManipulator.last.add(self.bordure);

        self.title = autoAdjustText(self.title, 0, 0, w, (1/10)*h, null, self.font, self.libraryManipulator).text;
        self.title.position(w/2, (1/20)*h);

        var maxImagesPerLine = Math.floor((w-self.libMargin)/(self.imageWidth+self.libMargin));
        self.libMargin = (w -(maxImagesPerLine*self.imageWidth))/(maxImagesPerLine+1);
        var maxJeuxbyLine = 1;
        self.libMargin2 = (w -(maxJeuxbyLine*w))/(maxJeuxbyLine+1)+2*MARGIN;
        var tempY = (2/10*h);

        for (var i = 0; i<self.tabLib.length; i++) {
            if (i % maxImagesPerLine === 0 && i != 0) {
                tempY += self.imageHeight + self.libMargin;
            }
            self.bibManipulators[i] = new Manipulator(self);
            self.libraryManipulator.last.add(self.bibManipulators[i].first);
            if (self.tabLib[i].imgSrc) {

                var objectTotal = displayImage(self.tabLib[i].imgSrc, self.tabImgBib[i], self.imageWidth, self.imageHeight, self.bibManipulators[i]);
                self.bibManipulators[i].ordonator.set(0, objectTotal.image);
                var X = x + self.libMargin + ((i % maxImagesPerLine) * (self.libMargin + self.imageWidth));
                self.bibManipulators[i].first.move(X, tempY);
            }

            else {

                if (i % maxJeuxbyLine === 0 && i != 0) {
                    tempY += self.w / 2 + self.libMargin2;
                }

                var objectTotal = displayTextWithCircle(self.tabLib[i].label, w / 2, h, myColors.black, myColors.white, null, self.fontSize, self.bibManipulators[i]);
                //self.bibManipulators[i].ordonator.set(1, objectTotal.content);
                var X = x + self.libMargin2 - 2 * MARGIN + ((i % maxJeuxbyLine + 1) * (self.libMargin2 + w / 2 - 2 * MARGIN));
                self.bibManipulators[i].first.move(X, tempY);
            }
        }
        self.libraryManipulator.first.move(x, y);


        self.bibManipulators.forEach(function(e){
            svg.addEvent(e.ordonator.children[0], 'mousedown', function(event){
                var elementCopy = e.ordonator.children[0];
                //drawings.piste.add(clone(elementCopy));
                var manip = new Manipulator(self);
                drawings.piste.last.add(manip.first);

                var img;
                console.log(e.ordonator.children[0]);
                if (e.ordonator.children[0] instanceof svg.Image){
                    img = displayImage(elementCopy.src,elementCopy,elementCopy.width,elementCopy.height).image;
                }else{
                    img = displayTextWithCircle(".",w / 2, h, myColors.black, myColors.white, null, self.fontSize, manip).content
                };

                manip.ordonator.set(0,img);
                manip.first.move(event.clientX,event.clientY);

                manageDnD(img,manip);

                var mouseupHandler = function(event){
                    var img = manip.ordonator.children.shift();
                    manip.first.parent.remove(manip.first);

                    // fonction qui accepte/refuse le drop
                    var target = drawing.getTarget(event.clientX, event.clientY);
                    if(target._acceptDrop){
                        var oldQuest={cadre:target.parent.parentManip.ordonator.extract(0),
                            content:target.parent.parentManip.ordonator.extract(1)};

                        var rectColors = oldQuest.cadre.getColor();


                        var newQuest = displayImageWithTitle(oldQuest.content.messageText, img.src,
                            img,
                            oldQuest.cadre.width, oldQuest.cadre.height,
                            rectColors.strokeColor, rectColors.fillColor, null, null, target.parent.parentManip
                        );

                        //for(var i=0;i<target.parent.children[0].children.length;i++){
                        //    target.parent.children[0].unset(i);
                        //}
                        //target.parent.children[0].add(newQuest);
                        oldQuest.cadre.position(newQuest.cadre.x, newQuest.cadre.y);
                        oldQuest.content.position(newQuest.content.x,newQuest.content.y);

                        img._acceptDrop = true;
                        switch(true){

                            case target.parent.parentManip.parentObject instanceof QuestionCreator:
                                target.parent.parentManip.parentObject.linkedQuestion.image=img;
                                target.parent.parentManip.parentObject.linkedQuestion.imageSrc=img.src;
                                break;
                            case target.parent.parentManip.parentObject instanceof AnswerElement:
                                target.parent.parentManip.parentObject.linkedAnswer.image=img;
                                target.parent.parentManip.parentObject.linkedAnswer.imageSrc=img.src;
                                break;
                        }


                        target.parent.parentManip.ordonator.set(0, oldQuest.cadre);
                        target.parent.parentManip.ordonator.set(1, oldQuest.content);
                    }

                };


                drawings.glass.component.eventHandlers.mousedown(event);
                svg.removeEvent(img, 'mouseup', img.component.eventHandlers.mouseup);
                svg.addEvent(img, 'mouseup', mouseupHandler);
                //img.component.eventHandlers.mouseup(event);
                //img.component.eventHandlers.mousedown(event);
            });
            // manageDnD(e.ordonator.children[0],e);

        });

    };



};