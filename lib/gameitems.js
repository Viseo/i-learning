/**
 * Created by HDA3014 on 16/01/2016.
 */

console.log("Game items loaded...");
exports.GameItems = function(svg) {

    class Exit {

        constructor(exit) {
            this.component = new svg.Translation()
                .add(new svg.Triangle(40, 60, "W").position(20, 30).color([100, 100, 255], 4, [80, 80, 120])/*.clickable()*/)
                .add(new svg.Triangle(40, 60, "W").position(40, 30).color([100, 100, 255], 4, [80, 80, 120])/*.clickable()*/);
            this.component.onClick(()=> {
                exit();
            });
        }

    }

    class Smiley {

        constructor(action, type) {
            this.component = new svg.Translation()
                .add(new svg.Circle(35).position(30, 30).color([255, 204, 0], 4, [220, 100, 0])/*.clickable()*/)
                .add(new svg.Circle(5).position(15, 20).color([255, 204, 0], 4, [220, 100, 0])/*.clickable()*/)
                .add(new svg.Circle(5).position(45, 20).color([255, 204, 0], 4, [220, 100, 0])/*.clickable()*/);
            this.component.onClick(function () {
                action();
            });
            this.setType(type);
        }

        setType(type) {
            if (this.sign) {
                this.component.remove(this.sign);
            }
            if (type === ":|") {
                this.sign = new svg.Line(15, 45, 45, 45).color([], 4, [220, 100, 0]);
                this.component.add(this.sign);
            }
            else if (type === ":)") {
                this.sign = new svg.Path(15, 40).bezier(30, 60, 45, 40).color([], 4, [220, 100, 0]);
                this.component.add(this.sign);
            }
            else if (type === ":(") {
                this.sign = new svg.Path(15, 50).bezier(30, 30, 45, 50).color([], 4, [220, 100, 0]);
                this.component.add(this.sign);
            }
        }

    }

    class Die {

        constructor(param) {
            this.param = param;
            this.component = new svg.Translation().add(new svg.Rect(60, 60).position(30, 30).color([255, 255, 255], 3, [50, 50, 50]));
            this.setValue = function (value) {
                let addPoint=(x, y)=> {
                    this.valueGroup.add(new svg.Circle(6).position(x, y).color([50, 50, 50]));
                };

                if (this.value && this.value === value) return;
                if (this.valueGroup) {
                    this.component.remove(this.valueGroup);
                }
                this.valueGroup = new svg.Translation(0, 0);
                switch (value) {
                    case 1:
                        addPoint(30, 30);
                        break;
                    case 2:
                        addPoint(15, 15);
                        addPoint(45, 45);
                        break;
                    case 3:
                        addPoint(15, 15);
                        addPoint(30, 30);
                        addPoint(45, 45);
                        break;
                    case 4:
                        addPoint(15, 15);
                        addPoint(15, 45);
                        addPoint(45, 15);
                        addPoint(45, 45);
                        break;
                    case 5:
                        addPoint(15, 15);
                        addPoint(15, 45);
                        addPoint(45, 15);
                        addPoint(45, 45);
                        addPoint(30, 30);
                        break;
                    case 6:
                        addPoint(15, 15);
                        addPoint(15, 45);
                        addPoint(15, 30);
                        addPoint(45, 15);
                        addPoint(45, 45);
                        addPoint(45, 30);
                        break;
                }
                this.component.add(this.valueGroup);
                this.value = value;
            };
            this.setValue(1);
        }

        roll(channel) {
            channel = channel || svg.onChannel(null);
            this.randomValue();
            for (var i = 0; i < 10; i++) {
                channel.animate(this.param.speed * 4, ()=>this.randomValue());
            }
        }

        randomValue() {
            this.setValue(Math.floor(svg.random() * 6) + 1);
        }

    }

    class Led {

        constructor(width, height, baseColor, color) {
            this.color = color;
            this.baseColor = baseColor;
            this.component = new svg.Translation();
            this.lines = [
                new svg.Line(-width, 0, -width, -height),
                new svg.Line(-width, -height, width, -height),
                new svg.Line(width, -height, width, 0),
                new svg.Line(-width, 0, width, 0),
                new svg.Line(width, height, width, 0),
                new svg.Line(-width, height, width, height),
                new svg.Line(-width, 0, -width, height)
            ];
            this.lights = [
                [0, 1, 2, 4, 5, 6],
                [2, 4],
                [1, 2, 3, 5, 6],
                [1, 2, 3, 4, 5],
                [0, 2, 3, 4],
                [0, 1, 3, 4, 5],
                [0, 1, 3, 4, 5, 6],
                [1, 2, 4],
                [0, 1, 2, 3, 4, 5, 6],
                [0, 1, 2, 3, 4, 5]
            ];
            for (let line of this.lines) {
                this.component.add(line.color([], 3, this.baseColor));
            }
        }

        reset() {
            for (let line of this.lines) {
                line.color([], 3, this.baseColor);
            }
            return this;
        }

        show(value) {
            this.reset();
            for (var i = 0; i < this.lights[value].length; i++) {
                this.lines[this.lights[value][i]].color([], 3, this.color);
            }
            return this;
        }
    }

    class LedCounter {

        constructor(ledCount, width, height, delta, baseColor, color) {
            this.component = new svg.Translation();
            this.leds = [];
            for (var i = 0; i < ledCount; i++) {
                var led = new Led(width, height, baseColor, color);
                this.component.add(led.component.move(i * (width * 2 + delta), 0));
                this.leds.push(led);
            }
        }

        reset() {
            this.leds.forEach(function (led) {
                led.reset()
            });
        }

        show(value, full) {
            this.reset();
            var digit = value % 10;
            var index = this.leds.length - 1;
            value = Math.floor(value / 10);
            this.leds[index--].show(digit);
            while ((value > 0 || full) && index >= 0) {
                digit = value % 10;
                value = Math.floor(value / 10);
                this.leds[index--].show(digit);
            }
            return this;
        }

    }

    class TimeDisplay {

        constructor(width, height, delta, baseColor, color) {
            this.hoursDisplay = new LedCounter(2, width, height, delta, baseColor, color);
            this.minutesDisplay = new LedCounter(2, width, height, delta, baseColor, color);
            this.secondsDisplay = new LedCounter(2, width, height, delta, baseColor, color);
            this.component = new svg.Translation();
            var ledWidth = 2 * width * 2 + delta;
            this.component.add(this.hoursDisplay.component);
            this.component.add(this.minutesDisplay.component.move(ledWidth + delta * 2, 0));
            this.component.add(this.secondsDisplay.component.move((ledWidth + delta * 2) * 2, 0));
        }

        reset() {
            this.secondsDisplay.reset();
            this.minutesDisplay.reset();
            this.hoursDisplay.reset();
        }

        show(seconds) {
            this.reset();
            this.secondsDisplay.show(seconds % 60, seconds >= 60);
            var minutes = Math.floor(seconds / 60);
            if (minutes > 0) {
                this.minutesDisplay.show(minutes % 60, minutes >= 60);
                var hours = Math.floor(minutes / 60);
                if (hours > 0) {
                    this.hoursDisplay.show(hours % 100);
                }
            }
            return this;
        }

    }

    class TimeKeeper {

        constructor(width, height, delta, baseColor, color) {
            this.display = new TimeDisplay(width, height, delta, baseColor, color);
            this.component = this.display.component;
            this.seconds = 0;
        }

        reset() {
            this.seconds = 0;
            this.display.show(0);
        }

        start() {
            this.reset();
            this.clockId = svg.interval(()=>{
                this.seconds++;
                this.display.show(this.seconds);
            }, 1000);
        }

        stop() {
            if (this.clockId) {
                svg.clearInterval(this.clockId);
                this.clockId = null;
            }
        }
    }

    class Menu {

        constructor(title, param) {
            this.param = param;
            this.options = [];
            this.canvas = new svg.Drawing(1200, 1000);
            this.setTitle(title);
            this.addOption("Resume game", ()=> {
                this.canvas.hide();
                this.game.resume();
            }, 150, 120, 340, 80);
            this.addOption("New game", ()=> {
                this.canvas.hide();
                this.createGame();
            }, 510, 120, 340, 80);
            this.setParameters("Parameters", 500, 580);
        }

        setTitle(title) {
            this.title = new svg.Translation()
                .add(new svg.Rect(700, 120).color([200, 100, 100], 5, [255, 50, 50]))
                .add(new svg.Text(title).color([255, 50, 50]).position(0, 20).font("Arial", 80));
            this.canvas.add(this.title.move(500, 150))
        }

        addOption(label, todo, x, y, width, height) {
            this.options.push(new svg.Translation()
                .add(new svg.Rect(width, height).color([100, 200, 100], 5, [50, 255, 50])/*.clickable()*/)
                .add(new svg.Text(label).color([50, 255, 50]).position(0, Math.round(height * .2)).font("Arial", Math.round(height * .6))/*.clickable()*/));
            this.options[this.options.length - 1].onClick(todo);
            this.canvas.add(this.options[this.options.length - 1].move(x + width / 2, 150 + y));
        }

        show() {
            this.canvas.show("content");
        }

        setParameters(title, x, y) {
            this.parameters = new svg.Translation()
                .add(new svg.Rect(700, 500).color([150, 150, 250], 5, [50, 50, 255]))
                .add(new svg.Text(title).color([50, 50, 255]).position(0, -200).font("Arial", 50));
            this.canvas.add(this.parameters.move(x, y))
        }

        setGame(game, createGame) {
            this.game = game;
            this.createGame = createGame;
        }

        optionsList(title, options, optionWidth, paramName, x, y) {
            let setOpacity= value=> {
                for (var i in rects) {
                    rects[i].frame.opacity(this.param[paramName] === rects[i].value ? 1 : 0);
                }
            };

            let setCallback= value=> {
                return ()=> {
                    this.param[paramName] = value;
                    setOpacity(value);
                }
            };

            var optionsComponent = new svg.Translation();
            var delta = ((-options.length + 1) * (optionWidth + 5)) / 2;
            var rects = [];
            for (var i in options) {
                rects[i] = {
                    value: options[i].value,
                    frame: new svg.Rect(optionWidth, 50).position(delta + i * (optionWidth + 5), 100).color([150, 150, 250], 3, [255, 50, 50]),
                    text: new svg.Text(options[i].text).position(delta + i * (optionWidth + 5), 110).font("Arial", 30).color([50, 50, 255])
                };
                rects[i].frame/*.clickable()*/.onClick(setCallback(rects[i].value));
                rects[i].text/*.clickable()*/.onClick(setCallback(rects[i].value));
                optionsComponent.add(rects[i].frame);
                optionsComponent.add(rects[i].text);
            }
            optionsComponent.add(new svg.Text(title).position(0, 150).color([50, 50, 255]).font("Arial", 25));
            this.canvas.add(optionsComponent.move(x + delta, y));
            setOpacity(this.param[paramName]);
        }

        setLiveCount(title, paramName, x, y, liveBuilder, maxLives, colors) {
            let colorizeLives=()=> {
                for (var h = 0; h < 4; h++) {
                    if (h < this.param[paramName]) {
                        lives[h].color(colors[0], colors[1], colors[2]);
                    }
                    else {
                        lives[h].color([150, 150, 150], 4, [50, 50, 50]);
                    }
                }
            };

            var livesComponent = new svg.Translation();
            var drawing = new svg.Translation(-60, 70);
            var lives = [];
            for (var i = 0; i < 4; i++) {
                lives[i] = liveBuilder(i);
                drawing.add(lives[i]);
            }
            colorizeLives();
            drawing.onClick(function () {
                this.param[paramName] = (this.param[paramName] % maxLives) + 1;
                colorizeLives();
            });

            livesComponent.add(drawing);
            livesComponent.add(new svg.Text(title).position(0, 150).color([50, 50, 255]).font("Arial", 25));
            this.canvas.add(livesComponent.move(x, y));
        }

        setPlayers(title, paramName, playerType, x, y) {
            this.players = new svg.Translation();
            this.canvas.add(this.players.move(x, y));
            this.players.add(this.createPlayerIcon(this.param[paramName].green, playerType, [0, 255, 0], [0, 100, 0]).move(-100, 50));
            this.players.add(this.createPlayerIcon(this.param[paramName].yellow, playerType, [255, 204, 0], [220, 100, 0]).move(-100, -50));
            this.players.add(this.createPlayerIcon(this.param[paramName].red, playerType, [255, 100, 100], [240, 0, 0]).move(100, 50));
            this.players.add(this.createPlayerIcon(this.param[paramName].blue, playerType, [0, 200, 200], [0, 80, 240]).move(100, -50));
            this.players.add(new svg.Text(title).position(0, 0).color([50, 50, 255]).font("Arial", 25));
        }

        createPlayerIcon(playerParam, playerType, fillColor, strokeColor) {
            var iconBase = new svg.Translation();
            var phantom = createPhantom(fillColor, strokeColor).onClick(change("human"));
            var human = createHuman(fillColor, strokeColor).onClick(change("bot"));
            var bot = createBot(fillColor, strokeColor).onClick(change("none"));
            var icon = null;
            updateOpacity();
            return iconBase;

            function updateOpacity() {
                if (icon) {
                    iconBase.remove(icon);
                }
                if (playerParam[playerType] === "none") {
                    icon = phantom;
                }
                else if (playerParam[playerType] === "human") {
                    icon = human;
                }
                else {
                    icon = bot;
                }
                iconBase.add(icon);
            }

            function change(newType) {
                return function () {
                    playerParam[playerType] = newType;
                    updateOpacity();
                }
            }

            function createPhantom(fillColor, strokeColor) {
                var base = new svg.Translation();
                base.add(new svg.CurvedShield(60, 100, 0.5, "N").color(fillColor, 4, strokeColor)/*.clickable()*/)
                    .add(new svg.Ellipse(8, 12).position(-12, 0).color(fillColor, 4, strokeColor)/*.clickable()*/)
                    .add(new svg.Ellipse(8, 12).position(12, 0).color(fillColor, 4, strokeColor)/*.clickable()*/);
                return base;
            }

            function createHuman(fillColor, strokeColor) {
                var base = new svg.Translation();
                base.add(new svg.CurvedShield(50, 66, 0.5, "N").position(0, 17).color(fillColor, 4, strokeColor)/*.clickable()*/)
                    .add(new svg.Circle(20).position(0, -20).color(fillColor, 4, strokeColor)/*.clickable()*/);
                return base;
            }

            function createBot(fillColor, strokeColor) {
                var base = new svg.Translation();
                base.add(new svg.Rect(60, 50).position(0, 25).color(fillColor, 4, strokeColor)/*.clickable()*/)
                    .add(new svg.Rect(80, 10).position(0, 45).color(fillColor, 4, strokeColor)/*.clickable()*/)
                    .add(new svg.Rect(50, 40).position(0, -20).color(fillColor, 4, strokeColor)/*.clickable()*/)
                    .add(new svg.Rect(40, 30).position(0, -20).color(fillColor, 4, strokeColor)/*.clickable()*/);
                return base;
            }
        }

    }

    return {
        Exit: Exit,
        Die: Die,
        Smiley: Smiley,
        Led: Led,
        LedCounter: LedCounter,
        TimeDisplay: TimeDisplay,
        TimeKeeper: TimeKeeper,
        Menu: Menu
    }
};

