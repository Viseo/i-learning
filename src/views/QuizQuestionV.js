/**
 * Created by TBE3610 on 05/05/2017.
 */

exports.QuizQuestionV = function (globalVariables) {
    const
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        IconCreator = globalVariables.domain.IconCreator,
        drawing = globalVariables.drawing,
        View = globalVariables.View;

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
        EXPLANATION_HEIGHT = 200,
        BUTTON_WIDTH = 200,
        BUTTON_HEIGHT = 40;

    class QuizQuestionV  extends View{
        constructor(presenter) {
            super(presenter);
            var _initVariables = () => {
                this.answers = [];
            }
            var _defineManipulators = () => {
                this.manipulator = new Manipulator(this);
                this.questionManipulator = new Manipulator(this).addOrdonator(4);
                this.returnButtonManipulator = new Manipulator(this);
                this.leftChevronManipulator = new Manipulator(this).mark('leftChevron');
                this.rightChevronManipulator = new Manipulator(this).mark('rightChevron');
                this.answersManipulator = new Manipulator(this);
                this.helpManipulator = new Manipulator(this);
                this.scoreManipulator = new Manipulator(this);
                this.explanationManipulator = new Manipulator(this);
                this.buttonsManipulator = new Manipulator(this);
            }

            _initVariables();
            _defineManipulators();
        }

        display() {
            var _cleanManipulators = () => {
                this.manipulator.flush();
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
                    .add(this.answersManipulator);
            }
            var _displayHeader = () => {
                this.header.display(this.getLabel());
            };
            var _displayReturnButton = () => {
                this.returnButton = new gui.Button(INPUT_WIDTH, INPUT_HEIGHT, [myColors.white, 1, myColors.grey], 'Retourner à la formation');
                this.returnButton.back.corners(5, 5);
                this.returnButton.text.font(FONT, FONT_SIZE).position(0, 6.6);
                this.returnButton.onClick(this.returnHandler.bind(this));
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator
                    .add(this.returnButton.component)
                    .add(chevron)
                this.returnButtonManipulator.move(this.returnButton.width / 2 + MARGIN, currentY + this.returnButton.height / 2);
                currentY += this.returnButton.height + MARGIN;
            }
            var _addMarginForScoreText = () => {
                currentY += FONT_SIZE + MARGIN;
            }
            var _displayQuestionTitle = () => {
                let border = util.drawHexagon(drawing.width / 2, HEXAGON_HEIGHT_RATIO * drawing.height, 'H', 0.65)
                this.questionManipulator.set(1, border);
                let line = new svg.Line(-drawing.width / 2 + MARGIN, 0, drawing.width / 2 - MARGIN, 0)
                    .color(myColors.grey, 1, myColors.grey);
                this.questionManipulator.set(0, line);
                let title = new svg.Text(this.getCurrentQuestionLabel())
                    .font(FONT, FONT_SIZE)
                    .mark('questionTitle'+this.getId());
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
                    let glass = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 0, myColors.white);
                    let leftChevron = new svg.Chevron(dimensions.width, dimensions.height, dimensions.stroke, "W");
                    if (this.isFirstQuestion()) {
                        leftChevron.color(myColors.grey, 1, myColors.grey);
                    } else {
                        leftChevron.color(myColors.black, 1, myColors.black)
                        this.leftChevronManipulator.addEvent('click', this.previousQuestion.bind(this));
                    }
                    this.leftChevronManipulator.add(glass).add(leftChevron);
                    this.leftChevronManipulator.move(MARGIN + dimensions.width / 2, (drawing.height + currentY) / 2);
                }
                var _displayRightChevron = () => {
                    let glass = new svg.Rect(dimensions.width, dimensions.height).color(myColors.white, 0, myColors.white);
                    let rightChevron = new svg.Chevron(dimensions.width, dimensions.height, dimensions.stroke, "E");
                    if (this.isLastAnsweredQuestion()) {
                        rightChevron.color(myColors.grey, 1, myColors.grey);
                    } else {
                        rightChevron.color(myColors.black, 1, myColors.black)
                        this.rightChevronManipulator.addEvent('click', this.nextQuestion.bind(this));
                    }
                    this.rightChevronManipulator.add(glass).add(rightChevron);
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
                    let _resetAnswer = () => {
                        manip.set(0, border);
                        colored = false;
                    }
                    let _selectAnswer = () => {
                        if(colored){
                            _resetAnswer();
                        }else {
                            manip.set(0, colorRect);
                            colored = true;
                        }
                        this.selectAnswer(index);
                    }

                    let manip = new Manipulator(this).addOrdonator(3).mark(answer.label); //keep one layer for color answer
                    let border = new svg.Rect(this.answerWidth, this.answerHeight).color(myColors.white, 1, myColors.black).corners(10, 10);
                    let colorRect = new svg.Rect(this.answerWidth, this.answerHeight).color(myColors.greyerBlue, 1, myColors.black).corners(10, 10);
                    let colored = false;
                    let title = new svg.Text(answer.label).font(FONT, FONT_SIZE)
                    let indexX = Math.floor(index % ANSWERS_PER_LINE);
                    let indexY = Math.floor(index / ANSWERS_PER_LINE);
                    manip
                        .set(0, border)
                        .set(2, title);
                    manip.move(indexX * (this.answerWidth + MARGIN), indexY * (this.answerHeight + MARGIN));
                    manip.addEvent('click', _selectAnswer);
                    manip.resetHandler = _resetAnswer;
                    return manip;
                }

                let dimensions = {
                    width: drawing.width * 3 / 5,
                    height: drawing.height - currentY - BUTTON_HEIGHT - 2*MARGIN
                }
                let answers = this.getCurrentAnswers();
                let nbLines = Math.ceil(answers.length / ANSWERS_PER_LINE);
                this.answerWidth = dimensions.width / ANSWERS_PER_LINE - (ANSWERS_PER_LINE - 1) / ANSWERS_PER_LINE * MARGIN;
                this.answerHeight = dimensions.height / nbLines - (nbLines - 1) / nbLines * MARGIN;
                answers.forEach((answer, index) => {
                    let answerManip = _displayAnswer(answer, index);
                    this.answers.push(answerManip);
                    this.answersManipulator.add(answerManip);
                });
                this.answersManipulator.move(drawing.width / 5 + this.answerWidth / 2, currentY + this.answerHeight / 2);
            }
            var _displayMultipleChoiceButtons = () => {
                var _displayValidateButton = () => {
                    let validateButton = new gui.Button(BUTTON_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], "Valider");
                    validateButton.position(BUTTON_WIDTH/2 + MARGIN/2, 0);
                    validateButton.onClick(this.confirmQuestion.bind(this));
                    validateButton.glass.mark('validateButton');
                    this.buttonsManipulator.add(validateButton.component)
                }
                var _displayResetButton = () => {
                    let _resetAnswers = () => {
                        this.resetAnswers();
                        this.answers.forEach((manip)=> manip.resetHandler());
                    }

                    let resetButton = new gui.Button(BUTTON_WIDTH, BUTTON_HEIGHT, [[43, 120, 228], 1, myColors.black], "Réinitialiser")
                    resetButton.position(-BUTTON_WIDTH/2 - MARGIN/2, 0);
                    resetButton.onClick(_resetAnswers);
                    this.buttonsManipulator.add(resetButton.component);
                }

                _displayValidateButton();
                _displayResetButton();
                this.buttonsManipulator.move(drawing.width/2, drawing.height - MARGIN - BUTTON_HEIGHT/2);
                this.manipulator.add(this.buttonsManipulator);
            }
            var _displayHelpText = () => {
                let helpText = new svg.Text("cliquez sur une réponse pour passer à la question suivante").font(FONT, FONT_SIZE);
                this.helpManipulator.add(helpText);
                this.helpManipulator.move(drawing.width / 2, drawing.height - FONT_SIZE - MARGIN);
                this.manipulator.add(this.helpManipulator);
            }

            drawing.manipulator.set(0, this.manipulator);
            var currentY = this.header.height + MARGIN;
            _cleanManipulators();
            _attachManipulators();
            _displayHeader();
            _displayReturnButton();
            _addMarginForScoreText();
            _displayQuestionTitle();
            _displayChevrons()
            _displayAnswers();
            if(this.isMultipleChoice()){
                _displayMultipleChoiceButtons();
            }else {
                _displayHelpText();
            }
        }

        displayResult() {
            var _hidebottomElements = () => {
                this.helpManipulator.flush();
                this.buttonsManipulator.flush();
            }
            var _attachManipulators = () => {
                this.manipulator
                    .add(this.scoreManipulator)
                    .add(this.explanationManipulator)
            }
            var _modifyReturnButtonText = () => {
                this.returnButton.text.message("Retour aux résultats");
            }
            var _displayText = () => {
                let score = this.getScore();
                let scoreText = new svg.Text(score.message).font(FONT, FONT_SIZE).mark('scoreText');
                let icon = IconCreator.createImageIcon(score.emojiSrc, this.scoreManipulator);
                this.scoreManipulator.add(scoreText);
                icon.position(-scoreText.boundingRect().width/2 - MARGIN - icon.getContentSize()/2, -FONT_SIZE/2);
                this.scoreManipulator.move(drawing.width / 2, this.header.height + MARGIN + FONT_SIZE / 2 + INPUT_HEIGHT + 2*MARGIN);
            }
            var _addExplanations = () => {
                var _toggleExplanation = (explanation) => {
                    var _hideExplanation = () => {
                        this.explanationManipulator.flush();
                        displayed = false;
                    }

                    if(displayed === explanation){
                        _hideExplanation()
                    }else {
                        let border = new svg.Rect(drawing.width - 2*MARGIN, EXPLANATION_HEIGHT).color(myColors.white, 1, myColors.black).corners(5, 5);
                        let text = new svg.Text(explanation.label).font(FONT, FONT_SIZE);
                        this.explanationManipulator.add(border).add(text);
                        let redCross = IconCreator.createRedCrossIcon(this.explanationManipulator);
                        redCross.position(drawing.width/2 - MARGIN, -EXPLANATION_HEIGHT/2);
                        redCross.addEvent('click', _hideExplanation);
                        this.explanationManipulator.move(drawing.width/2, this.header.height + MARGIN + EXPLANATION_HEIGHT/2);
                        displayed = explanation;
                    }
                }

                let displayed = false;
                this.getCurrentAnswers().forEach((answer, index) => {
                    if(answer.explanation){
                        let manip = this.answers[index];
                        let icon = IconCreator.createExplanationIcon(manip);
                        icon.position(this.answerWidth/2 - MARGIN - 25, this.answerHeight/2 - 25 - MARGIN)
                        icon.addEvent("click", () => _toggleExplanation(answer.explanation));
                    }
                })
            }
            var _displayAnswered = () => {
                this.getCurrentAnswered().forEach((answeredIndex) => {
                    let answerManip = this.answers[answeredIndex];
                    let colorRect = new svg.Rect(this.answerWidth, this.answerHeight).color(myColors.greyerBlue, 1, myColors.black).corners(10, 10);
                    answerManip.set(0, colorRect);
                })

            }
            var _displayCorrects = () => {
                this.getCorrectAnswersIndex().forEach((answerIndex)=>{
                    let answerManip = this.answers[answerIndex];
                    let colorRect = new svg.Rect(this.answerWidth, this.answerHeight).color(myColors.none, 3, myColors.green).corners(10, 10);
                    answerManip.set(1, colorRect);
                })
            }
            var _removeClickEvents = () => {
                this.answers.forEach((manip) => manip.removeEvent('click'))
            }

            _hidebottomElements();
            _attachManipulators();
            _modifyReturnButtonText();
            _displayText();
            _addExplanations();
            _displayAnswered();
            _displayCorrects();
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

        resetAnswers(){
            this.presenter.resetAnswers();
        }

        confirmQuestion(){
            this.presenter.confirmQuestion();
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        getId(){
            return this.presenter.getId();
        }

        isMultipleChoice(){
            return this.presenter.isMultipleChoice();
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

        getCorrectAnswersIndex() {
            return this.presenter.getCorrectAnswersIndex();
        }

        getScore() {
            return this.presenter.getScore();
        }
    }

    return QuizQuestionV;
}