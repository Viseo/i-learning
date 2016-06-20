'use strict'
/**
 * Created by HDA3014 on 07/01/2016.
 */
console.log("SVGHandler loaded...");

exports.SVG = function(runtime) {

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

    var svgr = runtime;// || targetruntime();

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

    function getPoint(args) {
        if (args[0] !== undefined && (typeof args[0] === 'number')) {
            return {x: args[0], y: args[1]}
        }
        else {
            return args[0];
        }
    }

    function Visitor(name, ...args) {
        this.visit = function(svgObject) {
            if (!(svgObject instanceof Handler) && svgObject[name]) {
                svgObject[name].apply(svgObject, args);
            }
        }
    }

    class SvgElement {

        constructor() {}

        mark(id) {
            this.id = id;
            this.component && svgr.mark(this.component, id);
            return this;
        }

    }

    class DomElement {

        constructor() {}

        mark(id) {
            this.id = id;
            this.component && svgr.mark(this.component, id);
            return this;
        }

    }

    class Screen extends DomElement {
        constructor(width, height){
            super();
            this.component = svgr.createDOM("div");
            this.dimension(width, height);
            this.children = [];
        }

        add(domObject) {
            svgr.add(this.component, domObject.component);
            domObject.parent = this;
            this.children.push(domObject);
            return this;
        }

        remove(domObject) {
            svgr.remove(this.component, domObject.component);
            var index = this.children.indexOf(domObject);
            if (index > -1) {
                domObject.parent = null;
                this.children.splice(index, 1);
            }
            return this;
        }

        show(id) {
            this.anchor = id;
            svgr.add(svgr.anchor(this.anchor), this.component);
            return this;
        }

        dimension(width, height){
            this.width = width;
            this.height = height;
            this._draw();
        }

        _draw(){
            var style = "left:" + 0 + "px;";
            style += "top:" + 0 + "px;";
            style += "width:" + this.width + "px;";
            style += "height:" + this.height + "px;";
            style += "position: absolute;";
            svgr.attr(this.component, "style", style);
        }

        globalPoint(...args) {
            return getPoint(args);
        }

        localPoint(...args) {
            return getPoint(args);
        }
    }

    class Block extends DomElement{
        constructor(){
            super();
            this.component = svgr.createDOM("div");
            this.children = [];
            this._draw();
        }

        add(domObject) {
            svgr.add(this.component, domObject.component);
            domObject.parent = this;
            this.children.push(domObject);
            return this;
        }

        remove(domObject) {
            svgr.remove(this.component, domObject.component);
            var index = this.children.indexOf(domObject);
            if (index > -1) {
                domObject.parent = null;
                this.children.splice(index, 1);
            }
            return this;
        }

        move(x, y){
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        dimension(width, height){
            this.width = width;
            this.height = height;
            this._draw();
            return this;
        }

        _draw(){
            svgr.attr(this.component, "left", this.x);
            svgr.attr(this.component, "top", this.y);
            svgr.attr(this.component, "width", this.width);
            svgr.attr(this.component, "height", this.height);
            svgr.attr(this.component, "position", "absolute");
        }
    }

    class TextItem extends DomElement {

        constructor(x, y, width, height, component){
            super();
            this.component = component;
            this.anchorText = TextArea.CENTER;
            this.fontName = "arial";
            this.fontSize = 12;
            this.dimension(width, height);
            this.position(x, y);
            this.messageText = "";
            this.placeHolderText = "";
        }

        focus() {
            svgr.focus(this.component);
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            svgr.attr(this.component, "width", width);
            svgr.attr(this.component, "height", height);
            this._draw();
            return this;
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            svgr.attr(this.component, "x", x);
            svgr.attr(this.component, "y", y);
            this._draw();
            return this;
        }

        anchor(anchorText) {
            this.anchorText = anchorText;
            this._draw();
            return this;
        }

        font(fontName, fontSize) {
            this.fontName = fontName;
            this.fontSize = fontSize;
            this._draw();
            return this;
        }

        color(fillColor, strokeWidth, strokeColor) {
            this.fillColor = fillColor;
            this.strokeWidth = strokeWidth;
            this.strokeColor = strokeColor;
            this._draw();
            return this;
        }

        message(messageText){
            this.messageText = messageText;
            this._draw();
            return this;
        }

        placeHolder(placeHolderText){
            this.placeHolderText = placeHolderText;
            this._draw();
            return this;
        }

        _draw(style){
            style += "left:" + (this.x || 0) + "px;";
            style += "top:" + (this.y || 0) + "px;";
            style += "width:" + (this.width || 0) + "px;";
            style += "height:" + (this.height || 0) + "px;";
            style += "text-align:" + (this.anchorText || TextItem.CENTER) + ";";
            style += "font-family:" + (this.fontName || "Arial") + ";";
            style += "font-size:" + (this.fontSize || 20) +"px;";
            style += "background-color:" + ((this.fillColor && this.fillColor.length) ? "rgb(" + this.fillColor.join(",") + ");" : "transparent;");
            style += "border:" + (this.strokeWidth || 0) + "px solid black;";
            style += "outline:" + "none;";
            style += "color:" + ((this.strokeColor && this.strokeColor.length) ? "rgb(" + this.strokeColor.join(",") + ");" : "transparent;");
            svgr.attr(this.component, "style", style);
            svgr.attr(this.component, "value", this.messageText || '');
            svgr.attr(this.component, "placeholder", this.placeHolderText || '');
            console.log(style);
        }
    }

    TextItem.CENTER = "center";


    class TextArea extends TextItem {

        constructor(x, y, width, height){
            super(x, y, width, height, svgr.createDOM("textarea"));
            this.scroll(TextArea.CLIPPED);
        }

        scroll(mode){
            this.mode = mode;
            this._draw();
            return this;
        }

        _draw(){
            var style = "overflow:" + (this.mode || TextArea.CLIPPED) +";";
            style += "resize:" + "none;";
            style += "position: absolute;";
            super._draw(style);
        }
    }

    TextArea.SCROLL = "auto";
    TextArea.CLIPPED = "hidden";
    TextArea.SHOW_ALL = "visible";

    class TextField extends TextItem {

        constructor(x, y, width, height){
            super(x, y, width, height, svgr.createDOM("input"));
            this.type(TextField.TEXT);
        }

        type(inputType){
            this.inputType = inputType;
            this._draw();
        }

        _draw(){
            svgr.attr(this.component, "type", this.inputType);
            var style = "position: absolute;";
            super._draw(style);
        }

    }
    TextField.PASSWORD = "password";
    TextField.TEXT = "text";


    class Drawing extends SvgElement {

        constructor(width, height) {
            super();
            this.children = [];
            this.x = 0;
            this.y = 0;
            this._active = true;
            this.component = svgr.create("svg");
            svgr.attrNS(this.component, 'xlink', 'http://www.w3.org/1999/xlink');
            this.dimension(width, height);
        }

        active(flag) {
            this._active = flag || flag === undefined;
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            svgr.attr(this.component, "width", width);
            svgr.attr(this.component, "height", height);
            return this;
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            svgr.attr(this.component, "x", x);
            svgr.attr(this.component, "y", y);
            return this;
        }

        show(id) {
            this.anchor = id;
            svgr.add(svgr.anchor(this.anchor), this.component);
            return this;
        }

        hide() {
            svgr.remove(svgr.anchor(this.anchor), this.component);
            return this;
        }

        add(svgObject) {
            svgr.add(this.component, svgObject.component);
            svgObject.parent = this;
            this.children.push(svgObject);
            return this;
        }

        remove(svgObject) {
            svgr.remove(this.component, svgObject.component);
            var index = this.children.indexOf(svgObject);
            if (index > -1) {
                svgObject.parent = null;
                this.children.splice(index, 1);
            }
            return this;
        }

        smoothy(speed, step) {
            return new Animator(this).smoothy(speed, step);
        }

        steppy(speed, stepCount) {
            return new Animator(this).steppy(speed, stepCount);
        }

        onChannel(channelInfo) {
            return new Animator(this).onChannel(channelInfo);
        }

        prepareAnimator(animator) {
            animator.resize = (swidth, sheight, ewidth, eheight)=> {
                animator.process([swidth, sheight], [ewidth, eheight], coords=> this.dimension(coords[0], coords[1]));
                return animator;
            };
            var self = this;
            animator.resizeTo = (ewidth, eheight)=> {
                animator.process([self.width, self.height], [ewidth, eheight], coords=>
                    this.dimension(coords[0], coords[1]));
                return animator;
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            if (this.parent) {
                point = {
                    x: point.x + this.x,
                    y: point.y + this.y
                };
                return this.parent.globalPoint(point);
            }
            else {
                return {
                    x: point.x + svgr.boundingRect(this.component).left,
                    y: point.y + svgr.boundingRect(this.component).top
                };
            }
        }

        localPoint(...args) {
            var point = getPoint(args);
            if (this.parent) {
                point = this.parent.localPoint(point);
                return {
                    x: point.x - this.x,
                    y: point.y - this.y
                };
            }
            else {
                return {
                    x: point.x - svgr.boundingRect(this.component).left,
                    y: point.y - svgr.boundingRect(this.component).top
                };
            }
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return local.x >= 0 && local.x <= this.width && local.y >= 0 && local.y <= this.height;
        }

        getTarget(x, y) {
            if (this._active && this.inside(x,y)) {
                for (var i = this.children.length - 1; i >= 0; i--) {
                    var target = this.children[i].getTarget(x, y);
                    if (target) {
                        return target;
                    }
                }
            }
            return null;
        }
    }

    class Handler extends SvgElement {

        constructor() {
            super();
            this.children = [];
            this._active = true;
            this.component = svgr.create("g");
        }

        active(flag) {
            this._active = flag || flag === undefined;
            return this;
        }

        center() {
            var rect = svgr.boundingRect(this.component);
            return {
                cx: rect.width / 2,
                cy: rect.height / 2
            }
        }

        clear() {
            while (svgr.first(this.component)) {
                svgr.remove(this.component, svgr.first(this.component));
            }
            this.children = [];
        }

        add(svgObject) {
            svgr.add(this.component, svgObject.component);
            svgObject.parent = this;
            this.children.push(svgObject);
            return this;
        }

        remove(svgObject) {
            svgr.remove(this.component, svgObject.component);
            var index = this.children.indexOf(svgObject);
            if (index > -1) {
                svgObject.parent = null;
                this.children.splice(index, 1);
            }
            return this;
        }

        accept(visitor) {
            visitor.visit(this);
            for (var index = 0; index < this.children.length; index++) {
                this.children[index].accept(visitor);
            }
            return this;
        }

        opacity(opacity) {
            this._opacity = opacity;
            svgr.attr(this.component, "opacity", opacity);
            return this;
        }

        smoothy(speed, step) {
            return new Animator(this).smoothy(speed, step);
        }

        steppy(speed, stepCount) {
            return new Animator(this).steppy(speed, stepCount);
        }

        onChannel(channelInfo) {
            return new Animator(this).onChannel(channelInfo);
        }

        onClick(handler) {
            this.accept(new Visitor("onClick", handler));
            return this;
        }

        onRightClick(handler) {
            this.accept(new Visitor("onRightClick", handler));
            return this;
        }

        color(fillColor, stroke, strokeColor) {
            this.accept(new Visitor("color", fillColor, stroke, strokeColor));
            return this;
        }

        clickable(flag) {
            this.accept(new Visitor("clickable", flag));
            return this;
        }

        prepareAnimator(animator) {
            animator.opacity = (sopacity, eopacity)=> {
                animator.process([sopacity], [eopacity], coords=> this.opacity(coords[0]));
                return animator;
            };
            animator.opacityTo = eopacity=> {
                animator.process([self.opacity], [eopacity], coords=> this.opacity(coords[0]));
                return animator;
            }
        }

        getTarget(x, y) {
            if (this._active) {
                if (!this._opacity || this._opacity > 0) {
                    for (var i = this.children.length - 1; i >= 0; i--) {
                        if (!this.children[i].dummy) {
                            var target = this.children[i].getTarget(x, y);
                            if (target) {
                                return target;
                            }
                        }
                    }
                }
            }
            return null;
        }
    }

    class Ordered extends Handler {

        constructor(layerCount) {
            super();
            this.children = [];
            this._active = true;
            this.component = svgr.create("g");
            for (var i = 0; i < layerCount; i++) {
                this.children[i] = this._dummy();
                svgr.add(this.component, this.children[i].component);
            }
        }

        _dummy() {
            var dummy = new Rect(0, 0).opacity(0);
            dummy.dummy = true;
            return dummy;
        }

        order(layerCount) {
            this.clear();
            for (var i = 0; i < layerCount; i++) {
                this.children[i] = this._dummy();
                svgr.add(this.component, this.children[i].component);
            }
            return this;
        }

        set(layer, svgObject) {
            svgr.replace(this.component, this.children[layer].component, svgObject.component);
            svgObject.parent = this;
            this.children[layer] = svgObject;
            return this;
        }

        unset(layer) {
            var dummy = this._dummy();
            svgr.replace(this.component, this.children[layer].component, dummy.component);
            this.children[layer] = dummy;
            return this;
        }

        get(layer) {
            return this.children[layer];
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point;
        }
    }

    class Translation extends Handler {
        constructor(x = 0, y = 0) {
            super();
            this.move(x, y);
        }

        move(x, y) {
            this.x = x;
            this.y = y;
            svgr.attr(this.component, "transform", "translate(" + x + " " + y + ")");
            return this;
        };

        prepareAnimator(animator) {
            Handler.prototype.prepareAnimator.call(this, animator);
            animator.move = (sx, sy, ex, ey)=> {
                animator.process([sx, sy], [ex, ey], coords => this.move(coords[0], coords[1]));
                return animator;
            };
            animator.moveTo = (ex, ey)=> {
                animator.process([this.x, this.y], [ex, ey], coords => this.move(coords[0], coords[1]));
                return animator;
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            point = {x: point.x + this.x, y: point.y + this.y};
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            if (point) {
                point = {x: point.x - this.x, y: point.y - this.y};
            }
            return point;
        }
    }

    class Rotation extends Handler {
        constructor(angle) {
            super();
            this.rotate(angle || 0);
        }

        rotate(angle) {
            this.angle = angle;
            svgr.attr(this.component, "transform", "rotate(" + angle + ")");
            return this;
        }

        prepareAnimator(animator) {
            Handler.prototype.prepareAnimator.call(this, animator);
            animator.rotate = (sangle, eangle)=> {
                animator.process([sangle], [eangle], angle => this.rotate(angle[0]));
                return animator;
            };
            animator.rotateTo = eangle=> {
                animator.process([self.angle], [eangle], angle=> this.rotate(angle[0]));
                return animator;
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            point = rotate(point.x, point.y, this.angle);
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            if (point) {
                point = rotate(point.x, point.y, -this.angle);
            }
            return point;
        }
    }

    class Scaling extends Handler {
        constructor(factor) {
            super();
            this.scale(factor);
        }

        scale(factor) {
            this.factor = factor;
            svgr.attr(this.component, "transform", "scale(" + factor + ")");
            return this;
        }

        prepareAnimator(animator) {
            Handler.prototype.prepareAnimator.call(this, animator);
            animator.scale = (sfactor, efactor)=> {
                animator.process([sfactor], [efactor], factor=> this.scale(factor[0]));
                return animator;
            };
            var self = this;
            animator.scaleTo = efactor => {
                animator.process([self.factor], [efactor], factor=> this.scale(factor[0]));
                return animator;
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            point = {
                x: point.x * this.factor,
                y: point.y * this.factor
            };
            return this.parent ? this.parent.globalPoint(point) : null;
        };

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            if (point) {
                point = {
                    x: point.x / this.factor,
                    y: point.y / this.factor
                };
            }
            return point;
        }
    }

    class Shape extends SvgElement {

        constructor() {
            super();
            this._active = true;
        }

        active(flag = true) {
            this._active = flag;
            return this;
        }

        accept(visitor) {
            visitor.visit(this);
            return this;
        }

        clickable(flag = true) {
            this.clickflag = flag;
            this._setOnClick();
            this._setOnRightClick();
            return this;
        }

        onClick(handler) {
            this.clickHandler = handler;
            this._setOnClick();
            return this;
        }

        onRightClick(handler) {
            this.rightClickHandler = handler;
            this._setOnRightClick();
            return this;
        }

        _setOnClick() {
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
        }

        _setOnRightClick() {
            if (this.clickflag && this.rightClickHandler) {
                var self = this;
                this.component.rightClickHandler = function (event) {
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
        }

        color(fillColor, strokeWidth, strokeColor) {
            this.fillColor = fillColor;
            this.strokeWidth = strokeWidth;
            this.strokeColor = strokeColor;
            svgr.attr(this.component, "fill", fillColor && fillColor.length ? "rgb(" + fillColor.join(",") + ")" : "none");
            svgr.attr(this.component, "stroke-width", strokeWidth || 0);
            svgr.attr(this.component, "stroke", strokeWidth && strokeColor && strokeColor.length ? "rgb(" + strokeColor.join(",") + ")" : "none");
            return this;
        }

        opacity(opacity) {
            this._opacity = opacity;
            svgr.attr(this.component, "opacity", opacity);
            return this;
        }

        fillOpacity(opacity) {
            this._fillopacity = opacity;
            svgr.attr(this.component, "fill-opacity", opacity);
            return this;
        }

        smoothy(speed, step) {
            return new Animator(this).smoothy(speed, step);
        }

        steppy(speed, stepCount) {
            return new Animator(this).steppy(speed, stepCount);
        }

        onChannel(channelInfo) {
            return new Animator(this).onChannel(channelInfo);
        }

        prepareAnimator(animator) {
            animator.color = (sfillColor, efillColor, sstroke, estroke, sstrokeColor, estrokeColor)=> {

                let concat = (fillColor, stroke, strokeColor)=> {
                    var color = fillNone ? [] : [fillColor[0], fillColor[1], fillColor[2]];
                    if (!strokeNone) {
                        color.push(stroke, strokeColor[0], strokeColor[1], strokeColor[2]);
                    }
                    return color;
                };

                let colorIdx = 0;

                let getFillColor = color=> {
                    if (fillNone) {
                        colorIdx = 0;
                        return [];
                    }
                    else {
                        colorIdx = 3;
                        return [Math.round(color[0]), Math.round(color[1]), Math.round(color[2])];
                    }
                };

                let getStroke = color=> {
                    if (strokeNone) {
                        return undefined;
                    }
                    else {
                        return color[colorIdx++];
                    }
                };

                let getStrokeColor= color=> {
                    if (strokeNone) {
                        return undefined;
                    }
                    else {
                        return [Math.round(color[colorIdx]), Math.round(color[colorIdx + 1]), Math.round(color[colorIdx + 2])];
                    }
                };

                var fillNone = !sfillColor || !sfillColor.length;
                var strokeNone = !sstroke || !sstrokeColor || !sstrokeColor.length;
                var scolor = concat(sfillColor, sstroke, sstrokeColor);
                var ecolor = concat(efillColor, estroke, estrokeColor);
                animator.process(scolor, ecolor, color=>
                    this.color(getFillColor(color), getStroke(color), getStrokeColor(color)));
                return animator;
            };

            animator.colorTo = (efillColor, estroke, estrokeColor)=> {
                return animator.color(self.fillColor, efillColor, self.stroke, estroke, self.strokeColor, estrokeColor);
            };
            animator.opacity = (sfactor, efactor)=> {
                animator.process([sfactor], [efactor], factor=> this.opacity(factor[0]));
                return animator;
            };
            animator.opacityTo = efactor=> {
                animator.process([self.factor], [efactor], factor=> this.opacity(factor[0]));
                return animator;
            }
        }

        getTarget(x, y) {
            if ((!this._opacity || this._opacity > 0) && this.fillColor && this.fillColor.length > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }
    }

    class Rect extends Shape {

        constructor(width, height) {
            super();
            this.component = svgr.create("rect");
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this._draw();
            return this;
        }

        corners(radiusX, radiusY) {
            this.rx = radiusX;
            this.ry = radiusY;
            svgr.attr(this.component, "rx", this.rx);
            svgr.attr(this.component, "ry", this.ry);
            return this;
        }

        _draw() {
            svgr.attr(this.component, "x", (this.x - this.width / 2));
            svgr.attr(this.component, "y", (this.y - this.height / 2));
            svgr.attr(this.component, "width", this.width);
            svgr.attr(this.component, "height", this.height);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return local.x >= -this.width / 2 && local.x <= this.width / 2
                && local.y >= -this.height / 2 && local.y <= this.height / 2;
        }
    }

    class Circle extends Shape {

        constructor(radius) {
            super();
            this.component = svgr.create("circle");
            this.x = 0;
            this.y = 0;
            this.r = radius;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        radius(radius) {
            this.r = radius;
            this._draw();
            return this;
        }

        _draw() {
            svgr.attr(this.component, "cx", this.x);
            svgr.attr(this.component, "cy", this.y);
            svgr.attr(this.component, "r", this.r);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            var dist = local.x * local.x + local.y * local.y;
            return dist <= this.r * this.r;
        }
    }

    class Ellipse extends Shape {
        constructor(radiusX, radiusY) {
            super();
            this.component = svgr.create("ellipse");
            this.x = 0;
            this.y = 0;
            this.rx = radiusX;
            this.ry = radiusY;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        radius(radiusX, radiusY) {
            this.rx = radiusX;
            this.ry = radiusY;
            this._draw();
            return this;
        }

        _draw() {
            svgr.attr(this.component, "cx", this.x);
            svgr.attr(this.component, "cy", this.y);
            svgr.attr(this.component, "rx", this.rx);
            svgr.attr(this.component, "ry", this.ry);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            var dx = local.x / this.rx;
            var dy = local.y / this.ry;
            return dx * dx + dy * dy <= 1;
        }
    }

    class Triangle extends Shape {

        constructor(width, height, direction) {
            super();
            this.component = svgr.create("polygon");
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;
            this.dir = direction;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this._draw();
            return this;
        }

        direction(direction) {
            this.dir = direction;
            this._draw();
            return this;
        }

        _draw() {
            var dir = this.dir || "N";
            switch (dir) {
                case "N":
                    this.points = [
                        {x: this.x - this.width / 2, y: this.y + this.height / 2},
                        {x: this.x + this.width / 2, y: this.y + this.height / 2},
                        {x: this.x, y: this.y - this.height / 2}];
                    break;
                case "E":
                    this.points = [
                        {x: this.x - this.width / 2, y: this.y - this.height / 2},
                        {x: this.x - this.width / 2, y: this.y + this.height / 2},
                        {x: this.x + this.width / 2, y: this.y}];
                    break;
                case "S":
                    this.points = [
                        {x: this.x - this.width / 2, y: this.y - this.height / 2},
                        {x: this.x + this.width / 2, y: this.y - this.height / 2},
                        {x: this.x, y: this.y + this.height / 2}];
                    break;
                case "W":
                    this.points = [
                        {x: this.x + this.width / 2, y: this.y - this.height / 2},
                        {x: this.x + this.width / 2, y: this.y + this.height / 2},
                        {x: this.x - this.width / 2, y: this.y}];
                    break;
            }
            svgr.attr(this.component, "points", print(this.points));
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }
    }

    class CurvedShield extends Shape {

        constructor(width, height, headRatio, direction) {
            super();
            this.component = svgr.create("path");
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;
            this.headRatio = headRatio;
            this.dir = direction;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        dimension(width, height, headRatio) {
            this.width = width;
            this.height = height;
            this.headRatio = headRatio;
            this._draw();
            return this;
        }

        direction(direction) {
            this.dir = direction;
            this._draw();
            return this;
        }

        _draw() {
            var dir = this.dir || "N";
            var headSize;
            switch (dir) {
                case "N":
                    headSize = this.height * this.headRatio;
                    this.points = [
                        {x: this.x - this.width / 2, y: this.y + this.height / 2},
                        {x: this.x - this.width / 2, y: this.y - this.height / 2 + headSize},
                        {x: this.x - this.width / 2, y: this.y - this.height / 2},
                        {x: this.x + this.width / 2, y: this.y - this.height / 2},
                        {x: this.x + this.width / 2, y: this.y - this.height / 2 + headSize},
                        {x: this.x + this.width / 2, y: this.y + this.height / 2},
                        {x: this.x - this.width / 2, y: this.y + this.height / 2}];
                    break;
                case "E":
                    headSize = this.width * this.headRatio;
                    this.points = [
                        {x: this.x - this.width / 2, y: this.y - this.height / 2},
                        {x: this.x + this.width / 2 - headSize, y: this.y - this.height / 2},
                        {x: this.x + this.width / 2, y: this.y - this.height / 2},
                        {x: this.x + this.width / 2, y: this.y + this.height / 2},
                        {x: this.x + this.width / 2 - headSize, y: this.y + this.height / 2},
                        {x: this.x - this.width / 2, y: this.y + this.height / 2},
                        {x: this.x - this.width / 2, y: this.y - this.height / 2}];
                    break;
                case "S":
                    headSize = this.height * this.headRatio;
                    this.points = [
                        {x: this.x - this.width / 2, y: this.y - this.height / 2},
                        {x: this.x - this.width / 2, y: this.y + this.height / 2 - headSize},
                        {x: this.x - this.width / 2, y: this.y + this.height / 2},
                        {x: this.x + this.width / 2, y: this.y + this.height / 2},
                        {x: this.x + this.width / 2, y: this.y + this.height / 2 - headSize},
                        {x: this.x + this.width / 2, y: this.y - this.height / 2},
                        {x: this.x - this.width / 2, y: this.y - this.height / 2}];
                    break;
                case "W":
                    headSize = this.width * this.headRatio;
                    this.points = [
                        {x: this.x + this.width / 2, y: this.y - this.height / 2},
                        {x: this.x - this.width / 2 + headSize, y: this.y - this.height / 2},
                        {x: this.x - this.width / 2, y: this.y - this.height / 2},
                        {x: this.x - this.width / 2, y: this.y + this.height / 2},
                        {x: this.x - this.width / 2 + headSize, y: this.y + this.height / 2},
                        {x: this.x + this.width / 2, y: this.y + this.height / 2},
                        {x: this.x + this.width / 2, y: this.y - this.height / 2}];
                    break;
            }
            svgr.attr(this.component, "d", print(this.points));

            function print(points) {
                return "M " + points[0].x + "," + points[0].y + " " +
                    "L " + points[1].x + "," + points[1].y + " " +
                    "C " + points[2].x + "," + points[2].y + " " +
                    points[3].x + "," + points[3].y + " " +
                    points[4].x + "," + points[4].y + " " +
                    "L " + points[5].x + "," + points[5].y + " " +
                    points[6].x + "," + points[6].y;
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }
    }

    class Polygon extends Shape {

        constructor(x, y) {
            super();
            this.component = svgr.create("polygon");
            this.x = x;
            this.y = y;
            this.points = [];
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        trace(dx, dy) {
            var lastPoint = this.points[this.points.length - 1];
            this.points.push({x: lastPoint.x + dx, y: lastPoint.y + dy});
            return this;
        }

        add(x, y) {
            if (Array.isArray(x) && Array.isArray(x[0])) {
                for (var i = 0; i < x.length; i++) {
                    this.points.push({x: x[i][0], y: x[i][1]});
                }
            }
            else {
                this.points.push({x: x, y: y});
            }
            this._draw();
            return this;
        }

        remove(index) {
            this.points.slice(index, 1);
            this._draw();
            return this;
        }

        clear() {
            this.points = [];
            this._draw();
            return this;
        }

        _draw() {
            var points = "";
            if (this.points.length > 0) {
                for (var i = 0; i < this.points.length; i++) {
                    points += " " + (this.points[i].x + this.x) + "," + (this.points[i].y + this.y);
                }
            }
            svgr.attr(this.component, "points", points);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            var point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x, local.y, this.points);
        }
    }

    class Arrow extends Shape {

        constructor(baseWidth, headWidth, headHeight) {
            super();
            this.component = svgr.create("polygon");
            this.baseWidth = baseWidth;
            this.headWidth = headWidth;
            this.headHeight = headHeight;
        }

        position(bx, by, hx, hy) {
            this.bx = bx;
            this.by = by;
            this.hx = hx;
            this.hy = hy;
            this._draw();
            return this;
        }

        _draw() {
            let point = (x, y)=> this.points.push({x:x, y:y});

            this.points = [];
            var dist = Math.sqrt((this.hx - this.bx) * (this.hx - this.bx) + (this.hy - this.by) * (this.hy - this.by));
            var px = (this.hx - this.bx) / dist;
            var py = (this.hy - this.by) / dist;
            point(this.bx, this.by);
            point(this.bx + this.baseWidth * py, this.by - this.baseWidth * px);
            point(this.hx + this.baseWidth * py - this.headHeight * px, this.hy - this.baseWidth * px - this.headHeight * py);
            point(this.hx + this.headWidth * py - this.headHeight * px, this.hy - this.headWidth * px - this.headHeight * py);
            point(this.hx, this.hy);
            point(this.hx - this.headWidth * py - this.headHeight * px, this.hy + this.headWidth * px - this.headHeight * py);
            point(this.hx - this.baseWidth * py - this.headHeight * px, this.hy + this.baseWidth * px - this.headHeight * py);
            point(this.bx - this.baseWidth * py, this.by + this.baseWidth * px);
            svgr.attr(this.component, "points", print(this.points));
        }

        globalPoint(...args) {
            let point = getPoint(args);
            return this.parent.globalPoint(point);
        }

        localPoint(...args) {
            var point = getPoint(args);
            return this.parent.localPoint(point);
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }
    }

    const Sqrt2 = Math.sqrt(3)/2;

    class Hexagon extends Shape {
        constructor(baseWidth, direction) {
            super();
            this.component = svgr.create("polygon");
            this.x = 0;
            this.y = 0;
            this.baseWidth = baseWidth;
            this.dir = direction;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        dimension(baseWidth) {
            this.baseWidth = baseWidth;
            this._draw();
            return this;
        }

        direction(direction) {
            this.dir = direction;
            this._draw();
            return this;
        }

        height() {
            return Math.round(this.baseWidth * Sqrt2);
        }

        _draw() {
            let point = (x, y)=>this.points.push({x: x, y: y});

            this.points = [];
            let height = this.height();
            switch (this.dir || "H") {
                case "H":
                    point(-this.baseWidth / 2, height);
                    point(-this.baseWidth, 0);
                    point(-this.baseWidth / 2, -height);
                    point(this.baseWidth / 2, -height);
                    point(this.baseWidth, 0);
                    point(this.baseWidth / 2, height);
                    break;
                case "V":
                    point(height, -this.baseWidth / 2);
                    point(0, -this.baseWidth);
                    point(-height, -this.baseWidth / 2);
                    point(-height, this.baseWidth / 2);
                    point(0, this.baseWidth);
                    point(height, this.baseWidth / 2);
                    break;
            }
            svgr.attr(this.component, "points", print(this.points));
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }
    }
    Hexagon.height = width=> Sqrt2 * width;

    class Text extends Shape {

        constructor(message) {
            super();
            this.component = svgr.create("text");
            this.messageText = "" + message;
            this.x = 0;
            this.y = 0;
            this.fontName = "arial";
            this.fontSize = 12;
            this.lineSpacing = 24;
            this.anchorText = "middle";
            //this.fillColor = [true];
            this.lines = [];
            this._draw();
        }

        message(message) {
            this.messageText = "" + message;
            this._draw();
            return this;
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        font(fontName, fontSize, lineSpacing) {
            this.fontName = fontName;
            this.fontSize = fontSize;
            this.lineSpacing = lineSpacing || fontSize * 2;
            this._draw();
            return this;
        }

        anchor(anchorText) {
            this.anchorText = anchorText;
            this._draw();
            return this;
        }

        _draw() {
            for (var l = 0; l < this.lines.length; l++) {
                svgr.remove(this.component, this.lines[l]);
            }
            this.lines = [];
            var lines = this.messageText.split("\n");

            svgr.attr(this.component, "x", this.x);
            svgr.attr(this.component, "y", this.y - (lines.length - 1) / 2 * this.lineSpacing);
            svgr.attr(this.component, "text-anchor", this.anchorText);
            svgr.attr(this.component, "font-family", this.fontName);
            svgr.attr(this.component, "font-size", this.fontSize);
            svgr.text(this.component, lines[0]);
            for (l = 1; l < lines.length; l++) {
                var line = svgr.create("tspan");
                svgr.attr(line, "x", this.x);
                svgr.attr(line, "y", this.y - (lines.length - l - 1) / 2 * this.lineSpacing);
                svgr.text(line, lines[l]);
                this.lines[l - 1] = line;
                svgr.add(this.component, line);
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            let local = this.localPoint(x, y);
            let box = svgr.boundingRect(this.component);
            switch(this.anchorText) {
                case "middle":
                    return (local.x>=-box.width/2 && local.x<=box.width/2 && local.y>=-box.height/2 && local.y<=box.height/2);
                case "start":
                    return (local.x>=0 && local.x<=box.width && local.y>=-box.height/2 && local.y<=box.height/2);
                case "end":
                    return (local.x>=-box.width && local.x<=0 && local.y>=-box.height/2 && local.y<=box.height/2);
            }
        }

        getTarget(x, y) {
            if (!this._opacity || this._opacity > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }
    }

    class Line extends Shape {

        constructor(x1, y1, x2, y2) {
            super();
            this.component = svgr.create("line");
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this._draw();
        }

        start(x1, y1) {
            this.x1 = x1;
            this.y1 = y1;
            this._draw();
            return this;
        }

        end(x2, y2) {
            this.x2 = x2;
            this.y2 = y2;
            this._draw();
            return this;
        }

        _draw() {
            svgr.attr(this.component, "x1", this.x1);
            svgr.attr(this.component, "y1", this.y1);
            svgr.attr(this.component, "x2", this.x2);
            svgr.attr(this.component, "y2", this.y2);
        }

        prepareAnimator(animator) {
            Shape.prototype.prepareAnimator.call(this, animator);
            animator.move = (sx1, sy1, sx2, sy2, ex1, ey1, ex2, ey2)=> {
                animator.process([sx1, sy1, sx2, sy2], [ex1, ey1, ex2, ey2], coords=>
                        this.start(coords[0], coords[1]).end(coords[3], coords[4]));
                return animator;
            };
            animator.moveTo = (ex1, ey1, ex2, ey2)=> {
                animator.process([self.x1, self.y1, self.x2, self.y2], [ex1, ey1, ex2, ey2], coords=>
                        this.start(coords[0], coords[1]).end(coords[3], coords[4]));
                return animator;
            };
            animator.start = (sx1, sy1, ex1, ey1)=> {
                animator.process([sx1, sy1], [ex1, ey1], coords=>this.start(coords[0], coords[1]));
                return animator;
            };
            animator.startTo = (ex1, ey1)=> {
                animator.process([self.x1, self.y1], [ex1, ey1], coords=> this.start(coords[0], coords[1]));
                return animator;
            };
            animator.end = (sx1, sy1, ex1, ey1)=> {
                animator.process([sx1, sy1], [ex1, ey1], coords=> this.end(coords[0], coords[1]));
                return animator;
            };
            animator.endTo = (ex1, ey1)=> {
                animator.process([self.x2, self.y2], [ex1, ey1], coords=> this.end(coords[0], coords[1]));
                return animator;
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent.globalPoint(point);
        }

        localPoint(...args) {
            var point = getPoint(args);
            return this.parent.localPoint(point);
        }

        inside(x, y) {
            let local = this.localPoint(x, y);
            let dist = distanceToSegment(local, {x: this.x1, y: this.y1}, {x: this.x2, y: this.y2});
            return dist < (this.strokeWidth || 2) / 2;

            function distanceToSegment(p, s1, s2) {
                return Math.sqrt(distanceToSegmentSquared(p, s1, s2));

                function squareDistance(p1, p2) {
                    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
                }

                function distanceToSegmentSquared(p, s1, s2) {
                    var l2 = squareDistance(s1, s2);
                    if (l2 == 0) return squareDistance(p, s1);
                    var t = ((p.x - s1.x) * (s2.x - s1.x) + (p.y - s1.y) * (s2.y - s1.y)) / l2;
                    if (t < 0) return squareDistance(p, s1);
                    if (t > 1) return squareDistance(p, s2);
                    return squareDistance(p, {x: s1.x + t * (s2.x - s1.x), y: s1.y + t * (s2.y - s1.y)});
                }
            }
        }

        getTarget(x, y) {
            if (!this._opacity || this._opacity > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }
    }

    class Path extends Shape {

        constructor(x, y) {
            super();
            this.component = svgr.create("path");
            if (x === undefined) {
                this.drawing = "";
                this.points = [];
            }
            else {
                this.drawing = "M " + x + "," + y + " ";
                this.points = [{x: x, y: y}];
            }
        }

        reset() {
            this.drawing = "";
            this.points = [];
            this._draw();
            return this;
        }

        bezier(cx, cy, x1, y1) {
            this.drawing += "Q " + cx + "," + cy + " " + x1 + "," + y1 + " ";
            this.points.push({x: cx, y: cy}, {x: x1, y: y1});
            this._draw();
            return this;
        }

        cubic(cx1, cy1, cx2, cy2, x1, y1) {
            this.drawing += "C " + cx1 + "," + cy1 + " " + cx2 + "," + cy2 + " " + x1 + "," + y1 + " ";
            this.points.push({x: cx1, y: cy1}, {x: cx2, y: cy2}, {x: x1, y: y1});
            this._draw();
            return this;
        }

        line(x, y) {
            this.drawing += "L " + x + "," + y + " ";
            this.points.push({x: x, y: y});
            this._draw();
            return this;
        }

        move(x, y) {
            this.drawing += "M " + x + "," + y + " ";
            this.points.push({x: x, y: y});
            this._draw();
            return this;
        }

        _draw() {
            svgr.attr(this.component, "d", this.drawing);
        }

        globalPoint(...args) {
            let point = getPoint(args);
            return this.parent.globalPoint(point);
        }

        localPoint(...args) {
            let point = getPoint(args);
            return this.parent.localPoint(point);
        };

        inside(x, y) {
            let local = this.localPoint(x, y);
            return insidePolygon(local.x, local.y, this.points);
        }
    }

    class Image extends Shape {

        constructor(url) {
            super();
            this.component = svgr.create("image");
            this.src = url;
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this._draw();
        }

        url(url) {
            this.src = url;
            this._draw();
            return this;
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this._draw();
            return this;
        }

        _draw() {
            svgr.attr(this.component, "x", (this.x - this.width / 2));
            svgr.attr(this.component, "y", (this.y - this.height / 2));
            svgr.attr(this.component, "width", this.width);
            svgr.attr(this.component, "height", this.height);
            svgr.attrXlink(this.component, "href", this.src);
        }

        globalPoint(...args) {
            let point = getPoint(args);
            return this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y});
        }

        localPoint(...args) {
            let point = getPoint(args);
            point = this.parent.localPoint(point);
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return local.x >= -this.width / 2 && local.x <= this.width / 2
                && local.y >= -this.height / 2 && local.y <= this.height / 2;
        }

        getTarget(x, y) {
            if (!this._opacity || this._opacity > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }
    }

    class Animator {

        constructor(handler) {
            this.handler = handler;
            this.handler.prepareAnimator(this);
        }

        smoothy(speed, step) {
            this.mode = "smooth";
            this.speed = speed;
            this.step = step;
            return this;
        }

        steppy(speed, stepCount) {
            this.mode = "step";
            this.speed = speed;
            this.stepCount = stepCount;
            return this;
        }

        onChannel(channelInfo) {
            this.channel = channelInfo && channelInfo instanceof Channel ? channelInfo : onChannel(channelInfo);
            return this;
        }

        process(source, target, setter) {
            let channel = this.channel || onChannel(null);
            let executor = {
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
        }

        execute(processing) {
            this.processing = processing;
            return this;
        }

    }

    var smoothy = function(executor, speed, step, channel) {
        let delta = [];
        let sum = 0;
        for (var k=0; k<executor.source.length; k++) {
            delta[k] = executor.target[k] - executor.source[k];
            sum += delta[k]*delta[k];
        }
        var stepCount = Math.sqrt(sum) / step;
        steppy(executor, speed, stepCount, channel);
    };

    var steppy = function(executor, speed, stepCount, channel) {
        channel.play(speed, stepCount,
            i=> {
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
            ()=> {
                executor.setter(executor.target);
                if (executor.processing) {
                    executor.processing(1);
                }
            }
        );
    };

    var channels = {};

    function animate(...args) {
        onChannel(null).animate.apply(onChannel(null), args);
    }

    function onChannel(channelInfo) {
        var channel = channelInfo instanceof Channel ? null : channels[channelInfo];
        if (!channel) {
            channel = new Channel(svgr.now());
            if (channelInfo!==undefined) {
                channels[channelInfo] = channel;
            }
        }
        return channel;
    }

    class Channel {
        constructor(time) {
            this.time = time;
        }

        animate(delay, todo, ...args) {
            var now = svgr.now();
            if (now>this.time) {
                this.time = now;
            }
            this.time += delay;
            let last = ()=> {
                if (args.length == 0) {
                    todo();
                }
                else {
                    var who = args.shift();
                    todo.apply(who, args);
                }
            };
            svgr.timeout(last, this.time-now);
        }

        play(delay, stepCounts, animator, terminator) {
            for (let i=0; i<stepCounts; i++) {
                let time = i;
                this.animate(delay, ()=>animator(time));
            }
            this.animate(1, ()=> terminator());
        }

    }

    function request(url, data) {
        var http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        http.send(JSON.stringify(data));
        var result = {
            onSuccess(successFunction) {
                result.success = successFunction;
                return result;
            },
            onFailure(failureFunction) {
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
    function addGlobalEvent(eventName, handler) {
        svgr.addGlobalEvent(eventName, handler);
    }
    function removeEvent(component, eventName, handler) {
        svgr.removeEvent(component.component, eventName, handler);
    }
    function removeGlobalEvent(eventName, handler) {
        svgr.removeGlobalEvent(eventName, handler);
    }
    function event(component, eventName, event) {
        svgr.event(component.component, eventName, event);
    }
    function screenSize(width, height){
        return svgr.screenSize(width, height);
    }

    return {
        Screen : Screen,
        Block : Block,
        TextItem : TextItem,
        TextArea : TextArea,
        TextField : TextField,
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

        runtime: runtime,
        addEvent : addEvent,
        removeEvent : removeEvent,
        addGlobalEvent : addGlobalEvent,
        removeGlobalEvent : removeGlobalEvent,
        event : event,
        screenSize: screenSize,
        random : random,
        timeout : timeout,
        interval : interval,
        clearTimeout : clearTimeout,
        clearInterval : clearInterval,
        request: request,
    }
};


