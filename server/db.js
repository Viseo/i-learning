/**
 * Created by ABL3483 on 13/05/2016.
 */


var MongoClient = require('mongodb').MongoClient;

var state = {
    db: null
};

exports.connect = function(url, done) {
    if (state.db) return done();

    MongoClient.connect(url, function(err, db) {

        if (err){
            return done(err);
        } else {
            console.log("Successfully connected");
        }
        state.db = db;
        state.db.collection('formations').insert({connect:"CONNECTED"}, function(){
            console.log("Database populated");
        });
        done();
    });
};

exports.get = function() {
    return state.db;
};

exports.close = function(done) {
    if (state.db) {
        state.db.close(function(err, result) {
            state.db = null;
            state.mode = null;
            done(err);
        });
    }
};