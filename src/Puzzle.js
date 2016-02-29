/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(lines, rows,questionsTab)
{
    var self=this;
    self.lines=lines;
    self.rows=rows;
    self.margin=15;
    self.tileWidth;
    self.tileHeight;
    self.tilesTab=[];
    self.questionsTab=questionsTab;
    self.display=function(x,y,width,height)
    {
        self.paper=Raphael(x,y,width,height);
        self.initTiles();
    };

    self.initTiles=function()
    {
        self.tileWidth=(self.paper.width-(self.rows+1)*self.margin)/self.rows;
        self.tileHeight=(self.paper.height-(self.lines+1)*self.margin)/self.lines;
        for(var i=0; i<questionsTab.length;i++)
        {
            var newTile=[];
            var posx,posy;
            posx=self.margin+i*(self.tileWidth+self.margin);
            posy=self.margin+i*(self.tileHeight+self.margin);
            var R=self.paper.rect(posx,posy,self.tileWidth,self.tileHeight);
            var T=self.paper.text(posx+self.tileWidth/2,posy+self.tileHeight/2,questionsTab[i].label);
            newTile.push({rect:R,text:T});
            self.tilesTab.push(newTile);
        }
    }
}