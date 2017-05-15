exports.DashboardCollabV = function (globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        Server = util.Server,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        HeaderVue = globalVariables.domain.HeaderVue,
        IconCreator = globalVariables.domain.IconCreator,
        createRating = globalVariables.domain.createRating,
        View = globalVariables.View,
        ClipPath = globalVariables.clipPath;
    const TILE_SIZE = {w: 440, h: 100},
        INPUT_SIZE = {w: 400, h: 30},
        BUTTON_SIZE = {w: 40, h: 30},
        IMAGE_SIZE = 90;


    class DashboardCollabV extends View{
        constructor(presenter) {
            super(presenter);
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(3);

                this.manipulator
                    .add(this._getHeaderManipulator())
                    .add(this.toggleFormationsManipulator);
            };
            var _declareDimension = () => {
                this.tileWidth = 120;
                this.tileHeight = 100;
                this.spaceBetween = 20;
                this.headHeight = this.header.height + MARGIN;
            };
            var _declareIcons = () => {
                var _createIcon = () => {
                    let iconCreator = new IconCreator();

                    let paddingIconX =  (IconCreator.getRadiusContent() * 2 + MARGIN);
                    this.undoneIcon = iconCreator.createUndoneIcon(this.toggleFormationsManipulator, 0);
                    this.undoneIcon.content.mark("unDoneIcon");

                    this.inProgressIcon = iconCreator.createInProgressIcon(this.toggleFormationsManipulator, 1);
                    this.inProgressIcon.position(paddingIconX, 0).content.mark('inProgressIcon');

                    this.doneIcon = iconCreator.createDoneIcon(this.toggleFormationsManipulator, 2);
                    this.doneIcon.position(2 * paddingIconX, 0).content.mark("doneIcon");

                    let positionCaption = {
                        x: drawing.width - 4 * (IconCreator.getRadiusContent() + MARGIN) - MARGIN,
                        y: this.headHeight + IconCreator.getRadiusContent()
                    };

                    this.toggleFormationsManipulator.move(positionCaption.x, positionCaption.y);
                }
                var _createFilter = () => {
                    var _drawBorderFilter = () => {
                        this.undoneIcon.showActualBorder();
                        this.doneIcon.showActualBorder();
                        this.inProgressIcon.showActualBorder();
                    };
                    var _setIconClickEvent = () => {
                        var _toggleFilter = (iconActionReverse, iconCancelAction1, iconCancelAction2) => {
                            iconActionReverse.changeStatusActionIcon();
                            iconCancelAction1.cancelActionIcon();
                            iconCancelAction2.cancelActionIcon();
                            this.miniaturesManipulator.flush();
                            this._displayFormation();
                            _drawBorderFilter();
                        };
                        this.inProgressIcon.addEvent('click',
                            () => { _toggleFilter(this.inProgressIcon, this.undoneIcon, this.doneIcon)});
                        this.undoneIcon.addEvent('click',
                            () => { _toggleFilter(this.undoneIcon, this.inProgressIcon, this.doneIcon)});
                        this.doneIcon.addEvent('click',
                            () => { _toggleFilter(this.doneIcon, this.undoneIcon, this.inProgressIcon)});
                    };

                    _setIconClickEvent();
                };

                _createIcon();
                _createFilter();
            };

            _declareDimension();
            _declareManipulator();
            _declareIcons();
        }

        display() {
            drawing.manipulator.set(0, this.manipulator);
            let createBack = ()=>{
                this.panel = new gui.Panel(drawing.width-2*MARGIN, drawing.height - this.headHeight - this.tileHeight + 2*MARGIN, myColors.none);
                this.panel.position(this.panel.width/2 +MARGIN ,
                    this.panel.height/2 + this.headHeight + 2*MARGIN + 2*this.doneIcon.getSize());
                this.backRect = new svg.Rect(5000, 5000) //TODO
                    .position(this.panel.width/2, this.panel.height/2)
                    .color(myColors.white, 0, myColors.none);
                this.panel.border.color(myColors.none, 1, myColors.grey).corners(5,5);
                this.title = new svg.Text('Formations :').font('Arial', 25).color(myColors.grey);
                this.title.position(200, this.headHeight + 2*MARGIN + 8.3  + 2*this.doneIcon.getSize())
                this.titleBack = new svg.Rect(200, 3).color(myColors.white,0,myColors.none);
                this.titleBack.position(200, this.headHeight + 2*MARGIN  + 2*this.doneIcon.getSize());
                this.manipulator.add(this.panel.component)
                    .add(this.titleBack)
                    .add(this.title)
                this.panel.content.add(this.backRect);
                this.panel.content.add(this.miniaturesManipulator.first);
            }
            createBack();
            this._displayHeader("Dashboard");
            this._displayFormation();
        }

        _displayFormation(){
            var _displayMiniature = (formation, i) => {
                let createMiniature = (formation) => {
                    let border =
                        new svg.Rect(TILE_SIZE.w-IMAGE_SIZE, TILE_SIZE.h)
                            .corners(2,2)
                            .color(myColors.lightgrey, 0.5, myColors.grey)
                            .position(IMAGE_SIZE/2, 0);
                    let clip = new ClipPath('image' + formation.label);
                    clip.add(new svg.Circle(IMAGE_SIZE/2).position(-TILE_SIZE.w/2+ IMAGE_SIZE, 0))
                    let manipulator = new Manipulator(this).addOrdonator(4);
                    let picture;
                    if(formation.imageSrc){
                        picture = new util.Picture(formation.imageSrc, false, this)
                    }
                    else{
                        picture = new util.Picture('../../images/viseo.png', false, this, '', null);
                    }
                    picture.draw(-TILE_SIZE.w/2 + IMAGE_SIZE, 0, IMAGE_SIZE,IMAGE_SIZE,manipulator, 3);
                    picture.imageSVG.attr('clip-path', 'url(#image' + formation.label +')');
                    let backCircle = new svg.Circle(IMAGE_SIZE/2 +5).color(myColors.lightgrey, 0.5, myColors.grey).position(-TILE_SIZE.w/2+ IMAGE_SIZE, 0);
                    manipulator.set(0,border).set(1,backCircle).add(clip);
                    let content = new svg.Text(formation.label)
                        .position(IMAGE_SIZE/2, -TILE_SIZE.h/4)
                        .font('Arial', 20);
                    manipulator.add(content);
                    return {border: border, clip: clip, manipulator: manipulator, backCircle: backCircle, content:content};
                };

                let placeMiniature = (miniature, i) => {
                    let elementPerLine = Math.floor((drawing.width-2*MARGIN)/(TILE_SIZE.w + this.spaceBetween));
                    elementPerLine = elementPerLine ? elementPerLine : 1;
                    let line = Math.floor(i/elementPerLine)
                    let y = line*(TILE_SIZE.h*1.5);
                    let x = (i-line*elementPerLine)*(TILE_SIZE.w+this.spaceBetween)
                    miniature.manipulator.move(x,y);
                };

                let drawIcon = (formation) => {
                    let iconCreator = new IconCreator();
                    let icon = iconCreator.createIconByName((formation.progress) ? formation.progress : "undone",
                        miniature.manipulator, 2);
                    icon.position(TILE_SIZE.w / 2, -TILE_SIZE.h /2- icon.getSize()/2);
                };

                let miniature = createMiniature(formation);
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
                        //todo doit afficher une couleur Quand on a voter 
                        Server.updateSingleFormationStars(formation.formationId, starObject.id, formation._id)
                            .then(data => {
                                console.log(data);
                            });
                    };

                    let onStarHover = starObject => {
                        starMiniatures.pop.setText(starMiniatures.getNoteEnum()[starObject.id]);
                        starMiniatures.pop.show();
                        for (var i = 0, id; starObject.id != id; i++) {
                            starMiniatures[i].color(myColors.orange, 0.2, myColors.orange);
                            id = starMiniatures[i].id;
                        }
                        onMouseOverSelect(miniature.manipulator);
                    };

                    let onStarLeave = () => {
                        starMiniatures.pop.hide();
                        starMiniatures.showStarDefaultColor();
                    };

                    let starMiniatures = createRating(miniature.manipulator, 3);
                    starMiniatures.popMark(formation.label).popPosition(0, -this.tileHeight / 2);


                    starMiniatures.forEach(
                        star => {
                            svg.addEvent(star, "click", () => onStarClick(star));
                            svg.addEvent(star, 'mouseenter', () => onStarHover(star));
                            svg.addEvent(star, 'mouseleave', () => onStarLeave(star));
                        }
                    );

                    starMiniatures.scaleStar(factor);
                    starMiniatures.starPosition(-(STAR_SPACE - 1) * factor * 3, -this.tileHeight / 3);

                    let notationText = new svg.Text('Notez cette \n formation :').position(0, -this.tileHeight * 0.5).font('Arial', 12, 10);
                    miniature.manipulator.add(notationText);
                };

                drawIcon(formation);
                (formation.progress == 'done') && createStars();

                miniature.manipulator.addEvent("mouseenter", () => onMouseOverSelect(miniature.manipulator));
                miniature.manipulator.addEvent("click", () => this.clickOnFormation(formation));
            };

            this._moveMiniature(2 * MARGIN + this.tileWidth / 2,  this.tileHeight + 3 * MARGIN);

            var i = 0;
            this.getFormations().forEach((formation) => {
                if (this.inProgressIcon.isInAction() && formation.progress !== 'inProgress') return;
                if (this.doneIcon.isInAction() && formation.progress !== 'done') return;
                if (this.undoneIcon.isInAction() && formation.progress != '') return;
                _displayMiniature(formation, i++);
            });
            this.miniaturesManipulator.move(2*MARGIN + TILE_SIZE.w/2, TILE_SIZE.h/2 + 3*MARGIN);
        }

        _displayHeader(label) {
            this.header.display(label);
        }

        _getHeaderManipulator() {
            return this.header.getManipulator();
        }

        _moveMiniature(x, y) {
            this.miniaturesManipulator.move(x, y);
        }

        clickOnFormation(formation) {
            this.presenter.clickOnFormation(formation);
        }

        getFormations() {
            return this.presenter.getFormations();
        }

        refresh() {

        }
    }
    return DashboardCollabV;
}