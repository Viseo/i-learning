module.exports = function (app, fs) {

    const db = require('../db'),
        TwinBcrypt = require('twin-bcrypt'),
        cookies = require('../cookies'),
        formations = require('../formations'),
        users = require('../users');


    try {
        fs.accessSync("./log/db.json", fs.F_OK);
        fs.writeFileSync("./log/db.json", "");
    } catch (e) {
        console.log("Can't access to db.json");
        // It isn't accessible
    }
    var ObjectID = require('mongodb').ObjectID;
    var id = new ObjectID();

    app.get('/auth/verify', (req, res) => {
        const hasCookie = cookies.verify(req, (err, decode) => {
            if (!err) {
                const collection = db.get().collection('users');
                collection.find().toArray((err, docs) => {
                    const user = docs.find(user => user.mailAddress === decode.user.mailAddress);
                    if (user) {
                        cookies.send(user)
                            .then(data => {
                                res.set('Set-cookie', `token=${data}; path=/; max-age=${60*60*24*30}`);
                                res.send({
                                    ack: 'OK',
                                    user: {
                                        lastName: user.lastName,
                                        firstName: user.firstName,
                                        admin: user.admin
                                    }
                                });
                            })
                            .catch(err => console.log(err));
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

    app.post('/auth/connect', (req, res) => {
        const collection = db.get().collection('users');
        collection.find().toArray((err, docs) => {
            if (err) return console.error(err.name, err.message);
            const user = docs.find(user => user.mailAddress === req.body.mailAddress);
            if (user && TwinBcrypt.compareSync(req.body.password, user.password)) {
                cookies.send(user)
                    .then(data => {
                        res.set('Set-cookie', `token=${data}; path=/; max-age=${60*60*24*30}`);
                        res.send({
                            ack: 'OK',
                            user: {
                                lastName: user.lastName,
                                firstName: user.firstName,
                                admin: user.admin
                            }
                        });
                    })
                    .catch(err => console.log(err));
            } else {
                res.send({status: 'error'});
            }
        });
    });

    app.post('/user/inscription/', function(req, res) {
        users.getUserByEmailAddress(db, req.body.mailAddress)
            .then(data => {
                if(data) {
                    res.send(false);
                } else {
                    return users.inscription(db, req.body)
                        .then(() => res.send(true));
                }
            })
            .catch(err => console.log(err));
    });

    app.get('/user/getUser', function(req, res) {
        cookies.verify(req, (err, decode) => {
            users.getUserById(db, decode.user._id)
                .then(data => res.send(data))
                .catch(err => console.log(err));
        });
    });

    app.post('/user/saveProgress', (req, res) => {
        cookies.verify(req, (err, decode) => {
            users.getUserById(db, decode.user._id)
                .then(user => {
                    return users.saveProgress(db, req.body, user);
                })
                .then(data => res.send(data));
        });
    });

    app.post('/formations/insert', function(req, res) {
        formations.getFormationsByName(db, req.body.label)
            .then(data => {
                if (data.formation) {
                    res.send({saved: false, reason: "NameAlreadyUsed"});
                } else {
                    formations.insertFormation(db, req.body)
                        .then((data) => res.send({saved: true, id: data.formation}))
                        .catch((err) => console.log(err));
                }
            })
    });

    app.get('/formations/getFormationByName/:name', function(req, res) {
        formations.getFormationsByName(db, req.params.name)
            .then((data) => res.send(data))
            .catch((err) => console.log(err));
    });

    app.get('/formations/getVersionById/:id', (req, res) => {
        formations.getVersionById(db, req.params.id)
            .then((data) => res.send(data))
            .catch((err) => console.log(err));
    });

    app.get('/formations/getAdminFormations', (req, res) => {
        formations.getLastVersions(db)
            .then(data => res.send(data))
            .catch(err => console.log(err));
    });

    app.get('/formations/getPlayerFormations', (req, res) => {
        cookies.verify(req, (err, decode) => {
            users.getUserById(db, decode.user._id)
                .then(user => {
                    formations.getLastVersions(db)
                        .then(versions => {
                            formations.getAllFormations(db)
                                .then(formations => {
                                    return users.getFormationsWithProgress(user.formationsTab, versions.myCollection, formations.myCollection);
                                })
                                .then(data => res.send(data))
                                .catch(err => console.log(err));
                        })
                });
        });

    });

    app.post('/formations/replaceFormation/:id', function (req, res) {
        formations.getFormationsByName(db, req.body.label)
            .then(data => {
                if(data.formation) {
                    formations.getFormationByVersionId(db, req.params.id)
                        .then(formation => {
                            if(formation) {
                                if(formation._id.toString() === data.formation._id.toString()) {
                                    if(formations.compareFormations(data.formation.versions[data.formation.versions.length-1], req.body)) {
                                        res.send({saved: false, reason: "NoModif"})
                                    } else {
                                        data.formation._id = req.params.id;
                                        formations.replaceFormation(db, formation._id, req.body)
                                            .then(data => res.send({saved: true, reason: ""}))
                                            .catch(err => console.log(err));
                                    }
                                } else {
                                    res.send({saved: false, reason: "NameAlreadyUsed"});
                                }
                            }
                        });
                } else {
                    formations.replaceFormation(db, req.params.id, req.body)
                        .then(data => res.send({saved: true, reason: ""}))
                        .catch(err => console.log(err));
                }
            })
    });

    app.post('/formations/replaceQuizz/:id/:levelIndex/:gameIndex', function (req, res) {
        formations.replaceQuiz(db, {level: req.params.levelIndex, game: req.params.gameIndex, id: req.params.id}, req.body)
            .then(data => res.send({ack:'ok'}))
            .catch(err => console.log(err));
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
            fs.appendFileSync("./log/db.json", JSON.stringify(req.body)+"\n");
            res.send({ack:'ok'});
        } catch (e) {
            // It isn't accessible
            console.log("Can't access to db.json");
            res.send({ack:'ok'});
        }
    });
};

