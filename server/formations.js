/**
 * Created by qde3485 on 22/07/16.
 */

/**
 * Functions to manage Formations
 */

let ObjectID = require('mongodb').ObjectID;

const compareVersions = (version1, version2, checkStatus = false) => {
    let myVersion1 = Object.assign({}, version1);
    let myVersion2 = Object.assign({}, version2);
    if(myVersion1._id) delete myVersion1._id;
    if(myVersion2._id) delete myVersion2._id;
    if(checkStatus) {
        if(myVersion1.status) delete myVersion1.status;
        if(myVersion2.status) delete myVersion2.status;
    }
    return JSON.stringify(myVersion1) === JSON.stringify(myVersion2);
};

const getFormationsByName = (db, name) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find().toArray((err, docs) => {
            if(err) fail(err);
            let result = docs.find(formation => formation.versions[formation.versions.length-1].label === name);
            resolve({formation: result});
        })
    });
};

const getFormationById = (db, id) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations
            .find({"_id": new ObjectID(id)})
            .toArray((err, docs) => {
                if(err) fail(err);
                resolve({formation: docs[0]});
            })
    });
};

const getVersionById = (db, id) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations
            .find()
            .toArray((err, docs) => {
                if(err) fail(err);
                let version = null;
                docs.forEach(formation => {
                    version = formation.versions.find(version => version._id.toString() === id) || version;
                });
                resolve({formation: version});
            })
    });
};

const insertFormation = (db, object) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        object._id = new ObjectID();
        object.status = "NotPublished";
        let formation = {
            versions: [object],
        };
        collectionFormations.insertOne(formation, (err, docs) => {
            if(err) fail(err);
            resolve({formation:docs.insertedId, version: object._id});
        })
    });
};

const deactivateFormation = (db, formation) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        let version = formation.versions[formation.versions.length-1];
        version.status = "NotPublished";
        version._id = new ObjectID();
        collectionFormations.updateOne({"_id": new ObjectID(formation._id)}, {$push: {versions:version}}, (err, docs) => {
            resolve(docs.upsertedId);
        });
    });
};

const getLastVersions = (db) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find().toArray((err, docs) => {
            if(err) fail(err);
            let formations = [];
            docs.forEach(formation => {
                formation.versions[formation.versions.length-1].formationId = formation._id;
                formations.push(formation.versions[formation.versions.length-1]);
            });
            resolve({myCollection:formations});
        })
    })
};

const getAllFormations = (db) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find().toArray((err, docs) => {
            if(err) fail(err);
            resolve({myCollection:docs});
        })
    })
};

const newVersion = (db, formation, version) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');

        if(formation.versions[formation.versions.length-1].status === "Published") {
            if(JSON.stringify(version) !== JSON.stringify(formation.versions[formation.versions.length-1])) {
                // new version
                version._id = new ObjectID();
                collectionFormations.updateOne({"_id": new ObjectID(formation._id)}, {$push: {versions:version}}, (err) => {
                    if (err) reject(err);
                    resolve(version._id);
                })
            } else {
                resolve(null);
            }
        } else {
            // update last version
            version._id = formation.versions[formation.versions.length - 1]._id;
            if(formation.versions[formation.versions.length - 1].status === "NotPublished" && version.status === "Edited") version.status = "NotPublished";
            formation.versions[formation.versions.length - 1] = version;
            collectionFormations.updateOne({"_id": new ObjectID(formation._id)},
                {$set: {versions:formation.versions}}, (err, docs) => {
                    if (err) reject(err);
                    resolve(version._id);
                });
        }
    })
};

const replaceQuiz = (db, indexes, game, formation) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        let version = {};
        if(formation.versions[formation.versions.length-1].status === "Published") {
            if(JSON.stringify(game) !== JSON.stringify(formation.versions[formation.versions.length-1].levelsTab[indexes.level].gamesTab[indexes.game])) {
                // new version
                version = formation.versions[formation.versions.length-1];
                version.status = "Edited";
                version._id = new ObjectID();
                version.levelsTab[indexes.level].gamesTab[indexes.game] = game;
                collectionFormations.updateOne({"_id": new ObjectID(id)}, {$push: {versions:version}}, (err) => {
                    if (err) reject(err);
                    resolve(docs.upsertedId);
                })
            } else {
                resolve(null);
            }
        } else {
            // update last version
            version = formation.versions[formation.versions.length - 1];
            version.levelsTab[indexes.level].gamesTab[indexes.game] = game;
            collectionFormations.updateOne({"_id": new ObjectID(formation._id)},
                {$set: {versions:formation.versions}}, (err, docs) => {
                    if (err) reject(err);
                    resolve(docs.upsertedId);
            });
        }
    })
};

const getFormationByVersionId = (db, versionId) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find()
            .toArray((err, docs) => {
                let object = null;
                if(err) reject(err);
                docs.forEach(formation => {
                    formation.versions.forEach(version => {
                        if(version._id.toString() === versionId){
                            object = formation;
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