

exports.FormationAdminV = function(globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        IconCreator = globalVariables.domain.IconCreator,
        LEVEL_HEIGHT = 150,
        MINIATURE_WIDTH = 150,
        MINIATURE_HEIGHT = 75,
        installDnD = globalVariables.gui.installDnD;


    class FormationAdminV{
        constructor(presenter){
            this.buttonSize= {width:150, height:50};
            this.inputSize = {width: 300, height:30};
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.nameFieldManipulator = new Manipulator(this).addOrdonator(4);
            this.header = new globalVariables.domain.HeaderVue();
            this.label = this.getLabel();
            this.graphSize = {
                width: drawing.width-this.inputSize.width-3*MARGIN,
                height: drawing.height - this.header.height - 4*MARGIN - this.buttonSize.height,
            };
            this.librarySize = {
                width: this.inputSize.width,
                height : drawing.height - this.header.height - 7*MARGIN - 2*this.buttonSize.height
            }

        }

        getFormation(){
            return this.presenter.getFormation();
        }

        getLabel(){
            return this.presenter.getLabel();
        }

        returnHandler(){
            this.presenter.returnHandler();
        }

        flush(){
          drawing.manipulator.flush();
        }

        display(){
            drawing.manipulator.set(0,this.manipulator);
            this.manipulator.add(this.header.getManipulator());
            this.header.display(this.label);
            let manipulatorAdding = () => {
                this.manipulator.add(this.header.getManipulator());
                this.manipulator
                    .add(this.nameFieldManipulator);
            }

            let createNameFieldFormation = () => {
                let nameFieldFormation = new gui.TextField(0,0, this.inputSize.width - 25 - MARGIN, this.inputSize.height, this.label)
                nameFieldFormation.font('Arial', 15).color(myColors.grey);
                nameFieldFormation.text.position(-nameFieldFormation.width/2 + MARGIN, 7.5);
                nameFieldFormation.control.placeHolder('Titre de la formation');
                nameFieldFormation.onInput((oldMessage, message, valid)=>{
                    if (!message || !oldMessage){
                        nameFieldFormation.text.message('Titre de la formation');
                    }
                    nameFieldFormation.text.position(-nameFieldFormation.width/2+MARGIN, 7.5);
                });
                nameFieldFormation.color([myColors.lightgrey, 1, myColors.black]);
                this.headHeight += 30 + MARGIN;
                this.nameFieldManipulator.set(0,nameFieldFormation.component);
                this.nameFieldManipulator.move(MARGIN + nameFieldFormation.width/2, this.header.height + MARGIN + this.inputSize.height*2);

                let saveIcon = new util.Picture('../../images/save.png', false, this,'',null);
                saveIcon.draw(nameFieldFormation.width/2 + 12.5 + MARGIN, 0, 25,25, this.nameFieldManipulator, 3);
                svg.addEvent(saveIcon.imageSVG, 'click', this.renameFormation.bind(this));
                this.nameFormationField = nameFieldFormation;
            }
            let createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(this.inputSize.width, this.inputSize.height, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnHandler.bind(this));
                this.returnButton.back.corners(5,5);
                this.returnButton.text.font('Arial', 20).position(0,6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width/2 + MARGIN,this.header.height + this.returnButton.height/2 + MARGIN);
                let chevron = new svg.Chevron(10,20,3,'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator.add(chevron);
                this.manipulator.add(this.returnButtonManipulator);
            }
            let createGameLibrary = ()=>{
                this.gamePanel = new gui.Panel(this.librarySize.width, this.librarySize.height);
                this.gamePanel.border.color(myColors.none, 1, myColors.grey).corners(5,5);
                this.gameLibraryManipulator = new Manipulator(this).addOrdonator(3);
                this.gameLibraryManipulator.set(0,this.gamePanel.component);
                this.gameLibraryManipulator.move(this.inputSize.width/2 + MARGIN, this.gamePanel.height/2 + this.header.height + 2* this.inputSize.height + 4*MARGIN);
                this.manipulator.add(this.gameLibraryManipulator);
                this.titleLibrary = new svg.Text('Jeux').color(myColors.grey).font('Arial', 25).anchor('left');
                this.titleLibrary.position(-0.85*this.gamePanel.width/2, -this.gamePanel.height/2 + 8.33);
                this.gameLibraryManipulator.set(2,this.titleLibrary);
                this.titleLibraryBack = new svg.Rect(this.titleLibrary.boundingRect().width + 2*MARGIN, 3).color(myColors.white);
                this.titleLibraryBack.position(-0.85*this.gamePanel.width/2 + this.titleLibrary.boundingRect().width/2,
                    -this.gamePanel.height/2);
                this.gameLibraryManipulator.set(1,this.titleLibraryBack);

            }

            manipulatorAdding();
            createNameFieldFormation();
            createReturnButton();
            createGameLibrary();
            this.displayGraph();
        }

        displayGraph(){
            this.graphManipulator && this.graphManipulator.flush();
            let createGraphPanel = ()=>{
                this.graphPanel = new gui.Panel(this.graphSize.width, this.graphSize.height);
                this.graphManipulator = new Manipulator(this).addOrdonator(3);
                this.graphManipulator.set(0, this.graphPanel.component);
                this.manipulator.add(this.graphManipulator);
                this.graphManipulator.move(-this.graphSize.width/2 + drawing.width - MARGIN,
                    this.header.height + 2*MARGIN + this.graphSize.height/2);
                this.graphPanel.border.color(myColors.none, 1, myColors.grey).corners(5,5);
                this.titleGraph = new svg.Text('Formation : ' +  this.label).font('Arial', 25).color(myColors.grey).anchor('left');
                this.titleGraph.position(-0.85*this.graphSize.width/2, -this.graphSize.height/2 + 8.3);
                this.graphManipulator.set(2,this.titleGraph);
                this.titleGraphBack = new svg.Rect(this.titleGraph.boundingRect().width + 2*MARGIN, 3).color(myColors.white);
                this.titleGraphBack.position(-0.85*this.graphSize.width/2 + this.titleGraph.boundingRect().width/2, -this.graphSize.height/2);
                this.graphManipulator.set(1,this.titleGraphBack);
            }
            let createButtons = ()=>{
                this.buttonsManipulator = new Manipulator(this);
                this.saveButton = new gui.Button(this.buttonSize.width, this.buttonSize.height, [myColors.white, 1, myColors.grey], 'Enregistrer');
                this.saveButton.position(0.4*this.graphPanel.width, 0);
                this.saveButton.back.corners(5,5);
                this.buttonsManipulator.add(this.saveButton.component);
                this.manipulator.add(this.buttonsManipulator);
                this.buttonsManipulator.move(this.gamePanel.width + MARGIN*2,
                    this.buttonSize.height/2 + this.graphPanel.height + this.header.height + 3*MARGIN);
                this.publishButton = new gui.Button(this.buttonSize.width, this.buttonSize.height, [myColors.white, 1, myColors.grey], 'Publier');
                this.publishButton.position(this.graphPanel.width*0.6, 0);
                this.publishButton.back.corners(5,5);
                this.buttonsManipulator.add(this.publishButton.component);
                this.manipulator.add(this.buttonsManipulator);
            }
            createGraphPanel();
            createButtons();
            let formation = this.getFormation();
            formation.levelsTab.forEach(level =>{
                this.displayLevel(level);
            });

        }

        displayLevel(level){
            let createGameMiniature = (game)=>{
                let miniature = {
                    border: new svg.Rect(MINIATURE_WIDTH, MINIATURE_HEIGHT).corners(10,10).color(myColors.white, 1, myColors.grey),
                    content: new svg.Text(game.label).font('Arial', 15).position(0,5),
                    manipulator : new Manipulator(this)
                }
                miniature.conf = {
                    drag: (what, x, y) => {
                        //updateAllLinks();
                        return {x:x, y:y};
                    },
                    clicked : (what) => {
                        what.parentObject.miniature.miniatureClickHandler();
                    },
                    moved: (what) => {
                        let point = what.component.parent.globalPoint(what.x,what.y);
                        this.dropAction(point.x,point.y, game);
                        return true;
                    }
                };
                installDnD(miniature.manipulator,  drawings.component.glass.parent.manipulator.last, miniature.conf);
                return miniature;
            };
            let levelManipulator = new Manipulator(this).addOrdonator(4);
            let levelIndex = level.index;
            let levelMiniature = {
                line : new svg.Line(0,5,150,5).color(myColors.black, 1, myColors.black),
                text: new svg.Text('Level : ' + (levelIndex+1)).font('Arial', 15).anchor('left'),
                icon : {
                    rect : new svg.Rect(20, 100).color(myColors.white, 1, myColors.black).position(150, 5).corners(10,10),
                    whiteRect: new svg.Rect(10, 110).color(myColors.white, 0, myColors.none).position(158,5)
                }
            }
            this.graphManipulator.add(levelManipulator);
            levelManipulator.move(-this.graphSize.width/2 + MARGIN, (levelIndex)*LEVEL_HEIGHT - this.graphSize.height/2 + LEVEL_HEIGHT/2) ;
            levelManipulator.set(0,levelMiniature.line)
                .set(1,levelMiniature.text)
                .set(2,levelMiniature.icon.rect)
                .set(3, levelMiniature.icon.whiteRect);
            level.gamesTab.forEach(game => {
                let gameMiniature = createGameMiniature(game);
                gameMiniature.manipulator.add(gameMiniature.border)
                    .add(gameMiniature.content);
                levelManipulator.add(gameMiniature.manipulator);
                gameMiniature.manipulator.move(160 + game.index * (MINIATURE_WIDTH + MARGIN) + MINIATURE_WIDTH/2
                    , 5);
            });
        }

        renameFormation(){
            this.presenter.renameFormation(this.nameFormationField.textMessage).then(status=>{
                if (status){
                    this.header.display(this.nameFormationField.textMessage);
                    this.titleGraph.message('Formation : ' + this.nameFormationField.textMessage);
                    this.titleGraphBack.dimension(this.titleGraph.boundingRect().width + 2*MARGIN, 3);
                    this.titleGraphBack.position(-0.85*this.graphSize.width/2 + this.titleGraph.boundingRect().width/2, -this.graphSize.height/2);
                }
            });
        }

        dropAction(x, y, item) {
            //this.selectedGame && this.selectedGame.removeRedCross();
            let formation = this.getFormation();
            let game;
            if (item && item.parentObject) {
                game = item.parentObject;
            }
            else{
                game = null;
            }
            let getDropLocation = (x,y) => {
                let dropLocation = this.graphPanel.content.localPoint(x,y);
                return dropLocation;
            };
            let getLevel = (dropLocation) => {
                let level = -1;
                level = Math.floor(dropLocation.y/LEVEL_HEIGHT);
                if (level >= formation.levelsTab.length) {
                    level = formation.levelsTab.length;
                    this.addNewLevel(level);
                }
                return level;
            };
            let getColumn = (dropLocation, level) => {
                level = formation.levelsTab[level];
                let column = Math.floor(dropLocation.x / (MINIATURE_WIDTH + MARGIN));
                column = column == 0 ? 1 : column > level.gamesTab.length ? level.gamesTab.length+1 : column;
                return column;
            };

            let dropLocation = getDropLocation(x,y);
            let level = getLevel(dropLocation);
            // if (game instanceof GameVue){
            //     var lastLevel = game.levelIndex;
            // }
            let column = getColumn(dropLocation, level);
            // if (game && !item.addNew) {
                this.moveGame(item, level, column);
                // if(this.levelsTab[lastLevel].gamesTab.length == 0){
                //     this.levelsTab[lastLevel].redCrossClickHandler();
                // }
                //game.levelIndex = level;
            // } else {
            //     this.addNewGame(level, column)
            // }
            // if(lastLevel ==0 || lastLevel){
            //     game.levelIndex == lastLevel || game.miniature.removeAllLinks();
            // }
            this.displayGraph();
        }
        moveGame(game, level, column){
            this.presenter.moveGame(game,level,column);
            // this.levelsTab[game.levelIndex].gamesTab.splice(game.gameIndex, 1);
            // this.levelsTab[level].gamesTab.splice(column, 0, game);
            // game.levelIndex = level;
            //if (this.levelsTab[game.levelIndex].gamesTab.length === 0 && game.levelIndex == this.levelsTab.length - 1){
            //    this.levelsTab.splice(game.levelIndex, 1);
            //}
        }

        displayMessage(message){
            let messageText = new svg.Text(message).font('Arial', 20);
            messageText.position(drawing.width/2, this.header.height + 20);
            this.manipulator.add(messageText);
            svg.timeout(()=>{
                this.manipulator.remove(messageText);
            }, 3000);
        }
    }

    return FormationAdminV;
}