/**
 * Created by minhhuyle on 25/04/17.
 */

exports.Tool = function (globalVariables, classContainer) {


    let
        svg = globalVariables.svg;


    class IconSetting {
        constructor(borderProperties){
            this.borderProperties = (borderProperties) ? borderProperties :
                {size:0, layer : 0,
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
            this.contentProperties = {};
        }


        setTriangleContent(width, height, direction, fillColor, strokeWidth, strokeColor, layer){
            this.contentProperties.type = "Triangle";
            this.contentProperties.width = width;
            this.contentProperties.height = height;
            this.contentProperties.direction = direction;
            this.contentProperties.fillColor = fillColor;
            this.contentProperties.strokeWidth = strokeWidth;
            this.contentProperties.strokeColor = strokeColor;
            this.contentProperties.layer = layer;
            return this;
        }

        setDefaultBorderColor(fillColor, strokeWidth, strokeColor){
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

        setBorderLayer(layer){
            this.borderProperties.layer = layer;
            return this;
        }

        setBorderSize(size){
            this.borderProperties.size = size;
            return this;
        }
    }

    class Icon {
        constructor(manipulator, iconSetting){
            this.iconSetting = iconSetting;
            let borderProperties = this.iconSetting.borderProperties;

            this.border = new svg.Circle(borderProperties.size)
                .color(borderProperties.default.fillColor,
                    borderProperties.default.strokeWidth,
                    borderProperties.default.strokeColor);
            manipulator.set(borderProperties.layer, this.border);

            let contentProperties = this.iconSetting.contentProperties;
            switch (contentProperties.type){
                case "Triangle":
                    this.content = new svg.Triangle(contentProperties.width, contentProperties.height, contentProperties.direction)
                        .color(contentProperties.fillColor, contentProperties.strokeWidth, contentProperties.strokeColor);
                    break;
            }
            manipulator.set(contentProperties.layer, this.content);
        }

        position(x, y){
            this.border.position(x,y);
            this.content.position(x, y);
            return this;
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
    }

    return {
        IconSetting,
        Icon
    };
};