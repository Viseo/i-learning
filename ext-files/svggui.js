/**
 * Created by HDA3014 on 06/02/2016.
 */

function Gui() {

    function Canvas(width, height) {
        this.drawing = new svg.Drawing(width, height);
        this.drawing.background = new svg.Translation();
        this.drawing.glass = new svg.Rect(width, height).position(width/2, height/2).opacity(0.001);
        this.drawing.add(this.drawing.background).add(this.drawing.glass);
        var drag = null;
        var self=this;
        this.drawing.glass.component.onmousedown = function(event) {
            var target = self.drawing.background.getTarget(event.clientX, event.clientY);
            drag = target;
            if (target && target.component.onmousedown) {
                target.component.onmousedown(event);
            }
        };
        this.drawing.glass.component.onmousemove = function(event) {
            var target = drag||self.drawing.background.getTarget(event.clientX, event.clientY);
            if (target && target.component.onmousemove) {
                target.component.onmousemove(event);
            }
        };
        this.drawing.glass.component.onmouseup = function(event) {
            var target = drag||self.drawing.background.getTarget(event.clientX, event.clientY);
            if (target) {
                if (target.component.onmouseup) {
                    target.component.onmouseup(event);
                }
                if (target.component.onclick) {
                    target.component.onclick(event);
                }
            }
            drag = null;
        };
        this.drawing.glass.component.onmouseout = function(event) {
            if (drag && drag.component.onmouseup) {
                drag.component.onmouseup(event);
            }
            drag = null;
        };
    }
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
        window.onkeydown = function(event) {
            if (self.processKeys(event.keyCode)) {
                event.preventDefault();
            }
        };

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
        this.scale.remove(component);
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
            self.handle.component.onmousedown = function(event) {
                var ref = self.handle.localPoint(event.clientX, event.clientY);
                self.handle.component.onmousemove = function(event) {
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
                self.handle.component.onmouseup = function(event) {
                    self.handle.component.onmousemove = function() {};
                    self.handle.component.onmouseup = function() {};
                };
            }
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

    function Palette(width, height, colors, elemSize) {
        this.width = width;
        this.height = height;
        this.elemSize = elemSize;
        this.support = new svg.Rect(width, height).color(colors[0], colors[1], colors[2]);
        this.component = new svg.Translation().add(this.support);
        this.tools = [];
    }
    Palette.prototype.position = function(x, y) {
        this.component.move(x, y);
        return this;
    };
    Palette.prototype.addTool = function(tool) {
        this.tools.push(tool);
        this.component.add(tool.component);
        tool.palette = this;
        var colSize = Math.floor(this.height/this.elemSize);
        console.log((Math.floor((this.tools.length-1)/colSize)*this.elemSize)+"k"+(((this.tools.length-1)%colSize)*this.elemSize));
        tool.component.move(
            Math.floor((this.tools.length-1)/colSize)*this.elemSize+this.elemSize/2-this.width/2,
            ((this.tools.length-1)%colSize)*this.elemSize+this.elemSize/2-this.height/2);
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
        Palette:Palette,
        Tool:Tool
    }
}