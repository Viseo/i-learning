exports.Domain = function (globalVariables) {

    let imageController;
    let myFormations;

    let
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        clientWidth = globalVariables.clientWidth,
        clientHeight = globalVariables.clientHeight,
        Manipulator = globalVariables.util.Manipulator,
        MiniatureFormation = globalVariables.util.MiniatureFormation,
        Puzzle = globalVariables.util.Puzzle,
        ReturnButton = globalVariables.util.ReturnButton,
        Server = globalVariables.util.Server,
        playerMode = globalVariables.playerMode;

    imageController = ImageController(globalVariables.ImageRuntime);
    globalVariables.imageController = imageController;

    setGlobalVariables = () => {
        runtime = globalVariables.runtime;
        drawing = globalVariables.drawing;
        drawings = globalVariables.drawings;
        svg = globalVariables.svg;
        clientWidth = globalVariables.clientWidth;
        clientHeight = globalVariables.clientHeight;
        Manipulator = globalVariables.util.Manipulator;
        MiniatureFormation = globalVariables.util.MiniatureFormation;
        Puzzle = globalVariables.util.Puzzle;
        ReturnButton = globalVariables.util.ReturnButton;
        Server = globalVariables.util.Server;
        playerMode = globalVariables.playerMode;
    };

    /**
     * définis la manière d'afficher à l'écran un ou des éléments
     * @class
     */
    class Vue {
        /**
         * @constructs
         * @param options - contient des options à appliquer sur la vue
         * @param options.model - modele associé à la vue
         */
        constructor(options) {
            if (!options) options = {};
            this.manipulator = new Manipulator(this);
            this.model = options.model;
        }

        events() {
            return {};
        }

        render() {
            console.log("vue rendered")
        };

        display() {
            this.render();
            this._setEvents();
            return this;
        }

        _setEvents() {
            this.events().forEach(function (handler, eventOptions) {
                let [eventName, target] = eventOptions.split(' ');
                //global event
                if (!target) {
                    svg.addGlobalEvent(eventName, handler.bind(this));
                }
                //local event
                else {
                    let targetType = target[0];
                    let componentName = target.slice(1);
                    let component;
                    //TODO faire cas où  c'est un id svg (#)
                    switch (targetType) {
                        case ".":
                            component = this[componentName];
                            component.children().forEach(function (child) {
                                svg.addEvent(child, eventName, handler.bind(this));
                            }, this);
                            break;
                        case "#":
                            break;
                        default:
                            console.error(`error while assigning events: ${eventOptions}`);
                            break;
                    }
                }
            }.bind(this));
        }
    }

    class Model {
        constructor(model) {
            this.model = model;
            this.manipulator = model.manipulator;
        }
    }

    class AnswerVue extends Vue{
        constructor(options){
            super(options);
            this.explanationIconManipulator = new Manipulator(this).addOrdonator(5);
        }

        isEditable(editor,editable){
            this.linesManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.linesManipulator);
            this.penManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.penManipulator);
            this.model.isEditable(editor,editable);
        }
        //TODO define events
        events(){
            return{

            }
        }

        render(x, y , w, h){
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;

            let answerEditableDisplay = (x, y, w, h) => {
                let checkboxSize = h * 0.2;
                this.obj = {};
                let redCrossClickHandler = () => {
                    this.redCrossManipulator.flush();
                    let index = this.model.parentQuestion.tabAnswer.indexOf(this.model);
                    drawing.mousedOverTarget = null;
                    drawings.component.remove(this.model.parentQuestion.tabAnswer[index].obj.video);
                    this.model.parentQuestion.tabAnswer.splice(index, 1);
                    let questionCreator = this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                    if (this.model.parentQuestion.tabAnswer.length < 3) {
                        svg.event(this.model.parentQuestion.tabAnswer[this.model.parentQuestion.tabAnswer.length - 1].manipulator.ordonator.children[2], 'dblclick', {});
                        if (index === 0) {
                            [this.model.parentQuestion.tabAnswer[0], this.model.parentQuestion.tabAnswer[1]] = [this.model.parentQuestion.tabAnswer[1], this.model.parentQuestion.tabAnswer[0]];
                        }
                    }
                    questionCreator.display();
                    this.model.parentQuestion.checkValidity();
                };
                let mouseleaveHandler = () => {
                    this.redCrossManipulator.flush();
                };
                let mouseoverHandler = () => {
                    if (typeof this.redCrossManipulator === 'undefined') {
                        this.redCrossManipulator = new Manipulator(this).addOrdonator(2);
                        this.manipulator && this.manipulator.add(this.redCrossManipulator);
                    }
                    let redCrossSize = 15;
                    let redCross = drawRedCross(this.width / 2 - redCrossSize, -this.height / 2 + redCrossSize, redCrossSize, this.redCrossManipulator)
                        .mark('redCross');
                    svg.addEvent(redCross, 'click', redCrossClickHandler);
                    this.redCrossManipulator.set(1, redCross);
                };

                let removeErrorMessage = () => {
                    this.model.invalidLabelInput = false;
                    this.model.errorMessage && (this.model.editor.parent.hasOwnProperty("questionCreator")?this.model.editor.parent.questionCreator.manipulator.unset(1):this.model.editor.parent.parent.questionCreator.manipulator.unset(1));
                    this.border.color(myColors.white, 1, myColors.black);
                };

                let displayErrorMessage = (message) => {
                    removeErrorMessage();
                    this.border.color(myColors.white, 2, myColors.red);
                    let quizManager = this.model.parentQuestion.parentQuiz.parentFormation.quizManager,
                        anchor = 'middle';
                    this.model.errorMessage = new svg.Text(message);
                    quizManager.questionCreator.manipulator.set(1, this.model.errorMessage);
                    this.model.errorMessage.position(0, quizManager.questionCreator.h / 2 - MARGIN / 2)
                        .font('Arial', 15).color(myColors.red).anchor(anchor)
                        .mark('answerErrorMessage');
                    this.model.invalidLabelInput = message;
                };

                let answerBlockDisplay = () => {
                    let text = (this.model.label) ? this.model.label : this.model.labelDefault,
                        color = (this.model.label) ? myColors.black : myColors.grey;

                    if (this.model.image) {
                        this.model.imageLayer = 2;
                        let pictureRedCrossClickHandler = () => {
                            this.model.imageLayer && this.manipulator.unset(this.model.imageLayer);//image
                            this.model.image = null;
                            this.model.imageSrc = null;
                            let puzzle = this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle;
                            let x = -(puzzle.visibleArea.width - this.width) / 2 + this.model.puzzleColumnIndex * (puzzle.elementWidth + MARGIN);
                            let y = -(puzzle.visibleArea.height - this.height) / 2 + this.model.puzzleRowIndex * (puzzle.elementHeight + MARGIN) + MARGIN;
                            this.render(x, y, this.width, this.height);
                            this.model.parentQuestion.checkValidity();
                        };
                        let picture = new Picture(this.model.image.src, true, this.model, text, pictureRedCrossClickHandler);
                        picture.draw(0, 0, w, h, this.manipulator, w - 2 * checkboxSize);
                        this.border = picture.imageSVG.border;
                        this.obj.image = picture.imageSVG.image;
                        this.obj.content = picture.imageSVG.content;
                        this.obj.image.mark('answerImage' + this.model.parentQuestion.tabAnswer.indexOf(this.model));
                    } else if (this.model.video) {
                        this.obj && this.obj.video && drawings.component.remove(this.obj.video);
                        let obj = drawVideo(text, this.model.video, w, h, this.model.colorBordure, this.model.bgColor, this.model.fontsize, this.model.font, this.manipulator, true, false, 8);
                        obj.video.setRedCrossClickHandler(() => {
                            obj.video.redCrossManipulator.flush();
                            this.manipulator.unset(8);
                            this.obj && this.obj.video && drawings.component.remove(this.obj.video);
                            this.video = null;
                            if (this.model.parentQuestion) {
                                let puzzle = this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle;
                                let x = -(puzzle.visibleArea.width - this.width) / 2 + this.model.puzzleColumnIndex * (puzzle.elementWidth + MARGIN);
                                let y = -(puzzle.visibleArea.height - this.height) / 2 + this.model.puzzleRowIndex * (puzzle.elementHeight + MARGIN) + MARGIN;
                                this.render(x, y, this.width, this.height);
                                this.model.parentQuestion.checkValidity();
                            }
                        });
                        this.obj.content = obj.content;
                        this.border = obj.border;
                        this.obj.video = obj.video;
                    }
                    else {
                        var tempObj = displayText(text, w, h, this.model.colorBordure, this.model.bgColor, this.model.fontSize, this.model.font, this.manipulator, 0, 1, w - 2 * checkboxSize);
                        this.border = tempObj.border;
                        this.obj.content = tempObj.content;
                        this.obj.content.position(0, this.obj.content.y);
                    }

                    (!this.model.invalidLabelInput && text !== "") ? (this.border.color(myColors.white, 1, myColors.black).fillOpacity(0.001)) : (this.border.color(myColors.white, 2, myColors.red).fillOpacity(0.001));
                    (!this.model.invalidLabelInput && text !== "") || displayErrorMessage(this.model.invalidLabelInput);
                    this.obj.content.color(color).mark('answerLabelContent' + this.model.parentQuestion.tabAnswer.indexOf(this.model));
                    this.border._acceptDrop = true;
                    this.obj.content._acceptDrop = true;
                    this.border.mark('answerLabelCadre' + this.model.parentQuestion.tabAnswer.indexOf(this.model));

                    svg.addEvent(this.obj.content, 'dblclick', dblclickEditionAnswer);
                    svg.addEvent(this.border, 'dblclick', dblclickEditionAnswer);
                    svg.addEvent(this.border, 'mouseover', mouseoverHandler);
                    svg.addEvent(this.border, 'mouseout', mouseleaveHandler);
                };

                let dblclickEditionAnswer = () => {
                    let contentarea = {};
                    contentarea.height = this.obj.content.boundingRect().height;
                    contentarea.globalPointCenter = this.obj.content.globalPoint(-(w) / 2, -(contentarea.height) / 2);
                    let contentareaStyle = {
                        toppx: contentarea.globalPointCenter.y - (contentarea.height / 2) * 2 / 3,
                        leftpx: contentarea.globalPointCenter.x + (1 / 12) * this.border.width,
                        height: this.model.image ? contentarea.height : h * 0.5,
                        width: this.border.width * 5 / 6
                    };
                    drawing.notInTextArea = false;
                    contentarea = new svg.TextArea(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height).color(null, 0, myColors.black).font("Arial", 20);
                    (this.model.label === "" || this.model.label === this.model.labelDefault) && contentarea.placeHolder(this.model.labelDefault);
                    contentarea.message(this.model.label || "")
                        .mark('answerLabelContentArea')
                        .width = w;
                    contentarea.globalPointCenter = this.obj.content.globalPoint(-(contentarea.width) / 2, -(contentarea.height) / 2);
                    drawings.component.add(contentarea);
                    contentarea.height = this.obj.content.boundingRect().height;
                    this.manipulator.unset(1);
                    contentarea.focus();
                    //contentarea.setCaretPosition(this.label.length);

                    let onblur = () => {
                        contentarea.enter();
                        this.model.label = contentarea.messageText;
                        drawings.component.remove(contentarea);
                        drawing.notInTextArea = true;
                        answerBlockDisplay();
                        let quizManager = this.model.parentQuestion.parentQuiz.parentFormation.quizManager;
                        quizManager.displayQuestionsPuzzle(null, null, null, null, quizManager.questionPuzzle.indexOfFirstVisibleElement);
                    };
                    let objectToBeCheck = {
                        contentarea: contentarea,
                        border: this.border,
                        onblur: onblur,
                        remove: removeErrorMessage,
                        display: displayErrorMessage
                    };
                    svg.addEvent(contentarea, 'input', () => {
                        contentarea.enter();
                        this.model.checkInputContentArea(objectToBeCheck);
                    });
                    svg.addEvent(contentarea, 'blur', onblur);
                    this.model.checkInputContentArea(objectToBeCheck);
                };

                this.manipulator.flush();
                this.manipulator.move(x, y);
                answerBlockDisplay();
                this.model.penHandler = () => {
                    this.model.popIn = this.model.popIn || new PopIn(this.model, true);
                    let questionCreator = this.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                    this.model.popIn.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                    questionCreator.explanation = this.model.popIn;
                };
                displayPen(this.width / 2 - checkboxSize, this.height / 2 - checkboxSize, checkboxSize, this);

                if (typeof this.obj.checkbox === 'undefined') {
                    this.obj.checkbox = displayCheckbox(-this.width / 2 + checkboxSize, this.height / 2 - checkboxSize, checkboxSize, this.model).checkbox;
                    this.obj.checkbox.mark('checkbox' + this.model.parentQuestion.tabAnswer.indexOf(this.model));
                    this.obj.checkbox.answerParent = this.model;
                }
                this.manipulator.ordonator.children.forEach((e) => {
                    e._acceptDrop = true;
                });
            };

            if (this.model.editable) {
                answerEditableDisplay(this.x, this.y, this.width, this.height);
                return;
            }

            if (this.label && this.imageSrc) { // Reponse avec Texte ET image
                let obj = displayImageWithTitle(this.label, this.imageSrc, this.dimImage, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, this.image);
                this.border = obj.border;
                this.content = obj.text;
                this.image = obj.image;
            } else if (this.video) { // Reponse avec Texte uniquement
                let obj = drawVideo(this.label, this.video, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator, false, true);
                this.border = obj.border;
                this.content = obj.content;
                this.video.miniature = obj.video;
            } else if (this.label && !this.imageSrc) { // Reponse avec Texte uniquement
                let obj = displayText(this.label, this.width, this.height, this.colorBordure, this.bgColor, this.fontSize, this.font, this.manipulator);
                this.border = obj.border;
                this.content = obj.content;
            } else if (this.imageSrc && !this.label) { // Reponse avec Image uniquement
                let obj = displayImageWithBorder(this.imageSrc, this.dimImage, this.width, this.height, this.manipulator);
                this.image = obj.image;
                this.border = obj.border;
            } else { // Cas pour test uniquement : si rien, n'affiche qu'une border
                this.border = new svg.Rect(this.width, this.height).color(this.bgColor, 1, myColors.black).corners(25, 25);
                this.manipulator.add(this.border);
            }
            let index = "answer" + this.model.parentQuestion.tabAnswer.indexOf(this);
            this.content && this.content.mark(index);

            if (this.model.parentQuestion.parentQuiz.previewMode) {
                if (this.model.explanation && (this.model.explanation.image || this.modelexplanation.video || this.model.explanation.label)) {
                    const openPopIn = () => {
                        runtime.speechSynthesisCancel();
                        this.model.parentQuestion.parentQuiz.closePopIn();
                        let popInParent = this.model.parentQuestion,
                            popInX = this.model.parentQuestion.parentQuiz.x,
                            popInY,
                            popInWidth = this.model.parentQuestion.width,
                            popInHeight = this.model.parentQuestion.tileHeightMax * this.model.parentQuestion.lines * 0.8;
                        this.model.explanationPopIn = this.model.explanationPopIn || new PopIn(this.model, false);
                        if (this.model.parentQuestion.image) {
                            popInY = (this.model.parentQuestion.tileHeightMax * this.model.parentQuestion.lines + (this.model.parentQuestion.lines - 1) * MARGIN) / 2 + this.model.parentQuestion.parentQuiz.questionHeightWithImage / 2 + MARGIN;
                        } else {
                            popInY = (this.model.parentQuestion.tileHeightMax * this.model.parentQuestion.lines + (this.model.parentQuestion.lines - 1) * MARGIN) / 2 + this.model.parentQuestion.parentQuiz.questionHeightWithoutImage / 2 + MARGIN;
                        }
                        if (globalVariables.textToSpeechMode && this.model.explanationPopIn.label && (!this.model.explanationPopIn.video || !this.model.explanationPopIn.said)) {
                            setTimeout(() => { runtime.speechSynthesisSpeak(this.model.explanationPopIn.label) }, 200);
                            this.model.explanationPopIn.said = true;
                            (this.model.explanationPopIn.image || this.model.explanationPopIn.video) && this.model.explanationPopIn.display(popInParent, popInX, popInY, popInWidth, popInHeight);
                        }
                        else {
                            this.model.explanationPopIn.display(popInParent, popInX, popInY, popInWidth, popInHeight);
                        }
                    };
                    if (this.model.explanationPopIn && this.model.explanationPopIn.displayed) this.model.parentQuestion.openPopIn = openPopIn;
                    this.model.image && svg.addEvent(this.model.image, "click", openPopIn);
                    this.border && svg.addEvent(this.border, "click", openPopIn);
                    this.content && svg.addEvent(this.content, "click", openPopIn);

                    const pictoSize = 20,
                        explanationIconArray = drawExplanationIcon(this.border.width / 2 - pictoSize, this.border.height / 2 - pictoSize, pictoSize, this.explanationIconManipulator);
                    this.manipulator.set(7, this.explanationIconManipulator);
                    explanationIconArray.forEach(elem => svg.addEvent(elem, "click", openPopIn));
                }

            } else if (playerMode && !this.model.parentQuestion.parentQuiz.previewMode) {
                let clickAnswerHandler = () => {
                    this.select();
                    if (this.model.parentQuestion.multipleChoice && this.selected) {
                        this.model.colorBordure = this.border.strokeColor;
                        this.border.color(this.model.bgColor, 5, SELECTION_COLOR);
                        this.model.parentQuestion.resetManipulator.ordonator.children[0].color(myColors.yellow, 1, myColors.green);
                    } else if (this.model.parentQuestion.multipleChoice) {
                        this.border.color(this.model.bgColor, 1, this.model.colorBordure);
                        if (this.model.parentQuestion.selectedAnswers.length === 0) {
                            this.model.parentQuestion.resetManipulator.ordonator.children[0].color(myColors.grey, 1, myColors.grey);
                        }
                    }
                };
                this.border && svg.addEvent(this.border, "click", () => { clickAnswerHandler() });
                this.content && svg.addEvent(this.content, "click", () => { clickAnswerHandler() });
                this.model.image && svg.addEvent(this.model.image, "click", () => { clickAnswerHandler() });
            }
            if (this.model.selected) { // image pré-selectionnée
                this.border.color(this.model.bgColor, 5, SELECTION_COLOR);
            }
            this.manipulator.move(this.x, this.y);
        }
    }

    class Collection {
        constructor() {

        }
    }

    class ConnexionManagerVue extends Vue {
        constructor(options) {
            super(options);
            this.header = new Header("Connexion");
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordManipulator = new Manipulator(this).addOrdonator(4);
            this.connexionButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.mailAddressManipulator);
            this.manipulator.add(this.passwordManipulator);
            this.manipulator.add(this.connexionButtonManipulator);
            this.mailAddressLabel = "Adresse mail :";
            this.passwordLabel = "Mot de passe :";
            this.connexionButtonLabel = "Connexion";
            this.tabForm = [];
        }

        events() {
            return {
                "click .connexionButtonManipulator": this.connexionButtonHandler,
                "click .mailAddressManipulator": this.clickEditionField("mailAddressField", this.mailAddressManipulator),
                "click .passwordManipulator": this.clickEditionField('passwordField', this.passwordManipulator),
                "keydown": this.keyDownHandler
            }
        }

        render() {
            main.currentPageDisplayed = "ConnexionManager";
            globalVariables.header.display("Connexion");
            globalVariables.drawing.manipulator.set(1, this.manipulator);
            this.manipulator.move(drawing.width / 2, drawing.height / 2);

            this.focusedField = null;
            this.mailAddressField = {
                label: "",
                title: this.mailAddressLabel,
                line: -1,
                errorMessage: "L'adresse email n'est pas valide"
            };
            this.passwordField = {
                label: '',
                labelSecret: '',
                title: this.passwordLabel,
                line: 0,
                secret: true,
                errorMessage: "La confirmation du mot de passe n'est pas valide"
            };

            this.displayField("mailAddressField", this.mailAddressManipulator);
            this.displayField('passwordField', this.passwordManipulator);

            const connexionButtonHeightRatio = 0.075,
                connexionButtonHeight = drawing.height * connexionButtonHeightRatio,
                connexionButtonWidth = 200,
                connexionButton = displayText(this.connexionButtonLabel, connexionButtonWidth, connexionButtonHeight, myColors.black, myColors.white, 20, null, this.connexionButtonManipulator);
            connexionButton.border.mark('connexionButton');
            this.connexionButtonManipulator.move(0, 2.5 * drawing.height / 10);
        }

        keyDownHandler(event){
            if (event.keyCode === 9) { // TAB
                event.preventDefault();
                let index = this.tabForm.indexOf(this.focusedField);
                if (index !== -1) {
                    event.shiftKey ? index-- : index++;
                    if (index === this.tabForm.length) index = 0;
                    if (index === -1) index = this.tabForm.length - 1;
                    svg.event(this.tabForm[index].border, "click");
                }
            } else if (event.keyCode === 13) { // Entrée
                event.preventDefault();
                // ** DMA3622 : no mandatory
                /*svg.activeElement() && svg.activeElement().blur();*/
                this.connexionButtonHandler();
            }
        }

        displayField(field, manipulator) {
            var fieldTitle = new svg.Text(this[field].title).position(0, 0);
            fieldTitle.font("Arial", 20).anchor("end");
            manipulator.set(2, fieldTitle);
            manipulator.move(-drawing.width / 10, this[field].line * drawing.height / 10);
            this.h = 1.5 * fieldTitle.boundingRect().height;
            var displayText = displayTextWithoutCorners(this[field].label, drawing.width / 6, this.h, myColors.black, myColors.white, 20, null, manipulator);
            this[field].content = displayText.content;
            this[field].border = displayText.border;
            this[field].border.mark(field);
            var y = -fieldTitle.boundingRect().height / 4;
            this[field].content.position(drawing.width / 10, 0);
            this[field].border.position(drawing.width / 10, y);
            var alreadyExist = this.tabForm.find(formElement => formElement.field === field);
            this[field].field = field;
            alreadyExist ? this.tabForm.splice(this.tabForm.indexOf(alreadyExist), 1, this[field]) : this.tabForm.push(this[field]);
            this._setEvents(); //TODO a changer, on en a besoin car display field recrée à chaque fois le text, donc on perd les events
        }

        clickEditionField(field, manipulator) {
            return () => {
                const width = drawing.width / 6,
                    height = this.h,
                    globalPointCenter = this[field].border.globalPoint(-(width) / 2, -(height) / 2),
                    contentareaStyle = {
                        toppx: globalPointCenter.y,
                        leftpx: globalPointCenter.x,
                        height: height,
                        width: this[field].border.width
                    };
                drawing.notInTextArea = false;
                let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height)
                    .mark('connectionContentArea')
                    .message(this[field].labelSecret || this[field].label)
                    .color(null, 0, myColors.black).font("Arial", 20);
                this[field].secret && contentarea.type('password');
                manipulator.unset(1, this[field].content.text);
                drawings.component.add(contentarea);
                contentarea.focus();
                let alreadyDeleted = false,
                    onblur = () => {
                        if (!alreadyDeleted) {
                            contentarea.enter();
                            if (this[field].secret) {
                                this[field].label = '';
                                this[field].labelSecret = contentarea.messageText;
                                if (contentarea.messageText) {
                                    for (let i = 0; i < contentarea.messageText.length; i++) {
                                        this[field].label += '●';
                                    }
                                }
                            } else {
                                this[field].label = contentarea.messageText;
                            }
                            contentarea.messageText && this.displayField(field, manipulator);
                            manipulator.unset(3);
                            drawing.notInTextArea = true;
                            alreadyDeleted || drawings.component.remove(contentarea);
                            alreadyDeleted = true;
                        }
                    };
                svg.addEvent(contentarea, "blur", onblur);
                this.focusedField = this[field];
            };
        }

        connexionButtonHandler() {
            let emptyAreas = this.tabForm.filter(field => field.label === '');
            emptyAreas.forEach(emptyArea => {
                emptyArea.border.color(myColors.white, 3, myColors.red);
            });

            if (emptyAreas.length > 0) {
                let message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                svg.timeout(() => {
                    this.connexionButtonManipulator.unset(3);
                    emptyAreas.forEach(emptyArea => {
                        emptyArea.border.color(myColors.white, 1, myColors.black);
                    });
                }, 5000);
            } else {
                Server.connect(this.mailAddressField.label, this.passwordField.labelSecret).then(data => {
                    data = data && JSON.parse(data);
                    if (data.ack === 'OK') {
                        drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                        data.user.admin ? globalVariables.GUI.AdminGUI() : globalVariables.GUI.LearningGUI();
                        Server.getAllFormations().then(data => {
                            let myFormations = JSON.parse(data).myCollection;
                            globalVariables.formationsManager = new FormationsManager(myFormations);
                            globalVariables.formationsManager.display();
                        });
                    } else {
                        let message = autoAdjustText('Adresse et/ou mot de passe invalide(s)', drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                        message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                        svg.timeout(() => {
                            this.connexionButtonManipulator.unset(3);
                        }, 5000);
                    }
                });
            }
        }
    }

    class FormationVue extends Vue {
        constructor(options) {
            super(options);
            this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
            this.graphManipulator = new Manipulator(this);
            this.messageDragDropManipulator = new Manipulator(this).addOrdonator(2);
            this.arrowsManipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this);
            this.graphManipulator.add(this.miniaturesManipulator);
            this.graphManipulator.add(this.arrowsManipulator);
            this.clippingManipulator = new Manipulator(this);
            this.saveFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.publicationFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.deactivateFormationButtonManipulator = new Manipulator(this).addOrdonator(2);

            this.returnButtonManipulator = new Manipulator(this);//.addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour aux formations");
            this.labelDefault = "Entrer le nom de la formation";
            // WIDTH
            this.libraryWidthRatio = 0.15;
            this.graphWidthRatio = 1 - this.libraryWidthRatio;
            // HEIGHT
            this.graphCreaHeightRatio = 0.85;
            this.x = MARGIN;

            this.saveButtonHeightRatio = 0.07;
            this.publicationButtonHeightRatio = 0.07;
            this.marginRatio = 0.03;

            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.levelHeight = 150;
            this.graphElementSize = this.levelHeight * 0.65;
            this.miniature = new MiniatureFormation(this);
            this.changeableDimensions();
            this.manipulator.add(this.saveFormationButtonManipulator);
            this.manipulator.add(this.publicationFormationButtonManipulator);
            this.manipulator.add(this.deactivateFormationButtonManipulator);
        }
    }

    /**
     * Réponse à un quiz. Cette réponse peut être correcte ou non. Une explication peut etre associée, avec une image ou une vidéo.
     * @class
     */
    class Answer {
        /**
         * Crée une réponse à un QCM
         * @constructs
         * @param {Object} answerParameters - permet d'affecter des valeurs par défaut
         * @param {string} answerParameters.label - label de la réponse
         * @param {string} answerParameters.imageSrc - source de l'image
         * @param {Boolean} answerParameters.correct - la réponse est elle correcte
         * @param {Object} parent - parent de la réponse (i.e Question)
         */
        constructor(answerParameters, parent) {
            this.parentQuestion = parent;
            let answer = {
                label: '',
                imageSrc: null,
                correct: false
            };
            answerParameters && (answer = answerParameters);
            this.label = answer.label;
            this.imageSrc = answer.imageSrc;
            this.video = answer.video;
            this.correct = answer.correct;
            this.selected = false;
            this.invalidLabelInput = answer.invalidLabelInput !== undefined ? answer.invalidLabelInput : false;
            this.fontSize = answer.fontSize ? answer.fontSize : 20;
            this.explanation = answer.explanation;
            answer.explanation && (this.filled = true);
            answer.font && (this.font = answer.font);

            this.imageLoaded = false;

            if (answer.imageSrc) {
                let self = this;
                this.image = imageController.getImage(this.imageSrc, function () {
                    self.imageLoaded = true;
                    self.dimImage = {width: this.width, height: this.height};
                });
                this.imageLoaded = false;
            } else {
                this.imageLoaded = true;
            }
            this.colorBordure = answer.colorBordure ? answer.colorBordure : myColors.black;
            this.bgColor = answer.bgColor ? answer.bgColor : myColors.white;
        }

        /**
         * supprime la réponse
         * @returns {boolean}
         */
        remove() {
            let index = this.parentQuestion.tabAnswer.indexOf(this);
            if (index !== -1) {
                this.parentQuestion.tabAnswer.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }

        /**
         * indique si la question est modifiable
         * @param {Object} editor - instance de QuestionCreator correspondant à la réponse
         * @param {Boolean} editable - la réponse est elle editable
         */
        isEditable(editor, editable) {
            this.editable = editable;
            this.labelDefault = "Double cliquer pour modifier et cocher si bonne réponse.";
            this._acceptDrop = editable;
            this.editor = editor;
            this.checkInputContentArea = editable ? ((objCont) => {
                    if (typeof objCont.contentarea.messageText !== "undefined") {
                        if (objCont.contentarea.messageText.match(REGEX)) {
                            this.invalidLabelInput = false;
                            this.label = objCont.contentarea.messageText;
                            objCont.remove();
                        } else {
                            this.invalidLabelInput = objCont.contentarea.messageText.match(REGEX_NO_CHARACTER_LIMIT)
                                ? REGEX_ERROR_NUMBER_CHARACTER
                                : REGEX_ERROR;
                            this.label = objCont.contentarea.messageText;
                            objCont.display(this.invalidLabelInput);
                        }
                    } else {
                        this.label = "";
                    }
                }) : null;
        }

        /**
         * fonction appelée lorsque l'utilisateur sélectioonne la réponse.
         * Affiche le message lui indiquant si la réponse est bonne ou pas
         */
        select() {
            let question = this.parentQuestion,
                quiz = question.parentQuiz;
            if (!question.multipleChoice) {
                if (this.correct) {
                    quiz.score++;
                    console.log("Bonne réponse!\n");
                } else {
                    let reponseD = "";
                    question.rightAnswers.forEach(function (e) {
                        if (e.label) {
                            reponseD += e.label + "\n";
                        } else if (e.imageSrc) {
                            let tab = e.imageSrc.split('/');
                            reponseD += tab[(tab.length - 1)] + "\n";
                        }
                    });
                    console.log("Mauvaise réponse!\n  Bonnes réponses: \n" + reponseD);
                }
                let selectedAnswer = [quiz.tabQuestions[quiz.currentQuestionIndex].tabAnswer.indexOf(this)];
                quiz.questionsAnswered[quiz.currentQuestionIndex] = {
                    index: quiz.questionsAnswered.length,
                    question: quiz.tabQuestions[quiz.currentQuestionIndex],
                    validatedAnswers: selectedAnswer
                };
                quiz.nextQuestion();
            } else {// question à choix multiples
                this.selected = !this.selected;
                if (this.selected) {
                    // on sélectionne une réponse
                    question.selectedAnswers.push(this);
                } else {
                    question.selectedAnswers.splice(question.selectedAnswers.indexOf(this), 1);
                }
            }
        }

    }

    /**
     * Question d'un quiz
     * @class Question
     */
    class Question {
        /**
         * construit une question pour un quizz
         * @constructs
         * @param question - paramètres par defaut pour la question
         * @param quiz - quiz contenant la question
         */
        constructor(question, quiz) {
            this.manipulator = new Manipulator(this).addOrdonator(7);
            this.answersManipulator = new Manipulator(this);
            this.manipulator.add(this.answersManipulator);
            this.resetManipulator = new Manipulator(this).addOrdonator(2);
            this.answersManipulator.add(this.resetManipulator);
            this.validateManipulator = new Manipulator(this).addOrdonator(2);
            this.answersManipulator.add(this.validateManipulator);
            this.simpleChoiceMessageManipulator = new Manipulator(this).addOrdonator(2);
            this.answersManipulator.add(this.simpleChoiceMessageManipulator);
            this.invalidQuestionPictogramManipulator = new Manipulator(this).addOrdonator(5);
            this.manipulator.add(this.invalidQuestionPictogramManipulator);

            this.invalidLabelInput = (question && question.invalidLabelInput !== undefined) ? question.invalidLabelInput : false;
            this.selected = false;
            this.parentQuiz = quiz;
            this.tabAnswer = [];
            this.fontSize = 20;
            this.questionNum = question && question.questionNum || this.parentQuiz.tabQuestions.length + 1;

            if (!question) {
                this.label = "";
                this.imageSrc = "";
                this.columns = 4;
                this.rightAnswers = [];
                this.tabAnswer = [new AnswerVue({model: new Answer(null, this)}), new AnswerVue({model: new Answer(null, this)})];
                this.multipleChoice = false;
                this.font = "Arial";
                this.bgColor = myColors.white;
                this.colorBordure = myColors.black;
                this.selectedAnswers = [];
                this.validatedAnswers = [];
            } else {
                this.label = question.label;
                this.imageSrc = question.imageSrc;
                this.video = question.video;
                this.columns = question.columns ? question.columns : 4;
                this.rightAnswers = [];
                this.multipleChoice = question.multipleChoice;
                this.selectedAnswers = question.selectedAnswers || [];
                this.validatedAnswers = question.validatedAnswers || [];

                question.colorBordure && (this.colorBordure = question.colorBordure);
                question.bgColor && (this.bgColor = question.bgColor);
                question.font && (this.font = question.font);
                question.fontSize && (this.fontSize = question.fontSize);

                if (question.imageSrc) {
                    this.image = imageController.getImage(this.imageSrc, () => {
                        this.imageLoaded = true;
                        this.dimImage = {width: this.image.width, height: this.image.height};
                    });
                    this.imageLoaded = false;
                } else {
                    this.imageLoaded = true;
                }
            }
            this.questionType = (this.multipleChoice) ? myQuestionType.tab[1] : myQuestionType.tab[0];
            if (question !== null && question.tabAnswer !== null) {
                question.tabAnswer.forEach(it => {
                    var tmp = new AnswerVue({model: new Answer(it, this)});
                    this.tabAnswer.push(tmp);
                    if (tmp.correct) {
                        this.rightAnswers.push(tmp);
                    }
                });
            }

            this.lines = Math.floor(this.tabAnswer.length / this.columns); //+ 1;
            if (this.tabAnswer.length % this.columns !== 0) {
                this.lines += 1;
            }
            this.border = null;
            this.content = null;
        }

        /**
         * suppression de la question
         * @returns {boolean}
         */
        remove() {
            let index = this.parentQuiz.tabQuestions.indexOf(this);
            if (index !== -1) {
                this.parentQuiz.tabQuestions.splice(index, 1);
                return true;
            }
            else {
                return false;
            }
        }

        /**
         * Verifie que la question est correctement formatée
         */
        checkValidity() {
            var validation = true;
            this.questionType.validationTab.forEach((funcEl) => {
                var result = funcEl(this);
                validation = validation && result.isValid;
            });
            validation ? this.toggleInvalidQuestionPictogram(false) : this.toggleInvalidQuestionPictogram(true);
        }

        /**
         * vérifie si les réponses de l'utilisateur sont correctes
         */
        validateAnswers() {
            // test des valeurs, en gros si selectedAnswers === rigthAnswers
            var allRight = false;
            this.validatedAnswers = this.selectedAnswers;
            this.selectedAnswers = [];
            if (this.rightAnswers.length !== this.validatedAnswers.length) {
                allRight = false;
            } else {
                var subTotal = 0;
                this.validatedAnswers.forEach((e) => {
                    if (e.correct) {
                        subTotal++;
                    }
                });
                allRight = (subTotal === this.rightAnswers.length);
            }
            if (allRight) {
                this.parentQuiz.score++;
                console.log("Bonne réponse!\n");
            } else {
                var reponseD = "";
                this.rightAnswers.forEach((e) => {
                    if (e.label) {
                        reponseD += e.label + "\n";
                    }
                    else if (e.imageSrc) {
                        var tab = e.imageSrc.split('/');
                        reponseD += tab[(tab.length - 1)] + "\n";
                    }
                });
                console.log("Mauvaise réponse!\n  Bonnes réponses: " + reponseD);
            }
            let indexOfValidatedAnswers = [];
            this.validatedAnswers.forEach(aSelectedAnswer => {
                aSelectedAnswer.selected = false;
                indexOfValidatedAnswers.push(this.parentQuiz.tabQuestions[this.parentQuiz.currentQuestionIndex].tabAnswer.indexOf(aSelectedAnswer));
            });
            this.parentQuiz.questionsAnswered[this.parentQuiz.currentQuestionIndex] = {
                question: this.parentQuiz.tabQuestions[this.parentQuiz.currentQuestionIndex],
                validatedAnswers: indexOfValidatedAnswers
            };
            this.parentQuiz.nextQuestion();
        }

        /**
         * affiche ou cache le pictogramme indiquant que la question est mal formatée
         * @param {Boolean} active - la question est elle mal formatée
         */
        toggleInvalidQuestionPictogram(active) {
            let pictoSize = 20;
            if (active) {
                this.invalidQuestionPictogram = statusEnum.Edited.icon(pictoSize);
                this.invalidQuestionPictogramManipulator.set(0, this.invalidQuestionPictogram.circle);
                this.invalidQuestionPictogramManipulator.set(2, this.invalidQuestionPictogram.dot);
                this.invalidQuestionPictogramManipulator.set(3, this.invalidQuestionPictogram.exclamation);
                this.invalidQuestionPictogramManipulator.move(this.border.width / 2 - pictoSize, this.border.height / 2 - pictoSize);
            } else {
                this.invalidQuestionPictogramManipulator.unset(0);
                this.invalidQuestionPictogramManipulator.unset(2);
                this.invalidQuestionPictogramManipulator.unset(3);
            }
        }
    }

    /**
     * Créateur de questions pour le quiz
     * @class
     */
    class QuestionCreator {
        /**
         * Crée une nouvelle question dans un quiz
         * @constructs
         * @param {Object} parent - parent du créateur
         * @param {Object} question - question associée
         */
        constructor(parent, question) {
            this.MAX_ANSWERS = 8;
            this.parent = parent;
            this.manipulator = new Manipulator(this).addOrdonator(2);
            this.manipulatorQuizInfo = new Manipulator(this);
            this.questionManipulator = new Manipulator(this).addOrdonator(7);
            this.toggleButtonManipulator = new Manipulator(this);
            this.previewButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.add(this.previewButtonManipulator);
            this.saveQuizButtonManipulator = new Manipulator(this);
            this.manipulator.add(this.saveQuizButtonManipulator);
            this.labelDefault = "Cliquer deux fois pour ajouter la question";
            this.questionType = myQuestionType.tab;
            this.toggleButtonHeight = 40;
            this.loadQuestion(question);
            this.puzzle = new Puzzle(2, 4, this.linkedQuestion.tabAnswer, "leftToRight", this);
            this.manipulator.add(this.puzzle.manipulator);
            this.coordinatesAnswers = {x: 0, y: 0, w: 0, h: 0};
        }

        /**
         * vérifie que le texte entré dans la question est correct
         * @param myObj - input à tester
         */
        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(REGEX)) || myObj.textarea.messageText === "") {
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.textarea.messageText.match(REGEX_NO_CHARACTER_LIMIT) ?
                    myObj.display(REGEX_ERROR_NUMBER_CHARACTER) :
                    myObj.display(REGEX_ERROR);
            }
        }

        /**
         * associe la question au créateur de question. i.e remplis les champs avec les infos de la question
         * @param {Object} quest - question
         */
        loadQuestion(quest) {
            this.linkedQuestion = quest;
            quest.label && (this.label = quest.label);
            this.multipleChoice = quest.multipleChoice;
            quest.tabAnswer.forEach(answer => {
                if (answer instanceof Answer) {
                    answer.isEditable(this, true);
                }
                answer.popIn = new PopIn(answer, true);
            });
            quest.tabAnswer.forEach(el => {
                if (el.correct) {
                    quest.rightAnswers.push(el);
                }
            });
        }
    }

    /**
     * explications d'une réponse à une question
     * @class PopIn
     */
    class PopIn {
        /**
         * construit un PopIn avec du texte d'explication, une image, une video
         * @constructs
         * @param {Object} answer - réponse
         * @param {Object} answer.explanation - détails de l'explication (texte, image, video)
         * @param {Boolean} editable - la réponse est elle modifiable
         */
        constructor(answer, editable) {
            this.answer = answer;
            this.manipulator = new Manipulator(this).addOrdonator(7);
            this.closeButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.set(2, this.closeButtonManipulator);
            this.panelManipulator = new Manipulator(this).addOrdonator(2);
            this.manipulator.add(this.panelManipulator);
            this.textManipulator = new Manipulator(this).addOrdonator(1);
            this.editable = editable;
            if (this.editable) {
                this.draganddropText = "Glisser-déposer une image ou une vidéo de la bibliothèque ici";
                this.defaultLabel = "Cliquer ici pour ajouter du texte";
            }
            if (answer.explanation && answer.explanation.label) {
                this.label = answer.explanation.label;
            }
            if (answer.explanation && answer.explanation.image) {
                this.image = answer.explanation.image;
            }
            if (answer.explanation && answer.explanation.video) {
                this.video = answer.explanation.video;
            }
            answer.filled = this.image || this.video || this.label;
        }
    }

    /**
     * Element pour ajouter une question vide ou une réponse vide
     * @class
     */
    class AddEmptyElement {
        /**
         * Ajoute un bouton pour ajouter une question vide ou une réponse vide
         * @constructs
         * @param {Object} parent - parent du bouton
         * @param {string} type - type d'élément (question ou réponse)
         */
        constructor(parent, type) {
            this.manipulator = new Manipulator(this).addOrdonator(3);
            type && (this.type = type);
            this.invalidLabelInput = false;
            switch (type) {
                case 'question':
                    this.label = "Double cliquer pour ajouter une question";
                    break;
                case 'answer':
                    this.label = "Nouvelle réponse";
                    break;
            }
            this.fontSize = 20;
            this.parent = parent;
        }

        /**
         * supprime le bouton
         */
        remove() {
            console.log("Tentative de suppression d'AddEmptyElement");
        }
    }

    /**
     * Niveau d'une formation. Il peut contenir un ou plusieurs quiz. Une formation peut avoir un ou plusieurs niveaux
     * @class
     */
    class Level {
        /**
         * ajoute un niveau à une formation
         * @constructs
         * @param formation - formation qui va contenir le nouveau niveau
         * @param gamesTab - quizs associés à ce niveau
         */
        constructor(formation, gamesTab) {
            this.parentFormation = formation;
            this.manipulator = new Manipulator(this).addOrdonator(3);
            this.redCrossManipulator = new Manipulator(this).addOrdonator(2);
            this.index = (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1]) ? (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1].index + 1) : 1;
            this.gamesTab = gamesTab ? gamesTab : [];
            this.x = this.parentFormation.libraryWidth ? this.parentFormation.libraryWidth : null; // Juste pour être sûr
            this.y = (this.index - 1) * this.parentFormation.levelHeight;
        }

        /**
         * supprime le niveau de la formation parent
         * @param index
         */
        removeGame(index) {
            this.gamesTab.splice(index, 1);
        }

    }

    /**
     * Crée un formation manager
     * @class
     */
    class FormationsManager {
        /**
         * construit un formation manager
         * @constructs
         * @param [Array] formations - formations à ajouter au manager
         */
        constructor(formations) {
            this.x = MARGIN;
            this.tileHeight = 180;
            this.tileWidth = this.tileHeight * (14 / 9);
            this.addButtonWidth = 330;
            this.addButtonHeight = 40;
            this.addButtonSmall = 30;
            this.fontSize = 20;
            this.plusDim = this.fontSize * 2;
            this.iconeSize = this.plusDim / 1.5;
            this.puzzleRows = 6;
            this.initialFormationsPosX = MARGIN;
            this.rows = 6;
            this.lines = 4;
            this.formations = [];
            this.count = 0;
            this.label = this.label ? this.label : "";
            this.labelDefault = "Ajouter une formation";
            this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
            for (let formation of formations) {
                this.formations.push(new Formation(formation, this));
            }
            this.manipulator = new Manipulator();
            this.headerManipulator = new Manipulator().addOrdonator(1);
            this.addButtonManipulator = new Manipulator().addOrdonator(4);
            this.checkManipulator = new Manipulator().addOrdonator(4);
            this.exclamationManipulator = new Manipulator().addOrdonator(4);
            this.formationsManipulator = new Manipulator();
            this.clippingManipulator = new Manipulator(this);
            this.errorMessage = new Manipulator(this).addOrdonator(3);
            this.message = new Manipulator(this).addOrdonator(3);
            this.messageManipulator = new Manipulator().addOrdonator(4);
            this.regex = TITLE_FORMATION_REGEX;
            /* for Player */
            this.toggleFormationsManipulator = new Manipulator(this).addOrdonator(3);
        }

        /**
         * verifie la validité du texte dans l'input
         * @param {Object} myObj - input à vérifier
         */
        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(this.regex)) || myObj.textarea.messageText === "") {
                this.invalidLabelInput = false;
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.display();
                this.invalidLabelInput = myObj.textarea.messageText.match(REGEX_NO_CHARACTER_LIMIT)
                    ? REGEX_ERROR_NUMBER_CHARACTER
                    : REGEX_ERROR;
            }
        }
    }

    /**
     * Formation qui peut contenir différents jeux répartis sur différents niveaux
     * @class
     */
    class Formation {
        /**
         * construit une formation
         * @constructs
         * @param {Object} formation - valeurs par défaut pour la formaiton
         * @param {Object} formationsManager - manager qui va contenir la formation
         */
        constructor(formation, formationsManager) {
            this.gamesCounter = {
                quizz: 0,
                bd: 0
            };
            this.links = [];
            this._id = (formation._id || null);
            this.formationId = (formation.formationId || null);
            this.progress = formation.progress;
            this.formationsManager = formationsManager;
            this.manipulator = new Manipulator(this).addOrdonator(6);
            this.formationInfoManipulator = new Manipulator(this).addOrdonator(3);
            this.graphManipulator = new Manipulator(this);
            this.messageDragDropManipulator = new Manipulator(this).addOrdonator(2);
            this.arrowsManipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this);
            this.graphManipulator.add(this.miniaturesManipulator);
            this.graphManipulator.add(this.arrowsManipulator);
            this.clippingManipulator = new Manipulator(this);
            this.saveFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.publicationFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.deactivateFormationButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.library = new GamesLibrary(myLibraryGames);
            this.library.formation = this;
            this.quizManager = new QuizManager(null, this);
            this.returnButtonManipulator = new Manipulator(this);//.addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour aux formations");
            this.labelDefault = "Entrer le nom de la formation";
            // WIDTH
            this.libraryWidthRatio = 0.15;
            this.graphWidthRatio = 1 - this.libraryWidthRatio;
            // HEIGHT
            this.graphCreaHeightRatio = 0.85;
            this.x = MARGIN;
            this.regex = TITLE_FORMATION_REGEX;
            this.levelsTab = [];
            this.saveButtonHeightRatio = 0.07;
            this.publicationButtonHeightRatio = 0.07;
            this.marginRatio = 0.03;
            this.label = formation.label ? formation.label : "";
            this.status = formation.status ? formation.status : "NotPublished";
            this.invalidLabelInput = false;
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.levelHeight = 150;
            this.graphElementSize = this.levelHeight * 0.65;
            this.miniature = new MiniatureFormation(this);
            this.changeableDimensions();
            this.manipulator.add(this.saveFormationButtonManipulator);
            this.manipulator.add(this.publicationFormationButtonManipulator);
            this.manipulator.add(this.deactivateFormationButtonManipulator);
        }

        /**
         * fonction appelée lorsqu'une bulle est lachée sur le graphe de formation (ajout ou déplacement d'un quiz)
         * @param event - evenement js
         * @param game - quiz associé au drop
         */
        dropAction(event, game) {
            drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
            let getDropLocation = event => {
                let dropLocation = this.panel.back.localPoint(event.pageX, event.pageY);
                dropLocation.y -= this.panel.content.y;
                dropLocation.x -= this.panel.content.x;
                return dropLocation;
            };
            let getLevel = (dropLocation) => {
                let level = -1;
                while (dropLocation.y > -this.panel.content.height / 2) {
                    dropLocation.y -= this.levelHeight;
                    level++;
                }
                if (level >= this.levelsTab.length) {
                    level = this.levelsTab.length;
                    this.addNewLevel(level);
                }
                return level;
            };
            let getColumn = (dropLocation, level) => {
                let column = this.levelsTab[level].gamesTab.length;
                for (let i = 0; i < this.levelsTab[level].gamesTab.length; i++) {
                    if (dropLocation.x < this.levelsTab[level].gamesTab[i].miniaturePosition.x) {
                        column = i;
                        break;
                    }
                }
                return column;
            };

            let dropLocation = getDropLocation(event);
            let level = getLevel(dropLocation);
            let column = getColumn(dropLocation, level);
            if (game) {
                this.moveGame(game, level, column);
                game.levelIndex === level || game.miniature.removeAllLinks();
            } else {
                this.addNewGame(level, column)
            }
            this.library.gameSelected && this.library.gameSelected.miniature.border.color(myColors.white, 1, myColors.black);
            this.displayGraph();
        }

        /**
         * ajout d'un nouveau jeu à une formation
         * @param level - niveau du jeu
         * @param column - position du jeu sur le niveau
         */
        addNewGame(level, column) {
            let gameBuilder = this.library.draggedObject || this.library.gameSelected;
            gameBuilder.create(this, level, column);
        }

        /**
         * change le niveau d'un jeu et/ou sa position sur le niveau
         * @param game - jeu a modifier
         * @param level - nouveau niveau
         * @param column - nouvelle position
         */
        moveGame(game, level, column) {
            this.levelsTab[game.levelIndex].gamesTab.splice(game.gameIndex, 1);
            this.levelsTab[level].gamesTab.splice(column, 0, game);
            if (this.levelsTab[game.levelIndex].gamesTab.length === 0 && game.levelIndex == this.levelsTab.length - 1)
                this.levelsTab.splice(game.levelIndex, 1);
        }

        /**
         * crée un lien entre 2 jeux
         * @param parentGame - jeux dont part le lien
         * @param childGame - jeux pointé par le lien
         * @param arrow - instance de la flèche qui représente le lien
         */
        createLink(parentGame, childGame, arrow) {
            this.links.push({parentGame: parentGame.id, childGame: childGame.id, arrow: arrow});
        };

        /**
         * supprime le lient entre 2 jeux
         * @param parentGame - jeu parent
         * @param childGame - jeu fils
         */
        removeLink(parentGame, childGame) {
            for (let i = this.links.length - 1; i >= 0; i--) {
                if (this.links[i].childGame === childGame.id && this.links[i].parentGame === parentGame.id)
                    this.links.splice(i, 1);
            }
        };

        /**
         * Désactive la formation. Elle n'est plus visible par les joueurs (seulement l'admin)
         */
        deactivateFormation() {
            this.status = "NotPublished";
            Server.deactivateFormation(this.formationId, ignoredData)
                .then(() => {
                    this.manipulator.flush();
                    Server.getAllFormations().then(data => {
                        let myFormations = JSON.parse(data).myCollection;
                        globalVariables.formationsManager = new FormationsManager(myFormations);
                        globalVariables.formationsManager.display();
                    });
                })
        }

        /**
         * crée et sauvegarde en bdd la nouvelle formation
         * @param callback - fonction appelée lorsque la création a reussi ou raté
         */
        saveNewFormation(callback) {
            const
                messageError = "Veuillez rentrer un nom de formation valide",
                messageUsedName = "Cette formation existe déjà"

            const returnToFormationList = () => {
                this.manipulator.flush();
                Server.getAllFormations().then(data => {
                    myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new FormationsManager(myFormations);
                    globalVariables.formationsManager.display();
                });
            };

            if (this.label && this.label !== this.labelDefault && this.label.match(this.regex)) {
                const getObjectToSave = () => {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab
                    };
                };

                let addNewFormation = () => {
                    Server.insertFormation(getObjectToSave(), ignoredData)
                        .then(data => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                this._id = answer.idVersion;
                                this.formationId = answer.id;
                                returnToFormationList();
                            } else {
                                if (answer.reason === "NameAlreadyUsed") {
                                    callback(messageUsedName, true);
                                }
                            }
                        })
                };
                addNewFormation()
            } else if (this.label == "" || this.label == null) {
                callback(messageError, true);
            }
        }

        /**
         * crée ou sauvegarde une formation
         * TODO rassembler avec saveNewFormation
         * @param displayQuizManager
         * @param status - status de la formation (not Published, Edited, Published)
         * @param onlyName - booleen pour indiquer si on veut ne sauvegarder que le nom
         */
        saveFormation(displayQuizManager, status = "Edited", onlyName = false) {
            const
                messageSave = "Votre travail a bien été enregistré.",
                messageError = "Vous devez remplir correctement le nom de la formation.",
                messageReplace = "Les modifications ont bien été enregistrées.",
                messageUsedName = "Le nom de cette formation est déjà utilisé !",
                messageNoModification = "Les modifications ont déjà été enregistrées.";

            const displayMessage = (message, displayQuizManager, error = false) => {
                switch (message) {
                    case messageError:
                    case messageUsedName:
                        error = true;
                        break;
                    default:
                        error = false;
                }
                this.publicationFormationButtonManipulator.remove(this.errorMessagePublication);
                if (displayQuizManager && !error) {
                    displayQuizManager();
                } else {
                    let saveFormationButtonCadre = this.saveFormationButtonManipulator.ordonator.children[0];
                    const messageY = saveFormationButtonCadre.globalPoint(0, 0).y;
                    this.message = new svg.Text(message)
                        .position(drawing.width / 2, messageY - saveFormationButtonCadre.height * 1.5 - MARGIN)
                        .font("Arial", 20)
                        .mark("formationErrorMessage")
                        .anchor('middle').color(error ? myColors.red : myColors.green);
                    this.manipulator.set(5, this.message);
                    svg.timeout(() => {
                        this.manipulator.unset(5);
                    }, 5000);
                }
            };


            const returnToFormationList = () => {
                this.manipulator.flush();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new FormationsManager(myFormations);
                    globalVariables.formationsManager.display();
                });
            };

            if (this.label && this.label !== this.labelDefault && this.label.match(this.regex)) {
                const getObjectToSave = () => {
                    if (onlyName && this._id) {
                        return {label: this.label};
                    } else {
                        return {
                            label: this.label,
                            gamesCounter: this.gamesCounter,
                            links: this.links,
                            levelsTab: this.levelsTab
                        };
                    }
                };

                let addNewFormation = () => {
                    Server.insertFormation(getObjectToSave(), status, ignoredData)
                        .then(data => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                this._id = answer.idVersion;
                                this.formationId = answer.id;
                                status === "Edited" ? displayMessage(messageSave, displayQuizManager) : returnToFormationList();
                            } else {
                                if (answer.reason === "NameAlreadyUsed") {
                                    displayMessage(messageUsedName, displayQuizManager);
                                }
                            }
                        })
                };

                let replaceFormation = () => {
                    Server.replaceFormation(this._id, getObjectToSave(), status, ignoredData)
                        .then((data) => {
                            let answer = JSON.parse(data);
                            if (answer.saved) {
                                status === "Edited" ? displayMessage(messageReplace, displayQuizManager) : returnToFormationList();
                            } else {
                                switch (answer.reason) {
                                    case "NoModif" :
                                        displayMessage(messageNoModification, displayQuizManager);
                                        break;
                                    case "NameAlreadyUsed" :
                                        displayMessage(messageUsedName, displayQuizManager);
                                        break;
                                }
                            }
                        })
                };

                this._id ? replaceFormation() : addNewFormation();
            } else {
                displayMessage(messageError, displayQuizManager);
            }
        }

        /**
         * publie une formation. Cela la rend visible aux utilisateurs du site
         */
        publicationFormation() {
            this.publishedButtonActivated = true;

            [].concat(...this.levelsTab.map(level => level.gamesTab))
                .filter(elem => elem.miniature.selected === true)
                .forEach(game => {
                    game.miniature.selected = false;
                    game.miniature.updateSelectionDesign();
                });

            const messageErrorNoNameFormation = "Vous devez remplir le nom de la formation.",
                messageErrorNoGame = "Veuillez ajouter au moins un jeu à votre formation.";

            this.displayPublicationMessage = (messagePublication) => {
                this.formationInfoManipulator.unset(2);
                this.errorMessagePublication = new svg.Text(messagePublication);
                this.manipulator.set(5, this.errorMessagePublication);
                const messageY = this.publicationFormationButtonManipulator.first.globalPoint(0, 0).y;
                this.errorMessagePublication.position(drawing.width / 2, messageY - this.publicationButtonHeight * 1.5 - MARGIN)
                    .font("Arial", 20)
                    .anchor('middle').color(myColors.red)
                    .mark("errorMessagePublication");
                svg.timeout(() => {
                    this.manipulator.unset(5, this.errorMessagePublication);
                }, 5000);
            };

            this.publicationFormationQuizManager();
            if (this.levelsTab.length === 0) {
                this.displayPublicationMessage(messageErrorNoGame);
            }
            if (!this.label || this.label === this.labelDefault || !this.label.match(this.regex)) {
                this.displayPublicationMessage(messageErrorNoNameFormation);
            }
        };

        /**
         * charge la formation
         * @param formation - infos à charger dans la formation
         */
        loadFormation(formation) {
            this.levelsTab = [];
            this.gamesCounter = formation.gamesCounter;
            this.links = formation.links || formation.link;
            formation.levelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    game.tabQuestions && gamesTab.push(new Quiz(game, false, this));
                    game.tabQuestions || gamesTab.push(new Bd(game, this));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                this.levelsTab.push(new Level(this, gamesTab));
            });
        }

        /**
         * retourne la niveau possédant le plus de jeux
         * @returns {Array} - tableau de jeux
         */
        findLongestLevel() {
            var longestLevelCandidates = [];
            longestLevelCandidates.index = 0;
            this.levelsTab.forEach(level => {
                if (level.gamesTab.length >= this.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                    if (level.gamesTab.length === this.levelsTab[longestLevelCandidates.index].gamesTab.length) {
                        longestLevelCandidates.push(level);
                    } else {
                        longestLevelCandidates = [];
                        longestLevelCandidates.push(level);
                    }
                    longestLevelCandidates.index = level.index - 1;
                }
            });
            return longestLevelCandidates;
        }

        /**
         * trouve la formation à l'aide de son id
         * @param id - id de la formation
         * @returns {*}
         */
        findGameById(id) {
            return [].concat(...this.levelsTab.map(x => x.gamesTab)).find(game => game.id === id);
        }

        /**
         * indique si le jeu est disponible (pas joué)
         * @param game
         * @returns {boolean}
         */
        isGameAvailable(game) {
            let available = true;
            this.links.forEach(link => {
                if (link.childGame === game.id) {
                    const parentGame = this.findGameById(link.parentGame);
                    if (parentGame && (parentGame.status === undefined || (parentGame.status && parentGame.status !== "done"))) {
                        available = false;
                        return available;
                    }
                }
            });
            return available;
        }

        /**
         * recalcule les différentes tailles des éléments en fonction de la taille d'écran
         */
        changeableDimensions() {
            this.gamesLibraryManipulator = this.library.libraryManipulator;
            this.libraryWidth = drawing.width * this.libraryWidthRatio;
            this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
            this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio + MARGIN;
            this.levelWidth = drawing.width - this.libraryWidth - MARGIN;
            this.minimalMarginBetweenGraphElements = this.graphElementSize / 2;
            this.y = drawing.height * HEADER_SIZE + 3 * MARGIN;
            this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
            this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
            this.buttonWidth = 150;
            this.globalMargin = {
                height: this.marginRatio * drawing.height,
                width: this.marginRatio * drawing.width
            };
            this.clippingManipulator.flush();
        }

        /**
         * vérifie le texte entré dans un input
         * @param myObj - input à tester
         */
        checkInputTextArea(myObj) {
            if ((myObj.textarea.messageText && myObj.textarea.messageText.match(this.regex)) || myObj.textarea.messageText === "") {
                this.invalidLabelInput = false;
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
            } else {
                myObj.display();
                this.invalidLabelInput = myObj.textarea.messageText.match(REGEX_NO_CHARACTER_LIMIT)
                    ? REGEX_ERROR_NUMBER_CHARACTER
                    : REGEX_ERROR;
            }
        }

        /**
         * ajoute un niveau à la formation
         * @param index - indice du niveau
         */
        addNewLevel(index) {
            var level = new Level(this);
            if (!index) {
                this.levelsTab.push(level);
            } else {
                this.levelsTab.splice(index, 0, level);
            }
        }

        /**
         * évènement pour ajouter un jeu à un niveau au clic de la souris.
         */
        clickToAdd() {
            this.mouseUpGraphBlock = event => {
                this.library.gameSelected && this.dropAction(event);
                this.library.gameSelected && this.library.gameSelected.miniature.border.color(myColors.white, 1, myColors.black);
                this.library.gameSelected = null;
                svg.removeEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            };
            svg.addEvent(this.panel.back, "mouseup", this.mouseUpGraphBlock);
            svg.addEvent(this.messageDragDropManipulator.ordonator.children[1], "mouseup", this.mouseUpGraphBlock);
        }

        /**
         * mets à jour l'index des jeux dans les différents niveaux
         * @param level - niveau à réafficher
         */
        adjustGamesPositions(level) {
            let computeIndexes = () => {
                this.levelsTab.forEach((level, lIndex) => {
                    level.gamesTab.forEach((game, gIndex) => {
                        game.levelIndex = lIndex;
                        game.gameIndex = gIndex;
                    })
                });
            };

            computeIndexes();
            var nbOfGames = level.gamesTab.length;
            var spaceOccupied = nbOfGames * this.minimalMarginBetweenGraphElements + this.graphElementSize * nbOfGames;
            level.gamesTab.forEach(game => {
                game.miniaturePosition.x = this.minimalMarginBetweenGraphElements * (3 / 2) + (game.gameIndex - nbOfGames / 2) * spaceOccupied / nbOfGames;
                game.miniaturePosition.y = -this.panel.height / 2 + (level.index - 1 / 2) * this.levelHeight;
            });
        }

        /**
         * affiche les jetons de statut sur les différentes formations de l'utilisateur. (i.e pas commencé, en cours, finis)
         * @param displayFunction - fonction appelée lorsque trackProgress a finis
         */
        trackProgress(displayFunction) {
            this.levelsTab.forEach(level => {
                level.gamesTab.forEach(game => {
                    delete game.miniature;
                    delete game.status;
                });
            });
            this.miniaturesManipulator.flush();
            Server.getUser().then(data => {
                let user = JSON.parse(data);
                if (user.formationsTab) {
                    let formationUser = user.formationsTab.find(formation => formation.version === this._id);
                    formationUser && formationUser.gamesTab.forEach(game => {
                        let theGame = this.findGameById(game.game);
                        if (!theGame) {
                            return;
                        }
                        theGame.currentQuestionIndex = game.questionsAnswered.length;
                        theGame.questionsAnswered = [];
                        if (game.questionsAnswered) {
                            game.questionsAnswered.forEach((wrongAnswer, i) => {
                                theGame.questionsAnswered.push({
                                    question: theGame.tabQuestions[i],
                                    validatedAnswers: wrongAnswer.validatedAnswers
                                });
                            });
                            theGame.score = game.questionsAnswered.length - theGame.getQuestionsWithBadAnswers().length;
                            theGame.status = (game.questionsAnswered.length === theGame.tabQuestions.length) ? "done" : "inProgress";
                        }
                    });
                }
                this.levelsTab.forEach(level => {
                    level.gamesTab.forEach(game => {
                        if (!this.isGameAvailable(game)) {
                            game.status = "notAvailable";
                        }
                    });
                });
                displayFunction.call(this);
            });
        }
    }

    /**
     * class générique contenant un ensemble d'éléments du meme type
     * @class
     */
    class Library {
        /**
         * construit une bibliothèque
         * @constructs
         */
        constructor() {
            this.libraryManipulator = new Manipulator(this).addOrdonator(4);
            this.itemsTab = [];
            this.libraryManipulators = [];
        }
    }

    /**
     * bibliothèque de jeux
     * @class
     */
    class GamesLibrary extends Library {
        /**
         * construit une bibliothèque de jeux
         * @constructs
         * @param lib - options sur la bibliothèque
         * @param lib.title - titre de la bibliothèque
         * @param lib.font - police d'écriture
         * @param lib.fontSize - taille d'écriture
         * @param lib.tab - tableau de jeux à ajouter à la bibliothèque
         */
        constructor(lib) {
            super();
            this.title = lib.title;
            this.font = lib.font;
            this.fontSize = lib.fontSize;
            this.itemsTab = lib.tab;
            this.itemsTab.forEach((item, index) => {
                this.libraryManipulators[index] = new Manipulator(item).addOrdonator(2);
            });
            this.arrowModeManipulator = new Manipulator(this).addOrdonator(3);
        }
    }

    /**
     * bibliothèque d'images
     * @class
     */
    class ImagesLibrary extends Library {
        /**
         * construit une bibliothèque d'images (et/ou de vidéos)
         * @constructs
         */
        constructor() {
            super();
            this.imageWidth = 50;
            this.imageHeight = 50;
            this.videosManipulators = [];
            this.videosUploadManipulators = [];
            this.addButtonManipulator = new Manipulator(this).addOrdonator(3);
        }

        /**
         * ajoute une image à une question ou l'explication d'une réponse
         * @param element - image
         * @param target - object à qui l'image va être ajoutée (i.e question ou réponse)
         */
        dropImage(element, target) {
            if (target && target._acceptDrop) {
                if (target.parent.parentManip.parentObject instanceof PopIn) {
                    let popIn = target.parent.parentManip.parentObject;
                    popIn.image = element.src;
                    popIn.video = null;
                    popIn.miniature && popIn.miniature.video && popIn.miniature.video.redCrossManipulator && popIn.miniature.video.redCrossManipulator.flush();
                    let questionCreator = target.parent.parentManip.parentObject.answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                    target.parent.parentManip.parentObject.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                }
                else {
                    var oldElement = {
                        border: target.parent.parentManip.ordonator.get(0),
                        content: target.parent.parentManip.ordonator.get(1)
                    };
                    target.parent.parentManip.unset(0);
                    target.parent.parentManip.unset(1);
                    var newElement = displayImageWithTitle(oldElement.content.messageText, element.src,
                        element.srcDimension,
                        oldElement.border.width, oldElement.border.height,
                        oldElement.border.strokeColor, oldElement.border.fillColor, null, null, target.parent.parentManip
                    );
                    oldElement.border.position(newElement.border.x, newElement.border.y);
                    oldElement.content.position(newElement.content.x, newElement.content.y);
                    newElement.image._acceptDrop = true;
                    newElement.image.name = element.name;
                    switch (true) {
                        case target.parent.parentManip.parentObject instanceof QuestionCreator:
                            drawings.component.clean();
                            let questionCreator = target.parent.parentManip.parentObject;
                            questionCreator.linkedQuestion.video = null;
                            questionCreator.linkedQuestion.image = newElement.image;
                            questionCreator.linkedQuestion.imageSrc = newElement.image.src;
                            questionCreator.parent.displayQuestionsPuzzle(null, null, null, null, questionCreator.parent.questionPuzzle.startPosition);
                            questionCreator.display();
                            questionCreator.linkedQuestion.checkValidity();
                            break;
                        case target.parent.parentManip.parentObject instanceof Answer:
                            let answer = target.parent.parentManip.parentObject;
                            answer.video = null;
                            answer.obj.video && drawings.component.remove(answer.obj.video);
                            answer.image = newElement.image;
                            answer.imageSrc = newElement.image.src;
                            answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.elementsArray.forEach(element => {
                                element.obj && element.obj.video && drawings.component.remove(element.obj.video);
                            });
                            answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
                            answer.parentQuestion.checkValidity();
                            break;
                    }
                    target.parent.parentManip.set(0, oldElement.border);
                }

            }
        }

        /**
         *
         * ajoute une vidéo à une question ou l'explication d'une réponse
         * @param element - vidéo
         * @param target - object à qui l'image va être ajoutée (i.e question ou réponse)
         */
        dropVideo(element, target) {
            if (target && target._acceptDrop) {
                if (target.parent.parentManip.parentObject instanceof PopIn) {
                    let popIn = target.parent.parentManip.parentObject;
                    popIn.video = element;
                    popIn.image = null;
                    popIn.miniature && popIn.miniature.video && popIn.miniature.video.redCrossManipulator && popIn.miniature.video.redCrossManipulator.flush();
                    let questionCreator = target.parent.parentManip.parentObject.answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                    popIn.display(questionCreator, questionCreator.coordinatesAnswers.x, questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w, questionCreator.coordinatesAnswers.h);
                }
                else {
                    var oldElement = {
                        border: target.parent.parentManip.ordonator.get(0),
                        content: target.parent.parentManip.ordonator.get(1)
                    };
                    target.parent.parentManip.unset(0);
                    target.parent.parentManip.unset(1);
                    switch (true) {
                        case target.parent.parentManip.parentObject instanceof QuestionCreator:
                            target.parent.parentManip.unset(2);
                            drawings.component.clean();
                            let questionCreator = target.parent.parentManip.parentObject;
                            questionCreator.linkedQuestion.video = element;
                            questionCreator.linkedQuestion.image = null;
                            questionCreator.linkedQuestion.imageSrc = null;
                            questionCreator.parent.displayQuestionsPuzzle(null, null, null, null, questionCreator.parent.questionPuzzle.startPosition);
                            questionCreator.display();
                            questionCreator.linkedQuestion.checkValidity();
                            break;
                        case target.parent.parentManip.parentObject instanceof Answer:
                            let answer = target.parent.parentManip.parentObject;
                            answer.obj.video && drawings.component.remove(answer.obj.video);
                            answer.video = element;
                            answer.image = null;
                            answer.imageSrc = null;
                            answer.parentQuestion.tabAnswer.forEach(otherAnswer => {
                                otherAnswer.obj && otherAnswer.obj.video && drawings.component.remove(otherAnswer.obj.video);
                            });
                            answer.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
                            answer.parentQuestion.checkValidity();
                            break;
                    }
                    target.parent.parentManip.set(0, oldElement.border);
                }
            }
        }
    }

    /**
     * Bannière du site
     * @class
     */
    class Header {
        /**
         * construit la bannière du site
         * @constructs
         */
        constructor() {
            this.manipulator = new Manipulator(this).addOrdonator(3);
            this.userManipulator = new Manipulator(this).addOrdonator(6);
            this.label = "I-learning";
        }
    }

    /**
     * page de création d'un quiz
     * @class
     */
    class QuizManager {
        /**
         * construit un quiz associé à une formation
         * @constructs
         * @param quiz - objet qui va contenir toutes les informations du quiz crée
         * @param formation - formation qui va contenir le quiz
         */
        constructor(quiz, formation) {
            this.quizName = "";
            this.quizNameDefault = "Ecrire ici le nom du quiz";
            this.tabQuestions = [defaultQuestion];
            this.parentFormation = formation;
            this.quizNameValidInput = true;
            if (!quiz) {
                var initialQuizObject = {
                    title: defaultQuiz.title,
                    bgColor: myColors.white,
                    tabQuestions: this.tabQuestions,
                    puzzleLines: 3,
                    puzzleRows: 3
                };
                this.quiz = new Quiz(initialQuizObject, false, this.parentFormation);
                this.indexOfEditedQuestion = 0;
                this.quizName = this.quiz.title;
            } else {
                this.loadQuiz(quiz);
            }
            this.questionCreator = new QuestionCreator(this, this.quiz.tabQuestions[this.indexOfEditedQuestion]);
            this.library = new ImagesLibrary();
            this.quiz.tabQuestions[0].selected = true;
            this.questionCreator.loadQuestion(this.quiz.tabQuestions[0]);
            this.quiz.tabQuestions.push(new AddEmptyElement(this, 'question'));
            this.quizManagerManipulator = new Manipulator(this);
            this.questionsPuzzleManipulator = new Manipulator(this).addOrdonator(1);
            this.quizInfoManipulator = new Manipulator(this).addOrdonator(6);
            this.previewButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.saveQuizButtonManipulator = new Manipulator(this).addOrdonator(2);
            this.returnButtonManipulator = new Manipulator(this).addOrdonator(1);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.libraryIManipulator = this.library.libraryManipulator;
            this.questionPuzzle = new Puzzle(1, 6, this.quiz.tabQuestions, "leftToRight", this);
            this.questionPuzzle.leftChevronHandler = () => {
                this.questionPuzzle.updateStartPosition("left");
                this.questionPuzzle.fillVisibleElementsArray(this.questionPuzzle.orientation);
                this.questionPuzzle.display();
                this.questionPuzzle.checkPuzzleElementsArrayValidity();
            };
            this.questionPuzzle.rightChevronHandler = () => {
                this.questionPuzzle.updateStartPosition("right");
                this.questionPuzzle.fillVisibleElementsArray(this.questionPuzzle.orientation);
                this.questionPuzzle.display();
                this.questionPuzzle.checkPuzzleElementsArrayValidity();
            };
        }

        /**
         * chargement du quizManager avec les infos du quiz à modifier
         * @param quiz - quiz à modifier
         * @param indexOfEditedQuestion - index de la question en train d'être modifiée
         */
        loadQuiz(quiz, indexOfEditedQuestion) {
            this.indexOfEditedQuestion = (indexOfEditedQuestion && indexOfEditedQuestion !== -1 ? indexOfEditedQuestion : 0);
            this.quiz = new Quiz(quiz, false, this.parentFormation);
            this.quizName = this.quiz.title;
            this.quiz.tabQuestions[this.indexOfEditedQuestion].selected = true;
            this.questionCreator.loadQuestion(this.quiz.tabQuestions[this.indexOfEditedQuestion]);
            this.quiz.tabQuestions.forEach(question => {
                (question.tabAnswer[question.tabAnswer.length - 1] instanceof AddEmptyElement) || question.tabAnswer.push(new AddEmptyElement(this.questionCreator, 'answer'));
            });
            this.quiz.tabQuestions.push(new AddEmptyElement(this, 'question'));

        };

        /**
         * retourne l'objet qui va être sauvegardé en base de données
         * @returns {{id: *, title: (string|*), tabQuestions: Array, levelIndex: (*|number), gameIndex: (*|number)}}
         */
        getObjectToSave() {
            this.tabQuestions = this.quiz.tabQuestions;
            (this.tabQuestions[this.quiz.tabQuestions.length - 1] instanceof AddEmptyElement) && this.tabQuestions.pop();
            this.tabQuestions.forEach(question => {
                (question.tabAnswer[question.tabAnswer.length - 1] instanceof AddEmptyElement) && question.tabAnswer.pop();
                question.tabAnswer.forEach(answer => {
                    if (answer.popIn) {
                        answer.explanation = {};
                        answer.popIn.image && (answer.explanation.image = answer.popIn.image);
                        answer.popIn.label && (answer.explanation.label = answer.popIn.label);
                        answer.popIn.video && (answer.explanation.video = answer.popIn.video);
                        answer.popIn = null;
                    }
                });
            });
            return {
                id: this.quiz.id,
                title: this.quiz.title,
                tabQuestions: this.quiz.tabQuestions,
                levelIndex: this.quiz.levelIndex,
                gameIndex: this.quiz.gameIndex
            };
        }

        /**
         * affiche un message d'info sur l'état de la sauvegarde du quiz (bien sauvegardé ou erreur quelque part)
         * @param message - message à afficher
         * @param color - couleur du message
         */
        displayMessage(message, color) {
            this.questionCreator.errorMessagePreview && this.questionCreator.errorMessagePreview.parent && this.previewButtonManipulator.remove(this.questionCreator.errorMessagePreview);
            this.questionCreator.errorMessagePreview = new svg.Text(message)
                .position(this.buttonWidth, -this.saveQuizButtonManipulator.ordonator.children[0].height / 2 - MARGIN / 2)
                .font("Arial", 20)
                .anchor('middle').color(color);
            this.previewButtonManipulator.add(this.questionCreator.errorMessagePreview);
            setTimeout(() => {
                this.previewButtonManipulator.remove(this.questionCreator.errorMessagePreview);
            }, 5000);
        }

        /**
         * sauvegarde le quiz
         */
        saveQuiz() {
            let completeQuizMessage = "Les modifications ont bien été enregistrées",
                imcompleteQuizMessage = "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide",
                errorMessage = "Entrer un nom valide pour enregistrer";
            if (this.quizName !== "" && this.quizName.match(TITLE_REGEX)) {
                let quiz = this.getObjectToSave();
                this.quiz.isValid = true;
                quiz.tabQuestions.forEach(question => {
                    question.questionType && question.questionType.validationTab.forEach((funcEl) => {
                        var result = funcEl(question);
                        this.quiz.isValid = this.quiz.isValid && result.isValid;
                    });
                });
                this.quiz.isValid ? this.displayMessage(completeQuizMessage, myColors.green) : this.displayMessage(imcompleteQuizMessage, myColors.orange);
                Server.replaceQuiz(quiz, this.parentFormation._id, this.quiz.levelIndex, this.quiz.gameIndex, ignoredData)
                    .then(() => {
                        svg.addEvent(this.saveQuizButtonManipulator.ordonator.children[0], "click", () => {
                        });
                        svg.addEvent(this.saveQuizButtonManipulator.ordonator.children[1], "click", () => {
                        });
                        this.quiz.tabQuestions = this.tabQuestions;
                        let quiz = this.parentFormation.levelsTab[this.quiz.levelIndex].gamesTab[this.quiz.gameIndex];
                        this.parentFormation.miniaturesManipulator.remove(quiz.miniatureManipulator);
                        this.parentFormation.levelsTab[this.quiz.levelIndex].gamesTab[this.quiz.gameIndex] = this.quiz;
                        this.loadQuiz(this.parentFormation.levelsTab[this.quiz.levelIndex].gamesTab[this.quiz.gameIndex], this.quiz.parentFormation.quizManager.indexOfEditedQuestion);
                        this.questionPuzzle.checkPuzzleElementsArrayValidity(this.questionPuzzle.elementsArray);
                        this.display();
                    });
            }
            else {
                this.displayMessage(errorMessage, myColors.red);
            }
        }

        /**
         * vérifie le texte entré dans un input
         * @param myObj - input à vérifier
         */
        checkInputTextArea(myObj) {
            if ((typeof myObj.textarea.messageText !== "undefined" && myObj.textarea.messageText.match(TITLE_REGEX)) || myObj.textarea.messageText === "") {
                myObj.remove();
                myObj.textarea.onblur = myObj.onblur;
                myObj.textarea.border = "none";
                myObj.textarea.outline = "none";
                this.quizNameValidInput = true;
            } else {
                myObj.display();
                this.quizNameValidInput = false;
            }
        }
    }

    /**
     * classe générique représentant un jeu
     * @class
     */
    class Game {
        /**
         * construit un jeu
         * @constructs
         * @param game - options sur le jeu
         * @param parentFormation - formation contenant le jeu
         */
        constructor(game, parentFormation) {
            this.id = game.id;
            this.miniatureManipulator = new Manipulator(this);
            this.parentFormation = parentFormation || game.parentFormation;
            this.title = game.title || '';
            this.miniaturePosition = {x: 0, y: 0};
            this.returnButtonManipulator = new Manipulator(this);
            this.manipulator = new Manipulator(this);
        }

        /**
         * le jeu est il lié au parentGame (i.e la flèche part du parentgame et pointe vers le jeu)
         * @param parentGame - jeu parent
         * @returns {boolean}
         */
        isChildOf(parentGame) {
            return parentGame.parentFormation.links.some((link) => link.parentGame === parentGame.id && link.childGame === this.id);
        };
    }

    /**
     * Quiz
     * @class
     */
    class Quiz extends Game {
        /**
         * construit un quiz
         * @constructs
         * @param quiz - options sur le quiz
         * @param previewMode - le jeu est il affiché en mode preview (lorsque l'admin modifie un quiz, il peut voir un aperçu de ce dernier
         * @param parentFormation - formation contenant le quiz
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
         * charge les questions du quiz (crée une classe Question pour chaque objet dans quiz.tabQuestions)
         * @param quiz - quiz à charger
         */
        loadQuestions(quiz) {
            if (quiz && typeof quiz.tabQuestions !== 'undefined') {
                this.tabQuestions = [];
                quiz.tabQuestions.forEach(it => {
                    it.questionType = it.multipleChoice ? myQuestionType.tab[1] : myQuestionType.tab[0];
                    let tmp = new Question(it, this);
                    tmp.parentQuiz = this;
                    this.tabQuestions.push(tmp);
                });
            } else {
                this.tabQuestions = [];
                this.tabQuestions.push(new Question(defaultQuestion, this));
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
                if (this.tabQuestions.every(e => e.imageLoaded && e.tabAnswer.every(el => el.imageLoaded))) {
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
                            if (question.tabAnswer[e].correct) {
                                subTotal++;
                            }
                        });
                        allRight = (subTotal === question.rightAnswers.length);
                        !allRight && questionsWithBadAnswers.push(question);
                    }
                } else if (!question.multipleChoice && !question.tabAnswer[questionAnswered.validatedAnswers[0]].correct) {
                    questionsWithBadAnswers.push(question);
                }

            });
            return questionsWithBadAnswers;
        }
    }

    /**
     * Bd
     * @class
     */
    class Bd extends Game {
        /**
         * construit une Bd
         * @constructs
         * @param bd - options sur la bd
         * @param parentFormation - formation contenant la bd
         */
        constructor(bd, parentFormation) {
            super(bd, parentFormation);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.manipulator.add(this.returnButtonManipulator);
        }
    }

    /**
     * classe qui gère l'inscription d'un utilisateut au site. (Cela ne permet pas de créer des admins)
     * @class
     */
    class InscriptionManager {
        /**
         * construit le manager
         * @constructs
         */
        constructor() {
            this.manipulator = new Manipulator(this);
            this.header = new Header("Inscription");
            this.firstNameManipulator = new Manipulator(this).addOrdonator(4);
            this.lastNameManipulator = new Manipulator(this).addOrdonator(4);
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordConfirmationManipulator = new Manipulator(this).addOrdonator(3);
            this.saveButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.firstNameManipulator);
            this.manipulator.add(this.lastNameManipulator);
            this.manipulator.add(this.mailAddressManipulator);
            this.manipulator.add(this.passwordManipulator);
            this.manipulator.add(this.passwordConfirmationManipulator);
            this.manipulator.add(this.saveButtonManipulator);
            this.saveButtonHeightRatio = 0.075;
            this.saveButtonWidthRatio = 0.25;
            this.lastNameLabel = "Nom :";
            this.firstNameLabel = "Prénom :";
            this.mailAddressLabel = "Adresse mail :";
            this.passwordLabel = "Mot de passe :";
            this.passwordConfirmationLabel = "Confirmer votre mot de passe :";
            this.lastNameLabel = "Nom :";
            this.saveButtonLabel = "S'enregistrer";
            this.tabForm = [];
            this.formLabels = {};
        }
    }
