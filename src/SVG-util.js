/**
 * Created by qde3485 on 29/02/16.
 */

//var paper = Raphael(0, 0, 1500, 1500);


var displayImageWithTitle = function (label, imageSrc, x, y, w, h, rgbCadre, bgColor) {
    var margin = 5;
    var image = displayImage(imageSrc, x+margin, y+margin, w-2*margin, h*0.85-2*margin);
    var text = autoAdjustText(label, x, y+h*0.85, w, h*0.15);
    var cadre = paper.rect(x, y, w, h).attr({fill: bgColor, stroke: rgbCadre});
    text.toFront();
    return {cadre: cadre, image: image,  text: text};
};

/**
 *
 * @param imageSrc
 * @param x
 * @param y
 * @param w
 * @param h
 */
var displayImage = function (imageSrc, x, y, w, h) {
    var img = new Image();
    var i = {};
    img.src = imageSrc;
    img.onload = function () {
        var width = img.width;
        var height = img.height;
        if(width > w) {
            height *= w/width;
            width = w;
        }
        if(height > h) {
            width *= h/height;
            height = h;
        }
        i = paper.image(imageSrc, x+w/2-width/2, y+h/2-height/2, width, height);
    };
    return function () {
        return i;
    }
};

var displayImageWithEvent = function (imageSrc, x, y, w, h, onclickEvent) {
    var img = new Image();
    var i = {};
    img.src = imageSrc;
    img.onload = function () {
        var width = img.width;
        var height = img.height;
        if(width > w) {
            height *= w/width;
            width = w;
        }
        if(height > h) {
            width *= h/height;
            height = h;
        }
        i = paper.image(imageSrc, x+w/2-width/2, y+h/2-height/2, width, height);
        i.node.onclick = onclickEvent;
    };
    return function () {
        return i;
    }
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
 * @returns {{content, cadre}} : SVG/Raphael items for text & cadre
 */
var displayText = function (label, x, y, w, h, rgbCadre, bgColor) {
    var content = autoAdjustText(label, x, y, w, h);

    var cadre = paper.rect(x, y, w, h).attr({fill: bgColor, stroke: rgbCadre});
    content.toFront();

    return {content:content, cadre:cadre};
};

/**
 *
 * @param content: text to print
 * @param x : X position
 * @param y : Y position
 * @param w : width
 * @param h : height
 */
var autoAdjustText = function (content, x, y, w, h) {
    var t = paper.text(x+w/2, y+h/2, "");

    var fontSize = 20;

    var words = content.split(" ");
    var tempText = "";
    var margin = 10;

    do {
        tempText = "";
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
                    tempText += "\n" + words[i];
                }
            } else {
                // it fits in the current line
                tempText += " " + words[i];
            }
        }
        fontSize --;
    } while(t.getBBox().height > h);

    t.attr("text", tempText.substring(1));
    return t;
};