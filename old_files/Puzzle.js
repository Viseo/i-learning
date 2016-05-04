/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(lines, rows, questionsTab, cadreResult, reverseMode, parent) {
    var self=this;

    self.lines=lines;
    self.rows=rows;
    self.tilesTab=[];
    self.questionsTab=questionsTab;
    self.startPosition=0;

    self.reverseMode = reverseMode;
    self.parent=parent;

    self.totalRows = 0;
    if(self.questionsTab.length%self.lines === 0) {
        self.totalRows = self.questionsTab.length/self.lines;
    }
    else {
        self.totalRows = Math.floor(self.questionsTab.length/self.lines) +1;
    }

    var count = 0;
    self.virtualTab = [];
    self.puzzleManipulator = new Manipulator(self);
    self.leftArrowManipulator=new Manipulator(self);
    self.rightArrowManipulator=new Manipulator(self);
    self.questionWithBadAnswersManipulator=new Manipulator(self);
    self.puzzleManipulator.last.add(self.questionWithBadAnswersManipulator.first);
    self.puzzleManipulator.last.add(self.leftArrowManipulator.first);
    self.puzzleManipulator.last.add(self.rightArrowManipulator.first);



    if(self.reverseMode) {
        for (var i = 0; i < self.lines; i++) {
            self.virtualTab[i] = [];
            for (var j = 0; j < self.rows; j++) {
                if (count < self.questionsTab.length) {
                    self.virtualTab[i][j] = self.questionsTab[count];
                    count++;
                } else {
                    break;
                }
            }
        }
    } else {
        for (var i = 0; i < self.totalRows; i++) {
            self.virtualTab[i] = [];
            for (var j = 0; j < self.lines; j++) {
                if (count < self.questionsTab.length) {
                    self.virtualTab[i][j] = self.questionsTab[count];
                    //self.virtualTab[i][j].tabAnswer.splice(0,self.virtualTab[i][j].tabAnswer.length);

                    if((self.virtualTab[i][j] instanceof Question) && self.virtualTab[i][j].answersManipulator.first){
                        self.virtualTab[i][j].questionManipulator.first.flush();
                        //self.virtualTab[i][j].questionManipulator.last.remove(self.virtualTab[i][j].answersManipulator.first);
                    }
                    count++;
                } else {
                    break;
                }
            }
        }
    }

    //self.initDisplay(x, y, w, h, startPosition){
    //
    //}

    /**
     *
     * @param x: X
     * @param y: Y
     * @param w: Width
     * @param h: Height
     * @param startPosition: Row number to align with
     */
    self.display = function(x, y, w, h, startPosition) {
        self.startPosition = startPosition;
        self.puzzleManipulator.last.remove(self.questionWithBadAnswersManipulator.first);
        self.questionWithBadAnswersManipulator = new Manipulator(self);
        self.puzzleManipulator.last.add(self.questionWithBadAnswersManipulator.first);


        var removeArrows = function (){
            if(self.leftArrowManipulator.last.children.length>1) {
                self.leftArrowManipulator.last.flush();
            }
            if (self.rightArrowManipulator.last.children.length>1){
                self.rightArrowManipulator.last.flush();
            }
        };

        self.handlerLeftArrow = function (){
            if (self.rows === 1 && startPosition !== 0) {
                removeArrows();
                self.display(x, y, w, h, startPosition - 1);
            } else if (startPosition - self.rows + 1 <= 0) {
                removeArrows();
                self.display(x, y, w, h, 0);
            } else {
                removeArrows();
                self.display(x, y, w, h, startPosition - self.rows + 1);
            }
        };

        if (self.rows < self.totalRows) {
            if(startPosition === 0) {
                self.leftArrow=drawArrow(0,0, 75, 75,self.leftArrowManipulator);
                self.leftArrow.color(myColors.grey);
                if(self.leftArrow.onClick!==null){
                    svg.removeEvent(self.leftArrow,'click',self.leftArrow.onClick);
                }
            } else {
                self.leftArrow=drawArrow(0,0, 75, 75,self.leftArrowManipulator);
                self.leftArrow.color(myColors.black);
                svg.addEvent(self.leftArrow, "click",self.handlerLeftArrow);
            }
            self.leftArrowManipulator.rotator.rotate(180);
            self.leftArrowManipulator.translator.move(-w/2-MARGIN+75/2, y+h/2);

            self.handlerRightArrow = function (){
                if(self.rows === 1 && startPosition !== self.totalRows -1) {
                    removeArrows();
                    self.display(x, y, w, h, startPosition+1);
                } else if(2*self.rows + startPosition >= self.totalRows) {
                    removeArrows();
                    var newStartPosition = self.totalRows - self.rows;
                    self.display(x, y, w, h, newStartPosition);
                } else {
                    removeArrows();
                    var newStartPosition = startPosition + self.rows - 1;
                    self.display(x, y, w, h, newStartPosition);
                }
            };

            if(startPosition + self.rows>= self.totalRows) {
               self.rightArrow= drawArrow(0, 0, 75, 75,self.rightArrowManipulator);
                self.rightArrow.color(myColors.grey);
                if(self.rightArrow.onClick!==null){
                    svg.removeEvent(self.rightArrow,'click',self.rightArrow.onClick);
                }
            } else {
                self.rightArrow=drawArrow(0, 0, 75, 75,self.rightArrowManipulator);
                self.rightArrow.color(myColors.black);
                svg.addEvent(self.rightArrow, "click", self.handlerRightArrow);
            }
            self.rightArrowManipulator.translator.move(w/2-75/2+MARGIN, y+h/2);
            self.initTiles(x+MARGIN+50, y, w-100-MARGIN*2, h, startPosition);
        } else {
            self.initTiles(x, y, w, h, startPosition);
        }
    };

    self.initTiles=function(x, y, w, h, startPosition) {
        self.tileWidth=(w-(self.rows-1)*MARGIN)/self.rows;
        self.tileHeight=(h-(self.lines+1)*MARGIN)/self.lines;

        var posX=0;
        var posY=y;
        var newTile = {};
        var count = startPosition*self.lines;

        if(self.reverseMode) {
            // Valable pour 2 lignes 4 col
            for(var i = startPosition; i<(startPosition+self.lines); i++) {
                for(var j = 0; j<self.rows; j++) {
                    if(count < self.questionsTab.length) {
                        self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].manipulator.first);
                        if(!(self.virtualTab[i][j].bordure)){
                            self.virtualTab[i][j].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
                            if(self.virtualTab[i][j].bordure && self.virtualTab[i][j].bordureEventHandler){
                                svg.addEvent(self.virtualTab[i][j].bordure,'click',self.virtualTab[i][j].bordureEventHandler);
                            }
                            if(self.virtualTab[i][j].content && self.virtualTab[i][j].contentEventHandler){
                                svg.addEvent(self.virtualTab[i][j].content,'click',self.virtualTab[i][j].contentEventHandler);
                            }
                            if(self.virtualTab[i][j].raphImage && self.virtualTab[i][j].imageEventHandler){
                                svg.addEvent(self.virtualTab[i][j].raphImage,'click',self.virtualTab[i][j].imageEventHandler);
                            }
                        }
                        self.virtualTab[i][j].manipulator.first.move(posX+self.tileWidth/2+MARGIN,posY+MARGIN);
                        posX += self.tileWidth + MARGIN;
                        count++;
                    }
                    else {
                        break;
                    }
                }
                posY += self.tileHeight + MARGIN;
                posX = 0;
            }
        } else {
            for (var i = startPosition; i < (startPosition + self.rows); i++) {
                for (var j = 0; j < self.lines; j++) {
                    if (count < self.questionsTab.length) {
                    if(self.virtualTab[i][j] instanceof AddEmptyElement){
                        self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].manipulator.first);
                    }else{
                        self.questionWithBadAnswersManipulator.last.add(self.virtualTab[i][j].questionManipulator.first);
                    }
                            self.virtualTab[i][j].display(0, 0, self.tileWidth, self.tileHeight);
                            if(self.virtualTab[i][j].bordure && self.virtualTab[i][j].bordureEventHandler){
                                svg.addEvent(self.virtualTab[i][j].bordure,'click',self.virtualTab[i][j].bordureEventHandler);
                            }
                            if(self.virtualTab[i][j].content && self.virtualTab[i][j].contentEventHandler){
                                svg.addEvent(self.virtualTab[i][j].content,'click',self.virtualTab[i][j].contentEventHandler);
                            }
                            if(self.virtualTab[i][j].raphImage && self.virtualTab[i][j].imageEventHandler){
                                svg.addEvent(self.virtualTab[i][j].raphImage,'click',self.virtualTab[i][j].imageEventHandler);
                            }

                    if(self.virtualTab[i][j] instanceof AddEmptyElement){
                        self.virtualTab[i][j].manipulator.translator.move(posX+self.tileWidth/2-w/2,posY+self.tileHeight/2+MARGIN);
                    }else{
                        self.virtualTab[i][j].questionManipulator.translator.move(posX+self.tileWidth/2-w/2,posY+self.tileHeight/2+MARGIN);
                    }

                        posY += self.tileHeight + MARGIN;
                    count++;
                    }
                    else {
                        break;
                    }
                }
                posX += self.tileWidth +  MARGIN;
                posY = y;
            }
        }
    };
}