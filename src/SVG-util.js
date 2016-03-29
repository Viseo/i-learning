/**
 * Created by qde3485 on 29/02/16.
 */

/**
 *
 * @param x
 * @param y
 * @param size
 * @param sender
 */
var displayCheckbox = function (x, y, size, sender) {
    var obj = {checkbox: paper.rect(x, y, size, size).attr({fill: "white", stroke:"black", "stroke-width":2})};
    var onclickFunction = function () {
        sender.bCorrect = !sender.bCorrect;
        if(obj.checked) {
            obj.checked.remove();
        }
        obj.checkbox.remove();
        displayCheckbox(x, y, size, sender);
    };

    if(sender.bCorrect) {
        var path = "M " + (x+.2*size) + "," + (y+.4*size) +
            "l " + (.2*size) + "," + (.3*size) +
            "l " + (.4*size) + "," + (-.5*size);

        obj.checked = paper.path(path).attr({"stroke-width":3});
        obj.checked.node.onclick = onclickFunction;
        sender.displaySet.push(obj.checked);
        //obj.checkbox.transform(sender.obj.cadre._.transform);
        //obj.checked.transform(sender.obj.cadre._.transform);
    }
    sender.displaySet.push(obj.checkbox);
    obj.checkbox.node.onclick = onclickFunction;

    return obj;
};


/**
 *
 * @param label
 * @param imageSrc
 * @param imageObj
 * @param x
 * @param y
 * @param w
 * @param h
 * @param rgbCadre
 * @param bgColor
 * @param fontSize
 * @param font
 * @returns {{cadre: *, image, text}}
 */
var displayImageWithTitle = function (label, imageSrc, imageObj, x, y, w, h, rgbCadre, bgColor, fontSize, font) {
    var margin = 10;

    var text = autoAdjustText(label, x, y+h-2*margin, w, null, fontSize, font).text;
    var textHeight = text.getBBox().height;
    text.animate({y:y+h-margin-textHeight/2}, 0);
    var image = displayImage(imageSrc, imageObj, x+margin, y+margin, w-2*margin, h-textHeight-3*margin);
    var cadre = paper.rect(x, y, w, h, 25).attr({fill: bgColor, stroke: rgbCadre});
    image.image.toFront();
    text.toFront();

    return {cadre: cadre, image: image.image,  text: text};
};

var displayImageWithBorder = function (imageSrc, imageObj, x, y, w, h) {
    var margin = 10;
    var image = displayImage(imageSrc, imageObj, x+margin, y+margin, w-2*margin, h-2*margin);
    var cadre = paper.rect(x, y, w, h, 25).attr({stroke: "none"});
    return {image:image.image, height:image.height, cadre:cadre};
};

/**
 *
 * @param imageSrc
 * @param image
 * @param x
 * @param y
 * @param w
 * @param h
 */
var displayImage = function (imageSrc, image, x, y, w, h) {
    var width = image.width;
    var height = image.height;
    if(width > w) {
        height *= w/width;
        width = w;
    }
    if(!h) {
        return height;
    }
    if(height > h) {
        width *= h/height;
        height = h;
    }
    //var obj = {image:paper.image(imageSrc, x+w/2-width/2, y+h/2-height/2, width, height), height:height};
    var obj = {image:paper.image(imageSrc, x+w/2-width/2, y+h/2-height/2, width, height), height:height};
    return obj;
};

/**
 *
 * @param imageSrc
 * @param image
 * @param x
 * @param y
 * @param w
 * @param h
 * @param onclickEvent
 */
var displayImageWithEvent = function (imageSrc, image, x, y, w, h, onclickEvent) {
    var width = image.width;
    var height = image.height;
    if(width > w) {
        height *= w/width;
        width = w;
    }
    if(height > h) {
        width *= h/height;
        height = h;
    }
    var i = paper.image(imageSrc, x+w/2-width/2, y+h/2-height/2, width, height);
    i.node.onclick = onclickEvent;
    return i;
};

