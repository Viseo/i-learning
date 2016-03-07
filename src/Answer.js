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
 * @param textHeight
 * @constructor
 */
var Answer = function (label, imageSrc, bCorrect, colorBordure, bgColor, textHeight) {
    var self = this;
    self.label = label;
    self.imageSrc = imageSrc;
    self.correct = bCorrect;
    if(textHeight) {
        self.textHeight = textHeight;
    } else {
        self.textHeight = 20;
    }

    self.imageLoaded = false;

    if(imageSrc) {
        self.image = new Image();
        self.image.src = imageSrc;
        self.image.onload = function () {
            self.imageLoaded = true;
        };
    } else {
        self.imageLoaded = true;
    }

    self.displaySet=paper.set();

    if(colorBordure && !isNaN(parseInt(colorBordure.r)) && !isNaN(parseInt(colorBordure.g)) && !isNaN(parseInt(colorBordure.b))) {
        self.rgbBordure = "rgb("+colorBordure.r+", "+colorBordure.g+", "+colorBordure.b+")";
    }
    else {
        self.rgbBordure = "black";
    }

    if(bgColor && !isNaN(parseInt(bgColor.r)) && !isNaN(parseInt(bgColor.g)) && !isNaN(parseInt(bgColor.b))) {
        self.bgColor = "rgb("+bgColor.r+", "+bgColor.g+", "+bgColor.b+")";
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
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.image, x, y, w, h, self.rgbBordure, self.bgColor, self.textHeight);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.image = objectTotal.image;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
            self.displaySet.push(self.image);
        }
        // Question avec Texte uniquement
        else if(self.label && !self.imageSrc) {
            var object = displayText(self.label, x, y, w, h, self.rgbBordure, self.bgColor, self.textHeight);
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