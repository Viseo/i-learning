module.exports = function (app) {
    const
        TwinBcrypt = require('twin-bcrypt'),
        cookies = require('../cookies'),
        db = require('../db'),
        users = require('../models/users');

    app.get('/auth/verify', (req, res) => {
        const token = cookies.get(req);
        if (!token) {
            res.send({status: 'error'})
            return;
        }
        cookies.verify(token).then(user => {
            if (req.session.oneTime) {
                res.send({status: 'oneTimeOnly'});
            } else {
                res.set('Set-cookie', `token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`);
                res.send({
                    ack: 'OK',
                    user: {
                        lastName: user.lastName,
                        firstName: user.firstName,
                        admin: user.admin,
                        lastAction: user.lastAction
                    }
                });
            }
        }).catch((err) => {
            console.log(err);
            res.send({status: 'error'});
        });
    });

    app.post('/auth/connect', (req, res) => {
        users.getUserByEmailAddress(req.body.mailAddress).then((user) => {
            if (TwinBcrypt.compareSync(req.body.password, user.password)) {
                return cookies.generate(user).then(data => {
                    if (req.body.cookie) {
                        req.session.oneTime = false;
                        res.set('Set-cookie', `token=${data}; path=/; max-age=${60 * 60 * 24 * 30}`);
                        res.send({
                            ack: 'OK',
                            user: {
                                lastName: user.lastName,
                                firstName: user.firstName,
                                admin: user.admin,
                                lastAction: user.lastAction
                            }
                        });
                    } else {
                        req.session.oneTime = true;
                        res.set('Set-cookie', `token=${data}; path=/; max-age=${60 * 60 * 24 * 30};`);
                        res.send({
                            ack: 'OK',
                            user: {
                                lastName: user.lastName,
                                firstName: user.firstName,
                                admin: user.admin,
                                lastAction: user.lastAction
                            }
                        });
                    }
                })
            } else {
                res.send({status: 'error'});
            }
        }).catch((err) => {
            console.log(err);
            res.send({status: 'error'});
        })
    })
};

