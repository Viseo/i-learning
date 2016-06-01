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

    app.get('/getFormationByName/:name', function(req, res) {
        var collection = db.get().collection('formations');
        var result;
        var obj=collection.find({name:"Formations"}).
        toArray(function(err, docs) {
            result = docs[0].tab.find(formation => formation.label===req.params.name);
            res.send({formation: result});
        });
    });

    /**app.get('/getFormationByName/:name', function(req, res) {
        var collection = db.get().collection('formations');
        var result;
        var obj = collection.find({name:"Formations", tab.label:req.params.name}).toArray(function(err, docs) {
            for(var i in docs[0].tab) {
                if(docs[0].tab[i].label===req.params.name){
                    result=docs[0].tab[i];
                    i=docs[0].tab.length;
                }
            }
            res.send({formation: result});
        });
    });**/

    app.get('/getAllFormationsNames', function(req, res) {
        var collection = db.get().collection('formations');
        var result= [];
        var obj = collection.find({name:"Formations"}).toArray(function(err, docs) {
            docs[0].tab.forEach(function(formation){
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
};