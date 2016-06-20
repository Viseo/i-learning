module.exports = function (app, fs) {

    var db = require('../db');
    var TwinBcrypt=require('twin-bcrypt');
    var jwt = require('json-web-token');

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
        collection.insert(obj, function (err, docs) {
            res.send(docs.insertedIds[0]);
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
        collection.find().toArray(function(err, docs) {
            result = docs.find(user => user.mailAddress===req.params.mailAddress);
            res.send({user: result});
        });
    });

    var sendCookie = function (res, user) {
        jwt.encode('VISEO', {user: user}, function (err, token) {
            res.set('Set-cookie', `token=${token}; path=/; max-age=${30*24*60*60}`);
            res.send({
                ack: 'OK',
                lastName: user.lastName,
                firstName: user.firstName
            });
            console.log(`${new Date().toLocaleTimeString('fr-FR')} : User "${user.firstName} ${user.lastName}" connected.`)
        });
    };

    app.post('/auth/connect', function(req, res) {
        var collection = db.get().collection('users');
        collection.find().toArray(function(err, docs) {
            var user = docs.find(user => user.mailAddress === req.body.mailAddress);
            if (user && TwinBcrypt.compareSync(req.body.password, user.password)) {
                if (err) {
                    return console.error(err.name, err.message);
                } else {
                    sendCookie(res, user);
                }
            } else {
                res.send({status: 'error'});
            }
        });
    });

    app.get('/auth/verify', function(req, res) {
        var token = req.headers && req.headers.cookie && req.headers.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        if(token) {
            jwt.decode('VISEO', token, function (err, decode) {
                if (err) {
                    return console.error(err.name, err.message);
                } else {
                    var collection = db.get().collection('users');
                    collection.find().toArray(function (err, docs) {
                        var user = docs.find(user => user.mailAddress === decode.user.mailAddress);
                        if (user) {
                            sendCookie(res, user);
                        } else {
                            res.send({status: 'error'});
                        }
                    });
                }
            });
        } else {
            res.send({status: 'no cookie'});
        }
    });

    app.post('/sendProgress', function(req, res) {
        var collection = db.get().collection('UsersFormations');
        var obj = collection.find().toArray(function (err, docs) {
            var token = req.headers && req.headers.cookie && req.headers.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            jwt.decode('VISEO', token, function (err, decode) {
                var user = '';
                if (!err) {
                    user = decode.user._id;
                }
                var result = docs.find(x => x.formation === req.body.formation && x.user === user);
                var game = {
                    game: req.body.game,
                    tabWrongAnswers: req.body.tabWrongAnswers,
                    index: req.body.indexQuestion
                };
                if (result) {
                    var games = result.tabGame.find(x => x.game === req.body.game);
                    games && game.index > games.index && (result.tabGame[result.tabGame.indexOf(games)] = game);
                    collection.updateOne({
                        formation: req.body.formation,
                        user: user
                    }, {$set: {tabGame: result.tabGame}});
                    res.send({ack: 'ok'});
                } else {
                    var obj = {
                        user: user,
                        formation: req.body.formation,
                        tabGame: [game]
                    };
                    collection.insertOne(obj, function (err, docs) {
                        res.send({ack: 'ok'});
                    });
                }
            });
        })
    });

    app.get('/getFormationByName/:name', function(req, res) {
        var collection = db.get().collection('formations');
        var result;
        collection.find().toArray(function(err, docs) {
            result = docs.find(formation => formation.label===req.params.name);
            res.send({formation: result});
        });
    });

    app.get('/getFormationById/:id', function(req, res) {
        var collection = db.get().collection('formations');
        collection.find({"_id": new ObjectID(req.params.id)}).toArray(function(err, docs) {
            res.send({formation: docs[0]});
            });
    });

    /*    app.get('/getQuizzByLevelIndex/:levelIndex', function(req, res) {
     var collection = db.get().collection('formations');
     var result;
     var obj=collection.find().
     toArray(function(err, docs) {
     result = docs.find(formation => formation.levelsTab[0].gamesTab[0].levelIndex===req.params.levelIndex);
     res.send({formation: result});
     });
     });

     app.get('/getQuizzByGameIndex/:gameIndex', function(req, res) {
     var collection = db.get().collection('formations');
     var result;
     var obj=collection.find().
     toArray(function(err, docs) {
     result = docs.find(formation => formation.levelsTab[0].gamesTab[0].levelIndex===req.params.gameIndex);
     res.send({formation: result});
     });
     });*/

    app.get('/getAllFormationsNames', function(req, res) {
        var collection = db.get().collection('formations');
        var result= [];
        collection.find().toArray(function(err, docs) {
            docs.forEach(function(formation){
                result.push({_id: formation._id, label: formation.label, status: formation.status});
            });
            res.send({myCollection: result});
        });
    });

    app.post('/data', function (req, res) {
        try {
            fs.accessSync("./log/db.json", fs.F_OK);
            // Do something
            //console.log(req.body);
            fs.appendFileSync("./log/db.json", JSON.stringify(req.body)+"\n");
            res.send({ack:'ok'});
        } catch (e) {
            // It isn't accessible
            console.log("Can't access to db.json");
            res.send({ack:'ok'});
        }
    });

    //update par ID
/*     app.put('/update', function(req, res) {
         var collection = db.get().collection('formations');
         if (id = ObjectID("575ecd9034b0a1242c2cb381")){
             var obj = collection.update({'_id': id},req.body, function(err, docs) {
                 res.send(JSON.stringify(obj));

             });
         }
     });*/

    app.post('/replaceFormation/:id', function (req, res) {
        var collection = db.get().collection('formations');
        collection.find({"_id": new ObjectID(req.params.id)}).toArray(function (err, docs) {
            db.get().collection('formations').replaceOne(docs[0], req.body, function (err, docs) {
               res.send({ack:'ok'});
            });
        });
    });

    app.post('/replaceQuizz/:levelIndex/:gameIndex', function (req, res) {
        console.log(req.params.levelIndex);
        console.log(req.params.gameIndex);
        var collection = db.get().collection('formations');
        collection.find({"_id": new ObjectID(req.params.id)}).toArray(function (err, docs) {
            db.get().collection('formations').replaceOne(docs[0], req.body, function (err, docs) {
                // res.send(JSON.stringify(obj));
            });
        });
    });

};

