exports.DashboardCollabV = function (globalVariables) {
    const
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        PopOut = globalVariables.Icons.PopOut,
        IconCreator = globalVariables.Icons.IconCreator,
        drawCheck = globalVariables.Helpers.drawCheck,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        View = globalVariables.View,
        ClipPath = globalVariables.clipPath;

    const TILE_SIZE = {w: 300, h: 450},
        SPACE_BETWEEN = 70,
        CLIP_SIZE = 45,
        INPUT_SIZE = {w: 400, h: 30},
        IMAGE_SIZE = {w:300, h:300};

    class DashboardCollabV extends View {
        constructor(presenter) {
            super(presenter);
            this.headerDim = {w:drawing.width, h:300};
        }

        display() {
            let _initManips = () => {
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(3);
                this.headerManip = new Manipulator(this);
                this.manipulator
                    .add(this.toggleFormationsManipulator);
            };
            let _createBack = () => {
                this.panel = new gui.Panel(drawing.width, drawing.height - this.headerDim.h, myColors.lightgrey)
                this.panel.position(this.panel.width / 2 , this.panel.height / 2 + this.headerDim.h);
                this.panel.border.color(myColors.none, 1, myColors.none).corners(5, 5);
                let hideElementBeforeEndOfPanel = new svg.Rect(this.panel.width, 20)
                    .color(myColors.lightgrey, 0, myColors.none)
                    .position(this.panel.component.x, this.panel.component.y-this.panel.height/2+ 10);
                this.panel.setScroll();
                let title = new svg.Text('FORMATIONS')
                    .font(FONT, 28).color([30,192,161])
                    .position(drawing.width/2, this.panel.component.y-this.panel.height/2+ 10)
                this.manipulator.add(this.panel.component)
                    .add(hideElementBeforeEndOfPanel)
                    .add(title)
                this.panel.content.add(this.miniaturesManipulator.first);
            }
            let displayHeader = ()=>{
                let _addSearchBar = (width, y)=>{
                    let manip = new Manipulator(this);
                    let searchZone = new svg.Rect(width, INPUT_SIZE.h + 1/2*MARGIN);
                    searchZone.corners(10,10).color(myColors.white, 2, [30,192,161])
                    manip.add(searchZone);
                    manip.move(drawing.width/2, y);
                    let searchIcon = new svg.Image('../../images/search.png').dimension(20,20)
                        .position(-width/2 + 2*MARGIN, 0);
                    let textArea = new gui.TextField(MARGIN,0, width-5*MARGIN, INPUT_SIZE.h-2, '');
                    textArea.control.placeHolder('Rechercher une formation')
                    textArea.color([myColors.white, 0, myColors.none]);
                    textArea.editColor([myColors.white, 0, myColors.none]);
                    textArea.font(FONT, 18);
                    textArea.text.font(FONT,18).position(textArea.text.x,6);
                    textArea.onInput((old,newm, valid)=>{
                        let regex = new RegExp(newm);
                        this.displayFormations(regex);
                    });
                    this.doneIconFilter = this.createIcon('done');
                    this.doneIconFilter.move(drawing.width/2,this.headerDim.h/2 - 3*MARGIN)
                    this.inProgressIconFilter = this.createIcon('inProgress');
                    this.inProgressIconFilter.move(drawing.width/2 - 100,this.headerDim.h/2 - 3*MARGIN)
                    this.undoneIconFilter = this.createIcon('undone');
                    this.undoneIconFilter.move(drawing.width/2 - 230,this.headerDim.h/2 - 3*MARGIN)
                    this.doneIconFilter.addEvent('click', ()=>{
                        this.toggleFilter('done')
                    })
                    this.undoneIconFilter.addEvent('click', ()=>{
                        this.toggleFilter('undone')
                    })
                    this.inProgressIconFilter.addEvent('click', ()=>{
                        this.toggleFilter('inProgress')
                    })
                    manip.add(this.doneIconFilter).add(this.undoneIconFilter).add(this.inProgressIconFilter);
                    manip.add(textArea.component)
                    manip.add(searchIcon)
                    return manip;
                }

                this.manipulator.add(this.headerManip.component);
                let backgroundPic = new svg.Image('../../images/german.png').dimension(drawing.width, drawing.width).position(drawing.width/2,0);
                this.headerManip.add(backgroundPic);
                let searchBar = _addSearchBar(2*INPUT_SIZE.w, this.headerDim.h/2);
                this.headerManip.add(searchBar);
            }

            super.display()
            _initManips();
            displayHeader();
            _createBack();
            this.displayHeader("Dashboard");
            this.displayFormations();
        }

        toggleFilter(type){
            this.inProgressIconFilter.background.color([], 0, []);
            this.undoneIconFilter.background.color([], 0, []);
            this.doneIconFilter.background.color([], 0, []);
            if(this.activeFilter == type){
                this.activeFilter = '';
            }else{
                this.activeFilter = type;
            }
            switch(type){
                case'done':
                    this.doneIconFilter.background.color([], 2, [30,192,161]);
                    break;
                case'undone':
                    this.undoneIconFilter.background.color([], 2, [0,108,216]);
                    break;
                case'inProgress':
                    this.inProgressIconFilter.background.color([], 2, myColors.orange);
                    break;
                default:
                    this.inProgressIconFilter.background.color([], 0, []);
                    this.undoneIconFilter.background.color([], 0, []);
                    this.doneIconFilter.background.color([], 0, []);
                    this.activeFilter = '';
            }
            this.displayFormations();
        }

        createIcon(type){
            let manip = new Manipulator(this);
            if (type == 'undone'){
                let pic = new svg.Image('../../images/play-button2.png').dimension(25,25).position(-100,0);
                let text = new svg.Text('Démarrer').font(FONT, 18).color([0,108,216]).position(-85,6).anchor('left');
                let background = new svg.Rect(120, 50).color([], 0, []).position(-60, 0);
                manip.add(background);
                manip.background = background;
                manip.add(pic).add(text)
                    .mark("unDoneIcon");
                return manip;
            }
            else if (type == 'done'){
                let rect = new svg.Rect(20,20).color(myColors.none, 2, [30,192,161]);
                let check = drawCheck(-70,0,15).color([], 2, [30,192,161]);
                let text = new svg.Text('Faite').font(FONT, 18).color([30,192,161]).position(-50,6).anchor('left');
                let background = new svg.Rect(100, 50).color([], 0, []).position(-50, 0);
                manip.add(background);
                manip.background = background;
                rect.position(-70, 0);
                manip.add(rect).add(check).add(text)
                    .mark("doneIcon");
                return manip;
            }else if (type == 'inProgress'){
                let pic = new svg.Image('../../images/time-left.png').dimension(25,25).position(-100,0);
                let text = new svg.Text('En cours').font(FONT, 18).color(myColors.orange).position(-80,6).anchor('left');
                let background = new svg.Rect(120, 50).color([], 0, []).position(-60, 0);
                manip.add(background);
                manip.background = background;
                manip.add(pic).add(text)
                    .mark("inProgressIcon");
                return manip;
            }
        }

        displayFormations(searchRegex) {
            var _displayMiniature = (formation, i, note) => {
                let _createMiniature = () => {
                    let miniature = {};
                    border = new svg.Rect(TILE_SIZE.w, TILE_SIZE.h)
                        .corners(2, 2)
                        .color(myColors.white, 0.5, myColors.grey)
                        .mark("miniatureBorder" + formation.label);
                    shadow = new svg.Rect(TILE_SIZE.w, TILE_SIZE.h)
                        .corners(2, 2)
                        .color(myColors.halfGrey, 0, myColors.none)
                        .position(3, 3)
                        .mark("miniatureBorder" + formation.label);
                    let statusIcon = this.createIcon(formation.progress);
                    if (statusIcon) {
                        statusIcon.move(TILE_SIZE.w / 2, (-TILE_SIZE.h / 2 + IMAGE_SIZE.h) + 3 * MARGIN);
                        manipulator.add(statusIcon);
                    }
                    let picture = new svg.Image(formation.imageSrc ? formation.imageSrc : '../../images/viseo.png');
                    picture
                        .position(0, -(TILE_SIZE.h - IMAGE_SIZE.h) / 2)
                        .dimension(IMAGE_SIZE.w, IMAGE_SIZE.h)
                    let content = new svg.Text(formation.label)
                        .position(-TILE_SIZE.w / 2 + MARGIN, (-TILE_SIZE.h / 2 + IMAGE_SIZE.h) + 3 * MARGIN + 7.3)
                        .font(FONT, 22)
                        .anchor('left').mark("textMiniature" + formation._id);
                    let description = new svg.Text('Description')
                        .position(-TILE_SIZE.w / 2 + MARGIN, (-TILE_SIZE.h / 2 + IMAGE_SIZE.h) + 6 * MARGIN + 5.3)
                        .font(FONT, 16)
                        .anchor('left');
                    manipulator.add(content)
                        .add(description)
                        .set(0, shadow)
                        .set(1, border)
                        .set(2, picture);
                    this.miniaturesManipulator.add(manipulator);
                    resizeStringForText(content, TILE_SIZE.w - 100, TILE_SIZE.h);
                    if (formation.status === 'Published') {
                        let displayNotationManip = new Manipulator(this);
                        let textNotation = new svg.Text('Moyenne : '
                            + formation.note
                            + '/5 (' + formation.noteCounter
                            + ' votes)')
                            .font(FONT, 14, 15).anchor('end');
                        resizeStringForText(textNotation, 120, 10);
                        displayNotationManip.add(textNotation);
                        displayNotationManip.move(TILE_SIZE.w / 2 - MARGIN, TILE_SIZE.h / 2 - MARGIN);
                        manipulator.add(displayNotationManip);
                        miniature.average = textNotation;
                    }
                    return miniature;
                };
                let _placeMiniature = (manip, i) => {
                    let elementPerLine = Math.floor((drawing.width - 2 * MARGIN) / (TILE_SIZE.w + SPACE_BETWEEN/2));
                    elementPerLine = elementPerLine ? elementPerLine : 1;
                    let line = Math.floor(i / elementPerLine)
                    let y = line * (TILE_SIZE.h * 1.1);
                    let x = (i - line * elementPerLine) * (TILE_SIZE.w + SPACE_BETWEEN)
                    manip.move(x, y);
                };
                let _colorWhenHover = () => {
                    let onMouseOverSelect = miniature => {
                        border.color([130, 180, 255], 1, myColors.black);
                        shadow.position(6,6);
                        manipulator.addEvent("mouseleave", () => onMouseOutSelect(miniature));
                    };
                    let onMouseOutSelect = miniature => {
                        border.color(myColors.white, 0.5, myColors.grey);
                        shadow.position(3,3);
                    };
                    manipulator.addEvent("mouseenter", () => onMouseOverSelect(miniature));
                }
                let _createStars = () => {
                    let factor = 7;
                    let onStarClick = (starObject) => {
                        starMiniatures.showActualStarColor();
                        this.updateSingleFormationStars(formation.formationId, starObject.id, formation._id).then((data) => {
                            let note = starObject.id.split('')[starObject.id.length - 1];
                            starMiniatures.defineNote(note);
                            miniature.average.message('Moyenne : ' + data.noteAverage + '/5 (' + data.noteCounter + ' votes)');
                        });
                    };

                    let onStarHover = starObject => {
                        starMiniatures.pop.setText(starMiniatures.getNoteEnum()[starObject.id]);
                        starMiniatures.pop.show();
                        for (var i = 0, id; starObject.id != id; i++) {
                            starMiniatures[i].color(myColors.orange, 0.2, myColors.orange);
                            id = starMiniatures[i].id;
                        }
                        manipulator.event('mouseenter');
                    };

                    let onStarLeave = () => {
                        starMiniatures.pop.hide();
                        starMiniatures.showActualStarColor();
                    };

                    let starMiniatures = this.createRating(manipulator);
                    starMiniatures.forEach(
                        star => {
                            svg.addEvent(star, "click", () => onStarClick(star));
                            svg.addEvent(star, 'mouseenter', () => onStarHover(star));
                            svg.addEvent(star, 'mouseleave', () => onStarLeave(star));
                        }
                    );
                    starMiniatures.popMark(formation.label);
                    starMiniatures.scaleStar(factor);
                    starMiniatures.starPosition(-TILE_SIZE.w / 2 + MARGIN, TILE_SIZE.h / 2 - starMiniatures.getHeight() - MARGIN);

                    let notationText = new svg.Text('Notez cette formation :')
                        .position(-TILE_SIZE.w / 2 + MARGIN, TILE_SIZE.h / 2 - starMiniatures.getHeight() - MARGIN - 14 / 3)
                        .font(FONT, 14, 15)
                        .anchor('left');
                    manipulator.add(notationText);

                    note && starMiniatures.defineNote(note.note);
                };
                let border, shadow;
                let manipulator = new Manipulator(this).addOrdonator(4).mark("miniatureManip" + formation.label);
                let miniature = _createMiniature();
                this.miniaturesManipulator.add(manipulator);
                _placeMiniature(manipulator, i);
                manipulator.addEvent("click", () => this.clickOnFormation(formation));
                manipulator.mark("miniature" + formation._id);
                _colorWhenHover();
                if (formation.progress === 'done') _createStars();

            };
            this.miniaturesManipulator.flush();
            this.getNotes().then((data) => {
                let notes = data;

                let indexShow = 0;
                this.getFormations().forEach((formation, i) => {
                    if (this.activeFilter && this.activeFilter == 'inProgress' && formation.progress !== 'inProgress') return;
                    if (this.activeFilter && this.activeFilter == 'done' && formation.progress !== 'done') return;
                    if (this.activeFilter && this.activeFilter == 'undone' && formation.progress !== 'undone') return;
                    if(searchRegex && !formation.label.match(searchRegex)) return;
                    let note = notes.filter(function (el) {
                        return (el.formationId === formation.formationId)
                    });
                    _displayMiniature(formation, indexShow++, note.length > 0 ? note[0] : null);
                });
                let x = this.miniaturesManipulator.component.boundingRect();
                let posX = TILE_SIZE.w/2 + this.panel.width/2;
                (x) && (posX += - x.width/2);
                this.miniaturesManipulator.move(posX, TILE_SIZE.h / 2 + 3 * MARGIN);
            });

        }

        createRating(manipulator, layer) {
            const STAR_SPACE = 1;
            const defaultColor = {
                fillColor: myColors.ultraLightGrey,
                strokeWidth: 0.1,
                strokeColor: myColors.brown
            };

            const ratingColor = {
                fillColor: myColors.yellow,
                strokeWidth: 0.2,
                strokeColor: myColors.yellow
            };

            const starsNoteEnum = {
                'star1': 'Pas Terrible',
                'star2': 'Passable',
                'star3': 'Correcte',
                'star4': 'Bien',
                'star5': 'Excellente'
            };

            let star = [];
            let starPoints = [
                [1.309, 0], [1.6180, 0.9511], [2.6180, 0.9511], [1.8090, 1.5388], [2.118, 2.4899],
                [1.3090, 1.9021], [0.5, 2.4899], [0.8090, 1.5388], [0, 0.9511], [1, 0.9511]
            ];

            var _impGetSize = () => {

                star.width = starPoints[2][0];
                star.height = starPoints[4][1];
                star.factor = 1;

                star.getWidth = function () {
                    return star.factor * (star.width + STAR_SPACE) * 5;
                };

                star.getHeight = function () {
                    return star.factor * star.height;
                }
            };

            var _createDrawStars = () => {
                star.starsManipulator = new Manipulator(this).addOrdonator(5);
                for (var i = 0; i < 5; i++) {
                    star[i] = new svg.Polygon().add(starPoints).position((star.width + STAR_SPACE) * i, 0)
                        .color(defaultColor.fillColor, defaultColor.strokeWidth, defaultColor.strokeColor)
                        .mark("star" + (i + 1));
                    star.starsManipulator.add(star[i]);
                }
            };
            var _createPopOut = () => {
                star.pop = new PopOut(80, 30, null, manipulator, true);
                star.pop.setPanel();
            };


            _impGetSize();
            _createDrawStars(star);
            _createPopOut();

            if (layer) {
                manipulator.set(layer, star.starsManipulator);
            }
            else {
                manipulator.add(star.starsManipulator);
            }
            star.scaleStar = function (factor) {
                star.factor = factor;
                this.starsManipulator.scalor.scale(factor);
                this.popPosition(this.getWidth() / 2, 0);

                return this;
            };

            star.popMark = function (label) {
                this.pop.manipulator.mark(label + 'StarMiniatures');
                this.starsManipulator.mark(label + 'StarManip');
                return this;
            };


            star.showActualStarColor = function () {
                this.forEach((elem, index) => {
                    if (this.note && this.note > 0 && index < this.note) {
                        elem.color(ratingColor.fillColor, ratingColor.strokeWidth, ratingColor.strokeColor);
                    } else {
                        elem.color(defaultColor.fillColor, defaultColor.strokeWidth, defaultColor.strokeColor)
                    }
                });
            };

            star.defineNote = function (nbElements) {
                this.note = nbElements;
                this.showActualStarColor();
            };

            star.starPosition = function (x, y) {
                this.starsManipulator.move(x, y);
                star.popPosition(x + this.getWidth() / 2, y);
                return this;
            };

            star.getNoteEnum = function () {
                return starsNoteEnum;
            };

            star.popPosition = function (x, y) {
                this.pop.defineProperty(x, y);
                return this;
            };

            return star;
        }

        clickOnFormation(formation) {
            this.presenter.clickOnFormation(formation);
        }

        getFormations() {
            return this.presenter.getFormations();
        }

        updateSingleFormationStars(formationId, starId, versionId) {
            return this.presenter.updateSingleFormationStars(formationId, starId, versionId);
        }

        getNotes() {
            return this.presenter.getNotes();
        }

    }
    return DashboardCollabV;
}