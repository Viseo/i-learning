/**
 * Created by qde3485 on 22/07/16.
 */

/**
 * Functions to manage Formations
 */

let ObjectID = require('mongodb').ObjectID;

const compareFormations = (form1, form2) => {
    if(form1._id) delete form1._id;
    if(form2._id) delete form2._id;
    return JSON.stringify(form1) === JSON.stringify(form2);
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

const replaceFormation = (db, id, object) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        object._id = new ObjectID();
        collectionFormations.updateOne({"_id": new ObjectID(id)}, {$push: {versions:object}}, (err) => {
            if(err) fail(err);
            resolve({ack:'ok'});
        })
    })
};

const replaceQuiz = (db, indexes, object, formation) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        let version = {};
        if(formation.versions[formation.versions.length-1].status === "Published") {
            if(JSON.stringify(object) !== JSON.stringify(formation.versions[formation.versions.length-1].levelsTab[indexes.level].gamesTab[indexes.game])) {
                // new version
                version = formation.versions[formation.versions.length-1];
                version.status = "Edited";
                version._id = new ObjectID();
                version.levelsTab[indexes.level].gamesTab[indexes.game] = object;
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
            version.levelsTab[indexes.level].gamesTab[indexes.game] = object;
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

exports.compareFormations = compareFormations;
exports.getFormationsByName = getFormationsByName;
exports.getFormationById = getFormationById;
exports.getVersionById = getVersionById;
exports.insertFormation = insertFormation;
exports.getLastVersions = getLastVersions;
exports.getAllFormations = getAllFormations;
exports.replaceFormation = replaceFormation;
exports.replaceQuiz = replaceQuiz;
exports.getFormationByVersionId = getFormationByVersionId;