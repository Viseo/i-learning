/**
 * Created by TDU3482 on 18/03/2016.
 */


var imageController = ImageController();
paper=Raphael(0,0,document.body.clientWidth,1500);
var asyncTimerController=AsyncTimerController();

var mySet=paper.set();

var x, y, w,h;
w=100;
h=150;
var myRect=paper.rect(-w/2,-h/2,w,h);

mySet.push(myRect);

mySet.transform("t51,76");