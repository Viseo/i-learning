/**
 * Created by ABL3483 on 01/03/2016.
 */

function RaphaelSpy(x,y,width,height){
    var self=this;

    var paper={
        get width() {
            return paper.raphael.width;
        },
        set width(width) {
            paper.raphael.width=width;
        },
        get height() {
            return paper.raphael.height;
        },
        set height(height) {
            paper.raphael.height=height;
        }
    };
    paper.raphael=Raphael(x,y,width,height);
    paper.mock=RaphaelMock(x,y,width,height);
    paper.setSize=function(w,h)
    {
        paper.raphael.setSize(w,h);
        paper.mock.setSize(w,h);
    };
    paper.path = function (string) {
        return paper.raphael.path(string);
    };

    paper.rect=function (x,y,width,height){
        var r = paper.raphael.rect(x,y,width,height);
        paper.mock.rect(x,y,width,height);
       // paper.mock.writeTest();
        return r;
    };

    paper.text=function (x,y,text){
        var t = paper.raphael.text(x,y,text);
        paper.mock.text(x,y,text);
        //paper.mock.writeTest();
        return t;
    };

    paper.set=function(){
        var s=[];
        s.type='set';
        s.rset=paper.raphael.set();
        s.mset=paper.mock.set();
        s.push=function(element){
            s.rset.push(element);
            s.mset.push(element);
            s[s.length]=element;
        };
        s.remove=function(){
            s.rset.remove();
            s.mset.remove();
            while(s.length>0)
            {
                s.pop();
            }
        };
        return s;
    };

    paper.image = function(imgSrc, x, y, w, h) {
        var i = paper.raphael.image(imgSrc, x, y, w, h);
        paper.mock.image(imgSrc, x, y, w, h);
        //paper.mock.writeTest();
        return i;
    };
    paper.attr=function(param,value){
        self.raphael.attr(param,value);
        self.mock.attr(param,value);
    };
    return paper;
}

function RaphaelMock(x,y,width,height)
{
    var self=this;
    var paper={index:0};
    paper.x=x;
    paper.y=y;
    paper.width=width;
    paper.height=height;
    paper.children=[];
    paper.setSize=function(w,h)
    {
        self.width=w;
        self.height=h;
    };
    paper.rect=function(x,y,width,height) {
        var element={type:"rect",
            id:paper.index++};
        element.x=x;
        element.y=y;
        element.width=width;
        element.height=height;
        element.node={};
        element.node.onclick={};
        element.writeTest= function () {
            console.log('paper.r'+element.id+'.test('+element.x+','+element.y+','+element.width+','+element.height+');');
        };
        element.attr=attrMock;
        element.remove=removeMock;
        element.test=function(x,y,width,height){
            expect(element.x).toEqual(x);
            expect(element.y).toEqual(y);
            expect(element.width).toEqual(width);
            expect(element.height).toEqual(height);
        };
        element.animate = animate;
        paper['r'+element.id]=element;
        paper.children.push(element);
        //element.writeTest();
        return element;
    };

    paper.text=function(x,y,text) {
       // console.log("TEXT");
        var element={type:"text",
            id:paper.index++};
        element.svgAttr = [];
        element.x=x;
        element.y=y;
        element.text=text;
        element.node={};
        element.node.onclick={};
        element.writeTest= function () {
            if(element.text!=="")
            {
                console.log('paper.t'+element.id+'.test('+element.x+','+element.y+',"'+element.text+'");');
            }
            else
            {
              // For Debug  console.log('Chaîne vide');
            }
        };
        element.test=function(x,y,text){
            expect(element.x).toEqual(x);
            expect(element.y).toEqual(y);
            expect(element.text).toEqual(text);
        };
        element.attr=attrMock;
        element.animate = animate;

        element.remove=removeMock;
        element.getBBox=getBBoxMock;
        element.toFront=toFrontMock;

        paper['t'+element.id]=element;
        paper.children.push(element);
        return element;
    };

    paper.set=function(){

        var s=[];
        s.type='set';
        s.remove=removeMock;
        return s;
    };

    paper.image = function(imageSrc, x, y, w, h) {
        var element={type:"image", id:paper.index++};
        element.imageSrc = imageSrc;
        element.x = x;
        element.y = y;
        element.w = w;
        element.h = h;
        element.node={};
        element.node.onclick={};
        element.writeTest = function () {
            console.log('paper.i'+element.id+'.test("'+element.imageSrc+'",'+element.x+','+element.y+','+element.w+','+element.h+');')
        };
        element.test = function () {
            expect(element.imageSrc).toEqual(imageSrc);
            expect(element.x).toEqual(x);
            expect(element.y).toEqual(y);
            expect(element.w).toEqual(w);
            expect(element.h).toEqual(h);
        };

        element.animate = animate;
        element.remove=removeMock;
        element.toFront=toFrontMock;

        paper['i'+element.id]=element;
        paper.children.push(element);
        return element;
    };

    paper.path=function(pathStr){
        var element={type:"path", id:paper.index++};
        element.tempHeigth=0;
        element.tempWidth=0;
        element.x;
        element.y;
        element.fill="";

        element.node={};
        element.node.onclick={};

        var strTab=pathStr.split(' ');
        var secondSplit=strTab[1].split(',');

        element.x= parseInt(secondSplit[0]);
        element.y= parseInt(secondSplit[1]);

        element.writeTest = function () {
            console.log('paper.p'+element.id+'.test('+element.x+','+element.y+','+element.tempHeight+','+element.tempWidth+',"'+element.fill+'");');
        };
        element.test = function (x,y,w,h,color) {
            expect(element.x).toEqual(x);
            expect(element.y).toEqual(y);
            expect(element.tempHeight).toEqual(w);
            expect(element.tempWidth).toEqual(h);
            expect(element.fill).toEqual(color);
        };

        element.animate = animate;
        element.remove=removeMock;
        element.toFront=toFrontMock;
        element.attr=attrMock;
        element.transform=function(str){};
        element.scale=function(str){};

        paper['p'+element.id]=element;
        paper.children.push(element);
        return element;
    };
    paper.writeTest=function() {
        console.log("\n----------BEGIN----------\n")
        console.log(paper.children.length);
        paper.children.forEach(function (e) {
           // console.log("WRITE TEST");
            e.writeTest();
        });
        console.log("\n----------END----------\n")
    };

    function removeMock()
    {
       // console.log(paper[this.type.charAt(0)+this.id.toString()]);
        var self=this;
        if(self.type==="set"){
            self.forEach(function(e){
               e.remove();
            });
        }else{

            delete paper[self.type.charAt(0)+self.id.toString()];
            paper.children.splice(paper.children.indexOf(self),1);
        }

    }

    return paper;
}

