/**
 * Created by TDU3482 on 18/03/2016.
 */


var imageController = ImageController();
//paper=Raphael(0,0,document.body.clientWidth,1500);
var asyncTimerController=AsyncTimerController();

var mySet=paper1.set();
var mySecondSet=paper1.set();

var x, y, w,h;
w=100;
h=150;
var myRect=paper1.rect(-w/2,-h/2,w,h);//position du centre du rectangle

mySet.push(myRect);

mySecondSet.push(mySet);
mySecondSet.transform('t0,-50');


mySet.transform("...t100,200");
var obj=myRect.localToGlobal(0,0);
var obj2=myRect.globalToLocal(100,150);
console.log(obj);
console.log(obj2);