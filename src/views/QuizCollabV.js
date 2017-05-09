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
        HEXAGON_HEIGHT_RATIO = 1 / 6,
        INPUT_WIDTH = 300,
        INPUT_HEIGHT = 30,
        CHEVRON_WIDTH = 50,
        CHEVRON_HEIGHT = 75,
        CHEVRON_STROKE = 10,
        ANSWERS_PER_LINE = 2,
        ANSWER_HEIGHT = 100;

    class QuizCollabV {
        constructor(presenter) {
            this.presenter = presenter;
            this.answers = [];
            this.manipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
            this.questionManipulator = new Manipulator(this).addOrdonator(4);
            this.returnButtonManipulator = new Manipulator(this);
            this.leftChevronManipulator = new Manipulator(this);
            this.rightChevronManipulator = new Manipulator(this);
            this.answersManipulator = new Manipulator(this);
            this.helpManipulator = new Manipulator(this).addOrdonator(1);
            this.scoreManipulator = new Manipulator(this);
        }

        display() {
            var _cleanManipulators = () => {
                this.returnButtonManipulator.flush();
                this.answersManipulator.flush();
                this.answers = [];
            }
            var _attachManipulators = () => {
                let headerManipulator = this.header.getManipulator();
                this.manipulator
                    .add(headerManipulator)
                    .add(this.questionManipulator)
                    .add(this.returnButtonManipulator)
                    .add(this.leftChevronManipulator)
                    .add(this.rightChevronManipulator)
                    .add(this.answersManipulator)
                    .add(this.helpManipulator);
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
            var _displayQuestionTitle = () => {
                let border = util.drawHexagon(drawing.width / 2, HEXAGON_HEIGHT_RATIO * drawing.height, 'H', 0.65)
                this.questionManipulator.set(1, border);
                let line = new svg.Line(-drawing.width / 2 + MARGIN, 0, drawing.width / 2 - MARGIN, 0)
                    .color(myColors.grey, 1, myColors.grey);
                this.questionManipulator.set(0, line);
                let title = new svg.Text(this.getCurrentQuestionLabel()).font(FONT, FONT_SIZE);
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
                formationTitle.text.position(-drawing.width / 2 + formationTitle.finalWidth / 2 + MARGIN, -MARGIN);
                this.questionManipulator.move(drawing.width / 2, currentY + border.height / 2);
                currentY += border.height + 2 * MARGIN;
            }
            var _displayChevrons = () => {
                var _displayLeftChevron = () => {
                    var _leftChevronHandler = () => {
                        this.previousQuestion();
                    }

                    let leftChevron = new svg.Chevron(dimensions.width, dimensions.height, dimensions.stroke, "W");
                    if (this.isFirstQuestion()) {
                        leftChevron.color(myColors.grey, 1, myColors.grey);
                    } else {
                        leftChevron.color(myColors.black, 1, myColors.black)
                        this.leftChevronManipulator.addEvent('click', _leftChevronHandler);
                    }
                    this.leftChevronManipulator.add(leftChevron);
                    this.leftChevronManipulator.move(MARGIN + dimensions.width / 2, (drawing.height + currentY) / 2);
                }
                var _displayRightChevron = () => {
                    var _rightChevronHandler = () => {
                        this.nextQuestion();
                    }

                    let rightChevron = new svg.Chevron(dimensions.width, dimensions.height, dimensions.stroke, "E");
                    if (this.isLastAnsweredQuestion()) {
                        rightChevron.color(myColors.grey, 1, myColors.grey);
                    } else {
                        rightChevron.color(myColors.black, 1, myColors.black)
                        this.rightChevronManipulator.addEvent('click', _rightChevronHandler);
                    }
                    this.rightChevronManipulator.add(rightChevron);
                    this.rightChevronManipulator.move(drawing.width - MARGIN - dimensions.width / 2, (drawing.height + currentY) / 2);
                }

                let dimensions = {
                    width: CHEVRON_WIDTH,
                    height: CHEVRON_HEIGHT,
                    stroke: CHEVRON_STROKE
                }
                _displayRightChevron();
                _displayLeftChevron();
            }
            var _displayAnswers = () => {
                var _displayAnswer = (answer, index) => {
                    let _answerHandler = () => {
                        this.selectAnswer(index);
                    }

                    let manip = new Manipulator(this).addOrdonator(3); //keep one layer for color answer
                    let border = new svg.Rect(this.answerWidth, ANSWER_HEIGHT).color(myColors.white, 1, myColors.black).corners(10, 10)
                    let title = new svg.Text(answer.label).font(FONT, FONT_SIZE)
                    let indexX = Math.floor(index % ANSWERS_PER_LINE);
                    let indexY = Math.floor(index / ANSWERS_PER_LINE);
                    manip
                        .set(0, border)
                        .set(2, title);
                    manip.move(indexX * (this.answerWidth + MARGIN), indexY * (ANSWER_HEIGHT + MARGIN));
                    manip.addEvent('click', _answerHandler);
                    return manip;
                }

                let dimensions = {
                    width: drawing.width * 3 / 5,
                    height: drawing.height - currentY
                }
                this.answerWidth = dimensions.width / ANSWERS_PER_LINE;

                this.getCurrentAnswers().forEach((answer, index) => {
                    let answerManip = _displayAnswer(answer, index);
                    this.answers.push(answerManip);
                    this.answersManipulator.add(answerManip);
                });

                this.answersManipulator.move(drawing.width / 5 + this.answerWidth / 2 - (ANSWERS_PER_LINE / 2) * MARGIN, currentY + ANSWER_HEIGHT / 2);
            }
            var _displayHelpText = () => {
                let helpText = new svg.Text("cliquez sur une réponse pour passer à la question suivante").font(FONT, FONT_SIZE);
                this.helpManipulator.set(0, helpText);
                this.helpManipulator.move(drawing.width / 2, drawing.height - FONT_SIZE - MARGIN);
            }

            drawing.manipulator.set(0, this.manipulator);
            var currentY = this.header.height + MARGIN;
            _cleanManipulators();
            _attachManipulators();
            _displayHeader();
            _displayReturnButton();
            currentY += FONT_SIZE + MARGIN;
            _displayQuestionTitle();
            _displayChevrons()
            _displayAnswers();
            _displayHelpText();
        }

        displayResult() {
            var _cleanManipulators = () => {
                this.scoreManipulator.flush();
            }
            var _attachManipulators = () => {
                this.manipulator.add(this.scoreManipulator);
            }
            var _displayText = () => {
                let scoreText = new svg.Text(this.getScore().message).font(FONT, FONT_SIZE);
                this.scoreManipulator.add(scoreText);
                this.scoreManipulator.move(drawing.width/2, this.header.height + MARGIN + FONT_SIZE/2 + INPUT_HEIGHT + MARGIN);
            }
            var _displayAnswered = () => {
                let answerManip = this.answers[answered.index];
                let colorRect = new svg.Rect(this.answerWidth, ANSWER_HEIGHT).color(myColors.greyerBlue, 1, myColors.black).corners(10, 10);
                answerManip.set(0, colorRect);
            }
            var _displayCorrect = (correctAnswerIndex) => {
                let answerManip = this.answers[correctAnswerIndex];
                let colorRect = new svg.Rect(this.answerWidth, ANSWER_HEIGHT).color(myColors.none, 3, myColors.green).corners(10, 10);
                answerManip.set(1, colorRect);
            }
            var _removeClickEvents = () => {
                this.answers.forEach((manip)=> manip.removeEvent('click'))
            }

            let answered = this.getCurrentAnswered();
            _cleanManipulators();
            _attachManipulators();
            _displayText();
            _displayAnswered();
            if(answered.correct){
                _displayCorrect(answered.index);
            }else {
                let correctAnswerIndex = this.getCorrectAnswerIndex();
                _displayCorrect(correctAnswerIndex);
            }
            _removeClickEvents();
        }

        returnHandler() {
            this.presenter.returnHandler();
        }

        nextQuestion() {
            this.presenter.nextQuestion();
        }

        previousQuestion() {
            this.presenter.previousQuestion();
        }

        selectAnswer(index) {
            this.presenter.selectAnswer(index);
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        isFirstQuestion() {
            return this.presenter.isFirstQuestion();
        }

        isLastAnsweredQuestion() {
            return this.presenter.isLastAnsweredQuestion();
        }

        getCurrentQuestionLabel() {
            return this.presenter.getCurrentQuestionLabel();
        }

        getCurrentAnswers() {
            return this.presenter.getCurrentAnswers();
        }

        getCurrentAnswered() {
            return this.presenter.getCurrentAnswered();
        }

        getCorrectAnswerIndex(){
            return this.presenter.getCorrectAnswerIndex();
        }

        getScore(){
            return this.presenter.getScore();
        }
    }

    return QuizCollabV;
}