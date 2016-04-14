/**
 * Created by ACA3502 on 14/04/2016.
 */

function FormationsManager() {
    var self = this;
    //self.ilearningBandeau = new ??
    self.x = document.body.clientWidth/15; //??
    self.y = 50; //self.ilearningBandeau.height
    self.addButtonWidth = document.body.clientWidth/4;
    self.addButtonHeight = document.body.clientHeight/20;
    self.fontSize = 20;
    self.plusDim = self.fontSize*2;

    self.formationsManagerManipulator = new Manipulator();
    self.formationsManagerManipulator.translator.move(self.x, self.y);
    mainManipulator.ordonator.set(0,self.formationsManagerManipulator.first);
    //self.title = new svg.Text("Formations");
    //self.formationsManagerManipulator.last.add(self.title);
    //self.title.move
    self.title = autoAdjustText("Formations", 0, 0, self.addButtonWidth, self.addButtonHeight, self.fontSize, null, self.formationsManagerManipulator);
    //self.title.text.position(self.x, 0);

    self.addButtonManipulator = new Manipulator();
    self.formationsManagerManipulator.last.add(self.addButtonManipulator.first);
    self.addButtonManipulator.translator.move(self.plusDim/2, self.addButtonHeight);
    self.addFormationButton = autoAdjustText("Ajouter une formation", -self.addButtonWidth/2, self.addButtonHeight/2, self.addButtonWidth, self.addButtonHeight, self.fontSize, null, self.addButtonManipulator);
    //self.addFormationButton = displayTextWithoutCorners("Ajouter une formation", self.addButtonWidth, self.addButtonHeight, myColors.none, myColors.lightgrey, self.fontSize, null, self.addButtonManipulator);
    self.addFormationButton.text.position(self.plusDim + self.x/2,self.addFormationButton.text.y);

    self.addFormationCadre = new svg.Rect(self.addButtonWidth, self.addButtonHeight).color(myColors.lightgrey).position(self.x,0);
    self.addButtonManipulator.ordonator.set(0,self.addFormationCadre);

    self.imageSrc = "../resource/plusSign.svg.png";
    self.image = imageController.getImage(self.imageSrc, function () {
        self.imageLoaded = true;
        console.log(self.image);
        self.dimImage = {width:self.image.width, height:self.image.height};
    });

    self.dimImage = {width:self.plusDim, height:self.plusDim};
    console.log(self.dimImage);

    self.addFormationObject = displayImage(self.imageSrc, self.dimImage, self.plusDim, self.plusDim).image;
    self.addButtonManipulator.ordonator.set(2,self.addFormationObject);
    self.addFormationObject.position(-self.plusDim,0);

    function onClickAddFormation(){
        console.log("Tu as bien cliqué");
        //display();
    };

    svg.addEvent(self.addFormationObject, "click", onClickAddFormation);
    svg.addEvent(self.addFormationCadre, "click", onClickAddFormation);
    svg.addEvent(self.addFormationButton.text, "click", onClickAddFormation);

    self.legendManipulator = new Manipulator();
    self.formationsManagerManipulator.last.add(self.legendManipulator.first);
    self.legendManipulator.translator.move(document.body.clientWidth/2);
    self.checkLegendSrc = "../resource/check.png";
    self.checkLegend = displayImage(self.checkLegendSrc, self.dimImage, self.plusDim, self.plusDim).image;


};