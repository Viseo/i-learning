/**
 * Created by TBE3610 on 12/06/2017.
 */

exports.Helpers = function(globalVariables){
    const drawings = globalVariables.drawings,
        svg = globalVariables.svg;

    function resizeStringForText(text, width, height) {
        let glass = drawings.piste.last;
        let pointToSave = {x:text.x, y:text.y};
        text.position(10000, 10000);
        glass.add(text);
        if (text.boundingRect().width > width) {
            let splitonspace = text.messageText.split(' ');
            if(splitonspace.length == 1){
                let count = -3;
                while(text.boundingRect().width > width){
                    text.message(text.messageText.slice(0, count) + '...');
                    count--;
                }
                glass.remove(text);
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
        text.position(pointToSave.x, pointToSave.y - (nbLines ? nbLines :0) * (text.lineSpacing - text.fontSize/3));
        glass.remove(text);
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


    return {
        resizeStringForText,
        drawCheck,
        drawHexagon,
    }
}