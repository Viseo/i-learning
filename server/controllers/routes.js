module.exports = function (app) {

    var db = require('../db');

    app.post('/insert', function(req, res) {
        var collection = db.get().collection('formations');
        var obj = req.body;
        collection.insert(obj, function(err, docs) {
            res.send(JSON.stringify(obj));
        });
    });

    app.get('/getAllFormations', function(req, res) {
        var collection = db.get().collection('formations');
        var obj = collection.find().toArray(function(err, docs) {
            res.send({myCollection: docs});
        });
    });

    app.get('/id', function (req, res) {
        var collection = db.get().collection('exists');
        collection.find().toArray(function (err, docs) {
            res.send({id: docs})
        })
    });
};