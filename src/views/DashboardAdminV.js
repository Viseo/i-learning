exports.DashboardAdmin = function (globalVariables) {
    const
        Manipulator = globalVariables.Handlers.Manipulator,
        View = globalVariables.View,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.Icons.IconCreator,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        drawCheck = globalVariables.Helpers.drawCheck,
        Helpers = globalVariables.Helpers,
        popUp = globalVariables.popUp;

    const TILE_SIZE = {w: 300, h: 450},
        INPUT_SIZE = {w: 400, h: 30},
        BUTTON_SIZE = {w: 40, h: 30},
        IMAGES_PER_LINE = 3,
        SPACE_BETWEEN_ELEMENTS = 70,
        IMAGE_SIZE = {w:300, h:300};

    const
        PANEL = {
            title : "FORMATIONS",
            titleFontSize : 28,
            titleColor : [30,192,161],
            bgColor : myColors.lightgrey,
            corner : 5,
        },
        ADD_FORMATION_AREA = {
            fontSize : 15,
            placeHolder : "Ajouter une formation",
            bgColor : [myColors.white, 0, myColors.none]
        };

    class DashboardAdminV extends View {
        constructor(presenter) {
            super(presenter);
            this.headerDim = {w:drawing.width, h:300};
        }

        display() {
            let _initManips = () => {
                this.mediasManipulator = new Manipulator(this);
                this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
                this.headerManip = new Manipulator(this);
            }

            let _displayBack = () => {
                this.panel = new gui.Panel(drawing.width, drawing.height - this.headerDim.h, PANEL.bgColor)
                let posPanel = {x : this.panel.width / 2, y : this.panel.height / 2 + this.headerDim.h};

                this.panel.position(posPanel.x, posPanel.y);
                this.panel.border.color(myColors.none, 1, myColors.none).corners(PANEL.corner, PANEL.corner);
                let hideElementBeforeEndOfPanel = new svg.Rect(this.panel.width, 20)
                    .color(PANEL.bgColor, 0, myColors.none)
                    .position(posPanel.x, posPanel.y - this.panel.height/2 + 10);
                this.panel.setScroll();
                let title = new svg.Text(PANEL.title)
                    .font(FONT, PANEL.titleFontSize).color(PANEL.titleColor)
                    .position(posPanel.x, hideElementBeforeEndOfPanel.y)

                this.manipulator
                    .add(this.panel.component)
                    .add(hideElementBeforeEndOfPanel)
                    .add(title);
            }
            let displayHeader = ()=>{
                let _addNewFormationInput = (y) => {
                    var _addNewWhenEnter = (event) => {
                        if (event.keyCode === 13) {
                            this.addFormationHandler();
                            addFormationTextArea.hideControl();
                        }
                    }

                    let addFormationTextArea = new gui.TextField(0, 0, 2*INPUT_SIZE.w - MARGIN, INPUT_SIZE.h,
                        ADD_FORMATION_AREA.placeHolder)
                    addFormationTextArea.font(FONT, 15)
                        .color(ADD_FORMATION_AREA.bgColor)
                        .editColor(ADD_FORMATION_AREA.bgColor)
                        .position(drawing.width/2-2*MARGIN, y)
                        .mark('addFormationTextInput');
                    addFormationTextArea.control.placeHolder(ADD_FORMATION_AREA.placeHolder);
                    addFormationTextArea.onInput((oldMessage, message, valid) => {
                        if(message.length > 50){
                            addFormationTextArea.message(oldMessage);
                        }else if (!message || !oldMessage) {
                            addFormationTextArea.text.message(ADD_FORMATION_AREA.placeHolder);
                        }
                    });

                    let addButton = new gui.Button(BUTTON_SIZE.w, BUTTON_SIZE.h, [[30,192,161], 0, myColors.none], '+');
                    addButton.component.mark('addFormationButton');
                    addButton.position(INPUT_SIZE.w - 3*MARGIN + drawing.width/2 + BUTTON_SIZE.w/2,  y);
                    addButton.text.color(myColors.white, 0, myColors.none).font(FONT, 30).position(0, 10);
                    addButton.onClick(this.addFormationHandler.bind(this));
                    svg.addGlobalEvent('keydown', _addNewWhenEnter);
                    this.addFormationField = addFormationTextArea;
                    return {text:addFormationTextArea, button:addButton};
                }
                let _addSearchBar = (width, y)=>{
                    let manip = new Manipulator(this);
                    let searchZone = new svg.Rect(width, INPUT_SIZE.h + 1/2*MARGIN);
                    searchZone.corners(10,10).color(myColors.white, 2, [30,192,161])
                    manip.add(searchZone);
                    manip.move(drawing.width/2, y);
                    let searchIcon = new svg.Image('../../images/search.png').dimension(20,20)
                        .position(-width/2 + 2*MARGIN, 0);
                    let textArea = new gui.TextField(MARGIN,0, width-5*MARGIN, INPUT_SIZE.h-2, '');
                    textArea.control.placeHolder('Rechercher une formation')
                    textArea
                        .color([myColors.white, 0, myColors.none])
                        .editColor([myColors.white, 0, myColors.none]);
                    textArea.font(FONT, 18);
                    textArea.text.font(FONT,18).position(textArea.text.x,6);
                    textArea.onInput((old,newm, valid)=>{
                        let regex = new RegExp(newm);
                        this.displayMiniatures(regex);
                    })
                    manip.add(textArea.component)
                        .add(searchIcon)
                    return manip;
                }
                this.manipulator.add(this.headerManip.component);
                let backgroundPic = new svg.Image('../../images/german.png')
                    .dimension(drawing.width, drawing.width)
                    .position(drawing.width/2,0);
                this.headerManip.add(backgroundPic);
                let addZone = new svg.Rect(2*INPUT_SIZE.w + 6*MARGIN, INPUT_SIZE.h + 20)
                    .color([48,40,78], 0, myColors.none)
                    .position(drawing.width/2, this.headerDim.h/2 - MARGIN)
                    .corners(2,2)
                this.headerManip.add(addZone);
                let textArea = _addNewFormationInput(addZone.y);
                let searchBar = _addSearchBar(addZone.width, addZone.y + addZone.height + MARGIN);
                this.headerManip.add(textArea.text.component).add(textArea.button.component).add(searchBar);
            }


            super.display();
            _initManips();
            displayHeader();
            _displayBack();
            this.displayHeader("Dashboard");
            this.displayMiniatures()
        }
        createIcon(type){
            if (type == 'Edited'){
                let manip = new Manipulator(this);
                let pic = new svg.Image('../../images/edit.png').dimension(20,20).position(-85,0);
                let text = new svg.Text('Editée').font(FONT, 18).color(myColors.orange).position(-65,6).anchor('left');
                manip.add(pic).add(text);
                return manip;
            }
            else if (type == 'Published'){
                let manip = new Manipulator(this);
                let rect = new svg.Rect(50,50).color(myColors.none, 2, [30,192,161]);
                let check = drawCheck(-40,10,40).color([], 2, [30,192,161]);
                rect.position(-40, 10);
                manip.add(rect).add(check);
                return manip;
            }
        }

        displayMiniatures(regexSearch) {
            this.miniaturesManipulator.flush();
            this.miniaturesManipulator.move(2 * MARGIN + TILE_SIZE.w / 2, TILE_SIZE.h / 2 + 3 * MARGIN);
            this.panel.content.add(this.miniaturesManipulator.first);
            let _displayMiniature = (formation, i) => {
                let _createMiniature = () => {
                    border = new svg.Rect(TILE_SIZE.w, TILE_SIZE.h)
                        .corners(2, 2)
                        .color(myColors.white, 0.5, myColors.grey)
                        .mark("miniatureBorder" + formation.label);
                    shadow = new svg.Rect(TILE_SIZE.w, TILE_SIZE.h)
                        .corners(2, 2)
                        .color(myColors.halfGrey, 0, myColors.none)
                        .position(3,3)
                        .mark("miniatureBorder" + formation.label);
                    let statusIcon = this.createIcon(formation.status);
                    if(statusIcon){
                        statusIcon.move(TILE_SIZE.w/2, (-TILE_SIZE.h/2 + IMAGE_SIZE.h)+3*MARGIN);
                        manipulator.add(statusIcon);
                    }

                    let picture = new svg.Image(formation.imageSrc ? formation.imageSrc : '../../images/viseo.png');
                    picture
                        .position(0, -(TILE_SIZE.h - IMAGE_SIZE.h)/2)
                        .dimension(IMAGE_SIZE.w, IMAGE_SIZE.h)
                    let content = new svg.Text(formation.label)
                        .position(-TILE_SIZE.w/2 + MARGIN,(-TILE_SIZE.h/2 + IMAGE_SIZE.h)+3*MARGIN + 7.3)
                        .font(FONT, 22)
                        .anchor('left');
                    let description = new svg.Text('Description')
                        .position(-TILE_SIZE.w/2 + MARGIN,(-TILE_SIZE.h/2 + IMAGE_SIZE.h)+6*MARGIN + 5.3)
                        .font(FONT, 16  )
                        .anchor('left');
                    let iconAddPicture = IconCreator.createAddImage(manipulator);
                    iconAddPicture.position(TILE_SIZE.w / 2 - 3 * MARGIN,-TILE_SIZE.h/2+3*MARGIN);
                    iconAddPicture.manipulator.mark("popUpImg" + formation.label);
                    iconAddPicture.addEvent('click', () => {
                        this.displayPopUpImage(formation)
                    });
                    manipulator.add(content)
                        .add(description)
                        .set(0,shadow)
                        .set(1, border)
                        .set(2, picture);
                    this.miniaturesManipulator.add(manipulator);
                    resizeStringForText(content, TILE_SIZE.w - 6*MARGIN, TILE_SIZE.h);
                    
                    if (formation.status === 'Published') {
                        let displayNotationManip = new Manipulator(this);
                        let textNotation = new svg.Text('Moyenne : '
                            + formation.note
                            + '/5 (' + formation.noteCounter
                            + ' votes)')
                            .font(FONT, 14, 15).anchor('end');
                        resizeStringForText(textNotation, 120, 10);
                        displayNotationManip.add(textNotation)
                            .move(TILE_SIZE.w / 2 - MARGIN, TILE_SIZE.h / 2 - MARGIN);
                        manipulator.add(displayNotationManip);
                    }
                }
                let _placeMiniature = () => {
                    let elementPerLine = Math.floor((drawing.width - 2 * MARGIN) / (TILE_SIZE.w + SPACE_BETWEEN_ELEMENTS/2));
                    elementPerLine = elementPerLine ? elementPerLine : 1;
                    let line = Math.floor(i / elementPerLine)
                    let y = line * (TILE_SIZE.h * 1.1);
                    let x = (i - line * elementPerLine) * (TILE_SIZE.w +SPACE_BETWEEN_ELEMENTS)
                    manipulator.move(x, y);
                }
                let _colorWhenHover = () => {
                    let onMouseOverSelect = () => {
                        border.color([130, 180, 255], 1, myColors.black);
                        shadow.position(6,6)
                        manipulator.addEvent("mouseleave", () => onMouseOutSelect());
                    };
                    let onMouseOutSelect = () => {
                        shadow.position(3,3);
                        border.color(myColors.white, 0.5, myColors.grey);
                    };
                    manipulator.addEvent("mouseenter", () => onMouseOverSelect());
                }
                let border, shadow;
                let manipulator = new Manipulator(this).addOrdonator(4).mark("miniatureManip" + formation.label);
                _createMiniature();
                _placeMiniature();
                _colorWhenHover();
                manipulator.addEvent('click', () => { this.enterFormation(formation)});

            }

            if(!regexSearch){
                this.getFormations().forEach((formation, i) => {
                    _displayMiniature(formation, i);
                });
            }else{
                let i = 0;
                this.getFormations().forEach((formation) => {
                    if(formation.label.match(regexSearch)){
                        _displayMiniature(formation, i);
                        i++;
                    }
                });
            }
            let x = this.miniaturesManipulator.component.boundingRect();
            let posX = TILE_SIZE.w/2 + this.panel.width/2;
            x && (posX += - x.width/2);
            this.miniaturesManipulator.move( posX, TILE_SIZE.h / 2 + 3 * MARGIN);
        }


        displayPopUpImage(formation){
            let _hideMediaPopup = () => {
                this.mediasManipulator.flush()
            };
            let _displayRedCross = () => {
                let redCross = IconCreator.createRedCrossIcon(this.mediasManipulator).position(dimensions.width / 2, -dimensions.height / 2);
                redCross.addEvent('click', _hideMediaPopup)
            }
            let pictureClickHandler = (picture) => {
                this.presenter.setImageOnFormation(formation, picture.src);
            };
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
            }
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

        addFormationHandler() {
            this.presenter.createFormation(this.addFormationField.textMessage);
            this.addFormationField.message('Ajouter une formation');
        }

        displayErrorMessage(message) {
            popUp.displayWarningMessage(message, this.manipulator);
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