/**
 * Created by TBE3610 on 31/05/2017.
 */

exports.HeaderV = function (globalVariables) {
    const
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        Manipulator = globalVariables.Handlers.Manipulator;

    const
        HEADER_SIZE = 70,
        FONT_SIZE = 18,
        HOME_TEXT_SIZE = 30;

    var HEADER_MARGIN, BUTTON_WIDTH, ELEMENTS_MARGIN;

    class HeaderVue {
        constructor(presenter) {
            this.width = drawing.width;
            this.height = HEADER_SIZE;
            this.presenter = presenter;
        }

        display(parentManipulator, message) {
            var _calcSizes = () => {
                this.width = drawing.width;
                this.height = HEADER_SIZE;
                HEADER_MARGIN = {top:this.height/2 + FONT_SIZE/4 + MARGIN, left:2*MARGIN, right:2*MARGIN};
                ELEMENTS_MARGIN = 4*MARGIN;
                BUTTON_WIDTH = this.width/8;
            }
            var _resetManips = () => {
                if (this.manipulator) parentManipulator.remove(this.manipulator);
                this.manipulator = new Manipulator(this).addOrdonator(3);
                this.buttonManipulator = new Manipulator(this);
                this.userManipulator = new Manipulator(this);
                this.userIconManipulator = new Manipulator(this)
                this.manipulator
                    .add(this.userManipulator)
                    .add(this.userIconManipulator)
                    .add(this.buttonManipulator);
                parentManipulator.add(this.manipulator);
            }
            var _displayHeaderRect = () => {
                let rect = new svg.Rect(this.width, this.height)
                    .color(myColors.white, 0, myColors.black)
                    .position(this.width / 2, this.height / 2);
                this.manipulator.set(0, rect);
            }
            var _displayHomeText = () => {
                let text = new svg.Text("I-learning")
                    .position(HEADER_MARGIN.left, HEADER_MARGIN.top - FONT_SIZE/2)
                    .font('Arial', HOME_TEXT_SIZE)
                    .anchor('start')
                    .color(myColors.turquoise)
                    .mark('homeText');
                text.onClick(this.gotToDashboard.bind(this));
                this.manipulator.set(1, text);
            }
            var _displayRightHeader = () => {
                var disconnect = () => {
                    runtime.setCookie("token=; path=/; max-age=0;");
                    drawing.username = null;
                    this.disconnect();
                };

                let button = new gui.Button(BUTTON_WIDTH, this.height/2, [myColors.turquoise, 0, myColors.black], "Déconnexion");
                button.text.color(myColors.white).font(FONT, FONT_SIZE).position(0,FONT_SIZE/3);
                button.back.corners(25, 25);
                button.glass.mark('deconnection');
                button.onClick(disconnect);
                this.buttonManipulator
                    .add(button.component)
                    .move(this.width - button.width/2 - 2*MARGIN, HEADER_MARGIN.top - button.height/2);

                let userText = new svg.Text(drawing.username)
                    .font('Arial', FONT_SIZE)
                    .anchor('end')
                    .color(myColors.black);
                this.userManipulator
                    .add(userText)
                    .move(this.width - BUTTON_WIDTH - HEADER_MARGIN.right - ELEMENTS_MARGIN, HEADER_MARGIN.top - FONT_SIZE/2);

                let bodyR = 15, headR = bodyR/2
                let body = new svg.Circle(bodyR).color(myColors.white, 2, myColors.turquoise),
                    rectMask = new svg.Rect(bodyR*2+2, bodyR+2).color(myColors.white, 0, myColors.black),
                    head = new svg.Circle(headR).color(myColors.white, 2, myColors.turquoise);
                body.position(0, headR*2 + MARGIN);
                rectMask.position(0, headR*2 + bodyR/2 + MARGIN + 2)
                this.userIconManipulator
                    .add(head)
                    .add(body)
                    .add(rectMask)
                    .move(
                        this.width -BUTTON_WIDTH - 2*ELEMENTS_MARGIN - userText.boundingRect().width - body.r,
                        HEADER_MARGIN.top - (headR*2 + bodyR*2+2+MARGIN)/2
                    );

                if (message) {
                    let messageText = new svg.Text(message)
                        .font('Arial', FONT_SIZE)
                        .fontWeight('bold')
                        .color(myColors.black)
                        .mark("headerMessage");
                    this.manipulator.set(2, messageText);
                    messageText.position(
                        this.width -BUTTON_WIDTH - 2*ELEMENTS_MARGIN - userText.boundingRect().width - body.r*2 - ELEMENTS_MARGIN - messageText.boundingRect().width/2,
                        HEADER_MARGIN.top - FONT_SIZE/2
                    )
                } else {
                    this.manipulator.unset(2);
                }
            }

            _calcSizes();
            _resetManips();
            _displayHeaderRect();
            _displayHomeText();
            if(drawing.username){
                _displayRightHeader();
            }

            return this.manipulator;
        }

        gotToDashboard() {
            this.presenter.clearOldPageStackAndLoadPresenterDashboard();
        }

        disconnect() {
            this.presenter.clearOldPageStackAndLoadPresenterConnection();
        }
    }

    return HeaderVue;
}