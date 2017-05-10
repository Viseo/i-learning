exports.Models = function (globalVariables) {
    const util = globalVariables.util,
        drawing = globalVariables.drawing,
        Server = util.Server;


    class State {
        constructor() {
            this.stackPage = [];
            this.formations = new Formations();
            this.currentPresenter = null;
            this.stackStateFrozen = false;
        }

        returnToOldPage() {
            this._putStackPageToFrozen();
            let presenterName = this.stackPage.pop();
            switch(presenterName){
                case "DashboardAdminP":
                    this.loadPresenterDashboard(this.user); break;
                case "ConnectionP":
                    this.loadPresenterConnection(); break;
                default: break;
            }
            this._unFrozenStackPage();
        }

        _isStackPageIsFrozen(){
            return this.stackStateFrozen;
        }

        _putStackPageToFrozen(){
            this.stackStateFrozen = true;
        }

        _unFrozenStackPage(){
            this.stackStateFrozen = false;
        }

        _addPageToStack() {
            if(!this._isStackPageIsFrozen()){
                this.currentPresenter && this.stackPage.push(this.currentPresenter.__proto__.constructor.name);
            }
        }

        clearOldPageStackAndLoadPresenterConnection(){
            var _cleanPresenter = () => {
                this.currentPresenter && this.currentPresenter.flushView();
                this.currentPresenter = null;
            }

            this.stackPage = [];
            _cleanPresenter();
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
                    this.currentPresenter = new globalVariables.DashboardCollabP(this, this.user, this.formations);
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

        loadPresenterQuizAdmin(quiz){
            this._addPageToStack();

            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.QuizAdminP(this, quiz);
            this.currentPresenter.displayView();
        }

        loadPresenterQuizCollab(){
            var testQuiz = new Quiz({
                id:"quiz1",
                label: "test quiz",
                questions: [
                    {label: "1re question", multipleChoice: true,
                        answers: [
                            {label: "oui", correct: true, explanation: {label: "parce que"}},
                            {label: "non"},
                            {label: "peut etre"},
                            {label: "test longueur"},
                            {label: "a la ligne"}
                        ]
                    },
                    {label: "2eme question", answers: [{label: "patate", correct:true}, {label: "yoho"}]},
                    {label: "3eme question", answers: [{label: "dfdsgf efzfdsf", correct:true}, {label: "dsdsdfgdsfds"}]}
                ]
            });
            let dashboardP = new globalVariables.QuizCollabP(null, testQuiz);

            dashboardP.displayView();
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

        getLevelsTab() {
            return this._levelsTab;
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
            this._gamesTab = gamesTab;
            this.index = index;
        }
        getGamesTab() {
            return this._gamesTab;
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
        constructor(level) {
            this.levelGame = level;
        }

    }

    class Quiz {
        constructor(quiz){
            this.id = quiz.id;
            this.label = quiz.label;
            this.questions = quiz.questions;
            this.answered = quiz.answered || [];
        }

        selectAnswer(questionIndex, answerIndex){
            let question = this.questions[questionIndex];
            if(question){
                let answer = question.answers[answerIndex];
                if(answer){
                    this.answered[questionIndex] = {index: answerIndex, correct: !!answer.correct};
                }
            }
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
        getWrongQuestions(){
            let wrongQuestions = [];
            this.answered.forEach((answered, index) => {
                if(!answered.correct){
                    wrongQuestions.push({
                        index,
                        label: this.getQuestionLabel(index)
                    });
                }
            });
            return wrongQuestions;
        }
        getNbQuestions(){
            return this.questions.length;
        }
        getNbCorrect(){
            return this.answered.reduce((nb, answered)=>answered.correct ? nb+1 : nb, 0);
        }
        getAnswered(questionIndex){
            return this.answered[questionIndex];
        }
        getCorrectAnswerIndex(questionIndex){
            return this.getAnswers(questionIndex).findIndex((answer)=>answer.correct);
        }
    }

    class Question{
        constructor(quiz) {
            this.parentQuiz = quiz;
            this.answers = [];
            this.label = "Question par déf";
            this.multipleChoice = false;
            // this.media = imgSrc;

        }
    }

    class Answer {
        constructor(question) {
            this.parentQuestion = question;
            this.label = "Réponse par déf";
            this.correct = false;
            this.explanation = {};
            // this.media = imgSrc;
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

    return {
        State,
        Formations,
        User,
        Quiz //TODO à retirer après les tests
    }
}



