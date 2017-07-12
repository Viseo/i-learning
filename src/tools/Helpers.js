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
                if(nbLines >= 1 && text.message(result + array.join(' ')).boundingRect().height > height) {
                    result = result.split('').slice(0, -3).join('') + '...';
                    text.message(result);
                    return;
                }
                text.message(array[0]);
                if(text.boundingRect().width > width){
                    return resizeStringForText(text, width, height);
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
                    text.message(result);
                    computeWidth(lines);
                }
                else{
                    result += array.join(' ');
                    text.message(result);
                }
            }
            computeWidth(splitonspace);

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
            this.indicator.mark('gaugeIndicator');

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
                    let newValue = (this.manipulator.first.localPoint(what.x,0).x + this.width/2)*(this.maxVal-this.minVal)/this.width + this.minVal;
                    this.cbOnChangeValue && this.cbOnChangeValue(newValue);
                    return{x:controlX, y:0};
                },
                moved: (what)=>{
                    let parent = this.manipulator.last;
                    parent.remove(what.component);
                    parent.add(what.component);
                    return true;
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
        setIndicateurToValue(value){
            if (value<this.minVal){
                value = this.minVal;
            }
            if(value > this.maxVal){
                value = this.maxVal;
            }
            let ratioInWidth = ((value-this.minVal)/(this.maxVal-this.minVal)) - 0.5;
            this.indicatorManipulator.move(ratioInWidth*this.width, 0);
        }
    }

    class FileExplorer {
        constructor(w, h, multipleChoice=false){
            let globalPointCenter = {x: w / 2, y: h / 2};
            var fileExplorerStyle = {
                leftpx: globalPointCenter.x,
                toppx: globalPointCenter.y,
                width: w / 5,
                height: w / 5
            };
            this.fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
            this.fileExplorer.type("file");


            svg.runtime.attr(this.fileExplorer.component, "id", "fileExplorer");
            svg.runtime.attr(this.fileExplorer.component, "hidden", "true");
            multipleChoice && svg.runtime.attr(this.fileExplorer.component, "multiple", "true");

            drawings.component.add(this.fileExplorer);
        }

        display(){
            svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
        }

        acceptImages(){
            svg.runtime.attr(this.fileExplorer.component, "accept", "image/*");
            return this;
        }

        acceptVideoMP4(){
            svg.runtime.attr(this.fileExplorer.component, "accept", "video/mp4");
            return this;
        }

        acceptImageAndVideoMP4(){
            svg.runtime.attr(this.fileExplorer.component, "accept", "image/*, video/mp4");
            return this;
        }

        handlerOnValide(handler){
            svg.addEvent(this.fileExplorer, "change", handler);
            return this;
        }

        getFilesSelected(){
            return this.fileExplorer.component.files;
        }
    }

    return {
        resizeStringForText,
        drawCheck,
        drawHexagon,
        FileExplorer,
        Gauge
    }
}