/**
 * Created by minhhuyle on 09/05/2017.
 */
exports.View = function(globalVariables){
    const drawing = globalVariables.drawing,
        HeaderVue = globalVariables.domain.HeaderVue;

    class View {
        constructor(presenter){
            this.presenter = presenter;
            this.header = new HeaderVue(null, this.presenter);
        }

        flush(){
            drawing.manipulator.flush();
        }
    };



    return {View};
};