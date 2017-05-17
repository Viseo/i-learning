/**
 * Created by qde3485 on 25/07/16.
 */

const
    ObjectID = require('mongodb').ObjectID;

const
    db = require('../db'),
    formations = require("./formations"),
    cookies = require('../cookies');

const getUserByEmailAddress = (email) => {
    return db.get().collection('users').findOne({"mailAddress": email}).then((user) => {
        if (!user) throw new Error('user not found');
        return getLastProgress(user).then((lastAction) => {
            user.lastAction = lastAction;
            return user;
        });
    });
};

const inscription = (user) => {
    return db.get().collection('users').insertOne(user).then(()=>user);
};

const getProgresses = (user) => {
    return db.get().collection('progress').find({"userId": user._id}).toArray();
}

const getLastProgress = (user) => {
    return db.get().collection('progress').find({"userId": user._id}).sort({"ts": -1}).limit(1).toArray().then((data) => data[0]);
}

const saveProgress = (body, user) => {
    let progress = {
        formationId: body.formationId,
        versionId: body.versionId,
        gameId: body.gameId
    }
    return db.get().collection('progress').updateOne(
        {
            "userId": new ObjectID(user._id),
            "formationId": new ObjectID(progress.formationId),
            "versionId": new ObjectID(progress.versionId),
            "gameId": progress.gameId
        },
        {
            $set: {
                "answered": body.answered,
                "ts": new Date()
            }
        },
        {upsert: true}
    );
};

const noteFormation = (req, note, versionId) => {
    return new Promise((resolve, reject) => {
        cookies.verify(cookies.get(req)).then(user => {
            let notation = db.get().collection('notation');
            notation.findOne({userId: user._id, formationId: req.params.id, versionId: versionId}).then(data=>{
                if (data){
                    let lastNote = data.note;
                    notation.updateOne({versionId: data.versionId, userId: data.userId}, {$set: {note: note}}).then(data=>{
                        resolve({newVoter:false, lastNote: lastNote});
                    });

                }
                else{
                    notation.insertOne({formationId: req.params.id, versionId: versionId, note: note, userId: user._id}).then(data=>{
                       resolve({newVoter:true})
                    });
                }
            });

            // let users = db.get().collection('users');
            // users.findOne({mailAddress: user.mailAddress}).then(userDB => {
            //     let formation = userDB.formationsTab.find(f => f.formation.toString() == req.params.id.toString());
            //     if (formation.note && Number(formation.note) != Number(note)) {
            //         let lastNote = formation.note;
            //         users.updateOne({
            //             'mailAddress': user.mailAddress,
            //             'formationsTab.formation': req.params.id
            //         }, {
            //             $set: {'formationsTab.$.note': Number(note)}
            //         }).then(data => {
            //             resolve({newVoter: false, lastNote: lastNote});
            //         })
            //     }
            //     else {
            //         users.updateOne({
            //             'mailAddress': user.mailAddress,
            //             'formationsTab.formation': req.params.id
            //         }, {
            //             $set: {'formationsTab.$.note': Number(note)}
            //         }).then(data => {
            //             resolve({newVoter: true});
            //         })
            //     }
            // });
        })
    })
}

const getFormationsWithProgress = (user) => {
    var _getGameById = (levelsTab, id) => {
        let result = null;
        levelsTab.forEach(level => {
            level._gamesTab.forEach(game => {
                if (game.id == id) {
                    result = game;
                }
            });
        });
        return result;
    }

    return getProgresses(user).then((progresses) => {
        return formations.getAllFormations().then(data => {
            let formations = data.myCollection;
            let versions = [];
            formations.forEach((formation) => {
                let versionTopush = formation.versions.reverse().find((version) => version.status === "Published");
                progresses
                    .filter((prog) => prog.formationId.toString() === formation._id.toString())
                    .forEach((progress) => {
                        let version = formation.versions.find((version) => version._id.toString() === progress.versionId.toString());
                        if (version) {
                            let game = _getGameById(version.levelsTab, progress.gameId);
                            if (game) {
                                game.answered = progress.answered;
                                versionTopush = version;
                            }
                        }
                    })
                if(versionTopush){
                    versionTopush.formationId = formation._id;
                    versions.push(versionTopush);
                }
            })
            return {myCollection: versions};
        })
    })
}


exports.getUserByEmailAddress = getUserByEmailAddress;
exports.inscription = inscription;
exports.saveProgress = saveProgress;
exports.noteFormation = noteFormation;
exports.getFormationsWithProgress = getFormationsWithProgress;