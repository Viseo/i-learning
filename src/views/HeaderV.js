/**
 * Created by TBE3610 on 31/05/2017.
 */

exports.HeaderV = function(globalVariables){
    const util = globalVariables.util,
        runtime = globalVariables.runtime,
        Manipulator = util.Manipulator;

    const HEADER_SIZE = 0.07,
          FONT_SIZE = 20,
          BUTTON_WIDTH = 150;

    class HeaderVue {
        constructor(presenter) {
            this.manipulator = new Manipulator(this).addOrdonator(3);
            this.userManipulator = new Manipulator(this);
            this.userIconManipulator = new Manipulator(this).addOrdonator(2)
            this.label = "I-learning";
            this.height = HEADER_SIZE * drawing.height;
            this.presenter = presenter;
            this.manipulator.add(this.userManipulator);
        }

        disconnect(){
            this.presenter && this.presenter.clearOldPageStackAndLoadPresenterConnection();
        }

        display(message) {
            var _resetManip = () => {
                this.manipulator.flush();
                this.manipulator.add(this.userManipulator);
                this.userManipulator.add(this.userIconManipulator);
                this.userManipulator.move(width - MARGIN, height/2);
            }
            var _displayHeaderRect = () => {
                let rect = new svg.Rect(width, height)
                    .color(myColors.customBlue, 0.5, myColors.black)
                    .position(width/2, height/2);
                this.manipulator.set(0, rect);
            }
            var _displayHomeText = ()=> {
                var _onClickLogo = () => {
                    this.presenter.clearOldPageStackAndLoadPresenterDashboard();
                };
                let text = new svg.Text(this.label)
                    .position(MARGIN, height/2 + FONT_SIZE/4)
                    .font('Arial', FONT_SIZE)
                    .anchor('start')
                    .color(myColors.white)
                    .mark('homeText');
                text.onMouseDown(_onClickLogo);
                this.manipulator.set(1, text);
            }
            var _displayMessage = () => {
                if (message) {
                    let messageText = new svg.Text(message)
                        .dimension(width * 0.3, height)
                        .font('Arial', 32)
                        .position(width / 2, height / 2 + MARGIN)
                        .color(myColors.white)
                        .mark("headerMessage");
                    this.manipulator.set(2, messageText);
                } else {
                    this.manipulator.unset(2);
                }
            }
            var _displayUserName = () => {
                let userText = new svg.Text(drawing.username)
                    .font('Arial', 20)
                    .anchor('end')
                    .position(-BUTTON_WIDTH - 2*MARGIN, FONT_SIZE/2)
                    .color(myColors.white);

                this.userManipulator.add(userText);
                textWidth = userText.boundingRect().width;
                userText.dimension(textWidth, height)
            }
            var _displayUserIcon = () => {
                let ratio = 0.65;
                let body = new svg.CurvedShield(35 * ratio, 30 * ratio, 0.5).color(myColors.white),
                    head = new svg.Circle(12 * ratio).color(myColors.white, 1, myColors.customBlue);

                body.position(0, -5 * ratio);
                head.position(0, -20 * ratio);
                
                this.userIconManipulator.set(0, body);
                this.userIconManipulator.set(1, head);
                this.userIconManipulator.move(-BUTTON_WIDTH - 2*MARGIN - textWidth - body.width/2 - 2*MARGIN, 0);
            }
            var _displayDeconnectionButton = () => {
                var disconnect = () => {
                    runtime.setCookie("token=; path=/; max-age=0;");
                    drawing.username = null;
                    this.disconnect();
                };
                let button = new gui.Button(BUTTON_WIDTH, height*2/3, [myColors.none, 1, myColors.white], "Déconnexion");
                button.text.color(myColors.white);
                button.back.corners(5, 5);
                button.position(-BUTTON_WIDTH/2, 0);
                button.glass.mark('deconnection');
                button.onClick(disconnect);
                this.userManipulator.add(button.component);
            }

            const width = drawing.width, height = HEADER_SIZE * drawing.height;
            let textWidth = width * 0.23;

            _resetManip();
            _displayHeaderRect();
            _displayHomeText();
            _displayMessage();
            if(drawing.username){
                _displayUserName();
                _displayUserIcon();
                _displayDeconnectionButton();
            }
        }

        getManipulator(){
            return this.manipulator;
        }
    }

    return HeaderVue;
}