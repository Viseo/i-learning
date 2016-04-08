/**
 * Created by ABO3476 on 15/03/2016.
 */


var BibImage = function (bibimage) {
    var self = this;
    self.bibManipulator=new Manipulator();
    mainManipulator.last.add(self.bibManipulator.first);
    self.title = bibimage.title;
    self.tabImgBib = [];
    //self.tabImgBib = bibimage.tabImgBib;
    self.tabSrcImg = [];
    self.tabSrcImg = bibimage.tabSrcImg;
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
        var objectTotal = displayImage(self.tabSrcImg[i].imgSrc, self.tabImgBib[i],self.imageWidth, self.imageHeight,self.bibManipulator );

        objectTotal.image.position(x+self.imageMargin+((i%res)*(self.imageMargin+self.imageWidth)+self.imageWidth/2), tempY);
            self.tabImgBib.push(objectTotal.image);
            self.bibManipulator.last.add(objectTotal.image);

    }
        self.bibManipulator.first.move(x,y);
    };



};