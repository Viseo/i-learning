/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(lines, rows,questionsTab, cadreResult, reverseMode) {
    var self=this;

    self.lines=lines;
    self.rows=rows;
    self.margin=MARGIN;
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
    self.puzzleManipulator = new Manipulator();
    self.leftArrowManipulator=new Manipulator();
    self.rightArrowManipulator=new Manipulator();
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
                    self.virtualTab[i][j].answersManipulator.first && self.virtualTab[i][j].questionManipulator.last.remove(self.virtualTab[i][j].answersManipulator.first);
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
        self.puzzleManipulator.last.children.forEach(function (el) {
            self.puzzleManipulator.last.remove(el);
        });

       var handlerLeftArrow = function (){
            if (self.rows === 1 && startPosition !== 0) {
                self.display(x, y, w, h, startPosition - 1);
            } else if (startPosition - self.rows + 1 <= 0) {
                self.display(x, y, w, h, 0);
            } else {
                self.display(x, y, w, h, startPosition - self.rows + 1);
            }
        };

        if (self.rows < self.totalRows) {
            if(startPosition === 0) {
                 drawArrow(-75/2,-75/ 2, 75, 75, handlerLeftArrow,self.leftArrowManipulator);
            } else {
                drawArrow(-75/2,-75/ 2, 75, 75, handlerLeftArrow,self.leftArrowManipulator);
            }



            //self.puzzleManipulator.last.add(self.leftArrowManipulator.first);
            self.leftArrowManipulator.rotator.rotate(180);
            //self.leftArrowManipulator.translator.move(x+self.margin+75/2,y + (h/2)+75/2);
            self.leftArrowManipulator.translator.move(20, 1000);

            // self.leftArrowManipulator.scalor.scale(self.leftArrowManipulator.scale);

            var handlerRightArrow = function (){
                if(self.rows === 1 && startPosition !== self.totalRows -1) {
                    self.display(x, y, w, h, startPosition+1);
                } else if(2*self.rows + startPosition >= self.totalRows) {
                    var newStartPosition = self.totalRows - self.rows;
                    self.display(x, y, w, h, newStartPosition);
                } else {
                    var newStartPosition = startPosition + self.rows - 1;
                    self.display(x, y, w, h, newStartPosition);
                }
            };


            if(startPosition + self.rows>= self.totalRows) {
                 drawArrow(-75/2, -75/2, 75, 75, handlerRightArrow,self.rightArrowManipulator);
            } else {
                drawArrow(-75/2, -75/2, 75, 75, handlerRightArrow,self.rightArrowManipulator);
            }
            //self.puzzleManipulator.push(self.rightArrow);
            //self.rightArrowManipulator=paper.set();
            //self.rightArrowManipulator.push(self.rightArrow);
            self.rightArrowManipulator.translator.move(x+w-self.margin+75/2,y + (h/2)+75/2);
            //self.rightArrowManipulator.manipulator.scalor.scale(self.rightArrowManipulator._scale);

            self.initTiles(x+self.margin+50, y, w-100-self.margin*2, h, startPosition);
        } else {
            self.initTiles(x, y, w, h, startPosition);
        }


    };


    self.initTiles=function(x, y, w, h, startPosition) {
        self.tileWidth=(w-(self.rows-1)*self.margin)/self.rows;
        self.tileHeight=(h-(self.lines+1)*self.margin)/self.lines;

        var posX=0;
        var posY=y/2;

        var newTile = {};

        //paper.setSize(paper.width, (self.margin + self.tileHeight)*self.lines + y + 2*self.margin+100);

        var count = startPosition*self.lines;

        if(self.reverseMode) {
            // Valable pour 2 lignes 4 col
            for(var i = startPosition; i<(startPosition+self.lines); i++) {
                for(var j = 0; j<self.rows; j++) {
                    if(count < self.questionsTab.length) {
                        self.puzzleManipulator.last.add(self.virtualTab[i][j].manipulator.first);

                        self.virtualTab[i][j].display(-self.tileWidth/2, -self.tileHeight/2, self.tileWidth, self.tileHeight);
                        self.virtualTab[i][j].manipulator.translator.move(posX+self.tileWidth/2,posY+self.tileHeight/2);

                        posX += self.tileWidth+self.margin;
                        count++;
                    }
                    else {
                        break;
                    }
                }
                posY += self.tileHeight+self.margin;
                posX = 0;
            }
        } else {
            for (var i = startPosition; i < (startPosition + self.rows); i++) {
                for (var j = 0; j < self.lines; j++) {
                    if (count < self.questionsTab.length) {

                    self.puzzleManipulator.last.add(self.virtualTab[i][j].questionManipulator.first);
                    self.virtualTab[i][j].display(0, 0, self.tileWidth, self.tileHeight);

                    self.virtualTab[i][j].questionManipulator.translator.move(posX+self.tileWidth/2-w/2,posY+self.tileHeight/2+MARGIN);

                    console.log(posX+self.tileWidth/2);
                    posY += self.tileHeight + self.margin;
                    count++;
                    }
                    else {
                        break;
                    }
                }
                posX += self.tileWidth + self.margin;
                posY = y/2;
            }
        }
    };
}