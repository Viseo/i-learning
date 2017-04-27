/**
 * Created by minhhuyle on 25/04/17.
 */

exports.Tool = function (globalVariables, classContainer) {


    let
        svg = globalVariables.svg,
        Manipulator = globalVariables.util.Manipulator;


    class IconSetting {
        constructor(borderProperties){
            this.borderProperties = (borderProperties) ? borderProperties :
                {size:0, layer : -1,
                    default: {
                        fillColor: myColors.white,
                        strokeWidth: 1,
                        strokeColor: myColors.black
                    },
                    action: {
                        fillColor: myColors.black,
                        strokeWidth: 3,
                        strokeColor: myColors.white
                    }
                };
            this.contentProperties = {type : "None"};
        }

        duplicate(){
            let objClone = JSON.parse(JSON.stringify(this));
            objClone.__proto__  = this.__proto__;

            return objClone;
        }

        setBorderLayer(layer){
            this.borderProperties.layer = layer;
            return this;
        }

        setPathContent(path, size, fillColor, strokeWidth, strokeColor){
            this.contentProperties.type = "Path";
            this.contentProperties.path = path;
            this.contentProperties.size = size;
            this.contentProperties.fillColor = fillColor;
            this.contentProperties.strokeWidth = strokeWidth;
            this.contentProperties.strokeColor = strokeColor;
            return this;
        }

        setPathCheckContent(size, fillColor, strokeWidth, strokeColor){
            let path = [{x:-.3* size, y:- .1 * size}, {x: - .1 * size, y: .2 * size}, {x : +.3 * size, y : -.3 * size}];
            return this.setPathContent(path, size, fillColor, strokeWidth, strokeColor);
        }

        setTextContent(width, height, label, fontSize, font, color){
            this.contentProperties.type = "Text";
            this.contentProperties.width = width;
            this.contentProperties.height = height;
            this.contentProperties.label = label;
            this.contentProperties.fontSize = fontSize;
            this.contentProperties.font = font;
            this.contentProperties.color = color;
        }


        setTriangleContent(width, height, direction, fillColor, strokeWidth, strokeColor){
            this.contentProperties.type = "Triangle";
            this.contentProperties.width = width;
            this.contentProperties.height = height;
            this.contentProperties.direction = direction;
            this.contentProperties.fillColor = fillColor;
            this.contentProperties.strokeWidth = strokeWidth;
            this.contentProperties.strokeColor = strokeColor;
            return this;
        }

        setBorderDefaultColor(fillColor, strokeWidth, strokeColor){
            this.borderProperties.default.fillColor = fillColor;
            this.borderProperties.default.strokeWidth = strokeWidth;
            this.borderProperties.default.strokeColor = strokeColor;
            return this;
        }

        setBorderActionColor(fillColor, strokeWidth, strokeColor){
            this.borderProperties.action.fillColor = fillColor;
            this.borderProperties.action.strokeWidth = strokeWidth;
            this.borderProperties.action.strokeColor = strokeColor;
            return this;
        }

        setBorderSize(size){
            this.borderProperties.size = size;
            return this;
        }
    }

    class Icon {
        constructor(manipulator, iconSetting){
            this.action = false;
            this.iconSetting = iconSetting;
            this.manipulator = new Manipulator(this).addOrdonator(2);
            let borderProperties = this.iconSetting.borderProperties;

            this.border = new svg.Circle(borderProperties.size)
                .color(borderProperties.default.fillColor,
                    borderProperties.default.strokeWidth,
                    borderProperties.default.strokeColor);
            this.manipulator.set(0, this.border);

            let contentProperties = this.iconSetting.contentProperties;
            switch (contentProperties.type){
                case "Triangle":
                    this.content = new svg.Triangle(contentProperties.width, contentProperties.height, contentProperties.direction)
                        .color(contentProperties.fillColor, contentProperties.strokeWidth, contentProperties.strokeColor);
                    break;
                case "Text":
                    this.content = autoAdjustText(contentProperties.label, contentProperties.width, contentProperties.height,
                        contentProperties.fontSize, contentProperties.font, this.manipulator).text;
                    this.content.color(contentProperties.color);
                    break;
                case "Path":
                    let middlePoint = {x : this.border.x, y: this.border.y};
                    let pathToDraw = contentProperties.path;

                    let path = new svg.Path(middlePoint.x, middlePoint.y)
                        .color(contentProperties.fillColor, contentProperties.strokeWidth, contentProperties.strokeColor)
                        .move(middlePoint.x + pathToDraw[0].x, middlePoint.y + pathToDraw[0].y);
                    for(let i = 1; i < pathToDraw.length; i++){
                        path.line(middlePoint.x + pathToDraw[i].x, middlePoint.y + pathToDraw[i].y);
                    }
                    this.content = path;
                    break;
            }
            (contentProperties.type != "None") && this.manipulator.set(1, this.content);
            (borderProperties.layer && borderProperties >= 0) ? manipulator.set(borderProperties.layer, this.manipulator)
                : manipulator.add(this.manipulator);
        }

        position(x, y){
            this.manipulator.move(x,y);
            return this;
        }

        showActualBorder(){
            (this.action) ? this.showBorderActionColor() : this.showBorderDefaultColor();
        }

        showBorderActionColor(){
            let borderProperties = this.iconSetting.borderProperties.action;
            this.border.color(borderProperties.fillColor, borderProperties.strokeWidth, borderProperties.strokeColor);
            return this;
        }

        showBorderDefaultColor(){
            let borderProperties = this.iconSetting.borderProperties.default;
            this.border.color(borderProperties.fillColor, borderProperties.strokeWidth, borderProperties.strokeColor);
            return this;
        }

        addEvent(eventName, handler){
            this.manipulator.addEvent(eventName, handler);
            /*svg.addEvent(this.border, eventName, handler);
            (this.content) && svg.addEvent(this.content, eventName, handler);*/
        }
    }

    return {
        IconSetting,
        Icon
    };
};