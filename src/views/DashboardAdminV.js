exports.DashboardAdmin = function(globalVariables){
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        View = globalVariables.View,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        domain = globalVariables.domain,
        IconCreator = globalVariables.domain.IconCreator,
        ClipPath = globalVariables.clipPath;

    const TILE_SIZE = {w: 440, h: 100, rect: {w: 350, h: 100}},
        INPUT_SIZE = {w: 400, h: 30},
        BUTTON_SIZE = {w: 40, h: 30},
        BUTTON_HEIGHT = 30,
        IMAGES_PER_LINE = 3,
        CLIP_SIZE = 45,
        IMAGE_SIZE =160;



    class DashboardAdminV extends View{
        constructor(presenter){
            super(presenter);
            this.manipulator = new Manipulator(this).addOrdonator(2);
            this.mediasManipulator = new Manipulator(this);
            this.miniaturesManipulator = new Manipulator(this).addOrdonator(2);
            this.spaceBetween = 0;
            this.addFormationManipulator = new Manipulator(this).addOrdonator(3);
            this.headHeight = this.header.height + MARGIN;
            this.buttonSize= {width:40, height:30};
        }

        display(){
            let createBack = ()=>{
                this.title = new svg.Text('Formations :')
                    .font('Arial',25).color(myColors.grey);
                this.title.position(INPUT_SIZE.w/2 + MARGIN, this.headHeight + INPUT_SIZE.h + 2*MARGIN + 8.3)
                this.titleBack = new svg.Rect(200, 3).color(myColors.white,0,myColors.none);
                this.titleBack.position(INPUT_SIZE.w/2 + MARGIN, this.headHeight + INPUT_SIZE.h + 2*MARGIN);
                this.panel = new gui.Panel(drawing.width-2*MARGIN, drawing.height - this.headHeight - TILE_SIZE.h + 2*MARGIN, myColors.none);
                this.panel.position(this.panel.width/2 +MARGIN ,
                    this.panel.height/2 + this.headHeight + INPUT_SIZE.h + 2*MARGIN);
                this.backRect = new svg.Rect(5000, 5000) //TODO
                    .position(this.panel.width/2, this.panel.height/2)
                    .color(myColors.white, 0, myColors.none);
                this.panel.border.color(myColors.none, 1, myColors.grey).corners(5,5);
            }
            createBack();
            let manipulatorAdding = ()=>{
                this.manipulator.add(this.panel.component)
                    .add(this.titleBack)
                    .add(this.title)
                    .add(this.addFormationManipulator);
                this.miniaturesManipulator.add(this.backRect);
                let headerManipulator = this.header.getManipulator();
                this.manipulator.add(headerManipulator);
            }
            manipulatorAdding();
            drawing.manipulator.set(0,this.manipulator);
            this.header.display("Dashboard");

            let addIconCaption = ()=>{
                let captionManipulator = new Manipulator(this);
                let iconCreator = new IconCreator();
                let editedIcon = iconCreator.createEditedIcon(captionManipulator);
                let publishedIcon = iconCreator.createDoneIcon(captionManipulator);
                let editedCaption = new svg.Text('Editée').font('Arial', 20).anchor('left');
                let publishedCaption = new svg.Text('Publiée').font('Arial', 20).anchor('left');
                this.manipulator.add(captionManipulator);
                captionManipulator.add(editedCaption).add(publishedCaption);
                editedCaption.position(editedIcon.getSize()+ MARGIN, 6.6);
                publishedIcon.position(editedCaption.x + editedCaption.boundingRect().width + MARGIN + publishedIcon.getSize(), 0);
                publishedCaption.position(editedCaption.x + editedCaption.boundingRect().width + publishedIcon.getSize()*2 + 2*MARGIN, 6.6);
                let positionCaption = {
                    x: drawing.width - 4*editedIcon.getSize() - editedCaption.boundingRect().width - publishedCaption.boundingRect().width - 3*MARGIN,
                    y : this.header.height + publishedIcon.getSize() + MARGIN
                };
                captionManipulator.move(positionCaption.x, positionCaption.y);
            }

            let addFormationDisplay = ()=>{
                let addFormationTextArea = new gui.TextField(0,0, INPUT_SIZE.w, INPUT_SIZE.h, 'Ajouter une formation')
                // addFormationTextArea.component.mark('addFormationTextArea');
                addFormationTextArea.text.mark('addFormationText');
                addFormationTextArea.glass.mark('addFormationGlass');
                addFormationTextArea.font('Arial', 15).color(myColors.grey);
                addFormationTextArea.text.position(-INPUT_SIZE.w/2 + MARGIN, 7.5);
                addFormationTextArea.control.placeHolder('Ajouter une formation');
                addFormationTextArea.control.mark('addFormationTextInput');
                addFormationTextArea.onInput((oldMessage, message, valid)=>{
                    if (!message || !oldMessage){
                        addFormationTextArea.text.message('Ajouter une formation');
                    }
                    addFormationTextArea.text.position(-INPUT_SIZE.w/2+MARGIN, 7.5);
                });
                addFormationTextArea.color([myColors.lightgrey, 1, myColors.black]);
                this.addFormationManipulator.add(addFormationTextArea.component);
                this.addFormationManipulator.move(MARGIN + INPUT_SIZE.w/2, this.header.height + MARGIN + INPUT_SIZE.h/2);

                let addButton = new gui.Button(BUTTON_SIZE.w,BUTTON_SIZE.h, [myColors.grey, 0, myColors.none], '+');
                addButton.component.mark('addFormationButton');
                addButton.position(INPUT_SIZE.w/2 + BUTTON_SIZE.w/2 + MARGIN, 0);
                addButton.text.color(myColors.white, 0, myColors.none).font('Arial', 30).position(0,10);
                addButton.back.corners(5,5);
                this.addFormationField = addFormationTextArea;
                this.addFormationManipulator.set(1, addButton.component);
                addButton.onClick(this.addFormationHandler.bind(this));
            }
            addFormationDisplay();
            addIconCaption();

            this.miniaturesManipulator.move(2*MARGIN + TILE_SIZE.w/2, TILE_SIZE.h/2 + 3*MARGIN);
            this.panel.add(this.miniaturesManipulator.first);
            this.displayMiniatures()

        }

        displayMiniatures(){
            let formations = this.getFormations();
            this.numberFormation = formations.length;
            formations.forEach((formation,i) => {
                this._displayMiniature(formation, i);
            });
        }

        addFormationMiniature(formation){
            this._displayMiniature(formation, this.numberFormation);
            this.numberFormation ++;
        }

        addFormationHandler(){
            this.presenter.createFormation(this.addFormationField.textMessage);
            this.addFormationField.message('Ajouter une formation');
        }

        displayErrorMessage(message){
            let errorMessage = new svg.Text(message).color(myColors.red, 0, myColors.none);
            errorMessage.position(INPUT_SIZE.w/2 + BUTTON_SIZE.w + 3*MARGIN, 8.3)
                .mark('formationErrorMessage')
                .font('Arial', 25)
                .anchor('left');
            this.addFormationManipulator.set(2, errorMessage);
            svg.timeout(()=>{
                this.addFormationManipulator.unset(2);
            }, 3000);
        }

        getFormations(){
            return this.presenter.getFormations();
        }


        refresh(){

        }

        _displayMiniature(formation, i){
            let createMiniature = (formation)=>{
                let border =
                    new svg.Rect(TILE_SIZE.rect.w, TILE_SIZE.rect.h)
                    .corners(2,2)
                    .color(myColors.lightgrey, 0.5, myColors.grey)
                    .position(CLIP_SIZE, 0);
                let clip = new ClipPath('image' + formation.label);
                clip.add(new svg.Circle(CLIP_SIZE).position(-TILE_SIZE.w/2+ CLIP_SIZE*2, 0))
                let manipulator = new Manipulator(this).addOrdonator(4).mark("miniatureManip"+formation.label);
                let picture;
                if(formation.imageSrc){
                    picture = new util.Picture(formation.imageSrc, false, this)
                }
                else{
                    picture = new util.Picture('../../images/viseo.png', false, this, '', null);
                }
                picture.draw(-TILE_SIZE.w/2 + 2* CLIP_SIZE, 0, IMAGE_SIZE,2*CLIP_SIZE,manipulator, 3);
                picture.imageSVG.attr('clip-path', 'url(#image' + formation.label +')');
                let backCircle = new svg.Circle(CLIP_SIZE +5).color(myColors.lightgrey, 0.5, myColors.grey).position(-TILE_SIZE.w/2+ 2*CLIP_SIZE, 0);
                let content = new svg.Text(formation.label)
                    .position(CLIP_SIZE, -TILE_SIZE.h/4)
                    .font('Arial', 20);
                util.resizeStringForText(content, TILE_SIZE.rect.w - 8*MARGIN, TILE_SIZE.rect.h)
                manipulator.set(0,border)
                    .set(1,backCircle)
                    .add(clip)
                    .add(content);

                let iconAddImage = IconCreator.createAddImage(manipulator);
                iconAddImage.position( TILE_SIZE.w/2 -3*MARGIN  , -TILE_SIZE.h /4 );
                iconAddImage.manipulator.mark("popUpImg" +formation.label);
                iconAddImage.addEvent('click', ()=>{this.displayPopUpImage(formation)});



                return {border: border, clip: clip, manipulator: manipulator, backCircle: backCircle, content:content};
            }
            let placeMiniature = (miniature, i)=>{
                let elementPerLine = Math.floor((drawing.width-2*MARGIN)/(TILE_SIZE.w + this.spaceBetween));
                elementPerLine = elementPerLine ? elementPerLine : 1;
                let line = Math.floor(i/elementPerLine)
                let y = line*(TILE_SIZE.h*1.5);
                let x = (i-line*elementPerLine)*(TILE_SIZE.w+this.spaceBetween)
                miniature.manipulator.move(x,y);
            }
            let drawIcon = (formation)=>{
                let iconCreator = new IconCreator();
                let icon = iconCreator.createIconByName(formation.status, miniature.manipulator, 2);
                icon && icon.position(TILE_SIZE.w / 2, -TILE_SIZE.h / 2 - icon.getSize()/2)
            }
            let miniature = createMiniature(formation);
            miniature.border.mark("miniatureBorder"+formation.label);
            this.miniaturesManipulator.add(miniature.manipulator);
            placeMiniature(miniature, i);
            drawIcon(formation);
            let displayNotation = () =>{
                if (formation.status == 'Published') {
                    let displayNotationManip = new Manipulator(this);
                    let textNotation = new svg.Text(formation.note.toString().split('').slice(0,4).join('')
                        + '/5 (' + formation.noteCounter
                        + ' votes)')
                        .font('Arial', 14, 15).anchor('end');
                    util.resizeStringForText(textNotation, 120, 10);
                    displayNotationManip.add(textNotation);
                    displayNotationManip.move(TILE_SIZE.w/2 - MARGIN, TILE_SIZE.h/2 - MARGIN);
                    miniature.manipulator.add(displayNotationManip);
                }
            }
            displayNotation();
            let onMouseOverSelect = miniature => {
                miniature.border.color([130, 180, 255], 1, myColors.black);
                miniature.backCircle.color([130, 180, 255], 1, myColors.black);
                miniature.manipulator.addEvent("mouseleave", () => onMouseOutSelect(miniature));
            };
            let onMouseOutSelect = miniature => {
                miniature.backCircle.color(myColors.lightgrey, 0.5, myColors.grey);
                miniature.border.color(myColors.lightgrey, 0.5, myColors.grey);
            };
            miniature.manipulator.addEvent("mouseenter", () => onMouseOverSelect(miniature));
            miniature.manipulator.addEvent('click', ()=>{this.miniatureClickHandler(formation)});
        }

        displayPopUpImage(formation){
            this.mediasManipulator.flush();
            this.manipulator.add(this.mediasManipulator);
            let dimensions = {
                width: drawing.width * 1/2 - MARGIN,
                height: drawing.height * 0.7 - (2 * MARGIN + BUTTON_HEIGHT)
            };

            let borderLibrary = new svg.Rect(dimensions.width, dimensions.height);
            borderLibrary.color(myColors.white, 1, myColors.grey).corners(5, 5);
            let mediaPanel = new gui.Panel( dimensions.width - 2* MARGIN , dimensions.height - BUTTON_HEIGHT - 4* MARGIN);
            mediaPanel.position(0,(borderLibrary.height - mediaPanel.height)/2 - 2*MARGIN - BUTTON_HEIGHT);
            mediaPanel.border.color( myColors.none, 1  , myColors.grey);


            let rectWhite = new svg.Rect(5000,5000).color(myColors.white,1,myColors.white).position(mediaPanel.width/2, mediaPanel.height/2);
            let titleLibrary = new svg.Text('Library :').color(myColors.grey).font('Arial', 25);
            let titleLibraryBack = new svg.Rect(100 ,3).color(myColors.white);
            titleLibraryBack.position(-borderLibrary.width / 2 + 2*MARGIN + titleLibraryBack.width/2,
                -borderLibrary.height / 2 + 2*MARGIN) ;
            titleLibrary.position( -borderLibrary.width / 2 + 2*MARGIN + titleLibraryBack.width/2 , -borderLibrary.height / 2 + 2*MARGIN + 8.33);
            let addPictureButton = new gui.Button(3*BUTTON_SIZE.w,BUTTON_SIZE.h,[myColors.customBlue,0,myColors.none ],'Ajouter une image')
                .position( borderLibrary.width /2 - BUTTON_SIZE.w*3/2 -2*MARGIN ,borderLibrary.height/2-BUTTON_SIZE.h/2 - MARGIN);
            addPictureButton.text.font('Arial', 13, 12).color(myColors.white).position(0,4.33);
            util.resizeStringForText(addPictureButton.text, 3*BUTTON_SIZE.w - MARGIN, BUTTON_SIZE.h);
            addPictureButton.component.add(addPictureButton.text);
            addPictureButton.glass.mark('addPictureButtonGlass');
            mediaPanel.content.add(rectWhite);
            this.mediasManipulator.add( borderLibrary);
            this.mediasManipulator.add( mediaPanel.component);
            this.mediasManipulator.add( titleLibraryBack);
            this.mediasManipulator.add( titleLibrary);
            this.mediasManipulator.add(addPictureButton.component);

            let redCross = domain.IconCreator.createRedCrossIcon( this.mediasManipulator ).position(dimensions.width/2,-dimensions.height/2 ) ;
            let redCrossHandler = () => {this.mediasManipulator.flush()};
            svg.addEvent( redCross.border,'click', redCrossHandler);
            svg.addEvent( redCross.content,'click', redCrossHandler);

            let pictureClickHandler = (picture) => {
                this.presenter.setImageOnFormation(formation, picture.src);
            };
            let imageWidth = (dimensions.width - 2 * MARGIN) / IMAGES_PER_LINE - (IMAGES_PER_LINE - 1) / IMAGES_PER_LINE * MARGIN * 2;
            let imagesManipulator = new Manipulator(this);

            mediaPanel.content.add(imagesManipulator.first);
            imagesManipulator.move(imageWidth/2 + MARGIN, imageWidth/2 + MARGIN);
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
                    svg.addEvent(picture, 'click', ()=>{
                        pictureClickHandler(picture);
                        redCrossHandler();
                    });
                })
            });

            this.mediasManipulator.move( drawing.width/2, drawing.height/2);

            const onChangeFileExplorerHandler = () => {
                uploadFiles(fileExplorer.component.files)
            };

            var uploadFiles = (files) => {
                var _progressDisplayer = () => {
                    var _displayUploadIcon = manipulator => {
                        let icon = drawUploadIcon({x: -this.w / 2, y: 5, size: 20});
                        manipulator.set(0, icon);
                    }
                    var _displayRect = manipulator => {
                        let rect = new svg.Rect(w * 0.7, 16).color(myColors.none, 1, myColors.darkerGreen);
                        manipulator.set(1, rect);
                    }

                    let manipulator = new Manipulator().addOrdonator(4);
                    _displayUploadIcon(manipulator);
                    _displayRect(manipulator);
                    this.videosUploadManipulators.push(manipulator);

                    return (e) => {
                        var _displayProgressBar = manipulator => {
                            const progwidth = w * e.loaded / e.total;
                            const bar = new svg.Rect(progwidth - 15, 14)
                                .color(myColors.green)
                                .position(-(w - progwidth) / 2, 0);
                            manipulator.set(2, bar);
                        }
                        var _displayPercentage = manipulator => {
                            const percentage = new svg.Text(Math.round(e.loaded / e.total * 100) + "%");
                            percentage.position(0, percentage.boundingRect().height / 4);
                            manipulator.set(3, percentage);
                        }

                        _displayProgressBar(manipulator);
                        _displayPercentage(manipulator);
                        if (e.loaded === e.total) {
                            this.videosUploadManipulators.remove(manipulator);
                        }
                    };
                };

                for (let file of files) {
                    let progressDisplay;
                    this.selectedTab = 0;
                    if (file.type === 'video/mp4') {
                        this.selectedTab = 1;
                        // progressDisplay = _progressDisplayer();
                    }
                    this.presenter.uploadImage(file, progressDisplay).then(() => {
                        this.displayPopUpImage(formation);
                    });
                }
            };


            let fileExplorer;
            const fileExplorerHandler = () => {
                if (!fileExplorer) {
                    let globalPointCenter ={x:drawing.w/2, y:drawing.h/2};
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



            addPictureButton.onClick(fileExplorerHandler);
            svg.addEvent(addPictureButton.text, 'click', fileExplorerHandler);

        }

        miniatureClickHandler(formation){
            this.presenter.miniatureClickHandler(formation);
        }

        getImages() {
            return this.presenter.getImages();
        }
    }
    return DashboardAdminV;
}