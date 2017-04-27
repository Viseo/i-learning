exports.Util = function (globalVariables) {

    let
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        dbListener = globalVariables.dbListener,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        playerMode = globalVariables.playerMode,
        library = globalVariables.library,
        AddEmptyElementVue,
        QuizVue,
        BdVue,
        Icon, IconSetting,
        QuestionCreator,
        svgr;

    setGlobalVariables = () => {
        runtime = globalVariables.runtime;
        drawing = globalVariables.drawing;
        drawings = globalVariables.drawings;
        dbListener = globalVariables.dbListener;
        svg = globalVariables.svg;
        gui = globalVariables.gui;
        playerMode = globalVariables.playerMode;
        AddEmptyElementVue = globalVariables.domain.AddEmptyElementVue;
        QuizVue = globalVariables.domain.QuizVue;
        BdVue = globalVariables.domain.BdVue;
        Icon = globalVariables.domain.Icon;
        IconSetting = globalVariables.domain.IconSetting;
        svgr = globalVariables.runtime;
    };

    const SPACING_Y_INCORRECT_ANSWER = 70;

    /**
     * Initialise globalVariables.imageController
     * @constructor
     */
    function SVGGlobalHandler() {

        /* istanbul ignore next */
        /**
         * Crée un objet
         * @param imageRuntime
         * @returns {*|{getImage: getImage}}
         * @constructor
         */
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

    function getStringWidthByFontSize(stringLength, fontSize) {
        return (fontSize / 2 * stringLength);
    }

    /**
     *
     * Class pour un paneau dynamique (affichage)
     *
     */
    class PopOut {
        /**
         * Build a reusable popUp
         * @param width of popup
         * @param height of popup
         * @param classToDisplay class to display (null if only text)
         * @param parentManipulator to rattach the popup at the good place
         * @param isOnlyText boolean to know if we just are building a text popup
         */
        constructor(width, height, classToDisplay, parentManipulator, isOnlyText){
            this.width = width;
            this.height = height;
            this.classToDisplay = classToDisplay;
            this.parentManipulator = parentManipulator;
            this.redCrossManipulator = new Manipulator(this);
            this.manipulator = new Manipulator(this).addOrdonator(4);
            let tmpFlush = parentManipulator.flush;
            let self = this;
            if (isOnlyText){
                this.text = new svg.Text('');
            }
            this.onlyText = isOnlyText;
            parentManipulator.flush = function (handler){
                let result = tmpFlush.apply(this, arguments);
                self.hide();
                return result;
            }
        }

        setText(text){
            if(this.text){
                this.text.messageText = text;
            }
        }

        show(){
            let computeBox = ()=>{
                if (this.width > drawing.width){
                    this.width = drawing.width - 20;
                }
                if (this.x - this.width/2 < 0){
                    this.x = this.width/2 + 10;
                }
                if (this.x + this.width/2 > drawing.width){
                    this.x = drawing.width - this.width/2 - 10;
                }
                if (this.y - this.height/2 < 0){
                    this.y = this.height/2 + 10;
                }
                if (this.y + this.height/2 > drawing.height){
                    this.y = drawing.height - this.height/2 - 10;
                }
            }
            this.manipulator && this.hide();
            if (this.panel){
                this.setPanel();
            }
            drawings.piste.set(0,this.manipulator.component);
            let point = {
                x : this.parentManipulator.first.globalPoint(0, 0).x ,
                y : this.parentManipulator.first.globalPoint(0, 0).y
            }
            this.x = point.x;
            this.y = point.y - this.height/2;
            if (this.onlyText){
                this.manipulator.set(1, this.text.dimension(this.width, this.height));
                //this.manipulator.first.steppy(5,50).opacity(0,1);
            }
            else{
                this.manipulator.set(1, this.classToDisplay.manipulator);
                this.manipulator.first.opacity(0);
                this.classToDisplay.render(-this.width,-this.height, 2*this.width, 2*this.height, () => {
                    this.manipulator.first.steppy(5,50).opacity(0,1);
                });
                this.manipulator.scalor.scale(0.5);
                this.redCross = drawRedCross(0,0, 40, this.redCrossManipulator);
                this.redCross.mark('popupRedcross');
                this.redCrossManipulator.add(this.redCross);
            }
            if(this.xAdd != undefined && this.yAdd != undefined){
                this.x += this.xAdd;
                this.y += this.yAdd;
            }
            computeBox();
            this.manipulator.move(this.x , this.y);
            this.manipulator.add(this.redCrossManipulator);
            this.redCrossManipulator.move(this.width, -this.height);
            this.redCross && svg.addEvent(this.redCross, 'mouseup', () => this.hide());
            if (this.cb){
                this.cb();
            }
        }

        defineProperty(x, y, callback){
            this.xAdd = x;
            this.yAdd = y;
            this.cb = callback;
        }


        hide(){
            this.manipulator.flush();
            //this.manipulator = null;
        }
        setPanel(w, h, fillColor, strokeColor) {
            this.panel = true;
            w = w || this.width;
            h = h || this.height;
            this.panelWidth = w;
            this.panelHeight = h;
            fillColor = fillColor || myColors.white;
            strokeColor = strokeColor || myColors.grey;
            this.manipulator.set(0,new svg.Rect(this.panelWidth,this.panelHeight)
                .color(fillColor, 1, strokeColor)
                .corners(5,5)
                .opacity(0.8)
                .position(0,-this.panelHeight/4));
        }
    }


    class Manipulator {

        constructor(sourceObject, translator, rotator, scalor) {
            this.parentObject = sourceObject;
            this.translator = translator || new svg.Translation(0, 0);
            this.translator.parentManip = this;
            this.rotator = rotator || new svg.Rotation(0);
            this.rotator.parentManip = this;
                this.scalor = scalor || new svg.Scaling(1);
            this.scalor.parentManip = this;
            this.translator.add(this.rotator.add(this.scalor));
            this.last = this.scalor;
            this.first = this.translator;
            this.component = this.translator;
            this.components = [];
            this.listeners = {};
            let self = this;
            Object.defineProperty(self, "x", {
                get: function () {
                    return self.component.x;
                },
                set: function (nouvelleValeur) {
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(self, "y", {
                get: function () {
                    return self.component.y;
                },
                set: function (nouvelleValeur) {
                },
                enumerable: true,
                configurable: true
            });
        }

        globalPoint(...args) {
            return this.translator.globalPoint(args);
        }

        localPoint(...args) {
            return this.translator.localPoint(args);
        }

        mark(id) {
            this.id = id;
            this.translator.mark(id);
            return this;
        }

        addEvent(eventName, handler) {
            this.listeners[eventName] = handler;
            svg.addEvent(this.translator, eventName, handler);
        }

        removeEvent(eventName) {
            let handler = this.listeners[eventName];
            svg.removeEvent(this.translator, eventName, handler);
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
            this.translator.move(x, y);
            this.x = this.translator.localPoint(0, 0);
            this.y = this.translator.localPoint(0, 0);
            return this;
        }

        rotate(angle) {
            this.rotator.rotate(angle);
            return this;
        }

        scale(scaleX, scaleY) {
            this.scalor.scale(scaleX, scaleY);
            return this;
        }

        get(layer) {
            return this.ordonator ? this.ordonator.get(layer) : undefined;
        }

        set(layer, svgObject) {
            let component;
            if (svgObject instanceof Manipulator) {
                component = svgObject.first;
            }else {
                component = svgObject;
            }

            this.ordonator.set(layer, component);
            this.components.push(component);
            svgObject.parentManip = this;
            return this;
        }

        unset(layer) {
            delete this.ordonator.children[layer].parentManip;
            this.ordonator.unset(layer);
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
                this.components.push(component);
                svgObject.parentManip = this;
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
                delete component.parentManip;
            }
            return this;
        }
    }

    class Drawings extends gui.Canvas {
        constructor(w, h, anchor = "content") {
            super(w, h);
            this.component.show(anchor);
            this.drawing.manipulator = new Manipulator(this, this.component.background);
            this.drawing.manipulator.addOrdonator(4);
            this.piste = new Manipulator(this).addOrdonator(1);
            this.drawing.manipulator.set(2, this.piste);
            this.component.clean = (survival) => {
                for (let i = drawings.component.children.length; i >= 0; i--) {
                    drawings.component.children[i] !== drawing && drawings.component.children[i] !== survival && drawings.component.remove(drawings.component.children[i]);
                }
            }
            const onmousedownHandler = event => {
                runtime.activeElement() && runtime.activeElement().blur();
                this.target = this.component.background.getTarget(event.pageX, event.pageY);
                this.drag = this.target;
                if (this.target) {
                    svg.event(this.target, "mousedown", event);
                }
            };
            svg.addEvent(this.component.glass, "mousedown", onmousedownHandler);

            const ondblclickHandler = event => {
                let target = this.component.background.getTarget(event.pageX, event.pageY);
                if (target) {
                    svg.event(target, "dblclick", event);
                }
            };
            svg.addEvent(this.component.glass, "dblclick", ondblclickHandler);
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
            var target = drawings.component.background.getTarget(event.pageX, event.pageY);
            var sender = null;
            target.answerParent && (sender = target.answerParent);
            var editor = (sender.model.editor.linkedQuestion ? sender.model.editor : sender.model.editor.parent);
            !editor.multipleChoice && editor.linkedQuestion.tabAnswer.forEach(answer => {
                answer.model.correct = (answer !== sender) ? false : answer.model.correct;
            });
            sender.model.correct = !sender.model.correct;
            sender.model.correct && drawPathChecked(sender, sender.x, sender.y, sender.size);
            updateAllCheckBoxes(sender);
            let quizManager = sender.model.parentQuestion.parentQuiz.parentFormation.quizManager;
            quizManager.displayQuestionsPuzzle(null, null, null, null, quizManager.questionPuzzle.indexOfFirstVisibleElement);
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
            var editor = (sender.model.editor.linkedQuestion ? sender.model.editor : sender.model.editor.parent);
            editor.linkedQuestion.tabAnswer.forEach(answer => {
                if (answer.model.editable && answer.obj.checkbox) {
                    answer.obj.checkbox.color(myColors.white, 2, myColors.black);
                    !answer.model.correct && answer.manipulator.unset(4);
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
            !sender.model.correct && sender.manipulator.unset(4);
            sender.model.correct && drawPathChecked(sender, x, y, size);
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
            /*      const {width, x, y} = spec;
             const path = new svg.SVGString('M 334.69355,623.49051 C 289.8995,584.06483 248.64559,540.68207 205.63637,499.28248 c -11.29726,-10.37856 -10.34004,-9.35409 -21.46833,-9.35409 -21.37924,-0.36847 -40.84236,-0.66609 -62.90561,-0.81372 -6.71529,0 -13.09488,-7.05327 -12.97672,-16.43594 0.30858,-39.21368 0.1216,-88.23843 0.0472,-127.38544 0.008,-7.36723 6.40498,-12.47496 12.53245,-12.47496 0,0 51.83247,-0.91194 67.26972,-0.91194 8.20775,0 8.10731,-0.0314 11.9649,-3.85201 44.09448,-43.67136 85.36979,-83.44781 130.31375,-126.29015 27.76352,-21.34674 33.20262,17.92379 33.20262,40.21802 0.14911,121.70107 0.12799,256.91578 0.12799,341.88567 0,34.54676 -18.06754,50.60585 -29.05079,39.62259 z M 483.7857,604.26844 c -26.06709,-16.21452 -0.71421,-35.38663 20.30056,-47.51951 57.9631,-38.74482 87.63413,-113.44922 72.96179,-181.43218 -10.1866,-53.48573 -47.56072,-99.25712 -95.45291,-124.11172 -25.8737,-21.24761 1.21708,-44.34707 28.40619,-28.64943 79.75061,45.78138 126.92102,147.52399 104.53353,236.98153 -13.99473,62.66459 -57.88505,118.359 -116.06635,145.6409 -4.79695,1.26648 -10.06603,0.88706 -14.68281,-0.90959 z m -39.72591,-53.51016 c -26.12618,-10.43626 -8.88813,-32.36239 10.70265,-45.49524 46.33069,-33.3171 61.15848,-101.84273 32.57039,-151.25663 -11.45475,-22.37064 -32.08392,-37.45577 -52.08511,-51.52849 -15.94935,-15.39173 2.64798,-42.10512 25.17228,-29.10071 52.50401,28.44677 85.67401,88.83257 80.18147,148.4859 -2.71184,53.39603 -36.13943,105.54705 -84.78504,128.36167 -3.75952,1.28587 -7.90447,1.63913 -11.75664,0.5335 z m -49.49904,-63.77407 c -25.36949,-11.58757 -12.09457,-32.37377 11.95285,-44.47184 26.64175,-16.19972 18.94154,-60.22903 -10.17716,-68.6405 -32.74214,-7.70475 -16.26996,-44.88808 17.63448,-35.80341 38.92798,16.06253 60.30833,65.09542 41.97643,103.9273 -10.07423,23.03243 -35.0042,46.07083 -61.3866,44.98845 z');
             const glass = new svg.Rect(600, 500)
             .color(myColors.pink)
             .position(350, 400)
             .opacity(0.001);
             const manipulator = new Manipulator()
             .scale(0.0025 * width, 0.0025 * width)
             .move(x, y)
             .add(glass);

             return {
             mark(label) {
             glass.mark(label);
             return this;
             },
             setMiniatureHandler(event, handler) {
             svg.addEvent(glass, event, handler);
             return this;
             },
             removeMiniatureHandler(event, handler) {
             svg.removeEvent(glass, event, handler);
             return this;
             },
             color(fillColor, strokeWidth, strokeColor) {
             path.color(fillColor, strokeWidth * 40, strokeColor);
             return this;
             },
             get manipulator() {
             return manipulator;
             }
             }*/
        };

        displayPen = function (x, y, size, object, handler) {
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
            square.mark("explanationSquare" + object.model.parentQuestion.tabAnswer.indexOf(object));
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
            handler && elementsTab.forEach(element => svg.addEvent(element, "click", handler));
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
            square.mark('explanationIconSquare');
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

        drawVideo = (label, videoObject, w, h, rgbCadre, bgColor, fontSize, font, manipulator, editable, controls, layer = 3, textWidth = w) => {
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
            drawings.component.add(video);

            if (editable) {
                let parent = manipulator.parentObject;
                const position = parent.imageX ? {x: parent.imageX, y: -0} : {x: 0, y: 0},
                    videoGlass = new svg.Rect(130, 80)
                        .color(myColors.pink)
                        .position(position.x, position.y - 25)
                        .opacity(0.001);
                manipulator.set(layer, videoGlass);
                videoGlass.mark('glass' + videoObject.name.split('.')[0]);
                border._acceptDrop = true;
                video._acceptDrop = true;
                videoGlass._acceptDrop = true;
                text && (text._acceptDrop = true);
                video.setRedCrossClickHandler = (handler) => {
                    video.redCrossClickHandler = handler;
                };
                let mouseleaveHandler = () => {
                    video.redCrossManipulator && video.redCrossManipulator.flush();

                };
                let mouseoverHandler = () => {
                    if (typeof video.redCrossManipulator === 'undefined') {
                        video.redCrossManipulator = new Manipulator(this);
                        video.redCrossManipulator.addOrdonator(2);
                        manipulator.add(video.redCrossManipulator);
                    }
                    let redCrossSize = 15;
                    let redCross = drawRedCross(position.x + 60, position.y - 45, redCrossSize, video.redCrossManipulator);
                    redCross.mark('videoRedCross');
                    svg.addEvent(redCross, 'click', video.redCrossClickHandler);
                    video.redCrossManipulator.set(1, redCross);
                };
                svg.addEvent(videoGlass, "mouseenter", mouseoverHandler);
                svg.addEvent(videoGlass, "mouseleave", mouseleaveHandler);
                svg.addEvent(video, "mouseenter", mouseoverHandler);
                svg.addEvent(video, "mouseleave", mouseleaveHandler);
            }

            let videoTitle = autoAdjustText(videoObject.name, textWidth, h - 50, 10, null, manipulator, manipulator.lastLayerOrdonator());
            videoTitle.text.position(0, 25).color(myColors.black);
            videoTitle.text._acceptDrop = true;
            if (controls) {
                video.playFunction = function () {
                    globalVariables.videoDisplayed = manipulator.parentObject;
                    runtime.speechSynthesisCancel();
                    drawings.component.clean(video);
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
                            drawings.component.clean();
                            let quiz = manipulator.parentObject.parentQuiz || (manipulator.parentObject.parentQuestion && manipulator.parentObject.parentQuestion.parentQuiz) || manipulator.parentObject.answer.parentQuestion.parentQuiz;
                            if (quiz.currentQuestionIndex !== -1 && quiz.currentQuestionIndex < quiz.tabQuestions.length) {
                                quiz.manipulator.remove(quiz.tabQuestions[quiz.currentQuestionIndex].questionManipulator);
                            }
                            quiz.display(0, 0, drawing.width, drawing.height);
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
                resize(width) {
                    let {x, y} = border.globalPoint(0, 0);
                    video.dimension(width);
                    let bounds = video.component.getBoundingClientRect();
                    video.position(x - bounds.width / 2, y - (bounds.height / 2 + 50));
                    videoTitle.text.position(0, bounds.height / 2);
                    return this;
                }
            };
        };

        drawSimpleVideo = (label, videoObject, w, h, rgbCadre, bgColor, fontSize, font, manipulator, editable,
                           controls, layer = 2, textWidth = w) => {
            if ((w <= 0) || (h <= 0)) {
                w = 1;
                h = 1;
            }
            const video = new svg.Video(0, 0, w, videoObject.src, controls);
            drawings.component.add(video);

            let videoTitle = autoAdjustText(videoObject.name, textWidth, h - 50, 10, null, manipulator, manipulator.lastLayerOrdonator());
            videoTitle.text.position( ((label) ? -video.width/2 : 0 ), h/2 - MARGIN).color(myColors.black);

            if (editable) {
                let parent = manipulator.parentObject;
                const position = parent.imageX ? {x: parent.imageX, y: -0} : {x: 0, y: 0},
                    videoGlass = new svg.Rect(130, 80)
                        .color(myColors.pink)
                        .position(position.x, position.y - 25)
                        .opacity(0.001);
                manipulator.set(layer, videoGlass);
                videoGlass.mark('glass' + videoObject.name.split('.')[0]);
                video._acceptDrop = true;
                videoGlass._acceptDrop = true;
                text && (text._acceptDrop = true);
                video.setRedCrossClickHandler = (handler) => {
                    video.redCrossClickHandler = handler;
                };
                let mouseleaveHandler = () => {
                    this.redCrossManipulator && this.redCrossManipulator.flush();
                };
                let mouseoverHandler = () => {
                    if (typeof video.redCrossManipulator === 'undefined') {
                        video.redCrossManipulator = new Manipulator(this);
                        video.redCrossManipulator.addOrdonator(2);
                        manipulator.add(video.redCrossManipulator);
                    }
                    let redCrossSize = 15;
                    let redCross = drawRedCross(position.x + 60, position.y - 45, redCrossSize, video.redCrossManipulator);
                    redCross.mark('videoRedCross');
                    svg.addEvent(redCross, 'click', video.redCrossClickHandler);
                    video.redCrossManipulator.set(1, redCross);
                };
                svg.addEvent(videoGlass, "mouseover", mouseoverHandler);
                svg.addEvent(videoGlass, "mouseout", mouseleaveHandler);
                svg.addEvent(video, "mouseover", mouseoverHandler);
                svg.addEvent(video, "mouseout", mouseleaveHandler);
            }


            videoTitle.text._acceptDrop = true;
            if (controls) {
                video.playFunction = function () {
                    globalVariables.videoDisplayed = manipulator.parentObject;
                    runtime.speechSynthesisCancel();
                    drawings.component.clean(video);
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
                            drawings.component.clean();
                            let quiz = manipulator.parentObject.parentQuiz || (manipulator.parentObject.parentQuestion && manipulator.parentObject.parentQuestion.parentQuiz) || manipulator.parentObject.answer.parentQuestion.parentQuiz;
                            if (quiz.currentQuestionIndex !== -1 && quiz.currentQuestionIndex < quiz.tabQuestions.length) {
                                quiz.manipulator.remove(quiz.tabQuestions[quiz.currentQuestionIndex].questionManipulator);
                            }
                            quiz.display(0, 0, drawing.width, drawing.height);
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

                        svg.addEvent(cross, "click", crossHandler);
                        svg.addEvent(circle, "click", crossHandler);
                        return cross;
                    };
                    this.cross = drawGreyCross();
                };
                video.setPlayHandler(video.playFunction);
            }

            return {
                video,
                resize(width) {
                    video.dimension(width);
                    let bounds = video.component.getBoundingClientRect();
                    video.position(- bounds.width / 2, - (bounds.height / 2 + 50));
                    videoTitle.text.position(0, bounds.height / 2);
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
            if (height > h) {
                width *= (h / height);
                height = h;
            }
            let img = {
                image: new svg.Image(imageSrc).dimension(width, height).position(0, 0),
                height: height
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
            // var content = autoAdjustText(label, textWidth, h, textHeight, font, manipulator, layer2).text;
            var content = new svg.Text(label);
            manipulator.set(layer2, content);
            content.dimension(textWidth, textHeight);
            content.font(font ? font : 'Arial', textHeight, 0);
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
            content.parentManip = manipulator;
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
            var content = autoAdjustText(label, w, h, textHeight, font, manipulator, 1).text;
            var border = new svg.Rect(w, h).color(bgColor, 1, rgbCadre).corners(0, 0);
            manipulator.set(0, border);
            return {content: content, border: border};
        };

        autoAdjustText = function (content, wi, h, fontSize = 20, font = 'Arial', manipulator, layer = 1) {
            let words = content.split(' '),
                text = '',
                w = wi * 0.94,
                t = new svg.Text('text');
            manipulator.set(layer, t);
            t.font(font, fontSize);

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
            t.originalText = content;

            let finalHeight = t.boundingRect().height;
            (typeof finalHeight === 'undefined' && t.messageText === '') && (finalHeight = 0);
            let finalWidth = t.boundingRect().width;
            (typeof finalWidth === 'undefined' && t.messageText === '') && (finalWidth = 0);
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

            var mousedownHandler = function (event) {
                event.preventDefault(); // permet de s'assurer que l'event mouseup sera bien déclenché
                ref = svgItem.localPoint(event.pageX, event.pageY);
                svg.addEvent(svgItem, "mousemove", mousemoveHandler);
            };
            svg.addEvent(svgItem, "mousedown", mousedownHandler);
        };

        drawStraightArrow = function (x1, y1, x2, y2) {
            var arrow = new svg.Arrow(3, 9, 15).position(x1, y1, x2, y2);
            var arrowPath = new svg.Path(x1, y1);
            arrow.points.forEach((point) => {
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
                //formation.selectedGame && formation.clicAction();//selectedGame.miniatureManipulator.ordonator.children[0].component.listeners.mouseup();
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

        resetQuestionsIndex = function (quiz) {
            quiz.tabQuestions.forEach((question, index) => {
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
            this.redCrossManipulator = new Manipulator(this.parent).addOrdonator(2);
        }

        draw(x, y, w, h, manipulator = this.parent.manipulator, layer = this.parent.imageLayer, mark = null, textWidth) {
            this.width = w;
            this.height = h;
            if (this.editable) {
                manipulator.add(this.redCrossManipulator);
                this.drawImageRedCross();
            }
            if (this.textToDisplay) {
                this.imageSVG = displayImageWithTitle(this.textToDisplay, this.src, this.parent.image, w, h, this.parent.colorBordure, this.parent.bgColor, this.parent.fontSize, this.parent.font, manipulator, null, textWidth);
                svg.addEvent(this.imageSVG.image, 'mouseenter', this.imageMouseoverHandler);
                svg.addEvent(this.imageSVG.image, 'mouseleave', this.mouseleaveHandler);
                this.imageSVG.image._acceptDrop = this.editable;
            }
            else {
                this.imageSVG = new svg.Image(this.src).dimension(w, h);
                this.imageSVG.position(x, y);
                svg.addEvent(this.imageSVG, 'mouseenter', this.imageMouseoverHandler);
                svg.addEvent(this.imageSVG, 'mouseleave', this.mouseleaveHandler);
                this.imageSVG._acceptDrop = this._acceptDrop;
                manipulator.set(layer, this.imageSVG);
                if (mark) {
                    manipulator[mark] = this.imageSVG;
                }
            }
        }

        drawImageRedCross() {
            this.mouseleaveHandler = (event) => {
                let target = drawings.component.background.getTarget(event.pageX, event.pageY);
                if (!target || target.id !== "imageRedCross") {
                    this.redCrossManipulator.flush();
                }
            };
            this.imageMouseoverHandler = () => {
                let redCrossSize = 15;
                let redCross = this.textToDisplay ? drawRedCross(this.imageSVG.image.x + this.imageSVG.image.width / 2 - redCrossSize / 2, this.imageSVG.image.y - this.imageSVG.image.height / 2 + redCrossSize / 2, redCrossSize, this.redCrossManipulator)
                    : drawRedCross(this.imageSVG.x + this.imageSVG.width / 2 - redCrossSize / 2, this.imageSVG.y - this.imageSVG.height / 2 + redCrossSize / 2, redCrossSize, this.redCrossManipulator);
                redCross.mark('imageRedCross');
                svg.addEvent(redCross, 'click', (event) => {
                    this.redCrossManipulator.flush();
                    this.imageRedCrossClickHandler(event);
                });
                this.redCrossManipulator.set(1, redCross);
            };
        }
    }


    const hexagonDefaultColors = () => {
        return {
            fillColor: myColors.lightwhite,
            strokeWidth: 1,
            strokeColor: myColors.grey
        };
    };

    let drawHexagon = (w, h, orientation, ratio) => {
        let factor = ratio || 1;
        if (orientation == 'V') {
            var points = [
                [w / 2, -h / 1.5],
                [0, -factor * h],
                [-w / 2, -h / 1.5],
                [-w / 2, h / 1.5],
                [0, factor * h],
                [w / 2, h / 1.5]
            ];
        }
        else {
            var points = [
                [w / 2, -h / 1.5],
                [factor * w, 0],
                [w / 2, h / 1.5],
                [-w / 2, h / 1.5],
                [-factor * w, 0],
                [-w / 2, -h / 1.5]
            ];
        }

        let shape = new svg.Polygon().add(points).color(
            hexagonDefaultColors().fillColor, hexagonDefaultColors().strokeWidth, hexagonDefaultColors().strokeColor);
        shape.width = w;
        shape.height = h;

        return shape;
    };

    let goDirectlyToLastAction = (lastAction) => {
        Server.getFormationsProgress(lastAction.version).then(f => {
            var tmp = JSON.parse(f);
            let games = tmp.progress ? tmp.progress.gamesTab : null;
            let formation = globalVariables.formationsManager.formations.find(form => form._id == tmp.formation._id);
            formation.loadFormation(tmp.formation, games);
            globalVariables.formationsManager.formationDisplayed = formation;
            let currentGame = formation.findGameById(lastAction.game);
            formation.quizDisplayed = currentGame;
            formation.quizDisplayed.currentQuestionIndex = lastAction.indexQuestion;
            formation.quizDisplayed.display(0, 0, drawing.width, drawing.height);
            //formation.quizDisplayed.displayCurrentQuestion();
        });
    }

    class MiniatureGame {
        constructor(game, size) {
            this.game = game;       // classe GameVue
            this.scoreSize = 13;
            this.width = size;
            this.height = size / 2;
            this.size = size;
            game.miniature = this;
            this.iconManipulator = new Manipulator(this).addOrdonator(3);
            this.manipulator = new Manipulator(this);
            this.manipulator.addOrdonator(4);
            this._acceptDrop = true;
            this.popOut =  new PopOut(400,150, new globalVariables.domain.MediaLibraryVue(), this.manipulator);

        }

        dropImage(element){
            this.game.picture = element.src;
            this.drawImage();
        }

        checkIfParentDone() {
            if (!globalVariables.playerMode) {
                return true;
            }
            for (let i in this.game.parentGamesList) {
                let game = this.game.parentFormation.findGameById(this.game.parentGamesList[i].id)
                if (game.questionsAnswered.length != game.tabQuestions.length) {
                    return false;
                }
            }
            return true;
        }

        drawImage(){
            this.picture = new Picture(this.game.picture, true, this, '', ()=> {
                this.manipulator.unset(3);
                this.game.picture = null;
            });
            this.picture.draw(-this.size / 2, 0, this.size / 4, this.size / 4, this.manipulator, 3);
        }

        display() {
            let addSettingsIcon = () =>{
                const iconSize = 20;
                let settingsPic = new Picture('../images/settings.png', false, this, '', null);
                let settingsIcon = {
                    border: new svg.Circle(iconSize/2).color(myColors.ultraLightGrey, 0, myColors.none),
                    content: settingsPic
                }
                this.settingsManipulator = new Manipulator(this).addOrdonator(2);
                this.settingsManipulator.set(0,settingsIcon.border);
                settingsIcon.content.draw(0,0,iconSize*0.8, iconSize*0.8, this.settingsManipulator, 1);
                this.manipulator.add(this.settingsManipulator);
                this.popOut.defineProperty(0, -this.height);
                this.settingsManipulator.addEvent('click', ()=>{
                    this.popOut.show.call(this.popOut);
                    this.selected = !this.selected;
                    this.updateSelectionDesign();
                });
                this.settingsManipulator.move(-this.width/2, -this.height/2-iconSize/2);
            }
            !globalVariables.playerMode && addSettingsIcon();
            this.updateProgress();
            let icon = {
                content: autoAdjustText(this.game.title, this.picture ? this.width * 0.9 : this.width, this.height, 15, 'Arial', this.manipulator),
                underContent: new svg.Text(this.game.questionsAnswered.length + '/' + this.game.tabQuestions.length).position(0, 2 * MARGIN),
                border: drawHexagon(this.width, this.height, 'H', 0.8).mark('hexBorder' + this.game.levelIndex + this.game.id)
            };
            this.border = icon.border;
            this.content = icon.content;
            this.content.text.mark('titlelevel' + this.game.levelIndex + this.game.id);
            this.underContent = icon.underContent;
            let video;
            if (this.video) {
                video = drawVideo(this.game.title, this.video, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, true);
            }
            if (this.game.picture) {
                this.drawImage();
            }
            if (this.game.parentGamesList) {
                let check = this.checkIfParentDone();
                if (!check) {
                    icon.border.color(myColors.grey, 1, myColors.grey);
                }
            }
            this.manipulator.set(0, icon.border);
            globalVariables.playerMode && this.manipulator.set(2, icon.underContent);
            this.manipulator.mark('level' + this.game.levelIndex + this.game.id);
            this.redCrossManipulator = new Manipulator(this);
            this.redCross = drawRedCross(this.size / 2, -this.size / 2, 20, this.redCrossManipulator);
            this.redCross.mark('gameRedCross');
            this.redCrossManipulator.add(this.redCross);
            svg.addEvent(this.redCross, 'mouseup', () => this.redCrossClickHandler());
            this.selected = false;
            if (globalVariables.playerMode) {
                this.drawIcon();
            }
            this.game.miniatureManipulator.add(this.manipulator);
        }

        updateProgress() {
            this.game.progress = this.game.questionsAnswered.length == 0 ? '' :
                this.game.questionsAnswered.length == this.game.tabQuestions.length ? 'done' : 'inProgress'
        }

        showDefaultColor() {
            this.manipulator.ordonator.children[0]
                .color(hexagonDefaultColors().fillColor, hexagonDefaultColors().strokeWidth, hexagonDefaultColors().strokeColor);
        }

        redCrossClickHandler() {
            let formationVue = this.game.parentFormation;
            drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
            this.removeAllLinks();
            formationVue.miniaturesManipulator.remove(this.manipulator);
            this.manipulator.flush();
            this.manipulator.remove(this.redCrossManipulator);
            var longestLevelCandidates = formationVue.findLongestLevel();
            if (longestLevelCandidates.length === 1 && (this.game.levelIndex === longestLevelCandidates.index) && (formationVue.levelWidth > formationVue.graphCreaWidth)) {
                formationVue.levelWidth -= (formationVue.graphElementSize + formationVue.minimalMarginBetweenGraphElements);
                formationVue.movePanelContent();
            }
            formationVue.levelsTab[this.game.levelIndex].removeGame(this.game.gameIndex);
            var levelsTab = formationVue.levelsTab;
            if (levelsTab[this.game.levelIndex].gamesTab.length === 0) {
                levelsTab[this.game.levelIndex].redCrossClickHandler();
            }
            while (levelsTab.length > 0 && levelsTab[levelsTab.length - 1].gamesTab.length === 0) {
                levelsTab[levelsTab.length - 1].manipulator.unset(2);
                levelsTab[levelsTab.length - 1].manipulator.unset(1);
                levelsTab[levelsTab.length - 1].manipulator.unset(0);
                formationVue.levelsTab.pop();
            }
            formationVue.selectedGame.selected = false;
            formationVue.selectedGame = null;
            formationVue.displayGraph();
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
            let formationVue = this.game.parentFormation;
            formationVue.selectedArrow && formationVue.selectedArrow.arrowPath.component.listeners.click();
            if (!this.selected) {
                if (formationVue.selectedGame) {
                    this.checkAndDrawValidity(formationVue.selectedGame);
                    formationVue.selectedGame.selected = false;
                    !playerMode && formationVue.selectedGame.removeRedCross();
                }
            }
            this.selected = !this.selected;
            this.updateSelectionDesign();
        }


        updateSelectionDesign() {
            if (this.selected) {
                this.game.parentFormation.selectedGame = this;
                !playerMode && this.manipulator.add(this.redCrossManipulator);
                this.manipulator.ordonator.children[0].color(myColors.white, 3, SELECTION_COLOR);
            } else {
                this.checkAndDrawValidity(this);
                !playerMode && this.redCrossManipulator.first.parent && this.manipulator.remove(this.redCrossManipulator);
                this.game.parentFormation.selectedGame = null;
            }
        }

        checkAndDrawValidity(gameMiniature) {
            let displayWhenPublished = () => {
                let result = true;
                gameMiniature.game.tabQuestions.forEach(question => {
                    if (!(question instanceof AddEmptyElementVue)) {
                        question.questionType && question.questionType.validationTab.forEach(funcEl => {
                            result = result && funcEl(question).isValid;
                        })
                    }
                });
                result ? gameMiniature.manipulator.ordonator.children[0].color(myColors.lightwhite, 1, myColors.grey)
                    : gameMiniature.manipulator.ordonator.children[0].color(myColors.lightwhite, 3, myColors.red);
            };
            let displayWhenNotPublished = () => {
                gameMiniature.manipulator.ordonator.children[0].color(myColors.lightwhite, 1, myColors.grey);
            };

            (gameMiniature.game.parentFormation.publishedButtonActivated) ? displayWhenPublished() : displayWhenNotPublished();
        }

        drawIcon() {
            const circleToggleSize = 12.5;
            let iconsize = 20,
                size = 25,
                iconInfos;
            if (!this.game.parentGamesList || this.checkIfParentDone()) {
                switch (this.game.progress) {
                    case "done":
                        let doneIcon = {};
                        doneIcon.border = new svg.Circle(circleToggleSize);
                        doneIcon.border.color(myColors.green, 0, myColors.none);
                        doneIcon.content = drawCheck(doneIcon.border.x, doneIcon.border.y, 20).color(myColors.none, 3, myColors.white);
                        this.iconManipulator.set(0, doneIcon.border);
                        this.iconManipulator.set(1, doneIcon.content);
                        this.manipulator.add(this.iconManipulator);
                        break;
                    case "inProgress":
                        let inProgressIcon = displayTextWithCircle('...', circleToggleSize * 2, circleToggleSize * 2, myColors.none, myColors.orange, 15, 'Arial', this.iconManipulator);
                        inProgressIcon.content.font('arial', 20).color(myColors.white);
                        this.manipulator.add(this.iconManipulator);
                        break;
                    default:
                        let undoneIcon = {};
                        undoneIcon.border = new svg.Circle(circleToggleSize).color(myColors.blue, 0, myColors.none);
                        undoneIcon.content = new svg.Triangle(8, 8, 'E').color(myColors.none, 3, myColors.white);
                        this.iconManipulator.set(0, undoneIcon.border);
                        this.iconManipulator.set(1, undoneIcon.content);
                        this.manipulator.add(this.iconManipulator);
                        break;
                }
                this.iconManipulator.move(this.size / 2, -this.size / 3);
            }
            else if (this.game.parentGamesList && !this.checkIfParentDone()) {
                let lock = new Picture('/images/padlock2.png', false, this, '', null);
                lock.draw(this.size / 2, -this.size / 3, this.size / 5, this.size / 5, this.iconManipulator, 1);
                this.manipulator.add(this.iconManipulator);
            }
        }

        drawProgressIcon(object, size) {
            let iconsize = 20;
            this.infosManipulator = new Manipulator(this).addOrdonator(4);
            switch (object.status) {
                case "notAvailable":
                    this.manipulator.ordonator.children[0].color(myColors.grey, 1, myColors.black);
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
                    object.manipulator.add(this.infosManipulator);
                    let result = autoAdjustText(resultString, size / 2, size / 2, this.scoreSize, "Arial", object.manipulator, 2);
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
                    object.manipulator.add(this.infosManipulator);
                    break;
                default :
                    this.manipulator.ordonator.children[0].color(myColors.grey, 1, myColors.black);
                    break;
            }
        };

        removeRedCross() {
            this.manipulator.remove(this.redCrossManipulator);
            this.selected = false;
            this.showDefaultColor();
        }
    }

    class MiniatureFormation {
        constructor(formation) {
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this).addOrdonator(3);
                this.iconManipulator = new Manipulator(this).addOrdonator(4);
                this.starsManipulator = new Manipulator(this).addOrdonator(5);
            }

            _declareManipulator();
            this.formation = formation;
            this._acceptDrop = true;
            this.popOut =  new PopOut(400,150, new globalVariables.domain.MediaLibraryVue(), this.manipulator);
        }

        dropImage(element){
            this.picture = element.src;
            this.drawPicture();
        }
        drawPicture() {
            this.imageManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.set(2,this.imageManipulator);
            this.image = new Picture(this.picture, globalVariables.playerMode ? false : true, this, '',()=> {
                this.imageManipulator.flush();
                this.imageManipulator = null
            });
            this.image.draw(0,this.height/3, this.width/2, this.height/2,this.imageManipulator,0);
            svg.addEvent(this.image.imageSVG,"mouseenter",
                () => {
                    this.image.imageMouseoverHandler();
                    this.manipulator.get(0).color([130, 180, 255], 3, myColors.black);
                });
            this.image.imageSVG.mark(this.formation.label + 'SetupImage');
        }

        display(x, y, w, h) {
            this.width = w;
            this.height = h;
            let iconSize = this.formation.parent.iconeSize;
            let addSettingsIcon = () =>{
                let settingsPic = new Picture('../images/settings.png', false, this, '', null);
                let settingsIcon = {
                    border: new svg.Circle(iconSize/2).color(myColors.ultraLightGrey, 0, myColors.none),
                    content: settingsPic
                }
                this.settingsManipulator = new Manipulator(this).addOrdonator(2).mark(this.formation.label + 'Setup');  // imageSpec
                this.settingsManipulator.set(0,settingsIcon.border);
                settingsIcon.content.draw(0,0,iconSize*0.8, iconSize*0.8, this.settingsManipulator, 1);
                this.manipulator.add(this.settingsManipulator);
                this.popOut.defineProperty(0, -h*1.5);
                this.settingsManipulator.addEvent('click', this.popOut.show.bind(this.popOut));
                this.settingsManipulator.move(-w / 4, -h * 2 / 3 - iconSize / 2);
            }
            let points = [
                [w / 2, -h / 1.5],
                [0, -h],
                [-w / 2, -h / 1.5],
                [-w / 2, h / 1.5],
                [0, h],
                [w / 2, h / 1.5]
            ];
            let createStars = () => {
                let factor = 5;
                let onStarClick = starObject => {
                    this.starsManipulator.components.forEach(star => {
                        star.color(myColors.yellow, 0.2, myColors.yellow);
                    });
                    switch (starObject.id) {
                        case "star1":
                            starObject.color(myColors.orange, 0.2, myColors.orange);
                            break;
                        case "star2":
                            this.starsManipulator.components[0].color(myColors.orange, 0.2, myColors.orange);
                            starObject.color(myColors.orange, 0.2, myColors.orange);
                            break;
                        case "star3":
                            this.starsManipulator.components[0].color(myColors.orange, 0.2, myColors.orange);
                            this.starsManipulator.components[1].color(myColors.orange, 0.2, myColors.orange);
                            starObject.color(myColors.orange, 0.2, myColors.orange);
                            break;
                        case "star4":
                            this.starsManipulator.components[0].color(myColors.orange, 0.2, myColors.orange);
                            this.starsManipulator.components[1].color(myColors.orange, 0.2, myColors.orange);
                            this.starsManipulator.components[2].color(myColors.orange, 0.2, myColors.orange);
                            starObject.color(myColors.orange, 0.2, myColors.orange);
                            break;
                        case "star5":
                            this.starsManipulator.components[0].color(myColors.orange, 0.2, myColors.orange);
                            this.starsManipulator.components[1].color(myColors.orange, 0.2, myColors.orange);
                            this.starsManipulator.components[2].color(myColors.orange, 0.2, myColors.orange);
                            this.starsManipulator.components[3].color(myColors.orange, 0.2, myColors.orange);
                            starObject.color(myColors.orange, 0.2, myColors.orange);
                            break;
                    }
                    Server.updateSingleFormationStars(this.formation.formationId, starObject.id, this.formation._id).then(data => {
                        console.log(data);
                    });
                };
                let onStarHover = starObject => {
                    starObject.color(myColors.orange,0.2,myColors.orange);
                    starMiniatures.pop.setText(starsNoteEnum[starObject.id]);
                    starMiniatures.pop.show();
                    let id, i=0;
                    while(starObject.id != id){
                        starMiniatures[i].color(myColors.orange,0.2,myColors.orange)
                        id = starMiniatures[i].id;
                        i++;
                    }
                    onMouseOverSelect(this.manipulator);
                }
                let onStarLeave = starObject =>{
                    starMiniatures.pop.hide();
                    starMiniatures.forEach(elem => elem.color(myColors.yellow,0.2,myColors.yellow));
                }
                let _duplicateStars = () => {
                    starMiniatures[1] = starMiniatures[0].duplicate().position(STAR_SPACE, 0).mark("star2");
                    starMiniatures[2] = starMiniatures[1].duplicate().position(2 * STAR_SPACE, 0).mark("star3");
                    starMiniatures[3] = starMiniatures[2].duplicate().position(3 * STAR_SPACE, 0).mark("star4");
                    starMiniatures[4] = starMiniatures[3].duplicate().position(4 * STAR_SPACE, 0).mark("star5");
                };
                let starMiniatures = [];
                starMiniatures[0] = new svg.Polygon().add(starPoints).color(myColors.yellow, 0.2, myColors.yellow).mark("star1"); // Etoile

                starMiniatures.pop = new PopOut(80, 30, null, this.manipulator, true);
                starMiniatures.pop.setPanel();
                starMiniatures.pop.defineProperty(0,-h/2);
                _duplicateStars();
                starMiniatures.forEach(
                    star => {
                        this.starsManipulator.add(star);
                        svgr.attr(star.component, 'fill-rule', 'nonzero');
                        if (playerMode) {
                            svg.addEvent(star,"click",() => onStarClick(star));
                            svg.addEvent(star , 'mouseenter', ()=>{onStarHover(star)})
                            //svg.addEvent(star.border, 'mouseenter', ()=>{onStarHover(star)})
                            svg.addEvent(star, 'mouseleave', ()=>{onStarLeave(star)})
                        }
                    }
                );
                this.starsManipulator.scalor.scale(factor);
                this.starsManipulator.move(-(STAR_SPACE-1) * factor*3, - h / 3);
                this.notationTextManipulator = new Manipulator(this);
                let notationText = new svg.Text('Notez cette \n formation :').position(0,-h*0.5).font('Arial', 12, 10);
                this.notationTextManipulator.add(notationText);
                this.manipulator.add(this.notationTextManipulator);
                this.manipulator.set(2,this.starsManipulator);
            };
            let starPoints = [
                [1.309, 0],
                [1.6180, 0.9511],
                [2.6180, 0.9511],
                [1.8090, 1.5388],
                [2.118, 2.4899],
                [1.3090, 1.9021],
                [0.5, 2.4899],
                [0.8090, 1.5388],
                [0, 0.9511],
                [1, 0.9511]
            ]
            if(this.formation.progress == 'done' && globalVariables.playerMode){
                createStars();
            }

            !globalVariables.playerMode && addSettingsIcon();
            this.formation.parent.formationsManipulator.add(this.manipulator);
            let miniature = {
                content: autoAdjustText(this.formation.label, w, h, 20, 'Arial', this.manipulator, 1), //new svg.Text(this.formation.label).font("Arial", 20).dimension(w, h).position(0, h / 2),
                border: new svg.Polygon().add(points).color([250, 250, 250], 1, myColors.grey) //Hexagon vertical donc dimensions inversées
            };
            //this.manipulator.set(1, miniature.content);
            this.manipulator.set(0, miniature.border);
            miniature.border.mark(this.formation.label);


            if (!playerMode && statusEnum[this.formation.status]) {
                let icon = statusEnum[this.formation.status].icon(iconSize);
                icon.elements.forEach((element, index) => {
                    this.iconManipulator.set(index, element);
                });
            }
            this.iconManipulator.move(w / 4, -h * 2 / 3 - iconSize / 2);
            this.manipulator.move(x, y);
            this.manipulator.add(this.iconManipulator);

            playerMode && this.drawIcon();
            if (this.picture){
                this.drawPicture();
            }
            let onMouseOverSelect = manipulator => {
                manipulator.get(0).color([130, 180, 255], 3, myColors.black);
            };
            let onMouseOutSelect = manipulator => {
                manipulator.get(0).color([250, 250, 250], 1, myColors.grey);
            };

            this.setHandler("mouseenter", () => onMouseOverSelect(this.manipulator));
            this.setHandler("mouseleave", () => onMouseOutSelect(this.manipulator));
        }

        drawIcon() {
            const circleToggleSize = 12.5;
            let iconSetting = new IconSetting().setBorderSize(circleToggleSize);

            switch (this.formation.progress) {
                case "done":
                    iconSetting.setBorderDefaultColor(myColors.green, 0, myColors.none)
                        .setPathCheckContent(20, myColors.none, 3, myColors.white);
                    break;
                case "inProgress":
                    iconSetting.setBorderDefaultColor(myColors.orange, 0, myColors.none)
                        .setTextContent(circleToggleSize * 2, circleToggleSize * 2, "...", 20, "arial", myColors.white);
                    break;
                default:
                    iconSetting.setBorderDefaultColor(myColors.blue, 0, myColors.none)
                        .setTriangleContent(8, 8, 'E', myColors.none, 3, myColors.white);
                    break;
            }
            let icon = new Icon(this.iconManipulator, iconSetting);
            this.manipulator.add(this.iconManipulator);
        }

        setHandler(eventname, handler) {
            this.manipulator.addEvent(eventname, handler);
        }

        removeHandler(eventname) {
            this.manipulator.removeEvent(eventname);
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
                drawings.component.clean();
                this.updateStartPosition("left");
                this.fillVisibleElementsArray(this.orientation);
                this.display();
            };
            this.rightChevron.handler = () => {
                drawings.component.clean();
                this.updateStartPosition("right");
                this.fillVisibleElementsArray(this.orientation);
                this.display();
            };
        }

        checkPuzzleElementsArrayValidity() {
            this.visibleElementsArray.forEach(array => {
                array.forEach(
                    element => {
                        if (!(element instanceof AddEmptyElementVue)) {
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
                let itElem = 0;
                it.forEach(elem => {
                    let layer = this.orientation === "leftToRight" ? itNumber * this.columns + it.indexOf(elem) + 3 : itNumber * this.rows + it.indexOf(elem) + 3;
                    this.manipulator.set(layer, elem.manipulator); // +2 pour les chevrons + 1 border
                    elem.display(elem.x, elem.y + ((globalVariables.playerMode) ? SPACING_Y_INCORRECT_ANSWER * itElem++ : 0),
                        elem.width, elem.height);
                });
                itNumber++;
            });
        }
    }

    class Server {
        constructor() {
        }

        static connect(mail, password, cookie) {
            return dbListener.httpPostAsync('/auth/connect', {mailAddress: mail, password: password, cookie: cookie})
        }
        static checkCookie() {
            return dbListener.httpGetAsync('/auth/verify')
        }

        static inscription(user) {
            return dbListener.httpPostAsync('/users/inscription', user)
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
            return dbListener.httpPostAsync("/users/self/progress", data)
                .then(() => {
                    if (quiz.currentQuestionIndex !== quiz.tabQuestions.length - 1) {
                        return this.saveLastAction(data);
                    }
                    else {
                        return this.saveLastAction({});
                    }
                });
        }
        static saveLastAction(object) {
            return dbListener.httpPostAsync('users/self/lastAction', object);
        }
        static getUser() {
            return dbListener.httpGetAsync("/users/self")
        }
        static resetPassword(mailAddress) {
            return dbListener.httpPostAsync('/users/password/reset', mailAddress);
        }
        static checkTimestampPassword(id) {
            return dbListener.httpPostAsync('/users/password/new', id);
        }
        static updatePassword(id, password) {
            return dbListener.httpPostAsync('/users/password/update', {id: id, password: password});
        }

        static getAllFormations() {
            return dbListener.httpGetAsync('/formations');
        }
        static getFormationsProgress(id) {
            return dbListener.httpGetAsync('/formations/' + id + '/progression');
        }
        static getVersionById(id) {
            return dbListener.httpGetAsync("/formations/" + id)
        }
        static replaceFormation(id, newFormation, status, ignoredData) {
            newFormation.status = status;
            return dbListener.httpPostAsync("/formations/" + id, newFormation, ignoredData)
        }
        static insertFormation(newFormation, status, ignoredData) {
            newFormation.status = status;
            return dbListener.httpPostAsync("/formations/insert", newFormation, ignoredData)
        }
        static deactivateFormation(id, ignoredData) {
            return dbListener.httpPostAsync("/formations/deactivate", {id: id}, ignoredData);
        }
        static replaceQuiz(newQuiz, id, levelIndex, gameIndex, ignoredData) {
            return dbListener.httpPostAsync('/formations/' + id + "/quiz/" + levelIndex + "/" + gameIndex, newQuiz, ignoredData);
        }

        static upload(file, onProgress, onAbort) {
            return dbListener.httpUpload("/medias/upload", file, onProgress, this.deleteVideo);
        }
        static getImages() {
            return dbListener.httpGetAsync('/medias/images');
        }
        static deleteImage(image) {
            return dbListener.httpPostAsync("/medias/images/delete", image);
        }
        static getVideos() {
            return dbListener.httpGetAsync('/medias/videos');
        }
        static deleteVideo(video) {
            return dbListener.httpPostAsync("/medias/videos/delete", video);
        }
        static updateSingleFormationStars(id, starId, versionId) {
            return dbListener.httpPostAsync('/formations/userFormationEval/' + id, {starId: starId, versionId: versionId});
        }
    }

    svg.TextItem.prototype.enter = function () {
        this.messageText = this.component.value || (this.component.target && this.component.target.value) || (this.component.mock && this.component.mock.value);
        if (this.component.value === "") this.messageText = "";
    };

    /////////////// Bdd.js //////////////////
    /**
     * Created by ABL3483 on 10/03/2016.
     */
    function Bdd() {
        HEADER_SIZE = 0.07;
        REGEX = /^([A-Za-z0-9.éèêâàîïëôûùö ()©,;°?!'"-/\n]){0,3000}$/g;
        REGEX_NO_CHARACTER_LIMIT = /^([A-Za-z0-9.éèêâàîïëôûùö ()©,;°?!'"-/\n]){0,}$/g;
        MAX_CHARACTER_REGEX = 200;
        REGEX_ERROR_NUMBER_CHARACTER = "Ce champ doit être composé de moins de 3000 caractères";
        MAX_CHARACTER_TITLE = 23;
        MIN_CHARACTER_TITLE = 2;
        TITLE_FORMATION_REGEX = /^([A-Za-z0-9.:+#@%éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ'-]){2,50}$/g;

        TITLE_REGEX = /^([A-Za-z0-9.,;:!?()éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ °'-]){0,50}$/g;
        REGEX_ERROR = "Seuls les caractères alphanumériques, avec accent et \"-,',.;?!°© sont permis";
        REGEX_ERROR_FORMATION = "Veuillez rentrer un nom de formation valide";
        EMPTY_FIELD_ERROR = "Veuillez remplir tous les champs";
        MARGIN = 10;
        STAR_SPACE = 4;

        starsNoteEnum = {
            'star1' : 'Pas Terrible',
            'star2': 'Passable',
            'star3' : 'Correcte',
            'star4' : 'Bien',
            'star5' : 'Excellente'
        };

        // starEnum = {
        //     starBase : 10,
        //     topStar : 5,
        //     bottomStar : 15
        // }
        myParentsList = ["parent", "parentManipulator", "answersManipulator", "validateManipulator", "parentElement",
            "resetManipulator", "manipulatorQuizInfo", "questionCreatorManipulator",
            "previewButtonManipulator", "saveQuizButtonManipulator", "saveFormationButtonManipulator", "toggleButtonManipulator",
            "mainManipulator", "manipulator", "resultManipulator", "scoreManipulator", "quizManager",
            "quizInfoManipulator", "returnButtonManipulator", "questionPuzzleManipulator", "component", "drawing",
            "answerParent", "obj", "checkbox", "border", "content", "parentQuiz", "selectedAnswers", "validatedAnswers", "linkedQuestion",
            "leftArrowManipulator", "rightArrowManipulator", "virtualTab", "questionWithBadAnswersManipulator",
            "editor", "miniatureManipulator", "parentFormation", "formationInfoManipulator", "parentGames", "returnButton",
            "simpleChoiceMessageManipulator", "arrowsManipulator", "miniaturesManipulator", "miniature", "previewMode", "miniaturePosition",
            "resultArea", "questionArea", "titleArea", "redCrossManipulator", "parentQuestion", "questionsWithBadAnswers", "score", "currentQuestionIndex",
            "linesManipulator", "penManipulator", "closeButtonManipulator", "miniaturesManipulator", "toggleFormationsManipulator", "iconManipulator", "infosManipulator", "manip",
            "formationsManipulator", "miniatureObject.infosManipulator", "publicationFormationButtonManipulator", "expButtonManipulator", "arrow",
            "invalidQuestionPictogramManipulator", "explanationIconManipulator", "panelManipulator", "textManipulator", "chevronManipulator", "leftChevronManipulator", "miniatureManipulator",
            "rightChevronManipulator", "bgColor"];

        ignoredData = (key, value) => myParentsList.some(parent => key === parent) || value instanceof Manipulator ? undefined : value;

        myColors = {
            ultraLightGrey: [184,187,196],
            customBlue: [43, 120, 228],
            darkBlue: [25, 25, 112],
            blue: [25, 122, 230],
            primaryBlue: [0, 0, 255],
            grey: [125, 122, 117],
            lightyellow: [239, 239, 78],
            lighteryellow: [239, 239, 0],
            lightgrey: [242, 242, 241],
            lightwhite: [250, 250, 250],
            orange: [230, 122, 25],
            purple: [170, 100, 170],
            green: [155, 222, 17],
            raspberry: [194, 46, 83],
            black: [0, 0, 0],
            white: [255, 255, 255],
            red: [255, 0, 0],
            yellow: [240, 212, 25],
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
                        var newQuiz = new QuizVue(defaultQuiz, false, formation);
                        newQuiz.tabQuestions[0].parentQuiz = newQuiz;
                        newQuiz.id = "quizz" + formation.gamesCounter.quizz;
                        formation.gamesCounter.quizz++;
                        newQuiz.title = "Quiz " + formation.gamesCounter.quizz;
                        formation.levelsTab[level].gamesTab.splice(posX, 0, newQuiz);
                    }
                }
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

        defaultQuiz = {
            title: "",
            bgColor: myColors.white,
            puzzleLines: 3,
            puzzleRows: 3,
            tabQuestions: [defaultQuestion]
        };

        singleAnswerValidationTab = [
            // Check 1 Correct Answer:
            question => ({
                isValid: question.tabAnswer && question.tabAnswer.some(el => el.model.correct),
                message: "Vous devez cocher au moins une bonne réponse."
            }),
            // Check answer's name:
            question => {
                let isValid = question.tabAnswer.slice(0, -1).every(el => ((el.model.label && (!el.model.invalidLabelInput)) || el.model.imageSrc || el.model.video));
                let message = "Vous devez remplir correctement toutes les réponses.";

                return {
                    isValid: isValid,
                    message: message
                }
            },
            // Check QuestionVue Name:
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
                let isValid = (question.parentQuiz.title !== "" && question.parentQuiz.title !== undefined && !!question.parentQuiz.title.match(REGEX));
                let message = "Vous devez remplir correctement le nom du quiz.";
                return {
                    isValid: isValid,
                    message: message
                }
            }
        ];

        multipleAnswerValidationTab = [
            // Check 1 Correct Answer:
            question => ({
                isValid: question.tabAnswer && question.tabAnswer.some(el => el.model.correct),
                message: "Vous devez cocher au moins une bonne réponse."
            }),
            // Check answer's name:
            question => ({
                isValid: question.tabAnswer.slice(0, -1).every(el => ((el.model.label && (!el.model.invalidLabelInput)) || el.model.imageSrc || el.model.video)),
                message: "Vous devez remplir correctement toutes les réponses."
            }),
            // Check QuestionVue Name:
            question => ({
                isValid: !!((question.label && (!question.invalidLabelInput)) || question.imageSrc || question.video), // Checker si le champ saisi de la question est valide
                message: "Vous devez remplir correctement le nom de la question."
            }),
            // Check Quiz Name:
            question => ({
                isValid: (question.parentQuiz.title !== "" && question.parentQuiz.title !== undefined && question.parentQuiz.title.match(REGEX)),
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
        getStringWidthByFontSize,
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
        Server,
        drawHexagon,
        goDirectlyToLastAction,
        PopOut
    }
};