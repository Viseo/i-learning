exports.FormationCollabV = function (globalVariables) {

    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        View = globalVariables.View;

    svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        MINIATURE_FONT_SIZE = 20,
        MINIATURE_WIDTH = 200,
        MINIATURE_HEIGHT = 75,
        IMAGE_MINIATURE = 50,
        LEVEL_HEIGHT = 150;


    class FormationCollabV extends View {

        constructor(presenter) {
            super(presenter);
            this.buttonSize = {width: 150, height: 50};
            this.inputSize = {width: 300, height: 30};
            this.manipulator = new Manipulator(this);
            this.graphMiniatureManipulator = new Manipulator(this);
            this.nameFieldManipulator = new Manipulator(this).addOrdonator(4);
            this.label = this.getLabel();
            this.graphSize = {
                width: drawing.width - 2 * MARGIN,
                height: drawing.height - this.header.height - 4 * MARGIN - this.buttonSize.height,
            };
            this.mapGameIdAndGui = {};
        }


        getFormation() {
            return this.presenter.getFormation();
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        display() {
            drawing.manipulator.set(0, this.manipulator);
            this.manipulator.add(this.header.getManipulator());
            this.header.getManipulator().mark('header');
            this.header.display(this.label);
            this.displayGraphCollab();
            let formation = this.getFormation();

            formation.levelsTab.forEach((level) => {
                this.displayLevel(level);
            });

            let createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(this.inputSize.width, this.inputSize.height, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5, 5);
                this.returnButton.text.font('Arial', 20).position(0, 5);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width / 2 + MARGIN, this.header.height + this.returnButton.height / 2 + MARGIN);
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator.add(chevron).mark('return');
                this.manipulator.add(this.returnButtonManipulator);

            }
            createReturnButton();
        }

        displayGraphCollab() {
            this.graphManipulator && this.graphManipulator.flush();
            let createGraphPanel = () => {
                this.graphPanel = new gui.Panel(this.graphSize.width, this.graphSize.height);
                this.graphManipulator = new Manipulator(this).addOrdonator(3);
                this.manipulator.add(this.graphManipulator);
                this.graphManipulator.set(0, this.graphPanel.component);
                this.graphPanel.content.add(this.graphMiniatureManipulator.first);
                this.graphMiniatureManipulator.move(this.graphSize.width / 2, this.graphSize.height / 2);
                this.graphManipulator.move(-this.graphSize.width / 2 + drawing.width - MARGIN,
                    this.header.height + 2 * MARGIN + this.graphSize.height / 2 + this.buttonSize.height);
                this.graphPanel.border.color(myColors.none, 1, myColors.grey).corners(5, 5);
                this.titleGraph = new svg.Text('Formation : ' + this.label).font('Arial', 25).color(myColors.grey).anchor('left').mark('title');
                this.titleGraph.position(-0.85 * this.graphSize.width / 2, -this.graphSize.height / 2 + 8.3);
                this.graphManipulator.set(2, this.titleGraph);
                this.titleGraphBack = new svg.Rect(this.titleGraph.boundingRect().width + 2 * MARGIN, 3).color(myColors.white);
                this.titleGraphBack.position(-0.85 * this.graphSize.width / 2 + this.titleGraph.boundingRect().width / 2, -this.graphSize.height / 2);
                this.graphManipulator.set(1, this.titleGraphBack);
            }

            createGraphPanel();
        }


        displayLevel(level) {
            let displayLockAnimation = (targetId, requirementsId) =>{
                let resetAnimation = (targetId)=>{
                    clearTimeout(this.animation.timeOutID);
                    let target = this.mapGameIdAndGui[targetId];
                    target.manipulator.scalor.steppy(10, 10).scaleTo(1);
                    for (let parentId of this.animation.parents){
                        let parentGame = this.mapGameIdAndGui[parentId];
                        parentGame.border.steppy(10,10)
                            .colorTo(parentGame.border.fillColor, 2, myColors.grey);
                    }
                    this.animation.status = false;
                    this.animation.target = null;
                    target.manipulator.set(1, target.content);
                }

                this.animation && this.animation.status && resetAnimation(this.animation.target);
                this.animation = {}
                this.animation.status = true;
                this.animation.target = targetId;
                this.animation.parents = requirementsId;
                let target = this.mapGameIdAndGui[targetId];
                target.manipulator.scalor.steppy(10, 10).scaleTo(1.10);
                target.manipulator.rotator.steppy(10,10).rotate(0,10);
                target.manipulator.rotator.steppy(10,10).rotate(10,-10);
                target.manipulator.rotator.steppy(10,10).rotate(-10,0);
                let text = new svg.Text("Vous devez finir les test\n en rouge \npour débloquer celui ci")
                    .position(0, -target.border.height/3 + MARGIN)
                    .font('Arial', 10)
                    .color(myColors.white);
                target.manipulator.set(1, text);
                for (let parentId of requirementsId){
                    let parentGame = this.mapGameIdAndGui[parentId];
                    parentGame.border.steppy(10,10)
                        .colorTo(parentGame.border.fillColor, 2,myColors.red);
                }

                this.animation.timeOutID = setTimeout(()=>{
                    resetAnimation(targetId);
                }, 5000)
            }


            let createGameMiniature = (game) => {
                let miniature = {
                    border: new svg.Rect(MINIATURE_WIDTH, MINIATURE_HEIGHT).corners(10, 10),
                    content: new svg.Text(game.label).font('Arial', 15).position(0, 5),
                    manipulator: new Manipulator(this).addOrdonator(4)
                };

                miniature.manipulator.mini = miniature;
                miniature.game = game;
                miniature.manipulator.mark('miniature' + game.label);
                if(game.imageSrc){
                    miniature.picture = new svg.Image(game.imageSrc);
                    miniature.picture.dimension(IMAGE_MINIATURE, IMAGE_MINIATURE);
                    miniature.picture.position(-MINIATURE_WIDTH/2 + IMAGE_MINIATURE/2 + MARGIN, 0);
                    miniature.manipulator.add(miniature.picture);
                }

                let requirementsID = this.requirementsForThis(game.id);
                if(requirementsID.length > 0){
                    miniature.border.color(myColors.grey, 1, myColors.greyerBlue);
                    miniature.manipulator.addEvent('click', () => displayLockAnimation(game.id, requirementsID));
                }else{
                    miniature.border.color(myColors.white, 1, myColors.grey);
                    miniature.manipulator.addEvent('click', () => this.onClickGame(game));
                }

                miniature.manipulator.set(0, miniature.border)
                    .set(1, miniature.content);
                return miniature;
            };
            let levelManipulator = new Manipulator(this).addOrdonator(4);
            let levelIndex = level.index;
            let levelMiniature = {
                line: new svg.Line(0, 5, 150, 5).color(myColors.black, 1, myColors.black),
                text: new svg.Text('Level : ' + (levelIndex + 1)).font('Arial', MINIATURE_FONT_SIZE).anchor('left'),
                icon: {
                    rect: new svg.Rect(20, 100).color(myColors.white, 1, myColors.black).position(150, 5).corners(10, 10),
                    whiteRect: new svg.Rect(10, 110).color(myColors.white, 0, myColors.none).position(158, 5)
                }
            };
            this.graphMiniatureManipulator.add(levelManipulator);
            levelManipulator.move(-this.graphSize.width / 2 + MARGIN, (levelIndex) * LEVEL_HEIGHT - this.graphSize.height / 2 + LEVEL_HEIGHT / 2);
            levelManipulator.set(0, levelMiniature.line)
                .set(1, levelMiniature.text)
                .set(2, levelMiniature.icon.rect)
                .set(3, levelMiniature.icon.whiteRect);

            level.gamesTab.forEach(game => {
                let gameMiniature = createGameMiniature(game);
                levelManipulator.add(gameMiniature.manipulator).mark('level');
                this.mapGameIdAndGui[game.id] = gameMiniature;
                gameMiniature.manipulator.move(160 + game.gameIndex * (MINIATURE_WIDTH + MARGIN) + MINIATURE_WIDTH / 2, 5);
            });
        }

        onClickGame(game) {
            this.presenter.onClickGame(game);
        }

        requirementsForThis(gameId){
            return this.presenter.requirementsForThis(gameId);
        }

    }
    return FormationCollabV;
};