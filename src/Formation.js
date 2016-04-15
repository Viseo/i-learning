/**
 * Created by ABO3476 on 15/04/2016.
 */

var Formation = function(formation){
    var self = this;
    self.manipulatorMiniature = new Manipulator();
    self.label = formation.label ? formation.label : "Nouvelle formation";
    self.status = formation.status ? formation.status : statusEnum.NotPublished;

    self.displayMiniature = function (w,h) {
        self.miniature = displayText(self.label, w, h, myColors.black, myColors.white, null, null, self.manipulatorMiniature);

    }
};

