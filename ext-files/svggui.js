/**
 * Created by HDA3014 on 06/02/2016.
 */

function Gui() {

    function Canvas(width, height) {
        this.drawing = new svg.Dra  wing(width, height);
        this.drawing.background = new svg.Translation();
        this.drawing.glass = new svg.Rect(width, height).position(width/2, height/2).opacity(0.001);
        this.drawing.add(this.drawing.background).add(this.drawing.glass);
        this.currentFocus = null;
        var drag = null;
        var self=this;
        svg.addEvent(this.drawing.glass, 'mousedown', function(event) {
            var target = self.drawing.background.getTarget(event.clientX, event.clientY);
            drag = target;
            if (target) {
                svg.event(target, 'mousedown', event);
            }
        });
        svg.addEvent(this.drawing.glass, 'mousemove', function(event) {
            var target = drag||self.drawing.background.getTarget(event.clientX, event.clientY);
            if (target) {
                svg.event(target, 'mousemove', event);
            }
        });
        svg.addEvent(this.drawing.glass, 'mouseup', function(event) {
            var target = drag||self.drawing.background.getTarget(event.clientX, event.clientY);
            if (target) {
                self.currentFocus = self.getFocus(target);
                svg.event(target, 'mouseup', event);
                svg.event(target, 'click', event);
            }
            drag = null;
        });
        svg.addEvent(this.drawing.glass, 'mouseout', function(event) {
            if (drag) {
                svg.event(drag, 'mouseup', event);
            }
            drag = null;
        });
        window.onkeydown = function(event) {
            if (self.processKeys(event.keyCode)) {
                event.preventDefault();
            }
        };
    }
    Canvas.prototype.getFocus = function(component) {
        while (component!=null) {
            if (component.focus) {
                return component.focus;
            }
            else {
                component = component.parent;
            }
        }
        return null;
    };
    Canvas.prototype.processKeys = function(key) {
        this.currentFocus && this.currentFocus.processKeys && this.currentFocus.processKeys(key);
        return true;
    };
    Canvas.prototype.show = function(anchor) {
        this.drawing.show(anchor) ;
        return this;
    };
    Canvas.prototype.add = function(svgObject) {
        this.drawing.background.add(svgObject);
        return this;
    };
    Canvas.prototype.remove = function(svgObject) {
        this.drawing.background.remove(svgObject);
        return this;
    };
    Canvas.prototype.dimension = function(width, height) {
        this.drawing.dimension(width, height);
        this.drawing.glass.dimension(width, height);
        this.drawing.glass.position(width/2, height/2);
        return this;
    };

    function Frame(width, height) {
        var self = this;
        self.component = new svg.Translation();
        self.component.focus = self;
        self.border = new svg.Rect(width, height).color([], 4, [0, 0, 0]);
        self.view = new svg.Drawing(width, height).position(-width/2, -height/2);
        self.scale = new svg.Scaling(1);
        self.translate = new svg.Translation();
        self.rotate = new svg.Rotation(0);
        self.component
            .add(self.view.add(self.translate.add(self.rotate.add(self.scale))))
            .add(self.border);
        self.hHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], hHandleCallback).horizontal(-width/2, width/2, height/2);
        self.component.add(self.hHandle.component);
        self.vHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], vHandleCallback).vertical(width/2, -height/2, height/2);
        self.component.add(self.vHandle.component);

        function hHandleCallback(position) {
            var factor = self.scale.factor;
            var x = -position*self.content.width/self.view.width + self.view.width/2/factor;
            var y = self.content.y;
            self.content.move(x, y);
        }
        function vHandleCallback(position) {
            var factor = self.scale.factor;
            var x = self.content.x;
            var y = -position*self.content.height/self.view.height + self.view.height/2/factor;
            self.content.move(x, y);
        }
    }
    Frame.prototype.position = function(x, y) {
        this.component.move(x, y);
        return this;
    };
    Frame.prototype.set = function(component) {
        if (this.content) {
            this.component.remove(this.content);
        }
        this.content = component;
        this.scale.add(this.content);
        this.updateHandles();
        return this;
    };
    Frame.prototype.updateHandles = function() {
        var factor = this.scale.factor;
        this.hHandle.dimension(this.view.width, this.content.width*factor)
            .position((this.view.width/2-this.content.x*factor)/(this.content.width*factor)*this.view.width);
        this.vHandle.dimension(this.view.height, this.content.height*factor)
            .position((this.view.height/2-this.content.y*factor)/(this.content.height*factor)*this.view.height);
    };
    Frame.prototype.remove = function(component) {
        if (this.content===component) {
            this.scale.remove(component);
            delete this.content;
        }
        return this;
    };

    Frame.prototype.controlLocation = function(x, y) {
        if (x > 0) {
            x = 0;
        }
        if (x < -this.content.width + this.view.width/this.scale.factor) {
            x = -this.content.width + this.view.width/this.scale.factor;
        }
        if (y > 0) {
            y = 0;
        }
        if (y < -this.content.height + this.view.height/this.scale.factor) {
            y = -this.content.height + this.view.height/this.scale.factor;
        }
        return {x:x, y:y};
    };

    Frame.prototype.moveContent = function(x, y) {
        var self=this;
        if (!self.animation) {
            self.animation = true;
            var location = this.controlLocation(x, y);
            this.content.onChannel().smoothy(param.speed, param.step)
                .execute(completeMovement).moveTo(location.x, location.y);
        }
        function completeMovement(progress) {
            self.updateHandles();
            if (progress===1) {
                delete self.animation;
            }
        }
        return this;
    };

    Frame.prototype.zoomContent = function(factor) {
        var oldFactor = this.scale.factor;
        var minFactorWidth = this.view.width/this.content.width;
        var minFactorHeight = this.view.height/this.content.height;
        if (factor<minFactorWidth) {
            factor=minFactorWidth;
        }
        if (factor<minFactorHeight) {
            factor=minFactorHeight;
        }
        this.scale.scale(factor);
        var location = this.controlLocation(
            this.content.x+this.view.width/2*(1/factor-1/oldFactor),
            this.content.y+this.view.height/2*(1/factor-1/oldFactor));
        this.content.move(location.x, location.y);
        this.updateHandles();
    };
    Frame.prototype.zoomIn = function() {
        this.zoomContent(this.scale.factor*1.5);
    };
    Frame.prototype.zoomOut = function() {
        this.zoomContent(this.scale.factor/1.5);
    };
    Frame.prototype.processKeys = function(keycode) {
        var factor = this.scale.factor;
        if (isLeftArrow(keycode)) {
            this.moveContent(this.content.x+100/factor, this.content.y);
        }
        else if (isUpArrow(keycode)) {
            this.moveContent(this.content.x, this.content.y+100/factor);
        }
        else if (isRightArrow(keycode)) {
            this.moveContent(this.content.x-100/factor, this.content.y);
        }
        else if (isDownArrow(keycode)) {
            this.moveContent(this.content.x, this.content.y-100/factor);
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
        console.log(keycode);
        return true;
        function isLeftArrow(keycode) {
            return keycode===37;
        }
        function isUpArrow(keycode) {
            return keycode===38;
        }
        function isRightArrow(keycode) {
            return keycode===39;
        }
        function isDownArrow(keycode) {
            return keycode===40;
        }
        function isPlus(keycode) {
            return keycode===107;
        }
        function isMinus(keycode) {
            return keycode===109;
        }
    };

    var HANDLE_THICKNESS = 16;
    function Handle(colors, callback) {
        var self = this;
        this.colors = colors;
        this.callback = callback;
        this.handle = new svg.Path().color(this.colors[0], this.colors[1], this.colors[2]);
        this.component = new svg.Translation().add(this.handle);
        manageDnD();

        function manageDnD() {
            svg.addEvent(self.handle, 'mousedown', function(event) {
                var ref = self.handle.localPoint(event.clientX, event.clientY);
                self.handle.mousemoveHandler = function(event) {
                    var mouse = self.handle.localPoint(event.clientX, event.clientY);
                    var dx=mouse.x-ref.x;
                    var dy=mouse.y-ref.y;
                    var newPosition = self.x!==undefined ? self.point+dy : self.point+dx;
                    self.position(newPosition);
                    if (self.callback) {
                        self.callback(self.point);
                    }
                    return true;
                };
                self.handle.mouseupHandler = function(event) {
                    svg.removeEvent(self.handle, 'mousemove', self.handle.mousemoveHandler);
                    svg.removeEvent(self.handle, 'mouseup', self.handle.mouseupHandler);
                    delete self.handle.mousemoveHandler;
                    delete self.handle.mouseupHandler;
                };
                svg.addEvent(self.handle, 'mousemove', self.handle.mousemoveHandler);
                svg.addEvent(self.handle, 'mouseup', self.handle.mouseupHandler);
            })
        }
    }
    Handle.prototype.vertical = function(x, y1, y2) {
        delete this.y;
        this.x = x;
        this.y1 = y1<y2 ? y1 : y2;
        this.y2 = y1<y2 ? y2 : y1;
        this._draw();
        return this;
    };
    Handle.prototype.horizontal = function(x1, x2, y) {
        delete this.x;
        this.x1 = x1<x2 ? x1 : x2;
        this.x2 = x1<x2 ? x2 : x1;
        this.y = y;
        this._draw();
        return this;
    };
    Handle.prototype.dimension = function(size, total) {
        this.size = size;
        this.total = total;
        this._draw();
        return this;
    };
    Handle.prototype.position = function(point) {
        var self = this;
        this.point = getPosition(point);
        this._draw();
        return this;

        function getPosition(point) {
            var position = point;
            var length;
            self.x && (length = (self.y2-self.y1));
            self.y && (length = (self.x2-self.x1));
            self.handleSize = length / self.total * self.size;
            if (position<self.handleSize/2) {
                position = self.handleSize/2;
            }
            if (position>length-self.handleSize/2) {
                position = length-self.handleSize/2;
            }
            return position;
        }
    };
    Handle.prototype._draw = function() {
        var self=this;
        var length;

        function buildHorizontalHandle() {
            if (self.handleSize < HANDLE_THICKNESS * 2) {
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
                var mainSize = self.handleSize - HANDLE_THICKNESS;
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
        }

        function buildVerticalHandle() {
            if (self.handleSize < HANDLE_THICKNESS * 2) {
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
                var mainSize = self.handleSize - HANDLE_THICKNESS;
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
        }

        function allVisible() {
            return self.size>=self.total;
        }

        if ((this.x!==undefined || this.y!==undefined) && this.size && this.point!==undefined) {
            if (allVisible()) {
                this.handle.reset();
            }
            else {
                var position = this.point;
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
    };

    function Panel(width, height, color) {
        var self = this;
        self.width = width;
        self.height = height;
        self.component = new svg.Translation();
        self.component.focus = self;
        self.border = new svg.Rect(width, height).color([], 4, [0, 0, 0]);
        self.view = new svg.Drawing(width, height).position(-width/2, -height/2);
        self.translate = new svg.Translation();
        self.component.add(self.view.add(self.translate)).add(self.border);
        self.vHandle = new Handle([[255, 204, 0], 3, [220, 100, 0]], vHandleCallback).vertical(width/2, -height/2, height/2);
        self.component.add(self.vHandle.component);
        self.back = new svg.Rect(width, height).color(color, 0, []);
        self.content = new svg.Translation();
        self.content.width = width;
        self.content.height = height;
        self.translate.add(self.back.position(width/2, height/2)).add(self.content);

        function vHandleCallback(position) {
            var x = self.content.x;
            var y = -position*self.content.height/self.view.height + self.view.height/2;
            self.content.move(x, y);
        }
    }
    Panel.prototype.position = function(x, y) {
        this.component.move(x, y);
        return this;
    };
    Panel.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.border.dimension(width, height);
        this.view.dimension(width, height).position(-width/2, -height/2);
        this.vHandle.vertical(width/2, -height/2, height/2);
        this.back.dimension(width, height).position(width/2, height/2);
        return this;
    };
    Panel.prototype.updateHandle = function() {
        this.vHandle.dimension(this.view.height, this.content.height)
            .position((this.view.height/2-this.content.y)/(this.content.height)*this.view.height);
        return this;
    };
    Panel.prototype.add = function(component) {
        this.content.add(component);
        return this;
    };
    Panel.prototype.remove = function(component) {
        this.content.remove(component);
        return this;
    };
    Panel.prototype.resizeContent = function(height) {
        if (height>this.height) {
            this.content.height = height;
            var width = this.content.width;
            this.back.position(width / 2, height / 2);
            this.back.dimension(width, height);
            this.updateHandle();
        }
        return this;
    };
    Panel.prototype.controlPosition = function(y) {
        if (y > 0) {
            y = 0;
        }
        if (y < -this.content.height + this.view.height) {
            y = -this.content.height + this.view.height;
        }
        return y;
    };
    Panel.prototype.moveContent = function(y) {
        var self=this;
        if (!self.animation) {
            self.animation = true;
            var ly = this.controlPosition(y);
            this.content.onChannel().smoothy(param.speed, param.step)
                .execute(completeMovement).moveTo(0, ly);
        }
        function completeMovement(progress) {
            self.updateHandle();
            if (progress===1) {
                delete self.animation;
            }
        }
        return this;
    };
    Panel.prototype.processKeys = function(keycode) {
        if (isUpArrow(keycode)) {
            this.moveContent(this.content.y+100);
        }
        else if (isDownArrow(keycode)) {
            this.moveContent(this.content.y-100);
        }
        else {
            return false;
        }
        return true;

        function isUpArrow(keycode) {
            return keycode===38;
        }
        function isDownArrow(keycode) {
            return keycode===40;
        }
    };

    function Button(width, height, colors, text) {
        this.width = width;
        this.height = height;
        this.back = new svg.Rect(width, height).color(colors[0], colors[1], colors[2]);
        this.component = new svg.Translation().add(this.back);
        this.text = new svg.Text(text).font("Arial", 24);
        this.component.add(this.text.position(0, 8));
        this.glass = new svg.Rect(width, height).color([0, 0, 0]).opacity(0.001);
        this.component.add(this.text.position(0, 8)).add(this.glass);
    }
    Button.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.back.dimension(width, height);
        this.glass.dimension(width, height);
        return this;
    };
    Button.prototype.position = function(x, y) {
        this.component.move(x, y);
        return this;
    };
    Button.prototype.onClick = function(handler) {
        if (this.handler) {
            svg.removeEvent(this.glass, "mouseup", this.handler);
        }
        this.handler = handler;
        svg.addEvent(this.glass, "mouseup", this.handler);
        return this;
    };

    function Palette(width, height) {
        this.width = width;
        this.height = height;
        this.component = new svg.Translation();
        this.panes = [];
        this.channel = svg.onChannel();
    }
    Palette.prototype.position = function(x, y) {
        this.component.move(x, y);
        return this;
    };
    Palette.prototype.addPane = function(pane) {
        var self = this;
        pane.palette = this;
        if (this.panes.length===0) {
            this.currentPane = pane;
            pane.open();
        }
        else {
            pane.close();
        }
        pane.title.onClick(function() {
            if (self.currentPane!==pane) {
                var paneToClose = self.currentPane;
                var paneToOpen = pane;
                self.animate(paneToOpen, paneToClose);
            }
        });
        this.panes.push(pane);
        this.component.add(pane.component);
        this.resizePanes();
        return this;
    };
    Palette.prototype.resizePanes = function() {
        var y = -this.height/2;
        var panelHeight = this.height - this.panes.length*TITLE_HEIGHT;
        for (var i=0; i<this.panes.length; i++) {
            var pane = this.panes[i];
            if (pane.opened) {
                pane.resize(this.width, panelHeight + TITLE_HEIGHT);
                pane.position(0, y+pane.height/2);
                y+=TITLE_HEIGHT+panelHeight;
            }
            else {
                pane.resize(this.width, TITLE_HEIGHT);
                pane.position(0, y+pane.height/2);
                y+=TITLE_HEIGHT;
            }
        }
    };
    Palette.prototype.animate = function(openedPane, closedPane) {
        var STEPS = 100;
        var DELAY = 2;
        var panelHeight = this.height - this.panes.length*TITLE_HEIGHT;
        var delta = panelHeight/STEPS;
        var self = this;
        this.channel.play(DELAY, STEPS,
            function (i) {
                var y = -self.height / 2;
                for (var p = 0; p < self.panes.length; p++) {
                    var pane = self.panes[p];
                    if (pane === openedPane) {
                        pane.resize(self.width, (i+1) * delta + TITLE_HEIGHT);
                        pane.position(0, y + pane.height / 2);
                        y += (i+1) * delta + TITLE_HEIGHT;
                    }
                    else if (pane === closedPane) {
                        pane.resize(self.width, panelHeight - (i+1) * delta + TITLE_HEIGHT);
                        pane.position(0, y + pane.height / 2);
                        y += panelHeight - (i+1) * delta + TITLE_HEIGHT;
                    }
                    else {
                        pane.position(0, y + pane.height / 2);
                        y += TITLE_HEIGHT;
                    }
                }
            },
            function () {
                openedPane.open();
                closedPane.close();
                delete self.animation;
                self.currentPane = openedPane;
            }
        );
    };

    var TITLE_HEIGHT = 40;
    var DEFAULT = 100;
    function Pane(colors, text, elemSize) {
        this.elemSize = elemSize;
        this.width = DEFAULT;
        this.height = DEFAULT;
        this.colors = colors;
        this.opened = false;
        this.component = new svg.Translation();
        this.title = new Button(this.width, TITLE_HEIGHT, this.colors, text);
        var self = this;
        this.title.onClick(function() {
            if (self.opened) {
                self.close();
            }
            else {
                self.open();
            }
        });
        this.panel = new Panel(this.width, this.height-TITLE_HEIGHT, colors[0]);
        this.panel.component.move(0, TITLE_HEIGHT+this.height/2);
        this.component.add(this.title.component);
        this.component.add(this.panel.component);
        this.tools = [];
    }
    Pane.prototype.addTool = function(tool) {
        this.tools.push(tool);
        this.panel.add(tool.component);
        tool.palette = this.palette;
        var rowSize = Math.floor(this.width/this.elemSize);
        var height = Math.floor(((this.tools.length-1)/rowSize)+1)*this.elemSize;
        tool.component.move(
            ((this.tools.length-1)%rowSize)*this.elemSize+this.elemSize/2,
            height-this.elemSize/2);
        this.panel.resizeContent(height);
        return this;
    };
    Pane.prototype.position = function(x, y) {
        this.component.move(x, y);
        return this;
    };
    Pane.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.title.resize(width, TITLE_HEIGHT).position(0, -height/2+TITLE_HEIGHT/2);
        this.panel.resize(width, this.height-TITLE_HEIGHT).position(0, TITLE_HEIGHT/2);
    };
    Pane.prototype.open = function() {
        if (!this.opened) {
            this.opened = true;
        }
        return this;
    };
    Pane.prototype.close = function() {
        if (this.opened) {
            this.opened = false;
        }
        return this;
    };

    function Tool(component, callback) {
        this.component = new svg.Translation().add(component);
        component.tool = this;
        this.callback = callback;
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
}