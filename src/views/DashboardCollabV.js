exports.DashboardCollabV = function (globalVariables) {
    const
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        PopOut = globalVariables.Icons.PopOut,
        IconCreator = globalVariables.Icons.IconCreator,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        View = globalVariables.View,
        ClipPath = globalVariables.clipPath;

    const TILE_SIZE = {w: 490, h: 100, rect: {w: 400, h: 100}},
        SPACE_BETWEEN = 20,
        CLIP_SIZE = 45,
        IMAGE_SIZE = 150;

    class DashboardCollabV extends View {
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
                    let paddingIconX = (IconCreator.getRadiusContent() * 2 + MARGIN);
                    this.undoneIcon = iconCreator.createUndoneIcon(this.toggleFormationsManipulator, 0);
                    this.undoneIcon.mark("unDoneIcon");
                    this.inProgressIcon = iconCreator.createInProgressIcon(this.toggleFormationsManipulator, 1);
                    this.inProgressIcon.position(paddingIconX, 0).mark('inProgressIcon');
                    this.doneIcon = iconCreator.createDoneIcon(this.toggleFormationsManipulator, 2);
                    this.doneIcon.position(2 * paddingIconX, 0).mark("doneIcon");
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
                            () => {
                                _toggleFilter(this.inProgressIcon, this.undoneIcon, this.doneIcon)
                            });
                        this.undoneIcon.addEvent('click',
                            () => {
                                _toggleFilter(this.undoneIcon, this.inProgressIcon, this.doneIcon)
                            });
                        this.doneIcon.addEvent('click',
                            () => {
                                _toggleFilter(this.doneIcon, this.undoneIcon, this.inProgressIcon)
                            });
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
            let _createBack = () => {
                let headHeight = this.header.height + MARGIN;
                this.panel = new gui.Panel(drawing.width - 2 * MARGIN, drawing.height - headHeight - TILE_SIZE.h + 2 * MARGIN, myColors.none);
                this.panel.position(this.panel.width / 2 + MARGIN,
                    this.panel.height / 2 + headHeight + 2 * MARGIN + 2 * this.doneIcon.getSize());
                this.backRect = new svg.Rect(5000, 5000) //TODO
                    .position(this.panel.width / 2, this.panel.height / 2)
                    .color(myColors.white, 0, myColors.none);
                this.panel.border.color(myColors.none, 1, myColors.grey).corners(5, 5);
                this.title = new svg.Text('Formations :').font(FONT, 25).color(myColors.grey);
                this.title.position(200, headHeight + 2 * MARGIN + 8.3 + 2 * this.doneIcon.getSize())
                this.titleBack = new svg.Rect(200, 3).color(myColors.white, 0, myColors.none);
                this.titleBack.position(200, headHeight + 2 * MARGIN + 2 * this.doneIcon.getSize());
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


        displayFormations() {
            var _displayMiniature = (formation, i, note) => {
                let _createMiniature = () => {
                    let manipulator = new Manipulator(this).addOrdonator(4).mark('miniature' + formation._id);
                    let border = new svg.Rect(TILE_SIZE.w - 2 * CLIP_SIZE, TILE_SIZE.h)
                        .corners(2, 2)
                        .color(myColors.lightgrey, 0.5, myColors.grey)
                        .position(2 * CLIP_SIZE / 2, 0);
                    let clip = new ClipPath('image' + formation._id);
                    clip.add(new svg.Circle(CLIP_SIZE).position(-TILE_SIZE.w / 2 + 2 * CLIP_SIZE, 0))
                    let picture = new svg.Image(formation.imageSrc ? formation.imageSrc : '../../images/viseo.png');
                    picture
                        .position(-TILE_SIZE.w / 2 + 2 * CLIP_SIZE, 0).dimension(IMAGE_SIZE, 2 * CLIP_SIZE)
                        .attr('clip-path', 'url(#image' + formation._id + ')');
                    let backCircle = new svg.Circle(CLIP_SIZE + 5)
                        .color(myColors.lightgrey, 0.5, myColors.grey)
                        .position(-TILE_SIZE.w / 2 + 2 * CLIP_SIZE, 0);
                    let content = new svg.Text(formation.label)
                        .position(CLIP_SIZE, -TILE_SIZE.h / 4)
                        .font(FONT, 20)
                        .mark('textMiniature' + formation._id);
                    resizeStringForText(content, TILE_SIZE.rect.w - 8 * MARGIN, TILE_SIZE.rect.h)
                    let icon = new IconCreator().createIconByName((formation.progress) ? formation.progress : "undone",
                        manipulator, 2);
                    icon.position(TILE_SIZE.w / 2, -TILE_SIZE.h / 2 - icon.getSize() / 2);
                    manipulator.set(0, border).set(1, backCircle).set(3, picture).add(clip).add(content);
                    return {
                        border: border,
                        clip: clip,
                        manipulator: manipulator,
                        backCircle: backCircle,
                        content: content
                    };
                };
                let _placeMiniature = (miniature, i) => {
                    let elementPerLine = Math.floor((drawing.width - 2 * MARGIN) / (TILE_SIZE.w + SPACE_BETWEEN));
                    elementPerLine = elementPerLine ? elementPerLine : 1;
                    let line = Math.floor(i / elementPerLine)
                    let y = line * (TILE_SIZE.h * 1.5);
                    let x = (i - line * elementPerLine) * (TILE_SIZE.w + SPACE_BETWEEN)
                    miniature.manipulator.move(x, y);
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
                }

                let _displayNotation = () => {
                    let displayNotationManip = new Manipulator(this);
                    let text = new svg.Text("Moyenne :").position(-3*MARGIN,-TILE_SIZE.h/3 + MARGIN);
                    let textNotation = new svg.Text(formation.note.toString().split('').slice(0, 4).join('')
                        + '/5 (' + formation.noteCounter
                        + ' votes)')
                        .font(FONT, 14, 15).anchor('end');
                    resizeStringForText(textNotation, 120, 10);
                    displayNotationManip.add(textNotation)
                    displayNotationManip.add(text);
                    displayNotationManip.move(TILE_SIZE.w / 2 - MARGIN, TILE_SIZE.h / 2 - MARGIN);
                    miniature.manipulator.add(displayNotationManip);
                    return textNotation;
                };


                let _createStars = () => {
                    let factor = 8;
                    let onStarClick = (starObject, textNotation) => {
                        starMiniatures.showActualStarColor();
                        this.updateSingleFormationStars(formation.formationId, starObject.id, formation._id).then((data) => {
                            let note = starObject.id.split('')[starObject.id.length - 1];
                            starMiniatures.defineNote(note);
                            textNotation.message(data.noteAverage + '/5 (' + data.noteCounter + ' votes)');
                        });
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
                        starMiniatures.showActualStarColor();
                    };

                   let textNotation = _displayNotation();
                    let starMiniatures = this.createRating(miniature.manipulator);
                    starMiniatures.forEach(
                        star => {
                            svg.addEvent(star, "click", () => onStarClick(star, textNotation));
                            svg.addEvent(star, 'mouseenter', () => onStarHover(star));
                            svg.addEvent(star, 'mouseleave', () => onStarLeave(star));
                        }
                    );
                    starMiniatures.popMark(formation.label);
                    starMiniatures.scaleStar(factor);
                    starMiniatures.starPosition(-TILE_SIZE.rect.w / 2 + CLIP_SIZE * 2 + MARGIN, TILE_SIZE.h / 2 - starMiniatures.getHeight() - MARGIN);

                    let notationText = new svg.Text('Notez cette formation :')
                        .position(-TILE_SIZE.rect.w / 2 + CLIP_SIZE * 2 + MARGIN, TILE_SIZE.h / 2 - starMiniatures.getHeight() - MARGIN - 14 / 3)
                        .font(FONT, 14, 15)
                        .anchor('left');
                    miniature.manipulator.add(notationText);

                    note && starMiniatures.defineNote(note.note);
                };

                let miniature = _createMiniature();
                this.miniaturesManipulator.add(miniature.manipulator);
                _placeMiniature(miniature, i);
                miniature.manipulator.addEvent("click", () => this.clickOnFormation(formation));
                _colorWhenHover();
                if (formation.progress === 'done') _createStars();
                _displayNotation();
            };

            this.getNotes().then((data) => {
                let notes = data;

                let indexShow = 0;
                this.getFormations().forEach((formation, i) => {
                    if (this.inProgressIcon.isInAction() && formation.progress !== 'inProgress') return;
                    if (this.doneIcon.isInAction() && formation.progress !== 'done') return;
                    if (this.undoneIcon.isInAction() && formation.progress !== 'undone') return;
                    let note = notes.filter(function (el) {
                        return (el.formationId === formation.formationId)
                    });
                    _displayMiniature(formation, indexShow++, note.length > 0 ? note[0] : null);
                });
                this.miniaturesManipulator.move(2 * MARGIN + TILE_SIZE.w / 2, TILE_SIZE.h / 2 + 3 * MARGIN);
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