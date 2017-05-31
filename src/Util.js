exports.Util = function (globalVariables) {
    let runtime = globalVariables.runtime,
        svg = globalVariables.svg,
        gui = globalVariables.gui;

    class Manipulator {
        constructor(sourceObject, translator, rotator, scalor) {
            this.parentObject = sourceObject;
            this.translator = translator || new svg.Translation(0, 0);
            this.translator.parentManip = this;
            this.rotator = rotator || new svg.Rotation(0);
            this.rotator.parentManip = this;
                this.scalor = scalor || new svg.Scaling(1);
            this.scalor.parentManip = this;
            this.translator.add(this.rotator.add(this.scalor));
            this.last = this.scalor;
            this.first = this.translator;
            this.component = this.translator;
            this.components = [];
            this.listeners = {};
            let self = this;
            Object.defineProperty(self, "x", {
                get: function () {
                    return self.component.x;
                },
                set: function (nouvelleValeur) {
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(self, "y", {
                get: function () {
                    return self.component.y;
                },
                set: function (nouvelleValeur) {
                },
                enumerable: true,
                configurable: true
            });
        }

        globalPoint(...args) {
            return this.translator.globalPoint(args);
        }

        localPoint(...args) {
            return this.translator.localPoint(args);
        }

        mark(id) {
            this.id = id;
            this.translator.mark(id);
            return this;
        }

        addEvent(eventName, handler) {
            this.listeners[eventName] = handler;
            svg.addEvent(this.translator, eventName, handler);
        }

        removeEvent(eventName) {
            let handler = this.listeners[eventName];
            svg.removeEvent(this.translator, eventName, handler);
        }

        addOrdonator(layerNumber) {
            this.ordonator = new svg.Ordered(layerNumber);
            this.ordonator.parentManip = this;
            this.scalor.add(this.ordonator);
            return this;
        }

        lastLayerOrdonator() {
            return this.ordonator.children.length - 1;
        }

        flush() {
            const clean = (handler) => {
                // if (handler.noFlush) return;
                if ((handler instanceof svg.Ordered)) {
                    handler.children.forEach(function (child, index) {
                        if ((child instanceof svg.Handler)) {
                            clean(child);
                        } else {
                            handler.unset(index);
                        }
                    })
                } else {
                    for (let j = handler.children.length - 1; j >= 0; j--) {
                        if (handler.children[j] instanceof svg.Handler) {
                            clean(handler.children[j]);
                        } else {
                            handler.remove(handler.children[j]);
                        }
                    }
                }
            };
            clean(this.component);
            this.components = [];
            return this;
        }

        move(x, y) {
            this.translator.move(x, y);
            this.x = this.translator.localPoint(0, 0);
            this.y = this.translator.localPoint(0, 0);
            return this;
        }

        rotate(angle) {
            this.rotator.rotate(angle);
            return this;
        }

        scale(scaleX, scaleY) {
            this.scalor.scale(scaleX, scaleY);
            return this;
        }

        get(layer) {
            return this.ordonator ? this.ordonator.get(layer) : undefined;
        }

        set(layer, svgObject) {
            let component;
            if (svgObject instanceof Manipulator) {
                component = svgObject.first;
            }else {
                component = svgObject;
            }

            this.ordonator.set(layer, component);
            this.components.push(svgObject);
            svgObject.parentManip = this;
            return this;
        }

        unset(layer) {
            let index = this.components.indexOf(this.ordonator.get(layer));
            if(index !== -1) this.components.splice(index, 1);
            delete this.ordonator.children[layer].parentManip;
            this.ordonator.unset(layer);
            return this;
        }

        add(svgObject) {
            let component;
            if (svgObject instanceof Manipulator) {
                component = svgObject.first;
            } else {
                component = svgObject;
            }
            if (this.scalor.children.indexOf(component) === -1) {
                this.last.add(component);
                this.components.push(svgObject);
                svgObject.parentManip = this;
            }
            return this;
        }

        remove(svgObject) {
            let component;
            if (svgObject instanceof Manipulator) {
                component = svgObject.first;
            } else {
                component = svgObject;
            }
            if (this.scalor.children.indexOf(component) !== -1) {
                this.last.remove(component);
                delete component.parentManip;
                let index = this.components.indexOf(svgObject);
                if(index !== -1) this.components.splice(index, 1);
            }
            return this;
        }
    }

    class Drawings extends gui.Canvas {
        constructor(w, h, anchor = "content") {
            super(w, h);
            this.component.show(anchor);
            this.drawing.manipulator = new Manipulator(this, this.component.background);
            this.drawing.manipulator.addOrdonator(4);
            this.piste = new Manipulator(this).addOrdonator(1);
            this.drawing.manipulator.set(2, this.piste);
            this.component.clean = (survival) => {
                for (let i = this.component.children.length; i >= 0; i--) {
                    this.component.children[i] !== this.drawing && this.component.children[i] !== survival && this.component.remove(this.component.children[i]);
                }
            }
            const onmousedownHandler = event => {
                runtime.activeElement() && runtime.activeElement().blur();
                this.target = this.component.background.getTarget(event.pageX, event.pageY);
                this.drag = this.target;
                if (this.target) {
                    svg.event(this.target, "mousedown", event);
                }
            };
            svg.addEvent(this.component.glass, "mousedown", onmousedownHandler);

            const ondblclickHandler = event => {
                let target = this.component.background.getTarget(event.pageX, event.pageY);
                if (target) {
                    svg.event(target, "dblclick", event);
                }
            };
            svg.addEvent(this.component.glass, "dblclick", ondblclickHandler);
        }
    }

    var drawCheck = function (x, y, size) {
        return new svg.Path(x, y).move(x - .3 * size, y - .1 * size)
            .line(x - .1 * size, y + .2 * size).line(x + .3 * size, y - .3 * size)
            .color(myColors.none, 3, myColors.black);
    };

    const hexagonDefaultColors = () => {
        return {
            fillColor: myColors.lightwhite,
            strokeWidth: 1,
            strokeColor: myColors.grey
        };
    };

    let drawHexagon = (w, h, orientation, ratio) => {
        let factor = ratio || 1;
        if (orientation == 'V') {
            var points = [
                [w / 2, -h / 2],
                [0, -factor * h],
                [-w / 2, -h / 2],
                [-w / 2, h / 2],
                [0, factor * h],
                [w / 2, h / 2]
            ];
        }
        else {
            var points = [
                [w / 2, -h / 2],
                [factor * w, 0],
                [w / 2, h / 2],
                [-w / 2, h / 2],
                [-factor * w, 0],
                [-w / 2, -h / 2]
            ];
        }

        let shape = new svg.Polygon().add(points).color(
            hexagonDefaultColors().fillColor, hexagonDefaultColors().strokeWidth, hexagonDefaultColors().strokeColor);
        shape.width = orientation == 'V' ? w : w*factor;
        shape.height = orientation == 'V' ? h*factor : h;

        return shape;
    };

    return {
        Drawings,
        Manipulator,
        drawCheck,
        drawHexagon,
    }
};