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
            this._putStackPageToFrozen();
            let presenterName = this.stackPage.pop();
            switch(presenterName){
                case "DashboardAdminP":
                    this.loadPresenterDashboard(this.user); break;
                case "DashboardCollabP":
                    this.loadPresenterDashboard(this.user); break;
                case "ConnectionP":
                    this.loadPresenterConnection(); break;
                case'FormationCollabP':
                    this.loadPresenterFormationCollab(this.formation, this.user);break;
                case'FormationAdminP':
                    this.loadPresenterFormationAdmin(this.formation); break;
                default: break;
            }
            this._unFrozenStackPage();
        }

        _addPageToStack() {
            if(!this._isStackPageIsFrozen()){
                this.currentPresenter && this.stackPage.push(this.currentPresenter.__proto__.constructor.name);
            }
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
                    this.currentPresenter = new globalVariables.DashboardCollabP(this, this.user, this.formations);
                }
                this.currentPresenter.displayView();
            })
        }

        loadPresenterFormationAdmin(formation){
            this._addPageToStack();

            this.formation = formation;

            this._loadFormation(formation);
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.FormationAdminP(this, formation);
            this.currentPresenter.displayView();
        }


        loadPresenterFormationCollab (formation,user){
            this._addPageToStack();

            this.formation = formation;
            this._loadFormation(formation);
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.FormationCollabP(this,formation,user);
            this.currentPresenter.displayView();
        }


        loadPresenterGameCollab(game){
           this.game = game;
            this._addPageToStack();

            this.currentPresenter && this.currentPresenter.flushView();
            switch(game.type){
                case'Quiz':
                    this.currentPresenter = new globalVariables.QuizCollabP(this, game);
            }
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

        loadPresenterGameAdmin(game){
            this._addPageToStack();

            this.game = game;

            this.currentPresenter && this.currentPresenter.flushView();
            switch(game.type){
                case'Quiz':
                    this.currentPresenter = new globalVariables.QuizAdminP(this,game);
            }
            this.currentPresenter.displayView();
        }

        _loadFormation(formation){
            this.formations.loadFormation(formation);
        }

        getGamesLibrary(){
            return new GamesLibrary();
        }

        getMediasLibrary(){
            return new MediasLibrary();
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
                level._gamesTab.forEach(game => {
                    gamesTab.push(new Quiz(game, false, formation));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                formation.levelsTab.push(new Level(gamesTab, formation.levelsTab.length));
            });
        }
    }

    class Formation {
        constructor(formation) {
            this.links = formation.links || [];
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
            return util.Server.replaceFormation(this._id, object, ignoredData)
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
            !newGame && this.levelsTab[lastLevel].getGamesTab().forEach(g => {
                if (g.index > game.index){
                    g.index--;
                }
            });
            !newGame && this.levelsTab[lastLevel].getGamesTab().splice(game.index, 1);
            game.index = column-1 > this.levelsTab[level].getGamesTab().length ? this.levelsTab[level].getGamesTab().length :
                column-1 ;
            this.levelsTab[level].getGamesTab().forEach(g => {
                if (g.index >= game.index){
                    g.index++;
                }
            })
            this.levelsTab[level].getGamesTab().splice(column-1, 0, game);
            game.levelIndex = level;
            if(this.levelsTab[lastLevel].getGamesTab().length == 0 && !newGame){
                this.levelsTab.forEach(l => {
                    if(l.index > lastLevel){
                        l.index --;
                        l.getGamesTab().forEach(g=>{
                            g.levelIndex--;
                        })
                    }
                })
                this.levelsTab.splice(lastLevel, 1);
            }
            this.updateLinks();
        }

        isGameInFormation(game){
            let result = false;
            this.levelsTab.forEach(level=>{
                if(level.getGamesTab().some(g=> g===game)){
                    result = true;
                }
            });
            return result;
        }

        updateLinks(){
            let validLink = (link)=>{
                if(!this.isGameInFormation(link.childGame) || !this.isGameInFormation(link.parentGame)){
                    return false;
                }
                if(link.parentGame.levelIndex>=link.childGame.levelIndex){
                    return false;
                }
                return true;
            }
            this.links = this.links.filter(validLink);
        }

        removeGame(game){
            this.levelsTab[game.levelIndex].getGamesTab().forEach(g => {
                if (g.index > game.index){
                    g.index--;
                }
            });
            this.levelsTab[game.levelIndex].getGamesTab().splice(game.index, 1);
            if(this.levelsTab[game.levelIndex].getGamesTab().length == 0){
                this.levelsTab.forEach(l => {
                    if(l.index > game.levelIndex){
                        l.index --;
                        l.getGamesTab().forEach(g=>{
                            g.levelIndex--;
                        })
                    }
                })
                this.levelsTab.splice(game.levelIndex, 1);
            }
            this.updateLinks();
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
        removeLevel(level){
            this.levelsTab.forEach(l => {
                if(l.index > level.index){
                    l.index --;
                    l.getGamesTab().forEach(g=>{
                        g.levelIndex--;
                    })
                }
            })
            this.levelsTab.splice(level.index, 1);
            this.updateLinks();
        }

        updateGamesCounter(game){
            let inc =1;
            switch(game.type){
                case'Quiz':
                    this.gamesCounter.quizz += inc;
                    break;
            }
        }

        checkLink(parent,child){
            if(parent.levelIndex >= child.levelIndex){
                return false;
            }
            if(this.links.some(link=>{link.parentGame === parent && link.childGame === child})){
                return false;
            }
            return true;
        }

        getLinks(){
            return this.links;
        }

        createLink(parent,child){
            this.links.push({parentGame: parent, childGame: child});
        }

        checkAllGameValidity(){
            // this.formation.levelsTab.forEach(level => {
            //     level.gamesTab.forEach(game => {
            //         game.questions.forEach(question => {
            //             if (!(classContainer.isInstanceOf("AddEmptyElementVue", question))) {
            //                 question.questionType && question.questionType.validationTab.forEach(funcEl => {
            //                     var result = funcEl && funcEl(question);
            //                     if (result && (!result.isValid)) {
            //                         message.push("Un ou plusieurs jeu(x) ne sont pas complet(s)");
            //                         arrayOfUncorrectQuestions.push(question.questionNum - 1);
            //                     }
            //                     result && (checkQuiz.isValid = checkQuiz.isValid && result.isValid);
            //                 });
            //             }
            //             allQuizValid = allQuizValid && checkQuiz.isValid;
            //         });
            //         checkQuiz.isValid
            //         || game.miniatureManipulator.ordonator.children[0].color(myColors.white, 3, myColors.red);
            //     });
            // });
            return true;
        }
        loadFormationFromUser(formation, user) {
            let tmpLevelsTab = formation.levelsTab;
            this.levelsTab = [];
            tmpLevelsTab.forEach(level => {
                var gamesTab = [];
                level._gamesTab.forEach(game => {
                    gamesTab.push(new Quiz(game, user));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                this.levelsTab.push(new Level(gamesTab, this.levelsTab.length));
            });
        }

        getGameById(id){
            let result = null;
            this.levelsTab.forEach(level=>{
                level.getGamesTab().forEach(game=>{
                    if (game.id == id){
                        result = game;
                    }
                });
            });
            return result;
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

        getFormationWithProgress (id) {
            return util.Server.getFormationsProgress(id).then(data=>{
                data = JSON.parse(data);
                return data;
            });
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
        constructor(quiz) {
            this.label = quiz.label;
            this.index = quiz.index;
            this.id = quiz.id;
            this.levelIndex = quiz.levelIndex;
            this.type = 'Quiz';
            this.questions = quiz.questions || [];
            this.answered = quiz.answered || [];
            this.lastQuestionIndex = quiz.lastQuestionIndex || this.questions.length;
        }

        validateQuestion(questionIndex, answers){
            let question = this.questions[questionIndex],
                indexes = [];
            if(question){
                answers.forEach((answerIndex)=>{
                    let answer = question.answers[answerIndex];
                    if(answer){
                        indexes.push(answerIndex);
                    }
                })
            }
            this.answered[questionIndex] = indexes;
        }

        getLabel(){
            return this.label;
        }
        getLastQuestionIndex(){
            return this.lastQuestionIndex;
        }
        getQuestionLabel(index){
            return this.questions[index] ? this.questions[index].label : "";
        }
        getAnswers(questionIndex){
            return this.questions[questionIndex] ? this.questions[questionIndex].answers : [];
        }
        isCorrect(questionIndex, answers){
            let question = this.questions[questionIndex],
                correct = true,
                nbCorrectAnswers = 0;
            if(question){
                answers.forEach((answerIndex)=>{
                    let answer = question.answers[answerIndex];
                    if(answer){
                        correct = answer.correct && correct;
                        if(answer.correct) nbCorrectAnswers++;
                    }
                })
                return correct && this.getNbAnswersCorrect(questionIndex) === nbCorrectAnswers;
            }
            return false;
        }
        getWrongQuestions(){
            let wrongQuestions = [];
            this.answered.forEach((answered, index) => {
                if(!this.isCorrect(index, answered)){
                    wrongQuestions.push({
                        index,
                        label: this.getQuestionLabel(index)
                    });
                }
            });
            return wrongQuestions;
        }
        isMultipleChoice(questionIndex){
            return this.questions[questionIndex] ? !!this.questions[questionIndex].multipleChoice : false;
        }
        getNbQuestions(){
            return this.questions.length;
        }
        getNbQuestionsCorrect(){
            return this.answered.reduce((nb, answered, questionIndex)=> this.isCorrect(questionIndex, answered) ? nb+1 : nb, 0);
        }
        getNbAnswersCorrect(questionsIndex){
            return this.questions[questionsIndex].answers.reduce((nb, answer)=>answer.correct ? nb+1 : nb, 0);
        }
        getQuestionAnswered(questionIndex){
            return this.answered[questionIndex];
        }
        getCorrectAnswersIndex(questionIndex){
            let correctAnswers = [];
            this.getAnswers(questionIndex).forEach((answer, index)=>{
                if(answer.correct){
                    correctAnswers.push(index);
                }
            })
            return correctAnswers;
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
                            label: 'Quiz ' + (counter ? counter.quizz : 0),
                            index: column ,
                            id: 'quizz'+(counter ? counter.quizz : 0),
                            levelIndex : level
                        });
                        return newQuiz;
                    }
                }
            ]
        }
    }

    class MediasLibrary{
        constructor(){

        }

        uppload(file, onProgress){
            return Server.upload(file, onProgress);
        }

        getImages(){
            return Server.getImages().then(data=>JSON.parse(data));
        }

        deleteImage(_id){
            return Server.deleteImage(_id).then(()=>{
                let imageIndex = this.images.findIndex((image)=>image._id === _id);
                if(imageIndex !== -1) this.images.splice(imageIndex, 1);
            });
        }

        getVideos() {
            return Server.getVideos().then((videos)=>{
                this.videos = videos;
                return videos;
            });
        }

        deleteVideo(_id) {
            return Server.deleteVideo(_id).then(()=>{
                let videoIndex = this.videos.findIndex((video)=>video._id === _id);
                if(videoIndex !== -1) this.videos.splice(videoIndex, 1);
            });
        }
    }

    return {
        State,
        Formations,
        User,
        Quiz //TODO à retirer après les tests
    }
}
