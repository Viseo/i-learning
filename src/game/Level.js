/**
 * Created by MLE3657 on 20/03/2017.
 */

exports.Level = function (globalVariables) {


    let
        Manipulator = globalVariables.util.Manipulator;


    /**
     * Niveau d'une formation. Il peut contenir un ou plusieurs quiz. Une formation peut avoir un ou plusieurs niveaux
     * @class
     */
    class Level {
        /**
         * ajoute un niveau à une formation
         * @constructs
         * @param formation - formation qui va contenir le nouveau niveau
         * @param gamesTab - quizs associés à ce niveau
         */
        constructor(formation, gamesTab) {
            this.parentFormation = formation;
            this.manipulator = new Manipulator(this).addOrdonator(3);
            this.redCrossManipulator = new Manipulator(this).addOrdonator(2);
            this.index = (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1]) ? (this.parentFormation.levelsTab[this.parentFormation.levelsTab.length - 1].index + 1) : 1;
            this.gamesTab = gamesTab ? gamesTab : [];
            this.x = this.parentFormation.libraryWidth ? this.parentFormation.libraryWidth : null; // Juste pour être sûr
            this.y = (this.index - 1) * this.parentFormation.levelHeight;
        }

        /**
         * supprime le niveau de la formation parent
         * @param index
         */
        removeGame(index) {
            this.gamesTab.splice(index, 1);
        }

    }

    return {
        Level: Level
    }
}
