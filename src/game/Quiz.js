/**
 * Created by MLE3657 on 20/03/2017.
 */
exports.Quiz = function (globalVariables, GameVue, QuestionVue) {
    let
        main = globalVariables.main,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        Manipulator = globalVariables.util.Manipulator,
        Puzzle = globalVariables.util.Puzzle,
        ReturnButton = globalVariables.util.ReturnButton,
        Server = globalVariables.util.Server,
        playerMode = globalVariables.playerMode;


    /**
     * Quiz
     * @class
     */
    class QuizVue extends GameVue{
        /**
         * construit un quiz
         * @constructs
         * @param {Object} quiz - options sur le quiz
         * @param {Boolean} previewMode - le jeu est il affiché en mode preview (lorsque l'admin modifie un quiz, il peut voir un aperçu de ce dernier
         * @param {Formation} parentFormation - formation contenant le quiz
         */
        constructor(quiz, previewMode, parentFormation) {
            super(quiz, parentFormation);
            const returnText = playerMode ? (previewMode ? "Retour aux résultats" : "Retour à la formation") : "Retour à l'édition du jeu";
            this.returnButton = new ReturnButton(this, returnText);
            this.manipulator.add(this.returnButtonManipulator);
            this.expButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.add(this.expButtonManipulator);
            this.chevronManipulator = new Manipulator(this);
            this.leftChevronManipulator = new Manipulator(this).addOrdonator(1);
            this.rightChevronManipulator = new Manipulator(this).addOrdonator(1);
            this.manipulator.add(this.chevronManipulator);
            this.chevronManipulator.add(this.leftChevronManipulator);
            this.chevronManipulator.add(this.rightChevronManipulator);
            this.loadQuestions(quiz);
            this.levelIndex = quiz.levelIndex || 0;
            this.gameIndex = quiz.gameIndex || 0;
            (previewMode) ? (this.previewMode = previewMode) : (this.previewMode = false);
            quiz.puzzleRows ? (this.puzzleRows = quiz.puzzleRows) : (this.puzzleRows = 3);
            quiz.puzzleLines ? (this.puzzleLines = quiz.puzzleLines) : (this.puzzleLines = 3);
            quiz.font && (this.font = quiz.font);
            quiz.fontSize ? (this.fontSize = quiz.fontSize) : (this.fontSize = 20);
            quiz.colorBordure ? (this.colorBordure = quiz.colorBordure) : (this.colorBordure = myColors.black);
            quiz.bgColor ? (this.bgColor = quiz.bgColor) : (this.bgColor = myColors.none);
            this.resultArea = {
                x: drawing.width / 2,
                y: 220,
                w: drawing.width,
                h: 200
            };
            this.titleArea = {
                x: 0,
                y: 0,
                w: drawing.width,
                h: 200
            };
            this.questionArea = {
                x: 0,
                y: 210,
                w: drawing.width,
                h: 200
            };
            this.miniaturePosition = {x: 0, y: 0};
            this.questionsAnswered = quiz.questionsAnswered ? quiz.questionsAnswered : [];
            this.score = (quiz.score ? quiz.score : 0);
            this.currentQuestionIndex = quiz.currentQuestionIndex ? quiz.currentQuestionIndex : -1;
        }

        /**
         *
         * @param x
         * @param y
         * @param w
         * @param h
         */
        render(x, y, w, h) {
            main.currentPageDisplayed = "Quiz";
            globalVariables.header.display(this.parentFormation.label + " - " + this.title);
            drawing.manipulator.set(1, this.manipulator);
            let headerPercentage, questionPercentageWithImage, questionPercentage,
                answerPercentageWithImage;
            let setSizes = (() => {
                this.x = x + w * 0.15 || this.x || 0;
                this.y = y || this.y || 0;
                w && (this.questionArea.w = w * 0.7);
                (w && x) && (this.resultArea.w = w);
                x && (this.resultArea.x = x);
                w && (this.titleArea.w = w);
                headerPercentage = HEADER_SIZE;
                questionPercentageWithImage = 0.3;
                questionPercentage = 0.2;
                answerPercentageWithImage = 0.6;
                this.answerPercentage = 0.7;
            })();

            let heightPage = drawing.height;
            this.headerHeight = heightPage * headerPercentage;
            this.questionHeight = heightPage * questionPercentage - MARGIN;
            this.answerHeight = heightPage * this.answerPercentage - MARGIN;
            this.questionHeightWithoutImage = heightPage * questionPercentage - MARGIN;
            this.answerHeightWithoutImage = heightPage * this.answerPercentage - MARGIN;
            this.questionHeightWithImage = heightPage * questionPercentageWithImage - MARGIN;
            this.answerHeightWithImage = heightPage * answerPercentageWithImage - MARGIN;
            this.manipulator.move(this.questionArea.w / 2, this.headerHeight);
            this.returnButton.display(MARGIN - w * 0.5 + this.x, this.headerHeight / 2, 20, 20);
            this.returnButtonManipulator.ordonator.children[0].mark('returnButtonToResults');
            let returnButtonChevron = this.returnButton.chevronManipulator.ordonator.children[0];
            if (this.previewMode) {
                if (playerMode) {
                    this.returnButton.setHandler(() => {
                        drawings.component.clean();
                        this.closePopIn();
                        this.previewMode = false;
                        this.currentQuestionIndex = this.tabQuestions.length;
                        this.manipulator.flush();
                        this.puzzleLines = 3;
                        this.puzzleRows = 3;
                        this.returnButton.label = "Retour à la formation";
                        returnButtonChevron.mark('returnButtonToFormation');
                        main.currentPageDisplayed = "QuizPreview";
                        (this.oldQuiz ? this.oldQuiz : this).display(0, 0, drawing.width, drawing.height);
                    });
                } else {
                    drawings.component.clean();
                    returnButtonChevron.mark('returnButtonPreview');
                    this.returnButton.setHandler(() => {
                        drawings.component.clean();
                        this.closePopIn();
                        this.manipulator.flush();
                        this.parentFormation.quizManager.loadQuiz(this, this.currentQuestionIndex);
                        this.parentFormation.quizManager.display();
                    });
                }
            } else {
                drawings.component.clean();
                returnButtonChevron.mark('returnButtonToFormation');
                let returnHandler = () => {
                    drawings.component.clean();
                    this.closePopIn();
                    this.manipulator.flush();
                    this.parentFormation.display();
                    this.returnButton.removeHandler(returnHandler);
                };
                this.returnButton.setHandler(returnHandler);
            }
            this.leftChevron = new Chevron(x - w * 0.3, y + h * 0.45, w * 0.1, h * 0.15, this.leftChevronManipulator, "left");
            this.leftChevron.mark('leftChevron');
            this.rightChevron = new Chevron(x + w * 0.6, y + h * 0.45, w * 0.1, h * 0.15, this.rightChevronManipulator, "right");
            this.rightChevron.mark('rightChevron');

            this.leftChevron.update = function (quiz) {
                if (quiz.currentQuestionIndex === 0) {
                    this.color(myColors.grey);
                    svg.removeEvent(this, "click");
                } else {
                    this.color(myColors.black);
                    svg.addEvent(this, "click", () => { leftChevronHandler(); });
                }
            };
            this.rightChevron.update = function (quiz) {
                if (quiz.previewMode) {
                    if (quiz.currentQuestionIndex === quiz.tabQuestions.length - 1) {
                        this.color(myColors.grey);
                        svg.removeEvent(this, "click");
                    } else {
                        this.color(myColors.black);
                        svg.addEvent(this, "click", () => { rightChevronHandler(); });
                    }
                } else {
                    if (quiz.currentQuestionIndex === quiz.questionsAnswered.length) {
                        this.color(myColors.grey);
                        svg.removeEvent(this, "click");
                    } else {
                        this.color(myColors.black);
                        svg.addEvent(this, "click", () => { rightChevronHandler(); });
                    }
                }
            };

            this.closePopIn = () => {
                this.tabQuestions[this.currentQuestionIndex] && this.tabQuestions[this.currentQuestionIndex].tabAnswer.forEach(answer => {
                    if (answer.model.explanationPopIn && answer.model.explanationPopIn.displayed) {
                        let said = answer.model.explanationPopIn.said;
                        answer.model.explanationPopIn.cross.component.listeners["click"]();
                        answer.model.explanationPopIn.said = said;
                    }
                });
            };

            let leftChevronHandler = () => {
                drawings.component.clean();
                this.closePopIn();
                if (this.currentQuestionIndex > 0) {
                    this.manipulator.remove(this.tabQuestions[this.currentQuestionIndex].manipulator);
                    this.currentQuestionIndex--;
                    this.leftChevron.update(this);
                    this.rightChevron.update(this);
                    this.displayCurrentQuestion();
                }
            };
            let rightChevronHandler = () => {
                drawings.component.clean();
                this.closePopIn();
                if (this.currentQuestionIndex < this.tabQuestions.length - 1) {
                    this.manipulator.remove(this.tabQuestions[this.currentQuestionIndex].manipulator);
                    this.currentQuestionIndex++;
                    this.leftChevron.update(this);
                    this.rightChevron.update(this);
                    this.displayCurrentQuestion();
                }
            };

            if (this.currentQuestionIndex === -1) {// on passe à la première question
                this.nextQuestion();
            }
            else if (this.currentQuestionIndex < this.tabQuestions.length) {
                this.displayCurrentQuestion();
            }
            else {
                this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, this.getQuestionsWithBadAnswers(), "upToDown", this);
                this.displayResult();
            }
        }

        /**
         *
         * @param color
         */
        displayResult(color) {
            drawings.component.clean();
            this.displayScore(color);
            this.leftChevronManipulator.unset(0);
            this.rightChevronManipulator.unset(0);

            const
                buttonExpHeight = 50,
                buttonExpWidth = drawing.width * 0.3,
                textExp = "Voir les réponses et explications",
                expButton = displayText(textExp, buttonExpWidth, buttonExpHeight, myColors.black, myColors.white, 20, null, this.expButtonManipulator);
            this.expButtonManipulator.move(buttonExpWidth / 2, drawing.height - this.headerHeight - buttonExpHeight);
            expButton.border.mark('expButton');

            const displayExplanation = () => {
                drawings.component.clean();
                this.manipulator.flush();
                let quizExplanation = new QuizVue(this, true);
                quizExplanation.currentQuestionIndex = 0;
                quizExplanation.oldQuiz = this;
                globalVariables.formationsManager.formationDisplayed.quizDisplayed = quizExplanation;
                quizExplanation.run(1, 1, drawing.width, drawing.height);
            };

            svg.addEvent(expButton.border, "click", displayExplanation);
            svg.addEvent(expButton.content, "click", displayExplanation);

            this.puzzle.fillVisibleElementsArray("upToDown");
            this.answerHeight = (drawing.height - this.headerHeight - buttonExpHeight) * this.answerPercentage - MARGIN;
            this.puzzle.display(0, this.questionHeight / 2 + this.answerHeight / 2 + MARGIN, drawing.width - MARGIN, this.answerHeight);
            this.puzzle.leftChevron.resize(this.puzzle.chevronSize, this.puzzle.chevronSize);
        }

        /**
         *
         * @param color
         */
        displayScore(color) {
            let autoColor;
            switch (this.score) {
                case this.tabQuestions.length:
                    str1 = 'Impressionant !';
                    str2 = 'et toutes sont justes !';
                    autoColor = [100, 255, 100];
                    break;
                case 0:
                    str1 = 'Votre niveau est désolant... Mais gardez espoir !';
                    str2 = "dont aucune n'est juste !";
                    autoColor = [255, 17, 0];
                    break;
                case (this.tabQuestions.length - 1):
                    str1 = 'Pas mal du tout !';
                    str2 = 'et toutes (sauf une...) sont justes !';
                    autoColor = [200, 255, 0];
                    break;
                case 1:
                    str1 = 'Vous avez encore de nombreux progrès à faire.';
                    str2 = 'dont une seule est juste.';
                    autoColor = [255, 100, 0];
                    break;
                default:
                    str1 = 'Correct, mais ne relachez pas vos efforts !';
                    str2 = `dont ${this.score} sont justes !`;
                    autoColor = [220, 255, 0];
                    break;
            }
            var str1, str2;
            let finalMessage = `${str1} Vous avez répondu à ${this.tabQuestions.length} questions, ${str2}`;
            if (!color) {
                var usedColor = autoColor;
            } else {
                usedColor = color;
            }
            this.resultManipulator && this.manipulator.remove(this.resultManipulator);
            this.resultManipulator = new Manipulator(this);
            this.scoreManipulator = new Manipulator(this).addOrdonator(2);
            this.resultManipulator.move(this.titleArea.w / 2 - this.questionArea.w / 2, this.questionHeight / 2 + this.headerHeight / 2 + 2 * MARGIN);
            this.resultManipulator.add(this.scoreManipulator);
            this.resultManipulator.add(this.puzzle.manipulator);
            this.manipulator.add(this.resultManipulator);
            displayText(finalMessage, this.titleArea.w - 2 * MARGIN, this.questionHeight, myColors.black, usedColor, this.fontSize, this.font, this.scoreManipulator);
        }

        /**
         * charge les questions du quiz (crée une classe Question pour chaque objet dans quiz.tabQuestions)
         * @param quiz - quiz à charger
         */
        loadQuestions(quiz) {
            if (quiz && typeof quiz.tabQuestions !== 'undefined') {
                this.tabQuestions = [];
                quiz.tabQuestions.forEach(it => {
                    it.questionType = it.multipleChoice ? myQuestionType.tab[1] : myQuestionType.tab[0];
                    let tmp = new QuestionVue(it, this);
                    tmp.parentQuiz = this;
                    this.tabQuestions.push(tmp);
                });
            } else {
                this.tabQuestions = [];
                this.tabQuestions.push(new QuestionVue(defaultQuestion, this));
            }
        }

        /**
         *
         * @param x
         * @param y
         * @param w
         * @param h
         */
        run(x, y, w, h) {
            let intervalToken = svg.interval(() => {
                if (this.tabQuestions.every(e => e.imageLoaded && e.tabAnswer.every(el => el.model.imageLoaded))) {
                    svg.clearInterval(intervalToken);
                    this.display(x, y, w, h);
                }
            }, 100);
        }

        /**
         * affiche la question en cours
         */
        displayCurrentQuestion() {
            if (this.tabQuestions[this.currentQuestionIndex].imageSrc) {
                this.questionHeight = this.questionHeightWithImage;
                this.answerHeight = this.answerHeightWithImage;
            } else {
                this.questionHeight = this.questionHeightWithoutImage;
                this.answerHeight = this.answerHeightWithoutImage;
            }
            this.manipulator.add(this.tabQuestions[this.currentQuestionIndex].manipulator);
            this.tabQuestions[this.currentQuestionIndex].manipulator.flush();
            this.tabQuestions[this.currentQuestionIndex].display(this.x, this.headerHeight + this.questionHeight / 2 + MARGIN,
                this.questionArea.w, this.questionHeight);
            this.rightChevron.update(this);
            this.leftChevron.update(this);
            !this.previewMode && this.tabQuestions[this.currentQuestionIndex].manipulator.add(this.tabQuestions[this.currentQuestionIndex].answersManipulator);
            this.tabQuestions[this.currentQuestionIndex].displayAnswers(this.questionArea.w, this.answerHeight);
        }

        /**
         * question suivante
         * !_! bof, y'a encore des display appelés ici
         */
        nextQuestion() {
            if (this.currentQuestionIndex !== -1) {
                this.manipulator.remove(this.tabQuestions[this.currentQuestionIndex].manipulator);
            }

            if (this.previewMode) {
                if (this.currentQuestionIndex === -1) {
                    this.currentQuestionIndex++;
                }
                this.displayCurrentQuestion();
            } else {
                Server.sendProgressToServer(this)
                    .then(() => {
                        if (++this.currentQuestionIndex < this.tabQuestions.length) {
                            this.displayCurrentQuestion();
                        } else {
                            this.puzzle = new Puzzle(this.puzzleLines, this.puzzleRows, this.getQuestionsWithBadAnswers(), "leftToRight", this);
                            this.displayResult();
                        }
                    });
            }
        }

        /**
         * retourne toutes les questions qui ont été mal répondues
         * @returns {Array}
         */
        getQuestionsWithBadAnswers() {
            let questionsWithBadAnswers = [],
                allRight = false;
            this.questionsAnswered.forEach(questionAnswered => {
                let question = questionAnswered.question;
                if (question.multipleChoice) {
                    if (question.rightAnswers.length !== questionAnswered.validatedAnswers.length) {
                        questionsWithBadAnswers.push(question);
                    } else {
                        let subTotal = 0;
                        questionAnswered.validatedAnswers.forEach((e) => {
                            if (question.tabAnswer[e].model.correct) {
                                subTotal++;
                            }
                        });
                        allRight = (subTotal === question.rightAnswers.length);
                        !allRight && questionsWithBadAnswers.push(question);
                    }
                } else if (!question.multipleChoice && !question.tabAnswer[questionAnswered.validatedAnswers[0]].model.correct) {
                    questionsWithBadAnswers.push(question);
                }

            });
            return questionsWithBadAnswers;
        }
    }

    return {
        QuizVue : QuizVue
    }
}