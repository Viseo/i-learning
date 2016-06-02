module.exports = function (app, fs) {

    var db = require('../db');

    fs.writeFileSync("./log/db.json", "");
    var ObjectID = require('mongodb').ObjectID;
    var id = new ObjectID();
    app.post('/insert', function(req, res) {
        var collection = db.get().collection('formations');
        var obj = req.body;
        collection.insert(obj, function(err, docs) {
            res.send(JSON.stringify(obj));
        });
    });

    app.post('/inscription', function(req, res) {
        var collection = db.get().collection('users');
        var obj = req.body;
        collection.insert(obj, function(err, docs) {
            res.send(JSON.stringify(obj));
        });
    });

/*    app.get('/find', function(req, res) {
        var collection = db.get().collection('formations');
        //var obj = collection.update({title: "Angular js 3"},req.body, function(err, docs) {
        var id = collection.find({'_id':  ObjectID("5750362407f2ba580b8df773")}, function(err, docs) {

            res.send(JSON.stringify(id));
        });
    });*/

    app.put('/update', function(req, res) {
        var collection = db.get().collection('formations');
        //var id1 = collection.find({'_id':  ObjectID("5750362407f2ba580b8df773")});

        //if (id = ObjectID("5750362407f2ba580b8df773") ){
        if (id = ObjectID(id) ){
          //var obj = collection.update({title: "Angular js 3"},req.body, function(err, docs) {
        var obj = collection.update({'_id': id},req.body, function(err, docs) {

            res.send(JSON.stringify(obj));

        });
        };
    });

    app.get('/getAllFormations', function(req, res) {
        var collection = db.get().collection('formations');
        var obj = collection.find().toArray(function(err, docs) {
            res.send({myCollection: docs});
        });
    });

    app.get('/getFormationByName/:name', function(req, res) {
        var collection = db.get().collection('formations');
        var result;
        var obj=collection.find().
        toArray(function(err, docs) {
            result = docs.find(formation => formation.label===req.params.name);
            res.send({formation: result});
        });
    });

    app.get('/getAllFormationsNames', function(req, res) {
        var collection = db.get().collection('formations');
        var result= [];
        var obj = collection.find().toArray(function(err, docs) {
            docs.forEach(function(formation){
                result.push({label: formation.label, status: formation.status});
            });
            res.send({myCollection: result});
        });
    });

    app.get('/id', function (req, res) {
        var collection = db.get().collection('exists');
        collection.find().toArray(function (err, docs) {
            res.send({id: docs})
        })
    });

    app.post('/data', function (req, res) {
        console.log(req.body);
        fs.appendFileSync("./log/db.json", JSON.stringify(req.body)+"\n");
        res.send({ack:'ok'});
    });
};