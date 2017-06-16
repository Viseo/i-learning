/**
 * Created by qde3485 on 22/07/16.
 */

/**
 * Functions to manage Formations
 */
const
    ObjectID = require('mongodb').ObjectID,
    users = require('./users');

const
    db = require('../db');

const compareVersions = (version1, version2, checkStatus = false) => {
    let myVersion1 = Object.assign({}, version1),
        myVersion2 = Object.assign({}, version2);
    if (myVersion1._id) {
        delete myVersion1._id;
    }
    if (myVersion2._id) {
        delete myVersion2._id;
    }
    if (checkStatus) {
        if (myVersion1.status) {
            delete myVersion1.status;
        }
        if (myVersion2.status) {
            delete myVersion2.status;
        }
    }
    myVersion1.hasOwnProperty('imageSrc') && delete myVersion1.imageSrc;
    myVersion2.hasOwnProperty('imageSrc') && delete myVersion2.imageSrc;
    return JSON.stringify(myVersion1) === JSON.stringify(myVersion2);
};

const getFormationsByName = (name) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find().toArray((err, docs) => {
            if (err) {
                reject(err);
            }
            let result = docs.find(formation => formation.versions[formation.versions.length - 1].label === name);
            resolve({formation: result});
        })
    });
};

const getFormationById = (id) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations
            .find({"_id": new ObjectID(id)})
            .toArray((err, docs) => {
                if (err) reject(err);
                resolve(docs[0]);
            })
    });
};

const getVersionById = (id) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations
            .find()
            .toArray((err, docs) => {
                if (err) reject(err);
                let version = null;
                docs.forEach(formation => {
                    version = formation.versions.find(version => version._id.toString() === id) || version;
                });
                resolve({formation: version});
            })
    });
};

const insertFormation = (object) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        object._id = new ObjectID();
        object.status = "NotPublished";
        let formation = {
            versions: [object],
        };
        collectionFormations.insertOne(formation, (err, docs) => {
            if (err) {
                reject(err);
            }
            resolve({formation: docs.insertedId, version: object._id});
        })
    });
};

const deactivateFormation = (formation) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations'),
            version = formation.versions[formation.versions.length - 1];
        version.status = "NotPublished";
        version._id = new ObjectID();
        collectionFormations.updateOne({"_id": new ObjectID(formation._id)}, {$push: {versions: version}}, (err) => {
            if (err) {
                reject(err);
            }
            resolve({version: version._id.toString()});
        });
    });
};

const getLastVersions = () => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find().toArray((err, docs) => {
            if (err) reject(err);
            let formations = [];
            docs.forEach(formation => {
                formation.versions[formation.versions.length - 1].formationId = formation._id;
                formations.push(formation.versions[formation.versions.length - 1]);
            });
            resolve({myCollection: formations});
        })
    })
};

const getAllFormations = () => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find().toArray((err, docs) => {
            if (err) {
                reject(err);
            }
            resolve({myCollection: docs});
        })
    })
};

const newVersion = (formation, version) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        if (formation.versions[formation.versions.length - 1].status === "Published") {
            if (JSON.stringify(version) !== JSON.stringify(formation.versions[formation.versions.length - 1])) {
                // new version
                version._id = new ObjectID();
                collectionFormations.updateOne({"_id": new ObjectID(formation._id)}, {$push: {versions: version}}, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(version._id);
                })
            } else {
                resolve(null);
            }
        } else {
            // update last version
            let versionId = formation.versions[formation.versions.length - 1]._id;
            if (formation.versions[formation.versions.length - 1].status === "NotPublished" && version.status === "Edited") version.status = "NotPublished";

            //rename keys, it will only set _fields that are in version object
            //others will remain unchanged
            Object.keys(version).forEach(function (key) {
                version[`versions.$.${key}`] = version[key];
                delete version[key];
            });

            collectionFormations.updateOne({
                    "_id": new ObjectID(formation._id),
                    "versions._id": new ObjectID(versionId)
                },
                {$set: version}, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(version._id);
                }
            );
        }
    })
};
const updateImage = (formation, version1, version2) => {
    return new Promise((resolve, reject) => {
        let formations = db.get().collection('formations');
        formations.updateOne({
            '_id': new ObjectID(formation._id),
            'versions._id': new ObjectID(version1._id)
        }, {
            $set: {'versions.$.imageSrc': version2.imageSrc}
        }).then(data => {
            resolve(data);
        }).catch(data => {
            reject(data);
        })
    })
}

