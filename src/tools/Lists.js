/**
 * Created by TBE3610 on 12/06/2017.
 */

exports.Lists = function (globalVariables) {
    let
        svg = globalVariables.svg,
        Manipulator = globalVariables.Handlers.Manipulator;

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
            this.direction = direction;
            this.indexShow = 0;
            this.chevrons = {};
            this.component = new svg.Translation();
            this.component.focus = this;

            _declareDimension();
            _declareManipulator();
            this.chevrons = {};


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

                this.border = new svg.Rect(listW, listH + chevronH*2);
                this.chevronManip.add(this.border);
                if (chevronW !=0 && chevronH !=0) {
                    this.chevrons.top = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'N')
                        .color(myColors.black, 0, myColors.none)
                        .position(0, -listH / 2 - chevronH / 2);
                    this.chevrons.down = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'S')
                        .color(myColors.black, 0, myColors.none)
                        .position(0, listH / 2 + chevronH / 2);
                    this.chevronManip
                        .add(this.chevrons.top)
                        .add(this.chevrons.down);
                    this.chevrons.top.onClick(onClickChevronTop);
                    this.chevrons.down.onClick(onClickChevronDown);
                }

                this.height = listH + this.chevronDim.h;
                this.width = listW;
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
                this.border = new svg.Rect(listW + chevronW * 2, listH);
                this.chevronManip.add(this.border);
                if (chevronW !=0 && chevronH !=0) {
                    this.chevrons.left = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'W')
                        .color(myColors.black, 0, myColors.none)
                        .position(-listW / 2 - chevronW / 2, 0);
                    this.chevrons.right = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'E')
                        .color(myColors.black, 0, myColors.none)
                        .position(listW / 2 + chevronW / 2, 0);
                    this.chevronManip
                        .add(this.chevrons.left)
                        .add(this.chevrons.right);
                    this.chevrons.left.onClick(onClickChevronLeft);
                    this.chevrons.right.onClick(onClickChevronRight);
                }

                this.height = listH;
                this.width = listW + this.chevronDim.w;
                this.contentManip.move(eleW/2, listH/2);
            }

            this.border.color(color, 1, myColors.black).corners(5);


            this.contentBorder = new svg.Rect(listW, listH).color([], 0, [0, 0, 0]);
            this.view = new svg.Drawing(listW, listH).position(-listW / 2, -listH / 2);
            this.translate = new svg.Translation();
            this.component.add(this.view.add(this.translate)).add(this.contentBorder);


            this.back = new svg.Rect(listW, listH).color(color, 0, []).mark("background");
            this.back.fillOpacity(0);
            this.content = new svg.Translation().mark("content");
            this.content.width = listW;
            this.content.height = listH;


            this.content.add(this.contentManip.component);

            this.translate.add(this.back.position(listW / 2, listH / 2)).add(this.content);
            this.listElements = [];
            listElements.forEach(elem=>this.add(elem));

            this._showActualChevron();
        }

        markDropID(id){
            this.back.markDropID(id);
            this.content.markDropID(id);
            this.border.markDropID(id);
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

        getListElements(){
            return this.listElements;
        }
    }

    class ListSVGView extends ListView{
        addElementInit(array){
            array.forEach(elem=>this.contentManip.add(elem));
        }

        refreshListView() {
            if(this.direction == "V"){
                for (let i = 0; i < this.listElements.length; i++) {
                    this.listElements[i].move(0, -this.content.y + this.marge + this.eleDim.h * (i  + this.indexShow));
                }
            }else{
                for (let i = 0; i < this.listElements.length; i++) {
                    this.listElements[i].move(-this.content.x + this.marge + this.eleDim.w * (i  + this.indexShow), 0);
                }
            }
            this._showActualChevron();
        }

        add(component){
            let elemManip = new Manipulator(this)
            elemManip.add(component)
            this.listElements.push(elemManip);
            this.contentManip.add(elemManip);
        }

        removeElementFromList(ele){
            this.listElements.remove(ele);
            this.contentManip.remove(ele);
        }

    }

    class ListManipulatorView extends ListView{
        addElementInit(array){
            array.forEach(elem=>this.contentManip.add(elem.component));
        }

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

            if((this.indexShow < 0 && -this.indexShow + (this.nbElementToshow) < this.listElements.length) ||
                (this.indexShow != 0 && -this.indexShow + this.nbElementToshow >= this.listElements.length)){
                this.indexShow++;
            }
            this._showActualChevron();
        }
        resetAllMove(){
            this.listElements.forEach(manip => manip.move(0,0));
        }

        setList(list){
            let tmp = this.listElements.slice();
            tmp.forEach(elem=>this.removeElementFromList(elem))
            list.forEach(elem=>this.add(elem));
            this.refreshListView();
        }
    }

    return {
        ListSVGView,
        ListManipulatorView
    };
};