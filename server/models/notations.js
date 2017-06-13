/**
 * Created by minhhuyle on 13/06/2017.
 */

const
    db = require('../db'),
    cookies = require('../cookies');


const getNotes = (req)=> {
    return new Promise((resolve, reject) => {
        cookies.verify(cookies.get(req)).then(user => {
            let notation = db.get().collection('notation');
            notation.find({userId: user._id}).toArray((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    })
};

exports.getNotes = getNotes;