module.exports = function (app, fs) {
    const db = require('../db'),
        TwinBcrypt = require('twin-bcrypt'),
        cookies = require('../cookies'),
        formations = require('../formations'),
        users = require('../users'),
        multer = require('multer');

    try {
        fs.accessSync("./log/db.json", fs.F_OK);
        fs.writeFileSync("./log/db.json", "");
    } catch (e) {
        console.log("Can't access to db.json");
        // It isn't accessible
    }
    var ObjectID = require('mongodb').ObjectID;
    var id = new ObjectID();

    app.post('/upload', multer({dest: __dirname+ '/../../resource/'}).single("file"), (req, res) => {

        const insertInDB = function(file) {
            return new Promise((resolve, reject) => {
                if (file.mimetype === 'video/mp4') {
                    db.get().collection('videos').insertOne({
                        src: "../resource/" + file.filename,
                        name: file.originalname
                    }, (err) => {
                        err ? reject() : resolve()
                    })
                } else if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
                    db.get().collection('images').insertOne({
                        imgSrc: "../resource/" + file.filename,
                        name: file.originalname
                    }, (err) => {
                        err ? reject() : resolve()
                    })
                } else { // delete unwanted file
                    fs.unlink(file.path, () => {
                        reject(new Error("Bad file type"))
                    })
                }
            })
        };

        insertInDB(req.file)
            .then(() => {
                console.log(`${new Date().toLocaleTimeString('fr-FR')} : File ${req.file.originalname} inserted in MongoDB.`);
                res.send('ok')
            })
            .catch((err) => {
                console.error(err);
                res.send('err')
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
                        .then(() => res.send({data:true}));
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
                        .then((data) => res.send({saved: true, id: data.formation, idVersion: data.version}))
                        .catch((err) => console.log(err));
                }
            })
    });

    app.post('/formations/deactivateFormation', function (req, res) {
        formations.getFormationById(db, req.body.id)
            .then(data => {
                formations.deactivateFormation(db, data.formation)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => console.log(err));
            });
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
        formations.getFormationByVersionId(db, req.params.id)
            .then(formation => {
                if(formation) {
                    formations.getFormationsByName(db, req.body.label)
                        .then(data => {
                            if (data.formation) {
                                if (formation._id.toString() === data.formation._id.toString()) {
                                    if (formations.compareVersions(data.formation.versions[data.formation.versions.length - 1], req.body, req.body.status !== "Published")) {
                                        res.send({saved: false, reason: "NoModif"})
                                    } else {
                                        formations.newVersion(db, formation, req.body)
                                            .then(data => res.send({saved: true, id: data}))
                                            .catch(err => console.log(err));
                                    }
                                } else {
                                    res.send({saved: false, reason: "NameAlreadformationyUsed"});
                                }
                            } else {
                                formations.newVersion(db, formation, req.body)
                                    .then(data => res.send({saved: true, id: data}))
                                    .catch(err => console.log(err));
                            }
                        });
                }
            });
    });

    app.post('/formations/replaceQuizz/:id/:levelIndex/:gameIndex', function (req, res) {
        formations.getFormationByVersionId(db, req.params.id)
            .then(formation => {
                formations.replaceQuiz(db, {level: req.params.levelIndex, game: req.params.gameIndex, id: req.params.id}, req.body, formation)
                    .then(data => res.send({ack:'ok'}))
                    .catch(err => console.log(err));
            });
    });

    app.post('/getAllImages', function(req, res) {
        var collection = db.get().collection('images');
        collection.find().toArray(function(err, docs) {
            res.send({images: docs});
        });
    });

    app.post('/getAllVideos', function(req, res) {
        db.get().collection('videos').find().toArray(function(err, videos) {
            res.send(videos);
        })
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

