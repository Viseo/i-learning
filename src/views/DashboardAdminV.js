exports.DashboardAdmin = function(globalVariables){
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        View = globalVariables.View,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.domain.IconCreator,
        ClipPath = globalVariables.clipPath;

    const TILE_SIZE = {w: 440, h: 100, rect: {w: 350, h: 100}},
        INPUT_SIZE = {w: 400, h: 30},
        BUTTON_SIZE = {w: 40, h: 30},
        IMAGE_SIZE = 90;


    class DashboardAdminV extends View{
        constructor(presenter){
            super(presenter);
            this.manipulator = new Manipulator(this).addOrdonator(2);
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
                addFormationTextArea.font('Arial', 15).color(myColors.grey);
                addFormationTextArea.text.position(-INPUT_SIZE.w/2 + MARGIN, 7.5);
                addFormationTextArea.control.placeHolder('Ajouter une formation');
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
            let formations = this.getFormations();
            this.numberFormation = formations.length;
            formations.forEach((formation,i) => {
                this._displayMiniature(formation, i);
            });
            this.panel.add(this.miniaturesManipulator.first);
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
                    .position(IMAGE_SIZE/2, 0);
                let clip = new ClipPath('image' + formation.label);
                clip.add(new svg.Circle(IMAGE_SIZE/2).position(-TILE_SIZE.w/2+ IMAGE_SIZE, 0))
                let manipulator = new Manipulator(this).addOrdonator(4);
                let picture;
                if(formation.imageSrc){
                    picture = new util.Picture(formation.imageSrc, false, this)
                }
                else{
                    picture = new util.Picture('../../images/viseo.png', false, this, '', null);
                }
                picture.draw(-TILE_SIZE.w/2 + IMAGE_SIZE, 0, IMAGE_SIZE,IMAGE_SIZE,manipulator, 3);
                picture.imageSVG.attr('clip-path', 'url(#image' + formation.label +')');
                let backCircle = new svg.Circle(IMAGE_SIZE/2 +5).color(myColors.lightgrey, 0.5, myColors.grey).position(-TILE_SIZE.w/2+ IMAGE_SIZE, 0);
                let content = new svg.Text(formation.label)
                    .position(IMAGE_SIZE/2, -TILE_SIZE.h/4)
                    .font('Arial', 20);
                util.resizeStringForText(content, TILE_SIZE.rect.w - 8*MARGIN, TILE_SIZE.rect.h)
                manipulator.set(0,border)
                    .set(1,backCircle)
                    .add(clip)
                    .add(content);
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

        miniatureClickHandler(formation){
            this.presenter.miniatureClickHandler(formation);
        }
    }
    return DashboardAdminV;
}