/*var attr = function (param, value) {
    var tab = [];

    if(param !== null && typeof param === 'object') {
        param.forEach(function (it) {
            tab.push(it);
        });
    } else if(value) {
        tab.push({param: value});
    }
    return tab;
};*/

function animate (objectCoord, time) {
    if(objectCoord.x) {
        this.x = objectCoord.x;
    }
    if(objectCoord.y) {
        this.y = objectCoord.y;
    }
    return this;
}

function attrMock (param, value) {

    var resultOfGet=null;
    //console.log("Attr called by: "+this.type+"\n");
    if(typeof param === 'object'&& !value){
       // console.log("Set object");

        //set object
        tabAttributes=Object.keys(param);
        var obj = this;
        tabAttributes.forEach(function(e){
            obj[e]=param[e];
        });

        // console.log("Attr set:\n"+"type: "+this.type+"\nId: "+this.id);
       // this.writeTest();
      //  console.log("Set object--->"+tabAttributes);
        return this;// permet de faire des appels en cascade!
    }else if(typeof param !== 'object'&& value){
        //pas d'objet et une value -> set normal

        this[param]=value;
       // console.log("Attr set:\n"+"type: "+this.type+"\nId: "+this.id);
       // this.writeTest();

      //  console.log("Set normal--->"+param+":"+value+" on "+this.type);
        return this;// permet de faire des appels en cascade!
    }else if(typeof param !== 'object' && !value){
        //pas d'objet et pas de value -> get
        var tabAttributes=Object.keys(this);
       // console.log("Get--->"+tabAttributes);
        if(tabAttributes.indexOf(param)>-1) {
            resultOfGet=this[param];
        }
        return resultOfGet;
    }

}

function getBBoxMock(){

    var chaine=this.text;
    var characterSize=10;
    var lineHeight=18;

    var h=lineHeight;
    var w=0;

    var tableau=[];

    var reg=new RegExp('\n', "g");
    //document.write("Chaîne d'origine : " + chaine + "<BR>");

    tableau=chaine.split(reg);
    var tableauLengths=[];
    //console.log("---------DEBUT----------");
    for (var i=0; i<tableau.length; i++) {
      //  console.log("tab["+i+"]:"+tableau[i]);
      //  console.log('length: '+tableau[i].length);
        tableauLengths.push(tableau[i].length);
       // var tmp=(tableau[i].length)*characterSize;
       // w+=tmp;//nombre de caractères * taille d'un caractère

        h+=lineHeight; //hauteur d'une ligne (dépend de la police et de sa taille)
    }
    // w=Math.max.apply(null,tableau); C'est pas ça mais vazy T-MO-T

   // console.log("---------FIN----------");
    w=Math.max.apply(null,tableauLengths);
   // console.log("Max length: "+w);
    var tt=w*characterSize;
  //  console.log("Final width: "+tt);
   // console.log("Final height: "+h);
    var box={
        width:tt,
        height:h
    };

   return box;
}

function toFrontMock(){
   // console.log("toFront: not implemented yet!");
    return null;
}
