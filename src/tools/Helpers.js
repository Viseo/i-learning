/**
 * Created by TBE3610 on 12/06/2017.
 */

exports.Helpers = function(globalVariables){
    const drawings = globalVariables.drawings,
        svg = globalVariables.svg,
        installDnD = globalVariables.gui.installDnD,
        Manipulator = globalVariables.Handlers.Manipulator;

    function resizeStringForText(text, width, height) {

        let pointToSave = {x:text.x, y:text.y};


        if (text.boundingRect().width > width) {
            let splitonspace = text.messageText.split(' ');
            if(splitonspace.length == 1){
                let count = -3;
                while(text.boundingRect().width > width){
                    text.message(text.messageText.slice(0, count) + '...');
                    count--;
                }

                return text;
            }
            let result = '';
            var nbLines = 0;
            let computeWidth = (array) => {
                if(nbLines >= 1 && text.message(result + array.join(' ')).boundingRect().height > height){
                    result = result.split('').slice(0,-3).join('') + '...';
                    return;
                }
                if (array.length === 1){
                    result += array[0];
                    return;
                }
                text.message(array.join(' '));
                if (text.boundingRect().width > width) {
                    let line1 = array, lines = [];
                    while (text.boundingRect().width > width && line1.length > 1 ) {
                        lines.unshift(line1.pop());
                        text.message(line1.join(' '));
                    }
                    nbLines ++;
                    result += line1.join(' ') + '\n';
                    computeWidth(lines);
                }
                else{
                    result += array.join(' ');
                }
            }
            computeWidth(splitonspace);
            text.message(result);
        }
      
        return text;
    }

    var drawCheck = function (x, y, size) {
        return new svg.Path(x, y).move(x - .3 * size, y - .1 * size)
            .line(x - .1 * size, y + .2 * size).line(x + .3 * size, y - .3 * size)
            .color(myColors.none, 3, myColors.black);
    };

    let drawHexagon = (w, h, orientation, ratio) => {
        let factor = ratio || 1;
        if (orientation == 'V') {
            var points = [
                [w / 2, -h / 2],
                [0, -factor * h],
                [-w / 2, -h / 2],
                [-w / 2, h / 2],
                [0, factor * h],
                [w / 2, h / 2]
            ];
        }
        else {
            var points = [
                [w / 2, -h / 2],
                [factor * w, 0],
                [w / 2, h / 2],
                [-w / 2, h / 2],
                [-factor * w, 0],
                [-w / 2, -h / 2]
            ];
        }

        let shape = new svg.Polygon(0, 0).add(points).color(myColors.lightwhite, 1, myColors.grey);
        shape.width = orientation == 'V' ? w : w*factor;
        shape.height = orientation == 'V' ? h*factor : h;

        return shape;
    };


    class Gauge {
        constructor(w, h, minVal, maxVal){
            this.indicatorManipulator = new Manipulator(this);
            this.manipulator = new Manipulator(this);
            this.width = w;
            this.height = h;

            this.minVal = minVal;
            this.maxVal = maxVal;

            this.border = new svg.Rect(w, h).color(myColors.white, 1, myColors.black);
            this.indicator = new svg.Rect(w/30, h + 5).color(myColors.grey, 1, myColors.black);

            this.indicatorManipulator.add(this.indicator);
            this.manipulator.add(this.border).add(this.indicatorManipulator);


            let conf = {
                drop: (what, whatParent, x, y) => {
                    let controlX = x;
                    if(Math.abs(x) >= this.width/2){
                        if(x < 0 ){
                            controlX = -this.width/2
                        }else{
                            controlX = this.width/2
                        }
                    }
                    return {x: controlX, y: 0, parent: whatParent};
                },
                drag: (what, x, y)=>{
                    let controlX = x;
                    if(Math.abs(x) >= this.width/2){
                        if(x < 0 ){
                            controlX = -this.width/2
                        }else{
                            controlX = this.width/2
                        }
                    }
                    return{x:controlX, y:0};
                },
                moved: (what)=>{
                    let newValue = (what.x + this.width/2)*(this.maxVal-this.minVal)/this.width + this.minVal;
                    this.cbOnChangeValue && this.cbOnChangeValue(newValue);
                },
            };
            installDnD(this.indicatorManipulator, drawings.component.glass.parent.manipulator.last, conf);
        }

        onChangeValue(cb){
            this.cbOnChangeValue = cb;
        }

        position(x, y){
            this.manipulator.move(x, y);
        }
    }

    return {
        resizeStringForText,
        drawCheck,
        drawHexagon,
        Gauge
    }
}