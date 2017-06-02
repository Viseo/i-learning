/**
 * Created by minhhuyle on 25/04/17.
 */

exports.Tool = function (globalVariables) {
    let
        svg = globalVariables.svg,
        drawings = globalVariables.drawings,
        drawing = globalVariables.drawing,
        Manipulator = globalVariables.util.Manipulator;

    const
        ICON_SIZE = 15,
        MARGIN = 10;

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

        setPictureContent(src, size) {
            this.contentProperties.type = "Picture";
            this.contentProperties.src = src;
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
        }

        activeStatusActionIcon() {
            this.action = true;
        }

        cancelActionIcon() {
            this.action = false;
        }

        isInAction() {
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
                .setTextContent(0, -ICON_SIZE/2, ICON_SIZE, "...", 20, "Arial", myColors.white);
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
                .setTextContent(0, 0, ICON_SIZE, "!", 23, "Arial", myColors.white);
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
                .setPolygonContent(_getPathPlus(ICON_SIZE), myColors.blue, 2, myColors.black);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        };

        static createRedCrossIcon(manipulator, layer) {
            let icon = this.createPlusIcon(manipulator, layer);
            icon.changeContentPollygonColor(myColors.red, 1, myColors.black);
            icon.rotate(45);
            return icon;
        }

        createSettingIcon(manipulator, layer) {
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.ultraLightGrey, 0, myColors.none)
                .setPictureContent("../images/settings.png", (ICON_SIZE * 2) * 0.8);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }

        static createExplanationIcon(manipulator, layer) {
            let radiusSize = 25;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setBorderActionColor(myColors.green, 0, myColors.none)
                .setPictureContent("../images/quiz/explanation.png", (radiusSize*2)*0.8);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }


        static createAddImage(manipulator, layer){
            let radiusSize = 20;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setBorderActionColor(myColors.green, 0, myColors.none)
                .setPictureContent("../images/ajoutImage.png", (radiusSize*2)*0.8);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }
        static createVoiceIcon(manipulator, layer){
            let radiusSize = 20;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setBorderActionColor(myColors.green, 0, myColors.none)
                .setPictureContent("../images/speaker.png", (radiusSize*2)*0.8);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }



        static getRadiusContent() {
            return ICON_SIZE;
        }

        static createImageIcon(src, manipulator, layer) {
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(ICON_SIZE)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setPictureContent(src, ICON_SIZE * 2);
            let icon = new Icon(manipulator, iconSetting);

            return icon;
        }
    }

    function createRating(manipulator, layer) {
        const STAR_SPACE = 4;
        const defaultColor = {
            fillColor: myColors.yellow,
            strokeWidth: 0.2,
            strokeColor: myColors.yellow
        };

        const starsNoteEnum = {
            'star1': 'Pas Terrible',
            'star2': 'Passable',
            'star3': 'Correcte',
            'star4': 'Bien',
            'star5': 'Excellente'
        };

        let star = [];
        let starPoints = [
            [1.309, 0], [1.6180, 0.9511], [2.6180, 0.9511], [1.8090, 1.5388], [2.118, 2.4899],
            [1.3090, 1.9021], [0.5, 2.4899], [0.8090, 1.5388], [0, 0.9511], [1, 0.9511]
        ];

        var _createDrawStars = () => {
            star.starsManipulator = new Manipulator(this).addOrdonator(5);
            for (var i = 0; i < 5; i++) {
                star[i] = new svg.Polygon().add(starPoints).position(STAR_SPACE * i, 0)
                    .color(defaultColor.fillColor, defaultColor.strokeWidth, defaultColor.strokeColor)
                    .mark("star" + (i + 1));
                star.starsManipulator.add(star[i]);
            }
        };
        var _createPopOut = () => {
            star.pop = new PopOut(80, 30, null, manipulator, true);
            star.pop.setPanel();
        };

        _createDrawStars(star);
        _createPopOut();
        if (layer) {
            manipulator.set(layer, star.starsManipulator);
        }
        else {
            manipulator.add(star.starsManipulator);
        }
        star.scaleStar = function (factor) {
            this.starsManipulator.scalor.scale(factor);
            return this;
        };

        star.popMark = function (label) {
            this.pop.manipulator.mark(label + 'StarMiniatures');
            this.starsManipulator.mark(label + 'StarManip');
            return this;
        };

        star.showStarDefaultColor = function () {
            this.forEach(elem => elem.color(defaultColor.fillColor, defaultColor.strokeWidth, defaultColor.strokeColor));
        };

        star.starPosition = function (x, y) {
            this.starsManipulator.move(x, y);
            return this;
        };

        star.getNoteEnum = function () {
            return starsNoteEnum;
        };

        star.popPosition = function (x, y) {
            this.pop.defineProperty(x, y);
            return this;
        };

        return star;
    }

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

    class ListView {

        constructor(listElements, direction, listW, listH, chevronW, chevronH, eleW, eleH,
                    chevronThickness, color = myColors.white, marge = 0) {
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.contentManip = new Manipulator(this);
                this.chevronManip = new Manipulator(this);
                this.manipulator.add(this.chevronManip).add(this.component);
            };
            var _declareDimension = () => {
                this.marge = marge;

                this.eleDim = {w: eleW + this.marge, h: eleH + this.marge};
                this.listDim = {w : listW, h: listH};
                this.chevronDim = {w: chevronW - MARGIN, h:chevronH - MARGIN, thickness: chevronThickness};
            };

            this.listElements = listElements;
            this.direction = direction;
            this.indexShow = 0;
            this.chevrons = {};
            this.component = new svg.Translation();
            this.component.focus = this;

            _declareDimension();
            _declareManipulator();

            let self = this;
            Object.defineProperty(self, "length", {
                get: function(){
                    return self.listElements.length;
                },
                set: function(len){
                    self.listElements.length = len;
                },
                configurable: true,
                enumerable: true
            })

            if(direction == "V"){
                var onClickChevronTop = () => {
                    this.indexShow++;
                    this.moveContent(0, this.indexShow*this.eleDim.h);
                    this._showActualChevron();
                };

                var onClickChevronDown = () => {
                    this.indexShow--;
                    this.moveContent(0, this.indexShow*this.eleDim.h);
                    this._showActualChevron();
                };

                this.nbElementToshow = Math.floor((this.listDim.h - this.marge) / this.eleDim.h);

                this.borderWithChevrons = new svg.Rect(listW, listH + chevronH*2);

                this.chevrons.top = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'N')
                    .color(myColors.black, 0, myColors.none)
                    .position(0, -listH/2 - chevronH/2);
                this.chevrons.down = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'S')
                    .color(myColors.black, 0, myColors.none)
                    .position(0, listH/2 + chevronH/2);
                this.chevronManip
                    .add(this.borderWithChevrons)
                    .add(this.chevrons.top)
                    .add(this.chevrons.down);

                this.chevrons.top.onClick(onClickChevronTop);
                this.chevrons.down.onClick(onClickChevronDown);

                this.contentManip.move(listW/2, eleH/2);
            }else{
                var onClickChevronLeft = () => {
                    this.indexShow++;
                    this.moveContent(this.indexShow*this.eleDim.w, 0);
                    this._showActualChevron();
                };

                var onClickChevronRight = () => {
                    this.indexShow--;
                    this.moveContent(this.indexShow*this.eleDim.w, 0);
                    this._showActualChevron();
                };

                this.nbElementToshow = Math.floor((this.listDim.w - this.marge) / this.eleDim.w);

                this.borderWithChevrons = new svg.Rect(listW + chevronW*2, listH);
                this.chevrons.left = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'W')
                    .color(myColors.black, 0, myColors.none)
                    .position(-listW/2 - chevronW/2, 0);
                this.chevrons.right = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'E')
                    .color(myColors.black, 0, myColors.none)
                    .position(listW/2 + chevronW/2, 0);
                this.chevronManip
                    .add(this.borderWithChevrons)
                    .add(this.chevrons.left)
                    .add(this.chevrons.right);

                this.chevrons.left.onClick(onClickChevronLeft);
                this.chevrons.right.onClick(onClickChevronRight);

                this.contentManip.move(eleW/2, listH/2);
            }

            this.borderWithChevrons.color(color, 1, myColors.black).corners(5);


            this.border = new svg.Rect(listW, listH).color([], 0, [0, 0, 0]);
            this.view = new svg.Drawing(listW, listH).position(-listW / 2, -listH / 2);
            this.translate = new svg.Translation();
            this.component.add(this.view.add(this.translate)).add(this.border);


            this.back = new svg.Rect(listW, listH).color(color, 0, []).mark("background");
            this.back.fillOpacity(0);
            this.content = new svg.Translation().mark("content");
            this.content.width = listW;
            this.content.height = listH;

            this.content.add(this.contentManip.component);

            this.translate.add(this.back.position(listW / 2, listH / 2)).add(this.content);


            this._showActualChevron();
        }

        position(x, y) {
            this.manipulator.move(x, y);
            return this;
        }


        moveContent(x, y) {
            let vx = x;
            let vy = y;
            let completeMovement = progress => {
                if (progress === 1) {
                    delete this.animation;
                }
            };
            if (!this.animation) {
                this.animation = true;
                this.content.onChannel().steppy(15, 5)
                    .execute(completeMovement).moveTo(vx, vy);
            }
            return this;
        }

        color(color) {
            this.back.color(color, 0, []);
            return this;
        }

        get(index){
            return this.listElements[index];
        }

        _showActualChevron(){
            var _showAllChevron = () => {
                this.chevrons.left && this.chevronManip.add(this.chevrons.left);
                this.chevrons.right && this.chevronManip.add(this.chevrons.right);
                this.chevrons.top && this.chevronManip.add(this.chevrons.top);
                this.chevrons.down && this.chevronManip.add(this.chevrons.down);
            };

            var _showOnlyLeftOrTopChevron = () => {
                this.chevrons.left && this.chevronManip.add(this.chevrons.left);
                this.chevrons.top && this.chevronManip.add(this.chevrons.top);
                this.chevrons.right && this.chevronManip.remove(this.chevrons.right);
                this.chevrons.down && this.chevronManip.remove(this.chevrons.down);
            };

            var _showOnlyRightOrDownChevron = () => {
                this.chevrons.left && this.chevronManip.remove(this.chevrons.left);
                this.chevrons.top && this.chevronManip.remove(this.chevrons.top);
                this.chevrons.right && this.chevronManip.add(this.chevrons.right);
                this.chevrons.down && this.chevronManip.add(this.chevrons.down);
            };

            var _hideAllQuestionChevron = () => {
                this.chevrons.left && this.chevronManip.remove(this.chevrons.left);
                this.chevrons.top && this.chevronManip.remove(this.chevrons.top);
                this.chevrons.right && this.chevronManip.remove(this.chevrons.right);
                this.chevrons.down && this.chevronManip.remove(this.chevrons.down);
            };

            if(this.indexShow < 0 && -this.indexShow + (this.nbElementToshow) < this.listElements.length){
                _showAllChevron();
            }else if (this.indexShow != 0 && -this.indexShow + this.nbElementToshow >= this.listElements.length){
                _showOnlyLeftOrTopChevron();
            }else if (-this.indexShow + (this.nbElementToshow) < this.listElements.length){
                _showOnlyRightOrDownChevron();
            }else{
                _hideAllQuestionChevron();
            }
        }
    }

    class ListSVGView extends ListView{
        refreshListView() {
            if(this.direction == "V"){
                for (let i = 0; i < this.listElements.length; i++) {
                    this.listElements[i].position(0, -this.content.y + this.marge + this.eleDim.h * (i  + this.indexShow));
                }
            }else{
                for (let i = 0; i < this.listElements.length; i++) {
                    this.listElements[i].position(-this.content.x + this.marge + this.eleDim.w * (i  + this.indexShow), 0);
                }
            }
            this._showActualChevron();
        }

        add(component){
            this.listElements.push(component);
            this.contentManip.add(component);
        }

        removeElementFromList(ele){
            this.listElements.remove(ele);
            this.contentManip.remove(ele);
        }

    }

    class ListManipulatorView extends ListView{
        refreshListView(){
            if(this.direction == "V"){
                for (let i = 0; i < this.listElements.length; i++) {
                    this.listElements[i].component.move(0, -this.content.y + this.marge + this.eleDim.h * (i  + this.indexShow));
                }
            }else{
                for (let i = 0; i < this.listElements.length; i++) {
                    this.listElements[i].component.move(-this.content.x + this.marge + this.eleDim.w * (i  + this.indexShow), 0);
                }
            }
            this._showActualChevron();
        }

        add(manip){
            this.listElements.push(manip);
            this.contentManip.add(manip.component);
        }

        empty(){
            this.listElements = [];
            this.contentManip.flush();
        }

        addManipInIndex(manip, index){
            this.listElements.splice(index, 0, manip);
            this.contentManip.add(manip.component);
        }

        removeElementFromList(manip){
            this.listElements.remove(manip);
            this.contentManip.remove(manip.component);
        }
    }

    return {
        PopOut,
        IconCreator,
        createRating,
        resizeStringForText,
        ListSVGView,
        ListManipulatorView
    };
};