////////////////// end of InscriptionManager.js //////////////////////////

////////////////// ConnexionManager.js //////////////////////////
    /**
     * classe qui gère la connexion au site
     * @class
     */
    class ConnexionManager {
        /**
         * construit le manager
         * @constructs
         */
        constructor() {
            this.manipulator = new Manipulator(this).addOrdonator(6);
            this.header = new Header("Connexion");
            this.mailAddressManipulator = new Manipulator(this).addOrdonator(4);
            this.passwordManipulator = new Manipulator(this).addOrdonator(4);
            this.connexionButtonManipulator = new Manipulator(this).addOrdonator(4);
            this.manipulator.add(this.mailAddressManipulator);
            this.manipulator.add(this.passwordManipulator);
            this.manipulator.add(this.connexionButtonManipulator);
            this.mailAddressLabel = "Adresse mail :";
            this.passwordLabel = "Mot de passe :";
            this.connexionButtonLabel = "Connexion";
            this.tabForm = [];

            let listFormations = () => {
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new FormationsManager(myFormations);
                    globalVariables.formationsManager.display();
                });
            };

            this.connexionButtonHandler = () => {
                // ** DMA3622 debug
                //console.log(this.tabForm);
                let emptyAreas = this.tabForm.filter(field => field.label === '');
                emptyAreas.forEach(emptyArea => {
                    emptyArea.border.color(myColors.white, 3, myColors.red);
                });
                // ** DMA3622 debug
                //console.log(emptyAreas);
                if (emptyAreas.length > 0) {
                    let message = autoAdjustText(EMPTY_FIELD_ERROR, drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                    message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                    svg.timeout(() => {
                        this.connexionButtonManipulator.unset(3);
                        emptyAreas.forEach(emptyArea => {
                            emptyArea.border.color(myColors.white, 1, myColors.black);
                        });
                    }, 5000);
                } else {
                    Server.connect(this.mailAddressField.label, this.passwordField.labelSecret).then(data => {
                        data = data && JSON.parse(data);
                        if (data.ack === 'OK') {
                            drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                            data.user.admin ? globalVariables.GUI.AdminGUI() : globalVariables.GUI.LearningGUI();
                            listFormations();
                        } else {
                            let message = autoAdjustText('Adresse et/ou mot de passe invalide(s)', drawing.width, this.h, 20, null, this.connexionButtonManipulator, 3);
                            message.text.color(myColors.red).position(0, -this.connexionButtonManipulator.ordonator.children[0].height + MARGIN);
                            svg.timeout(() => {
                                this.connexionButtonManipulator.unset(3);
                            }, 5000);
                        }
                    });
                }
            };
        }
    }
////////////////// end of ConnexionManager.js //////////////////////////

    return {
        setGlobalVariables,
        AddEmptyElement,
        Answer,
        AnswerVue,
        Bd,
        ConnexionManager,
        ConnexionManagerVue,
        Formation,
        FormationsManager,
        GamesLibrary,
        ImagesLibrary,
        Header,
        InscriptionManager,
        Level,
        Library,
        PopIn,
        Question,
        QuestionCreator,
        Quiz,
        QuizManager
    }
};