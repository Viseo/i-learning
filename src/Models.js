exports.Models = function(globalVariables){
    const util = globalVariables.util;

    class Formations{
        getFormations() {
            return this._formations;
        }

        setFormations(value) {
            this._formations = value;
        }

        constructor(){
            this._formations = [];
        }

        getFormationsFromBdd(){
            return util.Server.getAllFormations().then(data=>{
                this._formations = [];
                let formation = JSON.parse(data).myCollection;
                formation.forEach(form => this._formations.push(new Formation(form)));
            });
        }
    }

    class Formation{
        constructor(formation){
            this.label = formation.label;
        }
    }

    class Game{

    }

    class Quiz {

    }

    class Question{

    }

    return {
        Formations
    }
}



