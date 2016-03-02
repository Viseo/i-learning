/** Created by ABO3476 on 29/02/2016. */

/**
 * @param label : texte à afficher pour la question
 * @param imageSrc : lien relatif vers l'image. Peut-être vide/null/indéfini si aucune image
 * @param tabAnswer : Tableau réponses
 * @param rows : Nombre de colonnes pour afficher les réponses.
 * @param colorBordure : objet de 3 éléments (r, g, b) correspondant aux composantes couleur de la bordure associée à la réponse
 * @param bgColor : objet de 3 élements (r, g, b) correspondant aux composantes couleur du fond
 * @constructor
 */

var Question = function (label,imageSrc,tabAnswer, rows, colorBordure, bgColor) {
    var self = this;
    self.label = label;
    self.imageSrc = imageSrc;
    self.tabAnswer = [];
    self.rows=rows;

    self.displaySet=paper.set();

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
        self.rgbBordure = "black";
    }

    if (bgColor && !isNaN(parseInt(bgColor.r)) && !isNaN(parseInt(bgColor.g)) && !isNaN(parseInt(bgColor.b))) {
        self.bgColor = "rgb(" + bgColor.r + ", " + bgColor.g + ", " + bgColor.b + ")";
    }
    else {
        self.bgColor = "none";
    }
    self.bordure = null;
    self.content = null;
    self.image = null;

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
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, x, y, w, h, self.rgbBordure, self.bgColor);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.image = objectTotal.image;
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
            self.image = displayImage(self.imageSrc, x, y, w, h);
        }
        else if (!self.imageSrc && !self.label){
            self.bordure = paper.rect(x, y, w, h).attr({fill: self.bgColor, stroke: self.rgbBordure})
        }

        if (self.rows !== 0) {
            var margin = 15;
            var tileWidth = (w - margin * (self.rows - 1)) / self.rows;
            var tileHeight = h;
            var posx = x;
            var posy = y + h + margin * 2;
            var count = 0;
            for (var i = 0; i < self.tabAnswer.length; i++) {
                if (i !== 0) {
                    posx += (tileWidth + margin);
                }
                if (count > (self.rows - 1)) {
                    count = 0;
                    posy += (tileHeight + margin);
                    posx = x;
                }
                self.tabAnswer[i].display(posx, posy, tileWidth, tileHeight);
                count++;
            }
        }
    }
};
