/** Created by ABO3476 on 29/02/2016. */

/**
 * @param label : texte à afficher pour la question
 * @param imageSrc : lien relatif vers l'image. Peut-être vide/null/indéfini si aucune image
 * @param tabAnswer : Tableau réponses
 * @param colorBordure : objet de 3 éléments (r, g, b) correspondant aux composantes couleur de la bordure associée à la réponse
 * @param bgColor : objet de 3 élements (r, g, b) correspondant aux composantes couleur du fond
 * @constructor
 */

var Question = function (label,imageSrc,tabAnswer,colorBordure, bgColor) {
    var self = this;
    self.label = label;
    self.imageSrc = imageSrc;
    self.tabAnswer = [];
    self.displaySet=paper.raphael.set();

    if (tabAnswer !== null) {
        tabAnswer.forEach(function (it) {
            var tmp = new Answer(it.label, it.imageSrc, it.bCorrect, it.rgbBordure, it.bgColor);
            self.tabAnswer.push(tmp);
            self.displaySet.push(tmp.displaySet);
        });
    }

    if (colorBordure && !isNaN(parseInt(colorBordure.r)) && !isNaN(parseInt(colorBordure.g)) && !isNaN(parseInt(colorBordure.b))) {
        self.rgbBordure = "rgb(" + colorBordure.r + ", " + colorBordure.g + ", " + colorBordure.b + ")";
    }
    else {
        self.rgbBordure = "none";
    }

    if (bgColor && !isNaN(parseInt(bgColor.r)) && !isNaN(parseInt(bgColor.g)) && !isNaN(parseInt(bgColor.b))) {
        self.bgColor = "rgb(" + bgColor.r + ", " + bgColor.g + ", " + bgColor.b + ")";
    }
    else {
        self.bgColor = "none";
    }
    self.bordure = null;

    /**
     *
     * @param x : position en X
     * @param y : position en Y
     * @param w : largeur
     * @param h : hauteur
     */

    self.display = function (x, y, w, h) {
        if (isNaN(parseInt(x)) || isNaN(parseInt(y)) || isNaN(parseInt(w)) || isNaN(parseInt(h))) {
            throw new Error(NaN);
        }

        // Question avec Texte ET image
        if (self.label && self.imageSrc) {

        }
        // Question avec Texte uniquement
        else if (self.label && !self.imageSrc) {
            var object = displayText(self.label, x, y, w, h, self.rgbBordure, self.bgColor);
            self.bordure = object.cadre;
            self.content = object.content;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
        }
        // Question avec Image uniquement
        else if(self.imageSrc && !self.label) {
            displayImage(self.imageSrc, x, y, w, h);
        }
        else if (!self.imageSrc && !self.label){
            self.bordure = paper.rect(x, y, w, h).attr({fill: self.bgColor, stroke: self.rgbBordure, 'stroke-width': 5})
        }
    };
};
