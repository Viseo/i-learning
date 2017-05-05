/**
 * Created by TBE3610 on 28/03/2017.
 */
exports.guiPolyfill = function (svg, gui, util) {
    //plutot à mettre dans TextItem mais pas accessible d'ici
    gui.TextField.prototype.type = function (type) {
        this.isPassword = svg.TextField.PASSWORD === type;

        if (this.isPassword) {
            this.control.type(svg.TextField.PASSWORD);
            this.text.message("●".repeat(this.textMessage.length));
        } else {
            this.control.type(svg.TextField.TEXT);
            this.text.message(this.textMessage);
        }
        return this;
    }

    //function modifiée
    gui.TextField.prototype.controlValidity = function (message) {
        let valid = this.validate(message);
        this.textMessage = message;
        //partie modifiée pour afficher des points au lieu du texte en clair lorsque le champ n'est pas sélectionné
        this.text.message(this.isPassword ? "●".repeat(message.length) : message);
        if (valid) {
            if (this.valid != valid) {
                this.frame.color(svg.WHITE, this._colors[1], svg.BLACK)
                this.control.fontColor(svg.BLACK);
                this.valid = valid;
            }
        }
        else {
            if (this.valid != valid) {
                this.frame.color(svg.WHITE, this._colors[1], svg.RED)
                this.control.fontColor(svg.RED);
                this.valid = valid;
            }
        }
        return valid;
    }
    

    //TODO mettre dans TextItem (la classe n'est pas accessible depuis ici)
    var onClick = function (click) {
        this._onClick = click;
        //TODO mettre ce code dans le constructor de la classe
        svg.addEvent(this.glass, 'click', () => {
            this.showControl();
            if (this._onClick) {
                this._onClick(this.clip.component.children[0]);
            }
        })
        return this;
    }
    gui.TextArea.prototype.onClick = onClick;
    gui.TextField.prototype.onClick = onClick;

    gui.Button.prototype.activeShadow = function (x = 3, y = 3) {
        this.shadow = new svg.Rect(this.width, this.height);
        this.shadow.color(myColors.grey, 1, myColors.lightgrey);
        this.shadow.position(x, y);
        this.shadow.corners(this.component.rx, this.component.ry);
        let tmp = this.component;
        this.component = new util.Manipulator(this).addOrdonator(3);
        this.component.set(2, tmp);
        this.component.set(1, this.shadow);
    }
}