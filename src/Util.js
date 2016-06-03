/**
 * Created by TDU3482 on 26/04/2016.
 */


///////// SVG-global-handler.js //////////////////
/**
 * Created by ACA3502 on 23/03/2016.
 */
var svg, gui, runtime;

/* istanbul ignore next */
if(typeof SVG != "undefined") {
    if(!svg) {
        svg = new SVG();
    }
}
/* istanbul ignore next */
if(typeof exports.Gui != "undefined") {
    if(!gui) {
        gui = new exports.Gui(svg, {speed: 5, step: 100});
    }
}

function setGui(_gui) {
    gui = _gui;
}

function setSvg(_svg) {
    svg = _svg;
    // call setSvg on modules
}
function  setRuntime(_runtime){
    runtime = _runtime;
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
        self.translator.add(self.rotator.add(self.scalor));
        self.last = self.scalor;
        self.first = self.translator;
        self.addOrdonator = function(layerNumber){
            self.ordonator = new svg.Ordered(layerNumber);
            self.ordonator.parentManip = self;
            self.scalor.add(self.ordonator);
        }
    };

    Drawings = function (w, h, anchor) {
        var self = this;

        !anchor && (anchor = "content");
        self.drawing = new svg.Drawing(w, h).show(anchor).position(0, 0);
        self.drawing.manipulator = new Manipulator(self);
        self.drawing.manipulator.addOrdonator(3);
        self.piste = new Manipulator(self);
        self.glass = new svg.Rect(w, h).position(w / 2, h / 2).opacity(0.001).color(myColors.white);
        self.drawing.add(self.drawing.manipulator.translator);
        self.background = self.drawing.manipulator.translator;
        self.drawing.manipulator.ordonator.set(2, self.piste.first);
        self.drawing.add(self.glass);

        var onmousedownHandler = function (event) {
            !runtime && document.activeElement.blur();
            self.target = self.background.getTarget(event.clientX, event.clientY);
            self.drag = self.target;
            // Rajouter des lignes pour target.bordure et target.image si existe ?
            if (self.target) {
                svg.event(self.target, "mousedown", event);
            }
        };

        svg.addEvent(self.glass, "mousedown", onmousedownHandler);

        var onmousemoveHandler = function (event) {
            self.target = self.drag || self.background.getTarget(event.clientX, event.clientY);
            if (self.target) {
                svg.event(self.target, "mousemove", event);
            }
        };

        svg.addEvent(self.glass, "mousemove", onmousemoveHandler);

        var ondblclickHandler = function (event) {
            self.target = self.background.getTarget(event.clientX, event.clientY);
            if (self.target) {
                svg.event(self.target, "dblclick", event);
            }
        };
        svg.addEvent(self.glass, "dblclick", ondblclickHandler);

        var onmouseupHandler = function (event) {
            self.target = self.drag || self.background.getTarget(event.clientX, event.clientY);
            if (self.target) {
                svg.event(self.target, "mouseup", event);
                svg.event(self.target, "click", event);
            }
            self.drag = null;
        };
        svg.addEvent(self.glass, "mouseup", onmouseupHandler);


        var onmouseoutHandler = function (event) {
            if (self.drag) {
                svg.event(self.target, "mouseup", event);
            }
            //if (self.drag && self.drag.component.listeners && self.drag.component.listeners.mouseup) {
            //    self.target.component.listeners.mouseup(event);
            //}
            self.drag = null;
        };
        svg.addEvent(self.glass, "mouseout", onmouseoutHandler);
    };

    Manipulator.prototype.flush = function () {
        var self = this;
        function clean(handler){
            for(var i=0;i<handler.children.length;i++){
                if((handler instanceof svg.Ordered)){
                    for(var j =0; j<handler.children.length;j++){
                        handler.unset(j);
                    }
                }
                else if (handler.children[i] instanceof svg.Handler){
                    clean(handler.children[i]);
                }
                else {
                    handler.remove(handler.children[i]);
                    i--;
                }
            }
        }
        clean(self.translator);
        //clean(self.rotator);
        //clean(self.scalor);
        //for(var i =0 ; i<self.ordonator.children.length;i++){
        //    self.ordonator.unset(i);
        //}

    };
    gui.Panel.prototype.addhHandle = function (callback) {
        var self = this;
        this.hHandle = new gui.Handle([[255, 204, 0], 3, [220, 100, 0]], hHandleCallback).horizontal(-this.width/2, this.width/2, this.height/2);
        this.component.add(self.hHandle.component);
        function hHandleCallback(position) {
            var y = self.content.y;
            var x = -position * self.content.width / self.view.width + self.view.width / 2;
            self.content.move(x, y);
            callback(x);
        }
    };
    gui.Panel.prototype.resizeContentW = function (width) {
        this.back.color(myColors.white).opacity(0.001);
        if (width>this.width) {
            this.content.width = width;
            this.updateHandleH();
        }
        return this;
    };
    gui.Panel.prototype.updateHandleH = function () {
        this.hHandle.dimension(this.view.width, this.content.width)
            .position((this.view.width/2-this.content.x)/(this.content.width)*this.view.width);
        return this;
    };
    gui.Panel.prototype.moveContentH = function (x) {
        var self=this;
        if (!self.animation) {
            self.animation = true;
            var lx = this.controlPositionH(x);
            this.content.onChannel().smoothy(param.speed, param.step)
                .execute(completeMovement).moveTo(lx, this.content.y);
        }
        function completeMovement(progress) {
            self.updateHandleH();
            if (progress===1) {
                delete self.animation;
            }
        }
        return this;
    };
    gui.Panel.prototype.controlPositionH = function(x) {
        if (x > 0) {
            x = 0;
        }
        if (x < -this.content.width + this.view.width) {
            x = -this.content.width + this.view.width;
        }
        return x;
    };
    gui.Panel.prototype.functionOnMoveH = function (callback) {
        this.moveContentH = function (x) {
            var self=this;
            if (!self.animation) {
                self.animation = true;
                var lx = this.controlPositionH(x);
                this.content.onChannel().smoothy(param.speed, param.step)
                    .execute(completeMovement).moveTo(lx, this.content.y);
                callback(x);
            }
            function completeMovement(progress) {
                self.updateHandleH();
                if (progress===1) {
                    delete self.animation;
                }
            }
            return this;
        }
    };
    gui.Panel.prototype.processKeys = function(keycode) {
        if (isUpArrow(keycode)) {
            this.moveContent(this.content.y + 100);
        }
        else if (isDownArrow(keycode)) {
            this.moveContent(this.content.y - 100);
        }
        else if(isLeftArrow(keycode)) {
            this.moveContentH(this.content.x+100);
        }
        else if(isRightArrow(keycode)) {
            this.moveContentH(this.content.x-100);
        }
        else {
            return false;
        }
        return true;

        function isUpArrow(keycode) {
            return keycode === 38;
        }
        function isLeftArrow(keycode) {
            return keycode === 37;
        }
        function isRightArrow(keycode) {
            return keycode === 39;
        }
        function isDownArrow(keycode) {
            return keycode === 40;
        }
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

    getComplementary = function (tab) {
        return [255 - tab[0], 255 - tab[1], 255 - tab[2]];
    };

    onclickFunction = function (event) {
        var target = drawings.background.getTarget(event.clientX, event.clientY);
        var sender = null;
        target.answerParent && (sender = target.answerParent);
        var editor = (sender.editor.linkedQuestion ? sender.editor : sender.editor.parent);
        !editor.multipleChoice && editor.linkedQuestion.tabAnswer.forEach(answer => {
            answer.correct = (answer !== sender) ? false : answer.correct;
        });
        sender.correct = !sender.correct;
        sender.correct && drawPathChecked(sender, sender.x, sender.y, sender.size);
        updateAllCheckBoxes(sender)
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
        sender.manipulator.ordonator.set(4, sender.obj.checked);
    };

    updateAllCheckBoxes = function (sender) {
        var editor = (sender.editor.linkedQuestion ? sender.editor : sender.editor.parent);
        editor.linkedQuestion.tabAnswer.forEach(answer => {
            if (answer.editable && answer.obj.checkbox) {
                answer.obj.checkbox.color(myColors.white, 2, myColors.black);
                !answer.correct && answer.manipulator.ordonator.unset(4);
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
        sender.obj.checkbox.color(myColors.white, 2, myColors.black);
        svg.addEvent(sender.obj.checkbox, "click", onclickFunction);
        sender.manipulator.ordonator.set(3, sender.obj.checkbox);
        !sender.correct && sender.manipulator.ordonator.unset(4);
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
     * @param previousImage
     * @returns {{cadre: *, image, text}}
     */
    displayImageWithTitle = function (label, imageSrc, imageObj, w, h, rgbCadre, bgColor, fontSize, font, manipulator, previousImage) {

        var text = autoAdjustText(label, 0, 0, w, null, fontSize, font, manipulator).text;
        var bbox= svg.getSvgr().boundingRect(text.component);
        var textHeight = bbox.height;
        (typeof textHeight === "undefined") && (textHeight = fontSize+2);
        text.position(0, (h - textHeight) / 2);//w*1/6
        var newWidth = previousImage && w === previousImage.width ? w : w - 2 * MARGIN;
        var newHeight = previousImage && h === previousImage.height ? h : h - textHeight - 3 * MARGIN;
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
            image: new svg.Image(imageSrc).dimension(width, height).position(0, 0), height: height
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
        content.position(0, Math.floor(svg.getSvgr().boundingRect(content.component).height)/4);
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
        t.font(font ? font : "Arial", fontSize ? fontSize : 20);
        // add text word by word
        for (var i = 0; i < words.length; i++) {
            // set text to test the BBox.width
            t.message(tempText + " " + words[i]);
            // test if DOESN'T fit in the line
            if ((svg.getSvgr().boundingRect(t.component) && svg.getSvgr().boundingRect(t.component).width > w) ) {
                //    if ((t.component.getBoundingClientRect && t.component.getBoundingClientRect().width > w) || (t.component.target && t.component.target.getBoundingClientRect().width > w)|| (runtime && (runtime.boundingRect(t.component).width > w))) {
                //Comment 2 next lines to add BreakLine
                tempText = tempText.substring(0, tempText.length - 3) + "...";
                break;
                // temporary string to store the word in a new line
                var tmpStr = tempText + "\n" + words[i];
                t.message(tmpStr);
                // test if the whole word can fit in a line
                if (t.component.getBoundingClientRect().width > w) {
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
                        if (t.component.getBoundingClientRect().width > w) {
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
                    if (t.component.getBoundingClientRect().height > h - MARGIN) {
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
        var finalHeight = svg.getSvgr().boundingRect(t.component).height;
        (typeof finalHeight === "undefined" && t.messageText !== "") && (finalHeight = runtime.boundingRect(t.component).height);
        (typeof finalHeight === "undefined" && t.messageText === "") && (finalHeight = 0);
        t.position(0, Math.round((finalHeight - fontSize / 2) / 2)); // finalHeight/2 ??
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
     * @param manipulator
     */
    drawArrow = function (x, y, w, h, manipulator) {
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
        chevron.tempWidth = baseWidth;
        chevron.tempHeight = baseHeight;
        arrowManipulator.ordonator.set(0,chevron);
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

    manageDnD = function (svgItem, manipulator) {
        var ref;
        var mousedownHandler = function (event) {
            event.preventDefault(); // permet de s'assurer que l'event mouseup sera bien déclenché
            ref = svgItem.localPoint(event.clientX, event.clientY);
            svg.addEvent(svgItem, "mousemove", mousemoveHandler);
            svg.addEvent(svgItem, "mouseup", mouseupHandler);
        };
        var mousemoveHandler = function (event) {
            var mouse = svgItem.localPoint(event.clientX, event.clientY);
            var dx = mouse.x - ref.x;
            var dy = mouse.y - ref.y;
            manipulator.first.move(manipulator.first.x + dx, manipulator.first.y + dy); //combinaison de translations
            return true;
        };
        var mouseupHandler = function () {
            svg.removeEvent(svgItem, 'mousemove', mousemoveHandler);
            svg.removeEvent(svgItem, 'mouseup', mouseupHandler);
        };
        svg.addEvent(svgItem, "mousedown", mousedownHandler);
    };

    drawStraightArrow = function(x1,y1,x2,y2){
        var arrow = new svg.Arrow(3, 9, 15).position(x1,y1,x2,y2);
        var arrowPath=new svg.Path(x1,y1);
        for(let i = 0; i<arrow.points.length; i++) {
            arrowPath.line(arrow.points[i].x, arrow.points[i].y);
        }
        arrowPath.line(x1,y1);
        return arrowPath;
    };

    Arrow = function(parentGame,childGame) {
        var self=this;
        self.origin=parentGame;
        self.target=childGame;
        var parentGlobalPoint=parentGame.miniatureManipulator.last.globalPoint(0, parentGame.parentFormation.graphElementSize/2);
        var parentLocalPoint=parentGame.parentFormation.graphManipulator.last.localPoint(parentGlobalPoint.x, parentGlobalPoint.y);
        var childGlobalPoint=childGame.miniatureManipulator.last.globalPoint(0, -childGame.parentFormation.graphElementSize/2);
        var childLocalPoint=parentGame.parentFormation.graphManipulator.last.localPoint(childGlobalPoint.x, childGlobalPoint.y);

        self.redCross=drawPlus(0,0,20,20);
        self.redCrossManipulator=new Manipulator(self);
        self.redCrossManipulator.last.add(self.redCross);
        self.redCross.color(myColors.red,1,myColors.black);
        self.redCrossManipulator.rotator.rotate(45);
        self.redCrossManipulator.translator.move((parentLocalPoint.x+childLocalPoint.x)/2,(parentLocalPoint.y+childLocalPoint.y)/2);

        var removeLink=function(parentGame,childGame) {
            parentGame.childrenGames.splice(parentGame.childrenGames.indexOf(childGame),1);
            childGame.parentsGames.splice(childGame.parentsGames.indexOf(parentGame),1);
        };

        self.redCrossClickHandler = function () {
            //parentGame.parentFormation.selectedArrow.selected=false;
            removeLink(parentGame,childGame);
            parentGame.parentFormation.graphManipulator.last.remove(self.arrowPath);
            parentGame.parentFormation.graphManipulator.last.remove(self.redCrossManipulator.first);
            parentGame.parentFormation.selectedArrow=null;
        };

        svg.addEvent(self.redCross,'click',self.redCrossClickHandler);

        self.arrowPath=drawStraightArrow(parentLocalPoint.x,parentLocalPoint.y , childLocalPoint.x, childLocalPoint.y);
        self.selected=false;
        function arrowClickHandler(){
            parentGame.parentFormation.selectedGame && parentGame.parentFormation.selectedGame.icon.cadre.component.listeners.click();
            if(!self.selected){
                if(parentGame.parentFormation.selectedArrow){
                    parentGame.parentFormation.selectedArrow.arrowPath.color(myColors.black,1,myColors.black);
                    parentGame.parentFormation.selectedArrow.selected=false;
                    parentGame.parentFormation.graphManipulator.last.remove(parentGame.parentFormation.selectedArrow.redCrossManipulator.first);
                }
                parentGame.parentFormation.selectedArrow=self;
                parentGame.parentFormation.graphManipulator.last.add(self.redCrossManipulator.first);
                self.arrowPath.color(myColors.blue,2,myColors.black);
            } else {
                self.arrowPath.color(myColors.black,1,myColors.black);
                parentGame.parentFormation.graphManipulator.last.remove(self.redCrossManipulator.first);
                parentGame.parentFormation.selectedArrow=null;
            }
            self.selected= !self.selected;
        }
        svg.addEvent(self.arrowPath,'click',arrowClickHandler);
        self.arrowPath.color(myColors.black,1,myColors.black);
        return self;
    };

    Miniature = function(game,size) {
        var self = this;
        self.game = game;
        self.icon = displayTextWithCircle(game.title, size, size, myColors.black, myColors.white, 20, null, game.miniatureManipulator);
        game.miniatureManipulator.first.move(game.miniaturePosition.x, game.miniaturePosition.y);
        self.redCross = drawPlus(0, 0, 20, 20);
        self.redCrossManipulator = new Manipulator(self);
        self.redCrossManipulator.last.add(self.redCross);
        self.redCross.color(myColors.red, 1, myColors.black);
        self.redCrossManipulator.rotator.rotate(45);
        self.redCrossManipulator.translator.move(size / 2, -size / 2);

        var removeAllLinks = function () {
            game.childrenGames.forEach(function (childGame) {
                childGame.parentsGames.splice(childGame.parentsGames.indexOf(game), 1);
            });
            game.parentsGames.forEach(function (parentGame) {
                parentGame.childrenGames.splice(parentGame.childrenGames.indexOf(game), 1);
            });
        };

        self.redCrossClickHandler = function () {
            removeAllLinks();
            game.miniatureManipulator.ordonator.unset(0);
            game.miniatureManipulator.ordonator.unset(1);
            game.miniatureManipulator.last.remove(self.redCrossManipulator.first);
            var indexes = game.getPositionInFormation();
            game.parentFormation.levelsTab[indexes.levelIndex].removeGame(indexes.gameIndex);
            var levelsTab = game.parentFormation.levelsTab;
            while (levelsTab.length > 0 && levelsTab[levelsTab.length - 1].gamesTab.length === 0) {
                game.parentFormation.levelsTab.pop();
            }
            game.parentFormation.selectedGame.selected = false;
            game.parentFormation.selectedGame = null;
            game.parentFormation.displayGraph();
        };
        svg.addEvent(self.redCross, 'click', self.redCrossClickHandler);
        self.selected = false;
        function miniatureClickHandler() {
            self.game.parentFormation.selectedArrow && self.game.parentFormation.selectedArrow.arrowPath.component.listeners.click();
            if (!self.selected) {
                if (game.parentFormation.selectedGame) {
                    game.parentFormation.selectedGame.icon.cadre.color(myColors.white, 1, myColors.black);
                    game.parentFormation.selectedGame.selected = false;
                    game.parentFormation.selectedGame.game.miniatureManipulator.last.remove(game.parentFormation.selectedGame.redCrossManipulator.first);
                }
                game.parentFormation.selectedGame = self;
                game.miniatureManipulator.last.add(self.redCrossManipulator.first);
                self.icon.cadre.color(myColors.white, 2, SELECTION_COLOR);
            } else {
                self.icon.cadre.color(myColors.white, 1, myColors.black);
                game.miniatureManipulator.last.remove(self.redCrossManipulator.first);
                game.parentFormation.selectedGame = null;
            }
            self.selected = !self.selected;
        }

        svg.addEvent(self.icon.cadre, 'click', miniatureClickHandler);
        svg.addEvent(self.icon.content, 'click', miniatureClickHandler);
        self.icon.cadre.color(myColors.white, 1, myColors.black);
        return self;
    }
}

/////////////// Bdd.js //////////////////
/**
 * Created by ABL3483 on 10/03/2016.
 */
function Bdd() {
    HEADER_SIZE = 0.05;
    REGEX = /^([A-Za-z0-9.éèêâàîïëôûùö ©,;°?!'"-]){0,150}$/g;
    REGEXERROR = "Seuls les caractères alphanumériques, avec accent et \"-,',.;?!°© sont permis.";
    MARGIN = 10;
    myParentsList = ["parent", "answersManipulator", "validateManipulator", "parentElement", "questionManipulator",
        "resetManipulator", "manipulator", "manipulatorQuizzInfo", "questionCreatorManipulator",
        "previewButtonManipulator", "saveQuizButtonManipulator","saveFormationButtonManipulator", "toggleButtonManipulator", "puzzleManipulator",
        "mainManipulator", "quizzManipulator", "resultManipulator", "scoreManipulator", "quizzManager",
        "quizzInfoManipulator", "returnButtonManipulator", "questionPuzzleManipulator", "component", "drawing",
        "answerParent", "obj", "checkbox", "cadre", "content", "parentQuizz", "selectedAnswers", "linkedQuestion",
        "leftArrowManipulator", "rightArrowManipulator", "virtualTab", "questionWithBadAnswersManipulator",
        "editor","miniatureManipulator","parentFormation","formationInfoManipulator","parentsGames",
        "simpleChoiceMessageManipulator"];

    myColors = {
        darkBlue: [25, 25, 112],
        blue:[25, 122, 230],
        primaryBlue:[0, 0, 255],
        grey:[125, 122, 117],
        lightgrey:[242,242,241],
        orange:[230, 122, 25],
        purple:[170, 100, 170],
        green:[155, 222, 17],
        raspberry:[194, 46, 83],
        black:[0, 0, 0],
        white:[255, 255, 255],
        red:[255, 0, 0],
        yellow:[255,255,0],
        pink:[255,20,147],
        brown:[128,0,0],
        none:[]
    };

    myImagesSourceDimensions = {
        "../resource/littleCat.png" : {width: 80, height: 50},
        "../resource/millions.png" : {width:1024, height: 1024},
        "../resource/pomme.jpg" : {width: 925, height: 1000},
        "../resource/hollandeContent.jpg" : {width: 166, height: 200},
        "../resource/folder.png" : {width: 256, height: 256},
        "../resource/flanders.png" : {width: 225, height: 225},
        "../resource/flamantRose.jpg" : {width: 183, height: 262},
        "../resource/ChatTim.jpg" : {width: 480, height: 640},
        "../resource/cerise.jpg" : {width: 2835, height: 2582},
        "../resource/cat.png" : {width: 1920, height: 1200}
    };

    SELECTION_COLOR = myColors.darkBlue;

    myLibraryImage = {
        title: "Bibliothèque",
        tab: [
            {imgSrc: "../resource/littleCat.png"},
            {imgSrc: "../resource/millions.png"},
            {imgSrc: "../resource/folder.png"},
            {imgSrc: "../resource/cerise.jpg"},
            {imgSrc: "../resource/ChatTim.jpg"}
        ],
        font: "Courier New", fontSize: 20
    };

    myLibraryGames = {
        title: "Type de jeux",
        tab: [
            {label: "Quiz"},
            {label: "Bd"}
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

    myQuizzTestLong = {
        title: "Qui veut gagner des millions ? Quiz n°1",
        bgColor: myColors.raspberry,
        puzzleLines: 3,
        puzzleRows: 1,
        tabQuestions: [
            {label: "Question 1", imageSrc:null, multipleChoice: true,
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
                    }],
                rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.green
            },

            {
                label: "Question 2", imageSrc: null, multipleChoice: false,
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
                label: "Question 3", imageSrc: null, multipleChoice: false,
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
                label: "Question 0", imageSrc: null, multipleChoice: false,
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
                label: "Question 4", imageSrc: null, multipleChoice: false,
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
                label: "Question -1", imageSrc: null, multipleChoice: false,
                tabAnswer: [
                    {
                        label: "Un flandrois", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Un flamby", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    },
                    {
                        label: "Un flamand", imageSrc: null, correct: true,
                        colorBordure: myColors.green, bgColor: myColors.blue
                    },
                    {
                        label: "Un flanders", imageSrc: null, correct: false,
                        colorBordure: myColors.green, bgColor: myColors.grey
                    }
                ],
                rows: 3, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
            },

            {
                label: "Question 5", imageSrc: null, multipleChoice: false,
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
                label: "Question 6", imageSrc: null, multipleChoice: false,
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
                label: "Question 7", imageSrc: null, multipleChoice: false,
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
                label: "Question 8",
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
                label: "Question 9", imageSrc: null, multipleChoice: false,
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
                label: "Question 10",
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

    myQuizz = {
        title: "Qui veut gagner des millions ? Quiz n°1",
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

    myQuizzTest = {
        title: "Qui veut gagner des millions ? Quiz n°1",
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
            }//,
            //
            //{
            //    label: "Quelle est l'orthographe correcte de ce verbe?", imageSrc: null, multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "Boïcotter", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Boycotter", imageSrc: null, correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "Boycoter", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        }
            //
            //    ],
            //    rows: 1, colorBordure: myColors.primaryBlue, bgColor: myColors.orange
            //},
            //
            //{
            //    label: "Comment appelle-t-on un habitant de Flandre?", imageSrc: null, multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "Un flandrois", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Un flamby", imageSrc: "../resource/hollandeContent.jpg", correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Un flamand", imageSrc: "../resource/flamantRose.jpg", correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "Un flanders", imageSrc: "../resource/flanders.png", correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        }
            //    ],
            //    rows: 3, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
            //},
            //
            //{
            //    label: "Formentera est une île des...", imageSrc: null, multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "Cyclades", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.orange
            //        },
            //        {
            //            label: "Antilles", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.purple
            //        },
            //        {
            //            label: "Baléares", imageSrc: null, correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "Canaries", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.green
            //        }
            //    ],
            //    rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.orange
            //},
            //
            //{
            //    label: "Question x", imageSrc: null, multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "Musée d'Orsay", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Musée Guimet", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Musée Grévin", imageSrc: null, correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "Le Louvre", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        }
            //    ],
            //    rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.green
            //},
            //
            //{
            //    label: "Question y", imageSrc: null, multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "Luc", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Paul", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Patrick", imageSrc: null, correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "Albert", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        }
            //    ],
            //    rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.purple
            //},
            //
            //{
            //    label: "Question z",
            //    imageSrc: null,
            //    multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "XVIe siècle", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "XVIIe siècle", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "XVIIIe siècle", imageSrc: null, correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "XIXe siècle", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        }
            //    ],
            //    rows: 2,
            //    colorBordure: myColors.primaryBlue,
            //    bgColor: myColors.green
            //},
            //
            //{
            //    label: "L'aspic est une variété de...", imageSrc: null, multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "Magnolias", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Lilas", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "Lavandes", imageSrc: null, correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "Roses", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        }
            //    ],
            //    rows: 2, colorBordure: myColors.primaryBlue, bgColor: myColors.grey
            //},
            //
            //{
            //    label: "En quelle année Yevgeny Kafelnikov a-t-il remporté la finale de Roland-Garros en simple4",
            //    imageSrc: null,
            //    multipleChoice: false,
            //    tabAnswer: [
            //        {
            //            label: "1996", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "1998", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        },
            //        {
            //            label: "1994", imageSrc: null, correct: true,
            //            colorBordure: myColors.green, bgColor: myColors.blue
            //        },
            //        {
            //            label: "1999", imageSrc: null, correct: false,
            //            colorBordure: myColors.green, bgColor: myColors.grey
            //        }
            //    ],
            //    rows: 2,
            //    colorBordure: myColors.primaryBlue,
            //    bgColor: myColors.purple
            //}

        ]
    };

    myQuizzDemo = {
        title: "Qui veut gagner des millions ? Quiz n°1",
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

    singleAnswerValidationTab = [
        // Check Quiz Name:
        quiz => ({
            isValid: quiz.quizzName !== "",
            message: "Vous devez remplir le nom du quiz."
        }),
        // Check Question Name:
        quiz => ({
            isValid: (quiz.questionCreator.label) || (quiz.questionCreator.questionManipulator.ordonator.children[2] instanceof svg.Image),
            message: "Vous devez remplir le nom de la question."
        }),
        // Check 1 Correct Answer:
        quiz => ({
            isValid: quiz.questionCreator.linkedQuestion.tabAnswer && quiz.questionCreator.linkedQuestion.tabAnswer.some(el => el.editable && el.correct),
            message: "Votre quiz doit avoir une bonne réponse."
        }),
        // Check at least 1 valid answer:
        quiz => ({
            isValid: quiz.questionCreator.linkedQuestion.tabAnswer.some(el => el.editable && (el.label || el.manipulator.ordonator.children[2] instanceof svg.Image)),
            message: "Vous devez remplir au moins une réponse."
        })
    ];

    multipleAnswerValidationTab = [
        // Check Quiz Name:
        quiz => ({
            isValid: quiz.quizzName !== "",
            message: "Vous devez remplir le nom du quiz."
        }),
        // Check Question Name:
        quiz => ({
            isValid: (quiz.questionCreator.label) || (quiz.questionCreator.questionManipulator.ordonator.children[2] instanceof svg.Image),
            message: "Vous devez remplir le nom de la question."
        }),
        // Check at least 1 valid answer:
        quiz => ({
            isValid: quiz.questionCreator.linkedQuestion.tabAnswer.some(el => el.editable && (el.label || el.manipulator.ordonator.children[2] instanceof svg.Image)),
            message: "Vous devez remplir au moins une réponse."
        })
    ];

    formationValidation = [
        // Check Formation Name:
        formation => ({
            isValid: formation.formationName !== "",
            message: "Vous devez remplir le nom de la formation."
        })
    ];

    myQuizzType = {
        tab: [
            {
                label: "Réponse unique",
                default: true,
                validationTab: singleAnswerValidationTab
            },
            {
                label: "Réponses multiples",
                default: false,
                validationTab: multipleAnswerValidationTab
            }
        ]
    };

    statusEnum = {
        Published: {
            icon: size => {
                let check = drawCheck(0, 0, size).color(myColors.none, 5, myColors.white),
                    square = new svg.Rect(size, size).color(myColors.green);
                return {
                    check: check,
                    square: square,
                    elements: [square, check]
                }
            }
        },
        Edited: {
            icon: size => {
                let circle = new svg.Circle(size / 2).color(myColors.orange),
                    exclamation = new svg.Rect(size / 7, size / 2.5).position(0, -size / 6).color(myColors.white),
                    dot = new svg.Rect(size / 6.5, size / 6.5).position(0, size / 4).color(myColors.white);
                return {
                    circle: circle,
                    exclamation: exclamation,
                    dot: dot,
                    elements: [circle, exclamation, dot]
                }
            }
        },
        NotPublished: {
            icon: () => ({elements:[]})
        }
    };

    myFormations = {
        tab: [{label: "Hibernate", status: statusEnum.NotPublished}, {
            label: "Hibernate 2",
            status: statusEnum.Published
        }, {label: "HTML3", status: statusEnum.Edited}, {label: "Javascript"},
            {label: "HTML5"}, {
                label: "HTML5 2",
                status: statusEnum.Edited
            }, {label: "MongoDB"}, {label: "Node Js"}, {label: "Hibernate 3"}, {label: "Hibernate 4"}, {label: "HTML3 2"}, {label: "Php"},
            {label: "Javascript 2"}, {label: "Javascript 3"}, {label: "Javascript 4"}, {
                label: "Javascript 5",
                status: statusEnum.Published
            }, {label: "Angular js"}, {label: "Angular js 2"}, {label: "Angular js 3"}, {label: "Angular js 4"},
            {label: "Angular js 5"}, {label: "Angular js 6"}, {
                label: "Angular js 7",
                status: statusEnum.Edited
            }, {label: "Angular js 8"}, {label: "ZEdernier"}]
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
    exports.setGui = setGui;
    exports.setRuntime = setRuntime;
}

/*var FormationVersionStructure =
 {
 parentFormation: objectId, //(Formation)
 num: Number,
 tabLevels: [
 {
 num: Number,
 tabGames: [
 {
 _id: objectId,
 parentsGame: [objectId],
 childrenGame: [objectId],
 tabQuestions: [
 {
 questionData: {1},
 tabReponses: [{2}]
 }]
 }]
 }]
 };
 var FormationVersion =
 {
 parentFormation: "objectId", //(Formation)
 num: "Number",
 tabLevels: [
 {
 num: 1,
 tabGames: [myQuizz]
 },
 {
 num: 2,
 tabGames: [myQuizz]
 }]
 };*/