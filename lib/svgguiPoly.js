/**
 * Created by TBE3610 on 28/03/2017.
 */
exports.guiPolyfill = function (svg, gui, Handlers, runtime) {
    var svgr = runtime;

    var mark = function(id){
        this.id = id;
        this.text.mark(id);
        this.text.parentObject = this;
        return this;
    }
    gui.TextField.prototype.mark = mark;
    gui.TextArea.prototype.mark = mark;

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

    svg.Handler.prototype.boundingRect = function(){
        return svgr.boundingRect(this.component);
    }

    gui.Panel.prototype.setScroll = function(){
        this.wheelHandler = (event)=> {
            let dim = this.content.boundingRect();
            let coeff = {x:event.deltaX > 0 ? 1 : -1, y:event.deltaY > 0 ? 1: -1};
            let x = 100*coeff.x;
            let y = 100*coeff.y;
            if (dim.height > this.height || dim.width > this.width) {
                if ((this.content.y + y <= 100 && (this.content.y + y +dim.height >= this.height - 150))) {
                    if (event.deltaY > 0) {
                        this.moveContent(this.content.x, this.content.y + y);
                    }
                    else if (event.deltaY < 0) {
                        this.moveContent(this.content.x, this.content.y + y );
                    }
                    if (event.deltaX > 0) {
                        this.moveContent(this.content.x + x, this.content.y);
                    }
                    else if (event.deltaX < 0) {
                        this.moveContent(this.content.x + x, this.content.y);
                    }
                }
            }
        };
        this.translate.onMouseWheel(this.wheelHandler);
    }
    

    //TODO mettre dans TextItem (la classe n'est pas accessible depuis ici)
    var onClick = function (click) {
        this._onClick = click;
        //TODO mettre ce code dans le constructor de la classe
        svg.addEvent(this.glass, 'click', (event) => {
            if(event.which == 3){
                if(this._onRightClick){
                    this._onRightClick(event);
                }
            }else {
                this.showControl();
                if (this._onClick) {
                    this._onClick(event);
                }
            }

        })
        return this;
    }
    gui.TextArea.prototype.onClick = onClick;
    gui.TextField.prototype.onClick = onClick;

    var onRightClick = function(rightClick){
        this._onRightClick = rightClick;
    }
    gui.TextArea.prototype.onRightClick = onRightClick;
    gui.TextField.prototype.onRightClick = onRightClick;

    gui.Button.prototype.activeShadow = function (x = 3, y = 3) {
        this.shadow = new svg.Rect(this.width, this.height);
        this.shadow.color(myColors.grey, 1, myColors.lightgrey);
        this.shadow.position(x, y);
        this.shadow.corners(this.component.rx, this.component.ry);
        let tmp = this.component;
        this.component = new Handlers.Manipulator(this).addOrdonator(3);
        this.component.set(2, tmp);
        this.component.set(1, this.shadow);
    }

    gui.Button.prototype.color = function(colors){
        this.back.color(...colors);
    }

    svg.SvgElement.prototype.attr = function(prop, value){
        svgr.attr(this.component, prop, value);
    }

    class ClipPath extends svg.SvgElement {
        constructor(id){
            super();
            this.child = null;
            this.component = svgr.create('clipPath', this);
            this.id = id;
            svgr.attr(this.component, 'id', id);
        }

        add(svgObject){
            svgr.add(this.component, svgObject.component);
            svgObject.parent = this;
            this.child = svgObject;
            return this;
        }

        removePath(){
            this.child = null;
            return this;
        }

        getTarget(x,y){
            return this.child ? this.child.getTarget(x,y) : null;
        }
    }

    class Video {
        constructor(src, controls=true){
            this.src = src;
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.controls = controls;
            this.component = new svg.Translation();
            this.video = new svg.Video(src, this.controls);
            this.shown = false;
            this._draw();
        }

        position(x, y) {
            if (this.x !== x || this.y !== y) {
                this.x = x;
                this.y = y;
                this.component.move(x, y);
                this._draw();
            }
            return this;
        }

        dimension(width, height) {
            if (this.width!==width || this.height!==height) {
                this.width = width;
                this.height = height;
                this.video.dimension(width, height);
                this._draw();
            }
            return this;
        }

        refresh(){
            this._draw();
        }

        _draw(){
            let scale = this.component.globalScale();
            let position = this.component.globalPoint(-this.width/2, -this.height/2);
            if (position) {
                this.video.position(position.x, position.y);
            }
            this.video.dimension(this.width * scale, this.height * scale);
        }

        show(){
            if(!this.shown){
                this.canvas = gui.canvas(this.component);
                if(this.canvas){
                    this.canvas.addActivationListener(this).component.add(this.video);
                    this.shown = true;
                }
            }
        }

        hide(){
            if(this.shown){
                this.canvas.addActivationListener(this).component.remove(this.video);
                this.shown = false;
            }
        }
    }
    gui.Video = Video;

    return ClipPath;
}