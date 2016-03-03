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

    paper.rect=function (x,y,width,height){
        var r = paper.raphael.rect(x,y,width,height);
        paper.mock.rect(x,y,width,height);
        paper.mock.writeTest();
        return r;
    };

    paper.text=function (x,y,text){
        var t = paper.raphael.text(x,y,text);
        paper.mock.text(x,y,text);
        paper.mock.writeTest();
        return t;
    };

    paper.set=function(){
        var s=[];
        s.rset=paper.raphael.set();
        s.mset=paper.mock.set();
        s.push=function(element){
            s.rset.push(element);
            s.mset.push(element);
            s[s.length]=element;
        };
        return s;
    };

    paper.image = function(imgSrc, x, y, w, h) {
        var i = paper.raphael.image(imgSrc, x, y, w, h);
        paper.mock.image(imgSrc, x, y, w, h);
        paper.mock.writeTest();
        return i;
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
    paper.rect=function(x,y,width,height) {
        var element={type:"rect",
            id:paper.index++};
        element.x=x;
        element.y=y;
        element.width=width;
        element.height=height;
        element.writeTest= function () {
            console.log('paper.r'+element.id+'.test('+element.x+','+element.y+','+element.width+','+element.height+');');
        };
        element.attr=attrMock;
        element.test=function(x,y,width,height){
            expect(element.x).toEqual(x);
            expect(element.y).toEqual(y);
            expect(element.width).toEqual(width);
            expect(element.height).toEqual(height);
        };
        paper['r'+element.id]=element;
        paper.children.push(element);
        return element;
    };

    paper.text=function(x,y,text) {
        console.log("TEXT");
        var element={type:"text",
            id:paper.index++};
        element.svgAttr = [];
        element.x=x;
        element.y=y;
        element.text=text;
        element.writeTest= function () {
            console.log('paper.t'+element.id+'.test('+element.x+','+element.y+',"'+element.text+'");');
        };
        element.test=function(x,y,text){
            expect(element.x).toEqual(x);
            expect(element.y).toEqual(y);
            expect(element.text).toEqual(text);
        };
        element.attr=attrMock;
        /*
        element.attr = function (param, value) {
            if(typeof param !== 'object' && !value) {
                // Get
                return element.svgAttr[param];
            } else {
                // Set
                var newAttrTab = attr(param, value);
                element.svgAttr.push.apply(element.svgAttr, newAttrTab);
            }
            return element;
        };*/

        paper['t'+element.id]=element;
        paper.children.push(element);
        return element;
    };

    paper.set=function(){

        var s=[];
        return s;
    };

    paper.image = function(imageSrc, x, y, w, h) {
        var element={type:"image", id:paper.index++};
        element.imageSrc = imageSrc;
        element.x = x;
        element.y = y;
        element.w = w;
        element.h = h;
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
        paper['i'+element.id]=element;
        paper.children.push(element);
        return element;
    };
    paper.writeTest=function() {
        paper.children.forEach(function (e) {
            e.writeTest();
        });
    };


    return paper;
}

var attr = function (param, value) {
    var tab = [];

    if(param !== null && typeof param === 'object') {
        param.forEach(function (it) {
            tab.push(it);
        });
    } else if(value) {
        tab.push({param: value});
    }
    return tab;
};

function attrMock (param, value) {
    var resultOfGet=null;
    console.log("Attr called by: "+this.type+"\n");
    if(typeof param === 'object'&& !value){
        //set object
        tabAttributes=Object.keys(param);
        tabAttributes.forEach(function(e){
            this[e]=param[e];

        });
        console.log("Set object--->"+tabAttributes);
    }else if(typeof param !== 'object'&& value){
        //pas d'objet et une value -> set normal
        this[param]=value;
        console.log("Set normal--->"+tabAttributes);
    }else if(typeof param !== 'object' && !value){
        //pas d'objet et pas de value -> get
        var tabAttributes=Object.keys(this);
        console.log("Get--->"+tabAttributes);
        if(tabAttributes.indexOf(param)>-1)
        {
            resultOfGet=this[param];
        }
        return resultOfGet;
    }

};