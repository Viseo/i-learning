exports.Models = function(globalVariables){
    const util = globalVariables.util;

    class Formations{
        constructor(){
            this._formations = [];
        }

        sync(){
            return util.Server.getAllFormations().then(data=>{
                var _sortFormationsList = () => {
                    const sortAlphabetical = function (array) {
                        return sort(array, (a, b) => (a.label.toLowerCase() < b.label.toLowerCase()));
                    };
                    this._formations = sortAlphabetical(this._formations);
                };

                this._formations = [];
                let formation = JSON.parse(data).myCollection;
                formation.forEach(form => this._formations.push(new Formation(form)));
                _sortFormationsList();
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

        addNewFormation(object){
            const
                messageSave = "Votre travail a bien été enregistré.",
                messageError = "Vous devez remplir correctement le nom de la formation.",
                messageReplace = "Les modifications ont bien été enregistrées.",
                messageUsedName = "Le nom de cette formation est déjà utilisé !",
                messageNoModification = "Les modifications ont déjà été enregistrées.";
            return util.Server.insertFormation(object, status, ignoredData)
                .then(data => {
                    let answer = JSON.parse(data);
                    if (answer.saved) {
                        this._id = answer.idVersion;
                        this.formationId = answer.id;
                        return messageSave;
                    } else {
                        if (answer.reason === "NameAlreadyUsed") {
                            return messageUsedName;
                        }
                    }
                })
        }
        getId(){
            if (this._id){
                return this._id;
            }
            else{
                return null;
            }
        }
        setLabel(label){
            this.label = label;
        }

        replaceFormation(object) {
            const
                messageSave = "Votre travail a bien été enregistré.",
                messageReplace = "Les modifications ont bien été enregistrées.",
                messageUsedName = "Le nom de cette formation est déjà utilisé !",
                messageNoModification = "Les modifications ont déjà été enregistrées.";
            return util.Server.replaceFormation(this._id, object, status, ignoredData)
                .then((data) => {
                    let answer = JSON.parse(data);
                    if (answer.saved) {
                        return messageSave;
                    } else {
                        switch (answer.reason) {
                            case "NoModif" :
                                return messageNoModification;
                                break;
                            case "NameAlreadyUsed" :
                                return messageUsedName;
                                break;
                        }
                    }
                })
        };
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
            this.lastAction = new LastAction(user.lastAction);
        }

        hasLastAction(){
            return this.lastAction.hasLastAction();
        }

        getLastActionQuestionsAnswered(){
            return this.lastAction.getQuestionsAnswered();
        }

        getLastActionFormationId(){
            return this.lastAction.getFormationId();
        }

        getLastActionFormationVersion(){
            return this.lastAction.getFormationVersion();
        }

        getLastActionCurrentIndexQuestion(){
            return this.lastAction.getCurrentIndexQuestion();
        }

        getLastActionTypeOfGame(){
            return this.lastAction.getTypeOfGame();
        }

    }


    class LastAction {
        constructor(lastAction = {}){
            this.indexQuestion = lastAction.indexQuestion ;
            this.questionsAnswered = lastAction.questionsAnswered;
            this.game = lastAction.game;
            this.version = lastAction.version;
            this.formation = lastAction.formation;
        }

        hasLastAction(){
            var hasLasAction = false;
            if(this.formation){
                hasLasAction = true;
            }
            return hasLasAction;
        }

        getQuestionsAnswered(){
            return this.questionsAnswered;
        }

        getFormationId(){
            return this.formation;
        }

        getFormationVersion(){
            return this.version;
        }

        getCurrentIndexQuestion(){
            return this.indexQuestion;
        }

        getTypeOfGame(){
            return this.game;
        }
    }

    class Game{


    }

    class Quiz {
        constructor(quiz){
            this.id = quiz.id;
            this.label = quiz.label;
            this.questions = quiz.questions;
        }

        getLabel(){
            return this.label;
        }
        getQuestionLabel(index){
            return this.questions[index] ? this.questions[index].label : "";
        }
        getAnswers(questionIndex){
            return this.questions[questionIndex] ? this.questions[questionIndex].answers : [];
        }
    }

    class Question{

    }

    return {
        Formations,
        User,
        Quiz //TODO à retirer après les tests
    }
}



