/**
 * Created by ACA3502 on 14/04/2016.
 */

function FormationsManager(formations, additionalMessage) {
    var self = this;

    self.header = new Header(additionalMessage);
    self.x = MARGIN;
    self.y = drawing.height * self.header.size + 3 * MARGIN;
    self.addButtonWidth = 330;
    self.addButtonHeight = 40;
    self.fontSize = 20;
    self.plusDim = self.fontSize * 2;
    self.iconeSize = self.plusDim/1.5;

    self.headerHeightFormation = drawing.height*self.header.size*2;
    self.puzzleRows = 6;
    self.initialFormationsPosX = MARGIN;
    self.rows = 6;
    self.lines = 4;
    self.tileWidth = (drawing.width - 2 * MARGIN * (self.rows + 1)) / self.rows;
    self.tileHeight = Math.floor(((drawing.height - self.headerHeightFormation - 2 * MARGIN * (self.rows + 1))) / self.lines);

    self.formations=[];
    var count = 0;
    formations.tab.forEach(function (formation) {
        self.formations[count] = new Formation(formation);
        count ++;
    });

    self.manipulator = new Manipulator(self);
    self.manipulator.first.move(0, drawing.height*0.075);
    mainManipulator.ordonator.set(1, self.manipulator.first);

    self.headerManipulator = new Manipulator(self);
    self.manipulator.last.add(self.headerManipulator.first);


    self.addButtonManipulator = new Manipulator(self);
    self.headerManipulator.last.add(self.addButtonManipulator.first);
    self.addButtonManipulator.translator.move(self.plusDim / 2, self.addButtonHeight);

    self.checkManipulator = new Manipulator(self);
    self.headerManipulator.last.add(self.checkManipulator.first);

    self.exclamationManipulator = new Manipulator(self);
    self.headerManipulator.last.add(self.exclamationManipulator.first);

    self.formationsManipulator = new Manipulator(self);
    //self.manipulator.last.add(self.formationsManipulator.first);

    window.onkeydown = function (event) {
        if(hasKeyDownEvent(event)) {
            event.preventDefault();
        }
    };

    hasKeyDownEvent = function (event) {
        self.target = self.panel;
        return self.target && self.target.processKeys && self.target.processKeys(event.keyCode);
    };

    self.clippingManipulator = new Manipulator(self);
    self.manipulator.last.add(self.clippingManipulator.first);
    self.clippingManipulator.translator.move(0, self.headerHeightFormation-MARGIN);

    var gui = new Gui();
    var totalLines = count%self.rows === 0 ? count/self.rows : count/self.rows+1;
    self.clippingManipulator.last.component.setAttribute("id", "anchorClipping");
    self.clipping = new Drawings(6*(MARGIN+self.tileWidth)+self.tileWidth/2, totalLines*(MARGIN+self.tileHeight), "anchorClipping");
    //self.clipping.show("anchorClipping");
    self.panel = new gui.Panel(drawing.width-2*MARGIN-2*self.tileWidth/2, (2*MARGIN+self.tileHeight)*(4)-self.tileHeight, myColors.node);
    self.panel.resizeContent(totalLines*(MARGIN+self.tileHeight)-self.tileHeight+MARGIN);
    self.clipping.drawing.manipulator.last.add(self.formationsManipulator.first);
    self.formationsManipulator.last.add(self.panel.translate);
    self.formationsManipulator.translator.move(self.tileWidth / 2, self.tileHeight/2-2*MARGIN);
    self.clippingManipulator.last.children.push(self.clipping.drawing.manipulator.first);

    function onClickFormation(formation) {
        console.log("Tu as bien cliqué");
        formation.displayFormation();
    }

    function onClickNewFormation() {
        var formation = new Formation({});
        console.log("Tu as bien cliqué pour ajouter une formation");
        formation.displayFormation();
    }

    self.display = function() {
        self.header.display();

        self.displayHeaderFormations = function () {
            self.title = new svg.Text("Formations").position(MARGIN, 0).font("Arial", 20).anchor("start");
            self.headerManipulator.last.add(self.title);
            self.addFormationButton = new svg.Text("Ajouter une formation");
            self.addFormationButton.position(MARGIN + self.plusDim, MARGIN / 2).font("Arial", 20).anchor("start");
            self.addButtonManipulator.last.add(self.addFormationButton);
            self.addFormationCadre = new svg.Rect(self.addButtonWidth, self.addButtonHeight).color(myColors.lightgrey).position(+self.addButtonWidth / 2 - MARGIN, 0);
            self.addButtonManipulator.ordonator.set(0, self.addFormationCadre);

            self.addFormationObject = drawPlusWithCircle(MARGIN, 0, self.addButtonHeight, self.addButtonHeight);
            self.addButtonManipulator.ordonator.set(2, self.addFormationObject.circle);
            self.addButtonManipulator.ordonator.set(3, self.addFormationObject.plus);
            self.addFormationObject.circle.position(MARGIN, 0);

            svg.addEvent(self.addFormationObject.circle, "click", onClickNewFormation);
            svg.addEvent(self.addFormationObject.plus, "click", onClickNewFormation);
            svg.addEvent(self.addFormationCadre, "click", onClickNewFormation);
            svg.addEvent(self.addFormationButton, "click", onClickNewFormation);

            self.legendDim = self.plusDim / 2;

            self.checkLegend = statusEnum.Published.icon(0, 0, self.iconeSize);
            self.checkManipulator.ordonator.set(2, self.checkLegend.square);
            self.checkManipulator.ordonator.set(3, self.checkLegend.check);
            self.published = autoAdjustText("Publié", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.checkManipulator).text.anchor("start");
            self.published.position(25, self.published.y);

            self.exclamationLegend = statusEnum.Edited.icon(self.iconeSize);
            self.exclamationManipulator.ordonator.set(0, self.exclamationLegend.circle);
            self.exclamationManipulator.ordonator.set(4, self.exclamationLegend.exclamation);
            self.exclamationManipulator.ordonator.set(2, self.exclamationLegend.dot);
            self.toPublish = autoAdjustText("Nouvelle version à publier", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.exclamationManipulator).text.anchor("start");
            self.toPublish.position(25, self.toPublish.y);

            self.legendWidth = self.toPublish.component.getBBox().width + 4 * MARGIN + 2 * self.iconeSize + 2*self.published.component.getBBox().width;

            self.checkManipulator.first.move(drawing.width - self.legendWidth, 30);
            self.exclamationManipulator.first.move(drawing.width - self.legendWidth + 3*self.published.component.getBBox().width, 30);

            //self.headerManipulator.translator.move(drawing.width - self.legendWidth, 0);
            //self.checkManipulator.translator.move(self.published.component.getBBox().width, 0);
            //self.exclamationManipulator.translator.move(2 * self.published.component.getBBox().width, 0);
            //self.toPublish.position(self.toPublish.component.getBBox().width / 2 + self.legendDim, self.toPublish.y);
        };

        self.formations.sort(function (a, b) {
            var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase();
            if (nameA < nameB)
                return -1;
            if (nameA > nameB)
                return 1;
            return 0
        });

        self.displayHeaderFormations();
        self.displayFormations = function () {
            var posx = self.initialFormationsPosX;
            var posy = MARGIN;
            var count = 0;
            for (var i = 0; i < self.formations.length; i++) {
                if (i !== 0) {
                    posx += (self.tileWidth + 2 * MARGIN);
                }
                if (count > (self.rows - 1)) {
                    count = 0;
                    posy += (self.tileHeight + 2 * MARGIN);
                    posx = self.initialFormationsPosX;
                }

                self.formations[i].parent = self;
                self.panel.content.add(self.formations[i].manipulatorMiniature.first);
                //self.formationsManipulator.translator.move(self.tileWidth / 2 - MARGIN, self.tileHeight / 2 + 3 * MARGIN);
                self.formations[i].displayMiniature(self.tileWidth, self.tileHeight);
                self.formations[i].manipulatorMiniature.translator.move(posx, posy + MARGIN);

                (function (element) {
                    if (element.miniature.cadre) {
                        svg.addEvent(element.miniature.cadre, "click", function () {
                            onClickFormation(element);
                        });
                    }

                    if (element.miniature.content) {
                        svg.addEvent(element.miniature.content, "click", function () {
                            onClickFormation(element);
                        });
                    }

                    if (element.miniature.image) {
                        svg.addEvent(element.miniature.image, "click", function () {
                            onClickFormation(element);
                        });
                    }

                })(self.formations[i]);
                count++;
            }
        };
        self.displayFormations();
    }
}