'use strict'
/**
 * Created by HDA3014 on 07/01/2016.
 */
console.log("SVGHandler loaded...");

exports.SVG = function(runtime) {
    var svgr = runtime;

    function print(points) {
        if (points.length==0) return "";
        var line = points[0].x+","+points[0].y;
        for (var i=1; i<points.length; i++) {
            line += " "+points[i].x+","+points[i].y;
        }
        return line;
    }

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

    function distanceToEllipse(p, c, rx, ry) {
        let x = p.x - c.x;
        let y = p.y - c.y;
        let d1 = ry*x*ry*x;
        let d2 = rx*y*rx*y;
        let d3 = rx*rx*ry*ry;
        let r1 = Math.sqrt(d1+d2)-Math.sqrt(d3);
        let r2 = Math.sqrt(r1);
        return r2;
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

    function intersectLineLine(a1, a2, b1, b2) {
        let uat = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        let ubt = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        let ubd = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if (ub != 0) {
            var ua = uat / ubd;
            var ub = ubt / ubd;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                return { x:a1.x + ua * (a2.x - a1.x), y:a1.y + ua * (a2.y - a1.y)};
            }
        }
        return null;
    }

    function intersectLinePolygon(a1, a2, points) {
        var result = [];
        var length = points.length;

        for ( var i = 0; i < points.length; i++ ) {
            var b1 = points[i];
            var b2 = points[(i+1) % points.length];
            var inter = intersectLineLine(a1, a2, b1, b2);
            inter && result.push(inter);
        }
        return result;
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

    class Element {

        constructor() {}

        mark(id) {
            this.id = id;
            this.component && svgr.mark(this.component, id);
            return this;
        }

        onResize(handler) {
            this.resizeHandler = handler;
            return this;
        }

        onMove(handler) {
            this.moveHandler = handler;
            return this;
        }

        onReshape(handler) {
            this.reshapeHandler = handler;
            return this;
        }

        globalAngle() {
            return this.parent ? this.parent.globalAngle() : 0;
        }

        globalScale() {
            return this.parent ? this.parent.globalScale() : 1;
        }
    }

    class SvgElement extends Element {

        constructor() {
            super();
            this._active = true;
        }

        active(flag = true) {
            this._active = flag;
            return this;
        }

        opacity(opacity) {
            this._opacity = opacity;
            svgr.attr(this.component, "opacity", opacity);
            return this;
        }

        duplicate(shape) {
            shape.opacity(this._opacity);
            return shape;
        }

        prepareColorAnimation(animator) {
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
                return animator.color(this.fillColor, efillColor, this.strokeWidth, estroke, this.strokeColor, estrokeColor);
            };
        }

        prepareOpacityAnimation(animator) {
            animator.opacity = (sfactor, efactor)=> {
                animator.process([sfactor], [efactor],
                    factor=> this.opacity(factor[0]));
                return animator;
            };

            animator.opacityTo = efactor=> {
                animator.process([this._opacity], [efactor], factor=> this.opacity(factor[0]));
                return animator;
            }
        }

        prepareResizeAnimation(animator) {
            animator.resize = (swidth, sheight, ewidth, eheight)=> {
                animator.process([swidth, sheight], [ewidth, eheight], coords=> this.dimension(coords[0], coords[1]));
                return animator;
            };
            animator.resizeTo = (ewidth, eheight)=> {
                animator.process([this.width, this.height], [ewidth, eheight], coords=>
                    this.dimension(coords[0], coords[1]));
                return animator;
            }
        }

        preparePositionAnimation(animator) {
            animator.move = (sx, sy, ex, ey)=> {
                animator.process([sx, sy], [ex, ey], coords=> this.position(coords[0], coords[1]));
                return animator;
            };
            animator.moveTo = (ex, ey)=> {
                animator.process([this.x, this.y], [ex, ey], coords=>
                    this.position(coords[0], coords[1]));
                return animator;
            }
        }

        prepareMoveAnimation(animator) {
            animator.move = (sx, sy, ex, ey)=> {
                animator.process([sx, sy], [ex, ey], coords => this.move(coords[0], coords[1]));
                return animator;
            };
            animator.moveTo = (ex, ey)=> {
                animator.process([this.x, this.y], [ex, ey], coords => this.move(coords[0], coords[1]));
                return animator;
            }
        }

        prepareRotateAnimation(animator) {
            animator.rotate = (sangle, eangle)=> {
                animator.process([sangle], [eangle], angle => this.rotate(angle[0]));
                return animator;
            };
            animator.rotateTo = eangle=> {
                animator.process([this.angle], [eangle], angle=> this.rotate(angle[0]));
                return animator;
            }
        }

        prepareScalingAnimation(animator) {
            animator.scale = (sfactor, efactor)=> {
                animator.process([sfactor], [efactor], factor=> this.scale(factor[0]));
                return animator;
            };
            animator.scaleTo = efactor => {
                animator.process([this.factor], [efactor], factor=> this.scale(factor[0]));
                return animator;
            }
        }

        prepareLineAnimation(animator) {
            animator.move = (sx1, sy1, sx2, sy2, ex1, ey1, ex2, ey2)=> {
                animator.process([sx1, sy1, sx2, sy2], [ex1, ey1, ex2, ey2], coords=>
                    this.start(coords[0], coords[1]).end(coords[2], coords[3]));
                return animator;
            };
            animator.moveTo = (ex1, ey1, ex2, ey2)=> {
                animator.process([this.x1, this.y1, this.x2, this.y2], [ex1, ey1, ex2, ey2], coords=>
                    this.start(coords[0], coords[1]).end(coords[2], coords[3]));
                return animator;
            };
            animator.start = (sx1, sy1, ex1, ey1)=> {
                animator.process([sx1, sy1], [ex1, ey1], coords=>this.start(coords[0], coords[1]));
                return animator;
            };
            animator.startTo = (ex1, ey1)=> {
                animator.process([this.x1, this.y1], [ex1, ey1], coords=> this.start(coords[0], coords[1]));
                return animator;
            };
            animator.end = (sx1, sy1, ex1, ey1)=> {
                animator.process([sx1, sy1], [ex1, ey1], coords=> this.end(coords[0], coords[1]));
                return animator;
            };
            animator.endTo = (ex1, ey1)=> {
                animator.process([this.x2, this.y2], [ex1, ey1], coords=> this.end(coords[0], coords[1]));
                return animator;
            }
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
            if (handler) {
                svgr.addEvent(this.component, "click", handler);
            }
            else {
                svgr.removeEvent(this.component, "click");
            }

            return this;
        }

        onRightClick(handler) {
            if (handler) {
                svgr.addEvent(this.component, "contextmenu", handler);
            }
            else {
                svgr.removeEvent(this.component, "contextmenu");
            }
            return this;
        }

        onMouseDown(handler) {
            if (handler) {
                svgr.addEvent(this.component, "mousedown", handler);
            }
            else {
                svgr.removeEvent(this.component, "mousedown");
            }
            return this;
        }

        onMouseMove(handler) {
            if (handler) {
                svgr.addEvent(this.component, "mousemove", handler);
            }
            else {
                svgr.removeEvent(this.component, "mousemove");
            }
            return this;
        }

        onMouseUp(handler) {
            if (handler) {
                svgr.addEvent(this.component, "mouseup", handler);
            }
            else {
                svgr.removeEvent(this.component, "mouseup");
            }
            return this;
        }

        onMouseEnter(handler) {
            if (handler) {
                svgr.addEvent(this.component, "mouseenter", handler);
            }
            else {
                svgr.removeEvent(this.component, "mouseenter");
            }
            return this;
        }

        onMouseOut(handler) {
            if (handler) {
                svgr.addEvent(this.component, "mouseout", handler);
            }
            else {
                svgr.removeEvent(this.component, "mouseout");
            }
            return this;
        }

        onMouseWheel(handler) {
            if (handler) {
                svgr.addEvent(this.component, "wheel", handler);
            }
            else {
                svgr.removeEvent(this.component, "wheel");
            }
            return this;
        }

    }

    class DomElement extends Element {

        constructor() {
            super()
        }

    }

    class Screen extends DomElement {
        constructor(width, height){
            super();
            this.component = svgr.createDOM("div", this);
            this.children = [];
            this.dimension(width, height);
        }

        add(domObject) {
            var index = this.children.indexOf(domObject);
            if (index === -1) {
                svgr.add(this.component, domObject.component);
                domObject.parent = this;
                this.children.push(domObject);
                domObject._draw && domObject._draw();
            }
            return this;
        }

        remove(domObject) {
            var index = this.children.indexOf(domObject);
            if (index > -1) {
                svgr.remove(this.component, domObject.component);
                domObject.parent = null;
                this.children.splice(index, 1);
            }
            return this;
        }

        getDelta() {
            return {x:0, y:0};
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
            style += "position:absolute;";
            svgr.attr(this.component, "style", style);
            this.children.forEach(child=>child._draw && child._draw());
        }

        globalPoint(...args) {
            return getPoint(args);
        }

        localPoint(...args) {
            return getPoint(args);
        }

        duplicate() {
            let clone = new Screen(this.width, this.height);
            this.children.forEach(child=>clone.add(child.duplicate()));
            return clone;
        }
    }

    class Block extends DomElement{

        constructor(width, height){
            super();
            this.component = svgr.createDOM("div", this);
            this.move(0, 0);
            this.dimension(width, height);
            this.children = [];
        }

        add(domObject) {
            svgr.add(this.component, domObject.component);
            domObject.parent = this;
            this.children.push(domObject);
            domObject._draw && domObject._draw();
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
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height){
            this.width = width;
            this.height = height;
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height});
            return this;
        }

        getDelta() {
            let delta = this.parent ? this.parent.getDelta() : {x:0, y:0};
            return {x:this.x-this.width/2+delta.x, y:this.y-this.height/2+delta.y}
        }

        _draw(style=""){
            if (this.parent) {
                let delta = this.parent.getDelta();
                style += "position:absolute;";
                style += "left:" + Math.round(this.x - this.width / 2 - delta.x) + "px;";
                style += "top:" + Math.round(this.y - this.height / 2 - delta.y) + "px;";
                style += "width:" + this.width + "px;";
                style += "height:" + this.height + "px;";
                svgr.attr(this.component, "style", style);
                this.children.forEach(child=>child._draw && child._draw());
            }
        }

        duplicate() {
            let clone = new Block(this.width, this.height).move(this.x, this.y);
            this.children.forEach(child=>clone.add(child.duplicate()));
            return clone;
        }
    }

    class Clip extends Block {

        constructor(drawing) {
            super(0, 0);
            let scale = drawing.globalScale();
            let globalWidth = scale*drawing.width;
            let globalHeight = scale*drawing.height;
            let global = drawing.globalPoint(globalWidth/2, globalHeight/2);
            this.move(global.x, global.y);
            this.dimension(globalWidth, globalHeight);
        }

        _draw(){
            super._draw("overflow:hidden;pointer-events:none;border:none;");
        }
    }

    class TextItem extends DomElement {

        init(x, y, width, height, component, messageText){
            this.component = component;
            this.anchorText = TextItem.CENTER;
            this.fontName = "arial";
            this.fontSize = 12;
            this._fontColor = [0, 0, 0];
            this._decoration = "none";
            this.dimension(width, height);
            this.position(x, y);
            this.messageText = messageText;
            this.placeHolderText = "";
            svgr.addEvent(component, "input", ()=>{
                this.messageText = svgr.value(component);
                for (let handler of this.onInputListeners) {
                    handler(this.messageText);
                }
            });
            svgr.addEvent(component, "keydown", (event)=>{
                event.processed  = true;
            });
            this.onInputListeners = [];
        }

        onInput(handler) {
            this.onInputListeners.add(handler);
            return this;
        }

        focus() {
            svgr.focus(this.component);
            return this;
        }

        select() {
            svgr.select(this.component);
            return this;
        }

        dimension(width, height) {
            if (this.width!==width || this.height!==height) {
                this.width = width;
                this.height = height;
                svgr.attr(this.component, "width", width);
                svgr.attr(this.component, "height", height);
                this._draw();
                this.resizeHandler && this.resizeHandler({width: width, height: height});
            }
            return this;
        }

        position(x, y) {
            if (this.x!==x || this.y!==y) {
                this.x = x;
                this.y = y;
                svgr.attr(this.component, "x", x);
                svgr.attr(this.component, "y", y);
                this._draw();
                this.moveHandler && this.moveHandler({x: x, y: y});
            }
            return this;
        }

        anchor(anchorText) {
            this.anchorText = anchorText;
            this._draw();
            return this;
        }

        font(fontName, fontSize, lineSpacing) {
            if (this.fontName !== fontName || this.fontSize !== fontSize
                || this.lineSpacing !== lineSpacing) {
                this.fontName = fontName;
                this.fontSize = fontSize;
                this.lineSpacing = lineSpacing;
                this._draw();
            }
            return this;
        }

        fontColor(fontColor) {
            this._fontColor = fontColor;
            this._draw();
            return this;
        }

        decoration(decoration) {
            if (this._decoration!==decoration) {
                this._decoration = decoration;
                this._draw();
            }
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
            if (this.parent) {
                let delta = this.parent.getDelta();
                style += "left:" + ((this.x || 0)-delta.x) + "px;";
                style += "top:" + ((this.y || 0)-delta.y) + "px;";
                style += "width:" + (this.width || 0) + "px;";
                style += "height:" + (this.height || 0) + "px;";
                style += "text-decoration:" + (this._decoration || "none")+";";
                style += "text-align:" + (this.anchorText || TextItem.CENTER) + ";";
                style += "font-family:" + (this.fontName || "Arial") + ";";
                style += "font-size:" + (this.fontSize || 20) + "px;";
                if (this.lineSpacing) {
                    style += "line-height:" + this.lineSpacing + "px;";
                }
                style += "background-color:" + ((this.fillColor && this.fillColor.length) ?
                    "rgb(" + this.fillColor.join(",") + ");" : "transparent;");
                style += "border:" + (this.strokeWidth || 0) + "px solid " + ((this.strokeColor && this.strokeColor.length) ?
                    "rgb(" + this.strokeColor.join(",") + ");" : "transparent;");
                style += "margin:" + -(this.strokeWidth || 0) + "px;";
                style += "outline:none;pointer-events:initial;";
                style += "color:" + ((this._fontColor && this._fontColor.length) ?
                    "rgb(" + this._fontColor.join(",") + ");" : "transparent;");
                svgr.attr(this.component, "style", style);
                svgr.value(this.component, this.messageText || '');
                svgr.attr(this.component, "placeholder", this.placeHolderText || '');
            }
        }

        duplicate(item) {
            return item.anchor(this.anchorText)
                .font(this.fontName, this.fontSize, this.lineSpacing)
                .fontColor(this._fontColor)
                .color(this.fillColor, this.strokeWidth, this.strokeColor)
                .decoration(this._decoration)
                .message(this.messageText)
                .placeHolder(this.placeHolderText);
        }

    }

    TextItem.CENTER = "center";
    TextItem.LEFT = "left";
    TextItem.RIGHT = "right";


    class TextArea extends TextItem {

        constructor(x, y, width, height, message=""){
            super();
            this.init(x, y, width, height, svgr.createDOM("textarea", this), message);
            this.scroll(TextArea.CLIPPED);
            svgr.addEvent(this.component, "keydown", (event)=>{
                event.processed  = true;
                if (event.keyCode===13) {
                    let maxLineCount = Math.floor(this.height/this.lineSpacing);
                    if (this.messageText.split("\n").length>=maxLineCount) {
                        svgr.preventDefault(event);
                    }
                }
            });
        }

        scroll(mode){
            this.mode = mode;
            this._draw();
            return this;
        }

        _draw(){
            var style = "overflow:" + (this.mode || TextArea.CLIPPED) +";";
            style += "resize:none;";
            style += "position:absolute;";
            super._draw(style);
        }

        duplicate() {
            return super.duplicate(new TextArea(this.x, this.y, this.width, this.height))
                .scroll(this.mode);
        }

    }

    TextArea.SCROLL = "auto";
    TextArea.CLIPPED = "hidden";
    TextArea.SHOW_ALL = "visible";

    class TextField extends TextItem {

        constructor(x, y, width, height, message=""){
            super();
            this.init(x, y, width, height, svgr.createDOM("input", this), message);
            this.type(TextField.TEXT);
        }

        type(inputType){
            this.inputType = inputType;
            this._draw();
        }

        _draw(){
            svgr.attr(this.component, "type", this.inputType);
            let style = "position:absolute;";
            super._draw(style);
        }

        duplicate() {
            return super.duplicate(new TextField(this.x, this.y, this.width, this.height));
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
            this.component = svgr.create("svg", this);
            svgr.attrNS(this.component, 'xlink', 'http://www.w3.org/1999/xlink');
            this.dimension(width, height);
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            svgr.attr(this.component, "width", width);
            svgr.attr(this.component, "height", height);
            this.resizeHandler && this.resizeHandler({width:width, height:height});
            return this;
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            svgr.attr(this.component, "x", x);
            svgr.attr(this.component, "y", y);
            this.moveHandler && this.moveHandler({x:x, y:y});
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

        prepareAnimator(animator) {
            this.prepareResizeAnimation(animator);
            this.preparePositionAnimation(animator);
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

        boundingRect() {
            return svgr.boundingRect(this.component);
        }

        duplicate() {
            let clone = new Drawing(this.width, this.height).move(this.x, this.y).active(this._active);
            this.children.forEach(child=>clone.add(child.duplicate()));
            return clone;
        }
    }

    class Handler extends SvgElement {

        constructor() {
            super();
            this.children = [];
            this.component = svgr.create("g", this);
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

        color(fillColor, stroke, strokeColor) {
            this.accept(new Visitor("color", fillColor, stroke, strokeColor));
            return this;
        }

        prepareAnimator(animator) {
            this.prepareOpacityAnimation(animator);
        }

        getTarget(x, y) {
            if (this._active && (this._opacity===undefined || this._opacity > 0)) {
                for (var i = this.children.length - 1; i >= 0; i--) {
                    if (!this.children[i].dummy) {
                        var target = this.children[i].getTarget(x, y);
                        if (target) {
                            return target;
                        }
                    }
                }
            }
            return null;
        }

        duplicate(clone) {
            clone.active(this._active);
            this.children.forEach(child=>clone.add(child.duplicate()));
            return clone;
        }

    }

    class Ordered extends Handler {

        constructor(layerCount) {
            super();
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

        duplicate() {
            let clone = new Ordered(this.children.length);
            clone.active(this._active);
            for (let layer=0; layer<this.children.length; layer++) {
                if (!this.get(layer).dummy) {
                    clone.set(layer, this.get(layer).duplicate());
                }
            }
            return clone;
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
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        };

        prepareAnimator(animator) {
            super.prepareAnimator(animator);
            this.prepareMoveAnimation(animator);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            point = {x: point.x + this.x, y: point.y + this.y};
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        duplicate() {
            let clone = super.duplicate(new Translation(this.x, this.y));
            return clone;
        }
    }

    class Rotation extends Handler {
        constructor(angle=0) {
            super();
            this.rotate(angle || 0);
        }

        rotate(angle) {
            this.angle = angle;
            svgr.attr(this.component, "transform", "rotate(" + angle + ")");
            this.reshapeHandler && this.reshapeHandler(angle);
            return this;
        }

        globalAngle() {
            return this.parent ? this.parent.globalAngle()+this.angle : this.angle;
        }

        prepareAnimator(animator) {
            super.prepareAnimator(animator);
            this.prepareRotateAnimation(animator);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            point = rotate(point.x, point.y, this.angle);
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? rotate(point.x, point.y, -this.angle) : null;
        }

        duplicate() {
            let clone = super.duplicate(new Rotation(this.angle));
            return clone;
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
            this.reshapeHandler && this.reshapeHandler(factor);
            return this;
        }

        globalScale() {
            return this.parent ? this.parent.globalScale()*this.factor : this.factor;
        }

        prepareAnimator(animator) {
            super.prepareAnimator(animator);
            this.prepareScalingAnimation(animator);
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
            return point ? {
                    x: point.x / this.factor,
                    y: point.y / this.factor
                } : null;
        }

        duplicate() {
            let clone = super.duplicate(new Scaling(this.factor));
            return clone;
        }
    }

    class Shape extends SvgElement {

        constructor() {
            super();
        }

        accept(visitor) {
            visitor.visit(this);
            return this;
        }

        onReorient(handler) {
            this.reorientHandler = handler;
            return this;
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

        dash(dashPattern) {
            this.dashPattern = dashPattern;
            svgr.attr(this.component, "stroke-dasharray", this.dashPattern);
            return this;
        }

        fillOpacity(opacity) {
            this._fillopacity = opacity;
            svgr.attr(this.component, "fill-opacity", opacity);
            return this;
        }

        duplicate(shape) {
            shape.color(this.fillColor, this.strokeWidth, this.strokeColor)
                .dash(this.dashPattern)
                .fillOpacity(this._fillopacity);
            super.duplicate(shape);
            return shape;
        }

        prepareAnimator(animator) {
            this.prepareColorAnimation(animator);
            this.prepareOpacityAnimation(animator);
        }

        getTarget(x, y) {
            if ((this._opacity===undefined || this._opacity > 0) && this.fillColor && this.fillColor.length > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }

        boundingRect() {
            return svgr.boundingRect(this.component);
        }

    }

    class Rect extends Shape {

        constructor(width=0, height=0) {
            super();
            this.component = svgr.create("rect", this);
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;
            this._draw();
        }

        prepareAnimator(animator) {
            super.prepareAnimator(animator);
            this.preparePositionAnimation(animator);
            this.prepareResizeAnimation(animator);
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height});
            return this;
        }

        corners(radiusX, radiusY) {
            this.rx = radiusX;
            this.ry = radiusY;
            this._draw();
            return this;
        }

        _draw() {
            svgr.attr(this.component, "x", (this.x - this.width / 2));
            svgr.attr(this.component, "y", (this.y - this.height / 2));
            svgr.attr(this.component, "width", this.width);
            svgr.attr(this.component, "height", this.height);
            if (this.rx) {
                svgr.attr(this.component, "rx", this.rx);
                svgr.attr(this.component, "ry", this.ry);
            }
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent ?
                this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}):
                null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return local.x >= -this.width / 2 && local.x <= this.width / 2
                && local.y >= -this.height / 2 && local.y <= this.height / 2;
        }

        duplicate() {
            let clone = super.duplicate(
                new Rect(this.width, this.height)
                .position(this.x, this.y)
                .corners(this.rx, this.ry));
            return clone;
        }
    }

    class Circle extends Shape {

        constructor(radius=0) {
            super();
            this.component = svgr.create("circle", this);
            this.x = 0;
            this.y = 0;
            this.r = radius;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        radius(radius) {
            this.r = radius;
            this._draw();
            this.resizeHandler && this.resizeHandler(radius);
            return this;
        }

        _draw() {
            svgr.attr(this.component, "cx", this.x);
            svgr.attr(this.component, "cy", this.y);
            svgr.attr(this.component, "r", this.r);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            var dist = local.x * local.x + local.y * local.y;
            return dist <= this.r * this.r;
        }

        duplicate() {
            let clone = super.duplicate(
                new Circle(this.r).position(this.x, this.y));
            return clone;
        }
    }

    class Ellipse extends Shape {
        constructor(radiusX=0, radiusY=0) {
            super();
            this.component = svgr.create("ellipse", this);
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
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        radius(radiusX, radiusY) {
            this.rx = radiusX;
            this.ry = radiusY;
            this._draw();
            this.resizeHandler && this.resizeHandler({radiusX:radiusX, radiusY:radiusY});
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
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            var dx = local.x / this.rx;
            var dy = local.y / this.ry;
            return dx * dx + dy * dy <= 1;
        }

        duplicate() {
            let clone = super.duplicate(new Ellipse(this.rx, this.ry)
                .position(this.x, this.y)
                .radius(this.rx, this.ry));
            return clone;
        }
    }

    class Triangle extends Shape {

        constructor(width=0, height=0, direction="N") {
            super();
            this.component = svgr.create("polygon", this);
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
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height});
            return this;
        }

        direction(direction) {
            this.dir = direction;
            this._draw();
            this.reorientHandler && this.reorientHandler(direction);
            return this;
        }

        _draw() {
            switch (this.dir) {
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
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new Triangle(this.width, this.height, this.dir)
                .position(this.x, this.y));
            return clone;
        }
    }

    class CurvedShield extends Shape {

        constructor(width, height, headRatio, direction) {
            super();
            this.component = svgr.create("path", this);
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
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height, headRatio) {
            this.width = width;
            this.height = height;
            this.headRatio = headRatio;
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height, headRatio:headRatio});
            return this;
        }

        direction(direction) {
            this.dir = direction;
            this._draw();
            this.reorientHandler && this.reorientHandler(direction);
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
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new CurvedShield(this.width, this.height, this.headRatio, this.dir)
                .position(this.x, this.y));
            return clone;
        }
    }

    class Polygon extends Shape {

        constructor(x=0, y=0) {
            super();
            this.component = svgr.create("polygon", this);
            this.x = x;
            this.y = y;
            this.points = [];
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        trace(dx, dy) {
            var lastPoint = this.points[this.points.length - 1];
            this.points.push({x: lastPoint.x + dx, y: lastPoint.y + dy});
            this.reshapeHandler && this.reshapeHandler([...this.points]);
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
            this.reshapeHandler && this.reshapeHandler([...this.points]);
            return this;
        }

        remove(index) {
            this.points.splice(index, 1);
            this._draw();
            this.reshapeHandler && this.reshapeHandler([...this.points]);
            return this;
        }

        clear() {
            this.points = [];
            this._draw();
            this.reshapeHandler && this.reshapeHandler([...this.points]);
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
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            var point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x, local.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new Polygon(this.x, this.y));
            clone.points = this.points.slice(0);
            clone._draw();
            return clone;
        }
    }

    class Arrow extends Shape {

        constructor(baseWidth, headWidth, headHeight) {
            super();
            this.component = svgr.create("polygon", this);
            this.baseWidth = baseWidth;
            this.headWidth = headWidth;
            this.headHeight = headHeight;
        }

        shape(baseWidth, headWidth, headHeight) {
            this.baseWidth = baseWidth;
            this.headWidth = headWidth;
            this.headHeight = headHeight;
            this._draw();
            this.reshapeHandler && this.reshapeHandler(
                {baseWidth:baseWidth, headWidth:headWidth, headHeight:headHeight});
            return this;
        }

        position(bx, by, hx, hy) {
            this.bx = bx;
            this.by = by;
            this.hx = hx;
            this.hy = hy;
            this._draw();
            this.moveHandler && this.moveHandler({bx:bx, by:by, hx:hx, hy:hy});
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
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.localPoint(point) : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x, local.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new Arrow(this.baseWidth, this.headWidth, this.headHeight, this.headRatio)
                .position(this.bx, this.by, this.hx, this.hy));
            return clone;
        }
    }

    const Sqrt2 = Math.sqrt(3)/2;

    class Hexagon extends Shape {
        constructor(baseWidth, direction) {
            super();
            this.component = svgr.create("polygon", this);
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
            this.moveHandler && this.moveHandler({x:x+this.x, y:y+this.y});
            return this;
        }

        dimension(baseWidth) {
            this.baseWidth = baseWidth;
            this._draw();
            this.resizeHandler && this.resizeHandler(baseWidth);
            return this;
        }

        direction(direction) {
            this.dir = direction;
            this._draw();
            this.reorientHandler && this.reorientHandler(direction);
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
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new Hexagon(this.baseWidth, this.dir)
                .position(this.x, this.y));
            return clone;
        }

    }
    Hexagon.height = width=> Sqrt2 * width;

    class Chevron extends Shape {

        constructor(width, height, thickness, direction) {
            super();
            this.component = svgr.create("path", this);
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;
            this.thickness = thickness;
            this.dir = direction;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height, thickness) {
            this.width = width;
            this.height = height;
            this.thickness = thickness;
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height, thickness:thickness});
            return this;
        }

        direction(direction) {
            this.dir = direction;
            this._draw();
            this.reorientHandler && this.reorientHandler(direction);
            return this;
        }

        _draw() {
            let point=(x, y)=> {
                this.points.push({x:this.x+x, y:this.y+y});
                return (this.x+x)+","+(this.y+y)+" ";
            };
            this.points=[];
            switch(this.dir) {
                case "N":
                {
                    let w = this.width / 2 - this.thickness;
                    let h = this.height - this.thickness;
                    let angle = Math.atan2(w, h);
                    let deltaX = this.thickness * Math.sin(angle);
                    let deltaY = this.thickness * Math.cos(angle);
                    this.drawing = "M " + point(-w + deltaY / 2, h / 2 + deltaX / 2);
                    this.drawing += "C " + point(-w + deltaY / 2 - deltaX, h / 2 + deltaX / 2 + deltaY)
                        + point(-w - deltaY / 2 - deltaX, h / 2 - deltaX / 2 + deltaY)
                        + point(-w - deltaY / 2, h / 2 - deltaX / 2);
                    this.drawing += "L " + point(-deltaY / 2, -h / 2 - deltaX / 2);
                    this.drawing += "Q " + point(0, -h / 2 - deltaX / 2 - deltaY * deltaY / deltaX / 2)
                        + point(deltaY / 2, -h / 2 - deltaX / 2);
                    this.drawing += "L " + point(w + deltaY / 2, h / 2 - deltaX / 2);
                    this.drawing += "C " + point(w + deltaY / 2 + deltaX, h / 2 - deltaX / 2 + deltaY)
                        + point(w - deltaY / 2 + deltaX, h / 2 + deltaX / 2 + deltaY)
                        + point(w - deltaY / 2, h / 2 + deltaX / 2);
                    this.drawing += "L " + point(deltaX / 2, -h / 2 + deltaX / 2 + deltaY * deltaY / deltaX);
                    this.drawing += "Q " + point(0, -h / 2 + deltaX / 2 + deltaY * deltaY / deltaX / 2)
                        + point(-deltaY / 2, -h / 2 + deltaX / 2 + deltaY * deltaY / deltaX);
                    this.drawing += "L " + point(-w + deltaY / 2, h / 2 + deltaX / 2);
                }
                    break;
                case "E":
                {
                    let w = this.width - this.thickness;
                    let h = this.height / 2 - this.thickness;
                    let angle = Math.atan2(h, w);
                    let deltaX = this.thickness * Math.cos(angle);
                    let deltaY = this.thickness * Math.sin(angle);
                    this.drawing = "M " + point(-w / 2 - deltaY / 2, -h + deltaX / 2);
                    this.drawing += "C " + point(-w / 2 - deltaY / 2 - deltaX, -h + deltaX / 2 - deltaY)
                        + point(-w / 2 + deltaY / 2 - deltaX, -h - deltaX / 2 - deltaY)
                        + point(-w / 2 + deltaY / 2, -h - deltaX / 2);
                    this.drawing += "L " + point(w / 2 + deltaY / 2, -deltaX / 2);
                    this.drawing += "Q " + point(w / 2 + deltaY / 2 + deltaX * deltaX / deltaY / 2, 0)
                        + point(w / 2 + deltaY / 2, deltaX / 2);
                    this.drawing += "L " + point(-w / 2 + deltaY / 2, h + deltaX / 2);
                    this.drawing += "C " + point(-w / 2 + deltaY / 2 - deltaX, h + deltaX / 2 + deltaY)
                        + point(-w / 2 - deltaY / 2 - deltaX, h - deltaX / 2 + deltaY)
                        + point(-w / 2 - deltaY / 2, h - deltaX / 2);
                    this.drawing += "L " + point(w / 2 - deltaY / 2 - deltaX * deltaX / deltaY, deltaX / 2);
                    this.drawing += "Q " + point(w / 2 - deltaY / 2 - deltaX * deltaX / deltaY / 2, 0)
                        + point(w / 2 - deltaY / 2 - deltaX * deltaX / deltaY, -deltaX / 2);
                    this.drawing += "L " + point(-w / 2 - deltaY / 2, -h + deltaX / 2);
                }
                    break;
                case "S":
                {
                    let w = this.width / 2 - this.thickness;
                    let h = this.height - this.thickness;
                    let angle = Math.atan2(w, h);
                    let deltaX = this.thickness * Math.sin(angle);
                    let deltaY = this.thickness * Math.cos(angle);
                    this.drawing = "M " + point(-w + deltaY / 2, -h / 2 - deltaX / 2);
                    this.drawing += "C " + point(-w + deltaY / 2 - deltaX, -h / 2 - deltaX / 2 - deltaY)
                        + point(-w - deltaY / 2 - deltaX, -h / 2 + deltaX / 2 - deltaY)
                        + point(-w - deltaY / 2, -h / 2 + deltaX / 2);
                    this.drawing += "L " + point(-deltaY / 2, h / 2 + deltaX / 2);
                    this.drawing += "Q " + point(0, h / 2 + deltaX / 2 + deltaY * deltaY / deltaX / 2)
                        + point(deltaY / 2, h / 2 + deltaX / 2);
                    this.drawing += "L " + point(w + deltaY / 2, -h / 2 + deltaX / 2);
                    this.drawing += "C " + point(w + deltaY / 2 + deltaX, -h / 2 + deltaX / 2 - deltaY)
                        + point(w - deltaY / 2 + deltaX, -h / 2 - deltaX / 2 - deltaY)
                        + point(w - deltaY / 2, -h / 2 - deltaX / 2);
                    this.drawing += "L " + point(deltaX / 2, h / 2 - deltaX / 2 - deltaY * deltaY / deltaX);
                    this.drawing += "Q " + point(0, h / 2 - deltaX / 2 - deltaY * deltaY / deltaX / 2)
                        + point(-deltaY / 2, h / 2 - deltaX / 2 - deltaY * deltaY / deltaX);
                    this.drawing += "L " + point(-w + deltaY / 2, -h / 2 - deltaX / 2);
                }
                    break;
                case "W":
                {
                    let w = this.width - this.thickness;
                    let h = this.height / 2 - this.thickness;
                    let angle = Math.atan2(h, w);
                    let deltaX = this.thickness * Math.cos(angle);
                    let deltaY = this.thickness * Math.sin(angle);
                    this.drawing = "M " + point(w / 2 + deltaY / 2, -h + deltaX / 2);
                    this.drawing += "C " + point(w / 2 + deltaY / 2 + deltaX, -h + deltaX / 2 - deltaY)
                        + point(w / 2 - deltaY / 2 + deltaX, -h - deltaX / 2 - deltaY)
                        + point(w / 2 - deltaY / 2, -h - deltaX / 2);
                    this.drawing += "L " + point(-w / 2 - deltaY / 2, -deltaX / 2);
                    this.drawing += "Q " + point(-w / 2 - deltaY / 2 - deltaX * deltaX / deltaY / 2, 0)
                        + point(-w / 2 - deltaY / 2, deltaX / 2);
                    this.drawing += "L " + point(w / 2 - deltaY / 2, h + deltaX / 2);
                    this.drawing += "C " + point(w / 2 - deltaY / 2 + deltaX, h + deltaX / 2 + deltaY)
                        + point(w / 2 + deltaY / 2 + deltaX, h - deltaX / 2 + deltaY)
                        + point(w / 2 + deltaY / 2, h - deltaX / 2);
                    this.drawing += "L " + point(-w / 2 + deltaY / 2 + deltaX * deltaX / deltaY, deltaX / 2);
                    this.drawing += "Q " + point(-w / 2 + deltaY / 2 + deltaX * deltaX / deltaY / 2, 0)
                        + point(-w / 2 + deltaY / 2 + deltaX * deltaX / deltaY, -deltaX / 2);
                    this.drawing += "L " + point(w / 2 + deltaY / 2, -h + deltaX / 2);
                }
                    break;
            }
            svgr.attr(this.component, "d", this.drawing);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new Chevron(this.width, this.height, this.thickness, this.dir)
                .position(this.x, this.y));
            return clone;
        }

    }

    class Cross extends Shape {

        constructor(width, height, thickness) {
            super();
            this.component = svgr.create("path", this);
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;
            this.thickness = thickness;
            this._draw();
        }

        position(x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height, thickness) {
            this.width = width;
            this.height = height;
            this.thickness = thickness;
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height, thickness:thickness});
            return this;
        }

        _draw() {
            let point=(x, y)=> {
                this.points.push({x:this.x+x, y:this.y+y});
                return (this.x+x)+","+(this.y+y)+" ";
            };
            this.points=[];
            let w = this.width/2;
            let h = this.height/2;
            let t = this.thickness/2
            this.drawing = "M " + point(-w, -t);
            this.drawing += "L " + point(-t, -t);
            this.drawing += "L " + point(-t, -h);
            this.drawing += "L " + point(t, -h);
            this.drawing += "L " + point(t, -t);
            this.drawing += "L " + point(w, -t);
            this.drawing += "L " + point(w, t);
            this.drawing += "L " + point(t, t);
            this.drawing += "L " + point(t, h);
            this.drawing += "L " + point(-t, h);
            this.drawing += "L " + point(-t, t);
            this.drawing += "L " + point(-w, t);
            this.drawing += "L " + point(-w, -t);
            svgr.attr(this.component, "d", this.drawing);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return insidePolygon(local.x + this.x, local.y + this.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new Cross(this.width, this.height, this.thickness)
                .position(this.x, this.y));
            return clone;
        }

    }

    class Text extends Shape {

        constructor(message="") {
            super();
            this.component = svgr.create("text", this);
            this.messageText = ""+message;
            this.x = 0;
            this.y = 0;
            this.fontName = "arial";
            this.fontSize = 12;
            this.lineSpacing = 24;
            this._decoration = "none";
            this.anchorText = "middle";
            this.vanchorText = "top";
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
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height; // TODO Not used yet...
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height});
            return this;
        }

        font(fontName, fontSize, lineSpacing) {
            this.fontName = fontName;
            this.fontSize = fontSize;
            this.lineSpacing = lineSpacing || fontSize * 2;
            this._draw();
            return this;
        }

        vanchor(anchorText) {
            this.vanchorText = anchorText;
            this._draw();
            return this;
        }

        anchor(anchorText) {
            this.anchorText = anchorText;
            this._draw();
            return this;
        }

        decoration(decoration) {
            this._decoration = decoration;
            this._draw();
            return this;
        }

        _draw() {
            let margin = this.vanchorText==="middle" ? this.lines.length*this.lineSpacing/2 : 0;
            for (var l = 0; l < this.lines.length; l++) {
                svgr.remove(this.component, this.lines[l]);
            }
            this.lines = [];
            var lines = this.messageText.split("\n");
            svgr.attr(this.component, "x", this.x);
            let baseY = this.y;
            if (this.height) {
                baseY += - this.height/2 + this.lineSpacing/2 - this.fontSize/4;
            }
            svgr.attr(this.component, "y", baseY-margin);
            svgr.attr(this.component, "text-anchor", this.anchorText);
            svgr.attr(this.component, "font-family", this.fontName);
            svgr.attr(this.component, "font-size", this.fontSize);
            svgr.attr(this.component, "text-decoration", this._decoration);
            this._format(this.component, 0, lines[0]);
            for (l = 1; l < lines.length; l++) {
                var line = svgr.create("tspan", this);
                this.lines[l - 1] = line;
                svgr.add(this.component, line);
                svgr.attr(line, "x", this.x);
                svgr.attr(line, "y", baseY + l * this.lineSpacing-margin);
                this._format(line, l, lines[l]);
            }
        }

        boundingRect() {
            let rect = svgr.boundingRect(this.component);
            let x1 = rect.left;
            let y1 = rect.top;
            let x2 = rect.left + rect.width;
            let y2 = rect.top + rect.height;
            this.lines.forEach(line=>{
                rect = svgr.boundingRect(line);
                if (x2<rect.left+rect.width) {
                    x2=rect.left+rect.width
                };
                y2=rect.top+rect.height;
            });
            switch(this.anchorText) {
                case "middle":
                    return {left:x1+x1/2-x2/2, top:y1, width:x2-x1, height:y2-y1};
                case "start":
                    return {left:x1, top:y1, width:x2-x1, height:y2-y1};
                case "end":
                    return {left:x1*2-x2, top:y1, width:x2-x1, height:y2-y1};
            }
        }

        lineBoundingRect(index) {
            if (index==0) {
                return svgr.boundingRect(this.component);
            }
            else {
                return svgr.boundingRect(this.lines[index-1]);
            }
        }

        _format(line, index, text) {
            if (text!==undefined && this.width!==undefined) {
                let message = text;
                let messageToShow = message;
                let finished = false;
                do {
                    svgr.text(line, this.escape(messageToShow));
                    let bounds = this.lineBoundingRect(index);
                    if (bounds.width>this.width && message.length>0) {
                        message = message.slice(0, message.length-1);
                        messageToShow = message+"...";
                    }
                    else {
                        finished = true;
                    }
                } while (!finished);
            }
            else {
                svgr.text(line, this.escape(text));
            }
        }

        escape(text) {
            return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;')
                .replace(/ /g, '&nbsp;')
                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            let box = this.boundingRect();
            return x>=box.left && x<=box.left+box.width && y>=box.top && y<=box.top+box.height;
        }

        getTarget(x, y) {
            if (this._opacity===undefined || this._opacity > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }

        duplicate() {
            let clone = super.duplicate(new Text(this.messageText)
                .dimension(this.width, this.height)
                .font(this.fontName, this.fontSize, this.lineSpacing)
                .anchor(this.anchorText)
                .vanchor(this.vanchorText)
                .decoration(this._decoration)
                .position(this.x, this.y));
            return clone;
        }

    }

    class Line extends Shape {

        constructor(x1, y1, x2, y2) {
            super();
            this.component = svgr.create("line", this);
            this.strokeWidth = 2;
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
            this.reshapeHandler && this.reshapeHandler({x1:x1, y1:y1, x2:this.x2, y2:this.y2});
            return this;
        }

        end(x2, y2) {
            this.x2 = x2;
            this.y2 = y2;
            this._draw();
            this.reshapeHandler && this.reshapeHandler({x1:this.x1, y1:this.y1, x2:x2, y2:y2});
            return this;
        }

        _draw() {
            svgr.attr(this.component, "x1", this.x1);
            svgr.attr(this.component, "y1", this.y1);
            svgr.attr(this.component, "x2", this.x2);
            svgr.attr(this.component, "y2", this.y2);
        }

        prepareAnimator(animator) {
            super.prepareAnimator(animator);
            this.prepareLineAnimation(animator);
        }

        globalPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            var point = getPoint(args);
            return this.parent ? this.parent.localPoint(point) : null;
        }

        inside(x, y) {
            let local = this.localPoint(x, y);
            let dist = distanceToSegment(local, {x: this.x1, y: this.y1}, {x: this.x2, y: this.y2});
            return dist < this.strokeWidth;
        }

        getTarget(x, y) {
            if (this._opacity===undefined || this._opacity > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }

        duplicate() {
            let clone = super.duplicate(new Line(this.x1, this.y1, this.x2, this.y2));
            return clone;
        }
    }

    class Path extends Shape {

        constructor(x, y) {
            super();
            this.component = svgr.create("path", this);
            if (x === undefined) {
                this.drawing = "";
                this.points = [];
            }
            else {
                this.drawing = "M " + x + "," + y + " ";
                this.points = [{x: x, y: y, type:"move"}];
            }
        }

        reset() {
            this.drawing = "";
            this.points = [];
            this._draw();
            this.reshapeHandler && this.reshapeHandler(this.points);
            return this;
        }

        bezier(cx, cy, x1, y1) {
            this.drawing += "Q " + cx + "," + cy + " " + x1 + "," + y1 + " ";
            this.points.push({x: cx, y: cy, type:"bezier-c1"}, {x: x1, y: y1, type:"bezier-end"});
            this._draw();
            this.reshapeHandler && this.reshapeHandler(this.points);
            return this;
        }

        cubic(cx1, cy1, cx2, cy2, x1, y1) {
            this.drawing += "C " + cx1 + "," + cy1 + " " + cx2 + "," + cy2 + " " + x1 + "," + y1 + " ";
            this.points.push({x: cx1, y: cy1, type:"cubic-c1"},
                {x: cx2, y: cy2, type:"cubic-c2"}, {x: x1, y: y1, type:"cubic-end"});
            this._draw();
            this.reshapeHandler && this.reshapeHandler(this.points);
            return this;
        }

        line(x, y) {
            this.drawing += "L " + x + "," + y + " ";
            this.points.push({x: x, y: y, type:"line"});
            this._draw();
            this.reshapeHandler && this.reshapeHandler(this.points);
            return this;
        }

        move(x, y) {
            this.drawing += "M " + x + "," + y + " ";
            this.points.push({x: x, y: y, type:"move"});
            this._draw();
            this.reshapeHandler && this.reshapeHandler(this.points);
            return this;
        }

        _draw() {
            svgr.attr(this.component, "d", this.drawing);
        }

        globalPoint(...args) {
            let point = getPoint(args);
            return this.parent ? this.parent.globalPoint(point) : null;
        }

        localPoint(...args) {
            let point = getPoint(args);
            return this.parent ? this.parent.localPoint(point) : null;
        };

        inside(x, y) {
            let local = this.localPoint(x, y);
            return insidePolygon(local.x, local.y, this.points);
        }

        duplicate() {
            let clone = super.duplicate(new Path());
            clone.drawing = this.drawing;
            clone.points = this.points.slice(0);
            clone._draw();
            return clone;
        }
    }

    class Image extends Shape {

        constructor(url) {
            super();
            this.component = svgr.create("image", this);
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
            this.moveHandler && this.moveHandler({x:x, y:y});
            return this;
        }

        dimension(width, height) {
            this.width = width;
            this.height = height;
            this._draw();
            this.resizeHandler && this.resizeHandler({width:width, height:height});
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
            return this.parent ? this.parent.globalPoint({x: point.x + this.x, y: point.y + this.y}) : null;
        }

        localPoint(...args) {
            let point = getPoint(args);
            point = this.parent ? this.parent.localPoint(point) : null;
            return point ? {x: point.x - this.x, y: point.y - this.y} : null;
        }

        inside(x, y) {
            var local = this.localPoint(x, y);
            return local.x >= -this.width / 2 && local.x <= this.width / 2
                && local.y >= -this.height / 2 && local.y <= this.height / 2;
        }

        getTarget(x, y) {
            if (this._opacity===undefined || this._opacity > 0) {
                return this.inside(x, y) ? this : null;
            }
            return null;
        }

        duplicate() {
            let clone = super.duplicate(new Image(this.src)
                .dimension(this.width, this.height)
                .position(this.x, this.y));
            return clone;
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
        for (let k=0; k<executor.source.length; k++) {
            delta[k] = executor.target[k] - executor.source[k];
            sum += delta[k]*delta[k];
        }
        let stepCount = Math.sqrt(sum) / step;
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
        return svgr.request(url, data);
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

    function bug(err) {
        console.log("Bug encountered ! : "+err);
        throw err;
    }

    return {
        Screen : Screen,
        Block : Block,
        Clip : Clip,
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
        Chevron:Chevron,
        Cross:Cross,

        Animator : Animator,

        distanceToSegment:distanceToSegment,
        distanceToEllipse:distanceToEllipse,
        insidePolygon:insidePolygon,
        angle:angle,
        rotate:rotate,
        intersectLineLine : intersectLineLine,
        intersectLinePolygon : intersectLinePolygon,

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
        bug : bug,

        GREY : [128, 128, 128],
        DARK_GREY : [80, 80, 80],
        LIGHT_GREY : [200, 200, 200],

        BLUE : [0, 0, 200],
        DARK_BLUE : [0, 0, 100],
        LIGHT_BLUE : [50, 150, 200],
        HORIZON : [150, 200, 250],

        GREEN : [0, 200, 0],
        DARK_GREEN : [0, 100, 0],
        LIGHT_GREEN : [120, 200, 120],

        RED : [250, 0, 0],
        ALMOST_RED : [240, 10, 10],
        DARK_RED : [100, 0, 0],
        LIGHT_RED : [200, 100, 100],
        LIGHT_PINK : [250, 200, 200],

        ORANGE:[220, 100, 0],
        DARK_ORANGE:[170, 70, 0],
        LIGHT_ORANGE:[255, 204, 0],
        BEIGE:[235, 230, 150],

        BLACK : [0, 0, 0],
        ALMOST_BLACK : [10, 10, 10],
        WHITE : [255, 255, 255],
        ALMOST_WHITE: [250, 250, 250]
    }
};


