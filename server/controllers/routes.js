module.exports = function (app, fs) {

    var db = require('../db');
    var TwinBcrypt=require('twin-bcrypt');

    try {
        fs.accessSync("./log/db.json", fs.F_OK);
        fs.writeFileSync("./log/db.json", "");
    } catch (e) {
        console.log("Can't access to db.json");
        // It isn't accessible
    }
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

    app.get('/getUserByMailAddress/:mailAddress', function(req, res) {
        var collection = db.get().collection('users');
        var result;
        var obj=collection.find().
        toArray(function(err, docs) {
            result = docs.find(user => user.mailAddress===req.params.mailAddress);
            res.send({user: result});
        });
    });

    app.post('/connectUser', function(req, res) {
        var collection = db.get().collection('users');
        collection.find().toArray(function(err, docs) {
            var result = docs.find(user => user.mailAddress===req.body.mailAddress);
            if(result && TwinBcrypt.compareSync(req.body.password,result.password)){
                res.send({user: result});
            }else{
                res.send();
            }
        });
    });

    app.post('/sendProgress', function(req, res) {
        console.log(req.body);
        // var collection = db.get().collection('users');
        // collection.find().toArray(function(err, docs) {
        //     var result = docs.find(user => user.mailAddress===req.body.mailAddress);
        //     if(result && TwinBcrypt.compareSync(req.body.password,result.password)){
        //         res.send({user: result});
        //     }else{
        //         res.send();
        //     }
        // });
        res.send({ack: 'ok'});
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
        try {
            fs.accessSync("./log/db.json", fs.F_OK);
            // Do something
            console.log(req.body);
            fs.appendFileSync("./log/db.json", JSON.stringify(req.body)+"\n");
            res.send({ack:'ok'});
        } catch (e) {
            // It isn't accessible
            console.log("Can't access to db.json");
            res.send({ack:'ok'});
        }
    });

    //update par ID
    app.put('/update', function(req, res) {
        var collection = db.get().collection('formations');
        if (id = ObjectID("575ecd9034b0a1242c2cb381")){
            var obj = collection.update({'_id': id},req.body, function(err, docs) {
                res.send(JSON.stringify(obj));

            });
        }
    });




};