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

            self.parent.tabAnswer.push(new AnswerElement(null, self.parent));
            self.parent.displayQuestionCreator();
        };

        self.plus.node.ondblclick = dblclickEdition;
        self.obj.content.node.ondblclick = dblclickEdition;
        self.obj.cadre.node.ondblclick = dblclickEdition;
    }
};

var AnswerElement = function (answer, parent) {
    var self = this;
    self.displaySet = paper.set();

    self.isValidInput = true;
    self.regex = /^([A-Za-z0-9.éèêâàîïëôûùö '-]){1,3000}$/g;

    if(answer) {
        self.label = answer.label;
        if(answer.fontSize) {
            self.fontSize = answer.fontSize;
        } else {
            self.fontSize = 20;
        }
        self.bCorrect = answer.bCorrect;
    }else {
        self.label = "Double clic pour modifier";
        self.fontSize = 20;
        self.bCorrect = false;
    }
    self.parent = parent;

    self.toAnswer = function () {
        return {label: self.label, bCorrect: self.bCorrect, colorBordure: myColors.black, bgColor: myColors.white};
    };

    self.display = function (x, y, w, h) {
        self.margin = 15;
        self.obj = displayText(self.label, x, y, w, h, "black", "white", self.fontSize);
        self.obj.cadre.attr("fill-opacity", 0);
        self.displaySet.push(self.obj.cadre);
        self.displaySet.push(self.obj.content);

        self.checkbox = displayCheckbox(x+2*self.margin, y+h-self.margin - 40, 40, self);
        self.displaySet.push(self.checkbox.checkbox);
        self.displaySet.push(self.checkbox.checked);

        self.cBLabel = paper.text(x+3*self.margin+40, y+h-self.margin-20, "Bonne réponse").attr("font-size", 20).attr("text-anchor", "start");
        self.displaySet.push(self.cBLabel);

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
                self.obj = displayText(self.label, x, y, w, h, "black", "white", self.fontSize);

                self.obj.cadre.attr("fill-opacity", 0);
                self.obj.content.node.ondblclick = dblclickEdition;
                self.obj.cadre.node.ondblclick = dblclickEdition;
                self.obj.cadre.toBack();

                self.displaySet.push(self.obj.cadre);
                self.displaySet.push(self.obj.content);

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
                        asyncTimerController.timeout(function () {
                            contentarea.focus();
                        }, 0);
                    }
                }
            };

            contentarea.onblur = onblur;
        };

        self.obj.content.node.ondblclick = dblclickEdition;
        self.obj.cadre.node.ondblclick = dblclickEdition;
    }
};