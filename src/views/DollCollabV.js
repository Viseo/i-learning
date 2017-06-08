/**
 * Created by minhhuyle on 29/05/2017.
 */
exports.DollCollabV = function(globalVariables) {
    const View = globalVariables.View,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        drawing = globalVariables.drawing;

    class DollCollabV extends View{
        constructor(presenter){
            super(presenter);
            var _declareManip = () => {
                this.statementManip = new Manipulator(this);
                this.goalManip = new Manipulator(this);
                this.responseManip = new Manipulator(this);
                this.actionbuttonZoneManip = new Manipulator(this);
                this.manipulator = new Manipulator(this);
                this.manipulator
                    .add(this.statementManip)
                    .add(this.goalManip)
                    .add(this.responseManip)
                    .add(this.actionbuttonZoneManip);
            };

            _declareManip();
            this.size = {w : drawing.width - 2 * MARGIN, h : drawing.height - this.header.height - 2*MARGIN}
            this.statementDim = {
                w: (this.size.w - MARGIN)/2, h: this.size.h
            };
            this.actionButtonZoneSize = {w: this.statementDim.w, h: this.statementDim.h/6};

            this.goalSize = {w: this.statementDim.w, h: (this.statementDim.h - this.actionButtonZoneSize.h)/2 };
            this.responseSize = {w: this.statementDim.w, h: (this.statementDim.h - this.actionButtonZoneSize.h)/2};

        }

        display(){
            drawing.manipulator.set(0, this.manipulator);
            this.manipulator.add(this.header.getManipulator());
            this.header.display(this.getLabel());

            this._displayStatement();
            this._displayGoal();
            this._displayResponse();
            this._displayButtonZone();
        }

        _displayStatement(){
            let statementBorder = new svg.Rect(this.statementDim.w, this.statementDim.h);
            statementBorder.color(myColors.white, 1 , myColors.grey).corners(5);
            this.statementManip.add(statementBorder);
            this.statementManip.move(this.statementDim.w/2 + MARGIN, this.statementDim.h/2 + this.header.height + MARGIN);

            let sizeElement = {w : statementBorder.width/2, h: statementBorder.height/5}

            this.getStatements().forEach((ele, index) => {
                switch (ele.type){
                    case "Textarea":
                        let textField = new gui.TextField(0, -statementBorder.height/2 + sizeElement.h/2 + MARGIN + index*(sizeElement.h+MARGIN),
                            sizeElement.w, sizeElement.h, "Zone Text");
                        this.statementManip.add(textField.component);
                        break;
                    case "Picture":
                        let image = new svg.Image(ele.src).dimension(sizeElement.w, sizeElement.h)
                            .position(0, -statementBorder.height/2 + sizeElement.h/2 + MARGIN + index*(sizeElement.h+MARGIN));
                        this.statementManip.add(image);
                        break;
                    case "Rectangle":
                        let rect = new svg.Rect(sizeElement.w, sizeElement.h).color(myColors.blue, 1, myColors.darkBlue)
                            .position(0, -statementBorder.height/2 + sizeElement.h/2 + MARGIN + index*(sizeElement.h+MARGIN));
                        this.statementManip.add(rect);
                        break;
                }
            });

        }

        _displayGoal(){
            let goalBorder = new svg.Rect(this.goalSize.w, this.goalSize.h);
            goalBorder.corners(5);
            goalBorder.color(myColors.white, 1 , myColors.grey);
            this.goalManip.add(goalBorder);
            this.goalManip.move(this.statementDim.w + this.goalSize.w/2 + 2*MARGIN, this.goalSize.h/2 + this.header.height + MARGIN);

            let sizeElement = {w: 0, h: goalBorder.height/10};

            this.getGoals().forEach((ele, index) => {
                let guiElement = new svg.Text(ele.label);
                guiElement.font("arial", 20).anchor('start');
                guiElement.position(-goalBorder.width/3 + MARGIN, -goalBorder.height/2 + sizeElement.h/2 + MARGIN + index*(sizeElement.h+MARGIN));
                this.goalManip.add(guiElement);
            });
        }

        _displayResponse(){
            let responseBorder = new svg.Rect(this.responseSize.w, this.responseSize.h);
            responseBorder.corners(5);
            responseBorder.color(myColors.white, 1 , myColors.grey);
            this.responseManip.add(responseBorder);
            this.responseManip.move(this.statementDim.w + this.responseSize.w/2 + 2*MARGIN,
                (this.goalSize.h+this.responseSize.h/2) + this.header.height + 2*MARGIN);


            let sizeElement = {w: 0, h: responseBorder.height/10};

            this.getResponses().forEach((ele, index) => {
                let guiElement = new svg.Text(ele.label);
                guiElement.font("arial", 20).anchor('start');
                guiElement.position(-responseBorder.width / 3 + MARGIN, -responseBorder.height / 2 + sizeElement.h / 2 + MARGIN + index * (sizeElement.h + MARGIN));
                this.responseManip.add(guiElement);
            });
        }


        _displayButtonZone(){
            let buttonSize = {w: this.actionButtonZoneSize.w / 5, h: this.actionButtonZoneSize.h / 3};
            let buttonPrevious = new gui.Button(buttonSize.w, buttonSize.h, [myColors.white, 1, myColors.grey], "Précédent");
            let buttonInit = new gui.Button(buttonSize.w, buttonSize.h, [myColors.white, 1, myColors.grey], "Réinitialiser");
            let buttonNext = new gui.Button(buttonSize.w, buttonSize.h, [myColors.white, 1, myColors.grey], "Suivant");

            buttonPrevious.back.corners(5,5);
            buttonInit.back.corners(5,5);
            buttonNext.back.corners(5,5);

            buttonPrevious.position(-buttonSize.w*2 + MARGIN, 0);
            buttonNext.position(buttonSize.w*2 - MARGIN, 0);

            this.actionbuttonZoneManip.move(this.statementDim.w + this.actionButtonZoneSize.w/2 + 2*MARGIN,
                (this.goalSize.h+this.responseSize.h + buttonSize.h/2) + this.header.height + 3*MARGIN);

            this.actionbuttonZoneManip
                .add(buttonPrevious.component)
                .add(buttonInit.component)
                .add(buttonNext.component);
        }

        getStatements(){
            //todo impleter avec presenter
            let statements = [
                {
                    label : "",
                    type : "Textarea"
                },
                {
                    src: "../../images/unlink.png",
                    type : "Picture"
                },
                {
                    type : "Rectangle"
                }
            ];
            return statements;
        }

        getGoals(){
            //todo impleter avec presenter
            let goals = [
                {label : "goal 1"},
                {label : "goal 2"},
                {label : "goal 3"},
                {label : "goal 4"},
                {label : "goal 4"},
            ];
            return goals;
        }

        getResponses(){
            //todo impleter avec presenter
            let responses = [
                {label : "response 1"},
                {label : "response 2"},
                {label : "response 3"},
                {label : "response 4"},
                {label : "response 4"},
                {label : "response 4"},
            ];
            return responses;
        }

        getLabel(){
            return this.presenter.getLabel();
        }

        resize() {

        }
    }

    return DollCollabV;
};