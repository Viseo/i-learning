/**
 * Created by HDA3014 on 06/02/2016.
 */

exports.Gui = function(svg, param) {

    class Canvas {

        constructor(width, height) {
            this.drawing = new svg.Drawing(width, height);
            this.drawing.background = new svg.Translation();
            this.drawing.glass = new svg.Rect(width, height).position(width / 2, height / 2).opacity(0.001);
            this.drawing.add(this.drawing.background).add(this.drawing.glass);
            this.currentFocus = null;
            let drag = null;
            svg.addEvent(this.drawing.glass, 'mousedown', event=> {
                let target = this.drawing.background.getTarget(event.clientX, event.clientY);
                drag = target;
                if (target) {
                    svg.event(target, 'mousedown', event);
                }
            });
            svg.addEvent(this.drawing.glass, 'mousemove', event=> {
                let target = drag || this.drawing.background.getTarget(event.clientX, event.clientY);
                if (target) {
                    svg.event(target, 'mousemove', event);
                }
            });
            svg.addEvent(this.drawing.glass, 'mouseup', event=> {
                let target = drag || this.drawing.background.getTarget(event.clientX, event.clientY);
                if (target) {
                    this.currentFocus = this.getFocus(target);
                    svg.event(target, 'mouseup', event);
                    svg.event(target, 'click', event);
                }
                drag = null;
            });
            svg.addEvent(this.drawing.glass, 'mouseout', event=> {
                if (drag) {
                    svg.event(drag, 'mouseup', event);
                }
                drag = null;
            });
            svg.addGlobalEvent("keydown", event=> {
                if (this.processKeys(event.keyCode)) {
                    event.preventDefault();
                }
            });
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

        processKeys(key) {
            this.currentFocus && this.currentFocus.processKeys && this.currentFocus.processKeys(key);
            return true;
        }

        show(anchor) {
            this.drawing.show(anchor);
            return this;
        }

        add(svgObject) {
            this.drawing.background.add(svgObject);
            return this;
        }

        remove(svgObject) {
            this.drawing.background.remove(svgObject);
            return this;
        }

        dimension(width, height) {
            this.drawing.dimension(width, height);
            this.drawing.glass.dimension(width, height);
            this.drawing.glass.position(width / 2, height / 2);
            return this;
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
            this.border = new svg.Rect(width, height).color([], 4, [0, 0, 0]);
            this.view = new svg.Drawing(width, height).position(-width / 2, -height / 2);
            this.scale = new svg.Scaling(1);
            this.translate = new svg.Translation();
            this.rotate = new svg.Rotation(0);
            this.component
                .add(this.view.add(this.translate.add(this.rotate.add(this.scale))))
                .add(this.border);
            this.hHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], hHandleCallback).horizontal(-width / 2, width / 2, height / 2);
            this.component.add(this.hHandle.component);
            this.vHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], vHandleCallback).vertical(width / 2, -height / 2, height / 2);
            this.component.add(this.vHandle.component);
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        set(component) {
            if (this.content) {
                this.component.remove(this.content);
            }
            this.content = component;
            this.scale.add(this.content);
            this.updateHandles();
            return this;
        }

        updateHandles() {
            let factor = this.scale.factor;
            this.hHandle.dimension(this.view.width, this.content.width * factor)
                .position((this.view.width / 2 - this.content.x * factor) / (this.content.width * factor) * this.view.width);
            this.vHandle.dimension(this.view.height, this.content.height * factor)
                .position((this.view.height / 2 - this.content.y * factor) / (this.content.height * factor) * this.view.height);
        }

        remove(component) {
            if (this.content === component) {
                this.scale.remove(component);
                delete this.content;
            }
            return this;
        }

        controlLocation(x, y) {
            if (x > 0) {
                x = 0;
            }
            if (x < -this.content.width + this.view.width / this.scale.factor) {
                x = -this.content.width + this.view.width / this.scale.factor;
            }
            if (y > 0) {
                y = 0;
            }
            if (y < -this.content.height + this.view.height / this.scale.factor) {
                y = -this.content.height + this.view.height / this.scale.factor;
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
            let minFactorWidth = this.view.width / this.content.width;
            let minFactorHeight = this.view.height / this.content.height;
            if (factor < minFactorWidth) {
                factor = minFactorWidth;
            }
            if (factor < minFactorHeight) {
                factor = minFactorHeight;
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
                let ref = this.handle.localPoint(event.clientX, event.clientY);
                this.handle.mousemoveHandler = event=> {
                    let mouse = this.handle.localPoint(event.clientX, event.clientY);
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
                    svg.removeEvent(this.handle, 'mousemove', this.handle.mousemoveHandler);
                    svg.removeEvent(this.handle, 'mouseup', this.handle.mouseupHandler);
                    delete this.handle.mousemoveHandler;
                    delete this.handle.mouseupHandler;
                };
                svg.addEvent(this.handle, 'mousemove', this.handle.mousemoveHandler);
                svg.addEvent(this.handle, 'mouseup', this.handle.mouseupHandler);
            });
        }

        vertical(x, y1, y2) {
            delete this.y;
            this.x = x;
            this.y1 = y1 < y2 ? y1 : y2;
            this.y2 = y1 < y2 ? y2 : y1;
            this._draw();
            return this;
        }

        horizontal(x1, x2, y) {
            delete this.x;
            this.x1 = x1 < x2 ? x1 : x2;
            this.x2 = x1 < x2 ? x2 : x1;
            this.y = y;
            this._draw();
            return this;
        }

        dimension(size, total) {
            this.size = size;
            this.total = total;
            this._draw();
            return this;
        }

        position(point) {
            let getPosition= point=> {
                let position = point;
                let length;
                this.x && (length = (this.y2 - this.y1));
                this.y && (length = (this.x2 - this.x1));
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
            let length;

            let buildHorizontalHandle= ()=> {
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

            let buildVerticalHandle = ()=> {
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
                    if (this.x) {
                        this.component.move(this.x, this.y1 + position);
                        buildHorizontalHandle.call(this);
                    }
                    else {
                        this.component.move(this.x1 + position, this.y);
                        buildVerticalHandle.call(this);
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

            this.width = width;
            this.height = height;
            this.component = new svg.Translation();
            this.component.focus = this;
            this.border = new svg.Rect(width, height).color([], 4, [0, 0, 0]);
            this.view = new svg.Drawing(width, height).position(-width / 2, -height / 2);
            this.translate = new svg.Translation();
            this.component.add(this.view.add(this.translate)).add(this.border);
            this.vHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], vHandleCallback).vertical(width / 2, -height / 2, height / 2);
            this.component.add(this.vHandle.component);
            this.back = new svg.Rect(width, height).color(color, 0, []);
            this.content = new svg.Translation();
            this.content.width = width;
            this.content.height = height;
            this.translate.add(this.back.position(width / 2, height / 2)).add(this.content);
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
            this.back.dimension(width, height).position(width / 2, height / 2);
            return this;
        }

        updateHandle() {
            this.vHandle.dimension(this.view.height, this.content.height)
                .position((this.view.height / 2 - this.content.y) / (this.content.height) * this.view.height);
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

        resizeContent(height) {
            if (height > this.height) {
                this.content.height = height;
                var width = this.content.width;
                this.back.position(width / 2, height / 2);
                this.back.dimension(width, height);
                this.updateHandle();
            }
            return this;
        }

        controlPosition(y) {
            if (y > 0) {
                y = 0;
            }
            if (y < -this.content.height + this.view.height) {
                y = -this.content.height + this.view.height;
            }
            return y;
        }

        moveContent(y) {
            let completeMovement = progress=> {
                this.updateHandle();
                if (progress === 1) {
                    delete this.animation;
                }
            };
            if (!this.animation) {
                this.animation = true;
                let ly = this.controlPosition(y);
                this.content.onChannel().smoothy(param.speed, param.step)
                    .execute(completeMovement).moveTo(0, ly);
            }
            return this;
        }

        processKeys(keycode) {
            if (isUpArrow(keycode)) {
                this.moveContent(this.content.y + 100);
            }
            else if (isDownArrow(keycode)) {
                this.moveContent(this.content.y - 100);
            }
            else {
                return false;
            }
            return true;

            function isUpArrow(keycode) {
                return keycode === 38;
            }

            function isDownArrow(keycode) {
                return keycode === 40;
            }
        }

    }

    class Button {
        constructor(width, height, colors, text) {
            this.width = width;
            this.height = height;
            this.back = new svg.Rect(width, height).color(colors[0], colors[1], colors[2]);
            this.component = new svg.Translation().add(this.back);
            this.text = new svg.Text(text).font("Arial", 24);
            this.component.add(this.text.position(0, 8));
            this.glass = new svg.Rect(width, height).color([0, 0, 0]).opacity(0.001);
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

        onClick(handler) {
            if (this.handler) {
                svg.removeEvent(this.glass, "mouseup", this.handler);
            }
            this.handler = handler;
            svg.addEvent(this.glass, "mouseup", this.handler);
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

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        addPane(pane) {
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
    const DEFAULT_PANE_HEIGHT = 100;
    class Pane {

        constructor(colors, text, elemSize) {
            this.elemSize = elemSize;
            this.width = DEFAULT_PANE_HEIGHT;
            this.height = DEFAULT_PANE_HEIGHT;
            this.colors = colors;
            this.opened = false;
            this.component = new svg.Translation();
            this.title = new Button(this.width, TITLE_HEIGHT, this.colors, text);
            this.title.onClick(()=> {
                if (this.opened) {
                    this.close();
                }
                else {
                    this.open();
                }
            });
            this.panel = new Panel(this.width, this.height - TITLE_HEIGHT, colors[0]);
            this.panel.component.move(0, TITLE_HEIGHT + this.height / 2);
            this.component.add(this.title.component);
            this.component.add(this.panel.component);
            this.tools = [];
        }

        addTool(tool) {
            this.tools.push(tool);
            this.panel.add(tool.component);
            tool.palette = this.palette;
            var rowSize = Math.floor(this.width / this.elemSize);
            var height = Math.floor(((this.tools.length - 1) / rowSize) + 1) * this.elemSize;
            tool.component.move(
                ((this.tools.length - 1) % rowSize) * this.elemSize + this.elemSize / 2,
                height - this.elemSize / 2);
            this.panel.resizeContent(height);
            return this;
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

        resize(width, height) {
            this.width = width;
            this.height = height;
            this.title.resize(width, TITLE_HEIGHT).position(0, -height / 2 + TITLE_HEIGHT / 2);
            this.panel.resize(width, this.height - TITLE_HEIGHT).position(0, TITLE_HEIGHT / 2);
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

        constructor(component, callback) {
            this.component = new svg.Translation().add(component);
            component.tool = this;
            this.callback = callback;
        }

    }

    return {
        Canvas:Canvas,
        Frame:Frame,
        Handle:Handle,
        Panel:Panel,
        Pane:Pane,
        Palette:Palette,
        Tool:Tool
    }
};