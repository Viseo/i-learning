/**
 * Created by qde3485 on 25/02/16.
 */

/**
 *
 * @param label : texte à afficher pour la réponse
 * @param imageSrc : lien relatif vers l'image. Peut-être vide/null/indéfini si aucune image
 * @param bCorrect : booléen qui indique si la réponse est correcte
 * @param colorBordure : objet de 3 éléments (r, g, b) correspondant aux composantes couleur de la bordure associée à la réponse
 * @param bgColor : objet de 3 élements (r, g, b) correspondant aux composantes couleur du fond
 * @constructor
 */
/*label, imageSrc, bCorrect, colorBordure, bgColor*/
var Answer = function (answerParameters) {
    var self = this;

    var answer={
        label:'',
        imageSrc:null,
        bCorrect:false
    };
    answerParameters && (answer=answerParameters);
    self.answerManipulator=new Manipulator(self);
    self.label = answer.label;
    self.imageSrc = answer.imageSrc;
    self.correct = answer.bCorrect;
    self.selected = false;

    self.fontSize = answer.fontSize ? answer.fontSize : 20;
    answer.font && (self.font = answer.font);

    self.imageLoaded = false;

    if(answer.imageSrc) {
        self.image = imageController.getImage(self.imageSrc, function () {
            self.imageLoaded = true;
            self.dimImage = {width:self.image.width, height:self.image.height};
        });
        self.imageLoaded = false;
    } else {
        self.imageLoaded = true;
    }

    self.rgbBordure = self.label ? answer.colorBordure : myColors.black;
    self.bgColor = answer.bgColor ? answer.bgColor : myColors.none;

    self.bordure = null;
    self.content = null;

    /**
     *
     * @param x : position en X
     * @param y : position en Y
     * @param w : width
     * @param h : height
     */

    self.display = function (x, y, w, h) {

        if(typeof x !=='undefined'){
            self.x=x;
        }
        if(typeof y !=='undefined'){
            self.y=y;
        }
        w && (self.w=w);
        h && (self.h=h);



        // Question avec Texte ET image
        if(self.label && self.imageSrc) {
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.dimImage, self.w, self.h, self.rgbBordure, self.bgColor, self.fontSize, self.font, self.answerManipulator,self.image);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.image = objectTotal.image;

        }
        // Question avec Texte uniquement
        else if(self.label && !self.imageSrc) {
            var object = displayText(self.label, self.w, self.h, self.rgbBordure, self.bgColor, self.fontSize, self.font, self.answerManipulator);
            self.bordure = object.cadre;
            self.content = object.content;

        }
        // Question avec Image uniquement
        else if(self.imageSrc && !self.label) {
            var obj = displayImageWithBorder(self.imageSrc, self.dimImage, self.w, self.h, self.answerManipulator);
            self.image = obj.image;
            self.bordure = obj.cadre;

        }
        // Cas pour test uniquement : si rien, n'affiche qu'une bordure
        else {
            self.bordure = new svg.Rect(self.w, self.h).color(self.bgColor, 1, myColors.black).corners(25, 25);
            self.answerManipulator.last.add(self.bordure);

        }
        if(self.selected){// image pré-selectionnée
            //self.bordure.color(null,5,myColors.red);
            self.bordure.color(self.bgColor,5,myColors.red);

        }
        self.answerManipulator.translator.move(self.x,self.y);

    };



};