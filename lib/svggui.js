/**
 * Created by HDA3014 on 06/02/2016.
 */
var Memento = require("./memento").Memento;

exports.Gui = function(svg, param) {

    const WHEEL_STEP = 100;


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

    function isPlus(keycode) {
        return keycode === 107;
    }

    function isMinus(keycode) {
        return keycode === 109;
    }

    function isY(keycode) {
        return keycode === 89;
    }

    function isZ(keycode) {
        return keycode === 90;
    }

    function canvas(component) {
        while(component) {
            if (component.canvas) {
                return component.canvas;
            }
            else {
                component = component.parent;
            }
        }
    }

    class Canvas {

        constructor(width, height) {
            this.component = new svg.Screen(width, height);
            this.component.canvas = this;
            this.drawing = new svg.Drawing(width, height).mark("frame");
            this.component.add(this.drawing);
            this.component.background = new svg.Translation().mark("background");
            this.component.glass = new svg.Rect(width, height).mark("glass").position(width / 2, height / 2).opacity(0.001);
            this.drawing.add(this.component.background).add(this.component.glass);
            this.currentFocus = null;
            this.drag = null;
            this.current = null;
            this.component.glass.onMouseDown(event=> {
                if (!event.processed) {
                    if (!this.drag) {
                        let target = this.component.background.getTarget(event.pageX, event.pageY);
                        this.manageInOut(target, event);
                        this.drag = target;
                        if (target) {
                            svg.event(target, 'mousedown', event);
                        }
                    }
                    this.activated();
                }
            });
            this.component.glass.onMouseMove(event=> {
                if (!event.processed) {
                    let target = this.drag || this.component.background.getTarget(event.pageX, event.pageY);
                    this.manageInOut(target, event);
                    if (target) {
                        svg.event(target, 'mousemove', event);
                    }
                    this.activated();
                }
            });
            this.component.glass.onMouseUp(event=> {
                if (!event.processed) {
                    let target = this.drag || this.component.background.getTarget(event.pageX, event.pageY);
                    this.manageInOut(target, event);
                    this.drag = null;
                    if (target) {
                        this.currentFocus = this.getFocus(target);
                        svg.event(target, 'mouseup', event);
                        let finalTarget = this.component.background.getTarget(event.pageX, event.pageY);
                        if (finalTarget===target) {
                            svg.event(target, 'click', event);
                        }
                    }
                    this.activated();
                }
            });
            this.component.glass.onMouseOut(event=> {
                if (!event.processed) {
                    this.manageInOut(null, event);
                    if (this.drag) {
                        svg.event(this.drag, 'mouseup', event);
                    }
                    this.drag = null;
                    this.activated();
                }
            });
            this.component.glass.onMouseWheel(event=> {
                if (!event.processed) {
                    let target = this.drag || this.component.background.getTarget(event.pageX, event.pageY);
                    this.manageInOut(target, event);
                    if (target) {
                        svg.event(target, 'wheel', event);
                    }
                    this.activated();
                }
            });
            svg.addGlobalEvent("keydown", event=> {
                if (!event.processed) {
                    if (this.processKeys(event.keyCode, event.ctrlKey, event.altKey)) {
                        svg.runtime.preventDefault(event);
                    }
                    this.activated();
                }
            });
            this.keys=[];
            this.activationListeners = [];
        }

        manageInOut(target, event) {
            if (target!=this.current) {
                if (this.current) {
                    svg.event(this.current, 'mouseleave', event);
                }
                this.current = target;
                if (this.current) {
                    svg.event(this.current, 'mouseenter', event);
                }
            }
        }

        mark(label) {
            this.component.mark(label);
            return this;
        }

        activated() {
            [...this.activationListeners].forEach(listener=>listener.refresh());
        }

        addActivationListener(activationListener) {
            this.activationListeners.add(activationListener);
            return this;
        }

        removeActivationListener(activationListener) {
            this.activationListeners.remove(activationListener);
            return this;
        }

        dragFocus(drag) {
            this.drag = drag;
            return this;
        }

        getFocus(component) {
            while (component != null) {
                if (component.focus) {
                    return component.focus;
                }
                else {
                    component = component.parent;
                }
            }
            return null;
        }

        key(key, handler) {
            this.keys[key] = {
                handler: handler
            };
            return this;
        }

        processKeys(key, ctrl, alt) {
//            console.log("Key : "+key);
            if (ctrl && isZ(key)) {
                Memento.rollback();
                return true;
            }
            else if (ctrl && isY(key)) {
                Memento.replay();
                return true;
            }
            else if (this.keys[key]) {
                this.keys[key].handler(key, ctrl, alt);
                return true;
            }
            return this.currentFocus && this.currentFocus.processKeys && this.currentFocus.processKeys(key, ctrl, alt);
        }

        show(anchor) {
            this.component.show(anchor);
            return this;
        }

        add(svgObject) {
            this.component.background.add(svgObject);
            return this;
        }

        remove(svgObject) {
            this.component.background.remove(svgObject);
            return this;
        }

        dimension(width, height) {
            this.component.dimension(width, height);
            this.drawing.dimension(width, height);
            this.component.glass.dimension(width, height);
            this.component.glass.position(width / 2, height / 2);
            return this;
        }

        get width() {
            return this.component.width;
        }

        get height() {
            return this.component.height;
        }
    }

    class Frame {

        constructor(width, height) {
            let hHandleCallback = position=> {
                let factor = this.scale.factor;
                let x = -position * this.content.width / this.view.width + this.view.width / 2 / factor;
                let y = this.content.y;
                this.content.move(x, y);
            };

            let vHandleCallback = position=> {
                let factor = this.scale.factor;
                let x = this.content.x;
                let y = -position * this.content.height / this.view.height + this.view.height / 2 / factor;
                this.content.move(x, y);
            };

            this.component = new svg.Translation();
            this.component.focus = this;
            this.border = new svg.Rect(width, height).color([], 4, [0, 0, 0]).mark("border");
            this.background = new svg.Rect(width, height).color([100, 100, 100]).mark("background");
            this.view = new svg.Drawing(width, height).position(-width / 2, -height / 2).mark("view");
            this.scale = new svg.Scaling(1).mark("scale");
            this.translate = new svg.Translation().mark("translate");
            this.rotate = new svg.Rotation(0).mark("rotate");
            this.component
                .add(this.background)
                .add(this.view.add(this.translate.add(this.rotate.add(this.scale))))
                .add(this.border);
            this.hHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], hHandleCallback).horizontal(-width / 2, width / 2, height / 2);
            this.component.add(this.hHandle.component.mark("hhandle"));
            this.vHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], vHandleCallback).vertical(width / 2, -height / 2, height / 2);
            this.component.add(this.vHandle.component.mark("vhandle"));
            this.wheelHandler = (event)=> {
                if (event.deltaX>0) {
                    this.moveContent(this.content.x+WHEEL_STEP, this.content.y);
                }
                else if (event.deltaX<0) {
                    this.moveContent(this.content.x-WHEEL_STEP, this.content.y);
                }
                if (event.deltaY>0) {
                    this.moveContent(this.content.x, this.content.y+WHEEL_STEP);
                }
                else if (event.deltaY<0) {
                    this.moveContent(this.content.x, this.content.y-WHEEL_STEP);
                }
            };
            this.translate.onMouseWheel(this.wheelHandler);
        }

        dimension(width, height) {
            this.border.dimension(width, height);
            this.background.dimension(width, height);
            this.view.dimension(width, height).position(-width / 2, -height / 2);
            this.hHandle.horizontal(-width / 2, width / 2, height / 2);
            this.vHandle.vertical(width / 2, -height / 2, height / 2);
            if (this.content) {
                let location = this.controlLocation(this.content.x, this.content.y);
                this.content.move(location.x, location.y);
            }
            this.updateHandles();
            return this;
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        set(component) {
            if (this.content) {
                this.content.onResize(null);
                this.scale.remove(this.content);
            }
            this.content = component;
            this.content.onResize(()=>{
                this.zoomContent(this.scale.factor);
                //this.updateHandles();
            });
            this.scale.add(this.content);
            this.updateHandles();
            return this;
        }

        installDnD(what, conf) {
            installDragAndDrop(what, this.scale, conf);
        }

        uninstallDnD(what) {
            uninstallDragAndDrop(what);
        }

        updateHandles() {
            if (this.content) {
                this.hHandle.dimension(this.view.width, this.content.width * this.scale.factor)
                    .position((this.view.width / 2 - this.content.x * this.scale.factor) /
                        (this.content.width * this.scale.factor) * this.view.width);
                this.vHandle.dimension(this.view.height, this.content.height * this.scale.factor)
                    .position((this.view.height / 2 - this.content.y * this.scale.factor) /
                        (this.content.height * this.scale.factor) * this.view.height);
            }
        }

        backgroundColor(color) {
            this.background.color(color);
            return this;
        }

        remove(component) {
            if (this.content === component) {
                this.scale.remove(component);
                delete this.content;
            }
            return this;
        }

        controlLocation(x, y) {
            if (x < -this.content.width + this.view.width / this.scale.factor) {
                x = -this.content.width + this.view.width / this.scale.factor;
            }
            if (x > 0) {
                x = 0;
            }
            if (y < -this.content.height + this.view.height / this.scale.factor) {
                y = -this.content.height + this.view.height / this.scale.factor;
            }
            if (y > 0) {
                y = 0;
            }
            return {x: x, y: y};
        }

        moveContent(x, y) {
            let completeMovement = progress=> {
                this.updateHandles();
                if (progress === 1) {
                    delete this.animation;
                }
            };

            if (!this.animation) {
                this.animation = true;
                let location = this.controlLocation(x, y);
                this.content.onChannel().smoothy(param.speed, param.step)
                    .execute(completeMovement).moveTo(location.x, location.y);
            }
            return this;
        }

        zoomContent(factor) {
            let oldFactor = this.scale.factor;
            let minFactor = 1;
            let minFactorWidth = this.view.width / this.content.width;
            if (minFactor > minFactorWidth) {
                minFactor = minFactorWidth;
            }
            let minFactorHeight = this.view.height / this.content.height;
            if (minFactor > minFactorHeight) {
                minFactor = minFactorHeight;
            }
            if (factor < minFactor) {
                factor = minFactor;
            }
            this.scale.scale(factor);
            let location = this.controlLocation(
                this.content.x + this.view.width / 2 * (1 / factor - 1 / oldFactor),
                this.content.y + this.view.height / 2 * (1 / factor - 1 / oldFactor));
            this.content.move(location.x, location.y);
            this.updateHandles();
        }

        zoomIn() {
            this.zoomContent(this.scale.factor * 1.5);
        }

        zoomOut() {
            this.zoomContent(this.scale.factor / 1.5);
        }

        processKeys(keycode) {
            var factor = this.scale.factor;
            if (isLeftArrow(keycode)) {
                this.moveContent(this.content.x + 100 / factor, this.content.y);
            }
            else if (isUpArrow(keycode)) {
                this.moveContent(this.content.x, this.content.y + 100 / factor);
            }
            else if (isRightArrow(keycode)) {
                this.moveContent(this.content.x - 100 / factor, this.content.y);
            }
            else if (isDownArrow(keycode)) {
                this.moveContent(this.content.x, this.content.y - 100 / factor);
            }
            else if (isPlus(keycode)) {
                this.zoomIn();
            }
            else if (isMinus(keycode)) {
                this.zoomOut();
            }
            else {
                return false;
            }
            return true;
        }
    }

    const HANDLE_THICKNESS = 16;

    class Handle {

        constructor(colors, callback) {
            this.colors = colors;
            this.callback = callback;
            this.handle = new svg.Path().color(this.colors[0], this.colors[1], this.colors[2]);
            this.component = new svg.Translation().add(this.handle);
            this.manageDnD();
        }

        manageDnD() {
            svg.addEvent(this.handle, 'mousedown', event=> {
                svg.runtime.preventDefault(event);
                let ref = this.handle.localPoint(event.pageX, event.pageY);
                this.handle.mousemoveHandler = event=> {
                    let mouse = this.handle.localPoint(event.pageX, event.pageY);
                    let dx = mouse.x - ref.x;
                    let dy = mouse.y - ref.y;
                    let newPosition = this.x !== undefined ? this.point + dy : this.point + dx;
                    this.position(newPosition);
                    if (this.callback) {
                        this.callback(this.point);
                    }
                    return true;
                };
                this.handle.mouseupHandler = event=> {
                    this.handle.onMouseMove(null);
                    this.handle.onMouseUp(null);
                    delete this.handle.mousemoveHandler;
                    delete this.handle.mouseupHandler;
                };
                this.handle.onMouseMove(this.handle.mousemoveHandler);
                this.handle.onMouseUp(this.handle.mouseupHandler);
            });
        }

        vertical(x, y1, y2) {
            delete this.y;
            this.x = x;
            this.y1 = y1 < y2 ? y1 : y2;
            this.y2 = y1 < y2 ? y2 : y1;
            this.position(this.point);
            return this;
        }

        horizontal(x1, x2, y) {
            delete this.x;
            this.x1 = x1 < x2 ? x1 : x2;
            this.x2 = x1 < x2 ? x2 : x1;
            this.y = y;
            this.position(this.point);
            return this;
        }

        dimension(size, total) {
            this.size = size;
            this.total = total;
            this.position(this.point);
            return this;
        }

        position(point) {
            let getPosition= point=> {
                let position = point;
                let length;
                this.x!==undefined && (length = (this.y2 - this.y1));
                this.y!==undefined && (length = (this.x2 - this.x1));
                this.handleSize = length / this.total * this.size;
                if (position < this.handleSize / 2) {
                    position = this.handleSize / 2;
                }
                if (position > length - this.handleSize / 2) {
                    position = length - this.handleSize / 2;
                }
                return position;
            };
            this.point = getPosition(point);
            this._draw();
            return this;
        }

        _draw() {
            let buildVerticalHandle= ()=> {
                if (this.handleSize < HANDLE_THICKNESS * 2) {
                    this.handle.reset()
                        .move(-HANDLE_THICKNESS / 2, 0)
                        .cubic(-HANDLE_THICKNESS / 2, HANDLE_THICKNESS,
                            HANDLE_THICKNESS / 2, HANDLE_THICKNESS,
                            HANDLE_THICKNESS / 2, 0)
                        .cubic(HANDLE_THICKNESS / 2, -HANDLE_THICKNESS,
                            -HANDLE_THICKNESS / 2, -HANDLE_THICKNESS,
                            -HANDLE_THICKNESS / 2, 0);
                }
                else {
                    let mainSize = this.handleSize - HANDLE_THICKNESS;
                    this.handle.reset()
                        .move(-HANDLE_THICKNESS / 2, -mainSize / 2)
                        .line(-HANDLE_THICKNESS / 2, mainSize / 2)
                        .cubic(-HANDLE_THICKNESS / 2, mainSize / 2 + HANDLE_THICKNESS,
                            HANDLE_THICKNESS / 2, mainSize / 2 + HANDLE_THICKNESS,
                            HANDLE_THICKNESS / 2, mainSize / 2)
                        .line(HANDLE_THICKNESS / 2, -mainSize / 2)
                        .cubic(HANDLE_THICKNESS / 2, -mainSize / 2 - HANDLE_THICKNESS,
                            -HANDLE_THICKNESS / 2, -mainSize / 2 - HANDLE_THICKNESS,
                            -HANDLE_THICKNESS / 2, -mainSize / 2);
                }
            };

            let buildHorizontalHandle = ()=> {
                if (this.handleSize < HANDLE_THICKNESS * 2) {
                    this.handle.reset()
                        .move(0, -HANDLE_THICKNESS / 2)
                        .cubic(HANDLE_THICKNESS, -HANDLE_THICKNESS / 2,
                            HANDLE_THICKNESS, HANDLE_THICKNESS / 2,
                            0, HANDLE_THICKNESS / 2)
                        .cubic(-HANDLE_THICKNESS, HANDLE_THICKNESS / 2,
                            -HANDLE_THICKNESS, -HANDLE_THICKNESS / 2,
                            0, -HANDLE_THICKNESS / 2);
                }
                else {
                    let mainSize = this.handleSize - HANDLE_THICKNESS;
                    this.handle.reset().move(-mainSize / 2, -HANDLE_THICKNESS / 2)
                        .line(mainSize / 2, -HANDLE_THICKNESS / 2)
                        .cubic(mainSize / 2 + HANDLE_THICKNESS, -HANDLE_THICKNESS / 2,
                            mainSize / 2 + HANDLE_THICKNESS, HANDLE_THICKNESS / 2,
                            mainSize / 2, HANDLE_THICKNESS / 2)
                        .line(-mainSize / 2, HANDLE_THICKNESS / 2)
                        .cubic(-mainSize / 2 - HANDLE_THICKNESS, HANDLE_THICKNESS / 2,
                            -mainSize / 2 - HANDLE_THICKNESS, -HANDLE_THICKNESS / 2,
                            -mainSize / 2, -HANDLE_THICKNESS / 2);
                }
            };

            let allVisible= ()=> {
                return this.size >= this.total;
            };

            if ((this.x !== undefined || this.y !== undefined) && this.size && this.point !== undefined) {
                if (allVisible()) {
                    this.handle.reset();
                }
                else {
                    let position = this.point;
                    if (this.x !== undefined) {
                        this.component.move(this.x, this.y1 + position);
                        buildVerticalHandle();
                    }
                    else {
                        this.component.move(this.x1 + position, this.y);
                        buildHorizontalHandle();
                    }
                }
            }
        }

    }

    class Panel {

        constructor(width, height, color) {
            let vHandleCallback = position=> {
                var x = this.content.x;
                var y = -position * this.content.height / this.view.height + this.view.height / 2;
                this.content.move(x, y);
            };
            let hHandleCallback = position=> {
                var x = -position * this.content.width / this.view.width + this.view.width / 2;
                var y = this.content.y;
                this.content.move(x, y);
            };
            this.width = width;
            this.height = height;
            this.component = new svg.Translation();
            this.component.focus = this;
            this.border = new svg.Rect(width, height).color([], 4, [0, 0, 0]);
            this.view = new svg.Drawing(width, height).position(-width / 2, -height / 2);
            this.translate = new svg.Translation();
            this.component.add(this.view.add(this.translate)).add(this.border);
            this.vHandle = new Handle([svg.LIGHT_ORANGE, 3, svg.ORANGE], vHandleCallback);
            this.vHandle.component.mark("vhandle");
            this.hHandle = new Handle([svg.LIGHT_ORANGE, 3, svg.ORANGE], hHandleCallback);
            this.hHandle.component.mark("hhandle");
            this.back = new svg.Rect(width, height).color(color, 0, []).mark("background");
            this.content = new svg.Translation().mark("content");
            this.wheelHandler = (event)=> {
                if (event.deltaY>0) {
                    this.moveContent(this.content.x, this.content.y+WHEEL_STEP);
                }
                else if (event.deltaY<0) {
                    this.moveContent(this.content.x, this.content.y-WHEEL_STEP);
                }
                if (event.deltaX>0) {
                    this.moveContent(this.content.x+WHEEL_STEP, this.content.y);
                }
                else if (event.deltaX<0) {
                    this.moveContent(this.content.x-WHEEL_STEP, this.content.y);
                }
            };
            this.translate.onMouseWheel(this.wheelHandler);
            this.content.width = width;
            this.content.height = height;
            this.translate.add(this.back.position(width / 2, height / 2)).add(this.content);
            this.updateHandle();
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        resize(width, height) {
            width !== undefined && (this.width = width);
            height !== undefined && (this.height = height);
            this.border.dimension(width, height);
            this.view.dimension(width, height).position(-width / 2, -height / 2);
            this.updateHandle();
            this.back.dimension(this.width, this.height).position(this.width / 2, this.height / 2);
            return this;
        }

        updateHandle() {
            if (this.height>0) {
                if (!this.vertHandleVisible) {
                    this.vertHandleVisible = true;
                    this.component.add(this.vHandle.component);
                }
                this.vHandle.vertical(this.width / 2, -this.height / 2, this.height / 2);
                this.vHandle.dimension(this.view.height, this.content.height)
                    .position((this.view.height / 2 - this.content.y) / (this.content.height) * this.view.height);
            }
            else {
                if (this.vertHandleVisible) {
                    delete this.vertHandleVisible;
                    this.component.remove(this.vHandle.component);
                }
            }
            if (this.width>0) {
                if (!this.horizHandleVisible) {
                    this.horizHandleVisible = true;
                    this.component.add(this.hHandle.component);
                }
                this.hHandle.horizontal(-this.width / 2, this.width / 2, this.height / 2);
                this.hHandle.dimension(this.view.width, this.content.width)
                    .position((this.view.width / 2 - this.content.x) / (this.content.width) * this.view.width);
            }
            else {
                if (this.horizHandleVisible) {
                    delete this.horizHandleVisible;
                    this.component.remove(this.hHandle.component);
                }
            }
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
            let changed = false;
            this.content.height = height;
            this.content.width = width;
            this.back.position(this.content.width / 2, this.content.height / 2);
            this.back.dimension(this.content.width, this.content.height);
            this.updateHandle();
            return this;
        }

        /*
        controlPosition(x, y) {
            if (x < this.view.width - this.content.width) {
                x = this.view.width - this.content.width;
            }
            if (x > 0) {
                x = 0;
            }
            if (y < this.view.height - this.content.height) {
                y = this.view.height - this.content.height;
            }
            if (y > 0) {
                y = 0;
            }
            return {x, y};
        }
*/

        moveContent(x, y) {
            let vx = x;
            let vy = y;
            let completeMovement = progress=> {
                this.updateHandle();
                if (progress === 1) {
                    delete this.animation;
                }
            };
            if (!this.animation) {
                this.animation = true;
                //let ps = this.controlPosition(vx, vy);
                this.content.onChannel().smoothy(param.speed, param.step)
//                    .execute(completeMovement).moveTo(ps.x, ps.y);
                    .execute(completeMovement).moveTo(vx, vy);
            }
            return this;
        }

        color(color) {
            this.back.color(color, 0, []);
            return this;
        }

        processKeys(keycode) {
            if (isUpArrow(keycode)) {
                this.moveContent(this.content.x, this.content.y + 100);
            }
            else if (isDownArrow(keycode)) {
                this.moveContent(this.content.x, this.content.y - 100);
            }
            else if (isLeftArrow(keycode)) {
                this.moveContent(this.content.x+100, this.content.y);
            }
            else if (isRightArrow(keycode)) {
                this.moveContent(this.content.x-100, this.content.y);
            }
            else {
                return false;
            }
            return true;

        }

    }

    const TEXT_MARGIN = 20;

    class TextPanel extends Panel {

        constructor(width, height, color) {
            super(width, height, color);
            this.textPane = new svg.Text().position(TEXT_MARGIN, TEXT_MARGIN).anchor("start");
            this.add(this.textPane);
        }

        text(text) {
            this.textPane.message(text);
            this.refresh();
            return this;
        }

        font(fontName, fontSize, lineSpacing) {
            this.textPane.font(fontName, fontSize, lineSpacing);
            this.textPane.position(TEXT_MARGIN, TEXT_MARGIN+fontSize);
            this.refresh();
            return this;
        }

        refresh() {
            let bounds = this.textPane.boundingRect();
            this.resizeContent(
                bounds.width+TEXT_MARGIN*2,
                bounds.height+TEXT_MARGIN*2+this.textPane.fontSize);
        }
    }

    class Grid {

        constructor(width, height, rowHeight) {
            this.width = width;
            this.height = height;
            this.rowHeight = rowHeight;
            this.component = new svg.Translation();
            this.content = new Panel(width, height, svg.LIGHT_GREY);
            this.component.add(this.content.component);
            this.columns = [];
            this.rows = [];
            this.selected = null;
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this.component.move(x, y);
            return this;
        }

        column(x, renderer, select, unselect) {
            this.columns.add({x:x, renderer:renderer, select:select, unselect:unselect});
            return this;
        }

        textColumn(x, width, fieldName) {
            let renderer = (item)=>{
                return new svg.Text(item[fieldName])
                    .anchor("start")
                    .font("arial", 32).color(svg.ALMOST_BLACK)
                    .position(0, 32/4)
                    .mark("cell:"+fieldName);
            };
            let select = (item, svgObject)=> {
                svgObject.color(svg.ALMOST_WHITE);
            };
            let unselect = (item, svgObject)=> {
                svgObject.color(svg.ALMOST_BLACK);
            };
            return this.column(x, renderer, select, unselect);
        }

        select(index, item) {
            if (this.selected) {
                this.selected.back.opacity(0);
                for (let c=0; c<this.columns.length; c++) {
                    this.columns[c].unselect(this.selected.item, this.selected.row.children[c]);
                }
            }
            this.selected = this.rows[index];
            this.selected.back.opacity(1);
            for (let c=0; c<this.columns.length; c++) {
                this.columns[c].select(this.selected.item, this.selected.row.children[c]);
            }
            if (this._onSelect) {
                this._onSelect(index, item);
            }
        }

        onSelect(select) {
            this._onSelect = select;
            return this;
        }

        add(item) {
            this._row(item, this.rows.length);
        }

        _row(item, index) {
            let row = new svg.Translation().mark("content");
            let back = new svg.Rect(this.width, this.rowHeight).mark("background")
                .position(this.width/2, 0).color(svg.DARK_BLUE).opacity(0);
            let glass = new svg.Rect(this.width, this.rowHeight).mark("glass")
                .position(this.width/2, 0).color(svg.BLACK).opacity(0.005);
            svg.addEvent(glass, "click", ()=>{this.select(index, item)});
            let baseRow = new svg.Translation(0, index*this.rowHeight+this.rowHeight/2)
                .add(back).add(row).add(glass).mark("row:"+index);
            baseRow.back = back;
            baseRow.row = row;
            baseRow.item = item;
            this.content.add(baseRow);
            for (let c=0; c<this.columns.length; c++) {
                let cell = this.columns[c].renderer(item);
                row.add(new svg.Translation(this.columns[c].x, 0).add(cell));
            }
            this.rows.add(baseRow);
        }

        fill(items=[]) {
            for (let i=0; i<items.length; i++) {
                this.add(items[i]);
            }
            let contentHeight = items.length*this.rowHeight;
            this.content.resizeContent(this.width, contentHeight);
            return this;
        }

    }

    class Button {

        constructor(width, height, colors, text) {
            this.width = width;
            this.height = height;
            this.back = new svg.Rect(width, height).color(colors[0], colors[1], colors[2]);
            this.component = new svg.Translation().add(this.back).mark("background");
            this.text = new svg.Text(text).font("Arial", 24).mark("label");
            this.glass = new svg.Rect(width, height).color([0, 0, 0]).opacity(0.001).mark("glass");
            this.component.add(this.text.position(0, 8)).add(this.glass);
        }

        resize(width, height) {
            this.width = width;
            this.height = height;
            this.back.dimension(width, height);
            this.glass.dimension(width, height);
            return this;
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        onClick(click) {
            if (this._onClick) {
                svg.removeEvent(this.glass, "click", this._onClick);
            }
            this._onClick = click;
            svg.addEvent(this.glass, "click", this._onClick);
            return this;
        }

    }

    class Palette {

        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.component = new svg.Translation();
            this.panes = [];
            this.channel = svg.onChannel();
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this.resizePanes();
            return this;
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        addPane(pane) {
            pane.component.mark("pane:"+this.panes.length);
            pane.palette = this;
            if (this.panes.length === 0) {
                this.currentPane = pane;
                pane.open();
            }
            else {
                pane.close();
            }
            pane.title.onClick(()=> {
                if (this.currentPane !== pane) {
                    let paneToClose = this.currentPane;
                    let paneToOpen = pane;
                    this.animate(paneToOpen, paneToClose);
                }
            });
            this.panes.push(pane);
            this.component.add(pane.component);
            this.resizePanes();
            return this;
        }

        resizePanes() {
            var y = -this.height / 2;
            var panelHeight = this.height - this.panes.length * TITLE_HEIGHT;
            for (var i = 0; i < this.panes.length; i++) {
                var pane = this.panes[i];
                if (pane.opened) {
                    pane.resize(this.width, panelHeight + TITLE_HEIGHT);
                    pane.position(0, y + pane.height / 2);
                    y += TITLE_HEIGHT + panelHeight;
                }
                else {
                    pane.resize(this.width, TITLE_HEIGHT);
                    pane.position(0, y + pane.height / 2);
                    y += TITLE_HEIGHT;
                }
            }
        }

        animate(openedPane, closedPane) {
            const STEPS = 100;
            const DELAY = 2;
            let panelHeight = this.height - this.panes.length * TITLE_HEIGHT;
            let delta = panelHeight / STEPS;
            this.channel.play(DELAY, STEPS,
                i=> {
                    var y = -this.height / 2;
                    for (let p = 0; p < this.panes.length; p++) {
                        let pane = this.panes[p];
                        if (pane === openedPane) {
                            pane.resize(this.width, (i + 1) * delta + TITLE_HEIGHT);
                            pane.position(0, y + pane.height / 2);
                            y += (i + 1) * delta + TITLE_HEIGHT;
                        }
                        else if (pane === closedPane) {
                            pane.resize(this.width, panelHeight - (i + 1) * delta + TITLE_HEIGHT);
                            pane.position(0, y + pane.height / 2);
                            y += panelHeight - (i + 1) * delta + TITLE_HEIGHT;
                        }
                        else {
                            pane.position(0, y + pane.height / 2);
                            y += TITLE_HEIGHT;
                        }
                    }
                },
                ()=> {
                    openedPane.open();
                    closedPane.close();
                    delete this.animation;
                    this.currentPane = openedPane;
                }
            );
        }
    }

    const TITLE_HEIGHT = 40;
    const DEFAULT_PANE_DIMENSION = 100;

    class Pane {

        constructor(colors, text, elemSize) {
            this.elemSize = elemSize;
            this.width = DEFAULT_PANE_DIMENSION;
            this.height = DEFAULT_PANE_DIMENSION;
            this.colors = colors;
            this.opened = false;
            this.component = new svg.Translation();
            this.title = new Button(this.width, TITLE_HEIGHT, this.colors, text);
            this.titleAction(()=> {
                if (this.opened) {
                    this.close();
                    this.resize(this.width, 0);
                }
                else {
                    this.open();
                    this.resize(this.width, this.height);
                }
            });
            this.panel = new Panel(this.width, this.height - TITLE_HEIGHT, colors[0]);
            this.panel.component.move(0, TITLE_HEIGHT + this.height / 2);
            this.component.add(this.title.component.mark("title"));
            this.component.add(this.panel.component.mark("content"));
            this.tools = [];
        }

        titleAction(action) {
            this.title.onClick(action);
            return this;
        }

        addTool(tool) {
            this.tools.push(tool);
            this.panel.add(tool.component);
            tool.palette = this.palette;
            this._resizeContent();
            return this;
        }

        _resizeContent() {
            let rowSize = Math.floor(this.width / this.elemSize) || 1;
            let height = Math.floor(((this.tools.length - 1) / rowSize) + 1) * this.elemSize;
            this.panel.resizeContent(this.width, height);
            for (let t=0; t<this.tools.length; t++) {
                let y = Math.floor((t / rowSize) + 1) * this.elemSize;
                this.tools[t].component.move(
                    (t % rowSize) * this.elemSize + this.elemSize / 2,
                    y - this.elemSize / 2);
            }
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        resize(width, height) {
            width !== undefined && (this.width = width);
            height !== undefined && (this.height = height);
            let panelHeight = Math.round(this.height - TITLE_HEIGHT);
            this.title.resize(this.width, TITLE_HEIGHT).position(0, -this.height / 2 + TITLE_HEIGHT / 2);
            this.panel.resize(this.width, panelHeight<0 ? 0 : panelHeight).position(0, TITLE_HEIGHT / 2);
            this._resizeContent();
            return this;
        }

        open() {
            if (!this.opened) {
                this.opened = true;
            }
            return this;
        }

        close() {
            if (this.opened) {
                this.opened = false;
            }
            return this;
        }

    }

    class Tool {

        constructor(component) {
            this.component = new svg.Translation().add(component);
            component.tool = this;
        }

        setCallback(callback) {
            this.callback = callback;
            return this;
        }

    }

    class Popin {

        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.content = new svg.Translation();
            this.background = new svg.Rect(this.width, this.height).color(svg.BEIGE, 4, svg.ORANGE);
            this.component = new svg.Translation().add(this.background).add(this.content);
            this.items = [];
        }

        disableKeyEvents() {
            this.saveKeydown = svg.runtime.getGlobalEventHandler("keydown");
            this.saveKeypressed = svg.runtime.getGlobalEventHandler("keypressed");
            this.saveKeyup = svg.runtime.getGlobalEventHandler("keyup");
            this.saveKeydown && svg.runtime.removeGlobalEvent("keydown");
            this.saveKeypressed && svg.runtime.removeGlobalEvent("keypressed");
            this.saveKeyup && svg.runtime.removeGlobalEvent("keyup");
        }

        restoreKeyEvents() {
            this.saveKeydown && svg.runtime.addGlobalEvent("keydown", this.saveKeydown);
            this.saveKeypressed && svg.runtime.addGlobalEvent("keypressed", this.saveKeypressed);
            this.saveKeyup && svg.runtime.addGlobalEvent("keyup", this.saveKeyup);
        }

        show(canvas, x=canvas.width/2, y=canvas.height/2) {
            this.canvas = canvas;
            this.component.move(x, y);
            this.mask = new svg.Rect(canvas.width, canvas.height).color(svg.BLACK).opacity(0.5)
                .position(canvas.width/2, canvas.height/2).mark('mask');
            this.canvas.add(this.mask);
            svg.addEvent(this.mask, "click", ()=>{
               this.cancel();
            });
            this.canvas.add(this.component);
            this.disableKeyEvents();
            return this;
        }

        close() {
            for (let item of this.items) {
                item.close && item.close();
            }
            this.canvas.remove(this.component);
            this.canvas.remove(this.mask);
            this.restoreKeyEvents();
            return this;
        }

        cancel() {
            this.ifCancel && this.ifCancel.call(this);
            this.close();
        }

        disableOk() {
            this.okEnabled = false;
            this.okIconBackground && this.okIconBackground.color(svg.LIGHT_GREY, 3, svg.GREY);
        }

        enableOk() {
            this.okEnabled = true;
            this.okIconBackground && this.okIconBackground.color(svg.GREEN, 3, svg.DARK_GREEN);
        }

        whenOk(ifOk) {
            let glass = new svg.Circle(40).color(svg.BLACK).opacity(0.005).mark('glass');
            ifOk=ifOk||this.close;
            svg.addEvent(glass, "click", ()=>{
                if (this.okEnabled) {
                    ifOk.call(this);
                }
            });
            this.okIconBackground = new svg.Circle(40);
            this.enableOk();
            this.okIcon = new svg.Translation().mark('ok')
                .add(this.okIconBackground)
                .add(new svg.Polygon(0, 0).color(svg.WHITE, 2, svg.GREY)
                    .add(-25, -10).add(-5, 10).add(30, -20).add(-5, 25))
                .add(glass);
            this.content.add(this.okIcon);
            this.placeButtons();
            return this;
        }

        whenCancel(ifCancel=(()=>{})) {
            let glass = new svg.Circle(40).color(svg.BLACK).opacity(0.005).mark('glass');
            this.ifCancel=ifCancel;
            svg.addEvent(glass, "click", ()=>this.cancel());
            this.cancelIcon = new svg.Translation().mark('cancel')
                .add(new svg.Rotation(45)
                .add(new svg.Circle(40).color(svg.RED, 3, svg.DARK_RED))
                .add(new svg.Polygon(0, 0).color(svg.WHITE, 2, svg.GREY)
                    .add(-5, 30).add(-5, 5).add(-30, 5).add(-30, -5).add(-5, -5).add(-5, -30)
                    .add(5, -30).add(5, -5).add(30, -5).add(30, 5).add(5, 5).add(5, 30)
                )
                .add(glass)
            );
            this.content.add(this.cancelIcon);
            this.placeButtons();
            return this;
        }

        placeButtons() {
            if (this.okIcon && this.cancelIcon) {
                this.okIcon.move(-50, this.height/2-50);
                this.cancelIcon.move(50, this.height/2-50)
            }
            else if (this.okIcon) {
                this.okIcon.move(-0, this.height/2-50);
            }
            else if (this.cancelIcon) {
                this.cancelIcon.move(0, this.height/2-50)
            }
        }

        add(item) {
            this.content.add(item.component);
            item.open && item.open();
            this.items.add(item);
            return this;
        }

        remove(item) {
            this.content.remove(item.component);
            item.close && item.close();
            this.items.remove(item);
            return this;
        }

        focus() {
            return false;
        }
    }

    class WarningPopin extends Popin {

        constructor(message, whenOk, canvas) {
            super(800, 300);
            this._title = new Label(0, 0, "Warning !").anchor('middle').font("arial", 40);
            this.fileNameLabel = new Label(0, 0, message);
            this.add(this._title.position(0, -100));
            this.add(this.fileNameLabel.anchor("middle").position(0, 0));
            this.whenOk(function() {
                this.close();
                whenOk && whenOk();
            });
            this.show(canvas);
        }

        title(title) {
            this._title.message(title);
            return this;
        }
    }

    class ConfirmPopin extends Popin {

        constructor(message, whenOk, canvas) {
            super(800, 300);
            this.title = new Label(0, 0, "Confirm").anchor('middle').font("arial", 40);
            this.fileNameLabel = new Label(0, 0, message);
            this.add(this.title.position(0, -100));
            this.add(this.fileNameLabel.anchor("middle").position(0, -20).font("arial", 32, 40));
            this.whenOk(function() {
                this.close();
                whenOk && whenOk();
            }).whenCancel();
            this.show(canvas);
        }

        title(title) {
            this._title.message(title);
            return this;
        }

    }

    class Label {

        constructor(x, y, message) {
            this.x = x;
            this.y = y;
            this._anchor = "start";
            this.textMessage = message;
            this.component = new svg.Translation().move(x, y);
            this.text = new svg.Text(this.textMessage).anchor(this._anchor).color(svg.ORANGE);
            this.component.add(this.text);
            this.fontName = "arial";
            this.fontSize = 32;
            this.text.font(this.fontName, this.fontSize);
        }

        anchor(anchor) {
            this._anchor = anchor;
            this.text.anchor(this._anchor);
            return this;
        }

        message(message) {
            this.textMessage = message;
            this.text.message(message);
            return this;
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this.component.move(x, y);
            return this;
        }

        font(fontName, fontSize, lineSpacing) {
            this.fontName = fontName;
            this.fontSize = fontSize;
            this.text.font(fontName, fontSize, lineSpacing);
            return this;
        }

        close() {
        }

    }

    class Selector {

        constructor(x, y, width, height, items, handler) {
            this.items = items;
            this.handler = handler;
            this.component = new svg.Translation().move(x, y);
            this.item = new svg.Translation();
            this.leftChevron = new svg.Chevron(width/4, height, 15, "W").color(svg.ORANGE, 2, svg.RED).position(-width/2+width/8, 0);
            svg.addEvent(this.leftChevron, "click", ()=>this.selectItem(this.currentItemIndex()+1));
            this.rightChevron = new svg.Chevron(width/4, height, 15, "E").color(svg.ORANGE, 2, svg.RED).position(width/2-width/8, 0);
            svg.addEvent(this.rightChevron, "click", ()=>this.selectItem(this.currentItemIndex()-1));
            this.component.add(this.leftChevron).add(this.item).add(this.rightChevron);
            this.showItem(0);
        }

        showItem(index) {
            if (this.current) {
                this.item.remove(this.current);
            }
            this.current = this.items[index];
            if (this.current) {
                this.item.add(this.current);
            }
            if (this.handler) {
                this.handler(this.currentItem(), this.currentItemIndex());
            }
        }

        currentItem() {
            return this.current;
        }

        currentItemIndex() {
            for (let i=0; i<this.items.length; i++) {
                if (this.items[i]===this.current) {
                    return i;
                }
            }
            return -1;
        }

        selectItem(index) {
            if (this.items.length>0) {
                while (index < 0) {
                    index += this.items.length;
                }
                while (index >= this.items.length) {
                    index -= this.items.length;
                }
                this.showItem(index);
                return this;
            }
        }

        options(items) {
            this.items = items;
            if (this.currentItemIndex()===-1) {
                this.showItem(0)
            }
            return this;
        }
    }

    class TextItem {

        constructor(x, y, width, height, message) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.textMessage = message;
            this.textAnchor="left";
            this._colors = [svg.LIGHT_GREY, 3, svg.GREY];
            this._editColor = [svg.WHITE, 3, svg.ALMOST_BLACK];
            this.frame = new svg.Rect(width, height).color(...this._colors);
            this.glass = new svg.Rect(width, height).color(svg.BLACK).opacity(0.005);
            svg.addEvent(this.glass, "click", ()=>{
                this.showControl();
            });
            this.component = new svg.Translation().move(x, y).add(this.frame);
            this.text = this.buildLabel(message, x, y, width, height);
            this.component.add(this.text).add(this.glass);
            this.control = this.buildControl(message, x, y, width, height);
            this.control.color(...this._editColor);
            this.onInputFct = (message)=>{
                let oldMessage = this.textMessage;
                let valid = this.controlValidity(message);
                if (this._onInput) {
                    this._onInput(oldMessage, message, valid);
                }
                return valid;
            };
            this.control.onInput((message)=>{this.onInputFct(message);});
            svg.addEvent(this.control, "blur", ()=>{
                this.hideControl();
                if (this._onBlur) {
                    this._onBlur();
                }
            });
            this.fontName = "arial";
            this.fontSize = 32;
            this.text.font(this.fontName, this.fontSize);
            this.control.font(this.fontName, this.fontSize);
            this._decoration = "none";
            this.text.decoration(this._decoration);
            this.control.decoration(this._decoration);
            this.valid = true;
            this._draw();
        }

        anchor(textAnchor) {
            if (textAnchor==="left") {
                this.text.anchor("start");
                this.control.anchor(svg.TextItem.LEFT);
            }
            else if (textAnchor==="center") {
                this.text.anchor("middle");
                this.control.anchor(svg.TextItem.CENTER);
            }
            else if (textAnchor==="right") {
                this.text.anchor("end");
                this.control.anchor(svg.TextItem.RIGHT);
            }
            this.textAnchor = textAnchor;
            this._draw();
            return this;
        }

        controlValidity(message) {
            let valid = this.validate(message);
            if (valid) {
                this.textMessage = message;
                this.text.message(message);
                if (this.valid!=valid) {
                    this.control.fontColor(svg.BLACK);
                    this.valid = valid;
                }
            }
            else {
                if (this.valid!=valid) {
                    this.control.fontColor(svg.RED);
                    this.valid = valid;
                }
            }
            return valid;
        }

        validate(message) {
            if (this._pattern) {
                let valid = this._pattern.test(message);
                return valid;
            }
            else {
                return true;
            }
        }

        pattern(pattern) {
            this._pattern = pattern;
            return this;
        }

        message(message) {
            this.textMessage = message;
            this.control.message(message);
            this.text.message(message);
            return this;
        }

        color(colors) {
            this._colors = colors;
            this.frame.color(...this._colors);
            return this;
        }

        decoration(decoration) {
            this._decoration = decoration;
            this.text.decoration(this._decoration);
            this.control.decoration(this._decoration);
            return this;
        }

        editColor(colors) {
            this._editColors = colors;
            this.control.color(...this._editColors);
            return this;
        }

        showControl() {
            function buildClip(component, control) {
                if (component instanceof svg.Drawing && component.parent!=null) {
                    let clip = new svg.Clip(component);
                    clip.add(control);
                    control = clip;
                }
                if (component.parent) {
                    return buildClip(component.parent, control);
                }
                else {
                    return control;
                }
            }

            if (!this.controlShown) {
                this.controlShown = true;
                this.refresh();
                this.clip = buildClip(this.component, this.control);
                canvas(this.component).addActivationListener(this).component.add(this.clip);
                this._draw();
                this.control.focus().select();
            }
        }

        refresh() {
            let scale = this.component.globalScale();
            let position = this.component.globalPoint(-this.width/2, -this.height/2);
            if (position) {
                this.control.position(position.x, position.y);
            }
            this.control.dimension(this.width * scale, this.height * scale);
            this.control.font(this.fontName, this.fontSize * scale, this.lineSpacing);
        }

        hideControl() {
            if (this.controlShown) {
                this.controlShown = false;
                canvas(this.component).addActivationListener(this).component.remove(this.clip);
            }
        }

        position(x, y) {
            if (this.x !== x || this.y !== y) {
                this.x = x;
                this.y = y;
                this.component.move(x, y);
                this._draw();
            }
            return this;
        }

        dimension(width, height) {
            if (this.width!==width || this.height!==height) {
                this.width = width;
                this.height = height;
                this.frame.dimension(width, height);
                this.text.dimension(width, height);
                this.glass.dimension(width, height);
                this.control.dimension(width, height);
                this._draw();
            }
            return this;
        }

        font(fontName, fontSize, lineSpacing) {
            this.fontName = fontName;
            this.fontSize = fontSize;
            this.lineSpacing = lineSpacing;
            this.text.font(fontName, fontSize, lineSpacing);
            this.control.font(fontName, fontSize, lineSpacing);
            this._draw();
            return this;
        }

        _draw() {
            if (this.textAnchor==="left") {
                this.text.position(- this.width / 2, this.fontSize / 3);
            }
            else if (this.textAnchor==="center") {
                this.text.position(0, this.fontSize / 3);
            }
            else if (this.textAnchor==="right") {
                this.text.position(this.width / 2, this.fontSize / 3);
            }
            let position = this.component.globalPoint(-this.width/2, -this.height/2);
            if (position) {
                this.control.position(position.x, position.y);
            }
            this.text._draw();
        }

        close() {
            this.hideControl();
        }

        onInput(input) {
            this._onInput = input;
            return this;
        }

        onBlur(blur) {
            this._onBlur = blur;
            return this;
        }
    }

    class TextField extends TextItem {

        constructor(x, y, width, height, message) {
            super(x, y, width, height, message);
        }

        buildLabel(message, x, y, width, height) {
            return new svg.Text(message)
                .anchor("start")
                .dimension(width, height);
        }

        buildControl(message, x, y, width, height) {
            return new svg.TextField(x, y, width, height).anchor(svg.TextItem.LEFT).message(message);
        }

    }

    class TextArea extends TextItem {

        constructor(x, y, width, height, message) {
            super(x, y, width, height, message);
        }

        buildLabel(message, x, y, width, height) {
            return new svg.Text(message).anchor("start").dimension(width, height);
        }

        buildControl(message, x, y, width, height) {
            return new svg.TextArea(x, y, width, height).anchor(svg.TextItem.LEFT).message(message);
        }

    }

    class NumberField extends TextField {

        constructor(x, y, width, height, value) {
            super(x, y, width/2, height, ""+value);
            let basicOnInputFct = this.onInputFct;
            this.onInputFct = (message)=>{
                if (basicOnInputFct(message)) {
                    this.numericValue = Number(message);
                }
            };
            this.numericValue = value;
            this.leftChevron = new svg.Chevron(width/6, height, 15, "W").color(svg.ORANGE, 2, svg.RED).position(-width/2+width/8, 0);
            svg.addEvent(this.leftChevron, "click", ()=>{
                this.value(this.numericValue-1);
            });
            this.rightChevron = new svg.Chevron(width/6, height, 15, "E").color(svg.ORANGE, 2, svg.RED).position(width/2-width/8, 0);
            svg.addEvent(this.rightChevron, "click", ()=>{
                this.value(this.numericValue+1);
            });
            this.component.add(this.leftChevron).add(this.rightChevron);
            super.pattern(/^\-{0,1}[0-9]+$/);
        }

        bounds(min, max) {
            this.min = min;
            this.max = max;
            return this;
        }

        validate(message) {
            let valid = super.validate(message);
            let value = Number(message);
            if (valid) {
                if (this.min!==undefined && this.min>value) {
                    valid = false;
                }
                if (this.max!==undefined && this.max<value) {
                    valid = false;
                }
            }
            return valid;
        }

        message(message) {
            super.message(message);
            this.numericValue = Number(this.textMessage);
        }

        value(numericValue) {
            if (numericValue!==undefined) {
                this.numericValue = numericValue;
                if (this.min && this.min>this.numericValue) {
                    this.numericValue = this.min;
                }
                if (this.max && this.max<this.numericValue) {
                    this.numericValue = this.max;
                }
                super.message("" + this.numericValue);
                return this;
            }
            else {
                return this.numericValue;
            }
        }
    }

    function installDragAndDrop(what, glass, conf) {
        /**
         * Put item on "scale" (top) handler (if necessary) without changing its appearance (size,
         * position...) and displace it according to mouse position.
         * @param item item to drag
         * @param parent current parent item
         * @param x mouse position on X axis (in LOCAL parent coordinate system !)
         * @param y mouse position on Y axis (in LOCAL parent coordinate system !)
         */
        let drag = (item, parent, x, y)=> {
            let point = glass.localPoint(parent.globalPoint(x, y));
            if (item.parent!==glass) {
                item.parent.remove(item);
                glass.add(item);
            }
            item.move(point.x, point.y);
        };

        /**
         * Gives an item from "scale" (top) handler to a normal handler without changing its appearance (reverse
         * drag operation) and displace it according to mouse position.
         * @param item item to drop
         * @param parent target drop handler (not current item's parent which must be "scale" handler)
         * @param x mouse position on X axis (in LOCAL target parent coordinate system !)
         * @param y mouse position on Y axis (in LOCAL target parent coordinate system !)
         */
        let drop = (item, parent, x, y)=> {
            if (item.parent!==parent) {
                item.parent.remove(item);
                parent.add(item);
            }
            item.move(x, y);
        };

        let revert = (update)=>{
            if (conf.revert) {
                conf.revert(what, update);
            }
            else {
                if (update.angle!==undefined) {
                    what.rotate(update.angle);
                }
                else if (update.x!==undefined && update.y!==undefined) {
                    drop(what.component, update.parent, update.x, update.y);
                }
            }
        };

        let dragged= (x, y)=> {
            if (conf.dragged) {
                conf.dragged(what, x, y);
            }
            else if (what.dragged) {
                what.dragged(x, y);
            }
        };

        let turned= (angle)=> {
            if (conf.turned) {
                conf.turned(what, angle);
            }
            else if (what.turned) {
                what.turned(angle);
            }
        };

        let moved= ()=> {
            if (conf.moved) {
                return conf.moved(what);
            }
            else if (what.moved) {
                return what.moved();
            }
            return true;
        };

        let clicked= ()=> {
            if (conf.clicked) {
                return conf.clicked(what);
            }
            else if (what.clicked) {
                return what.clicked();
            }
            return true;
        };

        let rotated= ()=> {
            if (conf.rotated) {
                return conf.rotated(what);
            }
            else if (what.rotated) {
                return what.rotated();
            }
            return true;
        };

        let anchor= (x, y)=> {
            if (conf.anchor) {
                return conf.anchor(what, x, y);
            }
            return false;
        };

        let install = delta=> {
            let whatParent = what.component.parent;
            if (anchor(delta.x, delta.y)) {
                var startAngle = Math.round(Math.atan2(delta.x - what.x, -delta.y + what.y) / Math.PI * 180);
            }
            let {x:initX, y:initY, angle:initAngle} = what;
            if (!conf.select || conf.select(what, startAngle!=undefined)) {
                let click = true;
                what.addEvent('mousemove', moveEvent=> {
                    let depl = whatParent.localPoint(moveEvent.x, moveEvent.y);
                    if (startAngle!=undefined) {
                        let newAngle = Math.round(Math.atan2(
                                depl.x - what.x, -depl.y + what.y) / Math.PI * 180);
                        let angle = initAngle + newAngle - startAngle;
                        let dragAngle = conf.turn ? conf.turn(what, angle) : angle;
                        what.rotate(dragAngle);
                        turned(dragAngle);
                    }
                    else {
                        let actualX = initX + depl.x - delta.x;
                        let actualY = initY + depl.y - delta.y;
                        let dragPoint = conf.drag ? conf.drag(what, actualX, actualY) : {x: actualX, y: actualY};
                        drag(what.component, whatParent, dragPoint.x, dragPoint.y);
                        dragged(dragPoint.x, dragPoint.y);
                    }
                    click = false;
                });
                what.addEvent('mouseup', endEvent=> {
                    what.removeEvent('mousemove');
                    what.removeEvent('mouseup');
                    let depl = whatParent.localPoint(endEvent.x, endEvent.y);
                    if (startAngle!=undefined) {
                        let newAngle = Math.round(Math.atan2(depl.x - what.x, -depl.y + what.y) / Math.PI * 180);
                        let angle = initAngle + newAngle - startAngle;
                        let dragAngle = conf.rotate ? conf.rotate(what, angle) : angle;
                        what.rotate(dragAngle);
                        if (!rotated(what)) {
                            revert({angle:initAngle});
                        }
                    }
                    else {
                        let finalX = Math.round(initX + depl.x - delta.x);
                        let finalY = Math.round(initY + depl.y - delta.y);
                        let dropEnv = conf.drop ? conf.drop(what, whatParent, finalX, finalY) :
                            {x: finalX, y: finalY, parent:whatParent};
                        drop(what.component, dropEnv.parent, dropEnv.x, dropEnv.y);
                        if (click && depl.x === delta.x && depl.y === delta.y) {
                            if (!clicked()) {
                                revert({parent:whatParent});
                            }
                        }
                        else {
                            if (!moved()) {
                                revert({parent:whatParent, x:initX, y:initY});
                            }
                        }
                    }
                    conf.completed && conf.completed(what);
                });
            }
        };

        what.addEvent('mousedown', event=> {
            /*
             if (what.component.parent===this.scale) {
             console.log("Already on glass !");
             }
             else {
             */
            install(what.component.parent.localPoint(event.x, event.y));
            /*
             }
             */
        });
        if (conf.startInDragMode) {
            install({x:what.x, y:what.y});
        }

    }

    function uninstallDragAndDrop(what) {
        what.removeEvent('mousedown');
    }

    return {
        Canvas:Canvas,
        canvas:canvas,
        Frame:Frame,
        Handle:Handle,
        Panel:Panel,
        TextPanel:TextPanel,
        Button:Button,
        Pane:Pane,
        Palette:Palette,
        Tool:Tool,
        Popin:Popin,
        ConfirmPopin:ConfirmPopin,
        WarningPopin:WarningPopin,
        Grid:Grid,
        TextField:TextField,
        TextArea:TextArea,
        NumberField:NumberField,
        Label:Label,
        Selector:Selector,
        installDnD : installDragAndDrop,
        uninstallDnD : uninstallDragAndDrop
    }
};