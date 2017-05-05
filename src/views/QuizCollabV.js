/**
 * Created by TBE3610 on 05/05/2017.
 */

exports.QuizCollabV = function (globalVariables) {
    const
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        drawing = globalVariables.drawing;

    const
        FONT = "Arial",
        FONT_SIZE = 20,
        HEXAGON_HEIGHT_RATIO = 1/6,
        INPUT_WIDTH = 300,
        INPUT_HEIGHT = 30,
        ANSWERS_PER_LINE = 4;

    class QuizCollabV {
        constructor(presenter) {
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
            this.questionManipulator = new Manipulator(this).addOrdonator(4);
            this.returnButtonManipulator = new Manipulator(this);
            this.answersManipulator = new Manipulator(this);
            this.manipulator
                .add(this.questionManipulator)
                .add(this.returnButtonManipulator)
                .add(this.answersManipulator);
        }

        display() {
            var _displayHeader = () => {
                let headerManipulator = this.header.getManipulator();
                this.manipulator.add(headerManipulator);
                this.header.display(this.getLabel());
            };
            var _displayReturnButton = () => {
                let returnButton = new gui.Button(INPUT_WIDTH, INPUT_HEIGHT, [myColors.white, 1, myColors.grey], 'Retourner à la formation');
                returnButton.back.corners(5,5);
                returnButton.text.font('Arial', 20).position(0,6.6);
                returnButton.onClick(this.returnHandler.bind(this));
                let chevron = new svg.Chevron(10,20,3,'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator
                    .add(returnButton.component)
                    .add(chevron)

                this.returnButtonManipulator.move(returnButton.width/2 + MARGIN, currentY + returnButton.height/2);
                currentY += returnButton.height + 2*MARGIN;
            }
            var _displayQuestionTitle = () => {
                let border = util.drawHexagon(drawing.width / 2, HEXAGON_HEIGHT_RATIO*drawing.height, 'H', 0.65)
                this.questionManipulator.set(1, border);
                let line = new svg.Line(-drawing.width / 2 + MARGIN, 0, drawing.width / 2 - MARGIN, 0)
                    .color(myColors.grey, 1, myColors.grey);
                this.questionManipulator.set(0, line);
                let title = new svg.Text(this.getQuestionLabel(0)).font(FONT, FONT_SIZE);
                this.questionManipulator.set(3, title);
                //Title in the left corner  with limit 15 char
                let formationTitle = autoAdjustText(
                    this.getLabel(),
                    util.getStringWidthByFontSize(15, FONT_SIZE),
                    FONT_SIZE,
                    FONT_SIZE,
                    FONT,
                    this.questionManipulator,
                    2
                );
                formationTitle.text.position(-drawing.width/2 + formationTitle.finalWidth/2 + MARGIN, -MARGIN);
                this.questionManipulator.move(drawing.width / 2, currentY + border.height/2);
                currentY += border.height + 2*MARGIN;
            }
            var _displayAnswers = () => {
                var _displayAnswer = (answer, index) => {
                    let manip = new Manipulator(this).addOrdonator(2);

                    let border = new svg.Rect(50, 50).color(myColors.none, 1, myColors.black).corners   (10, 10)
                    manip.set(0, border);

                    let title = new svg.Text(answer.label)
                    manip.set(1, title);

                    manip.move(index*(50 + MARGIN), 0);

                    return manip;
                }

                this.getAnswers(0).forEach((answer, index) => {
                    let answerManip = _displayAnswer(answer, index);
                    this.answersManipulator.add(answerManip);
                });

                this.answersManipulator.move(MARGIN + 25, currentY + 25);
            }

            drawing.manipulator.set(0, this.manipulator);
            var currentY = this.header.height + MARGIN;
            _displayHeader();
            _displayReturnButton();
            _displayQuestionTitle();
            _displayAnswers();
        }

        returnHandler(){
            this.presenter.returnHandler();
        }

        getLabel() {
            return this.presenter.getLabel();
        }
        getQuestionLabel(index){
            return this.presenter.getQuestionLabel(index);
        }
        getAnswers(questionIndex){
            return this.presenter.getAnswers(questionIndex);
        }
    }

    return QuizCollabV;
}