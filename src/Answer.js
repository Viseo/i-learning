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

    self._transformation={
        type:'',param1:'',param2:''
    };
    self.transformation=function(type,param1,param2){
        if(type){
            self._transformation.type=type;
        }
        if(param1){
            self._transformation.param1=param1;
        }
        if(param2){
            self._transformation.param2=param2;
        }

        return ""+self._transformation.type+self._transformation.param1+","+self._transformation.param2;
    };

    self.label = answer.label;
    self.imageSrc = answer.imageSrc;
    self.correct = answer.bCorrect;
    self.selected=false;

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

        self.displaySet=paper.set();
        self.displaySet._transformation=self._transformation;

        if(self.selected){// image pré-selectionnée
            self.bordure.attr("stroke-width",5);
            self.rgbBordure='red';
        }

        // Question avec Texte ET image
        if(self.label && self.imageSrc) {
            var objectTotal = displayImageWithTitle(self.label, self.imageSrc, self.image, -w/2, -h/2, w, h, self.rgbBordure, self.bgColor, self.fontSize, self.font);
            self.bordure = objectTotal.cadre;
            self.content = objectTotal.text;
            self.image = objectTotal.image;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
            self.displaySet.push(self.image);
            var t=self.transformation('t',''+(x+w/2),''+(y+h/2));
            self.displaySet.transform(t);
        }
        // Question avec Texte uniquement
        else if(self.label && !self.imageSrc) {
            var object = displayText(self.label, -w/2, -h/2, w, h, self.rgbBordure, self.bgColor, self.fontSize, self.font);
            self.bordure = object.cadre;
            self.content = object.content;
            self.displaySet.push(self.bordure);
            self.displaySet.push(self.content);
            var t=self.transformation('t',''+(x+w/2),''+(y+h/2));
            self.displaySet.transform(t);
        }
        // Question avec Image uniquement
        else if(self.imageSrc && !self.label) {
            self.image = displayImage(self.imageSrc, self.image,  -w/2, -h/2, w, h).image;
            self.displaySet.push(self.image);
            var t=self.transformation('t',''+(x+w/2),''+(y+h/2));
            self.displaySet.transform(t);
        }
        // Cas pour test uniquement : si rien, n'affiche qu'une bordure
        else {
            self.bordure = paper.rect( -w/2, -h/2, w, h).attr({fill: self.bgColor, stroke: self.rgbBordure});
            self.displaySet.push(self.bordure);
            var t=self.transformation('t',''+(x+w/2),''+(y+h/2));
            self.displaySet.transform(t);
        }

    };
};