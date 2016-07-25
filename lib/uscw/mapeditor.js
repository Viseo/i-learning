/**
 * Created by HDA3014 on 24/01/2016.
 */

var Gui = require("../svggui.js").Gui;
var FileManager = require("../filemanager.js").FileManager;
var Hex = require("../uscw/hextools.js").Hex;

exports.mapEditor = function(svg) {

    var gui = Gui(svg, {
        speed: 10,
        step: 10
    });

    var fileManager = FileManager(svg, gui);

    var hexM = Hex(svg);

    class HexSupport {

        constructor(hex, pane) {
            this.hex = hex;
            this.pane = pane;
            this.component = new svg.Translation();
            this.component.add(hex.component.move(0, 0));
            this.component.add(hex.itemSupport.move(0, 0).active(false));
            this.component.add(new svg.Hexagon(hex.width, "V").color([], 2, [10, 100, 10]));
            if (this.register()) {
                this.select();
            }
            hex.addGlass(()=> {
                this.tool.callback(this.select());
            });
        }

        action(callback) {
            if (!this.tool) {
                this.tool = new gui.Tool(this.component, callback);
                this.tool.hex = this.hex;
                this.pane.addTool(this.tool);
            }
            else {
                this.tool.callback = callback;
            }
            this.tool.callback(true);
            return this;
        }

        register() {
            if (!this.pane.palette.hexTools) {
                this.pane.palette.hexTools = [];
            }
            this.pane.palette.hexTools.push(this);
            return this.pane.palette.hexTools.length === 1;
        }

        whenSelect(selectCallback) {
            this.selectCallback = selectCallback;
            return this;
        }

        whenUnselect(unselectCallback) {
            this.unselectCallback = unselectCallback;
            return this;
        }

        select() {
            if (!this.selected) {
                this.pane.palette.hexTools.forEach(function (hexSupport) {
                    hexSupport.unselect();
                });
                this.selected = new svg.Hexagon(this.hex.width, "V").color([], 4, [220, 0, 0]);
                this.component.add(this.selected);
                this.selectCallback && this.selectCallback();
                return true;
            }
            return false;
        }

        unselect() {
            if (this.selected) {
                this.component.remove(this.selected);
                delete this.selected;
                this.unselectCallback && this.unselectCallback();
                return true;
            }
            return false;
        }

        surface(type, colors) {

            this.hex.setOrder([type]).setSurface(new hexM.Surface(type, colors));
            this.action(()=> {
                this.pane.palette.action = hex=> {
                    if (hex.getSurface(type)) {
                        hex.removeSurface(type);
                    }
                    else {
                        hex.setSurface(new hexM.Surface(type, colors));
                    }
                }
            });
        }

        line(type, size, colors) {

            this.hex.setOrder([type]).setLine(new hexM.Line(type, {sw: size, e: size}, colors));

            this.action(()=> {
                this.pane.palette.action = (hex, x, y, piece)=> {
                    if (hex.getLineEntry(piece, type)) {
                        hex.removeLineEntry(piece, type);
                    }
                    else {
                        hex.addLineEntry(piece, type, size, ()=>new hexM.Line(type, {}, colors));
                    }
                }

            });
        }

        border(type, size, colors) {

            this.hex.setOrder([type]).setBorder(new hexM.Border(type, {w: size, nw: size, sw: size, se: size}, colors))

            this.action(()=> {
                this.pane.palette.action = (hex, x, y, piece, center)=> {
                    if (center) {
                        if (hex.getBorderSide("c", type)) {
                            hex.removeBorderSide("c", type, size, ()=>new hexM.Border(type, {}, colors));
                        }
                        else {
                            hex.setBorderSide("c", type, size, ()=>new hexM.Border(type, {}, colors));
                        }
                    }
                    else {
                        if (hex.getBorderSide(piece, type)) {
                            hex.removeBorderSide(piece, type, size, ()=>new hexM.Border(type, {}, colors));
                        }
                        else {
                            hex.addBorderSide(piece, type, size, ()=>new hexM.Border(type, {}, colors));
                        }
                    }
                }
            });
        }

        installDnD(item, doRotate, doDrop, doMove, doClick) {
            item.addEvent('mousedown', event=> {
                let delta = item.hex.component.localPoint(event.x, event.y);
                let local = item.glass.localPoint(event.x, event.y);
                if (item.anchor(local.x, local.y)) {
                    var angle = Math.round(Math.atan2(delta.x - item.x, -delta.y + item.y) / Math.PI * 180);
                }
                let {x:initX, y:initY, angle:initAngle} = item;
                let click = true;
                item.addEvent('mousemove', moveEvent=> {
                    let depl = item.hex.component.localPoint(moveEvent.x, moveEvent.y);
                    if (angle) {
                        var newAngle = Math.round(Math.atan2(depl.x - item.x, -depl.y + item.y) / Math.PI * 180);
                        item.rotate(initAngle + newAngle - angle);
                    }
                    else {
                        item.move(initX + depl.x - delta.x, initY + depl.y - delta.y);
                    }
                    click = false;
                });
                item.addEvent('mouseup', endEvent=> {
                    if (click && endEvent.x === event.x && endEvent.y === event.y) {
                        doClick(item)
                    }
                    else {
                        let depl = item.hex.component.localPoint(endEvent.x, endEvent.y);
                        if (angle) {
                            let newAngle = Math.round(Math.atan2(depl.x - item.x, -depl.y + item.y) / Math.PI * 180);
                            doRotate(item, initAngle + newAngle - angle);
                        }
                        else {
                            let finalX = Math.round(initX + depl.x - delta.x);
                            let finalY = Math.round(initY + depl.y - delta.y);
                            let global = item.hex.component.globalPoint(finalX, finalY);
                            let onMap = item.hex.map.component.localPoint(global);
                            let newHex = item.hex.map.getHexFromPoint(onMap);
                            if (newHex === item.hex) {
                                doMove(item, finalX, finalY);
                            }
                            else {
                                item.hex.removeItem(item);
                                if (newHex) {
                                    var local = newHex.component.localPoint(global);
                                    doMove(item, Math.round(local.x), Math.round(local.y));
                                    doDrop(newHex, item);
                                }
                            }
                        }
                    }
                    item.removeEvent('mousemove');
                    item.removeEvent('mouseup');
                });
            });
        }

        enableDnD(item) {
            this.installDnD(item,
                (item, angle)=> {
                    item.rotate(Math.round(angle / 15) * 15);
                },
                (hex, item)=> {
                    hex.putItem(item);
                },
                (item, x, y)=> {
                    item.move(x, y);
                },
                (item)=> {
                    item.hex.removeItem(item);
                }
            );
        }

        disableDnD(item) {
            item.removeEvent('mousedown');
        }

        enableCompositeDnD(composite) {
            let hexComposite = this.hex.getItem(hexM.Composite);
            this.installDnD(composite,
                (comp, angle)=> {
                    comp.rotate(Math.round(angle / 60) * 60);
                    comp.conform();
                },
                (hex, comp)=> {
                    var present = hex.getItem(hexM.Composite);
                    if (present) {
                        hex.removeItem(present);
                    }
                    hex.putItem(comp);
                },
                (comp, x, y)=> {
                    comp.move(0, 0);
                },
                comp=> {
                    if (!hexComposite.isHighlighted()) {
                        hexComposite.clear();
                        hexComposite.copy(comp.children);
                        hexComposite.highlight(true);
                    }
                    else {
                        comp.hex.removeItem(comp);
                    }
                }
            );

        }

        commonItem(itemForTool, itemForMap) {
            this.hex.putItem(itemForTool(), 0, 0);
            this.action(()=> {
                this.pane.palette.action = (hex, x, y, piece, center)=> {
                    let item = itemForMap();
                    hex.putItem(item, Math.round(x), Math.round(y));
                    this.enableDnD(item);
                };
            });
        }

        composite() {
            var me = this;
            this.hex.putItem(new hexM.Composite(0, hexM.HEX_WIDTH).highlight(true), 0, 0);
            this.action(
                function (selected) {
                    var composite = this.hex.getItem(hexM.Composite);
                    if (!selected) {
                        composite.highlight(!composite.isHighlighted())
                    }
                    me.pane.palette.action = (hex, x, y, piece, center)=> {
                        if (composite.isHighlighted()) {
                            let comp = composite.duplicate().highlight(true);
                            me.enableCompositeDnD(comp);
                            hex.putItem(comp, 0, 0);
                        }
                        else {
                            composite.clear();
                        }
                    };
                })
                .whenSelect(function () {
                    map.execute(hex=> {
                        if (hex.items.length !== 0) {
                            var composite = new hexM.Composite(0, hexM.HEX_WIDTH).highlight(true);
                            this.enableCompositeDnD(composite);
                            let items = hex.items.slice(0);
                            for (var i = 0; i < items.length; i++) {
                                hex.removeItem(items[i]);
                                this.disableDnD(items[i]);
                                composite.add(items[i]);
                            }
                            hex.putItem(composite, 0, 0);
                        }
                    });
                })
                .whenUnselect(function () {
                    map.execute(hex=> {
                        let composite = hex.getItem(hexM.Composite);
                        if (composite && composite.children.length !== 0) {
                            let items = composite.children.slice(0);
                            for (let i = 0; i < items.length; i++) {
                                composite.remove(items[i]);
                                this.enableDnD(items[i]);
                                hex.putItem(items[i]);
                            }
                        }
                        hex.removeItem(composite);
                    });
                });
        }
    }

    function createSurface(type, colors) {
        let hex = new hexM.Hex(0, 0, hexM.HEX_WIDTH);
        hex.component.move(0, 0);
        hex.setOrder([type]).setSurface(new hexM.Surface(type, colors));
        hex.component.add(new svg.Hexagon(hex.width, "V").color([], colors[1], colors[2]));
        return hex;
    }

    class NewPopin extends gui.Popin {

        constructor() {
            super(1000, 700);
            this.whenOk(function() {
                this.close();
            }).whenCancel();
            this.hexSelector = new gui.Selector(-200, -200, 200, 100, [
                createSurface("a", [[80, 180, 80], 4, [60, 140, 60]]).component,
                createSurface("b", [[180, 80, 80], 4, [140, 60, 60]]).component,
                createSurface("c", [[80, 80, 180], 4, [60, 60, 140]]).component
            ]);
            this.add(this.hexSelector);
            this.turnSelector = new gui.NumberField(200, -200, 300, 100, 4).font("arial", 60).bounds(1, 300);
            this.add(this.turnSelector);
            this.mapResizer = new MapResizer(120, 130, action=>{
                console.log("Action received : "+action);
                if (action==="S+") {
                    map.createBottomRow();
                }
                else if (action==="S-") {
                    map.removeBottomRow();
                }
                else if (action==="N+") {
                    map.createTopRow();
                }
                else if (action==="N-") {
                    map.removeTopRow();
                }
                else if (action==="E+") {
                    map.createRightColumn();
                }
                else if (action==="E-") {
                    map.removeRightColumn();
                }
                else if (action==="W+") {
                    map.createLeftColumn();
                }
                else if (action==="W-") {
                    map.removeLeftColumn();
                }
            }).position(0, 50);
            this.add(this.mapResizer)
        }

    }

    class MapResizer {

        constructor(colCount, rowCount, handler) {
            this.colCount = colCount;
            this.rowCount = rowCount;
            this.handler = handler;
            const backColor = svg.ORANGE;
            const strokeColor = svg.RED;
            const chevronWidth = 50;
            const chevronHeight = 100;
            const chevronThickness = 15;
            const mapWidth = 450;
            const mapHeight = 250;
            const margin = 10;
            const MAX_COLS = 999;
            const MIN_COLS = 2;
            const MAX_ROWS = 999;
            const MIN_ROWS = 2;
            this.colCountText = new svg.Text(this.colCount).font("Arial", 48).position(-mapWidth/2+chevronWidth+60, 10);
            this.rowCountText = new svg.Text(this.rowCount).font("Arial", 48).position(0, -20);
            let leftAdder = new svg.Chevron(chevronWidth, chevronHeight, chevronThickness, "W")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Add col in West");
                    if (this.colCount<MAX_COLS) {
                        this.handler("W+");
                        this.colCount++;
                        this.colCountText.message(this.colCount);
                    }
            });
            let leftRemover = new svg.Chevron(chevronWidth, chevronHeight, chevronThickness, "E")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Remove col in West");
                    if (this.colCount>MIN_COLS) {
                        this.handler("W-");
                        this.colCount--;
                        this.colCountText.message(this.colCount);
                    }
            });
            let rightAdder = new svg.Chevron(chevronWidth, chevronHeight, chevronThickness, "E")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Add col in East");
                    if (this.colCount<MAX_COLS) {
                        this.handler("E+");
                        this.colCount++;
                        this.colCountText.message(this.colCount);
                    }
            });
            let rightRemover = new svg.Chevron(chevronWidth, chevronHeight, chevronThickness, "W")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Remove col in East");
                    if (this.colCount>MIN_COLS) {
                        this.handler("E-");
                        this.colCount--;
                        this.colCountText.message(this.colCount);
                    }
            });
            let topAdder = new svg.Chevron(chevronHeight, chevronWidth, chevronThickness, "N")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Add row in North");
                    if (this.rowCount<MAX_ROWS) {
                        this.handler("N+");
                        this.rowCount++;
                        this.rowCountText.message(this.rowCount);
                    }
            });
            let topRemover = new svg.Chevron(chevronHeight, chevronWidth, chevronThickness, "S")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Remove row in North");
                    if (this.rowCount>MIN_ROWS) {
                        this.handler("N-");
                        this.rowCount--;
                        this.rowCountText.message(this.rowCount);
                    }
            });
            let bottomAdder = new svg.Chevron(chevronHeight, chevronWidth, chevronThickness, "S")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Add row in South");
                    if (this.rowCount<MAX_ROWS) {
                        this.handler("S+");
                        this.rowCount++;
                        this.rowCountText.message(this.rowCount);
                    }
            });
            let bottomRemover = new svg.Chevron(chevronHeight, chevronWidth, chevronThickness, "N")
                .color(backColor, 2, strokeColor).onClick(()=>{
                    console.log("Remove row in South");
                    if (this.rowCount>MIN_ROWS) {
                        this.handler("S-");
                        this.rowCount--;
                        this.rowCountText.message(this.rowCount);
                    }
                });
            this.component = new svg.Translation()
                .add(new svg.Rect(mapWidth, mapHeight).color(svg.LIGHT_GREEN, 3, svg.GREEN))
                .add(leftAdder.position(-mapWidth/2-chevronWidth/2-margin, 0))
                .add(leftRemover.position(-mapWidth/2+chevronWidth/2+margin, 0))
                .add(rightAdder.position(mapWidth/2+chevronWidth/2+margin, 0))
                .add(rightRemover.position(mapWidth/2-chevronWidth/2-margin, 0))
                .add(topAdder.position(0, -mapHeight/2-chevronWidth/2-margin))
                .add(topRemover.position(0, -mapHeight/2+chevronWidth/2+margin))
                .add(bottomAdder.position(0, mapHeight/2+chevronWidth/2+margin))
                .add(bottomRemover.position(0, mapHeight/2-chevronWidth/2-margin))
                .add(this.colCountText).add(this.rowCountText);
        }

        position(x, y) {
            this.component.move(x, y);
            return this;
        }

    }

    var map = new hexM.Map(3, 3, hexM.HEX_WIDTH, ["a", "b", "c", "d"], [180, 240, 180])
        .addGlasses(function (hex, x, y, piece, center) {
        palette.action(hex, x, y, piece, center);
    });

    var drawing = new gui.Canvas(1500, 1050)
        .add(new gui.Frame(1000, 1000).set(map.component).position(510, 510).component);
    var paneSaveLoad = new fileManager.FilePane([[255, 230, 150], 4, [10, 10, 10]], "Save/load", 120, "/uscw/edit")
        .newPopin(NewPopin);
    var paneTerrain = new gui.Pane([svg.BEIGE, 4, [10, 10, 10]], "Terrain", 120);
    var panePath = new gui.Pane([[215, 230, 150], 4, [10, 10, 10]], "Path", 120);
    var paneBuilding = new gui.Pane([[195, 230, 150], 4, [10, 10, 10]], "Building", 120);
    var palette = new gui.Palette(400, 1000).position(1230, 510)
        .addPane(paneSaveLoad)
        .addPane(paneTerrain)
        .addPane(panePath)
        .addPane(paneBuilding);

    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), paneTerrain).surface("a", [[80, 180, 80], 4, [60, 140, 60]]);
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), paneTerrain).surface("b", [[80, 80, 180], 4, [60, 60, 140]]);
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), panePath).line("c", 0.2, [[180, 180, 180], 4, [120, 120, 120]]);
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), panePath).line("c", 0.3, [[180, 180, 180], 4, [120, 120, 120]]);
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), panePath).border("d", 0.6, [[120, 120, 230], 4, [90, 90, 150]]);
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), paneBuilding).commonItem(
        function () {
            return new hexM.House(30, 20, [[180, 80, 80], 2, [140, 60, 60]], 30);
        },
        function () {
            return new hexM.House(30, 20, [[180, 80, 80], 2, [140, 60, 60]], 0);
        });
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), paneBuilding).commonItem(
        function () {
            return new hexM.RoundOpenTower(15, [[180, 180, 180], 2, [40, 40, 40]]);
        },
        function () {
            return new hexM.RoundOpenTower(15, [[180, 180, 180], 2, [40, 40, 40]]);
        });
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), paneBuilding).commonItem(
        function () {
            return new hexM.SquareOpenTower(30, 30, [[180, 180, 180], 2, [40, 40, 40]], 15);
        },
        function () {
            return new hexM.SquareOpenTower(30, 30, [[180, 180, 180], 2, [40, 40, 40]], 0);
        });
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), paneBuilding).commonItem(
        function () {
            return new hexM.Bridge(40, 14, [[200, 200, 200], 2, [40, 40, 40]], 0);
        },
        function () {
            return new hexM.Bridge(40, 14, [[200, 200, 200], 2, [40, 40, 40]], 0);
        });
    new HexSupport(new hexM.Hex(0, 0, hexM.HEX_WIDTH), paneBuilding).composite();

    var hexHouse = new hexM.Hex(0, 0, hexM.HEX_WIDTH);
    new HexSupport(hexHouse, paneBuilding).action(
        function () {
            palette.action = function (hex, x, y, piece, center) {
            };
        });

    drawing.add(palette.component);

    return drawing;
};