/**
 *
 * @param label : text to print
 * @param x : X position
 * @param y : Y position
 * @param w : width
 * @param h : height
 * @param rgbCadre : rgb color for rectangle
 * @param bgColor : background color for rectangle
 * @param textHeight : number, taille de la police
 * @param font
 * @returns {{content, cadre}} : SVG/Raphael items for text & cadre
 */
var displayText = function (label, x, y, w, h, rgbCadre, bgColor, textHeight, font) {
    var content = autoAdjustText(label, x, y, w, h, textHeight, font).text;

    var cadre = paper.rect(x, y, w, h, 25).attr({fill: bgColor, stroke: rgbCadre});
    content.toFront();

    return {content:content, cadre:cadre};
};

/**
 * Introduit des \n dans une chaine pour éviter qu'elle dépasse une certaine largeur.
 * @param content: text to print
 * @param x : X position
 * @param y : Y position
 * @param w : width
 * @param h : height
 * @param fontSize
 * @param font
 */
var autoAdjustText = function (content, x, y, w, h, fontSize, font) {
    var t = paper.text(x+w/2, y+h/2, "");
    var fontSize = fontSize;

    var words = content.split(" ");
    var tempText = "";
    var margin = 10;

    font && t.attr("font-family", font);

    t.attr("font-size", fontSize);
    // add text word by word
    for (var i = 0; i < words.length; i++) {
        // set text to test the BBox.width
        t.attr("text", tempText + " " + words[i]);
        // test if DOESN'T fit in the line
        if (t.getBBox().width > w - margin) {
            // temporary string to store the word in a new line
            var tmpStr = tempText + "\n" + words[i];
            t.attr("text", tmpStr);
            // test if the whole word can fit in a line
            if (t.getBBox().width > w - margin) {
                // we don't need the tmpStr anymore
                // add a space before the problematic word
                tempText += " ";
                // longWord is the word too long to fit in a line
                var longWord = words[i];
                // goes character by character
                for (var j = 0; j < longWord.length; j++) {
                    // set text to test the BBox.width
                    t.attr("text", tempText + " " + longWord.charAt(j));
                    // check if we can add an additional character in this line
                    if (t.getBBox().width > w - margin) {
                        // we can't: break line, add the character
                        tempText += "-\n" + longWord.charAt(j);
                    } else {
                        // we can, add the character
                        tempText += longWord.charAt(j);
                    }
                }
            }
            // it fits in a new line
            else {
                // we add the word in a new line
                var tmpText = tempText;
                tempText += "\n" + words[i];
                t.attr("text", tmpStr);
                // test if it fits in height
                if (t.getBBox().height > h - margin) {
                    // it doesn't : break
                    tempText = tmpText.substring(0, tmpText.length-3) + "...";
                    break;
                }
            }
        } else {
            // it fits in the current line
            tempText += " " + words[i];
        }
    }

    t.attr("text", tempText.substring(1));
    var finalHeight = t.getBBox().height;
    return {finalHeight: finalHeight, text:t};
};
/**
 *
 * @param text
 * @param imageSrc
 * @param x
 * @param y
 * @param w
 * @param fontSize
 * @param image
 * @param font
 * @returns {*}
 */
var getHeight = function (text, imageSrc, x, y, w, fontSize, image, font) {
    var formatedText;
    var margin = 10;
    if (text && imageSrc) {
        formatedText = autoAdjustText(text, x, y, w, 0, fontSize, font);
        formatedText.text.remove();
        return formatedText.finalHeight + 3*margin + displayImage(imageSrc, image, x, y, w);
    } else if(text && !imageSrc) {
        formatedText = autoAdjustText(text, x, y, w, 0, fontSize, font);
        formatedText.text.remove();
        return formatedText.finalHeight + 2*margin;
    } else if(!text && imageSrc) {
        return displayImage(imageSrc, image, x, y, w);
    }
    return 0
};

/**
 *
 * @param x
 * @param y
 * @param w
 * @param h
 * @param thicknessPercentage
 */

