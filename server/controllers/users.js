/**
 * Created by TBE3610 on 21/04/2017.
 */
module.exports = function (app) {

    const
        cookies = require('../cookies'),
        db = require('../db'),
        users = require('../models/users'),
        pwd = require('../models/forgotpwd'),
        notation = require('../models/notations');

    app.get('users/mail/:mailAddress', function (req, res) {
        users.getUserByEmailAddress(req.params.mailAddress).then((user) => {
            res.send({user});
        }).catch((err) => {
            console.error(err);
            res.status(404).send();
        });
    });

    app.post('/users/inscription', function (req, res) {
        db.get().collection('users').findOne({"mailAddress": req.body.mailAddress}).then((user) => {
            if(user){
                res.status(403).send({reason: 'Adresse mail déjà utilisée ! '});
            }else {
                return users.inscription(req.body).then(() => res.status(200).send());
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(404).send();
        });
    });

    app.get('/users/self', function (req, res) {
        const token = cookies.get(req);
        cookies.verify(token)
            .then((user) => {
                res.send(user)
            })
            .catch((err) => {
                console.error(err);
                res.status(404).send();
            })
    });

    app.post('/users/self/progress', (req, res) => { //user/saveProgress
        cookies.verify(cookies.get(req))
            .then((user) => {
                return users.saveProgress(req.body, user).then(() => {
                    res.status(200).send();
                })
            })
            .catch((err) => {
                console.error(err);
                res.status(403).send();
            })
    });

    app.post('/users/password/reset', function (req, res) { //resetPWD
        pwd.resetPWD(req.body.mailAddress)
            .then(() => {
                res.status(200).send();
            })
            .catch((err) => {
                res.status(err).send();
            });
    });

    app.post('/users/password/new', function (req, res) { //newPWD
        pwd.checkResetPWD(req.body.id)
            .then(() => {
                res.status(200).send();
            })
            .catch((err) => {
                res.status(err).send();
            });
    });

    app.post('/users/password/update', function (req, res) { //updatePWD
        pwd.updatePWD(req.body)
            .then(() => {
                res.status(200).send();
            })
            .catch((err) => {
                res.status(err).send();
            });
    });

    app.get('/users/notes', function (req, res) {

        notation.getNotes(req)
            .then((data) => res.send(data))
            .catch((err) => {
                console.error(err);
                res.status(404).send();
            });
    });
};