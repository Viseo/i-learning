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
        self.bordure =  new svg.Rect(w-self.borderSize,h-self.borderSize,self.bibJeuxManipulator).color(myColors.white,self.borderSize,myColors.grey);
        self.bordure.position(x+w/2,y+h/2);
        self.bibJeuxManipulator.last.add(self.bordure);
        self.title = autoAdjustText("Type de jeux", x+w/2,y+(1/20)*h,w/2,(1/10)*h, null, self.font, self.bibJeuxManipulator).text;
        self.title.position(x+w/2,y+(1/20)*h);
        self.bibJeuxManipulator.last.add(self.title);
        //var maxJeuxbyLine = Math.floor((w-self.jeuxMargin)/(w/2+self.jeuxMargin));
        var maxJeuxbyLine = 1;
        self.jeuxMargin = (w -(maxJeuxbyLine*w))/(maxJeuxbyLine+1)+2*MARGIN;
        var tempY = (2/12*h);
        self.jeux=[];

        for (var i = 0; i<self.tabJeuxBib.length; i++) {

            if (i%maxJeuxbyLine === 0 && i!=0){
                tempY += self.w/2+self.jeuxMargin;
            }
            self.jeux[i] = {};
            self.jeux[i].manipulator = new Manipulator(self);
            self.bibJeuxManipulator.last.add(self.jeux[i].manipulator.first);
            self.jeux[i].objectTotal = displayTextWithCircle(self.tabJeuxBib[i].label, w/2, h, myColors.black,myColors.white,null,self.fontSize, self.jeux[i].manipulator);
            self.jeux[i].manipulator.ordonator.set(1, self.jeux[i].objectTotal.content);
            var X=x+self.jeuxMargin-2*MARGIN+((i%maxJeuxbyLine+1)*(self.jeuxMargin+w/2-2*MARGIN));
            self.jeux[i].manipulator.first.move(X, tempY);
            manageDnD(self.jeux[i].objectTotal.cadre, self.jeuxManipulators[i]);
            self.jeux[i].objectTotal.cadre.clicked = false;
            var clickHandler = function(event){
                var target = drawing.getTarget(event.clientX, event.clientY);
                target.clicked = !target.clicked;
                if (target.clicked){
                    target.color(myColors.white, 3, SELECTION_COLOR);
                    self.jeux.forEach(function(element){
                        if (element.objectTotal.cadre!=target){
                            element.objectTotal.cadre.color(myColors.white, 1, myColors.black);
                            element.objectTotal.cadre.clicked = false;
                        }
                    });
                }
                else{
                    target.color(myColors.white, 1, myColors.black);
                }
            };
            svg.addEvent(self.jeux[i].objectTotal.cadre, "click", clickHandler);

            var mouseupHandler = function(event){
                var img = manip.ordonator.children.shift();
                manip.first.parent.remove(manip.first);

                // fonction qui accepte/refuse le drop
                var target = drawing.getTarget(event.clientX, event.clientY);
                console.log("là");
                if(target._acceptDrop){
                    console.log("ici");
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
                drawings.glass.component.eventHandlers.mousedown(event);

            };
            svg.removeEvent(self.jeux[i].objectTotal.cadre, 'mouseup', self.jeux[i].objectTotal.cadre.component.eventHandlers.mouseup);
            svg.addEvent(self.jeux[i].objectTotal.cadre, 'mouseup', mouseupHandler);
        }
        self.bibJeuxManipulator.first.move(x,y);
    };



};
