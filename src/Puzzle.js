/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(lines, rows,questionsTab, cadreResult, reverseMode) {
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

    self.lines=lines;
    self.rows=rows;
    self.margin=15;
    self.tilesTab=[];
    self.questionsTab=questionsTab;

    self.reverseMode = reverseMode;

    self.totalRows = 0;
    if(self.questionsTab.length%self.lines === 0) {
        self.totalRows = self.questionsTab.length/self.lines;
    }
    else {
        self.totalRows = Math.floor(self.questionsTab.length/self.lines) +1;
    }

    var count = 0;
    self.virtualTab = [];

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
                    count++;
                } else {
                    break;
                }
            }
        }
    }

    /**
     *
     * @param x: X
     * @param y: Y
     * @param w: Width
     * @param h: Height
     * @param startPosition: Row number to align with
     */
    self.display=function(x, y, w, h, startPosition) {
        // Clear SetDisplay
        self.displaySet=paper.set();
        self.displaySet._transformation=self._transformation;

        self.displaySet.forEach(function (it) {
            it.remove();
        });


        if (self.rows < self.totalRows) {
            if(startPosition === 0) {
                self.leftArrowSet = drawArrow(-75/2,-75/ 2, 75, 75,"left");
            } else {
                self.leftArrowSet = drawArrow(-75/2,-75/ 2, 75, 75,"left",function (){
                    if (self.rows === 1 && startPosition !== 0) {
                        self.display(x, y, w, h, startPosition - 1);
                    } else if (startPosition - self.rows + 1 <= 0) {
                        self.display(x, y, w, h, 0);
                    } else {
                        self.display(x, y, w, h, startPosition - self.rows + 1);
                    }
                });
            }

            self.displaySet.push(self.leftArrowSet);
            var t=self.transformation('t',''+(x+self.margin+75/2),''+(y + (h/2)+75/2));
            self.leftArrowSet.transform('...'+t);
            self.leftArrowSet.transform('...r180 '+(-75/2)+','+(-75/2));
            self.leftArrowSet.transform('...s'+self.leftArrowSet._scale);

            if(startPosition + self.rows>= self.totalRows) {
                self.rightArrowSet= drawArrow(-75/2, -75/2, 75, 75,"right");
            } else {
                self.rightArrowSet = drawArrow(-75/2, -75/2, 75, 75,"right",function (){
                    if(self.rows === 1 && startPosition !== self.totalRows -1) {
                        self.display(x, y, w, h, startPosition+1);
                    } else if(2*self.rows + startPosition >= self.totalRows) {
                        var newStartPosition = self.totalRows - self.rows;
                        self.display(x, y, w, h, newStartPosition);
                    } else {
                        var newStartPosition = startPosition + self.rows - 1;
                        self.display(x, y, w, h, newStartPosition);
                    }
                });
            }
            //self.displaySet.push(self.rightArrow);
            //self.rightArrowSet=paper.set();
            //self.rightArrowSet.push(self.rightArrow);
            self.displaySet.push(self.rightArrowSet);
            var t=self.transformation('t',''+(x+w-self.margin+75/2),''+(y + h / 2+75/2));

            self.rightArrowSet.transform('...'+t);
            self.rightArrowSet.transform('...s'+self.rightArrowSet._scale);

            self.initTiles(x+self.margin+50, y, w-100-self.margin*2, h, startPosition);
        } else {
            self.initTiles(x, y, w, h, startPosition);
        }

    };


    self.initTiles=function(x, y, w, h, startPosition) {
        self.tileWidth=(w-(self.rows-1)*self.margin)/self.rows;
        self.tileHeight=(h-(self.lines-1)*self.margin)/self.lines;

        var posX=x;
        var posY=y;

        var newTile = {};

        paper.setSize(paper.width, (self.margin + self.tileHeight)*self.lines + y + 2*self.margin+100);

        var count = startPosition*self.lines;

        if(self.reverseMode) {
            // Valable pour 2 lignes 4 col
            for(var i = startPosition; i<(startPosition+self.lines); i++) {
                for(var j = 0; j<self.rows; j++) {
                    if(count < self.questionsTab.length) {

                        self.virtualTab[i][j].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
                        self.displaySet.push.apply(self.displaySet, self.virtualTab[i][j].displaySet);

                        self.virtualTab[i][j].displaySet.positionSet(posX,posY,self.tileWidth/2,self.tileHeight/2);
                        posX += self.tileWidth+self.margin;
                        count++;
                    }
                    else {
                        break;
                    }
                }
                posY += self.tileHeight+self.margin;
                posX = x;
            }
        } else {
            for (var i = startPosition; i < (startPosition + self.rows); i++) {
                for (var j = 0; j < self.lines; j++) {
                    if (count < self.questionsTab.length) {

                    self.virtualTab[i][j].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
                    self.displaySet.push(self.virtualTab[i][j].displaySet);
                    self.virtualTab[i][j].displaySet.positionSet(posX,posY,self.tileWidth/2,self.tileHeight/2);

                    posY += self.tileHeight + self.margin;
                    count++;
                    }
                    else {
                        break;
                    }
                }
                posX += self.tileWidth + self.margin;
                posY = y;
            }
        }
    };
}