var drawPlus =function(x,y,w,h,thicknessPercentage) {
    var baseWidth=500;
    var baseHeight=500;
    var tempWidth=baseWidth;
    var tempHeight=baseHeight;
    var scale=1;
    var thickness=0;

    if((!thicknessPercentage)||(thicknessPercentage>=1)){
        thickness=(((baseHeight+baseWidth)/2)*0.3);
    }
    else
    {
        thickness=((baseHeight+baseWidth)/2)*thicknessPercentage;
    }

    var path="M "+(x-(thickness/2))+","+(y+(thickness/2))+" "+

            "L "+(x-(baseWidth/2))+","+(y+(thickness/2))+" "+
            "L "+(x-(baseWidth/2))+","+(y-(thickness/2))+" "+
            "L "+(x-(thickness/2))+","+(y-(thickness/2))+" "+
            "L "+(x-(thickness/2))+","+(y-(baseHeight/2))+" "+
            "L "+(x+(thickness/2))+","+(y-(baseHeight/2))+" "+
            "L "+(x+(thickness/2))+","+(y-(thickness/2))+" "+

            "L "+(x+(baseWidth/2))+","+(y-(thickness/2))+" "+
            "L "+(x+(baseWidth/2))+","+(y+(thickness/2))+" "+
            "L "+(x+(thickness/2))+","+(y+(thickness/2))+" "+
            "L "+(x+(thickness/2))+","+(y+(baseHeight/2))+" "+
            "L "+(x-(thickness/2))+","+(y+(baseHeight/2))+" "+
            "L "+(x-(thickness/2))+","+(y+(thickness/2))+" ";

    var plus=paper.path(path);
    while((w<tempHeight)||(h<tempWidth))
    {
        scale-=0.1;
        tempHeight=baseHeight*scale;
        tempWidth=baseWidth*scale;
    }
    plus.scale(scale);
    plus.attr('fill','black');
    return plus;
};

/**
 *
 * @param x
 * @param y
 * @param w
 * @param h
 * @param side
 * @param handler
 */

var drawArrow = function(x,y,w,h,side,handler){
    // x [55;295] y [10;350]
    var baseWidth=160;//295-55;
    var baseHeight=300;//385-10;
    var scale=1;
    var arrowSet=paper.set();
    var path = "M "+(x)+","+(y)+" "+
        "L "+(-100+x)+","+(100+y)+" "+
        "C "+(-140+x)+","+(140+y)+" "+(-85+x)+","+(185+y)+" "+(-50+x)+","+(150+y)+" "+
        "L "+(60+x)+","+(40+y)+" "+
        "C "+(95+x)+","+(5+y)+" "+(95+x)+","+(-5+y)+" "+(60+x)+","+(-40+y)+" "+
        "L "+(-50+x)+","+(-150+y)+" "+
        "C "+(-85+x)+","+(-190+y)+" "+(-145+x)+","+(-140+y)+" "+(-100+x)+","+(-100+y)+" "+
        "L "+(x)+","+(y)+" ";

    var chevron=paper.path(path);
    chevron.tempWidth=baseWidth;
    chevron.tempHeight=baseHeight;
    arrowSet.push(chevron);


    if(handler) {
        chevron.attr({"type":"path","stroke":"none","fill":"black"});
        chevron.node.onclick=handler;
    }else{
        chevron.attr({"type":"path","stroke":"none","fill":"grey"});
    }
    if(side==="left") {
        //arrowSet.transform("...r" + 180 + " "+x+" "+y);/// coordonnées globales ici!
    }
    while((w<chevron.tempWidth)||(h<chevron.tempHeight)) {
        scale-=0.1;
        chevron.tempWidth=(baseWidth*scale);
        chevron.tempHeight=(baseHeight*scale);
    }
    var s="s"+scale;
    //arrowSet.scale(scale);
    arrowSet._scale=scale;
    //arrowSet.transform('...'+s)
    return arrowSet;
};




