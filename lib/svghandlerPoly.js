/**
 * Created by TBE3610 on 28/03/2017.
 */

exports.svgPolyfill = function (svg) {
    let svgr = svg.runtime;
    function print(points) {
        if (points.length==0) return "";
        var line = points[0].x+","+points[0].y;
        for (var i=1; i<points.length; i++) {
            line += " "+points[i].x+","+points[i].y;
        }
        return line;
    }

    svg.Text.prototype.fontStyle = function (fontStyle) {
        svgr.attr(this.component, "font-style", fontStyle);
        return this;
    }

    svg.Hexagon.prototype.dimension = function(baseWidth, baseHeight) {
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
        this._draw();
        this.resizeHandler && this.resizeHandler(baseWidth);
        return this;
    }

    svg.Hexagon.prototype._draw = function () {
        let point = (x, y) => this.points.push({x: x, y: y});

        this.points = [];
        let height = this.baseHeight || this.height();
        switch (this.dir || "H") {
            case "H":
                point(-this.baseWidth / 2, height / 2);
                point(-this.baseWidth, 0);
                point(-this.baseWidth / 2, -height / 2);
                point(this.baseWidth / 2, -height / 2);
                point(this.baseWidth, 0);
                point(this.baseWidth / 2, height / 2);
                break;
            case "V":
                point(height / 2, -this.baseWidth / 2);
                point(0, -this.baseWidth);
                point(-height / 2, -this.baseWidth / 2);
                point(-height / 2, this.baseWidth / 2);
                point(0, this.baseWidth);
                point(height / 2, this.baseWidth / 2);
                break;
        }
        svgr.attr(this.component, "points", print(this.points));
    }
}