/**
 * Created by ACA3502 on 14/04/2016.
 */

function FormationsManager(formations, additionalMessage) {
    var self = this;

    self.header = new Header(additionalMessage);
    self.x = MARGIN;
    self.y = drawing.height * self.header.size + 3 * MARGIN; //self.ilearningBandeau.height
    self.addButtonWidth = 330;
    self.addButtonHeight = 40;
    self.fontSize = 20;
    self.plusDim = self.fontSize * 2;
    self.iconeSize = self.plusDim/1.5;

    self.formations=[];
    count = 0;
    formations.tab.forEach(function (formation) {
        self.formations[count] = new Formation(formation);
        count ++;
        //formation.display();
    });

    self.formationsManagerManipulator = new Manipulator();
    self.addButtonManipulator = new Manipulator();
    self.header.manipulator.last.add(self.formationsManagerManipulator.first);
    self.formationsManagerManipulator.last.add(self.addButtonManipulator.first);
    self.legendManipulator = new Manipulator();
    self.formationsManagerManipulator.last.add(self.legendManipulator.first);
    self.checkManipulator = new Manipulator();
    self.legendManipulator.last.add(self.checkManipulator.first);
    self.exclamationManipulator = new Manipulator();
    self.checkManipulator.last.add(self.exclamationManipulator.first);
    self.formationsManipulator = new Manipulator();
    self.addButtonManipulator.last.add(self.formationsManipulator.first);


    function onClickFormation(formation) {
        console.log("Tu as bien cliqué");
        //formation.display();
    };

    self.display = function() {
        self.header.display();

        self.displayHeaderFormations = function () {
            self.title = new svg.Text("Formations").position(MARGIN, 0).font("Arial", 20).anchor("start");
            self.formationsManagerManipulator.last.add(self.title);
            self.addButtonManipulator.translator.move(self.plusDim / 2, self.addButtonHeight);
            self.addFormationButton = new svg.Text("Ajouter une formation");
            self.addFormationButton.position(MARGIN + self.plusDim, MARGIN / 2).font("Arial", 20).anchor("start");
            self.addButtonManipulator.last.add(self.addFormationButton);
            self.formationsManagerManipulator.translator.move(0, self.y);
            self.addFormationCadre = new svg.Rect(self.addButtonWidth, self.addButtonHeight).color(myColors.lightgrey).position(+self.addButtonWidth / 2 - MARGIN, 0);
            self.addButtonManipulator.ordonator.set(0, self.addFormationCadre);

            self.addFormationObject = drawPlusWithCircle(MARGIN, 0, self.addButtonHeight, self.addButtonHeight);
            self.addButtonManipulator.ordonator.set(2, self.addFormationObject.circle);
            self.addButtonManipulator.ordonator.set(3, self.addFormationObject.plus);
            self.addFormationObject.circle.position(MARGIN, 0);


            svg.addEvent(self.addFormationObject.circle, "click", onClickFormation);
            svg.addEvent(self.addFormationObject.plus, "click", onClickFormation);
            svg.addEvent(self.addFormationCadre, "click", onClickFormation);
            svg.addEvent(self.addFormationButton, "click", onClickFormation);

            self.legendDim = self.plusDim / 2;

            self.checkLegend = drawCheckSquare(0, 0, self.iconeSize);
            self.legendManipulator.ordonator.set(2, self.checkLegend.square);
            self.legendManipulator.ordonator.set(3, self.checkLegend.check);
            self.published = autoAdjustText("Publié", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.checkManipulator);
            self.headerHeightFormation = self.addButtonHeight + 2 * MARGIN + drawing.height * self.header.size;
            self.published.text.position(0, self.published.text.y);

            self.exclamationLegend = drawExclamationCircle(self.iconeSize);
            self.exclamationManipulator.ordonator.set(0, self.exclamationLegend.circle);
            self.exclamationManipulator.ordonator.set(4, self.exclamationLegend.exclamation);
            self.exclamationManipulator.ordonator.set(2, self.exclamationLegend.dot);
            self.toPublish = autoAdjustText("Nouvelle version à publier", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.exclamationManipulator);

            self.legendWidth = self.toPublish.text.component.getBBox().width + 6 * MARGIN + 2 * self.iconeSize + self.published.text.component.getBBox().width;

            self.legendManipulator.translator.move(drawing.width - self.legendWidth, 0);
            self.checkManipulator.translator.move(self.published.text.component.getBBox().width, 0);
            self.exclamationManipulator.translator.move(2 * self.published.text.component.getBBox().width, 0);
            self.toPublish.text.position(self.toPublish.text.component.getBBox().width / 2 + self.legendDim, self.toPublish.text.y);
        }


        self.formations.sort(function (a, b) {
            var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase()
            if (nameA < nameB)
                return -1
            if (nameA > nameB)
                return 1
            return 0
        });

        self.displayHeaderFormations();

        self.puzzleRows = 6;

        self.initialFormationsPosX = MARGIN;
        self.rows = 6;
        self.lines = 4;

        self.tileWidth = (drawing.width - 2 * MARGIN * (self.rows + 1)) / self.rows;

        self.tileHeight = Math.floor(((drawing.height - self.headerHeightFormation - 2 * MARGIN * (self.rows + 1))) / self.lines);

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

                self.formationsManipulator.last.add(self.formations[i].manipulatorMiniature.first);
                self.formationsManipulator.translator.move(self.tileWidth / 2 - MARGIN, self.tileHeight / 2 + 3 * MARGIN);

                self.formations[i].displayMiniature(self.tileWidth, self.tileHeight);
                self.formations[i].manipulatorMiniature.translator.move(posx, posy + MARGIN);

                (function (element) {
                    if (element.bordure) {
                        svg.addEvent(element.bordure, "click", function () {
                            onClickFormation(element);
                        });
                    }

                    if (element.content) {
                        svg.addEvent(element.content, "click", function () {
                            onClickFormation(element);
                        });
                    }

                    if (element.image) {
                        svg.addEvent(element.image, "click", function () {
                            onClickFormation(element);
                        });
                    }

                })(self.formations[i]);

                count++;
            }
        }

        self.displayFormations();
    }

};