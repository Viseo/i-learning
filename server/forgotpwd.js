/**
 * Created by MLE3657 on 21/03/2017.
 */
const
    TwinBcrypt = require('twin-bcrypt'),
    ObjectID = require('mongodb').ObjectID,
    nodemailer = require('nodemailer');

const
    db = require('./db'),
    defaultTimestamp = 10 * 60 * 1000;

function createUUID(size) {
    var s = [];
    var hexDigits = "0123456789abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < size; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    var uuid = s.join("");
    return uuid;
}

function insertDemandResetPWD(collectionDB, resolve, data) {
    collectionDB.insertOne(data, (err) => {
        if (err) {
            resolve(500);
        } else {
            //todo send email
            //resolve(generateForgotPWD);
            resolve(200);
        }
    })
};

function sendPasswordEmail(generateForgotPWD, timestamp) {
    let minutes = timestamp / (60 * 1000);                  // conversion en minutes
    let smtpConfig = {                                  // configuration boîte mail à ne pas laisser en dur
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: 'ilearningtest@gmail.com',
            pass: 'testmocha'
        }
    };
    let transporter = nodemailer.createTransport(smtpConfig);   // objet qui va pouvoir envoyer le mail
    let message = {
        from: 'ilearningtest@gmail.com',
        to: generateForgotPWD.mailAddress,
        subject: 'Réinitialisation de mot de passe',
        text: 'Bonjour cher collaborateur VISEO, \n' +
        'Voici le lien pour réinitialiser votre mot de passe : il restera valide durant ' + minutes + ' minutes ' +
        '\nhttp://localhost:8080/?ID=' + generateForgotPWD.id
    };
    transporter.sendMail(message, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}


/**
 * Demande a reset le PWD
 * on passe email si email existe on genere une demande (BDD => table mdp)
 *      de reset et on envoit un mail a l utilisateur de sa demande
 *
 * mailAddress : email de l utilisateur
 *
 * return
 * 200 : OK
 * 404 : email non trouver
 * 500 : probleme serveur interne
 */
const resetPWD = (mailAddress) => {
    return new Promise((resolve, reject) => {
        let usersCollection = db.get().collection('users');
        usersCollection.find().toArray((err, docs) => {
            if (err) {
                resolve(404);
            }
            let result = docs.find(user => user.mailAddress === mailAddress);
            if (result) {
                let resetPWDCollection = db.get().collection('mdp');

                let now = new Date();
                let generateForgotPWD = {
                    id: createUUID(36), expire: now.setTime(now.getTime() + defaultTimestamp).toString(),
                    mailAddress: mailAddress
                };
                sendPasswordEmail(generateForgotPWD, defaultTimestamp);
                resetPWDCollection.find().toArray((err, docsReset) => {
                    if (err) {
                        insertDemandResetPWD(resetPWDCollection, resolve, generateForgotPWD);
                    } else {
                        let resultAskResetPWD = docsReset.find(rPWD => rPWD.mailAddress === mailAddress);
                        if (resultAskResetPWD) {
                            resetPWDCollection.updateOne({mailAddress: mailAddress}, generateForgotPWD);
                            resolve(200);
                        } else {
                            insertDemandResetPWD(resetPWDCollection, resolve, generateForgotPWD);
                        }
                    }
                });
            } else {
                resolve(200);
            }
        })
    });
};


/**
 * Check si id pour reset password et son timestamp est bien valide
 *
 * id : id de la demande de reset password
 *
 * return
 * 200 : OK
 * 403 : le lien n est plus valide du au timestamp
 * 404 : id non trouver
 */
const checkResetPWD = (id) => {
    return new Promise((resolve, reject) => {
        let resetPWDCollection = db.get().collection('mdp');
        resetPWDCollection.find().toArray((err, docs) => {
            if (err) {
                resolve(404);
            }
            let result = docs.find(resetPWD => resetPWD.id === id);

            if (result) {
                let now = new Date();
                if (now.getTime() <= result.expire) {
                    resolve(200);
                } else {
                    resolve(403);
                }
            } else {
                resolve(404);
            }
        });
    });
};


/**
 * Verifie id et timestamp si valide avant de mettre a jour le mot de passe et effacer dans la BDD la demande resetPWD
 *
 * newPWD
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
const updatePWD = (newPWD) => {
    return new Promise((resolve, reject) => {
        let resetPWDCollection = db.get().collection('mdp');
        resetPWDCollection.find().toArray((err, docs) => {
            if (err) {
                resolve(404);
            }
            let result = docs.find(resetPWD => resetPWD.id === newPWD.id);
            if (result) {
                let now = new Date();
                if (now.getTime() <= result.expire) {
                    let usersCollection = db.get().collection('users');
                    usersCollection.find().toArray((err, userDocs) => {
                        if (err) {
                            resolve(404);
                        } else {
                            let resultFindUser = userDocs.find(resetPWD => resetPWD.mailAddress === result.mailAddress);
                            if (resultFindUser) {
                                resultFindUser.password = TwinBcrypt.hashSync(newPWD.password);
                                usersCollection.updateOne({mailAddress: result.mailAddress}, resultFindUser);

                                //todo delete
                                resetPWDCollection.removeOne({"id": newPWD.id});
                                resolve(200);
                            } else {
                                resolve(404);
                            }
                        }
                    });
                } else {
                    resolve(403);
                }
            } else {
                resolve(404);
            }
        });
    });
};

exports.resetPWD = resetPWD;
exports.checkResetPWD = checkResetPWD;
exports.updatePWD = updatePWD;
