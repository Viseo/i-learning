/**
 * Created by TBE3610 on 21/04/2017.
 */
module.exports = function (app) {

    const
        cookies = require('../cookies'),
        db = require('../db'),
        users = require('../models/users'),
        pwd = require('../models/forgotpwd');

    app.get('users/mail/:mailAddress', function (req, res) { //getUserByMailAddress/:mailAddress
        users.getUserByEmailAddress(req.params.mailAddress).then((user)=>{
            res.send({user});
        }).catch((err)=> {
            console.error(err);
            res.status(err).send();
        });
    });

    app.post('/users/inscription', function (req, res) { //user/inscription/
        users.getUserByEmailAddress(req.body.mailAddress)
            .then(() => {
                return users.inscription(req.body).then(() => res.sendStatus(200));
            })
            .catch((err)=> {
                console.error(err);
                res.status(err).send();
            });
    });

    app.get('/users/self', function (req, res) { //user/getUser
        const token = cookies.get(req);
        cookies.verify(token)
            .then((user) => {
                res.send(user)
            })
            .catch((err)=> {
                console.error(err);
                res.status(err).send();
            })
    });

    app.post('/users/self/progress', (req, res) => { //user/saveProgress
        cookies.verify(cookies.get(req))
            .then((user) => {
                return users.saveProgress(req.body, user).then(() => {
                    res.status(200).send();
                })
            })
            .catch((err)=> {
                console.error(err);
                res.status(403).send();
            })
    });

    /**
     * Demande a reset le PWD
     * on passe email si email existe on genere une demande (BDD => table mdp)
     *      de reset et on envoit un mail a l utilisateur de sa demande
     *
     * a envoyer en body
     * {
	    "mailAddress":"te@g.g"
       }
     * return
     * 200 : OK
     * 404 : email non trouver
     * 500 : probleme serveur interne
     */
    app.post('/users/password/reset', function (req, res) { //resetPWD
        pwd.resetPWD(req.body.mailAddress)
            .then(() => {
               res.status(200).send();
            })
            .catch((err)=> {
                console.error(err);
                res.status(500).send();
            });
    });

    /**
     * Check si id pour reset password et son timestamp est bien valide
     *
     * id : en parametre, id de la demande de reset password
     *
     * return
     * 200 : OK
     * 403 : le lien n est plus valide du au timestamp
     * 404 : id non trouver
     */
    app.post('/users/password/new', function (req, res) { //newPWD
        pwd.checkResetPWD(req.body.id)
            .then(() => {
                res.status(200).send();
            })
            .catch((err)=> {
                console.error(err);
                res.status(err).send();
            });
    });

    /**
     * Verifie id et timestamp si valide avant de mettre a jour le mot de passe et effacer dans la BDD la demande resetPWD
     *
     * a envoyer en body
     * {
        "id":"cf9d07c60141b8bb986df5b1b44239de3156",
        "mailAddress":"te@g.g",
        "password":"erererfeferferferfre"
       }
     *
     * return
     * 200 : OK
     * 403 : le lien n est plus valide du au timestamp
     * 404 : id non trouver
     */
    app.post('/users/password/update', function (req, res) { //updatePWD
        console.log(req.body)
        pwd.updatePWD(req.body)
            .then(() => {
                res.status(200).send();
            })
            .catch((err)=> {
                console.error(err);
                res.status(err).send();
            });
    });
};