/**
 * Created by minhhuyle on 09/05/2017.
 */
exports.Presenter = function(globalVariables){

    class Presenter {
        constructor(state){
            this.state = state;
            this.view;
        }

        /**
         * STATE
         * */
        returnToOldPage(){
            this.state.returnToOldPage();
        }

        clearOldPageStackAndLoadPresenterConnection(){
            this.state.clearOldPageStackAndLoadPresenterConnection();
        }

        clearOldPageStackAndLoadPresenterDashboard(){
            this.state.clearOldPageStackAndLoadPresenterDashboard();
        }

        /**
         * VIEW
         * */
        displayView(){
            this.view.display();
        }

        flushView(){
            this.view.flush();
        }
    };

    return {Presenter};
};