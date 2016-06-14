module.exports = function (app, fs) {

    var db = require('../db');
    var TwinBcrypt=require('twin-bcrypt');
    var jwt = require('json-web-token');

    try {
        fs.accessSync(path, fs.F_OK);
        fs.writeFileSync("./log/db.json", "");
    } catch (e) {
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
        let collection = db.get().collection('users');
        collection.find().toArray(function(err, docs) {
            let result = docs.find(user => user.mailAddress===req.body.mailAddress);
            if(result && TwinBcrypt.compareSync(req.body.password,result.password)){
                if (err) {
                    return console.error(err.name, err.message);
                } else {
                    let token = jwt.encode('VISEO', {user: result}, function (err, token) {
                        res.send({'token': token});
                        /*jwt.decode('VISEO', token, function (err, decode) {
                            if (err) {
                                return console.error(err.name, err.message);
                            } else {
                                console.log(decode);
                            }
                        });*/
                    });
                    console.log(token);
                }
            }else{
                res.send();
            }
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
            fs.accessSync(path, fs.F_OK);
            // Do something
            console.log(req.body);
            fs.appendFileSync("./log/db.json", JSON.stringify(req.body)+"\n");
            res.send({ack:'ok'});
        } catch (e) {
            // It isn't accessible
            res.send({ack:'ok'});
        }
    });

    /*    app.get('/find', function(req, res) {
     var collection = db.get().collection('formations');
     //var obj = collection.update({title: "Angular js 3"},req.body, function(err, docs) {
     var label = collection.find({'label': ("Nouvelle formation")}, function(err, docs) {

     res.send(JSON.stringify(label));
     });
     });

       app.get('/find', function(req, res) {
     var collection = db.get().collection('formations');
     //var obj = collection.update({title: "Angular js 3"},req.body, function(err, docs) {
     var id = collection.find({'_id':  ObjectID("5750362407f2ba580b8df773")}, function(err, docs) {

     res.send(JSON.stringify(id));
     });
     });

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


    /*  app.put('/update/:name', function(req, res) {

     var collection = db.get().collection('formations');
     //var id1 = collection.find({'_id':  ObjectID("5750362407f2ba580b8df773")});

     //if (id = ObjectID("5750362407f2ba580b8df773") ){
     // var label = collection.find({'label': ("Nouvelle formation")});
     //var result;

     // var result= [];

     var obj=collection.find().toArray(function(err, docs) {

     var result= [];
     result = docs.find(formation => formation.label===req.params.name);



     //res.send({formation: result});
     //  docs.forEach(function(formation){
     var obj1 = collection.update({title: result.label}, req.body, function (err, docs) {
     // var obj = collection.update({'_id': id},req.body, function(err, docs) {

     res.send(JSON.stringify(obj1));
     });



     });
     });*/

    /*    app.put('/updateID', function(req, res) {
     var collection = db.get().collection('formations');
     //var id1 = collection.find({'_id':  ObjectID("5750362407f2ba580b8df773")});

     //if (id = ObjectID("5750362407f2ba580b8df773") ){
     if (id = ObjectID(id) ){
     //var obj = collection.update({title: "Angular js 3"},req.body, function(err, docs) {
     var obj = collection.update({'_id': id},req.body, function(err, docs) {

     res.send(JSON.stringify(obj));

     });
     };
     });*/

};