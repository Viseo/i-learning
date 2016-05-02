/**
 * Created by HDA3014 on 07/01/2016.
 */

var targetRuntime;
function setTarget(target) {
    targetRuntime = target;
}

if (!Array.prototype.add) {
    Object.defineProperty(Array.prototype, "add", {
        enumerable: false,
        value: function(val) {
            var i = this.indexOf(val);
            i===-1 && this.push(val);
            return i===-1;
        }
    });
}

if (!Array.prototype.remove) {
    Object.defineProperty(Array.prototype, "remove", {
        enumerable: false,
        value: function(val) {
            var i = this.indexOf(val);
            i>-1 && this.splice(i, 1);
            return i>-1;
        }
    });
}

function SVG(runtime) {
    var svgr = runtime || targetRuntime();

    function print(points) {
        if (points.length==0) return "";
        var line = points[0].x+","+points[0].y;
        for (var i=1; i<points.length; i++) {
            line += " "+points[i].x+","+points[i].y;
        }
        return line;
    }

    function insidePolygon(x, y, polygon) {
        var inside = false;
        for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            var xi = polygon[i].x, yi = polygon[i].y;
            var xj = polygon[j].x, yj = polygon[j].y;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function angle(x, y) {
        return Math.atan2(x, -y)/Math.PI*180;
    }

    function rotate(x, y, angle) {
        var _angle = angle * Math.PI / 180;
        return {
            x: x * Math.cos(_angle) - y * Math.sin(_angle),
            y: x * Math.sin(_angle) + y * Math.cos(_angle)
        };
    }

    function Visitor() {
        var args = Array.prototype.slice.call(arguments, 0);
        var name = args.shift();

        this.visit = function(svgObject) {
            if (!(svgObject instanceof Handler) && svgObject[name]) {
                svgObject[name].apply(svgObject, args);
            }
        }
    }

    function Drawing(width, height) {
        this.children = [];
        this.x = 0;
        this.y = 0;
        this._active=true;
        this.component = svgr.create("svg");
        svgr.attrNS(this.component,'xlink','http://www.w3.org/1999/xlink');
        this.dimension(width, height);
    }
    Drawing.prototype.active = function(flag) {
        this._active = flag || flag===undefined;
        return this;
    };
    Drawing.prototype.dimension = function(width, height) {
        this.width = width;
        this.height = height;
        svgr.attr(this.component, "width", width);
        svgr.attr(this.component, "height", height);
        return this;
    };
    Drawing.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        svgr.attr(this.component, "x", x);
        svgr.attr(this.component, "y", y);
        return this;
    };
    Drawing.prototype.show = function(id) {
        this.anchor = id;
        svgr.add(svgr.anchor(this.anchor), this.component);
        return this;
    };
    Drawing.prototype.hide = function() {
        svgr.remove(svgr.anchor(this.anchor), this.component);
        return this;
    };
    Drawing.prototype.add = function(svgObject) {
        svgr.add(this.component, svgObject.component);
        svgObject.parent = this;
        this.children.push(svgObject);
        return this;
    };
    Drawing.prototype.remove = function(svgObject) {
        svgr.remove(this.component, svgObject.component);
        var index = this.children.indexOf(svgObject);
        if (index > -1) {
            svgObject.parent = null;
            this.children.splice(index, 1);
        }
        return this;
    };
    Drawing.prototype.smoothy = function(speed, step) {
        return new Animator(this).smoothy(speed, step);
    };
    Drawing.prototype.steppy = function(speed, stepCount) {
        return new Animator(this).steppy(speed, stepCount);
    };
    Drawing.prototype.onChannel = function(channelInfo) {
        return new Animator(this).onChannel(channelInfo);
    };
    Drawing.prototype.prepareAnimator = function(animator) {
        animator.resize = function(swidth, sheight, ewidth, eheight) {
            animator.process([swidth, sheight], [ewidth, eheight],
                function(coords) {
                    this.dimension(coords[0], coords[1]);
                });
            return animator;
        };
        var self = this;
        animator.resizeTo = function(ewidth, eheight) {
            animator.process([self.width, self.height], [ewidth, eheight],
                function(coords) {
                    this.dimension(coords[0], coords[1]);
                });
            return animator;
        }
    };
    Drawing.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        if (this.parent) {
            point = {
                x:point.x+this.x,
                y:point.y+this.y
            };
            return this.parent.globalPoint(point);
        }
        else {
            return {
                x:point.x+svgr.boundingRect(this.component).left,
                y:point.y+svgr.boundingRect(this.component).top
            };
        }
    };
    Drawing.prototype.localPoint = function() {
        var point = null;
        point = getPoint(arguments);
        //var point = Array.prototype.slice.call(point0, 0)[0][0];
        if (this.parent) {
            point = this.parent.localPoint(point);
            return {
                x:point.x-this.x,
                y:point.y-this.y
            };
        }
        else {
            return {
                x:point.x-svgr.boundingRect(this.component).left,
                y:point.y-svgr.boundingRect(this.component).top
            };
        }
    };
    Drawing.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return local.x>=0 && local.x<=this.width && local.y>=0 && local.y<=this.height;
    };
    Drawing.prototype.getTarget = function(x, y) {
        if (this._active) {
            for (var i = this.children.length - 1; i >= 0; i--) {
                var target = this.children[i].getTarget(x, y);
                if (target) {
                    return target;
                }
            }
        }
        return null;
    };

    function Handler() {
        this.children = [];
        this._active = true;
        this.component = svgr.create("g");
    }
    Handler.prototype.__proto__ = SVG.prototype;
    Handler.prototype.active = function(flag) {
        this._active = flag || flag===undefined;
        return this;
    };
    Handler.prototype.center = function() {
        var rect = svgr.boundingRect(this.component);
        return {
            cx : rect.width/2,
            cy : rect.height/2
        }
    };
    Handler.prototype.clear = function() {
        while (svgr.first(this.component)) {
            svgr.remove(this.component, svgr.first(this.component));
        }
        this.children = [];
    };
    Handler.prototype.add = function(svgObject) {
        svgr.add(this.component, svgObject.component);
        svgObject.parent = this;
        this.children.push(svgObject);
        return this;
    };
    Handler.prototype.remove = function(svgObject) {
        svgr.remove(this.component, svgObject.component);
        var index = this.children.indexOf(svgObject);
        if (index > -1) {
            svgObject.parent = null;
            this.children.splice(index, 1);
        }
        return this;
    };
    Handler.prototype.accept = function(visitor) {
        visitor.visit(this);
        for (var index=0; index<this.children.length; index++) {
            this.children[index].accept(visitor);
        }
        return this;
    };
    Handler.prototype.opacity = function(opacity) {
        this._opacity = opacity;
        svgr.attr(this.component, "opacity", opacity);
        return this;
    };
    Handler.prototype.smoothy = function(speed, step) {
        return new Animator(this).smoothy(speed, step);
    };
    Handler.prototype.steppy = function(speed, stepCount) {
        return new Animator(this).steppy(speed, stepCount);
    };
    Handler.prototype.onChannel = function(channelInfo) {
        return new Animator(this).onChannel(channelInfo);
    };
    Handler.prototype.onClick = function(handler) {
        this.accept(new Visitor("onClick", handler));
        return this;
    };
    Handler.prototype.onRightClick = function(handler) {
        this.accept(new Visitor("onRightClick", handler));
        return this;
    };
    Handler.prototype.color = function(fillColor, stroke, strokeColor) {
        this.accept(new Visitor("color", fillColor, stroke, strokeColor));
        return this;
    };
    Handler.prototype.clickable = function(flag) {
        this.accept(new Visitor("clickable", flag));
        return this;
    };
    Handler.prototype.prepareAnimator = function(animator) {
        animator.opacity = function(sopacity, eopacity) {
            animator.process([sopacity], [eopacity],
                function(coords) {
                    this.opacity(coords[0]);
                });
            return animator;
        };
        var self = this;
        animator.opacityTo = function(eopacity) {
            animator.process([self.opacity], [eopacity],
                function(coords) {
                    this.opacity(coords[0]);
                });
            return animator;
        }
    };
    Handler.prototype.getTarget = function(x, y) {
        if (this._active) {
            if (!this._opacity || this._opacity > 0) {
                for (var i = this.children.length - 1; i >= 0; i--) {
                    var target = this.children[i].getTarget(x, y);
                    if (target) {
                        return target;
                    }
                }
            }
        }
        return null;
    };

    function Ordered(layerCount) {
        this.children = [];
        this._active = true;
        this.component = svgr.create("g");
        for (var i=0; i<layerCount; i++) {
            this.children[i] = new Rect(0, 0).opacity(0);
            svgr.add(this.component, this.children[i].component);
         }
    }
    Ordered.prototype.__proto__ = Handler.prototype;
    Ordered.prototype.order = function(layerCount) {
        this.clear();
        for (var i=0; i<layerCount; i++) {
            this.children[i] = new Rect(0, 0).opacity(0);
            svgr.add(this.component, this.children[i].component);
        }
        return this;
    };
    Ordered.prototype.set = function(layer, svgObject) {
        svgr.replace(this.component, svgObject.component, this.children[layer].component);
        svgObject.parent = this;
        this.children[layer] = svgObject;
        return this;
    };
    Ordered.prototype.unset = function(layer) {
        var dummy = new Rect(0, 0).opacity(0);
        svgr.replace(this.component, dummy.component, this.children[layer].component);
        this.children[layer] = dummy;
        return this;
    };
    Ordered.prototype.get = function(layer) {
        return this.children[layer];
    };
    Ordered.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent ? this.parent.globalPoint(point) : null;
        //return this.parent ? this.parent.globalPoint(arguments) : null;
    };
    Ordered.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent ? this.parent.localPoint(point) : null;
        return point;
        // return this.parent ? this.parent.localPoint(arguments) : null;
    };

    function Translation(x, y) {
        Handler.call(this);
        this.move(x||0, y||0);
    }
    Translation.prototype.__proto__ = Handler.prototype;
    Translation.prototype.move = function(x, y) {
        this.x = x;
        this.y = y;
        svgr.attr(this.component, "transform", "translate(" + x + " " + y + ")");
        return this;
    };
    Translation.prototype.prepareAnimator = function(animator) {
        Handler.prototype.prepareAnimator.call(this, animator);
        animator.move = function(sx, sy, ex, ey) {
            animator.process([sx, sy], [ex, ey],
                function(coords) {
                    this.move(coords[0], coords[1]);
                });
            return animator;
        };
        var self = this;
        animator.moveTo = function(ex, ey) {
            animator.process([self.x, self.y], [ex, ey],
                function(coords) {
                    this.move(coords[0], coords[1]);
                });
            return animator;
        }
    };
    Translation.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        point = {x:point.x+this.x, y:point.y+this.y};
        return this.parent ? this.parent.globalPoint(point) : null;
    };
    Translation.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent ? this.parent.localPoint(point) : null;
        if (point) {
            point = {x: point.x - this.x, y: point.y - this.y};
        }
        return point;
    };

    function Rotation(angle) {
        Handler.call(this);
        this.rotate(angle||0);
    }
    Rotation.prototype.__proto__ = Handler.prototype;
    Rotation.prototype.rotate = function(angle) {
        this.angle = angle;
        svgr.attr(this.component, "transform", "rotate(" + angle + ")");
        return this;
    };
    Rotation.prototype.prepareAnimator = function(animator) {
        Handler.prototype.prepareAnimator.call(this, animator);
        animator.rotate = function (sangle, eangle) {
            animator.process([sangle], [eangle],
                function (angle) {
                    this.rotate(angle[0]);
                });
            return animator;
        };
        var self = this;
        animator.rotateTo = function (eangle) {
            animator.process([self.angle], [eangle],
                function (angle) {
                    this.rotate(angle[0]);
                });
            return animator;
        }
    };
    Rotation.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        point = rotate(point.x, point.y, this.angle);
        return this.parent ? this.parent.globalPoint(point) : null;
    };
    Rotation.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent ? this.parent.localPoint(point) : null;
        if (point) {
            point = rotate(point.x, point.y, -this.angle);
        }
        return point;
    };

    function Scaling(factor) {
        Handler.call(this);
        this.scale(factor);
    }
    Scaling.prototype.__proto__ = Handler.prototype;
    Scaling.prototype.scale = function(factor) {
        this.factor = factor;
        svgr.attr(this.component, "transform", "scale(" + factor + ")");
        return this;
    };
    Scaling.prototype.prepareAnimator = function(animator) {
        Handler.prototype.prepareAnimator.call(this, animator);
        animator.scale = function (sfactor, efactor) {
            animator.process([sfactor], [efactor],
                function (factor) {
                    this.scale(factor[0]);
                });
            return animator;
        };
        var self = this;
        animator.scaleTo = function (efactor) {
            animator.process([self.factor], [efactor],
                function (factor) {
                    this.scale(factor[0]);
                });
            return animator;
        }
    };
    Scaling.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        point = {
            x:point.x*this.factor,
            y:point.y*this.factor
        };
        return this.parent ? this.parent.globalPoint(point) : null;
    };
    Scaling.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent ? this.parent.localPoint(point) : null;
        if (point) {
            point = {
                x: point.x / this.factor,
                y: point.y / this.factor
            };
        }
        return point;
    };

    function Shape() {
        this._active = true;
    }
    Shape.prototype.__proto__ = SVG.prototype;
    Shape.prototype.active = function(flag) {
        this._active = flag || flag===undefined;
        return this;
    };
    Shape.prototype.accept = function(visitor) {
        visitor.visit(this);
        return this;
    };
    Shape.prototype.clickable = function(flag) {
        this.clickflag = flag || true;
        this._setOnClick();
        this._setOnRightClick();
        return this;
    };
    Shape.prototype.onClick = function(handler) {
        this.clickHandler = handler;
        this._setOnClick();
        return this;
    };
    Shape.prototype.onRightClick = function(handler) {
        this.rightClickHandler = handler;
        this._setOnRightClick();
        return this;
    };
    Shape.prototype._setOnClick = function() {
        if (this.clickflag && this.clickHandler) {
            this.component.clickHandler = this.clickHandler;
            svgr.addEvent(this.component, "click", this.component.clickHandler);
        }
        else {
            if (this.component.clickHandler) {
                svgr.removeEvent(this.component, "click", this.component.clickHandler);
                delete this.component.clickHandler;
            }
        }
    };
    Shape.prototype._setOnRightClick = function() {
        if (this.clickflag && this.rightClickHandler) {
            var self = this;
            this.component.rightClickHandler = function(event) {
                svgr.preventDefault(event);
                self.rightClickHandler();
                return false;
            };
            svgr.addEvent(this.component, "contextmenu", this.component.rightClickHandler);
        }
        else {
            if (this.component.rightClickHandler) {
                svgr.removeEvent(this.component, "contextmenu", this.component.rightClickHandler);
                delete this.component.rightClickHandler;
            }
        }
    };
    Shape.prototype.color = function(fillColor, strokeWidth, strokeColor) {
        this.fillColor = fillColor;
        this.strokeWidth = strokeWidth;
        this.strokeColor = strokeColor;
        svgr.attr(this.component, "fill", fillColor && fillColor.length ? "rgb("+fillColor.join(",")+")" : "none");
        svgr.attr(this.component, "stroke-width", strokeWidth || 0);
        svgr.attr(this.component, "stroke", strokeWidth && strokeColor && strokeColor.length ? "rgb("+strokeColor.join(",")+")" : "none");
        return this;
    };
    Shape.prototype.opacity = function(opacity) {
        this._opacity = opacity;
        svgr.attr(this.component, "opacity", opacity);
        return this;
    };
    Shape.prototype.fillOpacity = function(opacity) {
        this._fillopacity = opacity;
        svgr.attr(this.component, "fill-opacity", opacity);
        return this;
    };
    Shape.prototype.smoothy = function(speed, step) {
        return new Animator(this).smoothy(speed, step);
    };
    Shape.prototype.steppy = function(speed, stepCount) {
        return new Animator(this).steppy(speed, stepCount);
    };
    Shape.prototype.onChannel = function(channelInfo) {
        return new Animator(this).onChannel(channelInfo);
    };
    Shape.prototype.prepareAnimator = function(animator) {
        var self = this;
        animator.color = function (sfillColor, efillColor, sstroke, estroke, sstrokeColor, estrokeColor) {
            var fillNone = !sfillColor || !sfillColor.length;
            var strokeNone = !sstroke || !sstrokeColor || !sstrokeColor.length;
            var scolor = concat(sfillColor, sstroke, sstrokeColor);
            var ecolor = concat(efillColor, estroke, estrokeColor);
            animator.process(scolor, ecolor,
                function (color) {
                    this.color(getFillColor(color), getStroke(color), getStrokeColor(color));
                });
            return animator;

            function concat(fillColor, stroke, strokeColor) {
                var color = fillNone ? [] : [fillColor[0], fillColor[1], fillColor[2]];
                if (!strokeNone) {
                    color.push(stroke, strokeColor[0], strokeColor[1], strokeColor[2]);
                }
                return color;
            }
            var colorIdx = 0;
            function getFillColor(color) {
                if (fillNone) {
                    colorIdx=0;
                    return [];
                }
                else {
                    colorIdx=3;
                    return [Math.round(color[0]), Math.round(color[1]), Math.round(color[2])];
                }
            }
            function getStroke(color) {
                if (strokeNone) {
                    return undefined;
                }
                else {
                    return color[colorIdx++];
                }
            }
            function getStrokeColor(color) {
                if (strokeNone) {
                    return undefined;
                }
                else {
                    return [Math.round(color[colorIdx]), Math.round(color[colorIdx+1]), Math.round(color[colorIdx+2])];
                }
            }
        };
        animator.colorTo = function (efillColor, estroke, estrokeColor) {
            return animator.color(self.fillColor, efillColor, self.stroke, estroke, self.strokeColor, estrokeColor);
        };
        animator.opacity = function (sfactor, efactor) {
            animator.process([sfactor], [efactor],
                function (factor) {
                    this.opacity(factor[0]);
                });
            return animator;
        };
        animator.opacityTo = function (efactor) {
            animator.process([self.factor], [efactor],
                function (factor) {
                    this.opacity(factor[0]);
                });
            return animator;
        }
    };
    Shape.prototype.getTarget = function(x, y) {
        if ((!this._opacity || this._opacity>0) && this.fillColor &&this.fillColor.length>0) {
            return this.inside(x, y) ? this : null;
        }
        return null;
    };

    function Rect(width, height) {
        this.component = svgr.create("rect");
        Shape.call(this);
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this._draw();
    }
    Rect.prototype.__proto__ = Shape.prototype;
    Rect.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Rect.prototype.dimension = function(width, height) {
        this.width = width;
        this.height = height;
        this._draw();
        return this;
    };
    Rect.prototype.corners = function(radiusX, radiusY) {
        this.rx = radiusX;
        this.ry = radiusY;
        svgr.attr(this.component, "rx", this.rx);
        svgr.attr(this.component, "ry", this.ry);
        return this;
    };
    Rect.prototype._draw = function() {
        svgr.attr(this.component,"x", (this.x-this.width/2));
        svgr.attr(this.component, "y", (this.y-this.height/2));
        svgr.attr(this.component, "width", this.width);
        svgr.attr(this.component, "height", this.height);
    };
    Rect.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Rect.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Rect.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return local.x>=-this.width/2 && local.x<=this.width/2
            && local.y>=-this.height/2 && local.y<=this.height/2;
    };

    function Circle(radius) {
        this.component = svgr.create("circle");
        Shape.call(this);
        this.x = 0;
        this.y = 0;
        this.r = radius;
        this._draw();
    }
    Circle.prototype.__proto__ = Shape.prototype;
    Circle.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Circle.prototype.radius = function(radius) {
        this.r = radius;
        this._draw();
        return this;
    };
    Circle.prototype._draw = function() {
        svgr.attr(this.component, "cx", this.x);
        svgr.attr(this.component, "cy", this.y);
        svgr.attr(this.component, "r", this.r);
    };
    Circle.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Circle.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Circle.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        var dist = local.x*local.x+local.y*local.y;
        return dist <= this.r*this.r;
    };

    function Ellipse(radiusX, radiusY) {
        this.component = svgr.create("ellipse");
        Shape.call(this);
        this.x = 0;
        this.y = 0;
        this.rx = radiusX;
        this.ry = radiusY;
        this._draw();
    }
    Ellipse.prototype.__proto__ = Shape.prototype;
    Ellipse.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Ellipse.prototype.radius = function(radiusX, radiusY) {
        this.rx = radiusX;
        this.ry = radiusY;
        this._draw();
        return this;
    };
    Ellipse.prototype._draw = function() {
        svgr.attr(this.component, "cx", this.x);
        svgr.attr(this.component, "cy", this.y);
        svgr.attr(this.component, "rx", this.rx);
        svgr.attr(this.component, "ry", this.ry);
    };
    Ellipse.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Ellipse.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Ellipse.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        var dx = local.x/this.rx;
        var dy = local.y/this.ry;
        return dx*dx+dy*dy <= 1;
    };

    function Triangle(width, height, direction) {
        this.component = svgr.create("polygon");
        Shape.call(this);
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.dir = direction;
        this._draw();
    }
    Triangle.prototype.__proto__ = Shape.prototype;
    Triangle.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Triangle.prototype.dimension = function(width, height) {
        this.width = width;
        this.height = height;
        this._draw();
        return this;
    };
    Triangle.prototype.direction = function(direction) {
        this.dir = direction;
        this._draw();
        return this;
    };
    Triangle.prototype._draw = function() {
        var dir = this.dir || "N";
        switch (dir) {
            case "N":
                this.points = [
                    {x:this.x-this.width/2,y:this.y+this.height/2},
                    {x:this.x+this.width/2,y:this.y+this.height/2},
                    {x:this.x,y:this.y-this.height/2}];
                break;
            case "E":
                this.points = [
                    {x:this.x-this.width/2,y:this.y-this.height/2},
                    {x:this.x-this.width/2,y:this.y+this.height/2},
                    {x:this.x+this.width/2,y:this.y}];
                break;
            case "S":
                this.points = [
                    {x:this.x-this.width/2,y:this.y-this.height/2},
                    {x:this.x+this.width/2,y:this.y-this.height/2},
                    {x:this.x,y:this.y+this.height/2}];
                break;
            case "W":
                this.points = [
                    {x:this.x+this.width/2,y:this.y-this.height/2},
                    {x:this.x+this.width/2,y:this.y+this.height/2},
                    {x:this.x-this.width/2,y:this.y}];
                break;
        }
        svgr.attr(this.component, "points", print(this.points));
    };
    Triangle.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Triangle.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Triangle.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return insidePolygon(local.x+this.x, local.y+this.y, this.points);
    };

    function CurvedShield(width, height, headRatio, direction) {
        this.component = svgr.create("path");
        Shape.call(this);
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.headRatio = headRatio;
        this.dir = direction;
        this._draw();
    }
    CurvedShield.prototype.__proto__ = Shape.prototype;
    CurvedShield.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    CurvedShield.prototype.dimension = function(width, height, headRatio) {
        this.width = width;
        this.height = height;
        this.headRatio = headRatio;
        this._draw();
        return this;
    };
    CurvedShield.prototype.direction = function(direction) {
        this.dir = direction;
        this._draw();
        return this;
    };
    CurvedShield.prototype._draw = function() {
        var dir = this.dir || "N";
        var headSize;
        switch (dir) {
            case "N":
                headSize = this.height*this.headRatio;
                this.points = [
                    {x:this.x-this.width/2,y:this.y+this.height/2},
                    {x:this.x-this.width/2,y:this.y-this.height/2+headSize},
                    {x:this.x-this.width/2,y:this.y-this.height/2},
                    {x:this.x+this.width/2,y:this.y-this.height/2},
                    {x:this.x+this.width/2,y:this.y-this.height/2+headSize},
                    {x:this.x+this.width/2,y:this.y+this.height/2},
                    {x:this.x-this.width/2,y:this.y+this.height/2}];
                break;
            case "E":
                headSize = this.width*this.headRatio;
                this.points = [
                    {x:this.x-this.width/2,y:this.y-this.height/2},
                    {x:this.x+this.width/2-headSize,y:this.y-this.height/2},
                    {x:this.x+this.width/2,y:this.y-this.height/2},
                    {x:this.x+this.width/2,y:this.y+this.height/2},
                    {x:this.x+this.width/2-headSize,y:this.y+this.height/2},
                    {x:this.x-this.width/2,y:this.y+this.height/2},
                    {x:this.x-this.width/2,y:this.y-this.height/2}];
                break;
            case "S":
                headSize = this.height*this.headRatio;
                this.points = [
                    {x:this.x-this.width/2,y:this.y-this.height/2},
                    {x:this.x-this.width/2,y:this.y+this.height/2-headSize},
                    {x:this.x-this.width/2,y:this.y+this.height/2},
                    {x:this.x+this.width/2,y:this.y+this.height/2},
                    {x:this.x+this.width/2,y:this.y+this.height/2-headSize},
                    {x:this.x+this.width/2,y:this.y-this.height/2},
                    {x:this.x-this.width/2,y:this.y-this.height/2}];
                break;
            case "W":
                headSize = this.width*this.headRatio;
                this.points = [
                    {x:this.x+this.width/2,y:this.y-this.height/2},
                    {x:this.x-this.width/2+headSize,y:this.y-this.height/2},
                    {x:this.x-this.width/2,y:this.y-this.height/2},
                    {x:this.x-this.width/2,y:this.y+this.height/2},
                    {x:this.x-this.width/2+headSize,y:this.y+this.height/2},
                    {x:this.x+this.width/2,y:this.y+this.height/2},
                    {x:this.x+this.width/2,y:this.y-this.height/2}];
                break;
        }
        svgr.attr(this.component, "d", print(this.points));

        function print(points) {
            return "M "+points[0].x+","+points[0].y+" "+
                "L "+points[1].x+","+points[1].y+" "+
                "C "+points[2].x+","+points[2].y+" "+
                     points[3].x+","+points[3].y+" "+
                     points[4].x+","+points[4].y+" "+
                "L "+points[5].x+","+points[5].y+" "+
                     points[6].x+","+points[6].y;
        }
    };
    CurvedShield.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    CurvedShield.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    CurvedShield.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return insidePolygon(local.x+this.x, local.y+this.y, this.points);
    };

    function Polygon(x, y) {
        this.component = svgr.create("polygon");
        Shape.call(this);
        this.x = x;
        this.y = y;
        this.points = [];
    }
    Polygon.prototype.__proto__ = Shape.prototype;
    Polygon.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Polygon.prototype.trace=function(dx, dy) {
        var lastPoint = this.points[this.points.length-1];
        this.points.push({x:lastPoint.x+dx, y:lastPoint.y+dy});
        return this;
    };
    Polygon.prototype.add=function(x, y) {
        if (Array.isArray(x) && Array.isArray(x[0])) {
            for (var i=0; i< x.length; i++) {
                this.points.push({x:x[i][0], y:x[i][1]});
            }
        }
        else {
            this.points.push({x:x,y:y});
        }
        this._draw();
        return this;
    };
    Polygon.prototype.remove=function(index) {
        this.points.slice(index, 1);
        this._draw();
        return this;
    };
    Polygon.prototype.clear=function() {
        this.points = [];
        this._draw();
        return this;
    };
    Polygon.prototype._draw = function() {
        var points = "";
        if (this.points.length>0) {
            for (var i=0; i<this.points.length; i++) {
                points+=" "+(this.points[i].x+this.x)+","+(this.points[i].y+this.y);
            }
        }
        svgr.attr(this.component, "points", points);
    };
    Polygon.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Polygon.prototype.localPoint = function() {
        var point = getPoint(arguments);
        var point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Polygon.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return insidePolygon(local.x, local.y, this.points);
    };

    function Arrow(baseWidth, headWidth, headHeight) {
        this.component = svgr.create("polygon");
        Shape.call(this);
        this.baseWidth = baseWidth;
        this.headWidth = headWidth;
        this.headHeight = headHeight;
    }
    Arrow.prototype.__proto__ = Shape.prototype;
    Arrow.prototype.position = function(bx, by, hx, hy) {
        this.bx = bx;
        this.by = by;
        this.hx = hx;
        this.hy = hy;
        this._draw();
        return this;
    };
    Arrow.prototype._draw = function() {
        var self = this;
        this.points = [];
        var dist = Math.sqrt((this.hx-this.bx)*(this.hx-this.bx)+(this.hy-this.by)*(this.hy-this.by));
        var px = (this.hx-this.bx)/dist;
        var py = (this.hy-this.by)/dist;
        point(this.bx, this.by);
        point(this.bx+this.baseWidth*py, this.by-this.baseWidth*px);
        point(this.hx+this.baseWidth*py-this.headHeight*px, this.hy-this.baseWidth*px-this.headHeight*py);
        point(this.hx+this.headWidth*py-this.headHeight*px, this.hy-this.headWidth*px-this.headHeight*py);
        point(this.hx, this.hy);
        point(this.hx-this.headWidth*py-this.headHeight*px, this.hy+this.headWidth*px-this.headHeight*py);
        point(this.hx-this.baseWidth*py-this.headHeight*px, this.hy+this.baseWidth*px-this.headHeight*py);
        point(this.bx-this.baseWidth*py, this.by+this.baseWidth*px);
        svgr.attr(this.component, "points", print(this.points));

        function point(x, y) {
            self.points.push(x,y);
        }
    };
    Arrow.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint(point);
    };
    Arrow.prototype.localPoint = function() {
        var point = getPoint(arguments);
        return this.parent.localPoint(point);
    };
    Arrow.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return insidePolygon(local.x+this.x, local.y+this.y, this.points);
    };

    var Sqrt2 = Math.sqrt(3)/2;
    function Hexagon(baseWidth, direction) {
        this.component = svgr.create("polygon");
        Shape.call(this);
        this.x = 0;
        this.y = 0;
        this.baseWidth = baseWidth;
        this.dir = direction;
        this._draw();
    }
    Hexagon.height = function(width) {
        return Sqrt2*width;
    };
    Hexagon.prototype.__proto__ = Shape.prototype;
    Hexagon.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Hexagon.prototype.dimension = function(baseWidth) {
        this.baseWidth = baseWidth;
        this._draw();
        return this;
    };
    Hexagon.prototype.direction = function(direction) {
        this.dir = direction;
        this._draw();
        return this;
    };
    Hexagon.prototype.height = function() {
       return Math.round(this.baseWidth*Sqrt2);
    };
    Hexagon.prototype._draw = function() {
        var self = this;
        this.points = [];
        var height = this.height();
        switch (this.dir||"H") {
            case "H":
                point(-this.baseWidth/2, height);
                point(-this.baseWidth, 0);
                point(-this.baseWidth/2, -height);
                point(this.baseWidth/2, -height);
                point(this.baseWidth, 0);
                point(this.baseWidth/2, height);
                break;
            case "V":
                point(height, -this.baseWidth/2);
                point(0, -this.baseWidth);
                point(-height, -this.baseWidth/2);
                point(-height, this.baseWidth/2);
                point(0, this.baseWidth);
                point(height, this.baseWidth/2);
                break;
        }
        svgr.attr(this.component, "points", print(this.points));

        function point(x, y) {
            self.points.push({x:x,y:y});
        }
    };
    Hexagon.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Hexagon.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Hexagon.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return insidePolygon(local.x+this.x, local.y+this.y, this.points);
    };

    function Text(message) {
        this.component = svgr.create("text");
        Shape.call(this);
        this.messageText = ""+message;
        this.x = 0;
        this.y = 0;
        this.fontName = "arial";
        this.fontSize = 12;
        this.lineSpacing = 24;
        this.anchorText = "middle";
        this.fillColor = [true];
        this.lines = [];
        this._draw();
    }
    Text.prototype.__proto__ = Shape.prototype;
    Text.prototype.message = function(message) {
        this.messageText = ""+message;
        this._draw();
        return this;
    };
    Text.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Text.prototype.font = function(fontName, fontSize, lineSpacing) {
        this.fontName = fontName;
        this.fontSize = fontSize;
        this.lineSpacing = lineSpacing || fontSize*2;
        this._draw();
        return this;
    };
    Text.prototype.anchor = function(anchorText) {
        this.anchorText = anchorText;
        this._draw();
        return this;
    };
    Text.prototype._draw = function() {
        for (var l=0; l<this.lines.length; l++) {
            svgr.remove(this.component, this.lines[l]);
        }
        this.lines = [];
        var lines = this.messageText.split("\n");
        for (l=1; l<lines.length; l++) {
            var line = svgr.create("tspan");
            svgr.attr(line, "x", this.x);
            svgr.attr(line, "y", this.y-(l-1)/2*this.lineSpacing);
            svgr.text(line, lines[l]);
            this.lines[l-1] = line;
            svgr.add(this.component, line);
        }
        svgr.attr(this.component, "x", this.x);
        svgr.attr(this.component, "y", this.y-(lines.length-1)/2*this.lineSpacing);
        svgr.attr(this.component, "text-anchor", this.anchorText);
        svgr.attr(this.component, "font-family", this.fontName);
        svgr.attr(this.component, "font-size", this.fontSize);
        svgr.text(this.component, lines[0]);
    };
    Text.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Text.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Text.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        var box = svgr.boundingRect(this.component);
        switch(this.anchorText) {
            case "middle":
                return (local.x>=-box.width/2 && local.x<=box.width/2 && local.y>=-box.height/2 && local.y<=box.height/2);
            case "start":
                return (local.x>=0 && local.x<=box.width && local.y>=-box.height/2 && local.y<=box.height/2);
            case "end":
                return (local.x>=-box.width && local.x<=0 && local.y>=-box.height/2 && local.y<=box.height/2);
        }
    };

    function Line(x1, y1, x2, y2) {
        this.component = svgr.create("line");
        Shape.call(this);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this._draw();
    }
    Line.prototype.__proto__ = Shape.prototype;
    Line.prototype.start = function(x1, y1) {
        this.x1 = x1;
        this.y1 = y1;
        this._draw();
        return this;
    };
    Line.prototype.end = function(x2, y2) {
        this.x2 = x2;
        this.y2 = y2;
        this._draw();
        return this;
    };
    Line.prototype._draw = function() {
        svgr.attr(this.component, "x1", this.x1);
        svgr.attr(this.component, "y1", this.y1);
        svgr.attr(this.component, "x2", this.x2);
        svgr.attr(this.component, "y2", this.y2);
    };
    Line.prototype.prepareAnimator = function(animator) {
        Shape.prototype.prepareAnimator.call(this, animator);
        var self = this;
        animator.move = function(sx1, sy1, sx2, sy2, ex1, ey1, ex2, ey2) {
            animator.process([sx1, sy1, sx2, sy2], [ex1, ey1, ex2, ey2],
                function(coords) {
                    this.start(coords[0], coords[1]).end(coords[3], coords[4]);
                });
            return animator;
        };
        animator.moveTo = function(ex1, ey1, ex2, ey2) {
            animator.process([self.x1, self.y1, self.x2, self.y2], [ex1, ey1, ex2, ey2],
                function(coords) {
                    this.start(coords[0], coords[1]).end(coords[3], coords[4]);
                });
            return animator;
        };
        animator.start = function(sx1, sy1, ex1, ey1) {
            animator.process([sx1, sy1], [ex1, ey1],
                function(coords) {
                    this.start(coords[0], coords[1]);
                });
            return animator;
        };
        animator.startTo = function(ex1, ey1) {
            animator.process([self.x1, self.y1], [ex1, ey1],
                function(coords) {
                    this.start(coords[0], coords[1]);
                });
            return animator;
        };
        animator.end = function(sx1, sy1, ex1, ey1) {
            animator.process([sx1, sy1], [ex1, ey1],
                function(coords) {
                    this.end(coords[0], coords[1]);
                });
            return animator;
        };
        animator.endTo = function(ex1, ey1) {
            animator.process([self.x2, self.y2], [ex1, ey1],
                function(coords) {
                    this.end(coords[0], coords[1]);
                });
            return animator;
        }
    };
    Line.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint(point);
    };
    Line.prototype.localPoint = function() {
        var point = getPoint(arguments);
        return this.parent.localPoint(point);
    };
    Line.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        var dist = distanceToSegment(local, {x:this.x1, y:this.y1}, {x:this.x2, y:this.y2});
        return dist < (this.strokeWidth||2)/2;

        function distanceToSegment(p, s1, s2) {
            return Math.sqrt(distanceToSegmentSquared(p, s1, s2));

            function squareDistance(p1, p2) {
                return (p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)
            }
            function distanceToSegmentSquared(p, s1, s2) {
                var l2 = squareDistance(s1, s2);
                if (l2 == 0) return squareDistance(p, s1);
                var t = ((p.x - s1.x) * (s2.x - s1.x) + (p.y - s1.y) * (s2.y - s1.y)) / l2;
                if (t < 0) return squareDistance(p, s1);
                if (t > 1) return squareDistance(p, s2);
                return squareDistance(p, { x: s1.x + t * (s2.x - s1.x), y: s1.y + t * (s2.y - s1.y) });
            }
        }
    };

    function Path(x, y) {
        this.component = svgr.create("path");
        Shape.call(this);
        if (x===undefined) {
            this.drawing = "";
            this.points = [];
        }
        else {
            this.drawing = "M " + x + "," + y + " ";
            this.points = [{x:x, y:y}];
        }
    }
    Path.prototype.__proto__ = Shape.prototype;
    Path.prototype.reset = function() {
        this.drawing="";
        this.points = [];
        this._draw();
        return this;
    };
    Path.prototype.bezier = function(cx, cy, x1, y1) {
        this.drawing+="Q "+cx+","+cy+" "+x1+","+y1+" ";
        this.points.push({x:cx, y:cy}, {x:x1, y:y1});
        this._draw();
        return this;
    };
    Path.prototype.cubic = function(cx1, cy1, cx2, cy2, x1, y1) {
        this.drawing+="C "+cx1+","+cy1+" "+cx2+","+cy2+" "+x1+","+y1+" ";
        this.points.push({x:cx1, y:cy1}, {x:cx2, y:cy2}, {x:x1, y:y1});
        this._draw();
        return this;
    };
    Path.prototype.line = function(x, y) {
        this.drawing+="L "+x+","+y+" ";
        this.points.push({x:x, y:y});
        this._draw();
        return this;
    };
    Path.prototype.move = function(x, y) {
        this.drawing+="M "+x+","+y+" ";
        this.points.push({x:x, y:y});
        this._draw();
        return this;
    };
    Path.prototype._draw = function() {
        svgr.attr(this.component, "d", this.drawing);
    };
    Path.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint(point);
    };
    Path.prototype.localPoint = function() {
        var point = getPoint(arguments);
        return this.parent.localPoint(point);
    };
    Path.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return insidePolygon(local.x, local.y, this.points);
    };

    function Image(url) {
        this.component = svgr.create("image");
        Shape.call(this);
        this.src = url;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.fillColor = [true];
        var self = this;
        this._draw();
    }
    Image.prototype.__proto__ = Shape.prototype;
    Image.prototype.url = function(url) {
        this.src = url;
        this._draw();
        return this;
    };
    Image.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        this._draw();
        return this;
    };
    Image.prototype.dimension = function(width, height) {
        this.width = width;
        this.height = height;
        this._draw();
        return this;
    };
    Image.prototype._draw = function() {
        svgr.attr(this.component,"x", (this.x-this.width/2));
        svgr.attr(this.component, "y", (this.y-this.height/2));
        svgr.attr(this.component, "width", this.width);
        svgr.attr(this.component, "height", this.height);
        svgr.attrXlink(this.component, "href", this.src);
    };
    Image.prototype.globalPoint = function() {
        var point = getPoint(arguments);
        return this.parent.globalPoint({x:point.x+this.x, y:point.y+this.y});
    };
    Image.prototype.localPoint = function() {
        var point = getPoint(arguments);
        point = this.parent.localPoint(point);
        return point ? {x:point.x-this.x, y:point.y-this.y} : null;
    };
    Image.prototype.inside = function(x, y) {
        var local = this.localPoint(x, y);
        return local.x>=-this.width/2 && local.x<=this.width/2
            && local.y>=-this.height/2 && local.y<=this.height/2;
    };

    function getPoint(args) {
        if (args[0]!==undefined && (typeof args[0]==='number')) {
            return {x:args[0], y:args[1]}
        }
        else {
            return args[0];
        }
    }

    function Animator(handler) {
        this.handler = handler;
        this.handler.prepareAnimator(this);

        this.smoothy = function(speed, step) {
            this.mode = "smooth";
            this.speed = speed;
            this.step = step;
            return this;
        };
        this.steppy = function(speed, stepCount) {
            this.mode = "step";
            this.speed = speed;
            this.stepCount = stepCount;
            return this;
        };
        this.onChannel = function(channelInfo) {
            this.channel = channelInfo && channelInfo.__proto__===channelPrototype ? channelInfo : onChannel(channelInfo);
            return this;
        };
        this.process = function(source, target, setter) {
            var channel = this.channel || onChannel(null);
            var executor = {
                source:source,
                target:target,
                setter:setter.bind(this.handler)
            };
            if (this.processing) {
                executor.processing = this.processing.bind(this.handler);
            }
            if (this.mode==="smooth") {
                smoothy(executor, this.speed, this.step, channel);
            }
            else if (this.mode==="step") {
                steppy(executor, this.speed, this.stepCount, channel);
            }
        };
        this.execute = function(processing) {
            this.processing = processing;
            return this;
        };

        function smoothy(executor, speed, step, channel) {
            var delta = [];
            var sum = 0;
            for (var k=0; k<executor.source.length; k++) {
                delta[k] = executor.target[k] - executor.source[k];
                sum += delta[k]*delta[k];
            }
            var stepCount = Math.sqrt(sum) / step;
            steppy(executor, speed, stepCount, channel);
        }

        function steppy(executor, speed, stepCount, channel) {

            channel.play(speed, stepCount,
                function (i) {
                    var progress = i/stepCount;
                    var inc = [];
                    for (var l=0; l<executor.source.length; l++) {
                        inc[l] = executor.source[l] + (executor.target[l] - executor.source[l]) * progress;
                    }
                    executor.setter(inc);
                    if (executor.processing) {
                        executor.processing(progress);
                    }
                },
                function () {
                    executor.setter(executor.target);
                    if (executor.processing) {
                        executor.processing(1);
                    }
                }
            );
        }
    }

    var channels = {};

    function animate() {
        onChannel(null).animate.apply(onChannel(null), arguments);
    }

    function onChannel(channelInfo) {
        var channel = channelInfo===undefined ? null : channels[channelInfo];
        if (!channel) {
            channel = {time:svgr.now()};
            if (channelInfo!==undefined) {
                channels[channelInfo] = channel;
            }
            channel.__proto__ = channelPrototype;
        }
        return channel;
    }

    var channelPrototype = {
        animate: function (delay, todo) {
            var self = this;
            var now = svgr.now();
            if (now>self.time) {
                self.time = now;
            }
            self.time += delay;
            var args = Array.prototype.slice.call(arguments, 0);
            args.shift();
            args.shift();
            var last = function () {
                if (args.length == 0) {
                    todo();
                }
                else {
                    var who = args.shift();
                    todo.apply(who || null, args);
                }
            };
            svgr.timeout(last, self.time-now);
        },
        play: function(delay, stepCounts, animator, terminator) {
            var self = this;
            for (var i=0; i<stepCounts; i++) {
                (function (i) {
                    self.animate(delay, function() {
                        animator(i);
                    });
                })(i);
            }
            self.animate(1, function() {
                terminator();
            });
        }
    };

    function request(url, data) {
        var http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.setRequestHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Access-Controll-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept");
        http.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:63343/log");
        //http.setRequestHeader("Access-Control-Request-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        http.send(JSON.stringify(data));

        var result = {
            onSuccess: function(successFunction) {
                result.success = successFunction;
                return result;
            },
            onFailure: function(failureFunction) {
                result.failure = failureFunction;
                return result;
            }
        };
        http.onreadystatechange=function(){
            if (http.readyState==4){
                if (http.status==200) {
                    var fromServer = JSON.parse(http.responseText);
                    for (var key in fromServer) {
                        result[key] = fromServer[key];
                    }
                    result.success && result.success();
                }
                else {
                    result.failure && result.failure(http.status);
                }
            }
        };
        return result;
    }

    function random() {
        return svgr.random();
    }
    function timeout(handler, delay) {
        return svgr.timeout(handler, delay);
    }
    function interval(handler, delay) {
        return svgr.interval(handler, delay);
    }
    function clearTimeout(token) {
        return svgr.clearTimeout(token);
    }
    function clearInterval(token) {
        return svgr.clearInterval(token);
    }
    function addEvent(component, eventName, handler) {
        svgr.addEvent(component.component, eventName, handler);
    }
    function removeEvent(component, eventName, handler) {
        svgr.removeEvent(component.component, eventName, handler);
    }
    function event(component, eventName, event) {
        svgr.event(component.component, eventName, event);
    }

    return {
        Drawing : Drawing,
        Handler: Handler,
        Ordered : Ordered,
        Translation : Translation,
        Rotation : Rotation,
        Scaling : Scaling,
        Rect : Rect,
        Circle : Circle,
        Ellipse : Ellipse,
        Triangle : Triangle,
        CurvedShield : CurvedShield,
        Polygon : Polygon,
        Arrow : Arrow,
        Hexagon : Hexagon,
        Line : Line,
        Path : Path,
        Text : Text,
        Image : Image,

        Animator : Animator,

        insidePolygon:insidePolygon,
        angle:angle,
        rotate:rotate,

        onChannel : onChannel,
        animate: animate,

        targetRuntime: targetRuntime,
        addEvent : addEvent,
        removeEvent : removeEvent,
        event : event,
        random : random,
        timeout : timeout,
        interval : interval,
        clearTimeout : clearTimeout,
        clearInterval : clearInterval,

        request: request
    }
}

if (typeof exports != 'undefined') {
    exports.setTarget = setTarget;
    exports.SVG = SVG;
}

