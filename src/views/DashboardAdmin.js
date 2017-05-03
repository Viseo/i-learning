exports.DashboardAdmin = function(globalVariables){
const util = globalVariables.util,
    Manipulator = util.Manipulator,
    svg = globalVariables.svg,
    gui = globalVariables.gui,
    drawing = globalVariables.drawing;


    class DashboardAdmin {
        constructor(presenter){
            let createBack = ()=>{
                this.title = new svg.Text('Formations :').font('Arial', 25).color(myColors.grey);
                this.titleBack = new svg.Rect(50, 30).color(myColors.white,0,myColors.none);
                this.panel = new gui.Panel(drawing.width-2*MARGIN, drawing.height - this.headHeight - this.tileHeight + 2*MARGIN, myColors.none);
                this.panel.position(this.panel.width/2 +MARGIN ,
                    this.panel.height/2 + this.headHeight + this.inputSize.height + 2*MARGIN);
                this.manipulator.add(this.panel.component);
                this.backRect = new svg.Rect(5000, 5000) //TODO
                    .position(this.panel.width/2, this.panel.height/2)
                    .color(myColors.white, 0, myColors.none);
                this.miniaturesManipulator.add(this.backRect);
                this.panel.border.color(myColors.none, 1, myColors.grey).corners(5,5);
            }
            this.presenter = presenter;
            this.manipulator = new Manipulator(this).addOrdonator(2);
            this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
            this.header = new globalVariables.domain.HeaderVue();
            this.tileWidth = 120;
            this.tileHeight = 100;
            this.spaceBetween = 20;
            this.lineNumber = 0;
            this.addFormationManipulator = new Manipulator(this).addOrdonator(3);
            this.headHeight = this.header.height + MARGIN;
            this.inputSize = {width: 400, height:30};
            this.buttonSize= {width:40, height:30};
            this.manipulator
                .add(this.addFormationManipulator);
            createBack();
        }


        display(){
            drawing.manipulator.add(this.manipulator);
            let headerManipulator = this.header.getManipulator();
            this.manipulator.add(headerManipulator);
            this.header.display("Dashboard");


            let addFormationDisplay = ()=>{
                let addFormationTextArea = new gui.TextField(0,0, this.inputSize.width, this.inputSize.height, 'Ajouter une formation')
                addFormationTextArea.font('Arial', 15).color(myColors.grey);
                addFormationTextArea.text.position(-this.inputSize.width/2 + MARGIN, 7.5);
                addFormationTextArea.control.placeHolder('Ajouter une formation');
                addFormationTextArea.onInput((oldMessage, message, valid)=>{
                    if (!message || !oldMessage){
                        addFormationTextArea.text.message('Ajouter une formation');
                    }
                    addFormationTextArea.text.position(-this.inputSize.width/2+MARGIN, 7.5);
                });
                addFormationTextArea.color([myColors.lightgrey, 1, myColors.black]);
                this.headHeight += 30 + MARGIN;
                this.addFormationManipulator.add(addFormationTextArea.component);
                this.addFormationManipulator.move(MARGIN + this.inputSize.width/2, this.header.height + MARGIN + this.inputSize.height/2);

                let addButton = new gui.Button(this.buttonSize.width,this.buttonSize.height, [myColors.grey, 0, myColors.none], '+');
                addButton.position(this.inputSize.width/2 + this.buttonSize.width/2 + MARGIN, 0);
                addButton.text.color(myColors.white, 0, myColors.none).font('Arial', 30).position(0,10);
                addButton.back.corners(5,5);
                this.addFormationField = addFormationTextArea;
                this.addFormationManipulator.set(1, addButton.component);
                svg.addEvent(addButton.component, 'click', this.addFormationHandler.bind(this));
            }
            addFormationDisplay();

            this.miniaturesManipulator.move(2*MARGIN + this.tileWidth/2, this.tileHeight + 3*MARGIN);
            let formations = this.getFormations();
            this.numberFormation = formations.length;
            formations.forEach((formation,i) => {
                this._displayMiniature(formation, i);
            });
            this.panel.add(this.miniaturesManipulator.first);
        }

        addFormationMiniature(formation){
            this._displayMiniature(formation, this.numberFormation);
            this.numberFormation ++;
        }

        addFormationHandler(){
            this.presenter.createFormation(this.addFormationField.textMessage);
        }

        displayErrorMessage(message){
            let errorMessage = new svg.Text(message).color(myColors.red, 0, myColors.none);
            errorMessage.position(this.inputSize.width/2 + this.buttonSize.width + 3*MARGIN, 8.3)
                .font('Arial', 25)
                .anchor('left');
            this.addFormationManipulator.set(2, errorMessage);
            svg.timeout(()=>{
                this.addFormationManipulator.unset(2);
            }, 3000);
        }

        getFormations(){
            return this.presenter.getFormations();
        }
        

        refresh(){

        }

        _displayMiniature(formation, i){
            let createMiniature = (formation)=>{
                let polygon = util.drawHexagon(this.tileWidth, this.tileHeight, 'V', 1);
                let content = new svg.Text(formation.label).font('Arial',20);
                return {border: polygon, content: content};
            }
            let placeMiniature = (miniature, i)=>{
                let elementPerLine = Math.floor(drawing.width/(this.tileWidth + this.spaceBetween));
                let line = Math.floor(i/elementPerLine);
                let y = line*(this.tileWidth*1.5);
                let x = line%2 == 0 ? (i-line*elementPerLine)*(this.tileWidth+this.spaceBetween) : (i-line*elementPerLine)*(this.tileWidth + this.spaceBetween) + this.tileWidth/2 + MARGIN;
                miniature.manipulator.move(x,y);
            }
            let miniature = createMiniature(formation);
            miniature.manipulator = new Manipulator(this).addOrdonator(3);
            miniature.manipulator.set(0,miniature.border)
                .set(1,miniature.content);
            this.miniaturesManipulator.add(miniature.manipulator);
            placeMiniature(miniature, i);
            let onMouseOverSelect = manipulator => {
                manipulator.get(0).color([130, 180, 255], 3, myColors.black);
                manipulator.addEvent("mouseleave", () => onMouseOutSelect(miniature.manipulator));
            };
            let onMouseOutSelect = manipulator => {
                manipulator.get(0).color([250, 250, 250], 1, myColors.grey);
            };
            miniature.manipulator.addEvent("mouseenter", () => onMouseOverSelect(miniature.manipulator));
        }
    }
    return DashboardAdmin;
}