exports.FormationAdminV = function(globalVariables) {
    const util = globalVariables.util,
        Manipulator = util.Manipulator,
        svg = globalVariables.svg,
        gui = globalVariables.gui,
        drawing = globalVariables.drawing,
        IconCreator = globalVariables.domain.IconCreator;


    class FormationAdminV{
        constructor(presenter){
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
            this.label = this.getLabel();
        }
        getLabel(){
            return this.presenter.getLabel();
        }

        display(){
            drawing.manipulator.set(0,this.manipulator);
            this.manipulator.add(this.header.getManipulator());
            this.header.display(this.label);
        }
    }

    return FormationAdminV;
}