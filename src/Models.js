exports.Models = function(globalVariables){
    const util = globalVariables.util;

    class Formations{
        constructor(){
            this._formations = [];
        }

        sync(){
            return util.Server.getAllFormations().then(data=>{
                this._formations = [];
                let formation = JSON.parse(data).myCollection;
                formation.forEach(form => this._formations.push(new Formation(form)));
            });
        }

        getFormations() {
            return this._formations;
        }
        createFormation(label){
            let newFormation = new Formation({label:label});
            this._formations.push(newFormation);
            let result = newFormation.saveNewFormation();
            return result;
        }

        loadFormation(formation){
            let tmpLevelsTab = formation.levelsTab;
            formation.levelsTab = [];
            tmpLevelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    game.tabQuestions && gamesTab.push(new Quiz(game, false, formation));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                formation.levelsTab.push(new Level(formation, gamesTab, globalVariables.playerMode));
            });
        }
    }

    class Formation{
        constructor(formation) {
            this.links = [];
            this._id = (formation._id || null);
            this.formationId = (formation.formationId || null);
            this.progress = formation.progress;
            if (formation.imageSrc) {
                this.imageSrc = formation.imageSrc;
            }
            this.labelDefault = "Entrer le nom de la formation";
            // HEIGHT
            this.levelsTab = [];
            this.label = formation.label ? formation.label : "";
            this.status = formation.progress ? formation.progress.status : (formation.status ? formation.status : 'NotPublished');
        }

        saveNewFormation(callback) {
            const getObjectToSave = () => {
                return {
                    label: this.label,
                    gamesCounter: this.gamesCounter,
                    links: this.links,
                    levelsTab: this.levelsTab
                };
            };

            return util.Server.insertFormation(getObjectToSave(), ignoredData)
                .then(data => {
                    let answer = JSON.parse(data);
                    if (answer.saved) {
                        this._id = answer.idVersion;
                        this.formationId = answer.id;
                        return {status: true, formation:this}
                    } else {
                        if (answer.reason === "NameAlreadyUsed") {
                            return {status: false, error: 'Nom déjà utilisé'}
                        }
                    }
                });
        }
    }

    class Level{
        constructor(gamesTab){
            this.gamesTab = gamesTab;
        }
    }

    class User {
        constructor(user){
            this.lastName = user.lastName;
            this.firstName = user.firstName;
            this.lastAction = (user.lastAction) ? user.lastAction : {};
        }
    }

    class Game{


    }

    class Quiz {
        constructor(game){
            this.label = game.label;
        }
    }

    class Question{

    }

    return {
        Formations,
        User
    }
}



