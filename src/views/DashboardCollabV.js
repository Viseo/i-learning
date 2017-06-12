exports.DashboardCollabV = function (globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.Tool.IconCreator,
        createRating = globalVariables.Tool.createRating,
        resizeStringForText = globalVariables.Tool.resizeStringForText,
        View = globalVariables.View,
        ClipPath = globalVariables.clipPath;

    const TILE_SIZE = {w: 490, h: 100, rect: {w: 400, h: 100}},
        SPACE_BETWEEN = 20,
        CLIP_SIZE = 45,
        IMAGE_SIZE = 150;

    class DashboardCollabV extends View{
        constructor(presenter) {
            super(presenter);
        }

        display() {
            let _initManips = () => {
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(3);
                this.manipulator
                    .add(this.toggleFormationsManipulator);
            };
            var _displayIcons = () => {
                var _createIcon = () => {
                    let iconCreator = new IconCreator();
                    let paddingIconX =  (IconCreator.getRadiusContent() * 2 + MARGIN);
                    this.undoneIcon = iconCreator.createUndoneIcon(this.toggleFormationsManipulator, 0);
                    this.undoneIcon.content.mark("unDoneIcon");
                    this.inProgressIcon = iconCreator.createInProgressIcon(this.toggleFormationsManipulator, 1);
                    this.inProgressIcon.position(paddingIconX, 0).content.mark('inProgressIcon');
                    this.doneIcon = iconCreator.createDoneIcon(this.toggleFormationsManipulator, 2);
                    this.doneIcon.position(2 * paddingIconX, 0).content.mark("doneIcon");
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
                            this.displayFormations();
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
                let _placeIcons = () => {
                    let positionCaption = {
                        x: drawing.width - 4 * (IconCreator.getRadiusContent() + MARGIN) - MARGIN,
                        y: this.header.height + MARGIN + IconCreator.getRadiusContent()
                    };

                    this.toggleFormationsManipulator.move(positionCaption.x, positionCaption.y);
                }

                _createIcon();
                _createFilter();
                _placeIcons();
            };
            let _createBack = ()=>{
                let headHeight = this.header.height + MARGIN;
                this.panel = new gui.Panel(drawing.width-2*MARGIN, drawing.height - headHeight - TILE_SIZE.h + 2*MARGIN, myColors.none);
                this.panel.position(this.panel.width/2 +MARGIN ,
                    this.panel.height/2 + headHeight + 2*MARGIN + 2*this.doneIcon.getSize());
                this.backRect = new svg.Rect(5000, 5000) //TODO
                    .position(this.panel.width/2, this.panel.height/2)
                    .color(myColors.white, 0, myColors.none);
                this.panel.border.color(myColors.none, 1, myColors.grey).corners(5,5);
                this.title = new svg.Text('Formations :').font(FONT, 25).color(myColors.grey);
                this.title.position(200, headHeight + 2*MARGIN + 8.3  + 2*this.doneIcon.getSize())
                this.titleBack = new svg.Rect(200, 3).color(myColors.white,0,myColors.none);
                this.titleBack.position(200, headHeight + 2*MARGIN  + 2*this.doneIcon.getSize());
                this.manipulator.add(this.panel.component)
                    .add(this.titleBack)
                    .add(this.title)
                this.panel.content.add(this.backRect);
                this.panel.content.add(this.miniaturesManipulator.first);
            }
            
            super.display()
            _initManips();
            this.displayHeader("Dashboard");
            _displayIcons();
            _createBack();
            this.displayFormations();
        }

        displayFormations(){
            var _displayMiniature = (formation, i) => {
                let _createMiniature = () => {
                    let manipulator = new Manipulator(this).addOrdonator(4);
                    let border = new svg.Rect(TILE_SIZE.w-2*CLIP_SIZE, TILE_SIZE.h)
                        .corners(2,2)
                        .color(myColors.lightgrey, 0.5, myColors.grey)
                        .position(2*CLIP_SIZE/2, 0);
                    let clip = new ClipPath('image' + formation.label);
                    clip.add(new svg.Circle(CLIP_SIZE).position(-TILE_SIZE.w/2+ 2*CLIP_SIZE, 0))
                    let picture = new svg.Image(formation.imageSrc ? formation.imageSrc : '../../images/viseo.png');
                    picture
                        .position(-TILE_SIZE.w/2 + 2*CLIP_SIZE, 0).dimension(IMAGE_SIZE,2*CLIP_SIZE)
                        .attr('clip-path', 'url(#image' + formation.label +')');
                    let backCircle = new svg.Circle(CLIP_SIZE +5)
                        .color(myColors.lightgrey, 0.5, myColors.grey)
                        .position(-TILE_SIZE.w/2+2* CLIP_SIZE, 0);
                    let content = new svg.Text(formation.label)
                        .position(CLIP_SIZE, -TILE_SIZE.h/4)
                        .font(FONT,20)
                        .mark('textMiniature'+formation._id);
                    resizeStringForText(content, TILE_SIZE.rect.w - 8*MARGIN, TILE_SIZE.rect.h)
                    let icon = new IconCreator().createIconByName((formation.progress) ? formation.progress : "undone",
                        manipulator, 2);
                    icon.position(TILE_SIZE.w / 2, -TILE_SIZE.h /2- icon.getSize()/2);
                    manipulator.set(0,border).set(1,backCircle).set(3, picture).add(clip).add(content);
                    return {border: border, clip: clip, manipulator: manipulator, backCircle: backCircle, content:content};
                };
                let _placeMiniature = (miniature, i) => {
                    let elementPerLine = Math.floor((drawing.width-2*MARGIN)/(TILE_SIZE.w + SPACE_BETWEEN));
                    elementPerLine = elementPerLine ? elementPerLine : 1;
                    let line = Math.floor(i/elementPerLine)
                    let y = line*(TILE_SIZE.h*1.5);
                    let x = (i-line*elementPerLine)*(TILE_SIZE.w+SPACE_BETWEEN)
                    miniature.manipulator.move(x,y);
                };
                let _colorWhenHover = () => {
                    let onMouseOverSelect = miniature => {
                        miniature.border.color([130, 180, 255], 1, myColors.black);
                        miniature.backCircle.color([130, 180, 255], 1, myColors.black);
                        miniature.manipulator.addEvent("mouseleave", () => onMouseOutSelect(miniature));
                    };
                    let onMouseOutSelect = miniature => {
                        miniature.backCircle.color(myColors.lightgrey, 0.5, myColors.grey);
                        miniature.border.color(myColors.lightgrey, 0.5, myColors.grey);
                    };
                    miniature.manipulator.addEvent("mouseenter", () => onMouseOverSelect(miniature));
                    miniature.manipulator.addEvent("click", () => this.clickOnFormation(formation));
                }
                let _displayNotation = () => {
                    let displayNotationManip = new Manipulator(this);
                    let textNotation = new svg.Text(formation.note.toString().split('').slice(0,4).join('')
                        + '/5 (' + formation.noteCounter
                        + ' votes)')
                        .font(FONT, 14, 15).anchor('end');
                    resizeStringForText(textNotation, 120, 10);
                    displayNotationManip.add(textNotation);
                    displayNotationManip.move(TILE_SIZE.w/2 - MARGIN, TILE_SIZE.h/2 - MARGIN);
                    miniature.manipulator.add(displayNotationManip);
                }
                let _createStars = () => {
                    let factor = 8;
                    let onStarClick = starObject => {
                        starMiniatures.showStarDefaultColor();
                        //todo doit afficher une couleur Quand on a voter
                        this.updateSingleFormationStars(formation.formationId, starObject.id, formation._id);
                    };

                    let onStarHover = starObject => {
                        starMiniatures.pop.setText(starMiniatures.getNoteEnum()[starObject.id]);
                        starMiniatures.pop.show();
                        for (var i = 0, id; starObject.id != id; i++) {
                            starMiniatures[i].color(myColors.orange, 0.2, myColors.orange);
                            id = starMiniatures[i].id;
                        }
                        miniature.manipulator.event('mouseenter');
                    };

                    let onStarLeave = () => {
                        starMiniatures.pop.hide();
                        starMiniatures.showStarDefaultColor();
                    };

                    let starMiniatures = createRating(miniature.manipulator);
                    starMiniatures.popMark(formation.label).popPosition(CLIP_SIZE, TILE_SIZE.h/2 + 0.5*MARGIN);
                    starMiniatures.forEach(
                        star => {
                            svg.addEvent(star, "click", () => onStarClick(star));
                            svg.addEvent(star, 'mouseenter', () => onStarHover(star));
                            svg.addEvent(star, 'mouseleave', () => onStarLeave(star));
                        }
                    );
                    starMiniatures.scaleStar(factor);
                    starMiniatures.starPosition(  - TILE_SIZE.rect.w/2 + CLIP_SIZE*2 + MARGIN, TILE_SIZE.h/2 - starMiniatures.getHeight() - MARGIN);

                    let notationText = new svg.Text('Notez cette formation :')
                        .position(- TILE_SIZE.rect.w/2 + CLIP_SIZE*2 + MARGIN,  TILE_SIZE.h/2 - starMiniatures.getHeight() - MARGIN).font(FONT, 14, 15)
                        .anchor('left');
                    miniature.manipulator.add(notationText);
                };

                let miniature = _createMiniature();
                this.miniaturesManipulator.add(miniature.manipulator);
                _placeMiniature(miniature, i);
                _colorWhenHover();
                if(formation.progress === 'done') _createStars();
                _displayNotation();
            };

            this.getFormations().forEach((formation, i) => {
                if (this.inProgressIcon.isInAction() && formation.progress !== 'inProgress') return;
                if (this.doneIcon.isInAction() && formation.progress !== 'done') return;
                if (this.undoneIcon.isInAction() && formation.progress !== 'undone') return;
                _displayMiniature(formation, i);
            });
            this.miniaturesManipulator.move(2*MARGIN + TILE_SIZE.w/2, TILE_SIZE.h/2 + 3*MARGIN);
        }

        clickOnFormation(formation) {
            this.presenter.clickOnFormation(formation);
        }

        getFormations() {
            return this.presenter.getFormations();
        }

        updateSingleFormationStars(formationId, starId, versionId){
            this.presenter.updateSingleFormationStars(formationId, starId, versionId);
        }

    }
    return DashboardCollabV;
}