Function.prototype.clone = function() {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

/// Modifying Raphael.js prototype to add Local/GlobalPoint to various elements

/// Shape, commun à tout le monde



function getPoint(args) {
    if (args[0]!==undefined && (typeof args[0]==='number')) {
        return {x:args[0], y:args[1]}
    }
    else {
        return arguments[0];
    }
}


papers.paper.globalToLocal = function() {
    var point = getPoint(arguments);
    var pt={
        x:point.x-this.x,
        y:point.y-this.y
    };
        return pt;

};
papers.paper.localToGlobal = function() {
    var point = getPoint(arguments);
        return {
            x:point.x+this.x,
            y:point.y+this.y
        };

};
papers.paper.inside = function(x, y) {
    var local = this.localToGlobal(x, y);
    return local.x>=0 && local.x<=this.width && local.y>=0 && local.y<=this.height;
};


Raphael.st.oldPush=function(){};
Raphael.st.oldPush=Raphael.st.push.clone();
Raphael.st.parent=papers.paper;
Raphael.st.push = function() {
    var self=this;
    var tab=Array.prototype.slice.call(arguments);

    tab.forEach(function(obj){

        if(self._transform && obj.type!=='set'){
            obj.transform(self._transform);
            console.log('\ntransfo effectuée!');
        }
        obj.parent=self;
        self.oldPush(obj);
    });
};
Raphael.st.x=0;
Raphael.st.y=0;
Raphael.st.hasBeenTransformed=false;
Raphael.st.oldTransform=Raphael.st.transform.clone();
Raphael.st.transform=function(str){
    var pointless=str.split('...');
  var type=pointless[pointless.length-1].charAt(0);
  var tmp=  str.split(type);
    var vals=tmp[1].split(',');
    this.x=parseInt(vals[0]);
    this.y=parseInt(vals[1]);
    this.hasBeenTransformed=true;
    this.oldTransform(str);

};

Raphael.st.positionSet=function(x,y,dx,dy){

    var point=this.globalToLocal(x,y);
    var t='t'+(point.x+dx)+','+(point.y+dy);
    this.transform('...'+t);
    this._transform=t;
}

Raphael.st.globalToLocal = function() {
    var point = getPoint(arguments);
    point = {x:point.x-this.x, y:point.y-this.y};
    return this.parent ? this.parent.globalToLocal(point.x,point.y) : null;
};

Raphael.st.localToGlobal = function() {
    var point = getPoint(arguments);
    point = this.parent ? this.parent.localToGlobal(point.x,point.y) : null;
    if (point) {
        point = {x:point.x+this.x , y:this.y+point.y };
    }else{
        point = getPoint(arguments);
    }
    return point;
};

//rect
Raphael.el.parent=papers.paper;

Raphael.el.globalToLocal = function() {
    var point = getPoint(arguments);
    //return this.parent.globalToLocal(point.x+this.attr('x'), point.y+this.attr('y'));
    return this.parent.globalToLocal(point.x, point.y);
};
Raphael.el.localToGlobal = function() {
    var point = getPoint(arguments);
    point = this.parent.localToGlobal(point.x,point.y);
    //return point ? {x:point.x-this.attr('x'), y:point.y-this.attr('y')} : null;
    return point ? {x:point.x-0, y:point.y-0} : null;// la référence est au centre du rectangle, pas en haut à gauche
};
/*
Raphael.rect.inside = function(x, y) {
    var local = this.localToGlobal(x, y);
    return local.x>=-this.width/2 && local.x<=this.width/2
        && local.y>=-this.height/2 && local.y<=this.height/2;
};
*/



function insidePolygon(x, y, element) {
    //var rand = Math.random()*100;
    //return (rand >90);

    var local = element.globalToLocal(x, y);
    var width = element.attrs.width ? element.attrs.width : element.getBBox().width;
    var height = element.attrs.height ? element.attrs.height : element.getBBox().height;

    return local.x>=-width/2 && local.x<=width/2
        && local.y>=-height/2 && local.y<=height/2;
}

Raphael.st.getTarget=function(clientX,clientY){
    var el = {};
    for(var i = 0; i<this.items.length; i++) {
        el = this[i].getTarget(clientX,clientY);
        if(el) {
            return el;
        }
    }
    return null;
};

Raphael.el.getTarget=function(clientX,clientY){
    var inside = insidePolygon(clientX,clientY,this);
    if (inside){
        console.log("FOUND YOU");
        return this;
    }
    return null;
};