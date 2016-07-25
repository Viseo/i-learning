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

    app.post('/user/saveProgress', (req, res) => {
        cookies.verify(req, (err, decode) => {
            users.getUserById(db, decode.user._id)
                .then(user => {
                    return users.saveProgress(db, req.body, user);
                })
                .then(data => res.send(data));
        });
    });

    app.get('/user/getUser', function(req, res) {
        cookies.verify(req, (err, decode) => {
            users.getUserById(db, decode.user._id)
                .then(data => res.send(data))
                .catch(err => console.log(err));
        });
    });

    app.post('/formations/insert', function(req, res) {
        formations.insertFormation(db, req.body)
            .then((data) => res.send(data))
            .catch((err) => console.log(err));
    });

    app.get('/formations/getFormationByName/:name', function(req, res) {
        formations.getFormationsByName(db, req.params.name)
            .then((data) => res.send(data))
            .catch((err) => console.log(err));
    });

    app.get('/formations/getFormationById/:id', function(req, res) {
        formations.getFormationById(db, req.params.id)
            .then((data) => res.send(data))
            .catch((err) => console.log(err));
    });

    app.get('/formations/getAllFormationsNames', (req, res) => {
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

    app.post('/formations/replaceFormation/:id', function (req, res) {
        formations.replaceFormation(db, req.params.id, req.body)
            .then(data => res.send(data))
            .catch(err => console.log(err));
    });

    app.post('/formations/replaceQuizz/:id/:levelIndex/:gameIndex', function (req, res) {
        formations.replaceQuiz(db, {level: req.params.levelIndex, game: req.params.gameIndex, id: req.params.id}, req.body)
            .then(data => res.send({ack:'ok'}))
            .catch(err => console.log(err));
    });
};

