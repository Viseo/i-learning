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
var Answer = function (answer) {
    var self = this;
    self.answerManipulator=new Manipulator();
    self.label = answer.label;
    self.imageSrc = answer.imageSrc;
    self.correct = answer.bCorrect;
    self.selected = false;

    if(answer.fontSize) {
        self.fontSize = answer.fontSize;
    } else {
        self.fontSize = 20;
    }

    if(answer.font) {
        self.font = answer.font;
    }

    self.imageLoaded = false;

    if(answer.imageSrc) {
        self.image = imageController.getImage(self.imageSrc, function () {
            self.imageLoaded = true;
        });
        self.imageLoaded = false;
    } else {
        self.imageLoaded = true;
    }

    self.label ? (self.rgbBordure = answer.colorBordure):(self.rgbBordure = myColors.none);
    answer.bgColor ? (self.bgColor = answer.bgColor):(self.bgColor = myColors.none);

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
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.image, self.w,self.h, self.rgbBordure, self.bgColor, self.fontSize, self.font, self.answerManipulator);
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
            var obj = displayImageWithBorder(self.imageSrc, self.image, self.w, self.h, self.answerManipulator);
            self.image = obj.image;
            self.bordure = obj.cadre;

        }
        // Cas pour test uniquement : si rien, n'affiche qu'une bordure
        else {
            self.bordure = new svg.Rect(self.w, self.h).color(self.bgColor,1, self.rgbBordure);
            self.answerManipulator.last.add(self.bordure);

        }
        if(self.selected){// image pré-selectionnée
            //self.bordure.color(null,5,myColors.red);
            self.bordure.color(self.bgColor,5,myColors.red);

        }
        self.answerManipulator.translator.move(self.x,self.y);

    };



};