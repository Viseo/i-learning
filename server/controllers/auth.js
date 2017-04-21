module.exports = function (app) {
    const
        TwinBcrypt = require('twin-bcrypt');
        cookies = require('../cookies'),
        db = require('../db'),
        users = require('../models/users');

    app.get('/auth/verify', (req, res) => {
        const token = cookies.get(req);
        if (!token) {
            res.send({status: 'error'})
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
                        }
                        else {
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
                    .catch(err => console.log(err));
            } else {
                res.send({status: 'error'});
            }
        });
    })
};

