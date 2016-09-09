exports.Util = function (globalVariables) {

    let
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        dbListener = globalVariables.dbListener,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        playerMode = globalVariables.playerMode,
        AddEmptyElement,
        Quizz,
        Bd,
        Answer,
        Question,
        QuestionCreator;

    setGlobalVariables = () => {
        runtime = globalVariables.runtime;
        drawing = globalVariables.drawing;
        drawings = globalVariables.drawings;
        dbListener = globalVariables.dbListener;
        svg = globalVariables.svg;
        gui = globalVariables.gui;
        playerMode = globalVariables.playerMode;
        AddEmptyElement = globalVariables.domain.AddEmptyElement;
        Quizz = globalVariables.domain.Quizz;
        Bd = globalVariables.domain.Bd;
        Answer = globalVariables.domain.Answer;
        Question = globalVariables.domain.Question;

    };

    function SVGGlobalHandler() {

        /* istanbul ignore next */
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

        lastLayerOrdonator() {
            return this.ordonator.children.length - 1;
        }

        flush() {
            const clean = (handler) => {
                // if (handler.noFlush) return;
                if ((handler instanceof svg.Ordered)) {
                    handler.children.forEach(function (child, index) {
                        if ((child instanceof svg.Handler)) {
                            clean(child);
                        } else {
                            handler.unset(index);
                        }
                    })
                } else {
                    for (let j = handler.children.length - 1; j >= 0; j--) {
                        if (handler.children[j] instanceof svg.Handler) {
                            clean(handler.children[j]);
                        } else {
                            handler.remove(handler.children[j]);
                        }
                    }
                }
            };
            clean(this.translator);
            return this;
        }

        move(x, y) {
            this.translator.move(x, y)
            return this;
        }

        rotate(angle) {
            this.rotator.rotate(angle)
            return this;
        }

        scale(scaleX, scaleY) {
            this.scalor.scale(scaleX, scaleY)
            return this;
        }

        set(layer, component) {
            if (component instanceof Manipulator) {
                component = component.first;
            }
            this.ordonator.set(layer, component)
            return this;
        }

        unset(layer) {
            this.ordonator.unset(layer)
            return this;
        }

        add(svgObject) {
            let component;
            if (svgObject instanceof Manipulator) {
                component = svgObject.first;
            } else {
                component = svgObject;
            }
            if (this.scalor.children.indexOf(component) === -1) {
                this.last.add(component);
            }
            return this;
        }

        remove(svgObject) {
            let component;
            if (svgObject instanceof Manipulator) {
                component = svgObject.first;
            } else {
                component = svgObject;
            }
            if (this.scalor.children.indexOf(component) !== -1) {
                this.last.remove(component);
            }
            return this;
        }

    }

    class Drawings {
        constructor(w, h, anchor = "content") {
            this.screen = new svg.Screen(w, h).show(anchor);
            this.drawing = new svg.Drawing(w, h);
            this.screen.add(this.drawing);
            this.drawing.manipulator = new Manipulator(this);
            this.drawing.manipulator.addOrdonator(4);
            this.piste = new Manipulator(this);
            this.glass = new svg.Rect(w, h).position(w / 2, h / 2).opacity(0.001).color(myColors.white);
            this.glass.mark('bigGlass');
            this.drawing.add(this.drawing.manipulator.translator);
            this.background = this.drawing.manipulator.translator;
            this.drawing.manipulator.set(2, this.piste);
            this.drawing.add(this.glass);
            this.screen.empty = (survival)=> {
                for (let i = drawings.screen.children.length; i >= 0; i--) {
                    drawings.screen.children[i] !== drawing && drawings.screen.children[i] !== survival && drawings.screen.remove(drawings.screen.children[i]);
                }
            };

            const onmousedownHandler = event => {
                svg.activeElement() && svg.activeElement().blur(); //document.activeElement.blur();
                this.target = this.background.getTarget(event.pageX, event.pageY);
                this.drag = this.target;
                // console.log("Mouse: ( X : " + event.pageX + " ; " + "Y : " + event.pageY + " )");
                // Rajouter des lignes pour target.border et target.image si existe ?
                if (this.target) {
                    svg.event(this.target, "mousedown", event);
                }
            };
            svg.addEvent(this.glass, "mousedown", onmousedownHandler);

            const onmousemoveHandler = event => {
                this.target = this.drag || this.background.getTarget(event.pageX, event.pageY);
                if (this.drawing.mousedOverTarget && this.drawing.mousedOverTarget.target) {
                    const bool = this.drawing.mousedOverTarget.target.inside(event.pageX, event.pageY);
                    if (this.drawing.mousedOverTarget.target.component.listeners && this.drawing.mousedOverTarget.target.component.listeners.mouseout && !bool) {
                        svg.event(this.drawing.mousedOverTarget.target, "mouseout", event);
                        this.drawing.mousedOverTarget = null;
                    }
                }
                if (this.target) {
                    svg.event(this.target, "mousemove", event);
                    if (this.target.component.listeners && this.target.component.listeners.mouseover) {
                        this.drawing.mousedOverTarget = {target: this.target};
                        svg.event(this.target, "mouseover", event);
                    }
                }
            };
            svg.addEvent(this.glass, "mousemove", onmousemoveHandler);

            const ondblclickHandler = event => {
                this.target = this.background.getTarget(event.pageX, event.pageY);
                if (this.target) {
                    svg.event(this.target, "dblclick", event);
                }
            };
            svg.addEvent(this.glass, "dblclick", ondblclickHandler);

            const onmouseupHandler = event => {
                this.target = this.drag || this.background.getTarget(event.pageX, event.pageY);
                if (this.target) {
                    svg.event(this.target, "mouseup", event);
                    svg.event(this.target, "click", event);
                }
                this.drag = null;
            };
            svg.addEvent(this.glass, "mouseup", onmouseupHandler);

            const onmouseoutHandler = event => {
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

        sort = function mergeSort(array, isSmaller) {
            'use strict';
            if (array.length < 2) {
                return array;
            }

            const center = Math.floor(array.length / 2);
            const left = mergeSort(array.slice(0, center), isSmaller);
            const right = mergeSort(array.slice(center), isSmaller);

            const mergeFunc = function merge(arr1, arr2, isSmaller) {
                if (arr1.length === 0) {
                    return arr2;
                }
                if (arr2.length === 0) {
                    return arr1;
                }
                if (isSmaller(arr1[0], arr2[0])) {
                    return [arr1[0]].concat(merge(arr1.slice(1), arr2, isSmaller));
                } else {
                    return [arr2[0]].concat(merge(arr1, arr2.slice(1), isSmaller));
                }
            };
            return mergeFunc(left, right, isSmaller);
        };

        getComplementary = function (tab) {
            return [255 - tab[0], 255 - tab[1], 255 - tab[2]];
        };

        onclickFunction = function (event) {
            var target = drawings.background.getTarget(event.pageX, event.pageY);
            var sender = null;
            target.answerParent && (sender = target.answerParent);
            var editor = (sender.editor.linkedQuestion ? sender.editor : sender.editor.parent);
            !editor.multipleChoice && editor.linkedQuestion.tabAnswer.forEach(answer => {
                answer.correct = (answer !== sender) ? false : answer.correct;
            });
            sender.correct = !sender.correct;
            sender.correct && drawPathChecked(sender, sender.x, sender.y, sender.size);
            updateAllCheckBoxes(sender);
            let quizzManager = sender.parentQuestion.parentQuizz.parentFormation.quizzManager;
            quizzManager.displayQuestionsPuzzle(null, null, null, null, quizzManager.questionPuzzle.indexOfFirstVisibleElement);
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
            sender.manipulator.set(4, sender.obj.checked);
        };

        updateAllCheckBoxes = function (sender) {
            var editor = (sender.editor.linkedQuestion ? sender.editor : sender.editor.parent);
            editor.linkedQuestion.tabAnswer.forEach(answer => {
                if (answer.editable && answer.obj.checkbox) {
                    answer.obj.checkbox.color(myColors.white, 2, myColors.black);
                    !answer.correct && answer.manipulator.unset(4);
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
            sender.manipulator.set(3, sender.obj.checkbox);
            !sender.correct && sender.manipulator.unset(4);
            sender.correct && drawPathChecked(sender, x, y, size);
            return sender.obj;
        };

        drawVideoIcon = function (x, y, size, parentObject) {
            const
                bigSquare = new svg.Rect(9 * size / 10, size).color(myColors.white, 1, myColors.black).position(x, y).corners(2, 2),
                smallSquare = new svg.Rect(4 * size / 9, 4 * size / 9).color(myColors.black).corners(2, 2).position(-size / 10, size / 10),
                whiteTriangle = new svg.Triangle(Math.sqrt(4 * size), Math.sqrt(4 * size) / 2, "S").color(myColors.white, 1, myColors.black).position(0, size / 2),
                invisibleTriangle = new svg.Triangle(Math.sqrt(4 * size), Math.sqrt(4 * size) / 2, "N").color(myColors.white, 2, myColors.white).position(0, size / 2 - Math.sqrt(4 * size) / 2 - 1),
                blackTriangle = new svg.Triangle(Math.sqrt(4 * size) / 2, Math.sqrt(4 * size), "W").color(myColors.black, 1, myColors.black).position(size / 4, size / 10);

            const manipulator = new Manipulator(parentObject).addOrdonator(3);
            manipulator.set(0, bigSquare);
            const cameraManipulator = new Manipulator(parentObject).addOrdonator(2);
            cameraManipulator.move(x, y);
            cameraManipulator.set(0, smallSquare);
            cameraManipulator.set(1, blackTriangle);
            manipulator.set(1, cameraManipulator);
            const trianglesManipulator = new Manipulator(parentObject).addOrdonator(2);
            trianglesManipulator.rotate(45);
            trianglesManipulator.move(x + size - 5 * size / 12, y - size + size / 3);
            trianglesManipulator.set(0, whiteTriangle);
            trianglesManipulator.set(1, invisibleTriangle);
            manipulator.set(2, trianglesManipulator);

            manipulator.mark = (id) => {
                bigSquare.mark(id);
                smallSquare.mark(id);
                whiteTriangle.mark(id);
                invisibleTriangle.mark(id);
                blackTriangle.mark(id);
            };

            manipulator.setHandler = (event, handler) => {
                svg.addEvent(bigSquare, event, handler);
                svg.addEvent(smallSquare, event, handler);
                svg.addEvent(whiteTriangle, event, handler);
                svg.addEvent(invisibleTriangle, event, handler);
                svg.addEvent(blackTriangle, event, handler);
            };

            // manipulator._acceptDrop = () => {
            //     bigSquare._acceptDrop=true;
            //     smallSquare._acceptDrop=true;
            //     whiteTriangle._acceptDrop=true;
            //     invisibleTriangle._acceptDrop=true;
            //     blackTriangle._acceptDrop=true;
            // };

            manipulator.manageDnD = (draggableManipulator) => {
                manageDnD(bigSquare, draggableManipulator);
                manageDnD(smallSquare, draggableManipulator);
                manageDnD(whiteTriangle, draggableManipulator);
                manageDnD(invisibleTriangle, draggableManipulator);
                manageDnD(blackTriangle, draggableManipulator);
            };

            return manipulator;
        };

        drawUploadIcon = function (spec) {
            const {size, x, y} = spec;
            const manipulator = new Manipulator().addOrdonator(2);
            const arrow = new svg.Arrow(0.2 * size, 0.4 * size, 0.4 * size).position(0, 0, 0, -0.8 * size);
            const line = new svg.Line(-0.4 * size, 0.2 * size, 0.4 * size, 0.2 * size);
            line.color(myColors.black, 3, myColors.black);
            manipulator.set(0, arrow);
            manipulator.set(1, line);
            manipulator.move(x, y);

            manipulator.setHandler = (event, handler) => {
                svg.addEvent(arrow, event, handler);
                svg.addEvent(line, event, handler);
            };

            return manipulator;
        };

        drawTextToSpeechIcon = function (spec) {
            const {width, x, y} = spec;
            const path = new svg.SVGString('M 334.69355,623.49051 C 289.8995,584.06483 248.64559,540.68207 205.63637,499.28248 c -11.29726,-10.37856 -10.34004,-9.35409 -21.46833,-9.35409 -21.37924,-0.36847 -40.84236,-0.66609 -62.90561,-0.81372 -6.71529,0 -13.09488,-7.05327 -12.97672,-16.43594 0.30858,-39.21368 0.1216,-88.23843 0.0472,-127.38544 0.008,-7.36723 6.40498,-12.47496 12.53245,-12.47496 0,0 51.83247,-0.91194 67.26972,-0.91194 8.20775,0 8.10731,-0.0314 11.9649,-3.85201 44.09448,-43.67136 85.36979,-83.44781 130.31375,-126.29015 27.76352,-21.34674 33.20262,17.92379 33.20262,40.21802 0.14911,121.70107 0.12799,256.91578 0.12799,341.88567 0,34.54676 -18.06754,50.60585 -29.05079,39.62259 z M 483.7857,604.26844 c -26.06709,-16.21452 -0.71421,-35.38663 20.30056,-47.51951 57.9631,-38.74482 87.63413,-113.44922 72.96179,-181.43218 -10.1866,-53.48573 -47.56072,-99.25712 -95.45291,-124.11172 -25.8737,-21.24761 1.21708,-44.34707 28.40619,-28.64943 79.75061,45.78138 126.92102,147.52399 104.53353,236.98153 -13.99473,62.66459 -57.88505,118.359 -116.06635,145.6409 -4.79695,1.26648 -10.06603,0.88706 -14.68281,-0.90959 z m -39.72591,-53.51016 c -26.12618,-10.43626 -8.88813,-32.36239 10.70265,-45.49524 46.33069,-33.3171 61.15848,-101.84273 32.57039,-151.25663 -11.45475,-22.37064 -32.08392,-37.45577 -52.08511,-51.52849 -15.94935,-15.39173 2.64798,-42.10512 25.17228,-29.10071 52.50401,28.44677 85.67401,88.83257 80.18147,148.4859 -2.71184,53.39603 -36.13943,105.54705 -84.78504,128.36167 -3.75952,1.28587 -7.90447,1.63913 -11.75664,0.5335 z m -49.49904,-63.77407 c -25.36949,-11.58757 -12.09457,-32.37377 11.95285,-44.47184 26.64175,-16.19972 18.94154,-60.22903 -10.17716,-68.6405 -32.74214,-7.70475 -16.26996,-44.88808 17.63448,-35.80341 38.92798,16.06253 60.30833,65.09542 41.97643,103.9273 -10.07423,23.03243 -35.0042,46.07083 -61.3866,44.98845 z');
            const glass = new svg.Rect(600, 500)
                .color(myColors.pink)
                .position(350, 400)
                .opacity(0.001);
            const manipulator = new Manipulator()
                .scale(0.0025 * width, 0.0025 * width)
                .move(x, y)
                .add(path)
                .add(glass);

            return {
                mark(label){
                    glass.mark(label);
                    return this;
                },
                setHandler (event, handler) {
                    svg.addEvent(glass, event, handler);
                    return this;
                },
                removeHandler (event, handler) {
                    svg.removeEvent(glass, event, handler);
                    return this;
                },
                color (fillColor, strokeWidth, strokeColor) {
                    path.color(fillColor, strokeWidth * 40, strokeColor);
                    return this;
                },
                get manipulator () {
                    return manipulator;
                }
            }
        };

        displayPen = function (x, y, size, object) {
            const fontColor = object.filled ? myColors.darkerGreen : myColors.black,
                square = new svg.Rect(size, size).color(myColors.white, 1, myColors.black).position(x, y),
                tipEnd = new svg.Triangle(size / 5, size / 5, "S").color(myColors.white, 1, fontColor).position(0, size / 2),
                end = new svg.Rect(size / 5, size / 10).color(myColors.fontColor, 1, fontColor).position(0, size / 5 - size / 4 - size / 10),
                body = new svg.Rect(size / 5, size / 2).color(fontColor).position(0, size / 5),
                line1 = new svg.Line(-size / 2 + size / 8, -size / 2 + size / 5, size / 2 - size / 8, -size / 2 + size / 5).color(myColors.grey, 1, myColors.grey),
                line2 = new svg.Line(-size / 2 + size / 8, -size / 2 + 2 * size / 5, size / 2 - size / 8, -size / 2 + 2 * size / 5).color(myColors.grey, 1, myColors.grey),
                line3 = new svg.Line(-size / 2 + size / 8, -size / 2 + 3 * size / 5, size / 2 - size / 8, -size / 2 + 3 * size / 5).color(myColors.grey, 1, myColors.grey),
                line4 = new svg.Line(-size / 2 + size / 8, -size / 2 + 4 * size / 5, -size / 2 + size / 5, -size / 2 + 4 * size / 5).color(myColors.grey, 1, myColors.grey),
                elementsTab = [square, tipEnd, end, body, line1, line2, line3, line4];
            square.mark("explanationSquare" + object.parentQuestion.tabAnswer.indexOf(object));
            object.manipulator.set(6, square);
            object.linesManipulator.move(x, y);
            object.linesManipulator.set(0, line1);
            object.linesManipulator.set(1, line2);
            object.linesManipulator.set(2, line3);
            object.linesManipulator.set(3, line4);
            object.penManipulator.set(1, tipEnd);
            object.penManipulator.set(2, end);
            object.penManipulator.set(3, body);
            object.penManipulator.move(x + size / 8, y - size / 8);
            object.penManipulator.rotate(40);
            elementsTab.forEach(element=>svg.addEvent(element, "click", object.penHandler));
        };

        drawExplanationIcon = function (x, y, size, manipulator) {
            const square = new svg.Rect(size, size).color(myColors.white, 1, myColors.black).position(0, 0),
                line1 = new svg.Line(-size / 2 + size / 8, -size / 2 + size / 5, size / 2 - size / 8, -size / 2 + size / 5).color(myColors.black, 1, myColors.black),
                line2 = new svg.Line(-size / 2 + size / 8, -size / 2 + 2 * size / 5, size / 2 - size / 8, -size / 2 + 2 * size / 5).color(myColors.black, 1, myColors.black),
                line3 = new svg.Line(-size / 2 + size / 8, -size / 2 + 3 * size / 5, size / 2 - size / 8, -size / 2 + 3 * size / 5).color(myColors.black, 1, myColors.black),
                line4 = new svg.Line(-size / 2 + size / 8, -size / 2 + 4 * size / 5, -size / 2 + size / 5, -size / 2 + 4 * size / 5).color(myColors.black, 1, myColors.black);
            manipulator.set(0, square);
            manipulator.set(1, line1);
            manipulator.set(2, line2);
            manipulator.set(3, line3);
            manipulator.set(4, line4);
            manipulator.move(x, y);
            return [square, line1, line2, line3, line4];
        };

        displayImageWithTitle = function (label, imageSrc, imageObj, w, h, rgbCadre, bgColor, fontSize, font, manipulator, previousImage, textWidth = w) {
            if ((w <= 0) || (h <= 0)) {
                w = 1;
                h = 1;
            }
            var text = autoAdjustText(label, textWidth, null, fontSize, font, manipulator).text;
            var textHeight = (label !== "") ? h * 0.25 : 0;
            text.position(0, (h - textHeight) / 2);//w*1/6
            var newWidth = previousImage && w === previousImage.width ? w : w;
            var newHeight = previousImage && h === previousImage.height ? h : (h - textHeight) * 0.8;
            var image = displayImage(imageSrc, imageObj, newWidth, newHeight);//
            image.image.position(0, -textHeight / 2);
            var border = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(25, 25);
            manipulator.set(0, border);
            manipulator.set(1, text);
            manipulator.set(2, image.image);
            return {border: border, image: image.image, content: text};
        };

        drawVideo = (label, videoObject, w, h, rgbCadre, bgColor, fontSize, font, manipulator, editable, controls, layer = 3, textWidth = w)=> {
            if ((w <= 0) || (h <= 0)) {
                w = 1;
                h = 1;
            }
            let text;
            if (!label) label = "";
            if (label !== "NOT_TO_BE_DISPLAYED") {
                text = autoAdjustText(label, textWidth, null, fontSize, font, manipulator).text;
                let textHeight = (label !== "") ? h * 0.25 : 0;
                text.position(0, (h - textHeight) / 2);//w*1/6
                manipulator.set(1, text);
            }

            let border = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(25, 25);
            manipulator.set(0, border);
            let {x, y} = border.globalPoint(-50, -50);
            const video = new svg.Video(x, y, 100, videoObject.src, controls);
            drawings.screen.add(video);

            if (editable) {
                let parent = manipulator.parentObject;
                const position = parent.imageX ? {x:parent.imageX, y:-0} : {x:0, y:0},
                    videoGlass = new svg.Rect(130, 80)
                    .color(myColors.pink)
                    .position(position.x, position.y -25)
                    .opacity(0.001);
                manipulator.set(layer, videoGlass);
                videoGlass.mark('glass' + videoObject.name.split('.')[0]);
                border._acceptDrop = true;
                video._acceptDrop = true;
                videoGlass._acceptDrop = true;
                text && (text._acceptDrop = true);
                let redCrossManipulator;
                const redCrossClickHandler = () => {
                    redCrossManipulator.flush();
                    manipulator.unset(layer);
                    parent.obj && parent.obj.video && drawings.screen.remove(parent.obj.video);
                    if (parent.linkedQuestion && parent.linkedQuestion.video) {
                        drawings.screen.empty();
                        parent.linkedQuestion.video = null;
                        parent.parent.questionPuzzle.elementsArray[parent.linkedQuestion.questionNum - 1].video = null;
                        parent.display();
                        parent.linkedQuestion.checkValidity();
                        parent.parent.questionPuzzle.display();
                    }
                    else {
                        parent.video = null;
                    }
                    if (parent.parentQuestion) {
                        let puzzle = parent.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator.puzzle;
                        let x = -(puzzle.visibleArea.width - parent.width) / 2 + parent.puzzleColumnIndex * (puzzle.elementWidth + MARGIN);
                        let y = -(puzzle.visibleArea.height - parent.height) / 2 + parent.puzzleRowIndex * (puzzle.elementHeight + MARGIN) + MARGIN;
                        parent.display(x, y, parent.width, parent.height);
                        parent.parentQuestion.checkValidity();
                    }
                    else if (parent.answer) {
                        drawings.screen.remove(video);
                        manipulator.unset(manipulator.lastLayerOrdonator());
                        let questionCreator = parent.answer.parentQuestion.parentQuizz.parentFormation.quizzManager.questionCreator;
                        parent.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                        parent.answer.parentQuestion.checkValidity();
                    }
                };
                let mouseleaveHandler = () => {
                    redCrossManipulator.flush();
                };
                let mouseoverHandler = () => {
                    if (typeof redCrossManipulator === 'undefined') {
                        redCrossManipulator = new Manipulator(this);
                        redCrossManipulator.addOrdonator(2);
                        manipulator.add(redCrossManipulator);
                    }
                    let redCrossSize = 15;
                    let redCross = drawRedCross(position.x + 60, position.y -45, redCrossSize, redCrossManipulator);
                    redCross.mark('videoRedCross');
                    svg.addEvent(redCross, 'click', redCrossClickHandler);
                    redCrossManipulator.set(1, redCross);
                };
                svg.addEvent(videoGlass, "mouseover", mouseoverHandler);
                svg.addEvent(videoGlass, "mouseout", mouseleaveHandler);
                svg.addEvent(video, "mouseover", mouseoverHandler);
                svg.addEvent(video, "mouseout", mouseleaveHandler);
            }

            let videoTitle = autoAdjustText(videoObject.name, textWidth, h - 50, 10, null, manipulator, manipulator.lastLayerOrdonator());
            videoTitle.text.position(0, 25).color(myColors.black);
            videoTitle.text._acceptDrop = true;
            if (controls) {
                video.playFunction = function () {
                    globalVariables.videoDisplayed = manipulator.parentObject;
                    svg.speechSynthesisCancel();
                    drawings.screen.empty(video);
                    video.position(drawing.width * 0.1, (drawing.height - 9 * 7 / 160 * drawing.width) / 2);
                    video.dimension(drawing.width * 0.8);
                    let drawGreyCross = () => {
                        const
                            crossSize = 12,
                            circle = new svg.Circle(crossSize).color(myColors.black, 2, myColors.white),
                            closeButtonManipulator = new Manipulator(),
                            cross = drawCross(drawing.width * 0.9 + MARGIN, (drawing.height - 9 * 7 / 160 * drawing.width) / 2 - MARGIN, crossSize, myColors.lightgrey, myColors.lightgrey, closeButtonManipulator);
                        cross.mark('crossToClose');
                        closeButtonManipulator.addOrdonator(2);
                        closeButtonManipulator.set(0, circle);
                        closeButtonManipulator.set(1, cross);
                        drawing.manipulator.set(3, closeButtonManipulator);
                        const crossHandler = () => {
                            globalVariables.videoDisplayed = null;
                            drawing.manipulator.unset(3);
                            drawings.screen.empty();
                            let quizz = manipulator.parentObject.parentQuizz || (manipulator.parentObject.parentQuestion && manipulator.parentObject.parentQuestion.parentQuizz) ||manipulator.parentObject.answer.parentQuestion.parentQuizz;
                            if (quizz.currentQuestionIndex !== -1 && quizz.currentQuestionIndex < quizz.tabQuestions.length) {
                                quizz.manipulator.remove(quizz.tabQuestions[quizz.currentQuestionIndex].questionManipulator);
                            }
                            quizz.display(0, 0, drawing.width, drawing.height);
                            svg.removeEvent(drawings.glass, "click");
                        };

                        const hasKeyDownEvent = function (event) {
                            if (event.keyCode === 27) {
                                crossHandler();
                            }
                        };

                        svg.addGlobalEvent("keydown", (event) => {
                            if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                                event.preventDefault();
                            }
                        });

                        svg.addEvent(drawings.glass, "click", crossHandler);
                        svg.addEvent(cross, "click", crossHandler);
                        svg.addEvent(circle, "click", crossHandler);
                        return cross;
                    };
                    this.cross = drawGreyCross();
                };
                video.setPlayHandler(video.playFunction);
            }

            return {
                border,
                video,
                content: text,
                resize (width) {
                    let {x, y} = border.globalPoint(0, 0);
                    video.dimension(width);
                    let bounds = video.component.getBoundingClientRect();
                    video.position(x - bounds.width / 2, y - (bounds.height / 2 + 50) );
                    videoTitle.text.position(0, bounds.height/2);
                    return this;
                }
            };
        };

        displayImageWithBorder = function (imageSrc, imageObj, w, h, manipulator) {
            let image = displayImage(imageSrc, imageObj, w - 2 * MARGIN, h - 2 * MARGIN, manipulator);//h-2*MARGIN
            let border = new svg.Rect(w, h).color(myColors.white, 1, myColors.none).corners(25, 25);
            manipulator.set(0, border);
            manipulator.set(2, image.image);
            return {image: image.image, height: image.height, border: border};
        };

        /**
         *
         * @param imageSrc
         * @param image
         * @param w
         * @param h
         */
        displayImage = function (imageSrc, image, w, h, name = "not specified") {
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
            let img = {
                image: new svg.Image(imageSrc).dimension(width, height).position(0, 0), height: height
            };
            img.image.name = name;
            return img;
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
         * @returns {{content, border}} : SVG items for text & border
         */
        displayText = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator, layer1 = 0, layer2 = 1, textWidth = w) {
            var content = autoAdjustText(label, textWidth, h, textHeight, font, manipulator, layer2).text;
            var border = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(25, 25);
            manipulator.set(layer1, border);
            return {content: content, border: border};
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
         * @returns {{content, border}} : SVG items for text & border
         */
        displayTextWithCircle = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator) {
            var content = autoAdjustText(label, w, h, textHeight, font, manipulator).text;
            var border = new svg.Circle(w / 2).color(bgColor, 1, rgbCadre);
            manipulator.set(0, border);
            return {content: content, border: border};
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
         * @returns {{content, border}} : SVG items for text & border
         */
        displayTextWithoutCorners = function (label, w, h, rgbCadre, bgColor, textHeight, font, manipulator) {
            const result = displayText(label, w, h, rgbCadre, bgColor, textHeight, font, manipulator);
            result.border.corners(0, 0);
            return {content: result.content, border: result.border};
        };

        autoAdjustText = function (content, wi, h, fontSize = 20, font = 'Arial', manipulator, layer = 1) {
            let words = content.split(' '),
                text = '',
                w = wi * 0.94,
                t = new svg.Text('text');
            manipulator.set(layer, t);
            (fontSize) || (fontSize = 20);
            t.font(font ? font : 'Arial', fontSize);

            while (words.length > 0) {
                const word = words.shift();
                t.message(text + ' ' + word);
                if (t.boundingRect().width <= w) {
                    text += ' ' + word;
                } else {
                    let tmpStr = text + '\n' + word;
                    t.message(tmpStr);
                    if (t.boundingRect().height <= (h - MARGIN)) {
                        if (t.boundingRect().width <= w) {
                            text = tmpStr;
                        } else {
                            let letters = (' ' + word).split('');
                            while (letters.length > 0) {
                                const letter = letters.shift();
                                t.message(text + letter);
                                if (t.boundingRect().width <= w) {
                                    text += letter;
                                } else {
                                    text = text.slice(0, -2) + '…';
                                    break;
                                }
                            }
                        }
                    } else {
                        let letters = (' ' + word).split('');
                        while (letters.length > 0) {
                            const letter = letters.shift();
                            t.message(text + letter);
                            if (t.boundingRect().width <= w) {
                                text += letter;
                            } else {
                                text = text.slice(0, -2) + '…';
                                break;
                            }
                        }
                    }
                }
            }
            t.message(text.substring(1));

            let finalHeight = t.boundingRect().height;
            (typeof finalHeight === 'undefined' && t.messageText === '') && (finalHeight = 0);
            let finalWidth = t.boundingRect().width;
            (typeof finalWidth === 'undefined' && t.messageText === '') && (finalWidth = 0);
            t.position(0, Math.round((finalHeight - fontSize / 2) / 2));
            return {finalHeight, finalWidth, text: t};
        };

        drawPlus = function (x, y, baseWidth, baseHeight) {
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

        drawCross = function (x, y, size, innerColor, outerColor, manipulator) {
            var cross = drawPlus(0, 0, size, size).color(innerColor, 1, outerColor);
            cross.size = size;
            manipulator.rotate(45);
            manipulator.move(x, y);
            return cross;
        };

        drawRedCross = function (x, y, size, manipulator) {
            return drawCross(x, y, size, myColors.red, myColors.black, manipulator);
        };

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
            else {
                this.chevron = new svg.Path(0, 0).line(100, -100)
                    .cubic(140, -140, 85, -185, 50, -150)
                    .line(-60, -40)
                    .cubic(-95, -5, -95, 5, -60, 40)
                    .line(50, 150)
                    .cubic(85, 190, 145, 140, 100, 100)
                    .line(0, 0);
            }
            this.chevron.resize = (w, h) => {
                this.chevron.tempWidth = baseWidth;
                this.chevron.tempHeight = baseHeight;
                chevronManipulator.set(0, this.chevron);
                if (this.chevron.tempWidth > w) {
                    this.chevron.tempHeight *= w / this.chevron.tempWidth;
                    this.chevron.tempWidth = w;
                }
                if (this.chevron.tempHeight > h) {
                    this.chevron.tempWidth *= h / this.chevron.tempHeight;
                    this.chevron.tempHeight = h;
                }
                chevronManipulator.scale(this.chevron.tempHeight / baseHeight);
            };
            this.chevron.move = (x, y) => {
                chevronManipulator.move(x, y);
            };
            if (w && h) {
                this.chevron.resize(w, h);
            }
            if (x && y) {
                this.chevron.move(x, y);
            }
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

        manageDnD = function (svgItem, manipulator, redraw) {
            var ref;
            var mousemoveHandler = function (event) {
                var mouse = svgItem.localPoint(event.pageX, event.pageY);
                var dx = mouse.x - ref.x;
                var dy = mouse.y - ref.y;
                manipulator.move(manipulator.first.x + dx, manipulator.first.y + dy);//combinaison de translations
                redraw && redraw();
                return true;
            };
            var mouseupHandler = function () {
                svg.removeEvent(svgItem, 'mousemove', mousemoveHandler);
            };
            var mousedownHandler = function (event) {
                event.preventDefault(); // permet de s'assurer que l'event mouseup sera bien déclenché
                ref = svgItem.localPoint(event.pageX, event.pageY);
                svg.addEvent(svgItem, "mousemove", mousemoveHandler);
                svg.addEvent(svgItem, "mouseup", mouseupHandler);
            };
            svg.addEvent(svgItem, "mousedown", mousedownHandler);
        };

        drawStraightArrow = function (x1, y1, x2, y2) {
            var arrow = new svg.Arrow(3, 9, 15).position(x1, y1, x2, y2);
            var arrowPath = new svg.Path(x1, y1);
            arrow.points.forEach((point)=> {
                arrowPath.line(point.x, point.y);
            });
            arrowPath.line(x1, y1);
            return arrowPath;
        };

        Arrow = function (parentGame, childGame) {
            let formation = parentGame.parentFormation,
                parentGlobalPoint = parentGame.miniatureManipulator.last.globalPoint(0, formation.graphElementSize / 2),
                parentLocalPoint = formation.graphManipulator.last.localPoint(parentGlobalPoint.x, parentGlobalPoint.y),
                childGlobalPoint = childGame.miniatureManipulator.last.globalPoint(0, -formation.graphElementSize / 2),
                childLocalPoint = formation.graphManipulator.last.localPoint(childGlobalPoint.x, childGlobalPoint.y);
            this.redCrossManipulator = new Manipulator(this);
            let redCross = drawRedCross((parentLocalPoint.x + childLocalPoint.x) / 2, (parentLocalPoint.y + childLocalPoint.y) / 2, 20, this.redCrossManipulator);
            redCross.mark('redCross');
            this.redCrossManipulator.add(redCross);
            this.redraw = () => {
                let childGlobalPoint = childGame.miniatureManipulator.last.globalPoint(0, -formation.graphElementSize / 2),
                    childLocalPoint = formation.graphManipulator.last.localPoint(childGlobalPoint.x, childGlobalPoint.y),
                    parentGlobalPoint = parentGame.miniatureManipulator.last.globalPoint(0, formation.graphElementSize / 2),
                    parentLocalPoint = formation.graphManipulator.last.localPoint(parentGlobalPoint.x, parentGlobalPoint.y);
                formation.arrowsManipulator.remove(this.arrowPath);
                this.arrowPath = drawStraightArrow(parentLocalPoint.x, parentLocalPoint.y, childLocalPoint.x, childLocalPoint.y);
                formation.arrowsManipulator.add(this.arrowPath);
            };
            this.redCrossClickHandler = () => {
                formation.removeLink(parentGame, childGame);
                formation.arrowsManipulator.remove(this.arrowPath);
                formation.arrowsManipulator.remove(this.redCrossManipulator);
                formation.selectedArrow = null;
            };
            svg.addEvent(redCross, 'click', this.redCrossClickHandler);
            this.arrowPath = drawStraightArrow(parentLocalPoint.x, parentLocalPoint.y, childLocalPoint.x, childLocalPoint.y);
            formation.arrowsManipulator.add(this.arrowPath);
            this.selected = false;
            let arrowClickHandler = () => {
                formation.selectedGame && formation.clicAction();//selectedGame.game.miniatureManipulator.ordonator.children[0].component.listeners.mouseup();
                if (!this.selected) {
                    if (formation.selectedArrow) {
                        formation.selectedArrow.arrowPath.color(myColors.black, 1, myColors.black);
                        formation.selectedArrow.selected = false;
                        formation.arrowsManipulator.remove(formation.selectedArrow.redCrossManipulator);
                    }
                    formation.selectedArrow = this;
                    formation.arrowsManipulator.add(this.redCrossManipulator);
                    this.arrowPath.color(myColors.blue, 2, myColors.black);
                } else {
                    this.arrowPath.color(myColors.black, 1, myColors.black);
                    formation.arrowsManipulator.remove(this.redCrossManipulator);
                    formation.selectedArrow = null;
                }
                this.selected = !this.selected;
            };
            !playerMode && svg.addEvent(this.arrowPath, 'click', arrowClickHandler);
            this.arrowPath.color(myColors.black, 1, myColors.black);
            return this;
        };

        resetQuestionsIndex = function (quizz) {
            quizz.tabQuestions.forEach((question, index)=> {
                question.questionNum = index + 1;
            });
        };
    }

    class Picture {
        constructor(src, editable, parent, textToDisplay, imageRedCrossClickHandler) {
            this.editable = editable;
            this.src = src;
            this.editable && (this._acceptDrop = true);
            this.parent = parent;
            this.textToDisplay = textToDisplay;
            this.imageRedCrossClickHandler = imageRedCrossClickHandler;
            if (typeof this.redCrossManipulator === 'undefined') {
                this.redCrossManipulator = new Manipulator(this);
                this.redCrossManipulator.addOrdonator(2);
            }
        }

        draw(x, y, w, h, manipulator = this.parent.manipulator, textWidth) {
            this.width = w;
            this.height = h;
            if (this.editable) {
                manipulator.add(this.redCrossManipulator);
                this.drawImageRedCross();
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
                this.imageSVG._acceptDrop = this._acceptDrop;
                manipulator.set(this.parent.imageLayer, this.imageSVG);
            }
        }

        setImageRedCrossClickHandler(imageRedCrossClickHandler) {
            this.imageRedCrossClickHandler = imageRedCrossClickHandler;
        }

        drawImageRedCross() {
            this.mouseleaveHandler = ()=> {
                this.redCrossManipulator.flush();
            };
            this.imageMouseoverHandler = ()=> {
                let redCrossSize = 15;
                let redCross = this.textToDisplay ? drawRedCross(this.imageSVG.image.x + this.imageSVG.image.width / 2 - redCrossSize / 2, this.imageSVG.image.y - this.imageSVG.image.height / 2 + redCrossSize / 2, redCrossSize, this.redCrossManipulator)
                    : drawRedCross(this.imageSVG.x + this.imageSVG.width / 2 - redCrossSize / 2, this.imageSVG.y - this.imageSVG.height / 2 + redCrossSize / 2, redCrossSize, this.redCrossManipulator);
                redCross.mark('imageRedCross');
                svg.addEvent(redCross, 'click', this.imageRedCrossClickHandler);
                this.redCrossManipulator.set(1, redCross);
            };
        }
    }

    class MiniatureGame {
        constructor(game, size) {
            this.game = game;
            this.scoreSize = 13;
            let icon = displayTextWithCircle(game.title, size, size - this.scoreSize - MARGIN, myColors.black, myColors.white, 20, null, game.miniatureManipulator);
            icon.content.mark('level' + this.game.levelIndex + game.id);
            this.redCrossManipulator = new Manipulator(this);
            this.redCross = drawRedCross(size / 2, -size / 2, 20, this.redCrossManipulator);
            this.redCross.mark('gameRedCross');
            this.redCrossManipulator.add(this.redCross);
            svg.addEvent(this.redCross, 'click', () => this.redCrossClickHandler());
            this.selected = false;
            icon.border.color(myColors.white, 1, myColors.black);
            if (playerMode) {
                this.drawProgressIcon(game, size);
            }
        }

        redCrossClickHandler() {
            this.removeAllLinks();
            this.game.parentFormation.miniaturesManipulator.remove(this.game.miniatureManipulator);
            this.game.miniatureManipulator.unset(0);
            this.game.miniatureManipulator.unset(1);
            this.game.miniatureManipulator.remove(this.redCrossManipulator);
            var longestLevelCandidates = this.game.parentFormation.findLongestLevel();
            if (longestLevelCandidates.length === 1 && (this.game.levelIndex === longestLevelCandidates.index) && (this.game.parentFormation.levelWidth > this.game.parentFormation.graphCreaWidth)) {
                this.game.parentFormation.levelWidth -= (this.game.parentFormation.graphElementSize + this.game.parentFormation.minimalMarginBetweenGraphElements);
                this.game.parentFormation.movePanelContent();
            }
            this.game.parentFormation.levelsTab[this.game.levelIndex].removeGame(this.game.gameIndex);
            var levelsTab = this.game.parentFormation.levelsTab;
            if (levelsTab[this.game.levelIndex].gamesTab.length === 0) {
                levelsTab[this.game.levelIndex].redCrossClickHandler();
            }
            while (levelsTab.length > 0 && levelsTab[levelsTab.length - 1].gamesTab.length === 0) {
                levelsTab[levelsTab.length - 1].manipulator.unset(2);
                levelsTab[levelsTab.length - 1].manipulator.unset(1);
                levelsTab[levelsTab.length - 1].manipulator.unset(0);
                this.game.parentFormation.levelsTab.pop();
            }
            this.game.parentFormation.selectedGame.selected = false;
            this.game.parentFormation.selectedGame = null;
            this.game.parentFormation.displayGraph();
        }

        removeAllLinks() {
            for (let links = this.game.parentFormation.links, i = links.length - 1; i >= 0; i--) {
                if (links[i].childGame === this.game.id || links[i].parentGame === this.game.id)
                    links.splice(i, 1);
            }
        }

        moveAllLinks() {
            for (let links = this.game.parentFormation.links, i = links.length - 1; i >= 0; i--) {
                if (links[i].childGame === this.game.id || links[i].parentGame === this.game.id)
                    links[i].arrow.redraw();
            }
        }

        miniatureClickHandler() {
            this.game.parentFormation.selectedArrow && this.game.parentFormation.selectedArrow.arrowPath.component.listeners.click();
            if (!this.selected) {
                if (this.game.parentFormation.selectedGame) {
                    this.checkAndDrawValidity(this.game.parentFormation.selectedGame);
                    this.game.parentFormation.selectedGame.selected = false;
                    !playerMode && this.game.parentFormation.selectedGame.game.miniatureManipulator.remove(this.game.parentFormation.selectedGame.redCrossManipulator);
                }
            }
            this.selected = !this.selected;
            this.updateSelectionDesign();
        }

        updateSelectionDesign() {
            if (this.selected) {
                this.game.parentFormation.selectedGame = this;
                !playerMode && this.game.miniatureManipulator.add(this.redCrossManipulator);
                this.game.miniatureManipulator.ordonator.children[0].color(myColors.white, 3, SELECTION_COLOR);
            } else {
                this.checkAndDrawValidity(this);
                !playerMode && this.redCrossManipulator.first.parent && this.game.miniatureManipulator.remove(this.redCrossManipulator);
                this.game.parentFormation.selectedGame = null;
            }
        }

        checkAndDrawValidity(gameMiniature) {
            let displayWhenPublished = () => {
                let result = true;
                gameMiniature.game.tabQuestions.forEach(question => {
                    if (!(question instanceof AddEmptyElement)) {
                        question.questionType && question.questionType.validationTab.forEach(funcEl => {
                            result = result && funcEl(question).isValid;
                        })
                    }
                });
                result ? gameMiniature.game.miniatureManipulator.ordonator.children[0].color(myColors.white, 1, myColors.black) : gameMiniature.game.miniatureManipulator.ordonator.children[0].color(myColors.white, 3, myColors.red);
            };
            let displayWhenNotPublished = () => {
                gameMiniature.game.miniatureManipulator.ordonator.children[0].color(myColors.white, 1, myColors.black);
            };

            (gameMiniature.game.parentFormation.publishedButtonActivated) ? displayWhenPublished() : displayWhenNotPublished();
        }

        drawProgressIcon(object, size) {
            let iconsize = 20;
            this.infosManipulator = new Manipulator(this).addOrdonator(4);
            switch (object.status) {
                case "notAvailable":
                    this.game.miniatureManipulator.ordonator.children[0].color(myColors.grey, 1, myColors.black);
                    break;
                case "done":
                    let check = drawCheck(size / 2, -size / 2, iconsize)
                        .color(myColors.none, 5, myColors.green);
                    let rect = new svg.Rect(iconsize, iconsize)
                        .color(myColors.white, 1, myColors.green)
                        .position(size / 2, -size / 2);
                    this.infosManipulator.set(0, rect);
                    this.infosManipulator.set(1, check);
                    let resultString = object.tabQuestions.length - object.getQuestionsWithBadAnswers().length + " / " + object.tabQuestions.length;
                    object.miniatureManipulator.add(this.infosManipulator);
                    let result = autoAdjustText(resultString, size / 2, size / 2, this.scoreSize, "Arial", object.miniatureManipulator, 2);
                    result.text.position(0, size / 2 - MARGIN / 2);
                    break;
                case "inProgress":
                    let circle = new svg.Circle(iconsize / 2)
                        .color(myColors.white, 1, myColors.orange)
                        .position(size / 2, -size / 2);
                    let iconInfosdot1 = new svg.Circle(iconsize / 12)
                        .color(myColors.orange)
                        .position(size / 2 - iconsize / 4, -size / 2);
                    let iconInfosdot2 = new svg.Circle(iconsize / 12)
                        .color(myColors.orange)
                        .position(size / 2, -size / 2);
                    let iconInfosdot3 = new svg.Circle(iconsize / 12)
                        .color(myColors.orange)
                        .position(size / 2 + iconsize / 4, -size / 2);
                    this.infosManipulator.set(0, circle);
                    this.infosManipulator.set(1, iconInfosdot1);
                    this.infosManipulator.set(2, iconInfosdot2);
                    this.infosManipulator.set(3, iconInfosdot3);
                    object.miniatureManipulator.add(this.infosManipulator);
                    break;
            }
        };
    }

    class MiniatureFormation {
        constructor(formation) {
            this.miniatureManipulator = new Manipulator().addOrdonator(2);
            this.iconManipulator = new Manipulator().addOrdonator(4);
            this.formation = formation;
        }

        display(x, y, w, h) {
            this.formation.parent.formationsManipulator.add(this.miniatureManipulator);
            let miniature = displayText(this.formation.label, w, h, myColors.black, myColors.white, null, null, this.miniatureManipulator);
            miniature.border.corners(50, 50);
            miniature.border.mark(this.formation.label);
            let iconSize = this.formation.parent.iconeSize;
            if (!playerMode && statusEnum[this.formation.status]) {
                let icon = statusEnum[this.formation.status].icon(iconSize);
                icon.elements.forEach((element, index)=> {
                    this.iconManipulator.set(index, element);
                });
            }
            this.iconManipulator.move(w / 2 - iconSize + MARGIN + 2, -h / 2 + iconSize - MARGIN - 2);//2Pxl pour la largeur de border
            this.miniatureManipulator.move(x, y);
            this.miniatureManipulator.add(this.iconManipulator);
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
                    this.iconManipulator.set(0, rect);
                    this.iconManipulator.set(1, iconInfos);
                    this.miniatureManipulator.add(this.iconManipulator);
                    break;
                case "inProgress":
                    iconInfos = new svg.Circle(iconsize / 2).color(myColors.white, 1, myColors.orange).position(size / 2, -size / 2);
                    let iconInfosdot1 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2 - iconsize / 4, -size / 2);
                    let iconInfosdot2 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2, -size / 2);
                    let iconInfosdot3 = new svg.Circle(iconsize / 12).color(myColors.orange).position(size / 2 + iconsize / 4, -size / 2);
                    this.iconManipulator.set(0, iconInfos);
                    this.iconManipulator.set(1, iconInfosdot1);
                    this.iconManipulator.set(2, iconInfosdot2);
                    this.iconManipulator.set(3, iconInfosdot3);
                    this.miniatureManipulator.add(this.iconManipulator);
                    break;
            }
        }

        setHandler(handler) {
            let miniature = this.miniatureManipulator.ordonator.children;
            svg.addEvent(miniature[0], "click", () => {
                handler(this.formation);
            });
            svg.addEvent(miniature[1], "click", () => {
                handler(this.formation);
            });
        }

        removeHandler(handler) {
            let miniature = this.miniatureManipulator.ordonator.children;
            svg.removeEvent(miniature[0], "click", () => {
                handler(this.formation);
            });
            svg.removeEvent(miniature[1], "click", () => {
                handler(this.formation);
            });
        }
    }

    class ReturnButton {
        constructor(parent, label) {
            this.parent = parent;
            this.labelDefault = "Retour";
            this.label = label ? label : this.labelDefault;
            this.manipulator = this.parent.returnButtonManipulator || (this.parent.returnButtonManipulator = new Manipulator(this.parent));
            this.manipulator.addOrdonator(2);
            this.chevronManipulator = new Manipulator(this.parent).addOrdonator(1);
            this.manipulator.add(this.chevronManipulator);
        }

        display(x, y, w, h) {
            let returnText = new svg.Text(this.label);
            let returnButton = Chevron(0, 0, 0, 0, this.chevronManipulator, "left");
            returnButton.resize(w, h);
            returnButton.color(myColors.black, 0, []);
            returnText.font("Arial", 20).anchor("start").position(0, 0);
            this.manipulator.set(1, returnText);
            let textSize = returnText.boundingRect();
            let size = returnButton.boundingRect();
            returnText.position(w + size.width / 2, size.height / 4);
            const backgroundW = w + size.width + textSize.width;
            let background = new svg.Rect(backgroundW * 1.15, h * 1.1)
                .position(backgroundW / 2, 0)
                .color(myColors.white, 0, myColors.white);
            this.manipulator.set(0, background);
            this.manipulator.move(x + w, y);
            returnText.parentObj = this;
            returnButton.parentObj = this;
            background.parentObj = this;
            this.setHandler = (returnHandler) => {
                svg.addEvent(returnButton, "click", returnHandler);
                svg.addEvent(returnText, "click", returnHandler);
                svg.addEvent(background, "click", returnHandler);
            };
            this.removeHandler = (returnHandler) => {
                svg.removeEvent(returnButton, "click", returnHandler);
                svg.removeEvent(returnText, "click", returnHandler);
                svg.removeEvent(background, "click", returnHandler);
            }
        }
    }

    class Puzzle {
        constructor(rows, columns, elementsArray, orientation = "upToDown", parentObject) {
            this.rows = rows;
            this.columns = columns;
            this.nbOfVisibleElements = this.rows * this.columns;
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(this.nbOfVisibleElements + 3); // Pour les chevrons
            this.leftChevronManipulator = new Manipulator(this).addOrdonator(3);
            this.rightChevronManipulator = new Manipulator(this).addOrdonator(1);
            this.elementsArray = elementsArray;
            this.visibleElementsArray = [];
            this.indexOfFirstVisibleElement = 0;
            this.fillVisibleElementsArray(orientation);
            this.chevronMaxSize = 75;
            this.chevronMinSize = 15;
            this.orientation = orientation;
            this.parentObject = parentObject;
            this.leftChevron = new Chevron(0, 0, this.chevronSize, this.chevronSize, this.leftChevronManipulator, "left");
            this.rightChevron = new Chevron(0, 0, this.chevronSize, this.chevronSize, this.rightChevronManipulator, "right");
            this.leftChevron.handler = () => {
                drawings.screen.empty();
                this.updateStartPosition("left");
                this.fillVisibleElementsArray(this.orientation);
                this.display();
            };
            this.rightChevron.handler = () => {
                drawings.screen.empty();
                this.updateStartPosition("right");
                this.fillVisibleElementsArray(this.orientation);
                this.display();
            };
        }

        checkPuzzleElementsArrayValidity() {
            this.visibleElementsArray.forEach(array => {
                array.forEach(
                    element => {
                        if (!(element instanceof AddEmptyElement)) {
                            element.checkValidity();
                        }
                    });
            });
        }

        updateElementsArray(newElementsArray) {
            this.elementsArray = newElementsArray;
        }

        drawChevrons() {
            this.leftChevron.resize(this.chevronSize, this.chevronSize);
            this.rightChevron.resize(this.chevronSize, this.chevronSize);
            this.leftChevron.move((this.chevronSize - this.width) / 2, 0);
            this.rightChevron.move((this.width - this.chevronSize) / 2, 0);
            this.updateChevrons();
            let updateLeftChevron = this.leftChevron && this.leftChevron._activated;
            let updateRightChevron = this.rightChevron && this.rightChevron._activated;
            updateLeftChevron ? this.leftChevron.activate(this.leftChevron.handler, "click") : this.leftChevron.desactivate();
            updateRightChevron ? this.rightChevron.activate(this.rightChevron.handler, "click") : this.rightChevron.desactivate();
            this.manipulator.set(1, this.leftChevronManipulator);
            this.manipulator.set(2, this.rightChevronManipulator);
        }

        hideChevrons() {
            this.manipulator.unset(1);
            this.manipulator.unset(2);
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
                count = this.indexOfFirstVisibleElement;
                stop = Math.min(this.elementsArray.length, ((this.indexOfFirstVisibleElement + 1) + this.nbOfVisibleElements));
                for (column = 0; column < this.columns; column++) {
                    var columnsArray = [];
                    for (row = 0; row < this.rows; row++) {
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
            this.manipulator.move(this.x, this.y);
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
                this.manipulator.unset(i);
            }
            this.visibleElementsArray.forEach(it => {
                it.forEach(elem => {
                    let layer = this.orientation === "leftToRight" ? itNumber * this.columns + it.indexOf(elem) + 3 : itNumber * this.rows + it.indexOf(elem) + 3;
                    this.manipulator.set(layer, elem.manipulator); // +2 pour les chevrons + 1 border
                    elem.display(elem.x, elem.y, elem.width, elem.height);
                });
                itNumber++;
            });
        }
    }

    class Server {
        constructor() {
        }

        static getAllFormations() {
            return (playerMode) ? (dbListener.httpGetAsync('/formations/getPlayerFormations')) : (dbListener.httpGetAsync('/formations/getAdminFormations'));
        }

        static connect(mail, password) {
            return dbListener.httpPostAsync('/auth/connect/', {mailAddress: mail, password: password})
        }

        static inscription(user) {
            return dbListener.httpPostAsync('/user/inscription/', user)
        }

        static checkCookie() {
            return dbListener.httpGetAsync('/auth/verify/')
        }

        static getVersionById(id) {
            return dbListener.httpGetAsync("/formations/getVersionById/" + id)
        }

        static sendProgressToServer(quiz) {
            var data = {
                indexQuestion: quiz.currentQuestionIndex + 1,
                questionsAnswered: [],
                game: quiz.id,
                version: quiz.parentFormation._id,
                formation: quiz.parentFormation.formationId
            };
            quiz.questionsAnswered.forEach(x => data.questionsAnswered.push({validatedAnswers: x.validatedAnswers}));
            return dbListener.httpPostAsync("/user/saveProgress", data)
        }

        static getUser() {
            return dbListener.httpGetAsync("/user/getUser")
        }

        static replaceFormation(id, newFormation, status, ignoredData) {
            newFormation.status = status;
            return dbListener.httpPostAsync("/formations/replaceFormation/" + id, newFormation, ignoredData)
        }

        static insertFormation(newFormation, status, ignoredData) {
            newFormation.status = status;
            return dbListener.httpPostAsync("/formations/insert", newFormation, ignoredData)
        }

        static deactivateFormation(id, ignoredData) {
            return dbListener.httpPostAsync("/formations/deactivateFormation", {id: id}, ignoredData);
        }

        static upload(file, onProgress, onAbort) {
            return dbListener.httpUpload("/upload", file, onProgress, this.deleteVideo);
        }

        static deleteImage(image) {
            return dbListener.httpPostAsync("/deleteImage", image);
        }

        static deleteVideo(video) {
            return dbListener.httpPostAsync("/deleteVideo", video);
        }

        static deleteAbortedVideos(){
            return dbListener.httpPostAsync("/deleteAbortedVideos");
        }

        static replaceQuizz(newQuizz, id, levelIndex, gameIndex, ignoredData) {
            return dbListener.httpPostAsync('/formations/replaceQuizz/' + id + "/" + levelIndex + "/" + gameIndex, newQuizz, ignoredData)
        }

        static getImages() {
            return dbListener.httpPostAsync('/getAllImages')
        }

        static getVideos() {
            return dbListener.httpPostAsync('/getAllVideos')
        }
    }

    gui.ScrollablePanel = class ScrollablePanel {
        constructor(width, height, color, borderThickness = 3) {
            let vHandleCallback = position => {
                var x = this.content.x;
                var y = -position * this.content.height / this.view.height + this.view.height / 2;
                this.contentV.move(x, y);
            };
            let hHandleCallback = position => {
                var x = -position * this.content.width / this.view.width + this.view.width / 2;
                var y = this.content.y;
                this.contentH.move(x, y);
            };
            this.width = width;
            this.height = height;
            this.component = new svg.Translation();
            this.component.focus = this;
            this.border = new svg.Rect(this.width, this.height).color([], borderThickness, [0, 0, 0]);
            this.view = new svg.Drawing(width, height).position(-width / 2, -height / 2);
            this.translate = new svg.Translation();
            this.component.add(this.view.add(this.translate)).add(this.border);
            this.vHandle = new gui.Handle([[255, 204, 0], 3, [220, 100, 0]], vHandleCallback).vertical(width / 2, -height / 2, height / 2);
            this.hHandle = new gui.Handle([[255, 204, 0], 3, [220, 100, 0]], hHandleCallback).horizontal(-width / 2, width / 2, height / 2);
            this.component.add(this.vHandle.component).add(this.hHandle.component);
            this.back = new svg.Rect(width, height).color(color, 0, []);
            this.content = new svg.Translation();
            this.contentH = new svg.Translation();
            this.contentV = new svg.Translation();
            this.content.width = width;
            this.content.height = height;
            this.translate.add(this.back.position(width / 2, height / 2)).add(this.content.add(this.contentV.add(this.contentH)));
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        resize(width, height) {
            this.width = width;
            this.height = height;
            this.border.dimension(width, height);
            this.view.dimension(width, height).position(-width / 2, -height / 2);
            this.vHandle.vertical(width / 2, -height / 2, height / 2);
            this.hHandle.horizontal(-width / 2, width / 2, height / 2);
            this.back.dimension(width, height).position(width / 2, height / 2);
            return this;
        }

        updateHandle() {
            this.vHandle.dimension(this.view.height, this.content.height)
                .position((this.view.height / 2 - this.contentV.y) / (this.content.height) * this.view.height);
            this.hHandle.dimension(this.view.width, this.content.width)
                .position((this.view.width / 2 - this.contentH.x) / (this.content.width) * this.view.width);
            return this;
        }

        add(component) {
            this.content.add(component);
            return this;
        }

        remove(component) {
            this.content.remove(component);
            return this;
        }

        resizeContent(width, height) {
            if (height > this.height) {
                this.content.height = height;
            }
            if (width > this.width) {
                this.content.width = width;
            }
            if (height > this.height || width > this.width) {
                this.back.position(this.content.width / 2, this.content.height / 2);
                this.back.dimension(this.content.width, this.content.height);
                this.updateHandle();
            }
            return this;
        }

        controlPosition(x, y) {
            if (x > 0) {
                x = 0;
            }
            if (y > 0) {
                y = 0;
            }
            if (x < -this.content.width + this.view.width) {
                x = -this.content.width + this.view.width;
            }
            if (y < -this.content.height + this.view.height) {
                y = -this.content.height + this.view.height;
            }
            return {x, y};
        }

        moveContent(x, y, content) {
            let completeMovement = progress=> {
                this.updateHandle();
                if (progress === 1) {
                    delete this.animation;
                }
            };
            if (!this.animation) {
                this.animation = true;
                let point = this.controlPosition(x, y);
                this[content].onChannel().smoothy(5, 100)
                    .execute(completeMovement).moveTo(point.x, point.y);
            }
            return this;
        }

        processKeys(keycode) {
            if (isLeftArrow(keycode)) {
                this.moveContent(this.contentH.x + 100, this.contentH.y, 'contentH');
            }
            else if (isUpArrow(keycode)) {
                this.moveContent(this.contentV.x, this.contentV.y + 100, 'contentV');
            }
            else if (isRightArrow(keycode)) {
                this.moveContent(this.contentH.x - 100, this.contentH.y, 'contentH');
            }
            else if (isDownArrow(keycode)) {
                this.moveContent(this.contentV.x, this.contentV.y - 100, 'contentV');
            }
            else {
                return false;
            }
            return true;

            function isLeftArrow(keycode) {
                return keycode === 37;
            }

            function isUpArrow(keycode) {
                return keycode === 38;
            }

            function isRightArrow(keycode) {
                return keycode === 39;
            }

            function isDownArrow(keycode) {
                return keycode === 40;
            }
        }
    };

    svg.TextItem.prototype.enter = function () {
        this.messageText = this.component.value || (this.component.target && this.component.target.value) || (this.component.mock && this.component.mock.value);
        if (this.component.value === "")this.messageText = "";
    };

/////////////// Bdd.js //////////////////
    /**
     * Created by ABL3483 on 10/03/2016.
     */
    function Bdd() {
        HEADER_SIZE = 0.05;
        REGEX = /^([A-Za-z0-9.éèêâàîïëôûùö ()©,;°?!'"-/\n]){0,200}$/g;
        REGEX_NO_CHARACTER_LIMIT = /^([A-Za-z0-9.éèêâàîïëôûùö ()©,;°?!'"-/\n]){0,}$/g;
        MAX_CHARACTER_REGEX = 200;
        REGEX_ERROR_NUMBER_CHARACTER = "Ce champ doit être composé de moins de 200 caractères";
        MAX_CHARACTER_TITLE = 50;
        TITLE_REGEX = /^([A-Za-z0-9.,;:!?()éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ °'-]){0,50}$/g;
        REGEX_ERROR = "Seuls les caractères alphanumériques, avec accent et \"-,',.;?!°© sont permis";
        REGEX_ERROR_FORMATION = "Le nom de la formation doit être composé de moins de 50 caractères: alphanumériques ou .,;:!?()";
        EMPTY_FIELD_ERROR = "Veuillez remplir tous les champs";
        MARGIN = 10;
        myParentsList = ["parent", "answersManipulator", "validateManipulator", "parentElement", "manipulator",
            "resetManipulator", "manipulator", "manipulatorQuizzInfo", "questionCreatorManipulator",
            "previewButtonManipulator", "saveQuizButtonManipulator", "saveFormationButtonManipulator", "toggleButtonManipulator", "manipulator",
            "mainManipulator", "manipulator", "resultManipulator", "scoreManipulator", "quizzManager",
            "quizzInfoManipulator", "returnButtonManipulator", "questionPuzzleManipulator", "component", "drawing",
            "answerParent", "obj", "checkbox", "border", "content", "parentQuizz", "selectedAnswers", "validatedAnswers", "linkedQuestion",
            "leftArrowManipulator", "rightArrowManipulator", "virtualTab", "questionWithBadAnswersManipulator",
            "editor", "miniatureManipulator", "parentFormation", "formationInfoManipulator", "parentGames", "returnButton",
            "simpleChoiceMessageManipulator", "arrowsManipulator", "miniaturesManipulator", "miniature", "previewMode", "miniaturePosition",
            "resultArea", "questionArea", "titleArea", "redCrossManipulator", "parentQuestion", "questionsWithBadAnswers", "score", "currentQuestionIndex",
            "linesManipulator", "penManipulator", "closeButtonManipulator", "miniaturesManipulator", "toggleFormationsManipulator", "iconManipulator", "infosManipulator", "manip",
            "formationsManipulator", "miniatureManipulator", "miniatureObject.infosManipulator", "publicationFormationButtonManipulator", "expButtonManipulator", "arrow"];

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
            greyerBlue: [74, 113, 151],
            none: []
        };

        SELECTION_COLOR = myColors.darkBlue;

        myLibraryGames = {
            title: "Type de jeux",
            tab: [
                {
                    label: "Quiz",
                    create: function (formation, level, posX) {
                        var newQuizz = new Quizz(defaultQuizz, false, formation);
                        newQuizz.tabQuestions[0].parentQuizz = newQuizz;
                        newQuizz.id = "quizz" + formation.gamesCounter.quizz;
                        formation.gamesCounter.quizz++;
                        newQuizz.title = "Quiz " + formation.gamesCounter.quizz;
                        formation.levelsTab[level].gamesTab.splice(posX, 0, newQuizz);
                    }
                },
                {
                    label: "Bd",
                    create: function (formation, level, posX) {
                        var newBd = new Bd({}, formation);
                        newBd.id = "bd" + formation.gamesCounter.bd;
                        formation.gamesCounter.bd++;
                        newBd.title = "Bd " + formation.gamesCounter.bd;
                        formation.levelsTab[level].gamesTab.splice(posX, 0, newBd);
                    }
                },
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
            puzzleRows: 3,
            tabQuestions: [defaultQuestion]
        };

        singleAnswerValidationTab = [
            // Check 1 Correct Answer:
            question => ({
                isValid: question.tabAnswer && question.tabAnswer.some(el => el.correct),
                message: "Vous devez cocher au moins une bonne réponse."
            }),
            // Check answer's name:
            question => {
                let isValid = question.tabAnswer.slice(0, -1).every(el => ((el.label && (!el.invalidLabelInput)) || el.imageSrc || el.video));
                let message = "Vous devez remplir correctement toutes les réponses.";

                return {
                    isValid: isValid,
                    message: message
                }
            },
            // Check Question Name:
            question => {
                let isValid = !!((question.label && (!question.invalidLabelInput)) || question.imageSrc || question.video);
                let message = "Vous devez remplir correctement le nom de la question.";

                return {
                    isValid: isValid,
                    message: message
                }
            },
            // Check Quiz Name:
            question => {
                let isValid = (question.parentQuizz.title !== "" && question.parentQuizz.title !== undefined && !!question.parentQuizz.title.match(REGEX));
                let message = "Vous devez remplir correctement le nom du quiz.";
                return {
                    isValid: isValid,
                    message: message
                }
            }
        ];

        multipleAnswerValidationTab = [
            // Check answer's name:
            question => ({
                isValid: question.tabAnswer.every(el => ((el.label && (!el.invalidLabelInput)) || el.imageSrc || el.video)),
                message: "Vous devez remplir correctement toutes les réponses."
            }),
            // Check Question Name:
            question => ({
                isValid: !!((question.label && (!question.invalidLabelInput)) || question.imageSrc || question.video), // Checker si le champ saisi de la question est valide
                message: "Vous devez remplir correctement le nom de la question."
            }),
            // Check Quiz Name:
            question => ({
                isValid: ( question.parentQuizz.title !== "" && question.parentQuizz.title !== undefined && question.parentQuizz.title.match(REGEX)),
                message: "Vous devez remplir correctement le nom du quiz."
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
    }

/////////////////// end of Bdd.js //////////////////////

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