/**
 * Created by ABO3476 on 15/03/2016.
 */


var BibImage = function (bibimage) {
    var self = this;
    self.bibManipulator=new Manipulator();
    mainManipulator.ordonator.set(1,self.bibManipulator.first);
    self.title = bibimage.title;
    self.tabImgBib = [];
    //self.tabImgBib = bibimage.tabImgBib;
    self.tabSrcImg = [];
    self.tabSrcImg = bibimage.tabSrcImg;
    self.imgManipulators=[];
    self.imageWidth =50;
    self.imageHeight=50;
    self.imageMargin=5;

    for(var i=0;i<self.tabSrcImg.length;i++){
        var img=imageController.getImage(self.tabSrcImg[i].imgSrc, function () {
            this.imageLoaded = true;
           // console.log('Loaded! ');
           // console.log(this);
        });
        self.tabImgBib[i]=img;
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
    self.display=function(x,y,w,h){
        //self.bordure =  new svg.Rect(w,h,self.bibManipulator);
        x && (self.x = x);
        y && (self.y = y);
        w && (self.w = w);
        h && (self.h = h);
        self.bordure =  new svg.Rect(w,h,self.bibManipulator).color([],2,myColors.black);
        self.bordure.position(w/2,h/2);
        self.bibManipulator.last.add(self.bordure);
        //self.title =  new svg.Text(x+w/2,y+(1/10*h),self.title,self.font,self.fontSize,self.bibManipulator);
        self.title = autoAdjustText("Bibliothèque",0,0,w,(1/10)*h,null,self.font,self.bibManipulator).text;
        self.title.position(w/2,(1/20)*h);
        self.bibManipulator.last.add(self.title);
        var res=Math.floor((w-self.imageMargin)/(self.imageWidth+self.imageMargin));
        self.imageMargin=(w-(res*self.imageWidth))/(res+1);
        var tempY=(2/10*h);



    for (var i=0;i<self.tabSrcImg.length;i++) {

        if (i%res === 0 && i!=0){
            tempY+=self.imageHeight+self.imageMargin;
        }
        self.imgManipulators[i]=new Manipulator();
        self.bibManipulator.last.add(self.imgManipulators[i].first);
        var objectTotal = displayImage(self.tabSrcImg[i].imgSrc, self.tabImgBib[i],self.imageWidth, self.imageHeight,self.imgManipulators[i] );
        self.imgManipulators[i].ordonator.set(0,objectTotal.image);
        objectTotal.image.position(x+self.imageMargin+((i%res)*(self.imageMargin+self.imageWidth)+self.imageWidth/2), tempY);

    }
        self.bibManipulator.first.move(x,y);
        self.imgManipulators.forEach(function(e){
            svg.addEvent(e.ordonator.children[0],'mousedown',function(event){
                var elementCopy=e.ordonator.children[0];
                //drawings.piste.add(clone(elementCopy));
                var manip=new Manipulator();
                drawings.piste.last.add(manip.first);

                var img = displayImage(elementCopy.src,elementCopy,elementCopy.width,elementCopy.height).image;
                manip.ordonator.set(0,img);
                manip.first.move(event.clientX,event.clientY);

                manageDnD(img,manip);

                var mouseupHandler = function(event){
                    var img=manip.ordonator.children.shift();
                    manip.first.parent.remove(manip.first);

                    // fonction qui accepte/refuse le drop
                    var target = drawing.getTarget(event.clientX, event.clientY);
                    if(target._acceptDrop){
                        var oldQuest={cadre:target.parent.parentManip.ordonator.extract(0),
                            content:target.parent.parentManip.ordonator.extract(1)};

                        var rectColors=oldQuest.cadre.getColor();


                        var newQuest=displayImageWithTitle(oldQuest.content.messageText,img.src,
                            img,
                            oldQuest.cadre.width,oldQuest.cadre.height,
                            rectColors.strokeColor,rectColors.fillColor,null,null,target.parent.parentManip
                        );

                        //for(var i=0;i<target.parent.children[0].children.length;i++){
                        //    target.parent.children[0].unset(i);
                        //}
                        //target.parent.children[0].add(newQuest);
                        oldQuest.cadre.position(target.parent.parentManip.ordonator.children[0].x,target.parent.parentManip.ordonator.children[0].y);
                        oldQuest.content.position(target.parent.parentManip.ordonator.children[1].x,target.parent.parentManip.ordonator.children[1].y)
                        target.parent.parentManip.ordonator.set(0,oldQuest.cadre);
                        target.parent.parentManip.ordonator.set(1,oldQuest.content);
                        target.parent.parentManip.ordonator.children[2]._acceptDrop = true;
                    }
                    console.log('test');

                };


                drawings.glass.component.eventHandlers.mousedown(event);
                svg.removeEvent(img,'mouseup',img.component.eventHandlers.mouseup);
                svg.addEvent(img,'mouseup',mouseupHandler);
                //img.component.eventHandlers.mouseup(event);
                //img.component.eventHandlers.mousedown(event);
                //drawings.piste.
            });
          // manageDnD(e.ordonator.children[0],e);

        });

    };



};