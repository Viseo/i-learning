exports.FormationAdminV = function (globalVariables) {
    const
        Manipulator = globalVariables.Handlers.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        IconCreator = globalVariables.Icons.IconCreator,
        popUp = globalVariables.popUp,
        installDnD = globalVariables.gui.installDnD,
        Helpers = globalVariables.Helpers,
        View = globalVariables.View;
    
    const
        LEVEL_HEIGHT = 150,
        MINIATURE_SIZE = {w:200, h:75},
        PLUS_SIZE = {w: 40, h: 30},
        BUTTON_SIZE = {w: 150, h: 50},
        INPUT_SIZE = {w: 350, h: 30},
        IMAGES_PER_LINE = 3,
        MINIATURE_FONT_SIZE = 18,
        HEADER_SIZE = {w:drawing.width, h:150},
        IMAGE_MINIATURE = 50;


    class FormationAdminV extends View {
        constructor(presenter) {
            super(presenter);
            this.label = this.getLabel();
            this.arrowMode = false;
            this.mapGameAndGui = {};
        }


        display() {
            this.librarySize = {
                width: INPUT_SIZE.w,
                height: Math.max(drawing.height - this.header.height - HEADER_SIZE.h, 500)
            };
            this.graphSize = {
                width: Math.max(drawing.width - INPUT_SIZE.w, 2*this.librarySize.width),
                height: this.librarySize.height
            };
            let _initManips = () => {
                this.headerManipulator = new Manipulator(this);
                this.headerManipulator.move(drawing.width/2, this.header.height + HEADER_SIZE.h/2);
                this.manipulator.add(this.headerManipulator);
            }
            let _createNameFieldFormation = () => {
                var _renameWhenEnter = (event) => {
                    if(event.keyCode === 13){
                        this.renameFormation();
                        nameFieldFormation.hideControl();
                    }
                }
                let header = new svg.Rect(drawing.width, HEADER_SIZE.h).color([0, 57, 114], 0, []);
                this.headerManipulator.add(header);
                let nameFieldFormation = new gui.TextField(-drawing.width/2 + 2*INPUT_SIZE.w + 2*MARGIN, 0, 2*INPUT_SIZE.w, 1.5*INPUT_SIZE.h, this.label)
                nameFieldFormation.font(FONT, 36);
                nameFieldFormation.editColor([[0, 47, 104], 0, myColors.none])
                nameFieldFormation.text.position(-nameFieldFormation.width / 2 + MARGIN, 7.5);
                nameFieldFormation.control.placeHolder('Titre de la formation');
                nameFieldFormation.control.fontColor(myColors.white)
                nameFieldFormation.onInput((oldMessage, message, valid) => {
                    if(message.length > 50){
                        nameFieldFormation.message(oldMessage);
                    }else if (!message || !oldMessage) {
                        nameFieldFormation.text.message('Titre de la formation');
                    }
                });
                nameFieldFormation.onBlur(()=>{
                    nameFieldFormation.text.position(-nameFieldFormation.width / 2 + MARGIN, 7.5);
                })
                nameFieldFormation.color([[20, 77, 134], 1, myColors.none]);
                nameFieldFormation.text.color(myColors.white);
                nameFieldFormation.mark('formationTitle');
                let saveManip = new Manipulator(this);
                let saveIcon = new svg.Image('../../images/saveWhite.png');
                saveIcon
                    .dimension(30, 30)
                    .mark('saveNameButton');
                let saveText = new svg.Text('Modifier le titre')
                    .font(FONT, 18)
                    .color(myColors.white)
                    .anchor('end')
                    .position (-30,6);
                let saveBorder = new svg.Rect(200, 75)
                    .color([0, 57, 114], 1, myColors.white)
                    .position(-67, 0)
                    .corners(3,3);
                saveManip.add(saveBorder).add(saveIcon).add(saveText);
                saveManip.addEvent('click',()=>{this.renameFormation()})
                this.headerManipulator.add(saveManip);
                saveManip.move(drawing.width/2 - 6*MARGIN, 0);
                svg.addEvent(saveIcon, 'click', this.renameFormation.bind(this))
                this.headerManipulator.add(nameFieldFormation.component);
                svg.addGlobalEvent('keydown', _renameWhenEnter);
                this.nameFormationField = nameFieldFormation;
            }
            let _createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(INPUT_SIZE.w, HEADER_SIZE.h, [[98, 221, 204], 1, myColors.none], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.text.font(FONT, 20).position(0, 6.6).color(myColors.white);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width/2 - drawing.width/2, 0);
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.white);
                chevron.position(-130, 0);
                this.returnButtonManipulator.add(chevron).mark('return');
                this.returnButtonManipulator.addEvent('click', this.returnToOldPage.bind(this));
                this.headerManipulator.add(this.returnButtonManipulator);
            }
            let createGraphPanel = () => {
                this.graphPanel = new gui.Panel(this.graphSize.width, this.graphSize.height, myColors.lightgrey);
                this.graphPanel.setScroll();
                this.graphManipulator = new Manipulator(this).addOrdonator(3);
                this.graphManipulator.set(0, this.graphPanel.component);
                this.manipulator.add(this.graphManipulator);
                this.graphManipulator.move(this.librarySize.width + this.graphSize.width / 2,
                    this.header.height + HEADER_SIZE.h + this.graphSize.height/2);
                this.graphPanel.border.color(myColors.none, 1, myColors.none);


                this.graphMiniatureManipulator = new Manipulator(this).addOrdonator(2);
                this.graphPanel.content.add(this.graphMiniatureManipulator.first);
                this.graphMiniatureManipulator.move(this.graphSize.width / 2, this.graphSize.height / 2);
                let background = drawings.component.background;
                svg.addEvent(background, 'mouseup', () => {
                    this.unselectMiniature();
                    if (this.selectedArrowRedCross) {
                        this.arrowsManipulator.remove(this.selectedArrowRedCross);
                        this.selectedArrowRedCross = null;
                    }
                });
            }

            super.display();
            this.displayHeader(this.label);
            _initManips();
            _createNameFieldFormation();
            _createReturnButton();
            createGraphPanel();
            this.displayLibrary();
            this.displayGraph();
        }

        displayLibrary() {
            let conf = {
                drop: (what, whatParent, x, y) => {
                    this.dropAction(what.x, what.y, what);
                    return {x: what.x, y: what.y, parent: what.component.parent};
                },
                moved: (what) => {
                    this.draggedObject = null;
                    what.flush();
                    return true;
                }
            };
            let createGameLibrary = () => {
                this.gamePanel = new gui.Panel(this.librarySize.width, this.librarySize.height);
                this.gamePanel.border.color(myColors.none, 1, myColors.none);
                this.gameLibraryManipulator = new Manipulator(this).addOrdonator(3);
                this.gameLibraryManipulator.set(0, this.gamePanel.component);
                this.gameLibraryManipulator.move(INPUT_SIZE.w / 2, HEADER_SIZE.h + this.header.height + this.gamePanel.height/2);
                this.manipulator.add(this.gameLibraryManipulator);
                this.titleLibrary = new svg.Text('Jeux').color(myColors.black).font(FONT, 25);
                this.titleLibrary.position(0,-this.gamePanel.height/2 + 3*MARGIN);
                this.gameLibraryManipulator.set(2, this.titleLibrary);
                let createArrowMode = () => {
                    let arrowRect = {
                        border: new svg.Line(-this.librarySize.width / 2, 0, this.librarySize.width / 2, 1).color(myColors.grey, 1, myColors.grey),
                        title: new svg.Text('Dépendances : ').font(FONT, 20).color(myColors.grey).position(0, 6.6),
                        backTitle: new svg.Rect(150, 3).color(myColors.white, 0, myColors.none).position(0, 0),
                        manipulator: new Manipulator(this)
                    }
                    arrowRect.manipulator.add(arrowRect.border)
                        .add(arrowRect.backTitle)
                        .add(arrowRect.title);
                    arrowRect.manipulator.move(0, this.librarySize.height * 0.7 / 2)
                    this.gameLibraryManipulator.add(arrowRect.manipulator);
                    let arrowStraight = this.drawStraightArrow(-0.3 * this.librarySize.width, 0, 0.3 * this.librarySize.width, 0);
                    let arrowManip = new Manipulator(this).mark('toggleArrowManip')
                    this.gameLibraryManipulator.add(arrowManip);
                    let arrowBorder = new svg.Rect(0.8 * this.librarySize.width, 50)
                        .color(myColors.white, 1, myColors.grey)
                        .corners(10, 10);
                    arrowManip.add(arrowBorder).add(arrowStraight);
                    arrowManip.move(0, this.librarySize.height * 0.85 / 2);
                    arrowManip.addEvent('click', ()=>{this.toggleArrowMode(arrowBorder)});
                }
                createArrowMode();
            }

            createGameLibrary();
            this.getGamesLibrary().list.forEach((game, count) => {
                let createMiniature = () => {
                    let miniature = {
                        border: new svg.Rect(MINIATURE_SIZE.w, MINIATURE_SIZE.h).color(myColors.white, 1, [0, 155, 220]).corners(10, 10),
                        content: new svg.Text(game.type).font(FONT, MINIATURE_FONT_SIZE),
                        manipulator: new Manipulator(this).mark(game.type + "LibManip")
                    };
                    return miniature
                };

                let miniature = createMiniature();
                miniature.manipulator.move(0, (6 * MARGIN + MINIATURE_SIZE.h / 2) + count * (MINIATURE_SIZE.h + 2 * MARGIN) - this.librarySize.height / 2);
                miniature.manipulator.add(miniature.border).add(miniature.content);
                this.gameLibraryManipulator.add(miniature.manipulator);
                let createDraggableCopy = event => {
                    let manipulator = new Manipulator(this).addOrdonator(2);
                    drawings.piste.add(manipulator);
                    let point = miniature.border.globalPoint(0, 0);
                    manipulator.move(point.x, point.y);
                    this.draggedObject = createMiniature();
                    this.draggedObject.manipulator = manipulator;
                    manipulator.game = game;
                    manipulator.set(0, this.draggedObject.border);
                    manipulator.set(1, this.draggedObject.content);
                    installDnD(this.draggedObject.manipulator, drawings.component.glass.parent.manipulator.last, conf);
                    svg.event(drawings.component.glass, "mousedown", event);
                    svg.event(this.draggedObject.border, 'mousedown', event);
                    svg.event(this.draggedObject.content, "mousedown", event);
                    this.draggedObject.manipulator.mark("draggedGameCadre");
                };
                miniature.manipulator.addEvent('mousedown', createDraggableCopy);
            })
        }

        displayGraph() {

            this.graphMiniatureManipulator.flush();
            let createButtons = () => {
                this.buttonsManipulator = new Manipulator(this);
                this.saveButton = new gui.Button(BUTTON_SIZE.w, BUTTON_SIZE.h, [myColors.white, 1, myColors.grey], 'Enregistrer');
                this.saveButton.glass.mark('saveFormation');
                this.saveButton.position(0.4 * this.graphPanel.width, 0);
                this.saveButton.back.corners(5, 5);
                this.saveButton.onClick(this.saveFormation.bind(this));
                this.buttonsManipulator.add(this.saveButton.component);
                this.manipulator.add(this.buttonsManipulator);
                this.buttonsManipulator.move(this.gamePanel.width + MARGIN * 2,
                    BUTTON_SIZE.h / 2 + this.graphPanel.height + this.header.height + 7 * MARGIN);
                this.publishButton = new gui.Button(BUTTON_SIZE.w, BUTTON_SIZE.h, [myColors.white, 1, myColors.grey], 'Publier');
                this.publishButton.glass.mark('publishFormation');
                this.publishButton.position(0.4 * this.graphPanel.width + 1.5*BUTTON_SIZE.w, 0);
                this.publishButton.back.corners(5, 5);
                this.publishButton.onClick(this.publishFormation.bind(this));
                this.buttonsManipulator.add(this.publishButton.component);
                this.manipulator.add(this.buttonsManipulator);
            }
            createButtons();
            let formation = this.getFormation();
            formation.levelsTab.forEach(level => {
                this.displayLevel(level);
            });
            this.updateAllLinks();
        }

        displayPopUpImage(miniature){
            let _initManip = () => {
                this.mediasManipulator = new Manipulator(this);
                this.manipulator.add(this.mediasManipulator);
            }
            let _hideMediaPopup = () => {
                this.manipulator.remove(this.mediasManipulator);
            };
            let _displayRedCross = () => {
                let redCross = IconCreator.createRedCrossIcon(this.mediasManipulator).position(dimensions.width / 2, -dimensions.height / 2);
                redCross.addEvent('click', _hideMediaPopup)
            }
            let _createOnePicture = (src, imageWidth, index, pictureClickHandler) => {
                let indexX = Math.floor(index % IMAGES_PER_LINE);
                let indexY = Math.floor(index / IMAGES_PER_LINE);
                let picture = new svg.Image(src);
                picture
                    .dimension(imageWidth, imageWidth)
                    .position(indexX * (imageWidth + MARGIN), indexY * (imageWidth + MARGIN))
                    .mark('image' + indexX + '-' + indexY);
                this.imagesManipulator.add(picture);
                svg.addEvent(picture, 'click', () => {
                    pictureClickHandler(picture);
                    _hideMediaPopup();
                });

            };

            let pictureClickHandler = (picture) => {
                this.setImageOnMiniature(miniature, picture.src);
            };

            let _displayPictures = () => {
                let imageWidth = (dimensions.width - 2 * MARGIN) / IMAGES_PER_LINE - (IMAGES_PER_LINE - 1) / IMAGES_PER_LINE * MARGIN * 2;
                this.imagesManipulator = new Manipulator(this);

                mediaPanel.content.add(this.imagesManipulator.first);
                this.imagesManipulator.move(imageWidth / 2 + MARGIN, imageWidth / 2 + MARGIN);
                this.getImages().then((images) => {
                    images.images.forEach((image, index) => {
                        _createOnePicture(image.imgSrc, imageWidth, index, pictureClickHandler);
                    })
                });
            };

            
            let _displayFileExplorerWhenClick = () => {
                let onChangeFileExplorerHandler = () => {
                    for (let file of fileExplorer.getFilesSelected()) {
                        this.presenter.uploadImage(file).then((data) => {
                            let imageWidth = (dimensions.width - 2 * MARGIN) / IMAGES_PER_LINE - (IMAGES_PER_LINE - 1) / IMAGES_PER_LINE * MARGIN * 2;
                            _createOnePicture(data.src, imageWidth, this.imagesManipulator.components.length, pictureClickHandler);
                        });
                    }
                };

                let fileExplorer = new Helpers.FileExplorer(this.width, this.height, true);
                fileExplorer.acceptImages()
                    .handlerOnValide(onChangeFileExplorerHandler);
                addPictureButton.onClick(fileExplorer.display);
            };

            let dimensions = {
                width: drawing.width * 1 / 2 - MARGIN,
                height: drawing.height * 0.7 - (2 * MARGIN + PLUS_SIZE.h)
            };

            _initManip();
            let borderLibrary = new svg.Rect(dimensions.width, dimensions.height);
            borderLibrary.color(myColors.white, 1, myColors.grey).corners(5, 5);
            let mediaPanel = new gui.Panel(dimensions.width - 2 * MARGIN, dimensions.height - PLUS_SIZE.h - 4 * MARGIN);
            mediaPanel.position(0, (borderLibrary.height - mediaPanel.height) / 2 - 2 * MARGIN - PLUS_SIZE.h);
            mediaPanel.border.color(myColors.none, 1, myColors.grey);

            let titleLibrary = new svg.Text('Library :').color(myColors.grey).font(FONT, 25);
            let titleLibraryBack = new svg.Rect(100, 3).color(myColors.white);
            titleLibraryBack.position(-borderLibrary.width / 2 + 2 * MARGIN + titleLibraryBack.width / 2,
                -borderLibrary.height / 2 + 2 * MARGIN);
            titleLibrary.position(-borderLibrary.width / 2 + 2 * MARGIN + titleLibraryBack.width / 2, -borderLibrary.height / 2 + 2 * MARGIN + 8.33);
            let addPictureButton = new gui.Button(3 * PLUS_SIZE.w, PLUS_SIZE.h, [myColors.customBlue, 0, myColors.none], 'Ajouter une image')
                .position(borderLibrary.width / 2 - PLUS_SIZE.w * 3 / 2 - 2 * MARGIN, borderLibrary.height / 2 - PLUS_SIZE.h / 2 - MARGIN);
            addPictureButton.text.font(FONT, 13, 12).color(myColors.white).position(0, 4.33);
            addPictureButton.glass.mark('addPictureButtonGlass');
            this.mediasManipulator.add(borderLibrary)
                .add(mediaPanel.component)
                .add(titleLibraryBack)
                .add(titleLibrary)
                .add(addPictureButton.component);

            _displayRedCross();
            _displayPictures();
            _displayFileExplorerWhenClick();
            this.mediasManipulator.move(drawing.width / 2, drawing.height / 2);
        }

        displayLevel(level) {
            let miniatureSelection = (miniature) => {
                if (!this.arrowMode && this.selectedMiniature && this.selectedMiniature.miniature != miniature){
                    this.unselectMiniature()
                }
                if (!this.arrowMode && !this.selectedMiniature) {
                    miniature.border.color(myColors.white, 2, myColors.darkBlue);
                    let trash = new svg.Image('../../images/trash.png').dimension(25,25).position(MINIATURE_SIZE.w/2 + 20, 0);
                    svg.addEvent(trash, 'click', ()=>{
                        this.removeGame(miniature.manipulator.game);
                    })
                    miniature.manipulator.set(3, trash);
                    miniature.manipulator.set(2, miniature.iconImage.manipulator);
                    let index = miniature.manipulator.game.gameIndex;
                    for (let i = index + 1; i < levelMinaturesManipulators.length; i++) {
                        let tmp = levelMinaturesManipulators[i];
                        tmp.move(tmp.x + 100, tmp.y);
                    }
                    this.updateAllLinks();
                    let reset = ()=>{
                        for (let i = index + 1; i < levelMinaturesManipulators.length; i++) {
                            let tmp = levelMinaturesManipulators[i];
                            tmp.move(tmp.x - 100, tmp.y);
                        }
                        this.updateAllLinks();
                    };
                    this.selectedMiniature = {miniature:miniature, resetFunct: reset};
                }
            }
            let createGameMiniature = (game) => {
                let miniature = {
                    border: new svg.Rect(MINIATURE_SIZE.w, MINIATURE_SIZE.h).corners(10, 10).color(myColors.lightgrey, 1,[0, 155, 220]),
                    content: new svg.Text(game.label).font(FONT, 15).anchor('left').position(-MINIATURE_SIZE.w/2 + MARGIN, 5),
                    manipulator: new Manipulator(this).addOrdonator(4).mark('miniatureGameManip' + game.id),
                }
                let iconAddImage = IconCreator.createAddImage(miniature.manipulator, 2);
                iconAddImage.position(MINIATURE_SIZE.w / 2 + 6 * MARGIN, 0);
                iconAddImage.manipulator.mark("popUpImg" + game.id);
                iconAddImage.addEvent('click', () => {
                    this.displayPopUpImage(miniature)
                });
                miniature.manipulator.unset(2);
                miniature.iconImage = iconAddImage;


                if (game.imageSrc) {
                    miniature.picture = new svg.Image(game.imageSrc);
                    miniature.picture.dimension(IMAGE_MINIATURE, IMAGE_MINIATURE);
                    miniature.picture.position(MINIATURE_SIZE.w / 2 - IMAGE_MINIATURE / 2 - 2*MARGIN, 0);
                    miniature.manipulator.add(miniature.picture);
                }
                // miniature.redCrossManipulator = new Manipulator(this).addOrdonator(1);
                // miniature.redCrossManipulator.move(MINIATURE_SIZE.w/ 2, -MINIATURE_SIZE.h / 2);
                // IconCreator.createRedCrossIcon(miniature.redCrossManipulator, 0);
                // miniature.redCrossManipulator.addEvent('click', () => {
                //     this.removeGame(miniature.manipulator.game);
                // });
                miniature.manipulator.game = game;
                miniature.manipulator.miniatureGame = miniature;
                miniature.conf = {
                    drag: (what, x, y) => {
                        if (this.arrowMode) {
                            if (what.component.parent == drawings.component.glass.parent.manipulator.last) {
                                this.currentParent = what.game;
                                return what.lastParent.localPoint(what.x, what.y);
                            }
                            else {
                                this.currentParent = what.game;
                                what.lastParent = what.component.parent;
                                return {x: x, y: y};
                            }
                        }
                        else {
                            this.updateAllLinks();
                            return {x: x, y: y};
                        }
                    },

                    drop: (what, whatParent, finalX, finalY) => {
                        if (this.arrowMode) {
                            let point = whatParent.globalPoint(finalX, finalY);
                            let target = this.graphManipulator.last.getTarget(point.x, point.y);
                            if (target && !target.notTarget && target.parentManip) {
                                if (what.miniatureGame != target.parentManip.miniatureGame) {
                                    let child = target.parentManip.game;
                                    this.createLink(this.currentParent, child);
                                }
                            }
                            let {x: X, y: Y} = miniature.conf.drag(what, finalX, finalY);
                            return {x: X, y: Y, parent: whatParent};
                        }
                        else {
                            let {x: X, y: Y} = miniature.conf.drag(what, finalX, finalY);
                            return {x: X, y: Y, parent: whatParent};
                        }
                    },
                    clicked: (what) => {
                        miniatureSelection(what.miniatureGame);
                    },
                    moved: (what) => {
                        let point = what.component.parent.globalPoint(what.x, what.y);
                        this.dropAction(point.x, point.y, game);
                        this.displayGraph();
                        return true;
                    }
                };

                miniature.manipulator.addEvent('dblclick', ()=>{
                    this.enterGame(miniature)
                });

                installDnD(miniature.manipulator, drawings.component.glass.parent.manipulator.last, miniature.conf);
                return miniature;
            };
            let levelManipulator = new Manipulator(this).addOrdonator(4);
            let levelIndex = level.index;

            let levelMiniature = {
                text: new svg.Text('Level : ' + (levelIndex + 1)).font(FONT, MINIATURE_FONT_SIZE)
                    .anchor('left')
                    .color([0, 155, 220])
                    .position(MARGIN, MINIATURE_FONT_SIZE/3),
                trash: new svg.Image('../../images/trash.png').dimension(25,25).position(100,0)
            }
            svg.addEvent(levelMiniature.trash, 'click', ()=>{this.removeLevel(level)});
            levelMiniature.trash.mark('trashLevel'+levelIndex)
            this.graphMiniatureManipulator.add(levelManipulator);
            levelManipulator.move(-this.graphSize.width / 2 + MARGIN, (levelIndex) * LEVEL_HEIGHT - this.graphSize.height / 2 + LEVEL_HEIGHT / 2);

            levelManipulator.set(0, levelMiniature.trash)
                .set(1, levelMiniature.text)
            let levelMinaturesManipulators = [];
            level.getGamesTab().forEach(game => {
                let gameMiniature = createGameMiniature(game);
                this.mapGameAndGui[game.id] = gameMiniature;
                gameMiniature.manipulator.set(0, gameMiniature.border)
                    .set(1, gameMiniature.content);
                levelManipulator.add(gameMiniature.manipulator);
                levelMinaturesManipulators.push(gameMiniature.manipulator);
                resizeStringForText(gameMiniature.content,MINIATURE_SIZE.w*2/3,MINIATURE_SIZE.h);
                gameMiniature.manipulator.move(160 + game.gameIndex * (MINIATURE_SIZE.w + MARGIN) + MINIATURE_SIZE.w / 2, 5);
            });


        }

        updateAllLinks() {
            this.arrowsManipulator = new Manipulator(this);
            this.graphMiniatureManipulator.set(1, this.arrowsManipulator);
            let links = this.getLinks();
            links.forEach(link => {
                if (!link.parentGame.manipulator || !link.childGame.manipulator) {
                    link.parentGame = this.getGameById(link.parentGame.id);
                    link.childGame = this.getGameById(link.childGame.id);
                }
                this.arrow(link.parentGame, link.childGame)
            })
        }

        arrow(parent, child) {
            var _onClickArrow = () => {
                this.arrowsManipulator.add(redCrossManipulator);
                this.selectedArrowRedCross = redCrossManipulator;
                this.unselectMiniature();
            };

            var _onClickRedCross = (parentId, childId) => {
                this.arrowsManipulator.remove(arrowPath);
                this.arrowsManipulator.remove(redCrossManipulator);
                this.selectedArrowRedCross = null;
                this.unLink(parentId, childId);
            }

            let parentGlobalPoint = this.mapGameAndGui[parent.id].manipulator.last.globalPoint(0, MINIATURE_SIZE.h / 2),
                parentLocalPoint = this.graphMiniatureManipulator.last.localPoint(parentGlobalPoint.x, parentGlobalPoint.y),
                childGlobalPoint = this.mapGameAndGui[child.id].manipulator.last.globalPoint(0, -MINIATURE_SIZE.h / 2),
                childLocalPoint = this.graphMiniatureManipulator.last.localPoint(childGlobalPoint.x, childGlobalPoint.y);
            let redCrossManipulator = new Manipulator(this);
            let redCross = IconCreator.createRedCrossIcon(redCrossManipulator);
            redCross
                .position((parentLocalPoint.x + childLocalPoint.x) / 2, (parentLocalPoint.y + childLocalPoint.y) / 2)
                .mark('redCross')
                .addEvent('mousedown', () => _onClickRedCross(parent.id, child.id));

            let arrowPath = this.drawStraightArrow(parentLocalPoint.x, parentLocalPoint.y, childLocalPoint.x, childLocalPoint.y);
            this.arrowsManipulator.add(arrowPath);
            this.selected = false;
            arrowPath.color(myColors.black, 0, myColors.black);

            arrowPath.onClick(_onClickArrow);
            return this;
        }

        drawStraightArrow(x1, y1, x2, y2) {
            var arrow = new svg.Arrow(3, 9, 15).position(x1, y1, x2, y2);
            var arrowPath = new svg.Path(x1, y1);
            arrow.points.forEach((point) => {
                arrowPath.line(point.x, point.y);
            });
            arrowPath.line(x1, y1);
            return arrowPath;
        }

        toggleArrowMode(arrowBorder) {
            this.unselectMiniature();
            this.arrowMode = !this.arrowMode;
            this.arrowMode && arrowBorder.color(myColors.blue, 1, myColors.none);
            !this.arrowMode && arrowBorder.color(myColors.white, 1, myColors.grey);
        }

        unselectMiniature() {
            if (this.selectedMiniature) {
                this.selectedMiniature.miniature.border.color(myColors.lightgrey, 1, [0, 155, 220]);
                this.selectedMiniature.miniature.manipulator.unset(3);
                this.selectedMiniature.miniature.manipulator.unset(2);
            }
            this.selectedMiniature && this.selectedMiniature.resetFunct();
            this.selectedMiniature = null;
        }

        dropAction(x, y, item) {
            let formation = this.getFormation();
            let getDropLocation = (x, y) => {
                let dropLocation = this.graphPanel.content.localPoint(x, y);
                return dropLocation;
            };
            let getLevel = (dropLocation) => {
                let level = Math.floor(dropLocation.y / LEVEL_HEIGHT);
                if (level >= formation.levelsTab.length) {
                    level = formation.levelsTab.length;
                    this.addNewLevel(level);
                }
                level = level < 0 ? 0 : level;
                return level;
            };
            let getColumn = (dropLocation, level) => {
                level = formation.levelsTab[level];
                let column = Math.floor(dropLocation.x / (MINIATURE_SIZE.w + MARGIN));
                column = column == 0 ? 1 : column > level.getGamesTab().length ? level.getGamesTab().length + 1 : column;
                return column;
            };

            let dropLocation = getDropLocation(x, y);

            if (dropLocation.x >= 0) {
                let level = getLevel(dropLocation);
                let column = getColumn(dropLocation, level);
                this.moveGame(item, level, column);
            }
        }

        displayMessage(message) {
            popUp.display(message, this.manipulator);
        }

        getGamesLibrary() {
            return this.presenter.getGamesLibrary();
        }

        getFormation() {
            return this.presenter.getFormation();
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        getImages() {
            return this.presenter.getImages();
        }

        getLinks() {
            return this.presenter.getLinks();
        }

        getGameById(id) {
            return this.presenter.getGameById(id);
        }

        addNewLevel(level) {
            this.presenter.addLevel(level);
        }

        saveFormation() {
            this.presenter.saveFormation();
            /** TODO valeur de retour non testée sur la vue DMA **/
        }

        publishFormation() {
            this.presenter.publishFormation();
        }

        setImageOnMiniature(miniature, src) {
            this.presenter.setImageOnMiniature(miniature.manipulator.game, src);
        }

        createLink(parentGame, childGame) {
            this.presenter.createLink(parentGame, childGame);
        }

        unLink(parentId, childId) {
            this.presenter.unLink(parentId, childId);
        }

        enterGame(miniature) {
            !this.arrowMode && this.presenter.loadPresenterGameAdmin(miniature.manipulator.game);
        }

        moveGame(game, level, column) {
            this.presenter.moveGame(game, level, column);
            this.displayGraph();
        }

        removeGame(game) {
            this.presenter.removeGame(game);
            this.displayGraph();
        }

        removeLevel(level) {
            this.presenter.removeLevel(level);
        }

        renameFormation() {
            this.presenter.renameFormation(this.nameFormationField.textMessage).then(status => {
                if (status) {
                    this.displayHeader(this.nameFormationField.textMessage);
                    this.titleGraph.message('Formation : ' + this.nameFormationField.textMessage);
                    this.titleGraphBack.dimension(this.titleGraph.boundingRect().width + 2 * MARGIN, 3);
                    this.titleGraphBack.position(-0.85 * this.graphSize.width / 2 + this.titleGraph.boundingRect().width / 2, -this.graphSize.height / 2);
                }
            });
        }
    }

    return FormationAdminV;
}