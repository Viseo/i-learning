exports.DashboardAdmin = function(globalVariables){
const util = globalVariables.util,
    Manipulator = util.Manipulator,
    svg = globalVariables.svg,
    drawing = globalVariables.drawing;

    class DashboardAdmin {
        constructor(presenter){
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this);
            this.manipulator.add(this.miniaturesManipulator);
            this.header = new globalVariables.domain.HeaderVue();
            this.tileWidth = 120;
            this.tileHeight = 100;
            this.spaceBetween = 20;
            this.lineNumber = 0;
        }

        display(){
            drawing.manipulator.add(this.manipulator);

            let headerManipulator = this.header.getManipulator();
            this.manipulator.add(headerManipulator);
            this.header.display("Dashboard");
            this.miniaturesManipulator.move(MARGIN + this.tileWidth/2,this.header.height + this.tileHeight + 2*MARGIN);

            let formations = this.getFormations();
            this.numberFormation = formations.length;
            formations.forEach((formation,i) => {
                this._displayMiniature(formation, i);
            })
        }

        getFormations(){
            return this.presenter.getFormations();
        }

        getLabels(){
            return this.presenter.getLabels();
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
            miniature.manipulator.add(miniature.border)
                .add(miniature.content);
            this.miniaturesManipulator.add(miniature.manipulator);
            placeMiniature(miniature, i);
        }
    }
    return DashboardAdmin;
}