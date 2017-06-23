/**
 * Created by TBE3610 on 31/05/2017.
 */

exports.HeaderV = function(globalVariables){
    const
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        Manipulator = globalVariables.Handlers.Manipulator;

    const
        HEADER_SIZE = 50,
        FONT_SIZE = 20,
        BUTTON_WIDTH = 150;

    class HeaderVue {
        constructor(presenter) {
            this.width = drawing.width;
            this.height = HEADER_SIZE;
            this.presenter = presenter;
        }

        display(parentManipulator, message) {
            var _resetManips = () => {
                if(this.manipulator) parentManipulator.remove(this.manipulator);
                this.manipulator = new Manipulator(this).addOrdonator(3);
                this.userManipulator = new Manipulator(this);
                this.userIconManipulator = new Manipulator(this).addOrdonator(2)
                this.manipulator.add(this.userManipulator);
                this.userManipulator.add(this.userIconManipulator);
                this.userManipulator.move(Math.max(this.width - MARGIN, 900), this.height/2);
                parentManipulator.add(this.manipulator);
            }
            var _displayHeaderRect = () => {
                let rect = new svg.Rect(this.width, this.height)
                    .color(myColors.customBlue, 0.5, myColors.black)
                    .position(this.width/2, this.height/2);
                this.manipulator.set(0, rect);
            }
            var _displayHomeText = ()=> {
                let text = new svg.Text("I-learning")
                    .position(MARGIN, this.height/2 + FONT_SIZE/4)
                    .font('Arial', FONT_SIZE)
                    .anchor('start')
                    .color(myColors.white)
                    .mark('homeText');
                text.onClick(this.gotToDashboard.bind(this));
                this.manipulator.set(1, text);
            }
            var _displayMessage = () => {
                if (message) {
                    let messageText = new svg.Text(message)
                        .dimension(this.width * 0.3, this.height)
                        .font('Arial', 32)
                        .position(Math.max(this.width / 2, 400), this.height / 2 + MARGIN)
                        .color(myColors.white)
                        .mark("headerMessage");
                    this.manipulator.set(2, messageText);
                } else {
                    this.manipulator.unset(2);
                }
            }
            var _displayUser = () => {
                let userText = new svg.Text(drawing.username)
                    .font('Arial', 20)
                    .anchor('end')
                    .position(-BUTTON_WIDTH - 2*MARGIN, this.height/2 - FONT_SIZE/2)
                    .color(myColors.white);

                let ratio = 0.65;
                let body = new svg.CurvedShield(35 * ratio, 30 * ratio, 0.5).color(myColors.white),
                    head = new svg.Circle(12 * ratio).color(myColors.white, 1, myColors.customBlue);
                body.position(0, -5 * ratio);
                head.position(0, -20 * ratio);

                this.userManipulator.add(userText);
                textWidth = userText.boundingRect().width;
                userText.dimension(textWidth, this.height)
                this.userIconManipulator.set(0, body);
                this.userIconManipulator.set(1, head);
                this.userIconManipulator.move(
                    -BUTTON_WIDTH - MARGIN - textWidth - body.width/2 - 2*MARGIN,
                    this.height/2 - (body.height+head.r*2)/2
                );
            }
            var _displayDeconnectionButton = () => {
                var disconnect = () => {
                    runtime.setCookie("token=; path=/; max-age=0;");
                    drawing.username = null;
                    this.disconnect();
                };
                let button = new gui.Button(BUTTON_WIDTH, this.height*2/3, [myColors.none, 1, myColors.white], "Déconnexion");
                button.text.color(myColors.white);
                button.back.corners(5, 5);
                button.position(-BUTTON_WIDTH/2, 0);
                button.glass.mark('deconnection');
                button.onClick(disconnect);
                this.userManipulator.add(button.component);
            }

            this.width = drawing.width;
            let textWidth = this.width * 0.23;
            _resetManips();
            _displayHeaderRect();
            _displayHomeText();
            _displayMessage();
            if(drawing.username){
                _displayUser();
                _displayDeconnectionButton();
            }

            return this.manipulator;
        }

        gotToDashboard(){
            this.presenter.clearOldPageStackAndLoadPresenterDashboard();
        }

        disconnect(){
            this.presenter.clearOldPageStackAndLoadPresenterConnection();
        }
    }

    return HeaderVue;
}