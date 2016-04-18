/**
 * Created by ABO3476 on 18/04/2016.
 */

var BibJeux = function (bibJeux) {
    var self = this;
    self.bibJeuxManipulator = new Manipulator(self);
    mainManipulator.last.add(self.bibJeuxManipulator.first);
    self.title = bibJeux.title;
    self.tabJeuxBib = [];
    self.tabJeuxBib = bibJeux.tabJeuxBib;
    self.jeuxManipulators=[];
    self.jeuxMargin = 5;

    if(bibJeux.font) {
        self.font = bibJeux.font;
    }

    if(bibJeux.fontSize) {
        self.fontSize = bibJeux.fontSize;
    } else {
        self.fontSize = 20;
    }

    self.display = function(x,y,w,h){
        x && (self.x = x);
        y && (self.y = y);
        w && (self.w = w);
        h && (self.h = h);
        self.borderSize = 3;
        self.bordure =  new svg.Rect(w-self.borderSize,h-self.borderSize,self.bibJeuxManipulator).color([],self.borderSize,myColors.grey);
        self.bordure.position(x+w/2,y+h/2);
        self.bibJeuxManipulator.last.add(self.bordure);
        self.title = autoAdjustText("Type de jeux", x+w/2,y+(1/20)*h,w/2,(1/10)*h, null, self.font, self.bibJeuxManipulator).text;
        self.title.position(x+w/2,y+(1/20)*h);
        self.bibJeuxManipulator.last.add(self.title);
        //var maxJeuxbyLine = Math.floor((w-self.jeuxMargin)/(w/2+self.jeuxMargin));
        var maxJeuxbyLine = 1;
        self.jeuxMargin = (w -(maxJeuxbyLine*w))/(maxJeuxbyLine+1)+2*MARGIN;
        var tempY = (2/12*h);

        for (var i = 0; i<self.tabJeuxBib.length; i++) {

            if (i%maxJeuxbyLine === 0 && i!=0){
                tempY += self.w/2+self.jeuxMargin;
            }
            self.jeuxManipulators[i] = new Manipulator(self);
            self.bibJeuxManipulator.last.add(self.jeuxManipulators[i].first);
            var objectTotal = displayTextWithCircle(self.tabJeuxBib[i].label, w/2, h, myColors.black,myColors.none,null,self.fontSize, self.jeuxManipulators[i]);
            self.jeuxManipulators[i].ordonator.set(1,objectTotal.content);
            var X=x+self.jeuxMargin-2*MARGIN+((i%maxJeuxbyLine+1)*(self.jeuxMargin+w/2-2*MARGIN));
            self.jeuxManipulators[i].first.move(X, tempY);
            manageDnD(objectTotal.cadre, self.jeuxManipulators[i]);
        }
        self.bibJeuxManipulator.first.move(x,y);
    };



};
