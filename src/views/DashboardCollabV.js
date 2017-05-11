exports.DashboardCollabV = function (globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        Server = util.Server,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing;
    HeaderVue = globalVariables.domain.HeaderVue;
    IconCreator = globalVariables.domain.IconCreator;
    createRating = globalVariables.domain.createRating;


    class DashboardCollabV {
        constructor(presenter) {
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(3);

                this.manipulator
                    .add(this.miniaturesManipulator)
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

            this.presenter = presenter;
            this.header = new HeaderVue();

            _declareDimension();
            _declareManipulator();
            _declareIcons();
        }

        display() {
            drawing.manipulator.set(0, this.manipulator);
            this._displayHeader("Dashboard");
            this._displayFormation();
        }
        flush(){
            drawing.manipulator.flush();
        }
        _displayFormation(){
            var _displayMiniature = (formation, i) => {
                let createMiniature = (formation) => {
                    let polygon = util.drawHexagon(this.tileWidth, this.tileHeight, 'V', 1);
                    let content = new svg.Text(formation.label).font('Arial', 20);
                    return {border: polygon, content: content};
                };
                let placeMiniature = (miniature, i) => {
                    let elementPerLine = Math.floor(drawing.width / (this.tileWidth + this.spaceBetween));
                    let line = Math.floor(i / elementPerLine);
                    let y = line * (this.tileWidth * 1.5);
                    let x = line % 2 == 0 ? (i - line * elementPerLine) * (this.tileWidth + this.spaceBetween)
                        : (i - line * elementPerLine) * (this.tileWidth + this.spaceBetween) + this.tileWidth / 2 + MARGIN;
                    miniature.manipulator.move(x, y);
                };
                let drawIcon = (formation) => {
                    let iconCreator = new IconCreator();
                    let icon = iconCreator.createIconByName((formation.progress) ? formation.progress : "undone",
                        miniature.manipulator, 2);
                    icon.position(this.tileWidth / 4, -this.tileHeight * 2 / 3 - icon.getSize());
                };
                let miniature = createMiniature(formation);
                miniature.manipulator = new Manipulator(this).addOrdonator(4);
                miniature.manipulator.set(0, miniature.border)
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

            this._moveMiniature(2 * MARGIN + this.tileWidth / 2, this.headHeight + this.tileHeight + 3 * MARGIN);

            var i = 0;
            this.getFormations().forEach((formation) => {
                if (this.inProgressIcon.isInAction() && formation.progress !== 'inProgress') return;
                if (this.doneIcon.isInAction() && formation.progress !== 'done') return;
                if (this.undoneIcon.isInAction() && formation.progress != '') return;
                _displayMiniature(formation, i++);
            });
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