/**
 * Created by qde3485 on 29/02/16.
 */

var paper = Raphael(0, 0, 1500, 1500);

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

    var diffH = (content.getBBox().height - h)/2;
    if(diffH > 0) {
        h = content.getBBox().height;
    }
    else {
        diffH = 0;
    }

    var cadre = paper.rect(x, y-diffH, w, h).attr({fill: bgColor, stroke: rgbCadre, 'stroke-width': 5});
    content.toFront();
    return {content, cadre};
};
/**
 *
 * @param content: text to print
 * @param x : X position
 * @param y : Y position
 * @param w : width
 * @param h : MINIMUM height (the final height can be higher)
 */
var autoAdjustText = function (content, x, y, w, h) {
    var t = paper.text(x+w/2, y+h/2).attr("font-size", 20);
    var words = content.split(" ");
    var tempText = "";
    var margin = 10;

    // add text word by word
    for (var i=0; i<words.length; i++) {
        // set text to test the BBox.width
        t.attr("text", tempText + " " + words[i]);
        // test if DOESN'T fit in the line
        if (t.getBBox().width > w-margin) {
            // temporary string to store the word in a new line
            var tmpStr = tempText + "\n" + words[i];
            t.attr("text", tmpStr);
            // test if the whole word can fit in a line
            if(t.getBBox().width > w-margin) {
                // we don't need the tmpStr anymore
                // add a space before the problematic word
                tempText += " ";
                // longWord is the word too long to fit in a line
                var longWord = words[i];
                // goes character by character
                for(var j=0; j< longWord.length; j++) {
                    // set text to test the BBox.width
                    t.attr("text", tempText + " " + longWord.charAt(j));
                    // check if we can add an additional character in this line
                    if (t.getBBox().width > w-margin) {
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
    return t;
};