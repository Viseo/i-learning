const FLibrary = require('./include/library').Library; //TODO utiliser ca au lieu des classes de domain (pour l'instant problème de dépendance cyclique)
const FFormationsManager = require('./include/formationsManager').formationsManager;
const FUser = require('./include/User').User;
const FQuizElements = require('./include/QuizElements').QuizElements;

exports.Domain = function ( globalVariables) {

    let imageController;
    let myFormations;

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
        playerMode = globalVariables.playerMode,
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
        playerMode = globalVariables.playerMode;
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
        render() { console.log("vue rendered. This should be override") };

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
            for(let eventOptions in events){
                let handler = events[eventOptions];
                let [eventName, target] = eventOptions.split(' ');

                //global event
                if (!target) {
                    svg.addGlobalEvent(eventName, handler.bind(this));
                }
                //local event
                else {
                    let component = this[target];
                    if(component instanceof Manipulator){
                        component.addEvent(eventName, handler.bind(this));
                    }else {
                        svg.addEvent(component, eventName, handler.bind(this));
                    }
                }
            }
        }
    }

    /**
     * header du site
     * @class
     */
    class HeaderVue extends Vue {
        constructor(options){
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
                userManip = this.userManipulator,
                text = new svg.Text(this.label).position(MARGIN, height * 0.75).font('Arial', 20).anchor('start'),
                line = new svg.Line(0, height, width, height).color(myColors.black, 3, myColors.black);
            manip.set(1, text);
            manip.set(0, line);
            drawing.manipulator.set(0, manip);

            const displayUser = () => {

                let pos = -MARGIN;
                const deconnexion = displayText("Déconnexion", width * 0.15, height, myColors.none, myColors.none, 20, null, userManip, 4, 5),
                    deconnexionWidth = deconnexion.content.boundingRect().width,
                    ratio = 0.65,
                    body = new svg.CurvedShield(35 * ratio, 30 * ratio, 0.5).color(myColors.black),
                    head = new svg.Circle(12 * ratio).color(myColors.black, 2, myColors.white),
                    userText = autoAdjustText(drawing.username, width * 0.23, height, 20, null, userManip, 3);

                pos -= deconnexionWidth / 2;
                deconnexion.content.position(pos, 0);
                deconnexion.border.position(pos, -30 / 2).mark('deconnection');
                pos -= deconnexionWidth / 2 + 40;
                userText.text.anchor('end').position(pos, 0);
                pos -= userText.finalWidth;
                userManip.set(0, body);
                userManip.set(1, head);

                pos -= body.boundingRect().width / 2 + MARGIN;
                body.position(pos, -5 * ratio);
                head.position(pos, -20 * ratio);
                userManip.move(width, height * 0.75);

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
                        globalVariables.formationsManager = new FormationsManagerVue(myFormations);
                        globalVariables.formationsManager.display();
                    });
                };
                svg.addEvent(text, 'click', returnToListFormation);
            }
            if (message === "Inscription" || message === "Connexion") {
                const link = message === "Inscription" ? "Connexion" : "Inscription";
                const clickHandler = () => {
                    (link === "Inscription") ? globalVariables.inscriptionManager.render() : globalVariables.connexionManager.render();
                };
                const special = displayText(link, 220, 40, myColors.none, myColors.none, 25, 'Arial', userManip, 4);
                special.border.mark('inscriptionLink');
                special.content.anchor("end");
                userManip.move(width - MARGIN, height * 0.75);
                userManip.scale(1);
                svg.addEvent(special.content, "click", clickHandler);
                svg.addEvent(special.border, "click", clickHandler);
            }
        }
    }

    /**
     * TODO renommer this.libraryManipulator en this.manipulator (harmonisation)
     * @class
     */
    class LibraryVue extends Vue {
        constructor(options){
            super(options);
            this.libraryManipulator = new Manipulator(this).addOrdonator(4);
            this.itemsTab = [];
            this.libraryManipulators = [];
        }

        libraryDisplay(x, y, w, h, ratioPanelHeight, yPanel) {
            this.libraryManipulator.flush();
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            let borderSize = 3;

            this.border = new svg.Rect(w - borderSize, h, this.libraryManipulator)
                .color(myColors.white, borderSize, myColors.black)
                .position(w / 2, h / 2);
            this.libraryManipulator.set(0, this.border);
            this.libraryManipulator.move(this.x, this.y);

            this.panel = new gui.Panel(w - 4, ratioPanelHeight * h, myColors.white).position(w / 2 + 0.5, yPanel);
            this.panel.border.color([], 3, [0, 0, 0]);
            this.libraryManipulator.set(2, this.panel.component);
            this.panel.vHandle.handle.color(myColors.lightgrey, 2, myColors.grey);
            this.panel.hHandle.handle.color(myColors.none, 0, myColors.none);
            drawing.notInTextArea = true;
            svg.addGlobalEvent("keydown", (event) => {
                if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                    event.preventDefault();
                }
            });
            var hasKeyDownEvent = (event) => {
                return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
            };
        }
    }

    /**
     * @class
     */
    class GamesLibraryVue extends LibraryVue {
        /**
         * construit une bibliothèque de jeux
         * @constructs
         * @param lib - options sur la bibliothèque
         * @param lib.title - titre de la bibliothèque
         * @param lib.font - police d'écriture
         * @param lib.fontSize - taille d'écriture
         * @param lib.tab - tableau de jeux à ajouter à la bibliothèque
         */
        constructor(lib){
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

        render(x, y, w, h) {
            this.libraryDisplay.call(this, x + MARGIN, y, w, h, 0.9, 0.9 * h / 2);

            this.panel.hHandle.handle.color(myColors.none, 3, myColors.none);
            this.panel.vHandle.handle.color(myColors.none, 3, myColors.none);
            let displayArrowModeButton = () => {
                this.libraryManipulator.remove(this.arrowModeManipulator);
                this.libraryManipulator.add(this.arrowModeManipulator);
                this.arrowModeManipulator.move(w / 2, h - 0.05 * h);

                let createLink = (parentGame, childGame) => {
                    if (childGame.isChildOf(parentGame)) return;
                    if (parentGame.levelIndex >= childGame.levelIndex) return;
                    let arrow = new Arrow(parentGame, childGame);
                    this.formation.createLink(parentGame, childGame, arrow);
                    arrow.arrowPath.mark(parentGame.id + childGame.id);
                };

                let arrowModeButton = displayText('', w * 0.9, (6 / 100) * h, myColors.black, myColors.white, null, this.font, this.arrowModeManipulator);
                arrowModeButton.arrow = drawStraightArrow(-0.3 * w, 0, 0.3 * w, 0);
                arrowModeButton.arrow.color(myColors.black, 1, myColors.black).mark("arrowModeArrow");
                this.arrowModeManipulator.set(2, arrowModeButton.arrow);
                arrowModeButton.border.mark('arrowModeButtonCadre');

                this.toggleArrowMode = () => {
                    this.arrowMode = !this.arrowMode;

                    let panel = this.formation.panel,
                        graph = this.formation.graphManipulator.last,
                        clip = this.formation.clippingManipulator.last,
                        glass = new svg.Rect(panel.width, panel.height).opacity(0.001).color(myColors.white);

                    if (this.arrowMode) {
                        this.gameSelected = null;
                        this.itemsTab.forEach(e => {
                            e.miniature.border.color(myColors.white, 1, myColors.black)
                        });

                        this.formation.selectedGame && this.formation.selectedGame.miniatureClickHandler();
                        arrowModeButton.border.color(myColors.white, 3, SELECTION_COLOR);
                        arrowModeButton.arrow.color(myColors.blue, 2, myColors.black);
                        clip.add(glass);
                        glass.position(glass.width / 2, glass.height / 2);

                        let mouseDownAction = (event) => {
                            event.preventDefault();
                            let targetParent = graph.getTarget(event.pageX, event.pageY);

                            let mouseUpAction = (event) => {
                                let targetChild = graph.getTarget(event.pageX, event.pageY);
                                let booleanInstanceOfCorrect = function (e) {
                                    return e && e.parent && e.parent.parentManip && e.parent.parentManip.parentObject &&
                                        (e.parent.parentManip.parentObject instanceof QuizVue ||
                                        e.parent.parentManip.parentObject instanceof BdVue);
                                };
                                if (booleanInstanceOfCorrect(targetParent) && booleanInstanceOfCorrect(targetChild)) {
                                    createLink(targetParent.parent.parentManip.parentObject, targetChild.parent.parentManip.parentObject)
                                }
                            };
                            svg.addEvent(glass, 'mouseup', mouseUpAction);
                        };

                        let clickAction = function (event) {
                            let target = graph.getTarget(event.pageX, event.pageY);
                            (target instanceof svg.Path) && target.component && target.component.listeners && target.component.listeners.click();
                        };
                        glass.mark("theGlass");
                        svg.addEvent(glass, 'mousedown', mouseDownAction);
                        svg.addEvent(glass, 'click', clickAction);
                    } else {
                        arrowModeButton.border.color(myColors.white, 1, myColors.black);
                        arrowModeButton.arrow.color(myColors.black, 1, myColors.black);
                        clip.remove(clip.children[clip.children.length - 1]);
                    }
                };
                svg.addEvent(arrowModeButton.border, 'click', this.toggleArrowMode);
                svg.addEvent(arrowModeButton.arrow, 'click', this.toggleArrowMode);
            };

            let displayItems = () => {
                let maxGamesPerLine = 1,
                    libMargin = (w - (maxGamesPerLine * w)) / (maxGamesPerLine + 1) + 2 * MARGIN,
                    tempY = (0.15 * h);

                this.itemsTab.forEach((item, i) => {
                    this.panel.content.children.indexOf(this.libraryManipulators[i]) === -1 && this.panel.content.add(this.libraryManipulators[i].first);

                    if (i % maxGamesPerLine === 0 && i !== 0) {
                        tempY += this.h / 4 + libMargin;
                    }

                    let label = myLibraryGames.tab[i].label,
                        obj = displayTextWithCircle(label, Math.min(w / 2, h / 4), h, myColors.black, myColors.white, null, this.fontSize, this.libraryManipulators[i]);
                    obj.border.mark("game" + label);
                    obj.border.clicked = false;
                    this.itemsTab[i].miniature = obj;
                    let X = x + libMargin - 2 * MARGIN + ((i % maxGamesPerLine + 1) * (libMargin + w / 2 - 2 * MARGIN));
                    this.libraryManipulators[i].move(X, tempY);
                });
                this.panel.resizeContent(w, tempY += Math.min(w / 2, h / 4) - 1);
            };

            let assignEvents = () => {
                this.itemsTab.forEach((item, i) => {
                    let mouseDownAction = event => {

                        this.arrowMode && this.toggleArrowMode();
                        let conf = {
                            drop: (what, whatParent, x, y) => {
                                let target = this.formation.manipulator.component.getTarget(x, y);
                                let parentObject = (target && target.parent && target.parent.parentManip && target.parent.parentManip.parentObject) ? target.parent.parentManip.parentObject : null;
                                if (parentObject !== what) {
                                    if (parentObject instanceof FormationVue) {
                                        this.formation.dropAction(what.x, what.y,what);
                                    }
                                }
                                return {x:what.x,y:what.y,parent:what.component.parent};
                            },
                            moved: (what) => {
                                this.draggedObject = null;
                                what.flush();
                                return true;
                            },
                            clicked: (item) => {
                                if(!this.gameSelected) {
                                    this.gameSelected = this.draggedObject;
                                    item.flush();

                                    for (let it in this.itemsTab) {
                                        if (this.itemsTab[it].label == this.draggedObject.label) {
                                            this.miniatureSelected = this.itemsTab[it];
                                            this.miniatureSelected.miniature.border.color(myColors.white, 3, myColors.darkBlue);
                                            this.miniatureSelected.miniature.border.mark('miniatureSelected');
                                        }
                                    }
                                    //this.formation && this.gameSelected.border.color(myColors.white, 3, myColors.darkBlue);
                                    let clickPanelToAdd = (event) => {
                                        if (this.gameSelected && this.formation) {
                                            this.formation.dropAction(event.pageX, event.pageY, this.gameSelected.manipulator);
                                            this.miniatureSelected.miniature.border.color(myColors.white, 1, myColors.black);
                                            this.miniatureSelected = null;
                                            this.draggedObject = null;
                                            this.gameSelected = null;
                                        }
                                        svg.removeEvent(this.formation.panel.back, 'click');
                                    }
                                    svg.addEvent(this.formation.panel.back, 'click', clickPanelToAdd);
                                }
                                else{
                                    for (let it in this.itemsTab) {
                                        if (this.itemsTab[it].label == this.draggedObject.label) {
                                            this.miniatureSelected = null;
                                            this.itemsTab[it].miniature.border.color(myColors.white, 1, myColors.black);
                                        }
                                    }
                                    this.gameSelected = null;
                                    this.draggedObject = null;
                                    item.flush();
                                }
                            }
                        };

                        let createDraggableCopy = () => {
                            let manipulator = new Manipulator(this).addOrdonator(2);
                            drawings.piste.add(manipulator);
                            let point = item.miniature.border.globalPoint(0, 0);
                            manipulator.move(point.x, point.y);
                            this.draggedObject = displayTextWithCircle(this.itemsTab[i].miniature.content.messageText, w / 2, h, myColors.black, myColors.white, null, this.fontSize, manipulator);
                            this.draggedObject.manipulator = manipulator;
                            this.draggedObject.label = this.itemsTab[i].label;
                            this.draggedObject.manipulator.addNew = true;
                            this.draggedObject.border.mark("draggedGameCadre");
                            this.draggedObject.create = this.itemsTab[i].create;
                            manipulator.set(0, this.draggedObject.border);
                            installDnD(this.draggedObject.manipulator, drawings.component.glass.parent.manipulator.last, conf);
                            svg.event(drawings.component.glass, "mousedown", event);
                            svg.event(this.draggedObject.border, 'mousedown', event);
                            svg.event(this.draggedObject.content, "mousedown", event);
                        };

                        createDraggableCopy();
                    };
                    item.miniature.border.parent.parentManip.addEvent('mousedown', mouseDownAction);
                });
            };
            displayItems();
            displayArrowModeButton();
            assignEvents();
        }
    }

    /**
     * @class
     */
    class ImagesLibraryVue extends LibraryVue {
        constructor(){
            super();
            this.imageWidth = 50;
            this.imageHeight = 50;
            this.videosManipulators = [];
            this.videosUploadManipulators = [];
            this.addButtonManipulator = new Manipulator(this).addOrdonator(3);
        }

        render(x, y, w, h, callback = () => { }) {
            let display = (x, y, w, h) => {
                this.libraryDisplay.call(this, x, y, w, h, 0.8, h / 2);

                const uploadFiles = (files) => {
                    for (let file of files) {
                        let progressDisplay;
                        this.selectedTab = 0;
                        if (file.type === 'video/mp4') {
                            this.selectedTab = 1;
                            progressDisplay = (() => {
                                const width = 0.8 * w,
                                    manipulator = new Manipulator().addOrdonator(4),
                                    icon = drawUploadIcon({ x: -0.56 * width, y: 5, size: 20 });
                                manipulator.set(0, icon);
                                const rect = new svg.Rect(width - 15, 16).color(myColors.none, 1, myColors.darkerGreen);
                                manipulator.set(1, rect);
                                manipulator.redCrossManipulator = new Manipulator(this);
                                manipulator.add(manipulator.redCrossManipulator);

                                let redCross = drawRedCross(width / 2 + MARGIN, 0, 15, manipulator.redCrossManipulator);
                                manipulator.redCrossManipulator.add(redCross);
                                let redCrossClickHandler = () => {
                                    drawing.mousedOverTarget && (drawing.mousedOverTarget.target = null);
                                    dbListener.uploadRequest && dbListener.uploadRequest.abort();
                                    this.videosUploadManipulators.remove(manipulator);
                                    manipulator.flush();
                                };
                                svg.addEvent(redCross, 'click', redCrossClickHandler);

                                this.videosUploadManipulators.push(manipulator);
                                return (e) => {
                                    const progwidth = width * e.loaded / e.total;
                                    const bar = new svg.Rect(progwidth - 15, 14)
                                        .color(myColors.green)
                                        .position(-(width - progwidth) / 2, 0);
                                    const percentage = new svg.Text(Math.round(e.loaded / e.total * 100) + "%");
                                    manipulator.set(3, percentage);
                                    percentage.position(0, percentage.boundingRect().height / 4);
                                    manipulator.set(2, bar);
                                    if (e.loaded === e.total) {
                                        this.videosUploadManipulators.remove(manipulator);
                                    }
                                };
                            })();
                        }
                        this.display(x, y, w, h);
                        Server.upload(file, progressDisplay).then(() => {
                            this.display(x, y, w, h);
                        });
                    }
                };

                const drop = (event) => {
                    event.preventDefault();
                    if (this.border.inside(event.pageX, event.pageY)) {
                        uploadFiles(event.dataTransfer.files)
                    }
                };

                svg.addEvent(drawings.component.glass, 'dragover', (e) => { e.preventDefault() });
                svg.addEvent(drawings.component.glass, 'drop', drop);

                const assignImageEvents = () => {
                    this.libraryManipulators.forEach(libraryManipulator => {
                        let mouseDownAction = event => {
                            let draggableImage = (() => {
                                let imgToCopy = libraryManipulator.ordonator.children[0];
                                let img = displayImage(imgToCopy.src, imgToCopy.srcDimension, imgToCopy.width, imgToCopy.height, imgToCopy.name).image;
                                img.mark('imgDraged');
                                img.manipulator = new Manipulator(this).addOrdonator(2);
                                img.manipulator.set(0, img);
                                drawings.piste.add(img.manipulator);
                                let point = libraryManipulator.ordonator.children[0].globalPoint(libraryManipulator.ordonator.children[0].x, libraryManipulator.ordonator.children[0].y);
                                img.manipulator.move(point.x, point.y);
                                img.srcDimension = imgToCopy.srcDimension;
                                manageDnD(img, img.manipulator);
                                return img;
                            })();
                            let mouseupHandler = event => {
                                let svgObj = draggableImage.manipulator.ordonator.children.shift();
                                drawings.piste.remove(draggableImage.manipulator);
                                let target = drawings.component.background.getTarget(event.pageX, event.pageY);
                                this.dropImage(svgObj, target);
                            };
                            svg.event(drawings.component.glass, "mousedown", event);
                            svg.addEvent(draggableImage, 'mouseup', mouseupHandler);
                        };
                        svg.addEvent(libraryManipulator.ordonator.children[0], 'mousedown', mouseDownAction);
                        svg.addEvent(libraryManipulator.ordonator.children[1], 'mousedown', mouseDownAction);
                    });
                };
                const assignVideoEvents = () => {
                    this.videosManipulators.forEach((videoManipulator, i) => {
                        let mouseDownAction = event => {
                            let draggableVideo = (() => {
                                let draggableManipulator = new Manipulator(this).addOrdonator(2);
                                let video = drawVideoIcon(0, -10, 20, this);
                                video.mark('videoDragged');
                                draggableManipulator.set(0, video);
                                drawings.piste.add(draggableManipulator);
                                let videoTitle = autoAdjustText(videoManipulator.ordonator.children[1].fullTitle, 500, 50, 16, null, draggableManipulator, 1);
                                videoTitle.text.position(videoTitle.finalWidth / 2 + 15, -videoTitle.finalHeight / 4);
                                videoTitle.text._acceptDrop = true;
                                let point = videoManipulator.ordonator.children[0].globalPoint(videoManipulator.ordonator.children[0].x, videoManipulator.ordonator.children[0].y);
                                draggableManipulator.move(point.x, point.y);
                                video.manageDnD(draggableManipulator);
                                manageDnD(videoTitle.text, draggableManipulator);
                                return draggableManipulator;
                            })();
                            let mouseupHandler = event => {
                                drawings.piste.remove(draggableVideo);
                                let target = drawings.component.background.getTarget(event.pageX, event.pageY);
                                this.dropVideo(this.videosTab[i], target);
                            };
                            svg.event(drawings.component.glass, "mousedown", event);
                            draggableVideo.ordonator.children[0].parentManip.setHandler('mouseup', mouseupHandler);
                            svg.addEvent(draggableVideo.ordonator.children[1], 'mouseup', mouseupHandler);
                        };
                        videoManipulator.ordonator.children[0].parentManip.setHandler("mousedown", mouseDownAction);
                        svg.addEvent(videoManipulator.ordonator.children[1], "mousedown", mouseDownAction);
                    });
                };

                const displayItems = () => {
                    let maxImagesPerLine = Math.floor((w - MARGIN) / (this.imageWidth + MARGIN)) || 1, //||1 pour le cas de resize très petit
                        libMargin = (w - (maxImagesPerLine * this.imageWidth)) / (maxImagesPerLine + 1),
                        tempY = (0.075 * h);

                    const displayImages = () => {
                        this.itemsTab.forEach((item, i) => {
                            if (i % maxImagesPerLine === 0 && i !== 0) {
                                tempY += this.imageHeight + libMargin;
                            }
                            this.panel.content.children.indexOf(this.libraryManipulators[i]) === -1 && this.panel.content.add(this.libraryManipulators[i].first);
                            this.imageLayer = 0;
                            let imageRedCrossClickHandler = () => {
                                this.libraryManipulators[i].flush();
                                this.itemsTab.splice(i, 1);
                                Server.deleteImage(item);
                                this.display(x, y, w, h);
                            };
                            let image = new Picture(item.imgSrc, true, this, null, imageRedCrossClickHandler);
                            image._acceptDrop = false;
                            image.draw(0, 0, this.imageWidth, this.imageHeight, this.libraryManipulators[i]);
                            image.name = item.name;
                            image.imageSVG.srcDimension = { width: item.width, height: item.height };
                            image.imageSVG.mark('image' + image.src.split('/')[2].split('.')[0]);
                            let X = x + libMargin + ((i % maxImagesPerLine) * (libMargin + this.imageWidth));
                            this.libraryManipulators[i].move(X, tempY);

                        });
                        this.panel.resizeContent(w, tempY += this.imageHeight);
                        assignImageEvents();
                    };
                    Server.getImages().then(data => {
                        let myLibraryImage = JSON.parse(data).images;
                        myLibraryImage.forEach((url, i) => {
                            this.libraryManipulators[i] || (this.libraryManipulators[i] = new Manipulator(this));
                            this.libraryManipulators[i].ordonator || (this.libraryManipulators[i].addOrdonator(2));
                            this.itemsTab[i] = imageController.getImage(url.imgSrc, function () {
                                this.imageLoaded = true; //this != library
                            });
                            this.itemsTab[i]._id = url._id;
                            this.itemsTab[i].name = url.name;
                            this.itemsTab[i].imgSrc = url.imgSrc;
                        });
                    })
                        .then(() => {
                            let intervalToken = svg.interval(() => {
                                if (this.itemsTab.every(e => e.imageLoaded)) {
                                    svg.clearInterval(intervalToken);
                                    displayImages();
                                }
                            }, 100);
                        });
                };

                const displayAddButton = () => {
                    let fileExplorer;
                    const fileExplorerHandler = () => {
                        if (!fileExplorer) {
                            let globalPointCenter = this.border.globalPoint(0, 0);
                            var fileExplorerStyle = {
                                leftpx: globalPointCenter.x,
                                toppx: globalPointCenter.y,
                                width: this.w / 5,
                                height: this.w / 5
                            };
                            fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
                            fileExplorer.type("file");
                            svg.addEvent(fileExplorer, "change", onChangeFileExplorerHandler);
                            svg.runtime.attr(fileExplorer.component, "accept", "image/*, video/mp4");
                            svg.runtime.attr(fileExplorer.component, "id", "fileExplorer");
                            svg.runtime.attr(fileExplorer.component, "hidden", "true");
                            svg.runtime.attr(fileExplorer.component, "multiple", "true");
                            drawings.component.add(fileExplorer);
                            fileExplorer.fileClick = function () {
                                svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
                            }
                        }
                        fileExplorer.fileClick();
                    };

                    const onChangeFileExplorerHandler = () => {
                        uploadFiles(fileExplorer.component.files)
                    };

                    const addButton = new svg.Rect(this.w / 6, this.w / 6).color(myColors.white, 2, myColors.black),
                        addButtonLabel = "Ajouter image/vidéo",
                        addButtonText = autoAdjustText(addButtonLabel, 2 * this.w / 3, this.h / 15, 20, "Arial", this.addButtonManipulator),
                        plus = drawPlus(0, 0, this.w / 7, this.w / 7);
                    addButton.mark('addImageButton').corners(10, 10);
                    addButtonText.text.position(0, this.h / 12 - (this.h / 15) / 2 + 3 / 2 * MARGIN);

                    this.addButtonManipulator.set(0, addButton);
                    this.addButtonManipulator.set(2, plus);
                    this.libraryManipulator.add(this.addButtonManipulator);
                    this.addButtonManipulator.move(this.w / 2, 9 * this.h / 10);
                    svg.addEvent(this.addButtonManipulator.ordonator.children[0], 'click', fileExplorerHandler);
                    svg.addEvent(this.addButtonManipulator.ordonator.children[1], 'click', fileExplorerHandler);
                    svg.addEvent(this.addButtonManipulator.ordonator.children[2], 'click', fileExplorerHandler);
                };

                const displayTabs = () => {
                    const
                        width = w * 0.8,
                        height = h * 0.06;

                    const videosPanel = new gui.Panel(w - 4, 0.8 * h, myColors.white, 2);
                    videosPanel.position(w / 2 + 0.5, h / 2);
                    videosPanel.vHandle.handle.color(myColors.lightgrey, 2, myColors.grey);
                    videosPanel.hHandle.handle.color(myColors.none, 0, myColors.none);

                    const displayVideo = (video, manipulator) => {
                        this.video = video;
                        let iconVideo = drawVideoIcon(0, -10, 20, this);
                        iconVideo.mark(video.name.split('.')[0]);
                        manipulator.set(0, iconVideo);
                        const title = autoAdjustText(video.name, w - 20, 20, 16, null, manipulator, 1);
                        title.text.fullTitle = video.name;
                        title.text.position(title.finalWidth / 2 + 15, -title.finalHeight / 4);
                        manipulator.video = video;

                        let overVideoIconHandler = () => {
                            let redCross = drawRedCross(0, -title.finalHeight / 2, 15, manipulator.redCrossManipulator);
                            redCross.mark('videoRedCross');
                            svg.addEvent(redCross, 'mouseout', mouseleaveHandler);
                            manipulator.redCrossManipulator.add(redCross);
                            let redCrossClickHandler = () => {
                                Server.deleteVideo(video);
                                this.display(this.x, this.y, this.w, this.h);
                                this.videosManipulators.remove(manipulator);
                                this.videosUploadManipulators.forEach((manipulator, i) => {
                                    videosPanel.content.add(manipulator.first);
                                    manipulator.move(w / 2, 30 + (this.videosManipulators.length + i) * 30)
                                });
                            };
                            svg.addEvent(redCross, 'click', redCrossClickHandler);
                        };

                        let mouseleaveHandler = () => {
                            manipulator.redCrossManipulator.flush();
                        };

                        iconVideo.setHandler('mouseover', overVideoIconHandler);
                        iconVideo.setHandler('mouseout', mouseleaveHandler);

                        svg.addEvent(title.text, 'mouseover', overVideoIconHandler);
                        svg.addEvent(title.text, 'mouseout', mouseleaveHandler);

                    };

                    const sortAlphabetical = function (array) {
                        return sort(array, (a, b) => (a.name.toUpperCase() < b.name.toUpperCase()));
                    };

                    const loadVideos = () => {
                        Server.getVideos().then(data => {
                            this.videosTab = sortAlphabetical(JSON.parse(data));
                            this.videosTab.forEach((video, i) => {
                                if (!this.videosManipulators[i]) {
                                    this.videosManipulators[i] = new Manipulator().addOrdonator(2);
                                }
                                videosPanel.content.add(this.videosManipulators[i].first);
                                this.videosManipulators[i].redCrossManipulator = new Manipulator(this);
                                this.videosManipulators[i].add(this.videosManipulators[i].redCrossManipulator);
                                displayVideo(video, this.videosManipulators[i]);
                                this.videosManipulators[i].move(20, 30 + i * 30);
                            });
                            this.videosUploadManipulators.forEach((manipulator, i) => {
                                videosPanel.content.add(manipulator.first);
                                manipulator.move(w / 2, 30 + (this.videosManipulators.length + i) * 30)
                            });
                            videosPanel.resizeContent(w, (this.videosManipulators.length + this.videosUploadManipulators.length + 1) * 30);
                            assignVideoEvents();
                        });
                    };

                    const imagesPanel = this.panel;

                    const createTab = function (text, width, height, fontsize, font, manipulator, setContent) {
                        let button = displayTextWithoutCorners(text, width, height, myColors.black, myColors.white, fontsize, font, manipulator);
                        button.content.position(0, 5).mark('library' + text);
                        let selected = false;

                        const select = function () {
                            selected = true;
                            button.border.color(SELECTION_COLOR, 1, myColors.black);
                            button.content.color(getComplementary(SELECTION_COLOR), 0, myColors.black);
                            setContent();
                        };

                        const unselect = function () {
                            if (selected) {
                                selected = false;
                                button.border.color(myColors.white, 1, myColors.black);
                                button.content.color(myColors.black, 0, myColors.white);
                            }
                        };

                        const setClickHandler = function (handler) {
                            svg.addEvent(button.border, 'click', handler);
                            svg.addEvent(button.content, 'click', handler);
                        };

                        return {
                            select,
                            unselect,
                            setClickHandler
                        };
                    };

                    const createTabManager = function (library) {
                        const tabs = [],
                            manipulator = new Manipulator().addOrdonator(2);

                        const addTab = function (name, i, setContent) {
                            const manip = new Manipulator().addOrdonator(2),
                                tab = createTab(name, width / 2, height, 20, null, manip, setContent);
                            tabs.push(tab);
                            tab.setClickHandler(() => select(i));
                            manip.move(i * (MARGIN + width / 2), 0);
                            manipulator.set(i, manip);
                        };

                        const select = function (numTab = 0) {
                            if (numTab >= tabs.length || numTab < 0) {
                                numTab = 0;
                            }
                            tabs.forEach((tab, index) => {
                                if (index === numTab) {
                                    tab.select();
                                    library.selectedTab = numTab;
                                } else {
                                    tab.unselect();
                                }
                            });
                        };
                        return {
                            manipulator,
                            addTab,
                            select
                        };
                    };
                    const tabManager = createTabManager(this);
                    tabManager.addTab("Images", 0, () => {
                        displayItems();
                        this.libraryManipulator.set(2, imagesPanel.component);
                    });
                    tabManager.addTab("Vidéos", 1, () => {
                        this.libraryManipulator.set(2, videosPanel.component);
                        loadVideos();
                    });
                    tabManager.manipulator.move(w / 4 + MARGIN, h * 0.05);
                    tabManager.select(this.selectedTab);
                    this.libraryManipulator.set(1, tabManager.manipulator);
                    assignVideoEvents();
                };
                displayTabs();
                displayItems();
                displayAddButton();
            };
            display(x, y, w, h);
            callback();
        }

        /**
         * ajoute une image à une question ou l'explication d'une réponse
         * @param element - image
         * @param target - object à qui l'image va être ajoutée (i.e question ou réponse)
         */
        dropImage(element, target) {
            if (target && target._acceptDrop) {
                if (target.parent.parentManip.parentObject instanceof PopInVue) {
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
                        case target.parent.parentManip.parentObject instanceof QuestionCreatorVue:
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
                if (target.parent.parentManip.parentObject instanceof PopInVue) {
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
                        case target.parent.parentManip.parentObject instanceof QuestionCreatorVue:
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

    let {QuizManagerVue, AddEmptyElementVue, AnswerVue, QuizVue, BdVue, Level} = FQuizElements(globalVariables, Vue, ImagesLibraryVue);

    /**
     * Formation qui peut contenir différents jeux répartis sur différents niveaux
     * @class
     */
    class FormationVue extends Vue {
        /**
         * construit une formation
         * @constructs
         * @param {Object} formation - valeurs par défaut pour la formaiton
         * @param {Object} formationsManager - manager qui va contenir la formation
         */
        constructor(formation, formationsManager) {
            super();
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
            this.library = new GamesLibraryVue(myLibraryGames);
            this.library.formation = this;
            this.quizManager = new QuizManagerVue(null, this);
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
         * affiche la formation
         */
        render() {
            main.currentPageDisplayed = "Formation";
            globalVariables.header.display(this.label);
            this.formationsManager.formationDisplayed = this;
            this.globalMargin = {
                height: this.marginRatio * drawing.height,
                width: this.marginRatio * drawing.width
            };

            let borderSize = 3;
            this.manipulator.move(0, drawing.height * 0.075);
            drawing.manipulator.set(1, this.manipulator);
            this.manipulator.add(this.returnButtonManipulator);

            let returnHandler = () => {
                this.returnButton.manipulator.flush();
                Server.getAllFormations().then(data => {
                    let myFormations = JSON.parse(data).myCollection;
                    globalVariables.formationsManager = new FormationsManagerVue(myFormations);
                    globalVariables.formationsManager.display();
                });
                this.returnButton.removeHandler(returnHandler);
            };
            this.manipulator.add(this.returnButtonManipulator);
            this.returnButton.display(0, -MARGIN / 2, 20, 20);
            let returnButtonChevron = this.returnButton.chevronManipulator.ordonator.children[0];
            this.returnButton.height = returnButtonChevron.boundingRect().height;
            returnButtonChevron.mark('returnButtonToFormationsManager');
            this.returnButton.setHandler(returnHandler);

            let dblclickQuizHandler = (event, target) => {
                target = target || drawings.component.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
                let displayQuizManager = () => {
                    this.quizManager.loadQuiz(target);
                    this.quizDisplayed = target;
                    this.quizManager.display();
                    this.selectedArrow = null;
                    this.selectedGame = null;
                };
                this.saveFormation(displayQuizManager);
                //svg.removeSelection();
            };

            let clickQuizHandler = (event, target) => {
                target = target || drawings.component.background.getTarget(event.pageX, event.pageY).parent.parentManip.parentObject;
                drawing.manipulator.unset(1, this.manipulator.add);
                main.currentPageDisplayed = "QuizPreview";
                this.quizDisplayed = new QuizVue(target, false, this);
                this.quizDisplayed.puzzleLines = 3;
                this.quizDisplayed.puzzleRows = 3;
                this.quizDisplayed.run(0, 0, drawing.width, drawing.height);
                //svg.removeSelection();
            };

            let resizePanel = () => {
                var height = (this.levelHeight * (this.levelsTab.length + 1) > this.graphH) ? (this.levelHeight * (this.levelsTab.length + 1)) : this.graphH;
                let spaceOccupiedByAGame = (this.graphElementSize + this.minimalMarginBetweenGraphElements),
                    longestLevel = this.findLongestLevel()[0],
                    trueWidth = longestLevel && longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame,
                    widthMAX = Math.max(this.panel.width, trueWidth);

                if (!longestLevel || !height) return;
                this.panel.resizeContent(widthMAX - 1, height - MARGIN);
            };

            this.movePanelContent = () => {
                let spaceOccupiedByAGame = (this.graphElementSize + this.minimalMarginBetweenGraphElements),
                    longestLevel = this.findLongestLevel()[0],
                    trueWidth = longestLevel ? longestLevel.gamesTab.length * spaceOccupiedByAGame + spaceOccupiedByAGame : 0,
                    widthMAX = Math.max(this.panel.width, trueWidth);
                this.miniaturesManipulator.move((widthMAX - this.panel.width) / 2, 0);
            };

            let displayLevel = (w, h, level) => {
                this.panel.content.add(level.manipulator.first);
                var lineColor = playerMode ? myColors.grey : myColors.black;
                var levelText = playerMode ? "" : "Niveau " + level.index;
                let obj = autoAdjustText(levelText, w - 3 * borderSize, this.levelHeight, 20, "Arial", level.manipulator, 0);
                obj.line = new svg.Line(MARGIN, this.levelHeight, level.parentFormation.levelWidth, this.levelHeight).color(lineColor, 3, lineColor);
                obj.line.component.setAttribute && obj.line.component.setAttribute('stroke-dasharray', '6');

                if (!playerMode) {
                    this.redCrossManipulator;
                    let overLevelHandler = (event) => {
                        let levelIndex = -1;
                        let mouseY;
                        mouseY = this.panel.back.localPoint(event.pageX, event.pageY).y;
                        mouseY -= this.panel.content.y;
                        while (mouseY > -this.panel.content.height / 2) {
                            mouseY -= this.levelHeight;
                            levelIndex++;
                        }
                        this.levelsTab.forEach(levelElement => {
                            levelElement.redCrossManipulator.flush();
                        });
                        let levelObject = this.levelsTab[levelIndex];
                        if (levelIndex >= 0 && levelIndex < this.levelsTab.length) {
                            if (typeof levelObject.redCrossManipulator === 'undefined') {
                                levelObject.redCrossManipulator = new Manipulator(levelObject).addOrdonator(2);
                            }
                            levelObject.manipulator.set(2, levelObject.redCrossManipulator);
                            let redCrossSize = 15;
                            let redCross = this.textToDisplay ? drawRedCross(0, 0, redCrossSize, levelObject.redCrossManipulator)
                                : drawRedCross(60, -60, redCrossSize, levelObject.redCrossManipulator);
                            redCross.mark('levelRedCross');
                            levelObject.redCrossManipulator.move(obj.text.boundingRect().width / 2 + levelObject.x / 2, 15);
                            svg.addEvent(redCross, 'click', levelObject.redCrossClickHandler);
                            levelObject.redCrossManipulator.set(1, redCross);
                        }
                    };
                    let mouseleaveHandler = () => {
                        this.levelsTab.forEach(levelElement => {
                            levelElement.redCrossManipulator.flush();
                        });
                    };

                    svg.addEvent(this.panel.back, 'mouseover', overLevelHandler);
                    svg.addEvent(this.panel.back, 'mouseout', mouseleaveHandler);

                    level.redCrossClickHandler = () => {
                        level.redCrossManipulator.flush();
                        this.levelsTab.splice(level.index - 1, 1);
                        level.manipulator.flush();
                        level.gamesTab.forEach(game => {
                            game.miniatureManipulator.flush();
                            for (let j = this.links.length - 1; j >= 0; j--) {
                                if (this.links[j].childGame === game.id || this.links[j].parentGame === game.id) {
                                    this.links.splice(j, 1);
                                }
                            }
                        });
                        for (let i = level.index - 1; i < this.levelsTab.length; i++) {
                            this.levelsTab[i].index--;
                            this.levelsTab[i].manipulator.flush();
                        }
                        this.displayGraph(this.graphW, this.graphH);
                    };
                }
                level.manipulator.set(1, obj.line);
                obj.text.position(obj.text.boundingRect().width, obj.text.boundingRect().height);
                obj.text._acceptDrop = true;
                level.w = w;
                level.h = h;
                level.y = (level.index - 1) * level.parentFormation.levelHeight;
                level.manipulator.move(0, level.y);
            };

            let displayFrame = (w, h) => {
                let hasKeyDownEvent = (event) => {
                    if (event.keyCode === 46) { // suppr
                        this.selectedArrow && this.selectedArrow.redCrossClickHandler();
                        this.selectedGame && this.selectedGame.redCrossClickHandler();
                    } else if (event.keyCode === 27 && this.library && this.library.arrowMode) { // échap
                        this.library.toggleArrowMode();
                    } else if (event.keyCode === 27 && this.library && this.library.gameSelected) {
                        this.library.gameSelected.border.color(myColors.white, 1, myColors.black);
                        this.library.gameSelected = null;
                    }
                    return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
                };
                drawing.notInTextArea = true;
                svg.addGlobalEvent("keydown", (event) => {
                    if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                        event.preventDefault();
                    }
                });
                this.manipulator.set(1, this.clippingManipulator);
                playerMode ? this.clippingManipulator.move(MARGIN, drawing.height * HEADER_SIZE)
                    : this.clippingManipulator.move(this.libraryWidth, drawing.height * HEADER_SIZE);
                this.graphCreaHeight = drawing.height * this.graphCreaHeightRatio - drawing.height * 0.1;//-15-this.saveButtonHeight;//15: Height Message Error

                if (typeof this.panel !== "undefined") {
                    this.clippingManipulator.remove(this.panel.component);
                }
                this.panel = new gui.Panel(w, h, myColors.white);
                this.panel.back.mark("panelBack");
                this.panel.content.add(this.messageDragDropManipulator.first);
                this.panel.component.move(w / 2, h / 2);
                this.clippingManipulator.add(this.panel.component);
                this.panel.content.add(this.graphManipulator.first);
                this.panel.hHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
                this.panel.vHandle.handle.color(myColors.lightgrey, 3, myColors.grey);
                resizePanel();
                this.movePanelContent();
            };

            let updateAllLinks = () => {
                this.arrowsManipulator.flush();
                var childElement, parentElement;
                this.links.forEach((link) => {
                    this.levelsTab.forEach((level) => {
                        level.gamesTab.forEach((game) => {
                            game.id === link.childGame && (childElement = game);
                            game.id === link.parentGame && (parentElement = game);
                        })
                    });
                    link.arrow = new Arrow(parentElement, childElement);
                });
            };

            let displayMessageDragAndDrop = () => {
                this.messageDragDropMargin = this.graphCreaHeight / 8 - borderSize;
                let messageDragDrop = autoAdjustText("Glisser et déposer un jeu pour ajouter un jeu", this.graphW, this.graphH, 20, null, this.messageDragDropManipulator).text;
                messageDragDrop._acceptDrop = true;
                messageDragDrop.x = this.panel.width / 2;
                messageDragDrop.y = this.messageDragDropMargin + (this.levelsTab.length) * this.levelHeight;
                messageDragDrop.position(messageDragDrop.x, messageDragDrop.y).color(myColors.grey);//.fontStyle("italic");
                this.panel.back._acceptDrop = true;
            };

            this.displayGraph = (w, h) => {
                this.movePanelContent();
                resizePanel();
                if (typeof w !== "undefined") this.graphW = w;
                if (typeof h !== "undefined") this.graphH = h;
                this.messageDragDropMargin = this.graphCreaHeight / 8 - borderSize;
                if (this.levelWidth < this.graphCreaWidth) {
                    this.levelWidth = this.graphCreaWidth;
                }

                let manageMiniature = (tabElement) => {
                    tabElement.miniatureManipulator.move(tabElement.miniaturePosition.x, tabElement.miniaturePosition.y);
                    let conf = {
                        clicked : (what) => {
                            what.parentObject.miniature.miniatureClickHandler();
                        },
                        moved: (what) => {
                            let point = what.component.parent.globalPoint(what.x,what.y);
                            this.dropAction(point.x,point.y, what);
                            return true;
                    }
                    };
                    !playerMode && tabElement.miniatureManipulator.addEvent('dblclick', event => {
                        dblclickQuizHandler(event,tabElement);
                    });
                    playerMode && tabElement.miniatureManipulator.addEvent('click', event => {
                        clickQuizHandler(event,tabElement);
                    });

                    !playerMode && installDnD(tabElement.miniatureManipulator, drawings.component.glass.parent.manipulator.last, conf);
                };

                this.levelsTab.forEach((level) => {
                    displayLevel(this.graphCreaWidth, this.graphCreaHeight, level);
                    this.adjustGamesPositions(level);
                    this.miniaturesManipulator.last.mark("miniaturesManipulatorLast");
                    level.gamesTab.forEach((tabElement) => {
                        tabElement.miniatureManipulator.ordonator || tabElement.miniatureManipulator.addOrdonator(3);
                        this.miniaturesManipulator.add(tabElement.miniatureManipulator);// mettre un manipulateur par niveau !_! attention à bien les enlever
                        if (typeof tabElement.miniature === "undefined") {
                            (tabElement.miniature = tabElement.displayMiniature(this.graphElementSize));
                        }
                        manageMiniature(tabElement);
                    });
                });
                !playerMode && displayMessageDragAndDrop();
                this.graphManipulator.move(this.graphW / 2, this.graphH / 2);
                resizePanel();
                this.panel.back.parent.parentManip = this.graphManipulator;
                updateAllLinks();
            };

            if (playerMode) {
                this.graphCreaHeightRatio = 0.97;
                this.graphCreaHeight = (drawing.height - drawing.height * HEADER_SIZE - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
                this.graphCreaWidth = drawing.width - 2 * MARGIN;
                displayFrame(this.graphCreaWidth, this.graphCreaHeight);
                this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
                this.clippingManipulator.move((drawing.width - this.graphCreaWidth) / 2, this.formationsManager.y / 2 - borderSize);
            } else {
                this.saveButtonHeight = drawing.height * this.saveButtonHeightRatio;
                this.publicationButtonHeight = drawing.height * this.publicationButtonHeightRatio;
                this.graphCreaHeight = (drawing.height - drawing.height * HEADER_SIZE - 40 - this.returnButton.height) * this.graphCreaHeightRatio;//-15-this.saveButtonHeight;//15: Height Message Error
                this.graphCreaWidth = drawing.width * this.graphWidthRatio - MARGIN;
                this.gamesLibraryManipulator = this.library.libraryManipulator;
                this.manipulator.set(4, this.gamesLibraryManipulator);
                this.manipulator.set(0, this.formationInfoManipulator);
                this.libraryWidth = drawing.width * this.libraryWidthRatio;
                this.y = drawing.height * HEADER_SIZE;
                this.titleSvg = new svg.Text("Formation : ").position(MARGIN, this.returnButton.height *1.1).font("Arial", 20).anchor("start");
                this.manipulator.set(2, this.titleSvg);
                let formationWidth = this.titleSvg.boundingRect().width;
                let formationLabel = {};

                let clickEditionFormationLabel = () => {
                    let bounds = formationLabel.border.boundingRect();
                    this.formationInfoManipulator.unset(1);
                    let globalPointCenter = formationLabel.border.globalPoint(-(bounds.width) / 2, -(bounds.height) / 2);
                    var contentareaStyle = {
                        toppx: globalPointCenter.y + 5,
                        leftpx: globalPointCenter.x + 5.2,
                        width: formationLabel.border.width - MARGIN,
                        height: this.labelHeight
                    };
                    drawing.notInTextArea = false;

                    let contentarea = new svg.TextField(contentareaStyle.leftpx, contentareaStyle.toppx, contentareaStyle.width, contentareaStyle.height);
                    contentarea.color(myColors.white, 0, myColors.black)
                        .font("Arial", 15)
                        .mark("formationLabelContentArea")
                        .anchor("start");
                    (this.label === "" || this.label === this.labelDefault) ? contentarea.placeHolder(this.labelDefault) : contentarea.message(this.label);
                    drawings.component.add(contentarea);
                    contentarea.focus();
                    var removeErrorMessage = () => {
                        this.errorMessage && this.formationInfoManipulator.unset(2);
                        formationLabel.border.color(myColors.white, 1, myColors.black);
                    };

                    var displayErrorMessage = () => {
                        removeErrorMessage();
                        formationLabel.border.color(myColors.white, 2, myColors.red);
                        var anchor = 'start';
                        this.errorMessage = new svg.Text(REGEX_ERROR_FORMATION)
                            .position(formationLabel.border.width + formationWidth + 2 * MARGIN, 0)
                            .font("Arial", 15).color(myColors.red).anchor(anchor);
                        this.formationInfoManipulator.set(2, this.errorMessage);
                        contentarea.focus();
                        //contentarea.setCaretPosition(this.label.length);
                        this.invalidLabelInput = REGEX_ERROR_FORMATION;
                    };
                    var onblur = () => {
                        contentarea.enter();
                        this.label = contentarea.messageText.trim();
                        drawings.component.remove(contentarea);
                        drawing.notInTextArea = true;
                        formationLabelDisplay();
                        this.invalidLabelInput || header.display(this.label);
                    };
                    svg.addEvent(contentarea, "blur", onblur);
                    let objectToBeChecked = {
                        textarea: contentarea,
                        border: formationLabel.border,
                        onblur: onblur,
                        remove: removeErrorMessage,
                        display: displayErrorMessage
                    };
                    var oninput = () => {
                        contentarea.enter();
                        this.checkInputTextArea(objectToBeChecked);
                        formationLabelDisplay();
                    };
                    svg.addEvent(contentarea, "input", oninput);
                    this.checkInputTextArea(objectToBeChecked);
                };

                let formationLabelDisplay = () => {
                    let text = this.label ? this.label : this.labelDefault;
                    let color = this.label ? myColors.black : myColors.grey;
                    let bgcolor = myColors.white;
                    this.formationLabelWidth = 300;
                    let textToDisplay;
                    if (text.length > MAX_CHARACTER_TITLE) {
                        textToDisplay = text.substr(0, MAX_CHARACTER_TITLE) + "...";
                    }

                    formationLabel.content = new svg.Text(textToDisplay ? textToDisplay : text).font("Arial", 15).anchor('start');
                    formationLabel.content.mark('formationLabelContent');
                    this.formationInfoManipulator.set(1, formationLabel.content);
                    this.labelHeight = formationLabel.content.boundingRect().height - 4;
                    this.formationTitleWidth = this.titleSvg.boundingRect().width;
                    formationLabel.border = new svg.Rect(this.formationLabelWidth, this.labelHeight + MARGIN);
                    this.invalidLabelInput ? formationLabel.border.color(bgcolor, 2, myColors.red) : formationLabel.border.color(bgcolor, 1, myColors.black);
                    formationLabel.border.position(this.formationTitleWidth + this.formationLabelWidth / 2 + 3 / 2 * MARGIN, -MARGIN);
                    this.formationInfoManipulator.set(0, formationLabel.border);
                    formationLabel.content.position(this.formationTitleWidth + 2 * MARGIN, -5).color(color).anchor("start");
                    this.formationInfoManipulator.move(0, this.returnButton.height * 1.3);

                    let saveNameIcon = new svg.Image('save-file-option.png')
                        .dimension(16, 16)
                        .position(formationLabel.border.width + formationWidth + 3 * MARGIN, -MARGIN + 3);
                    this.formationInfoManipulator.set(2, saveNameIcon);

                    svg.addEvent(formationLabel.content, "dblclick", clickEditionFormationLabel);
                    svg.addEvent(formationLabel.border, "dblclick", clickEditionFormationLabel);
                    svg.addEvent(saveNameIcon, "click", () => this.saveFormation(null, "Edited", true));
                };
                formationLabelDisplay();
                this.library.display(0, drawing.height * HEADER_SIZE, this.libraryWidth - MARGIN, this.graphCreaHeight);

                if (this.status !== "NotPublished") {
                    this.displayFormationSaveButton(drawing.width / 2 - 2 * this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.saveButtonHeight);
                    this.displayFormationPublicationButton(drawing.width / 2, drawing.height * 0.87, this.buttonWidth, this.publicationButtonHeight);
                    this.displayFormationDeactivationButton(drawing.width / 2 + 2 * this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.saveButtonHeight);
                } else {
                    this.displayFormationSaveButton(drawing.width / 2 - this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.saveButtonHeight);
                    this.displayFormationPublicationButton(drawing.width / 2 + this.buttonWidth, drawing.height * 0.87, this.buttonWidth, this.publicationButtonHeight);
                }
                displayFrame(this.graphCreaWidth, this.graphCreaHeight);
                this.displayGraph(this.graphCreaWidth, this.graphCreaHeight);
            }
        }

        /**
         * affiche le bouton pour publier la formation
         * @param x
         * @param y
         * @param w
         * @param h
         */
        displayFormationPublicationButton(x, y, w, h) {
            let label = "Publier";
            let publicationFormationButton = displayText(label, w, h, myColors.black, myColors.white, 20, null, this.publicationFormationButtonManipulator);
            this.errorMessagePublication && this.errorMessagePublication.parent && this.publicationFormationButtonManipulator.remove(this.errorMessagePublication);
            this.publicationFormationQuizManager = () => {
                let message = [];
                let arrayOfUncorrectQuestions = [];
                let allQuizValid = true;
                this.levelsTab.forEach(level => {
                    level.gamesTab.forEach(game => {
                        let checkQuiz = new QuizVue(game, false, this);
                        checkQuiz.isValid = true;
                        checkQuiz.tabQuestions.forEach(question => {
                            if (!(question instanceof AddEmptyElementVue)) {
                                question.questionType && question.questionType.validationTab.forEach(funcEl => {
                                    var result = funcEl && funcEl(question);
                                    if (result && (!result.isValid)) {
                                        message.push("Un ou plusieurs jeu(x) ne sont pas complet(s)");
                                        arrayOfUncorrectQuestions.push(question.questionNum - 1);
                                    }
                                    result && (checkQuiz.isValid = checkQuiz.isValid && result.isValid);
                                });
                            }
                            allQuizValid = allQuizValid && checkQuiz.isValid;
                        });
                        checkQuiz.isValid || game.miniatureManipulator.ordonator.children[0].color(myColors.white, 3, myColors.red);
                    });
                });
                if (!allQuizValid) {
                    this.displayPublicationMessage(message[0]);
                } else {
                    this.saveFormation(null, "Published");
                }
            };
            publicationFormationButton.border.mark("publicationFormationButtonCadre");
            svg.addEvent(publicationFormationButton.border, "click", () => this.publicationFormation());
            svg.addEvent(publicationFormationButton.content, "click", () => this.publicationFormation());
            this.publicationFormationButtonManipulator.move(x, y);
        }

        /**
         * affiche le bouton pour sauvegarder la formation
         * @param x
         * @param y
         * @param w
         * @param h
         */
        displayFormationSaveButton(x, y, w, h) {
            let saveFormationButton = displayText("Enregistrer", w, h, myColors.black, myColors.white, 20, null, this.saveFormationButtonManipulator);
            this.message && this.message.parent && this.saveFormationButtonManipulator.remove(this.message);
            saveFormationButton.border.mark("saveFormationButtonCadre");
            svg.addEvent(saveFormationButton.border, "click", () => this.saveFormation());
            svg.addEvent(saveFormationButton.content, "click", () => this.saveFormation());
            this.saveFormationButtonManipulator.move(x, y);
        }

        /**
         * affiche le bouton pour dépublier une formation
         * @param x
         * @param y
         * @param w
         * @param h
         */
        displayFormationDeactivationButton(x, y, w, h) {
            let deactivateFormationButton = displayText("Désactiver", w, h, myColors.black, myColors.white, 20, null, this.deactivateFormationButtonManipulator);
            svg.addEvent(deactivateFormationButton.border, "click", () => this.deactivateFormation());
            svg.addEvent(deactivateFormationButton.content, "click", () => this.deactivateFormation());
            this.deactivateFormationButtonManipulator.move(x, y);
        }

        /**
         * suppression du message d'erreur
         * @param message
         */
        removeErrorMessage(message) {
            message && message.parent && message.parent.remove(message);
        }

        /**
         * fonction appelée lorsqu'une bulle est lachée sur le graphe de formation (ajout ou déplacement d'un quiz)
         * @param event - evenement js
         * @param game - quiz associé au drop
         */
        dropAction(x, y, item) {
            let game;
            if (item && item.parentObject) {
                game = item.parentObject;
            }
            else{
                game = null;
            }
            let getDropLocation = (x,y) => {
                let dropLocation = this.panel.content.localPoint(x,y);
                return dropLocation;
            };
            let getLevel = (dropLocation) => {
                let level = -1;
                level = Math.floor(dropLocation.y/this.levelHeight);
                if (level >= this.levelsTab.length) {
                    level = this.levelsTab.length;
                    this.addNewLevel(level);
                }
                return level;
            };
            let getColumn = (dropLocation, level) => {
                let column = this.levelsTab[level].gamesTab.length;
                for (let i = 0; i < this.levelsTab[level].gamesTab.length; i++) {
                    let globalPointGameInLevel = this.graphManipulator.component.globalPoint(this.levelsTab[level].gamesTab[i].miniaturePosition);
                    let localPointGameInLevel = this.panel.content.localPoint(globalPointGameInLevel);
                    if (dropLocation.x < localPointGameInLevel.x) {
                        column = i;
                        break;
                    }
                }
                return column;
            };

            let dropLocation = getDropLocation(x,y);
            let level = getLevel(dropLocation);
            let column = getColumn(dropLocation, level);
            if (game && !item.addNew) {
                this.moveGame(game, level, column);
                game.levelIndex === level || game.miniature.removeAllLinks();
            } else {
                this.addNewGame(level, column)
            }
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
                        globalVariables.formationsManager = new FormationsManagerVue(myFormations);
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
                    globalVariables.formationsManager = new FormationsManagerVue(myFormations);
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
                    globalVariables.formationsManager = new FormationsManagerVue(myFormations);
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
                    game.tabQuestions && gamesTab.push(new QuizVue(game, false, this));
                    game.tabQuestions || gamesTab.push(new BdVue(game, this));
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

    let {FormationsManagerVue} = FFormationsManager(globalVariables, Vue, FormationVue);

    let {InscriptionManagerVue, ConnexionManagerVue} = FUser(globalVariables, Vue, HeaderVue, FormationsManagerVue);


    /**
     * affichage GUI pour l'admin
     */
    var adminGUI = function () {
        globalVariables.playerMode = false;
        util.setGlobalVariables();
        playerMode = false;

        header = new HeaderVue();
        globalVariables.header = header;
    };

    /**
     * affichage GUI pour l'utilisateur
     */
    var learningGUI = function () {
        globalVariables.playerMode = true;
        util.setGlobalVariables();
        playerMode = true;

        header = new HeaderVue();
        globalVariables.header = header;
    };

    return {
        setGlobalVariables,
        FormationsManagerVue,
        ConnexionManagerVue,
        InscriptionManagerVue,
        AddEmptyElementVue,
        AnswerVue,
        QuizVue,
        BdVue,
        adminGUI,
        learningGUI
    }
};