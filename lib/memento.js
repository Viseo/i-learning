/**
 * Created by HDA3014 on 06/08/2016.
 */
exports.Memento = {
    enabled : true,
    previous : [],
    next : [],
    current : null,

    MAX_DO : 100,

    clear() {
        if (this.enabled) {
            this.previous = [];
            this.next = [];
            this.current = new Map();
        }
    },

    enable() {
        console.log("Memento enable");
        this.enabled = true;
    },

    disable() {
        console.log("Memento disable");
        this.enabled = false;
    },

    begin() {
        if (this.enabled) {
            while (this.previous.length>this.MAX_DO) {
                this.previous.shift();
            }
            if (this.current && this.current.size) {
                console.log("begin");
                this.previous.push(this.current);
            }
            this.current = new Map();
        }
    },

    register(registrable) {
        if (this.enabled && this.current) {
            this.next.length = 0;
            let memento = this.current.get(registrable);
            if (!memento) {
                memento = registrable.memorize();
                this.current.set(registrable, memento);
            }
        }
    },

    registerArray(source) {
        return source.duplicate();
    },

    revertArray(memento, target) {
        target.length = 0;
        target.push.apply(target, memento);
    },

    registerArrayOfArrays(source) {
        let memento = [];
        for (let c = 0; c<source.length; c++) {
            memento.push(this.registerArray(source[c]));
        }
        return memento;
    },

    revertArrayOfArrays(memento, target) {
        target.length = 0;
        for (let c = 0; c<memento.length; c++) {
            target.push(this.registerArray(memento[c]));
        }
    },

    registerObject(source) {
        if (!source) {
            console.log("! source ?");
        }
        return source.duplicate();
    },

    revertObject(memento, target) {
        for (let field in target) {
            delete target[field];
        }
        for (let field in memento) {
            target[field] = memento[field];
        }
    },

    registerSVHHandler(source) {
        let memento = {};
        memento.children = this.registerArray(source.children);
        memento._active = source._active;
        return memento;
    },

    revertSVGHandler(memento, target) {
        target.clear();
        for (let i=0; i<memento.children.length; i++) {
            target.add(memento.children[i]);
        }
        target._active = memento._active;
    },

    registerSVGTranslation(source) {
        let memento = this.registerSVHHandler(source);
        memento.x = source.x;
        memento.y = source.y;
        return memento;
    },

    revertSVGTranslation(memento, target) {
        this.revertSVGHandler(memento, target);
        target.move(memento.x, memento.y);
    },

    registerSVGRotation(source) {
        let memento = this.registerSVHHandler(source);
        memento.angle = source.angle;
        return memento;
    },

    revertSVGRotation(memento, target) {
        this.revertSVGHandler(memento, target);
        target.rotate(memento.angle);
    },

    registerSVGScale(source) {
        let memento = this.registerSVHHandler(source);
        memento.factor = source.factor;
        return memento;
    },

    revertSVGScale(memento, target) {
        this.revertSVGHandler(memento, target);
        target.scale(memento.factor);
    },

    registerSVGOrdered(source) {
        let memento = this.registerSVHHandler(source);
        return memento;
    },

    revertSVGOrdered(memento, target) {
        target.clear();
        for (let i=0; i<memento.children.length; i++) {
            target.add(memento.children[i]);
        }
        target._active = memento._active;
    },

    registerSVGPath(source) {
        let memento = {};
        memento.fillColor = source.fillColor;
        memento.strokeWidth = source.strokeWidth;
        memento.strokeColor = source.strokeColor;
        memento._opacity = source.opacity;
        memento._fillopacity = source.opacity;
        memento.drawing = source.drawing;
        memento.points = this.registerArray(source.points);
        return memento;
    },

    revertSVGPath(memento, target) {
        target.color(memento.fillColor, memento.strokeWidth, memento.strokeColor);
        target.opacity(memento._opacity);
        target.fillOpacity(memento._fillopacity);
        target.drawing = memento.drawing;
        this.revertArray(memento.points, target.points);
        target._draw();
    },

    rollback(notCancelable) {
        if (notCancelable) {
            console.log("not cancel");
        }
        if (this.enabled) {
            this.enabled = false;
            if (!this.current || this.current.size == 0) {
                this.current = this.previous.pop();
            }
            if (this.current) {
                let toCome = new Map();
                for (let registrable of this.current.keys()) {
                    let memento = this.current.get(registrable);
                    if (!notCancelable) {
                        let save = registrable.memorize();
                        toCome.set(registrable, save);
                    }
                    registrable.revert(memento);
                }
                if (!notCancelable) {
                    this.next.push(toCome);
                }
                this.finalizer && this.finalizer();
            }
            this.current = new Map();
            this.enabled = true;
        }
    },

    replay() {
        if (this.enabled) {
            this.enabled = false;
            if (!this.current || this.current.size == 0) {
                this.current = this.next.pop();
            }
            if (this.current) {
                let last = new Map();
                for (let registrable of this.current.keys()) {
                    let memento = this.current.get(registrable);
                    let save = registrable.memorize();
                    last.set(registrable, save);
                    registrable.revert(memento);
                }
                this.previous.push(last);
                this.finalizer && this.finalizer();
            }
            this.current = new Map();
            this.enabled = true;
        }
    },

    finalize(handler) {
        this.finalizer = handler;
    }
};
