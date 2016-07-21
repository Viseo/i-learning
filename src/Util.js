exports.Util = function (globalVariables) {

    let
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        dbListener = globalVariables.dbListener,
        svg = globalVariables.svg;

    setGlobalVariables = () => {
        runtime = globalVariables.runtime;
        drawing = globalVariables.drawing;
        drawings = globalVariables.drawings;
        dbListener = globalVariables.dbListener;
        svg = globalVariables.svg;
    };

    function SVGGlobalHandler() {

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

    class Manipulator {
        constructor(sourceObject) {
            this.parentObject = sourceObject;
            this.translator = new svg.Translation(0, 0);
            this.translator.parentManip = this;
            this.rotator = new svg.Rotation(0);
            this.rotator.parentManip = this;
            this.scalor = new svg.Scaling(1);
            this.scalor.parentManip = this;
            this.translator.add(this.rotator.add(this.scalor));
            this.last = this.scalor;
            this.first = this.translator;
        }

        addOrdonator(layerNumber) {
            this.ordonator = new svg.Ordered(layerNumber);
            this.ordonator.parentManip = this;
            this.scalor.add(this.ordonator);
            return this;
        }

        flush() {
            const clean = (handler) => {
                for (let i = 0; i < handler.children.length; i++) {
                    if ((handler instanceof svg.Ordered)) {
                        for (let j = 0; j < handler.children.length; j++) {
                            if (!(handler.children[j] instanceof svg.Handler)) {
                                handler.unset(j);
                            } else {
                                clean(handler.children[j]);
                            }
                        }
                    } else if (handler.children[i] instanceof svg.Handler) {
                        clean(handler.children[i]);
                    } else {
                        handler.remove(handler.children[i]);
                        i--;
                    }
                }
            };
            clean(this.translator);
        }

    }

    class Drawings {
        constructor(w, h, anchor = "content") {
            this.screen = new svg.Screen(w, h).show(anchor);
            this.drawing = new svg.Drawing(w, h);
            this.screen.add(this.drawing);
            this.drawing.manipulator = new Manipulator(this);
            this.drawing.manipulator.addOrdonator(3);
            this.piste = new Manipulator(this);
            this.glass = new svg.Rect(w, h).position(w / 2, h / 2).opacity(0.001).color(myColors.white);
            this.drawing.add(this.drawing.manipulator.translator);
            this.background = this.drawing.manipulator.translator;
            this.drawing.manipulator.ordonator.set(2, this.piste.first);
            this.drawing.add(this.glass);

            const onmousedownHandler = event => {
                !runtime && document.activeElement.blur();
                this.target = this.background.getTarget(event.clientX, event.clientY);
                this.drag = this.target;
                // Rajouter des lignes pour target.bordure et target.image si existe ?
                if (this.target) {
                    svg.event(this.target, "mousedown", event);
                }
            };
            svg.addEvent(this.glass, "mousedown", onmousedownHandler);

            const onmousemoveHandler = event => {
                this.target = this.drag || this.background.getTarget(event.clientX, event.clientY);
                if (this.target) {
                    if (this.drawing.mousedOverTarget && this.drawing.mousedOverTarget.target) {
                        const bool = this.drawing.mousedOverTarget.target.inside(event.clientX, event.clientY);
                        if (this.drawing.mousedOverTarget.target.component.listeners && this.drawing.mousedOverTarget.target.component.listeners.mouseout && !bool) {
                            svg.event(this.drawing.mousedOverTarget.target, "mouseout", event);
                            this.drawing.mousedOverTarget = null;
                        }
                    }

                    svg.event(this.target, "mousemove", event);
                    if (this.target.component.listeners && this.target.component.listeners.mouseover) {
                        this.drawing.mousedOverTarget = {target: this.target};
                        svg.event(this.target, "mouseover", event);
                    }
                }
            };
            svg.addEvent(this.glass, "mousemove", onmousemoveHandler);

            const ondblclickHandler = event => {
                this.target = this.background.getTarget(event.clientX, event.clientY);
                if (this.target) {
                    svg.event(this.target, "dblclick", event);
                }
            };
            svg.addEvent(this.glass, "dblclick", ondblclickHandler);

            const onmouseupHandler = event => {
                self.target = this.drag || this.background.getTarget(event.clientX, event.clientY);
                if (this.target) {
                    svg.event(this.target, "mouseup", event);
                    svg.event(this.target, "click", event);
                }
                this.drag = null;
            };
            svg.addEvent(this.glass, "mouseup", onmouseupHandler);

            const onmouseoutHandler = function (event) {
                if (this.drag) {
                    svg.event(this.target, "mouseup", event);
                }
                this.drag = null;
            };
            svg.addEvent(this.glass, "mouseout", onmouseoutHandler);
        }
    }

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

        displayPen = function (x, y, size, object) {
            let fontColor;
            fontColor = object.filled ? myColors.darkerGreen : myColors.black;
            let square = new svg.Rect(size, size).color(myColors.white, 1, myColors.black).position(x, y),
                tipEnd = new svg.Triangle(size / 5, size / 5, "S").color(myColors.white, 1, fontColor).position(0, size / 2),
                end = new svg.Rect(size / 5, size / 10).color(myColors.fontColor, 1, fontColor).position(0, size / 5 - size / 4 - size / 10),
                body = new svg.Rect(size / 5, size / 2).color(fontColor).position(0, size / 5),
                line1 = new svg.Line(-size / 2 + size / 8, -size / 2 + size / 5, size / 2 - size / 8, -size / 2 + size / 5).color(myColors.grey, 1, myColors.grey),
                line2 = new svg.Line(-size / 2 + size / 8, -size / 2 + 2 * size / 5, size / 2 - size / 8, -size / 2 + 2 * size / 5).color(myColors.grey, 1, myColors.grey),
                line3 = new svg.Line(-size / 2 + size / 8, -size / 2 + 3 * size / 5, size / 2 - size / 8, -size / 2 + 3 * size / 5).color(myColors.grey, 1, myColors.grey),
                line4 = new svg.Line(-size / 2 + size / 8, -size / 2 + 4 * size / 5, -size / 2 + size / 5, -size / 2 + 4 * size / 5).color(myColors.grey, 1, myColors.grey);
            let elementsTab = [square, tipEnd, end, body, line1, line2, line3, line4];
            object.manipulator.ordonator.set(6, square);
            object.linesManipulator.translator.move(x, y);
            object.linesManipulator.ordonator.set(0, line1);
            object.linesManipulator.ordonator.set(1, line2);
            object.linesManipulator.ordonator.set(2, line3);
            object.linesManipulator.ordonator.set(3, line4);
            object.penManipulator.ordonator.set(1, tipEnd);
            object.penManipulator.ordonator.set(2, end);
            object.penManipulator.ordonator.set(3, body);
            object.penManipulator.translator.move(x + size / 8, y - size / 8);
            object.penManipulator.rotator.rotate(40);
            elementsTab.forEach(element=>svg.addEvent(element, "click", object.penHandler));
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
        displayImageWithTitle = function (label, imageSrc, imageObj, w, h, rgbCadre, bgColor, fontSize, font, manipulator, previousImage, textWidth = w) {
            if ((w <= 0) || (h <= 0)) {
                w = 1;
                h = 1;
            }
            var text = autoAdjustText(label, 0, 0, textWidth, null, fontSize, font, manipulator).text;

            var textHeight = (label !== "") ? h * 0.25 : 0;
            text.position(0, (h - textHeight) / 2);//w*1/6
            var newWidth = previousImage && w === previousImage.width ? w : w;
            var newHeight = previousImage && h === previousImage.height ? h : (h - textHeight) * 0.8;
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
            if ((w <= 0) || (h <= 0)) {
                w = 1;
                h = 1;
            }
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
         * @param rgbCadre : color for rectangle
         * @param bgColor : background color for rectangle
         * @param textHeight : number, taille de la police
         * @param font
         * @param manipulator
         * @param layer1
         * @param layer2
         * @returns {{content, cadre}} : SVG/Raphael items for text & cadre
         */
        displayText = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator, layer1 = 0, layer2 = 1, textWidth = w) {
            if ((w <= 0) || (h <= 0)) {
                w = 1;
                h = 1;
            }
            var content = autoAdjustText(label, 0, 0, textWidth, h, textHeight, font, manipulator, layer2).text;
            var cadre = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(25, 25);
            manipulator.ordonator.set(layer1, cadre);
            return {content: content, cadre: cadre};
        };

        /**
         *
         * @param label : text to print
         * @param w : width
         * @param h : height
         * @param rgbCadre : color for circle
         * @param bgColor : background color for circle
         * @param textHeight : number, taille de la police
         * @param font
         * @param manipulator
         * @returns {{content, cadre}} : SVG/Raphael items for text & cadre
         */
        displayTextWithCircle = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator) {
            var content = autoAdjustText(label, 0, 0, w, h, textHeight, font, manipulator).text;
            var cadre = new svg.Circle(w / 2).color(bgColor, 1, rgbCadre);
            manipulator.ordonator.set(0, cadre);
            return {content: content, cadre: cadre};
        };

        /**
         *
         * @param label : text to print
         * @param w : width
         * @param h : height
         * @param rgbCadre : color for rectangle
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
         * @param x : position
         * @param y : position
         * @param wi : width
         * @param h : height
         * @param fontSize
         * @param font
         * @param manipulator
         * @param layer
         */
        autoAdjustText = function (content, x, y, wi, h, fontSize, font, manipulator, layer = 1) {
            let words = content.split(' '),
                text = '',
                w = wi * 99 / 100,
                t = new svg.Text('text');
            manipulator.ordonator.set(layer, t);
            (fontSize) || (fontSize = 20);
            t.font(font ? font : 'Arial', fontSize);

            while (words.length > 0) {
                let word = words.shift();
                // set text to test the BBox.width
                t.message(text + ' ' + word);
                if (svg.runtime.boundingRect(t.component) && svg.runtime.boundingRect(t.component).width <= w) {
                    text += ' ' + word;
                } else {
                    let tmpStr = text + '\n' + word;
                    t.message(tmpStr);
                    if (svg.runtime.boundingRect(t.component).height <= (h - MARGIN)) {
                        if (svg.runtime.boundingRect(t.component).width <= w) {
                            text = tmpStr;
                        } else {
                            text += ' ';
                            let longWord = word;
                            for (let j = 0; j < longWord.length; j++) {
                                t.message(text + " " + longWord.charAt(j));
                                if (svg.runtime.boundingRect(t.component).width <= w) {
                                    text += longWord.charAt(j);
                                } else {
                                    text = text.slice(0, -1);
                                    j--;
                                    text += '-\n';
                                    words.unshift(longWord.slice(j));
                                    break;
                                }
                            }
                        }
                    } else {
                        text = text.slice(0, -2) + '…';
                        break;
                    }
                }
            }
            t.message(text.substring(1));
            let finalHeight = svg.runtime.boundingRect(t.component).height;
            (typeof finalHeight === 'undefined' && t.messageText !== '') && (finalHeight = runtime.boundingRect(t.component).height);
            (typeof finalHeight === 'undefined' && t.messageText === '') && (finalHeight = 0);
            let finalWidth = svg.runtime.boundingRect(t.component).width;
            (typeof finalWidth === 'undefined' && t.messageText !== '') && (finalWidth = runtime.boundingRect(t.component).width);
            (typeof finalWidth === 'undefined' && t.messageText === '') && (finalWidth = 0);
            t.position(0, Math.round((finalHeight - fontSize / 2) / 2));
            return {finalHeight, finalWidth, text: t};
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

        drawRedCross = function (x, y, size, manipulator) {
            var redCross = drawPlus(0, 0, size, size);
            redCross.size = size;
            redCross.color(myColors.red, 1, myColors.black);
            manipulator.rotator.rotate(45);
            manipulator.translator.move(x, y);
            return redCross;
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
         * @param side
         */
        Chevron = function (x, y, w, h, manipulator, side = "right") {
            let baseWidth = 160;
            let baseHeight = 300;
            let chevronManipulator = manipulator;
            if (side === "right") {
                this.chevron = new svg.Path(0, 0).line(-100, 100)
                    .cubic(-140, 140, -85, 185, -50, 150)
                    .line(60, 40)
                    .cubic(95, 5, 95, -5, 60, -40)
                    .line(-50, -150)
                    .cubic(-85, -190, -145, -140, -100, -100)
                    .line(0, 0);
            }
            else if (side === "left") {
                this.chevron = new svg.Path(0, 0).line(100, -100)
                    .cubic(140, -140, 85, -185, 50, -150)
                    .line(-60, -40)
                    .cubic(-95, -5, -95, 5, -60, 40)
                    .line(50, 150)
                    .cubic(85, 190, 145, 140, 100, 100)
                    .line(0, 0);
            }
            this.chevron.tempWidth = baseWidth;
            this.chevron.tempHeight = baseHeight;
            chevronManipulator.translator.move(x, y);
            chevronManipulator.ordonator.set(0, this.chevron);
            if (this.chevron.tempWidth > w) {
                this.chevron.tempHeight *= w / this.chevron.tempWidth;
                this.chevron.tempWidth = w;
            }
            if (this.chevron.tempHeight > h) {
                this.chevron.tempWidth *= h / this.chevron.tempHeight;
                this.chevron.tempHeight = h;
            }
            chevronManipulator.scalor.scale(this.chevron.tempHeight / baseHeight);
            this.chevron.activate = function (handler, eventType) {
                this._activated = true;
                this.color(myColors.black, 1, myColors.black);
                this.eventType = eventType;
                this.handler = handler;
                svg.addEvent(this, eventType, handler);
            };
            this.chevron.desactivate = function () {
                this._activated = false;
                this.color(myColors.grey, 1, myColors.grey);
                svg.addEvent(this, this.eventType, function () {
                });
            };
            return this.chevron;
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
            };
            svg.addEvent(svgItem, "mousedown", mousedownHandler);
        };

        drawStraightArrow = function (x1, y1, x2, y2) {
            var arrow = new svg.Arrow(3, 9, 15).position(x1, y1, x2, y2);
            var arrowPath = new svg.Path(x1, y1);
            for (let i = 0; i < arrow.points.length; i++) {
                arrowPath.line(arrow.points[i].x, arrow.points[i].y);
            }
            arrowPath.line(x1, y1);
            return arrowPath;
        };

        Arrow = function (parentGame, childGame) {
            var self = this;
            var parentGlobalPoint = parentGame.miniatureManipulator.last.globalPoint(0, parentGame.parentFormation.graphElementSize / 2);
            var parentLocalPoint = parentGame.parentFormation.graphManipulator.last.localPoint(parentGlobalPoint.x, parentGlobalPoint.y);
            var childGlobalPoint = childGame.miniatureManipulator.last.globalPoint(0, -childGame.parentFormation.graphElementSize / 2);
            var childLocalPoint = parentGame.parentFormation.graphManipulator.last.localPoint(childGlobalPoint.x, childGlobalPoint.y);

            self.redCrossManipulator = new Manipulator(self);
            self.redCross = drawRedCross((parentLocalPoint.x + childLocalPoint.x) / 2, (parentLocalPoint.y + childLocalPoint.y) / 2, 20, self.redCrossManipulator);
            self.redCrossManipulator.last.add(self.redCross);

            let removeLink = () => {
                for (let link = parentGame.parentFormation.link, i = link.length - 1; i >= 0; i--) {
                    if (link[i].childGame === childGame.id && link[i].parentGame === parentGame.id)
                        link.splice(i, 1);
                }
            };

            self.redCrossClickHandler = () => {
                removeLink();
                parentGame.parentFormation.arrowsManipulator.last.remove(self.arrowPath);
                parentGame.parentFormation.arrowsManipulator.last.remove(self.redCrossManipulator.first);
                parentGame.parentFormation.selectedArrow = null;
            };

            svg.addEvent(self.redCross, 'click', self.redCrossClickHandler);

            self.arrowPath = drawStraightArrow(parentLocalPoint.x, parentLocalPoint.y, childLocalPoint.x, childLocalPoint.y);
            self.selected = false;
            let arrowClickHandler = () => {
                parentGame.parentFormation.selectedGame && parentGame.parentFormation.selectedGame.icon.cadre.component.listeners.click();
                if (!self.selected) {
                    if (parentGame.parentFormation.selectedArrow) {
                        parentGame.parentFormation.selectedArrow.arrowPath.color(myColors.black, 1, myColors.black);
                        parentGame.parentFormation.selectedArrow.selected = false;
                        parentGame.parentFormation.arrowsManipulator.last.remove(parentGame.parentFormation.selectedArrow.redCrossManipulator.first);
                    }
                    parentGame.parentFormation.selectedArrow = self;
                    parentGame.parentFormation.arrowsManipulator.last.add(self.redCrossManipulator.first);
                    self.arrowPath.color(myColors.blue, 2, myColors.black);
                } else {
                    self.arrowPath.color(myColors.black, 1, myColors.black);
                    parentGame.parentFormation.arrowsManipulator.last.remove(self.redCrossManipulator.first);
                    parentGame.parentFormation.selectedArrow = null;
                }
                self.selected = !self.selected;
            };
            !globalVariables.playerMode && svg.addEvent(self.arrowPath, 'click', arrowClickHandler);
            self.arrowPath.color(myColors.black, 1, myColors.black);
            return self;
        };

        resetQuestionsIndex = function (quizz) {
            for (let i = 0; i < quizz.tabQuestions.length - 1; i++) {
                quizz.tabQuestions[i].questionNum = i + 1;
            }
        };
    }

    class Picture {
        constructor(src, editable, parent, textToDisplay) {
            this.editable = editable;
            this.src = src;
            this.editable && (this._acceptDrop = true);
            this.parent = parent;
            this.textToDisplay = textToDisplay;
        }

        draw(x, y, w, h, manipulator = this.parent.manipulator, textWidth) {
            this.width = w;
            this.height = h;
            if (this.editable) {
                this.drawImageRedCross(x, y, w, h, this.parent, manipulator);
            }
            if (this.textToDisplay) {
                this.imageSVG = displayImageWithTitle(this.textToDisplay, this.src, this.parent.image, w, h, this.parent.colorBordure, this.parent.bgColor, this.parent.fontSize, this.parent.font, manipulator, null, textWidth);
                svg.addEvent(this.imageSVG.image, 'mouseover', this.imageMouseoverHandler);
                svg.addEvent(this.imageSVG.image, 'mouseout', this.mouseleaveHandler);
                this.imageSVG.image._acceptDrop = this.editable;
            }
            else {
                this.imageSVG = new svg.Image(this.src).dimension(w, h);
                this.imageSVG.position(x, y);
                svg.addEvent(this.imageSVG, 'mouseover', this.imageMouseoverHandler);
                svg.addEvent(this.imageSVG, 'mouseout', this.mouseleaveHandler);
                this.imageSVG._acceptDrop = this.editable;
                manipulator.ordonator.set(this.parent.imageLayer, this.imageSVG);
            }

        }

        drawImageRedCross(x, y, w, h, parent, manipulator) {
            this.imageRedCrossClickHandler = ()=> {
                this.redCrossManipulator.flush();
                parent.imageLayer && manipulator.ordonator.unset(parent.imageLayer);//image
                if (parent.linkedQuestion) {
                    parent.linkedQuestion.image = null;
                    parent.linkedQuestion.imageSrc = null;
                }
                else {
                    parent.image = null;
                    parent.imageSrc = null;
                }
                if (parent.parent && parent.parent.questionPuzzle) {
                    parent.parent.questionPuzzle.display();
                }
                if (this.parent.parentQuestion) {
                    let puzzle = this.parent.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator.puzzle;
                    let x = -(puzzle.visibleArea.width - this.parent.width) / 2 + this.parent.puzzleColumnIndex * (puzzle.elementWidth + MARGIN);
                    let y = -(puzzle.visibleArea.height - this.parent.height) / 2 + this.parent.puzzleRowIndex * (puzzle.elementHeight + MARGIN) + MARGIN;
                    this.textToDisplay && this.parent.display(x, y, this.parent.width, this.parent.height);
                }
                else if (this.parent.answer) {
                    let questionCreator = this.parent.answer.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                    this.parent.display(questionCreator, questionCreator.previousX, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                }
                else {
                    this.parent.display();
                }

            };
            this.mouseleaveHandler = ()=> {
                this.redCrossManipulator.flush();
            };
            this.imageMouseoverHandler = ()=> {
                if (typeof this.redCrossManipulator === 'undefined') {
                    this.redCrossManipulator = new Manipulator(self);
                    this.redCrossManipulator.addOrdonator(2);
                    manipulator.last.add(this.redCrossManipulator.first);
                }
                let redCrossSize = 15;
                let redCross = this.textToDisplay ? drawRedCross(this.imageSVG.image.x + this.imageSVG.image.width / 2 - redCrossSize / 2, this.imageSVG.image.y - this.imageSVG.image.height / 2 + redCrossSize / 2, redCrossSize, this.redCrossManipulator)
                    : drawRedCross(this.imageSVG.x + this.imageSVG.width / 2 - redCrossSize / 2, this.imageSVG.y - this.imageSVG.height / 2 + redCrossSize / 2, redCrossSize, this.redCrossManipulator);

                svg.addEvent(redCross, 'click', this.imageRedCrossClickHandler);
                this.redCrossManipulator.ordonator.set(1, redCross);
            };
        }
    }

    class MiniatureGame {

        constructor(game, size) {
            this.game = game;
            this.scoreSize = 13;
            this.icon = displayTextWithCircle(game.title, size, size - this.scoreSize - MARGIN, myColors.black, myColors.white, 20, null, game.miniatureManipulator);
            this.redCrossManipulator = new Manipulator(this);
            this.redCross = drawRedCross(size / 2, -size / 2, 20, this.redCrossManipulator);
            (this.redCrossManipulator.last.children.indexOf(this.redCross) === -1) && this.redCrossManipulator.last.add(this.redCross);

            svg.addEvent(this.redCross, 'click', () => this.redCrossClickHandler());
            this.selected = false;

            !globalVariables.playerMode && svg.addEvent(this.icon.cadre, 'click', () => this.miniatureClickHandler());
            !globalVariables.playerMode && svg.addEvent(this.icon.content, 'click', () => this.miniatureClickHandler());
            this.icon.cadre.color(myColors.white, 1, myColors.black);

            if (globalVariables.playerMode) {
                this.drawProgressIcon(this, game, size);
            }
        }

        redCrossClickHandler() {
            this.removeAllLinks();
            this.game.parentFormation.miniaturesManipulator.last.remove(this.game.miniatureManipulator.first);
            this.game.miniatureManipulator.ordonator.unset(0);
            this.game.miniatureManipulator.ordonator.unset(1);
            this.game.miniatureManipulator.last.remove(this.redCrossManipulator.first);
            var indexes = this.game.getPositionInFormation();
            var longestLevelCandidates = this.game.parentFormation.findLongestLevel();

            if (longestLevelCandidates.length === 1 && (indexes.levelIndex === longestLevelCandidates.index) && (this.game.parentFormation.levelWidth > this.game.parentFormation.graphCreaWidth)) {
                this.game.parentFormation.levelWidth -= (this.game.parentFormation.graphElementSize + this.game.parentFormation.minimalMarginBetweenGraphElements);
                this.game.parentFormation.movePanelContent();
            }
            this.game.parentFormation.levelsTab[indexes.levelIndex].removeGame(indexes.gameIndex);
            var levelsTab = this.game.parentFormation.levelsTab;
            while (levelsTab.length > 0 && levelsTab[levelsTab.length - 1].gamesTab.length === 0) {
                levelsTab[levelsTab.length - 1].manipulator.ordonator.unset(2);
                levelsTab[levelsTab.length - 1].manipulator.ordonator.remove(levelsTab[levelsTab.length - 1].obj.text);
                this.game.parentFormation.levelsTab.pop();
            }

            this.game.parentFormation.selectedGame.selected = false;
            this.game.parentFormation.selectedGame = null;
            this.game.parentFormation.displayGraph();
        }

        removeAllLinks() {
            for (let link = this.game.parentFormation.link, i = link.length - 1; i >= 0; i--) {
                if (link[i].childGame === this.game.id || link[i].parentGame === this.game.id)
                    link.splice(i, 1);
            }
        }

        miniatureClickHandler() {
            this.game.parentFormation.selectedArrow && this.game.parentFormation.selectedArrow.arrowPath.component.listeners.click();
            if (!this.selected) {
                if (this.game.parentFormation.selectedGame) {
                    this.game.parentFormation.selectedGame.icon.cadre.color(myColors.white, 1, myColors.black);
                    this.game.parentFormation.selectedGame.selected = false;
                    !globalVariables.playerMode && (this.game.parentFormation.selectedGame.game.miniatureManipulator.last.children
                        .indexOf(this.game.parentFormation.selectedGame.redCrossManipulator.first) !== -1)
                    && this.game.parentFormation.selectedGame.game.miniatureManipulator.last
                        .remove(this.game.parentFormation.selectedGame.redCrossManipulator.first);
                }
                this.game.parentFormation.selectedGame = this;
                !globalVariables.playerMode && this.game.miniatureManipulator.last.add(this.redCrossManipulator.first);
                this.icon.cadre.color(myColors.white, 2, SELECTION_COLOR);
            } else {
                this.icon.cadre.color(myColors.white, 1, myColors.black);
                !globalVariables.playerMode && this.game.miniatureManipulator.last.remove(this.redCrossManipulator.first);
                this.game.parentFormation.selectedGame = null;
            }
            this.selected = !this.selected;
        }

        drawProgressIcon(miniatureObject, object, size) {
            let iconsize = 20;
            miniatureObject.infosManipulator = new Manipulator(miniatureObject);
            miniatureObject.infosManipulator.addOrdonator(4);
            switch (object.status) {
                case "notAvailable":
                    miniatureObject.icon.cadre.color(myColors.grey, 1, myColors.black);
                    break;
                case "done":
                    var iconInfos = drawCheck(size / 2, -size / 2, iconsize);
                    iconInfos.color(myColors.none, 5, myColors.green);
                    let rect = new svg.Rect(iconsize, iconsize);
                    rect.color(myColors.white, 1, myColors.green);
                    rect.position(size / 2, -size / 2);
                    miniatureObject.infosManipulator.ordonator.set(0, rect);
                    miniatureObject.infosManipulator.ordonator.set(1, iconInfos);
                    let resultString = object.tabQuestions.length - object.questionsWithBadAnswers.length + " / " + object.tabQuestions.length;
                    object.miniatureManipulator.last.add(miniatureObject.infosManipulator.first);
                    let result = autoAdjustText(resultString, 0, 0, size / 2, size / 2, this.scoreSize, "Arial", object.miniatureManipulator, 2);
                    result.text.position(0, size / 2 - MARGIN / 2);
                    break;
                case "inProgress":
                    var iconInfos = new svg.Circle(iconsize / 2).color(myColors.white, 1, myColors.orange).position(size / 2, -size / 2);
                    let iconInfosdot1 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2 - iconsize / 4, -size / 2);
                    let iconInfosdot2 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2, -size / 2);
                    let iconInfosdot3 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2 + iconsize / 4, -size / 2);
                    miniatureObject.infosManipulator.ordonator.set(0, iconInfos);
                    miniatureObject.infosManipulator.ordonator.set(1, iconInfosdot1);
                    miniatureObject.infosManipulator.ordonator.set(2, iconInfosdot2);
                    miniatureObject.infosManipulator.ordonator.set(3, iconInfosdot3);
                    object.miniatureManipulator.last.add(miniatureObject.infosManipulator.first);
                    break;
            }
        };

    }

    class MiniatureFormation {

        constructor(formation) {
            this.miniatureManipulator = new Manipulator();
            this.miniatureManipulator.addOrdonator(2);
            this.iconManipulator = new Manipulator();
            this.iconManipulator.addOrdonator(4);
            this.formation = formation;
        }

        display(x, y, w, h) {
            this.formation.parent.formationsManipulator.last.children.indexOf(this.miniatureManipulator.first) === -1 && this.formation.parent.formationsManipulator.last.add(this.miniatureManipulator.first);

            this.miniature = displayText(this.formation.label, w, h, myColors.black, myColors.white, null, null, this.miniatureManipulator);
            this.miniature.cadre.corners(50, 50);

            let iconSize = this.formation.parent.iconeSize,
                icon = this.formation.status.icon(iconSize);

            for (let i = 0; i < icon.elements.length; i++) {
                this.iconManipulator.ordonator.set(i, icon.elements[i]);
            }
            this.iconManipulator.translator.move(w / 2 - iconSize + MARGIN + 2, -h / 2 + iconSize - MARGIN - 2);//2Pxl pour la largeur de cadre

            this.miniatureManipulator.translator.move(x, y);
            this.miniatureManipulator.last.children.indexOf(this.iconManipulator.first) === -1 && this.miniatureManipulator.last.add(this.iconManipulator.first);
            this.drawIcon();
        }

        drawIcon() {
            let iconsize = 20,
                size = 25,
                iconInfos;
            switch (this.formation.progress) {
                case "done":
                    iconInfos = drawCheck(size / 2, -size / 2, iconsize);
                    iconInfos.color(myColors.none, 5, myColors.green);
                    let rect = new svg.Rect(iconsize, iconsize);
                    rect.color(myColors.white, 1, myColors.green);
                    rect.position(size / 2, -size / 2);
                    this.iconManipulator.ordonator.set(0, rect);
                    this.iconManipulator.ordonator.set(1, iconInfos);
                    this.miniatureManipulator.last.add(this.iconManipulator.first);
                    break;
                case "inProgress":
                    iconInfos = new svg.Circle(iconsize / 2).color(myColors.white, 1, myColors.orange).position(size / 2, -size / 2);
                    let iconInfosdot1 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2 - iconsize / 4, -size / 2);
                    let iconInfosdot2 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2, -size / 2);
                    let iconInfosdot3 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2 + iconsize / 4, -size / 2);
                    this.iconManipulator.ordonator.set(0, iconInfos);
                    this.iconManipulator.ordonator.set(1, iconInfosdot1);
                    this.iconManipulator.ordonator.set(2, iconInfosdot2);
                    this.iconManipulator.ordonator.set(3, iconInfosdot3);
                    this.miniatureManipulator.last.add(this.iconManipulator.first);
                    break;
            }
        }

        setHandler(handler) {
            if (this.miniature.cadre) {
                svg.addEvent(this.miniature.cadre, "click", () => {
                    handler(this.formation);
                });
            }
            if (this.miniature.content) {
                svg.addEvent(this.miniature.content, "click", () => {
                    handler(this.formation);
                });
            }
            if (this.miniature.image) {
                svg.addEvent(this.miniature.image, "click", () => {
                    handler(this.formation);
                });
            }
        }
    }

    class ReturnButton {
        constructor(parent, label) {
            this.parent = parent;
            this.labelDefault = "Retour"
            this.label = label ? label : this.labelDefault;
            this.manipulator = this.parent.returnButtonManipulator || (this.parent.returnButtonManipulator = new Manipulator(this.parent));
            this.manipulator.addOrdonator(1);
            this.chevronManipulator = new Manipulator(this.parent).addOrdonator(1);
            this.manipulator.last.add(this.chevronManipulator.first);
        }

        setHandler(returnHandler) {
            svg.addEvent(this.returnButton, "click", returnHandler);
            svg.addEvent(this.returnText, "click", returnHandler);
        }

        display(x, y, w, h) {
            this.returnText = new svg.Text(this.label);
            this.returnButton = Chevron(0, 0, w, h, this.chevronManipulator, "left");
            this.returnButton.color(myColors.black, 0, []);
            this.returnText.font("Arial", 20).anchor("start").position(0, 0);
            let textSize = svg.runtime.boundingRect(this.returnText.component);
            let returnButtonSize = svg.runtime.boundingRect(this.returnButton.component);
            this.manipulator.ordonator.set(0, this.returnText);
            this.returnText.position(w + returnButtonSize.width, textSize.height / 2 + returnButtonSize.height / 4);
            this.manipulator.translator.move(x + w, y);

            this.returnText.parentObj = this;
            this.returnButton.parentObj = this;
        }
    }

    class Puzzle {
        constructor(rows, columns, elementsArray, orientation = "upToDown", parentObject) {
            this.rows = rows;
            this.columns = columns;
            this.nbOfVisibleElements = this.rows * this.columns;
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(this.nbOfVisibleElements + 3); // Pour les chevrons
            this.leftChevronManipulator = new Manipulator(this);
            this.leftChevronManipulator.addOrdonator(3);
            this.rightChevronManipulator = new Manipulator(this);
            this.rightChevronManipulator.addOrdonator(3);
            this.elementsArray = elementsArray;
            this.visibleElementsArray = [];
            this.indexOfFirstVisibleElement = 0;
            this.fillVisibleElementsArray(orientation);
            this.chevronMaxSize = 75;
            this.chevronMinSize = 15;
            this.orientation = orientation;
            this.parentObject = parentObject;
        }

        updateElementsArray(newElementsArray) {
            this.elementsArray = newElementsArray;
        }

        drawChevrons() {
            var self = this;
            this.leftChevron = new Chevron((this.chevronSize - this.width) / 2, 0, this.chevronSize, this.chevronSize, this.leftChevronManipulator, "left");
            this.rightChevron = new Chevron((this.width - this.chevronSize) / 2, 0, this.chevronSize, this.chevronSize, this.rightChevronManipulator, "right");
            this.leftChevron.handler = function () {
                self.updateStartPosition("left");
                self.fillVisibleElementsArray(self.orientation);
                self.display();
            };
            this.rightChevron.handler = function () {
                self.updateStartPosition("right");
                self.fillVisibleElementsArray(self.orientation);
                self.display();
            };
            this.updateChevrons();
            let updateLeftChevron = this.leftChevron && this.leftChevron._activated;
            let updateRightChevron = this.rightChevron && this.rightChevron._activated;
            updateLeftChevron ? this.leftChevron.activate(this.leftChevron.handler, "click") : this.leftChevron.desactivate();
            updateRightChevron ? this.rightChevron.activate(this.rightChevron.handler, "click") : this.rightChevron.desactivate();
            this.manipulator.ordonator.set(1, this.leftChevronManipulator.first);
            this.manipulator.ordonator.set(2, this.rightChevronManipulator.first);
        }

        hideChevrons() {
            this.manipulator.ordonator.unset(1);
            this.manipulator.ordonator.unset(2);
        }

        updateChevrons() {
            if (this.indexOfFirstVisibleElement === 0) {
                this.leftChevron && this.leftChevron.desactivate();
                this.rightChevron && this.rightChevron.activate(this.rightChevron.handler, 'click');
            }
            else if (this.indexOfFirstVisibleElement + this.nbOfVisibleElements < this.elementsArray.length) {
                this.leftChevron && this.leftChevron.activate(this.leftChevron.handler, 'click');
                this.rightChevron && this.rightChevron.activate(this.rightChevron.handler, 'click');
            }
            else {
                this.rightChevron && this.rightChevron.desactivate();
                this.rightChevron && this.leftChevron.activate(this.leftChevron.handler, 'click');
            }
        }

        updateStartPosition(leftOrRight) {
            if (leftOrRight === 'right') {
                var orientation = 1;
            }
            else if (leftOrRight === 'left') {
                orientation = -1;
            }
            if (this.columns === 1) {
                this.indexOfFirstVisibleElement += orientation;
            }
            else {
                let shift = (this.columns - 1) * this.rows * orientation;
                let temporaryIndex = this.indexOfFirstVisibleElement + shift;
                if (temporaryIndex > 0) {
                    let overflow = (temporaryIndex + shift) - (this.elementsArray.length);
                    let result = ((overflow / this.rows) % 1 === 0) ? overflow / this.rows : Math.floor(overflow / this.rows) + 1;
                    if (result > 0) {
                        temporaryIndex -= result * this.rows + 1;
                    }
                }
                else {
                    temporaryIndex = 0;

                }
                this.indexOfFirstVisibleElement = temporaryIndex;
            }
            this.updateChevrons();
        }

        fillVisibleElementsArray(orientation) {
            this.visibleElementsArray = [];
            if (orientation === "leftToRight") {
                var count = this.indexOfFirstVisibleElement;
                var stop = Math.min(this.elementsArray.length, ((this.indexOfFirstVisibleElement + 1) + this.nbOfVisibleElements));
                for (var row = 0; row < this.rows; row++) {
                    var rowArray = [];
                    for (var column = 0; column < this.columns; column++) {
                        let index = count;
                        if (typeof this.elementsArray[index] !== "undefined") {
                            (this.elementsArray[index].puzzleRowIndex = row);
                            (this.elementsArray[index].puzzleColumnIndex = column);
                            count++;
                            rowArray.push(this.elementsArray[this.indexOfFirstVisibleElement + (this.rows - 1) * row * this.columns + column]);
                        }
                    }
                    this.visibleElementsArray.push(rowArray);
                    if (count >= stop) {
                        return true;
                    }
                }
            } else if (orientation === "upToDown") {
                var count = this.indexOfFirstVisibleElement;
                var stop = Math.min(this.elementsArray.length, ((this.indexOfFirstVisibleElement + 1) + this.nbOfVisibleElements));
                for (var column = 0; column < this.columns; column++) {
                    var columnsArray = [];
                    for (var row = 0; row < this.rows; row++) {
                        let index = count;
                        if (this.elementsArray[index]) {
                            this.elementsArray[index].puzzleRowIndex = row;
                            this.elementsArray[index].puzzleColumnIndex = column;
                            count++;
                            columnsArray.push(this.elementsArray[index]);
                        }
                    }
                    this.visibleElementsArray.push(columnsArray);
                    if (count >= stop) {
                        return true;
                    }
                }
            }
        }

        adjustElementsDimensions() {
            this.elementWidth = (this.visibleArea.width - MARGIN * (this.columns - 1)) / this.columns;
            this.elementHeight = (this.visibleArea.height - MARGIN * (this.rows + 1)) / this.rows;
            for (var i = this.indexOfFirstVisibleElement; i < this.indexOfFirstVisibleElement + this.nbOfVisibleElements; i++) {
                if (typeof this.elementsArray[i] !== "undefined") {
                    this.elementsArray[i].width = this.elementWidth;
                    this.elementsArray[i].height = this.elementHeight;
                }
            }
        }

        adjustElementsPositions() {
            for (var i = this.indexOfFirstVisibleElement; i < this.indexOfFirstVisibleElement + this.nbOfVisibleElements; i++) {
                if (typeof this.elementsArray[i] !== "undefined") {
                    this.elementsArray[i].x = -(this.visibleArea.width - this.elementsArray[i].width) / 2 + this.elementsArray[i].puzzleColumnIndex * (this.elementWidth + MARGIN);
                    this.elementsArray[i].y = -(this.visibleArea.height - this.elementsArray[i].height) / 2 + this.elementsArray[i].puzzleRowIndex * (this.elementHeight + MARGIN) + MARGIN;
                }
            }
        }

        display(x, y, w, h, needChevrons = true) {
            if (this.parentObject.indexOfEditedQuestion) {
                this.elementsArray[this.parentObject.indexOfEditedQuestion].manipulator.flush();// questionPuzzle
            }

            (typeof x !== "undefined") && (this.x = x);
            (typeof y !== "undefined") && (this.y = y);
            (typeof w !== "undefined") && (this.width = w);
            (typeof h !== "undefined") && (this.height = h);
            this.manipulator.translator.move(this.x, this.y);
            this.chevronSize = Math.max(Math.min(this.height * 0.15, this.width * 0.1, this.chevronMaxSize), this.chevronMinSize);
            this.visibleArea = {
                width: needChevrons ? (this.width - 2 * this.chevronSize) : (this.width),
                height: this.height
            };
            this.chevronsDisplayed = ((this.elementsArray.length > this.rows * this.columns) && needChevrons);
            this.chevronsDisplayed ? this.drawChevrons() : this.hideChevrons(); // Ajouter les Events et gérer les couleurs
            this.adjustElementsDimensions();
            this.adjustElementsPositions();
            let itNumber = 0;
            for (var i = 3; i < this.nbOfVisibleElements + 3; i++) {
                this.manipulator.ordonator.unset(i);
            }
            this.visibleElementsArray.forEach(it => {
                it.forEach(elem => {
                    let layer = this.orientation === "leftToRight" ? itNumber * this.columns + it.indexOf(elem) + 3 : itNumber * this.rows + it.indexOf(elem) + 3;
                    this.manipulator.ordonator.set(layer, elem.manipulator.first); // +2 pour les chevrons + 1 cadre
                    elem.display(elem.x, elem.y, elem.width, elem.height);
                });
                itNumber++;
            });
        }
    }

    class Server {
        constructor() {
        }

        static getAllFormationsNames() {
            return dbListener.httpGetAsync('/getAllFormationsNames')
        }

        static getFormationByName(name) {
            return dbListener.httpGetAsync("/getFormationByName/" + name)
        }

        static connect(mail, password) {
            return dbListener.httpPostAsync('/auth/connect/', {mailAddress: mail, password: password})
        }

        static inscription(user) {
            return dbListener.httpPostAsync('/inscription', user)
        }

        static checkCookie() {
            return dbListener.httpGetAsync('/auth/verify/')
        }

        static getUserByMail(mail) {
            return dbListener.httpGetAsync("/getUserByMailAddress/" + mail)
        }

        static getFormationById(id) {
            return dbListener.httpGetAsync("/getFormationById/" + id)
        }

        static sendProgressToServer(quiz) {
            var data = {
                indexQuestion: quiz.currentQuestionIndex + 1,
                tabWrongAnswers: [],
                game: quiz.id,
                formation: quiz.parentFormation._id
            };
            quiz.questionsWithBadAnswers.forEach(x => data.tabWrongAnswers.push(x.questionNum));
            return dbListener.httpPostAsync("/sendProgress", data)
        }

        static getUser() {
            return dbListener.httpGetAsync("/getUser")
        }

        static replaceFormation(id, newFormation, ignoredData) {
            return dbListener.httpPostAsync("/replaceFormation/" + id, newFormation, ignoredData)
        }

        static insertFormation(newFormation, ignoredData) {
            return dbListener.httpPostAsync("/insert", newFormation, ignoredData)
        }

        static replaceQuizz(newQuizz, id, levelIndex, gameIndex, ignoredData) {
            return dbListener.httpPostAsync('/replaceQuizz/' + id + "/" + levelIndex + "/" + gameIndex, newQuizz, ignoredData)
        }
    }

    function Bdd() {
        HEADER_SIZE = 0.05;
        REGEX = /^([A-Za-z0-9.éèêâàîïëôûùö ©,;°?!'"-]){0,150}$/g;
        FORMATION_TITLE_REGEX = /^([A-Za-z0-9.,;:!?()éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ '-]){0,50}$/g;
        REGEX_ERROR = "Seuls les caractères alphanumériques, avec accent et \"-,',.;?!°© sont permis.";
        REGEX_ERROR_FORMATION = "Le nom de la formation doit être composé de moins de 50 caractères: alphanumériques ou .,;:!?()";
        EMPTY_FIELD_ERROR = "Veuillez remplir tous les champs";
        MARGIN = 10;
        myParentsList = ["parent", "answersManipulator", "validateManipulator", "parentElement", "manipulator",
            "resetManipulator", "manipulator", "manipulatorQuizzInfo", "questionCreatorManipulator",
            "previewButtonManipulator", "saveQuizButtonManipulator", "saveFormationButtonManipulator", "toggleButtonManipulator", "manipulator",
            "mainManipulator", "quizzManipulator", "resultManipulator", "scoreManipulator", "quizzManager",
            "quizzInfoManipulator", "returnButtonManipulator", "questionPuzzleManipulator", "component", "drawing",
            "answerParent", "obj", "checkbox", "cadre", "content", "parentQuizz", "selectedAnswers", "linkedQuestion",
            "leftArrowManipulator", "rightArrowManipulator", "virtualTab", "questionWithBadAnswersManipulator",
            "editor", "miniatureManipulator", "parentFormation", "formationInfoManipulator", "parentGames", "returnButton",
            "simpleChoiceMessageManipulator", "arrowsManipulator", "miniaturesManipulator", "miniature", "previewMode", "miniaturePosition",
            "resultArea", "questionArea", "titleArea", "redCrossManipulator", "parentQuestion", "questionsWithBadAnswers", "score", "currentQuestionIndex",
            "linesManipulator", "penManipulator", "blackCrossManipulator", "miniaturesManipulator", "toggleFormationsManipulator", "iconManipulator", "infosManipulator", "manip",
            "formationsManipulator", "miniatureManipulator", "miniatureObject.infosManipulator"];

        ignoredData = (key, value) => myParentsList.some(parent => key === parent) || value instanceof Manipulator ? undefined : value;

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
            pink: [255, 20, 147],
            brown: [128, 0, 0],
            primaryGreen: [0, 255, 0],
            darkerGreen: [34, 179, 78],
            none: []
        };

        myImagesSourceDimensions = {
            "../resource/littleCat.png": {width: 80, height: 50},
            "../resource/millions.png": {width: 1024, height: 1024},
            "../resource/pomme.jpg": {width: 925, height: 1000},
            "../resource/hollandeContent.jpg": {width: 166, height: 200},
            "../resource/folder.png": {width: 256, height: 256},
            "../resource/flanders.png": {width: 225, height: 225},
            "../resource/flamantRose.jpg": {width: 183, height: 262},
            "../resource/ChatTim.jpg": {width: 480, height: 640},
            "../resource/cerise.jpg": {width: 2835, height: 2582},
            "../resource/cat.png": {width: 1920, height: 1200}
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
                {
                    label: "Question 1", imageSrc: null, multipleChoice: true,
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
            title: "Quiz n°1",
            bgColor: myColors.raspberry,
            puzzleLines: 3,
            puzzleRows: 1,
            parentFormation: {label: "Qui veut gagner des millions ?"},
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
                //            label: "1998", imageSrc: null, crrect: false,
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
            // Check 1 Correct Answer:
            question => ({
                isValid: question.tabAnswer && question.tabAnswer.some(el => el.correct),
                message: "Votre question doit avoir une bonne réponse."
            }),
            // Check answer's name:
            question => ({
                isValid: question.tabAnswer.every(el => (el.label || el.imageSrc)),
                message: "Vous devez remplir toutes les réponses."
            }),
            // Check Question Name:
            question => ({
                isValid: !!(question.label || question.imageSrc),
                message: "Vous devez remplir le nom de la question."
            }),
            // Check Quiz Name:
            question => ({
                isValid: ( question.parentQuizz.title !== "" && question.parentQuizz.title !== undefined),
                message: "Vous devez remplir le nom du quiz."
            })
        ];

        multipleAnswerValidationTab = [
            // Check answer's name:
            question => ({
                isValid: question.tabAnswer.every(el => (el.label || el.imageSrc)),
                message: "Vous devez remplir toutes les réponses."
            }),
            // Check Question Name:
            question => ({
                isValid: !!(question.label || question.imageSrc),
                message: "Vous devez remplir le nom de la question."
            }),
            // Check Quiz Name:
            question => ({
                isValid: ( question.parentQuizz.title !== "" && question.parentQuizz.title !== undefined),
                message: "Vous devez remplir le nom du quiz."
            })
        ];

        myQuestionType = {
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
                icon: () => ({elements: []})
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

    return {
        SVGGlobalHandler,
        setGlobalVariables,
        SVGUtil,
        Bdd,
        Drawings,
        Manipulator,
        MiniatureGame,
        MiniatureFormation,
        Picture,
        Puzzle,
        ReturnButton,
        Server
    }
};
