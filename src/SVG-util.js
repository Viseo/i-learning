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
    var obj = {checkbox: new svg.Rect(size, size).color(myColors.none,2,myColors.black).position(x,y)};
    var onclickFunction = function () {
        sender.bCorrect = !sender.bCorrect;
        if(obj.checked) {
            sender.manipulator.last.remove(obj.checked);
        }
        sender.manipulator.last.remove(obj.checkbox);
        displayCheckbox(x, y, size, sender);
    };

    if(sender.bCorrect) {
        obj.checked = new svg.Path(x+size/2, y+size/2).move(x+.2*size,y+.4*size)
            .line(x+.2*size,y+.3*size).line(x+.4*size,y-.5*size)
            .color(myColors.black, 3, myColors.black);
        svg.addEvent(obj.checked,"click", onclickFunction);
        sender.manipulator.last.add(obj.checked);
    }
    sender.manipulator.last.add(obj.checkbox);
    svg.addEvent(obj.checkbox,"click", onclickFunction);

    return obj;
};


/**
 *
 * @param label
 * @param imageSrc
 * @param imageObj
 * @param w
 * @param h
 * @param rgbCadre
 * @param bgColor
 * @param fontSize
 * @param font
 * @param manipulator
 * @returns {{cadre: *, image, text}}
 */
var displayImageWithTitle = function (label, imageSrc, imageObj, w, h, rgbCadre, bgColor, fontSize, font, manipulator,previousImage) {

    var text = autoAdjustText(label, 0, 0, w, null, fontSize, font, manipulator).text;
    var textHeight = text.component.getBBox().height;
    text.position(0,(h-textHeight)/2);
    var newWidth,newHeight;
    newWidth=w-2*MARGIN;
    previousImage && (w===previousImage.width) && (newWidth=w);

    newHeight=h-textHeight-3*MARGIN;
    previousImage&& (h===previousImage.height)&&(newHeight=h);


    var image = displayImage(imageSrc, imageObj, newWidth, newHeight, manipulator);//
    image.image.position(0,-textHeight/2);
    var cadre = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(25, 25);
    manipulator.ordonator.set(0,cadre);
    manipulator.ordonator.set(1,image.image);
    manipulator.ordonator.set(2,text);

    return {cadre: cadre, image: image.image,  text: text};
};
/**
 *
 * @param imageSrc
 * @param imageObj
 * @param w
 * @param h
 * @param manipulator
 * @returns {{image: *, height: *, cadre}}
 */
var displayImageWithBorder = function (imageSrc, imageObj, w, h, manipulator) {
    var image = displayImage(imageSrc, imageObj, w-2*MARGIN, h, manipulator);//h-2*MARGIN
    var cadre = new svg.Rect(w, h).color(myColors.white,1,myColors.none);
    manipulator.ordonator.set(0,cadre);
    manipulator.ordonator.set(1,image.image);

    return {image:image.image, height:image.height, cadre:cadre};
};

/**
 *
 * @param imageSrc
 * @param image
 * @param w
 * @param h
 */
var displayImage = function (imageSrc, image, w, h, manipulator) {
    var width = image.width;
    var height = image.height;
    if(width > w) {
        height *= (w/width);
        width = w;
    }
    if(!h) {
        return height;
    }
    if(height > h) {
        width *= (h/height);
        height = h;
    }
    return {
        image: new svg.Image(imageSrc).dimension(width, height).position(0, 0),
        height: height
    };

};

/**
 *
 * @param label : text to print
 * @param w : width
 * @param h : height
 * @param rgbCadre : rgb color for rectangle
 * @param bgColor : background color for rectangle
 * @param textHeight : number, taille de la police
 * @param font
 * @param manipulator
 * @returns {{content, cadre}} : SVG/Raphael items for text & cadre
 */
