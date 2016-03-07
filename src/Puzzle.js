/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(lines, rows,questionsTab, cadreResult) {
    var self=this;
    self.lines=lines;
    self.rows=rows;
    self.margin=15;
    self.tilesTab=[];
    self.questionsTab=questionsTab;
    self.displaySet=paper.set();

    var leftArrowBlack = new Image();
    leftArrowBlack.src = "../resource/arrow left.png";
    var leftArrowBlackLoaded = false;
    leftArrowBlack.onload = function () {
        leftArrowBlackLoaded = true;
    };

    var rightArrowBlack = new Image();
    rightArrowBlack.src = "../resource/arrow right.png";
    var rightArrowBlackLoaded = false;
    rightArrowBlack.onload = function () {
        rightArrowBlackLoaded = true;
    };

    var leftArrowGrey = new Image();
    leftArrowGrey.src = "../resource/arrow left_grey.png";
    var leftArrowGreyLoaded = false;
    leftArrowGrey.onload = function () {
        leftArrowGreyLoaded = true;
    };

    var rightArrowGrey = new Image();
    rightArrowGrey.src = "../resource/arrow right_grey.png";
    var rightArrowGreyLoaded = false;
    rightArrowGrey.onload = function () {
        rightArrowGreyLoaded = true;
    };

    var intervalToken = setInterval(function () {
        if(rightArrowBlackLoaded && rightArrowGreyLoaded && leftArrowBlackLoaded && leftArrowGreyLoaded) {
            clearInterval(intervalToken);
            self.display(cadreResult.x, cadreResult.y+cadreResult.h+15, cadreResult.w, 600, 0);
        }
    }, 100);

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

    self.display=function(x, y, w, h, startPosition) {
        // Clear SetDisplay
        self.displaySet.forEach(function (it) {
            it.remove();
        });

        if (self.rows < self.totalRows) {
            if(startPosition === 0) {
                self.leftArrow = displayImage("../resource/arrow left_grey.png", leftArrowGrey, x, y + h / 2 - 25, 50, 50).image;
            } else {
                self.leftArrow = displayImageWithEvent("../resource/arrow left.png", leftArrowBlack, x, y + h / 2 - 25, 50, 50, function () {
                    if (self.rows === 1 && startPosition !== 0) {
                        self.display(x, y, w, h, startPosition - 1);
                    } else if (startPosition - self.rows + 1 <= 0) {
                        self.display(x, y, w, h, 0);
                    } else {
                        self.display(x, y, w, h, startPosition - self.rows + 1);
                    }
                });
            }
            self.displaySet.push(self.leftArrow);

            if(startPosition + self.rows>= self.totalRows) {
                self.rightArrow = displayImage("../resource/arrow right_grey.png", rightArrowGrey, x+w-50, y+h/2-25, 50, 50).image;
            } else {
                self.rightArrow = displayImageWithEvent("../resource/arrow right.png", rightArrowBlack, x+w-50, y+h/2-25, 50, 50, function() {
                    if(self.rows === 1 && startPosition !== self.totalRows -1) {
                        self.display(x, y, w, h, startPosition+1);
                    } else {
                        var newStartPosition = startPosition + self.rows - 1;
                        self.display(x, y, w, h, newStartPosition);
                    }
                });
            }
            self.displaySet.push(self.rightArrow);
            self.initTiles(x+self.margin+50, y, w-100-self.margin*2, h, startPosition);
        } else {
            self.initTiles(x, y, w, h, startPosition);
        }
    };


    self.initTiles=function(x, y, w, h, startPosition) {
        var tileWidth=(w-(self.rows-1)*self.margin)/self.rows;
        var tileHeight=(h-(self.lines-1)*self.margin)/self.lines;

        var posX=x;
        var posY=y;

        var newTile = {};

        var count = startPosition*self.lines;
        for(var i = startPosition; i<(startPosition+self.rows); i++) {
            for(var j = 0; j<self.lines; j++) {
                if(count < self.questionsTab.length) {
                    var R = paper.rect(posX,posY,tileWidth,tileHeight).attr('fill',self.virtualTab[i][j].bgColor);
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
            posY = y;
        }
    }
}