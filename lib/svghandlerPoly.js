/**
 * Created by TBE3610 on 28/03/2017.
 */

exports.svgPolyfill = function (svg) {
    let svgr = svg.runtime;

    //Fonctions pas disponibles hors svghandler donc redéfinies ici
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
    class DomElement extends Element {

        constructor() {
            super()
        }

    }

    svg.Text.prototype.fontStyle = function (fontStyle) {
        svgr.attr(this.component, "font-style", fontStyle);
        return this;
    };

    svg.Video = class Video extends DomElement {
        constructor (x, y, width, src, controls) {
            super();
            this.component = svgr.createDOM("video");
            this.src = src;
            this.x = x;
            this.y = y;
            this.width = width;
            this.controls = controls;
            svgr.attr(this.component, "src", this.src);
            this._draw();
        }

        position (x, y) {
            this.x = x;
            this.y = y;
            this._draw();
            return this;
        }

        dimension (width) {
            this.width = width;
            this._draw();
            return this;
        }

        setPlayHandler (handler) {
            this.component.onplay = handler;
            svgr.addEvent(this.component, "play", handler);
        }

        _draw () {
            let style = "position:absolute;";
            style += "left:" + (this.x || 0) + "px;";
            style += "top:" + (this.y || 0) + "px;";
            style += "width:" + (this.width || 0) + "px;";
            svgr.attr(this.component, "style", style);
            this.controls && svgr.attr(this.component, "controls", "controls");
        }
    }
}