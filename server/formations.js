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

exports.getFormationsByName = getFormationsByName;
exports.getFormationById = getFormationById;