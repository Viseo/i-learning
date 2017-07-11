/**
 * Created by TBE3610 on 10/07/2017.
 */

exports.Popup = function(globalVariables){
    const drawing = globalVariables.drawing,
        svg = globalVariables.svg,
        Manipulator = globalVariables.Handlers.Manipulator

    const FONT_SIZE = 20,
        HEADER_SIZE = 50,
        LIFE_TIME = 2500

    class Popup{
        constructor(){

        }

        display(message, parentManipulator){
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
                this.manipulator = new Manipulator(this).addOrdonator(2)
                parentManipulator.add(this.manipulator);
                let text = new svg.Text(message)
                    .font(FONT, FONT_SIZE);
                this.manipulator.set(1, text);
                this.width = Math.max(drawing.width/8, text.boundingRect().width + 2*MARGIN);
                this.height = drawing.height/10;
                let rect = new svg.Rect(this.width, this.height)
                    .corners(3, 3)
                    .color(myColors.white, 0.5, myColors.black);
                this.manipulator.set(0, rect);
                this.manipulator.move(drawing.width + this.width/2, this.height/2 + HEADER_SIZE + MARGIN);
            }

            _removeOldPopup();
            if(message) {
                _createPopup();
                _slideInAnimation();
            }
        }
    }

    return Popup;
}