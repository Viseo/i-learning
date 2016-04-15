/**
 * Created by ACA3502 on 14/04/2016.
 */

function FormationsManager(formations, additionalMessage) {
    var self = this;

    self.header = new Header(additionalMessage);
    self.header.display();
    self.x = MARGIN;
    self.y = drawing.height * self.header.size + 3 * MARGIN; //self.ilearningBandeau.height
    self.addButtonWidth = 330;
    self.addButtonHeight = 40;
    self.fontSize = 20;
    self.plusDim = self.fontSize * 2;
    self.formations = formations.tab;

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

    self.displayHeaderFormations = function() {
        self.title = new svg.Text("Formations").position(MARGIN, 0).font("Arial", 20).anchor("start");
        self.formationsManagerManipulator.last.add(self.title);
        self.addButtonManipulator.translator.move(self.plusDim / 2, self.addButtonHeight);
        self.addFormationButton = new svg.Text("Ajouter une formation");
        self.addFormationButton.position(MARGIN + self.plusDim, MARGIN / 2).font("Arial", 20).anchor("start");
        self.addButtonManipulator.last.add(self.addFormationButton);
        self.formationsManagerManipulator.translator.move(0, self.y);
        self.addFormationCadre = new svg.Rect(self.addButtonWidth, self.addButtonHeight).color(myColors.lightgrey).position(+self.addButtonWidth / 2 - MARGIN, 0);
        self.addButtonManipulator.ordonator.set(0, self.addFormationCadre);
        self.imageSrc = "../resource/plusSign.svg.png";
        self.dimImage = {width: self.plusDim, height: self.plusDim};
        self.addFormationObject = displayImage(self.imageSrc, self.dimImage, self.plusDim, self.plusDim).image;
        self.addButtonManipulator.ordonator.set(2, self.addFormationObject);
        self.addFormationObject.position(MARGIN, 0);

        svg.addEvent(self.addFormationObject, "click", onClickFormation);
        svg.addEvent(self.addFormationCadre, "click", onClickFormation);
        svg.addEvent(self.addFormationButton, "click", onClickFormation);

        self.legendManipulator.translator.move(document.body.clientWidth / 1.5, 0);
        self.legendDim = self.plusDim / 2;

        self.checkLegendSrc = "../resource/check.png";
        self.checkLegend = displayImage(self.checkLegendSrc, self.dimImage, self.legendDim, self.legendDim).image;
        self.legendManipulator.ordonator.set(2, self.checkLegend);
        self.published = autoAdjustText("Publié", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.checkManipulator);
        self.checkManipulator.translator.move(self.published.text.component.getBBox().width, 0);
        self.published.text.position(0, self.published.text.y);

        self.exclamationLegendSrc = "../resource/exclamation.png";
        self.exclamationLegend = displayImage(self.exclamationLegendSrc, self.dimImage, self.legendDim, self.legendDim).image;
        self.exclamationManipulator.ordonator.set(3, self.exclamationLegend);
        self.exclamationManipulator.translator.move(document.body.clientWidth / 12, 0);
        self.toPublish = autoAdjustText("Nouvelle version à publier", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize / 1.5, null, self.exclamationManipulator);
        self.toPublish.text.position(self.toPublish.text.component.getBBox().width / 2 + self.legendDim, self.toPublish.text.y);
    }

    self.formations.forEach(function (formation) {
        formation.formationManipulator = new Manipulator();
        //formation.display();
    });


    self.formations.sort(function (a, b) {
        var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase()
        if (nameA < nameB)
            return -1
        if (nameA > nameB)
            return 1
        return 0
    });


    self.puzzleRows = 6;
    self.tileWidth = 20;
    self.tileHeight = 20;
    self.initialFormationsPosX = 0;
    self.rows = 6;

    self.displayFormations = function(){
        var posx = 0;
        var posy = 0;
        var count = 0;
        for (var i = 0; i < self.formations.length; i++) {
            if (i !== 0) {
                posx += (self.tileWidth + MARGIN);
            }
            if (count > (self.rows - 1)) {
                count = 0;
                posy += (self.tileHeight + MARGIN);
                posx = self.initialFormationsPosX;
            }

            self.formationsManipulator.last.add(self.formations[i].formationManipulator.first);

            console.log(self.formations[i]);
            console.log(posx + " ___ " + posy);
            //self.formations[i].display(-self.tileWidth / 2, -self.tileHeight / 2, self.tileWidth, self.tileHeight);
            //self.formations[i].formationManipulator.translator.move(posx - (self.rows - 1) * self.tileWidth / 2 - (self.rows - 1) * MARGIN / 2, posy + MARGIN);

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

    self.displayHeaderFormations();
    self.displayFormations();

};