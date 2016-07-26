/**
 * Created by qde3485 on 25/07/16.
 */

let ObjectID = require('mongodb').ObjectID;

const getUserByEmailAddress = (db, email) => {
    return new Promise((resolve, fail) => {
        let usersCollection = db.get().collection('users');
        usersCollection.find().toArray((err, docs) => {
            if(err) fail(err);
            let result = docs.find(user => user.mailAddress === email);
            resolve(result);
        })
    });
};

const inscription = (db, user) => {
    return new Promise((resolve, reject) => {
        let usersCollection = db.get().collection('users');
        usersCollection.insertOne(user, (err) => {
            if(err) reject(err);
            resolve(user);
        })
    })
};

const getUserById = (db, id) => {
    return new Promise((resolve, reject) => {
        let collection = db.get().collection('users');
        collection.find().toArray((err, docs) => {
            if (err) reject(err);
            let user = id;
            let result = docs.find(x=> x._id.toString() === user);
            resolve(result);
        })
    })
};

const saveProgress = (db, body, user) => {
    return new Promise((resolve, reject) => {
        let newGame = {
            game: body.game,
            tabWrongAnswers: body.tabWrongAnswers,
            index: body.indexQuestion,
        };
        let newFormation = {
            version: body.version,
            formation: body.formation,
            gamesTab : [newGame]
        };
        let formationsTab;
        if (user.formationsTab){
            let formation = user.formationsTab.findIndex(x => x.formation === body.version);
            if(formation !== -1 ){
                let game = user.formationsTab[formation].gamesTab.findIndex(x => x.game === body.game);
                if(game !== -1 ){
                    newGame.index > user.formationsTab[formation].gamesTab[game].index && (user.formationsTab[formation].gamesTab[game] = newGame);
                } else {
                    user.formationsTab[formation].gamesTab[user.formationsTab[formation].gamesTab.length] = newGame;
                }
            } else {
                user.formationsTab[user.formationsTab.length] = newFormation;
            }
            formationsTab = user.formationsTab;
        } else {
            formationsTab = [newFormation];
        }
        let usersCollection = db.get().collection('users');
        usersCollection.updateOne({"_id": user._id}, {$set: {formationsTab: formationsTab}}, (err, docs) => {
            if (err) reject(err);
            resolve({ack: 'ok'});
        });
    })
};

const getFormationsWithProgress = (userFormationsArray, formations) => {
    return new Promise((resolve, reject) => {
        let result = [];
        formations.forEach(formation => {
            const progressArray = userFormationsArray && userFormationsArray
                    .find(f => f.formation === formation.formationId.toString());
            let progress = '';
            let id = null;
            if(progressArray) {
                progress = function() {
                    let i = 0;
                    for (let x = 0; x < formation.levelsTab.length; x++) {
                        const gamesTab = formation.levelsTab[x].gamesTab;
                        for (let y = 0; y < gamesTab.length; y++) {
                            const game = gamesTab[y];
                            if (!progressArray.gamesTab[i] || !game.tabQuestions || progressArray.gamesTab[i].index < game.tabQuestions.length) {
                                id = progressArray.version;
                                return 'inProgress';
                            }
                            i++;
                        }
                    }
                    id = progressArray.version;
                    return 'done';
                }();
            }
            result.push({_id: id ? new ObjectID(id) : formation._id, formationId: formation.formationId, label: formation.label, status: formation.status, progress});
        });
        resolve({myCollection: result});
    })
};

exports.getUserByEmailAddress = getUserByEmailAddress;
exports.inscription = inscription;
exports.getUserById = getUserById;
exports.saveProgress = saveProgress;
exports.getFormationsWithProgress = getFormationsWithProgress;