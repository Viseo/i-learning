/**
 * Created by TDU3482 on 26/04/2016.
 */


///////// SVG-global-handler.js //////////////////
/**
 * Created by ACA3502 on 23/03/2016.
 */
var svg;

if(typeof SVG != "undefined") {
    if(!svg) {
        svg = new SVG();
    }
}

function setSvg(_svg) {
    svg = _svg;
    // call setSvg on modules
}

if(typeof exports != "undefined") {
    exports.setSvg = setSvg;
}

function SVGGlobalHandler() {
    Manipulator = function (sourceObject) {
        var self = this;
        self.parentObject = sourceObject;
        self.translator = new svg.Translation(0, 0);
        self.translator.parentManip = self;
        self.rotator = new svg.Rotation(0);
        self.rotator.parentManip = self;
        self.scalor = new svg.Scaling(1);
        self.scalor.parentManip = self;
        self.ordonator = new svg.Ordered(10);
        self.ordonator.parentManip = self;
        self.translator.add(self.rotator.add(self.scalor.add(self.ordonator)));
        self.last = self.scalor;
        self.first = self.translator;


    };

    Drawings = function (w, h, anchor) {
        var self = this;

        !anchor && (anchor = "content");
        self.drawing = new svg.Drawing(w, h).show(anchor).position(0, 0);
        self.drawing.manipulator = new Manipulator(self);

        //self.piste = new svg.Drawing(w, h).show("content").position(-w, -h);
        //self.piste.manipulator = new Manipulator(self);
        //self.glass = new svg.Drawing(w, h).show("content").position(w, h);
        //self.glass.manipulator = new Manipulator(self);

        //self.glass.add(self.glass.manipulator.translator);
        //self.glass.manipulator.last.add(self.glass.area);
        //self.piste.add(self.piste.manipulator.translator);
        //self.drawing.manipulator.last.add(self.piste).add(self.glass);
        //self.glass.area.color([255,255,255]).opacity(0.001);

        //Pour la glace et la piste apres Refactor
        //self.piste = new svg.Drawing(w, h).show("content").position(0, 0);
        self.piste = new Manipulator(self);
        self.glass = new svg.Rect(w, h).position(w / 2, h / 2).opacity(0.001);
        self.drawing.add(self.drawing.manipulator.translator);
        self.drawing.manipulator.ordonator.set(8, self.piste.first).set(9, self.glass);


        var onmousedownHandler = function (event) {
            //self.paper.forEach(function (el) {
            //    console.log(el.type);
            //});
            document.activeElement.blur();
            self.target = self.drawing.getTarget(event.clientX, event.clientY);
            self.drag = self.target;
            // Rajouter des lignes pour target.bordure et target.image si existe ?
            if (self.target && self.target.component.eventHandlers && self.target.component.eventHandlers.mousedown) {
                self.target.component.eventHandlers.mousedown(event);
            }
        };

        svg.addEvent(self.glass, "mousedown", onmousedownHandler);

        var onmousemoveHandler = function (event) {
            self.target = self.drag || self.drawing.getTarget(event.clientX, event.clientY);
            if (self.target && self.target.component.eventHandlers && self.target.component.eventHandlers.mousemove) {
                self.target.component.eventHandlers.mousemove(event);
            }
        };

        svg.addEvent(self.glass, "mousemove", onmousemoveHandler);

        var ondblclickHandler = function (event) {
            self.target = self.drawing.getTarget(event.clientX, event.clientY);
            if (self.target && self.target.component.eventHandlers && self.target.component.eventHandlers.dblclick) {
                self.target.component.eventHandlers.dblclick(event);
            }
        };
        svg.addEvent(self.glass, "dblclick", ondblclickHandler);

        var onmouseupHandler = function (event) {
            self.target = self.drag || self.drawing.getTarget(event.clientX, event.clientY);
            if (self.target) {
                if (self.target.component.eventHandlers && self.target.component.eventHandlers.mouseup) {
                    self.target.component.eventHandlers.mouseup(event);
                }
                if (self.target.component.eventHandlers && self.target.component.eventHandlers.click) {
                    self.target.component.eventHandlers.click(event);
                }
                if (self.target.component.target && self.target.component.target.eventHandlers && self.target.component.target.eventHandlers.mouseup) {
                    self.target.component.target.eventHandlers.mouseup(event);
                }
                if (self.target.component.target && self.target.component.target.eventHandlers && self.target.component.target.eventHandlers.click) {
                    self.target.component.target.eventHandlers.click(event);
                }
            }
            self.drag = null;
        };
        svg.addEvent(self.glass, "mouseup", onmouseupHandler);


        var onmouseoutHandler = function (event) {
            if (self.drag && self.drag.component.eventHandlers && self.drag.component.eventHandlers.mouseup) {
                self.target.component.eventHandlers.mouseup(event);
            }
            self.drag = null;
        };
        svg.addEvent(self.glass, "mouseout", onmouseoutHandler);
    };


    svg.Handler.prototype.flush = function () {
        var self = this;
        self.children.forEach(function (e) {
            if (e instanceof svg.Handler) {
                e.flush();
            }
            else {
                if (self instanceof svg.Ordered) {
                    var index = self.children.indexOf(e);
                    self.unset(index);
                }
                else {
                    self.remove(e);
                }
            }
        });
    };

    ImageController = function (imageRuntime) {
        return imageRuntime || {
                getImage: function (imgUrl, onloadHandler) {
                    var image = new Image();
                    image.src = imgUrl;
                    image.onload = onloadHandler;
                    return image;
                }
            };
    };

    AsyncTimerController = function (asyncTimerRuntime) {
        return asyncTimerRuntime || {
                interval: function (handler, timer) {
                    return setInterval(handler, timer);
                },
                clearInterval: function (id) {
                    clearInterval(id);
                },
                timeout: function (handler, timer) {
                    return setTimeout(handler, timer);
                }
            };
    };

}

