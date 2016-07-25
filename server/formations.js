/**
 * Created by qde3485 on 22/07/16.
 */

/**
 * Functions to manage Formations
 */

let ObjectID = require('mongodb').ObjectID;

const getFormationsByName = (db, name) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.find().toArray((err, docs) => {
            if(err) fail(err);
            let result = docs.find(formation => formation.label === name);
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

const insertFormation = (db, object) => {
    return new Promise((resolve, fail) => {
        let collectionFormations = db.get().collection('formations');
        collectionFormations.insertOne(object, (err, docs) => {
            if(err) fail(err);
            resolve({formation:docs.insertedId[0]});
        })
    });
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
        collectionFormations.replaceOne({"_id": new ObjectID(id)}, object, (err) => {
            if(err) fail(err);
            resolve({ack:'ok'});
        })
    })
};

const replaceQuiz = (db, indexes, object) => {
    return new Promise((resolve, reject) => {
        let collectionFormations = db.get().collection('formations');
        let placeholder = {};
        placeholder["levelsTab." + indexes.level + ".gamesTab." + indexes.game] = object;
        collectionFormations.updateOne({"_id": new ObjectID(indexes.id)}, {$set: placeholder}, (err, docs) => {
            if (err) reject(err);
            resolve(docs.upsertedId);
        })
    })
};

exports.getFormationsByName = getFormationsByName;
exports.getFormationById = getFormationById;
exports.insertFormation = insertFormation;
exports.getAllFormations = getAllFormations;
exports.replaceFormation = replaceFormation;
exports.replaceQuiz = replaceQuiz;