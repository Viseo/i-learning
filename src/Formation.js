/**
 * Created by ABO3476 on 15/04/2016.
 */

var Formation = function(formation){
    var self = this;
    self.manipulatorMiniature = new Manipulator();
    self.iconManipulator = new Manipulator();
    self.manipulatorMiniature.last.add(self.iconManipulator.first);

    self.label = formation.label ? formation.label : "Nouvelle formation";
    self.status = formation.status ? formation.status : statusEnum.NotPublished;

    self.displayMiniature = function (w,h) {
        self.miniature = displayText(self.label, w, h, myColors.black, myColors.white, null, null, self.manipulatorMiniature);
        self.miniature.cadre.corners(50, 50);

        if (self.status === statusEnum.Published) {
            var icon = self.status.icon(0, 0, self.parent.iconeSize);
            self.iconManipulator.ordonator.set(5, icon.square);
            self.iconManipulator.ordonator.set(6, icon.check);
            self.iconManipulator.translator.move(w / 2 - self.parent.iconeSize + MARGIN + 2, -h / 2 + self.parent.iconeSize - MARGIN - 2);//2Pxl pour la largeur de cadre
        }
        else if (self.status === statusEnum.Edited) {
                var iconExclamation = self.status.icon(self.parent.iconeSize);
                self.iconManipulator.ordonator.set(5, iconExclamation.circle);
                self.iconManipulator.ordonator.set(6, iconExclamation.exclamation);
                self.iconManipulator.ordonator.set(7, iconExclamation.dot);
                self.iconManipulator.translator.move(w / 2 - self.parent.iconeSize + MARGIN + 2, -h / 2 + self.parent.iconeSize - MARGIN - 2);//2Pxl pour la largeur de cadre
            }
        }
    };





