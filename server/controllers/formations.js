/**
 * Created by TBE3610 on 21/04/2017.
 */
module.exports = function (app) {
    const
        ObjectID = require('mongodb').ObjectID;
    cookies = require('../cookies'),
        formations = require('../models/formations'),
        users = require('../models/users')

    const id = new ObjectID();

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

    app.post('/formations/deactivate', function (req, res) {
        formations.getFormationById(req.body.id)
            .then(data => formations.deactivateFormation(data.formation))
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
    });

    app.post('/formations/:id/quiz/:levelIndex/:gameIndex', function (req, res) {
        formations.getFormationById(req.body.formationId)
            .then(formation => {
                formations.replaceQuiz({
                    level: req.body.levelIndex,
                    game: req.body.index,
                    id: req.body.id
                }, req.body, formation)
                    .then(data => res.send({saved: true}))    /** TODO DMA code 200 **/
                    .catch(err => {console.log(err);res.send({ack: 'error'})});
            });
    });

    app.post('/formations/userFormationEval/:id', function (req, res) {
        let userNote = req.body.starId.split('')[req.body.starId.length - 1];
        let result = {};
        formations.updateNote(req, req.body.versionId, userNote)
            .then(data => {
                if (data.modifiedCount == 1) {
                    res.send({ack: 'OK'})
                }
            }).catch(err => {
            console.log(err);
        });
    });

    app.get('/formations/:id', (req, res) => {
        formations.getVersionById(req.params.id)
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)
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

    app.post('/formations/:id', function (req, res) {
        formations.getFormationByVersionId(req.params.id)
            .then(formation => {
                if (formation) {
                    formations.getFormationsByName(req.body.label)
                        .then(data => {
                            let version1 = data.formation ? data.formation.versions[data.formation.versions.length - 1] : null;
                            let version2 = req.body;
                            if (req.body.onlyImage && version1) {
                                formations.updateImage(formation, version1, version2);
                                res.send({saved: true});
                                return;
                            }
                            if (data.formation) {
                                if (formation._id.toString() === data.formation._id.toString()) {
                                    if (formations.compareVersions(version1, version2, req.body.status !== "Published")) {
                                        res.send({saved: false, reason: "NoModif"})
                                    } else {
                                        formations.newVersion(formation, req.body)
                                            .then(data => res.send({saved: true, id: data}))
                                            .catch(err => console.log(err));
                                    }
                                } else {
                                    res.send({saved: false, reason: "NameAlreadyUsed"});
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
};

