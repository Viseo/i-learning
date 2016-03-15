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


/*
    var leftArrowBlack = imageController.getImage("../resource/arrow left.png", function () {
        leftArrowBlackLoaded = true;});
    var leftArrowBlackLoaded = false;

    var leftArrowGrey = imageController.getImage("../resource/arrow left_grey.png", function () {
        leftArrowGreyLoaded = true;});
    var leftArrowGreyLoaded = false;

    var rightArrowBlack = imageController.getImage("../resource/arrow right.png", function () {
        rightArrowBlackLoaded = true;});
    var rightArrowBlackLoaded = false;


    var rightArrowGrey = imageController.getImage("../resource/arrow right_grey.png", function () {
        rightArrowGreyLoaded = true;});
    var rightArrowGreyLoaded = false;


    var intervalToken = setInterval(function () {
        if(rightArrowBlackLoaded && rightArrowGreyLoaded && leftArrowBlackLoaded && leftArrowGreyLoaded) {
            clearInterval(intervalToken);
        }
    }, 100);
    */


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
                self.leftArrow = drawArrow(x+self.margin, y + h / 2, 75, 75,"left");
            } else {
                self.leftArrow = drawArrow(x+self.margin, y + h / 2, 75, 75,"left",function (){
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
                self.rightArrow = drawArrow(x+w-self.margin, y+h/2, 75, 75,"right");
            } else {
                self.rightArrow = drawArrow(x+w-self.margin, y+h/2, 75, 75,"right",function (){
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
            self.displaySet.push(self.rightArrow);
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

        paper.setSize(paper.width, (self.margin + self.tileHeight)*self.lines + y + 2*self.margin);

        var count = startPosition*self.lines;
        for(var i = startPosition; i<(startPosition+self.rows); i++) {
            for(var j = 0; j<self.lines; j++) {
                if(count < self.questionsTab.length) {
                    if(self.virtualTab[i][j].label && self.virtualTab[i][j].imageSrc) {
                        var object = displayImageWithTitle(self.virtualTab[i][j].label, self.virtualTab[i][j].imageSrc, self.virtualTab[i][j].image, posX, posY, self.tileWidth, self.tileHeight, self.virtualTab[i][j].rgbBordure, self.virtualTab[i][j].bgColor, self.virtualTab[i][j].fontSize, self.virtualTab[i][j].font);
                        self.displaySet.push(object.cadre);
                        self.displaySet.push(object.image);
                        self.displaySet.push(object.text);
                    } else if(self.virtualTab[i][j].label && !self.virtualTab[i][j].imageSrc) {
                        var object = displayText(self.virtualTab[i][j].label, posX, posY, self.tileWidth, self.tileHeight, self.virtualTab[i][j].rgbBordure, self.virtualTab[i][j].bgColor, self.virtualTab[i][j].fontSize, self.virtualTab[i][j].font);
                        self.displaySet.push(object.cadre);
                        self.displaySet.push(object.content);
                    } else if(!self.virtualTab[i][j].label && self.virtualTab[i][j].imageSrc) {
                        var object = displayImage(self.virtualTab[i][j].imageSrc, self.virtualTab[i][j].image, posX, posY, self.tileWidth, self.tileHeight);
                        self.displaySet.push(object.cadre);
                        self.displaySet.push(object.image);
                    } else {
                        self.displaySet.push(paper.rect(posX, posY, self.tileWidth, self.tileHeight).attr({fill: self.virtualTab[i][j].bgColor, stroke: self.virtualTab[i][j].rgbBordure}));
                    }

                    posY += self.tileHeight+self.margin;
                    count++;
                }
                else {
                    break;
                }
            }
            posX += self.tileWidth+self.margin;
            posY = y;
        }
    };
    self.display(cadreResult.x, cadreResult.y+cadreResult.h+15, cadreResult.w, 600, 0);

}