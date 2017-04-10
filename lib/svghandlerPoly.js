/**
 * Created by TBE3610 on 28/03/2017.
 */

exports.svgPolyfill = function (svg) {
    let svgr = svg.runtime;

    svg.Text.prototype.fontStyle = function (fontStyle) {
        svgr.attr(this.component, "font-style", fontStyle);
        return this;
    };
    svg.Text.prototype._draw = function () {
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
        // if (this.messageText != lines[0]) {
        //     this._draw();
        // }
        // lines = this.messageText.split("\n");
        for (l = 1; l < lines.length; l++) {
            var line = svgr.create("tspan", this);
            this.lines[l - 1] = line;
            svgr.add(this.component, line);
            svgr.attr(line, "x", this.x);
            svgr.attr(line, "y", baseY + l * this.lineSpacing-margin);
            this._format(line, l, lines[l]);
        }
        return this;
    };
    svg.Text.prototype._format = function (line, index, text) {
        if (text!==undefined && this.width!==undefined) {
            let charCut = text.length-1;
            // const baseMsg = this.messageText;
            let message = text;
            let messageToShow = message;
            let messageNewLine = message;
            let finished = false;
            do {
                svgr.text(line, this.escape(messageToShow));
                let bounds = this.lineBoundingRect(index);
                if (bounds.width>this.width && message.length>0) {
                    messageNewLine = text.substring(charCut,text.length);
                    message = message.slice(0, message.length-1);
                    charCut--;
                    messageToShow = message;
                }
                else {
                    if (messageNewLine!=message) {
                        this.messageText = messageToShow.concat("\n",messageNewLine);
                        this._draw();
                        // this.lines[index+1] = messageNewLine;
                    }
                    // this._draw();
                    // var coucou= "Bonjour ";
                    // console.log(coucou.concat("Tristan,", " bonne journée."));
                    // this.messageText.split
                    // console.log(messageNewLine);
                    finished = true;
                }
            } while (!finished);
        }
        else {
            svgr.text(line, this.escape(text));
        }
    }
}