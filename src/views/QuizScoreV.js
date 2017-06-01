/**
 * Created by TBE3610 on 05/05/2017.
 */

exports.QuizScoreV = function (globalVariables) {
    const
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.Tool.IconCreator,
        View = globalVariables.View;

    const
        FONT = "Arial",
        FONT_SIZE = 20,
        INPUT_WIDTH = 300,
        INPUT_HEIGHT = 30,
        QUESTION_HEIGHT = 50,
        QUESTIONS_PER_LINE = 3,
        BUTTON_HEIGHT = 50;

    class QuizScoreV extends View{
        constructor(presenter) {
            super(presenter);
            this.manipulator = new Manipulator(this);
            this.returnButtonManipulator = new Manipulator(this);
            this.titleManipulator = new Manipulator(this).addOrdonator(2);
            this.questionsManipulator = new Manipulator(this);
            this.resultButtonManipulator = new Manipulator(this);
        }

        display() {
            var _cleanManipulators = () => {
                this.manipulator.flush();
            }
            var _attachManipulators = () => {
                let headerManipulator = this.header.getManipulator();
                this.manipulator
                    .add(headerManipulator)
                    .add(this.returnButtonManipulator)
                    .add(this.titleManipulator)
                    .add(this.questionsManipulator)
                    .add(this.resultButtonManipulator)
            }
            var _displayHeader = () => {
                this.header.display(this.getLabel());
            };
            var _displayReturnButton = () => {
                let returnButton = new gui.Button(INPUT_WIDTH, INPUT_HEIGHT, [myColors.white, 1, myColors.grey], 'Retourner à la formation');
                returnButton.back.corners(5, 5);
                returnButton.text.font(FONT, FONT_SIZE).position(0, 6.6);
                returnButton.onClick(this.returnToOldPage.bind(this));
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator
                    .add(returnButton.component)
                    .add(chevron)

                this.returnButtonManipulator.move(returnButton.width / 2 + MARGIN, currentY + returnButton.height / 2);
                currentY += returnButton.height + MARGIN;
            }
            var _displayTitle = () => {
                let dimensions = {
                    width: drawing.width - 2 * MARGIN,
                    height: drawing.height / 5
                }
                let score = this.getScore();
                let rect = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 1, score.color).corners(5, 5);
                let text = new svg.Text(score.message).font(FONT, FONT_SIZE).mark('scoreTitle');
                let icon = IconCreator.createImageIcon(score.emojiSrc, this.titleManipulator);
                this.titleManipulator.set(0, rect).set(1, text);
                icon.position(-text.boundingRect().width/2 - MARGIN - icon.getContentSize()/2, -FONT_SIZE/2);
                this.titleManipulator.move(MARGIN + dimensions.width / 2, currentY + dimensions.height / 2);
                currentY += dimensions.height + MARGIN;
            }
            var _displayWrongQuestions = () => {
                var _displayWrongQuestion = (question, index) => {
                    var _loadQuestionCorrection = () => {
                        this.displayQuestionView(question.index);
                    }

                    let manip = new Manipulator(this).addOrdonator(2);
                    let border = new svg.Rect(questionWidth, QUESTION_HEIGHT).color(myColors.white, 1, myColors.black).corners(5, 5);
                    let text = new svg.Text(question.label).font(FONT, FONT_SIZE);
                    let indexX = Math.floor(index % QUESTIONS_PER_LINE);
                    let indexY = Math.floor(index / QUESTIONS_PER_LINE);
                    manip.set(0, border).set(1, text);
                    manip.move(indexX * (questionWidth + MARGIN), indexY * (MARGIN + QUESTION_HEIGHT));
                    manip.addEvent("click", _loadQuestionCorrection)
                    return manip;
                }

                let dimensions = {
                    width: drawing.width - 2 * MARGIN,
                    height: drawing.height - currentY - MARGIN - BUTTON_HEIGHT
                }
                let questionWidth = dimensions.width / QUESTIONS_PER_LINE - (QUESTIONS_PER_LINE - 1) / QUESTIONS_PER_LINE * MARGIN;
                this.getWrongQuestions().forEach((question, index) => {
                    let manip = _displayWrongQuestion(question, index);
                    this.questionsManipulator.add(manip);
                });
                this.questionsManipulator.move(MARGIN + questionWidth / 2, currentY + QUESTION_HEIGHT / 2);
            }
            var _displayResultButton = () => {
                let _loadQuestionResult = () => {
                    this.displayQuestionView(0);
                }
                let dimensions = {
                    width: drawing.width / 3,
                    height: BUTTON_HEIGHT
                }
                let button = new gui.Button(dimensions.width, dimensions.height, [[43, 120, 228], 1, myColors.black], "Voir les réponses et les explications");
                button.onClick(_loadQuestionResult);
                button.glass.mark('answeredButton');
                this.resultButtonManipulator.add(button.component);
                this.resultButtonManipulator.move(drawing.width / 2, drawing.height - MARGIN - dimensions.height / 2);
            }

            drawing.manipulator.set(0, this.manipulator);
            var currentY = this.header.height + MARGIN;
            _cleanManipulators();
            _attachManipulators();
            _displayHeader();
            _displayReturnButton();
            _displayTitle();
            _displayWrongQuestions();
            _displayResultButton();
        }

        returnHandler() {
            this.presenter.returnHandler();
        }

        displayQuestionView(questionIndex) {
            this.presenter.displayQuestionView(questionIndex);
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        getScore() {
            return this.presenter.getScore();
        }

        getWrongQuestions() {
            return this.presenter.getWrongQuestions();
        }

    }

    return QuizScoreV;
}