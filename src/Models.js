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
            return newFormation;
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



