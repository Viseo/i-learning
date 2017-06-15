exports.DashboardAdmin = function (globalVariables) {
    const
        Manipulator = globalVariables.Handlers.Manipulator,
        View = globalVariables.View,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawings = globalVariables.drawings,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.Icons.IconCreator,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        ClipPath = globalVariables.clipPath;

    const TILE_SIZE = {w: 440, h: 100, rect: {w: 350, h: 100}},
        INPUT_SIZE = {w: 400, h: 30},
        BUTTON_SIZE = {w: 40, h: 30},
        IMAGES_PER_LINE = 3,
        CLIP_SIZE = 45,
        IMAGE_SIZE = 160;


    class DashboardAdminV extends View {
        constructor(presenter) {
            super(presenter);
        }

        display() {
            let _initManips = () => {
                this.mediasManipulator = new Manipulator(this);
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.addFormationManipulator = new Manipulator(this).addOrdonator(3);
            }
            let _displayBack = () => {
                let headHeight = this.header.height + MARGIN;
                let titlePos = {
                    x: INPUT_SIZE.w / 2 + MARGIN,
                    y: headHeight + INPUT_SIZE.h + 2 * MARGIN
                }
                let title = new svg.Text('Formations :')
                    .font(FONT, 25).color(myColors.grey)
                    .position(titlePos.x, titlePos.y + 8.3)
                let titleBack = new svg.Rect(200, 3)
                    .color(myColors.white, 0, myColors.none)
                    .position(titlePos.x, titlePos.y);

                this.panel = new gui.Panel(drawing.width - 2 * MARGIN, drawing.height - headHeight - TILE_SIZE.h + 2 * MARGIN, myColors.white)
                this.panel.position(this.panel.width / 2 + MARGIN, this.panel.height / 2 + headHeight + INPUT_SIZE.h + 2 * MARGIN);
                this.panel.border.color(myColors.none, 1, myColors.grey).corners(5, 5);
                this.panel.setScroll();

                // this.panel.add(this.miniaturesManipulator.first)
                this.manipulator.add(this.panel.component).add(titleBack).add(title);


            }
            let _addIconCaption = () => {
                let captionManipulator = new Manipulator(this);
                let iconCreator = new IconCreator();
                let editedIcon = iconCreator.createEditedIcon(captionManipulator);
                let publishedIcon = iconCreator.createDoneIcon(captionManipulator);
                let editedCaption = new svg.Text('Editée').font(FONT, 20).anchor('left');
                let publishedCaption = new svg.Text('Publiée').font(FONT, 20).anchor('left');
                this.manipulator.add(captionManipulator);
                captionManipulator.add(editedCaption).add(publishedCaption);
                editedCaption.position(editedIcon.getSize() + MARGIN, 6.6);
                publishedIcon.position(editedCaption.x + editedCaption.boundingRect().width + MARGIN + publishedIcon.getSize(), 0);
                publishedCaption.position(editedCaption.x + editedCaption.boundingRect().width + publishedIcon.getSize() * 2 + 2 * MARGIN, 6.6);
                let positionCaption = {
                    x: drawing.width - 4 * editedIcon.getSize() - editedCaption.boundingRect().width - publishedCaption.boundingRect().width - 3 * MARGIN,
                    y: this.header.height + publishedIcon.getSize() + MARGIN
                };
                captionManipulator.move(positionCaption.x, positionCaption.y);
            }
            let _addNewFormationInput = () => {
                var _addNewWhenEnter = (event) => {
                    if (event.keyCode === 13) {
                        this.addFormationHandler();
                        addFormationTextArea.hideControl();
                    }
                }

                let addFormationTextArea = new gui.TextField(0, 0, INPUT_SIZE.w, INPUT_SIZE.h, 'Ajouter une formation')
                addFormationTextArea.font(FONT, 15).color(myColors.grey);
                addFormationTextArea.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                addFormationTextArea.control.placeHolder('Ajouter une formation');
                addFormationTextArea.mark('addFormationTextInput');
                addFormationTextArea.onInput((oldMessage, message, valid) => {
                    if (!message || !oldMessage) {
                        addFormationTextArea.text.message('Ajouter une formation');
                    }
                });
                addFormationTextArea.onBlur(() => {
                    addFormationTextArea.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                })
                addFormationTextArea.color([myColors.lightgrey, 1, myColors.black]);
                this.addFormationManipulator.add(addFormationTextArea.component);
                this.addFormationManipulator.move(MARGIN + INPUT_SIZE.w / 2, this.header.height + MARGIN + INPUT_SIZE.h / 2);
                let addButton = new gui.Button(BUTTON_SIZE.w, BUTTON_SIZE.h, [myColors.grey, 0, myColors.none], '+');
                addButton.component.mark('addFormationButton');
                addButton.position(INPUT_SIZE.w / 2 + BUTTON_SIZE.w / 2 + MARGIN, 0);
                addButton.text.color(myColors.white, 0, myColors.none).font(FONT, 30).position(0, 10);
                addButton.back.corners(5, 5);
                addButton.onClick(this.addFormationHandler.bind(this));
                svg.addGlobalEvent('keydown', _addNewWhenEnter);
                this.addFormationField = addFormationTextArea;
                this.addFormationManipulator.set(1, addButton.component);
                this.manipulator.add(this.addFormationManipulator);
            }

            super.display();
            _initManips();
            _displayBack();
            this.displayHeader("Dashboard");
            _addIconCaption();
            _addNewFormationInput();
            this.displayMiniatures()
        }

        displayMiniatures() {
            this.miniaturesManipulator.flush();
            // let backRect = new svg.Rect(5000, 5000) //TODO
            //     .position(this.panel.width / 2, this.panel.height / 2)
            //     .color(myColors.white, 0, myColors.none);
            // this.miniaturesManipulator.add(backRect);
            this.miniaturesManipulator.move(2 * MARGIN + TILE_SIZE.w / 2, TILE_SIZE.h / 2 + 3 * MARGIN);
            this.panel.content.add(this.miniaturesManipulator.first);
            let _displayMiniature = (formation, i) => {
                let _createMiniature = () => {
                    border = new svg.Rect(TILE_SIZE.rect.w, TILE_SIZE.rect.h)
                        .corners(2, 2)
                        .color(myColors.lightgrey, 0.5, myColors.grey)
                        .position(CLIP_SIZE, 0)
                        .mark("miniatureBorder" + formation.label);
                    let statusIcon = new IconCreator().createIconByName(formation.status, manipulator, 3);
                    statusIcon && statusIcon.position(TILE_SIZE.w / 2, -TILE_SIZE.h / 2 - statusIcon.getSize() / 2)
                    let clip = new ClipPath('image' + formation._id)
                        .add(new svg.Circle(CLIP_SIZE).position(-TILE_SIZE.w / 2 + CLIP_SIZE * 2, 0))
                    let picture = new svg.Image(formation.imageSrc ? formation.imageSrc : '../../images/viseo.png');
                    picture
                        .position(-TILE_SIZE.w / 2 + 2 * CLIP_SIZE, 0)
                        .dimension(IMAGE_SIZE, 2 * CLIP_SIZE)
                        .attr('clip-path', 'url(#image' + formation._id + ')');
                    backCircle = new svg.Circle(CLIP_SIZE + 5)
                        .color(myColors.lightgrey, 0.5, myColors.grey)
                        .position(-TILE_SIZE.w / 2 + 2 * CLIP_SIZE, 0);
                    let content = new svg.Text(formation.label)
                        .position(CLIP_SIZE, -TILE_SIZE.h / 4)
                        .font(FONT, 20);
                    resizeStringForText(content, TILE_SIZE.rect.w - 8 * MARGIN, TILE_SIZE.rect.h)
                    let iconAddPicture = IconCreator.createAddImage(manipulator);
                    iconAddPicture.position(TILE_SIZE.w / 2 - 3 * MARGIN, -TILE_SIZE.h / 4);
                    iconAddPicture.manipulator.mark("popUpImg" + formation.label);
                    iconAddPicture.addEvent('click', () => {
                        this.displayPopUpImage(formation)
                    });
                    manipulator.add(content).add(clip);
                    manipulator.set(0, border)
                    manipulator.set(1, backCircle)
                    manipulator.set(2, picture);

                    if (formation.status === 'Published') {
                        let displayNotationManip = new Manipulator(this);
                        let textNotation = new svg.Text(formation.note
                            + '/5 (' + formation.noteCounter
                            + ' votes)')
                            .font(FONT, 14, 15).anchor('end');
                        resizeStringForText(textNotation, 120, 10);
                        displayNotationManip.add(textNotation);
                        displayNotationManip.move(TILE_SIZE.w / 2 - MARGIN, TILE_SIZE.h / 2 - MARGIN);
                        manipulator.add(displayNotationManip);
                    }
                }
                let _placeMiniature = () => {
                    let elementPerLine = Math.floor((drawing.width - 2 * MARGIN) / (TILE_SIZE.w));
                    elementPerLine = elementPerLine ? elementPerLine : 1;
                    let line = Math.floor(i / elementPerLine)
                    let y = line * (TILE_SIZE.h * 1.5);
                    let x = (i - line * elementPerLine) * (TILE_SIZE.w)
                    manipulator.move(x, y);
                }
                let _colorWhenHover = () => {
                    let onMouseOverSelect = () => {
                        border.color([130, 180, 255], 1, myColors.black);
                        backCircle.color([130, 180, 255], 1, myColors.black);
                        manipulator.addEvent("mouseleave", () => onMouseOutSelect());
                    };
                    let onMouseOutSelect = () => {
                        backCircle.color(myColors.lightgrey, 0.5, myColors.grey);
                        border.color(myColors.lightgrey, 0.5, myColors.grey);
                    };
                    manipulator.addEvent("mouseenter", () => onMouseOverSelect());
                }

                let manipulator = new Manipulator(this).addOrdonator(4).mark("miniatureManip" + formation.label);
                let border, backCircle;
                _createMiniature();
                _placeMiniature();
                _colorWhenHover();
                manipulator.addEvent('click', () => { this.enterFormation(formation)});
                this.miniaturesManipulator.add(manipulator);
            }

            this.getFormations().forEach((formation, i) => {
                _displayMiniature(formation, i);
            });
        }

        displayPopUpImage(formation){
            let _hideMediaPopup = () => {
                this.mediasManipulator.flush()
            };
            let _displayRedCross = () => {
                let redCross = IconCreator.createRedCrossIcon(this.mediasManipulator).position(dimensions.width / 2, -dimensions.height / 2);
                redCross.addEvent('click', _hideMediaPopup)
            }
            let _displayPictures = () => {
                let pictureClickHandler = (picture) => {
                    this.presenter.setImageOnFormation(formation, picture.src);
                };

                let imageWidth = (dimensions.width - 2 * MARGIN) / IMAGES_PER_LINE - (IMAGES_PER_LINE - 1) / IMAGES_PER_LINE * MARGIN * 2;
                let imagesManipulator = new Manipulator(this);

                mediaPanel.content.add(imagesManipulator.first);
                imagesManipulator.move(imageWidth / 2 + MARGIN, imageWidth / 2 + MARGIN);
                this.getImages().then((images) => {
                    images.images.forEach((image, index) => {
                        let indexX = Math.floor(index % IMAGES_PER_LINE);
                        let indexY = Math.floor(index / IMAGES_PER_LINE);
                        let picture = new svg.Image(image.imgSrc);
                        picture
                            .dimension(imageWidth, imageWidth)
                            .position(indexX * (imageWidth + MARGIN), indexY * (imageWidth + MARGIN))
                            .mark('image' + indexX + '-' + indexY);
                        imagesManipulator.add(picture);
                        svg.addEvent(picture, 'click', () => {
                            pictureClickHandler(picture);
                            _hideMediaPopup();
                        });
                    })
                });
            }
            let _displayFileExplorerWhenClick = () => {
                let fileExplorer;
                let fileExplorerHandler = () => {
                    let onChangeFileExplorerHandler = () => {
                        for (let file of fileExplorer.component.files) {
                            this.presenter.uploadImage(file).then(() => {
                                this.displayPopUpImage(formation);
                            });
                        }
                    };

                    if (!fileExplorer) {
                        let globalPointCenter = {x: drawing.w / 2, y: drawing.h / 2};
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
                    }
                    svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
                };
                addPictureButton.onClick(fileExplorerHandler);
                svg.addEvent(addPictureButton.text, 'click', fileExplorerHandler);
            }

            let dimensions = {
                width: drawing.width * 1 / 2 - MARGIN,
                height: drawing.height * 0.7 - (2 * MARGIN + BUTTON_SIZE.h)
            };

            this.manipulator.add(this.mediasManipulator);
            let borderLibrary = new svg.Rect(dimensions.width, dimensions.height);
            borderLibrary.color(myColors.white, 1, myColors.grey).corners(5, 5);
            let mediaPanel = new gui.Panel(dimensions.width - 2 * MARGIN, dimensions.height - BUTTON_SIZE.h - 4 * MARGIN);
            mediaPanel.position(0, (borderLibrary.height - mediaPanel.height) / 2 - 2 * MARGIN - BUTTON_SIZE.h);
            mediaPanel.border.color(myColors.none, 1, myColors.grey);

            let titleLibrary = new svg.Text('Library :').color(myColors.grey).font(FONT, 25);
            let titleLibraryBack = new svg.Rect(100, 3).color(myColors.white);
            titleLibraryBack.position(-borderLibrary.width / 2 + 2 * MARGIN + titleLibraryBack.width / 2,
                -borderLibrary.height / 2 + 2 * MARGIN);
            titleLibrary.position(-borderLibrary.width / 2 + 2 * MARGIN + titleLibraryBack.width / 2, -borderLibrary.height / 2 + 2 * MARGIN + 8.33);
            let addPictureButton = new gui.Button(3 * BUTTON_SIZE.w, BUTTON_SIZE.h, [myColors.customBlue, 0, myColors.none], 'Ajouter une image')
                .position(borderLibrary.width / 2 - BUTTON_SIZE.w * 3 / 2 - 2 * MARGIN, borderLibrary.height / 2 - BUTTON_SIZE.h / 2 - MARGIN);
            addPictureButton.text.font(FONT, 13, 12).color(myColors.white).position(0, 4.33);
            addPictureButton.glass.mark('addPictureButtonGlass');
            this.mediasManipulator.add(borderLibrary);
            this.mediasManipulator.add(mediaPanel.component);
            this.mediasManipulator.add(titleLibraryBack);
            this.mediasManipulator.add(titleLibrary);
            this.mediasManipulator.add(addPictureButton.component);

            _displayRedCross();
            _displayPictures();
            _displayFileExplorerWhenClick();
            this.mediasManipulator.move(drawing.width / 2, drawing.height / 2);
        }

        addFormationHandler() {
            this.presenter.createFormation(this.addFormationField.textMessage);
            this.addFormationField.message('Ajouter une formation');
        }

        displayErrorMessage(message) {
            let errorMessage = new svg.Text(message).color(myColors.red, 0, myColors.none);
            errorMessage.position(INPUT_SIZE.w / 2 + BUTTON_SIZE.w + 3 * MARGIN, 8.3)
                .mark('formationErrorMessage')
                .font(FONT, 25)
                .anchor('left');
            this.addFormationManipulator.set(2, errorMessage);
            svg.timeout(() => {
                this.addFormationManipulator.unset(2);
            }, 3000);
        }

        getFormations() {
            return this.presenter.getFormations();
        }

        getImages() {
            return this.presenter.getImages();
        }

        enterFormation(formation){
            this.presenter.enterFormation(formation);
        }
    }
    return DashboardAdminV;
}