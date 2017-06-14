exports.DollAdminV = function(globalVariables){
    const View = globalVariables.View,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        gui = globalVariables.gui,
        svg = globalVariables.svg,
        svgr = globalVariables.runtime,
        INPUT_SIZE = {w: 400, h: 30},
        PANEL_SIZE = {w:drawing.width-2*MARGIN, h: drawing.height * 0.7},
        SANDBOX_SIZE = {w: PANEL_SIZE.w*6/9, h: PANEL_SIZE.h - 4*MARGIN, header: {w: PANEL_SIZE.w*6/9, h: 100 }},
        RIGHTBOX_SIZE = {w: PANEL_SIZE.w - SANDBOX_SIZE.w - 3*MARGIN,h: (PANEL_SIZE.h - 6*MARGIN)/2,
        header: {w :PANEL_SIZE.w - SANDBOX_SIZE.w, h: 0.2*(PANEL_SIZE.h - 5*MARGIN)/2}},
        TAB_SIZE={w:0.1*PANEL_SIZE.w, h: 0.1*PANEL_SIZE.h},
        ListManipulatorView = globalVariables.Tool.ListManipulatorView,
        resizeStringForText = globalVariables.Tool.resizeStringForText,
        HEADER_TILE = SANDBOX_SIZE.header.h - 2*MARGIN,
        installDnD = globalVariables.gui.installDnD,
        CONTEXT_TILE_SIZE = {w:150 - 2*MARGIN,h:27},
        IMAGE_SIZE = {w:30, h:30};

    class DollAdminV extends View{
        constructor(presenter){
            super(presenter);
            this.rules = false;
            this.textElements = [];
            this.rectElements = [];
            let declareActions = ()=>{
                this.actions = [];
                this.actionTabs = [];
                let textA = new svg.Text('T').font('Arial', HEADER_TILE).position(0,HEADER_TILE/3).mark('textTab');
                let rectA = new svg.Rect(HEADER_TILE, HEADER_TILE).color(myColors.blue).mark('rectTab');
                let pictureA = new svg.Image('../../images/ajoutImage.png').dimension(HEADER_TILE, HEADER_TILE).mark('pictureTab');
                let helpA = new svg.Image('../../images/info.png').dimension(HEADER_TILE, HEADER_TILE).mark('helpTab');
                this.width = drawing.width;
                this.height = drawing.height;
                this.actionModes = {
                    actions: {
                        'text':()=>{
                            svg.addEvent(this.sandboxMain.component, 'mousedown', (event)=>{this.textZoning(event)});
                        },
                        'rect': ()=>{
                            svgr.attr(drawing.component, 'style', 'cursor: crosshair');
                            svg.addEvent(this.sandboxMain.component, 'mousedown', (event)=>{
                                this.rectZoning(event);
                            })
                        },
                        'picture': ()=>{
                            this.displayPictureNavigation();
                        },
                        'help': ()=>{

                        }, 'none' : ()=>{
                            svg.removeEvent(this.sandboxMain.component, 'mousedown');
                            svg.removeEvent(this.sandboxMain.component, 'mousemove');
                            svg.removeEvent(this.sandboxMain.component, 'mouseup');
                            svgr.attr(drawing.component, 'style', 'cursor: auto');
                            this.actionModes.currentMode = 'none';
                        }},
                    currentMode: 'none'
                };
                this.actions.push(textA, rectA, pictureA, helpA);
                svg.addEvent(textA, 'click', ()=>{this.toggleMode('text')});
                svg.addEvent(rectA, 'click', ()=>{this.toggleMode('rect')});
                svg.addEvent(pictureA, 'click', ()=>{this.toggleMode('picture')});
                svg.addEvent(helpA, 'click', ()=>{this.toggleMode('help')});
                for (let i =0; i< this.actions.length; i++){
                    let manip = new Manipulator(this);
                    let rect = new svg.Rect(HEADER_TILE, HEADER_TILE).color(myColors.white, 1, myColors.grey).corners(3,3);
                    manip.add(rect);
                    manip.add(this.actions[i]);
                    manip.addEvent('click', this.actions[i].component.listeners['click']);
                    this.actionTabs.push(manip);
                }
            };
            declareActions();
            svg.addGlobalEvent('keydown',(event) => this.keyDown.call(this,event));
        }

        displayPictureNavigation(){
            let _createPopUpPicture = () => {
                const onChangeFileExplorerHandler = () => {
                    let files = this.fileExplorer.component.files;
                    if(files && files[0]){
                        this.uploadImageByFile(files[0], () => {}).then((data) => {
                            let pictureAddManip = new Manipulator(this);
                            let pic = new svg.Image(data.src).dimension(HEADER_TILE, HEADER_TILE);
                            pictureAddManip.add(pic);

                            this.listViewPicture.addManipInIndex(pictureAddManip, 2);
                            this.listViewPicture.refreshListView();
                        });
                    }


                };

                const fileExplorerHandler = () => {
                    if (!this.fileExplorer) {
                        let globalPointCenter ={x:drawing.w/2, y:drawing.h/2};
                        var fileExplorerStyle = {
                            leftpx: globalPointCenter.x,
                            toppx: globalPointCenter.y,
                            width: this.width / 5,
                            height: this.height / 2
                        };
                        this.fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
                        this.fileExplorer.type("file");
                        svg.addEvent(this.fileExplorer, "change", onChangeFileExplorerHandler);
                        svg.runtime.attr(this.fileExplorer.component, "accept", "image/*");
                        svg.runtime.attr(this.fileExplorer.component, "id", "fileExplorer");
                        svg.runtime.attr(this.fileExplorer.component, "hidden", "true");
                        drawings.component.add(this.fileExplorer);
                        this.fileExplorer.fileClick = function () {
                            svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
                        }
                    }
                    this.fileExplorer.fileClick();
                };

                fileExplorerHandler();
            };

            if(!this.listViewPicture){
                var _onClickBack = () =>{
                    this.sandboxManip.remove(this.listViewPicture.manipulator);
                };

                this.listViewPicture =
                    new ListManipulatorView([], 'H', SANDBOX_SIZE.w-50, SANDBOX_SIZE.header.h, 25, 50, HEADER_TILE, HEADER_TILE, 8, undefined, 25);

                let picBackManip = new Manipulator(this);
                let picBack = new svg.Image('../../images/doll/back.png').dimension(HEADER_TILE, HEADER_TILE);
                picBackManip.add(picBack);
                this.listViewPicture.add(picBackManip);

                let picAddImageManip = new Manipulator(this);
                let picAddImage = new svg.Image('../../images/ajoutImage.png').dimension(HEADER_TILE, HEADER_TILE);
                picAddImageManip.add(picAddImage);
                this.listViewPicture.add(picAddImageManip);

                picBackManip.addEvent('click', _onClickBack);
                picAddImageManip.addEvent('click', _createPopUpPicture);

                let conf = {
                    drop: (what, whatParent, x, y) => {
                        let globalPoints = whatParent.globalPoint(x, y);
                        let target = this.sandboxManip.last.getTarget(globalPoints.x, globalPoints.y);

                        if(target && target == this.sandboxMain.back){
                            let imgForDim  = new Image();
                            imgForDim.src = what.components[0].src;

                            let picInPanelManip = new Manipulator(this);
                            let picInPanel = new svg.Image(what.components[0].src);
                            picInPanel.dimension(imgForDim.width, imgForDim.height);
                            picInPanelManip.add(picInPanel);

                            let localPoints = this.sandboxMain.content.localPoint(x, y);
                            picInPanelManip.move(localPoints.x, localPoints.y);

                            svg.addEvent(picInPanel,'contextmenu',(event)=>{
                                this.selectElement(picInPanel);
                                this.imageRightClick(picInPanel, picInPanelManip, event);
                            });
                            
                            this.sandboxMain.content.add(picInPanelManip.component);
                        }
                        return {x: what.x, y: what.y, parent: whatParent};
                    },
                    moved: (what) => {
                        what.flush();
                        return true;
                    }
                };

                this.getImages().then((images) => {
                    var createDraggableCopy = (pic) => {
                        let picManip = new Manipulator(this).addOrdonator(1);
                        let point = pic.globalPoint(0, 0);
                        picManip.move(point.x, point.y);


                        let picCopy = pic.duplicate(pic);
                        picManip.set(0, picCopy);
                        drawings.piste.add(picManip);

                        installDnD(picManip, drawings.component.glass.parent.manipulator.last, conf);
                        svg.event(drawings.component.glass, "mousedown", event);
                    };

                    images.images.forEach(ele=> {
                        let picManip = new Manipulator(this);
                        let pic = new svg.Image(ele.imgSrc).dimension(HEADER_TILE, HEADER_TILE);
                        picManip.add(pic);
                        this.listViewPicture.add(picManip);

                        pic.onMouseDown(() => createDraggableCopy(pic));
                    });
                    this.listViewPicture.refreshListView();
                });

                this.listViewPicture.getListElements().forEach(ele =>{
                    let rect = new svg.Rect(HEADER_TILE, HEADER_TILE).color(myColors.none, 1, myColors.grey).corners(3,3);
                    ele.add(rect);
                });

                this.sandboxManip.add(this.listViewPicture.manipulator);
            }else{
                this.sandboxManip.add(this.listViewPicture.manipulator);
            }

            this.listViewPicture.refreshListView();

        };

        display(){
            super.display();
            this.displayHeader(this.getLabel());
            this.displayTitle();
            this.displayMainPanel();
            this.displayTabs();
        }

        displayTitle(){
            let createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(INPUT_SIZE.w, INPUT_SIZE.h, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5,5);
                this.returnButton.text.font('Arial', 20).position(0,6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width/2 + MARGIN,this.header.height + this.returnButton.height/2 + MARGIN);
                let chevron = new svg.Chevron(10,20,3,'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator.add(chevron);
                this.manipulator.add(this.returnButtonManipulator);
            }
            createReturnButton();
            let createTitle = () => {
                let titleManipulator = new Manipulator(this);
                let title = new svg.Text('Creer un exercice : ')
                    .font('Arial', 25).anchor('left')
                    .position(-INPUT_SIZE.w/2, 0);
                let exerciseTitleInput = new gui.TextField(0, 0, INPUT_SIZE.w, INPUT_SIZE.h, this.getLabel())
                exerciseTitleInput.font('Arial', 15).color(myColors.grey);
                exerciseTitleInput.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                exerciseTitleInput.control.placeHolder(this.getLabel());
                exerciseTitleInput.onInput((oldMessage, message, valid) => {
                    if (!message || !oldMessage) {
                        exerciseTitleInput.text.message(this.getLabel());
                    }
                    exerciseTitleInput.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                });
                exerciseTitleInput.color([myColors.lightgrey, 1, myColors.black])
                    .position(0, INPUT_SIZE.h)
                titleManipulator.add(exerciseTitleInput.component)
                    .add(title);
                titleManipulator.move(this.returnButton.width/2 + MARGIN, this.header.height + 2*INPUT_SIZE.h + MARGIN);
                this.manipulator.add(titleManipulator);
            }
            createTitle();

        }

        displayTabs(){
            let statement = new svg.Rect(TAB_SIZE.w, TAB_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2)
                .position(-TAB_SIZE.w, 0);
            let statementText = new svg.Text('Enoncé')
                .font('Arial', 18)
                .position(-TAB_SIZE.w, 6);
            statement.mark('statement');

            let rules = new svg.Rect(TAB_SIZE.w, TAB_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            let rulesText = new svg.Text('Règles')
                .font('Arial', 18)
                .position(0, 6);
            rules.mark('rules');

            resizeStringForText(statementText, TAB_SIZE.w, TAB_SIZE.h);
            resizeStringForText(rulesText, TAB_SIZE.w, TAB_SIZE.h);
            svg.addEvent(statement, 'click', () => {this.toggleTabs(false)})
            svg.addEvent(statementText, 'click', () => {this.toggleTabs(false)})
            svg.addEvent(rules, 'click', () => {this.toggleTabs(true)})
            svg.addEvent(rulesText, 'click', () => {this.toggleTabs(true)})

            let tabsManip = new Manipulator(this);
            tabsManip.add(statement)
                .add(statementText)
                .add(rules)
                .add(rulesText);
            tabsManip.move(drawing.width - 2*MARGIN - TAB_SIZE.w/2, this.mainPanelManipulator.y - PANEL_SIZE.h/2 - TAB_SIZE.h/2);
            this.manipulator.add(tabsManip);
        }

        displayMainPanel(){
            this.mainPanelManipulator = new Manipulator(this);
            let backRect = new svg.Rect(PANEL_SIZE.w, PANEL_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(5,5);
            this.mainPanelManipulator.add(backRect);
            this.mainPanelManipulator.move(drawing.width/2,drawing.height/2 + PANEL_SIZE.h/8)
            this.manipulator.add(this.mainPanelManipulator);

            if(this.rules){
                this.displaySolutions();
            }
            else{
                this.displaySandBoxZone();
            }
        }

        toggleMode(mode){
            this.actionModes.actions['none']();
            if(Object.keys(this.actionModes.actions).indexOf(mode)>=0){
                this.actionModes.currentMode = mode;
                this.actionModes.actions[mode]();
            }
        }

        textZoning(event){
            let point = this.sandboxMain.content.localPoint(event.x,event.y);
            let rect = new svg.Rect(0,0).position(point.x, point.y).color(myColors.white, 1, myColors.black);
            this.sandboxMain.content.add(rect);
            let moveHandler = (eventMove)=>{
                if (eventMove.x - event.x > 0 && eventMove.y - event.y > 0 && this.actionModes.currentMode == 'text') {
                    rect.dimension(eventMove.x - event.x, eventMove.y - event.y);
                    rect.position(point.x + rect.width / 2, point.y + rect.height / 2);
                }
            }
            let mouseupHandler = (eventUp)=>{
                if (eventUp.x - event.x == 0 && eventUp.y - event.y == 0){
                    this.sandboxMain.content.remove(rect);
                    this.clickPanelHandler(event);
                }
                svg.removeEvent(this.sandboxMain.component, 'mousemove');
                this.sandboxMain.content.remove(rect);
                let text = new gui.TextField(0,0, rect.width, rect.height, '');
                text.color([myColors.white, 1, myColors.grey]);
                let tmpHandler = text.glass.component.listeners['click'];
                let manip = new Manipulator(this);
                manip.move(rect.x,rect.y);
                manip.add(text.component);
                text.glass.component.listeners['click'] = (event) =>{
                    this.removeContextMenu();
                    if(event.which == 3){
                        this.textRightClick(text,manip, event);
                        this.selectElement(text);
                    }else{
                        this.selectElement(text);
                        tmpHandler();
                    }
                }
                this.textElements.push(text);
                text.glass.mark('textElement' + this.textElements.length +'click');
                text.mark('textElement' + this.textElements.length);
                this.sandboxMain.content.add(manip.component);
                this.actionModes.actions['none']();
            }
            svg.addEvent(this.sandboxMain.component, 'mousemove', moveHandler)
            svg.addEvent(this.sandboxMain.component, 'mouseup', mouseupHandler)
        }

        textRightClick(text,manipulator,event){
            let makeClickableItem = (message, handler)=>{
                let txt = new svg.Text(message).font('Arial', 18).position(0,6);
                let rect = new svg.Rect(150, 27).color(myColors.white, 0.5, myColors.none);
                let manip = new Manipulator(this);
                manip.add(rect).add(txt);
                manip.addEvent('mouseenter', ()=>{rect.color(myColors.blue, 0.5, myColors.grey)});
                manip.addEvent('mouseleave', ()=>{rect.color(myColors.white, 0.5, myColors.none)});
                manip.addEvent('click', handler);
                return manip;
            }
            let arr = [];
            let color = makeClickableItem('Couleur', ()=>{
                let colors = [[43, 120, 228],
                    [125, 122, 117],
                    [230, 122, 25],
                    [155, 222, 17],
                    [0, 0, 0],
                    [255, 255, 255],
                    [255, 20, 147]];
                for (let i = 0; i< colors.length; i++){
                    let color = colors[i];
                    let man = new Manipulator(this);
                    let rec = new svg.Rect(CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h).corners(2,2).color(colors[i], 0.5, myColors.grey);
                    man.add(rec);
                    man.addEvent('click', ()=>{
                        text.color([color, 0.5, myColors.grey])
                        text.editColor([color, 0.5, myColors.grey])
                    });
                    colors[i]=man;
                }
                this.contextMenu.setList(colors);
            });
            let resize = makeClickableItem('Redimensionner', ()=>{
                this.resizeElement(text, manipulator);
                this.removeContextMenu();
            });
            color.mark('colorOption');
            resize.mark('resizeOption');
            arr.push(color,resize)

            this.contextMenu && this.manipulator.remove(this.contextMenu.manipulator);
            this.contextMenu = new ListManipulatorView(arr, 'V',150,3*CONTEXT_TILE_SIZE.h, 75,15,CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            this.contextMenu.position(event.x + this.contextMenu.width/2, event.y + this.contextMenu.height/2);
            this.contextMenu.border.corners(2,2).color(myColors.white, 1, myColors.grey);
            this.manipulator.add(this.contextMenu.manipulator);
            this.contextMenu.refreshListView();
        }

        rectRightClick(rect, manipulator, event){
            let makeClickableItem = (message, handler)=>{
                let txt = new svg.Text(message).font('Arial', 18).position(0,6);
                let rect = new svg.Rect(CONTEXT_TILE_SIZE.w + MARGIN, CONTEXT_TILE_SIZE.h).color(myColors.white, 0.5, myColors.none);
                let manip = new Manipulator(this);
                manip.add(rect).add(txt);
                manip.addEvent('mouseenter', ()=>{rect.color(myColors.blue, 0.5, myColors.grey)});
                manip.addEvent('mouseleave', ()=>{rect.color(myColors.white, 0.5, myColors.none)});
                manip.addEvent('click', handler);
                return manip;
            }
            let arr = [];
            let color = makeClickableItem('Couleur', ()=>{
                let colors = [[43, 120, 228],
                    [125, 122, 117],
                    [230, 122, 25],
                    [155, 222, 17],
                    [0, 0, 0],
                    [255, 255, 255],
                    [255, 20, 147]];
                for (let i = 0; i< colors.length; i++){
                    let color = colors[i];
                    let man = new Manipulator(this);
                    let rec = new svg.Rect(CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h).corners(2,2).color(colors[i], 0.5, myColors.grey);
                    man.add(rec);
                    man.addEvent('click', ()=>{rect.color(color, rect.strokeWidth, rect.strokeColor )});
                    colors[i]=man;
                }
                this.contextMenu.setList(colors);
            });
            let resize = makeClickableItem('Redimensionner', ()=>{
                this.resizeElement(rect, manipulator);
                this.removeContextMenu();
            });
            color.mark('colorOption');
            resize.mark('resizeOption');
            arr.push(color,resize);

            this.contextMenu && this.manipulator.remove(this.contextMenu.manipulator);
            this.contextMenu = new ListManipulatorView(arr, 'V',150,3*CONTEXT_TILE_SIZE.h, 75,15,CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            this.contextMenu.position(event.x + this.contextMenu.width/2, event.y + this.contextMenu.height/2);
            this.contextMenu.border.corners(2,2).color(myColors.white, 1, myColors.grey);
            this.manipulator.add(this.contextMenu.manipulator);
            this.contextMenu.refreshListView();
        }

        imageRightClick(image, manipulator, event){
            let makeClickableItem = (message, handler)=>{
                let txt = new svg.Text(message).font('Arial', 18).position(0,6);
                let rect = new svg.Rect(CONTEXT_TILE_SIZE.w + MARGIN, CONTEXT_TILE_SIZE.h).color(myColors.white, 0.5, myColors.none);
                let manip = new Manipulator(this);
                manip.add(rect).add(txt);
                manip.addEvent('mouseenter', ()=>{rect.color(myColors.blue, 0.5, myColors.grey)});
                manip.addEvent('mouseleave', ()=>{rect.color(myColors.white, 0.5, myColors.none)});
                manip.addEvent('click', handler);
                return manip;
            }
            let arr = [];
            let resize = makeClickableItem('Redimensionner', ()=>{
                this.resizeElement(image, manipulator);
                this.removeContextMenu();
            });
            arr.push(resize);

            this.contextMenu && this.manipulator.remove(this.contextMenu.manipulator);
            this.contextMenu = new ListManipulatorView(arr, 'V',150,3*CONTEXT_TILE_SIZE.h, 75,15,CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            this.contextMenu.position(event.x + this.contextMenu.width/2, event.y + this.contextMenu.height/2);
            this.contextMenu.border.corners(2,2).color(myColors.white, 1, myColors.grey);
            this.manipulator.add(this.contextMenu.manipulator);
            this.contextMenu.refreshListView();
        }

        selectElement(elem){
            if(this.selectedElement && this.selectedElement.parentManip){//Rect
                this.selectedElement.parentManip.corners && this.selectedElement.parentManip.corners.forEach(corner=>{
                    corner.flush();
                });
                this.selectedElement.color(this.selectedElement.fillColor, 0.5, myColors.grey);
            }
            else if (this.selectedElement && this.selectedElement.component.parentManip){//Text
                this.selectedElement.component.parentManip.corners && this.selectedElement.component.parentManip.corners.forEach(corner=>{
                    corner.flush();
                });
                let textColors = new Array(this.selectedElement._colors[0]);
                textColors.push(0.5,myColors.grey);
                this.selectedElement.color(textColors)
            }
            if (elem && elem instanceof gui.TextField){
                let textColors = new Array(elem._colors[0]);
                textColors.push(4,myColors.blue);
                elem.color(textColors);
            }
            else{
                elem && elem.color(elem.fillColor, 4, myColors.blue)
            }
            this.selectedElement = elem;
        }

        resizeElement(elem, manipulator){
            let initW = elem.width, initH = elem.height;
            let manipInitx = manipulator.x, manipInity = manipulator.y;
            manipulator.corners = [];
            let br = function(x, y, Xcoeff, Ycoeff){
                let delta = {x:x -this.x, y:y -this.y};
                console.log(initW+delta.x,initH +delta.y);
                elem.dimension(initW+Xcoeff*delta.x,initH+Ycoeff*delta.y)
                elem.position(+delta.x/2,+delta.y/2);
                let updateCorners = ()=>{
                    manipulator.corners.forEach(corner=>{
                        corner.move(corner.point.getX() + delta.x/2, corner.point.getY()+delta.y/2);
                    });
                }
                updateCorners();
                elem.refresh && elem.refresh();
            }
            let posArr = [
                {x:-elem.width/2, y:-elem.height/2, id: 'topLeft', drag: function(x,y){br.call(this,x,y,-1,-1)}, getX: function(){return -elem.width/2}, getY: function(){return -elem.height/2}},
                {x:-elem.width/2, y:+elem.height/2, id: 'topRight', drag: function(x,y){br.call(this,x,y,-1,1)}, getX: function(){return -elem.width/2}, getY: function(){return +elem.height/2}},
                {x:+elem.width/2, y:-elem.height/2, id: 'botLeft', drag: function(x,y){br.call(this,x,y,1,-1)}, getX: function(){return +elem.width/2}, getY: function(){return -elem.height/2}},
                {x:+elem.width/2, y:+elem.height/2, id: 'botRight', drag: function(x,y){br.call(this,x,y,1,1)}, getX: function(){return +elem.width/2}, getY: function(){return +elem.height/2}}
            ];
            let updatePoints = ()=>{
                for (let point of posArr){
                    point.x = point.getX();
                    point.y = point.getY();
                }
            }
            for (let point of posArr) {
                let rect = new svg.Rect(10,10).color(myColors.lightgrey, 1, myColors.grey);
                let manip = new Manipulator(this);
                manip.add(rect)
                let conf ={
                    drag: (what, x, y)=>{
                        point.drag.call(point,x,y);
                        return{x:x,y:y};
                     },
                    drop: (what, whatParent, finalX, finalY)=>{
                        manipInitx = manipulator.x; manipInity = manipulator.y;

                        console.log(finalY,finalY);
                        elem.position(0,0);
                        manipulator.move(manipInitx - (point.x - finalX)/2 , manipInity - (point.y - finalY)/2);
                        manipulator.corners.forEach(corner=>{
                            if (point.x != corner.point.x || point.y != corner.point.y) {
                                corner.move(corner.point.getX(), corner.point.getY())
                            }
                        });
                        updatePoints();
                        initW = elem.width;
                        initH = elem.height;
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what)=>{

                        //return false;
                    },
                    revert: (item)=>{
                        item.move(point.getX(), point.getY());
                    }
                }
                installDnD(manip, drawings.component.glass.parent.manipulator.last, conf)
                manip.move(point.x, point.y);
                manip.mark(point.id);
                manip.point = point;
                manipulator.corners.push(manip);
                manipulator.add(manip.component);
            }
        }

        rectZoning(event){
            let point = this.sandboxMain.content.localPoint(event.x,event.y);
            let rect = new svg.Rect(0,0).position(point.x, point.y).color(myColors.white, 1, myColors.black);

            this.sandboxMain.content.add(rect);
            let moveHandler = (eventMove)=>{
                if (eventMove.x - event.x > 0 && eventMove.y - event.y > 0 && this.actionModes.currentMode == 'rect') {
                    rect.dimension(eventMove.x - event.x, eventMove.y - event.y);
                    rect.position(point.x + rect.width / 2, point.y + rect.height / 2);
                }
            }
            let mouseupHandler = (eventUp)=>{
                if (eventUp.x - event.x == 0 && eventUp.y - event.y == 0){
                    this.sandboxMain.content.remove(rect);
                }
                let manip = new Manipulator(this);
                this.sandboxMain.content.add(manip.component);
                manip.move(rect.x, rect.y);
                rect.position(0,0);
                this.sandboxMain.content.remove(rect)
                manip.add(rect);
                this.rectElements.push(rect);
                rect.mark('rectElement' + this.rectElements.length);
                svg.removeEvent(this.sandboxMain.component, 'mousemove');
                rect.color(myColors.blue);
                svg.addEvent(rect, 'click', ()=>{this.selectElement(rect)});
                svg.addEvent(rect,'contextmenu',(event)=>{
                   this.selectElement(rect);
                   this.rectRightClick(rect, manip, event);
                });
                this.actionModes.actions['none']();
            }
            svg.addEvent(this.sandboxMain.component, 'mousemove', moveHandler)
            svg.addEvent(this.sandboxMain.component, 'mouseup', mouseupHandler)
        }

        keyDown(event){
            if (event.keyCode == 8 || event.keyCode == 46){
                if (this.selectedElement){
                    if (this.selectedElement.parentManip){
                        this.selectedElement.parentManip.flush();
                    }
                    else if (this.selectedElement.component) {
                        this.selectedElement.component.parentManip.flush();
                    }

                    this.selectedElement = null;
                }
            }
        }

        removeContextMenu(){
            if (this.contextMenu) {
                this.manipulator.remove(this.contextMenu.manipulator);
            }
        }

        clickPanelHandler(event, bool){
            if (!bool) {
                this.removeContextMenu()
                let target = this.manipulator.translator.getTarget(event.x, event.y);
                if (target != this.sandboxMain.back) {
                    svg.event(target, 'click', event);
                }
            }
            this.selectElement(null);
            this.removeContextMenu();
        }
        rightClickPanelHandler(event){
            event.preventDefault();
        }

        displaySandBoxZone(){
            this.sandboxManip = new Manipulator(this);

            let actionList = new ListManipulatorView(this.actionTabs, 'H', SANDBOX_SIZE.w-50, SANDBOX_SIZE.header.h, 25, 25, HEADER_TILE,
                HEADER_TILE, 5, undefined, 25);

            this.sandboxMain = new gui.Panel(SANDBOX_SIZE.w, SANDBOX_SIZE.h - SANDBOX_SIZE.header.h, myColors.white);
            this.sandboxMain.border.corners(2,2).color(myColors.none, 1, myColors.black);
            this.sandboxMain.position(0, SANDBOX_SIZE.header.h/2 + this.sandboxMain.height/2);
            this.sandboxManip.add(actionList.manipulator)
                .add(this.sandboxMain.component);
            this.sandboxMain.component.mark('mainPanel');

            svg.addEvent(this.sandboxMain.component, 'click', (event)=>{this.clickPanelHandler(event, true)});

            this.sandboxManip.move(-PANEL_SIZE.w/2 + SANDBOX_SIZE.header.w/2 + MARGIN, -PANEL_SIZE.h/2 + SANDBOX_SIZE.header.h/2 + 2*MARGIN);
            this.mainPanelManipulator.add(this.sandboxManip);
            actionList.refreshListView();
            this.displayObjectives();
            this.displayResponses();
        }

        displaySolutions(){
            let solutionsHeaderManipulator = new Manipulator(this);
            let solutionsHeader = new svg.Rect(PANEL_SIZE.w, 0.2*PANEL_SIZE.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            let headerTitle = new svg.Text('Pour chaque objectif créé, définir les règles associées : ')
                .font('Arial', 18)
                .anchor('left')
                .position(-PANEL_SIZE.w/2 + MARGIN, -solutionsHeader.height/5);
            let headerRollPanel = new svg.Rect(0.8*PANEL_SIZE.w, INPUT_SIZE.h)
                .color(myColors.white, 1, myColors.grey);

            solutionsHeaderManipulator.add(solutionsHeader)
                .add(headerTitle)
                .add(headerRollPanel);
            solutionsHeaderManipulator.move(0,solutionsHeader.height/2 - PANEL_SIZE.h/2);
            this.mainPanelManipulator.add(solutionsHeaderManipulator);
            this.displaySolutionsBody();
        }

        displaySolutionsBody(){
            let solutionsBodyManip = new Manipulator(this);
            let createLeftTemplate = () =>{
                let leftTemplateManip = new Manipulator(this).addOrdonator(2);
                let addSolutionButton = new gui.Button(INPUT_SIZE.w, INPUT_SIZE.h, [myColors.white, 1, myColors.green],
                'Ajouter une solution');
                addSolutionButton.glass.mark('addSolutionButton');
                let selectSolution = new svg.Rect(0.8*addSolutionButton.width, INPUT_SIZE.h)
                    .color(myColors.white, 1, myColors.grey)
                    .corners(5,5);
                let deleteSolutionButton = new gui.Button(0.15 * selectSolution.width, INPUT_SIZE.h,
                    [myColors.lightgrey, 0, myColors.none], 'X');
                let framedRollPanel = new svg.Rect(0.3*addSolutionButton.width, INPUT_SIZE.h)
                    .color(myColors.white, 1, myColors.grey);
                let linkImage = new svg.Image('../../images/unlink.png');
                let pictureImage = new svg.Image('../../images/picture.png');
                let rollPanel = new svg.Rect(0.4*addSolutionButton.width, INPUT_SIZE.h)
                    .color(myColors.white, 1, myColors.grey);

                selectSolution.position(-0.1*addSolutionButton.width, addSolutionButton.height + 2*MARGIN);
                deleteSolutionButton.position(addSolutionButton.width*0.4 + MARGIN,  addSolutionButton.height + 2*MARGIN);
                framedRollPanel.position(-0.35*addSolutionButton.width, 2*(addSolutionButton.height + 2*MARGIN));
                rollPanel.position(-addSolutionButton.width/2 + framedRollPanel.width + IMAGE_SIZE.w + rollPanel.width/2 + 1.5*MARGIN,
                    2*(addSolutionButton.height + 2*MARGIN));
                linkImage
                    .position(-addSolutionButton.width/2 + rollPanel.width - IMAGE_SIZE.w/2 + 0.5*MARGIN, 2*(addSolutionButton.height + 2*MARGIN))
                    .dimension(IMAGE_SIZE.w,IMAGE_SIZE.h)
                pictureImage
                    .position(addSolutionButton.width/2 - IMAGE_SIZE.w/2, 2*(addSolutionButton.height + 2*MARGIN))
                    .dimension(IMAGE_SIZE.w,IMAGE_SIZE.h)

                leftTemplateManip.set(0, linkImage);
                leftTemplateManip.set(1, pictureImage);
                leftTemplateManip.add(selectSolution)
                    .add(addSolutionButton.component)
                    .add(deleteSolutionButton.component)
                    .add(framedRollPanel)
                    .add(rollPanel)
                leftTemplateManip.move(-PANEL_SIZE.w/2 + INPUT_SIZE.w/2 + MARGIN, 0)
                solutionsBodyManip.add(leftTemplateManip);
            }
            createLeftTemplate();
            solutionsBodyManip.move(4*MARGIN,-PANEL_SIZE.h/4)
            this.mainPanelManipulator.add(solutionsBodyManip);

        }

        displayObjectives(){
            let createMiniature = ()=>{
                let miniature ={
                    border: new svg.Line(-this.objectivesList.width/2 + 2* MARGIN,15,this.objectivesList.width/2 - 2* MARGIN,15)
                        .color(myColors.black, 1, myColors.grey),
                    text: new svg.Text(this.objectivesInput.textMessage).font('Arial', 18).position(0,6),
                    manip: new Manipulator(this)
                };
                miniature.manip.add(miniature.text)
                    .add(miniature.border);
                miniature.text.markDropID('objectivesDrop');
                miniature.border.markDropID('objectivesDrop');
                let conf ={
                    drop: (what, whatParent, finalX, finalY)=>{
                            let point = whatParent.globalPoint(finalX,finalY);
                            let target = this.manipulator.last.getTarget(point.x,point.y);
                            if(!target || target && target.dropID != 'objectivesDrop' || !target.dropID) {
                                this.objectivesList.removeElementFromList(what);
                                what.flush();
                            }
                            return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what)=>{
                        this.objectivesList.resetAllMove();
                        this.objectivesList.refreshListView();
                        return true;
                    }
                }
                installDnD(miniature.manip, drawings.component.glass.parent.manipulator.last, conf);
                return miniature;
            }
            let objectivesManip = new Manipulator(this);
            let objectivesHeader = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2,2);
            let objectivesTitle = new svg.Text('Définissez les objectifs : ')
                .font('Arial', 20)
                .anchor('left')
                .position(-RIGHTBOX_SIZE.w/2 + 2*MARGIN, 8.33);
            resizeStringForText(objectivesTitle, RIGHTBOX_SIZE.w - 3*MARGIN, 15);
            let objectivesBody = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            objectivesBody.position(0, objectivesHeader.height/2 + objectivesBody.height/2);
            this.objectivesInput = new gui.TextField(0, 0, 2/3*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h)
                .color([myColors.white, 1, myColors.black]);

            this.objectivesInput.font('Arial', 18);
            this.objectivesInput.position(-RIGHTBOX_SIZE.w/2+this.objectivesInput.width/2 + MARGIN,  RIGHTBOX_SIZE.header.h)
            this.objectivesInput.frame.corners(5,5);
            let objectivesAddButton = new gui.Button(0.25*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h, [myColors.customBlue, 1, myColors.grey],'Ajouter');

            objectivesAddButton.text
                .font('Arial', 18)
                .position(0,6);
            objectivesAddButton.back.corners(5,5);
            objectivesAddButton.position(RIGHTBOX_SIZE.w/2 - MARGIN - objectivesAddButton.width/2, RIGHTBOX_SIZE.header.h);
            let addObjectiveHandler = ()=>{
                let mini = createMiniature();
                if (mini.text.messageText == ''){
                    let errorMsg = new svg.Text('Veuiller entrer un texte');
                    errorMsg.position(-RIGHTBOX_SIZE.w/2 + 2*MARGIN,  RIGHTBOX_SIZE.header.h + 6)
                        .anchor('left')
                        .font('Arial', 18)
                        .color(myColors.red);
                    resizeStringForText(errorMsg, this.objectivesInput.width, this.objectivesInput.height);
                    objectivesManip.add(errorMsg);

                    svg.timeout(()=>{
                        objectivesManip.remove(errorMsg);
                    }, 3000);
                }
                else {
                    this.objectivesList.add(mini.manip);
                    this.objectivesList.refreshListView();
                }

            }
            objectivesAddButton.onClick(addObjectiveHandler);

            this.objectivesList = new ListManipulatorView([], 'V', RIGHTBOX_SIZE.w - 2*MARGIN, RIGHTBOX_SIZE.h*0.3, 75,25,  RIGHTBOX_SIZE.w - 2*MARGIN, 27, 5);
            this.objectivesList.position(0,RIGHTBOX_SIZE.h  -this.objectivesList.height - MARGIN);
            this.objectivesList.markDropID('objectivesDrop')

            objectivesManip.add(objectivesHeader)
                .add(objectivesTitle)
                .add(objectivesBody)
                .add(objectivesAddButton.component)
                .add(this.objectivesInput.component)
                .add(this.objectivesList.manipulator);

            objectivesManip.move(PANEL_SIZE.w/2 - RIGHTBOX_SIZE.w/2 - MARGIN, 2*MARGIN-PANEL_SIZE.h/2 + objectivesHeader.height/2);
            this.mainPanelManipulator.add(objectivesManip);
            this.objectivesList.refreshListView();
        }

        displayResponses(){
            let createMiniature = ()=>{
                let miniature ={
                    border: new svg.Line(-this.objectivesList.width/2 + 2* MARGIN,15,this.objectivesList.width/2 - 2* MARGIN,15)
                        .color(myColors.black, 1, myColors.grey),
                    text: new svg.Text(this.responsesInput.textMessage).font('Arial', 18).position(0,6),
                    manip: new Manipulator(this)
                };
                miniature.manip.add(miniature.text)
                    .add(miniature.border);
                miniature.text.markDropID('responsesDrop');
                miniature.border.markDropID('responsesDrop');
                let conf ={
                    drop: (what, whatParent, finalX, finalY)=>{
                        let point = whatParent.globalPoint(finalX,finalY);
                        let target = this.manipulator.last.getTarget(point.x,point.y);
                        if(!target || target && target.dropID != 'responsesDrop' || !target.dropID) {
                            this.responsesList.removeElementFromList(what);
                            what.flush();
                        }
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what)=>{
                        this.responsesList.resetAllMove();
                        this.responsesList.refreshListView();
                        return true;
                    }
                }
                installDnD(miniature.manip, drawings.component.glass.parent.manipulator.last, conf);
                return miniature;
            }
            let responsesManip = new Manipulator(this);
            let responsesHeader = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2,2);
            let responsesTitle = new svg.Text('Définissez les réponses : ')
                .font('Arial', 20)
                .anchor('left')
                .position(-RIGHTBOX_SIZE.w/2 + 2*MARGIN, 8.33);
            resizeStringForText(responsesTitle, RIGHTBOX_SIZE.w - 3*MARGIN, 15);
            let responsesBody = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2,2);
            responsesBody.position(0, responsesHeader.height/2 + responsesBody.height/2);
            this.responsesInput = new gui.TextField(0, 0, 2/3*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h)
                .color([myColors.white, 1, myColors.black])

            this.responsesInput.font('Arial', 18);
            this.responsesInput.position(-RIGHTBOX_SIZE.w/2+this.responsesInput.width/2 + MARGIN,  RIGHTBOX_SIZE.header.h)
            this.responsesInput.frame.corners(5,5);
            let responsesAddButton = new gui.Button(0.25*RIGHTBOX_SIZE.w, 0.8*INPUT_SIZE.h, [myColors.customBlue, 1, myColors.grey],'Ajouter');

            responsesAddButton.text
                .font('Arial', 18)
                .position(0,6);
            responsesAddButton.back.corners(5,5);
            responsesAddButton.position(RIGHTBOX_SIZE.w/2 - MARGIN - responsesAddButton.width/2, RIGHTBOX_SIZE.header.h);
            let addResponseHandler = ()=>{
                let mini = createMiniature();
                if (mini.text.messageText == ''){
                    let errorMsg = new svg.Text('Veuiller entrer un texte');
                    errorMsg.position(-RIGHTBOX_SIZE.w/2 + 2*MARGIN,  RIGHTBOX_SIZE.header.h + 6)
                        .anchor('left')
                        .font('Arial', 18)
                        .color(myColors.red);
                    resizeStringForText(errorMsg, this.responsesInput.width, this.responsesInput.height);
                    responsesManip.add(errorMsg);

                    svg.timeout(()=>{
                        responsesManip.remove(errorMsg);
                    }, 3000);
                }
                else {
                    this.responsesList.add(mini.manip);
                    this.responsesList.refreshListView();
                }

            }
            responsesAddButton.onClick(addResponseHandler);

            this.responsesList = new ListManipulatorView([], 'V', RIGHTBOX_SIZE.w - 2*MARGIN, RIGHTBOX_SIZE.h*0.3, 75,25,  RIGHTBOX_SIZE.w - 2*MARGIN, 27, 5);
            this.responsesList.position(0,RIGHTBOX_SIZE.h -this.responsesList.height - MARGIN);
            this.responsesList.markDropID('responsesDrop')

            responsesManip.add(responsesHeader)
                .add(responsesTitle)
                .add(responsesBody)
                .add(responsesAddButton.component)
                .add(this.responsesInput.component)
                .add(this.responsesList.manipulator);
            responsesManip.move(PANEL_SIZE.w/2 - RIGHTBOX_SIZE.w/2 - MARGIN, 2*MARGIN-PANEL_SIZE.h/2 + responsesHeader.height/2 + RIGHTBOX_SIZE.h + 2*MARGIN);
            this.mainPanelManipulator.add(responsesManip);
        }

        getLabel(){
            return this.presenter.getLabel();
        }

        toggleTabs(bool){
            if (this.rules != bool) {
                this.rules = bool;
                this.displayMainPanel();
            }
        }
        
        uploadImageByFile(file, progressDisplay){
            return this.presenter.uploadImageByFile(file, progressDisplay);
        }

        getImages() {
            return this.presenter.getImages();
        }
    }

    return DollAdminV;
}