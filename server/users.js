/**
 * Created by qde3485 on 25/07/16.
 */

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
            resolve(JSON.stringify(user));
        })
    })
};

exports.getUserByEmailAddress = getUserByEmailAddress;
exports.inscription = inscription;