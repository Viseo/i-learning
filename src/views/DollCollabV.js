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
        ListManipulatorView = globalVariables.Lists.ListManipulatorView,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        installDnD = globalVariables.gui.installDnD,
        INPUT_SIZE = {w: 400, h: 30};

    class DollCollabV extends View{
        constructor(presenter){
            super(presenter);
            this.objectivesBackground = {};
            this.responses = [];
            this.graphicResponses = [];
        }

        display(){
            var _declareManip = () => {
                this.sandboxManip = new Manipulator(this);
                this.objectivesManip = new Manipulator(this);
                this.responseManip = new Manipulator(this);
                this.actionbuttonZoneManip = new Manipulator(this);
                this.returnButtonManipulator = new Manipulator(this);
                this.manipulator
                    .add(this.sandboxManip)
                    .add(this.objectivesManip)
                    .add(this.responseManip)
                    .add(this.actionbuttonZoneManip)
                    .add(this.returnButtonManipulator);
            };
            let createReturnButton = () => {
                this.returnButton = new gui.Button(INPUT_SIZE.w, INPUT_SIZE.h, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5, 5);
                this.returnButton.text.font('Arial', 20).position(0, 6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width / 2 + MARGIN, this.header.height + this.returnButton.height / 2 + MARGIN);
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator.add(chevron);
            };

            super.display();
            _declareManip();
            this.displayHeader(this.getLabel());
            createReturnButton();

            this.size = {w : drawing.width - 2 * MARGIN, h : drawing.height - this.header.height - 2*MARGIN}
            this.sandboxDim = {w: this.size.w*2/3, h: this.size.h - this.returnButton.height - MARGIN};

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
            this.sandboxManip.move(this.sandboxDim.w/2 + MARGIN, this.sandboxDim.h/2 + this.header.height + MARGIN*2 + this.returnButton.height);

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
                        let txt = new svg.Text(elemDetails.statementId).font(FONT, 20).position(0,-elemDetails.height/2 - MARGIN);
                        manip.add(txt);
                        elem.statementId = elemDetails.statementId;
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
                let rect = new svg.Rect(this.objectivesSize.w/2, 27)
                    .color(myColors.none, 1, myColors.none);
                let guiElement = new svg.Text(ele.label).font(FONT, 20).position(0,6.66);
                this.objectivesBackground[ele.label] = rect;
                manip.add(rect).add(guiElement);
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
                let conf = {
                    drop: (what, whatParent, finalX, finalY) => {
                        let point = whatParent.globalPoint(finalX, finalY);
                        let target = this.manipulator.last.getTarget(point.x, point.y);
                        if(target && target.type==='help'){
                            let resp = this.responses.find((resp)=>resp.statement===target.statementId);
                            if(resp){
                                resp.response = ele.label;
                                target.parentManip.remove(target.parentManip.response);
                                let txt = new svg.Text(ele.label).font(FONT, 18).position(0, target.height/2 + 2*MARGIN);
                                target.parentManip.add(txt);
                                target.parentManip.response = txt;
                                let tmp = this.graphicResponses.find(elem=>{return elem.statement == target.statementId});
                                this.graphicResponses.remove(tmp);
                                this.graphicResponses.add({statement: target.statementId, response:ele.label, svg: txt});
                            }else{
                                this.responses.push({statement:target.statementId, response:ele.label});
                                let txt = new svg.Text(ele.label).font(FONT, 18).position(0, target.height/2 + 2*MARGIN);
                                target.parentManip.add(txt);
                                target.parentManip.response = txt;
                                this.graphicResponses.push({statement: target.statementId, response:ele.label, svg: txt});
                            }
                            this.checkResponses();
                        }
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what) => {
                        this.responsesList.resetAllMove();
                        this.responsesList.refreshListView();
                        return true;
                    }
                }

                let manip = new Manipulator(this);
                let guiElement = new svg.Text(ele.label).font(FONT, 20);
                manip.add(guiElement);
                installDnD(manip, drawings.component.glass.parent.manipulator.last, conf);
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

            buttonPrevious.corners(5,5);
            buttonInit.corners(5,5);
            buttonNext.corners(5,5);

            buttonPrevious.position(-buttonSize.w*2 + MARGIN, 0);
            buttonNext.position(buttonSize.w*2 - MARGIN, 0);

            buttonNext.onClick(()=>this.displayPopup());

            this.actionbuttonZoneManip.move(this.sandboxDim.w + this.actionButtonZoneSize.w/2 + 2*MARGIN,
                (this.objectivesSize.h+this.responseSize.h + buttonSize.h/2) + this.header.height + 3*MARGIN);

            this.actionbuttonZoneManip
                .add(buttonPrevious.component)
                .add(buttonInit.component)
                .add(buttonNext.component);
        }

        displayPopup(){
            let _hidePopup = () => {
                this.manipulator.remove(this.popUpManipulator);
            }
            let _initPopUp = () => {
                this.popUpManipulator = new Manipulator(this);
                let background = new svg.Rect(drawing.width, drawing.height).color(myColors.black,0, myColors.black).fillOpacity(0.4)
                let popUpRect = new svg.Rect(popUpDim.w, popUpDim.h).color(myColors.white, 1, myColors.black).corners(2, 2)
                this.popUpManipulator
                    .add(background)
                    .add(popUpRect)
                this.popUpManipulator.move(drawing.width/2, drawing.height/2)
                this.manipulator.add(this.popUpManipulator);
            }
            let _displayConfirmMessage = () => {
                let title = new svg.Text('Alerte !')
                    .font(FONT, 35)
                    .position(0, -popUpDim.h/2 + MARGIN + 35*2/3)
                let textInfo = new svg.Text("Voulez-vous vraiment quitter ce test ?")
                    .font(FONT, 20);
                let okButton = new gui.Button(popUpDim.w/2, popUpDim.h/4, [myColors.white, 1, myColors.black], 'Oui')
                    .corners(2, 2)
                okButton.position(popUpDim.w/2-okButton.width/2, popUpDim.h/2 - okButton.height/2);
                //TODO onclik okButton => go to next question
                let notOkButton = new gui.Button(popUpDim.w/2, popUpDim.h/4, [myColors.white, 1, myColors.black], 'Non')
                    .corners(2, 2)
                notOkButton.position(-popUpDim.w/2+notOkButton.width/2, popUpDim.h/2 - notOkButton.height/2)
                notOkButton.onClick(()=>_hidePopup());
                this.popUpManipulator
                    .add(title)
                    .add(textInfo)
                    .add(okButton.component)
                    .add(notOkButton.component);
            }
            let _displayEndMessage = () => {
                let textInfo = new svg.Text("Merci d'avoir participé à ce test !").font(FONT, 20);
                this.popUpManipulator.add(textInfo);
                setTimeout(()=>{
                    _hidePopup()
                    this.returnToOldPage();
                }, 3000);
            }

            let popUpDim = {
                w: Math.max(drawing.width/3, 400),
                h: Math.max(drawing.height/3, 300),
            }
            _initPopUp();
            if(!this.areObjectivesFinished()){
                _displayConfirmMessage()
            }else{
                _displayEndMessage();
            }

        }

        colorObjective(checks){
            for (let obj of checks){
                if(obj.best){
                    this.objectivesBackground[obj.objective].color(myColors.green, 1, myColors.none);
                    this.getObjectives().find(elem=>{return elem.label == obj.objective}).status = 'best';
                    svg.addEvent(this.objectivesBackground[obj.objective], 'mouseenter', ()=>{
                        let objectives = this.getObjectives();
                        let objective = objectives.find(elem=>{return elem.label == obj.objective});
                        let group = objective.rules.bestSolutions[obj.group];
                        Object.keys(group).forEach(statement=>{
                            let responseToColor = this.graphicResponses.find(elem=>{
                                return elem.statement == statement;
                            });
                            responseToColor.svg.color(myColors.green, 1, myColors.none).parentManip.scale(1.25);
                        })
                    });
                    svg.addEvent(this.objectivesBackground[obj.objective], 'mouseleave', ()=>{
                        let objectives = this.getObjectives();
                        let objective = objectives.find(elem=>{return elem.label == obj.objective});
                        let group = objective.rules.bestSolutions[obj.group];
                        Object.keys(group).forEach(statement=>{
                            let responseToColor = this.graphicResponses.find(elem=>{
                                return elem.statement == statement;
                            });
                            responseToColor.svg.color(myColors.black, 1, myColors.none).parentManip.scale(1);
                        })
                    });
                }
                else if (obj.accepted){
                    this.objectivesBackground[obj.objective].color(myColors.orange, 1, myColors.none);
                    this.getObjectives().find(elem=>{return elem.label == obj.objective}).status = 'accepted';
                    svg.addEvent(this.objectivesBackground[obj.objective], 'mouseenter', ()=>{
                        let objectives = this.getObjectives();
                        let objective = objectives.find(elem=>{return elem.label == obj.objective});
                        let group = objective.rules.acceptedSolutions[obj.group];
                        Object.keys(group).forEach(statement=>{
                            let responseToColor = this.graphicResponses.find(elem=>{
                                return elem.statement == statement;
                            });
                            responseToColor.svg.color(myColors.orange, 1, myColors.none).parentManip.scale(1.25);
                        })
                    });
                    svg.addEvent(this.objectivesBackground[obj.objective], 'mouseleave', ()=>{
                        let objectives = this.getObjectives();
                        let objective = objectives.find(elem=>{return elem.label == obj.objective});
                        let group = objective.rules.acceptedSolutions[obj.group];
                        Object.keys(group).forEach(statement=>{
                            let responseToColor = this.graphicResponses.find(elem=>{
                                return elem.statement == statement;
                            });
                            responseToColor.svg.color(myColors.black, 1, myColors.none).parentManip.scale(1);
                        })
                    });
                }
                else{
                    this.objectivesBackground[obj.objective].color(myColors.none, 1, myColors.none);
                    this.getObjectives().find(elem=>{return elem.label == obj.objective}).status = 'unreached';
                }
            }
        }

        checkResponses(){
            this.colorObjective(this.presenter.checkResponses(this.responses));
        }

        areObjectivesFinished(){
            return this.getObjectives().every(obj=>{return obj.status == 'best'});
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