/**
 * Created by qde3485 on 25/07/16.
 */

const
    ObjectID = require('mongodb').ObjectID;

const
    db = require('../db'),
    formations = require("./formations");
    cookies = require('../cookies');

const getUserByEmailAddress = (email) => {
    return new Promise((resolve, reject) => {
        let usersCollection = db.get().collection('users');
        usersCollection.find().toArray((err, docs) => {
            if(err){
                reject(err);
            }
            let result = docs.find(user => user.mailAddress === email);
            resolve(result);
        })
    });
};

const inscription = (user) => {
    return new Promise((resolve, reject) => {
        let usersCollection = db.get().collection('users');
        usersCollection.insertOne(user, (err) => {
            if(err) {
                reject(err);
            }
            resolve(user);
        })
    })
};

const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        let collection = db.get().collection('users');
        collection.find().toArray((err, docs) => {
            if (err) {
                reject(err);
            }
            let user = id;
            let result = docs.find(x=> x._id.toString() === user);
            resolve(result);
        })
    })
};

const saveProgress = (body, user) => {
    return new Promise((resolve, reject) => {
        let newGame = {
            game: body.game,
            questionsAnswered: body.questionsAnswered
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
                   user.formationsTab[formation].gamesTab[game] = newGame;
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
        usersCollection.updateOne({"_id": user._id}, {$set: {formationsTab: formationsTab}}, (err) => {
            if (err) {
                reject(err);
            }
            resolve({ack: 'ok'});
        });
    })
};

const saveLastAction = (body, user) => {
    return new Promise((resolve,reject) => {
       let usersCollection = db.get().collection('users');
       usersCollection.updateOne({'_id': user._id}, {$set: {lastAction: body}}, err =>{
           if(err){
               reject(err);
           }
           resolve({ack: 'ok'});
       })
    });
};

const noteFormation = (req, note) =>{
    return new Promise ((resolve, reject) => {
        cookies.verify(cookies.get(req)).then(user => {
            let users = db.get().collection('users');
            users.findOne({mailAddress: user.mailAddress}).then(userDB => {
                let formation = userDB.formationsTab.find(f => f.formation.toString() == req.params.id.toString());
                if (formation.note && Number(formation.note) != Number(note)) {
                    let lastNote = formation.note;
                    users.updateOne({
                        'mailAddress': user.mailAddress,
                        'formationsTab.formation': req.params.id
                    }, {
                        $set: {'formationsTab.$.note': Number(note)}
                    }).then(data => {
                        resolve({newVoter: false, lastNote: lastNote});
                    })
                }
                else {
                    users.updateOne({
                        'mailAddress': user.mailAddress,
                        'formationsTab.formation': req.params.id
                    }, {
                        $set: {'formationsTab.$.note': Number(note)}
                    }).then(data => {
                        resolve({newVoter: true});
                    })
                }
            });
        })
    })
}

const getFormationsWithProgress = (userFormationsArray, versions, formations) => {
    let result = [];
    versions.forEach(version => {
        const progressArray = userFormationsArray && userFormationsArray
                .find(f => f.formation === version.formationId.toString());
        let progress = '';
        let id = null;
        if (progressArray) {
            // there is a correlation between the player's progress and a formation
            progress = function() {
                for (let x = i = 0; x < version.levelsTab.length; x++) {
                    const gamesTab = version.levelsTab[x].gamesTab;
                    for (let y = 0; y < gamesTab.length; y++) {
                        const game = gamesTab[y];
                        if (!progressArray.gamesTab[i] || !game.tabQuestions || progressArray.gamesTab[i].questionsAnswered.length < game.tabQuestions.length) {
                            id = progressArray.version;
                            return 'inProgress';
                        }
                        i+= 1;
                    }
                }
                id = progressArray.version;
                return 'done';
            }();
            result.push({_id: id ? new ObjectID(id) : version._id, formationId: version.formationId, label: version.label, status: version.status, progress: progress});
        } else {
            // check status for a published version
            if(version.status === "Published") {
                result.push({_id: id ? new ObjectID(id) : version._id, formationId: version.formationId, label: version.label, status: version.status, progress: progress});
            } else if(version.status && version.status !== "NotPublished") {
                let myFormation = formations.find(formation => formation._id.toString() === version.formationId.toString());
                if(myFormation.versions.length > 1) {
                    version = myFormation.versions[myFormation.versions.length-2];
                    if(version.status !== "NotPublished") result.push({_id: id ? new ObjectID(id) : version._id, formationId: myFormation._id, label: version.label, status: version.status, progress});
                }
            }
        }
    });
    return {myCollection: result};
};

const getPlayerFormationsWithProgress = (userFormationsArray, versions, formations, id) => {
    let result = [];
    versions.forEach(version => {
        const progressArray = userFormationsArray && userFormationsArray
                .find(f => f.formation === version.formationId.toString());
        let progress = '';
        let id = null;
        if (progressArray) {
            // there is a correlation between the player's progress and a formation
            progress = function() {
                for (let x = i = 0; x < version.levelsTab.length; x++) {
                    const gamesTab = version.levelsTab[x].gamesTab;
                    for (let y = 0; y < gamesTab.length; y++) {
                        const game = gamesTab[y];
                        if (!progressArray.gamesTab[i] || !game.tabQuestions || progressArray.gamesTab[i].questionsAnswered < game.tabQuestions.length) {
                            id = progressArray.version;
                            return progressArray;
                        }
                        i+= 1;
                    }
                }
                id = progressArray.version;
                return progressArray;
            }();
            result.push({_id: id ? new ObjectID(id) : version._id, formationId: version.formationId, label: version.label, status: version.status, progress: progressArray});
        } else {
            // check status for a published version
            if(version.status === "Published") {
                result.push({_id: id ? new ObjectID(id) : version._id, formationId: version.formationId, label: version.label, status: version.status, progress: progressArray});
            } else if(version.status && version.status !== "NotPublished") {
                let myFormation = formations.find(formation => formation._id.toString() === version.formationId.toString());
                if(myFormation.versions.length > 1) {
                    version = myFormation.versions[myFormation.versions.length-2];
                    if(version.status !== "NotPublished") result.push({_id: id ? new ObjectID(id) : version._id, formationId: myFormation._id, label: version.label, status: version.status, progress});
                }
            }
        }
    });
    return {myCollection: result};
}



exports.getUserByEmailAddress = getUserByEmailAddress;
exports.inscription = inscription;
exports.getUserById = getUserById;
exports.saveProgress = saveProgress;
exports.getFormationsWithProgress = getFormationsWithProgress;
exports.getPlayerFormationsWithProgress = getPlayerFormationsWithProgress;
exports.saveLastAction = saveLastAction;
exports.noteFormation = noteFormation;