var displayText = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator) {
    var content = autoAdjustText(label, 0, 0, w, h, textHeight, font, manipulator).text;
    var cadre = new svg.Rect(w, h).color(bgColor,1,rgbCadre).corners(25, 25);
    manipulator.ordonator.set(0, cadre);
    //manipulator.ordonator.set(1, content);
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
 * @param manipulator
 */
var autoAdjustText = function (content, x, y, w, h, fontSize, font, manipulator) {
    var t = new svg.Text("text");
    manipulator.ordonator.set(6, t);
    var words = content.split(" ");
    var tempText = "";

    t.font(font ? font : "arial", fontSize ? fontSize : 20);

    // add text word by word
    for (var i = 0; i < words.length; i++) {
        // set text to test the BBox.width
        t.message(tempText + " " + words[i]);
        // test if DOESN'T fit in the line
        if (t.component.getBBox().width > w - MARGIN) {
            //Comment 2 next lines to add BreakLine
            tempText = tempText.substring(0, tempText.length-3) + "...";
            break;
            // temporary string to store the word in a new line
            var tmpStr = tempText + "\n" + words[i];
            t.message(tmpStr);
            // test if the whole word can fit in a line
            if (t.component.getBBox().width > w - MARGIN) {
                // we don't need the tmpStr anymore
                // add a space before the problematic word
                tempText += " ";
                // longWord is the word too long to fit in a line
                var longWord = words[i];
                // goes character by character
                for (var j = 0; j < longWord.length; j++) {
                    // set text to test the BBox.width
                    t.message(tempText + " " + longWord.charAt(j));
                    // check if we can add an additional character in this line
                    if (t.component.getBBox().width > w - MARGIN) {
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
                t.message(tmpStr);
                // test if it fits in height
                if (t.component.getBBox().height > h - MARGIN) {
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

    t.message(tempText.substring(1));
    var finalHeight = t.component.getBBox().height;
    t.position(0,(finalHeight-fontSize/2)/2); // finalHeight/2 ??
    return {finalHeight: finalHeight, text:t};
};

/**
 *
 * @param x
 * @param y
 * @param w
 * @param h
 */

var drawPlus =function(x,y,w,h) {
    var baseWidth=w;
    var baseHeight=h;
    var thickness=(((baseHeight+baseWidth)/2)*0.3);

    var path = new svg.Path(x,y).move(x-(thickness/2), y+(thickness/2))
        .line(x-(baseWidth/2), y+(thickness/2))
        .line(x-(baseWidth/2), y-(thickness/2))
        .line(x-(thickness/2), y-(thickness/2))
        .line(x-(thickness/2), y-(baseHeight/2))
        .line(x+(thickness/2), y-(baseHeight/2))
        .line(x+(thickness/2), y-(thickness/2))

        .line(x+(baseWidth/2), y-(thickness/2))
        .line(x+(baseWidth/2), y+(thickness/2))
        .line(x+(thickness/2), y+(thickness/2))
        .line(x+(thickness/2), y+(baseHeight/2))
        .line(x-(thickness/2), y+(baseHeight/2))
        .line(x-(thickness/2), y+(thickness/2));

    path.color(myColors.black);
    return path;
};

/**
 *
 * @param x
 * @param y
 * @param w
 * @param h
 * @param handler
 */

var drawArrow = function(x,y,w,h,handler,manipulator){
    // x [55;295] y [10;350]
    var baseWidth=160;//295-55;
    var baseHeight=300;//385-10;
    var arrowManipulator = manipulator;

    var chevron = new svg.Path(x, y).line(x-100, y+100)
        .cubic(x-140, y+140, x-85, y+185, x-50, y+150)
        .line(x+60, y+40)
        .cubic(x+95, y+5, x+95, y-5, x+60, y-40)
        .line(x-50, y-150)
        .cubic(x-85, y-190, x-145, y-140, x-100, y-100)
        .line(x, y);

    //var path = "M "+(x)+","+(y)+" "+
    //    "L "+(-100+x)+","+(100+y)+" "+
    //    "C "+(-140+x)+","+(140+y)+" "+(-85+x)+","+(185+y)+" "+(-50+x)+","+(150+y)+" "+
    //    "L "+(60+x)+","+(40+y)+" "+
    //    "C "+(95+x)+","+(5+y)+" "+(95+x)+","+(-5+y)+" "+(60+x)+","+(-40+y)+" "+
    //    "L "+(-50+x)+","+(-150+y)+" "+
    //    "C "+(-85+x)+","+(-190+y)+" "+(-145+x)+","+(-140+y)+" "+(-100+x)+","+(-100+y)+" "+
    //    "L "+(x)+","+(y)+" ";

    chevron.tempWidth=baseWidth;
    chevron.tempHeight=baseHeight;
    arrowManipulator.last.add(chevron);

    if(handler) {
        chevron.color(myColors.black);
        svg.addEvent(chevron, "click", handler);
    }else{
        chevron.color(myColors.grey);
        if(chevron.onClick!==null){
            svg.removeEvent(chevron,'click',chevron.onClick);
        }
    }

    if(chevron.tempWidth> w) {
        chevron.tempHeight *= w/chevron.tempWidth;
        chevron.tempWidth = w;
    }
    if(chevron.tempHeight > h) {
        chevron.tempWidth *= h/chevron.tempHeight;
        chevron.tempHeight = h;
    }

    arrowManipulator.scalor.scale(chevron.tempHeight/baseHeight);
    //return arrowManipulator;
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


//papers.paper.globalToLocal = function() {
//    var point = getPoint(arguments);
//    var pt={
//        x:point.x-this.x,
//        y:point.y-this.y
//    };
//        return pt;
//
//};
//papers.paper.localToGlobal = function() {
//    var point = getPoint(arguments);
//        return {
//            x:point.x+this.x,
//            y:point.y+this.y
//        };
//
//};
//papers.paper.inside = function(x, y) {
//    var local = this.localToGlobal(x, y);
//    return local.x>=0 && local.x<=this.width && local.y>=0 && local.y<=this.height;
//};
//
//
//Raphael.st.oldPush=function(){};
//Raphael.st.oldPush=Raphael.st.push.clone();
//Raphael.st.parent=papers.paper;
//Raphael.st.push = function() {
//    var self=this;
//    var tab=Array.prototype.slice.call(arguments);
//
//    tab.forEach(function(obj){
//
//        if(self._transform && obj.type!=='set'){
//            obj.transform(self._transform);
//            console.log('\ntransfo effectuée!');
//        }
//        obj.parent=self;
//        self.oldPush(obj);
//    });
//};
//Raphael.st.x=0;
//Raphael.st.y=0;
//Raphael.st.hasBeenTransformed=false;
//Raphael.st.oldTransform=Raphael.st.transform.clone();
//Raphael.st.transform=function(str){
//    var pointless=str.split('...');
//  var type=pointless[pointless.length-1].charAt(0);
//  var tmp=  str.split(type);
//    var vals=tmp[1].split(',');
//    this.x=parseInt(vals[0]);
//    this.y=parseInt(vals[1]);
//    this.hasBeenTransformed=true;
//    this.oldTransform(str);
//
//};
//
//Raphael.st.positionSet=function(x,y,dx,dy){
//
//    var point=this.globalToLocal(x,y);
//    var t='t'+(point.x+dx)+','+(point.y+dy);
//    this.transform('...'+t);
//    this._transform=t;
//}
//
//Raphael.st.globalToLocal = function() {
//    var point = getPoint(arguments);
//    point = {x:point.x-this.x, y:point.y-this.y};
//    return this.parent ? this.parent.globalToLocal(point.x,point.y) : null;
//};
//
//Raphael.st.localToGlobal = function() {
//    var point = getPoint(arguments);
//    point = this.parent ? this.parent.localToGlobal(point.x,point.y) : null;
//    if (point) {
//        point = {x:point.x+this.x , y:this.y+point.y };
//    }else{
//        point = getPoint(arguments);
//    }
//    return point;
//};
//
////rect
//Raphael.el.parent=papers.paper;
//
//Raphael.el.globalToLocal = function() {
//    var point = getPoint(arguments);
//    //return this.parent.globalToLocal(point.x+this.attr('x'), point.y+this.attr('y'));
//    return this.parent.globalToLocal(point.x, point.y);
//};
//Raphael.el.localToGlobal = function() {
//    var point = getPoint(arguments);
//    point = this.parent.localToGlobal(point.x,point.y);
//    //return point ? {x:point.x-this.attr('x'), y:point.y-this.attr('y')} : null;
//    return point ? {x:point.x-0, y:point.y-0} : null;// la référence est au centre du rectangle, pas en haut à gauche
//};
///*
//Raphael.rect.inside = function(x, y) {
//    var local = this.localToGlobal(x, y);
//    return local.x>=-this.width/2 && local.x<=this.width/2
//        && local.y>=-this.height/2 && local.y<=this.height/2;
//};
//*/
//
//
//
//function insidePolygon(x, y, element) {
//    //var rand = Math.random()*100;
//    //return (rand >90);
//
//    var local = element.globalToLocal(x, y);
//    var width = element.attrs.width ? element.attrs.width : element.getBBox().width;
//    var height = element.attrs.height ? element.attrs.height : element.getBBox().height;
//
//    return local.x>=-width/2 && local.x<=width/2
//        && local.y>=-height/2 && local.y<=height/2;
//}
//
//Raphael.st.getTarget=function(clientX,clientY){
//    var el = {};
//    for(var i = 0; i<this.items.length; i++) {
//        el = this[i].getTarget(clientX,clientY);
//        if(el) {
//            return el;
//        }
//    }
//    return null;
//};
//
//Raphael.el.getTarget=function(clientX,clientY){
//    var inside = insidePolygon(clientX,clientY,this);
//    if (inside){
//        console.log(this);
//        return this;
//    }
//    return null;
//};