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
            return this.stackPage.pop();
        }

        addPageToStack(presenter) {
            this.stackPage.push(presenter);
        }

        loadCookie(redirect) {
            util.Server.checkCookie().then(data => {
                data = data && JSON.parse(data);
                if (redirect) {
                    password.display(param.ID);
                    redirect = false;
                } else {
                    if (data.ack === 'OK') {
                        this.loadDashboard(data.user);
                    } else {
                        globalVariables.admin = false;
                        this.currentPresenter = new globalVariables.ConnectionP(this);
                        this.currentPresenter.displayView();
                    }
                }
            });
        }


        connectWith(login, pwd, stayConnected){
            return Server.connect(login, pwd, stayConnected).then(data => {
                if(!data) throw 'Connexion refusée';
                data = JSON.parse(data);
                if (data.ack === 'OK') {
                    this.loadDashboard(data.user);
                } else {
                    throw 'adresse e-mail ou mot de passe invalide';
                }
            });
        }

        loadDashboard(user){
            this.user = new User(user);
            drawing.username = `${user.firstName} ${user.lastName}`;
            user.admin ? globalVariables.admin = true : globalVariables.admin = false;
            this.formations.sync().then(() => {
                this.currentPresenter && this.currentPresenter.flushView();
                if (globalVariables.admin) {
                    this.currentPresenter = new globalVariables.dashboardAdminP(this.formations);
                } else {
                    this.currentPresenter = new globalVariables.DashboardCollabP(this.user, this.formations);
                }
                this.currentPresenter.displayView();
            })
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
                formation.levelsTab.push(new Level(formation, gamesTab, globalVariables.playerMode));
            });
        }
    }

    class Formation {
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
    }

    class Level {
        constructor(gamesTab) {
            this.gamesTab = gamesTab;
        }
    }

    class User {
        constructor(user) {
            this.lastName = user.lastName;
            this.firstName = user.firstName;
            this.lastAction = new LastAction(user.lastAction);
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

    class Game {


    }

    class Quiz {
        constructor(game) {
            this.label = game.label;
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



