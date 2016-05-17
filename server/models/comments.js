/**
 * Created by ABL3483 on 13/05/2016.
 */
var db = require('../db');

exports.all = function(cb) {
    var collection = db.get().collection('comments');

    collection.find().toArray(function(err, docs) {
        cb(err, docs)
    })
};

exports.recent = function(cb) {
    var collection = db.get().collection('comments');

    collection.find().sort({'date': -1}).limit(100).toArray(function(err, docs) {
        cb(err, docs)
    })
};