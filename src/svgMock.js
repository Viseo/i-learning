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
       var r= paper.raphael.rect(x,y,width,height);
        paper.mock.rect(x,y,width,height);
        paper.mock.writeTest();
        return r;
    };
    paper.text=function (x,y,text){
        var t=paper.raphael.text(x,y,text);
        paper.mock.text(x,y,text);
        paper.mock.writeTest();
        return t;
    };

    paper.set=function(){
        var s=[];
        var rset=paper.raphael.set();
        var mset=paper.mock.set();
        s.push=function(element){
            rset.push(element);
            mset.push(element);
        };
        //pas compris, à priori il faut faire des getter/setter ici aussi...
        return rset;
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
        paper['t'+element.id]=element;
        paper.children.push(element);
        return element;
    };

    paper.set=function(){

        var s=[];
        return s;
    };

    paper.writeTest=function() {
        paper.children.forEach(function (e) {
            e.writeTest();
        });
    };


    return paper;
}