/**
 * Created by minhhuyle on 09/05/2017.
 */
exports.View = function(globalVariables){
    const
        svg = globalVariables.svg,
        drawing = globalVariables.drawing,
        Manipulator = globalVariables.Handlers.Manipulator,
        HeaderVue = globalVariables.HeaderVue;

    class View {
        constructor(presenter){
            this.presenter = presenter;
            this.header = new HeaderVue(this.presenter);
        }

        removeActions(){
            svg.removeGlobalEvent('keydown');
        }

        flush(){
            this.removeActions();
            drawing.manipulator.flush();
        }

        returnToOldPage(){
            this.presenter.returnToOldPage();
        }

        resize() {
            let screenSize = globalVariables.runtime.screenSize();
            globalVariables.drawing.dimension(screenSize.width, screenSize.height);
            this.flush();
            this.display();
        }

        display(){
            this.manipulator = new Manipulator(this);
            drawing.manipulator.set(0, this.manipulator);
        }

        displayHeader(message) {
            this.header.display(this.manipulator, message);
        };
    }

    return {View};
};