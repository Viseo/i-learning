/**
 * Created by ABL3483 on 29/02/2016.
 */

function Puzzle(x,y,w,h,lines, rows,questionsTab)
{
    var self=this;
    self.x=x;
    self.y=y;
    self.w=w;
    self.h=h;
    self.lines=lines;
    self.rows=rows;
    self.margin=15;
    self.tileWidth;
    self.tileHeight;
    self.tilesTab=[];
    self.questionsTab=questionsTab;
    self.display=function()
    {
        self.initTiles();
    };


    self.initTiles=function()
    {
        self.tileWidth=(self.w-(self.rows+1)*self.margin)/self.rows;
        self.tileHeight=(self.h-(self.lines+1)*self.margin)/self.lines;

        posy=self.margin;
        posx=self.margin;
        var count=0;
        for(var i=0; i<questionsTab.length;i++)
        {
            var newTile;
            var posx,posy, R, T, x, y;
            if(i!==0)
            {
                posx+=(self.tileWidth+self.margin);
            }
            if(count>(self.rows-1))
            {
                count=0;
                posy+=(self.tileHeight+self.margin);
                posx=self.margin;
            }
            count++;

            R=paper.rect(posx,posy,self.tileWidth,self.tileHeight);
            T=paper.text(posx+self.tileWidth/2,posy+self.tileHeight/2,questionsTab[i].label);
            newTile={rect:R,text:T};
            self.tilesTab.push(newTile);
        }
    }
}