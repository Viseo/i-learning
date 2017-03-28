/**
 * Created by TBE3610 on 28/03/2017.
 */
exports.guiPolyfill = function (svg, gui) {
    //plutot à mettre dans TextItem mais pas accessible d'ici
    gui.TextField.prototype.type = function(type){
        this.isPassword = svg.TextField.PASSWORD === type;

        if(this.isPassword){
            this.control.type(svg.TextField.PASSWORD);
            this.text.message("●".repeat(this.textMessage.length));
        }else {
            this.control.type(svg.TextField.TEXT);
            this.text.message(this.textMessage);
        }
        return this;
    }

    //function modifiée
    gui.TextField.prototype.controlValidity = function(message) {
        let valid = this.validate(message);
        if (valid) {
            this.textMessage = message;
            //partie modifiée pour afficher des points au lieu du texte en clair lorsque le champ n'est pas sélectionné
            this.text.message(this.isPassword ? "●".repeat(message.length) : message);
            if (this.valid!=valid) {
                this.control.fontColor(svg.BLACK);
                this.valid = valid;
            }
        }
        else {
            if (this.valid!=valid) {
                this.control.fontColor(svg.RED);
                this.valid = valid;
            }
        }
        return valid;
    }
}