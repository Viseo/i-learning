/**
 * Created by ABO3476 on 15/03/2016.
 */


var BibImage = function (bibimage) {
    var self = this;
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


    self.displaySet=paper.set();

    self.run = function(x,y,w,h) {
        self.intervalToken = asyncTimerController.interval(function () {
            var loaded = true;
            self.tabImgBib.forEach(function (e) {
                loaded = loaded && e.imageLoaded;

            });
            if(loaded) {
                asyncTimerController.clearInterval(self.intervalToken);
                self.display(x,y,w,h);
            }
        }, 100);
    };
    // Bib (Titre + tab Image
    self.display=function(x,y,w,h){
        self.bordure = paper.rect(x,y,w,h)
        self.displaySet.push(self.bordure);
        self.title =  paper.text(x+w/2,y+(1/10*h),self.title);
        self.title.attr("font-family",self.font).attr("font-size",self.fontSize);
        self.displaySet.push(self.title);
        var res=Math.floor((w-self.imageMargin)/(self.imageWidth+self.imageMargin));
        self.imageMargin=(w-(res*self.imageWidth))/(res+1);

        var tempY=(2/10*h);


    for (var i=0;i<self.tabSrcImg.length;i++) {

        if (i%res === 0 && i!=0){
            tempY+=self.imageHeight+self.imageMargin;
        }
        var objectTotal = displayImage(self.tabSrcImg[i].imgSrc, self.tabImgBib[i], x+self.imageMargin+((i%res)*(self.imageMargin+self.imageWidth)), tempY,self.imageWidth, self.imageHeight );


            self.tabImgBib.push(objectTotal.image);
            self.displaySet.push(objectTotal.image);

        }
    };

};