const updateNote = (req, versionId, note) => {
    return users.noteFormation(req, note, versionId).then(userNotation => {
        return getFormationById(req.params.id).then((formation) => {
            let version = formation.versions.find((ver) => ver._id.toString() === versionId.toString());
            if (version) {
                if (userNotation.newVoter) {
                    let newAverage = version.note ? (( Number(version.note) * Number(version.noteCounter) + Number(note)) / (Number(version.noteCounter) + 1)) : Number(note);
                    let newCounter = Number(version.noteCounter) ? (Number(version.noteCounter) + 1) : 1;
                    let formations = db.get().collection('formations');
                    return formations.updateOne({
                        '_id': new ObjectID(req.params.id),
                        'versions._id': new ObjectID(versionId)
                    }, {
                        $set: {'versions.$.note': newAverage, 'versions.$.noteCounter': newCounter}
                    }).then((data) => {
                        return {matchedCount: data.matchedCount, noteAverage: newAverage, noteCounter : newCounter}
                    });
                } else {
                    let newAverage = version.note ? (( Number(version.note) * Number(version.noteCounter) + Number(note) - Number(userNotation.lastNote)) / Number(version.noteCounter)) : Number(note);
                    let formations = db.get().collection('formations');
                    return formations.updateOne({
                        '_id': new ObjectID(req.params.id),
                        'versions._id': new ObjectID(versionId)
                    }, {
                        $set: {'versions.$.note': newAverage}
                    }).then((data) => {
                        return {matchedCount: data.matchedCount, noteAverage: newAverage, noteCounter : (version.noteCounter) ? version.noteCounter : 1}
                    });
                }
            }else {
                throw "version not found";
            }
        })
    })
};

const replaceQuiz = (indexes, game, formation) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        let version = {};
        if (formation.versions[formation.versions.length - 1].status === "Published") {
            if (JSON.stringify(game) !== JSON.stringify(formation.versions[formation.versions.length - 1].levelsTab[indexes.level].gamesTab[indexes.game])) {
                // new version
                version = formation.versions[formation.versions.length - 1];
                version.status = "Edited";
                version._id = new ObjectID();
                version.levelsTab[indexes.level].gamesTab[indexes.game] = game;
                collectionFormations.updateOne({"_id": formation._id}, {$push: {versions: version}}, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(formation.upsertedId);
                })
            } else {
                resolve(null);
            }
        } else {
            // update last version + DMA3622 : saving new quiz
            version = formation.versions[formation.versions.length - 1];
            if (version.levelsTab.length != 0) {
                // version.levelsTab.push({gamesTab: [game]});
                if (indexes.level >= version.levelsTab.length) {
                    version.levelsTab.push({gamesTab: [game]});
                } else if (version.levelsTab[indexes.level].gamesTab) {
                    if (version.levelsTab[indexes.level].gamesTab.length <= indexes.game
                        && version.levelsTab[indexes.level].gamesTab.length != 0) {
                        version.levelsTab[indexes.level].gamesTab.push(game);
                    } else {
                        version.levelsTab[indexes.level].gamesTab[indexes.game] = game;
                    }
                }
            } else {
                version.levelsTab = [{
                    gamesTab: [game]
                }]
            }
            switch (game.type) {
                case "Quiz":
                    version.gamesCounter.quizz++;
                    break;
                case "Doll":
                    version.gamesCounter.doll++;
                    break;
                default:
                    console.error('wrong type of game', game.game.type);
                    break;
            }
            collectionFormations.updateOne({"_id": new ObjectID(formation._id)},
                {$set: {versions: formation.versions}}, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(version._id.toString());
                });
        }
    })
};

const getFormationByVersionId = (versionId) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find()
            .toArray((err, docs) => {
                let object = null;
                if (err) {
                    reject(err)
                }
                docs.forEach(formation => {
                    formation.versions.forEach(version => {
                        if (version._id.toString() === versionId) {
                            object = formation
                        }
                    })
                });
                resolve(object);
            })
    })
};

exports.compareVersions = compareVersions;
exports.getFormationsByName = getFormationsByName;
exports.getFormationById = getFormationById;
exports.getVersionById = getVersionById;
exports.insertFormation = insertFormation;
exports.deactivateFormation = deactivateFormation;
exports.getLastVersions = getLastVersions;
exports.getAllFormations = getAllFormations;
exports.newVersion = newVersion;
exports.replaceQuiz = replaceQuiz;
exports.getFormationByVersionId = getFormationByVersionId;
exports.updateNote = updateNote;
exports.updateImage = updateImage;