/**
 * Created by minhhuyle on 29/05/2017.
 */
exports.DollCollabV = function(globalVariables) {
    const View = globalVariables.View,
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        installDnD = globalVariables.gui.installDnD;

    class DollCollabV extends View{
        constructor(presenter){
            super(presenter);
        }

        display(){
            var _declareManip = () => {
                this.sandboxManip = new Manipulator(this);
                this.goalManip = new Manipulator(this);
                this.responseManip = new Manipulator(this);
                this.actionbuttonZoneManip = new Manipulator(this);
                this.manipulator
                    .add(this.sandboxManip)
                    .add(this.goalManip)
                    .add(this.responseManip)
                    .add(this.actionbuttonZoneManip);
            };

            super.display();
            _declareManip();
            this.displayHeader(this.getLabel());

            this.size = {w : drawing.width - 2 * MARGIN, h : drawing.height - this.header.height - 2*MARGIN}
            this.statementDim = {
                w: (this.size.w - MARGIN)/2, h: this.size.h
            };
            this.actionButtonZoneSize = {w: this.statementDim.w, h: this.statementDim.h/6};

            this.goalSize = {w: this.statementDim.w, h: (this.statementDim.h - this.actionButtonZoneSize.h)/2 };
            this.responseSize = {w: this.statementDim.w, h: (this.statementDim.h - this.actionButtonZoneSize.h)/2};

            this._displaySandbox();
            this._displayGoal();
            this._displayResponse();
            this._displayButtonZone();
        }

        _displaySandbox(){
            this.sandboxMain = new gui.Panel(this.statementDim.w, this.statementDim.h, myColors.white);
            this.sandboxMain.border.corners(2, 2).color(myColors.none, 1, myColors.black);
            this.sandboxManip.add(this.sandboxMain.component);
            this.sandboxManip.move(this.statementDim.w/2 + MARGIN, this.statementDim.h/2 + this.header.height + MARGIN);

            this.getElements().forEach((elemDetails, index)=>{
                let manip = new Manipulator(this);
                let elem;
                switch(elemDetails.type){
                    case 'rect':
                        elem = new svg.Rect(elemDetails.width, elemDetails.height);
                        elem.color(elemDetails.fillColor, 1, elemDetails.strokeColor);
                        elem.mark('rectElement' + index);
                        manip.add(elem);
                        break;
                    case 'text':
                        console.log(elemDetails)
                        elem = new svg.Text(elemDetails.textMessage)
                            .font(FONT, 32)
                            .dimension(elemDetails.width, elemDetails.height)
                            .position(-elemDetails.width/2, 32/3)
                            .anchor('left')
                        let border = new svg.Rect(elemDetails.width, elemDetails.height)
                            .color(elemDetails.fillColor, 1, myColors.black)
                        manip.add(border).add(elem);
                        break;
                    case 'picture':
                        elem = new svg.Image(elemDetails.src);
                        elem.dimension(elemDetails.width, elemDetails.height);
                        manip.add(elem);
                        elem.mark('picElement');
                        break;
                    case 'help':
                        elem = new svg.Image('../../images/info.png');
                        elem.dimension(elemDetails.width, elemDetails.height);
                        manip.add(elem);
                        elem.mark('helpElement');
                        break;
                }
                elem.type = elemDetails.type;
                manip.move(elemDetails.globalX, elemDetails.globalY);
                this.sandboxMain.content.add(manip.component);
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

        getElements(){
            return this.presenter.getElements();
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
    }

    return DollCollabV;
};