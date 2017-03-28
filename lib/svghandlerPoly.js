/**
 * Created by TBE3610 on 28/03/2017.
 */

exports.svgPolyfill = function(svg){
    svg.Text.prototype.fontStyle = function(fontStyle){
        svg.runtime.attr(this.component, "font-style", fontStyle);
        return this;
    }
}