/**
 * Created by qde3485 on 15/03/16.
 */

var AddEmptyElement = function (parent) {
    var self = this;
    self.manipulator = new Manipulator();

    self.label = "Double-cliquez pour ajouter une réponse";
    self.fontSize = 20;
    self.parent = parent;

    self.display = function (x, y, w, h) {
        self.margin = 15;
        self.obj = displayText(self.label, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
        self.plus = drawPlus(x+w/2, y+(h*0.4), h*.3, h*0.3);
        self.manipulator.last.add(self.plus);
        self.obj.content.position(0,h*0.3);

        self.obj.cadre.color([], 3, myColors.black);
        self.obj.cadre.component.setAttribute("stroke-dasharray", [10, 5]);
        //self.manipulator.last.add(self.obj.cadre);

        //self.manipulator.last.add(self.obj.content);

        var dblclickEdition = function () {
            //self.displaySet.remove();
            self.parent.tabAnswer.pop();

            self.parent.tabAnswer.push(new AnswerElement(null, self.parent));
            self.parent.displayQuestionCreator();
        };

        svg.addEvent(self.plus, "dblclick", dblclickEdition);
        svg.addEvent(self.obj.content, "dblclick", dblclickEdition);
        svg.addEvent(self.obj.cadre, "dblclick", dblclickEdition);
    }
};

var AnswerElement = function (answer, parent) {
    var self = this;

    self.manipulator = new Manipulator();

    self.isValidInput = true;
    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){0,3000}$/g;
    self.labelDefault = "Double clic pour modifier";

    if(answer) {
        self.label = answer.label;
        if(answer.fontSize) {
            self.fontSize = answer.fontSize;
        } else {
            self.fontSize = 20;
        }
        self.bCorrect = answer.bCorrect;
    }else {
        self.label = "";
        self.fontSize = 20;
        self.bCorrect = false;
    }
    self.parent = parent;

    self.toAnswer = function () {
        return {label: self.label, bCorrect: self.bCorrect, colorBordure: myColors.black, bgColor: myColors.white};
    };

    self.display = function (x, y, w, h) {
        self.margin = 15;
        var showTitle = function () {
            var text = (self.label) ? self.label : self.labelDefault;
            var color = (self.label) ? myColors.black : myColors.grey;
            self.obj = displayText(text, w, h, myColors.black, myColors.white, self.fontSize, null, self.manipulator);
            self.obj.content.color(color);
            self.obj.cadre;
            //self.manipulator.last.add(self.obj.cadre).add(self.obj.content);
            svg.addEvent(self.obj.content, "dblclick", dblclickEdition);
            svg.addEvent(self.obj.cadre, "dblclick", dblclickEdition);
        };

        var dblclickEdition = function () {
            self.obj.content.remove();
            var contentarea = document.createElement("TEXTAREA");
            contentarea.value = self.label;
            contentarea.setAttribute("style", "position: absolute; top:"+(y+3*self.margin)+"px; left:"+(x+3*self.margin)+"px; width:"+(w-6*self.margin-2)+"px; height:"+(h*.8-6*self.margin)+"px; content-align:center; resize: none; border: none;");
            var body = document.getElementById("body");
            body.appendChild(contentarea).focus();
            var onblur = function () {
                self.label = contentarea.value;
                contentarea.remove();
                self.obj.cadre.remove();
                showTitle();
                self.obj.cadre.toBack();
                self.cBLabel.toFront();
                self.checkbox.checkbox.toFront();
                if(self.checkbox.checked) {
                    self.checkbox.checked.toFront();
                }
            };

            contentarea.oninput = function () {
                if(contentarea.value.match(self.regex)) {
                    contentarea.onblur = onblur;
                    contentarea.style.border = "none";
                    self.isValidInput = true;
                } else {
                    contentarea.style.border = "solid #FF0000";
                    self.isValidInput = false;
                    contentarea.focus();
                    contentarea.onblur = function () {
                        contentarea.value = "";
                        onblur();
                    }
                }
            };
            contentarea.onblur = onblur;
        };
        showTitle();
        self.checkbox = displayCheckbox(x+2*self.margin+40/2, y+h - 40, 40, self);
        self.cBLabel = new svg.Text("Bonne réponse").position(x+3*self.margin+40, y+h-self.margin-20).font("arial", 20).anchor("start");
        self.manipulator.last.add(self.cBLabel);
    }
};