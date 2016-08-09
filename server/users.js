/**
 * Created by qde3485 on 25/07/16.
 */

let formations = require("./formations");
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
            questionsAnswered: body.questionsAnswered,
            index: body.indexQuestion,
        };
        let newFormation = {
            version: body.version,
            formation: body.formation,
            gamesTab : [newGame]
        };
        let formationsTab;
        if (user.formationsTab){
            let formation = user.formationsTab.findIndex(x => x.version === body.version);
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

const getFormationsWithProgress = (userFormationsArray, versions, formations) => {
    return new Promise((resolve, reject) => {
        let result = [];
        versions.forEach(version => {
            const progressArray = userFormationsArray && userFormationsArray
                    .find(f => f.formation === version.formationId.toString());
            let progress = '';
            let id = null;
            if(progressArray) {
                // there is a correlation between the player's progress and a formation
                progress = function() {
                    for (let x = 0, i = 0; x < version.levelsTab.length; x++) {
                        const gamesTab = version.levelsTab[x].gamesTab;
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
                result.push({_id: id ? new ObjectID(id) : version._id, formationId: version.formationId, label: version.label, status: version.status, progress});
            } else {
                // check status for a published version
                if(version.status === "Published") {
                    result.push({_id: id ? new ObjectID(id) : version._id, formationId: version.formationId, label: version.label, status: version.status, progress});
                } else if(version.status && version.status !== "NotPublished") {
                    let myFormation = formations.find(formation => formation._id.toString() === version.formationId.toString());
                    if(myFormation.versions.length > 1) {
                        version = myFormation.versions[myFormation.versions.length-2];
                        if(version.status !== "NotPublished") result.push({_id: id ? new ObjectID(id) : version._id, formationId: version.formationId, label: version.label, status: version.status, progress});
                    }
                }
            }
        });
        resolve({myCollection: result});
    })
};

exports.getUserByEmailAddress = getUserByEmailAddress;
exports.inscription = inscription;
exports.getUserById = getUserById;
exports.saveProgress = saveProgress;
exports.getFormationsWithProgress = getFormationsWithProgress;