/**
 * Created by ACA3502 on 14/04/2016.
 */

function FormationsManager() {
    var self = this;
    //self.ilearningBandeau = new ??
    //self.x = document.body.clientWidth/15; //??
    self.x = 10;
    self.y = 20; //self.ilearningBandeau.height
    self.addButtonWidth = 330;
    self.addButtonHeight = 40;
    self.fontSize = 20;
    self.plusDim = self.fontSize*2;

    self.formationsManagerManipulator = new Manipulator();
    mainManipulator.ordonator.set(0,self.formationsManagerManipulator.first);
    self.title = autoAdjustText("Formations", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize, null, self.formationsManagerManipulator);
    self.title.text.position(-self.addButtonWidth/4,0);

    self.addButtonManipulator = new Manipulator();
    self.formationsManagerManipulator.last.add(self.addButtonManipulator.first);
    self.addButtonManipulator.translator.move(self.plusDim/2, self.addButtonHeight);
    self.addFormationButton = autoAdjustText("Ajouter une formation", -self.addButtonWidth/2, self.addButtonHeight/2, self.addButtonWidth, self.addButtonHeight, self.fontSize, null, self.addButtonManipulator);
    self.addFormationButton.text.position(self.x/2,self.addFormationButton.text.y);
    self.formationsManagerManipulator.translator.move(self.addButtonWidth/2, self.y);


    self.addFormationCadre = new svg.Rect(self.addButtonWidth, self.addButtonHeight).color(myColors.lightgrey).position(self.x,0);
    self.addButtonManipulator.ordonator.set(0,self.addFormationCadre);

    self.imageSrc = "../resource/plusSign.svg.png";

    self.dimImage = {width:self.plusDim, height:self.plusDim};

    self.addFormationObject = displayImage(self.imageSrc, self.dimImage, self.plusDim, self.plusDim).image;
    self.addButtonManipulator.ordonator.set(2, self.addFormationObject);
    self.addFormationObject.position(-self.addButtonWidth/2+self.plusDim, 0);


    function onClickAddFormation(){
        console.log("Tu as bien cliqué");
        //display();
    };

    svg.addEvent(self.addFormationObject, "click", onClickAddFormation);
    svg.addEvent(self.addFormationCadre, "click", onClickAddFormation);
    svg.addEvent(self.addFormationButton.text, "click", onClickAddFormation);

    self.legendManipulator = new Manipulator();
    self.formationsManagerManipulator.last.add(self.legendManipulator.first);
    self.legendManipulator.translator.move(document.body.clientWidth/1.5, 0);
    self.legendDim = self.plusDim/2;

    self.checkManipulator = new Manipulator();
    self.legendManipulator.last.add(self.checkManipulator.first);
    self.checkLegendSrc = "../resource/check.png";
    self.checkLegend = displayImage(self.checkLegendSrc, self.dimImage, self.legendDim, self.legendDim).image;
    self.legendManipulator.ordonator.set(2,self.checkLegend);
    self.published = autoAdjustText("Publié", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize/1.5, null, self.checkManipulator);
    self.checkManipulator.translator.move(self.published.text.component.getBBox().width,0);
    self.published.text.position(0, self.published.text.y);

    self.exclamationManipulator = new Manipulator();
    self.checkManipulator.last.add(self.exclamationManipulator.first);
    self.exclamationLegendSrc = "../resource/exclamation.png";
    self.exclamationLegend = displayImage(self.exclamationLegendSrc, self.dimImage, self.legendDim, self.legendDim).image;
    self.exclamationManipulator.ordonator.set(3,self.exclamationLegend);
    self.exclamationManipulator.translator.move(document.body.clientWidth/12, 0);
    self.toPublish = autoAdjustText("Nouvelle version à publier", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize/1.5, null, self.exclamationManipulator);
    self.toPublish.text.position(self.toPublish.text.component.getBBox().width/2+self.legendDim, self.toPublish.text.y);


};