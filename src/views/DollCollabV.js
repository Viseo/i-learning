/**
 * Created by minhhuyle on 29/05/2017.
 */
exports.DollCollabV = function(globalVariables) {
    const View = globalVariables.View,
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        ListManipulatorView = globalVariables.Lists.ListManipulatorView,
        resizeStringForText = globalVariables.Helpers.resizeStringForText;

    class DollCollabV extends View{
        constructor(presenter){
            super(presenter);
        }

        display(){
            var _declareManip = () => {
                this.sandboxManip = new Manipulator(this);
                this.objectivesManip = new Manipulator(this);
                this.responseManip = new Manipulator(this);
                this.actionbuttonZoneManip = new Manipulator(this);
                this.manipulator
                    .add(this.sandboxManip)
                    .add(this.objectivesManip)
                    .add(this.responseManip)
                    .add(this.actionbuttonZoneManip);
            };

            super.display();
            _declareManip();
            this.displayHeader(this.getLabel());

            this.size = {w : drawing.width - 2 * MARGIN, h : drawing.height - this.header.height - 2*MARGIN}
            this.sandboxDim = {w: this.size.w*2/3, h: this.size.h};

            this.actionButtonZoneSize = {w: this.size.w - this.sandboxDim.w, h: this.size.h/12};
            this.objectivesSize = {w: this.size.w - this.sandboxDim.w - MARGIN, h: (this.size.h - this.actionButtonZoneSize.h)/2 };
            this.responseSize = {w: this.size.w - this.sandboxDim.w - MARGIN, h: (this.size.h - this.actionButtonZoneSize.h)/2};

            this._displaySandbox();
            this._displayObjectives();
            this._displayResponses();
            this._displayButtonZone();
        }

        _displaySandbox(){
            this.sandboxMain = new gui.Panel(this.sandboxDim.w, this.sandboxDim.h, myColors.white);
            this.sandboxMain.border.corners(2, 2).color(myColors.none, 1, myColors.black);
            this.sandboxManip.add(this.sandboxMain.component);
            this.sandboxManip.move(this.sandboxDim.w/2 + MARGIN, this.sandboxDim.h/2 + this.header.height + MARGIN);

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

        _displayObjectives(){
            let objectivesHeader = new svg.Rect(this.objectivesSize.w, this.objectivesSize.h * 0.2)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2, 2);
            objectivesHeader.position(0, -this.objectivesSize.h/2 + objectivesHeader.height/2);
            let objectivesTitle = new svg.Text('Objectifs : ')
                .font(FONT, 20)
                .anchor('left')
                .position(-this.objectivesSize.w/2+MARGIN, objectivesHeader.y);
            resizeStringForText(objectivesTitle, this.objectivesSize.w - 2 * MARGIN, 15);
            let objectivesBody = new svg.Rect(this.objectivesSize.w, this.objectivesSize.h*0.8)
                .color(myColors.white, 1, myColors.grey)
                .corners(2, 2)
            objectivesBody.position(0, -this.objectivesSize.h/2 + objectivesHeader.height + objectivesBody.height/2);
            let objectives = this.getObjectives().map((ele) => {
                let manip = new Manipulator(this);
                let guiElement = new svg.Text(ele.label).font(FONT, 20);
                manip.add(guiElement);
                return manip;
            });
            this.objectivesList = new ListManipulatorView(
                objectives,
                'V',
                this.objectivesSize.w - 2*MARGIN, this.objectivesSize.h*0.8 - 2*MARGIN,
                75, 25,
                this.objectivesSize.w - 2*MARGIN, 27,
                5
            )
            this.objectivesList.position(0, objectivesBody.y )
            this.objectivesManip.add(objectivesHeader).add(objectivesTitle).add(objectivesBody).add(this.objectivesList.manipulator);
            this.objectivesManip.move(this.sandboxDim.w + this.objectivesSize.w/2 + 2*MARGIN, this.objectivesSize.h/2 + this.header.height + MARGIN);
            this.objectivesList.refreshListView();
        }

        _displayResponses(){
            let responsesHeader = new svg.Rect(this.responseSize.w, this.responseSize.h*0.2)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2, 2);
            responsesHeader.position(0, -this.responseSize.h/2 + responsesHeader.height/2);
            let responsesTitle = new svg.Text('Réponses : ')
                .font(FONT, 20)
                .anchor('left')
                .position(-this.responseSize.w/2+MARGIN, responsesHeader.y);
            resizeStringForText(responsesTitle, this.responseSize.w - 2 * MARGIN, 15);
            let responsesBody = new svg.Rect(this.responseSize.w, this.responseSize.h*0.8)
                .color(myColors.white, 1, myColors.grey)
                .corners(2, 2)
            responsesBody.position(0, -this.responseSize.h/2 + responsesHeader.height + responsesBody.height/2);
            let responses = this.getResponses().map((ele)=> {
                let manip = new Manipulator(this);
                let guiElement = new svg.Text(ele.label).font(FONT, 20);
                manip.add(guiElement);
                return manip;
            })
            this.responsesList = new ListManipulatorView(
                responses,
                'V',
                this.responseSize.w - 2*MARGIN, this.responseSize.h*0.8 - 2*MARGIN,
                    75, 25,
                this.responseSize.w - 2*MARGIN, 27,
                    5
            )
            this.responsesList.position(0,responsesBody.y);
            this.responseManip
                .add(responsesHeader)
                .add(responsesTitle)
                .add(responsesBody)
                .add(this.responsesList.manipulator);
            this.responseManip.move(this.sandboxDim.w + this.responseSize.w/2 + 2*MARGIN,
                (this.objectivesSize.h+this.responseSize.h/2) + this.header.height + 2*MARGIN);
            this.responsesList.refreshListView();
        }


        _displayButtonZone(){
            let buttonSize = {w: this.actionButtonZoneSize.w / 5, h: this.actionButtonZoneSize.h - 2*MARGIN};
            let buttonPrevious = new gui.Button(buttonSize.w, buttonSize.h, [myColors.white, 1, myColors.grey], "Précédent");
            let buttonInit = new gui.Button(buttonSize.w, buttonSize.h, [myColors.white, 1, myColors.grey], "Réinitialiser");
            let buttonNext = new gui.Button(buttonSize.w, buttonSize.h, [myColors.white, 1, myColors.grey], "Suivant");

            buttonPrevious.back.corners(5,5);
            buttonInit.back.corners(5,5);
            buttonNext.back.corners(5,5);

            buttonPrevious.position(-buttonSize.w*2 + MARGIN, 0);
            buttonNext.position(buttonSize.w*2 - MARGIN, 0);

            this.actionbuttonZoneManip.move(this.sandboxDim.w + this.actionButtonZoneSize.w/2 + 2*MARGIN,
                (this.objectivesSize.h+this.responseSize.h + buttonSize.h/2) + this.header.height + 3*MARGIN);

            this.actionbuttonZoneManip
                .add(buttonPrevious.component)
                .add(buttonInit.component)
                .add(buttonNext.component);
        }

        getElements(){
            return this.presenter.getElements();
        }

        getObjectives(){
            return this.presenter.getObjectives();
        }

        getResponses(){
            return this.presenter.getResponses();
        }

        getLabel(){
            return this.presenter.getLabel();
        }
    }

    return DollCollabV;
};