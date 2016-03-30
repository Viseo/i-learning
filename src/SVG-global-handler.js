/**
 * Created by ACA3502 on 23/03/2016.
 */
var svg = null;

var Drawings = function (w, h) {
    var self = this;
    if(typeof SVG != "undefined") {
        if(!svg) {
            svg = new SVG();
        }
    }

    function setSvg(_svg) {
        svg = _svg;
        // call setSvg on modules
    }
    if(typeof exports != "undefined") {
        exports.setSvg = setSvg;
    }

    self.drawing = new svg.Drawing(w, h).show("content");
    self.drawing.manipulator = new Manipulator();
    self.piste = new svg.Drawing(w, h).show("content");
    self.piste.manipulator = new Manipulator();
    self.glass = new svg.Drawing(w, h).show("content");
    self.glass.manipulator = new Manipulator();
    self.glass.area = new svg.Rect(w, h);
    self.glass.add(self.glass.manipulator.translator);
    self.glass.manipulator.last.add(self.glass.area);
    self.piste.add(self.piste.manipulator.translator);
    self.drawing.add(self.drawing.manipulator.translator);
    self.glass.area.color([255,255,255]).opacity(0.001);


    var onmousedownHandler = function(event) {
        //self.paper.forEach(function (el) {
        //    console.log(el.type);
        //});
        self.target = self.displaySet.getTarget(event.clientX, event.clientY);
        self.drag = self.target;
        // Rajouter des lignes pour target.bordure et target.image si existe ?
        if (self.target && self.target.node.onmousedown) {
            self.target.node.onmousedown(event);
        }
    };

    svg.addEvent(self.glass.area,"mousedown",onmousedownHandler);

    var onmousemoveHandler = function(event) {
        self.target = self.drag||self.displaySet.getTarget(event.clientX, event.clientY);
        if (self.target && self.target.node.onmousemove) {
            self.target.node.onmousemove(event);
        }
    };

    svg.addEvent(self.glass.area,"mousemove",onmousemoveHandler);

    var ondblclickHandler = function (event) {
        self.target = self.displaySet.getTarget(event.clientX, event.clientY);
        if(self.target && self.target.node.ondblclick) {
            self.target.node.ondblclick(event);
        }
    }
    svg.addEvent(self.glass.area,"dblclick",ondblclickHandler);

    var onmouseupHandler = function(event) {
        self.target = self.drag||self.displaySet.getTarget(event.clientX, event.clientY);
        if (self.target) {
            if (self.target.node.onmouseup) {
                self.target.node.onmouseup(event);
            } 
            if (self.target.node.onclick) {
                self.target.node.onclick(event);
            }
        }
        self.drag = null;
    };
    svg.addEvent(self.glass.area,"mouseup",onmouseupHandler);

};

var Manipulator = function(){
    var self=this;
    self.translator = new svg.Translation(0,0);
    self.rotator = new svg.Rotation(0);
    self.scalor = new svg.Scaling(1);
    self.ordonator = new svg.Ordered(10);
    self.translator.add(self.rotator.add(self.scalor.add(self.ordonator)));
    self.last = self.scalor;
};

