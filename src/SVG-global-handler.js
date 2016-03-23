/**
 * Created by ACA3502 on 23/03/2016.
 */
var Glass=function(x,y,w,h){
    var self=this;
    self.x=x;
    self.y=y;
    self.w=w;
    self.h=h;
    self.glass = new Raphael(x,y,w,h).rect(x,y,w,h);
    self.glass.attr({'fill':'white'});
    self.glass.attr({'opacity':0.001});

    self.glass.node.onclick=function(event){
        self.target = paper.set().getTarget(event.clientX, event.clientY);
        console.log("onclick");
        if (self.target&&self.target.node.onclick){
            self.target.node.onclick(event);
        }
    };

    self.glass.node.onmousedown = function(event) {
        self.target = paper.set().getTarget(event.clientX, event.clientY);
        console.log(self.target);
        self.drag = self.target;
        // Rajouter des lignes pour target.bordure et target.image si existe ?
        if (self.target && self.target.node.onmousedown) {
            self.target.node.onmousedown(event);
        }
    };
    self.glass.node.onmousemove = function(event) {
        self.target = self.drag||paper.set().getTarget(event.clientX, event.clientY);
     if (self.target && self.target.node.onmousemove) {
     self.target.node.onmousemove(event);
     }
     };
    self.glass.node.onmouseup = function(event) {
        console.log("mouseup");
        self.target = self.drag||paper.set().getTarget(event.clientX, event.clientY);
        if (self.target) {
            if (self.target.node.onmouseup) {
                self.target.node.onmouseup(event);
            }
            if (self.target.node.onclick) {
                console.log("onclick");
                self.target.node.onclick(event);
            }
        }
        self.drag = null;
    };

};

var Piste=function(x,y,w,h) {
    var self = this;
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;
    self.piste = new Raphael(x, y, w, h).rect(x, y, w, h);
    self.piste.attr({'fill': 'white'});
    self.piste.attr({'opacity': 0.001});
};

