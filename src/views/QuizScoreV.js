/**
 * Created by TBE3610 on 05/05/2017.
 */

exports.QuizScoreV = function (globalVariables) {
    const
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        drawing = globalVariables.drawing;

    const
        FONT = "Arial",
        FONT_SIZE = 20,
        INPUT_WIDTH = 300,
        INPUT_HEIGHT = 30;

    class QuizScoreV {
        constructor(presenter) {
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
            this.returnButtonManipulator = new Manipulator(this);
        }

        display() {
            var _cleanManipulators = () => {

            }
            var _attachManipulators = () => {
                let headerManipulator = this.header.getManipulator();
                this.manipulator
                    .add(headerManipulator)
                    .add(this.returnButtonManipulator)

            }
            var _displayHeader = () => {
                this.header.display(this.getLabel());
            };
            var _displayReturnButton = () => {
                let returnButton = new gui.Button(INPUT_WIDTH, INPUT_HEIGHT, [myColors.white, 1, myColors.grey], 'Retourner à la formation');
                returnButton.back.corners(5, 5);
                returnButton.text.font(FONT, FONT_SIZE).position(0, 6.6);
                returnButton.onClick(this.returnHandler.bind(this));
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator
                    .add(returnButton.component)
                    .add(chevron)

                this.returnButtonManipulator.move(returnButton.width / 2 + MARGIN, currentY + returnButton.height / 2);
                currentY += returnButton.height + MARGIN;
            }
            var _displayResultButton = () => {

            }

            drawing.manipulator.set(0, this.manipulator);
            var currentY = this.header.height + MARGIN;
            _cleanManipulators();
            _attachManipulators();
            _displayHeader();
            _displayReturnButton();
            _displayResultButton();
        }

        returnHandler() {
            this.presenter.returnHandler();
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        getScore(){
            return this.presenter.getScore();
        }
    }

    return QuizScoreV;
}