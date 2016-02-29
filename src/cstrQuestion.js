/**
 * Created by ABO3476 on 29/02/2016.
 */


/**
 *
 * @param label : texte à afficher pour la question
 * @param colorBordure : objet de 3 éléments (r, g, b) correspondant aux composantes couleur de la bordure associée à la réponse
 * @param bgColor : objet de 3 élements (r, g, b) correspondant aux composantes couleur du fond
 * @constructor
 */
var Answer = function (label,colorBordure, bgColor) {
    var self = this;
    self.label = label;

    if(colorBordure && !isNaN(parseInt(colorBordure.r)) && !isNaN(parseInt(colorBordure.g)) && !isNaN(parseInt(colorBordure.b))) {
        self.rgbBordure = "rgb("+colorBordure.r+", "+colorBordure.g+", "+colorBordure.b+")";
    }
    else {
        self.rgbBordure = "none";
    }

    if(bgColor && !isNaN(parseInt(bgColor.r)) && !isNaN(parseInt(bgColor.g)) && !isNaN(parseInt(bgColor.b))) {
        self.bgColor = "rgb("+bgColor.r+", "+bgColor.g+", "+bgColor.b+")";
    }
    else {
        self.bgColor = "none";
    }
    self.bordure = null;


