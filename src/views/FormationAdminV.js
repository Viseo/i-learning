

exports.FormationAdminV = function(globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.domain.IconCreator;


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
                height: drawing.height - this.header.height - 4*MARGIN - this.buttonSize.height
            };
            this.librarySize = {
                width: this.inputSize.width,
                height : drawing.height - this.header.height - 7*MARGIN - 2*this.buttonSize.height
            }


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
            manipulatorAdding();
            createNameFieldFormation();
            createReturnButton();
            createGraphPanel();
            createGameLibrary();
            createButtons();
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