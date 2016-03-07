/**
 * Created by qde3485 on 29/02/16.
 */

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
 * @param policeSize
 * @returns {{cadre: *, image, text}}
 */
var displayImageWithTitle = function (label, imageSrc, imageObj, x, y, w, h, rgbCadre, bgColor, policeSize) {
    var margin = 10;

    var text = autoAdjustText(label, x, y+h-3*margin, w, null, policeSize).text;
    var textHeight = text.getBBox().height;
    text.animate({y:y+h-2*margin-textHeight/2}, 0);

    var image = displayImage(imageSrc, imageObj, x+margin, y+margin, w-2*margin, h-textHeight-3*margin);
    var cadre = paper.rect(x, y, w, h).attr({fill: bgColor, stroke: rgbCadre});
    image.image.toFront();
    text.toFront();
    return {cadre: cadre, image: image.image,  text: text};
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
    return {image:paper.image(imageSrc, x+w/2-width/2, y+h/2-height/2, width, height), height:height};
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
 * @returns {{content, cadre}} : SVG/Raphael items for text & cadre
 */
var displayText = function (label, x, y, w, h, rgbCadre, bgColor, textHeight) {
    var content = autoAdjustText(label, x, y, w, h, textHeight).text;

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
 * @param textHeight : number, taille de la police
 */
var autoAdjustText = function (content, x, y, w, h, textHeight) {
    var t = paper.text(x+w/2, y+h/2, "");
    var fontSize = textHeight;

    var words = content.split(" ");
    var tempText = "";
    var margin = 10;

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

    t.attr("text", tempText.substring(1));
    var finalHeight = t.getBBox().height;
    return {finalHeight: finalHeight, text:t};
};

var getHeight = function (text, imageSrc, x, y, w, textHeight, image) {
    var formatedText;
    var margin = 10;
    if (text && imageSrc) {
        formatedText = autoAdjustText(text, x, y, w, 0, textHeight);
        formatedText.text.remove();
        return formatedText.finalHeight + 3*margin + displayImage(imageSrc, image, x, y, w);
    } else if(text && !imageSrc) {
        formatedText = autoAdjustText(text, x, y, w, 0, textHeight);
        formatedText.text.remove();
        return formatedText.finalHeight + 2*margin;
    } else if(!text && imageSrc) {
        return displayImage(imageSrc, image, x, y, w);
    }
    return 0
};