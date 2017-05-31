/**
 * Created by TBE3610 on 31/05/2017.
 */

exports.HeaderV = function(globalVariables){
    const util = globalVariables.util,
        Manipulator = util.Manipulator;

    const HEADER_SIZE = 0.07;

    class HeaderVue {
        constructor(presenter) {
            this.manipulator = new Manipulator(this).addOrdonator(3);
            this.userManipulator = new Manipulator(this).addOrdonator(6);
            this.label = "I-learning";
            this.height = HEADER_SIZE * drawing.height;
            this.presenter = presenter;
        }

        disconnect(){
            this.presenter && this.presenter.clearOldPageStackAndLoadPresenterConnection();
        }

        display(message) {
            var _onClickLogo = () => {
                this.presenter.clearOldPageStackAndLoadPresenterDashboard();
            };
            var displayUser = () => {
                let pos = -MARGIN;
                const deconnexion = displayText("Déconnexion", width * 0.1, pos_text_y, myColors.white, myColors.none, 20, null, userManip, 4, 5),
                    deconnexionWidth = deconnexion.content.boundingRect().width,
                    ratio = 0.65,
                    body = new svg.CurvedShield(35 * ratio, 30 * ratio, 0.5).color(myColors.white),
                    head = new svg.Circle(12 * ratio).color(myColors.white, 1, myColors.customBlue),
                    userText = autoAdjustText(drawing.username, width * 0.23, height, 20, null, userManip, 3);

                deconnexion.border.corners(5,5);
                pos -= deconnexionWidth / 2;
                deconnexion.content.position(0, -font_size/4);
                deconnexion.border.position(0, -font_size/4).mark('deconnection');
                deconnexion.content.color(myColors.white);
                pos -= deconnexionWidth / 2 + 40;
                userText.text.anchor('end').position(-deconnexionWidth, 0).color(myColors.white);
                pos -= userText.finalWidth;
                userManip.set(0, body);
                userManip.set(1, head);

                pos -= body.boundingRect().width / 2 + MARGIN;
                body.position(-deconnexionWidth -userText.finalWidth -body.width, -5 * ratio);
                head.position(-deconnexionWidth -userText.finalWidth -body.width, -20 * ratio);
                userManip.move(width - deconnexionWidth, pos_text_y);

                const deconnexionHandler = () => {
                    runtime.setCookie("token=; path=/; max-age=0;");
                    drawings.component.clean();
                    drawing.username = null;
                    drawing.manipulator.flush();
                    this.disconnect();
                };
                svg.addEvent(deconnexion.content, "click", deconnexionHandler);
                svg.addEvent(deconnexion.border, "click", deconnexionHandler);
            };

            const width = drawing.width,
                height = HEADER_SIZE * drawing.height,
                font_size = 20,
                pos_text_y = height/2 +font_size/4,
                userManip = this.userManipulator,
                text = new svg.Text(this.label).position(MARGIN, pos_text_y).font('Arial', font_size).anchor('start').color(myColors.white).mark('homeText'),
                rect = new svg.Rect(width, height).color(myColors.customBlue, 0.5, myColors.black).position(width/2, height/2);
            this.manipulator.set(1, text);
            this.manipulator.set(0, rect);

            text.onMouseDown(_onClickLogo);

            if (message) {
                const messageText = autoAdjustText(message, width * 0.3, height, 32, 'Arial', this.manipulator, 2);
                messageText.text.position(width / 2, height / 2 + MARGIN)
                    .color(myColors.white)
                    .mark("headerMessage");
            } else {
                this.manipulator.unset(2);
            }

            this.manipulator.add(userManip);
            if (drawing.username) {
                displayUser();
            }
        }

        getManipulator(){
            return this.manipulator;
        }
    }

    return HeaderVue;
}