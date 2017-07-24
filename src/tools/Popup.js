/**
 * Created by TBE3610 on 10/07/2017.
 */

exports.Popup = function(globalVariables){
    const drawing = globalVariables.drawing,
        svg = globalVariables.svg,
        Manipulator = globalVariables.Handlers.Manipulator

    const FONT_SIZE = 20,
        HEADER_SIZE = 50,
        LIFE_TIME = 2500,
        IMAGE_SIZE = 70


    class Popup{
        constructor(){
            this.type = {WARNING : "WARNING", }
        }

        display(message, parentManipulator, type = PopUpType.DEFAULT){
            let _removeOldPopup = () => {
                if(this.manipulator && this.manipulator.parentManip){
                    this.manipulator.parentManip.remove(this.manipulator.component);
                }
            }
            let _slideInAnimation = () => {
                let _slideOutAnimation = () => {
                    this.manipulator.translator.steppy(10, 10).moveTo(drawing.width + this.width, this.height/2 + HEADER_SIZE + MARGIN);
                }

                clearTimeout(this.timeout);
                this.manipulator.translator.steppy(10, 10).moveTo(drawing.width - this.width/2 - MARGIN, this.height/2 + HEADER_SIZE + MARGIN);
                this.timeout = setTimeout(()=>{
                    _slideOutAnimation();
                }, LIFE_TIME)
            }
            let _createPopup = () => {
                this.manipulator = new Manipulator(this).addOrdonator(3);
                parentManipulator.add(this.manipulator);
                let text = new svg.Text(message)
                    .font(FONT, FONT_SIZE)
                    .mark('popUpMessage');
                this.manipulator.set(1, text);
                this.width = Math.max(drawing.width/8, text.boundingRect().width + 2*MARGIN);
                this.height = drawing.height/10;
                let rect = new svg.Rect(this.width, this.height).corners(3, 3);

                let picture;
                switch(type){
                    case PopUpType.WARNING: rect.color(myColors.white, 2, myColors.orange);
                        picture = new svg.Image('../../images/popup/warning.png');
                        break;
                    case PopUpType.DEFAULT: rect.color(myColors.white, 0.5, myColors.black); break;
                    case PopUpType.VALID: rect.color(myColors.white, 2, myColors.darkerGreen);
                        picture = new svg.Image('../../images/popup/check.png');
                        break;
                };

                if(picture){
                    this.height += IMAGE_SIZE;
                    picture
                        .dimension(IMAGE_SIZE, IMAGE_SIZE)
                        .position(0, -this.height/2 + IMAGE_SIZE/2 + MARGIN);
                    this.manipulator.set(2, picture);
                    rect.dimension(this.width, this.height);

                    text.position(0, +this.height/2 - IMAGE_SIZE/2 + MARGIN -FONT_SIZE/3)
                }
                this.manipulator.set(0, rect);
                this.manipulator.move(drawing.width + this.width/2, this.height/2 + HEADER_SIZE + MARGIN);
            }

            _removeOldPopup();
            if(message) {
                _createPopup();
                _slideInAnimation();
            }
        }

        displayWarningMessage(message, parentManipulator){
            this.display(message, parentManipulator, PopUpType.WARNING)
        }

        displayValidMessage(message, parentManipulator){
            this.display(message, parentManipulator, PopUpType.VALID)
        }
    }

    const PopUpType = {
        WARNING: 'WARNING',
        DEFAULT: "DEFAULT",
        VALID: 'VALID',
    };

    return Popup;
}