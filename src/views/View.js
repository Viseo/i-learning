/**
 * Created by minhhuyle on 09/05/2017.
 */
exports.View = function(globalVariables){
    const drawing = globalVariables.drawing,
        HeaderVue = globalVariables.HeaderVue;

    class View {
        constructor(presenter){
            this.presenter = presenter;
            this.header = new HeaderVue(this.presenter);
        }

        flush(){
            drawing.manipulator.flush();
        }

        returnToOldPage(){
            this.presenter.returnToOldPage();
        }

        resize(){
            alert("Resize Event");
        }
    };

    return {View};
};