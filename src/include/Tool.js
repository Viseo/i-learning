/**
 * Created by minhhuyle on 25/04/17.
 */

exports.Tool = function (globalVariables, classContainer) {


    let
        svg = globalVariables.svg,
        Manipulator = globalVariables.util.Manipulator,
        Picture = globalVariables.util.Picture,
        PopOut = globalVariables.util.PopOut;

    const
        ICON_SIZE = 15,
        MARGIN = 10;


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
                        this.content = autoAdjustText(contentProperties.label, contentProperties.size, contentProperties.size,
                            contentProperties.fontSize, contentProperties.font, this.manipulator).text;
                        this.content.color(contentProperties.color).position(contentProperties.x, contentProperties.y);
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
            /*svg.addEvent(this.border, eventName, handler);
             (this.content) && svg.addEvent(this.content, eventName, handler);*/
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
                .setTextContent(0, 0, ICON_SIZE, "...", 20, "Arial", myColors.white);
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
                .setTextContent(0, ICON_SIZE / 2, ICON_SIZE, "!", 23, "Arial", myColors.white);
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
            let radiusSize = 30;
            let iconSetting = new IconSetting().setBorderLayer(layer).setBorderSize(radiusSize)
                .setBorderDefaultColor(myColors.none, 0, myColors.none)
                .setBorderActionColor(myColors.green, 0, myColors.none)
                .setPictureContent("../images/quiz/explanation.png", (radiusSize * 2) * 0.8);
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


    class ListView {

        constructor(listElements, nbElementToShow, direction, listW, listH, chevronW, chevronH, chevronThickness, color) {
            this.listElements = listElements;
            this.nbElementToshow = nbElementToShow;
            this.direction = direction;
            this.indexShow = 0;

            this.listDim = {w : listW, h: listH};
            this.chevronDim = {w: chevronW - MARGIN, h:chevronH - MARGIN, thickness: chevronThickness};

            this.component = new svg.Translation();
            this.component.focus = this;

            this.chevrons = {};

            this.manipulator = new Manipulator(this);
            this.contentManip = new Manipulator(this);
            this.chevronManip = new Manipulator(this);
            this.manipulator.add(this.chevronManip)
                .add(this.component);


            if(direction == "V"){
                this.borderWithChevrons = new svg.Rect(listW, listH + chevronH*2).color(myColors.red, 0, [0, 0, 0]);
            }else{
                var onClickChevronLeft = () => {
                    this.indexShow++;
                    this.moveContent(this.indexShow*this.sectionSize, 0);
                    this._showActualChevron();
                };

                var onClickChevronRight = () => {
                    this.indexShow--;
                    this.moveContent(this.indexShow*this.sectionSize, 0);
                    this._showActualChevron();
                };

                this.sectionSize = this.listDim.w / this.nbElementToshow;

                this.borderWithChevrons = new svg.Rect(listW + chevronW*2, listH).color(myColors.red, 4, myColors.black);
                this.chevrons.left = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'W')
                    .color(myColors.black, 0, myColors.none)
                    .position(-listW/2 - chevronW/2, 0);
                this.chevrons.right = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'E')
                    .color(myColors.black, 0, myColors.none)
                    .position(listW/2 + chevronW/2, 0);
                this.chevronManip.add(this.borderWithChevrons);
                this.chevronManip.add(this.chevrons.left);
                this.chevronManip.add(this.chevrons.right);

                this.chevrons.left.onClick(onClickChevronLeft);
                this.chevrons.right.onClick(onClickChevronRight);
            }


            this.border = new svg.Rect(listW, listH).color([], 0, [0, 0, 0]);
            this.view = new svg.Drawing(listW, listH).position(-listW / 2, -listH / 2);
            this.translate = new svg.Translation();
            this.component.add(this.view.add(this.translate)).add(this.border);


            this.back = new svg.Rect(listW, listH).color(color, 0, []).mark("background");
            this.content = new svg.Translation().mark("content");
            this.content.width = listW;
            this.content.height = listH;

            this.content.add(this.contentManip.component);

            this.translate.add(this.back.position(listW / 2, listH / 2)).add(this.content);


            this._showActualChevron();
        }


        refresh() {
            if(this.direction == "V"){

            }else{
                for (let i = 0; i < this.listElements.length; i++) {
                    this.listElements[i].position(this.sectionSize * (i  + this.indexShow), 0);
                }
            }

            this._showActualChevron();
        }


        position(x, y) {
            this.manipulator.move(x, y);
            return this;
        }

        add(component) {
            this.contentManip.add(component);
            return this;
        }


        remove(component) {
            this.contentManip.remove(component);
            return this;
        }


        moveContentManip(x, y){
            this.content.remove(this.contentManip.component);
            this.contentManip.move(x, y);
            this.content.add(this.contentManip.component);
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
                this.content.onChannel().smoothy(100, 25)
                    .execute(completeMovement).moveTo(vx, vy);
            }
            return this;
        }

        color(color) {
            this.back.color(color, 0, []);
            return this;
        }


        _showActualChevron(){
            var _showAllChevron = () => {
                this.chevrons.left && this.chevronManip.add(this.chevrons.left);
                this.chevrons.right && this.chevronManip.add(this.chevrons.right);
            };

            var _showOnlyLChevron = () => {
                this.chevrons.left && this.chevronManip.add(this.chevrons.left);
                this.chevrons.right && this.chevronManip.remove(this.chevrons.right);
            };

            var _showOnlyRChevron = () => {
                this.chevrons.left && this.chevronManip.remove(this.chevrons.left);
                this.chevrons.right && this.chevronManip.add(this.chevrons.right);
            };

            var _hideAllQuestionChevron = () => {
                this.chevrons.left && this.chevronManip.remove(this.chevrons.left);
                this.chevrons.right && this.chevronManip.remove(this.chevrons.right);
            };


            let tmpIndex = -this.indexShow + (this.nbElementToshow-1);

            if(this.indexShow < 0 && -this.indexShow + (this.nbElementToshow) < this.listElements.length){
                _showAllChevron();
            }else if (this.indexShow != 0 && -this.indexShow + this.nbElementToshow >= this.listElements.length){
                _showOnlyLChevron();
            }else if (-this.indexShow + (this.nbElementToshow) < this.listElements.length){
                _showOnlyRChevron();
            }else{
                _hideAllQuestionChevron();
            }
        }
    }


    return {
        IconCreator,
        createRating,
        ListView
    };
};