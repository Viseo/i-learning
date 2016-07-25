/**
 * Created by HDA3014 on 06/02/2016.
 */

exports.Gui = function(svg, param) {

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
            this.drawing = new svg.Drawing(width, height);
            this.component.add(this.drawing);
            this.component.background = new svg.Translation().mark("background");
            this.component.glass = new svg.Rect(width, height).mark("glass").position(width / 2, height / 2).opacity(0.001);
            this.drawing.add(this.component.background).add(this.component.glass);
            this.currentFocus = null;
            let drag = null;
            svg.addEvent(this.component.glass, 'mousedown', event=> {
                let target = this.component.background.getTarget(event.pageX, event.pageY);
                drag = target;
                if (target) {
                    svg.event(target, 'mousedown', event);
                }
            });
            svg.addEvent(this.component.glass, 'mousemove', event=> {
                let target = drag || this.component.background.getTarget(event.pageX, event.pageY);
                if (target) {
                    svg.event(target, 'mousemove', event);
                }
            });
            svg.addEvent(this.component.glass, 'mouseup', event=> {
                let target = drag || this.component.background.getTarget(event.pageX, event.pageY);
                if (target) {
                    this.currentFocus = this.getFocus(target);
                    svg.event(target, 'mouseup', event);
                    svg.event(target, 'click', event);
                }
                drag = null;
            });
            svg.addEvent(this.component.glass, 'mouseout', event=> {
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

        mark(label) {
            this.component.mark(label);
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

        processKeys(key) {
            return this.currentFocus && this.currentFocus.processKeys && this.currentFocus.processKeys(key);
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
                svg.runtime.preventDefault(event);
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
            this.vHandle = new Handle([svg.LIGHT_ORANGE, 3, svg.ORANGE], vHandleCallback);
            this.back = new svg.Rect(width, height).color(color, 0, []);
            this.content = new svg.Translation();
            this.content.width = width;
            this.content.height = height;
            this.translate.add(this.back.position(width / 2, height / 2)).add(this.content);
            this._handleVisibility();
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
            this._handleVisibility();
            this.back.dimension(width, height).position(width / 2, height / 2);
            return this;
        }

        _handleVisibility() {
            if (this.height>0) {
                if (!this.handleVisible) {
                    this.handleVisible = true;
                    this.component.add(this.vHandle.component);
                }
                this.vHandle.vertical(this.width / 2, -this.height / 2, this.height / 2);
            }
            else {
                if (this.handleVisible) {
                    delete this.handleVisible;
                    this.component.remove(this.vHandle.component);
                }
            }
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

        resizeContent(width, height) {
            if (height > this.height) {
                this.content.height = height;
                this.content.width = width;
                this.back.position(width / 2, height / 2);
                this.back.dimension(width, height);
            }
            this.updateHandle();
            return this;
        }

        controlPosition(y) {
            if (y < this.view.height - this.content.height) {
                y = this.view.height - this.content.height;
            }
            if (y > 0) {
                y = 0;
            }
            return y;
        }

        moveContent(y) {
            let vy = y;
            let completeMovement = progress=> {
                this.updateHandle();
                if (progress === 1) {
                    delete this.animation;
                }
            };
            if (!this.animation) {
                this.animation = true;
                let ly = this.controlPosition(vy);
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
                    .position(0, 32/4);
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
            let row = new svg.Translation();
            let back = new svg.Rect(this.width, this.rowHeight)
                .position(this.width/2, 0).color(svg.DARK_BLUE).opacity(0);
            let glass = new svg.Rect(this.width, this.rowHeight)
                .position(this.width/2, 0).color(svg.BLACK).opacity(0.005);
            svg.addEvent(glass, "click", ()=>{this.select(index, item)});
            let baseRow = new svg.Translation(0, index*this.rowHeight+this.rowHeight/2)
                .add(back).add(row).add(glass);
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

        fill(items) {
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

        onClick(click) {
            if (this._onClick) {
                svg.removeEvent(this.glass, "mouseup", this._onClick);
            }
            this._onClick = click;
            svg.addEvent(this.glass, "mouseup", this._onClick);
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
            this.width = width;
            this.height = height;
            this.title.resize(this.width, TITLE_HEIGHT).position(0, -this.height / 2 + TITLE_HEIGHT / 2);
            this.panel.resize(this.width, this.height - TITLE_HEIGHT).position(0, TITLE_HEIGHT / 2);
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

        constructor(component, callback) {
            this.component = new svg.Translation().add(component);
            component.tool = this;
            this.callback = callback;
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

        show(canvas, x=canvas.width/2, y=canvas.height/2) {
            this.canvas = canvas;
            this.component.move(x, y);
            this.mask = new svg.Rect(canvas.width, canvas.height).color(svg.BLACK).opacity(0.5)
                .position(canvas.width/2, canvas.height/2);
            this.canvas.add(this.mask);
            svg.addEvent(this.mask, "click", ()=>{
               this.cancel();
            });
            this.canvas.add(this.component);
            return this;
        }

        close() {
            for (let item of this.items) {
                item.close && item.close();
            }
            this.canvas.remove(this.component);
            this.canvas.remove(this.mask);
            return this;
        }

        cancel() {
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
            let glass = new svg.Circle(40).color(svg.BLACK).opacity(0.005);
            ifOk=ifOk||this.close;
            svg.addEvent(glass, "click", ()=>{
                if (this.okEnabled) {
                    ifOk.call(this);
                }
            });
            this.okIconBackground = new svg.Circle(40);
            this.enableOk();
            this.okIcon = new svg.Translation()
                .add(this.okIconBackground)
                .add(new svg.Polygon(0, 0).color(svg.WHITE, 2, svg.GREY)
                    .add(-25, -10).add(-5, 10).add(30, -20).add(-5, 25))
                .add(glass);
            this.content.add(this.okIcon);
            this.placeButtons();
            return this;
        }

        whenCancel(ifCancel) {
            let glass = new svg.Circle(40).color(svg.BLACK).opacity(0.005);
            ifCancel=ifCancel||this.close;
            svg.addEvent(glass, "click", ()=>{ifCancel.call(this);});
            this.cancelIcon = new svg.Translation().add(new svg.Rotation(45)
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
            this.add(this.fileNameLabel.anchor("middle").position(0, 0));
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

        hideControl() {
            canvas(this.component).component.remove(this.control);
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this.component.move(x, y);
            return this;
        }

        font(fontName, fontSize) {
            this.fontName = fontName;
            this.fontSize = fontSize;
            this.text.font(fontName, fontSize);
            return this;
        }

        close() {
        }

    }

    class Selector {

        constructor(x, y, width, height, items) {
            this.items = items;
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

    class TextField {

        constructor(x, y, width, height, message) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.textMessage = message;
            this.frame = new svg.Rect(width, height).color(svg.LIGHT_GREY, 3, svg.GREY);
            this.glass = new svg.Rect(width, height).color(svg.BLACK).opacity(0.005);
            svg.addEvent(this.glass, "click", ()=>{
               this.showControl();
            });
            this.component = new svg.Translation().move(x, y).add(this.frame);
            this.text = new svg.Text(message).anchor("start").dimension(width, height);
            this.component.add(this.text).add(this.glass);
            this.control = new svg.TextField(x, y, width, height).message(message)
                .color(svg.WHITE, 3, svg.ALMOST_BLACK).anchor(svg.TextItem.LEFT);
            this.onInputFct = (message)=>{
                let valid = this.controlValidity(message);
                if (this._onInput) {
                    this._onInput(message, valid);
                }
                return valid;
            };
            this.control.onInput((message)=>{this.onInputFct(message);});
            svg.addEvent(this.control, "blur", ()=>{
                this.hideControl();
            });
            this.fontName = "arial";
            this.fontSize = 32;
            this.text.font(this.fontName, this.fontSize);
            this.control.font(this.fontName, this.fontSize);
            this._draw();
        }

        controlValidity(message) {
            let valid = this.validate(message);
            if (valid) {
                this.textMessage = message;
                this.text.message(message);
                this.control.color(svg.WHITE, 3, svg.ALMOST_BLACK);
            }
            else {
                this.control.color(svg.WHITE, 3, svg.RED);
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

        showControl() {
            canvas(this.component).component.add(this.control);
            this._draw();
            this.control.focus().select();
        }

        hideControl() {
            canvas(this.component).component.remove(this.control);
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this.component.move(x, y);
            this._draw();
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this.frame.dimension(width, height);
            this.text.dimension(width, height);
            this.control.dimension(width, height);
            this._draw();
            return this;
        }

        font(fontName, fontSize) {
            this.fontSize = fontSize;
            this.text.font(fontName, fontSize);
            this.control.font(fontName, fontSize);
            this._draw();
            return this;
        }

        _draw() {
            this.text.position(- this.width / 2 + this.fontSize / 4, this.fontSize / 4);
            let position = this.component.globalPoint(-this.width/2, -this.height/2);
            if (position) {
                this.control.position(position.x, position.y);
            }
        }

        close() {
            this.hideControl();
        }

        onInput(input) {
            this._onInput = input;
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

    return {
        Canvas:Canvas,
        canvas:canvas,
        Frame:Frame,
        Handle:Handle,
        Panel:Panel,
        Pane:Pane,
        Palette:Palette,
        Tool:Tool,
        Popin:Popin,
        ConfirmPopin:ConfirmPopin,
        WarningPopin:WarningPopin,
        Grid:Grid,
        TextField:TextField,
        NumberField:NumberField,
        Label:Label,
        Selector:Selector
    }
};