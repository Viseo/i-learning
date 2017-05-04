exports.DashboardCollabV = function(globalVariables){
const util = globalVariables.util,
    Manipulator = util.Manipulator,
    svg = globalVariables.svg,
    gui = globalVariables.gui,
    drawing = globalVariables.drawing;
    HeaderVue = globalVariables.domain.HeaderVue;


    class DashboardCollabV {
        constructor(presenter){
            /*let createBack = ()=>{
                this.back = new svg.Rect(drawing.width-2*MARGIN, drawing.height - this.headHeight - this.tileHeight + 2*MARGIN)
                    .corners(5,5)
                    .color(myColors.white, 1, myColors.grey);
                this.back.position(this.back.width/2 - this.tileWidth/2-MARGIN, this.back.height/2-this.tileHeight - 1.5*MARGIN)
                this.title = new svg.Text('Formations :').font('Arial', 25).color(myColors.grey);
                this.titleBack = new svg.Rect(50, 30).color(myColors.white,0,myColors.none);
                this.miniaturesManipulator.set(0, this.back);
                this.panel = new gui.Panel(this.back.width, this.back.height, myColors.none)
                    .position(this.back.width/2 - this.tileWidth/2-MARGIN, this.back.height/2-this.tileHeight - 1.5*MARGIN);
                this.miniaturesManipulator.set(1, this.panel.component);
            }*/
            var _declareManipulator = () =>{
                this.manipulator = new Manipulator(this);
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.addFormationManipulator = new Manipulator(this).addOrdonator(3);

                this.manipulator
                    .add(this.miniaturesManipulator)
                    .add(this.addFormationManipulator);
            };

            this.presenter = presenter;

            this.header = new HeaderVue();
            this.tileWidth = 120;
            this.tileHeight = 100;
            this.spaceBetween = 20;
            this.lineNumber = 0;

            this.headHeight = this.header.height + MARGIN;
            this.inputSize = {width: 400, height:30};
            this.buttonSize= {width:40, height:30};
            _declareManipulator();
            //createBack();
        }


        display(){
            drawing.manipulator.add(this.manipulator);
            let headerManipulator = this.header.getManipulator();
            this.manipulator.add(headerManipulator);
            this.header.display("Dashboard");

            /*
            this.miniaturesManipulator.move(2*MARGIN + this.tileWidth/2,
                this.headHeight + this.tileHeight + 3*MARGIN);
            let formations = this.getFormations();
            this.numberFormation = formations.length;
            formations.forEach((formation,i) => {
                this._displayMiniature(formation, i);
            });*/
        }

       /*

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
*/
        /*_displayMiniature(formation, i){
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
                .add(miniature.content);
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
        }*/
    }
    return DashboardCollabV;
}