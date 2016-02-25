/**
 * Created by qde3485 on 25/02/16.
 */

/**
 *
 * @param label : texte à afficher pour la réponse
 * @param imageSrc : lien relatif vers l'image. Peut-être vide/null/indéfini si aucune image
 * @param bCorrect : booléen qui indique si la réponse est correcte
 * @param colorBordure : objet de 3 éléments (r, g, b) correspondant aux composantes couleur de la bordure associée à la réponse
 * @constructor
 */
var Reponse = function (label, imageSrc, bCorrect, colorBordure) {
    var self = this;
    self.label = label;
    self.imageSrc = imageSrc;
    self.correct = bCorrect;
    self.rgbBordure = {r: colorBordure.r, g: colorBordure.g, b:colorBordure.b };

    /**
     *
     * @param x : position en X
     * @param y : position en Y
     * @param w : largeur
     * @param h : hauteur
     * @param bgColor : objet de 3 élements (r, g, b) correspondant aux composantes couleur du fond
     */
    self.display = function (x, y, w, h, bgColor) {
        // SVG
        var g = document.createElementNS(svgNS, "g");
        svg.appendChild(g);

        // Question avec Texte ET image
        if(self.label && self.imageSrc) {

        }
        // Question avec Texte uniquement
        else if(self.label && !self.imageSrc) {

        }
        // Question avec Image uniquement
        else if(self.imageSrc && !self.label) {

        }
        // Cas pour test uniquement : si rien, n'affiche qu'une bordure
        else {
            var bordure = createRect(g, x, y, w, h, "rgb("+self.rgbBordure.r+","+self.rgbBordure.g+","+self.rgbBordure.r+")",
                5, "rgb("+bgColor.r+","+bgColor.g+","+bgColor.b+")");
        }

    };
};