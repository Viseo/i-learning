/**
 * Created by MLE3657 on 20/03/2017.
 */
exports.Bd = function (GameVue) {
    /**
     * Bd
     * @class
     */
    class BdVue extends GameVue {
        /**
         * construit une Bd
         * @constructs
         * @param bd - options sur la bd
         * @param parentFormation - formation contenant la bd
         */
        constructor(bd, parentFormation) {
            super(bd, parentFormation);
            this.returnButton = new ReturnButton(this, "Retour à la formation");
            this.manipulator.add(this.returnButtonManipulator);
        }

        render(bd) {
            drawing.manipulator.unset(1);
            globalVariables.header.display(bd.title);
            drawing.manipulator.add(bd.manipulator);
            bd.returnButton.display(0, drawing.height * HEADER_SIZE + 2 * MARGIN, 20, 20);
            let returnButtonChevron = bd.returnButton.chevronManipulator.ordonator.children[0];
            returnButtonChevron.mark('returnButtonFromBdToFormation');
            bd.returnButton.setHandler(this.previewMode ? (event) => {
                    bd.returnButton.removeHandler(returnHandler);
                    let target = bd.returnButton;
                    target.parent.manipulator.flush();
                    target.parent.parentFormation.quizManager.loadQuiz(target.parent, target.parent.currentQuestionIndex);
                    target.parent.parentFormation.quizManager.display();
                } : (event) => {
                    let target = bd.returnButton;//drawings.background.getTarget(event.pageX, event.pageY);
                    target.parent.manipulator.flush();
                    target.parent.parentFormation.display();
                });
        }
    }

    return {
        BdVue: BdVue
    }
}