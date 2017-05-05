

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
                this.returnButton = new gui.Button(300, 30, [myColors.white, 1, myColors.grey], 'Retourner aux formations');
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
            let createNameFieldFormation = () => {
                this.inputSize = {width: 400, height:30};
                this.buttonSize= {width:40, height:30};
                let nameFieldFormation = new gui.TextField(0,0, this.inputSize.width, this.inputSize.height, 'Ajouter une formation')
                nameFieldFormation.font('Arial', 15).color(myColors.grey);
                nameFieldFormation.text.position(-this.inputSize.width/2 + MARGIN, 7.5);
                nameFieldFormation.control.placeHolder('Ajouter une formation');
                nameFieldFormation.onInput((oldMessage, message, valid)=>{
                    if (!message || !oldMessage){
                        nameFieldFormation.text.message('Ajouter une formation');
                    }
                    nameFieldFormation.text.position(-this.inputSize.width/2+MARGIN, 7.5);
                });
                nameFieldFormation.color([myColors.lightgrey, 1, myColors.black]);
                this.headHeight += 30 + MARGIN;
                this.nameFieldManipulator.add(nameFieldFormation.component);
                this.nameFieldManipulator.move(MARGIN + this.inputSize.width/2, this.header.height + MARGIN + this.inputSize.height/2);

                let addButton = new gui.Button(this.buttonSize.width,this.buttonSize.height, [myColors.grey, 0, myColors.none], '+');
                addButton.position(this.inputSize.width/2 + this.buttonSize.width/2 + MARGIN, 0);
                addButton.text.color(myColors.white, 0, myColors.none).font('Arial', 30).position(0,10);
                addButton.back.corners(5,5);
                this.addFormationField = nameFieldFormation;
            }
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.nameFieldManipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
            this.label = this.getLabel();
            this.manipulator
                .add(this.nameFieldManipulator);
            createReturnButton();
            createNameFieldFormation();
        }
        getLabel(){
            return this.presenter.getLabel();
        }

        returnHandler(){
            this.presenter.returnHandler();
        }

        flush(){
          drawing.manipulator.unset(0);
        }

        display(){
            drawing.manipulator.set(0,this.manipulator);
            this.manipulator.add(this.header.getManipulator());
            this.header.display(this.label);
        }
    }

    return FormationAdminV;
}