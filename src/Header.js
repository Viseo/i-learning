/**
 * Created by qde3485 on 14/04/16.
 */

var Header = function (additionalMessage) {
    var self = this;
    additionalMessage && (self.addMessage = additionalMessage);
    self.manipulator = new Manipulator(self);
    self.label = "I-learning";
    self.size = 0.05; // 5%
    mainManipulator.ordonator.set(0, self.manipulator.first);

    self.display = function () {
        self.line = new svg.Line(0, drawing.height*self.size, drawing.width, drawing.height*self.size).color(myColors.black, 3, myColors.black);
        self.text = new svg.Text(self.label).position(MARGIN, drawing.height*self.size*.75).font("Arial", 20).anchor("start");
        self.addMessage && (self.addMessageText = new svg.Text(self.addMessage).position(drawing.width/2, drawing.height*self.size/2).font("Arial", 32));
        self.addMessage ? self.manipulator.ordonator.set(2, self.addMessageText) : self.manipulator.ordonator.unset(2);
        self.manipulator.ordonator.set(1, self.text);
        self.manipulator.ordonator.set(0, self.line);
    };

    self.setMessage = function (additionalMessage) {
        self.addMessage = additionalMessage;
        self.display();
    };
    self.removeMessage = function () {
        self.addMessage = null;
        self.display();
    };
};