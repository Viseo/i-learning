/**
 * Created by qde3485 on 15/03/16.
 */

var AddEmptyElement = function (parent) {
    var self = this;
    self.displaySet = paper.set();
    self.label = "Double-cliquez pour ajouter une réponse";
    self.fontSize = 20;
    self.parent = parent;

    self.display = function (x, y, w, h) {
        self.margin = 15;
        self.obj = displayText(self.label, x, y, w, h, "black", "white", self.fontSize);
        self.plus = drawPlus(x+w/2, y+(h*0.4), w, h*0.3);
        self.displaySet.push(self.plus);

        self.obj.cadre.attr("stroke-dasharray", "--").attr("stroke-width", 3);
        self.obj.cadre.attr("fill-opacity", 0);
        self.displaySet.push(self.obj.cadre);

        self.obj.content.animate({y:y+h*0.8}, 0);
        self.displaySet.push(self.obj.content);

        var dblclickEdition = function () {
            self.displaySet.remove();
            self.parent.tabAnswer.pop();

            self.parent.tabAnswer.push(new EmptyElement(self.parent));
            self.parent.displayQuestionCreator();
        };

        self.plus.node.ondblclick = dblclickEdition;
        self.obj.content.node.ondblclick = dblclickEdition;
        self.obj.cadre.node.ondblclick = dblclickEdition;
    }
};

var EmptyElement = function (parent) {
    var self = this;
    self.displaySet = paper.set();
    self.label = "Double clic pour modifier";
    self.fontSize = 20;
    self.parent = parent;
    self.parent.displaySet.push(self.displaySet);

    self.display = function (x, y, w, h) {
        self.margin = 15;
        self.obj = displayText(self.label, x, y, w, h, "black", "white", self.fontSize);
        self.obj.cadre.attr("fill-opacity", 0);
        self.displaySet.push(self.obj.cadre);
        self.displaySet.push(self.obj.content);

        //self.checkbox = document.createElement("input");
        //self.checkbox.type = "checkbox";
        //self.checkbox.name = "name";
        //self.checkbox.checked = "true";
        //self.checkbox.id = "id";
        //var body = document.getElementById("body");
        //body.appendChild(self.checkbox).focus();

        self.checkbox = paper.CheckBox({x:x+2*self.margin, y:y+h*0.8, dim: 40});
        self.displaySet.push(self.checkbox);

        self.cBLabel = paper.text(x+3*self.margin+40, y+h*0.8+20, "Bonne réponse").attr("font-size", 20).attr("text-anchor", "start");
        self.displaySet.push(self.cBLabel);

        var dblclickEdition = function () {
            self.obj.content.remove();
            var contentarea = document.createElement("TEXTAREA");
            contentarea.value = self.label;
            contentarea.setAttribute("style", "position: absolute; top:"+(y+3*self.margin)+"px; left:"+(x+3*self.margin)+"px; width:"+(w-6*self.margin-2)+"px; height:"+(h-6*self.margin)+"px; content-align:center; resize: none; border: none;");
            var body = document.getElementById("body");
            body.appendChild(contentarea).focus();
            contentarea.onblur = function () {
                self.label = contentarea.value;
                self.obj.content.attr("text", self.label);
                contentarea.remove();
                self.obj.cadre.remove();
                self.obj = displayText(self.label, x, y, w, h, "black", "white", self.fontSize);
                self.obj.cadre.attr("fill-opacity", 0);
                self.obj.content.node.ondblclick = dblclickEdition;
                self.obj.cadre.node.ondblclick = dblclickEdition;
            };
        };

        self.obj.content.node.ondblclick = dblclickEdition;
        self.obj.cadre.node.ondblclick = dblclickEdition;
    }
};

/*self.obj.content.remove();
 var contentarea = document.createElement("TEXTAREA");
 contentarea.value = self.label;
 contentarea.setAttribute("style", "position: absolute; top:"+(y+3*self.margin)+"px; left:"+(x+3*self.margin)+"px; width:"+(w-6*self.margin-2)+"px; height:"+(h*0.25-2-6*self.margin)+"px; content-align:center; resize: none; border: none;");
 var body = document.getElementById("body");
 body.appendChild(contentarea).focus();
 contentarea.onblur = function () {
 self.label = contentarea.value;
 self.obj.content.attr("text", self.label);
 contentarea.remove();
 self.obj.cadre.remove();
 self.obj = displayText(self.label, x, y, w, h, "black", "white", self.fontSize);
 self.obj.cadre.attr("stroke-dasharray", "--").attr("stroke-width", 3);
 self.obj.cadre.attr("fill-opacity", 0);
 self.obj.content.animate({y:y+h*0.8}, 0);
 self.obj.content.node.ondblclick = dblclickEdition;
 self.obj.cadre.node.ondblclick = dblclickEdition;
 };
 console.log("double clic");*/