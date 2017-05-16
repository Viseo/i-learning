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
                    game: req.body.gameIndex,
                    id: req.body.id
                }, req.body, formation)
                    .then(data => res.send({ack: 'ok'}))
                    .catch(err => {console.log(err);res.send({ack: 'error'})});
            });
    });

    app.get('/formations/:id/progression', function(req, res){
        let result = {};
        formations.getVersionById(req.params.id)
            .then((data) => {
                result.formation = data.formation;
            })
            .catch(console.error)
        const
            user = cookies.verify(cookies.get(req)),
            lastVersions = formations.getLastVersions(),
            allFormations = formations.getAllFormations();

        Promise.all([user, allFormations, lastVersions])
            .then((values) => {
                const [user, allFormations, versions] = values;
                return users.getPlayerFormationsWithProgress(user.formationsTab, versions.myCollection, allFormations.myCollection, id);
            })
            .then((data) => {
                for(let i in data.myCollection){
                    if (data.myCollection[i]._id == req.params.id){
                        result.progress = data.myCollection[i].progress;
                    }
                }
                res.send(result);
            })
            .catch(console.error)
    });

    app.post('/formations/userFormationEval/:id', function (req, res) {
        let userNote = req.body.starId.split('')[req.body.starId.length - 1];
        let result = {};
        formations.updateNote(req,req.body.versionId, userNote)
            .then(data =>{
                if(data.modifiedCount == 1){
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
        const
            user = cookies.verify(cookies.get(req)),
            allFormations = formations.getAllFormations(),
            lastVersions = formations.getLastVersions();

        Promise.all([user, allFormations, lastVersions])
            .then((values) => {
                const [user, allFormations, versions] = values;
                if(user.admin){
                    return versions;
                }else {
                    return users.getFormationsWithProgress(user.formationsTab, versions.myCollection, allFormations.myCollection);
                }
            })
            .then((data) => {
                res.send(data)
            })
            .catch(console.error)

    });

    app.post('/formations/:id', function (req, res) {
        formations.getFormationByVersionId(req.params.id)
            .then(formation => {
                if (formation) {
                    formations.getFormationsByName(req.body.label)
                        .then(data => {
                            let version1 = data.formation ? data.formation.versions[data.formation.versions.length - 1] : null;
                            let version2 = req.body;
                            if (req.body.onlyImage && version1){
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

