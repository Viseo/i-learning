

exports.FormationAdminV = function(globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.domain.IconCreator;


    class FormationAdminV{
        constructor(presenter){
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
            this.buttonSize= {width:40, height:30};
            this.inputSize = {width: 300, height:30};
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.nameFieldManipulator = new Manipulator(this).addOrdonator(2);
            this.header = new globalVariables.domain.HeaderVue();
            this.label = this.getLabel();
            this.manipulator
                .add(this.nameFieldManipulator);
            createReturnButton();

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

            let createNameFieldFormation = () => {
                let nameFieldFormation = new gui.TextField(0,0, this.inputSize.width, this.inputSize.height, this.label)
                nameFieldFormation.font('Arial', 15).color(myColors.grey);
                nameFieldFormation.text.position(-this.inputSize.width/2 + MARGIN, 7.5);
                nameFieldFormation.control.placeHolder('Titre de la formation');
                nameFieldFormation.onInput((oldMessage, message, valid)=>{
                    if (!message || !oldMessage){
                        nameFieldFormation.text.message('Titre de la formation');
                    }
                    nameFieldFormation.text.position(-this.inputSize.width/2+MARGIN, 7.5);
                });
                nameFieldFormation.color([myColors.lightgrey, 1, myColors.black]);
                this.headHeight += 30 + MARGIN;
                this.nameFieldManipulator.add(nameFieldFormation.component);
                this.nameFieldManipulator.move(MARGIN + this.inputSize.width/2, this.header.height + MARGIN + this.inputSize.height*2);

                let saveIcon = new util.Picture('../../images/save.png', false, this,'',null);
                saveIcon.draw(this.inputSize.width/2 + 15 + MARGIN, 0, 25,25, this.nameFieldManipulator, 1);
                svg.addEvent(saveIcon.imageSVG, 'click', this.renameFormation.bind(this));
                this.nameFormationField = nameFieldFormation;
            }
            createNameFieldFormation();
        }

        renameFormation(){
            this.presenter.renameFormation(this.nameFormationField.textMessage);
            this.header.display(this.nameFormationField.textMessage);
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