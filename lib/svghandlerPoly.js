/**
 * Created by TBE3610 on 28/03/2017.
 */

exports.svgPolyfill = function (svg) {
    let svgr = svg.runtime;

    svg.Text.prototype.fontStyle = function (fontStyle) {
        svgr.attr(this.component, "font-style", fontStyle);
        return this;
    }
}