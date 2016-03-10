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
    self.label = answer.label;
    self.imageSrc = answer.imageSrc;
    self.correct = answer.bCorrect;

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
        console.log(self.image);
        self.imageLoaded = false;
    } else {
        self.imageLoaded = true;
    }

    self.displaySet=paper.set();

    if(answer.colorBordure && !isNaN(parseInt(answer.colorBordure.r)) && !isNaN(parseInt(answer.colorBordure.g)) && !isNaN(parseInt(answer.colorBordure.b))) {
        self.rgbBordure = "rgb("+answer.colorBordure.r+", "+answer.colorBordure.g+", "+answer.colorBordure.b+")";
    }
    else {
        self.rgbBordure = "black";
    }

    if(answer.bgColor && !isNaN(parseInt(answer.bgColor.r)) && !isNaN(parseInt(answer.bgColor.g)) && !isNaN(parseInt(answer.bgColor.b))) {
        self.bgColor = "rgb("+answer.bgColor.r+", "+answer.bgColor.g+", "+answer.bgColor.b+")";
    }
    else {
        self.bgColor = "none";
    }
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
        if(isNaN(parseInt(x)) || isNaN(parseInt(y)) || isNaN(parseInt(w)) || isNaN(parseInt(h))) {
            throw new Error(NaN);
        }

        // Question avec Texte ET image
        if(self.label && self.imageSrc) {
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.image, x, y, w, h, self.rgbBordure, self.bgColor, self.fontSize, self.font);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.image = objectTotal.image;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
            self.displaySet.push(self.image);
        }
        // Question avec Texte uniquement
        else if(self.label && !self.imageSrc) {
            var object = displayText(self.label, x, y, w, h, self.rgbBordure, self.bgColor, self.fontSize, self.font);
            self.bordure = object.cadre;
            self.content = object.content;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
        }
        // Question avec Image uniquement
        else if(self.imageSrc && !self.label) {
            self.image = displayImage(self.imageSrc, self.image, x, y, w, h).image;
            self.displaySet.push(self.image);
        }
        // Cas pour test uniquement : si rien, n'affiche qu'une bordure
        else {
            self.bordure = paper.rect(x, y, w, h).attr({fill: self.bgColor, stroke: self.rgbBordure});
            self.displaySet.push(self.bordure);
        }

    };
};