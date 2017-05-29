exports.Models = function (globalVariables, mockResponses) {
    const drawing = globalVariables.drawing,
        APIRequester = require('./APIRequester').APIRequester;

    var apiRequester = new APIRequester(mockResponses);

    class State {
        constructor() {
            this.stackPage = [];
            this.formations = new Formations();
            this.currentPresenter = null;
        }

        createFormation(obj){
            if(typeof obj == 'string') obj = JSON.parse(obj);
            let formation = new Formation(obj);
            formation.loadFormation(obj);
            return formation;
        }

        createQuiz(obj){
            if(typeof obj == 'string') obj = JSON.parse(obj);
            let quiz = new Quiz(obj);
            return quiz;
        }

        uploadImage(file, progressDisplay) {
            return MediasLibrary.upload(file, progressDisplay);
        }

        returnToOldPage() {
            this._putStackPageToFrozen();
            let presenterName = this.stackPage.pop();
            switch (presenterName) {
                case "DashboardAdminP":
                    this.loadPresenterDashboard(this.user);
                    break;
                case "DashboardCollabP":
                    this.loadPresenterDashboard(this.user);
                    break;
                case "ConnectionP":
                    this.loadPresenterConnection();
                    break;
                case'FormationCollabP':
                    this.loadPresenterFormationCollab(this.formation, this.user);
                    break;
                case'FormationAdminP':
                    this.loadPresenterFormationAdmin(this.formation);
                    break;
                default:
                    break;
            }
            this._unFrozenStackPage();
        }

        _addPageToStack() {
            if (!this._isStackPageIsFrozen()) {
                this.currentPresenter && this.stackPage.push(this.currentPresenter.__proto__.constructor.name);
            }
        }

        _isStackPageIsFrozen() {
            return this.stackStateFrozen;
        }

        _putStackPageToFrozen() {
            this.stackStateFrozen = true;
        }

        _unFrozenStackPage() {
            this.stackStateFrozen = false;
        }

        clearOldPageStackAndLoadPresenterConnection() {
            this.stackPage = [];
            this.currentPresenter = null;
            this.loadPresenterConnection();
        }

        tryLoadCookieForPresenter(ID) {
            apiRequester.checkCookie().then(data => {
                data = data && JSON.parse(data);
                if (ID) {
                    password.display(ID);
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


        tryConnectForPresenterDashboard(login, pwd, stayConnected) {
            return apiRequester.connect(login, pwd, stayConnected).then(data => {
                if (!data) throw 'Connexion refusée';
                data = JSON.parse(data);
                if (data.ack === 'OK') {
                    this.loadPresenterDashboard(data.user);
                } else {
                    throw 'adresse e-mail ou mot de passe invalide';
                }
            });
        }

        registerNewUser(userInfos){
            return apiRequester.inscription(userInfos);
        }

        loadPresenterDashboard(user) {
            this._addPageToStack();

            if(!this.user) this.user = new User(user);
            drawing.username = `${user.firstName} ${user.lastName}`;
            user.admin ? globalVariables.admin = true : globalVariables.admin = false;
            this.formations.sync().then(() => {
                this.currentPresenter && this.currentPresenter.flushView();
                if (globalVariables.admin) {
                    this.currentPresenter = new globalVariables.dashboardAdminP(this, this.formations);
                } else {
                    this.currentPresenter = new globalVariables.DashboardCollabP(this, this.user, this.formations);
                }
                if (this.user.hasLastAction()) {
                    this.loadLastAction();
                } else {
                    this.currentPresenter.displayView();
                }
            }).catch((err)=>console.log(err));
        }

        loadPresenterFormationAdmin(formation) {
            this._addPageToStack();

            this.formation = formation;

            this._loadFormation(formation);
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.FormationAdminP(this, formation);
            this.currentPresenter.displayView();
        }


        loadPresenterFormationCollab(formation, user) {
            this._addPageToStack();

            this.formation = formation;
            this._loadFormation(formation);
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.FormationCollabP(this, formation, user);
            this.currentPresenter.displayView();
        }


        loadPresenterGameCollab(game) {
            this.game = game;
            this._addPageToStack();

            this.currentPresenter && this.currentPresenter.flushView();
            switch (game.type) {
                case'Quiz':
                    this.currentPresenter = new globalVariables.QuizCollabP(this, game);
            }
            this.currentPresenter.displayView();
        }

        loadPresenterRegister() {
            this._addPageToStack();

            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.RegisterP(this);
            this.currentPresenter.displayView();
        }

        loadPresenterConnection() {
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.ConnectionP(this);
            this.currentPresenter.displayView();
        }

        loadPresenterGameAdmin(game) {
            this._addPageToStack();

            this.game = game;

            this.currentPresenter && this.currentPresenter.flushView();
            switch (game.type) {
                case'Quiz':
                    this.currentPresenter = new globalVariables.QuizAdminP(this, game);
                    break;
                case'Poupee':
                    this.currentPresenter = new globalVariables.DollAdminP(this, game);
                    break;
            }
            this.currentPresenter.displayView();
        }

        loadLastAction() {
            let {versionId, gameId} = this.user.getLastActionInfosAndMarkLoaded();
            let formation = this.formations.getFormationByVersionId(versionId);
            if (formation) {
                let game = formation.getGameById(gameId);
                this.loadPresenterFormationCollab(formation, this.user);
                if (game) {
                    this.loadPresenterGameCollab(game);
                }
            }
        }

        _loadFormation(formation) {
            this.formations.loadFormation(formation);
        }

        saveProgress() {
            let formationId = this.getFormationId();
            let versionId = this.getVersionId()
            let gameToSave = this.getToSave();
            return apiRequester.saveProgress(Object.assign({formationId, versionId}, gameToSave));
        }

        getToSave() {
            return this.game.getToSave();
        }

        getVersionId() {
            return this.formation.getId();
        }
        getFormationLabel() {
            return this.formation.getFormationLabel();
        }

        getFormationId() {
            return this.formation.getFormationId();
        }

        getGamesLibrary() {
            return new GamesLibrary();
        }

        getMediasLibrary() {
            return new MediasLibrary();
        }

    }

    class Formations {
        constructor() {
            this._formations = [];
        }

        sync() {
            return apiRequester.getAllFormations().then(data => {
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

        getFormationByVersionId(id) {
            return this._formations.find((form) => form.getId() === id);
        }
        getFormationById(id){
            return this._formations.find(form => form.getFormationId() === id);
        }

        updateSingleFormationStars(formationId, starId, versionID){
            this.getFormationById(formationId).updateStars(starId);
        }

        createFormation(label) {
            let newFormation = new Formation({label: label});
            this._formations.push(newFormation);
            let result = newFormation.saveNewFormation();
            return result;
        }

        loadAllFormations() {
            this._formations.forEach(form => {
                this.loadFormation(form);
                form.progress = form.getFormationProgress();
            });
        }

        loadFormation(formation) {
            let tmpLevelsTab = formation.levelsTab;
            formation.levelsTab = [];
            tmpLevelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    switch(game.type){
                        case'Quiz':
                            gamesTab.push(new Quiz(game, false, formation));
                            break;
                        case'Poupee':
                            gamesTab.push(new Doll(game));
                            break;
                    }

                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                formation.levelsTab.push(new Level(gamesTab, formation.levelsTab.length));
            });
        }
    }

    class Formation {
        constructor(formation) {
            this.links = formation.links || [];
            this._id = (formation._id || null); //TODO changer en versionId
            this.formationId = (formation.formationId || null);
            this.gamesCounter = {};
            this.gamesCounter.quizz = formation.gamesCounter ? formation.gamesCounter.quizz : 0;
            this.gamesCounter.doll = formation.gamesCounter ? formation.gamesCounter.doll : 0;
            this.progress = formation.progress;
            if (formation.imageSrc) {
                this.imageSrc = formation.imageSrc;
            }
            this.labelDefault = "Entrer le nom de la formation";
            // HEIGHT
            this.levelsTab = formation.levelsTab || [];
            this.label = formation.label ? formation.label : "";
            this.status = formation.progress ? formation.progress.status : (formation.status ? formation.status : 'NotPublished');
            this.note = formation.note || 0;
            this.noteCounter = formation.noteCounter || 0;
        }

        getLevelsTab() {
            return this.levelsTab;
        }

        setImage(src){
            this.imageSrc = src;
        }

        updateStars(starId){
            apiRequester.updateSingleFormationStars(this.getFormationId(), starId, this.getId());
        }


        saveNewFormation() {
            const getObjectToSave = () => {
                if (this.imageSrc) {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab,
                        imageSrc: this.imageSrc,
                        status: this.status
                    }
                }
                else {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab,
                        status: this.status
                    };
                }
            };

            return apiRequester.insertFormation(getObjectToSave(), ignoredData)
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


        addNewFormation() {
            const getObjectToSave = () => {
                if (this.imageSrc) {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab,
                        imageSrc: this.imageSrc,
                        status: this.status
                    }
                }
                else {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab,
                        status: this.status
                    };
                }
            };

            const
                messageSave = "Votre travail a bien été enregistré.",
                messageError = "Vous devez remplir correctement le nom de la formation.",
                messageReplace = "Les modifications ont bien été enregistrées.",
                messageUsedName = "Le nom de cette formation est déjà utilisé !",
                messageNoModification = "Les modifications ont déjà été enregistrées.";
            return apiRequester.insertFormation(object, status, ignoredData)
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

        loadFormation(formation) {
            let tmpLevelsTab = this.levelsTab;
            this.levelsTab = [];
            tmpLevelsTab.forEach(level => {
                var gamesTab = [];
                level.gamesTab.forEach(game => {
                    gamesTab.push(new Quiz(game, false, this));
                    gamesTab[gamesTab.length - 1].id = game.id;
                });
                this.levelsTab.push(new Level(gamesTab, this.levelsTab.length));
            });
        }

        getFormationLabel() {
            return this.label;
        }

        getFormationId() {
            return this.formationId;
        }

        getId() {
            return this._id;
        }

        getFormationId() {
            return this.formationId;
        }

        setLabel(label) {
            this.label = label;
        }

        replaceFormation(obj) {
            const getObjectToSave = () => {
                if (obj && obj.imageOnly) {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab,
                        imageSrc: this.imageSrc,
                        status: this.status,
                        imageOnly : true
                    }
                }
                else if (this.imageSrc) {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab,
                        imageSrc: this.imageSrc,
                        status: this.status
                    }
                }
                else {
                    return {
                        label: this.label,
                        gamesCounter: this.gamesCounter,
                        links: this.links,
                        levelsTab: this.levelsTab,
                        status: this.status
                    };
                }
            };
            const
                messageSave = "Votre travail a bien été enregistré.",
                messageReplace = "Les modifications ont bien été enregistrées.",
                messageUsedName = "Le nom de cette formation est déjà utilisé !",
                messageNoModification = "Les modifications ont déjà été enregistrées.";
            return apiRequester.replaceFormation(this._id, getObjectToSave(), ignoredData)
                .then((data) => {
                    let answer = JSON.parse(data);
                    if (answer.saved) {
                        return {message: messageSave, status: true};
                    } else {
                        switch (answer.reason) {
                            case "NoModif" :
                                return {message: messageNoModification, status: false};
                                break;
                            case "NameAlreadyUsed" :
                                return {message: messageUsedName, status: false};
                                break;
                        }
                    }
                })
        };

        moveGame(game, level, column) {
            let newGame = false;
            if (game.gameIndex == undefined) {
                game = this.addNewGame(game, level, column);
                newGame = true;
            }
            let lastLevel = game.levelIndex;
            !newGame && this.levelsTab[lastLevel].getGamesTab().forEach(g => {
                if (g.index > game.gameIndex) {
                    g.index--;
                }
            });
            !newGame && this.levelsTab[lastLevel].getGamesTab().splice(game.gameIndex, 1);
            game.gameIndex = column - 1 > this.levelsTab[level].getGamesTab().length ? this.levelsTab[level].getGamesTab().length :
                column - 1;
            this.levelsTab[level].getGamesTab().forEach(g => {
                if (g.index >= game.gameIndex) {
                    g.index++;
                }
            })
            this.levelsTab[level].getGamesTab().splice(column - 1, 0, game);
            game.levelIndex = level;
            if (this.levelsTab[lastLevel].getGamesTab().length == 0 && !newGame) {
                this.levelsTab.forEach(l => {
                    if (l.index > lastLevel) {
                        l.index--;
                        l.getGamesTab().forEach(g => {
                            g.levelIndex--;
                        })
                    }
                })
                this.levelsTab.splice(lastLevel, 1);
            }
            this.updateLinks();
        }

        isGameInFormation(game) {
            let result = false;
            this.levelsTab.forEach(level => {
                if (level.getGamesTab().some(g => g === game)) {
                    result = true;
                }
            });
            return result;
        }

        updateLinks() {
            let validLink = (link) => {
                if (!this.isGameInFormation(link.childGame) || !this.isGameInFormation(link.parentGame)) {
                    return false;
                }
                if (link.parentGame.levelIndex >= link.childGame.levelIndex) {
                    return false;
                }
                return true;
            }
            this.links = this.links.filter(validLink);
        }

        removeGame(game) {
            this.levelsTab[game.levelIndex].getGamesTab().forEach(g => {
                if (g.index > game.gameIndex) {
                    g.index--;
                }
            });
            this.levelsTab[game.levelIndex].getGamesTab().splice(game.gameIndex, 1);
            if (this.levelsTab[game.levelIndex].getGamesTab().length == 0) {
                this.levelsTab.forEach(l => {
                    if (l.index > game.levelIndex) {
                        l.index--;
                        l.getGamesTab().forEach(g => {
                            g.levelIndex--;
                        })
                    }
                })
                this.levelsTab.splice(game.levelIndex, 1);
            }
            this.updateLinks();
        }

        addNewGame(game, level, column) {
            let newGame = game.game.create(this.gamesCounter, level, column);
            switch (game.game.type) {
                case'Quiz':
                    this.gamesCounter.quizz++;
                    break;
                case'Poupee':
                    this.gamesCounter.doll++;
                    break;
            }
            return newGame
        }

        addLevel(level) {
            this.levelsTab.push(new Level([], level));
        }

        removeLevel(level) {
            this.levelsTab.forEach(l => {
                if (l.index > level.index) {
                    l.index--;
                    l.getGamesTab().forEach(g => {
                        g.levelIndex--;
                    })
                }
            })
            this.levelsTab.splice(level.index, 1);
            this.updateLinks();
        }

        updateGamesCounter(game) {
            let inc = 1;
            switch (game.type) {
                case'Quiz':
                    this.gamesCounter.quizz += inc;
                    break;
            }
        }

        checkLink(parent, child) {
            if (parent.levelIndex >= child.levelIndex) {
                return false;
            }
            if (this.links.some(link => {
                    link.parentGame === parent && link.childGame === child
                })) {
                return false;
            }
            return true;
        }

        getLinks() {
            return this.links;
        }

        createLink(parent, child) {
            this.links.push({parentGame: parent, childGame: child});
        }

        checkAllGameValidity() {
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

        getGameById(id) {
            let result = null;
            this.levelsTab.forEach(level => {
                level.getGamesTab().forEach(game => {
                    if (game.id == id) {
                        result = game;
                    }
                });
            });
            return result;
        }

        getFormationProgress() {
            let result = [];
            this.levelsTab.forEach(level => {
                level.getGamesTab().forEach(game => {
                    result.push(game.getProgress());
                });
            });
            if (result.some(res => res == 'inProgress') || (result.some(res => res == 'done') && result.some(res => res == 'undone'))) {
                return 'inProgress';
            }
            else if (result.every(res => res == 'done')) {
                return 'done';
            }
            else if (result.every(res => res == 'undone')) {
                return 'undone';
            }
        }
    }

    class Level {
        constructor(gamesTab, index) {
            this.gamesTab = gamesTab;
            this.index = index;
        }

        getGamesTab() {
            return this.gamesTab;
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

        getLastActionInfosAndMarkLoaded() {
            return this.lastAction.getLastActionInfosAndMarkLoaded();
        }
    }

    class LastAction {
        constructor(lastAction = {}) {
            this.gameId = lastAction.gameId;
            this.versionId = lastAction.versionId;
            this.formationId = lastAction.formationId;
            this.done = lastAction.done;
            this.alreadyLoaded = false;
        }

        hasLastAction() {
            return this.formationId && !this.done && !this.alreadyLoaded;
        }

        getLastActionInfosAndMarkLoaded() {
            this.alreadyLoaded = true;
            return {versionId: this.versionId, gameId: this.gameId};
        }
    }

    class Game {
        constructor(level) {
            this.levelGame = level;
        }

    }

    class Quiz {
        constructor(quiz) {
            this.id = quiz.id;
            this.gameIndex = quiz.gameIndex;
            this.levelIndex = quiz.levelIndex;
            this.label = quiz.label;
            this.labelDefault = "Titre du quiz";
            this.type = 'Quiz';
            this.questions = quiz.questions || [];
            this.answered = quiz.answered || [];
            this.lastQuestionIndex = quiz.lastQuestionIndex || this.questions.length;
            this.imageSrc = quiz.imageSrc || null;
        }

        setImage(src){
            this.imageSrc = src;
        }

        isDone() {
            return this.answered.length === this.questions.length;
        }

        validateQuestion(questionIndex, answers) {
            let question = this.questions[questionIndex],
                indexes = [];
            if (question) {
                answers.forEach((answerIndex) => {
                    let answer = question.answers[answerIndex];
                    if (answer) {
                        indexes.push(answerIndex);
                    }
                })
            }
            this.answered[questionIndex] = indexes;
        }

        getToSave() {
            return {gameId: this.getId(), answered: this.getAnswered(), done: this.isDone()};
        }

        getProgress() {
            if (this.answered.length == this.questions.length) {
                return 'done';
            }
            else if (this.answered.length > 0 && this.answered.length < this.questions.length) {
                return 'inProgress';
            }
            else if (this.answered.length == 0) {
                return 'undone';
            }
        }

        getLabel() {
            return this.label;
        }

        getId() {
            return this.id;
        }

        getAnswered() {
            return this.answered;
        }

        getQuestionLabel(index) {
            return this.questions[index] ? this.questions[index].label : "";
        }

        getAnswers(questionIndex) {
            return this.questions[questionIndex] ? this.questions[questionIndex].answers : [];
        }

        isCorrect(questionIndex, answers) {
            let question = this.questions[questionIndex],
                correct = true,
                nbCorrectAnswers = 0;
            if (question) {
                answers.forEach((answerIndex) => {
                    let answer = question.answers[answerIndex];
                    if (answer) {
                        correct = answer.correct && correct;
                        // result.indexes.push(answerIndex);
                        // result.correct = answer.correct && result.correct;
                        if (answer.correct) nbCorrectAnswers++;
                    }
                })
                return correct && this.getNbAnswersCorrect(questionIndex) === nbCorrectAnswers;
            }
            return false;
        }

        getLastQuestionIndex(){
            return this.lastQuestionIndex;
        }
        getIndex() {
            return this.gameIndex;
        }

        getQuestionLabel(index) {
            return this.questions[index] ? this.questions[index].label : "";
        }

        getAnswers(questionIndex) {
            return this.questions[questionIndex] ? this.questions[questionIndex].answers : [];
        }
        getWrongQuestions() {
            let wrongQuestions = [];
            this.answered.forEach((answered, index) => {
                if (!this.isCorrect(index, answered)) {
                    wrongQuestions.push({
                        index,
                        label: this.getQuestionLabel(index)
                    });
                }
            });
            return wrongQuestions;
        }

        getLevelIndex() {
            return this.levelIndex;
        }

        isMultipleChoice(questionIndex) {
            return this.questions[questionIndex] ? !!this.questions[questionIndex].multipleChoice : false;
        }

        getQuestions() {
            return this.questions;
        }

        getNbQuestions() {
            return this.questions.length;
        }

        getNbQuestionsCorrect() {
            return this.answered.reduce((nb, answered, questionIndex) => this.isCorrect(questionIndex, answered) ? nb + 1 : nb, 0);
        }

        getNbAnswersCorrect(questionsIndex) {
            return this.questions[questionsIndex].answers.reduce((nb, answer) => answer.correct ? nb + 1 : nb, 0);
        }

        getAnswered() {
            return this.answered;
        }

        getCorrectAnswersIndex(questionIndex) {
            let correctAnswers = [];
            this.getAnswers(questionIndex).forEach((answer, index) => {
                if (answer.correct) {
                    correctAnswers.push(index);
                }
            })
            return correctAnswers;
        }

        renameQuiz(quiz) {
            return apiRequester.renameQuiz(quiz.formationId, quiz.levelIndex, quiz.gameIndex, quiz, ignoredData).then((data) => {
                let answer = JSON.parse(data);
                if (answer.saved == false) {
                    answer.message = "Il faut enregistrer le quiz avant !";
                    reject(answer);
                } else if (answer.saved == true) {
                    answer.message = "Le nom du quiz a été bien modifié";
                }
                return answer;
            }).catch(error => {
                return error;
            })
        }

        replaceQuiz(object) {
            const completeQuizMessage = "Les modifications ont bien été enregistrées",
                incompleteQuizMessage = "Les modifications ont bien été enregistrées, mais ce jeu n'est pas encore valide",
                errorQuizMessage = "Erreur";
            return apiRequester.replaceQuiz(object, object.formationId, object.levelIndex, object.gameIndex, ignoredData)
                .then((data) => {
                    let answer = JSON.parse(data);
                    if (answer.saved) {
                        return {message: completeQuizMessage, status: true};
                    } else {
                        return {message: incompleteQuizMessage, status: false};
                    }
                }).catch(error => {
                    return {message : errorQuizMessage, status: false};
                });
        };

        setLabel(label) {
            this.label = label; // need base de données saving
        }

        setQuestions(questions) {
            this.questions = questions; // need base de données saving
        }
    }

    class Doll {
        constructor(game) {
            this.type = 'Poupee';
            this.label = game.label;
            this.index = game.gameIndex;
            this.id = game.id;
            this.levelIndex = game.levelIndex;
            this.imageSrc = game.imageSrc || null;
        }

        setImage(src){
            this.imageSrc = src;
        }

        getLabel(){
            return this.label;
        }
    }
    class Question {
        constructor(quiz) {
            this.parentQuiz = quiz;
            this.answers = [];
            this.label = "Question par déf";
            this.multipleChoice = false;
            // this.media = imgSrc;

            if (quiz.imageSrc) {
                this.imageSrc = quiz.imageSrc;
            }
        }
    }

    class Answer {
        constructor(question) {
            this.parentQuestion = question;
            this.label = "Réponse par déf";
            this.correct = false;
            this.explanation = {label: ""};
            // this.media = imgSrc;
        }
    }

    class GamesLibrary {
        constructor() {
            this.list = [
                {
                    type: 'Quiz',
                    create: function (counter, level, column) {
                        var newQuiz = new Quiz({
                            label: 'Quiz ' + (counter ? counter.quizz : 0),
                            gameIndex: column-1,
                            id: 'quizz' + (counter ? counter.quizz : 0),
                            levelIndex: level
                        });
                        return newQuiz;
                    }
                },
                {
                    type: 'Poupée',
                    create: function (counter, level, column) {
                        var newPoup = new Doll({
                            label: 'Poupée ' + (counter ? counter.doll : 0),
                            index: column,
                            id: 'doll' + (counter ? counter.doll : 0),
                            levelIndex: level
                        });
                        return newPoup;
                    }
                }
            ]
        }
    }

    class MediasLibrary {
        constructor() {

        }

        static upload(file, onProgress) {
            return apiRequester.upload(file, onProgress);
        }

        getImages() {
            return apiRequester.getImages().then(data => JSON.parse(data));
        }

        deleteImage(_id) {
            return apiRequester.deleteImage(_id).then(() => {
                let imageIndex = this.images.findIndex((image) => image._id === _id);
                if (imageIndex !== -1) this.images.splice(imageIndex, 1);
            });
        }

        getVideos() {
            return apiRequester.getVideos().then((videos) => {
                this.videos = videos;
                return videos;
            });
        }

        deleteVideo(_id) {
            return apiRequester.deleteVideo(_id).then(() => {
                let videoIndex = this.videos.findIndex((video) => video._id === _id);
                if (videoIndex !== -1) this.videos.splice(videoIndex, 1);
            });
        }
    }

    return {
        State,
        Formations,
        Formation,
        User,
        Quiz //TODO à retirer après les tests
    }
}
