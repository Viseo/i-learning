exports.DollAdminV = function(globalVariables){
    const View = globalVariables.View,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        drawing = globalVariables.drawing,
        svg = globalVariables.svg,
        INPUT_SIZE = {w: 400, h: 30},
        PANEL_SIZE = {w:drawing.width-2*MARGIN, h: drawing.height * 0.7},
        SANDBOX_SIZE = {w: PANEL_SIZE.w*6/9, h: PANEL_SIZE.h - 4*MARGIN, header: {w: PANEL_SIZE.w*6/9, h: 100 }},
        RIGHTBOX_SIZE = {w: PANEL_SIZE.w - SANDBOX_SIZE.w - 3*MARGIN,h: (PANEL_SIZE.h - 6*MARGIN)/2,
        header: {w :PANEL_SIZE.w - SANDBOX_SIZE.w, h: 0.2*(PANEL_SIZE.h - 5*MARGIN)/2}},
        TAB_SIZE={w:0.1*PANEL_SIZE.w, h: 0.1*PANEL_SIZE.h},
        ListManipulatorView = globalVariables.domain.ListManipulatorView,
        ListSvgView = globalVariables.domain.ListSVGView,
        HEADER_TILE = SANDBOX_SIZE.header.h - 2*MARGIN,
        installDnD = globalVariables.gui.installDnD,
        IMAGE_SIZE = {w:30, h:30}

    class DollAdminV extends View{
        constructor(presenter){
            super(presenter);
            this.manipulator = new Manipulator(this);
            this.mainPanelManipulator = new Manipulator(this);
            this.rules = false;
        }

        display(){
            drawing.manipulator.set(0, this.manipulator);
            this.manipulator.add(this.header.getManipulator());
            this.header.display(this.getLabel());
            this.displayTitle();
            this.displayMainPanel();
            this.displayTabs();
        }

        displayTitle(){
            let createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(INPUT_SIZE.w, INPUT_SIZE.h, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5,5);
                this.returnButton.text.font('Arial', 20).position(0,6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width/2 + MARGIN,this.header.height + this.returnButton.height/2 + MARGIN);
                let chevron = new svg.Chevron(10,20,3,'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator.add(chevron);
                this.manipulator.add(this.returnButtonManipulator);
            }
            createReturnButton();
            let createTitle = () => {
                let titleManipulator = new Manipulator(this);
                let title = new svg.Text('Creer un exercice : ')
                    .font('Arial', 25).anchor('left')
                    .position(-INPUT_SIZE.w/2, 0);
                let exerciseTitleInput = new gui.TextField(0, 0, INPUT_SIZE.w, INPUT_SIZE.h, this.getLabel())
                exerciseTitleInput.font('Arial', 15).color(myColors.grey);
                exerciseTitleInput.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                exerciseTitleInput.control.placeHolder(this.getLabel());
                exerciseTitleInput.onInput((oldMessage, message, valid) => {
                    if (!message || !oldMessage) {
                        exerciseTitleInput.text.message(this.getLabel());
                    }
                    exerciseTitleInput.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                });
                exerciseTitleInput.color([myColors.lightgrey, 1, myColors.black])
                    .position(0, INPUT_SIZE.h)
                titleManipulator.add(exerciseTitleInput.component)
                    .add(title);
                titleManipulator.move(this.returnButton.width/2 + MARGIN, this.header.height + 2*INPUT_SIZE.h + MARGIN);
                this.manipulator.add(titleManipulator);
            }
            createTitle();

        }

        displayTabs(){
            let statement = new svg.Rect(TAB_SIZE.w, TAB_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2)
                .position(-TAB_SIZE.w, 0);
            let statementText = new svg.Text('Enoncé')
                .font('Arial', 18)
                .position(-TAB_SIZE.w, 6);

            let rules = new svg.Rect(TAB_SIZE.w, TAB_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            let rulesText = new svg.Text('Règles')
                .font('Arial', 18)
                .position(0, 6);

            util.resizeStringForText(statementText, TAB_SIZE.w, TAB_SIZE.h);
            util.resizeStringForText(rulesText, TAB_SIZE.w, TAB_SIZE.h);
            svg.addEvent(statement, 'click', () => {this.toggleTabs(false)})
            svg.addEvent(statementText, 'click', () => {this.toggleTabs(false)})
            svg.addEvent(rules, 'click', () => {this.toggleTabs(true)})
            svg.addEvent(rulesText, 'click', () => {this.toggleTabs(true)})

            let tabsManip = new Manipulator(this);
            tabsManip.add(statement)
                .add(statementText)
                .add(rules)
                .add(rulesText);
            tabsManip.move(drawing.width - 2*MARGIN - TAB_SIZE.w/2, this.mainPanelManipulator.y - PANEL_SIZE.h/2 - TAB_SIZE.h/2);
            this.manipulator.add(tabsManip);
        }

        displayMainPanel(){
            this.mainPanelManipulator.flush();
            let backRect = new svg.Rect(PANEL_SIZE.w, PANEL_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(5,5);
            this.mainPanelManipulator.add(backRect);
            this.mainPanelManipulator.move(drawing.width/2,drawing.height/2 + PANEL_SIZE.h/8)
            this.manipulator.add(this.mainPanelManipulator);

            if(this.rules){
                this.displaySolutions();
            }
            else{
                this.displaySandBoxZone();
            }
        }

        toggleMode(mode){
            if(mode=='text'){
                this.textMode = true;
                svg.addEvent(this.sandboxMain, 'mousedown', this.textZoning.bind(this));
            }
        }

        textZoning(event){
            let point = this.sandboxManip.component.localPoint(event.x,event.y);
            let rect = new svg.Rect(0,0).position(point.x, point.y).color(myColors.white, 1, myColors.black);
            this.sandboxManip.add(rect);
            let moveHandler = (eventMove)=>{
                if (eventMove.x - event.x > 0 && eventMove.y - event.y > 0 && this.textMode) {
                    rect.dimension(eventMove.x - event.x, eventMove.y - event.y);
                    rect.position(point.x + rect.width / 2, point.y + rect.height / 2);
                }
            }
            let mouseupHandler = ()=>{
                svg.removeEvent(this.sandboxMain, 'mousemove');
                this.sandboxManip.remove(rect);
                let text = new gui.TextField(rect.x, rect.y, rect.width, rect.height, '');
                this.sandboxManip.add(text.component);
                this.textMode=false;
            }
            svg.addEvent(this.sandboxMain, 'mousemove', moveHandler)
            svg.addEvent(this.sandboxMain, 'mouseup', mouseupHandler)
        }

        displaySandBoxZone(){
            this.sandboxManip = new Manipulator(this);
            let actionTabs = [
                new svg.Text('T').font('Arial', HEADER_TILE).position(0,HEADER_TILE/3),
                new svg.Rect(HEADER_TILE, HEADER_TILE).color(myColors.blue),
                new svg.Image('../../images/ajoutImage.png').dimension(HEADER_TILE, HEADER_TILE),
                new svg.Image('../../images/svg-guy.png').dimension(HEADER_TILE, HEADER_TILE)
                ]
            svg.addEvent(actionTabs[0], 'click', ()=>{this.toggleMode('text')});
            let actionList = new ListSvgView(actionTabs, 'H', SANDBOX_SIZE.w-50, SANDBOX_SIZE.header.h, 25, 25, HEADER_TILE,
                HEADER_TILE, 5, undefined, 25);

            this.sandboxMain = new svg.Rect(SANDBOX_SIZE.w, SANDBOX_SIZE.h - SANDBOX_SIZE.header.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            this.sandboxMain.position(0, SANDBOX_SIZE.header.h/2 + this.sandboxMain.height/2);
            this.sandboxManip.add(actionList.manipulator)
                .add(this.sandboxMain);


            this.sandboxManip.move(-PANEL_SIZE.w/2 + SANDBOX_SIZE.header.w/2 + MARGIN, -PANEL_SIZE.h/2 + SANDBOX_SIZE.header.h/2 + 2*MARGIN);
            this.mainPanelManipulator.add(this.sandboxManip);
            actionList.refreshListView();
            this.displayObjectives();
            this.displayResponses();
        }

        displaySolutions(){
            let solutionsHeaderManipulator = new Manipulator(this);
            let solutionsHeader = new svg.Rect(PANEL_SIZE.w, 0.2*PANEL_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            let headerTitle = new svg.Text('Pour chaque objectif créé, définir les règles associées : ')
                .font('Arial', 18)
                .anchor('left')
                .position(-PANEL_SIZE.w/2 + MARGIN, -solutionsHeader.height/5);
            let headerRollPanel = new svg.Rect(0.8*PANEL_SIZE.w, INPUT_SIZE.h)
                .color(myColors.white, 1, myColors.grey);

            solutionsHeaderManipulator.add(solutionsHeader)
                .add(headerTitle)
                .add(headerRollPanel);
            solutionsHeaderManipulator.move(0,solutionsHeader.height/2 - PANEL_SIZE.h/2);
            this.mainPanelManipulator.add(solutionsHeaderManipulator);
            this.displaySolutionsBody();
        }

        displaySolutionsBody(){
            let solutionsBodyManip = new Manipulator(this);
            let createLeftTemplate = () =>{
                let leftTemplateManip = new Manipulator(this).addOrdonator(2);
                let addSolutionButton = new gui.Button(INPUT_SIZE.w, INPUT_SIZE.h, [myColors.white, 1, myColors.green],
                'Ajouter une solution');
                let selectSolution = new svg.Rect(0.8*addSolutionButton.width, INPUT_SIZE.h)
                    .color(myColors.white, 1, myColors.grey)
                    .corners(5,5);
                let deleteSolutionButton = new gui.Button(0.15 * selectSolution.width, INPUT_SIZE.h,
                    [myColors.lightgrey, 0, myColors.none], 'X');
                let framedRollPanel = new svg.Rect(0.3*addSolutionButton.width, INPUT_SIZE.h)
                    .color(myColors.white, 1, myColors.grey);
                let linkImage = new util.Picture('../../images/unlink.png', false, this);
                let pictureImage = new util.Picture('../../images/picture.png', false, this);
                let rollPanel = new svg.Rect(0.4*addSolutionButton.width, INPUT_SIZE.h)
                    .color(myColors.white, 1, myColors.grey);

                selectSolution.position(-0.1*addSolutionButton.width, addSolutionButton.height + 2*MARGIN);
                deleteSolutionButton.position(addSolutionButton.width*0.4 + MARGIN,  addSolutionButton.height + 2*MARGIN);
                framedRollPanel.position(-0.35*addSolutionButton.width, 2*(addSolutionButton.height + 2*MARGIN));
                rollPanel.position(-addSolutionButton.width/2 + framedRollPanel.width + IMAGE_SIZE.w + rollPanel.width/2 + 1.5*MARGIN,
                    2*(addSolutionButton.height + 2*MARGIN));
                linkImage.draw(-addSolutionButton.width/2 + rollPanel.width - IMAGE_SIZE.w/2 + 0.5*MARGIN, 2*(addSolutionButton.height + 2*MARGIN),
                IMAGE_SIZE.w,IMAGE_SIZE.h, leftTemplateManip, 0);
                pictureImage.draw(addSolutionButton.width/2 - IMAGE_SIZE.w/2, 2*(addSolutionButton.height + 2*MARGIN),
                IMAGE_SIZE.w, IMAGE_SIZE.h, leftTemplateManip, 1);


                leftTemplateManip.add(selectSolution)
                    .add(addSolutionButton.component)
                    .add(deleteSolutionButton.component)
                    .add(framedRollPanel)
                    .add(rollPanel)
                leftTemplateManip.move(-PANEL_SIZE.w/2 + INPUT_SIZE.w/2 + MARGIN, 0)
                solutionsBodyManip.add(leftTemplateManip);
            }
            createLeftTemplate();
            solutionsBodyManip.move(4*MARGIN,-PANEL_SIZE.h/4)
            this.mainPanelManipulator.add(solutionsBodyManip);

        }

        displayObjectives(){
            let createMiniature = ()=>{
                let miniature ={
                    border: new svg.Line(-this.objectivesList.width/2 + 2* MARGIN,15,this.objectivesList.width/2 - 2* MARGIN,15)
                        .color(myColors.black, 1, myColors.grey),
                    text: new svg.Text(this.objectivesInput.textMessage).font('Arial', 18).position(0,6),
                    manip: new Manipulator(this)
                };
                miniature.manip.add(miniature.text)
                    .add(miniature.border);
                miniature.text.markDropID('objectivesDrop');
                miniature.border.markDropID('objectivesDrop');
                let conf ={
                    drop: (what, whatParent, finalX, finalY)=>{
                            let point = whatParent.globalPoint(finalX,finalY);
                            let target = this.manipulator.last.getTarget(point.x,point.y);
                            if(!target || target && target.dropID != 'objectivesDrop' || !target.dropID) {
                                this.objectivesList.removeElementFromList(what);
                                what.flush();
                            }
                            return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what)=>{
                        this.objectivesList.resetAllMove();
                        this.objectivesList.refreshListView();
                        return true;
                    }
                }
                installDnD(miniature.manip, drawings.component.glass.parent.manipulator.last, conf);
                return miniature;
            }
            let addObjectiveHandler = ()=>{
                let mini = createMiniature();
                this.objectivesList.add(mini.manip);
                this.objectivesList.refreshListView();
            }
            let objectivesManip = new Manipulator(this);
            let objectivesHeader = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2,2);
            let objectivesTitle = new svg.Text('Définissez les objectifs : ')
                .font('Arial', 20)
                .anchor('left')
                .position(-RIGHTBOX_SIZE.w/2 + 2*MARGIN, 8.33);
            util.resizeStringForText(objectivesTitle, RIGHTBOX_SIZE.w - 3*MARGIN, 15);
            let objectivesBody = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            objectivesBody.position(0, objectivesHeader.height/2 + objectivesBody.height/2);

            this.objectivesInput = new gui.TextField(0, 0, 2/3*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h)
                .color([myColors.white, 1, myColors.black]);
            this.objectivesInput.font('Arial', 18);
            this.objectivesInput.position(-RIGHTBOX_SIZE.w/2+this.objectivesInput.width/2 + MARGIN,  RIGHTBOX_SIZE.header.h)
            this.objectivesInput.frame.corners(5,5);

            let objectivesAddButton = new gui.Button(0.25*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h, [myColors.customBlue, 1, myColors.grey],'Ajouter');
            objectivesAddButton.text
                .font('Arial', 18)
                .position(0,6);
            objectivesAddButton.back.corners(5,5);
            objectivesAddButton.position(RIGHTBOX_SIZE.w/2 - MARGIN - objectivesAddButton.width/2, RIGHTBOX_SIZE.header.h);
            objectivesAddButton.onClick(addObjectiveHandler);

            this.objectivesList = new ListManipulatorView([], 'V', RIGHTBOX_SIZE.w - 2*MARGIN, RIGHTBOX_SIZE.h*0.4, 75,25,  RIGHTBOX_SIZE.w - 2*MARGIN, 27, 5);
            this.objectivesList.position(0,RIGHTBOX_SIZE.h -this.objectivesList.height);
            this.objectivesList.markDropID('objectivesDrop')

            objectivesManip.add(objectivesHeader)
                .add(objectivesTitle)
                .add(objectivesBody)
                .add(objectivesAddButton.component)
                .add(this.objectivesInput.component)
                .add(this.objectivesList.manipulator);

            objectivesManip.move(PANEL_SIZE.w/2 - RIGHTBOX_SIZE.w/2 - MARGIN, 2*MARGIN-PANEL_SIZE.h/2 + objectivesHeader.height/2);
            this.mainPanelManipulator.add(objectivesManip);
            this.objectivesList.refreshListView();
        }

        displayResponses(){
            let createMiniature = ()=>{
                let miniature ={
                    border: new svg.Line(-this.objectivesList.width/2 + 2* MARGIN,15,this.objectivesList.width/2 - 2* MARGIN,15)
                        .color(myColors.black, 1, myColors.grey),
                    text: new svg.Text(this.responsesInput.textMessage).font('Arial', 18).position(0,6),
                    manip: new Manipulator(this)
                };
                miniature.manip.add(miniature.text)
                    .add(miniature.border);
                miniature.text.markDropID('responsesDrop');
                miniature.border.markDropID('responsesDrop');
                let conf ={
                    drop: (what, whatParent, finalX, finalY)=>{
                        let point = whatParent.globalPoint(finalX,finalY);
                        let target = this.manipulator.last.getTarget(point.x,point.y);
                        if(!target || target && target.dropID != 'responsesDrop' || !target.dropID) {
                            this.responsesList.removeElementFromList(what);
                            what.flush();
                        }
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what)=>{
                        this.responsesList.resetAllMove();
                        this.responsesList.refreshListView();
                        return true;
                    }
                }
                installDnD(miniature.manip, drawings.component.glass.parent.manipulator.last, conf);
                return miniature;
            }
            let addResponseHandler = ()=>{
                let mini = createMiniature();
                this.responsesList.add(mini.manip);
                this.responsesList.refreshListView();
            }
            let responsesManip = new Manipulator(this);
            let responsesHeader = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2,2);
            let responsesTitle = new svg.Text('Définissez les réponses : ')
                .font('Arial', 20)
                .anchor('left')
                .position(-RIGHTBOX_SIZE.w/2 + 2*MARGIN, 8.33);
            util.resizeStringForText(responsesTitle, RIGHTBOX_SIZE.w - 3*MARGIN, 15);
            let responsesBody = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            responsesBody.position(0, responsesHeader.height/2 + responsesBody.height/2);

            this.responsesInput = new gui.TextField(0, 0, 2/3*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h)
                .color([myColors.white, 1, myColors.black])
            this.responsesInput.font('Arial', 18);
            this.responsesInput.position(-RIGHTBOX_SIZE.w/2+this.responsesInput.width/2 + MARGIN,  RIGHTBOX_SIZE.header.h)
            this.responsesInput.frame.corners(5,5);

            let responsesAddButton = new gui.Button(0.25*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h, [myColors.customBlue, 1, myColors.grey],'Ajouter');
            responsesAddButton.text
                .font('Arial', 18)
                .position(0,6);
            responsesAddButton.back.corners(5,5);
            responsesAddButton.position(RIGHTBOX_SIZE.w/2 - MARGIN - responsesAddButton.width/2, RIGHTBOX_SIZE.header.h);
            responsesAddButton.onClick(addResponseHandler);

            this.responsesList = new ListManipulatorView([], 'V', RIGHTBOX_SIZE.w - 2*MARGIN, RIGHTBOX_SIZE.h*0.4, 75,25,  RIGHTBOX_SIZE.w - 2*MARGIN, 27, 5);
            this.responsesList.position(0,RIGHTBOX_SIZE.h -this.responsesList.height);
            this.responsesList.markDropID('responsesDrop')

            responsesManip.add(responsesHeader)
                .add(responsesTitle)
                .add(responsesBody)
                .add(responsesAddButton.component)
                .add(this.responsesInput.component)
                .add(this.responsesList.manipulator);
            responsesManip.move(PANEL_SIZE.w/2 - RIGHTBOX_SIZE.w/2 - MARGIN, 2*MARGIN-PANEL_SIZE.h/2 + responsesHeader.height/2 + RIGHTBOX_SIZE.h + 2*MARGIN);
            this.mainPanelManipulator.add(responsesManip);
        }

        getLabel(){
            return this.presenter.getLabel();
        }

        toggleTabs(bool){
            if (this.rules != bool) {
                this.rules = bool;
                this.displayMainPanel();
            }
        }
    }

    return DollAdminV;

}