///////////// end of SVG-global-handler.js ////////////////////


//////////// SVG-util.js ////////////////////////

function SVGUtil() {
    /**
     * Created by qde3485 on 29/02/16.
     */

        //var clone = function (object) {
        //    return JSON.parse(JSON.stringify(object));
        //};


    getComplementary = function (tab) {
        return [255 - tab[0], 255 - tab[1], 255 - tab[2]];
    };

    /**
     *
     * @param x
     * @param y
     * @param size
     * @param sender
     */
//var displayCheckbox = function (x, y, size, sender) {
//    var obj = {checkbox: new svg.Rect(size, size).color(myColors.white, 2, myColors.black).position(x, y)};
//}

    onclickFunction = function (event) {
        var target = drawing.getTarget(event.clientX, event.clientY);
        var sender = null;
        target.answerParent && (sender = target.answerParent);
        sender.linkedAnswer.correct = !sender.correct;
        sender.correct = !sender.correct;
        sender.correct && drawPathChecked(sender, sender.x, sender.y, sender.size);
        updateAllCheckBoxes(sender);
    };

    checkAllCheckBoxes = function (sender) {
        var allNotChecked = true;
        sender.parent.linkedQuestion.rightAnswers = [];
        sender.parent.tabAnswer.forEach(function (answer) {
            if (answer instanceof AnswerElement) {
                if (answer.correct) {
                    allNotChecked = false;
                    //rightAnswers.push(answer.linkedAnswer);
                    answer.linkedAnswer.correct = true;
                    sender.parent.linkedQuestion.rightAnswers.push(answer.linkedAnswer);
                }
            }
        });

        return allNotChecked;
    };

    drawCheck = function (x, y, size) {
        return new svg.Path(x, y).move(x - .3 * size, y - .1 * size)
            .line(x - .1 * size, y + .2 * size).line(x + .3 * size, y - .3 * size)
            .color(myColors.none, 3, myColors.black);
    };

    drawPathChecked = function (sender, x, y, size) {
        svg.addEvent(sender.obj.checkbox, "click", onclickFunction);
        sender.obj.checked = drawCheck(x, y, size);
        svg.addEvent(sender.obj.checked, "click", onclickFunction);
        sender.manipulator.ordonator.set(8, sender.obj.checked);
    };

    updateAllCheckBoxes = function (sender) {
        sender.parent.tabAnswer.forEach(function (answer) {
            if (answer instanceof AnswerElement && answer.obj.checkbox) {
                var allNotChecked = checkAllCheckBoxes(sender);
                if (answer.parent.simpleChoice && !answer.correct && !allNotChecked) {
                    answer.obj.checkbox.color(myColors.white, 2, myColors.lightgrey);
                    //svg.addEvent(answer.checkbox.checkbox, "click", onclickFunction);
                    svg.removeEvent(answer.obj.checkbox, "click", onclickFunction);
                } else {
                    answer.obj.checkbox.color(myColors.white, 2, myColors.black);
                    svg.addEvent(answer.obj.checkbox, "click", onclickFunction);
                }
                !answer.correct && answer.manipulator.ordonator.unset(8);
            }
        });
    };

    /**
     *
     * @param x
     * @param y
     * @param size
     * @param sender
     */
    displayCheckbox = function (x, y, size, sender) {
        var obj = {checkbox: new svg.Rect(size, size).color(myColors.white, 2, myColors.black).position(x, y)};
        sender.obj.checkbox = obj.checkbox;
        sender.x = x;
        sender.y = y;
        sender.size = size;

        var allNotChecked = true;

        allNotChecked = checkAllCheckBoxes(sender);
        if (sender.parent.simpleChoice && !sender.correct && !allNotChecked) {
            sender.obj.checkbox.color(myColors.white, 2, myColors.lightgrey);
        } else {
            sender.obj.checkbox.color(myColors.white, 2, myColors.black);
            svg.addEvent(sender.obj.checkbox, "click", onclickFunction);
        }
        sender.manipulator.ordonator.set(7, sender.obj.checkbox);
        !sender.correct && sender.manipulator.ordonator.unset(8);
        sender.correct && drawPathChecked(sender, x, y, size);
        return sender.obj;
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
    displayImageWithTitle = function (label, imageSrc, imageObj, w, h, rgbCadre, bgColor, fontSize, font, manipulator, previousImage) {

        var text = autoAdjustText(label, 0, 0, w, null, fontSize, font, manipulator).text;
        var textHeight = (text.component.getBBox && text.component.getBBox().height) || text.component.target.getBBox().height;
        text.position(0, (h - textHeight) / 2);//w*1/6
        var newWidth, newHeight;
        newWidth = w - 2 * MARGIN;
        previousImage && (w === previousImage.width) && (newWidth = w);

        newHeight = h - textHeight - 3 * MARGIN;
        previousImage && (h === previousImage.height) && (newHeight = h);


        var image = displayImage(imageSrc, imageObj, newWidth, newHeight);//
        image.image.position(0, -textHeight / 2);
        var cadre = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(25, 25);
        manipulator.ordonator.set(0, cadre);
        manipulator.ordonator.set(1, text);
        manipulator.ordonator.set(2, image.image);


        return {cadre: cadre, image: image.image, content: text};
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
    displayImageWithBorder = function (imageSrc, imageObj, w, h, manipulator) {
        var image = displayImage(imageSrc, imageObj, w - 2 * MARGIN, h - 2 * MARGIN, manipulator);//h-2*MARGIN
        var cadre = new svg.Rect(w, h).color(myColors.white, 1, myColors.none).corners(25, 25);
        manipulator.ordonator.set(0, cadre);
        manipulator.ordonator.set(2, image.image);

        return {image: image.image, height: image.height, cadre: cadre};
    };

    /**
     *
     * @param imageSrc
     * @param image
     * @param w
     * @param h
     */
    displayImage = function (imageSrc, image, w, h) {
        var width = image.width;
        var height = image.height;
        if (width > w) {
            height *= (w / width);
            width = w;
        }
        if (!h) {
            return height;
        }
        if (height > h) {
            width *= (h / height);
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
    displayText = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator) {
        var content = autoAdjustText(label, 0, 0, w, h, textHeight, font, manipulator).text;
        var cadre = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(25, 25);
        manipulator.ordonator.set(0, cadre);
        return {content: content, cadre: cadre};
    };

    /**
     *
     * @param label : text to print
     * @param w : width
     * @param h : height
     * @param rgbCadre : rgb color for circle
     * @param bgColor : background color for circle
     * @param textHeight : number, taille de la police
     * @param font
     * @param manipulator
     * @returns {{content, cadre}} : SVG/Raphael items for text & cadre
     */
    displayTextWithCircle = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator) {
        var content = autoAdjustText(label, 0, 0, w, h, textHeight, font, manipulator).text;
        content.position(0, content.component.getBBox().height / 4);
        var cadre = new svg.Circle(w / 2).color(bgColor, 1, rgbCadre);
        manipulator.ordonator.set(0, cadre);
        return {content: content, cadre: cadre};
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
    displayTextWithoutCorners = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator) {
        var content = autoAdjustText(label, 0, 0, w, h, textHeight, font, manipulator).text;
        var cadre = new svg.Rect(w, h).color(bgColor, 1, rgbCadre);
        manipulator.ordonator.set(0, cadre);
        //manipulator.ordonator.set(1, content);
        return {content: content, cadre: cadre};
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
    autoAdjustText = function (content, x, y, w, h, fontSize, font, manipulator) {
        var t = new svg.Text("text");
        manipulator.ordonator.set(1, t);
        var words = content.split(" ");
        var tempText = "";
        var w = w * 5 / 6;

        t.font(font ? font : "arial", fontSize ? fontSize : 20);

        // add text word by word
        for (var i = 0; i < words.length; i++) {
            // set text to test the BBox.width
            t.message(tempText + " " + words[i]);
            // test if DOESN'T fit in the line
            if ((t.component.getBBox && t.component.getBBox().width > w) || (t.component.target && t.component.target.getBBox().width > w - MARGIN)) {
                //Comment 2 next lines to add BreakLine
                tempText = tempText.substring(0, tempText.length - 3) + "...";
                break;
                // temporary string to store the word in a new line
                var tmpStr = tempText + "\n" + words[i];
                t.message(tmpStr);
                // test if the whole word can fit in a line
                if (t.component.getBBox().width > w) {
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
                        if (t.component.getBBox().width > w) {
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
                        tempText = tmpText.substring(0, tmpText.length - 3) + "...";
                        break;
                    }
                }
            } else {
                // it fits in the current line
                tempText += " " + words[i];
            }
        }

        t.message(tempText.substring(1));
        var finalHeight = (t.component.getBBox && t.component.getBBox().height) || (t.component.target && t.component.target.getBBox().height);
        t.position(0, (finalHeight - fontSize / 2) / 2); // finalHeight/2 ??
        return {finalHeight: finalHeight, text: t};
    };

    /**
     *
     * @param x
     * @param y
     * @param w
     * @param h
     */

    drawPlus = function (x, y, w, h) {
        var baseWidth = w;
        var baseHeight = h;
        var thickness = (((baseHeight + baseWidth) / 2) * 0.3);

        var path = new svg.Path(x, y).move(x - (thickness / 2), y + (thickness / 2))
            .line(x - (baseWidth / 2), y + (thickness / 2))
            .line(x - (baseWidth / 2), y - (thickness / 2))
            .line(x - (thickness / 2), y - (thickness / 2))
            .line(x - (thickness / 2), y - (baseHeight / 2))
            .line(x + (thickness / 2), y - (baseHeight / 2))
            .line(x + (thickness / 2), y - (thickness / 2))

            .line(x + (baseWidth / 2), y - (thickness / 2))
            .line(x + (baseWidth / 2), y + (thickness / 2))
            .line(x + (thickness / 2), y + (thickness / 2))
            .line(x + (thickness / 2), y + (baseHeight / 2))
            .line(x - (thickness / 2), y + (baseHeight / 2))
            .line(x - (thickness / 2), y + (thickness / 2));

        path.color(myColors.black);
        return path;
    };

    /**
     *
     * @param x
     * @param y
     * @param w
     * @param h
     */

    drawPlusWithCircle = function (x, y, w, h) {
        var circle = new svg.Circle(w / 2).color(myColors.black);
        var plus = drawPlus(x, y, w - 1.5 * MARGIN, h - 1.5 * MARGIN).color(myColors.lightgrey);
        return {circle: circle, plus: plus};
    };


    /**
     *
     * @param x
     * @param y
     * @param w
     * @param h
     * @param handler
     */

    drawArrow = function (x, y, w, h, manipulator) {
        // x [55;295] y [10;350]
        var baseWidth = 160;//295-55;
        var baseHeight = 300;//385-10;
        var arrowManipulator = manipulator;

        var chevron = new svg.Path(x, y).line(x - 100, y + 100)
            .cubic(x - 140, y + 140, x - 85, y + 185, x - 50, y + 150)
            .line(x + 60, y + 40)
            .cubic(x + 95, y + 5, x + 95, y - 5, x + 60, y - 40)
            .line(x - 50, y - 150)
            .cubic(x - 85, y - 190, x - 145, y - 140, x - 100, y - 100)
            .line(x, y);

        //var path = "M "+(x)+","+(y)+" "+
        //    "L "+(-100+x)+","+(100+y)+" "+
        //    "C "+(-140+x)+","+(140+y)+" "+(-85+x)+","+(185+y)+" "+(-50+x)+","+(150+y)+" "+
        //    "L "+(60+x)+","+(40+y)+" "+
        //    "C "+(95+x)+","+(5+y)+" "+(95+x)+","+(-5+y)+" "+(60+x)+","+(-40+y)+" "+
        //    "L "+(-50+x)+","+(-150+y)+" "+
        //    "C "+(-85+x)+","+(-190+y)+" "+(-145+x)+","+(-140+y)+" "+(-100+x)+","+(-100+y)+" "+
        //    "L "+(x)+","+(y)+" ";

        chevron.tempWidth = baseWidth;
        chevron.tempHeight = baseHeight;
        arrowManipulator.last.add(chevron);


        if (chevron.tempWidth > w) {
            chevron.tempHeight *= w / chevron.tempWidth;
            chevron.tempWidth = w;
        }
        if (chevron.tempHeight > h) {
            chevron.tempWidth *= h / chevron.tempHeight;
            chevron.tempHeight = h;
        }

        arrowManipulator.scalor.scale(chevron.tempHeight / baseHeight);
        return chevron;
    };

    //Function.prototype.clone = function () {
    //    var that = this;
    //    var temp = function temporary() {
    //        return that.apply(this, arguments);
    //    };
    //    for (var key in this) {
    //        if (this.hasOwnProperty(key)) {
    //            temp[key] = this[key];
    //        }
    //    }
    //    return temp;
    //};

/// Modifying Raphael.js prototype to add Local/GlobalPoint to various elements

/// Shape, commun à tout le monde


    //function getPoint(args) {
    //    if (args[0] !== undefined && (typeof args[0] === 'number')) {
    //        return {x: args[0], y: args[1]}
    //    }
    //    else {
    //        return arguments[0];
    //    }
    //}


    manageDnD = function (svgItem, manipulator) {
        var ref;
        var mousedownHandler = function (event) {
            event.preventDefault();// permet de s'assurer que l'event mouseup sera bien déclenché
            ref = svgItem.localPoint(event.clientX, event.clientY);
            svg.addEvent(svgItem, "mousemove", mousemoveHandler);// potentiellement mettre la piste ici, au cas ou on sort de l'objet en cours de drag

            svg.addEvent(svgItem, "mouseup", mouseupHandler);
        };
        var mousemoveHandler = function (event) {
            var mouse = svgItem.localPoint(event.clientX, event.clientY);
            var dx = mouse.x - ref.x;
            var dy = mouse.y - ref.y;

            manipulator.first.move(manipulator.first.x + dx, manipulator.first.y + dy);//combinaison de translations
            //if (self.callback) {
            //    self.callback(/*self.point*/);
            //}
            return true;
        };
        var mouseupHandler = function (event) {
            svg.removeEvent(svgItem, 'mousemove', mousemoveHandler);
            svg.removeEvent(svgItem, 'mouseup', mouseupHandler);
        };
        svg.addEvent(svgItem, "mousedown", mousedownHandler);
    }
}

//////////////// end of SVG-util.js ///////////////////////////


/////////////// Bdd.js //////////////////
/**
 * Created by ABL3483 on 10/03/2016.
 */
function Bdd() {
    myColorsOld = {
        blue: {r: 25, g: 122, b: 230},
        primaryBlue: {r: 0, g: 0, b: 255},
        grey: {r: 125, g: 122, b: 117},
        orange: {r: 230, g: 122, b: 25},
        purple: {r: 170, g: 100, b: 170},
        green: {r: 155, g: 222, b: 17},
        raspberry: {r: 194, g: 46, b: 83},
        black: {r: 0, g: 0, b: 0},
        white: {r: 255, g: 255, b: 255}
    };

    HEADER_SIZE = 0.05;
    REGEX = /^([A-Za-z0-9.éèêâàîïëôûùö ©,;°?!'"-]){0,150}$/g;
    REGEXERROR = "Seuls les caractères alphanumériques, avec accent et \"-,',.;?!°© sont permis.";

    MARGIN = 10;

    myColors = {
        darkBlue: [25, 25, 112],
        blue: [25, 122, 230],
        primaryBlue: [0, 0, 255],
        grey: [125, 122, 117],
        lightgrey: [242, 242, 241],
        orange: [230, 122, 25],
        purple: [170, 100, 170],
        green: [155, 222, 17],
        raspberry: [194, 46, 83],
        black: [0, 0, 0],
        white: [255, 255, 255],
        red: [255, 0, 0],
        yellow: [255, 255, 0],
        none: []
    };

    SELECTION_COLOR = myColors.darkBlue;

    myBibImage = {
        title: "Bibliotheque",
        tabLib: [
            {imgSrc: "../resource/littleCat.png"},
            {imgSrc: "../resource/millions.png"},
            {imgSrc: "../resource/folder.png"},
            {imgSrc: "../resource/cerise.jpg"},
            {imgSrc: "../resource/ChatTim.jpg"}
        ],
        font: "Courier New", fontSize: 20
    };

    defaultQuestion = {
        label: "", imageSrc: "", multipleChoice: false,
        tabAnswer: [
            {
                label: "", imageSrc: null, correct: false,
                colorBordure: myColors.black, bgColor: myColors.white
            },
            {
                label: "", imageSrc: null, correct: false,
                colorBordure: myColors.black, bgColor: myColors.white
            }
        ],
        rows: 4, colorBordure: myColors.black, bgColor: myColors.white
    };

    defaultQuizz = {
        title: "",
        bgColor: myColors.white,
        puzzleLines: 3,
        puzzleRows: 1,
        tabQuestions: [defaultQuestion]
    };

    questionWithLabelImageAndMultipleAnswers = {
        label: "Une divinité féminine est une...", imageSrc: "../resource/millions.png", multipleChoice: true,
        tabAnswer: [
            {
                label: "Comtesse", imageSrc: null, correct: false,
                colorBordure: myColors.green, bgColor: myColors.grey
            },
            {
                label: "Déesse", imageSrc: null, correct: true,
                colorBordure: myColors.green, bgColor: myColors.blue
            },
            {
                label: "Bougresse", imageSrc: null, correct: false,
                colorBordure: myColors.green, bgColor: myColors.grey
            },
            {
                label: "Diablesse", imageSrc: null, correct: false,
                colorBordure: myColors.green, bgColor: myColors.grey
            }
        ],
        rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.green
    };

    myQuestion2 =
    {
        label: "Parmi ces fruits, lequel possède un noyau?", imageSrc: null, multipleChoice: true,
        tabAnswer: [
            {
                label: "", imageSrc: "../resource/pomme.jpg", correct: false,
                colorBordure: myColors.green, bgColor: myColors.white
            },
            {
                label: "La cerise", imageSrc: "../resource/cerise.jpg", correct: true,
                colorBordure: myColors.green, bgColor: myColors.blue
            },
            {
                label: "La poire", imageSrc: null, correct: false,
                colorBordure: myColors.green, bgColor: myColors.grey
            },
            {
                label: "L'orange", imageSrc: null, correct: false,
                colorBordure: myColors.green, bgColor: myColors.grey
            }
        ],
        rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
    };

    myQuizz = {
        title: "Qui veut gagner des millions ? Quizz n°1",
        bgColor: myColors.raspberry,
        puzzleLines: 3,
        puzzleRows: 1,
        tabQuestions: [
            questionWithLabelImageAndMultipleAnswers, myQuestion2,
            {
                label: "Traditionnellement, le justaucorps est porté par...", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Les danseuses", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Les boxeurs", imageSrc: null, correct: false,
                        colorBordure: myColors.blue, bgColor: myColors.grey
                    },
                    {
                        label: "Les rugbymen", imageSrc: null, correct: false,
                        colorBordure: myColors.grey, bgColor: myColors.grey
                    },
                    {
                        label: "Les sumos", imageSrc: null, correct: false,
                        colorBordure: myColors.orange, bgColor: myColors.grey
                    }

                ],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.orange
            },

            {
                label: "Quelle est la capitale de la Libye?",
                imageSrc: null,
                multipleChoice: false,
                font: "Courier New",
                fontSize: 40,
                tabAnswer: [
                    {
                        label: "Malpoli", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey, font: "Courier New", fontSize: 36
                    },
                    {
                        label: "Papoli", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey, font: "Lucida Grande", fontSize: 30
                    },
                    {
                        label: "Tropoli", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey, font: "Lucida Grande", fontSize: 12
                    },
                    {
                        label: "Tripoli", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue, font: "Times New Roman", fontSize: 36
                    }
                ],
                rows: 4,
                colorBordure: myColors.primaryBlue,
                bgColor: myColors.grey
            },

            {
                label: "Un terrain où on n'a rien planté est une terre...", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Stupide", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Inculte", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Idiote", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Ignare", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 3, colorBordure: myColors.primaryBlue, bgColor: myColors.blue
            },

            {
                label: "Un galurin est un...", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Manteau", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Chapeau", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Gâteau", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Château", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
            },

            {
                label: "Quelle est l'orthographe correcte de ce verbe?", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Boïcotter", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Boycotter", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Boycoter", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }

                ],
                rows: 1, colorBordure: myColors.primaryBlue, bgColor: myColors.orange
            },

            {
                label: "Comment appelle-t-on un habitant de Flandre?", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Un flandrois", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Un flamby", imageSrc: "../resource/hollandeContent.jpg", correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Un flamand", imageSrc: "../resource/flamantRose.jpg", correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Un flanders", imageSrc: "../resource/flanders.png", correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 3, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
            },

            {
                label: "Formentera est une île des...", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Cyclades", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.orange
                    },
                    {
                        label: "Antilles", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.purple
                    },
                    {
                        label: "Baléares", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Canaries", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.green
                    }
                ],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.orange
            },

            {
                label: "Quel musée doit son nom à un dessinateur?", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Musée d'Orsay", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Musée Guimet", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Musée Grévin", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Le Louvre", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.green
            },

            {
                label: "Comment s'appelle le meilleur ami de Bob l'éponge?", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Luc", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Paul", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Patrick", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Albert", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
            },

            {
                label: "Le style 'rococo' était un style artistique en vogue au...",
                imageSrc: null,
                multipleChoice: false,
                tabAnswer: [
                    {
                        label: "XVIe siècle", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "XVIIe siècle", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "XVIIIe siècle", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "XIXe siècle", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 2,
                colorBordure: myColors.primaryBlue,
                bgColor: myColors.green
            },

            {
                label: "L'aspic est une variété de...", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Magnolias", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Lilas", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Lavandes", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Roses", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.grey
            },

            {
                label: "En quelle année Yevgeny Kafelnikov a-t-il remporté la finale de Roland-Garros en simple4",
                imageSrc: null,
                multipleChoice: false,
                tabAnswer: [
                    {
                        label: "1996", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "1998", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "1994", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "1999", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 2,
                colorBordure: myColors.primaryBlue,
                bgColor: myColors.purple
            }

        ]
    };

    myQuizzDemo = {
        title: "Qui veut gagner des millions ? Quizz n°1",
        tabQuestions: [
            {
                label: "Parmi ces divinités, lesquelles sont de sexe féminin?",
                imageSrc: "../resource/millions.png",
                multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Athéna", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Isis", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Epona", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Freyja", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    }
                ],
                rows: 4,
                colorBordure: myColors.primaryBlue,
                bgColor: myColors.green
            },

            {
                label: "Parmi ces fruits, lequel ne possède pas de noyau?", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "", imageSrc: "../resource/pomme.jpg", correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "La cerise", imageSrc: "../resource/cerise.jpg", correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "La poire", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "L'orange", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    }
                ],
                rows: 3, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
            },

            {
                label: "Quelle ceinture n'existe pas au judo?", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Bleue", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Violette", imageSrc: null, correct: true,
                        colorBordure: myColors.blue, bgColor: myColors.blue
                    },
                    {
                        label: "Demi-verte (orange et verte)", imageSrc: null, correct: false,
                        colorBordure: myColors.grey, bgColor: myColors.grey
                    },
                    {
                        label: "Demi-marron (bleue et marron)", imageSrc: null, correct: true,
                        colorBordure: myColors.orange, bgColor: myColors.blue
                    }

                ],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.orange
            },

            {
                label: "Quelle est la capitale de la Libye?",
                imageSrc: null,
                multipleChoice: false,
                font: "Courier New",
                fontSize: 40,
                tabAnswer: [
                    {
                        label: "Malpoli", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey, font: "Courier New", fontSize: 36
                    },
                    {
                        label: "Papoli", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey, font: "Lucida Grande", fontSize: 30
                    },
                    {
                        label: "Tropoli", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey, font: "Lucida Grande", fontSize: 12
                    },
                    {
                        label: "Aïoli", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey, font: "Times New Roman", fontSize: 36
                    }
                ],
                rows: 1,
                colorBordure: myColors.primaryBlue,
                bgColor: myColors.grey
            },

            {
                label: "Un terrain où on n'a rien planté est une terre...", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Stupide", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Inculte", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Idiote", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Ignare", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 3, colorBordure: myColors.primaryBlue, bgColor: myColors.blue
            }
        ],
        bgColor: myColors.raspberry, puzzleLines: 3, puzzleRows: 1
    };

    uniqueAnswerValidationTab = [
        function (quiz) {
            // Check Quiz Name:
            var isValid = (quiz.quizzName !== "");
            var message = "Vous devez remplir le nom du quiz.";
            return {isValid: isValid, message: message};
        },
        function (quiz) {
            // Check Question Name:
            var isValid = (quiz.questionCreator.label) || (quiz.questionCreator.questionManipulator.ordonator.children[2] instanceof svg.Image);
            var message = "Vous devez remplir le nom de la question.";
            return {isValid: isValid, message: message};
        },
        function (quiz) {
            // Check 1 Correct Answer:
            var correctAnswers = 0;
            quiz.questionCreator.tabAnswer.forEach(function (el) {
                if (el instanceof AnswerElement) {
                    if (el.correct) {
                        correctAnswers++;
                    }
                }
            });
            console.log(correctAnswers);
            var isValid = (correctAnswers === 1);
            var message = "Votre quiz doit avoir une bonne réponse.";
            return {isValid: isValid, message: message};
        },
        function (quiz) {
            // Check at least 1 valid answer:
            var isFilled = false;
            quiz.questionCreator.tabAnswer.forEach(function (el) {
                if (el instanceof AnswerElement) {
                    isFilled = (isFilled) || (el.label) || (el.manipulator.ordonator.children[2] instanceof svg.Image);
                }
            });
            var isValid = (isFilled);
            var message = "Vous devez remplir au moins une réponse.";
            return {isValid: isValid, message: message};
        }
    ];

    multipleAnswerValidationTab = [
        function (quiz) {
            // Check Quiz Name:
            var isValid = (quiz.quizzName !== "");
            var message = "Vous devez remplir le nom du quiz.";
            return {isValid: isValid, message: message};
        },
        function (quiz) {
            // Check Question Name:
            var isValid = (quiz.questionCreator.label !== "") || (quiz.questionCreator.questionManipulator.ordonator.children[2] instanceof svg.Image);
            var message = "Vous devez remplir le nom de la question.";
            return {isValid: isValid, message: message};
        },
        function (quiz) {
            // Check at least 1 valid answer:
            var isFilled = false;
            quiz.questionCreator.tabAnswer.forEach(function (el) {
                if (el instanceof AnswerElement) {
                    isFilled = isFilled || (el.label) || (el.manipulator.ordonator.children[2] instanceof svg.Image);
                }
            });
            var isValid = isFilled;
            var message = "Vous devez remplir au moins une réponse.";
            return {isValid: isValid, message: message};
        }
    ];

    formationValidation = [
        function (formation) {
            // Check Formation Name:
            var isValid = (formation.formationName !== "");
            var message = "Vous devez remplir le nom de la formation.";
            return {isValid: isValid, message: message};
        }
    ];

    myQuizzType = {
        //tab: [{label:"Réponse unique"}, {label:"Réponses multiples"}, {label:"test"}]
        tab: [{
            label: "Réponse unique",
            default: true,
            validationTab: uniqueAnswerValidationTab
        }, {label: "Réponses multiples", default: false, validationTab: multipleAnswerValidationTab}]
    };

    statusEnum = {
        Published: {
            icon: function (x, y, size) {
                var check = drawCheck(x, y, size).color(myColors.none, 5, myColors.white);
                var square = new svg.Rect(size, size).color(myColors.green);
                return {check: check, square: square};
            }
        },
        Edited: {
            icon: function (size) {
                var self = this;
                self.circle = new svg.Circle(size / 2).color(myColors.orange);
                self.exclamation = new svg.Rect(size / 7, size / 2.5).position(0, -size / 6).color(myColors.white);
                self.dot = new svg.Rect(size / 6.5, size / 6.5).position(0, size / 4).color(myColors.white);
                return self;
            }
        },
        NotPublished: {icon: null}
    };

    myFormations = {
        tab: [{label: "Hibernate", status: statusEnum.NotPublished}, {
            label: "Perturbation Ordre Alphabétique",
            status: statusEnum.Published
        }, {label: "HTML3", status: statusEnum.Edited}, {label: "Javascript"},
            {label: "Nouvelle formation"}, {
                label: "Une autre formation",
                status: statusEnum.Edited
            }, {label: "Formation suivante"}, {label: "AA"}, {label: "Hibernate"}, {label: "Perturbation Ordre Alphabétique"}, {label: "HTML3"}, {label: "Javascript"},
            {label: "Nouvelle formation"}, {label: "Une autre formation"}, {label: "Formation suivante"}, {
                label: "AA",
                status: statusEnum.Published
            }, {label: "Hibernate"}, {label: "Perturbation Ordre Alphabétique"}, {label: "HTML3"}, {label: "Javascript"},
            {label: "Nouvelle formation"}, {label: "Une autre formation"}, {
                label: "Formation suivante",
                status: statusEnum.Edited
            }, {label: "AA"}, {label: "ZEdernier"}]
    };

    myBibJeux = {
        title: "Type de jeux",
        tabLib: [
            {label: "Quiz"},
            {label: "BD"}
        ],
        font: "Courier New", fontSize: 20
    };

    myFormation = {
        gamesCounter: {
            quizz: 0,
            bd: 0
        }
        ,
        quizzTab: [[{type: "Quiz", label: "Quiz 0"}, {type: "BD", label: "BD 0"}, {
            type: "Quiz",
            label: "Le premier Quiz"
        }]]
    };
}
/////////////////// end of Bdd.js //////////////////////

if (typeof exports !== "undefined") {
    exports.SVGGlobalHandler = SVGGlobalHandler;
    exports.SVGUtil = SVGUtil;
    exports.Bdd = Bdd;
}