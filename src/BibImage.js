/**
 * Created by ABO3476 on 15/03/2016.
 */


var BibImage = function (bibimage) {
    var self = this;
    self.bibManipulator = new Manipulator(self);
    //mainManipulator.ordonator.set(1,self.bibManipulator.first);
    self.title = bibimage.title;
    self.tabImgBib = [];
    //self.tabImgBib = bibimage.tabImgBib;
    self.tabSrcImg = [];
    self.tabSrcImg = bibimage.tabSrcImg;
    self.imgManipulators=[];
    self.imageWidth = 50;
    self.imageHeight = 50;
    self.imageMargin = 5;

    for(var i = 0; i<self.tabSrcImg.length; i++){
        var img = imageController.getImage(self.tabSrcImg[i].imgSrc, function () {
            this.imageLoaded = true;
           // console.log('Loaded! ');
           // console.log(this);
        });
        self.tabImgBib[i] = img;
    }



    if(bibimage.font) {
        self.font = bibimage.font;
    }

    if(bibimage.fontSize) {
        self.fontSize = bibimage.fontSize;
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
    // Bib (Titre + tab Image
    self.display = function(x,y,w,h){
        //self.bordure =  new svg.Rect(w,h,self.bibManipulator);
        x && (self.x = x);
        y && (self.y = y);
        w && (self.w = w);
        h && (self.h = h);
        self.bordure =  new svg.Rect(w,h).color([],2,myColors.black);
        self.bordure.position(w/2,h/2);
        self.bibManipulator.last.add(self.bordure);
        self.title = autoAdjustText("Bibliothèque", 0, 0, w, (1/10)*h, null, self.font, self.bibManipulator).text;
        self.title.position(w/2, (1/20)*h);
        var maxImagesPerLine = Math.floor((w-self.imageMargin)/(self.imageWidth+self.imageMargin));
        self.imageMargin = (w -(maxImagesPerLine*self.imageWidth))/(maxImagesPerLine+1);
        var tempY = (2/10*h);

    for (var i = 0; i<self.tabSrcImg.length; i++) {

        if (i%maxImagesPerLine === 0 && i!=0){
            tempY += self.imageHeight+self.imageMargin;
        }
        self.imgManipulators[i] = new Manipulator(self);
        self.bibManipulator.last.add(self.imgManipulators[i].first);
        var objectTotal = displayImage(self.tabSrcImg[i].imgSrc, self.tabImgBib[i], self.imageWidth, self.imageHeight, self.imgManipulators[i]);
        self.imgManipulators[i].ordonator.set(0,objectTotal.image);
        var X=x+self.imageMargin+((i%maxImagesPerLine)*(self.imageMargin+self.imageWidth));
        self.imgManipulators[i].first.move(X, tempY);
    }
        self.bibManipulator.first.move(x,y);
        self.imgManipulators.forEach(function(e){
            svg.addEvent(e.ordonator.children[0], 'mousedown', function(event){
                var elementCopy = e.ordonator.children[0];
                //drawings.piste.add(clone(elementCopy));
                var manip = new Manipulator(self);
                drawings.piste.last.add(manip.first);

                var img = displayImage(elementCopy.src,elementCopy,elementCopy.width,elementCopy.height).image;
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
                        var type= target.parent.parentManip.parentObject instanceof QuestionCreator;
                        var type2=target.parent.parentManip.parentObject instanceof AnswerElement;
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