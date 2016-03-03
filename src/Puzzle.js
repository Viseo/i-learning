/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(lines, rows,questionsTab) {
    var self=this;
    self.lines=lines;
    self.rows=rows;
    self.margin=15;
    self.tilesTab=[];
    self.questionsTab=questionsTab;
    self.displaySet=paper.set();

    self.initVirtualTab = function() {
        self.totalRows = 0;
        if(self.questionsTab.length%self.lines === 0) {
            self.totalRows = self.questionsTab.length/self.lines;
        }
        else {
            self.totalRows = Math.floor(self.questionsTab.length/self.lines) +1;
        }

        var count = 0;
        self.virtualTab = [];
        for(var i = 0 ; i < self.totalRows ; i++) {
            self.virtualTab[i] = [];
            for(var j = 0 ; j < self.lines ; j++) {
                if(count < self.questionsTab.length) {
                    self.virtualTab[i][j] = self.questionsTab[count];
                    count++;
                } else {
                    break;
                }
            }
        }
    };

    self.display=function(x, y, w, h, startPosition) {
        // Clear SetDisplay
        self.displaySet.forEach(function (it) {
            it.remove();
        });

        var v = y+(self.margin*2)+(h/2);
        console.log(v);

        self.leftArrow = displayImageWithEvent("../resource/arrow left.png", x, y+h/2-25, 50, 50, function() {
            console.log("Start position :" + 0);
            if(self.rows === 1 && startPosition !== 0) {
                self.display(x, y, w, h, startPosition--);
            } else if(startPosition- self.rows +1 <= 0) {
                self.display(x, y, w, h, 0);
            }
            else {
                var newStartPosition = startPosition - self.rows + 1;
                self.display(x, y, w, h, newStartPosition);
            }

        });

        self.rightArrow = displayImageWithEvent("../resource/arrow right.png", x+w+self.margin+25, y+h/2-25, 50, 50, function() {
            console.log(self.totalRows + " " + self.rows);
            if(self.rows === 1) {
                self.display(x, y, w, h, startPosition++);
            } else if(startPosition + self.rows - 1 >= self.totalRows - self.rows) {
                console.log("Start position :" + (self.totalRows-self.rows));
                self.display(x, y, w, h, self.totalRows-self.rows);
            } else {
                var newStartPosition = startPosition + self.rows - 1;
                self.display(x, y, w, h, newStartPosition);
            }
        });

        self.initTiles(x, y, w, h, startPosition);
    };


    self.initTiles=function(x, y, w, h, startPosition) {
        var tileWidth=(w-(self.rows+1)*self.margin)/self.rows;
        var tileHeight=(h-(self.lines+1)*self.margin)/self.lines;

        var posX=self.margin*4+x;
        var posY=self.margin+y;

        var newTile = {};

        var count = startPosition*self.lines;
        for(var i = startPosition; i<(startPosition+self.rows); i++) {
            for(var j = 0; j<self.lines; j++) {
                if(count < self.questionsTab.length) {
                    var R = paper.rect(posX,posY,tileWidth,tileHeight);
                    var T = paper.text(posX+tileWidth/2,posY+tileHeight/2,self.virtualTab[i][j].label);
                    self.displaySet.push(R);
                    self.displaySet.push(T);
                    posY += tileHeight+self.margin;
                    newTile={rect:R,text:T};
                    self.tilesTab.push(newTile);
                    count++;
                }
                else {
                    break;
                }
            }
            posX += tileWidth+self.margin;
            posY = self.margin+y;
        }
    }
}