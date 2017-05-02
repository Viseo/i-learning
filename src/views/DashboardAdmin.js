exports.DashboardAdmin = function(globalVariables){
const util = globalVariables.util,
    Manipulator = util.Manipulator,
    svg = globalVariables.svg,
    drawing = globalVariables.drawing;

    class DashboardAdmin {
        constructor(presenter){
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
        }

        display(){
            drawing.manipulator.add(this.manipulator);
            let labels = this.getLabels();
            labels.forEach((label,i) => {
                this.manipulator.add(new svg.Text(label).position(i*50, 0));
            })
            this.manipulator.move(drawing.width/2, drawing.height/2);
        }

        getLabels(){
            return this.presenter.getLabels();
        }

        refresh(){

        }
    }
    return DashboardAdmin;
}