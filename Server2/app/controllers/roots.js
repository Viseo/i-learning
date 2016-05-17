module.exports = function (app) {

    var db = require('../db');

    app.post('/insert', function(req, res) {
        console.log("/insert");
        var collection = db.get().collection('formations');
        //res.send("làààà");
        var obj = req.body;
        //{text:"object inserted"};
        collection.insert(obj, function(err, docs) {
            res.send("object inserted:\n"+JSON.stringify(obj));
        });
    });

    app.get('/getAllFormations', function(req, res) {
        var collection = db.get().collection('formations');
        var obj = collection.find().toArray(function(err, docs) {
            res.send({myCollection: docs});
        });
        //collection.find().sort({'date': -1}).limit(100).toArray(function(err, docs) {
        //    res.render('comments', {comments: docs})
        //})
    });
};
