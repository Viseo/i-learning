/**
 *
    LibraryVue,
    GamesLibraryVue,
    ImagesLibraryVue
 *
 */
exports.Library = function(globalVariables, classContainer){

    let Vue = classContainer.getClass("Vue");

    let
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        imageController = globalVariables.imageController,
        Manipulator = globalVariables.util.Manipulator,
        Server = globalVariables.util.Server,
        Picture = globalVariables.util.Picture,
        installDnD = globalVariables.gui.installDnD;

    /**
     * classe générique représentant une collection d'objets
     * @class
     */
    class LibraryVue extends Vue {
        constructor(options){
            super(options);
            this.manipulator = new Manipulator(this).addOrdonator(4);
            this.itemsTab = [];
            this.libraryManipulators = [];
        }

        libraryDisplay(x, y, w, h, ratioPanelHeight, yPanel) {
            this.manipulator.flush();
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            let borderSize = 3;

            this.border = new svg.Rect(w - borderSize, h, this.manipulator)
                .color(myColors.white, borderSize, myColors.black)
                .position(w / 2, h / 2);
            this.manipulator.set(0, this.border);
            this.manipulator.move(this.x, this.y);

            this.panel = new gui.Panel(w - 4, ratioPanelHeight * h, myColors.white).position(w / 2 + 0.5, yPanel);
            this.panel.border.color([], 3, [0, 0, 0]);
            this.manipulator.set(2, this.panel.component);
            this.panel.vHandle.handle.color(myColors.lightgrey, 2, myColors.grey);
            this.panel.hHandle.handle.color(myColors.none, 0, myColors.none);
            drawing.notInTextArea = true;
            svg.addGlobalEvent("keydown", (event) => {
                if (drawing.notInTextArea && hasKeyDownEvent(event)) {
                    event.preventDefault();
                }
            });
            let hasKeyDownEvent = (event) => {
                return this.panel && this.panel.processKeys && this.panel.processKeys(event.keyCode);
            };
        }
    }

    /**
     * Collection de jeux disponibles
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

        events(){
            return {
                'keydown' : this.keyDownHandler
            }
        }

        keyDownHandler(event){
            if(event.keyCode === 27) { //ESC
                hasKeyDownEvent(event);
                this.arrowMode && this.toggleArrowMode();
                if (this.miniatureSelected) {
                    this.miniatureSelected.mark('');
                    this.miniatureSelected = null;
                }
            }
            event.preventDefault();
        }

        render(x, y, w, h) {
            this.libraryDisplay.call(this, x + MARGIN, y, w, h, 0.9, 0.9 * h / 2);

            this.panel.hHandle.handle.color(myColors.none, 3, myColors.none);
            this.panel.vHandle.handle.color(myColors.none, 3, myColors.none);
            let displayArrowModeButton = () => {
                this.manipulator.remove(this.arrowModeManipulator);
                this.manipulator.add(this.arrowModeManipulator);
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
                                        (classContainer.isInstanceOf('QuizVue', e.parent.parentManip.parentObject) ||
                                        classContainer.isInstanceOf('BdVue', e.parent.parentManip.parentObject));
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
                    obj.border.clicked = false;
                    obj.border.mark('miniInLibrary' + label + 'Border');
                    this.itemsTab[i].miniature = obj;
                    let X = x + libMargin - 2 * MARGIN + ((i % maxGamesPerLine + 1) * (libMargin + w / 2 - 2 * MARGIN));
                    this.libraryManipulators[i].move(X, tempY).mark("miniInLibrary" + label);
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
                                    if (classContainer.isInstanceOf("FormationVue", parentObject)) {
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
                                            this.miniatureSelected.miniature.content.mark('miniatureSelected');
                                        }
                                    }
                                    //this.formation && this.gameSelected.border.color(myColors.white, 3, myColors.darkBlue);
                                    let clickPanelToAdd = (event) => {
                                        if (this.gameSelected && this.formation) {
                                            this.formation.dropAction(event.pageX, event.pageY, this.gameSelected.manipulator);
                                            this.miniatureSelected.miniature.border.color(myColors.white, 1, myColors.black);
                                            this.miniatureSelected = null;
                                            this.gameSelected = null;
                                        }
                                        svg.removeEvent(this.formation.panel.back, 'click');
                                    }
                                    this.draggedObject.manipulator.mark('');
                                    this.draggedObject = null;
                                    svg.addEvent(this.formation.panel.back, 'click', clickPanelToAdd);
                                }
                                else{
                                    for (let it in this.itemsTab) {
                                        if (this.itemsTab[it].label == this.draggedObject.label) {
                                            this.miniatureSelected = null;
                                            this.itemsTab[it].miniature.border.color(myColors.white, 1, myColors.black);
                                            this.itemsTab[it].miniature.border.mark('miniInLibrary' + this.itemsTab[it].label + 'Border');
                                            this.itemsTab[it].miniature.content.mark('miniInLibrary' + this.itemsTab[it].label + 'Content');
                                        }
                                    }
                                    this.gameSelected = null;
                                    this.draggedObject.manipulator.mark('');
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
                            this.draggedObject.create = this.itemsTab[i].create;
                            manipulator.set(0, this.draggedObject.border);
                            installDnD(this.draggedObject.manipulator, drawings.component.glass.parent.manipulator.last, conf);
                            svg.event(drawings.component.glass, "mousedown", event);
                            svg.event(this.draggedObject.border, 'mousedown', event);
                            svg.event(this.draggedObject.content, "mousedown", event);
                            this.draggedObject.manipulator.mark("draggedGameCadre");
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
     * Collection d'images
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
                    this.manipulator.add(this.addButtonManipulator);
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
                        this.manipulator.set(2, imagesPanel.component);
                    });
                    tabManager.addTab("Vidéos", 1, () => {
                        this.manipulator.set(2, videosPanel.component);
                        loadVideos();
                    });
                    tabManager.manipulator.move(w / 4 + MARGIN, h * 0.05);
                    tabManager.select(this.selectedTab);
                    this.manipulator.set(1, tabManager.manipulator);
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
            let parentObject = target.parent.parentManip.parentObject;
            if (target && target._acceptDrop) {
                if (classContainer.isInstanceOf('PopInVue', parentObject)) {
                    let popIn = parentObject;
                    popIn.image = element.src;
                    popIn.video = null;
                    popIn.miniature && popIn.miniature.video && popIn.miniature.video.redCrossManipulator
                        && popIn.miniature.video.redCrossManipulator.flush();
                    let questionCreator = popIn.answer.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator;
                    popIn.display(questionCreator, questionCreator.coordinatesAnswers.x,
                        questionCreator.coordinatesAnswers.y, questionCreator.coordinatesAnswers.w,
                        questionCreator.coordinatesAnswers.h);
                }
                else {
                    let newElement = displayImage(element.src, element, target.width, target.height);
                    newElement.image._acceptDrop = true;
                    newElement.image.name = element.name;
                    switch (true) {
                        case classContainer.isInstanceOf("QuestionCreatorVue", parentObject):
                            drawings.component.clean();
                            let questionCreator = parentObject;
                            questionCreator.linkedQuestion.video = null;
                            questionCreator.linkedQuestion.image = newElement.image;
                            questionCreator.linkedQuestion.imageSrc = newElement.image.src;
                            questionCreator.parent.displayQuestionsPuzzle(null, null, null, null, questionCreator.parent.questionPuzzle.startPosition);
                            questionCreator.display();
                            questionCreator.linkedQuestion.checkValidity();
                            break;
                        case classContainer.isInstanceOf("AnswerVueAdmin", parentObject):
                            let answer = parentObject;
                            answer.model.video = null;
                            answer.obj.video && drawings.component.remove(answer.obj.video);
                            answer.model.image = newElement.image;
                            answer.model.imageSrc = newElement.image.src;
                            answer.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.elementsArray.forEach(element => {
                                element.obj && element.obj.video && drawings.component.remove(element.obj.video);
                            });
                            answer.model.parentQuestion.parentQuiz.parentFormation.quizManager.questionCreator.puzzle.display(undefined, undefined, undefined, undefined, false);
                            answer.model.parentQuestion.checkValidity();
                            break;
                    }
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
                if (classContainer.isInstanceOf("PopInVue", target.parent.parentManip.parentObject)) {
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
                        case classContainer.isInstanceOf('QuestionCreatorVue', target.parent.parentManip.parentObject):
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
                        case classContainer.isInstanceOf('Answer', target.parent.parentManip.parentObject):
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

    return {
        LibraryVue,
        GamesLibraryVue,
        ImagesLibraryVue
    }
}