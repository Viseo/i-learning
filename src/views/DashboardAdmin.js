exports.DashboardAdmin = function(globalVariables){
const util = globalVariables.util,
    Manipulator = util.Manipulator,
    svg = globalVariables.svg,
    drawing = globalVariables.drawing;

    class DashboardAdmin {
        constructor(presenter){
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
            this.header = new globalVariables.domain.HeaderVue();
        }

        display(){
            drawing.manipulator.add(this.manipulator);

            let headerManipulator = this.header.getManipulator();
            this.manipulator.add(headerManipulator);
            this.header.display("Dashboard");

            let labels = this.getLabels();
            labels.forEach((label,i) => {
                _displayMiniature(label);
            })
        }

        getLabels(){
            return this.presenter.getLabels();
        }

        refresh(){

        }
    }
    return DashboardAdmin;
}