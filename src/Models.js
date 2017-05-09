exports.Models = function (globalVariables) {
    const util = globalVariables.util,
        drawing = globalVariables.drawing,
        Server = util.Server;


    class State {
        constructor() {
            this.stackPage = [];
            this.formations = new Formations();
            this.currentPresenter = null;
        }

        returnToOldPage() {
            let presenterName = this.stackPage.pop();
            switch(presenterName){
                case "DashboardAdminP":
                    this.loadPresenterDashboard(this.user); break;
                case "ConnectionP":
                    this.loadPresenterConnection(); break;
                default: break;
            }
        }

        _addPageToStack() {
            this.currentPresenter && this.stackPage.push(this.currentPresenter.__proto__.constructor.name);
        }

        clearOldPageStackAndLoadPresenterConnection(){
            this.stackPage = [];
            this.currentPresenter = null;
            this.loadPresenterConnection();
        }

        tryLoadCookieForPresenter(redirect) {
            util.Server.checkCookie().then(data => {
                data = data && JSON.parse(data);
                if (redirect) {
                    password.display(param.ID);
                    redirect = false;
                } else {
                    if (data.ack === 'OK') {
                        this.loadPresenterDashboard(data.user);
                    } else {
                        globalVariables.admin = false;
                        this.loadPresenterConnection();
                    }
                }
            });
        }


        tryConnectForPresenterDashboard(login, pwd, stayConnected){
            return Server.connect(login, pwd, stayConnected).then(data => {
                if(!data) throw 'Connexion refusée';
                data = JSON.parse(data);
                if (data.ack === 'OK') {
                    this.loadPresenterDashboard(data.user);
                } else {
                    throw 'adresse e-mail ou mot de passe invalide';
                }
            });
        }

        loadPresenterDashboard(user){
            this._addPageToStack();

            this.user = new User(user);
            drawing.username = `${user.firstName} ${user.lastName}`;
            user.admin ? globalVariables.admin = true : globalVariables.admin = false;
            this.formations.sync().then(() => {
                this.currentPresenter && this.currentPresenter.flushView();
                if (globalVariables.admin) {
                    this.currentPresenter = new globalVariables.dashboardAdminP(this, this.formations);
                } else {
                    this.currentPresenter = new globalVariables.DashboardCollabP(this.user, this.formations);
                }
                this.currentPresenter.displayView();
            })
        }

        loadPresenterFormationAdmin(formation){
            this._addPageToStack();

            this._loadFormation(formation);
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.FormationsAdminP(this, formation);
            this.currentPresenter.displayView();
        }

        loadPresenterRegister(){
            this._addPageToStack();

            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.RegisterP(this);
            this.currentPresenter.displayView();
        }

        loadPresenterConnection(){
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.ConnectionP(this);
            this.currentPresenter.displayView();
        }

        _loadFormation(formation){
            this.formations.loadFormation(formation);
        }

        getGamesLibrary(){
            return new GamesLibrary();
        }

    }

    class Formations {
        constructor() {
            this._formations = [];
        }

        sync() {
            return Server.getAllFormations().then(data => {
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

        createFormation(label) {
            let newFormation = new Formation({label: label});
            this._formations.push(newFormation);
            let result = newFormation.saveNewFormation();
            return result;
        }

        loadFormation(formation) {
            let tmpLevelsTab = formation.levelsTab;
            formation.levelsTab = [];
            tmpLevelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    game.tabQuestions && gamesTab.push(new Quiz(game, false, formation));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                formation.levelsTab.push(new Level(gamesTab, formation.levelsTab.length));
            });
        }
    }

    class Formation {
        constructor(formation) {
            this.links = [];
            this._id = (formation._id || null);
            this.formationId = (formation.formationId || null);
            this.gamesCounter = formation.gamesCounter ? formation.gamesCounter : {quizz:0};
            this.progress = formation.progress;
            if (formation.imageSrc) {
                this.imageSrc = formation.imageSrc;
            }
            this.labelDefault = "Entrer le nom de la formation";
            // HEIGHT
            this.levelsTab = formation.levelsTab || [];
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
                        return {status: true, formation: this}
                    } else {
                        if (answer.reason === "NameAlreadyUsed") {
                            return {status: false, error: 'Nom déjà utilisé'}
                        }
                    }
                });
        }

        addNewFormation(object) {
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

        getId() {
            if (this._id) {
                return this._id;
            }
            else {
                return null;
            }
        }

        setLabel(label) {
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
                        return {message: messageSave, status:true};
                    } else {
                        switch (answer.reason) {
                            case "NoModif" :
                                return {message: messageNoModification, status: false};
                                break;
                            case "NameAlreadyUsed" :
                                return {message : messageUsedName, status: false};
                                break;
                        }
                    }
                })
        };

        moveGame(game,level,column){
            let newGame = false;
            if (game.index == undefined){
                game = this.addNewGame(game, level, column);
                newGame = true;
            }
            let lastLevel = game.levelIndex;
            !newGame && this.levelsTab[lastLevel].gamesTab.forEach(g => {
                if (g.index > game.index){
                    g.index--;
                }
            });
            !newGame && this.levelsTab[lastLevel].gamesTab.splice(game.index, 1);
            game.index = column-1 > this.levelsTab[level].gamesTab.length ? this.levelsTab[level].gamesTab.length :
                column-1 ;
            this.levelsTab[level].gamesTab.forEach(g => {
                if (g.index >= game.index){
                    g.index++;
                }
            })
            this.levelsTab[level].gamesTab.splice(column-1, 0, game);
            game.levelIndex = level;
            if(this.levelsTab[lastLevel].gamesTab.length == 0 && !newGame){
                this.levelsTab.forEach(l => {
                    if(l.index > lastLevel){
                        l.index --;
                        l.gamesTab.forEach(g=>{
                            g.levelIndex--;
                        })
                    }
                })
                this.levelsTab.splice(lastLevel, 1);
            }
        }

        addNewGame(game, level, column){
            let newGame = game.game.create(this.gamesCounter, level, column);
            switch(game.game.type){
                case'Quiz':
                    this.gamesCounter.quizz ++;
                    break;
            }
            return newGame
        }

        addLevel(level){
            this.levelsTab.push(new Level([], level));
        }
    }

    class Level{
        constructor(gamesTab, index){
            this.gamesTab = gamesTab;
            this.index = index;
        }
    }

    class User {
        constructor(user) {
            this.lastName = user.lastName;
            this.firstName = user.firstName;
            this.lastAction = new LastAction(user.lastAction);
            this.admin = (user.admin) ? user.admin : false;
        }

        hasLastAction() {
            return this.lastAction.hasLastAction();
        }

        getLastActionQuestionsAnswered() {
            return this.lastAction.getQuestionsAnswered();
        }

        getLastActionFormationId() {
            return this.lastAction.getFormationId();
        }

        getLastActionFormationVersion() {
            return this.lastAction.getFormationVersion();
        }

        getLastActionCurrentIndexQuestion() {
            return this.lastAction.getCurrentIndexQuestion();
        }

        getLastActionTypeOfGame() {
            return this.lastAction.getTypeOfGame();
        }

    }


    class LastAction {
        constructor(lastAction = {}) {
            this.indexQuestion = lastAction.indexQuestion;
            this.questionsAnswered = lastAction.questionsAnswered;
            this.game = lastAction.game;
            this.version = lastAction.version;
            this.formation = lastAction.formation;
        }

        hasLastAction() {
            var hasLasAction = false;
            if (this.formation) {
                hasLasAction = true;
            }
            return hasLasAction;
        }

        getQuestionsAnswered() {
            return this.questionsAnswered;
        }

        getFormationId() {
            return this.formation;
        }

        getFormationVersion() {
            return this.version;
        }

        getCurrentIndexQuestion() {
            return this.indexQuestion;
        }

        getTypeOfGame() {
            return this.game;
        }
    }

    class Game{
        constructor(game){

        }

    }

    class Quiz {
        constructor(game){
            this.label = game.title;
            this.index = game.gameIndex;
            this.id = game.id;
            this.levelIndex = game.levelIndex;
        }
    }

    class GamesLibrary{
        constructor(){
            this.list = [
                {
                    type: 'Quiz',
                    create: function (counter, level, column) {
                        var newQuiz = new Quiz({
                            title: 'Quiz ' + (counter ? counter.quizz : 0),
                            gameIndex: column ,
                            id: 'quizz'+(counter ? counter.quizz : 0),
                            levelIndex : level
                        });
                        return newQuiz;
                    }
                }
            ]
        }
    }

    class Question {

    }

    return {
        State,
        Formations,
        User
    }
}



