const FLibrary = require('./include/Library').Library;
const FFormationsManager = require('./include/FormationsManager').formationsManager;
const FUser = require('./include/User').User;
const FQuizElements = require('./include/QuizElements').QuizElements;
const FFormation = require('./include/Formation').Formation;

exports.Domain = function (globalVariables) {

    //Celui qui contient les references des differences class qui permet de decouper en plusieur fichier et contourner les depences circulaires
    let classContainer;

    let imageController;

    let
        main = globalVariables.main,
        runtime = globalVariables.runtime,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        util = globalVariables.util,
        clientWidth = globalVariables.clientWidth,
        clientHeight = globalVariables.clientHeight,
        Manipulator = globalVariables.util.Manipulator,
        MiniatureFormation = globalVariables.util.MiniatureFormation,
        Puzzle = globalVariables.util.Puzzle,
        ReturnButton = globalVariables.util.ReturnButton,
        Server = globalVariables.util.Server,
        //globalVariables.playerMode = globalVariables.globalVariables.playerMode,
        Picture = globalVariables.util.Picture,
        installDnD = globalVariables.gui.installDnD;

    imageController = ImageController(globalVariables.ImageRuntime);
    globalVariables.imageController = imageController;

    installDnD = globalVariables.gui.installDnD;

    setGlobalVariables = () => {
        main = globalVariables.main;
        runtime = globalVariables.runtime;
        drawing = globalVariables.drawing;
        drawings = globalVariables.drawings;
        svg = globalVariables.svg;
        gui = globalVariables.gui;
        util = globalVariables.util;
        clientWidth = globalVariables.clientWidth;
        clientHeight = globalVariables.clientHeight;
        Manipulator = globalVariables.util.Manipulator;
        MiniatureFormation = globalVariables.util.MiniatureFormation;
        Puzzle = globalVariables.util.Puzzle;
        ReturnButton = globalVariables.util.ReturnButton;
        Server = globalVariables.util.Server;
        //playerMode = globalVariables.globalVariables.playerMode;
        Picture = globalVariables.util.Picture;
        installDnD = globalVariables.gui.installDnD;

    };

    /**
     * class générique qui définis la manière d'afficher à l'écran un ou des éléments
     * @class
     */
    class Vue {
        /**
         * construit une vue. Son rôle est surtout de créer le manipulator principal
         * @constructs
         * @param options - contient des options à appliquer sur la vue
         * @param options.model - modele associé à la vue
         */
        constructor(options) {
            if (!options) options = {};
            this.manipulator = new Manipulator(this);
            this.model = options.model || {};
        }

        /**
         * définis les évènements de la classe. La cible de l'évènement doit forcément être attaché au this de la classe.
         * L'objet doit être un manipulator ou n'importe quelle classe d'un objet SVG
         * @returns {{"type_evenement nom_variable": handler}}
         */
        events() {
            return {};
        }

        /**
         * fonction d'affichage qui doit être override dans toutes les classes qui extend Vue
         */
        render() {
            console.log("vue rendered. This should be override")
        };

        /**
         * affiche les éléments de la classe et attache les évènements définis dans events() aux bon objets
         * @param args - accepte n'importe quel input
         */
        display(...args) {
            this.render(...args);
            this._setEvents();
        }

        /**
         * fonction interne qui attache les évènements aux objets de la classe.
         * @private
         */
        _setEvents() {
            let events = this.events();
            for (let eventOptions in events) {
                let handler = events[eventOptions];
                let [eventName, target] = eventOptions.split(' ');

                //global event
                if (!target) {
                    svg.addGlobalEvent(eventName, handler.bind(this));
                }
                //local event
                else {
                    let component = this[target];
                    if (component instanceof Manipulator) {
                        component.addEvent(eventName, handler.bind(this));
                    } else {
                        svg.addEvent(component, eventName, handler.bind(this));
                    }
                }
            }
        }
    }

    /**
     * factory permettant de gérer la liste des classes existantes.
     * @class
     */
    class Factory {
        constructor(classes){
            this.classes = classes || {};
        }

        add(...classes){
            this.classes = Object.assign(this.classes, ...classes);
        }

        getClass(className){
            return this.classes[className];
        }

        isInstanceOf(className, classInstance){
            return this.classes[className] && classInstance instanceof this.classes[className];
        }

        createClass(className, ...params){
            return new this.classes[className](...params);
        }
    }

    classContainer = new Factory({Vue});

    /**
     * header du site
     * @class
     */
    class HeaderVue extends Vue {
        constructor(options) {
            super(options);
            this.manipulator.addOrdonator(3);
            this.userManipulator = new Manipulator(this).addOrdonator(6);
            this.label = "I-learning";
        }

        render(message) {
            /**
             * @class
             */
            const width = drawing.width,
                height = HEADER_SIZE * drawing.height,
                manip = this.manipulator,
                font_size = 20,
                pos_text_y = height/2 +font_size/4,
                userManip = this.userManipulator,
                text = new svg.Text(this.label).position(MARGIN, pos_text_y).font('Arial', font_size).anchor('start').color(myColors.white),
                rect = new svg.Rect(width, height).color(myColors.customBlue, 1, myColors.black).position(width/2, height/2);
            manip.set(1, text);
            manip.set(0, rect);
            drawing.manipulator.set(0, manip);

            const displayUser = () => {

                let pos = -MARGIN;
                const deconnexion = displayText("Déconnexion", width * 0.1, pos_text_y, myColors.white, myColors.none, 20, null, userManip, 4, 5),
                    deconnexionWidth = deconnexion.content.boundingRect().width,
                    ratio = 0.65,
                    body = new svg.CurvedShield(35 * ratio, 30 * ratio, 0.5).color(myColors.white),
                    head = new svg.Circle(12 * ratio).color(myColors.white, 1, myColors.customBlue),
                    userText = autoAdjustText(drawing.username, width * 0.23, height, 20, null, userManip, 3);

                deconnexion.border.corners(5,5);
                pos -= deconnexionWidth / 2;
                deconnexion.content.position(0, 0);
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
                    main(svg, runtime, dbListener);
                };
                svg.addEvent(deconnexion.content, "click", deconnexionHandler);
                svg.addEvent(deconnexion.border, "click", deconnexionHandler);
            };

            if (message) {
                const messageText = autoAdjustText(message, width * 0.3, height, 32, 'Arial', manip, 2);
                messageText.text.position(width / 2, height / 2 + MARGIN)
                    .color(myColors.white)
                    .mark("headerMessage");
            } else {
                manip.unset(2);
            }

            manip.add(userManip);
            if (drawing.username) {
                displayUser();
                let returnToListFormation = () => {
                    drawings.component.clean();
                    Server.getAllFormations().then(data => {
                        let myFormations = JSON.parse(data).myCollection;
                        globalVariables.formationsManager = classContainer.createClass("FormationsManagerVue", myFormations);
                        globalVariables.formationsManager.display();
                    });
                };
                svg.addEvent(text, 'click', returnToListFormation);
            }
        }
    }

    classContainer.add({HeaderVue});

    classContainer.add(
        FQuizElements(globalVariables, classContainer),
        FLibrary(globalVariables, classContainer),
        FFormationsManager(globalVariables, classContainer),
        FFormation(globalVariables, classContainer),
        FUser(globalVariables, classContainer)
    );

    /**
     * affichage GUI pour l'admin
     */
    var adminGUI = function () {
        globalVariables.playerMode = false;
        util.setGlobalVariables();
        //playerMode = false;

        header = new HeaderVue();
        globalVariables.header = header;
    };

    /**
     * affichage GUI pour l'utilisateur
     */
    var learningGUI = function () {
        globalVariables.playerMode = true;
        util.setGlobalVariables();
        //playerMode = true;

        header = new HeaderVue();
        globalVariables.header = header;
    };

    return Object.assign({
        setGlobalVariables,
        adminGUI,
        learningGUI
    }, classContainer.classes);
};