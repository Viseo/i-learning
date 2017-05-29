/**
 * Created by minhhuyle on 29/05/2017.
 */
exports.DollCollabV = function(globalVariables) {
    const View = globalVariables.View,
        util = globalVariables.util,
        Manipulator = util.Manipulator,
        drawing = globalVariables.drawing;

    class DollCollabV extends View{
        constructor(presenter){
            super(presenter);
            this.manipulator = new Manipulator(this);
        }

        display(){
            drawing.manipulator.set(0, this.manipulator);
            this.manipulator.add(this.header.getManipulator());
            this.header.display(this.getLabel());
        }

        getLabel(){
            return this.presenter.getLabel();
        }
    }

    return DollCollabV;
};