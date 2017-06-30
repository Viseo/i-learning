/**
 * Created by TBE3610 on 12/06/2017.
 */

exports.Lists = function (globalVariables) {
    let
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        Manipulator = globalVariables.Handlers.Manipulator;

    class ListView {
        constructor(listElements, direction, listW, listH, chevronW, chevronH, eleW, eleH,
                    chevronThickness, color = myColors.white, marge = 0) {
            var _declareManipulator = () => {
                this.manipulator = new Manipulator(this);
                this.chevronsLTManipulator = new Manipulator(this);
                this.chevronsRDManipulator = new Manipulator(this);
                this.contentManip = new Manipulator(this);
                this.chevronManip = new Manipulator(this);
                this.manipulator.add(this.chevronManip).add(this.component);
            };
            var _declareDimension = () => {
                this.marge = marge;

                this.eleDim = {w: eleW + this.marge, h: eleH + this.marge};
                this.listDim = (direction == "V") ? {w : listW, h: listH - chevronH*2} : {w : listW - chevronW*2, h: listH} ;
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

                this.nbElementToshow = Math.floor(this.listDim.h/ this.eleDim.h);

                this.border = new svg.Rect(listW, listH);
                this.chevronManip.add(this.border);
                if (chevronW !=0 && chevronH !=0) {
                    let posYChevron = (listH - chevronH)/2;

                    this.chevrons.top = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'N')
                        .color(myColors.black, 0, myColors.none)
                        .position(0, -posYChevron)
                        .mark('listChevronTop');
                    this.chevrons.top.border =  new svg.Rect(listW-2, chevronH-2)
                        .color(color, 0, myColors.yellow).position(0, -posYChevron);
                    this.chevronsLTManipulator
                        .add(this.chevrons.top.border)
                        .add(this.chevrons.top);

                    this.chevrons.down = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'S')
                        .color(myColors.black, 0, myColors.none)
                        .position(0, posYChevron)
                        .mark('listChevronBottom');
                    this.chevrons.down.border =  new svg.Rect(listW-2, chevronH-2)
                        .color(color, 0, myColors.yellow).position(0, posYChevron);
                    this.chevronsRDManipulator
                        .add(this.chevrons.down.border)
                        .add(this.chevrons.down);

                    this.chevronsLTManipulator.addEvent('click', onClickChevronTop);
                    this.chevronsRDManipulator.addEvent('click', onClickChevronDown);
                }
                let heighView = listH - (MARGIN + this.chevronDim.h)*2;

                this.contentManip.move(listW/2, eleH/2);
                this.view = new svg.Drawing(listW, heighView)
                    .position(-listW / 2, -heighView / 2);
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

                this.nbElementToshow = Math.floor(this.listDim.w/ this.eleDim.w);
                this.border = new svg.Rect(listW, listH);
                this.chevronManip.add(this.border);
                if (chevronW !=0 && chevronH !=0) {
                    let posXChevron = (listW - chevronW)/2;
                    this.chevrons.left = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'W')
                        .color(myColors.black, 0, myColors.none)
                        .position(-posXChevron, 0)
                        .mark('listChevronLeft');
                    this.chevrons.left.border =  new svg.Rect(chevronW-2, listH-2)
                        .color(color, 0, myColors.black).position(-posXChevron, 0);
                    this.chevronsLTManipulator
                        .add(this.chevrons.left.border)
                        .add(this.chevrons.left);

                    this.chevrons.right = new svg.Chevron(this.chevronDim.w, this.chevronDim.h, this.chevronDim.thickness, 'E')
                        .color(myColors.black, 0, myColors.none)
                        .position( posXChevron, 0)
                        .mark('listChevronRight');
                    this.chevrons.right.border =  new svg.Rect(chevronW-2, listH-2)
                        .color(color, 0, myColors.black).position(posXChevron, 0);
                    this.chevronsRDManipulator
                        .add(this.chevrons.right.border)
                        .add(this.chevrons.right);

                    this.chevronsLTManipulator.addEvent('click', onClickChevronLeft);
                    this.chevronsRDManipulator.addEvent('click', onClickChevronRight);
                }
                let widthView = listW - (MARGIN + this.chevronDim.w)*2;
                this.contentManip.move(eleW/2, listH/2);
                this.view = new svg.Drawing(widthView, listH)
                    .position(-widthView / 2, -listH / 2);
            }
            this.height = listH;
            this.width = listW;
            this.chevronManip
                .add(this.chevronsLTManipulator)
                .add(this.chevronsRDManipulator);

            this.border.color(color, 1, myColors.black).corners(5);


            this.contentBorder = new svg.Rect(listW, listH).color([], 0, [0, 0, 0]);

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

        getListDim(){
            return this.listDim;
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
                this.chevronManip.add(this.chevronsLTManipulator);
                this.chevronManip.add(this.chevronsRDManipulator);
            };

            var _showOnlyLeftOrTopChevron = () => {
                this.chevronManip.add(this.chevronsLTManipulator);
                this.chevronManip.remove(this.chevronsRDManipulator);
            };

            var _showOnlyRightOrDownChevron = () => {
                this.chevronManip.add(this.chevronsRDManipulator);
                this.chevronManip.remove(this.chevronsLTManipulator);
            };

            var _hideAllQuestionChevron = () => {
                this.chevronManip.remove(this.chevronsLTManipulator);
                this.chevronManip.remove(this.chevronsRDManipulator);
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

    class SelectItemList {
        constructor(width, height, selectItemViewElement, rootItemLabel = "") {
            this.list = [];
            this.itemWidth = width;
            this.itemHeight = height;
            if (!selectItemViewElement) {
                this.rootItemElement = new SelectItem(this.itemWidth, this.itemHeight, rootItemLabel, 0);
                this.list.push(this.rootItemElement);
            } else {
                this.rootItemElement = selectItemViewElement.duplicate();
                this.list.push(this.rootItemElement);
            }
            this.scrollable = true;
            this.highlight = true;
            this.highlightColor = myColors.blue;
            this.manipulator = new Manipulator(this);
            this._updateCurrentList();
        }

        addItem(label, index) {
            this.list.push(new SelectItem(this.itemWidth, this.itemHeight, label, index));
            this._updateCurrentList();
        }

        color(newColor) {
            this.list.forEach(selectItem => {
                selectItem.color(newColor);
            })
        }

        // copySelectItem(index) {
        //     let copyElement = new SelectItem(this.itemWidth, this.itemHeight, this.list[index].getText(),0);
        //     return copyElement;
        // }

        corners(radiusX, radiusY) {
            this.list.forEach(selectItem => {
                selectItem.corners(radiusX,radiusY);
            })
        }

        getSelectedItem(index) {
            return this.list[index];
        }

        highlightHandler(selectItem) {
            selectItem.setHighlightColor(this.highlightColor);
            selectItem.addEvent('mouseleave', () => selectItem.setHighlightColor(myColors.white));
        }

        move(x, y) {
            this.manipulator.move(x, y);
        }

        removeItem(index) {
            this.list.remove(this.getSelectedItem(index));
        }

        setClickAction(clickHandler) {
            this.list.forEach(selectItem => {
                selectItem.setClickAction(clickHandler, true);
            })
        }

        setClickAction(clickHandler, ruleIndex) {   // complete or progress solutions
            this.list.forEach(selectItem => {
                selectItem.setClickAction(clickHandler, true, ruleIndex);
            })
        }

        setHighlightItems(flag) {
            this.highlight = flag;
        }

        setHighlightOptions(backgroundColor) {
            this.highlightColor = backgroundColor;
        }

        setScrollable(flag) {
            this.scrollable = flag;
        }

        toggleEvents(selectItem) {
            if (this.highlight && this.highlightColor) {
                selectItem.addEvent('mouseenter', () => this.highlightHandler(selectItem));
            }
            if (this.scrollable) {
                selectItem.addEvent('wheel', () => {console.log('HotWheels')});
            }
        }

        _updateCurrentList() {
            this.list.forEach(selectItem => {
                this.toggleEvents(selectItem);
                this.manipulator.remove(selectItem.manipulator);
                this.manipulator.add(selectItem.manipulator);
                selectItem.move(0,selectItem.index * this.itemHeight);
            });
        }

    }

    class SelectItem {
        constructor(itemWidth, itemHeight, textContent = "", index) {
            this.width = itemWidth;
            this.height = itemHeight;
            this.textContent = new svg.Text(textContent)
                .font('Arial', 18)
                .position(0,5);
            this.textRect = new svg.Rect(this.width, this.height)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            this.index = index;
            this.manipulator = new Manipulator(this);
            this.manipulator
                .add(this.textRect)
                .add(this.textContent);
        }

        addEvent(eventName, handler) {
            this.manipulator.addEvent(eventName, handler);
        }

        color(newColor) {
            this.textRect.color(newColor, 1, myColors.grey);
        }

        corners(radiusX, radiusY) {
            this.textRect.corners(radiusX,radiusY);
        }

        duplicate() {
            return new SelectItem(this.getWidth(), this.getHeight(), this.getText(), this.getIndex());
        }

        getWidth() {
            return this.width;
        }

        getHeight() {
            return this.height;
        }

        getIndex() {
            return this.index;
        }

        getText() {
            return this.textContent.messageText;
        }

        move(x, y) {
            this.manipulator.move(x,y);
        }


        mark(id) {
            this.manipulator.mark(id);
        }

        position(x,y) {

        }

        setClickAction(clickHandler, flag) {    // flag == false => afficher la liste SelectItemList
            this.manipulator.addEvent('click', ()=>clickHandler(this, flag));
        }

        setClickAction(clickHandler, flag, ruleIndex) { // complete or progress solutions
            this.manipulator.addEvent('click', ()=>clickHandler(this, flag, ruleIndex));
        }

        _setRectBgdColor(color) {
            this.textRect.color(color, 1, myColors.grey);
        }

        setHighlightColor(color) {
            this._setRectBgdColor(color);
        }

        setText(messageText) {
            this.textContent.message(messageText);
        }
    }

    class SelectItemList2 {
        constructor(listElements, width, height){
            this.direction = "V";
            this.width = width;
            this.height = height;

            this.manipulator = new Manipulator(this);
            this.listElements = listElements;
            this.selectButton = new gui.Button(width, height, [myColors.none, 1, myColors.black],
                (this.listElements.length > 0) ? this.listElements[0] : '');
            this.selectButton.back.corners(5, 5);

            let chevronSize = {w: 100, h: 30};

            this.listView = new ListManipulatorView([], this.direction, this.width, this.height*3 + chevronSize.h*2,
                chevronSize.w, chevronSize.h, this.width, this.height, 10, myColors.lightgrey);
            listElements.forEach(ele => {
                let manip = new Manipulator(this);
                let choice = new gui.Button(width, height, [myColors.none, 1, myColors.black], ele);
                choice.back.corners(5, 5);
                choice.onClick(() => {
                    this.onClickChangeValueHandler && this.onClickChangeValueHandler(choice);
                    this.setSelectButtonText(ele);
                    this.hideListView();
                });
                manip.add(choice.component);

                this.listView.add(manip);
            });
            this.listView.refreshListView();
            this.listView.manipulator.move(0, (this.listView.height + this.height)/2);


            this.selectButton.onClick(() => {
                if(this.manipShowList){
                    this.manipShowList.add(this.listView.manipulator);
                    //let localP = this.selectButton.component.localPoint();
                    this.listView.manipulator.move(0, this.selectButton.component.y);
                }else{
                    this.manipulator.add(this.listView.manipulator);
                }
            });
    
            this.manipulator.add(this.selectButton.component);
        }

        setManipShowListAndPosition(manipShowList, x, y) {
            this.manipShowList = manipShowList;
        }

        position(x, y){
            this.manipulator.move(x, y);
            return this;
        };

        getSelectButtonText(button) {
            return button.text.getMessageText();
        }

        hideListView() {
            if(this.manipShowList){
                this.manipShowList.remove(this.listView.manipulator);
            }else{
                this.manipulator.remove(this.listView.manipulator);
            }
        }

        setSelectButtonText(label) {
            this.selectButton.text.message(label);
        }

        setHandlerChangeValue(handler) {
            this.onClickChangeValueHandler = handler;
        }

    }

    return {
        ListManipulatorView,
        SelectItemList,
        SelectItem,
        SelectItemList2
    };
};