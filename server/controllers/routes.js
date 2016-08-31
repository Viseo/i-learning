module.exports = function (app, fs) {
    const
        TwinBcrypt = require('twin-bcrypt'),
        ObjectID = require('mongodb').ObjectID,
        multer = require('multer'),
        mmm = require('mmmagic');

    const
        cookies = require('../cookies'),
        formations = require('../formations'),
        db = require('../db'),
        users = require('../users');

    try {
        fs.accessSync("./log/db.json", fs.F_OK);
        fs.writeFileSync("./log/db.json", "");
    } catch (e) {
        console.log("Can't access to db.json");
        // It isn't accessible
    }

    const id = new ObjectID();

    const upload = multer({dest: __dirname + '/../../resource/'}).single('file');

    app.post('/upload', (req, res) => {

        const insertInDB = function (file) {
            return new Promise((resolve, reject) => {
                const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
                magic.detectFile(file.path, function (err, result) {
                    if (result === 'video/mp4') {
                        db.get().collection('videos').insertOne({
                            src: "../resource/" + file.filename,
                            name: file.originalname
                        }, (err) => {
                            if (err) {
                                reject(err)
                            }
                            resolve({src: "../resource/" + file.filename, name: file.originalname})
                        })
                    } else if (['image/png', 'image/jpeg'].includes(result)) {
                        db.get().collection('images').insertOne({
                            imgSrc: "../resource/" + file.filename,
                            name: file.originalname
                        }, (err) => {
                            if (err) {
                                reject(err)
                            }
                            resolve()
                        })
                    } else { // delete unwanted file
                        fs.unlink(file.path, () => {
                            reject(new Error(`Bad file type ${result}, deleted.`))
                        })
                    }
                });
            })
        };

        upload(req, res, (err) => {
            console.log(err);
            insertInDB(req.file)
                .then(() => {
                    console.log(`${new Date().toLocaleTimeString('fr-FR')} : File ${req.file.originalname} inserted in MongoDB.`);
                    res.send('ok')
                })
                .catch((err) => {
                    console.error(err.message);
                    res.send('err')
                });
        })
    });

    app.post('/deleteImage', function (req, res) {
        var collection = db.get().collection('images');
        collection.deleteOne({"_id": new ObjectID(req.body._id)});
        fs.unlink('./resource/' + req.body.imgSrc.split('/')[2], (error) => {
            console.error(error);
            res.send({ack: "ok"});
        });
    });

    app.post('/deleteVideo', function (req, res) {
        var collection = db.get().collection('videos');
        collection.deleteOne({"_id": new ObjectID(req.body._id)});
        fs.unlink('./resource/' + req.body.src.split('/')[2], () => {
            res.send({ack: "ok"});
        });
    });

    app.get('/getUserByMailAddress/:mailAddress', function (req, res) {
        var collection = db.get().collection('users');
        var result;
        collection.find().toArray(function (err, docs) {
            result = docs.find(user => user.mailAddress === req.params.mailAddress);
            res.send({user: result});
        });
    });

    app.get('/auth/verify', (req, res) => {
        const token = cookies.get(req);
        if (!token) {
            res.send({status: 'error'})
        }
        cookies.verify(token).then(user => {
            res.set('Set-cookie', `token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`);
            res.send({
                ack: 'OK',
                user: {
                    lastName: user.lastName,
                    firstName: user.firstName,
                    admin: user.admin
                }
            });
        })
            .catch(() => {
                res.send({status: 'error'});
            });
    });

    app.post('/auth/connect', (req, res) => {
        const collection = db.get().collection('users');
        collection.find().toArray((err, docs) => {
            if (err) {
                return console.error(err.name, err.message);
            }
            const user = docs.find(user => user.mailAddress === req.body.mailAddress);
            if (user && TwinBcrypt.compareSync(req.body.password, user.password)) {
                cookies.generate(user)
                    .then(data => {
                        res.set('Set-cookie', `token=${data}; path=/; max-age=${60 * 60 * 24 * 30}`);
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

    app.post('/user/inscription/', function (req, res) {
        users.getUserByEmailAddress(req.body.mailAddress)
            .then(data => {
                if (data) {
                    res.send(false);
                } else {
                    return users.inscription(req.body)
                        .then(() => res.send(true));
                }
            })
            .catch(err => console.log(err));
    });

    app.get('/user/getUser', function (req, res) {
        const token = cookies.get(req);
        cookies.verify(token)
            .then((user) => {
                res.send(user)
            })
            .catch(console.error)
    });

    app.post('/user/saveProgress', (req, res) => {
        cookies.verify(cookies.get(req))
            .then((user) => {
                return users.saveProgress(req.body, user);
            })
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
    });

    app.post('/formations/insert', function (req, res) {
        formations.getFormationsByName(req.body.label)
            .then(data => {
                if (data.formation) {
                    res.send({saved: false, reason: "NameAlreadyUsed"});
                } else {
                    formations.insertFormation(req.body)
                        .then((data) => res.send({saved: true, id: data.formation, idVersion: data.version}))
                        .catch(console.error)
                }
            })
    });

    app.post('/formations/deactivateFormation', function (req, res) {
        formations.getFormationById(req.body.id)
            .then(data => formations.deactivateFormation(data.formation))
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
    });

    app.get('/formations/getFormationByName/:name', function (req, res) {
        formations.getFormationsByName(req.params.name)
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
    });

    app.get('/formations/getVersionById/:id', (req, res) => {
        formations.getVersionById(req.params.id)
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
    });

    app.get('/formations/getAdminFormations', (req, res) => {
        formations.getLastVersions()
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
    });

    app.get('/formations/getPlayerFormations', (req, res) => {
        const
            user = cookies.verify(cookies.get(req)),
            lastVersions = formations.getLastVersions(),
            allFormations = formations.getAllFormations();

        Promise.all([user, allFormations, lastVersions])
            .then((values) => {
                const [user, allFormations, versions] = values;
                return users.getFormationsWithProgress(user.formationsTab, versions.myCollection, allFormations.myCollection);
            })
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)

    });

    app.post('/formations/replaceFormation/:id', function (req, res) {
        formations.getFormationByVersionId(req.params.id)
            .then(formation => {
                if (formation) {
                    formations.getFormationsByName(req.body.label)
                        .then(data => {
                            if (data.formation) {
                                if (formation._id.toString() === data.formation._id.toString()) {
                                    if (formations.compareVersions(data.formation.versions[data.formation.versions.length - 1], req.body, req.body.status !== "Published")) {
                                        res.send({saved: false, reason: "NoModif"})
                                    } else {
                                        formations.newVersion(formation, req.body)
                                            .then(data => res.send({saved: true, id: data}))
                                            .catch(err => console.log(err));
                                    }
                                } else {
                                    res.send({saved: false, reason: "NameAlreadformationyUsed"});
                                }
                            } else {
                                formations.newVersion(formation, req.body)
                                    .then(data => res.send({saved: true, id: data}))
                                    .catch(err => console.log(err));
                            }
                        });
                }
            });
    });

    app.post('/formations/replaceQuizz/:id/:levelIndex/:gameIndex', function (req, res) {
        formations.getFormationByVersionId(req.params.id)
            .then(formation => {
                formations.replaceQuiz({
                    level: req.params.levelIndex,
                    game: req.params.gameIndex,
                    id: req.params.id
                }, req.body, formation)
                    .then(data => res.send({ack: 'ok'}))
                    .catch(err => console.log(err));
            });
    });

    app.post('/getAllImages', function (req, res) {
        var collection = db.get().collection('images');
        collection.find().toArray(function (err, docs) {
            res.send({images: docs});
        });
    });

    app.post('/getAllVideos', function (req, res) {
        db.get().collection('videos').find().toArray(function (err, videos) {
            res.send(videos);
        })
    });

    app.post('/data', function (req, res) {
        try {
            fs.accessSync("./log/db.json", fs.F_OK);
            // Do something
            fs.appendFileSync("./log/db.json", JSON.stringify(req.body) + "\n");
            res.send({ack: 'ok'});
        } catch (e) {
            // It isn't accessible
            console.log("Can't access to db.json");
            res.send({ack: 'ok'});
        }
    });
};

