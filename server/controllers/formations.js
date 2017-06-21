/**
 * Created by TBE3610 on 21/04/2017.
 */
module.exports = function (app) {
    const
        ObjectID = require('mongodb').ObjectID,
        cookies = require('../cookies'),
        formations = require('../models/formations'),
        users = require('../models/users')

    const id = new ObjectID();

    app.post('/formations/insert', function (req, res) { //TODO changer les send de cette fonction
        formations.getFormationsByName(req.body.label)
            .then(data => {
                if (data.formation) {
                    res.send({saved: false, reason: "NameAlreadyUsed"});
                    return;
                } else {
                    return formations.insertFormation(req.body).then((data) => {
                        res.send({saved: true, id: data.formation, idVersion: data.version})
                    })
                }
            }).catch((err) => {
            console.log(err);
            res.send({saved: false});
        })
    });

    app.post('/formations/deactivate', function (req, res) {
        formations.getFormationById(req.body.id)
            .then(data => formations.deactivateFormation(data.formation))
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
    });

    app.post('/formations/quiz', function (req, res) {
        formations.getFormationById(req.body.formationId).then(formation => {
            return formations.replaceQuiz({
                level: req.body.levelIndex,
                game: req.body.gameIndex,
                valid: req.body.valid
            }, req.body.newQuiz, formation)
                .then(data => {
                    req.body.valid && res.send({valid: true});
                    !req.body.valid && res.send({valid: false});
                })
        }).catch(err => {
            console.log(err);
            res.send({ack: 'error'})
        });
    });

    app.post('/formations/userFormationEval/:id', function (req, res) {
        let userNote = req.body.starId.split('')[req.body.starId.length - 1];
        formations.updateNote(req, req.body.versionId, userNote).then(data => {
            if (data.matchedCount === 1) {
                res.status(200).send(data);
            } else {
                console.log('problem while updating note', req.body, data);
                res.status(404).send();
            }
        }).catch(err => {
            console.log(err);
            res.status(403).send();
        });
    });

    app.get('/formations/:id', (req, res) => {
        formations.getVersionById(req.params.id).then((data) => {
            res.send(data)
        }).catch(err => {
            console.error(err);
            res.status(404).send();
        })
    });

    app.get('/formations', (req, res) => {
        cookies.verify(cookies.get(req)).then((user) => {
            if (user.admin) {
                return formations.getLastVersions();
            } else {
                return users.getFormationsWithProgress(user);
            }
        }).then((data) => {
            res.send(data)
        }).catch((err) => {
            console.log(err);
            res.status(500).send();
        })
    });

    app.post('/formations/update', function (req, res) {
        formations.getFormationByVersionId(req.body.id).then(formation => {
            if (formation) {
                return formations.getFormationsByName(req.body.label).then(data => {
                    let version1 = data.formation ? data.formation.versions[data.formation.versions.length - 1] : null;
                    let version2 = req.body;
                    if (req.body.imageOnly && version1) {
                        formations.updateImage(formation, version1, version2);
                        return {saved: true};
                    }
                    if (data.formation) {
                        if (formation._id.toString() === data.formation._id.toString()) {
                            if (formations.compareVersions(version1, version2, req.body.status !== "Published")) {
                                return {saved: false, reason: "NoModif"}
                            } else {
                                return formations.newVersion(formation, req.body).then(data => ({
                                    saved: true,
                                    id: data
                                }));
                            }
                        } else {
                            return {saved: false, reason: "NameAlreadyUsed"};
                        }
                    } else {
                        return formations.newVersion(formation, req.body).then(data => ({saved: true, id: data}));
                    }
                });
            } else {
                return {saved: false, reason: "notFound"};
            }
        }).then(message => {
            res.send(message);
        }).catch(err => {
            console.error(err);
            res.status(403).send();
        })
    });
};

