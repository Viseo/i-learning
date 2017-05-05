/**
 * Created by TBE3610 on 05/05/2017.
 */

exports.QuizCollabV = function(globalVariables){
    const util = globalVariables.util,
          Manipulator = util.Manipulator;

    class QuizCollabV{
        constructor(presenter){
            this.presenter = presenter;
            this.manipulator = new Manipulator(this);
        }

        display(){
            console.log('quiz display')
        }
    }

    return QuizCollabV;
}