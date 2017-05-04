exports.DashboardCollabV = function(globalVariables){
const util = globalVariables.util,
    Manipulator = util.Manipulator,
    svg = globalVariables.svg,
    gui = globalVariables.gui,
    drawing = globalVariables.drawing;
    HeaderVue = globalVariables.domain.HeaderVue;
    createRating = globalVariables.domain.createRating;


    class DashboardCollabV {
        constructor(presenter){
            var _declareManipulator = () =>{
                this.manipulator = new Manipulator(this);
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.addFormationManipulator = new Manipulator(this).addOrdonator(3);

                this.manipulator
                    .add(this.miniaturesManipulator)
                    .add(this.addFormationManipulator)
                    .add(this.header.getManipulator());
            };
            var _declareDimension = () => {
                this.tileWidth = 120;
                this.tileHeight = 100;
                this.spaceBetween = 20;
                this.headHeight = this.header.height + MARGIN;
            };

            this.presenter = presenter;
            this.header = new HeaderVue();

            _declareDimension();
            _declareManipulator();
        }

        display(){
            var h = this.tileHeight;
            var _displayMiniature = (formation, i) => {
                let createMiniature = (formation)=>{
                    let polygon = util.drawHexagon(this.tileWidth, this.tileHeight, 'V', 1);
                    let content = new svg.Text(formation.label).font('Arial',20);
                    return {border: polygon, content: content};
                };
                let placeMiniature = (miniature, i)=>{
                    let elementPerLine = Math.floor(drawing.width/(this.tileWidth + this.spaceBetween));
                    let line = Math.floor(i/elementPerLine);
                    let y = line*(this.tileWidth*1.5);
                    let x = line%2 == 0 ? (i-line*elementPerLine)*(this.tileWidth+this.spaceBetween)
                        : (i-line*elementPerLine)*(this.tileWidth + this.spaceBetween) + this.tileWidth/2 + MARGIN;
                    miniature.manipulator.move(x,y);
                };
                let miniature = createMiniature(formation);
                miniature.manipulator = new Manipulator(this).addOrdonator(4);
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

                let createStars = () => {
                    let factor = 5;
                    let onStarClick = starObject => {
                        starMiniatures.showStarDefaultColor();
                        //todo
                       /* Server.updateSingleFormationStars(this.formation.formationId, starObject.id, this.formation._id).then(data => {
                            console.log(data);
                        });*/
                    };

                    let onStarHover = starObject => {
                        starMiniatures.pop.setText(starMiniatures.getNoteEnum()[starObject.id]);
                        starMiniatures.pop.show();
                        for(var i=0, id; starObject.id != id; i++){
                            starMiniatures[i].color(myColors.orange,0.2,myColors.orange);
                            id = starMiniatures[i].id;
                        }
                        onMouseOverSelect(miniature.manipulator);
                    };

                    let onStarLeave = () =>{
                        starMiniatures.pop.hide();
                        starMiniatures.showStarDefaultColor();
                    };

                    let starMiniatures = createRating(miniature.manipulator, 3);
                    starMiniatures.popMark(formation.label).popPosition(0, -h/2);


                    starMiniatures.forEach(
                        star => {
                            svg.addEvent(star, "click", () => onStarClick(star));
                            svg.addEvent(star, 'mouseenter', () => onStarHover(star));
                            svg.addEvent(star, 'mouseleave', () => onStarLeave(star));
                        }
                    );

                    starMiniatures.scaleStar(factor);
                    starMiniatures.starPosition(-(STAR_SPACE-1) * factor*3, - h / 3);

                    let notationText = new svg.Text('Notez cette \n formation :').position(0,-h*0.5).font('Arial', 12, 10);
                    miniature.manipulator.add(notationText);
                };

                (formation.progress == 'done') && createStars();

                miniature.manipulator.addEvent("mouseenter", () => onMouseOverSelect(miniature.manipulator));
                miniature.manipulator.addEvent("click", () => this.clickOnFormation(formation));
            };

            drawing.manipulator.set(0, this.manipulator);
            this.header.display("Dashboard");

            this.miniaturesManipulator.move(2*MARGIN + this.tileWidth/2, this.headHeight + this.tileHeight + 3*MARGIN);
            this.getFormations().forEach((formation, i) => {
                _displayMiniature(formation, i);
            });
        }

        clickOnFormation(formation){
            this.presenter.clickOnFormation(formation);
        }

        getFormations(){
            return this.presenter.getFormations();
        }

        refresh(){

        }
    }
    return DashboardCollabV;
}