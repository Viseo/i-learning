module.exports = function (app, fs) {

    const db = require('../db'),
        TwinBcrypt = require('twin-bcrypt'),
        cookies = require('../cookies');

    try {
        fs.accessSync("./log/db.json", fs.F_OK);
        fs.writeFileSync("./log/db.json", "");
    } catch (e) {
        console.log("Can't access to db.json");
        // It isn't accessible
    }
    var ObjectID = require('mongodb').ObjectID;
    var id = new ObjectID();

    app.post('/inscription', function(req, res) {
        var collection = db.get().collection('users');
        var obj = req.body;
        collection.insert(obj, () => {
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

    app.post('/auth/connect', (req, res) => {
        const collection = db.get().collection('users');
        collection.find().toArray((err, docs) => {
            const user = docs.find(user => user.mailAddress === req.body.mailAddress);
            if (user && TwinBcrypt.compareSync(req.body.password, user.password)) {
                if (err) {
                    return console.error(err.name, err.message);
                } else {
                    cookies.send(res, user);
                }
            } else {
                res.send({status: 'error'});
            }
        });
    });

    app.get('/auth/verify', (req, res) => {
        const hasCookie = cookies.verify(req, (err, decode) => {
            if (!err) {
                const collection = db.get().collection('users');
                collection.find().toArray((err, docs) => {
                    const user = docs.find(user => user.mailAddress === decode.user.mailAddress);
                    if (user) {
                        cookies.send(res, user);
                    } else {
                        res.send({status: 'error'});
                    }
                });
            }
        });
        if (!hasCookie) {
            res.send({status: 'no cookie'});
        }
    });

    app.post('/sendProgress', (req, res) => {
        var collection = db.get().collection('users');
        collection.find().toArray(function (err, docs) {
            cookies.verify(req, (err, decode) => {
                var user = '';
                if (!err) {
                    user = decode.user._id;
                }
                var result = docs.find(x=> x._id.toString() === user);
                var newGame = {
                    game: req.body.game,
                    tabWrongAnswers: req.body.tabWrongAnswers,
                    index: req.body.indexQuestion,
                };
                var newFormation = {
                    formation: req.body.formation,
                    gamesTab : [newGame]
                };
                var formationsTab;
                if (result.formationsTab) {
                    var formation = result.formationsTab.findIndex(x => x.formation === req.body.formation);
                    if(formation !== -1 ){
                        var game = result.formationsTab[formation].gamesTab.findIndex(x => x.game === req.body.game);
                        if(game !== -1 ){
                            newGame.index > result.formationsTab[formation].gamesTab[game].index && (result.formationsTab[formation].gamesTab[game] = newGame);
                        }
                        else{
                            result.formationsTab[formation].gamesTab[result.formationsTab[formation].gamesTab.length] = newGame;
                        }
                    }
                    else {
                        result.formationsTab[result.formationsTab.length]=newFormation;
                    }
                    formationsTab = result.formationsTab;
                } else {
                    formationsTab = [newFormation];
                }
                collection.updateOne({"_id": new ObjectID(user)}, {$set: {formationsTab: formationsTab}}, () => {
                    res.send({ack:'ok'});
                });
            });
        });
    });

    app.get('/getUser', function(req, res) {
        const collection = db.get().collection('users');

        collection.find().toArray(function (err, docs) {
            cookies.verify(req, (err, decode) => {
                const user = !err && decode.user._id,
                    result = docs.find(x=> x._id.toString() === user);

                res.send(result);
            ;})
        });
    });


    app.post('/insert', function(req, res) {
        var collection = db.get().collection('formations');
        var obj = req.body;
        collection.insert(obj, function (err, docs) {
            res.send(docs.insertedIds[0]);
        });
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

    app.get('/getAllFormationsNames', (req, res) => {
        const usersCollection = db.get().collection('users');
        usersCollection.find().toArray(function (err, docs) {
            cookies.verify(req, (err, decode) => {
                var user = '';
                if (!err) {
                    user = decode.user._id;
                }
                user = docs.find(x=> x._id.toString() === user);
        const collection = db.get().collection('formations'),
            result = [];

        collection.find().toArray((err, docs) => {
                const formationsTab = user && user.formationsTab;

                docs.forEach(formation => {
                    const progressTab = formationsTab && formationsTab.find(f => f.formation === formation._id.toString());
                    let progress = '';

                    if (progressTab) {
                        progress = function () {
                            let i = 0;
                            // not a forEach, because return.
                            for (let x = 0; x < formation.levelsTab.length; x++) {
                                const gamesTab = formation.levelsTab[x].gamesTab;
                                for (let y = 0; y < gamesTab.length; y++) {
                                    const game = gamesTab[y];
                                    if (!progressTab.gamesTab[i] || !game.tabQuestions || progressTab.gamesTab[i].index < game.tabQuestions.length) {
                                        return 'inProgress';
                                    }
                                    i++;
                                }
                            }
                            return 'done';
                        }();
                    }
                    result.push({_id: formation._id, label: formation.label, status: formation.status, progress});
                });

                res.send({myCollection: result});
                });
            });
        });
    });

    app.get('/getAllImages', function(req, res) {
        var collection = db.get().collection('images');
        collection.find().toArray(function(err, docs) {
            res.send({images: docs});
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

    app.post('/replaceFormation/:id', function (req, res) {
        var collection = db.get().collection('formations');
        collection.find({"_id": new ObjectID(req.params.id)}).toArray(function (err, docs) {
            collection.replaceOne(docs[0], req.body, () => {
               res.send({ack:'ok'});
            });
        });
    });

    app.post('/replaceQuizz/:id/:levelIndex/:gameIndex', function (req, res) {
        var collection = db.get().collection('formations');
        var placeholder = {};
        placeholder["levelsTab." + req.params.levelIndex + ".gamesTab."+req.params.gameIndex] = req.body;
        console.log(placeholder);
        collection.update({"_id": new ObjectID(req.params.id)}, {$set:placeholder},function (err, docs) {
                console.log(docs);
                res.send({ack:'ok'});
            });
        });


};

