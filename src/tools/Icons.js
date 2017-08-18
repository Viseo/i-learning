/**
 * Created by minhhuyle on 25/04/17.
 */

exports.Icons = function (globalVariables) {
    let
        svg = globalVariables.svg,
        drawings = globalVariables.drawings,
        drawing = globalVariables.drawing,
        Manipulator = globalVariables.Handlers.Manipulator;

    const
        ICON_SIZE = 10

    class PopOut {
        constructor(width, height, classToDisplay, parentManipulator, isOnlyText){
            this.width = width;
            this.height = height;
            this.classToDisplay = classToDisplay;
            this.parentManipulator = parentManipulator;
            this.redCrossManipulator = new Manipulator(this);
            this.manipulator = new Manipulator(this).addOrdonator(4);
            let tmpFlush = parentManipulator.flush;
            let self = this;
            if (isOnlyText){
                this.text = new svg.Text('');
            }
            this.onlyText = isOnlyText;
            parentManipulator.flush = function (handler){
                let result = tmpFlush.apply(this, arguments);
                self.hide();
                return result;
            }
        }

        setText(text){
            if(this.text){
                this.text.messageText = text;
            }
        }

        show(){
            let computeBox = ()=>{
                if (this.width > drawing.width){
                    this.width = drawing.width - 20;
                }
                if (this.x - this.width/2 < 0){
                    this.x = this.width/2 + 10;
                }
                if (this.x + this.width/2 > drawing.width){
                    this.x = drawing.width - this.width/2 - 10;
                }
                if (this.y - this.height/2 < 0){
                    this.y = this.height/2 + 10;
                }
                if (this.y + this.height/2 > drawing.height){
                    this.y = drawing.height - this.height/2 - 10;
                }
            }
            this.manipulator && this.hide();
            if (this.panel){
                this.setPanel();
            }
            drawings.piste.set(0,this.manipulator.component);
            let point = {
                x : this.parentManipulator.first.globalPoint(0, 0).x ,
                y : this.parentManipulator.first.globalPoint(0, 0).y
            }
            this.x = point.x;
            this.y = point.y - this.height/2;
            if (this.onlyText){
                this.manipulator.set(1, this.text.dimension(this.width, this.height));
                //this.manipulator.first.steppy(5,50).opacity(0,1);
            }
            else{
                this.manipulator.set(1, this.classToDisplay.manipulator);
                this.manipulator.first.opacity(0);
                this.classToDisplay.render(-this.width,-this.height, 2*this.width, 2*this.height, () => {
                    this.manipulator.first.steppy(5,50).opacity(0,1);
                });
                this.manipulator.scalor.scale(0.5);
                this.redCross = IconCreator.createRedCrossIcon(this.redCrossManipulator);
                this.redCross.mark('popupRedcross');
            }
            if(this.xAdd != undefined && this.yAdd != undefined){
                this.x += this.xAdd;
                this.y += this.yAdd;
            }
            computeBox();
            this.manipulator.move(this.x , this.y);
            this.manipulator.add(this.redCrossManipulator);
            this.redCrossManipulator.move(this.width, -this.height);
            this.redCross && svg.addEvent(this.redCross, 'mouseup', () => this.hide());
            if (this.cb){
                this.cb();
            }
        }

        defineProperty(x, y, callback){
            this.xAdd = x;
            this.yAdd = y;
            this.cb = callback;
        }


        hide(){
            this.manipulator.flush();
            //this.manipulator = null;
        }
        setPanel(w, h, fillColor, strokeColor) {
            this.panel = true;
            w = w || this.width;
            h = h || this.height;
            this.panelWidth = w;
            this.panelHeight = h;
            fillColor = fillColor || myColors.white;
            strokeColor = strokeColor || myColors.grey;
            this.manipulator.set(0,new svg.Rect(this.panelWidth,this.panelHeight)
                .color(fillColor, 1, strokeColor)
                .corners(5,5)
                .opacity(0.8)
                .position(0,-this.panelHeight/4));
        }
    }

    class IconSetting {
        constructor(borderProperties) {
            this.borderProperties = (borderProperties) ? borderProperties :
                {
                    size: 0, layer: -1,
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
            this.contentProperties = {type: "None"};
        }

        duplicate() {
            let objClone = JSON.parse(JSON.stringify(this));
            objClone.__proto__ = this.__proto__;

            return objClone;
        }

        setBorderLayer(layer = -1) {
            this.borderProperties.layer = layer;
            return this;
        }

        setPolygonContent(points, fillColor, strokeWidth, strokeColor) {
            this.contentProperties.type = "Polygon";
            this.contentProperties.points = points;
            this.contentProperties.fillColor = fillColor;
            this.contentProperties.strokeWidth = strokeWidth;
            this.contentProperties.strokeColor = strokeColor;
            return this;
        }

        changeContentColor(fillColor, strokeWidth, strokeColor) {
            this.contentProperties.fillColor = fillColor;
            this.contentProperties.strokeWidth = strokeWidth;
            this.contentProperties.strokeColor = strokeColor;
        }

        setPathContent(path, size, fillColor, strokeWidth, strokeColor) {
            this.contentProperties.type = "Path";
            this.contentProperties.path = path;
            this.contentProperties.size = size;
            this.contentProperties.fillColor = fillColor;
            this.contentProperties.strokeWidth = strokeWidth;
            this.contentProperties.strokeColor = strokeColor;
            return this;
        }

        setPictureContent(size, src, srcActive = undefined) {
            this.contentProperties.type = "Picture";
            this.contentProperties.src = src;
            if(srcActive) this.contentProperties.srcActive = srcActive;
            this.contentProperties.size = size;
            return this;
        }

        setTextContent(x, y, size, label, fontSize, font, color) {
            this.contentProperties.type = "Text";
            this.contentProperties.size = size;
            this.contentProperties.label = label;
            this.contentProperties.fontSize = fontSize;
            this.contentProperties.font = font;
            this.contentProperties.color = color;
            this.contentProperties.x = x;
            this.contentProperties.y = y;
            return this;
        }

        setTriangleContent(width, height, direction, fillColor, strokeWidth, strokeColor) {
            this.contentProperties.type = "Triangle";
            this.contentProperties.width = width;
            this.contentProperties.height = height;
            this.contentProperties.direction = direction;
            this.contentProperties.fillColor = fillColor;
            this.contentProperties.strokeWidth = strokeWidth;
            this.contentProperties.strokeColor = strokeColor;
            return this;
        }

        setBorderDefaultColor(fillColor, strokeWidth, strokeColor) {
            this.borderProperties.default.fillColor = fillColor;
            this.borderProperties.default.strokeWidth = strokeWidth;
            this.borderProperties.default.strokeColor = strokeColor;
            return this;
        }

        setBorderActionColor(fillColor, strokeWidth, strokeColor) {
            this.borderProperties.action.fillColor = fillColor;
            this.borderProperties.action.strokeWidth = strokeWidth;
            this.borderProperties.action.strokeColor = strokeColor;
            return this;
        }

        setBorderSize(size) {
            this.borderProperties.size = size;
            return this;
        }
    }

    class Icon {
        constructor(manipulator, iconSetting) {
            this.action = false;
            this.iconSetting = iconSetting;
            this.manipulator = new Manipulator(this).addOrdonator(2);

            let borderProperties = this.iconSetting.borderProperties;
            let contentProperties = this.iconSetting.contentProperties;

            var _createBorder = (borderProperties) => {
                this.border = new svg.Circle(borderProperties.size)
                    .color(borderProperties.default.fillColor,
                        borderProperties.default.strokeWidth,
                        borderProperties.default.strokeColor);
                this.manipulator.set(0, this.border);
            };
            var _createContent = (contentProperties) => {
                switch (contentProperties.type) {
                    case "Triangle":
                        this.content = new svg.Triangle(contentProperties.width, contentProperties.height, contentProperties.direction)
                            .color(contentProperties.fillColor, contentProperties.strokeWidth, contentProperties.strokeColor);
                        break;
                    case "Text":
                        this.content = new svg.Text(contentProperties.label)
                            .dimension(contentProperties.size, contentProperties.size)
                            .font(contentProperties.font, contentProperties.fontSize)
                            .color(contentProperties.color)
                            .position(contentProperties.x, contentProperties.y)
                        this.manipulator.set(1, this.content);
                        break;
                    case "Path":
                        let middlePoint = {x: this.border.x, y: this.border.y};
                        let pathToDraw = contentProperties.path;

                        let path = new svg.Path(middlePoint.x, middlePoint.y)
                            .color(contentProperties.fillColor, contentProperties.strokeWidth, contentProperties.strokeColor)
                            .move(middlePoint.x + pathToDraw[0].x, middlePoint.y + pathToDraw[0].y);
                        for (let i = 1; i < pathToDraw.length; i++) {
                            path.line(middlePoint.x + pathToDraw[i].x, middlePoint.y + pathToDraw[i].y);
                        }
                        this.content = path;
                        break;
                    case "Polygon":
                        let polygon = new svg.Polygon().add(contentProperties.points)
                            .color(contentProperties.fillColor, contentProperties.strokeWidth, contentProperties.strokeColor);
                        this.content = polygon;
                        break;
                    case "Picture":
                        let pic = this.imageSVG = new svg.Image(contentProperties.src)
                            .dimension(contentProperties.size, contentProperties.size);
                        this.content = pic;
                        break;
                }
            };

            _createBorder(borderProperties);
            _createContent(contentProperties);

            (contentProperties.type != "None") && this.manipulator.set(1, this.content);
            (borderProperties.layer && borderProperties.layer >= 0) ? manipulator.set(borderProperties.layer, this.manipulator)
                : manipulator.add(this.manipulator);
        }

        mark(id){
            this.id = id;
            this.manipulator.mark(id);
            return this;
        }

        changeContentPollygonColor(fillColor, strokeWidth, strokeColor) {
            if (this.iconSetting.contentProperties.type == "Polygon") {
                this.iconSetting.changeContentColor(fillColor, strokeWidth, strokeColor);
                this.content.color(fillColor, strokeWidth, strokeColor);
            }
        }

        getSize() {
            return this.iconSetting.borderProperties.size;
        }

        getContentSize() {
            return this.iconSetting.contentProperties.size;
        }

        position(x, y) {
            this.manipulator.move(x, y);
            return this;
        }

        rotate(rotation) {
            this.manipulator.rotate(rotation);
            return this;
        }

        showActualBorder() {
            (this.action) ? this.showBorderActionColor() : this.showBorderDefaultColor();
        }

        showBorderActionColor() {
            let borderProperties = this.iconSetting.borderProperties.action;
            this.border.color(borderProperties.fillColor, borderProperties.strokeWidth, borderProperties.strokeColor);
            return this;
        }

        showBorderDefaultColor() {
            let borderProperties = this.iconSetting.borderProperties.default;
            this.border.color(borderProperties.fillColor, borderProperties.strokeWidth, borderProperties.strokeColor);
            return this;
        }

        addEvent(eventName, handler) {
            this.manipulator.addEvent(eventName, handler);
            return this;
        }

        changeStatusActionIcon() {
            this.action = !this.action;

            let contentProperties = this.iconSetting.contentProperties;
            if(contentProperties.type == "Picture"){
                if(this.action){
                    this.imageSVG.url(contentProperties.srcActive);
                }else{
                    this.imageSVG.url(contentProperties.src);
                }
            }

            this.changeStatusHandler && this.changeStatusHandler();
        }

        changeStatusHandler(handler){
            this.changeStatusHandler = handler;
        }

        activeStatusActionIcon() {
            this.action = true;

            let contentProperties = this.iconSetting.contentProperties;
            if(contentProperties.type == "Picture"){
                this.imageSVG.url(contentProperties.srcActive);
            }
        }

        cancelActionIcon() {
            this.action = false;

            let contentProperties = this.iconSetting.contentProperties;
            if(contentProperties.type == "Picture"){
                this.imageSVG.url(contentProperties.src);
            }
        }

        isInAction() {
            return this.action;
        }

        getStatus(){
            return this.action;
        }

    }

    class IconCreator {
        constructor() {

        }

        createIconByName(name, manipulator, layer) {
            switch (name) {
                case'done':
                    return this.createDoneIcon(manipulator, layer);
                    break;
                case'undone':
                    return this.createUndoneIcon(manipulator, layer);
                    break;
                case'inProgress':
                    return this.createInProgressIcon(manipulator, layer);
                    break;
                case'NotPublished':
                    return null;
                    break;
                case'Edited':
                    return this.createEditedIcon(manipulator, layer);
                    break;
                case'Published':
                    return this.createDoneIcon(manipulator, layer);
                    break;
                default:
                    break;
            }
        }

        createUndoneIcon(manipulator, layer) {
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.blue, 0, myColors.none)
                .setBorderActionColor(myColors.blue, 1, myColors.darkBlue)
                .setTriangleContent(8, 8, 'E', myColors.none, 3, myColors.white);
            let icon = new Icon(manipulator, iconSetting);
            return icon;
        }

        createInProgressIcon(manipulator, layer) {
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.orange, 1, myColors.none)
                .setBorderActionColor(myColors.orange, 1, myColors.darkBlue)
                .setTextContent(0, -ICON_SIZE/2, ICON_SIZE, "...", 20, FONT, myColors.white);
            let icon = new Icon(manipulator, iconSetting);
            return icon;
        }

        createDoneIcon(manipulator, layer) {
            var _getPathCheckContent = (size) => {
                let path = [{x: -.3 * size, y: -.1 * size}, {x: -.1 * size, y: .2 * size},
                    {x: +.3 * size, y: -.3 * size}];
                return path;
            };

            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.green, 0, myColors.none)
                .setBorderActionColor(myColors.green, 1, myColors.darkBlue)
                .setPathContent(_getPathCheckContent(ICON_SIZE * 1.75), ICON_SIZE * 2, myColors.none, 3, myColors.white);
            let icon = new Icon(manipulator, iconSetting);
            return icon;
        }

        createEditedIcon(manipulator, layer) {
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.orange, 0, myColors.none)
                .setBorderActionColor(myColors.orange, 1, myColors.darkBlue)
                .setTextContent(0, 0, ICON_SIZE, "!", 23, FONT, myColors.white);
            let icon = new Icon(manipulator, iconSetting);
            return icon;
        }

        static createPlusIcon(manipulator, layer) {
            var _getPathPlus = (size) => {
                var strokePlus = size / 5;
                var sizePlus = size * 2 / 3;

                let point = [
                    [-sizePlus, -strokePlus], [-strokePlus, -strokePlus], [-strokePlus, -sizePlus],
                    [strokePlus, -sizePlus], [strokePlus, -strokePlus], [sizePlus, -strokePlus],
                    [sizePlus, +strokePlus], [strokePlus, strokePlus], [strokePlus, sizePlus],
                    [-strokePlus, sizePlus], [-strokePlus, strokePlus], [-sizePlus, +strokePlus]
                ];
                return point;
            };

            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setPolygonContent(_getPathPlus(ICON_SIZE),[98, 221, 204], 1,[98, 221, 204]);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        };

        static createRedCrossIcon(manipulator, layer) {
            let icon = this.createPlusIcon(manipulator, layer);
            icon.changeContentPollygonColor(myColors.lightgrey, 1, myColors.black);
            icon.rotate(45);
            return icon;
        }

        static createXClose(fontSize,buttonSize, clickHandler){

            let textX = new svg.Text("x").font(FONT,fontSize );
            let rectX = new svg.Rect(buttonSize,buttonSize ).opacity(1/1000);
            let manipX = new Manipulator(this);
            manipX.add(textX).add(rectX);
            manipX.addEvent( 'click' ,clickHandler)
            textX.position(0,fontSize/3);

            let resultX = {

                text :  textX ,
                rect : rectX,
                manipulator : manipX

            }


           return resultX ;

        }

        /*createSettingIcon(manipulator, layer) {
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.ultraLightGrey, 0, myColors.none)
                .setPictureContent("../images/settings.png", (ICON_SIZE * 2) * 0.8);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }*/

        static createExplanationIcon(manipulator, layer) {
            let radiusSize = 15;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setBorderActionColor(myColors.green, 0, myColors.none)
                .setPictureContent((radiusSize*2)*0.8, "../images/info.png");
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }


        static createAddImage(manipulator, layer){
            let radiusSize = 20;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setBorderActionColor(myColors.green, 0, myColors.none)
                .setPictureContent((radiusSize*2)*0.8, "../images/ajoutImage.png");
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }
        static createVoiceIcon(manipulator, layer){
            let radiusSize = 20;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setBorderActionColor(myColors.green, 0, myColors.none)
                .setPictureContent((radiusSize*2)*0.8, "../images/speaker.png");
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }

        static createLockUnlockIcon(manipulator, layer) {
            let radiusSize = 15;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.white, 1, myColors.black)
                .setBorderActionColor(myColors.white, 1, myColors.black)
                .setPictureContent((radiusSize*2)*0.8, "../images/unlock.png", "../images/lock.png");
            let icon = new Icon(manipulator, iconSetting);
            icon.addEvent('click', () => {
                icon.changeStatusActionIcon();
            });
            return icon;
        }


        static getRadiusContent() {
            return ICON_SIZE;
        }

        static createImageIcon(src, manipulator, layer) {
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setPictureContent(ICON_SIZE * 2, src);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }
    }

    return {
        PopOut,
        IconCreator
    };
};